// ── CURSED CLASH · cc_ui.js ── All screen drawing (menus, HUD, skill bars, overlays)
// To add a new screen: add drawMyScreen() here, route it in cc_loop.js loop()
// ── BACKGROUND ──
function drawBackground(){
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#030208');sky.addColorStop(0.7,'#060318');sky.addColorStop(1,'#000');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  if(p1&&p2){[p1,p2].forEach(p=>{if(p.domainActive){const t2=Date.now()*0.001,g=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,W);g.addColorStop(0,hex8(p.color,'00'));g.addColorStop(1,hex8(p.color,'20'));ctx.globalAlpha=0.10+0.03*Math.sin(t2*2.5);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}});}
  ctx.strokeStyle='rgba(40,20,65,0.12)';ctx.lineWidth=0.5;for(let x=0;x<W;x+=100){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<FLOOR;y+=100){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.fillStyle='rgba(55,20,95,0.038)';ctx.font='bold 165px "Courier New"';ctx.textAlign='center';ctx.fillText('CURSED CLASH',W/2,H/2+65);
  const grd=ctx.createLinearGradient(0,FLOOR,0,H);grd.addColorStop(0,'#110820');grd.addColorStop(1,'#030108');ctx.fillStyle=grd;ctx.fillRect(0,FLOOR,W,H-FLOOR);
  const gl=ctx.createLinearGradient(0,0,W,0);gl.addColorStop(0,'rgba(0,0,0,0)');gl.addColorStop(0.25,'#6622bb');gl.addColorStop(0.75,'#6622bb');gl.addColorStop(1,'rgba(0,0,0,0)');ctx.strokeStyle=gl;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,FLOOR);ctx.lineTo(W,FLOOR);ctx.stroke();
}

// ── HUD ──
function drawHUD(){
  const BW=305,BH=24,UW=215,UH=13,PAD=22,maxHp=roundHP(roundNum);
  drawPHud(p1,PAD,PAD,BW,BH,UW,UH,'left',maxHp);
  drawPHud(p2,W-PAD-BW,PAD,BW,BH,UW,UH,'right',maxHp);
  // Center round info
  ctx.fillStyle='rgba(10,5,20,0.85)';ctx.fillRect(W/2-120,PAD-5,240,52);ctx.strokeStyle='#441188';ctx.lineWidth=1;ctx.strokeRect(W/2-120,PAD-5,240,52);
  txt(GAME_MODES[gameMode].name.toUpperCase()+' · R'+roundNum,W/2,PAD+13,11,'#9966cc');
  txt('VS',W/2,PAD+32,20,'#aa44ff');
  // Win dots
  const dotY=PAD+46,dotR=6;
  for(let r=0;r<winsNeeded();r++){const offs=(r-(winsNeeded()-1)/2)*18;
    ctx.fillStyle=r<p1RoundWins?p1.color:'#1a1a1a';ctx.shadowColor=r<p1RoundWins?p1.color:'transparent';ctx.shadowBlur=r<p1RoundWins?8:0;ctx.beginPath();ctx.arc(W/2-55+offs,dotY,dotR,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=r<p2RoundWins?p2.color:'#1a1a1a';ctx.shadowColor=r<p2RoundWins?p2.color:'transparent';ctx.shadowBlur=r<p2RoundWins?8:0;ctx.beginPath();ctx.arc(W/2+55+offs,dotY,dotR,0,Math.PI*2);ctx.fill();}
  ctx.shadowBlur=0;
  // Status indicators at bottom
  const bots=[];
  if(p1.domainActive&&p1.charName==='Shrine')bots.push({s:'left',col:p1.color,msg:'◆ SHRINE DOMAIN'});
  else if(p1.domainActive)bots.push({s:'left',col:p1.color,msg:'◆ DOMAIN ACTIVE'});
  if(p2.domainActive&&p2.charName==='Shrine')bots.push({s:'right',col:p2.color,msg:'SHRINE DOMAIN ◆'});
  else if(p2.domainActive)bots.push({s:'right',col:p2.color,msg:'DOMAIN ACTIVE ◆'});
  if(p1.chargeTimer>0)bots.push({s:'left',col:p1.chargeOwnerColor,msg:'⚡ CHARGED '+Math.ceil(p1.chargeTimer/1000)+'s'});
  if(p2.chargeTimer>0)bots.push({s:'right',col:p2.chargeOwnerColor,msg:'⚡ CHARGED '+Math.ceil(p2.chargeTimer/1000)+'s'});
  if(p1.infiniteVoidActive||p2.infiniteVoidActive){const vic=p1.infiniteVoidActive?p1:p2;txt('∞ P'+vic.num+' OVERWHELMED  '+Math.ceil(vic.stunned/1000)+'s',W/2,H-44,13,'#cc88ff');}
  if(p1.ultActive&&p1.charName==='Heavenly Restriction'&&p1.ultTimer>0)bots.push({s:'left',col:p1.def.accent,msg:'★ MAX OUT '+Math.ceil(p1.ultTimer/1000)+'s'});
  if(p2.ultActive&&p2.charName==='Heavenly Restriction'&&p2.ultTimer>0)bots.push({s:'right',col:p2.def.accent,msg:'★ MAX OUT '+Math.ceil(p2.ultTimer/1000)+'s'});
  if(p1.inThunderUlt&&p1.ultTimer>0){bots.push({s:'left',col:'#aa44ff',msg:'⚡ AMBER '+Math.ceil(p1.ultTimer/1000)+'s (-10HP/s)'});}
  if(p2.inThunderUlt&&p2.ultTimer>0){bots.push({s:'right',col:'#aa44ff',msg:'⚡ AMBER '+Math.ceil(p2.ultTimer/1000)+'s (-10HP/s)'});}
  if(p1.ultActive&&p1.charName==='Fever Dreamer'){bots.push({s:'left',col:p1.color,msg:'◆ GAMBLE '+Math.ceil(p1.ultTimer/1000)+'s'});}
  if(p2.ultActive&&p2.charName==='Fever Dreamer'){bots.push({s:'right',col:p2.color,msg:'GAMBLE ◆ '+Math.ceil(p2.ultTimer/1000)+'s'});}
  if(!p1.ultActive&&p1.jackpotActive&&p1.jackpotTimer>0){bots.push({s:'left',col:'#44ff88',msg:'★ JACKPOT +50HP/s '+Math.ceil(p1.jackpotTimer/1000)+'s'});}
  if(!p2.ultActive&&p2.jackpotActive&&p2.jackpotTimer>0){bots.push({s:'right',col:'#44ff88',msg:'★ JACKPOT +50HP/s '+Math.ceil(p2.jackpotTimer/1000)+'s'});}
  if(p1.isImmune()&&(p2.domainActive))txt('⊗ DOMAIN IMMUNE',PAD,H-58,10,'#22ff44','left');
  if(p2.isImmune()&&(p1.domainActive))txt('⊗ DOMAIN IMMUNE',W-PAD,H-58,10,'#22ff44','right');
  bots.forEach((b,bi)=>{const by=H-44-bi*18;ctx.fillStyle='rgba(0,0,0,0.65)';if(b.s==='left')ctx.fillRect(PAD-4,by-14,200,18);else ctx.fillRect(W-PAD-200,by-14,200,18);txt(b.msg,b.s==='left'?PAD:W-PAD,by,11,b.col,b.s);});
  // Binded Battle vow display
  if(gameMode==='bindedbattle'){
    const pad=PAD;
    if(p1.vow){const v=VOWS[p1.vow];let lab=v.icon+' '+v.short;if(p1.vow==='adaptation')lab+=' ('+p1.vowData.adaptStacks+'× reduce)';if((p1.vow==='discharged'||p1.vow==='overwhelming')&&p1.vowData.ultUsed)lab+=' 🔒';txt(lab,pad,H-76,10,v.color,'left');}
    if(p2.vow){const v=VOWS[p2.vow];let lab=v.short+' '+v.icon;if(p2.vow==='adaptation')lab='('+p2.vowData.adaptStacks+'× reduce) '+lab;if((p2.vow==='discharged'||p2.vow==='overwhelming')&&p2.vowData.ultUsed)lab='🔒 '+lab;txt(lab,W-pad,H-76,10,v.color,'right');}
    const otDone=bindedMatchTimer>=60000;
    const otTxt=otDone?'⚡ OVERTIME ×1.5 ACTIVE':'⏱ OVERTIME IN '+Math.ceil(Math.max(0,60000-bindedMatchTimer)/1000)+'s';
    ctx.shadowColor=otDone?'#ff8800':'transparent';ctx.shadowBlur=otDone?10:0;
    txt(otTxt,W/2,H-76,10,otDone?'#ff8800':'#554422');ctx.shadowBlur=0;
  }
  // Skill bars below floor
  drawSkillBar(p1,'left');
  drawSkillBar(p2,'right');
}

function drawPHud(player,x,y,bw,bh,uw,uh,side,maxHp){
  const hr=player.hp/maxHp;
  ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(x-4,y-4,bw+8,bh+uh+34);
  ctx.fillStyle='#0a0a0a';ctx.fillRect(x,y,bw,bh);
  const hcol=hr>0.5?player.color:(hr>0.25?'#ffaa00':'#ff2200');
  ctx.fillStyle=hcol;if(side==='left')ctx.fillRect(x,y,bw*hr,bh);else ctx.fillRect(x+bw-bw*hr,y,bw*hr,bh);
  ctx.strokeStyle='#2a2a2a';ctx.lineWidth=1;ctx.strokeRect(x,y,bw,bh);
  txt('P'+player.num+' · '+player.charName,side==='left'?x:x+bw,y+bh+16,14,player.color,side,true);
  txt(Math.ceil(player.hp)+'/'+maxHp,side==='left'?x+bw:x,y+bh+16,12,'#fff',side==='left'?'right':'left',true);
  const ux=side==='left'?x:x+bw-uw,ur=player.ult/MAX_ULT;
  ctx.fillStyle='#0a0a0a';ctx.fillRect(ux,y+bh+18,uw,uh);
  ctx.fillStyle=player.ult>=MAX_ULT?'#ffcc00':'#3a1c00';
  if(side==='left')ctx.fillRect(ux,y+bh+18,uw*ur,uh);else ctx.fillRect(ux+uw-uw*ur,y+bh+18,uw*ur,uh);
  ctx.strokeStyle='#2a2a2a';ctx.strokeRect(ux,y+bh+18,uw,uh);
  const ultSealed=(player.vow==='discharged'||player.vow==='overwhelming')&&player.vowData.ultUsed;
  const uk=side==='left'?'[4] ULT':'ULT [0]';
  if(ultSealed){ctx.shadowColor='#ff3333';ctx.shadowBlur=6;txt('🔒 ULT SEALED',side==='left'?ux+3:ux+uw-3,y+bh+28,9,'#ff3333',side,true);ctx.shadowBlur=0;}
  else txt(player.ult>=MAX_ULT?'★ '+uk+' READY':Math.floor(player.ult)+'%  '+uk,side==='left'?ux+3:ux+uw-3,y+bh+28,9,player.ult>=MAX_ULT?'#ffcc00':'#555',side,true);
}

// ── SKILL BAR (below floor, big icons + CD timer) ──
function drawSkillBar(player,side){
  const BS=62,BH=92,GAP=5;
  const kl=player.num===1?['1','2','3','4']:['7','8','9','0'];
  const barY=FLOOR+8;
  const barX=side==='left'?12:W-12-(4*(BS+GAP)-GAP);

  for(let i=0;i<4;i++){
    const bx=barX+i*(BS+GAP);
    const isU=i===3;
    const isThundUlt=player.inThunderUlt&&i<3;
    const ready=isThundUlt?(player.thunderUltCDs[i]<=0):(isU?player.ult>=MAX_ULT:player.cooldowns[i]<=0);
    const cd=isThundUlt?player.thunderUltCDs[i]:player.cooldowns[i];
    const maxCd=isThundUlt?[2500,4000,6000][i]:(player.def.skills[i].cd||1);
    const col=isThundUlt?'#aa44ff':(ready?(isU?'#ffcc00':player.color):'#444');

    const isJP=player.jackpotActive&&player.charName==='Fever Dreamer'&&!isU&&!isThundUlt;

    // Panel bg — orange glow for Straw Doll marked moveset
    const _isMarked2=player.charName==='Straw Doll'&&(player===p1?p2:p1)&&(player===p1?p2:p1).strawDollMarked;
    ctx.fillStyle=_isMarked2?'rgba(24,10,2,0.97)':(isJP?'rgba(12,20,8,0.97)':(ready?(isU?'rgba(22,12,0,0.95)':'rgba(6,16,8,0.95)'):'rgba(5,5,8,0.92)'));
    ctx.strokeStyle=_isMarked2?'#ff8822':(isJP?'#ffcc00':(ready?col:'#181818'));
    ctx.lineWidth=_isMarked2?2.5:(isJP?2.5:(ready?2:1));
    ctx.fillRect(bx,barY,BS,BH);ctx.strokeRect(bx,barY,BS,BH);
    if(_isMarked2){const _t=Date.now()*0.006;ctx.globalAlpha=0.1+0.08*Math.sin(_t*8+i);ctx.fillStyle='#ff8822';ctx.fillRect(bx+1,barY+1,BS-2,BH-2);ctx.globalAlpha=1;}

    // Jackpot outer glow pulse
    if(isJP){
      const t2=Date.now()*0.006;
      const pulse=0.35+0.25*Math.sin(t2*5+i*1.2);
      ctx.globalAlpha=pulse;
      ctx.strokeStyle='#ffcc00';ctx.lineWidth=4;ctx.shadowColor='#ffcc00';ctx.shadowBlur=18;
      ctx.strokeRect(bx-2,barY-2,BS+4,BH+4);
      ctx.globalAlpha=pulse*0.25;
      ctx.fillStyle='#ffcc00';ctx.fillRect(bx,barY,BS,BH);
      ctx.globalAlpha=1;ctx.shadowBlur=0;
    }

    // Cooldown fill — drains from top
    if(!ready&&maxCd>0){
      const ratio=cd/maxCd;
      ctx.fillStyle='rgba(0,0,0,0.7)';
      ctx.fillRect(bx,barY,BS,BH*ratio);
    }

    // Ready glow pulse
    if(ready){
      ctx.globalAlpha=0.15+0.10*Math.sin(Date.now()*0.006+i);
      ctx.fillStyle=col;ctx.fillRect(bx+1,barY+1,BS-2,BH-2);
      ctx.globalAlpha=1;
    }

    // Key label top
    txt(isU?(isThundUlt?'★':'★ ULT'):kl[i],bx+BS/2,barY+13,10,isJP?'#ffcc00':(ready?col:'#333'));

    // Skill icon — unique per skill
    ctx.save();
    const iconCol=isJP?'#ffcc00':(ready?col:'#2a2a2a');
    drawSkillIcon(player.charName,i,bx+BS/2,barY+BH*0.46,26,iconCol,isThundUlt);
    // Jackpot: extra shimmering icon glow
    if(isJP){
      const t3=Date.now()*0.008;
      ctx.globalAlpha=0.3+0.2*Math.sin(t3*6+i*2);
      ctx.shadowColor='#ffcc00';ctx.shadowBlur=22;
      drawSkillIcon(player.charName,i,bx+BS/2,barY+BH*0.46,30,'#ffcc00',isThundUlt);
      ctx.globalAlpha=1;ctx.shadowBlur=0;
    }
    ctx.restore();

    // Skill name — swap to marked moveset for Straw Doll when opponent is marked
    let _sk=player.def.skills[i];
    const _opp=player===p1?p2:p1;
    const _isMarked=player.charName==='Straw Doll'&&_opp&&_opp.strawDollMarked;
    if(_isMarked&&player.def.markedSkills&&player.def.markedSkills[i])_sk=player.def.markedSkills[i];
    const nm=_sk.name.length>10?_sk.name.slice(0,9)+'…':_sk.name;
    txt(isJP?'★'+nm:nm,bx+BS/2,barY+BH-19,7,isJP?'#ffcc00':(ready?(_isMarked?'#ff8822':col):'#383838'));

    // Timer / status line at very bottom
    ctx.save();
    if(!ready&&maxCd>0){
      ctx.shadowColor='#ff7722';ctx.shadowBlur=6;
      txt((cd/1000).toFixed(1)+'s',bx+BS/2,barY+BH-7,11,'#ff9944');
    } else if(ready){
      ctx.shadowColor=isJP?'#ffcc00':col;ctx.shadowBlur=10;
      txt(isJP?'★BOOST':(isU?'ULT!':'READY'),bx+BS/2,barY+BH-7,10,isJP?'#ffcc00':col);
    }
    ctx.restore();
  }
}

// ── SCREENS ──
function drawBackground2(){ctx.fillStyle='#030208';ctx.fillRect(0,0,W,H);const t=Date.now()*0.001;for(let i=0;i<8;i++){const bx=W/2+Math.cos(t*0.55+i*0.8)*450,by=H/2+Math.sin(t*0.38+i*1.1)*220;const g=ctx.createRadialGradient(bx,by,0,bx,by,240);g.addColorStop(0,`hsla(${240+i*28},65%,20%,0.09)`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}}

function drawMainMenu(){
  drawBackground2();
  ctx.shadowColor='#9944ff';ctx.shadowBlur=35;txt('⚔  CURSED CLASH',W/2,155,64,'#fff');ctx.shadowBlur=0;
  txt('A 2-PLAYER CURSED ENERGY FIGHTING GAME',W/2,188,13,'#5533aa');
  const bw=280,bh=62,bx=W/2-bw/2;
  btn(bx,250,bw,bh,'▶  PLAY','#00ff88','Start a match');
  btn(bx,335,bw,bh,'📖  INFORMATION','#00aaff','Characters & controls');
  btn(bx,420,bw,bh,'📜  HISTORY','#ffaa00','Past match results');
  btn(bx,505,bw,bh,'📋  PATCH NOTES','#cc88ff','Version history');
  txt('v6.2  ·  P1: [Q/E] move  [W] jump  [1-4] skills',W/2,590,11,'#333');
  txt('P2: [U/O] move  [I] jump  [7-0] skills',W/2,605,11,'#333');
}

function drawPlayMenu(){
  drawBackground2();
  btn(40,30,110,38,'← BACK','#555');
  txt('SELECT GAME MODE',W/2,86,26,'#cc88ff');
  const bw=380,bh=72,bx=W/2-bw/2;
  btn(bx,118,bw,bh,'🏆  CASUAL','#ffcc00','First to '+GAME_MODES.casual.winsNeeded+' wins · 5 rounds');
  txt('R1:200hp  R2:300hp  R3:400hp  R4:500hp  R5:750hp',W/2,203,10,'#554400');
  btn(bx,215,bw,bh,'⚡  QUICK PLAY','#00ff88','1 round · 300hp each');
  txt('Fast and intense — single round decides it all',W/2,300,10,'#224422');
  btn(bx,312,bw,bh,'⛓  BINDED BATTLE','#cc44ff','1 round · 500hp · Binding Vow per player');
  txt('Vows grant power but demand a price · Domain Clash QTE on simultaneous ult',W/2,397,10,'#552266');
  btn(bx,409,bw,bh,'🤖  PLAYER VS AI','#ff7733','Fight a bot · Casual HP · You are P1');
  txt('Bot picks a random character · 4 difficulties · unlock Unclassified by beating Shrine',W/2,494,10,'#663311');
}

function randomVowOptions(){
  const keys=[...VOW_KEYS];
  for(let i=keys.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[keys[i],keys[j]]=[keys[j],keys[i]];}
  return keys.slice(0,3);
}

function drawVowSelect(){
  drawBackground2();
  btn(40,20,120,38,'← BACK','#555');
  ctx.shadowColor='#cc44ff';ctx.shadowBlur=22;
  txt('⛓  BINDING VOW',W/2,50,32,'#cc44ff');ctx.shadowBlur=0;
  txt('Each player picks one vow — gain power, pay a price',W/2,70,11,'#9966bb',undefined,false);

  const CW=580,CH=120,GAP=10;
  const startY=90;
  const LCX=W/4+10,RCX=3*W/4-10;

  // Vertical divider
  ctx.strokeStyle='#441188';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(W/2,startY);ctx.lineTo(W/2,startY+3*(CH+GAP)+20);ctx.stroke();
  ctx.setLineDash([]);

  // Player header bars
  [[LCX,'P1','#00aaff','[Q/E] choose  [W] bind'],[RCX,'P2','#ff6622','[U/O] choose  [I] bind']].forEach(([cx,pn,pc,hint])=>{
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(cx-CW/2,startY-2,CW/2,26);
    ctx.strokeStyle=pc;ctx.lineWidth=1.5;ctx.strokeRect(cx-CW/2,startY-2,CW/2,26);
    ctx.shadowColor=pc;ctx.shadowBlur=10;txt(pn,cx-CW/4,startY+14,14,pc);ctx.shadowBlur=0;
    txt(hint,cx-CW/4,startY+14,9,'#888',undefined,false);
    ctx.shadowBlur=0;
  });

  const safeOpts=(opts)=>opts&&opts.length===3?opts:['overtime','enchain','eyeforaleg'];

  [[safeOpts(p1VowOptions),p1VowIdx,p1VowConf,LCX,'W'],[safeOpts(p2VowOptions),p2VowIdx,p2VowConf,RCX,'I']].forEach(([opts,selIdx,conf,cx,ck])=>{
    for(let i=0;i<3;i++){
      const vowKey=opts[i];if(!vowKey||!VOWS[vowKey])continue;
      const vow=VOWS[vowKey];
      const cardX=cx-CW/2,cardY=startY+24+i*(CH+GAP);
      const cw=CW/2-4;
      const sel=selIdx===i,done=conf&&sel;
      // Background
      ctx.fillStyle=done?`rgba(${hexToRgb(vow.color)},0.18)`:sel?`rgba(${hexToRgb(vow.color)},0.10)`:'rgba(4,2,12,0.96)';
      ctx.fillRect(cardX,cardY,cw,CH);
      // Border
      if(sel){ctx.shadowColor=vow.color;ctx.shadowBlur=16;}
      ctx.strokeStyle=done?vow.color:sel?vow.color+'bb':'#1e0e3a';
      ctx.lineWidth=done?3:sel?2:1;
      ctx.strokeRect(cardX,cardY,cw,CH);
      ctx.shadowBlur=0;
      // Left accent bar
      ctx.fillStyle=done?vow.color:sel?vow.color+'88':'#1e0e3a';
      ctx.fillRect(cardX,cardY,4,CH);
      // Icon + Name row
      const ic=vow.icon,nm=vow.name;
      const nameCol=sel||done?vow.color:'#777';
      ctx.shadowColor=sel||done?vow.color:'transparent';ctx.shadowBlur=sel||done?8:0;
      txt(ic+' '+nm,cardX+cw/2,cardY+24,14,nameCol);ctx.shadowBlur=0;
      // Description — break into 2 lines max
      const words=vow.desc.split(' ');let line1='',line2='';
      ctx.font='10px "Courier New"';
      const maxW=cw-20;
      for(const w of words){const t=line1+(line1?' ':'')+w;if(ctx.measureText(t).width<maxW)line1=t;else{line2+=(line2?' ':'')+w;}}
      const descCol=sel||done?'#ccc':'#555';
      txt(line1,cardX+cw/2,cardY+44,9,descCol,undefined,false);
      if(line2)txt(line2,cardX+cw/2,cardY+56,9,descCol,undefined,false);
      // Status / confirm prompt
      if(done){
        ctx.shadowColor='#00ff88';ctx.shadowBlur=10;
        txt('✓  BOUND',cardX+cw/2,cardY+CH-12,13,'#00ff88');ctx.shadowBlur=0;
      } else if(sel){
        const p=0.65+0.35*Math.sin(Date.now()*0.009);
        ctx.globalAlpha=p;
        ctx.fillStyle=vow.color+'33';ctx.fillRect(cardX,cardY+CH-30,cw,28);
        ctx.globalAlpha=1;
        ctx.shadowColor=vow.color;ctx.shadowBlur=10;
        txt('['+ck+']  BIND THIS VOW',cardX+cw/2,cardY+CH-12,11,vow.color);ctx.shadowBlur=0;
      } else {
        txt('Option '+(i+1),cardX+cw/2,cardY+CH-12,9,'#333',undefined,false);
      }
    }
  });

  // Bottom status bar
  const bothDone=p1VowConf&&p2VowConf;
  const status=bothDone?'Both bound — starting match!':(p1VowConf?'P1 bound! Waiting for P2…':'Choose your vow, then press your confirm key');
  ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,H-36,W,36);
  ctx.shadowColor=bothDone?'#ffcc00':'transparent';ctx.shadowBlur=bothDone?14:0;
  txt(status,W/2,H-14,13,bothDone?'#ffcc00':'#888');ctx.shadowBlur=0;
}

function hexToRgb(hex){
  const h=hex.replace('#','');
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return isNaN(r)?'80,80,80':`${r},${g},${b}`;
}

function drawSelect(){
  drawBackground2();
  txt('⚔ CURSED CLASH',W/2,42,40,'#fff');
  txt('— SELECT CHARACTER —',W/2,66,11,'#6644aa');
  txt('See INFORMATION for full skill details',W/2,80,9,'#443366',undefined,false);

  const CW=206,CH=252,GAP=14,COLS=5;
  const startY=94;

  CHAR_NAMES.forEach((name,idx)=>{
    const def=CHARS[name];
    const col2=idx%COLS,row=Math.floor(idx/COLS);
    // Center each row independently
    const rowStart=row*COLS;
    const rowCount=Math.min(COLS,CHAR_NAMES.length-rowStart);
    const rowW=rowCount*(CW+GAP)-GAP;
    const cardX=(W-rowW)/2+col2*(CW+GAP);
    const cardY=startY+row*(CH+GAP);
    const mid=cardX+CW/2;

    // Card background
    ctx.fillStyle='#050310';
    ctx.strokeStyle=hex8(def.color,'55');
    ctx.lineWidth=1.5;
    ctx.fillRect(cardX,cardY,CW,CH);
    ctx.strokeRect(cardX,cardY,CW,CH);

    // Top colour bar
    const tb=ctx.createLinearGradient(cardX,0,cardX+CW,0);
    tb.addColorStop(0,'rgba(0,0,0,0)');
    tb.addColorStop(0.5,hex8(def.color,'66'));
    tb.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=tb;ctx.fillRect(cardX,cardY,CW,5);

    // Character icon
    drawCharIcon(name,mid,cardY+76,64,def.color);

    // Colour swatches
    ctx.fillStyle=def.color;ctx.fillRect(mid-26,cardY+148,24,8);
    ctx.strokeStyle='#222';ctx.lineWidth=0.5;ctx.strokeRect(mid-26,cardY+148,24,8);
    ctx.fillStyle=def.color2;ctx.fillRect(mid+2,cardY+148,24,8);ctx.strokeRect(mid+2,cardY+148,24,8);

    // Character name
    txt(name.toUpperCase(),mid,cardY+170,9,def.color);

    // 2-line description
    // 2-line description — clip to card width to prevent overflow
    ctx.save();ctx.beginPath();ctx.rect(cardX+4,cardY+174,CW-8,32);ctx.clip();
    def.desc.forEach((d,di)=>{
      // Truncate if too long for the card
      const maxW=CW-14;ctx.font=`${Math.floor(7*1.33)}px sans-serif`;
      let label=d;while(label.length>4&&ctx.measureText(label).width>maxW)label=label.slice(0,-1);
      if(label!==d)label=label.slice(0,-1)+'…';
      txt(label,mid,cardY+184+di*12,7,'#888',undefined,false);
    });
    ctx.restore();

    // Hint
    txt('📖 INFO',mid,cardY+CH-8,6,'#332255',undefined,false);

    // Selection rings
    const s1=p1Idx===idx,s2=p2Idx===idx;
    if(s1){
      ctx.strokeStyle=p1Conf?'#00ff88':'#00aaff';ctx.lineWidth=p1Conf?3:2;
      ctx.setLineDash([7,3]);ctx.strokeRect(cardX+3,cardY+3,CW-6,CH-6);ctx.setLineDash([]);
      txt(p1Conf?'P1 ✓':'P1',cardX+8,cardY+16,10,p1Conf?'#00ff88':'#00aaff','left');
    }
    if(s2){
      ctx.strokeStyle=p2Conf?'#00ff88':'#ff6622';ctx.lineWidth=p2Conf?3:2;
      ctx.setLineDash([3,7]);ctx.strokeRect(cardX+6,cardY+6,CW-12,CH-12);ctx.setLineDash([]);
      txt(p2Conf?'P2 ✓':'P2',cardX+CW-8,cardY+16,10,p2Conf?'#00ff88':'#ff6622','right');
    }
  });

  txt('P1: [Q/E] browse · [W] confirm     P2: [U/O] browse · [I] confirm',W/2,H-28,12,'#333');
  if(aiEnabled){
    txt(p1Conf?'P1 ready! Bot will pick for P2...':'P1: [Q/E] browse · [W] confirm',W/2,H-12,12,p1Conf?'#ffcc00':'#444');
  } else {
    txt(!p1Conf?'Waiting for P1...':(p2Conf?'Starting...':'P1 ready! Waiting for P2...'),W/2,H-12,12,p1Conf&&p2Conf?'#ffcc00':'#444');
  }
}

function drawCountdown(){
  drawBackground();if(p1&&p2){p1.draw();p2.draw();}
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,H);
  const secs=Math.ceil(countdownTimer/1000);const fight=countdownTimer<=0;
  const txts=fight?'FIGHT!':(secs<=0?'FIGHT!':String(secs));
  const col=secs===3?'#ffcc00':(secs===2?'#ff8800':(secs===1?'#ff3300':'#00ff88'));
  ctx.shadowColor=col;ctx.shadowBlur=60;txt(txts,W/2,H/2+55,130,col);ctx.shadowBlur=0;
  ctx.fillStyle='rgba(15,8,35,0.88)';ctx.fillRect(W/2-240,H/2-165,480,58);ctx.strokeStyle='#6622cc';ctx.lineWidth=1.5;ctx.strokeRect(W/2-240,H/2-165,480,58);
  txt(GAME_MODES[gameMode].name.toUpperCase()+' · '+ROUND_NAMES_RUNTIME()+'  —  '+roundHP(roundNum)+' HP',W/2,H/2-128,15,'#cc88ff');
  const dotY2=H/2-185,dotR=8;
  for(let r=0;r<winsNeeded();r++){const offs=(r-(winsNeeded()-1)/2)*20;ctx.fillStyle=r<p1RoundWins?p1.color:'#1a1a1a';ctx.shadowColor=r<p1RoundWins?p1.color:'transparent';ctx.shadowBlur=r<p1RoundWins?10:0;ctx.beginPath();ctx.arc(W/2-65+offs,dotY2,dotR,0,Math.PI*2);ctx.fill();ctx.fillStyle=r<p2RoundWins?p2.color:'#1a1a1a';ctx.shadowColor=r<p2RoundWins?p2.color:'transparent';ctx.shadowBlur=r<p2RoundWins?10:0;ctx.beginPath();ctx.arc(W/2+65+offs,dotY2,dotR,0,Math.PI*2);ctx.fill();}
  ctx.shadowBlur=0;
}

function ROUND_NAMES_RUNTIME(){return'ROUND '+roundNum;}

function drawRoundEnd(){
  drawBackground();updateFX(0);drawFX();if(p1&&p2){p1.draw();p2.draw();}
  ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
  const wp=roundWinnerNum===1?p1:p2;
  ctx.shadowColor=wp.color;ctx.shadowBlur=40;txt('P'+wp.num+' WINS ROUND '+roundNum,W/2,H/2-35,46,wp.color);ctx.shadowBlur=0;
  txt((wp.charName).toUpperCase(),W/2,H/2+10,18,'#888');
  const dotY=H/2+60,dotR=11;
  for(let r=0;r<winsNeeded();r++){const offs=(r-(winsNeeded()-1)/2)*26;ctx.fillStyle=r<p1RoundWins?p1.color:'#1a1a1a';ctx.shadowColor=r<p1RoundWins?p1.color:'transparent';ctx.shadowBlur=r<p1RoundWins?12:0;ctx.beginPath();ctx.arc(W/2-75+offs,dotY,dotR,0,Math.PI*2);ctx.fill();ctx.fillStyle=r<p2RoundWins?p2.color:'#1a1a1a';ctx.shadowColor=r<p2RoundWins?p2.color:'transparent';ctx.shadowBlur=r<p2RoundWins?12:0;ctx.beginPath();ctx.arc(W/2+75+offs,dotY,dotR,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;
  txt('P1',W/2-87,dotY+28,12,'#444');txt('P2',W/2+63,dotY+28,12,'#444');
  const isLast=(p1RoundWins>=winsNeeded()||p2RoundWins>=winsNeeded()||roundNum>=GAME_MODES[gameMode].rounds.length);
  txt(isLast?'Match ending...':'Next round starting...',W/2,H/2+105,14,isLast?'#ffcc00':'#555');
}

function drawMatchOver(){
  drawBackground();updateFX(0);drawFX();if(p1&&p2){p1.draw();p2.draw();}
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,W,H);
  const wp=p1RoundWins>p2RoundWins?p1:(p2RoundWins>p1RoundWins?p2:(roundWinnerNum===1?p1:p2));
  ctx.shadowColor=wp.color;ctx.shadowBlur=50;txt('P'+wp.num+' WINS THE MATCH',W/2,H/2-50,62,wp.color);ctx.shadowBlur=0;
  txt(wp.charName.toUpperCase()+' REIGNS VICTORIOUS',W/2,H/2+5,20,'#9955cc');
  txt(GAME_MODES[gameMode].name.toUpperCase()+'  ·  P1: '+p1RoundWins+' — P2: '+p2RoundWins,W/2,H/2+40,15,'#555');
  const dotY=H/2+82,dotR=11;
  for(let r=0;r<winsNeeded();r++){const offs=(r-(winsNeeded()-1)/2)*26;ctx.fillStyle=r<p1RoundWins?p1.color:'#1a1a1a';ctx.shadowColor=r<p1RoundWins?p1.color:'transparent';ctx.shadowBlur=r<p1RoundWins?12:0;ctx.beginPath();ctx.arc(W/2-75+offs,dotY,dotR,0,Math.PI*2);ctx.fill();ctx.fillStyle=r<p2RoundWins?p2.color:'#1a1a1a';ctx.shadowColor=r<p2RoundWins?p2.color:'transparent';ctx.shadowBlur=r<p2RoundWins?12:0;ctx.beginPath();ctx.arc(W/2+75+offs,dotY,dotR,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;
  txt('P1',W/2-87,dotY+28,12,'#444');txt('P2',W/2+63,dotY+28,12,'#444');
  txt('Press [ENTER] for main menu',W/2,H/2+148,15,'#444');
}

function drawInfoPage(){
  drawBackground2();
  btn(40,20,120,38,'← BACK','#555');
  txt('INFORMATION',W/2,70,34,'#cc88ff');
  ctx.save();ctx.beginPath();ctx.rect(0,90,W,H-90);ctx.clip();
  const yoff=90-infoScroll;
  // Controls
  let cy=yoff+20;
  ctx.fillStyle='rgba(15,8,30,0.9)';ctx.fillRect(60,cy-20,W-120,130);ctx.strokeStyle='#441188';ctx.lineWidth=1;ctx.strokeRect(60,cy-20,W-120,130);
  txt('CONTROLS',W/2,cy,22,'#aa66ff');
  txt('P1: [Q] Left  [E] Right  [W] Jump  |  [1][2][3] Skills  [4] Ultimate',W/2,cy+30,13,'#9988bb',undefined,false);
  txt('P2: [U] Left  [O] Right  [I] Jump   |  [7][8][9] Skills  [0] Ultimate',W/2,cy+50,13,'#9988bb',undefined,false);
  txt('Mouse: Menus  ·  [ENTER]: Return to menu after match',W/2,cy+75,12,'#665577',undefined,false);
  txt('Domain Clash: Both [4] and [0] within 0.65s  →  QTE spam skills to win!',W/2,cy+95,12,'#9944cc',undefined,false);
  cy+=145;
  txt('CHARACTERS',W/2,cy,22,'#aa66ff');cy+=30;
  CHAR_NAMES.forEach(name=>{
    const def=CHARS[name];
    const ch=def.skills.length*60+80;
    ctx.fillStyle='rgba(8,4,18,0.92)';ctx.fillRect(60,cy-10,W-120,ch);ctx.strokeStyle=hex8(def.color,'55');ctx.lineWidth=1.5;ctx.strokeRect(60,cy-10,W-120,ch);
    ctx.fillStyle=def.color;ctx.fillRect(60,cy-10,W-120,4);
    txt(name.toUpperCase(),90,cy+16,16,def.color,'left',true);
    ctx.fillStyle=def.color;ctx.fillRect(700,cy+2,22,22);ctx.fillStyle=def.color2;ctx.fillRect(728,cy+2,22,22);txt('P1 COL',711,cy+36,7,'#666');txt('P2 COL',739,cy+36,7,'#666');
    def.desc.forEach((d,di)=>txt('•  '+d,90,cy+38+di*14,11,'#888','left',false));
    def.skills.forEach((sk,si)=>{
      const sy2=cy+66+si*56;
      ctx.fillStyle=si===3?'rgba(25,15,0,0.8)':'rgba(12,8,20,0.8)';ctx.fillRect(80,sy2-5,W-160,52);ctx.strokeStyle=si===3?'#443300':'#221133';ctx.lineWidth=1;ctx.strokeRect(80,sy2-5,W-160,52);
      const kcol=['1/7','2/8','3/9','4★/0★'][si];
      txt('['+kcol+'] '+sk.name,100,sy2+14,13,si===3?'#ffcc00':def.color,'left',true);
      txt('CD: '+(si===3?'—':Math.round(sk.cd/100)/10+'s'),W-200,sy2+14,11,'#666','left',false);
      txt(sk.desc,100,sy2+32,10,'#aaa','left',false);
    });
    cy+=ch+16;
  });
  ctx.restore();
  // scroll hint
  if(infoScroll<50)txt('▼ SCROLL FOR MORE',W/2,H-22,12,'#333');
}

function drawPatchNotes(){
  drawBackground2();
  btn(40,20,120,38,'← BACK','#555');
  ctx.shadowColor='#cc88ff';ctx.shadowBlur=18;
  txt('📋  PATCH NOTES',W/2,56,28,'#cc88ff');ctx.shadowBlur=0;
  const patches=[
    {ver:'v6.1',col:'#aaddff',title:'DESIGN UPDATE PT1',notes:[
      '◆ All character icons redesigned with unique animations',
      '◆ Heavenly Restriction icon: X-crossing chains with break-flash',
      '◆ Shrine icon: Sukuna-vibe angular altar, 4 eye-dots, rune slashes, CE drip',
      '◆ Thunder God icon: lightning bolt with animated arc sparks',
      '◆ Projection Sorcery icon: 3 glass panes with sliding scan-line shimmer',
      '◆ Straw Doll icon: doll body + nails + hammer with animated curse-link ring',
      '◆ History page: BACK and CLEAR buttons now visually rendered',
      '◆ Select screen: character descriptions no longer overflow their cards',
    ]},
    {ver:'v6.0',col:'#ff8822',title:'STRAW DOLL + PLAYER VS AI + STAR RAGE BUFF',notes:[
      '★ New character: Straw Doll (Nobara Kugisaki) — cursed tools fighter',
      '  Base moveset: Hammer Strike, Nail Barrage, Resonance (marks opponent), Hairpin ult',
      '  Marked moveset unlocked when enemy is marked (12s):',
      '    Resonance Strike 55dmg, Soul Rend 45dmg+stun, Divergence 65dmg AoE',
      '    Black Flash ult: far dash, 90dmg + THE ZONE (×1.2 dmg for 10s)',
      '  Cannot domain clash. Affected by all domains.',
      '★ Player vs AI mode added — 4 difficulty tiers:',
      '  Grade 3, Grade 1, Special Grade, Unclassified (unlock by beating Shrine on all 3)',
      '  AI has blocking, combos, character-specific skill logic, low-HP aggression',
      '◆ Star Rage: Black Hole pulls enemy 1.45× harder — escaping slows pull to 88%',
      '◆ Star Rage: Imaginary Mass now has wind-up then fires fast straight bullet shot',
    ]},
    {ver:'v5.1',col:'#cc88ff',title:'STAR RAGE + REBALANCE',notes:[
      '★ New character: Star Rage (Yuki Tsukumo) — imaginary mass fighter',
      '  Skill 1 · Mass Burst: 45dmg shockwave, 240px, ground crack VFX',
      '  Skill 2 · Imaginary Mass: slow dense orb 40dmg, heavy impact',
      '  Skill 3 · Mass Augment: charge slam 55dmg + extreme knockback',
      '  Ultimate · Black Hole: throw slow orb → auto or manual detonate',
      '    Pulls EVERYWHERE — 20dmg/s to self, 30dmg/s to enemy in 180px',
      '    Cannot domain clash. Affected by all domains.',
      '★ New vows: Cursed Nullification (−20% dmg taken), Cursed Regeneration',
      '  (+10hp/5s), Cursed Vitality (+250hp, −10% damage dealt)',
      '★ Flash Step: flat 10dmg streak, range grows each hit. Miss ×3+ = 10s CD',
      '★ Projection Sorcery: new electric cyan color for better readability',
      '★ Shrine character icon redesigned — malevolent torii with cursed eye',
    ]},
    {ver:'v5.0',col:'#ff44cc',title:'MAJOR REBALANCE',notes:[
      '◆ Jackpot: 30% chance (was 40%), lasts 14s (was 20s)',
      '◆ Time Cell Moon Palace: 5dmg/step, 30dmg/skill, no cap, 7.5s domain',
      '◆ Malevolent Shrine: 10dmg/0.25s, no cap, 5s, slash storm VFX,',
      '  opponent turns transparent during domain',
      '◆ Flash Step streak mechanic added (later refined in 5.1)',
    ]},
    {ver:'v4.0',col:'#ffcc00',title:'VOW SYSTEM + FEVER DREAMER',notes:[
      '◆ Binding Vow system added to Binded Battle mode',
      '◆ Vows: Overtime, Enchain, Eye for a Leg, Adaptation,',
      '  Discharged, Overwhelming added',
      '◆ Fever Dreamer (Hakari) added — Idle Death Gamble slot machine domain',
      '◆ Vow announcement banners added at round start',
    ]},
    {ver:'v3.0',col:'#ffaa00',title:'THUNDER GOD + DOMAIN CLASH',notes:[
      '◆ Thunder God (Kashimo) added — Mythical Beast Amber transformation',
      '◆ Domain Clash QTE system added for simultaneous domain activations',
      '◆ Voltage Cage trap mechanic added',
      '◆ Charge debuff system added (Static Rush)',
    ]},
    {ver:'v2.0',col:'#55aaff',title:'LIMITLESS + DOMAINS',notes:[
      '◆ Limitless (Gojo) added — Red / Blue / Hollow Purple / Infinite Void',
      '◆ Domain Expansion system implemented for Projection Sorcery & Shrine',
      '◆ Time Cell Moon Palace and Malevolent Shrine first versions added',
      '◆ Heavenly Restriction domain immunity added',
    ]},
    {ver:'v1.0',col:'#00ff88',title:'INITIAL RELEASE',notes:[
      '◆ Core 2-player local fighting game framework',
      '◆ Projection Sorcery (Naoya Zenin) — Flash Step, Barrage, Stagnation',
      '◆ Heavenly Restriction (Toji Fushiguro) — pure physical fighter',
      '◆ Shrine (Sukuna) — Cleave, Dismantle, Slash Flood',
      '◆ Casual and Quick Play game modes',
      '◆ Match history system',
    ]},
  ];
  const padL=80,padR=80;
  let y=90;
  for(const p of patches){
    if(y>H-30)break;
    // Version badge
    ctx.shadowColor=p.col;ctx.shadowBlur=12;
    ctx.fillStyle=p.col;ctx.globalAlpha=0.15;
    ctx.fillRect(padL,y-2,W-padL-padR,22);
    ctx.globalAlpha=1;ctx.shadowBlur=8;
    txt(p.ver+'  —  '+p.title,padL+12,y+14,13,p.col,'left');
    ctx.shadowBlur=0;
    y+=26;
    for(const n of p.notes){
      if(y>H-20)break;
      ctx.fillStyle='#777';
      txt(n,padL+20,y,10,'#888','left');
      y+=14;
    }
    y+=8;
  }
}

function drawHistoryPage(){
  drawBackground2();
  // ── History header bar ──
  ctx.fillStyle='rgba(5,3,12,0.95)';ctx.fillRect(0,0,W,58);
  ctx.strokeStyle='#2a1a4a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,58);ctx.lineTo(W,58);ctx.stroke();
  txt('MATCH HISTORY',W/2,34,18,'#aa66ff');
  // Back button
  ctx.fillStyle='rgba(30,20,50,0.95)';ctx.fillRect(40,12,120,34);
  ctx.strokeStyle='#5533aa';ctx.lineWidth=1.5;ctx.strokeRect(40,12,120,34);
  txt('← BACK',100,34,12,'#aaaacc');
  // Clear button
  ctx.fillStyle='rgba(40,10,10,0.95)';ctx.fillRect(W-180,12,140,34);
  ctx.strokeStyle='#882222';ctx.lineWidth=1.5;ctx.strokeRect(W-180,12,140,34);
  txt('CLEAR HISTORY',W-110,34,10,'#cc4444');
  const hist=loadHistory();
  ctx.save();ctx.beginPath();ctx.rect(0,60,W,H-60);ctx.clip();
  const yoff=68-histScroll;
  if(hist.length===0){txt('No matches recorded yet.',W/2,yoff+60,18,'#333');}
  else{
    hist.forEach((rec,ri)=>{
      const ry=yoff+ri*145;
      if(ry>H+20||ry<-160)return;
      ctx.fillStyle='rgba(10,5,20,0.9)';ctx.fillRect(60,ry,W-120,135);ctx.strokeStyle=ri===0?'#aa6600':'#2a1a4a';ctx.lineWidth=ri===0?2:1;ctx.strokeRect(60,ry,W-120,135);
      txt('#'+(hist.length-ri)+' — '+rec.date,90,ry+20,11,'#555','left',false);
      txt(rec.mode.toUpperCase(),W-90,ry+20,11,'#aa6600','right',false);
      const wp=rec.p1Wins>rec.p2Wins?'P1':'P2';const wc=rec.p1Wins>rec.p2Wins?rec.p1Color:rec.p2Color;
      ctx.shadowColor=wc;ctx.shadowBlur=8;txt('P'+rec.p1Char.slice(0,14)+' vs '+rec.p2Char.slice(0,14),W/2,ry+42,14,'#ddd');ctx.shadowBlur=0;
      txt('P1: '+rec.p1Wins+' — P2: '+rec.p2Wins,W/2,ry+65,20,'#fff');
      txt(wp+' WINS · '+rec.totalRounds+' rounds played',W/2,ry+88,13,wc);
      if(rec.rounds){const rstr=rec.rounds.map(r=>'R'+r.round+':P'+r.winner).join('  ');txt(rstr,W/2,ry+110,10,'#444');}
    });
  }
  ctx.restore();
  if(hist.length>3&&histScroll<20){ctx.shadowColor='#5533aa';ctx.shadowBlur=8;txt('▼ SCROLL FOR MORE',W/2,H-22,13,'#5533aa');ctx.shadowBlur=0;}
}

function drawCursor(){
  ctx.save();ctx.strokeStyle='#cc88ff';ctx.lineWidth=1.5;ctx.shadowColor='#cc88ff';ctx.shadowBlur=8;
  ctx.beginPath();ctx.moveTo(mouseX-10,mouseY);ctx.lineTo(mouseX+10,mouseY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(mouseX,mouseY-10);ctx.lineTo(mouseX,mouseY+10);ctx.stroke();
  ctx.beginPath();ctx.arc(mouseX,mouseY,3,0,Math.PI*2);ctx.fillStyle='#cc88ff';ctx.fill();
  ctx.restore();
}