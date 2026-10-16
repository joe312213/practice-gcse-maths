"""Read-only level and variety guards for live spot-error banks.

Called by review_spot_error_drafts.validate; regression fixtures exercise rejected
content. These guards supplement the page-by-page review in SPOT_ERRORS_PROCESS,
not semantic judgement of every distractor. Arithmetic is supplied by the audit's
restricted exact evaluator; this module never generates or writes questions.
"""
import ast
from fractions import Fraction
from math import gcd
import re


def equation_side(text, x, calculate):
    """Evaluate the authored linear expression, including implicit multiplication."""
    text = text.strip().replace('−', '-').replace('×', '*').replace('÷', '/')
    text = re.sub(r'(\d|\))(?=x|\()', r'\1*', text)
    text = text.replace('x', f'({x})')
    return calculate(text)


def fraction_expression(prompt):
    """Extract the numeric calculation, preserving mixed-number values exactly."""
    expression = prompt.removeprefix('Work out ').split(' in simplest form')[0].split('. Give')[0].rstrip('.')
    expression = re.sub(r'(\d+) (\d+/\d+)', r'(\1+\2)', expression)
    return expression.replace('−', '-')


def families(question):
    return {e['misconception'] for e in question['errors']}


def check_quality(bank, calculate, answer_value):
    """Guard the agreed level progression and the audited sources of repetition.

    Levels here are author-facing 1/2/3, as in the review adapter. Assertions name
    the failed rule; extend explicit rules when teaching scope legitimately changes.
    """
    topic = bank['topic']
    questions = bank['questions']
    levels = [[q for q in questions if q['level'] == level] for level in (1, 2, 3)]
    start, build, confidence = levels
    assert topic in {'M01', 'M02', 'M03', 'M04', 'M06', 'M07', 'M10', 'M12', 'M13', 'M15'}, 'Add quality rules for the new topic'

    if topic == 'M02':
        for q in questions:
            d = q['diagram']
            a, b = d['dividend'], d['divisor']
            assert answer_value(q) == Fraction(a, b), f'{q["id"]}: division answer'
            assert re.search(rf'\b{a} ÷ {b}\b', q['prompt']), f'{q["id"]}: diagram operands'
            carry = 0
            transfers = []
            for digit in str(a):
                transfers.append(carry)
                carry = (carry * 10 + int(digit)) % b
            if q['level'] == 1:
                assert not any(transfers) and carry == 0, 'Division Start: correct work must need no carries'
            elif q['level'] == 2:
                assert 2 <= b <= 9 and any(transfers) and carry, 'Division Build: single-digit divisor, transfers and final remainder'
            else:
                assert 1000 <= a <= 9999 and 10 <= b <= 99, 'Division Confidence: four-digit dividend and two-digit divisor'
                denominator = Fraction(a, b).denominator
                assert denominator > 1, 'Division Confidence needs decimal continuation'
                for factor in (2, 5):
                    while denominator % factor == 0:
                        denominator //= factor
                assert denominator == 1, 'Request exact decimals only when they terminate'
        assert len({q['diagram']['divisor'] for q in build}) >= 5, 'Vary Build divisors'
        assert len({q['diagram']['divisor'] for q in confidence}) >= 6, 'Vary Confidence divisors'

    elif topic == 'M10':
        for q in questions:
            x = answer_value(q)
            original = q['locations'][0]['text']
            left, right = original.split('=')
            assert equation_side(left, x, calculate) == equation_side(right, x, calculate), f'{q["id"]}: answer does not solve original equation'
            # Also check every wholly mathematical corrected line, not prose labels.
            for line in q['correctWorking']:
                for expression in line.split(';'):
                    if '=' in expression and re.fullmatch(r'[\dx\s+−\-×÷*/().=]+', expression):
                        values = [equation_side(side, x, calculate) for side in expression.split('=')]
                        assert len(set(values)) == 1, f'{q["id"]}: corrected equation {expression}'
        originals = [q['locations'][0]['text'] for q in confidence]
        assert all(all('x' in side for side in text.split('=')) for text in originals), 'Equation Confidence: unknown on both sides'
        assert sum('(' in text for text in originals) >= 2, 'Include bracket equations at Confidence'
        assert len({re.search(r'\d+', text)[0] for text in originals}) >= 6, 'Vary Confidence equation coefficients'

    elif topic == 'M15':
        factors = set()
        denominators = []
        for q in questions:
            assert calculate(fraction_expression(q['prompt'])) == answer_value(q), f'{q["id"]}: original fraction calculation'
            pairs = re.findall(r'\d+/(\d+)', q['prompt'])
            assert len(pairs) == 2, 'Review the fraction guard for a new question form'
            a, b = map(int, pairs)
            if q['level'] == 1:
                assert a == b, 'Fraction Start: common denominators'
            elif q['level'] == 2:
                assert max(a, b) % min(a, b) == 0 and a != b, 'Fraction Build: one denominator a multiple of the other'
                factors.add(max(a, b) // min(a, b))
            else:
                assert max(a, b) % min(a, b), 'Fraction Confidence: both fractions need conversion'
                denominators.append((a, b))
        assert {2, 3, 4} <= factors, 'Vary equivalence factors beyond doubling'
        assert any(gcd(a, b) > 1 for a, b in denominators), 'Include shared-factor Confidence denominators'
        assert sum(bool(re.search(r'\d+ \d+/\d+', q['prompt'])) for q in confidence) >= 3, 'Include mixed-number Confidence questions'
        assert sum('−' in q['prompt'] for q in confidence) >= 3, 'Include Confidence subtraction'

    elif topic == 'M13':
        first_results = []
        for q in confidence:
            tree = ast.parse(q['answerCheck']['expression'], mode='eval').body
            assert isinstance(tree, ast.BinOp) and isinstance(tree.left, ast.BinOp), 'Signed Confidence needs two operations'
            first_results.append(calculate(ast.unparse(tree.left)))
            assert calculate(q['prompt'].removeprefix('Work out ').rstrip('.').replace('−', '-')) == answer_value(q), f'{q["id"]}: signed expression'
        assert len(set(first_results)) >= 6, 'Vary signed intermediate results'
        assert min(first_results) < 0 < max(first_results), 'Include intermediate results on both sides of zero'

    elif topic == 'M06':
        changes = [re.search(r'changes from £?([\d.]+)(?: [A-Za-z]+)? to £?([\d.]+)', q['prompt']) for q in confidence]
        assert all(changes), 'Percentage Confidence must calculate percentage change from original/new amounts'
        increases = sum(Fraction(m[2]) > Fraction(m[1]) for m in changes)
        assert 4 <= increases <= 8, 'Balance percentage increases and decreases'
        contexts = {q['prompt'].split(' changes from ')[0] for q in confidence}
        assert len(contexts) >= 4, 'Vary percentage-change contexts'
        for q, match in zip(confidence, changes):
            old, new = map(Fraction, match.groups())
            assert answer_value(q) == abs(new - old) / old * 100, f'{q["id"]}: percentage-change answer'

    elif topic == 'M07':
        increases = 0
        contexts = set()
        for q in confidence:
            money = re.search(r'A bill for one (.+?) is £([\d.]+), including £([\d.]+) delivery added after a (\d+)% (increase|reduction)', q['prompt'])
            if money:
                noun, total, extra, rate, direction = money.groups()
            else:
                change = re.search(r'After a (\d+)% (increase|reduction)', q['prompt'])
                amounts = re.search(r'(?:weighs|holds|has|measures) ([\d.]+) (g|litres|people|cm), including (?:a )?([\d.]+)', q['prompt'])
                assert change and amounts, 'Reverse Confidence: explicit percentage change and separate fixed addition'
                rate, direction = change.groups()
                total, noun, extra = amounts.groups()
                assert 'after' in q['prompt'].split('including')[1], 'State when the fixed addition occurs'
            contexts.add(noun)
            increases += direction == 'increase'
            multiplier = Fraction(100 + int(rate) if direction == 'increase' else 100 - int(rate), 100)
            quantity = re.search(r'total (?:price|mass) of (\d+)|(\d+) clubs', q['prompt'])
            count = int(next(v for v in quantity.groups() if v)) if quantity else 1
            expected = (Fraction(total) - Fraction(extra)) / multiplier * count
            assert expected == answer_value(q), f'{q["id"]}: fixed addition/inverse/scaling answer'
        assert sum(q['unit'] != '£' for q in confidence) >= 4, 'Include non-financial reverse percentages'
        assert 4 <= increases <= 8, 'Balance reverse increases and reductions'
        assert len(contexts) >= 4, 'Vary reverse-percentage contexts'

    elif topic == 'M03':
        for q in confidence:
            expression = q['answerCheck'].get('expression', q['answerCheck'].get('exactExpression'))
            operations = sum(isinstance(node, ast.BinOp) for node in ast.walk(ast.parse(expression)))
            assert operations >= 2, 'Applications Confidence needs linked operations, not just a stored answer'
        contexts = {'tents', 'crates', 'tickets', 'boxes', 'tools', 'minibuses', 'rope', 'fabric', 'cable'}
        assert sum(any(word in q['prompt'].lower() for q in confidence) for word in contexts) >= 5, 'Vary linked application contexts'
        assert any('A4' in families(q) and 'complete' in q['prompt'] for q in build), 'Include complete groups (round down)'
        assert any('A4' in families(q) and 'people' in q['prompt'] for q in build), 'Include capacity for everyone (round up)'

    elif topic == 'M04':
        # These are mathematical follow-ons, not merely two steps within ratio sharing.
        linked = re.compile(r'cost|remain|another|batches|extra minutes|spends|in metres|half a batch|saves', re.I)
        assert sum(bool(linked.search(q['prompt'])) for q in build) == 3, 'Retain 3/12 linked Build ratio questions'
        assert sum(bool(linked.search(q['prompt'])) for q in confidence) == 8, 'Retain 8/12 linked Confidence ratio questions'
        assert len({word for word in ('cost', 'batches', 'spends', 'metres', 'saves', 'remain') if any(word in q['prompt'] for q in confidence)}) >= 4, 'Vary ratio follow-on operations'

    elif topic == 'M12':
        assert all(not re.search(r'\d+/\d+', q['prompt']) for q in questions), 'Use familiar decimal journey measurements'
        for q in questions:
            if 'cyclist' in q['prompt'].lower():
                speeds = re.findall(r'([\d.]+) km/h', q['prompt'])
                if q['unit'] == 'km/h':
                    speeds.append(str(answer_value(q)))
                assert speeds and max(map(Fraction, speeds)) <= 50, 'Review implausible cyclist speed'
            if 'T7' in families(q):
                legs = re.findall(r'at ([\d.]+) km/h for ([\d.]+) hours', q['prompt'])
                assert len(legs) == 2, 'T7 needs two explicit journey legs'
                (s1, t1), (s2, t2) = [tuple(map(Fraction, leg)) for leg in legs]
                assert t1 != t2 and s1 != s2, 'Unweighted mean is valid for equal durations or speeds'
        stops = set()
        for q in confidence:
            stops.update(re.findall(r'(\d+)-minute stop|stops for another (\d+) minutes', q['prompt']))
        assert len(stops) >= 4, 'Vary journey stop durations'
    # M01 already has independent operand, carry-demand and page-coverage guards
    # in content-quality.test.mjs, alongside the full lattice trace audit.
