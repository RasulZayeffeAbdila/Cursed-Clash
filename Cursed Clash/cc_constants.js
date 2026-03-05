// ── CURSED CLASH · cc_constants.js ──
// Physics, game modes, vows, input setup
// To add a new game mode: add entry to GAME_MODES
// To add a new vow:       add entry to VOWS

// ── SAFE ARC — prevent negative-radius crashes ──
(()=>{
  const _arc=CanvasRenderingContext2D.prototype.arc;
  CanvasRenderingContext2D.prototype.arc=function(x,y,r,s,e,cc){
    if(!isFinite(r)||r<0)r=0.001;
    _arc.call(this,x,y,r,s,e,cc);
  };
  const _ell=CanvasRenderingContext2D.prototype.ellipse;
  CanvasRenderingContext2D.prototype.ellipse=function(x,y,rx,ry,rot,s,e,cc){
    if(!isFinite(rx)||rx<0)rx=0.001;
    if(!isFinite(ry)||ry<0)ry=0.001;
    _ell.call(this,x,y,rx,ry,rot,s,e,cc);
  };
})();

const W=1280,H=720;
const GRAVITY=0.52,FLOOR=600,PW=52,PH=82,MAX_ULT=100,JUMP_VEL=-16.5;
const CLASH_WINDOW=650,CLASH_DUR=4000;

// ── GAME MODES ──
const GAME_MODES={
  casual:      {name:'Casual',       winsNeeded:3, rounds:[200,300,400,500,750]},
  quickplay:   {name:'Quick Play',   winsNeeded:1, rounds:[300]},
  bindedbattle:{name:'Binded Battle',winsNeeded:1, rounds:[500]},
  pvai:        {name:'VS AI',        winsNeeded:3, rounds:[200,300,400,500,750]}
};

// ── BINDING VOWS ──
const VOWS={
  overtime:     {name:'Overtime',           desc:'After 60 seconds, all your damage is ×1.5',                                    color:'#ff8800',icon:'⏱',short:'OVERTIME'},
  enchain:      {name:'Enchain',            desc:'Every 5s: 25% chance to blast 30dmg Shrine burst on opponent',                 color:'#cc1133',icon:'⛓',short:'ENCHAIN'},
  eyeforaleg:   {name:'Eye for a Leg',      desc:'Every 4 damage you receive, the attacker takes 1 damage back',                 color:'#00ccaa',icon:'👁',short:'EYE4LEG'},
  discharged:   {name:'Discharged Energy',  desc:'Start with full ult. After using it once, ult is permanently sealed',          color:'#ffcc00',icon:'⚡',short:'DISCHARGED'},
  overwhelming: {name:'Overwhelming Energy',desc:'Ult auto-fires when ready & always wins domain clashes. Only usable once',     color:'#aa44ff',icon:'💥',short:'OVERWHELMING'},
  adaptation:   {name:'Adaptation',         desc:'Every 100 damage you receive: +10% damage reduction (stacks, max 70%)',        color:'#44ff88',icon:'🛡',short:'ADAPT'},
  cursednull:   {name:'Cursed Nullification',desc:'Instantly gain 20% permanent damage reduction for the whole match',           color:'#88ddff',icon:'❄',short:'NULL-20%'},
  cursedRegen:  {name:'Cursed Regeneration',desc:'Regenerate 10 HP every 5 seconds passively throughout the match',             color:'#55ff99',icon:'💚',short:'REGEN'},
  cursedVitality:{name:'Cursed Vitality',   desc:'Start with +250 bonus HP but deal only 0.9× damage',                          color:'#ffaa44',icon:'💛',short:'VITALITY'}
};
const VOW_KEYS=Object.keys(VOWS);

// ── INPUT ──
const keys={};
let mouseX=W/2,mouseY=H/2;
window.addEventListener('keydown',e=>{if(!keys[e.key]){keys[e.key]=true;onKeyDown(e.key);}e.preventDefault();});
window.addEventListener('keyup',  e=>{keys[e.key]=false;});
document.addEventListener('DOMContentLoaded',()=>{
  const c=document.getElementById('c');
  c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),sx=W/r.width,sy=H/r.height;mouseX=(e.clientX-r.left)*sx;mouseY=(e.clientY-r.top)*sy;});
  c.addEventListener('click',    e=>{const r=c.getBoundingClientRect(),sx=W/r.width,sy=H/r.height;onMouseClick((e.clientX-r.left)*sx,(e.clientY-r.top)*sy);});
  c.addEventListener('wheel',    e=>{if(state==='infopage')infoScroll=Math.max(0,infoScroll+e.deltaY*0.7);if(state==='historypage')histScroll=Math.max(0,histScroll+e.deltaY*0.7);e.preventDefault();},{passive:false});
});