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
        def add(q, ident, kind, level, **extra):
            a, op, b = operands(q.split(' (')[0])
            assert re.sub(r'\s|,', '', q.split(' (')[0]) in all_text, (ident, q)
            answer = str(a*b) if op == '×' else (f'{a//b} r {a%b}' if level == 1 and a%b else str(Decimal(a)/Decimal(b)).rstrip('0').rstrip('.') if a%b else str(a//b))
            check = f'{answer} ÷ {b} = {a}' if op == '×' else f'{a//b} × {b} + {a%b} = {a}'
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
        catalogue['topics'].append(dict(code=int(topic[1:])-1, bank=topic, title=bank['title'], tags=tags, pages=pages))
        audit.append(dict(topic=topic, questions=len(questions), deck_sha256=sha256(deck_path.read_bytes()).hexdigest(), answers_sha256=sha256(saved_answers.encode()).hexdigest(), source_questions_found_in_saved_deck=True, error_diagrams_preserved=9))
    catalogue['topics'].sort(key=lambda t:t['code'])
    catalogue_path.write_text(json.dumps(catalogue, ensure_ascii=False, indent=2)+'\n')
    (ROOT / 'docs/ARITHMETIC_IMPORT_AUDIT.json').write_text(json.dumps(audit, indent=2)+'\n')
    print('Imported and deck-audited 94 questions per arithmetic topic; preserved 18 saved error diagrams.')

if __name__ == '__main__':
    main()
