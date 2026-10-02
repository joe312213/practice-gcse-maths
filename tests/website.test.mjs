import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {weights,success,newTrack,newPage,submit,resolveChoice,manualLevel,markAnswer} from '../website/engine.mjs';
import {emptyStore,chooseProfile,load,KEY} from '../website/profiles.mjs';
const answer=(t,p,correct=true,assisted=false)=>submit(t,p,{id:`q${p.count}`,level:p.level,correct,assisted});
test('specified weighted examples, zero padding and short-page denominators',()=>{
 assert.deepEqual(weights(),[1,1,1,1,1,2,2,3,3,3]);
 assert.equal(success(Array(5).fill(true)),1300/18);assert.equal(success(Array(6).fill(true)),1400/18);
 assert.equal(success([true,true,true],3),100);assert.deepEqual(weights(6),[1,1,1,2,2,2]);
 assert.equal(success([],3),0);assert.throws(()=>weights(11));
});
test('six successes start trial; four harder successes confirm; history stays separate',()=>{
 const t=newTrack(),p=newPage();for(let i=0;i<6;i++)answer(t,p);
 assert.equal(p.level,1);assert.equal(t.level,0);assert.equal(p.trial.passed,0);
 for(let i=0;i<4;i++)answer(t,p);
 assert.equal(t.level,1);assert.equal(p.trial,null);assert.equal(p.complete,true);
 assert.equal(t.histories[0].length,6);assert.equal(t.histories[1].length,4);
});
test('failed trial reverts and next page requires five eligible reassessment answers',()=>{
 const t=newTrack(),p=newPage();for(let i=0;i<6;i++)answer(t,p);answer(t,p,false);
 assert.equal(p.level,0);assert.equal(t.reassess,5);for(let i=0;i<3;i++)answer(t,p);
 assert.equal(t.level,0);assert.equal(p.trial,null);assert.equal(t.reassess,5);
 const next=newPage();for(let i=0;i<4;i++)answer(t,next);assert.equal(next.trial,null);
 answer(t,next);assert.equal(t.reassess,0);assert.equal(next.level,1);
});
test('assisted correct is neutral; assisted incorrect counts; duplicate is ignored',()=>{
 const t=newTrack(),p=newPage();answer(t,p);const before=[...t.histories[0]];
 answer(t,p,true,true);assert.deepEqual(t.histories[0],before);
 answer(t,p,false,true);assert.deepEqual(t.histories[0],[true,false]);
 submit(t,p,{id:'q0',level:0,correct:true});assert.equal(p.count,3);
});
test('late promotion with no trial answers requires explicit choice',()=>{
 const t=newTrack(),p=newPage();for(const c of [false,false,false,false,true,true,true,true,true,true])answer(t,p,c);
 assert.equal(p.pendingChoice,true);assert.equal(t.level,0);
 resolveChoice(t,p,false);assert.equal(t.level,0);assert.equal(p.pendingChoice,false);
});
test('one trial answer is insufficient for automatic confirmation',()=>{
 const t=newTrack(),p=newPage();for(const c of [false,false,false,true,true,true,true,true,true,true])answer(t,p,c);
 assert.equal(p.pendingChoice,true);assert.equal(p.trial.passed,1);
 resolveChoice(t,p,true);assert.equal(t.level,1);
});
test('short pages promote with consent; tiny pages need three correct across attempts',()=>{
 const t=newTrack(),p=newPage(3);for(let i=0;i<3;i++)answer(t,p);
 assert.equal(p.pendingChoice,true);resolveChoice(t,p,true);assert.equal(t.level,1);
 const u=newTrack();for(let i=0;i<2;i++){const page=newPage(1);answer(u,page);assert.equal(page.pendingChoice,false);}
 const third=newPage(1);answer(u,third);assert.equal(third.pendingChoice,true);
});
test('Confidence never promotes beyond its boundary; Start offers recap',()=>{
 const t=newTrack(2),p=newPage(10,2);for(let i=0;i<10;i++)answer(t,p);
 assert.equal(t.level,2);assert.equal(p.trial,null);
 const u=newTrack(),q=newPage();for(let i=0;i<5;i++)answer(u,q,false);assert.match(q.notice,/recap/);
});
test('two consecutive lower-level answers reset recommendation; manual upward level is explicit',()=>{
 const t=newTrack(2),p=newPage(10,2);manualLevel(t,p,0);answer(t,p);assert.equal(t.level,2);answer(t,p);assert.equal(t.level,0);
 manualLevel(t,p,1);assert.equal(t.level,1);assert.equal(t.manual,true);
});
test('pending trials survive JSON persistence and cannot be bypassed with manual level',()=>{
 let t=newTrack(),p=newPage();for(let i=0;i<6;i++)answer(t,p);
 [t,p]=JSON.parse(JSON.stringify([t,p]));assert.throws(()=>manualLevel(t,p,2));answer(t,p,false);assert.equal(t.reassess,5);
});
test('exact numeric marking accepts equivalent forms and rejects code/zero denominators',()=>{
 for(const a of ['x = −2.5','-5/2','-2 1/2','-2.500'])assert.deepEqual(markAnswer(a,'-2.5'),{valid:true,correct:true});
 assert.equal(markAnswer('0.3333333333','1/3').correct,false);
 for(const a of ['','1/0','1+2','alert(1)','Infinity','NaN'])assert.equal(markAnswer(a,'3').valid,false);
});
test('local profiles normalise names, suggest typos, remain isolated and preserve malformed storage',()=>{
 const s=emptyStore();assert.deepEqual(chooseProfile(s,'Jo'),{matches:[]});const jo=chooseProfile(s,'Jo',true).profile;
 jo.tracks.plain=newTrack(2);assert.equal(chooseProfile(s,' jo ').profile,jo);
 assert.deepEqual(chooseProfile(s,'Joe'),{matches:['Jo']});const sam=chooseProfile(s,'Sam',true).profile;
 assert.deepEqual(sam.tracks,{});assert.equal(s.last,'sam');
 let writes=0;assert.throws(()=>load({getItem:()=>'{broken',setItem:()=>writes++}));assert.equal(writes,0);
 assert.equal(load({getItem:key=>key===KEY?JSON.stringify(s):null}).profiles.length,2);
});
test('94 stable source questions and full methods survive import; all answers parse',async()=>{
 const bank=JSON.parse(await readFile(new URL('../website/data/equations.json',import.meta.url)));
 assert.equal(bank.questions.length,94);assert.equal(new Set(bank.questions.map(q=>q.id)).size,94);
 for(let l=0;l<3;l++)assert.equal(bank.questions.filter(q=>q.type==='plain'&&q.level===l).length,24);
 for(const q of bank.questions){assert.ok(q.balance.length>=3);assert.equal(markAnswer(q.answer,q.answer).correct,true);if(q.type==='errors')assert.ok(q.correct_balance&&q.correction);}
});
test('short reassessment blocks promotion until its required evidence is collected',()=>{
 const t=newTrack();t.reassess=3;
 const p=newPage(3);answer(t,p);answer(t,p);assert.equal(p.trial,null);assert.equal(t.reassess,1);
 answer(t,p);assert.equal(t.reassess,0);assert.equal(p.pendingChoice,true);
});
test('assisted answers cannot initiate an early promotion from a previously high score',()=>{
 const t=newTrack();t.histories[0]=Array(10).fill(true);const p=newPage();
 for(let i=0;i<5;i++)answer(t,p,true,true);assert.equal(p.trial,null);assert.equal(t.level,0);
});
test('all nine error items have an identifiable first differing method row',async()=>{
 const {questions}=JSON.parse(await readFile(new URL('../website/data/equations.json',import.meta.url)));
 for(const q of questions.filter(q=>q.type==='errors')){
  const row=q.balance.findIndex((r,i)=>JSON.stringify(r)!==JSON.stringify(q.correct_balance[i]));
  assert.ok(row>0, q.id);assert.notEqual(q.answer,q.wrong);
 }
});
