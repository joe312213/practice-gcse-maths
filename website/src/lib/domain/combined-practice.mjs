/** Combined pages reuse source questions and keep their identities for marking and attribution. */
import { topicPriority } from './revision.mjs';
import { topicProgress } from './progress.mjs';
export const COMBINED_CODE = 31;

export function combinedBank(banks) {
  return {
    subject: banks[0].subject,
    topic: 'combined',
    title: 'Combined problems',
    combined: true,
    method: 'calculation',
    revision: banks.map((b) => b.revision).join('|'),
    questions: banks.flatMap((b) => b.questions),
    problemTeaching:
      banks.find((b) => b.topic === 'M03')?.problemTeaching ?? banks[0].problemTeaching,
  };
}

/** Round-robin across chosen topics, ordered by the shared revision policy; randomise questions within each. */
export function combinedQuestions(
  banks,
  catalogue,
  level,
  mode,
  { topics, profile } = {},
  random = Math.random,
) {
  const scores = new Map(
    profile
      ? topicProgress(profile, catalogue).map((row) => [row.topic.bank, topicPriority(row)])
      : [],
  );
  const pools = banks
    .filter((bank) => !topics || topics.includes(bank.topic))
    .map((bank) => ({
      bank: bank.topic,
      questions: bank.questions.filter(
        (q) => q.level === level && q.type === (mode === 'mixed' ? 'plain' : 'problem'),
      ),
    }))
    .filter((pool) => pool.questions.length)
    .sort((a, b) => (scores.get(b.bank) ?? 0) - (scores.get(a.bank) ?? 0));
  if (pools.length < 2) throw Error('Choose at least two available topics for combined practice.');
  for (const pool of pools) {
    for (let i = pool.questions.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [pool.questions[i], pool.questions[j]] = [pool.questions[j], pool.questions[i]];
    }
  }
  return Array.from(
    { length: mode === 'mixed' ? 10 : 6 },
    (_, i) => pools[i % pools.length].questions[Math.floor(i / pools.length)]?.id,
  ).filter(Boolean);
}
