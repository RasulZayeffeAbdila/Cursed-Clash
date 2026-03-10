// ── CURSED CLASH · cc_ai.js ── Player vs AI mode
// -------------------------------------------------
// To change AI behaviour:  edit AI_PROFILES or updateAI()
// To add a new difficulty: add profile + button in drawAIDiffMenu()
// Unclassified unlock:     localStorage key 'cc_unclassified'
// -------------------------------------------------

let aiEnabled    = false;
let aiDifficulty = 'grade3';
let aiTimer      = 0;
let aiSkillTimer = 0;
let aiJumpTimer  = 0;
let aiRetreatTimer = 0;
let aiDodgeTimer = 0;   // cooldown between dodge attempts

// reactionMs   : min ms between any AI action
// skillChance  : probability of using a skill when eligible
// jumpChance   : probability of jumping each jump-tick
// optimalRange : preferred combat distance (px)
// ultChance    : probability of activating ult when full
const AI_PROFILES = {
  grade3:       { reactionMs:500, skillChance:0.38, jumpChance:0.14, optimalRange:185, ultChance:0.22, aggressMs:520 },
  grade1:       { reactionMs:230, skillChance:0.68, jumpChance:0.36, optimalRange:150, ultChance:0.52, aggressMs:280 },
  special:      { reactionMs:85,  skillChance:0.92, jumpChance:0.55, optimalRange:120, ultChance:0.80, aggressMs:110 },
  unclassified: { reactionMs:30,  skillChance:0.99, jumpChance:0.72, optimalRange:100, ultChance:0.98, aggressMs:40  }
};

function aiIsUnlocked(diff){
  if(diff!=='unclassified')return true;
  try{return JSON.parse(localStorage.getItem('cc_unclassified')||'false');}catch(e){return false;}
}
function aiUnlockUnclassified(){
  try{localStorage.setItem('cc_unclassified','true');}catch(e){}
}
function resetAI(){
  aiEnabled=false;
  aiTimer=0;aiSkillTimer=0;aiJumpTimer=0;aiRetreatTimer=0;aiDodgeTimer=0;
}

// ── PROJECTILE THREAT DETECTION ──
// Returns true if a dangerous projectile's hitbox is on a collision course with p2
function aiProjectileThreat(){
  if(!p2||!effects)return false;
  const THREAT_TYPES=['massOrb','nail','redOrb','hollowPurple','resonanceOrb','crossSlash','ironBall'];
  const p2L=p2.x, p2R=p2.x+PW, p2T=p2.y, p2B=p2.y+PH;
  for(let i=0;i<effects.length;i++){
    const e=effects[i];
    if(!THREAT_TYPES.includes(e.type))continue;
    if(e.owner===p2||e.hit)continue;
    const dx=p2.cx-e.x;
    if(Math.sign(e.vx)!==Math.sign(dx))continue; // moving away, no threat
    const dist=Math.abs(dx);
    if(dist>400)continue;
    // Hitbox-aware vertical check: use projectile radius or half-height
    const er=e.r||e.h/2||14;
    const eT=e.y-er, eB=e.y+er;
    if(eB>=p2T-24&&eT<=p2B+24)return true;
  }
  return false;
}

// ── MAIN AI TICK ──
function updateAI(dt){
  if(!aiEnabled||!p1||!p2||state!=='playing')return;

  // ── DOMAIN CLASH — Rhythm highway, difficulty-scaled note hitting ──
  // AI schedules each note once: timing offset + miss rate based on difficulty.
  // Grade 3 misses often and hits late/early. Unclassified almost always PERFECT.
  if(domainClash&&domainClash.active&&domainClash.phase==='fight'){
    const elapsed=domainClash.elapsed;
    const _spread={grade3:210,grade1:95,special:42,unclassified:16}[aiDifficulty]||210;
    const _missRate={grade3:0.32,grade1:0.14,special:0.05,unclassified:0.01}[aiDifficulty]||0.32;
    domainClash.p2Notes.forEach(n=>{
      if(n.hit||n.missed)return;
      // Schedule once: decide if AI will attempt and at what time
      if(!n.aiScheduled){
        n.aiScheduled=true;
        if(Math.random()<_missRate)return; // intentional miss on lower difficulties
        n.aiHitAt=n.time+(Math.random()-0.5)*2*_spread;
        n.aiHitFired=false;
      }
      if(n.aiHitAt!=null&&!n.aiHitFired&&elapsed>=n.aiHitAt){
        n.aiHitFired=true;
        rhythmClashKeyHit(2,n.lane);
      }
    });
    return;
  }

  // ── DOMAIN CLASH REACTION — if P1 just activated a domain, AI reacts to try to clash ──
  // Difficulty scales reaction probability: Grade 3 rarely clashes, Unclassified almost always does
  if(pendingDomainP1&&p2.ult>=MAX_ULT&&!p2.ultActive&&!p2.cantClash()){
    const clashChance={grade3:0.20,grade1:0.55,special:0.85,unclassified:0.98}[aiDifficulty]||0.20;
    if(Math.random()<clashChance){
      tryActivateDomain(p2,p1);
      aiTimer=50;return;
    }
  }

  const prof = AI_PROFILES[aiDifficulty]||AI_PROFILES.grade3;
  aiTimer        = Math.max(0,aiTimer-dt);
  if(p2.stunned>0||p2.infiniteVoidActive)return;
  aiSkillTimer   = Math.max(0,aiSkillTimer-dt);
  aiJumpTimer    = Math.max(0,aiJumpTimer-dt);
  aiRetreatTimer = Math.max(0,aiRetreatTimer-dt);
  aiDodgeTimer   = Math.max(0,aiDodgeTimer-dt);

  // AI never blocks — it relies on positioning and dodging
  p2.blocking=false;

  if(aiTimer>0)return;

  const dist   = Math.abs(p2.cx-p1.cx);
  const opt    = prof.optimalRange;
  const facing = p2.cx>p1.cx?-1:1;
  const hpRatio= p2.hp/p2.maxHp;
  p2.facing=facing;

  // ── PROJECTILE DODGE — highest priority ──
  // Hitbox-aware: bot sees exact projectile bounds and evades decisively
  const dodgeSkillChance={ grade3:0.22, grade1:0.55, special:0.82, unclassified:0.99 };
  if(aiProjectileThreat()&&aiDodgeTimer<=0){
    if(Math.random()<(dodgeSkillChance[aiDifficulty]||0.22)){
      const dashStr=aiDifficulty==='unclassified'?12:(aiDifficulty==='special'?9:7);
      if(p2.onGround){
        // Jump + backdash
        p2.vy=JUMP_VEL;p2.onGround=false;
        p2.vx=-facing*dashStr;
      } else {
        // Mid-air: just dash away
        p2.vx=-facing*dashStr;
      }
      aiDodgeTimer=600+Math.random()*350;
      aiTimer=prof.reactionMs*0.45;
      return;
    }
  }

  // ── MOVEMENT ──
  const moveSpd=aiDifficulty==='unclassified'?11:(aiDifficulty==='special'?9:(aiDifficulty==='grade1'?7.5:6.5));
  if(dist>opt+30){
    p2.vx=facing*moveSpd;
  } else if(dist<opt-30&&aiRetreatTimer<=0){
    p2.vx=-facing*(moveSpd*0.85);
    aiRetreatTimer=prof.aggressMs*(0.8+Math.random()*0.6);
  } else {
    p2.vx=facing*(Math.sin(Date.now()*0.003)*3.5+1.5);
  }

  if(hpRatio<0.35&&Math.random()<0.7) p2.vx=facing*moveSpd*1.3;

  // ── JUMP ──
  if(aiJumpTimer<=0&&p2.onGround&&Math.random()<prof.jumpChance*(dt/180)){
    p2.vy=JUMP_VEL;p2.onGround=false;aiJumpTimer=500+Math.random()*700;
  }

  // ── ULT ──
  if(p2.ult>=MAX_ULT&&!p2.ultActive&&dist<280&&Math.random()<prof.ultChance*(dt/400)){
    tryActivateDomain(p2,p1);aiTimer=prof.reactionMs*1.2;return;
  }

  // ── SKILLS — only fire when actually in range ──
  if(aiSkillTimer<=0&&Math.random()<prof.skillChance*(dt/160)){
    const slot=aiBestSkill(prof,dist);
    if(slot!==null){
      p2.useSkill(slot,p1);
      const followUp=aiDifficulty==='unclassified'?0.72:(aiDifficulty==='special'?0.45:0.15);
      aiSkillTimer=prof.reactionMs*(Math.random()<followUp?0.35:(0.8+Math.random()*0.8));
    }
  }

  aiTimer=prof.reactionMs*(0.55+Math.random()*0.7);
}

// ── SKILL SELECTION — range-gated, never fires out of range ──
function aiBestSkill(prof,dist){
  if(!p2||!p1)return null;
  const char=p2.charName;
  const cds=p2.cooldowns;
  const ready=s=>cds[s]<=0;
  const slots=[0,1,2].filter(ready);
  if(!slots.length)return null;

  // Per-character range gates — if outside effective range, return null entirely
  // This prevents the AI wasting CDs on out-of-range swings
  if(char==='Projection Sorcery'){
    if(dist<380&&ready(0))return 0;   // Flash Step — wide range
    if(dist<320&&ready(1))return 1;   // Barrage
    if(ready(2))return 2;             // Stagnation — ranged, always ok
    return null;
  }
  if(char==='Heavenly Restriction'){
    if(dist>220)return null;          // pure melee — don't swing at range
    if(dist<140&&ready(0))return 0;
    if(dist<230&&ready(2))return 2;
    if(ready(1))return 1;
    return null;
  }
  if(char==='Shrine'){
    if(dist>340)return null;
    if(dist<190&&ready(0))return 0;
    if(dist<340&&ready(1))return 1;
    if(dist<200&&ready(2))return 2;
    return null;
  }
  if(char==='Limitless'){
    if(dist>200&&ready(1))return 1;   // Blue — long range
    if(dist<170&&ready(0))return 0;   // Red — close
    if(ready(2))return 2;             // Purple — always
    return null;
  }
  if(char==='Thunder God'){
    if(dist>300)return null;
    if(dist<160&&ready(0))return 0;
    if(dist<310&&ready(1))return 1;
    if(ready(2))return 2;
    return null;
  }
  if(char==='Fever Dreamer'){
    if(dist>260)return null;
    if(dist<150&&ready(0))return 0;
    if(ready(1))return 1;
    if(ready(2))return 2;
    return null;
  }
  if(char==='Star Rage'){
    if(!p2.blackHoleOrb&&ready(3)&&p2.ult>=MAX_ULT)return 3;
    if(p2.blackHoleOrb){
      const bd=Math.hypot(p2.blackHoleOrb.x-p1.cx,p2.blackHoleOrb.y-p1.cy);
      if(bd<240&&ready(3)&&p2.ult>=MAX_ULT)return 3;
    }
    if(dist>320)return null;
    if(dist<170&&ready(0))return 0;
    if(ready(2))return 2;
    return null;
  }
  if(char==='Straw Doll'){
    if(dist>380)return null;
    if(ready(0))return 0;             // nails — ranged
    if(ready(1))return 1;             // resonance orb
    if(dist<160&&ready(2))return 2;   // blood manip — melee
    return null;
  }
  if(char==='Cursed Vessel'){
    if(dist>170)return null;          // all CV skills are close-range
    if(dist<155&&ready(0))return 0;
    if(dist<165&&ready(2))return 2;
    if(ready(1))return 1;
    return null;
  }
  if(char==='Idle Transfiguration'){
    if(dist>240)return null;
    if(dist<140&&ready(0))return 0;   // Soul Punch — must be close
    if(ready(1))return 1;             // Soul Isomer — always ok (homing)
    if(dist<220&&ready(2))return 2;   // Body Geometry — wide range
    return null;
  }

  // Generic fallback with range gate
  if(dist>300)return null;
  if(dist<150&&ready(0))return 0;
  if(dist<300&&ready(1))return 1;
  if(ready(2))return 2;
  return null;
}

// ── AI DIFFICULTY SELECT SCREEN ──
function drawAIDiffMenu(){
  drawBackground2();
  btn(40,30,110,38,'← BACK','#555');
  ctx.shadowColor='#ff7733';ctx.shadowBlur=24;
  txt('SELECT DIFFICULTY',W/2,90,28,'#ff9955');ctx.shadowBlur=0;
  txt('Bot randomly picks a character · You play as P1',W/2,120,11,'#664422');

  const bw=400,bh=78,bx=W/2-bw/2;
  const diffs=[
    {id:'grade3',      label:'🟢  GRADE 3',      sub:'Slow reactions · Beginner friendly',            col:'#44ff88'},
    {id:'grade1',      label:'🟡  GRADE 1',       sub:'Moderate speed · Solid challenge',              col:'#ffcc00'},
    {id:'special',     label:'🔴  SPECIAL GRADE', sub:'Fast reactions · Aggressive · Tough',           col:'#ff4444'},
    {id:'unclassified',label:'💀  UNCLASSIFIED',  sub:'Inhuman reactions · Near-perfect · UNLOCKABLE', col:'#cc44ff'},
  ];
  diffs.forEach((d,i)=>{
    const by=158+i*(bh+14);
    const locked=!aiIsUnlocked(d.id);
    if(locked){
      ctx.fillStyle='#0a0a0a';ctx.strokeStyle='#332233';ctx.lineWidth=1;
      ctx.fillRect(bx,by,bw,bh);ctx.strokeRect(bx,by,bw,bh);
      txt('🔒  '+d.label,W/2,by+bh/2-4,20,'#443344');
      txt('Beat Shrine on all 3 other difficulties to unlock',W/2,by+bh/2+16,10,'#442244');
    } else {
      btn(bx,by,bw,bh,d.label,d.col,d.sub);
    }
  });
  const u=aiIsUnlocked('unclassified');
  if(u){ctx.shadowColor='#cc44ff';ctx.shadowBlur=12;txt('💀 UNCLASSIFIED UNLOCKED',W/2,580,13,'#dd66ff');ctx.shadowBlur=0;}
  else{txt('Unlock Unclassified: defeat a Shrine bot on Grade 3, Grade 1, and Special Grade',W/2,588,10,'#553355');}
}