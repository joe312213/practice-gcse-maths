// Restore the same saved theme on static supporting pages without rendering controls.
try {
 const root=document.documentElement,mode=localStorage.getItem('maths-starters-theme')==='dark'?'dark':'light';
 const saved=localStorage.getItem('maths-starters-palette'),palette=['sage','blue','rose','apricot'].includes(saved)?saved:'sage';
 root.dataset.theme=mode;root.dataset.palette=palette;
 const tweak=JSON.parse(localStorage.getItem('maths-starters-theme-adjustments'))?.[`${mode}:${palette}`];
 if(Number.isFinite(tweak?.saturation)&&Number.isFinite(tweak?.lightness)){
  root.style.setProperty('--theme-saturation',Math.max(0,Math.min(100,tweak.saturation))/100);
  root.style.setProperty('--theme-bg-lightness',Math.max(mode==='light'?55:5,Math.min(mode==='light'?96:45,tweak.lightness))/100);
 }
}catch{}
