// ── CURSED CLASH · cc_loop.js ── Main animation loop
// To add a new state: add else-if branch in loop(), add draw call here
// ── MAIN LOOP ──
let lastT=performance.now();
function loop(now){
  const dt=Math.min(now-lastT,50);lastT=now;
  ctx.save();ctx.translate(shakeX,shakeY);

  if(state==='mainmenu')drawMainMenu();
  else if(state==='playmenu')drawPlayMenu();
  else if(state==='infopage')drawInfoPage();
  else if(state==='patchnotes')drawPatchNotes();
  else if(state==='historypage')drawHistoryPage();
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
    drawBackground();updateFX(dt);updateDomainClash(dt);
    p1.update(dt,p2);p2.update(dt,p1);
    if(aiEnabled)updateAI(dt);
    drawFX();p1.draw();p2.draw();drawHUD();drawDomainClash();
    if(!domainClash&&(p1.hp<=0||p2.hp<=0)){endRound(p1.hp<=0?2:1);}
  }
  else if(state==='roundend'){drawRoundEnd();}
  else if(state==='matchover'){drawBackground();updateFX(dt);drawFX();if(p1&&p2){p1.draw();p2.draw();}drawMatchOver();}

  ctx.restore();
  if(state!=='playing')drawCursor();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);