"""Purpose: Reconstruct the historical M10 equation import using exact arithmetic and stable source
IDs. Its output is an isolated comparison candidate, never a replacement for the reviewed live
topic folder.

Main contents:
- verify_answer: Check a question's exact solution against its coefficients, when provided.
- prepare_bank: Build and validate an M10 candidate from historical source JSON, with no writes.
- main: Prepare the reference bank, then call write_candidates to output it for review only.

Used By: optional manual reference reconstruction; never routine website builds.

Uses: content/M10*.json, web_assessments.json, bank_candidates.py.

Libs: Python standard library for exact fractions, hashing and JSON. No PowerPoint dependency.

Usage and output: From repository root: python3 scripts/prepare_web_equations.py. Reads
content/M10*.json and web_assessments.json; writes candidates only through write_candidates.
"""
from pathlib import Path
from fractions import Fraction
from hashlib import sha256
import json
from bank_candidates import write_candidates

ROOT = Path(__file__).resolve().parents[1]


def verify_answer(question):
    """Check a question's exact solution against its coefficients, when provided.

    Called by prepare_bank for original and additional questions.
    Example: verify_answer({'coefficients': [2, 1, 0, 5], 'answer': '2'})
    """
    if 'coefficients' not in question:
        return
    left_coefficient, left_constant, right_coefficient, right_constant = map(
        Fraction, question['coefficients']
    )
    answer = Fraction(question['answer'])
    assert left_coefficient * answer + left_constant == right_coefficient * answer + right_constant, question


def prepare_bank():
    """Build and validate an M10 candidate from historical source JSON, with no writes.

    Calls verify_answer; used by main. Current bank refinements may supersede this candidate.
    Example: candidate = prepare_bank(); print(len(candidate['questions']))  # 97
    """
    sources = ['M10_equations.json', 'M10_web_recap.json', 'M10_web_teaching.json', 'web_assessments.json']
    source, recap, teaching, assessments = [
        json.loads((ROOT / 'content' / name).read_text()) for name in sources
    ]
    questions = []

    def add(question, identifier, kind, level):
        """Validate and append one source question with its stable bank ID/type/level.

        Calls verify_answer; used by prepare_bank's source-section loops.
        """
        verify_answer(question)
        questions.append({**question, 'id': f'maths:{identifier}', 'subject': 'maths',
                          'topic': 'M10', 'type': kind, 'level': level})

    for index, question in enumerate(source['assessment']):
        add(question, f'M10-IA-Q{index + 1}', 'assessment', [0, 0, 1, 2][index])
    for level, question in enumerate(source['demo']):
        add(question, f'M10-S01-C{level + 1}-Q1', 'demo', level)
    for section, row in enumerate(source['practice'], 2):
        for level, question in enumerate(row):
            add(question, f'M10-S{section:02}-C{level + 1}-Q1', 'scaffolded', level)
    for section, columns in enumerate(source['banks'], 4):
        for level, column in enumerate(columns):
            for index, question in enumerate(column):
                add(question, f'M10-S{section:02}-C{level + 1}-Q{index + 1}', 'plain', level)
    for level, column in enumerate(source['errors']):
        for index, question in enumerate(column):
            add(question, f'M10-SE-C{level + 1}-Q{index + 1}', 'errors', level)
    assert len(questions) == 94 and len({question['id'] for question in questions}) == 94
    for index, question in enumerate(assessments['M10'], 5):
        add(question, f'M10-IA-Q{index}', 'assessment', question['level'])
    for question in questions:
        if question['type'] == 'errors':
            question.update(teaching['errorAnnotations'][question['id']])
    for question in teaching['additionalQuestions']:
        verify_answer(question)
        questions.append(question)
    assert len({question['id'] for question in questions}) == len(questions)
    for level, question in enumerate(source['demo']):
        assert len(question['balance']) == len(teaching['demoAnnotations'][level])
    for level, block in enumerate(recap):
        assert len(block['balance']) == len(teaching['recapAnnotations'][level])
    revision = sha256(b''.join((ROOT / 'content' / name).read_bytes() for name in sources)).hexdigest()[:16]
    return {
        'schema': 1, 'revision': revision, 'subject': 'maths', 'topic': 'M10',
        'title': source['title'], 'rows': source['rows'], 'prompts': source['prompts'],
        'questions': questions, 'recap': recap,
        'teaching': {key: teaching[key] for key in ('guidance', 'demoAnnotations', 'recapAnnotations', 'errorReasons')},
    }


def main():
    """Prepare the reference bank, then call write_candidates to output it for review only."""
    bank = prepare_bank()
    write_candidates({'website/static/data/equations.json': json.dumps(bank, ensure_ascii=False, indent=2) + '\n'})


if __name__ == '__main__':
    main()
