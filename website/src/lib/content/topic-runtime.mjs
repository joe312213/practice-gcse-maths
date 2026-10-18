/**
 * Purpose: Open a compact topic without expanding every question. Selection metadata stays
 * available; page questions and the selected demo resolve through one bounded content cache.
 *
 * Main contents:
 * - openTopic, resolveQuestion, exampleQuestion.
 *
 * Used By: adapters/storage.mjs, domain/topic-pages.mjs, teaching/DemoPlayer.svelte and tests.
 *
 * Uses: topic-bank.mjs (teaching/error resolution), text-references.mjs (shared phrases).
 *
 * Libs: none.
 */
import { resolveTeaching, resolveInvestigations } from './topic-bank.mjs';
import { expandText } from './text-references.mjs';

const contexts = new WeakMap();
// Two maximum-size practice pages across all loaded topics; old expanded content is evicted.
const resolvedQuestions = new Map();
const QUESTION_CACHE_LIMIT = 24;

/** Resolve one selected record, retaining stable identity while it is in the recent-page cache.
 * Ordinary expanded Node fixtures pass through unchanged. Called by findQuestion and demos.
 * Calls expandText/resolveInvestigations. Example: resolveQuestion(bank.questions[0]).hint.
 */
export function resolveQuestion(question) {
  const context = contexts.get(question);
  if (!context) return question;
  let resolved = resolvedQuestions.get(question);
  if (resolved) resolvedQuestions.delete(question);
  else {
    resolved = expandText(question, context.phrases);
    if (resolved.investigation) [resolved] = resolveInvestigations([resolved], context.catalog);
  }
  resolvedQuestions.set(question, resolved);
  if (resolvedQuestions.size > QUESTION_CACHE_LIMIT)
    resolvedQuestions.delete(resolvedQuestions.keys().next().value);
  return resolved;
}

/** Open a validated build payload; only small teaching material expands at startup.
 * Question records retain references and inherit stage defaults. Shared raw records also work
 * in combined banks because their resolution context follows object identity.
 * @example const bank = openTopic(await response.json());
 */
export function openTopic(payload) {
  if (payload.format !== 'topic-parts-1' || !payload.parts?.text)
    throw Error('The question bank format is invalid.');
  const parts = payload.parts;
  const { phrases, defaults } = parts.text;
  const context = { phrases, catalog: expandText(parts['error-types'], phrases) };
  const records = (name, items = parts[name]) =>
    items.map((item) => {
      const question = { ...defaults[name], ...item };
      contexts.set(question, context);
      return question;
    });
  const questions = [
    ...records('assessment-examples'),
    ...records('demos'),
    ...records('scaffolded'),
    ...records('spot-errors'),
    ...records('practice'),
    ...records('problem-solving', parts['problem-solving'].questions),
  ];
  const method = expandText(parts.method, phrases);
  const teaching = resolveTeaching(method, expandText(parts.concepts, phrases));
  return {
    ...expandText(parts.topic, phrases),
    teaching: { ...teaching, errorReasons: context.catalog.legacyReasons ?? [] },
    ...(parts.recap === null ? {} : { recap: records('recap') }),
    problemTeaching: expandText(parts['problem-solving'].teaching, phrases),
    questions,
    retiredQuestions: records('retired-questions'),
  };
}

/** Resolve only the chosen named demo; full Node banks already embed its question object. */
export function exampleQuestion(bank, example) {
  return typeof example.question === 'object'
    ? example.question
    : resolveQuestion(
        example.question
          ? bank.questions.find((question) => question.id === example.question)
          : bank.recap?.[example.recap],
      );
}
