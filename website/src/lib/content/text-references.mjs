/**
 * Purpose: Resolve readable shared phrases and stage defaults without changing authored text.
 * Dictionaries contain complete phrases, never nested references or executable expressions.
 *
 * Main contents:
 * - expandText, expandParts, topicPayload.
 *
 * Used By: topic-bank.mjs, topic-runtime.mjs, server/topic-banks.mjs and read-topic-bank.mjs.
 *
 * Uses: no local modules.
 *
 * Libs: none.
 */

/** Expand textRef objects recursively; named values must exactly match template placeholders.
 * Called by the full assembler and selected-question resolver. Literal strings stay literal.
 * @example expandText({ textRef: 'divide', values: { divisor: '4' } }, { divide: 'Divide by {divisor}.' });
 */
export function expandText(value, phrases) {
  if (Array.isArray(value)) {
    const expanded = value.map((item) => expandText(item, phrases));
    return expanded.every((item, index) => item === value[index]) ? value : expanded;
  }
  if (!value || typeof value !== 'object') return value;
  if (Object.hasOwn(value, 'textRef')) {
    const template = phrases[value.textRef];
    if (!Object.hasOwn(phrases, value.textRef) || typeof template !== 'string')
      throw Error(`Unknown text reference: ${value.textRef}`);
    if (Object.keys(value).some((key) => !['textRef', 'values'].includes(key)))
      throw Error(`Unexpected text reference field: ${value.textRef}`);
    const values = value.values ?? {};
    const used = new Set();
    const text = template.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (_, key) => {
      if (!Object.hasOwn(values, key) || !['string', 'number'].includes(typeof values[key]))
        throw Error(`Missing text value ${key} for ${value.textRef}`);
      used.add(key);
      return String(values[key]);
    });
    if (Object.keys(values).some((key) => !used.has(key)))
      throw Error(`Unused text value for ${value.textRef}`);
    return text;
  }
  const entries = Object.entries(value).map(([key, item]) => [key, expandText(item, phrases)]);
  // Reuse unchanged diagrams/working; expanding wording must not retain duplicate geometry.
  return entries.every(([key, item]) => item === value[key]) ? value : Object.fromEntries(entries);
}

/** Apply defaults only to question arrays in the named source part, then expand its phrases.
 * Full build/Node audits call this; overrides replace complete fields, never concatenate arrays.
 * Calls expandText. Example: expandParts(parts).practice returns full practice records.
 */
export function expandParts(parts) {
  const { phrases, defaults } = parts.text;
  if (!phrases || !defaults || Object.values(phrases).some((text) => typeof text !== 'string'))
    throw Error('Invalid text dictionary');
  const stages = [
    'recap',
    'demos',
    'assessment-examples',
    'scaffolded',
    'practice',
    'spot-errors',
    'problem-solving',
  ];
  const fields = [
    'subject',
    'topic',
    'type',
    'method',
    'prose',
    'source',
    'investigation',
    'instruction',
    'prompt',
    'hint',
    'method_note',
    'repair',
    'check',
    'error_note',
  ];
  for (const [stage, values] of Object.entries(defaults))
    if (
      !stages.includes(stage) ||
      !values ||
      Array.isArray(values) ||
      typeof values !== 'object' ||
      Object.keys(values).some((key) => !fields.includes(key))
    )
      throw Error(`Invalid question defaults: ${stage}`);
  return Object.fromEntries(
    Object.entries(parts).map(([name, value]) => {
      if (name === 'text') return [name, value];
      const inherit = (question) => {
        const inherited = { ...defaults[name], ...question };
        // Selection and identity work before text expansion; mathematical inputs stay explicit.
        for (const key of [
          'id',
          'subject',
          'topic',
          'type',
          'level',
          'method',
          'prose',
          'a',
          'b',
          'q',
          'answer',
        ])
          if (inherited[key] && typeof inherited[key] === 'object')
            throw Error(`Keep ${key} literal in ${name}`);
        return inherited;
      };
      const inherited =
        name === 'problem-solving'
          ? { ...value, questions: value.questions.map(inherit) }
          : Array.isArray(value)
            ? value.map(inherit)
            : value;
      return [name, expandText(inherited, phrases)];
    }),
  );
}

/** Package canonical parts with only the shared phrases they use. Server/Node readers supply
 * the shared dictionary; the resulting topic is self-contained for browser caching.
 * @example topicPayload(parts, sharedPhrases).parts.text.phrases;
 */
export function topicPayload(parts, sharedPhrases = {}) {
  const phrases = { ...sharedPhrases, ...parts.text.phrases };
  const used = new Set();
  const collect = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Object.hasOwn(value, 'textRef')) used.add(value.textRef);
    for (const item of Object.values(value)) collect(item);
  };
  for (const [name, part] of Object.entries(parts)) if (name !== 'text') collect(part);
  collect(parts.text.defaults);
  const selected = Object.fromEntries(
    [...used].sort().map((key) => {
      if (!Object.hasOwn(phrases, key) || typeof phrases[key] !== 'string')
        throw Error(`Unknown text reference: ${key}`);
      return [key, phrases[key]];
    }),
  );
  return {
    format: 'topic-parts-1',
    parts: { ...parts, text: { ...parts.text, phrases: selected } },
  };
}
