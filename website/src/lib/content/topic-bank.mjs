/** Assemble the canonical topic files without changing their authored questions.
 * Used by the Vite server/prerender loader and Node validation tools.
 * File roles are fixed here; builds never write back to these source files.
 */
export const TOPIC_FILES = [
  'topic',
  'teaching',
  'demos',
  'recap',
  'assessment-examples',
  'scaffolded',
  'spot-errors',
  'practice',
  'problem-solving',
  'retired-questions',
];

export function assembleTopic(parts) {
  for (const file of TOPIC_FILES)
    if (!Object.hasOwn(parts, file)) throw Error(`Missing topic content: ${file}.json`);
  return {
    ...parts.topic,
    teaching: parts.teaching,
    ...(parts.recap === null ? {} : { recap: parts.recap }),
    problemTeaching: parts['problem-solving'].teaching,
    questions: [
      ...parts['assessment-examples'],
      ...parts.demos,
      ...parts.scaffolded,
      ...parts['spot-errors'],
      ...parts.practice,
      ...parts['problem-solving'].questions,
    ],
    retiredQuestions: parts['retired-questions'],
  };
}

/** A named level replaces the whole default guide; shared wording is authored once. */
export function guidanceFor(teaching, level) {
  const name = ['start', 'build', 'confidence'][level];
  return teaching.guidance.byLevel[name] ?? teaching.guidance.default;
}
