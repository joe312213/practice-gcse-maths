/**
 * Purpose: Resolve shared stage copy with field-level topic overrides; never evaluate authored
 * strings. Used by PracticeActivity. Topic metadata may override intro/note for an individual
 * stage.
 *
 * Main contents:
 * - stageTextFor.
 *
 * Used By: tests/topic-content.test.mjs, website/scripts/browser/error-investigation-checks.mjs,
 * website/src/lib/components/practice/PracticeActivity.svelte.
 *
 * Uses: website/static/data/defaults.json.
 *
 * Libs: none.
 */
import defaults from '../../../static/data/defaults.json' with { type: 'json' };
/** Return the introduction/note for a bank, activity mode and page size. Called by PracticeActivity and browser assertions; does not change scoring. */
export function stageTextFor(bank, mode, questionCount) {
  // Saved progress uses 'assessment'; editable copy names the student-facing stage.
  const key = mode === 'assessment' ? 'initialAssessment' : mode;
  const text = {
    ...defaults.stageText.practice,
    ...defaults.stageText[key],
    ...bank.stageText?.[key],
  };
  return {
    intro: text.intro.replaceAll('{questionCount}', String(questionCount)),
    note: text.note?.replaceAll('{questionCount}', String(questionCount)) ?? '',
  };
}
