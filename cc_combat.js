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
  if(player.cantClash()||opp.cantClash()){player.ult=0;player.useSkill(3,opp,true);return;}
  if(p1&&p1.domainActive){addFX({type:'bigText',x:player.cx,y:player.cy-50,text:'DOMAIN ALREADY ACTIVE',color:'#ff4422',t:900});return;}
  if(p2&&p2.domainActive){addFX({type:'bigText',x:player.cx,y:player.cy-50,text:'DOMAIN ALREADY ACTIVE',color:'#ff4422',t:900});return;}
  if(player.vow==='domainVow'){player.ult=0;opp.ult=0;player.useSkill(3,opp,true);addFX({type:'bigText',x:W/2,y:H/2-30,text:'🌀 DOMAIN VOW — P'+player.num+' WINS CLASH',color:'#cc44ff',t:2200});SFX.domain();return;}
  if(opp.vow==='domainVow'){player.ult=0;opp.ult=0;opp.useSkill(3,player,true);addFX({type:'bigText',x:W/2,y:H/2-30,text:'🌀 DOMAIN VOW — P'+opp.num+' WINS CLASH',color:'#cc44ff',t:2200});SFX.domain();return;}
  if(player.vow==='overwhelming'){player.vowData.ultUsed=true;player.ult=0;opp.ult=0;player.useSkill(3,opp,true);addFX({type:'bigText',x:W/2,y:H/2-30,text:'💥 OVERWHELMING — P'+player.num+' WINS CLASH',color:'#aa44ff',t:2200});SFX.domain();return;}
  if(opp.vow==='overwhelming'){opp.vowData.ultUsed=true;player.ult=0;opp.ult=0;opp.useSkill(3,player,true);addFX({type:'bigText',x:W/2,y:H/2-30,text:'💥 OVERWHELMING — P'+opp.num+' WINS CLASH',color:'#aa44ff',t:2200});SFX.domain();return;}
  const now=Date.now();
  const other=player.num===1?pendingDomainP2:pendingDomainP1;
  if(player.num===1)pendingDomainP1=now;else pendingDomainP2=now;
  if(other&&(now-other)<=CLASH_WINDOW){player.ult=0;opp.ult=0;pendingDomainP1=null;pendingDomainP2=null;startDomainClash();}
  else{const saved=now;setTimeout(()=>{const mp=player.num===1?pendingDomainP1:pendingDomainP2;if(mp===saved){if(player.num===1)pendingDomainP1=null;else pendingDomainP2=null;player.useSkill(3,opp,true);}},CLASH_WINDOW+80);}
}

function startDomainClash(){
  const FIGHT_DUR=10000; // 10s fight after 1s ready = 11s total
  // 22 notes: sparse at start (first 1.5s), ramp up through middle, ease off last 1s
  function _genNotes(){
    const N=22,notes=[];
    const times=[];
    for(let i=0;i<N;i++){
      const base=1500+(i/(N-1))*7000;
      const jitter=(Math.random()-0.5)*600;
      times.push(Math.max(800,Math.min(FIGHT_DUR-800,base+jitter)));
    }
    times.sort((a,b)=>a-b);
    const noteArr=times.map(t=>({lane:Math.floor(Math.random()*3),time:t,hit:false,missed:false,perfect:false}));
    for(let i=1;i<noteArr.length;i++){
      if(noteArr[i].lane===noteArr[i-1].lane&&noteArr[i].time-noteArr[i-1].time<320)
        noteArr[i].lane=(noteArr[i].lane+1+Math.floor(Math.random()*2))%3;
    }
    return noteArr;
  }
  domainClash={
    active:true,phase:'ready',
    readyTimer:1000,
    fightTimer:FIGHT_DUR,
    fightDur:FIGHT_DUR,
    elapsed:0,
    p1Notes:_genNotes(),p2Notes:_genNotes(),
    p1Score:0,p2Score:0,
    p1Feedback:null,p2Feedback:null
  };
  SFX.domainClash();
  spawnParticles(W/2,H/2,'#fff',100);
  addFX({type:'screenFlash',color:'#aa44ff',t:400,alpha:0.6,dur:400});
  addFX({type:'domainText',text:'⚡ DOMAIN CLASH ⚡',sub:'GET READY…',color:'#ffffff',t:1800});
}

function updateDomainClash(dt){
  if(!domainClash||!domainClash.active)return;
  if(domainClash.phase==='ready'){
    domainClash.readyTimer-=dt;
    if(domainClash.readyTimer<=0){
      domainClash.phase='fight';
      addFX({type:'bigText',x:W/2,y:H/2-30,text:'HIT THE NOTES!',color:'#00ff88',t:900});
    }
    return;
  }
  if(domainClash.phase==='fight'){
    domainClash.fightTimer-=dt;
    domainClash.elapsed+=dt;
    const HIT_WINDOW=110;
    [domainClash.p1Notes,domainClash.p2Notes].forEach(arr=>{
      arr.forEach(n=>{if(!n.hit&&!n.missed&&domainClash.elapsed>n.time+HIT_WINDOW)n.missed=true;});
    });
    if(domainClash.p1Feedback)domainClash.p1Feedback.t-=dt;
    if(domainClash.p2Feedback)domainClash.p2Feedback.t-=dt;
    if(domainClash.fightTimer<=0){
      domainClash.phase='result';
      domainClash.resultTimer=2800;
      const w=domainClash.p1Score>=domainClash.p2Score?p1:p2;
      const l=w===p1?p2:p1;
      w.useSkill(3,l,true);l.ult=0;
      spawnParticles(W/2,H/2,w.color,140);
      domainClash.winner=w.num;
    }
    return;
  }
  if(domainClash.phase==='result'){
    domainClash.resultTimer-=dt;
    if(domainClash.resultTimer<=0)domainClash=null;
  }
}

// Called from cc_input.js + cc_ai.js when a skill key / AI hits a lane during fight phase
function rhythmClashKeyHit(playerNum,laneIdx){
  if(!domainClash||domainClash.phase!=='fight')return;
  const PERFECT_WIN=55,HIT_WIN=110;
  const elapsed=domainClash.elapsed;
  const notes=playerNum===1?domainClash.p1Notes:domainClash.p2Notes;
  let best=null,bestDist=Infinity;
  notes.forEach(n=>{
    if(!n.hit&&!n.missed&&n.lane===laneIdx){
      const d=Math.abs(n.time-elapsed);
      if(d<=HIT_WIN&&d<bestDist){bestDist=d;best=n;}
    }
  });
  const fb=playerNum===1?'p1Feedback':'p2Feedback';
  const sc=playerNum===1?'p1Score':'p2Score';
  if(best){
    best.hit=true;
    const perfect=bestDist<=PERFECT_WIN;
    best.perfect=perfect;
    domainClash[sc]+=perfect?2:1;
    domainClash[fb]={text:perfect?'PERFECT!':'GOOD',col:perfect?'#00ff88':'#ffcc00',t:520,lane:laneIdx,side:playerNum};
  } else {
    domainClash[fb]={text:'MISS',col:'#ff4444',t:380,lane:laneIdx,side:playerNum};
  }
}

function drawDomainClash(){
  if(!domainClash)return;
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,0.82)';ctx.fillRect(0,0,W,H);

  // Taller panel to accommodate the longer 10s note highway
  const PX=W/2-460,PY=H/2-220,PW2=920,PH2=440;
  ctx.fillStyle='#04000c';ctx.strokeStyle='#9933ff';ctx.lineWidth=2;
  ctx.fillRect(PX,PY,PW2,PH2);ctx.strokeRect(PX,PY,PW2,PH2);
  ctx.strokeStyle='#331166';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,PY+10);ctx.lineTo(W/2,PY+PH2-10);ctx.stroke();

  const HZ_Y=PY+PH2-60;  // hit zone near panel bottom
  const SCROLL=0.075;     // slower — notes visible 5+ seconds ahead
  const LANE_W=54;
  const p1LaneX=[W/2-285,W/2-210,W/2-135];
  const p2LaneX=[W/2+135,W/2+210,W/2+285];
  const c1sk=getCtrl(1).sk,c2sk=getCtrl(2).sk;
  const laneColors=['#cc44ff','#00ccff','#ff4455'];

  // ── READY phase ──
  if(domainClash.phase==='ready'){
    const pulse=0.6+0.4*Math.sin(Date.now()*0.006);
    ctx.shadowColor='#ffffff';ctx.shadowBlur=30*pulse;
    txt('⚡ DOMAIN CLASH ⚡',W/2,PY+52,36,'#fff');ctx.shadowBlur=0;
    txt('P1 · '+p1.charName,PX+30,PY+88,14,p1.color,'left');
    txt('P2 · '+p2.charName,PX+PW2-30,PY+88,14,p2.color,'right');
    const rdText=domainClash.readyTimer>600?'GET READY':(domainClash.readyTimer>200?'SET':'GO!');
    const rdCol=domainClash.readyTimer>600?'#ffcc00':(domainClash.readyTimer>200?'#ff8800':'#00ff88');
    ctx.shadowColor=rdCol;ctx.shadowBlur=40;txt(rdText,W/2,PY+220,72,rdCol);ctx.shadowBlur=0;
    [p1LaneX,p2LaneX].forEach((lanes,pi)=>{
      const sk=pi===0?c1sk:c2sk;
      lanes.forEach((lx,li)=>{
        ctx.fillStyle='rgba(255,255,255,0.04)';ctx.fillRect(lx-LANE_W/2,PY+115,LANE_W,HZ_Y-PY-115);
        ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.strokeRect(lx-LANE_W/2,PY+115,LANE_W,HZ_Y-PY-115);
        txt(sk[li].toUpperCase(),lx,HZ_Y+22,13,laneColors[li]);
      });
    });
    ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(PX+30,HZ_Y);ctx.lineTo(W/2-20,HZ_Y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W/2+20,HZ_Y);ctx.lineTo(PX+PW2-30,HZ_Y);ctx.stroke();
    ctx.restore();return;
  }

  // ── FIGHT phase ──
  if(domainClash.phase==='fight'){
    const elapsed=domainClash.elapsed;
    const timeRatio=domainClash.fightTimer/domainClash.fightDur;
    txt('⚡ DOMAIN CLASH ⚡',W/2,PY+24,22,'#fff');
    ctx.fillStyle='#111';ctx.fillRect(PX+20,PY+34,PW2-40,10);
    ctx.fillStyle=timeRatio>0.5?'#00ff88':(timeRatio>0.25?'#ffaa00':'#ff3300');
    ctx.fillRect(PX+20,PY+34,(PW2-40)*timeRatio,10);
    ctx.strokeStyle='#222';ctx.lineWidth=1;ctx.strokeRect(PX+20,PY+34,PW2-40,10);

    txt('P1  '+domainClash.p1Score,PX+30,PY+60,15,p1.color,'left');
    txt(domainClash.p2Score+'  P2',PX+PW2-30,PY+60,15,p2.color,'right');
    const totalS=domainClash.p1Score+domainClash.p2Score;
    const p1Ratio=totalS>0?(domainClash.p1Score/totalS):0.5;
    const barW=PW2-80,barH=10,barX=PX+40,barY2=PY+68;
    ctx.fillStyle='#111';ctx.fillRect(barX,barY2,barW,barH);
    ctx.fillStyle=p1.color;ctx.shadowColor=p1.color;ctx.shadowBlur=6;
    ctx.fillRect(barX,barY2,barW*p1Ratio,barH);
    ctx.fillStyle=p2.color;ctx.shadowColor=p2.color;
    ctx.fillRect(barX+barW*p1Ratio,barY2,barW*(1-p1Ratio),barH);
    ctx.shadowBlur=0;
    ctx.strokeStyle='#000';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(barX+barW*p1Ratio,barY2-2);ctx.lineTo(barX+barW*p1Ratio,barY2+barH+2);ctx.stroke();

    [p1LaneX,p2LaneX].forEach((lanes,pi)=>{
      const noteArr=pi===0?domainClash.p1Notes:domainClash.p2Notes;
      const sk=pi===0?c1sk:c2sk;
      const pcol=pi===0?p1.color:p2.color;
      lanes.forEach((lx,li)=>{
        ctx.fillStyle='rgba(255,255,255,0.03)';ctx.fillRect(lx-LANE_W/2,PY+84,LANE_W,HZ_Y-PY-84);
        ctx.strokeStyle='rgba(255,255,255,0.07)';ctx.lineWidth=1;ctx.strokeRect(lx-LANE_W/2,PY+84,LANE_W,HZ_Y-PY-84);
        txt(sk[li].toUpperCase(),lx,HZ_Y+22,13,laneColors[li]);
      });
      ctx.strokeStyle=pcol+'99';ctx.lineWidth=3;ctx.shadowColor=pcol;ctx.shadowBlur=10;
      const hzL=pi===0?PX+20:W/2+20,hzR=pi===0?W/2-20:PX+PW2-20;
      ctx.beginPath();ctx.moveTo(hzL,HZ_Y);ctx.lineTo(hzR,HZ_Y);ctx.stroke();
      ctx.shadowBlur=0;
      noteArr.forEach(n=>{
        if(n.missed)return;
        const ny=HZ_Y-(n.time-elapsed)*SCROLL;
        if(ny<PY+80||ny>HZ_Y+44)return;
        const lx=lanes[n.lane];
        const col=laneColors[n.lane];
        if(n.hit){
          const alpha=Math.max(0,0.7-(elapsed-n.time)*0.004);
          if(alpha>0){
            ctx.globalAlpha=alpha;
            ctx.fillStyle=n.perfect?'#00ff88':'#ffcc00';
            ctx.shadowColor=n.perfect?'#00ff88':'#ffcc00';ctx.shadowBlur=18;
            ctx.beginPath();ctx.arc(lx,HZ_Y,LANE_W*0.55,0,Math.PI*2);ctx.fill();
            ctx.shadowBlur=0;ctx.globalAlpha=1;
          }
          return;
        }
        const glow=Math.abs(ny-HZ_Y)<30?18:4;
        ctx.fillStyle=col;ctx.strokeStyle='#fff';ctx.lineWidth=1.5;
        ctx.shadowColor=col;ctx.shadowBlur=glow;
        ctx.beginPath();ctx.roundRect(lx-LANE_W/2+4,ny-9,LANE_W-8,18,5);
        ctx.fill();ctx.stroke();ctx.shadowBlur=0;
      });
    });
    [[domainClash.p1Feedback,p1LaneX],[domainClash.p2Feedback,p2LaneX]].forEach(([fb,lanes])=>{
      if(fb&&fb.t>0){
        ctx.globalAlpha=Math.min(1,fb.t/200);
        txt(fb.text,lanes[fb.lane],HZ_Y-36,16,fb.col);
        ctx.globalAlpha=1;
      }
    });
    ctx.restore();return;
  }

  // ── RESULT phase ──
  if(domainClash.phase==='result'){
    const wp=domainClash.winner===1?p1:p2;
    ctx.shadowColor=wp.color;ctx.shadowBlur=50;
    txt('P'+wp.num+' WINS THE CLASH',W/2,PY+160,46,wp.color);ctx.shadowBlur=0;
    txt(wp.def.skills[3].name+' ACTIVATES',W/2,PY+205,20,'#888');
    txt('P1: '+domainClash.p1Score+' pts  —  P2: '+domainClash.p2Score+' pts',W/2,PY+245,14,'#555');
  }
  ctx.restore();
}