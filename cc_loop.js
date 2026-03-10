// ── CURSED CLASH · cc_loop.js ── Main animation loop
// To add a new state: add else-if branch in loop(), add draw call here
// ── MAIN LOOP ──
let lastT=performance.now();
// ── PERF: FPS tracker — when FPS drops below 45, lowPerf=true to skip expensive effects ──
let lowPerf=false,_fpsSmooth=60,_perfCheck=0;
// Performance: skip frame if tab hidden (document.hidden) to save CPU
function loop(now){
  if(document.hidden){requestAnimationFrame(loop);return;}
  const dt=Math.min(now-lastT,50);lastT=now;
  _fpsSmooth=_fpsSmooth*0.94+(1000/dt)*0.06;
  _perfCheck+=dt;
  if(_perfCheck>900){_perfCheck=0;lowPerf=_fpsSmooth<45;}
  ctx.save();ctx.translate(shakeX,shakeY);

  if(state==='mainmenu')drawMainMenu();
  else if(state==='playmenu')drawPlayMenu();
  else if(state==='infopage')drawInfoPage();
  else if(state==='patchnotes')drawPatchNotes();
  else if(state==='historypage')drawHistoryPage();
  else if(state==='keybinds')drawKeybindsPage();
  else if(state==='characterselect')drawSelect();
  else if(state==='vowselect')drawVowSelect();
  else if(state==='aidiffselect')drawAIDiffMenu();
  else if(state==='countdown'){
    const prevSecs=Math.ceil((countdownTimer+dt)/1000);
    const nowSecs=Math.ceil(countdownTimer/1000);
    countdownTimer-=dt;
    if(nowSecs!==prevSecs&&nowSecs>=1&&nowSecs<=3)SFX.countdown();
    if(countdownTimer<0&&countdownTimer+dt>=0)SFX.fight();
    drawCountdown();if(countdownTimer<=-600)state='playing';
  }
  else if(state==='playing'){
    if(gameMode==='bindedbattle'){
      const prevOT=bindedMatchTimer<60000;
      bindedMatchTimer+=dt;
      if(prevOT&&bindedMatchTimer>=60000){SFX.overtimeAlert();addFX({type:'bigText',x:W/2,y:H/2-40,text:'⏱ OVERTIME — DAMAGE ×1.5',color:'#ff8800',t:2500});addFX({type:'screenFlash',color:'#ff4400',t:400,alpha:0.22,dur:400});}
    }
    // Hit freeze — skip player physics only; FX + domain clash still tick
    const _frozen=hitFreezeTimer>0;
    if(_frozen)hitFreezeTimer=Math.max(0,hitFreezeTimer-dt);
    drawBackground();updateFX(dt);updateDomainClash(dt);
    if(!_frozen){p1.update(dt,p2);p2.update(dt,p1);if(aiEnabled)updateAI(dt);}
    drawFX();p1.draw();p2.draw();drawHUD();drawDomainClash();
    if(trainingMode)drawTrainingOverlay();
    // Training: dummy auto-respawns; P1 death resets the session
    if(trainingMode){
      if(p2&&p2.hp<=0){
        p2.maxHp=roundHP(1);p2.hp=p2.maxHp;p2.stunned=0;p2.x=W-200-PW;p2.y=FLOOR-PH;p2.vx=0;p2.vy=0;
        p2.ult=0;p2.ultActive=false;p2.ultTimer=0;p2.domainActive=false;
        p2.cooldowns=[0,0,0,0];p2.blackHoleOrb=null;
        effects=effects.filter(e=>e.owner!==p2&&e.ownerId!==p2.num);
        domainClash=null;
        spawnParticles(W-200-PW+PW/2,FLOOR-PH,'#ffffff',18);
        addFX({type:'bigText',x:W-200-PW+PW/2,y:FLOOR-PH-30,text:'DUMMY RESET',color:'#aaaaaa',t:900});
      }
      if(p1&&p1.hp<=0)resetTraining();
    } else if(!domainClash&&(p1.hp<=0||p2.hp<=0)){endRound(p1.hp<=0?2:1);}
  }
  else if(state==='roundend'){drawRoundEnd();}
  else if(state==='matchover'){drawBackground();updateFX(dt);drawFX();if(p1&&p2){p1.draw();p2.draw();}drawMatchOver();}

  ctx.restore();
  if(state!=='playing')drawCursor();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);