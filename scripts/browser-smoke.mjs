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
try{
 await send('Page.navigate',{url:'about:blank'});await until('location.href==="about:blank"');await send('Runtime.enable');errors.length=0;await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Emulation.setDeviceMetricsOverride',{width:1380,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:base});await until('Boolean(document.querySelector("#begin")) || Boolean(document.querySelector("[data-mode]"))');
 await js(`localStorage.removeItem('maths-starters-prototype-v1');localStorage.removeItem('maths-starters-theme')`);await send('Page.reload');await until('Boolean(document.querySelector("#begin"))');
 await click('#begin');await js(`document.querySelector('#username').value='Browser Student';document.querySelector('#profile-form').requestSubmit()`);assert.match(await js(`document.querySelector('#profile-message').textContent`),/typos/);
 await js(`document.querySelector('#profile-form').requestSubmit()`);await until('Boolean(document.querySelector("[data-mode]"))');
 assert.equal(await js(`Boolean(document.querySelector('#hint')||document.querySelector('#reference'))`),false,'Assessment has no hints');
 await click('[data-mode="demo"]');assert.equal(await js('document.querySelectorAll(".demo-body > .balance tr").length'),1);await click('#demo-next');assert.equal(await js('document.querySelectorAll(".demo-body > .balance tr").length'),2);await screenshot('demo-desktop');
 await click('[data-mode="plain"]');assert.equal((await active('plain')).items.length,10);
 const bank=await(await fetch(base+'/data/equations.json')).json();
 for(let i=0;i<10;i++){
  await click(`[data-question="${i}"]`);const p=await active('plain'),q=bank.questions.find(q=>q.id===p.items[i].id);
  await js(`document.querySelector('#paper').checked=true;document.querySelector('#paper').dispatchEvent(new Event('change'));document.querySelector('#answer').value=${JSON.stringify(q.answer)};document.querySelector('#answer-form').requestSubmit()`);
  if(i===5){const t=await active('plain');assert.equal(t.level,1);assert.equal(t.items[6].level,1);assert.equal(t.items[0].level,0);}
 }
 let s=await state(),p=s.profiles[0];assert.equal(p.tracks.plain.level,1);assert.equal(p.history.length,10);await screenshot('complete-desktop');
 await send('Page.reload');await until('Boolean(document.querySelector("[data-mode]"))');await click('[data-mode="plain"]');assert.equal((await active('plain')).complete,true);
 await click('#new-page');await click('#hint');let pg=await active('plain'),q=bank.questions.find(q=>q.id===pg.items[0].id);
 await js(`document.querySelector('#typed-working').value='draft';document.querySelector('#typed-working').dispatchEvent(new Event('input'))`);
 await click('[data-question="1"]');assert.equal(await js(`document.querySelector('#typed-working').value`),'');await click('[data-question="0"]');assert.equal((await active('plain')).assisted[q.id],true);
 const before=(await state()).profiles[0].tracks.plain.histories[1].length;
 await js(`document.querySelector('#answer').value=${JSON.stringify(q.answer)};document.querySelector('#answer-form').requestSubmit()`);
 assert.equal((await state()).profiles[0].tracks.plain.histories[1].length,before);
 await click('[data-question="1"]');await click('#reference');assert.equal(await js('Boolean(document.querySelector(".reference"))'),true);await screenshot('reference-desktop');await click('#close-reference');
 await click('[data-mode="errors"]');pg=await active('errors');q=bank.questions.find(q=>q.id===pg.items[0].id);const row=q.balance.findIndex((r,i)=>JSON.stringify(r)!==JSON.stringify(q.correct_balance[i]));
 await js(`document.querySelector('#error-row').value=${JSON.stringify(String(row))};document.querySelector('#answer').value=${JSON.stringify(q.answer)};document.querySelector('#answer-form').requestSubmit()`);
 assert.equal((await active('errors')).responses[q.id].correct,true);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await click('[data-mode="plain"]');await click('[data-question="2"]');await click('#reference');assert.equal(await js('Boolean(document.querySelector("dialog[open] .demo-body"))'),true);await screenshot('reference-mobile');await click('#dismiss-demo');
 assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true,'No mobile horizontal overflow');
 // Use pointer events through Chrome, not only synthetic click handlers.
 await js(`document.querySelector('#working').scrollIntoView({block:'center'})`);
 const rect=await js(`(()=>{const r=document.querySelector('#working').getBoundingClientRect();return {x:r.x+20,y:r.y+20}})()`);
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:rect.x,y:rect.y,button:'left',clickCount:1});
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:rect.x+60,y:rect.y+25,button:'left',buttons:1});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:rect.x+60,y:rect.y+25,button:'left',clickCount:1});
 assert.equal(await js(`document.querySelector('#working').getContext('2d').getImageData(0,0,700,460).data.some((v,i)=>i%4===3&&v>0)`),true);
 await click('[data-question="3"]');assert.equal(await js(`document.querySelector('#working').getContext('2d').getImageData(0,0,700,460).data.some((v,i)=>i%4===3&&v>0)`),false);
 await click('[data-mode="demo"]');assert.equal((await active('plain')).assisted[(await active('plain')).items[3].id],true);
 await click('[data-mode="plain"]');await js(`document.querySelector('#answer').focus()`);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 assert.ok(await js(`document.activeElement.tagName==='BUTTON'`));
 await click('#theme');await screenshot('practice-mobile-dark');
 await click('#profile-button');await js(`document.querySelector('#username').value='Another Student';document.querySelector('#profile-form').requestSubmit();document.querySelector('#profile-form').requestSubmit()`);
 s=await state();assert.equal(s.profiles.find(p=>p.key===s.last).history.length,0);assert.ok(s.profiles[0].history.length>0);
 await click('[data-mode="plain"]');await js(`document.querySelector('#answer').value='1/0';document.querySelector('#answer-form').requestSubmit()`);assert.equal((await active('plain')).count,0);assert.match(await js(`document.querySelector('#input-message').textContent`),/Enter a number/);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await click('[data-mode="demo"]');await click('#demo-next');assert.equal(await js(`getComputedStyle(document.querySelector('.reveal')).animationName`),'none');
 assert.deepEqual(errors,[]);console.log('Browser checks passed: profile/typo flow, assessment isolation, animation, 10-question promotion and replacement, reload, assistance, discarded work, error marking, desktop/mobile reference, dark theme, profile isolation, invalid input and reduced motion.');
}catch(error){console.error('Browser diagnostics:',errors,await js(`document.querySelector('#main').textContent.slice(0,500)`));throw error;}finally{ws.close();}
