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

/** A portable session: inputs and persistence are injected; no DOM or Svelte dependencies.
 * Immutable view snapshots let rendering observe changes without owning stored state.
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
  const homeBank = bank;
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
  const question = (id) => bank.questions.find((q) => q.id === id);
  const pool = (type, level) =>
    bank.questions.filter((q) => q.type === type && (level === undefined || q.level === level));
  const scope = () => `${bank.subject}:${bank.topic}`;
  const topic = () => (profile.topics[scope()] ??= { tracks: {}, pages: {}, history: [] });
  const activeSet = () => (profile?.practiceSet?.active ? profile.practiceSet : null);
  const track = () => (topic().tracks[mode] ??= newTrack());
  const page = () =>
    activeSet()
      ? activeSet().attempts[activeSet().index]
      : profile
        ? topic().pages[mode]
        : undefined;
  function storePage(value) {
    if (activeSet()) activeSet().attempts[activeSet().index] = value;
    else topic().pages[mode] = value;
  }
  function effectiveLevel(entry, config) {
    const target = catalogue.topics.find((topic) => topic.code === entry.topic);
    const type = PAGE_TYPES.find((type) => type.id === entry.type);
    return (
      profile.topics[`${catalogue.subject}:${target?.bank}`]?.tracks[type?.mode]?.level ??
      config.level
    );
  }
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
  function timeExpired() {
    const run = activeSet();
    if (!run || run.finished || !run.deadline || now() < run.deadline) return false;
    run.finished = 'expired';
    message = 'Time is up. Submitted answers are saved; unanswered questions are not scored.';
    return true;
  }
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
  const current = () => question(page()?.items[selected]?.id);
  function freshDraft() {
    return { answer: '', errors: [], working: '', strokes: [], points: 0 };
  }
  function resetDraft() {
    draft = freshDraft();
    draftKey++;
    inputError = '';
  }
  // Revision checks affect only this subject/topic; other activities remain isolated.
  for (const p of data.profiles)
    for (const [key, attempt] of Object.entries(p.topics[scope()]?.pages ?? {})) {
      if (attempt.revision !== bank.revision) delete p.topics[scope()].pages[key];
    }
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
  function ensurePage() {
    if (profile && mode !== 'demo' && !page()) createPage();
  }
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
  function assist() {
    const q = current();
    if (q && !page().responses[q.id]) page().assisted[q.id] = true;
  }
  function snapshot() {
    return {
      bank,
      profile: profile ? { name: profile.name, key: profile.key } : null,
      progress: Object.entries(profile?.topics ?? {}).map(([key, value]) => ({
        key,
        tracks: structuredClone(value.tracks),
        submissions: value.history.length,
      })),
      demoSpeed: profile?.settings?.demoSpeed ?? 1,
      practiceSet: activeSet()
        ? {
            code: activeSet().code,
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
  function publish(persist = false) {
    if (persist) save(data);
    const value = snapshot();
    for (const fn of listeners) fn(value);
  }
  restoreSet();
  ensurePage();
  return {
    subscribe(fn) {
      listeners.add(fn);
      fn(snapshot());
      return () => listeners.delete(fn);
    },
    chooseName(name, create = false) {
      const result = chooseProfile(data, name, create);
      if (!result.profile) return result;
      profile = result.profile;
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
    select(index) {
      if (selected === index) return;
      selected = index;
      resetDraft();
      message = '';
      if (reference) assist();
      publish(true);
    },
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
    setReference(open) {
      reference = open;
      if (open) {
        assist();
        demoLevel = page().items[selected].level;
      }
      publish(true);
    },
    setDemoSpeed(speed) {
      if (!profile || ![0.5, 1, 1.5, 2].includes(speed)) return;
      profile.settings = { ...profile.settings, demoSpeed: speed };
      publish(true);
    },
    setDemoLevel(level) {
      demoLevel = level;
      publish();
    },
    hint() {
      assist();
      message =
        'Keep both sides balanced: use the same inverse operation on each side. This answer will be recorded as assisted.';
      publish(true);
    },
    setPaper(value) {
      paper = value;
      publish();
    },
    updateDraft(patch) {
      Object.assign(draft, patch);
      publish();
    },
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
        inputError = 'Enter a number, decimal or fraction (for example −3, 2.5 or 5/2).';
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
      publish(true);
      return { advanced: next !== undefined, correct: result.correct };
    },
    nextPage() {
      if (activeSet()) return;
      selected = 0;
      reference = false;
      resetDraft();
      createPage();
      message = '';
      publish();
    },
    startPracticeSet(raw) {
      if (!profile || !catalogue) throw Error('Choose your name before opening a Practice set.');
      const config = decodePracticeSet(raw);
      // Validate the whole recipe before replacing any current attempt.
      config.pages.forEach((entry) =>
        resolvePracticePage(catalogue, banks, entry, effectiveLevel(entry, config), () => 0),
      );
      const started = now();
      profile.practiceSet = {
        active: true,
        code: encodePracticeSet(config),
        config,
        index: 0,
        attempts: [],
        started,
        deadline: TIMINGS[config.timing] ? started + TIMINGS[config.timing] * 60000 : null,
        finished: null,
      };
      message = '';
      enterSetPage();
      publish(true);
    },
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
    resumePracticeSet() {
      if (!profile?.practiceSet) return;
      profile.practiceSet.active = true;
      restoreSet();
      ensurePage();
      publish(true);
    },
    tick() {
      const run = activeSet();
      if (run?.deadline && !run.finished) publish(timeExpired());
    },
    resolvePromotion(accept) {
      resolveChoice(track(), page(), accept);
      publish(true);
    },
  };
}
