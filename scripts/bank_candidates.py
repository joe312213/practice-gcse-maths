"""Purpose: Write historical import candidates without touching authoritative application files.

Main contents:
- write_candidates

Used By: prepare_web_arithmetic.py, prepare_web_equations.py.

Uses: current repository files for read-only comparison.

Libs: Python standard library for temporary directories, paths and JSON.
"""
from pathlib import Path
import json
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def write_candidates(files):
    """Write prepared relative-path/text pairs into a fresh temporary directory.

    Called by importer main functions after validation. No output-directory or overwrite option.
    Compare with current repository files; return the directory for human review.
    Example: write_candidates({'website/static/data/example.json': '{"questions": []}\n'})
    """
    paths = {Path(name): text for name, text in files.items()}
    if any(path.is_absolute() or '..' in path.parts for path in paths):
        raise ValueError('Candidate paths must stay inside the new temporary directory.')
    comparison = []
    for path, text in paths.items():
        current = ROOT / path
        status = ('matches' if current.read_text() == text else 'differs') if current.is_file() else 'new'
        comparison.append({'path': str(path), 'status': status})
    directory = Path(tempfile.mkdtemp(prefix='maths-bank-candidates-'))
    for path, text in paths.items():
        target = directory / path
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open('x') as output:
            output.write(text)
    with (directory / 'comparison.json').open('x') as output:
        json.dump({'authority': 'Current application JSON banks; candidates are historical references only.',
                   'files': comparison}, output, indent=2)
        output.write('\n')
    print(f'Reference candidates only: {directory}')
    print('Current banks, catalogue and audits were not changed. Review individual differences; '
          'do not bulk-copy candidates over current content.')
    return directory
