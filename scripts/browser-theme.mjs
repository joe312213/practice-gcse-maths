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
try {
 await send('Page.navigate',{url:base});await until('document.querySelectorAll("[data-theme-choice]").length===8');
 // Check painted colours, not just the attributes written by the controller.
 const results=[];
 for(const mode of ['light','dark'])for(const palette of ['sage','blue','rose','apricot']){
  await click(`[data-theme-choice="${mode}:${palette}"]`);
  results.push(await js(`({mode:document.documentElement.dataset.theme,palette:document.documentElement.dataset.palette,background:getComputedStyle(document.body).backgroundColor,text:getComputedStyle(document.body).color,card:getComputedStyle(document.querySelector('.card')).backgroundImage, saturation:document.querySelector('#theme-saturation').value})`));
 }
 assert.equal(new Set(results.map(result=>result.background)).size,8,'All eight themes visibly change the page background');
 assert.equal(new Set(results.map(result=>result.card)).size,8,'All eight themes visibly change card surfaces');
 const before=results.at(-1);
 await send('Page.reload');await until('document.querySelectorAll("[data-theme-choice]").length===8');
 assert.equal(await js('getComputedStyle(document.body).backgroundColor'),before.background,'Theme survives normal refresh');
 // Exercise actual pointer targeting, rather than only programmatic clicks.
 await click('#theme-picker');
 const bounds=await js(`(()=>{const r=document.querySelector('[data-theme-choice="light:blue"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await send('Input.dispatchMouseEvent',{type:'mousePressed',...bounds,button:'left',clickCount:1});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',...bounds,button:'left',clickCount:1});
 assert.equal(await js('getComputedStyle(document.body).backgroundColor'),results[1].background,'Pointer selection applies the theme');
 console.log('Theme checks passed: eight distinct page/card palettes, cached refresh persistence and pointer selection.');
}finally{ws.close();}
