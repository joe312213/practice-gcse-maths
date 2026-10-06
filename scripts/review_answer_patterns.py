"""Purpose: Lightweight final-result inventory for the error-spotting question bank.
Only final answers count: intermediate working and repeated operand digits do not.

Main contents:
- normalise
- review

Used By: scripts/update_structure.py.

Uses: no local module imports.

Libs: Python standard library only.

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
"""
from collections import Counter,defaultdict
from fractions import Fraction
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
ORDER=['M01','M02','M13','M03','M04']

def normalise(value,item):
 """Normalize a displayed answer to an exact fraction, using the question divisor for remainder
 notation.

 Parameters: value — text or numeric value to render; item — structured question record.
 Used by: review.
 """
 value=str(value).replace('−','-').replace(',','').replace('£','').strip()
 if 'r' in value:
  q,r=re.split(r'\s*r\s*',value)
  return Fraction(q)+Fraction(int(r),int(item['bus']['divisor']))
 return Fraction(value)

def review(data):
 """Collect final correct and incorrect answers and write their repetition-pattern review.

 Parameters: data — structured question bank.
 Calls: normalise.

 Example in the caller's context: review(data)
 """
 all_values=defaultdict(list);lines=['# Error-spotting answer-pattern review — 1 October 2026','',
 'Reviewed final correct and deliberately incorrect results for all 45 SE questions. Compare numerical values regardless of units/currency; preserve signs and the value of any remainder. Do not count intermediate calculations as separate final answers.','',
 'Before: ratio returned 10 three times; signed arithmetic returned −3 four times and reused −8 as a wrong answer; some correct results were also wrong answers elsewhere on the same slide. The problem-solving bill repeated the division example 132 ÷ 8.','',
 'Revised 12 examples while preserving their error types, clear contexts and student-style working. The organisers/prizes question and its £54 correct answer are retained. All nine correct results and nine wrong results are now distinct within each topic, including comparisons between correct and wrong results. Across all five topics, no final numerical value appears more than twice. Isolated matches across separate topics are allowed; do not force awkward arithmetic simply to make the entire curriculum unique.','']
 for mid in ORDER:
  entries=[];values=[]
  for t,col in enumerate(data[mid]):
   for i,e in enumerate(col):
    ref=f'{mid}-SE-T{t+1}-Q{i+1}'
    c,w=e['correct_result'],e['incorrect_result']
    for role,value in [('correct',c),('incorrect',w)]:
     key=normalise(value,e);values.append(key);all_values[key].append(f'{ref} ({role})')
    entries.append(f'| {ref} | {c} | {w} |')
  duplicates={str(k):n for k,n in Counter(values).items() if n>1}
  if duplicates:raise ValueError(f'Repeated final results in {mid}: {duplicates}; review teaching intent before publication.')
  lines += [f'## {mid}','', '| Reference | Correct result | Shown incorrect result |','| --- | --- | --- |',*entries,'']
 repeats={str(k):refs for k,refs in all_values.items() if len(refs)>1}
 clusters={k:v for k,v in repeats.items() if len(v)>2}
 if clusters:raise ValueError(f'Cross-topic answer clusters need review: {clusters}')
 lines+=['## Isolated matches across different topics','', '| Value | Occurrences |','| --- | --- |']
 for value,refs in repeats.items():lines.append('| '+value+' | '+'; '.join(refs)+' |')
 lines+=['','The data fields `correct_result` and `incorrect_result` must be updated alongside the question, diagrams, correction and check. This inventory detects repetition; it does not replace checking the actual mathematics or reviewing sequences, signs, last digits and question-position cues.','']
 (ROOT/'content/SPOT_ERRORS_ANSWER_PATTERNS.md').write_text('\n'.join(lines))
 print('SE answer review: 18 distinct final results per topic; no cross-topic value occurs more than twice.')
if __name__=='__main__':review(json.loads((ROOT/'content/spot_errors.json').read_text()))
