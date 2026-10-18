/**
 * Purpose: Coordinate learner actions, adaptive pages, marking and practice sets through
 * injected dependencies.
 *
 * Main contents:
 * - createSession
 *
 * Used By: tests/anonymous.test.mjs, tests/arithmetic.test.mjs,
 * tests/error-investigation.test.mjs, tests/practice-set.test.mjs,
 * tests/problem-solving.test.mjs, tests/progress.test.mjs, tests/reattempts.test.mjs.
 *
 * Uses: website/src/lib/domain/assessment.mjs, website/src/lib/domain/reattempts.mjs,
 * website/src/lib/domain/stages.mjs, website/src/lib/domain/topic-pages.mjs,
 * website/src/lib/adapters/working-cache.mjs, website/src/lib/domain/progress.mjs,
 * website/src/lib/domain/revision.mjs, website/src/lib/domain/engine.mjs,
 * website/src/lib/domain/anonymous.mjs, website/src/lib/domain/errors.mjs,
 * website/src/lib/domain/practice-code.mjs.
 *
 * Libs: none.
 */
import { latestAssessment, assessmentStatus } from '../domain/assessment.mjs';
import { earlyReattempt, latestResponse, countsForProgress } from '../domain/reattempts.mjs';

import { topicStages } from '../domain/stages.mjs';
import {
  findQuestion,
  discardRetiredAttempts,
  topicPages,
  TOPIC_PAGE_SIZES,
  assessmentPage,
} from '../domain/topic-pages.mjs';
import { createWorkingCache } from '../adapters/working-cache.mjs';
import { backupStatus } from '../domain/progress.mjs';
import { completeRecommendation } from '../domain/revision.mjs';
import {
  scoringWindow,
  newTrack,
  newPage,
  submit,
  manualLevel,
  resolveChoice,
  markAnswer,
} from '../domain/engine.mjs';
import { beginAnonymous, nameAnonymous } from '../domain/anonymous.mjs';
import { markErrors } from '../domain/errors.mjs';
import {
  decodePracticeSet,
  encodePracticeSet,
  resolvePracticePage,
  setSecondsRemaining,
  TIMINGS,
  PAGE_TYPES,
} from '../domain/practice-code.mjs';

/**
 * A portable session: inputs and persistence are injected; no DOM or Svelte dependencies.
 * Immutable view snapshots let rendering observe changes without owning stored state.
 * Create the practice action API from banks, learner data, persistence and injected clock/randomness.
 * Parameter bank: active question bank.
 * Parameter banks: loaded question banks.
 * Parameter catalogue: authored topic/page catalogue.
 * Parameter data: mutable learner store.
 * Parameter save: injected persistence callback.
 * Parameter random: injected random-number source.
 * Parameter uuid: injected identifier factory.
 * Parameter now: injected function returning current epoch milliseconds.
 * Calls: freshDraft, scope, restoreSet, ensurePage.
 * @example const session = createSession({ bank, data, save }); session.chooseName("Student", true);
 */
export function createSession({
  bank,
  banks = [bank],
  catalogue = null,
  data,
  save,
  random = Math.random,
  uuid = () => crypto.randomUUID(),
  now = Date.now,
  workingCache = createWorkingCache(null),
}) {
  let homeBank = bank;
  let profile = data.profiles.find((p) => p.key === data.last);
  let mode = 'assessment',
    selected = 0,
    reference = false,
    tips = false,
    demoLevel = 0;
  let hintVisible = false,
    draftKey = 0,
    draft = freshDraft(),
    message = '',
    inputError = '';
  let retrying = false;
  const listeners = new Set();
  /**
   * Find an authored question by stable ID in the active bank.
   * Parameter id: stable question ID.
   * Used by: current.
   */
  const question = (id) => findQuestion(bank, id);
  /**
   * Filter active-bank questions by activity type and optional challenge level.
   * Parameter type: question-type code or activity ID.
   * Parameter level: zero-based challenge level.
   * Used by: createPage, replaceRemaining.
   */
  const pool = (type, level) =>
    bank.questions.filter((q) => q.type === type && (level === undefined || q.level === level));
  /**
   * Return the active bank's subject/topic storage key.
   * Used by: createSession, topic.
   */
  const scope = () => `${bank.subject}:${bank.topic}`;
  /**
   * Get or initialize the current learner record for the active bank scope.
   * Calls: scope.
   * Used by: track, page, storePage, enterSetPage, createPage, submitAnswer.
   */
  const topic = () => (profile.topics[scope()] ??= { tracks: {}, pages: {}, history: [] });
  /** Restore this learner/topic's last chevron; new topics still begin with assessment. */
  function restoreStage() {
    const saved = profile?.topics[scope()]?.lastMode;
    mode = topicStages(bank).some(([id]) => id === saved)
      ? saved
      : saved === 'problem' && bank.problemSolvingTopic
        ? 'plain'
        : 'assessment';
  }
  /**
   * Return the active practice-set run, or null outside a set.
   * Used by: page, storePage, setPageDefinition, timeExpired, enterSetPage, restoreSet, createPage, replaceRemaining, snapshot, publish, switchMode, changeLevel, submitAnswer, nextPage, goSetPage, leavePracticeSet, tick.
   */
  const activeSet = () => (profile?.practiceSet?.active ? profile.practiceSet : null);
  /**
   * Get or initialize the current activity's adaptive track.
   * Calls: topic, newTrack.
   * Used by: createPage, snapshot, changeLevel, submitAnswer, resolvePromotion.
   */
  const track = () => (topic().tracks[mode] ??= newTrack());
  /**
   * Return the current set attempt or learner activity page.
   * Calls: activeSet, topic.
   * Used by: setPageDefinition, enterSetPage, current, ensurePage, replaceRemaining, assist, snapshot, changeLevel, setReference, submitAnswer, goSetPage, resolvePromotion.
   */
  const page = () =>
    activeSet()
      ? activeSet().attempts[activeSet().index]
      : profile
        ? topic().pages[mode]
        : undefined;
  /**
   * Store an attempt in the active set or the current topic's activity pages.
   * Parameter value: page attempt to retain in the active set or ordinary activity.
   * Calls: activeSet, topic.
   * Used by: createPage.
   */
  function storePage(value) {
    if (activeSet()) activeSet().attempts[activeSet().index] = value;
    else topic().pages[mode] = value;
  }
  /**
   * Use the saved topic/type level, falling back to the code's starting level.
   * Parameter entry: encoded catalogue page address.
   * Parameter config: decoded practice-set configuration.
   * Used by: enterSetPage, goSetPage.
   */
  function effectiveLevel(entry, config) {
    const target = catalogue.topics.find((topic) => topic.code === entry.topic);
    const type = PAGE_TYPES.find((type) => type.id === entry.type);
    if (target?.aggregate) return config.level;
    return (
      profile.topics[`${catalogue.subject}:${target?.bank}`]?.tracks[type?.mode]?.level ??
      config.level
    );
  }
  /**
   * Resolve the active set entry while preserving any previously selected random slot.
   * Parameter level: zero-based challenge level.
   * Calls: page, activeSet, resolvePracticePage.
   * Used by: createPage, replaceRemaining, changeLevel.
   */
  function setPageDefinition(level = page()?.level) {
    const run = activeSet();
    const entry = run.config.pages[run.index];
    // Keep a random page's chosen slot when adapting its challenge level.
    return resolvePracticePage(
      catalogue,
      banks,
      { ...entry, slot: page()?.authoredSlot ?? entry.slot },
      level,
      random,
      { profile, topics: run.topics },
    );
  }
  /**
   * Finish an overdue active set as expired and report whether its state changed.
   * Calls: activeSet.
   * Used by: enterSetPage, changeLevel, submitAnswer, tick.
   */
  function timeExpired() {
    const run = activeSet();
    if (!run || run.finished || !run.deadline || now() < run.deadline) return false;
    run.finished = 'expired';
    message = 'Time is up. Submitted answers are saved; unanswered questions are not scored.';
    return true;
  }
  /**
   * Select the bank, activity and attempt for the current practice-set entry.
   * Calls: activeSet, effectiveLevel, resolvePracticePage, topic, newTrack, page, createPage, resetDraft, timeExpired.
   * Used by: restoreSet, startPracticeSet, goSetPage.
   * @example enterSetPage(); // After changing run.index, restore its attempt or create it once.
   */
  function enterSetPage() {
    const run = activeSet(),
      entry = run.config.pages[run.index];
    const level = effectiveLevel(entry, run.config);
    const definition = resolvePracticePage(catalogue, banks, entry, level, random, {
      profile,
      topics: run.topics,
    });
    bank = definition.bank;
    mode = definition.mode;
    topic().tracks[mode] ??= newTrack(level);
    if (page() && page().revision !== bank.revision) {
      run.attempts[run.index] = null;
      message = 'This page has been updated; starting fresh while keeping your submitted history.';
    }
    if (!page()) createPage(definition);
    selected = 0;
    reference = false;
    tips = false;
    resetDraft();
    timeExpired();
  }
  /**
   * Decode and restore a saved set, abandoning invalid configuration safely.
   * Calls: activeSet, decodePracticeSet, enterSetPage.
   * Used by: createSession, chooseName, startPracticeSet, resumePracticeSet.
   */
  function restoreSet() {
    if (!activeSet()) return;
    try {
      activeSet().config = decodePracticeSet(activeSet().code);
      enterSetPage();
    } catch (error) {
      activeSet().active = false;
      bank = homeBank;
      restoreStage();
      message = `Practice set cannot resume: ${error.message}`;
    }
  }
  /**
   * Return the selected authored question in the current page.
   * Calls: question, page.
   * Used by: assist, submitAnswer.
   */
  const current = () => question(page()?.items[selected]?.id);
  const answerOwner = (q) =>
    bank.combined
      ? (profile.topics[`${q.subject}:${q.topic}`] ??= { tracks: {}, pages: {}, history: [] })
      : topic();
  /** Retries are separate practice; original assessment/set answers and totals stay fixed. */
  function canRetry() {
    if (!profile || mode === 'demo' || !current() || page().pendingChoice) return false;
    const response = latestResponse(page(), current().id);
    return Boolean(response && (!response.correct || response.earlyReattempt));
  }
  /**
   * Create empty transient answer, error-entry, typed-working and stroke fields.
   * Used by: createSession, resetDraft.
   */
  function freshDraft() {
    return { answer: '', errors: [], working: '', strokes: [], points: 0 };
  }
  /**
   * Identify temporary working by learner, topic, page attempt and question.
   * Used by: resetDraft and updateDraft.
   */
  const workingKey = () =>
    profile && current() && mode !== 'demo'
      ? JSON.stringify([profile.key, scope(), page().attempt, current().id])
      : null;
  /**
   * Restore cached drawing/typed working, reset answer entry and advance the component key.
   * Calls: workingKey, freshDraft, workingCache.load; used when the selected question changes.
   */
  function resetDraft() {
    retrying = false;
    const key = workingKey();
    draft = { ...freshDraft(), ...(key ? workingCache.load(key) : null) };
    hintVisible = false;
    draftKey++;
    inputError = '';
  }
  // Retired question pages are automatically replaced; keep recorded results and current pages.
  if (discardRetiredAttempts(data, banks)) save(data);
  // Invalidate outdated page attempts only; all recorded answer history is retained.
  for (const p of data.profiles)
    for (const loaded of banks) {
      const saved = p.topics[`${loaded.subject}:${loaded.topic}`];
      for (const [key, attempt] of Object.entries(saved?.pages ?? {}))
        if (attempt.revision !== loaded.revision) {
          delete saved.pages[key];
          if (saved.pageHistory) delete saved.pageHistory[key];
          if (saved.practicePages) delete saved.practicePages[key];
        }
      for (const [key, levels] of Object.entries(saved?.practicePages ?? {}))
        if (
          Object.values(levels).some((group) =>
            group.attempts.some((attempt) => attempt && attempt.revision !== loaded.revision),
          )
        )
          delete saved.practicePages[key];
      for (const [key, visits] of Object.entries(saved?.pageHistory ?? {}))
        if (
          [...visits.previous, ...visits.next].some(
            (attempt) => attempt.revision !== loaded.revision,
          )
        )
          delete saved.pageHistory[key];
    }
  /**
   * Create an authored practice attempt or a balanced random assessment.
   * Parameter definition: authored page definition or null for sampling.
   * Calls: activeSet, setPageDefinition, track, newPage, pool, topic, storePage.
   * Used by: enterSetPage, ensurePage, nextPage.
   * @example createPage(); // Create the initial assessment and persist it.
   */
  function createPage(definition = activeSet() ? setPageDefinition(track().level) : null) {
    const level = definition?.level ?? track().level;
    const candidates = definition ? definition.ids.map(question) : assessmentPage(bank, random);
    const size = candidates.length;
    const p = {
      ...newPage(size, level),
      startLevel: level,
      revision: bank.revision,
      attempt: uuid(),
      items: [],
      assisted: {},
      responses: {},
      ...(definition?.ordinary
        ? { navigationLevel: level, navigationIndex: definition.index }
        : definition
          ? { authoredSlot: definition.slot }
          : {}),
    };
    p.items = candidates.map((q) => ({ id: q.id, level: q.level }));
    storePage(p);
    resetDraft();
    save(data);
  }
  /**
   * Reset selection/reference/message and restore the first question's working after a mode/bank change.
   * Calls resetDraft; used by chooseName, switchTopic, switchMode and leavePracticeSet.
   */
  function resetActivity() {
    selected = 0;
    reference = false;
    tips = false;
    message = '';
    resetDraft();
  }
  /**
   * Create a missing activity page for the selected learner, except in demo mode.
   * Calls: page, createPage.
   * Used by: createSession, chooseName, switchMode, startPracticeSet, leavePracticeSet, resumePracticeSet.
   */
  function ensurePage() {
    if (!profile || mode === 'demo') return;
    if (!activeSet() && TOPIC_PAGE_SIZES[mode]) {
      if (page()) rememberOrdinaryPage();
      else openOrdinaryPage(track().level);
    } else if (!page()) {
      const previous = mode === 'assessment' ? latestAssessment(topic().history) : null;
      if (previous && previous.every((record) => question(record.question))) {
        const restored = {
          ...newPage(previous.length, 0),
          revision: bank.revision,
          attempt: previous[0].attempt,
          startLevel: 0,
          count: previous.length,
          complete: true,
          items: previous.map((r) => ({ id: r.question, level: r.level })),
          assisted: {},
          responses: Object.fromEntries(
            previous.map((r) => [
              r.question,
              {
                raw: r.raw ?? '',
                correct: r.correct,
                assisted: r.assisted,
                entries: [],
              },
            ]),
          ),
        };
        storePage(restored);
      } else createPage();
    }
  }
  /**
   * Refill unanswered question slots after a level change while retaining existing responses.
   * Parameter promoted: whether the level changed through promotion.
   * Calls: page, activeSet, setPageDefinition, pool.
   * Used by: changeLevel, submitAnswer.
   * @example replaceRemaining(true); // Keep submitted answers; refill unmarked slots at the promoted level.
   */
  function replaceRemaining(promoted = false) {
    const p = page();
    const preferred = activeSet() ? setPageDefinition(p.level).ids : [];
    const candidates = pool(mode, p.level)
      .sort((a, b) => Number(!preferred.includes(a.id)) - Number(!preferred.includes(b.id)))
      .filter((q) => !p.items.some((i) => Object.hasOwn(p.responses, i.id) && i.id === q.id));
    const remaining = p.items
      .map((item, i) => (!Object.hasOwn(p.responses, item.id) ? i : -1))
      .filter((i) => i >= 0);
    if (candidates.length < remaining.length)
      throw Error('The bank needs more questions for this level.');
    remaining.forEach(
      (i, n) =>
        (p.items[i] = {
          id: candidates[n].id,
          level: p.level,
          promoted: promoted && p.level > (p.startLevel ?? 0),
        }),
    );
  }
  /**
   * Mark the current unanswered question as assisted.
   * Calls: current, page.
   * Used by: switchMode, select, setReference, hint, submitAnswer.
   */
  function assist() {
    const q = current();
    if (q && (!page().responses[q.id] || retrying)) page().assisted[q.id] = true;
  }
  /** Keep the active page authoritative after JSON reload, where object aliases are lost.
   * Legacy saved pages retain their questions/answers as the first page of their starting level.
   * Older unbounded pageHistory records remain intact; no learner results are deleted.
   */
  function rememberOrdinaryPage() {
    const p = page();
    p.navigationLevel ??= p.startLevel ?? p.level;
    p.navigationIndex ??= 0;
    const modes = (topic().practicePages ??= {});
    const levels = (modes[mode] ??= {});
    const group = (levels[p.navigationLevel] ??= { index: 0, attempts: [] });
    group.index = p.navigationIndex;
    group.attempts[group.index] = p;
    return group;
  }
  /** Open one defined page within a chosen level, restoring its saved attempt when present. */
  function openOrdinaryPage(level, index, restart = false) {
    const definitions = topicPages(bank, mode, level);
    const group = topic().practicePages?.[mode]?.[level];
    index ??= group?.index ?? 0;
    if (!definitions[index]) return;
    selected = 0;
    if (!restart && group?.attempts[index]) storePage(group.attempts[index]);
    else createPage({ ids: definitions[index], level, index, ordinary: true });
    rememberOrdinaryPage();
    resetActivity();
  }
  /** Page navigation is bounded by the authored pages of this stage and starting level. */
  function movePage(direction) {
    if (!profile || activeSet() || !TOPIC_PAGE_SIZES[mode]) return;
    const p = page();
    if (p.pendingChoice) return;
    rememberOrdinaryPage();
    openOrdinaryPage(p.navigationLevel, p.navigationIndex + direction);
    publish(true);
  }
  /**
   * Return the presentation state without exposing the mutable store directly.
   * Calls: backupStatus, activeSet, setSecondsRemaining, page, track.
   * Used by: publish, subscribe.
   * @example const view = snapshot(); view.draft.answer = "2"; // Does not alter the session draft.
   */
  function snapshot() {
    return {
      bank,
      sourceBank: banks.find((b) => b.topic === current()?.topic) ?? bank,
      timingDeadline: retrying ? null : (activeSet()?.deadline ?? null),
      retrying,
      canRetry: canRetry(),
      profile: profile
        ? {
            id: profile.id,
            name: profile.name,
            key: profile.key,
            anonymous: Boolean(profile.anonymous),
          }
        : null,
      backup: profile?.anonymous ? null : backupStatus(profile, now()),
      demoSpeed: profile?.settings?.demoSpeed ?? 1,
      assessment: profile ? assessmentStatus(topic().history, now()) : null,
      practiceSet: activeSet()
        ? {
            code: activeSet().code,
            topics: activeSet().topics?.slice(),
            recommendationId: activeSet().recommendationId,
            index: activeSet().index,
            config: structuredClone(activeSet().config),
            finished: activeSet().finished,
            remaining: setSecondsRemaining(activeSet(), now()),
            completed: activeSet().attempts.map((attempt) => Boolean(attempt?.complete)),
          }
        : null,
      savedSet: profile?.practiceSet
        ? {
            code: profile.practiceSet.code,
            finished: profile.practiceSet.finished,
            topics: profile.practiceSet.topics?.slice(),
          }
        : null,
      mode,
      selected,
      pageNavigation:
        profile && !activeSet() && TOPIC_PAGE_SIZES[mode]
          ? {
              index: page().navigationIndex ?? 0,
              level: page().navigationLevel ?? page().startLevel,
              total: topicPages(bank, mode, page().navigationLevel ?? page().startLevel).length,
            }
          : null,
      reference,
      tips,
      demoLevel,
      hintVisible,
      draftKey,
      draft: structuredClone(draft),
      message,
      inputError,
      page: mode === 'demo' ? null : structuredClone(page() ?? null),
      track: profile && mode !== 'demo' ? structuredClone(track()) : null,
    };
  }
  /**
   * Optionally persist session state, then notify view subscribers.
   * Parameter persist: whether to save as well as publish.
   * Calls: activeSet, snapshot.
   * Used by: chooseName, switchMode, select, changeLevel, setReference, setDemoSpeed, setDemoLevel, hint, updateDraft, submitAnswer, nextPage, startPracticeSet, goSetPage, leavePracticeSet, resumePracticeSet, tick, resolvePromotion.
   */
  function publish(persist = false) {
    if (persist) {
      const run = activeSet();
      // Practice-set modes must not replace the ordinary topic's chevron selection.
      if (profile && !run) topic().lastMode = mode;
      const recommendation = profile?.revision?.recommendations.find(
        (item) => item.id === run?.recommendationId,
      );
      if (recommendation) recommendation.savedAttempt = structuredClone(run);
      save(data);
    }
    const value = snapshot();
    for (const fn of listeners) fn(value);
  }
  restoreStage();
  restoreSet();
  ensurePage();
  resetDraft();
  return {
    /**
     * Register a state listener, publish its initial value and return an unsubscribe function.
     * Parameter fn: callback invoked by this operation.
     * Calls: snapshot.
     */
    subscribe(fn) {
      listeners.add(fn);
      fn(snapshot());
      return () => listeners.delete(fn);
    },
    /** Start a fresh anonymous visit and its first page; called by Continue without a name. */
    beginAnonymous() {
      bank = homeBank;
      profile = beginAnonymous(data);
      restoreStage();
      resetActivity();
      ensurePage();
      publish(true);
    },
    /**
     * Select or explicitly create the named local learner.
     * Parameter name: learner display name before normalization.
     * Parameter create: whether learner creation was confirmed.
     * Calls: nameAnonymous, resetActivity, restoreSet, ensurePage, publish.
     */
    chooseName(name, create = false) {
      const result = nameAnonymous(data, name, create);
      if (!result.profile) return result;
      profile = result.profile;
      homeBank = banks.find((item) => item.topic === profile.lastTopic) ?? banks[0];
      bank = homeBank;
      restoreStage();
      resetActivity();
      restoreSet();
      ensurePage();
      publish(true);
      return result;
    },
    /**
     * Leave any set and restore the requested topic's saved learning stage.
     * Parameter topicId: bank topic ID, e.g. M10.
     * Calls: activeSet, resetActivity, ensurePage, publish; used by topic selection.
     */
    switchTopic(topicId) {
      const next = banks.find((item) => item.topic === topicId);
      if (!next) throw Error('This topic is unavailable.');
      if (activeSet()) activeSet().active = false;
      bank = homeBank = next;
      profile.lastTopic = topicId;
      restoreStage();
      resetActivity();
      ensurePage();
      publish(true);
    },
    /**
     * Leave any set and enter the requested stage in the home bank, recording demo assistance first.
     * Parameter next: assessment, demo, scaffolded, errors, plain or problem.
     * Calls: activeSet, assist, resetActivity, ensurePage, publish; used by stage navigation.
     */
    switchMode(next) {
      if (activeSet()) activeSet().active = false;
      bank = homeBank;
      if (next === 'demo' && !['assessment', 'demo'].includes(mode)) assist();
      // Old application-stage requests resolve to independent practice without deleting history.
      mode = topicStages(bank).some(([id]) => id === next) ? next : 'plain';
      resetActivity();
      ensurePage();
      publish(true);
    },
    /**
     * Select a question index, reset answer entry and restore its cached working.
     * Parameter index: zero-based question/page position.
     * Calls: resetDraft, assist, publish.
     */
    select(index) {
      if (selected === index) return;
      selected = index;
      resetDraft();
      message = '';
      if (reference || tips) assist();
      publish(true);
    },
    /**
     * Apply a manual challenge change unless a set is finished or expired.
     * Parameter level: zero-based challenge level.
     * Calls: timeExpired, activeSet, publish, setPageDefinition, page, manualLevel, track, replaceRemaining, resetDraft.
     * @example session.changeLevel(1); // Select Build and refill unanswered slots.
     */
    changeLevel(level) {
      if (timeExpired() || activeSet()?.finished) {
        publish(true);
        return;
      }
      if (!activeSet() && TOPIC_PAGE_SIZES[mode]) {
        if (page().trial || page().pendingChoice)
          throw Error('Finish the current challenge trial first.');
        if (!Number.isInteger(level) || level < 0 || level > 2)
          throw Error('Unknown challenge level.');
        rememberOrdinaryPage();
        if (['plain', 'errors', 'problem'].includes(mode))
          manualLevel(track(), newPage(1, level), level);
        openOrdinaryPage(level);
        publish(true);
        return;
      }
      if (activeSet()) setPageDefinition(level); // Validate availability before changing progress.
      const p = page();
      p.startLevel = level;
      if (['plain', 'errors', 'problem'].includes(mode)) manualLevel(track(), p, level);
      else p.level = level;
      replaceRemaining();
      selected = Math.max(
        0,
        p.items.findIndex((i) => !p.responses[i.id]),
      );
      resetDraft();
      publish(true);
    },
    /**
     * Open or close teaching reference and mark the current question assisted when opened.
     * Parameter open: whether teaching reference is visible.
     * Calls: assist, page, publish.
     */
    setProblemTips(open) {
      tips = open;
      if (open) assist();
      publish(true);
    },
    setReference(open) {
      reference = open;
      if (open) {
        assist();
        demoLevel = page().items[selected].level;
      }
      publish(true);
    },
    /**
     * Persist a supported playback speed for the current learner.
     * Parameter speed: supported playback multiplier.
     * Calls: publish.
     */
    setDemoSpeed(speed) {
      if (!profile || ![0.5, 1, 1.5, 2].includes(speed)) return;
      profile.settings = { ...profile.settings, demoSpeed: speed };
      publish(true);
    },
    /**
     * Change the displayed demonstration level and publish the view.
     * Parameter level: zero-based challenge level.
     * Calls: publish.
     */
    setDemoLevel(level) {
      demoLevel = level;
      publish();
    },
    /**
     * Mark assistance and show the current technique hint.
     * Calls: assist, publish.
     */
    hint() {
      hintVisible = !hintVisible;
      // Hiding a hint must not undo the recorded assistance for this question.
      if (hintVisible) assist();
      publish(true);
    },
    /**
     * Merge the supplied answer/working patch into the transient draft.
     * Parameter patch: partial transient draft update.
     * Calls: publish.
     */
    updateDraft(patch) {
      Object.assign(draft, patch);
      const key = workingKey();
      if (
        key &&
        Object.keys(patch).some((name) =>
          ['working', 'strokes', 'points', 'guides', 'canvasHeight'].includes(name),
        )
      )
        workingCache.save(key, draft);
      publish();
    },
    /** Start a separate practice response while preserving the original submission and totals. */
    retryQuestion() {
      if (!canRetry()) return false;
      resetDraft();
      retrying = true;
      page().assisted[current().id] = Boolean(reference || tips);
      message =
        'Try this question again. Attempts within two hours of your last incorrect answer do not count towards progress.';
      publish();
      return true;
    },
    /**
     * Validate and mark the current draft, record the outcome and advance the page when appropriate.
     * Calls: timeExpired, activeSet, publish, page, current, markAnswer, markErrors, submit, track, topic, replaceRemaining, resetDraft, assist, completeRecommendation.
     * @example session.updateDraft({ answer: "2" }); session.submitAnswer(); // Mark the selected question.
     */
    submitAnswer() {
      if (!retrying && (timeExpired() || activeSet()?.finished)) {
        publish(true);
        return { expired: true };
      }
      const p = page(),
        q = current();
      if (retrying ? !canRetry() : p.complete || p.responses[q.id]) return { duplicate: true };
      const numeric = markAnswer(draft.answer, q.answer);
      if (!numeric.valid) {
        inputError = q.answer.includes(' r ')
          ? 'Enter a whole-number answer and remainder, for example 24 r 1.'
          : 'Enter a number, decimal or fraction (for example −3, 2.5 or 5/2).';
        publish();
        return { invalid: true };
      }
      const result = mode === 'errors' ? markErrors(q, draft.errors, draft.answer) : numeric;
      if (!result.valid || result.unique === false) {
        inputError = q.investigation
          ? 'Choose a reason for each selected location. Select each location once.'
          : 'Choose a row, reason and corrected step for each error. Select each error row once.';
        publish();
        return { invalid: true };
      }
      inputError = '';
      const before = p.level,
        level = p.items[selected].level,
        assisted = Boolean(p.assisted[q.id]);
      const owner = answerOwner(q);
      const at = now();
      const early = earlyReattempt(owner.history, q.id, at);
      const reattempt = retrying;
      const outcomeType = bank.combined || (reattempt && mode === 'assessment') ? q.type : mode;
      const response = {
        raw: draft.answer,
        correct: result.correct,
        assisted,
        ...(early ? { earlyReattempt: true } : {}),
        entries: structuredClone(draft.errors),
        details: result.details,
        missing: result.missing,
        answerCorrect: result.answerCorrect ?? numeric.correct,
      };
      if (reattempt) {
        (p.reattempts ??= {})[q.id] = response;
        if (countsForProgress(response)) {
          const actual = (owner.tracks[outcomeType] ??= newTrack(level));
          actual.histories[level].push(result.correct);
          actual.histories[level] = actual.histories[level].slice(-10);
        }
      } else {
        p.responses[q.id] = response;
        if (!bank.combined && ['plain', 'errors', 'problem'].includes(mode))
          submit(track(), p, {
            id: q.id,
            level,
            correct: result.correct,
            assisted,
            earlyReattempt: early,
            window: scoringWindow(mode, p.size),
          });
        else {
          p.count++;
          p.complete = p.count === p.size;
          if (countsForProgress(response)) {
            const actual = (owner.tracks[outcomeType] ??= newTrack(level));
            actual.histories[level].push(result.correct);
            actual.histories[level] = actual.histories[level].slice(-10);
          }
        }
      }
      retrying = false;
      owner.history.push({
        attempt: p.attempt,
        ...(activeSet()
          ? {
              practiceCode: activeSet().code,
              practicePage: activeSet().index,
              authoredSlot: p.authoredSlot,
            }
          : {}),
        question: q.id,
        raw: draft.answer,
        pageSize: p.size,
        revision: bank.revision,
        type: outcomeType,
        level,
        correct: result.correct,
        assisted,
        ...(reattempt ? { reattempt: true } : {}),
        ...(early ? { earlyReattempt: true } : {}),
        at,
      });
      if (before !== p.level && !p.complete) replaceRemaining(p.level > before);
      message =
        draft.points < 8 && !draft.working.trim()
          ? 'Remember to show your working. You can draw, type or use paper.'
          : '';
      const next =
        result.correct && !activeSet()?.finished
          ? Array.from(
              { length: p.items.length - 1 },
              (_, offset) => (selected + offset + 1) % p.items.length,
            ).find((i) => !p.responses[p.items[i].id])
          : undefined;
      if (next !== undefined) {
        selected = next;
        resetDraft();
        if (reference || tips) assist();
        message = `Correct. Moving to question ${selected + 1}.`;
      }
      const run = activeSet();
      if (!reattempt && run && run.config.pages.every((_, index) => run.attempts[index]?.complete))
        run.finished = 'complete';
      if (completeRecommendation(profile, run, now()))
        message = 'Well done! Your focused practice will help your grades.';
      publish(true);
      return { advanced: next !== undefined, correct: result.correct, response };
    },
    /**
     * Start another ordinary activity page; active practice sets use their own navigation.
     * Calls: activeSet, resetDraft, createPage, publish.
     */
    reassess() {
      if (
        !profile ||
        activeSet() ||
        mode !== 'assessment' ||
        !page()?.complete ||
        !assessmentStatus(topic().history, now())?.available
      )
        return false;
      createPage();
      resetActivity();
      publish(true);
      return true;
    },
    nextPage() {
      movePage(1);
    },
    /** Explicitly retry a completed defined page; submitted answer history stays intact. */
    restartPage() {
      if (
        !profile ||
        activeSet() ||
        !TOPIC_PAGE_SIZES[mode] ||
        !page().complete ||
        page().pendingChoice
      )
        return;
      const p = page();
      openOrdinaryPage(p.navigationLevel, p.navigationIndex, true);
      publish(true);
    },
    /** Restore the preceding ordinary page with its original attempt and responses. */
    previousPage() {
      movePage(-1);
    },
    /**
     * Validate a code and initialize or resume its learner-owned practice-set attempt.
     * Parameter raw: untrusted input text.
     * Parameter recommendationId: owning revision recommendation ID, if any.
     * Calls: restoreSet, ensurePage, publish, decodePracticeSet, encodePracticeSet, enterSetPage.
     * @example session.startPracticeSet(code); // Resolve and start an entered practice code.
     */
    startPracticeSet(raw, recommendationId = null, options = {}) {
      if (!profile || !catalogue) throw Error('Choose your name before opening a Practice set.');
      const recommendation = recommendationId
        ? profile.revision?.recommendations.find((item) => item.id === recommendationId)
        : null;
      if (recommendationId && (!recommendation || recommendation.code !== raw))
        throw Error('Recommended set not found for this learner.');
      if (recommendation && profile.practiceSet?.recommendationId === recommendationId) {
        profile.practiceSet.active = true;
        restoreSet();
        ensurePage();
        publish(true);
        return;
      }
      if (recommendation?.savedAttempt) {
        profile.practiceSet = structuredClone(recommendation.savedAttempt);
        profile.practiceSet.active = true;
        restoreSet();
        ensurePage();
        publish(true);
        return;
      }
      if (recommendation?.completedAt != null)
        throw Error(
          'This recommended set is already complete. Choose the next recommendation on Progress.',
        );
      const config = decodePracticeSet(raw);
      // Validate the whole recipe before replacing any current attempt.
      config.pages.forEach((entry) =>
        resolvePracticePage(catalogue, banks, entry, effectiveLevel(entry, config), () => 0, {
          profile,
          topics: options.topics,
        }),
      );
      const started = now();
      profile.practiceSet = {
        active: true,
        topics: options.topics,
        recommendationId,
        code: encodePracticeSet(config),
        config,
        index: 0,
        attempts: [],
        started,
        deadline: TIMINGS[config.timing] ? started + TIMINGS[config.timing] * 60000 : null,
        finished: null,
      };
      if (recommendation) recommendation.openedAt ??= started;
      message = recommendation ? 'Recommended practice set' : '';
      enterSetPage();
      publish(true);
    },
    /**
     * Select a valid page index within the active set and restore its attempt.
     * Parameter index: zero-based question/page position.
     * Calls: activeSet, page, resolvePracticePage, effectiveLevel, enterSetPage, publish.
     * @example session.goSetPage(1); // Enter the second set page when navigation permits.
     */
    goSetPage(index) {
      const run = activeSet();
      if (!run || !Number.isInteger(index) || index < 0 || index >= run.config.pages.length) return;
      if (index > run.index + 1) return;
      if (run.finished && !run.attempts[index]) return;
      if (index > run.index && !run.finished && (!page().complete || page().pendingChoice)) return;
      const entry = run.config.pages[index];
      resolvePracticePage(catalogue, banks, entry, effectiveLevel(entry, run.config), () => 0);
      run.index = index;
      enterSetPage();
      publish(true);
    },
    /**
     * Return to the saved ordinary learning stage while retaining the saved set.
     * Calls: activeSet, resetActivity, ensurePage, publish.
     */
    leavePracticeSet() {
      if (activeSet()) activeSet().active = false;
      bank = homeBank;
      restoreStage();
      resetActivity();
      ensurePage();
      publish(true);
    },
    /**
     * Reactivate the learner's saved practice set and publish its restored state.
     * Calls: restoreSet, ensurePage, publish.
     */
    resumePracticeSet() {
      if (!profile?.practiceSet) return;
      profile.practiceSet.active = true;
      restoreSet();
      ensurePage();
      publish(true);
    },
    /**
     * Check a timed active set for expiry and publish its remaining time.
     * Calls: activeSet, publish, timeExpired.
     */
    tick() {
      const run = activeSet();
      if (run?.deadline && !run.finished) publish(timeExpired());
    },
    /**
     * Apply the learner's promotion choice to the track and page, then persist.
     * Parameter accept: learner acceptance of the offered promotion.
     * Calls: resolveChoice, track, page, publish.
     */
    resolvePromotion(accept) {
      resolveChoice(track(), page(), accept);
      publish(true);
    },
  };
}
