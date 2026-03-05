// ── CURSED CLASH · cc_ai.js ── Player vs AI mode
// ─────────────────────────────────────────────────────────────
// To change AI behaviour:  edit AI_PROFILES or updateAI()
// To add a new difficulty: add profile to AI_PROFILES, add button in cc_ui.js drawAIDiffMenu()
// Unclassified unlock:     stored in localStorage key 'cc_unclassified'
// ─────────────────────────────────────────────────────────────

// ── STATE ──
let aiEnabled    = false;
let aiDifficulty = 'grade3';   // 'grade3' | 'grade1' | 'special' | 'unclassified'
let aiTimer      = 0;          // general action cooldown
let aiSkillTimer = 0;          // skill-use cooldown
let aiJumpTimer  = 0;          // jump cooldown
let aiRetreatTimer = 0;        // retreat/strafe cooldown

// ── DIFFICULTY PROFILES ──
// reactionMs   : min ms between any AI action
// skillChance  : 0-1 probability of using a skill when in range
// jumpChance   : 0-1 probability of jumping each jump-tick
// optimalRange : px distance AI tries to maintain from player
// ultChance    : 0-1 probability of activating domain when ult is full
const AI_PROFILES = {
  // reactionMs: lower = faster responses
  // aggressMs:  how fast it chases when player retreats
  // blockChance: 0-1 chance to briefly block incoming hits
  grade3:       { reactionMs:500, skillChance:0.38, jumpChance:0.14, optimalRange:185, ultChance:0.22, aggressMs:520, blockChance:0.04 },
  grade1:       { reactionMs:230, skillChance:0.68, jumpChance:0.36, optimalRange:150, ultChance:0.52, aggressMs:280, blockChance:0.18 },
  special:      { reactionMs:85,  skillChance:0.92, jumpChance:0.55, optimalRange:120, ultChance:0.80, aggressMs:110, blockChance:0.40 },
  unclassified: { reactionMs:30,  skillChance:0.99, jumpChance:0.72, optimalRange:100, ultChance:0.98, aggressMs:40,  blockChance:0.68 }
};

// ── UNLOCK HELPERS ──
function aiIsUnlocked(diff){
  if(diff!=='unclassified')return true;
  try{return JSON.parse(localStorage.getItem('cc_unclassified')||'false');}catch(e){return false;}
}
function aiUnlockUnclassified(){
  try{localStorage.setItem('cc_unclassified','true');}catch(e){}
}

// ── RESET (called from resetToMenu) ──
function resetAI(){
  aiEnabled=false;
  aiTimer=0; aiSkillTimer=0; aiJumpTimer=0; aiRetreatTimer=0;
}

// ── MAIN AI TICK — called every frame from loop() when aiEnabled ──
function updateAI(dt){
  if(!aiEnabled||!p1||!p2||state!=='playing')return;

  // Always mash keys during domain clash QTE
  if(domainClash&&domainClash.active&&domainClash.phase==='fight'){
    p2.useSkill(0,p1);p2.useSkill(1,p1);p2.useSkill(2,p1);return;
  }

  const prof = AI_PROFILES[aiDifficulty] || AI_PROFILES.grade3;
  aiTimer        = Math.max(0, aiTimer        - dt);
  aiSkillTimer   = Math.max(0, aiSkillTimer   - dt);
  aiJumpTimer    = Math.max(0, aiJumpTimer    - dt);
  aiRetreatTimer = Math.max(0, aiRetreatTimer - dt);

  if(aiTimer > 0) return;

  const dist   = Math.abs(p2.cx - p1.cx);
  const opt    = prof.optimalRange;
  const facing = p2.cx > p1.cx ? -1 : 1;
  const hpRatio = p2.hp / p2.maxHp;   // how healthy the AI is

  // ── FACING ──
  p2.facing = facing;

  // ── BLOCKING — react to player attacking ──
  if(p1.atkAnim > 300 && dist < 180 && !p2.blocking && Math.random() < prof.blockChance){
    p2.blocking = true; p2.blockTimer = 400 + Math.random()*200;
  }

  // ── MOVEMENT — smarter positioning ──
  const moveSpd = aiDifficulty==='unclassified'?8:(aiDifficulty==='special'?6:5);
  if(dist > opt + 30){
    // Too far — advance aggressively
    p2.vx = facing * moveSpd;
  } else if(dist < opt - 30 && aiRetreatTimer <= 0){
    // Too close — back off
    p2.vx = -facing * (moveSpd * 0.7);
    aiRetreatTimer = prof.aggressMs * (0.8 + Math.random()*0.6);
  } else {
    // In sweet spot — small strafe to stay unpredictable
    p2.vx = facing * Math.sin(Date.now()*0.003) * 2;
  }

  // ── LOW HP — become more aggressive (try to turn it around) ──
  if(hpRatio < 0.3 && Math.random() < 0.6){
    p2.vx = facing * moveSpd * 1.3;
  }

  // ── JUMP — dodge/approach jump ──
  if(aiJumpTimer <= 0 && p2.onGround && Math.random() < prof.jumpChance * (dt/180)){
    p2.vy = JUMP_VEL;
    p2.onGround = false;
    aiJumpTimer = 500 + Math.random()*700;
  }

  // ── DOMAIN / ULT — activate when smart ──
  if(p2.ult >= MAX_ULT && !p2.ultActive && dist < 280 && Math.random() < prof.ultChance * (dt/400)){
    tryActivateDomain(p2, p1);
    aiTimer = prof.reactionMs * 1.2;
    return;
  }

  // ── SKILLS — use combos when close ──
  if(aiSkillTimer <= 0 && Math.random() < prof.skillChance * (dt/160)){
    const slot = aiBestSkill(prof, dist);
    if(slot !== null){
      p2.useSkill(slot, p1);
      // Higher difficulties chain a follow-up skill faster
      const followUpChance = aiDifficulty==='unclassified'?0.72:(aiDifficulty==='special'?0.45:0.15);
      aiSkillTimer = prof.reactionMs * (Math.random() < followUpChance ? 0.35 : (0.8 + Math.random()*0.8));
    }
  }

  // ── NEXT REACTION WINDOW ──
  aiTimer = prof.reactionMs * (0.55 + Math.random() * 0.7);
}

// Choose the most appropriate skill slot for current situation
function aiBestSkill(prof, dist){
  if(!p2||!p1)return null;
  const char = p2.charName;
  const cds  = p2.cooldowns;
  const ready = s => cds[s] <= 0;
  const slots = [0,1,2].filter(ready);
  if(!slots.length) return null;

  // ── CHARACTER-SPECIFIC SMART LOGIC ──
  if(char === 'Star Rage'){
    // Throw black hole if none exists
    if(!p2.blackHoleOrb && ready(3) && p2.ult >= MAX_ULT) return 3;
    // Detonate if player is near it
    if(p2.blackHoleOrb){
      const bd = Math.hypot(p2.blackHoleOrb.x - p1.cx, p2.blackHoleOrb.y - p1.cy);
      if(bd < 220 && ready(3) && p2.ult >= MAX_ULT) return 3;
    }
    if(dist < 160 && ready(0)) return 0; // Mass Burst close
    if(ready(2)) return 2;               // Mass Augment
  }
  if(char === 'Projection Sorcery'){
    // Spam Flash Step to build streak
    if(dist < 350 && ready(0)) return 0;
    if(dist > 250 && ready(1)) return 1; // Rapid Barrage at range
    if(ready(2)) return 2;               // Stagnation
  }
  if(char === 'Heavenly Restriction'){
    if(dist < 130 && ready(0)) return 0; // Crushing Blow
    if(dist < 270 && ready(2)) return 2; // Seismic Slam
    if(ready(1)) return 1;               // Iron Guard
  }
  if(char === 'Shrine'){
    if(dist < 180 && ready(0)) return 0; // Cleave
    if(dist < 320 && ready(1)) return 1; // Dismantle (projectile)
    if(ready(2)) return 2;               // Slash Flood
  }
  if(char === 'Limitless'){
    if(dist > 200 && ready(1)) return 1; // Infinity Blue ranged
    if(dist < 160 && ready(0)) return 0; // Divergence close
    if(ready(2)) return 2;               // Hollow Purple
  }
  if(char === 'Thunder God'){
    if(dist < 150 && ready(0)) return 0;
    if(dist < 300 && ready(1)) return 1;
    if(ready(2)) return 2;
  }
  if(char === 'Fever Dreamer'){
    if(dist < 140 && ready(0)) return 0; // Heavy Slug
    if(ready(1)) return 1;               // Iron Ball
    if(ready(2)) return 2;               // Cursed Door
  }

  // ── GENERIC: higher difficulty prioritises by range ──
  if(aiDifficulty === 'special' || aiDifficulty === 'unclassified'){
    if(dist < 150 && ready(0)) return 0;
    if(dist < 320 && ready(1)) return 1;
    if(ready(2)) return 2;
  }

  return slots[Math.floor(Math.random() * slots.length)];
}

// ── AI DIFFICULTY SELECT SCREEN ──
// Called from cc_ui.js drawAIDiffMenu() — drawn when state === 'aidiffselect'
function drawAIDiffMenu(){
  drawBackground2();
  btn(40,30,110,38,'← BACK','#555');
  ctx.shadowColor='#ff7733';ctx.shadowBlur=24;
  txt('SELECT DIFFICULTY',W/2,90,28,'#ff9955');
  ctx.shadowBlur=0;
  txt('Bot randomly picks a character · You play as P1',W/2,120,11,'#664422');

  const bw=400, bh=78, bx=W/2-bw/2;
  const diffs=[
    {id:'grade3',      label:'🟢  GRADE 3',      sub:'Slow reactions · Beginner friendly',         col:'#44ff88'},
    {id:'grade1',      label:'🟡  GRADE 1',       sub:'Moderate speed · Solid challenge',           col:'#ffcc00'},
    {id:'special',     label:'🔴  SPECIAL GRADE', sub:'Fast reactions · Aggressive · Tough',        col:'#ff4444'},
    {id:'unclassified',label:'💀  UNCLASSIFIED',  sub:'Inhuman reactions · Near-perfect · UNLOCKABLE',col:'#cc44ff'},
  ];

  diffs.forEach((d,i)=>{
    const by=158+i*(bh+14);
    const locked=!aiIsUnlocked(d.id);
    if(locked){
      // Greyed-out locked button
      ctx.fillStyle='#0a0a0a';ctx.strokeStyle='#332233';ctx.lineWidth=1;
      ctx.fillRect(bx,by,bw,bh);ctx.strokeRect(bx,by,bw,bh);
      txt('🔒  '+d.label,W/2,by+bh/2-4,20,'#443344');
      txt('Beat Shrine on all 3 other difficulties to unlock',W/2,by+bh/2+16,10,'#442244');
    } else {
      btn(bx,by,bw,bh,d.label,d.col,d.sub);
    }
  });

  // Show unlock hint
  const u=aiIsUnlocked('unclassified');
  if(u){
    ctx.shadowColor='#cc44ff';ctx.shadowBlur=12;
    txt('💀 UNCLASSIFIED UNLOCKED',W/2,580,13,'#dd66ff');
    ctx.shadowBlur=0;
  } else {
    txt('Unlock Unclassified: defeat a Shrine bot on Grade 3, Grade 1, and Special Grade',W/2,588,10,'#553355');
  }
}