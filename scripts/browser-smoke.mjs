// Uses an isolated Chrome profile at port 9238; touches only that test browser's Maths storage.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:8766';
const pages=await(await fetch('http://127.0.0.1:9238/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
let next=0;const pending=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);};
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function js(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function until(expr){for(let i=0;i<100;i++){if(await js(expr))return;await new Promise(r=>setTimeout(r,70));}throw Error('Timed out: '+expr);}
const click=s=>js(`document.querySelector(${JSON.stringify(s)}).click()`);
const state=()=>js(`JSON.parse(localStorage.getItem('maths-starters-prototype-v1'))`);
const active=async type=>{const s=await state();return s.profiles.find(p=>p.key===s.last).pages[type];};
async function screenshot(name){await new Promise(r=>setTimeout(r,400));const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile('/private/tmp/maths-'+name+'.png',Buffer.from(r.data,'base64'));}
async function submitCorrect(type,index,{wrongReason=false}={}){
 await click(`[data-question="${index}"]`);
 const p=await active(type),q=bank.questions.find(q=>q.id===p.items[index].id);
 if(type==='errors')for(const [i,e] of q.errors.entries())await js(`document.querySelector('#error-row-${i}').value=${JSON.stringify(String(e.row))};document.querySelector('#error-reason-${i}').value=${JSON.stringify(wrongReason?'arithmetic':e.reason)};document.querySelector('#error-step-${i}').value=${JSON.stringify(e.correction)}`);
 await js(`document.querySelector('#answer').value=${JSON.stringify(q.answer)};document.querySelector('#answer-form').requestSubmit()`);
 const after=await active(type),correct=after.responses[q.id].correct;
 const nextQuestion=correct?Array.from({length:after.items.length-1},(_,offset)=>(index+offset+1)%after.items.length).find(i=>!after.responses[after.items[i].id]):undefined;
 assert.equal(await js(`Number(document.querySelector('[data-question][aria-current="true"]').dataset.question)`),nextQuestion??index,'Correct advances; incorrect or completed page stays');
 if(nextQuestion!==undefined){
  assert.equal(await js(`document.activeElement.id`),type==='errors'?'error-row-0':'answer');
  assert.equal(await js(`document.querySelector('#answer').value`),'');
  assert.equal(await js(`document.querySelector('#typed-working').value`),'');
 }
 return q;
}
let bank;
try{
 await send('Page.navigate',{url:'about:blank'});await until('location.href==="about:blank"');await send('Runtime.enable');errors.length=0;await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 await send('Emulation.setDeviceMetricsOverride',{width:1380,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:base});await until('Boolean(document.querySelector("#begin")) || Boolean(document.querySelector("[data-mode]"))');
 await js(`localStorage.removeItem('maths-starters-prototype-v1');localStorage.removeItem('maths-starters-theme');localStorage.removeItem('maths-starters-palette');localStorage.removeItem('maths-starters-theme-adjustments')`);
 await send('Page.reload');await until('Boolean(document.querySelector("#begin"))');
 await click('#begin');await js(`document.querySelector('#username').value='Browser Student';document.querySelector('#profile-form').requestSubmit()`);
 assert.match(await js(`document.querySelector('#profile-message').textContent`),/typos/);
 await js(`document.querySelector('#profile-form').requestSubmit()`);await until('Boolean(document.querySelector("[data-mode]"))');
 bank=await(await fetch(base+'/data/equations.json')).json();
 assert.equal(await js(`Boolean(document.querySelector('#hint')||document.querySelector('#reference')||document.querySelector('.progress-card'))`),false,'Assessment has no hints or learning card');
 assert.equal(await js(`document.querySelectorAll('.question .level-tag').length`),0);
 for(const i of [2,3,0,1])await submitCorrect('assessment',i);
 assert.equal(await js(`Boolean(document.querySelector('#new-page')||document.querySelector('.summary'))`),false,'No repeat assessment card');await screenshot('assessment-desktop');
 await click('[data-mode="demo"]');assert.equal(await js('document.querySelectorAll(".demo-working [data-step]").length'),1);
 assert.equal(await js('document.querySelectorAll(".guidance li").length'),2);
 await click('#demo-play');await until(`document.querySelector('#demo-play').textContent==='Replay'`);
 assert.equal(await js('document.querySelectorAll(".demo-working [data-step]").length'),3);
 await click('[data-demo-level="2"]');assert.equal(await js('document.querySelectorAll(".guidance li").length'),4);
 await click('#demo-next');assert.match(await js('document.querySelector(".demo-working").textContent'),/every term/);
 await js(`document.querySelector('#demo-example').value='recap';document.querySelector('#demo-example').dispatchEvent(new Event('change'))`);await click('#demo-next');assert.match(await js('document.querySelector(".demo-working").textContent'),/3 is a common factor/);
 await screenshot('demo-desktop');await click('#demo-play');await click('[data-mode="scaffolded"]');
 assert.equal(await js('document.querySelectorAll(".guidance li").length'),2);
 await js(`document.querySelector('#level').value='2';document.querySelector('#level').dispatchEvent(new Event('change'))`);assert.equal(await js('document.querySelectorAll(".guidance li").length'),4);
 await js(`document.querySelector('#typed-working').value='draft method';document.querySelector('#typed-working').dispatchEvent(new Event('input'))`);
 await click('#paper');assert.equal(await js('document.querySelector("#working-tools").hidden'),true);await click('#paper');assert.equal(await js('document.querySelector("#working-tools").hidden'),false);assert.equal(await js('document.querySelector("#typed-working").value'),'draft method');
 await click('#paper');await send('Page.reload');await until('Boolean(document.querySelector("[data-mode]"))');assert.equal(await js('document.querySelector("#paper").checked'),false);
 await click('[data-mode="plain"]');
 const positions=[];
 for(let i=0;i<10;i++){await click(`[data-question="${i}"]`);positions.push(await js(`({height:document.querySelector('.question-panel').getBoundingClientRect().height,answer:document.querySelector('#answer').getBoundingClientRect().top+scrollY})`));}
 assert.ok(Math.max(...positions.map(p=>p.height))-Math.min(...positions.map(p=>p.height))<.5,'Question panel height stable');
 assert.ok(Math.max(...positions.map(p=>p.answer))-Math.min(...positions.map(p=>p.answer))<.5,'Answer position stable');
 for(let i=0;i<10;i++){await submitCorrect('plain',i);if(i===5){const p=await active('plain');assert.equal(p.level,1);assert.equal(p.items[6].promoted,true);assert.equal(await js('document.querySelectorAll(".level-tag").length'),4);}}
 assert.equal((await state()).profiles[0].tracks.plain.level,1);await screenshot('complete-desktop');
 await send('Page.reload');await until('Boolean(document.querySelector("[data-mode]"))');await click('[data-mode="plain"]');assert.equal((await active('plain')).complete,true);
 await click('#new-page');await click('#hint');let pg=await active('plain'),q=bank.questions.find(q=>q.id===pg.items[0].id);
 await click('[data-question="1"]');await click('[data-question="0"]');assert.equal((await active('plain')).assisted[q.id],true);
 const before=(await state()).profiles[0].tracks.plain.histories[1].length;await submitCorrect('plain',0);assert.equal((await state()).profiles[0].tracks.plain.histories[1].length,before);
 await click('[data-question="1"]');await click('#reference');assert.equal(await js('Boolean(document.querySelector(".reference"))'),true);await screenshot('reference-desktop');await click('#close-reference');
 await click('[data-mode="errors"]');q=await submitCorrect('errors',0,{wrongReason:true});assert.equal((await active('errors')).responses[q.id].correct,false);assert.equal((await active('errors')).responses[q.id].answerCorrect,true);
 await submitCorrect('errors',1);await submitCorrect('errors',2);await click('#new-page');
 await js(`document.querySelector('#level').value='2';document.querySelector('#level').dispatchEvent(new Event('change'))`);
 for(let i=0;i<3;i++)await submitCorrect('errors',i);
 await js(`window.originalRandom=Math.random;Math.random=()=>0`);await click('#new-page');await js(`Math.random=window.originalRandom`);
 pg=await active('errors');const index=pg.items.findIndex(item=>bank.questions.find(q=>q.id===item.id).errors.length===2);assert.ok(index>=0);
 await click(`[data-question="${index}"]`);assert.equal(await js('document.querySelectorAll(".error-entry").length'),2);assert.equal(await js('document.querySelectorAll(".row-number").length'),6);await screenshot('two-errors-desktop');
 const choice=bank.questions.find(q=>q.id===pg.items[index].id).errors[0];
 await js(`document.querySelector('#error-row-0').value=${JSON.stringify(String(choice.row))};document.querySelector('#error-row-0').dispatchEvent(new Event('change'))`);
 await click('#reference');await click('#close-reference');assert.equal(await js('document.querySelector("#error-row-0").value'),String(choice.row),'Reference preserves unsubmitted error selections');
 q=await submitCorrect('errors',index);assert.equal((await active('errors')).responses[q.id].correct,true);
 // Check both desktop and narrow layouts without making the selectors too narrow.
 for(const width of [1380,1000,768,600,390,320]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});await click('[data-mode="plain"]');
  const dimensions=await js(`(()=>{const grid=getComputedStyle(document.querySelector('.question-list')).gridTemplateColumns.split(' ');return {columns:grid.length,widths:[...document.querySelectorAll('.question')].map(el=>el.getBoundingClientRect().width),overflow:document.documentElement.scrollWidth>innerWidth}})()`);
  assert.equal(dimensions.overflow,false,`No overflow at ${width}`);if(dimensions.columns===2)assert.ok(dimensions.widths.every(w=>w>=210),`210px minimum at ${width}`);
 }
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await click('[data-mode="errors"]');assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true,'Error form fits mobile');await screenshot('errors-mobile');await click('[data-mode="plain"]');await click('[data-question="2"]');await click('#reference');assert.equal(await js('Boolean(document.querySelector("dialog[open] .demo-body"))'),true);await screenshot('reference-mobile');await click('#dismiss-demo');
 await js(`document.querySelector('#working').scrollIntoView({block:'center'})`);
 const rect=await js(`(()=>{const r=document.querySelector('#working').getBoundingClientRect();return {x:r.x+20,y:r.y+20}})()`);
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:rect.x,y:rect.y,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:rect.x+60,y:rect.y+25,button:'left',buttons:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:rect.x+60,y:rect.y+25,button:'left',clickCount:1});
 assert.equal(await js(`document.querySelector('#working').getContext('2d').getImageData(0,0,700,460).data.some((v,i)=>i%4===3&&v>0)`),true);await click('#paper');await click('#paper');assert.equal(await js(`document.querySelector('#working').getContext('2d').getImageData(0,0,700,460).data.some((v,i)=>i%4===3&&v>0)`),true);
 await click('[data-question="3"]');assert.equal(await js(`document.querySelector('#working').getContext('2d').getImageData(0,0,700,460).data.some((v,i)=>i%4===3&&v>0)`),false);
 await click('#theme-picker');assert.equal(await js('document.querySelectorAll("[data-theme-choice]").length'),8);
 for(const mode of ['light','dark'])for(const palette of ['sage','blue','rose','apricot']){
  await click(`[data-theme-choice="${mode}:${palette}"]`);assert.equal(await js('document.documentElement.dataset.palette'),palette);assert.equal(await js('document.documentElement.dataset.theme'),mode);
 }
 await click('[data-theme-choice="dark:blue"]');await js(`document.querySelector('#theme-saturation').value='70';document.querySelector('#theme-saturation').dispatchEvent(new Event('input'))`);await screenshot('theme-mobile');
 await js('document.querySelector("#theme-menu").hidePopover()');await screenshot('practice-mobile-dark');
 await send('Page.reload');await until('Boolean(document.querySelector("[data-mode]"))');assert.equal(await js('document.documentElement.dataset.palette'),'blue');assert.equal(await js('document.querySelector("#theme-saturation").value'),'70');
 await click('#theme-toggle');assert.equal(await js('document.documentElement.dataset.theme'),'light');
 await click('footer a');await until('location.pathname.endsWith("about.html")');assert.match(await js('document.body.textContent'),/Joe Hudson/);assert.match(await js('document.body.textContent'),/agent-augmented/);assert.equal(await js('document.documentElement.dataset.palette'),'blue');
 await send('Page.navigate',{url:base});await until('Boolean(document.querySelector("[data-mode]"))');await click('#profile-button');await js(`document.querySelector('#username').value='Another Student';document.querySelector('#profile-form').requestSubmit();document.querySelector('#profile-form').requestSubmit()`);
 const s=await state();assert.equal(s.profiles.find(p=>p.key===s.last).history.length,0);assert.ok(s.profiles[0].history.length>0);
 await click('[data-mode="plain"]');await js(`document.querySelector('#answer').value='1/0';document.querySelector('#answer-form').requestSubmit()`);assert.equal((await active('plain')).count,0);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await click('[data-mode="demo"]');await click('#demo-next');assert.equal(await js(`getComputedStyle(document.querySelector('.demo-working')).animationName`),'none');
 assert.deepEqual(errors,[]);console.log('Browser checks passed: correct-answer advancement, wrap/skip, focus and draft reset; incorrect/final answer stays; assessment completion; animated/tailored methods; paper collapse/reset; stable selectors and answer position; promotion/persistence/assistance; per-error marking including two errors; 210px layouts at six widths; drawing; eight themes/adjustments; About; profile isolation; reduced motion.');
}catch(error){console.error('Browser diagnostics:',errors,await js(`document.querySelector('#main').textContent.slice(0,500)`));throw error;}finally{ws.close();}
