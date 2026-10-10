"""Purpose: Import M01/M02 questions and saved error diagrams without changing legacy resources.

Main contents: Source/deck audit, exact answers, generated banks and authored page slots.
Used By: manual bank import command.
Uses: content topic Markdown, spot_errors.json and saved decks/answer HTML.
Libs: python-pptx for read-only deck inspection; Python standard library.
"""
from pathlib import Path
from hashlib import sha256
from decimal import Decimal
import html
import json
import re
from pptx import Presentation

ROOT = Path(__file__).resolve().parents[1]

def clean(value):
    """Remove presentation markup from authored text."""
    return html.unescape(re.sub('<[^>]+>', ' ', value)).strip().replace('**', '')

def operands(value):
    """Parse the authored integer arithmetic expression."""
    a, op, b = re.fullmatch(r'([\d,]+)\s*([×÷])\s*([\d,]+)', value).groups()
    return int(a.replace(',', '')), op, int(b.replace(',', ''))

def main():
    """Audit each imported question against its saved deck, then write deterministic banks."""
    catalogue_path = ROOT / 'website/src/lib/content/practice-pages.json'
    catalogue = json.loads(catalogue_path.read_text())
    errors = json.loads((ROOT / 'content/spot_errors.json').read_text())
    support = json.loads((ROOT / 'content/M01_M02_web_support.json').read_text())
    extra_assessments = json.loads((ROOT / 'content/web_assessments.json').read_text())
    audit = []
    for topic, folder, stem, source, method in [
        ('M01', 'multiplication', 'Lattice_multiplication_M01', 'M01_lattice_multiplication.md', 'lattice'),
        ('M02', 'division', 'Bus_stop_division_M02', 'M02_bus_stop_division.md', 'bus')
    ]:
        deck_path = ROOT / f'legacy/topics/{folder}/{stem}_questions.pptx'
        deck = Presentation(deck_path)
        slide_text = ['\n'.join(s.text for s in slide.shapes if s.has_text_frame) for slide in deck.slides]
        all_text = re.sub(r'\s|,', '', '\n'.join(slide_text))
        markdown = (ROOT / 'content' / source).read_text()
        saved_answers = (ROOT / f'legacy/topics/{folder}/{stem}_answers.html').read_text()
        questions = []
        replacements = []
        def add(q, ident, kind, level, audit_source=True, **extra):
            if audit_source:
                assert re.sub(r'\s|,', '', q.split(' (')[0]) in all_text, (ident, q)
            # Audit the preserved source first, then apply authorised web-only refinements.
            revised = support.get(f'maths:{ident}', {}).get('q', q)
            if revised != q:
                replacements.append(dict(id=f'maths:{ident}', source=q, website=revised))
            q = revised
            a, op, b = operands(q.split(' (')[0])
            answer = str(a*b) if op == '×' else (f'{a//b} r {a%b}' if level == 1 and a%b else str(Decimal(a)/Decimal(b)).rstrip('0').rstrip('.') if a%b else str(a//b))
            if op == '×':
                check = f'{answer} ÷ {b} = {a}'
            elif '.' in answer:
                check = f'{answer} × {b} = {a}'
            else:
                check = f'{a//b} × {b} + {a%b} = {a}'
            item = dict(id=f'maths:{ident}', subject='maths', topic=topic, type=kind, level=level, q=q, a=a, b=b, answer=answer, check=check, method=method, **extra)
            questions.append(item)
            return item
        # Assessment text is taken from the saved deck, including manual edits.
        assessment = re.findall(r'\d\.\s+([\d,]+\s*[×÷]\s*[\d,]+)', slide_text[0])
        assert len(assessment) == 4
        for i, q in enumerate(assessment):
            add(q, f'{topic}-IA-Q{i+1}', 'assessment', [0, 1, 1, 2][i])
        sections = re.split(r'## Slide \d+ —[^\n]+', markdown)[1:]
        for number, section in enumerate(sections, 1):
            rows = re.findall(r'^\| (?:The Full Question|[1-6]) \| (.+) \|$', section, re.M)
            for row, values in enumerate(rows, 1):
                for level, q in enumerate(values.split(' | ')):
                    add(q, f'{topic}-S{number:02}-C{level+1}-Q{row}', 'demo' if number == 1 else 'scaffolded' if number < 4 else 'plain', level)
        # Preserve the exact saved deliberate-error drawings and correction text.
        articles = re.findall(r'<article>(.*?)</article>', saved_answers.split(f'{topic}-SE')[1], re.S)[:9]
        assert len(articles) == 9
        corrections = [clean(re.search(r'<strong>Answer / Method:</strong>(.*?)</p>', article, re.S)[1]) for article in articles]
        for level, col in enumerate(errors[topic]):
            for i, error in enumerate(col):
                index = level*3+i
                q = error.get('question', f"{error.get('a', 0):,} × {error.get('b', 0):,}")
                ident = f'{topic}-SE-C{level+1}-Q{i+1}'
                svg = re.search(r'<svg\b.*?</svg>', articles[index], re.S)[0]
                dest = ROOT / f'website/static/data/working/{ident}.svg'
                dest.parent.mkdir(exist_ok=True)
                dest.write_text(svg+'\n')
                options = [{'id': str(j), 'text': corrections[level*3+j]} for j in range(3)]
                item = add(q, ident, 'errors', level, errorImage=f'data/working/{ident}.svg', errorOptions=options, correctionId=str(i), correction=corrections[index], wrong=error['incorrect_result'], error_note=corrections[index])
                expected = error['correct_result'].replace(',', '')
                parts = expected.split(' r ')
                assert (int(parts[0])*item['b']+int(parts[1]) == item['a'] if len(parts)==2 else Decimal(expected) == (Decimal(item['a'])*item['b'] if method=='lattice' else Decimal(item['a'])/item['b'])), ident
                item['answer'] = error['correct_result'].replace(',', '')
                item['check'] = error['check']
        # New web assessments are authored separately; never claim saved-deck provenance.
        for index, extra in enumerate(extra_assessments[topic], 5):
            add(extra['q'], f'{topic}-IA-Q{index}', 'assessment', extra['level'], audit_source=False, **{k:v for k,v in extra.items() if k not in ('q','level')})
        for item in questions:
            item.update(support.get(item['id'], {}))
        table = sections[0]
        method_rows = re.findall(r'^\| [1-4]\. (.*?) \| (.*?) \|', table, re.M)
        prompts = [clean(text.replace('<br>', ' ')) for _, text in method_rows]
        guidance = [{'aim': 'Use the lattice to keep each product in its place.' if method == 'lattice' else ['Divide from left to right.', 'Carry remainders; give any final remainder using r.', 'Continue with decimal places until there is no remainder.'][level], 'steps': [clean(line.split(' | ')[1].replace('<br>', ' ')) for line in sections[1].splitlines() if re.match(r'^\| [1-4]\.', line)]} for level in range(3)]
        bank = dict(schema=1, subject='maths', topic=topic, title='Lattice multiplication' if method == 'lattice' else 'Bus stop division', method=method, rows=[label for label,_ in method_rows], prompts=prompts, questions=questions, teaching={'guidance':guidance})
        bank['revision'] = sha256(json.dumps(bank, sort_keys=True).encode()).hexdigest()[:16]
        (ROOT / f'website/static/data/{folder}.json').write_text(json.dumps(bank, ensure_ascii=False, indent=2)+'\n')
        pages = []
        for level in range(3):
            pages.append(dict(type=0, level=level, slots=[[q['id'] for q in questions if q['type']=='plain' and q['level']==level and f'-S{s:02}-' in q['id']] for s in range(4,8)]))
            pages.append(dict(type=1, level=level, slots=[[q['id'] for q in questions if q['type']=='errors' and q['level']==level]]))
        tags = next((t.get('tags', []) for t in catalogue['topics'] if t['bank'] == topic), [])
        catalogue['topics'] = [t for t in catalogue['topics'] if t['bank'] != topic]
        catalogue['topics'].append(dict(code=int(topic[1:])-1, bank=topic, title=bank['title'], pages=pages, tags=tags))
        audit.append(dict(topic=topic, questions=len(questions), deck_sha256=sha256(deck_path.read_bytes()).hexdigest(), answers_sha256=sha256(saved_answers.encode()).hexdigest(), source_questions_found_in_saved_deck=True, web_replacements=replacements, new_web_assessments=2, error_diagrams_preserved=9))
    catalogue['topics'].sort(key=lambda t:t['code'])
    catalogue_path.write_text(json.dumps(catalogue, ensure_ascii=False, indent=2)+'\n')
    (ROOT / 'docs/ARITHMETIC_IMPORT_AUDIT.json').write_text(json.dumps(audit, indent=2)+'\n')
    print('Imported and deck-audited 96 questions per arithmetic topic (94 audited source items + 2 web assessments); preserved 18 saved error diagrams.')

if __name__ == '__main__':
    main()
