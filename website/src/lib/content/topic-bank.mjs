/** Assemble the canonical topic files without changing their authored questions.
 * Used by the Vite server/prerender loader and Node validation tools.
 * File roles are fixed here; builds never write back to these source files.
 */
export const TOPIC_FILES = [
  'topic',
  'method',
  'concepts',
  'demos',
  'recap',
  'assessment-examples',
  'scaffolded',
  'error-types',
  'spot-errors',
  'practice',
  'problem-solving',
  'retired-questions',
];

export function assembleTopic(parts) {
  for (const file of TOPIC_FILES)
    if (!Object.hasOwn(parts, file)) throw Error(`Missing topic content: ${file}.json`);
  const questions = [
    ...parts['assessment-examples'],
    ...parts.demos,
    ...parts.scaffolded,
    ...resolveInvestigations(parts['spot-errors'], parts['error-types']),
    ...parts.practice,
    ...parts['problem-solving'].questions,
  ];
  return {
    ...parts.topic,
    teaching: {
      ...resolveTeaching(parts.method, parts.concepts),
      examples: resolveMethodExamples(parts.method, questions, parts.recap, parts.topic.method),
      errorReasons: parts['error-types'].legacyReasons ?? [],
    },
    ...(parts.recap === null ? {} : { recap: parts.recap }),
    problemTeaching: parts['problem-solving'].teaching,
    questions,
    retiredQuestions: parts['retired-questions'],
  };
}

/** Resolve example references and require a demonstrated use of every applicable sub-method. */
export function resolveMethodExamples(method, questions, recaps, renderer) {
  const levels = ['start', 'build', 'confidence'];
  const text = (value) => typeof value === 'string' && value.trim();
  if (!text(method.name) || !method.submethods || !method.examples)
    throw Error('Incomplete method specification');
  for (const [key, spec] of Object.entries(method.submethods)) {
    if (
      ![spec.name, spec.when, spec.check].every(text) ||
      !spec.steps?.length ||
      !spec.steps.every(text) ||
      !spec.levels?.length ||
      !spec.levels.every((level) => levels.includes(level))
    )
      throw Error(`Incomplete sub-method: ${key}`);
  }
  return Object.fromEntries(
    levels.map((level, index) => {
      const examples = method.examples[level];
      if (!Array.isArray(examples) || examples.length < 2)
        throw Error(`At least two method examples required: ${level}`);
      const keys = new Set(),
        names = new Set(),
        covered = new Set();
      const resolved = examples.map((example) => {
        if (
          !text(example.key) ||
          !text(example.name) ||
          /worked example/i.test(example.name) ||
          keys.has(example.key) ||
          names.has(example.name) ||
          !Array.isArray(example.submethods)
        )
          throw Error(`Invalid method example name/key: ${level}`);
        keys.add(example.key);
        names.add(example.name);
        for (const key of example.submethods) {
          if (!method.submethods[key]?.levels.includes(level))
            throw Error(`Unknown or inapplicable sub-method: ${key}`);
          covered.add(key);
        }
        if (Boolean(example.question) === (example.recap !== undefined))
          throw Error(`Ambiguous example source: ${example.key}`);
        const question = example.question
          ? questions.find((q) => q.id === example.question)
          : recaps?.[example.recap];
        if (
          !question ||
          question.investigation ||
          question.type === 'errors' ||
          (question.level !== undefined && question.level !== index) ||
          (example.recap !== undefined && example.recap !== index)
        )
          throw Error(`Invalid example source: ${example.key}`);
        if (
          !renderer &&
          (!question.balance?.length ||
            example.annotations?.length !== question.balance.length ||
            !example.annotations.every(text))
        )
          throw Error(`Incomplete equation narration: ${example.key}`);
        if (renderer === 'calculation' && !question.steps?.length)
          throw Error(`Missing calculation steps: ${example.key}`);
        return { ...example, question };
      });
      for (const [key, spec] of Object.entries(method.submethods))
        if (spec.levels.includes(level) && !covered.has(key))
          throw Error(`Missing ${level} example for ${key}`);
      return [level, resolved];
    }),
  );
}

/** Resolve concept references once, rejecting incomplete help or misspelled keys at build time. */
export function resolveTeaching(teaching, concepts) {
  for (const [key, help] of Object.entries(concepts)) {
    if (
      ![help.title, help.explanation, help.guidance].every(
        (text) => typeof text === 'string' && text.trim(),
      ) ||
      !Array.isArray(help.examples) ||
      !help.examples.length ||
      !help.examples.every((text) => typeof text === 'string' && text.trim())
    )
      throw Error(`Incomplete concept: ${key}`);
  }
  const resolve = (guide) => ({
    ...guide,
    steps: guide.steps.map((step) => {
      if (typeof step === 'string') return step;
      if (!Array.isArray(step) || !step.length) throw Error('Invalid method step');
      return step.map((part) => {
        if (typeof part === 'string') return part;
        if (
          !Object.hasOwn(concepts, part.concept) ||
          typeof part.text !== 'string' ||
          !part.text.trim()
        )
          throw Error(`Invalid method concept: ${part.concept}`);
        return { ...part, help: concepts[part.concept] };
      });
    }),
  });
  return {
    ...teaching,
    guidance: {
      default: resolve(teaching.guidance.default),
      byLevel: Object.fromEntries(
        Object.entries(teaching.guidance.byLevel).map(([key, guide]) => [key, resolve(guide)]),
      ),
    },
  };
}

/** Expand shared reason templates at the content boundary, retaining saved choice IDs. */
export function resolveInvestigations(questions, catalog) {
  for (const [code, type] of Object.entries(catalog.types)) {
    if (!type.name || !type.example || !type.repairs?.length)
      throw Error(`Incomplete error type: ${code}`);
    for (const ref of type.repairs)
      if (!Object.hasOwn(catalog.reasons, ref)) throw Error(`Unknown repair ${ref} for ${code}`);
  }
  function reason(reference) {
    const [ref, ...values] = Array.isArray(reference) ? reference : [reference];
    const template = catalog.reasons[ref];
    if (typeof template !== 'string') throw Error(`Unknown error reason: ${ref}`);
    const used = new Set();
    const text = template.replace(/\{(\d+)\}/g, (_, index) => {
      if (typeof values[index] !== 'string') throw Error(`Missing value ${index} for ${ref}`);
      used.add(Number(index));
      return values[index];
    });
    if (used.size !== values.length) throw Error(`Unused values for ${ref}`);
    return text;
  }
  return questions.map((question) => ({
    ...question,
    options: Object.entries(question.options).map(([id, reference]) => ({
      id,
      text: reason(reference),
    })),
    errors: question.errors.map((error) => {
      if (!catalog.types[error.misconception]?.name)
        throw Error(`Unknown error type: ${error.misconception}`);
      const choice = question.options[error.reason];
      const ref = Array.isArray(choice) ? choice[0] : choice;
      if (!catalog.types[error.misconception].repairs.includes(ref))
        throw Error(`Unlisted repair for ${error.misconception} in ${question.id}`);
      return { ...error, feedback: reason(error.feedback) };
    }),
  }));
}

/** A named level replaces the whole default guide; shared wording is authored once. */
export function guidanceFor(teaching, level) {
  const name = ['start', 'build', 'confidence'][level];
  return teaching.guidance.byLevel[name] ?? teaching.guidance.default;
}
