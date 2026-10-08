/**
 * Purpose: Coordinate learner actions, adaptive pages, marking and practice sets through injected dependencies.
 *
 * Main contents:
 * - createSession
 *
 * Used By: tests/practice-set.test.mjs, tests/progress.test.mjs, tests/session.test.mjs, website/src/routes/+page.svelte
 *
 * Uses: website/src/lib/domain/progress.mjs, website/src/lib/domain/revision.mjs, website/src/lib/domain/engine.mjs, website/src/lib/domain/profiles.mjs, website/src/lib/domain/errors.mjs, website/src/lib/domain/practice-code.mjs.
 *
 * Libs: none.
 */
import { backupStatus } from '../domain/progress.mjs';
import { completeRecommendation } from '../domain/revision.mjs';
import {
  newTrack,
  newPage,
  submit,
  manualLevel,
  resolveChoice,
  markAnswer,
} from '../domain/engine.mjs';
import { chooseProfile } from '../domain/profiles.mjs';
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
Immutable view snapshots let rendering observe changes without owning stored state.
 * Create the practice action API from banks, learner data, persistence and injected clock/randomness.
 * Parameter bank: active question bank.
 * Parameter banks: loaded question banks.
 * Parameter catalogue: authored topic/page catalogue.
 * Parameter data: mutable learner store.
 * Parameter save: injected persistence callback.
 * Parameter random: injected random-number source.
 * Parameter uuid: injected identifier factory.
 * Parameter now: current time in milliseconds or injected clock, as declared.
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
}) {
  let homeBank = bank;
  let profile = data.profiles.find((p) => p.key === data.last);
  let mode = 'assessment',
    selected = 0,
    reference = false,
    demoLevel = 0;
  let paper = false,
    draftKey = 0,
    draft = freshDraft(),
    message = '',
    inputError = '';
  const listeners = new Set();
  /**
   * Find an authored question by stable ID in the active bank.
   * Parameter id: stable question/job identifier.
   * Used by: current.
   */
  const question = (id) => bank.questions.find((q) => q.id === id);
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
   * Parameter value: new value to apply or validate.
   * Calls: activeSet, topic.
   * Used by: createPage.
   */
  function storePage(value) {
    if (activeSet()) activeSet().attempts[activeSet().index] = value;
    else topic().pages[mode] = value;
  }
  /**
   * Resolve a set's random/recommended/fixed challenge level for its catalogue entry.
   * Parameter entry: encoded catalogue page address.
   * Parameter config: decoded practice-set configuration.
   * Used by: enterSetPage, goSetPage.
   */
  function effectiveLevel(entry, config) {
    const target = catalogue.topics.find((topic) => topic.code === entry.topic);
    const type = PAGE_TYPES.find((type) => type.id === entry.type);
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
   * @example enterSetPage();
   */
  function enterSetPage() {
    const run = activeSet(),
      entry = run.config.pages[run.index];
    const level = effectiveLevel(entry, run.config);
    const definition = resolvePracticePage(catalogue, banks, entry, level, random);
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
    paper = false;
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
      mode = 'assessment';
      message = `Practice set cannot resume: ${error.message}`;
    }
  }
  /**
   * Return the selected authored question in the current page.
   * Calls: question, page.
   * Used by: assist, submitAnswer.
   */
  const current = () => question(page()?.items[selected]?.id);
  /**
   * Create empty transient answer, error-entry, typed-working and stroke fields.
   * Used by: createSession, resetDraft.
   */
  function freshDraft() {
    return { answer: '', errors: [], working: '', strokes: [], points: 0 };
  }
  /**
   * Clear the transient question draft and advance its component reset key.
   * Calls: freshDraft.
   * Used by: enterSetPage, chooseName, switchMode, select, changeLevel, submitAnswer, nextPage, leavePracticeSet.
   */
  function resetDraft() {
    draft = freshDraft();
    draftKey++;
    inputError = '';
  }
  // Invalidate outdated page attempts only; all recorded answer history is retained.
  for (const p of data.profiles)
    for (const loaded of banks) {
      const saved = p.topics[`${loaded.subject}:${loaded.topic}`];
      for (const [key, attempt] of Object.entries(saved?.pages ?? {}))
        if (attempt.revision !== loaded.revision) delete saved.pages[key];
    }
  /**
   * Create an activity attempt from its authored definition or sampled question pool.
   * Parameter definition: authored page definition or null for sampling.
   * Calls: activeSet, setPageDefinition, track, newPage, pool, topic, storePage.
   * Used by: enterSetPage, ensurePage, nextPage.
   * @example createPage(definition);
   */
  function createPage(definition = activeSet() ? setPageDefinition(track().level) : null) {
    const t = track(),
      size = definition
        ? definition.ids.length
        : mode === 'plain'
          ? 10
          : mode === 'errors'
            ? 3
            : mode === 'assessment'
              ? 4
              : 2;
    const p = {
      ...newPage(size, t.level),
      startLevel: t.level,
      revision: bank.revision,
      attempt: uuid(),
      items: [],
      assisted: {},
      responses: {},
      ...(definition ? { authoredSlot: definition.slot } : {}),
    };
    const candidates = pool(mode, mode === 'assessment' ? undefined : p.level);
    const recent = new Set(
      topic()
        .history.slice(-30)
        .map((h) => h.question),
    );
    const available = [...candidates].sort(
      (a, b) => Number(recent.has(a.id)) - Number(recent.has(b.id)),
    );
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      if (recent.has(available[i].id) === recent.has(available[j].id))
        [available[i], available[j]] = [available[j], available[i]];
    }
    if (candidates.length < size) throw Error('Not enough unused questions at this level.');
    p.items = (
      definition
        ? definition.ids.map(question)
        : mode === 'assessment'
          ? candidates
          : available.slice(0, size)
    ).map((q) => ({
      id: q.id,
      level: q.level,
    }));
    storePage(p);
    paper = false;
    save(data);
  }
  /**
   * Create a missing activity page for the selected learner, except in demo mode.
   * Calls: page, createPage.
   * Used by: createSession, chooseName, switchMode, startPracticeSet, leavePracticeSet, resumePracticeSet.
   */
  function ensurePage() {
    if (profile && mode !== 'demo' && !page()) createPage();
  }
  /**
   * Refill unanswered question slots after a level change while retaining existing responses.
   * Parameter promoted: whether the level changed through promotion.
   * Calls: page, activeSet, setPageDefinition, pool.
   * Used by: changeLevel, submitAnswer.
   * @example replaceRemaining(promoted);
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
    if (q && !page().responses[q.id]) page().assisted[q.id] = true;
  }
  /**
   * Return the presentation state without exposing the mutable store directly.
   * Calls: backupStatus, activeSet, setSecondsRemaining, page, track.
   * Used by: publish, subscribe.
   * @example snapshot();
   */
  function snapshot() {
    return {
      bank,
      profile: profile ? { name: profile.name, key: profile.key } : null,
      backup: backupStatus(profile, now()),
      demoSpeed: profile?.settings?.demoSpeed ?? 1,
      practiceSet: activeSet()
        ? {
            code: activeSet().code,
            recommendationId: activeSet().recommendationId,
            index: activeSet().index,
            config: structuredClone(activeSet().config),
            finished: activeSet().finished,
            remaining: setSecondsRemaining(activeSet(), now()),
            completed: activeSet().attempts.map((attempt) => Boolean(attempt?.complete)),
          }
        : null,
      savedSet: profile?.practiceSet
        ? { code: profile.practiceSet.code, finished: profile.practiceSet.finished }
        : null,
      mode,
      selected,
      reference,
      demoLevel,
      paper,
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
   * Used by: chooseName, switchMode, select, changeLevel, setReference, setDemoSpeed, setDemoLevel, hint, setPaper, updateDraft, submitAnswer, nextPage, startPracticeSet, goSetPage, leavePracticeSet, resumePracticeSet, tick, resolvePromotion.
   */
  function publish(persist = false) {
    if (persist) {
      const run = activeSet();
      const recommendation = profile?.revision?.recommendations.find(
        (item) => item.id === run?.recommendationId,
      );
      if (recommendation) recommendation.savedAttempt = structuredClone(run);
      save(data);
    }
    const value = snapshot();
    for (const fn of listeners) fn(value);
  }
  restoreSet();
  ensurePage();
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
    /**
     * Select or explicitly create the named local learner.
     * Parameter name: learner name or requested field name.
     * Parameter create: whether learner creation was confirmed.
     * Calls: chooseProfile, resetDraft, restoreSet, ensurePage, publish.
     */
    chooseName(name, create = false) {
      const result = chooseProfile(data, name, create);
      if (!result.profile) return result;
      profile = result.profile;
      homeBank = banks.find((item) => item.topic === profile.lastTopic) ?? banks[0];
      bank = homeBank;
      mode = 'assessment';
      selected = 0;
      reference = false;
      paper = false;
      message = '';
      resetDraft();
      restoreSet();
      ensurePage();
      publish(true);
      return result;
    },
    /**
     * Leave any set and enter the requested learning activity in the home bank.
     * Parameter next: requested learning activity.
     * Calls: activeSet, assist, resetDraft, ensurePage, publish.
     */
    switchTopic(topicId) {
      const next = banks.find((item) => item.topic === topicId);
      if (!next) throw Error('This topic is unavailable.');
      if (activeSet()) activeSet().active = false;
      bank = homeBank = next;
      profile.lastTopic = topicId;
      mode = 'assessment';
      selected = 0;
      reference = false;
      message = '';
      resetDraft();
      ensurePage();
      publish(true);
    },
    switchMode(next) {
      if (activeSet()) activeSet().active = false;
      bank = homeBank;
      if (next === 'demo' && !['assessment', 'demo'].includes(mode)) assist();
      mode = next;
      selected = 0;
      reference = false;
      message = '';
      resetDraft();
      ensurePage();
      publish(true);
    },
    /**
     * Select a question index and clear the previous transient draft.
     * Parameter index: zero-based question/page position.
     * Calls: resetDraft, assist, publish.
     */
    select(index) {
      if (selected === index) return;
      selected = index;
      resetDraft();
      message = '';
      if (reference) assist();
      publish(true);
    },
    /**
     * Apply a manual challenge change unless a set is finished or expired.
     * Parameter level: zero-based challenge level.
     * Calls: timeExpired, activeSet, publish, setPageDefinition, page, manualLevel, track, replaceRemaining, resetDraft.
     * @example changeLevel(level);
     */
    changeLevel(level) {
      if (timeExpired() || activeSet()?.finished) {
        publish(true);
        return;
      }
      if (activeSet()) setPageDefinition(level); // Validate availability before changing progress.
      const p = page();
      p.startLevel = level;
      if (['plain', 'errors'].includes(mode)) manualLevel(track(), p, level);
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
      assist();
      message = `${bank.method ? bank.teaching.guidance[current().level].steps[1] : 'Keep both sides balanced: use the same inverse operation on each side.'} This answer will be recorded as assisted.`;
      publish(true);
    },
    /**
     * Toggle paper-working mode in the current view.
     * Parameter value: new value to apply or validate.
     * Calls: publish.
     */
    setPaper(value) {
      paper = value;
      publish();
    },
    /**
     * Merge the supplied answer/working patch into the transient draft.
     * Parameter patch: partial transient draft update.
     * Calls: publish.
     */
    updateDraft(patch) {
      Object.assign(draft, patch);
      publish();
    },
    /**
     * Validate and mark the current draft, record the outcome and advance the page when appropriate.
     * Calls: timeExpired, activeSet, publish, page, current, markAnswer, markErrors, submit, track, topic, replaceRemaining, resetDraft, assist, completeRecommendation.
     * @example submitAnswer();
     */
    submitAnswer() {
      if (timeExpired() || activeSet()?.finished) {
        publish(true);
        return { expired: true };
      }
      const p = page(),
        q = current();
      if (p.responses[q.id]) return { duplicate: true };
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
        inputError =
          'Choose a row, reason and corrected step for each error. Select each error row once.';
        publish();
        return { invalid: true };
      }
      inputError = '';
      const before = p.level,
        level = p.items[selected].level,
        assisted = Boolean(p.assisted[q.id]);
      const response = {
        raw: draft.answer,
        correct: result.correct,
        assisted,
        entries: structuredClone(draft.errors),
        details: result.details,
        answerCorrect: result.answerCorrect ?? numeric.correct,
      };
      p.responses[q.id] = response;
      if (['plain', 'errors'].includes(mode))
        submit(track(), p, { id: q.id, level, correct: result.correct, assisted });
      else {
        p.count++;
        p.complete = p.count === p.size;
      }
      topic().history.push({
        attempt: p.attempt,
        ...(activeSet()
          ? {
              practiceCode: activeSet().code,
              practicePage: activeSet().index,
              authoredSlot: p.authoredSlot,
            }
          : {}),
        question: q.id,
        pageSize: p.size,
        revision: bank.revision,
        type: mode,
        level,
        correct: result.correct,
        assisted,
        at: now(),
      });
      if (before !== p.level && !p.complete) replaceRemaining(p.level > before);
      message =
        !paper && draft.points < 8 && !draft.working.trim()
          ? 'Remember to show your working. You can draw, type or use paper.'
          : '';
      const next = result.correct
        ? Array.from(
            { length: p.items.length - 1 },
            (_, offset) => (selected + offset + 1) % p.items.length,
          ).find((i) => !p.responses[p.items[i].id])
        : undefined;
      if (next !== undefined) {
        selected = next;
        resetDraft();
        if (reference) assist();
        message = `Correct. Moving to question ${selected + 1}.`;
      }
      const run = activeSet();
      if (run && run.config.pages.every((_, index) => run.attempts[index]?.complete))
        run.finished = 'complete';
      if (completeRecommendation(profile, run, now()))
        message = 'Well done! Your focused practice will help your grades.';
      publish(true);
      return { advanced: next !== undefined, correct: result.correct };
    },
    /**
     * Start another ordinary activity page; active practice sets use their own navigation.
     * Calls: activeSet, resetDraft, createPage, publish.
     */
    nextPage() {
      if (activeSet()) return;
      selected = 0;
      reference = false;
      resetDraft();
      createPage();
      message = '';
      publish();
    },
    /**
     * Validate a code and initialize or resume its learner-owned practice-set attempt.
     * Parameter raw: untrusted input text.
     * Parameter recommendationId: owning revision recommendation ID, if any.
     * Calls: restoreSet, ensurePage, publish, decodePracticeSet, encodePracticeSet, enterSetPage.
     * @example startPracticeSet(raw, recommendationId);
     */
    startPracticeSet(raw, recommendationId = null) {
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
        resolvePracticePage(catalogue, banks, entry, effectiveLevel(entry, config), () => 0),
      );
      const started = now();
      profile.practiceSet = {
        active: true,
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
     * @example goSetPage(index);
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
     * Return to ordinary assessment while retaining the saved set.
     * Calls: activeSet, resetDraft, ensurePage, publish.
     */
    leavePracticeSet() {
      if (activeSet()) activeSet().active = false;
      bank = homeBank;
      mode = 'assessment';
      selected = 0;
      reference = false;
      message = '';
      resetDraft();
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
