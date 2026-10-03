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

/** A portable session: inputs and persistence are injected; no DOM or Svelte dependencies.
 * Immutable view snapshots let rendering observe changes without owning stored state.
 */
export function createSession({
  bank,
  data,
  save,
  random = Math.random,
  uuid = () => crypto.randomUUID(),
  now = Date.now,
}) {
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
  const topicKey = `${bank.subject}:${bank.topic}`;
  const topic = () => (profile.topics[topicKey] ??= { tracks: {}, pages: {}, history: [] });
  const track = () => (topic().tracks[mode] ??= newTrack());
  const page = () => (profile ? topic().pages[mode] : undefined);
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
    for (const [key, attempt] of Object.entries(p.topics[topicKey]?.pages ?? {})) {
      if (attempt.revision !== bank.revision) delete p.topics[topicKey].pages[key];
    }
  function createPage() {
    const t = track(),
      size = mode === 'plain' ? 10 : mode === 'errors' ? 3 : mode === 'assessment' ? 4 : 2;
    const p = {
      ...newPage(size, t.level),
      startLevel: t.level,
      revision: bank.revision,
      attempt: uuid(),
      items: [],
      assisted: {},
      responses: {},
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
    p.items = (mode === 'assessment' ? candidates : available.slice(0, size)).map((q) => ({
      id: q.id,
      level: q.level,
    }));
    topic().pages[mode] = p;
    paper = false;
    save(data);
  }
  function ensurePage() {
    if (profile && mode !== 'demo' && !page()) createPage();
  }
  function replaceRemaining(promoted = false) {
    const p = page();
    const candidates = pool(mode, p.level).filter(
      (q) => !p.items.some((i) => Object.hasOwn(p.responses, i.id) && i.id === q.id),
    );
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
      demoSpeed: profile?.settings?.demoSpeed ?? 1,
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
      mode = 'assessment';
      selected = 0;
      reference = false;
      paper = false;
      message = '';
      resetDraft();
      ensurePage();
      publish(true);
      return result;
    },
    switchMode(next) {
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
      publish(true);
      return { advanced: next !== undefined, correct: result.correct };
    },
    nextPage() {
      selected = 0;
      reference = false;
      resetDraft();
      createPage();
      message = '';
      publish();
    },
    resolvePromotion(accept) {
      resolveChoice(track(), page(), accept);
      publish(true);
    },
  };
}
