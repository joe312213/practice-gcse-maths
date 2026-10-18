"""Purpose: Read the live topic-folder banks through the shared Node assembler, independently
verify arithmetic and fault traces, apply level/variety rules, and optionally render a human-
review HTML copy. Never rewrites questions.

Main contents:
- live_banks: Use the shared JS assembler, including named reasons, once per audit process.
- calculate: Evaluate numeric arithmetic only, exactly; no names or executable calls.
- answer_value: Read a draft's exact numeric, mixed-number or remainder answer for validation.
- check_lattice: Reconcile every displayed cell, diagonal, carry and read-off with its faults.
- check_division: Check each bus-stop transfer, digit and remainder against its explicit fault.
- validate: Check a topic against its spec and arithmetic; return its coverage count.
- review_html: Render a disposable teacher review; data continues to live only in JSON.
- main: Validate the ten topic files, then optionally write a disposable HTML review.

Used By: tests/spot-error-drafts.test.mjs, tests/spot_error_quality_test.py and manual content
review.

Uses: website/scripts/read-topic-bank.mjs, scripts/spot_error_quality.py,
website/static/data/<topic>/*.json and content/specs/M*.md.

Libs: Python standard library for exact arithmetic, JSON, paths and HTML escaping.

Usage and output: From repository root: python3 scripts/review_spot_error_drafts.py; add --html
/private/tmp/spot-errors.html for a review copy. Assertions fail on invalid content; HTML output
must be outside content/ and the live banks.
"""
import argparse
import ast
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction
from html import escape
import json
from pathlib import Path
import re
import subprocess
from functools import cache

from spot_error_quality import check_quality

ROOT = Path(__file__).resolve().parents[1]
BANKS = ROOT / 'website/static/data'

@cache
def live_banks():
    """Use the shared JS assembler, including named reasons, once per audit process."""
    names = sorted(path.parent.name for path in BANKS.glob('*/topic.json'))
    output = subprocess.check_output(
        ['node', str(ROOT / 'website/scripts/read-topic-bank.mjs'), *names], cwd=ROOT, text=True)
    return json.loads(output)



def calculate(expression):
    """Evaluate numeric arithmetic only, exactly; no names or executable calls."""
    def visit(node):
        """Recursively evaluate the permitted numeric AST nodes; reject names/calls in calculate."""
        if isinstance(node, ast.Constant) and type(node.value) in (int, float):
            return Fraction(str(node.value))
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.USub, ast.UAdd)):
            return -visit(node.operand) if isinstance(node.op, ast.USub) else visit(node.operand)
        if isinstance(node, ast.BinOp):
            left, right = visit(node.left), visit(node.right)
            if isinstance(node.op, ast.Add):
                return left + right
            if isinstance(node.op, ast.Sub):
                return left - right
            if isinstance(node.op, ast.Mult):
                return left * right
            if isinstance(node.op, ast.Div):
                return left / right
            if isinstance(node.op, ast.FloorDiv):
                return Fraction(left // right)
        raise ValueError(f'Unsupported arithmetic: {expression}')
    return visit(ast.parse(expression, mode='eval').body)


def answer_value(question):
    """Read a draft's exact numeric, mixed-number or remainder answer for validation."""
    answer = question['answer']
    if ' r ' in answer:
        quotient, remainder = map(int, answer.split(' r '))
        assert 0 <= remainder < question['divisor']
        return quotient + Fraction(remainder, question['divisor'])
    if ' ' in answer:
        whole, fraction = answer.split()
        return int(whole) + Fraction(fraction)
    return Fraction(answer)


def check_lattice(q):
    """Reconcile every displayed cell, diagonal, carry and read-off with its faults."""
    d = q['diagram']
    errors = {e['location']: e['misconception'] for e in q['errors']}
    families = set(errors.values())
    expected_right = list(map(int, str(d['b'])))
    if 'L3' in families:
        expected_right.reverse()
    assert d['right'] == expected_right
    assert d['top'] == list(map(int, str(d['a'])))
    cell_map = {}
    for c in d['cells']:
        key = f'cell-{c["row"]}-{c["column"]}'
        cell_map[key] = c
        assert c['topDigit'] == d['top'][c['column']]
        assert c['sideDigit'] == d['right'][c['row']]
        product = c['topDigit'] * c['sideDigit']
        assert (c['fact'] != product) == (errors.get(key) == 'L1')
        # The recorded product must match the visible cell, including reversed digits.
        assert c['fact'] == 10 * c['tens'] + c['units']
    terms_seen = Counter()
    misplaced = []
    incoming = 0
    for diag in d['diagonals']:
        key = f'diagonal-{diag["power"]}'
        for term in diag['terms']:
            c = cell_map[term['cell']]
            terms_seen[(term['cell'], term['half'])] += 1
            assert term['value'] == c[term['half']]
            power = c['power'] + (term['half'] == 'tens')
            if diag['power'] != power:
                misplaced.append(key)
        assert diag['incoming'] == incoming
        included = 0 if errors.get(key) == 'L2' else 2 * incoming if errors.get(key) == 'L7' else incoming
        assert diag['includedCarry'] == included
        if errors.get(key) in ('L2', 'L7'):
            assert incoming > 0, 'A carry fault needs a nonzero incoming carry'
        assert diag['sum'] == sum(t['value'] for t in diag['terms']) + included
        assert diag['digit'] == diag['sum'] % 10
        assert diag['outgoing'] == diag['sum'] // 10
        incoming = diag['outgoing']
    assert all(terms_seen[(key, half)] == 1 for key in cell_map for half in ('tens', 'units'))
    assert misplaced == [k for k, f in errors.items() if f == 'L6']
    digits = ''.join(str(v['digit']) for v in reversed(d['diagonals'])).lstrip('0') or '0'
    if incoming:
        digits = str(incoming) + digits
    assert d['normalReadOff'] == digits
    if 'L4' in families:
        power, = d['oversizedCarryPowers']
        carry = d['diagonals'][power]['incoming']
        assert carry > 0
        pos = len(digits) - power
        digits = digits[:pos] + str(carry) + digits[pos:]
    if 'L8' in families:
        pos = digits.index('0')
        digits = digits[:pos] + digits[pos + 1:]
    assert d['readOff'] == digits
    assert q['locations'][-1]['text'] == digits
    assert answer_value(q) == d['a'] * d['b']


def check_division(q):
    """Check each bus-stop transfer, digit and remainder against its explicit fault."""
    d = q['diagram']
    remainder = 0
    for i, column in enumerate(d['columns']):
        locations = {location['id'] for location in q['locations']}
        assert column['workingLocation'] in locations and column['transferLocation'] in locations
        assert column['digit'] == int(str(d['dividend'])[i])
        assert column['previousRemainder'] == remainder
        partial = remainder + column['digit'] if column['transferFault'] else remainder * 10 + column['digit']
        assert column['partial'] == partial
        quotient, correct_remainder = divmod(partial, d['divisor'])
        assert column['quotientDigit'] == quotient - (1 if column['quotientFault'] else 0)
        calculated_remainder = partial - column['quotientDigit'] * d['divisor']
        assert column['remainder'] == calculated_remainder + (1 if column['remainderFault'] else 0)
        remainder = column['remainder']


def validate(bank):
    """Check a topic against its spec and arithmetic; return its coverage count."""
    questions = bank['questions']
    assert len(questions) == 36
    assert Counter(q['level'] for q in questions) == {1: 12, 2: 12, 3: 12}
    assert Counter((q['level'], q['page']) for q in questions) == {(l, p): 4 for l in (1, 2, 3) for p in (1, 2, 3)}
    assert len({q['id'] for q in questions}) == 36
    assert len({q['prompt'] for q in questions}) == 36, 'Duplicate question prompts'
    spec = (ROOT / 'content/specs' / f'{bank["topic"]}.md').read_text()
    expected = set(re.findall(r'^\| ((?:RP|[A-Z])\d+) \|', spec, re.M))
    covered = {e['misconception'] for q in questions for e in q['errors']}
    assert covered == expected, (covered, expected)
    assert any(len(q['errors']) == 1 for q in questions)
    assert any(len(q['errors']) > 1 for q in questions)
    for q in questions:
        try:
            locations = {l['id'] for l in q['locations']}
            assert len(locations) == len(q['locations'])
            options = {o['id'] for o in q['options']}
            assert len(options) == len(q['options']) >= 3
            assert len({o['text'] for o in q['options']}) == len(options)
            faults = {e['location'] for e in q['errors']}
            assert len(faults) == len(q['errors'])
            assert faults <= locations
            assert set(q['consequences']) <= locations - faults
            assert locations - faults - set(q['consequences']), 'Include selectable correct working'
            assert all(e['reason'] in options for e in q['errors'])
            assert q['correctWorking'] and q['hint']
            check = q['answerCheck']
            expected_answer = calculate(check.get('expression', check.get('exactExpression')))
            if 'decimalPlaces' in check:
                exact_decimal = Decimal(expected_answer.numerator) / Decimal(expected_answer.denominator)
                expected_answer = Fraction(exact_decimal.quantize(Decimal(10) ** -check['decimalPlaces'], rounding=ROUND_HALF_UP))
            assert answer_value(q) == expected_answer, 'Corrected answer disagrees with arithmetic'
            if q.get('diagram', {}).get('kind') == 'lattice':
                check_lattice(q)
            if q.get('diagram', {}).get('kind') == 'bus-stop':
                check_division(q)
        except (AssertionError, ValueError, KeyError) as error:
            raise AssertionError(f'{q["id"]}: {error}') from error
    check_quality(bank, calculate, answer_value)
    return len(covered)


def review_html(banks):
    """Render a disposable teacher review; data continues to live only in JSON."""
    chunks = ['''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spot-error question review</title><style>
body{font:17px/1.5 system-ui;max-width:1000px;margin:auto;padding:1rem;color:#222;background:#fafafa}nav{display:flex;flex-wrap:wrap;gap:1rem}article{border:1px solid #aaa;border-radius:12px;padding:1rem;margin:1.5rem 0;background:white}li{margin:.5rem 0;overflow-wrap:anywhere}summary{cursor:pointer;font-weight:bold;padding:.6rem}pre{white-space:pre-wrap}small{color:#555}select{font:inherit;padding:.4rem}button{font:inherit}details{border-top:1px solid #ddd;margin-top:1rem}section{scroll-margin-top:1rem}.working{background:#fffbe6;padding:1rem 1rem 1rem 2rem}@media print{nav,.filters{display:none}article{break-inside:avoid}}
</style><h1>Spot the error — all-topic content review</h1>
<p>360 live questions. Review content, locations and corrections here. This is an author review, not the student interface. Each working item proposes a selectable region; lattice and bus-stop positions also have structured diagram data in the JSON.</p>
<p>Correct locations are selectable. Consequences of earlier mistakes are not additional errors to identify. The answer sections below contain teacher information.</p><div class="filters"><label>Topic <select id="topic"><option value="">All topics</option>''']
    for bank in banks:
        chunks.append(f'<option value="{escape(bank["topic"])}">{escape(bank["title"])}</option>')
    chunks.append('</select></label> <label>Level <select id="level"><option value="">All levels</option><option value="1">Start</option><option value="2">Build</option><option value="3">Confidence</option></select></label></div>')
    for bank in banks:
        chunks.append(f'<section data-topic="{bank["topic"]}"><h2>{escape(bank["title"])}</h2>')
        for q in bank['questions']:
            level = ['Start', 'Build', 'Confidence'][q['level'] - 1]
            chunks.append(f'<article data-level="{q["level"]}"><small>{escape(q["id"])} · {level} · page {q["page"]}</small><h3>{escape(q["prompt"])}</h3><ol class="working">')
            for l in q['locations']:
                chunks.append(f'<li><strong>{escape(l["label"])}:</strong> {escape(l["text"])}</li>')
            chunks.append('</ol><p>Explanation/repair options (available at every location):</p><ul>')
            for o in q['options']:
                chunks.append(f'<li>{escape(o["text"])}</li>')
            chunks.append('</ul><details><summary>Review diagnoses and corrected working</summary><ul>')
            for e in q['errors']:
                location = next(l['label'] for l in q['locations'] if l['id'] == e['location'])
                chunks.append(f'<li><strong>{escape(e["misconception"])} — {escape(location)}:</strong> {escape(e["feedback"])}</li>')
            consequences = ', '.join(next(l['label'] for l in q['locations'] if l['id'] == c) for c in q['consequences']) or 'None'
            chunks.append(f'</ul><p>Consequential locations: {escape(consequences)}</p><ol>')
            chunks.extend(f'<li>{escape(line)}</li>' for line in q['correctWorking'])
            answer = f'£{q["answer"]}' if q['unit'] == '£' else f'{q["answer"]} {q["unit"]}'.strip()
            chunks.append(f'</ol><p><strong>Corrected answer: {escape(answer)}</strong></p><p>Hint: {escape(q["hint"])}</p></details></article>')
        chunks.append('</section>')
    chunks.append('''<script>function filter(){document.querySelectorAll('section[data-topic]').forEach(s=>{s.hidden=topic.value&&s.dataset.topic!==topic.value;s.querySelectorAll('article').forEach(a=>a.hidden=level.value&&a.dataset.level!==level.value)})}const topic=document.getElementById('topic'),level=document.getElementById('level');topic.addEventListener('change',filter);level.addEventListener('change',filter);</script></html>''')
    return ''.join(chunks)


def main():
    """Validate the ten topic files, then optionally write a disposable HTML review."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--html', type=Path, help='Write a disposable review HTML outside the content sources')
    args = parser.parse_args()
    order = ['M01', 'M02', 'M13', 'M10', 'M15', 'M06', 'M03', 'M04', 'M12', 'M07']
    names = ['lattice-multiplication', 'bus-stop-division', 'signed-addition-subtraction', 'solving-equations', 'fraction-addition-subtraction', 'percentages', 'multiplication-division-problems', 'ratios', 'speed-distance-time', 'reverse-percentages']
    banks = []
    for topic, name in zip(order, names):
        live = live_banks()[name]
        questions = [dict(q, level=q['level'] + 1, prompt=q['q'], unit=q['answerUnit']) for q in live['questions'] if q.get('investigation')]
        banks.append(dict(topic=topic, title=live['title'], questions=questions))
    for bank in banks:
        count = validate(bank)
        print(f'{bank["topic"]}: 36 questions, all {count} agreed families; answers, locations, diagram traces, level scope and variety checked')
    if args.html:
        target = args.html.resolve()
        if target.is_relative_to(ROOT / 'content') or target.is_relative_to(BANKS) or target.suffix != '.html':
            parser.error('Review output must be an HTML file outside content/')
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(review_html(banks))
        print(f'Review: {target}')


if __name__ == '__main__':
    main()
