// Uses an isolated Chrome profile at port 9238; touches only that test browser's Maths storage.
import assert from 'node:assert/strict';
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
// Simulate an older cached page whose theme markup is incomplete.
try {
 await send('Page.navigate',{url:'about:blank'});await until('location.href==="about:blank"');
 await send('Page.enable');await send('Runtime.enable');errors.length=0;await send('Network.enable');
 await send('Network.setCacheDisabled',{cacheDisabled:false});
 const injected=await send('Page.addScriptToEvaluateOnNewDocument',{source:`
 new MutationObserver(()=>document.querySelector('#theme-previews')?.remove()).observe(document,{childList:true,subtree:true});`});
 await send('Page.navigate',{url:base});
 await new Promise(r=>setTimeout(r,1200));
  await until('Boolean(document.querySelector("[data-mode]")) || Boolean(document.querySelector("#begin"))');
  await click('#profile-button');await js(`document.querySelector('#username').value='Startup check';document.querySelector('#profile-form').requestSubmit();document.querySelector('#profile-form').requestSubmit()`);
  await until('Boolean(document.querySelector("[data-mode]"))');
  assert.deepEqual(errors,[]);
 await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:injected.identifier});
  const saved=await state();
  // An unexpected theme exception must also leave practice and stored profiles usable.
  const fault=await send('Page.addScriptToEvaluateOnNewDocument',{source:`
   const nativeStyle=window.getComputedStyle;
   window.getComputedStyle=function(el,...args){if(el?.classList.contains('theme-swatch'))throw Error('Test theme failure');return nativeStyle.call(this,el,...args);};`});
  await send('Page.reload');await until('Boolean(document.querySelector("[data-mode]"))');
  assert.deepEqual(await state(),saved);
  await until(`document.querySelector('#toast').textContent.includes('Theme controls')`);
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:fault.identifier});
  // Hold the bank request to verify the name form cannot race startup.
  const delay=await send('Page.addScriptToEvaluateOnNewDocument',{source:`
   const nativeFetch=window.fetch;
   window.fetch=(...args)=>String(args[0]).includes('equations.json')?new Promise(resolve=>{window.releaseBank=()=>resolve(nativeFetch(...args));}):nativeFetch(...args);`});
  await send('Page.reload');await until('Boolean(window.releaseBank)');
  assert.equal(await js(`document.querySelector('#profile-button').disabled`),true);
  await js('window.releaseBank()');await until('Boolean(document.querySelector("[data-mode]"))');
  assert.equal(await js(`document.querySelector('#profile-button').disabled`),false);
  assert.deepEqual(await state(),saved);
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:delay.identifier});
  await send('Page.reload');await until('Boolean(document.querySelector("[data-mode]"))');
  await click('[data-mode="plain"]');
  assert.equal(await js(`document.querySelector('.progress-note').textContent`),'recent success at this level');
  assert.deepEqual(errors,[]);
  console.log('Startup checks passed: incomplete theme markup, failed theme setup, delayed bank, cached refresh, saved profile preservation and progress text.');
} catch(error){console.error('Startup diagnostics:',errors,await js(`document.querySelector('#main')?.textContent`));throw error;} finally {ws.close();}
