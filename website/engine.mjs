// Maths progression is independent of DOM/content, so transitions can be checked directly.
export const LEVELS = ['Start', 'Build', 'Confidence'];
export function weights(size=10) {
  if (!Number.isInteger(size) || size<1 || size>10) throw Error('Page length must be 1–10.');
  return Array.from({length:size},(_,i)=>size===10?(i>=7?3:i>=5?2:1):size>=5&&i>=size-3?2:1);
}
export function success(history=[],size=10) {
  const w=weights(size), values=[...Array(size).fill(false),...history].slice(-size);
  return 100*w.reduce((s,n,i)=>s+n*Number(values[i]),0)/w.reduce((a,b)=>a+b,0);
}
export function newTrack(level=0) {
  return {level,histories:[[],[],[]],reassess:0,lowerCount:0,lowerLevel:null,shortStreak:0};
}
export function newPage(size=10,level=0) {
  return {size,level,count:0,results:{},trial:null,pendingChoice:false,reverted:false,afterRevert:0,streak:0,notice:'',complete:false};
}
export function manualLevel(track,page,level) {
  if(!Number.isInteger(level)||level<0||level>2)throw Error('Unknown challenge level.');
  if(page.trial||page.pendingChoice)throw Error('Finish the current challenge trial first.');
  page.level=level;
  track.lowerCount=0;track.lowerLevel=null;
  if(level>track.level){track.level=level;track.manual=true;}
}
export function submit(track,page,{id,level,correct,assisted=false}) {
  if(page.complete||Object.hasOwn(page.results,id))return {duplicate:true};
  if(level!==page.level)throw Error('Question level does not match the current page.');
  const eligible=!assisted||!correct;
  page.results[id]={level,correct,assisted};page.count++;
  if(eligible){track.histories[level].push(Boolean(correct));track.histories[level]=track.histories[level].slice(-10);}
  page.streak=correct&&!assisted?page.streak+1:0;
  page.notice=page.streak>=3?`Well done, ${page.streak} question streak!`:'';
  if(level<track.level){
    track.lowerCount=track.lowerLevel===level?track.lowerCount+1:1;track.lowerLevel=level;
    if(track.lowerCount>=2){track.level=level;track.lowerCount=0;page.notice=`Your recommended level is now ${LEVELS[level]}.`;}
  }else {track.lowerCount=0;track.lowerLevel=null;}
  if(page.trial){
    if(!correct){
      const from=page.trial.from;track.level=from;page.level=from;page.trial=null;page.reverted=true;page.afterRevert=0;
      track.reassess=page.size<=2?3:Math.min(5,page.size);
      page.notice='You have returned to your previous level. Keep practising; the next page starts with a short reassessment.';
    }else if(!assisted)page.trial.passed++;
  }else if(page.reverted){
    page.afterRevert=correct&&!assisted?page.afterRevert+1:0;
    if(page.afterRevert>=5)track.reassess=0;
  }else if(eligible&&level===track.level&&track.reassess>0)track.reassess--;
  const atRecommended=page.level===track.level;
  if(!page.trial&&atRecommended)track.shortStreak=correct&&!assisted?track.shortStreak+1:0;
  const rate=success(track.histories[track.level],page.size);
  const allPerfect=Object.values(page.results).every(r=>r.correct&&!r.assisted&&r.level===track.level);
  const shortReady=page.size<5&&page.count===page.size&&allPerfect&&(page.size>=3||track.shortStreak>=3);
  const canAdvance=atRecommended&&track.level<2&&track.reassess===0&&(!page.reverted||page.afterRevert>=5);
  if(!page.trial&&canAdvance&&correct&&!assisted&&((page.count>=5&&rate>75)||shortReady)){
    page.trial={from:track.level,to:track.level+1,passed:0};page.level=track.level+1;
    page.notice='Congratulations! Try some more challenging questions.';
  }
  page.complete=page.count===page.size;
  if(page.complete&&page.trial){
    if(page.trial.passed>=2){track.level=page.trial.to;track.shortStreak=0;page.trial=null;page.notice=`Well done! ${LEVELS[track.level]} is now your recommended level.`;}
    else {page.pendingChoice=true;page.notice='Would you like to try harder questions of this type next time?';}
  }
  if(!page.trial&&!page.reverted&&page.count>=Math.min(5,page.size)&&rate<50){
    page.notice=track.level===0?'A method recap could help. Try the worked example before your next question.':'You could try a lower level for a little more practice.';
  }
  return {rate,eligible,level:page.level,notice:page.notice};
}
export function resolveChoice(track,page,accept){
  if(!page.pendingChoice)return;
  track.level=accept?page.trial.to:page.trial.from;page.level=track.level;
  page.pendingChoice=false;page.trial=null;track.shortStreak=0;
  page.notice=accept?`Next time: ${LEVELS[track.level]}.`:'Keep practising at your current level.';
}

// Restricted exact rational grammar, never eval or Function. Handles x=, decimals,
// simple fractions and mixed numbers without floating-point tolerance.
export function rational(raw){
  const value=String(raw).trim().replace(/−/g,'-').replace(/^x\s*=\s*/i,'');
  if(value.length>80)return null;
  const mixed=/^([+-]?)(\d+)\s+(\d+)\/(\d+)$/.exec(value);
  if(mixed){const d=BigInt(mixed[4]);if(!d)return null;return [(mixed[1]==='-'?-1n:1n)*(BigInt(mixed[2])*d+BigInt(mixed[3])),d];}
  const decimal=s=>{if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;const sign=s[0]==='-'?-1n:1n;s=s.replace(/^[+-]/,'');const [a,b='']=s.split('.');return [sign*BigInt((a||'0')+b),10n**BigInt(b.length)];};
  const parts=value.split('/').map(s=>s.trim());if(parts.length>2)return null;
  const a=decimal(parts[0]),b=parts.length===2?decimal(parts[1]):[1n,1n];
  if(!a||!b||b[0]===0n)return null;return [a[0]*b[1],a[1]*b[0]];
}
export function markAnswer(raw,expected){
  const a=rational(raw),b=rational(expected);
  return {valid:Boolean(a&&b),correct:Boolean(a&&b&&a[0]*b[1]===b[0]*a[1])};
}
export const profileKey=name=>String(name).normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-GB');
export function distance(a,b){
  a=profileKey(a);b=profileKey(b);let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=0;i<a.length;i++){const row=[i+1];for(let j=0;j<b.length;j++)row.push(Math.min(row[j]+1,prev[j+1]+1,prev[j]+Number(a[i]!==b[j])));prev=row;}return prev[b.length];
}
