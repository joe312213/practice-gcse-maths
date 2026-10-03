import {markAnswer} from './engine.mjs';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function balance(rows,limit=rows.length,numbered=false,annotations=[]){
 return `<table class="balance ${numbered?'numbered':''}" aria-label="${numbered?'Incorrect working, numbered by row':'Equation working'}"><tbody>${rows.slice(0,limit).map((r,i)=>`<tr data-step="${i}" class="${r.kind==='op'?'op':''}">${numbered?`<th class="row-number" scope="row"><span class="sr-only">Row </span>${i+1}</th>`:''}<td class="lhs">${esc(r.l)}</td><td class="equals"><span>${r.kind==='op'?'':'='}</span></td><td class="rhs">${esc(r.r)}</td></tr>${annotations[i]?`<tr class="step-note"><td colspan="${numbered?4:3}">${esc(annotations[i])}</td></tr>`:''}`).join('')}</tbody></table>`;
}
export function guidance(bank,level){const g=bank.teaching.guidance[level];return `<div class="guidance"><p>${esc(g.aim)}</p><ol class="steps">${g.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>`;}
export function markErrors(q,entries,raw){
 const answer=markAnswer(raw,q.answer);
 const valid=answer.valid&&entries.length===q.errors.length&&entries.every(e=>Number.isInteger(e.row)&&e.row>=0&&e.row<q.balance.length&&e.reason&&q.stepOptions.some(o=>o.id===e.correction));
 if(!valid)return {valid:false,correct:false};
 const unique=new Set(entries.map(e=>e.row)).size===entries.length;
 const details=entries.map(e=>{const expected=q.errors.find(x=>x.row===e.row);return {row:e.row,rowCorrect:Boolean(expected),reasonCorrect:expected?.reason===e.reason,stepCorrect:expected?.correction===e.correction};});
 return {valid:true,correct:unique&&answer.correct&&details.every(e=>e.rowCorrect&&e.reasonCorrect&&e.stepCorrect),answerCorrect:answer.correct,details,unique};
}
export function errorFields(q,reasons,response,draft=[]){
 const entries=response?.entries??draft;
 return `<div class="error-fields"><p>Find ${q.errors.length===1?'the independent error':'both independent errors'}. For each correction, use the working immediately above the selected row. Then solve the original equation for the final answer.</p>${q.errors.map((_,i)=>{
 const e=entries[i]??{};return `<fieldset class="error-entry"><legend>Error ${i+1}</legend><label for="error-row-${i}">Row</label><select id="error-row-${i}" data-error-row required ${response?'disabled':''}><option value="">Choose a row</option>${q.balance.map((_,n)=>`<option value="${n}" ${e.row===n?'selected':''}>Row ${n+1}</option>`).join('')}</select><label for="error-reason-${i}">Reason</label><select id="error-reason-${i}" data-error-reason required ${response?'disabled':''}><option value="">Choose a reason</option>${reasons.map(r=>`<option value="${r.id}" ${e.reason===r.id?'selected':''}>${esc(r.label)}</option>`).join('')}</select><label for="error-step-${i}">Corrected step</label><select id="error-step-${i}" data-error-step required ${response?'disabled':''}><option value="">Choose the corrected step</option>${q.stepOptions.map(o=>`<option value="${o.id}" ${e.correction===o.id?'selected':''}>${esc(o.text)}</option>`).join('')}</select></fieldset>`;}).join('')}</div>`;
}
// Timer is injectable for deterministic tests; every component owns and cancels its timer.
export function createPlayer({length,onFrame,schedule=setTimeout,cancel=clearTimeout,delay=2600}){
 let step=1,playing=false,timer=null,disposed=false,paused=false;
 const clear=()=>{if(timer!==null)cancel(timer);timer=null;};
 const emit=()=>{if(!disposed)onFrame({step,playing});};
 const tick=()=>{timer=null;if(disposed||!playing)return;step=Math.min(length,step+1);if(step===length)playing=false;emit();if(playing)timer=schedule(tick,delay);};
 return {play(){if(disposed)return;clear();if(!paused||step===length)step=1;paused=false;playing=true;emit();timer=schedule(tick,delay);},pause(){clear();playing=false;paused=true;emit();},go(n){clear();playing=false;paused=false;step=Math.max(1,Math.min(length,n));emit();},dispose(){clear();playing=false;disposed=true;},get step(){return step;},get playing(){return playing;}};
}
export function mountDemo(root,bank,initialLevel=0,onLevel=()=>{}){
 let level=initialLevel,example='demo',player;
 function current(){return example==='demo'?bank.questions.find(q=>q.type==='demo'&&q.level===level):bank.recap[level];}
 function draw({step,playing}){
  const focused=root.contains(document.activeElement)?document.activeElement?.id:null,q=current();
  const notes=bank.teaching[example==='demo'?'demoAnnotations':'recapAnnotations'][level];
  root.innerHTML=`<div class="level-row" aria-label="Demonstration challenge">${['Start','Build','Confidence'].map((l,i)=>`<button type="button" data-demo-level="${i}" aria-pressed="${i===level}">${l}</button>`).join('')}</div>${guidance(bank,level)}<label for="demo-example">Example</label><select id="demo-example"><option value="demo" ${example==='demo'?'selected':''}>Worked example</option><option value="recap" ${example==='recap'?'selected':''}>${esc(bank.recap[level].title)}</option></select><p class="selected-equation">${esc(q.q??`${q.balance[0].l} = ${q.balance[0].r}`)}</p><div class="demo-controls"><button type="button" class="primary" id="demo-play">${playing?'Pause':step===q.balance.length?'Replay':'Play'}</button><div class="secondary-controls"><button type="button" id="demo-back" ${step<=1?'disabled':''}>Previous</button><button type="button" id="demo-next" ${step>=q.balance.length?'disabled':''}>Next</button><button type="button" id="demo-all" ${step>=q.balance.length?'disabled':''}>End</button></div></div><p class="demo-status" role="status">Step ${step} of ${q.balance.length}${playing?' · playing':''}</p><div class="demo-working">${balance(q.balance,step,false,notes)}</div>${step===q.balance.length?`<div class="demo-check">${q.check?`<p><strong>Check:</strong> ${esc(q.check)}</p>`:''}${(q.notes??[]).map(s=>`<p>${esc(s)}</p>`).join('')}</div>`:''}`;
  root.querySelectorAll('[data-demo-level]').forEach(b=>b.onclick=()=>{level=Number(b.dataset.demoLevel);onLevel(level);restart();});
  root.querySelector('#demo-example').onchange=e=>{example=e.target.value;restart();};
  root.querySelector('#demo-play').onclick=()=>player.playing?player.pause():player.play();
  root.querySelector('#demo-back').onclick=()=>player.go(player.step-1);
  root.querySelector('#demo-next').onclick=()=>player.go(player.step+1);
  root.querySelector('#demo-all').onclick=()=>player.go(current().balance.length);
  if(focused)root.querySelector('#'+focused)?.focus({preventScroll:true});
 }
 function restart(){player?.dispose();player=createPlayer({length:current().balance.length,onFrame:draw});draw({step:1,playing:false});}
 restart();return ()=>player.dispose();
}
