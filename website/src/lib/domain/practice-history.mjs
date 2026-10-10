/** Weekly views derive from durable answers and measured time; no stored percentages or inferred old timing. */
import { weekKey } from './progress.mjs';
export function practiceHistory(profile, scope = '', mode = 'plain', now = Date.now()) {
  const weeks = new Map();
  const row = (at) => {
    const key = weekKey(at);
    if (!weeks.has(key))
      weeks.set(key, {
        week: key,
        milliseconds: 0,
        answered: 0,
        levels: Array.from({ length: 4 }, () => ({ correct: 0, scored: 0 })),
      });
    return weeks.get(key);
  };
  // Noon UTC on the previous Monday avoids ambiguity around UK clock changes.
  const current = weekKey(now);
  const previous = Date.parse(`${current}T12:00:00Z`) - 7 * 86400000;
  row(now);
  row(previous);
  for (const [key, topic] of Object.entries(profile.topics)) {
    if (scope && scope !== key) continue;
    for (const item of topic.history) {
      const week = row(item.at);
      week.answered++;
      if (item.type === mode && (!item.correct || !item.assisted)) {
        const level = week.levels[item.level];
        level.scored++;
        if (item.correct) level.correct++;
      }
    }
    for (const item of topic.practice ?? []) row(item.at).milliseconds += item.milliseconds;
  }
  return [...weeks.values()].sort((a, b) => b.week.localeCompare(a.week));
}
