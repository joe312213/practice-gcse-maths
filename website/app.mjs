import {LEVELS,newTrack,newPage,submit,success,manualLevel,resolveChoice,markAnswer} from './engine.mjs';
import {KEY,emptyStore,load,chooseProfile} from './profiles.mjs';
import {balance,guidance,markErrors,errorFields,mountDemo} from './teaching.mjs';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let bank,store=emptyStore(),ready=false,profile,mode='assessment',selected=0,reference=false,demoLevel=0,workingPoints=0,draftWorking='',storageBlocked=false,pendingName=null,sketch=null,paperWorking=false,answerDraft='',errorDraft=[],demoCleanup=()=>{};
const modes=[['assessment','1 · Check your starting point'],['demo','2 · Review the method'],['scaffolded','3 · Guided practice'],['errors','4 · Spot the error'],['plain','5 · Independent practice']];
function persist(){if(storageBlocked)return;try{localStorage.setItem(KEY,JSON.stringify(store));}catch{$('#storage-warning').textContent='This browser could not save your progress. Keep this tab open; your current work is still available here.';}}
function toast(message){$('#toast').textContent=message;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').textContent='',6500);}
function track(type=mode){return profile.tracks[type]??=newTrack();}
function pool(type,level){return bank.questions.filter(q=>q.type===type&&(level===undefined||q.level===level));}
function question(id){return bank.questions.find(q=>q.id===id);}
function page(){return profile.pages[mode];}
function createPage(type){
 const t=track(type),size=type==='plain'?10:type==='errors'?3:type==='assessment'?4:2;
 paperWorking=false;
 const p={...newPage(size,t.level),startLevel:t.level,revision:bank.revision,attempt:crypto.randomUUID(),items:[],assisted:{},responses:{}};
 profile.pages[type]=p;fillItems(type,p);persist();return p;
}
function fillItems(type,p){
 const candidates=pool(type,type==='assessment'?undefined:p.level);
 const used=new Set(p.items.map(i=>i.id));
 const recent=new Set(profile.history.slice(-30).map(h=>h.question));
 const available=candidates.filter(q=>!used.has(q.id)).sort((a,b)=>Number(recent.has(a.id))-Number(recent.has(b.id)));
 // Shuffle equal recency bands; preserve source identity, never generate new mathematics.
 for(let i=available.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));if(recent.has(available[i].id)===recent.has(available[j].id))[available[i],available[j]]=[available[j],available[i]];}
 if(type==='assessment'){p.items=candidates.map(q=>({id:q.id,level:q.level}));return;}
 const count=p.size-p.items.length;
 if(available.length<count)throw Error('Not enough unused questions at this level.');
 p.items.push(...available.slice(0,count).map(q=>({id:q.id,level:q.level})));
}
function replaceRemaining(p,promoted=false){
 // Submitted positions keep their IDs and feedback; only unanswered positions change.
 const candidates=pool(mode,p.level).filter(q=>!p.items.some(i=>Object.hasOwn(p.responses,i.id)&&i.id===q.id));
 const remaining=p.items.map((item,i)=>!Object.hasOwn(p.responses,item.id)?i:-1).filter(i=>i>=0);
 if(candidates.length<remaining.length)throw Error('The bank needs more questions for this level.');
 for(const [n,i] of remaining.entries())p.items[i]={id:candidates[n].id,level:p.level,promoted:promoted&&p.level>(p.startLevel??0)};
}
function attachDemo(root=document){demoCleanup();demoCleanup=mountDemo(root.querySelector('.demo-body'),bank,demoLevel,l=>demoLevel=l);}
function switchMode(next){
 clearTimeout(toast.timer);$('#toast').textContent='';
 if(next==='demo'&&mode!=='assessment'&&mode!=='demo'){
  const p=page(),id=p?.items[selected]?.id;if(id&&!p.responses[id]){p.assisted[id]=true;persist();}
 }
 mode=next;selected=0;reference=false;clearDraft();render();
}
function progressCard(p,t,adaptive,score){
 if(mode==='assessment')return '';
 return `<section class="card progress-card"><h2>${adaptive?'Your progress':'Learning practice'}</h2>${adaptive?`<div class="meta">Recommended · ${LEVELS[t.level]}</div><p class="progress-value">${score.toFixed(1)}%</p><progress max="100" value="${score}" aria-label="Recent success at this level"></progress><p class="progress-note">recent success at this level</p>${t.reassess?`<p>Reassessment: ${t.reassess} eligible answers remaining.</p>`:''}${p.trial?`<p>Trying ${LEVELS[p.trial.to]}. Your previous level stays recorded.</p>`:''}`:'<p>These answers help you practise and do not change your independent challenge level.</p>'}<p id="progress-notice" role="status">${esc(p.notice)}</p></section>`;
}
function workingCard(){return `<section class="card working"><h2>Working · question ${selected+1}</h2><label class="inline-radio"><input type="checkbox" id="paper" ${paperWorking?'checked':''} aria-controls="working-tools" aria-expanded="${!paperWorking}"> I’m working on paper</label><div id="working-tools" ${paperWorking?'hidden':''}><canvas id="working" width="700" height="460" aria-label="Drawing space; typed working is available below"></canvas><button type="button" id="clear-working">Clear drawing</button><label for="typed-working">Or type your working</label><textarea id="typed-working" rows="3" placeholder="Write your steps here…"></textarea><small>Unsubmitted working clears when you change question.</small></div></section>`;}
function completion(p){
 if(!p.complete)return '';
 const correct=Object.values(p.responses).filter(r=>r.correct).length;
 if(mode==='assessment')return `<p class="assessment-complete" role="status">Assessment complete · ${correct} of ${p.size} correct.</p><button type="button" id="assessment-next">Review the method</button>`;
 return `<section class="card summary"><h2>Page complete</h2><p>${correct} of ${p.size} correct on first submission.</p>${p.pendingChoice?'<p>Would you like to try harder questions of this type next time?</p><button id="accept-promotion">Yes, try harder</button> <button id="decline-promotion">Keep this level</button>':'<button id="new-page">Practise another page</button>'}</section>`;
}
function feedback(q,response){
 if(!response)return '';
 return `<div class="feedback ${response.correct?'correct':'incorrect'}" role="status" tabindex="-1"><strong>${response.correct?'Correct.':'Not quite yet.'}</strong>${response.assisted?' <span>Assisted practice.</span>':''}${mode==='errors'?`<ul>${(response.details??[]).map((d,i)=>`<li>Error ${i+1}: ${d.rowCorrect?'row correct':'check the row'}; ${d.reasonCorrect?'reason correct':'check the reason'}; ${d.stepCorrect?'corrected step correct':'check the corrected step'}.</li>`).join('')}</ul><p>${response.answerCorrect?'Your final value is right.':'Check your final value of x.'}</p>`:''}<details><summary>Answer, method and check</summary><p><strong>Answer:</strong> x = ${esc(q.answer)}</p>${mode==='errors'?`<ul>${q.errors.map(e=>`<li>Row ${e.row+1}: ${esc(bank.teaching.errorReasons.find(r=>r.id===e.reason).label)} Corrected step: ${esc(q.stepOptions.find(o=>o.id===e.correction).text)}.</li>`).join('')}</ul>`:''}${balance(q.correct_balance??q.balance)}${q.correction?`<p>${esc(q.correction)}</p>`:''}${!response.correct&&q.error_note?`<p><strong>If you got ${esc(q.wrong)}:</strong> ${esc(q.error_note)}</p>`:''}<p><strong>Check:</strong> ${esc(q.check)}</p></details></div>`;
}
function render(){
 demoCleanup();
 if(!bank)return;
 $('#welcome').textContent=profile?`Welcome back, ${profile.name}!`:'';$('#profile-button').textContent=profile?'Not you?':'Choose name';
 if(!profile){$('#main').innerHTML='<section class="card full"><div class="eyebrow">Foundation maths</div><h1>A little practice.<br>A stronger method.</h1><p>Work through equations at your pace, with clear examples and feedback on each answer.</p><button id="begin" class="primary">Choose your name to begin</button></section>';$('#begin').onclick=()=>openProfile();return;}
 const intro=`<section class="intro"><div><div class="eyebrow">Foundation maths · Algebra</div><h1>Solving equations</h1><p>Make a start, keep both sides balanced, and build your confidence.</p></div></section><nav aria-label="Topic learning steps">${modes.map(([id,name])=>`<button type="button" data-mode="${id}" ${mode===id?'aria-current="step"':''}>${name}</button>`).join('')}</nav>`;
 if(mode==='demo'){
  $('#main').innerHTML=intro+'<section class="card full"><h2>Keep the equation balanced</h2><div class="demo-body"></div></section>';attachDemo();
 }else{
  const p=page()??createPage(mode),t=track(),q=question(p.items[selected]?.id??p.items[0].id);selected=Math.max(0,p.items.findIndex(i=>i.id===q.id));
  if(reference&&mode!=='assessment'&&!p.responses[q.id]){p.assisted[q.id]=true;persist();}
  const response=p.responses[q.id],adaptive=['plain','errors'].includes(mode),score=success(t.histories[t.level],p.size);
  const selectors=p.items.map((item,i)=>{const x=question(item.id),r=p.responses[item.id];return `<li><button type="button" data-question="${i}" class="question ${i===selected?'active':''} ${r?(r.correct?'correct':'incorrect'):''}" ${i===selected?'aria-current="true"':''} aria-controls="active-question" aria-label="Question ${i+1}: ${esc(x.q)}${r?(r.correct?', correct':', incorrect'):''}"><span class="num" aria-hidden="true">${i+1}</span><span class="question-content"><span class="equation">${esc(x.q)}</span>${item.promoted?`<span class="level-tag">Now ${LEVELS[item.level]}</span>`:''}</span><span class="question-outcome" aria-hidden="true">${r?(r.correct?'✓':'✕'):''}</span></button></li>`;}).join('');
  $('#main').innerHTML=intro+`<div class="layout ${reference&&mode!=='assessment'?'with-reference':''}">${reference&&mode!=='assessment'?'<aside class="card reference"><h2>Method reference</h2><div class="demo-body"></div><button id="close-reference">Close reference</button></aside>':''}<section class="card question-panel"><div class="meta">${esc(modes.find(m=>m[0]===mode)[1].split(' · ')[1])} · ${p.count}/${p.size} submitted</div><div class="level-row"><h2>${mode==='assessment'?'What can you do already?':mode==='errors'?'Find and correct the errors':'Choose a question'}</h2>${mode!=='assessment'?`<label>Challenge <select id="level" ${p.trial||p.pendingChoice||p.complete?'disabled':''}>${LEVELS.map((l,i)=>`<option value="${i}" ${p.level===i?'selected':''}>${l}</option>`).join('')}</select></label><button id="reference">Method reference</button>`:''}</div><p class="muted">${mode==='assessment'?'Try all four without hints. This helps you decide where to begin.':mode==='errors'?'Inspect the written method. Identify each independent mistake, then solve the original equation.':'Show your working. Submit each answer when you are ready.'}</p><ol class="question-list" aria-label="Choose the question to answer">${selectors}</ol><hr><section id="active-question" aria-labelledby="active-question-title"><h3 id="active-question-title">Question ${selected+1}</h3><p class="selected-equation">${esc(q.q)}</p>${mode==='scaffolded'?guidance(bank,q.level):''}${mode==='errors'?balance(q.balance,q.balance.length,true):''}<form id="answer-form">${mode==='errors'?errorFields(q,bank.teaching.errorReasons,response,errorDraft):''}<label for="answer">${mode==='errors'?'Final correct value':'Value'} of x</label><input id="answer" autocomplete="off" inputmode="text" placeholder="e.g. 7, −2 or 1/2" value="${esc(response?.raw??answerDraft)}" ${response?'disabled':''} required><p id="input-message" role="alert"></p><div class="actions"><button class="primary" type="submit" ${response?'disabled':''}>Check answer</button>${mode!=='assessment'&&!response?'<button id="hint" type="button">Hint</button>':''}</div><p id="hint-text" ${p.assisted[q.id]?'':'hidden'}>${p.assisted[q.id]?'This question is assisted. Correct answers help you practise but do not increase your success score.':''}</p></form>${feedback(q,response)}<p class="source-ref">${esc(q.id)}</p></section>${completion(p)}</section><aside>${progressCard(p,t,adaptive,score)}${workingCard()}</aside></div>`;
  attachPractice(q,p,t);
  if(reference&&mode!=='assessment'){attachDemo();$('#close-reference').onclick=()=>{reference=false;render();};}
 }
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
}
function clearDraft(){workingPoints=0;draftWorking='';sketch=null;answerDraft='';errorDraft=[];}
function attachPractice(q,p,t){
 document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{if(selected===Number(b.dataset.question))return;selected=Number(b.dataset.question);clearDraft();if(reference&&!p.responses[p.items[selected].id])p.assisted[p.items[selected].id]=true;persist();render();($('#error-row-0')??$('#answer')).focus();});
 if($('#level'))$('#level').onchange=e=>{
  const level=Number(e.target.value);p.startLevel=level;if(['plain','errors'].includes(mode))manualLevel(t,p,level);else p.level=level;
  replaceRemaining(p);selected=Math.max(0,p.items.findIndex(i=>!p.responses[i.id]));clearDraft();persist();render();
 };
 if($('#reference'))$('#reference').onclick=()=>{
  if(!p.responses[q.id]){p.assisted[q.id]=true;persist();}
  demoLevel=p.items[selected].level;
  if(innerWidth<768){const d=document.createElement('dialog');d.setAttribute('aria-label','Method reference');d.innerHTML=`<h2>Method reference</h2><div class="demo-body"></div><button id="dismiss-demo">Close reference</button>`;document.body.append(d);attachDemo(d);d.querySelector('#dismiss-demo').onclick=()=>d.close();d.onclose=()=>{demoCleanup();d.remove();$('#reference')?.focus();};d.showModal();$('#hint-text').hidden=false;$('#hint-text').textContent='This question is now assisted.';}
  else{reference=!reference;render();}
 };
 if($('#hint'))$('#hint').onclick=()=>{p.assisted[q.id]=true;persist();$('#hint-text').hidden=false;$('#hint-text').textContent='Keep both sides balanced: use the same inverse operation on each side. This answer will be recorded as assisted.';};
 document.querySelectorAll('.error-entry select').forEach(el=>el.onchange=()=>{errorDraft=[...document.querySelectorAll('.error-entry')].map(el=>({row:el.querySelector('[data-error-row]').value===''?null:Number(el.querySelector('[data-error-row]').value),reason:el.querySelector('[data-error-reason]').value,correction:el.querySelector('[data-error-step]').value}));});
 $('#answer-form').onsubmit=e=>{
  e.preventDefault();if(p.responses[q.id])return;
  const raw=$('#answer').value,result=markAnswer(raw,q.answer);if(!result.valid){$('#input-message').textContent='Enter a number, decimal or fraction (for example −3, 2.5 or 5/2).';return;}
  const entries=mode==='errors'?[...document.querySelectorAll('.error-entry')].map(el=>({row:Number(el.querySelector('[data-error-row]').value),reason:el.querySelector('[data-error-reason]').value,correction:el.querySelector('[data-error-step]').value})):[];
  const marked=mode==='errors'?markErrors(q,entries,raw):result;
  if(!marked.valid||marked.unique===false){$('#input-message').textContent='Choose a row, reason and corrected step for each error. Select each error row once.';return;}
  const correct=marked.correct,assisted=Boolean(p.assisted[q.id]);
  if(!paperWorking&&workingPoints<8&&!$('#typed-working').value.trim())toast('Remember to show your working. You can draw, type or use paper.');
  const before=p.level;const response={raw,correct,assisted,entries,details:marked.details,answerCorrect:marked.answerCorrect??result.correct};
  p.responses[q.id]=response;
  if(['plain','errors'].includes(mode))submit(t,p,{id:q.id,level:p.items[selected].level,correct,assisted});
  else{p.count++;p.complete=p.count===p.size;}
  profile.history.push({attempt:p.attempt,question:q.id,revision:bank.revision,type:mode,level:p.items[selected].level,correct,assisted,at:Date.now()});
  if(before!==p.level&&!p.complete)replaceRemaining(p,p.level>before);
  const next=correct?Array.from({length:p.items.length-1},(_,offset)=>(selected+offset+1)%p.items.length).find(index=>!p.responses[p.items[index].id]):undefined;
  if(next!==undefined){selected=next;clearDraft();if(reference)p.assisted[p.items[selected].id]=true;}
  persist();render();
  if(next!==undefined){toast(`Correct. Moving to question ${selected+1}.`);($('#error-row-0')??$('#answer')).focus();}
  else $('.feedback')?.focus();
 };
 if($('#assessment-next'))$('#assessment-next').onclick=()=>switchMode('demo');
 $('#answer').oninput=e=>answerDraft=e.target.value;
 if($('#new-page'))$('#new-page').onclick=()=>{createPage(mode);selected=0;clearDraft();render();};
 for(const [id,accept] of [['accept-promotion',true],['decline-promotion',false]])if($('#'+id))$('#'+id).onclick=()=>{resolveChoice(t,p,accept);persist();render();};
 const canvas=$('#working'),ctx=canvas.getContext('2d');let last=null;
 if(sketch)ctx.putImageData(sketch,0,0);
 const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];};
 canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);last=point(e);ctx.beginPath();ctx.arc(...last,2,0,Math.PI*2);ctx.fill();workingPoints++;};
 canvas.onpointermove=e=>{if(!last)return;const next=point(e);ctx.strokeStyle='#20352f';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...last);ctx.lineTo(...next);ctx.stroke();last=next;workingPoints++;};
 canvas.onpointerup=canvas.onpointercancel=()=>{last=null;sketch=ctx.getImageData(0,0,canvas.width,canvas.height);};
 $('#clear-working').onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);workingPoints=0;sketch=null;};
 $('#typed-working').value=draftWorking;$('#typed-working').oninput=e=>draftWorking=e.target.value;
 $('#paper').onchange=e=>{paperWorking=e.target.checked;$('#working-tools').hidden=paperWorking;e.target.setAttribute('aria-expanded',String(!paperWorking));};
}
function openProfile(){if(!ready)return;pendingName=null;$('#profile-message').textContent='';$('#profile-matches').innerHTML='';$('#username').value='';$('#profile-dialog').showModal();$('#username').focus();}
$('#profile-button').disabled=true;$('#profile-button').onclick=openProfile;$('#profile-cancel').onclick=()=>$('#profile-dialog').close();
$('#profile-form').onsubmit=e=>{
 e.preventDefault();if(!ready){$('#profile-message').textContent='Please wait for the equations to load.';return;}const name=$('#username').value;
 try{const result=chooseProfile(store,name,pendingName===name);
  if(!result.profile){pendingName=name;$('#profile-message').textContent='Check for typos. If this is the name you want, select Continue again to create a new profile.';$('#profile-matches').innerHTML=result.matches.map(n=>`<button type="button" data-name="${esc(n)}">Use ${esc(n)}</button>`).join('');document.querySelectorAll('[data-name]').forEach(b=>b.onclick=()=>{activate(chooseProfile(store,b.dataset.name).profile);});return;}
  activate(result.profile);
 }catch(err){$('#profile-message').textContent=err.message;}
};
function activate(p){paperWorking=false;profile=p;mode='assessment';selected=0;reference=false;clearDraft();persist();$('#profile-dialog').close();render();}
try{
 try{store=load(localStorage);}catch(err){storageBlocked=true;store=emptyStore();$('#storage-warning').textContent=err.message+' Practice can continue without saving.';}
 const response=await fetch('data/equations.json',{cache:'no-store'});if(!response.ok)throw Error('The equation bank could not be loaded.');bank=await response.json();
 profile=store.profiles.find(p=>p.key===store.last);
 // Keep historical scores; invalidate active work only when its authored bank changes.
 for(const p of store.profiles)for(const [key,session] of Object.entries(p.pages))if(session.revision!==bank.revision)delete p.pages[key];
 render();ready=true;$('#profile-button').disabled=false;
}catch(err){$('#main').textContent=err.message+' Serve the website folder through the local web server described in README.md.';}

// Optional theme controls must never prevent practice or profile startup.
try{
 const {initTheme}=await import('./theme.mjs?v=20261003-2');
 initTheme($('#theme-toggle'));
}catch(err){
 console.warn('Theme setup failed:',err);
 for(const selector of ['#theme-picker','#theme-toggle'])if($(selector))$(selector).disabled=true;
 toast('Theme controls could not load. You can still use the practice pages; refresh to try again.');
}
