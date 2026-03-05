// ── CURSED CLASH · cc_combat.js ── Domain clash system
// ── DOMAIN CLASH ──
function tryActivateDomain(player,opp){
  // Star Rage: re-pressing ult detonates black hole orb
  if(player.charName==='Star Rage'&&player.blackHoleOrb&&!player.blackHoleOrb.active&&player.blackHoleOrb.t>0){
    player.blackHoleOrb.active=true;
    player.blackHoleOrb.t=10000;
    spawnParticles(player.blackHoleOrb.x,player.blackHoleOrb.y,player.color,120);
    addFX({type:'screenFlash',color:player.color,t:400,alpha:0.6,dur:400});
    addFX({type:'domainText',text:'Black Hole',sub:'SINGULARITY UNLEASHED',color:player.color,t:2800});
    addFX({type:'screenShake',t:600,mag:18});
    return;
  }
  if(player.ult<MAX_ULT)return;
  if(player.ultActive)return;
  if((player.vow==='discharged'||player.vow==='overwhelming')&&player.vowData.ultUsed)return;
  if(player.cantClash()||opp.cantClash()){player.ult=0;player.useSkill(3,opp,true);return;}
  // If either player has Overwhelming, they win the clash
  if(player.vow==='overwhelming'&&!player.vowData.ultUsed){player.vowData.ultUsed=true;player.ult=0;opp.ult=0;player.useSkill(3,opp,true);addFX({type:'bigText',x:W/2,y:H/2-30,text:'💥 OVERWHELMING — P'+player.num+' WINS CLASH',color:'#aa44ff',t:2200});SFX.domain();return;}
  if(opp.vow==='overwhelming'&&!opp.vowData.ultUsed){opp.vowData.ultUsed=true;player.ult=0;opp.ult=0;opp.useSkill(3,player,true);addFX({type:'bigText',x:W/2,y:H/2-30,text:'💥 OVERWHELMING — P'+opp.num+' WINS CLASH',color:'#aa44ff',t:2200});SFX.domain();return;}
  const now=Date.now();
  const other=player.num===1?pendingDomainP2:pendingDomainP1;
  if(player.num===1)pendingDomainP1=now;else pendingDomainP2=now;
  if(other&&(now-other)<=CLASH_WINDOW){player.ult=0;opp.ult=0;pendingDomainP1=null;pendingDomainP2=null;startDomainClash();}
  else{const saved=now;setTimeout(()=>{const mp=player.num===1?pendingDomainP1:pendingDomainP2;if(mp===saved){if(player.num===1)pendingDomainP1=null;else pendingDomainP2=null;player.useSkill(3,opp,true);}},CLASH_WINDOW+80);}
}
function startDomainClash(){domainClash={active:true,timer:CLASH_DUR,p1k:0,p2k:0,phase:'fight'};SFX.domainClash();spawnParticles(W/2,H/2,'#fff',100);addFX({type:'screenFlash',color:'#aa44ff',t:400,alpha:0.6,dur:400});addFX({type:'domainText',text:'⚡ DOMAIN CLASH ⚡',sub:'SPAM YOUR SKILL KEYS NOW!',color:'#ffffff',t:2200});}
function updateDomainClash(dt){if(!domainClash||!domainClash.active)return;domainClash.timer-=dt;if(domainClash.timer<=0&&domainClash.phase==='fight'){domainClash.phase='result';domainClash.timer=2500;const w=domainClash.p1k>=domainClash.p2k?p1:p2,l=w===p1?p2:p1;w.useSkill(3,l,true);l.ult=0;spawnParticles(W/2,H/2,w.color,140);domainClash.winner=w.num;}else if(domainClash.timer<=0&&domainClash.phase==='result'){domainClash=null;}}

function drawDomainClash(){
  if(!domainClash)return;
  ctx.save();ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
  const PX=W/2-440,PY=H/2-155,PW2=880,PH2=310;
  ctx.fillStyle='#04000c';ctx.strokeStyle='#9933ff';ctx.lineWidth=2;ctx.fillRect(PX,PY,PW2,PH2);ctx.strokeRect(PX,PY,PW2,PH2);
  if(domainClash.phase==='fight'){
    const ratio=domainClash.timer/CLASH_DUR;
    txt('⚡ DOMAIN CLASH ⚡',W/2,PY+50,36,'#fff');
    ctx.fillStyle='#111';ctx.fillRect(PX+20,PY+62,PW2-40,16);
    ctx.fillStyle=ratio>0.5?'#00ff88':(ratio>0.25?'#ffaa00':'#ff3300');ctx.fillRect(PX+20,PY+62,(PW2-40)*ratio,16);
    ctx.strokeStyle='#222';ctx.lineWidth=1;ctx.strokeRect(PX+20,PY+62,PW2-40,16);
    txt('P1: spam [1][2][3]   —   P2: spam [7][8][9]',W/2,PY+97,13,'#888');
    const mx=Math.max(domainClash.p1k,domainClash.p2k,1);
    txt('P1 · '+p1.charName,PX+20,PY+132,15,p1.color,'left');
    txt(String(domainClash.p1k),PX+20,PY+205,55,'#fff','left');
    ctx.fillStyle='#111';ctx.fillRect(PX+20,PY+217,330,13);ctx.fillStyle=p1.color;ctx.shadowColor=p1.color;ctx.shadowBlur=8;ctx.fillRect(PX+20,PY+217,330*(domainClash.p1k/mx),13);
    ctx.shadowBlur=0;txt(p2.charName+' · P2',PX+PW2-20,PY+132,15,p2.color,'right');
    txt(String(domainClash.p2k),PX+PW2-20,PY+205,55,'#fff','right');
    ctx.fillStyle='#111';ctx.fillRect(PX+PW2-350,PY+217,330,13);ctx.fillStyle=p2.color;ctx.shadowColor=p2.color;ctx.shadowBlur=8;const b2=330*(domainClash.p2k/mx);ctx.fillRect(PX+PW2-350+330-b2,PY+217,b2,13);
    ctx.shadowBlur=0;txt('VS',W/2,PY+205,32,'#aa44ff');
  }else{const wp=domainClash.winner===1?p1:p2;txt('P'+wp.num+' WINS THE CLASH',W/2,PY+120,40,wp.color);txt(wp.def.skills[3].name+' ACTIVATES',W/2,PY+165,20,'#888');txt('P1: '+domainClash.p1k+' hits  —  P2: '+domainClash.p2k+' hits',W/2,PY+210,14,'#555');}
  ctx.restore();
}