"""Purpose: Prove the live-content quality guards reject the specific weaknesses found
in the teaching audit, using isolated mutations rather than rewriting bank files.

Main contents:
- bank: adapt live investigation records to the quality-check contract.
- QualityRegressions: challenge-level, operation-variety and distractor mutations.

Used By: tests/spot-error-drafts.test.mjs in the change-selected logic suite.

Uses: scripts/review_spot_error_drafts.py and scripts/spot_error_quality.py.

Libs: unittest for rejection assertions; copy/pathlib/sys for isolated fixtures/imports.

Usage and output: python3 tests/spot_error_quality_test.py prints test results and
returns a failing status on regression. Reads the live banks; writes no content.
"""
import copy
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from review_spot_error_drafts import calculate, answer_value, live_banks
from spot_error_quality import check_quality


def bank(name, topic):
    """Map a folder and topic ID to author-facing levels; calls live_banks for reject fixtures."""
    data = [q for q in live_banks()[name]['questions'] if q.get('investigation')]
    return dict(topic=topic, questions=[dict(q, level=q['level'] + 1, prompt=q['q'], unit=q['answerUnit']) for q in data])


class QualityRegressions(unittest.TestCase):
    def reject(self, name, topic, mutate, message):
        """Mutate a fresh bank and require check_quality to reject it with the expected rule."""
        data = bank(name, topic)
        mutate(data['questions'])
        with self.assertRaisesRegex(AssertionError, message):
            check_quality(data, calculate, answer_value)

    def test_division_cannot_relabel_easy_work_as_confidence(self):
        def mutate(qs):
            easy = copy.deepcopy(qs[0]); easy['level'] = 3
            qs[-1] = easy
        self.reject('bus-stop-division', 'M02', mutate, 'two-digit divisor')

    def test_equation_answer_checked_against_original_not_just_stored_expression(self):
        self.reject('solving-equations', 'M10', lambda qs: qs[0].update(answer='123', answerCheck={'expression': '123'}), 'original equation')

    def test_fraction_confidence_requires_both_denominators_to_change(self):
        self.reject('fraction-addition-subtraction', 'M15', lambda qs: qs[-1].update(prompt='Work out 1/3 + 1/6.', answer='1/2'), 'both fractions need conversion')

    def test_signed_repetition_is_rejected(self):
        def mutate(qs):
            source = copy.deepcopy(qs[-1])
            for q in qs:
                if q['level'] == 3:
                    q.update(source)
        self.reject('signed-addition-subtraction', 'M13', mutate, 'intermediate results')

    def test_percentage_change_must_include_both_directions(self):
        def mutate(qs):
            source = next(q for q in qs if q['level'] == 3 and 'increase' in q['prompt'])
            for q in qs:
                if q['level'] == 3:
                    q.update(copy.deepcopy(source))
        self.reject('percentages', 'M06', mutate, 'increases and decreases')

    def test_reverse_confidence_requires_fixed_adjustment(self):
        self.reject('reverse-percentages', 'M07', lambda qs: qs[-1].update(prompt='An item costs £80 after a 20% reduction.'), 'fixed addition')

    def test_applications_need_linked_work(self):
        self.reject('multiplication-division-problems', 'M03', lambda qs: qs[-1].update(answerCheck={'expression': '10'}), 'linked operations')

    def test_ratio_linked_mix_is_preserved(self):
        self.reject('ratios', 'M04', lambda qs: qs[-1].update(prompt='Share £140 in the ratio 2:5. Find the second share.'), '8/12')

    def test_average_speed_distractor_must_actually_be_wrong(self):
        def mutate(qs):
            q = next(q for q in qs if any(e['misconception'] == 'T7' for e in q['errors']))
            q['prompt'] = 'Travel at 30 km/h for 2 hours, then at 60 km/h for 2 hours.'
        self.reject('speed-distance-time', 'M12', mutate, 'equal durations')


if __name__ == '__main__':
    unittest.main()
