// ── CURSED CLASH · cc_ui.js ── All screen drawing (menus, HUD, skill bars, overlays)
// To add a new screen: add drawMyScreen() here, route it in cc_loop.js loop()
// ── BACKGROUND ──
// ── Static background cached to offscreen canvas (created once, blit each frame) ──
let _bgCache=null;
function _buildBgCache(){
  const oc=document.createElement('canvas');oc.width=W;oc.height=H;const ox=oc.getContext('2d');
  const sky=ox.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#030208');sky.addColorStop(0.7,'#060318');sky.addColorStop(1,'#000');ox.fillStyle=sky;ox.fillRect(0,0,W,H);
  ox.strokeStyle='rgba(40,20,65,0.12)';ox.lineWidth=0.5;
  for(let x=0;x<W;x+=100){ox.beginPath();ox.moveTo(x,0);ox.lineTo(x,H);ox.stroke();}
  for(let y=0;y<FLOOR;y+=100){ox.beginPath();ox.moveTo(0,y);ox.lineTo(W,y);ox.stroke();}
  ox.fillStyle='rgba(55,20,95,0.038)';ox.font='bold 165px "Courier New"';ox.textAlign='center';ox.fillText('CURSED CLASH',W/2,H/2+65);
  const grd=ox.createLinearGradient(0,FLOOR,0,H);grd.addColorStop(0,'#110820');grd.addColorStop(1,'#030108');ox.fillStyle=grd;ox.fillRect(0,FLOOR,W,H-FLOOR);
  const gl=ox.createLinearGradient(0,0,W,0);gl.addColorStop(0,'rgba(0,0,0,0)');gl.addColorStop(0.25,'#6622bb');gl.addColorStop(0.75,'#6622bb');gl.addColorStop(1,'rgba(0,0,0,0)');ox.strokeStyle=gl;ox.lineWidth=2;ox.beginPath();ox.moveTo(0,FLOOR);ox.lineTo(W,FLOOR);ox.stroke();
  _bgCache=oc;
}
function drawBackground(){
  if(!_bgCache)_buildBgCache();
  ctx.drawImage(_bgCache,0,0);
  // Domain tint overlay (dynamic — cannot be cached)
  if(p1&&p2){[p1,p2].forEach(p=>{if(p.domainActive){const t2=Date.now()*0.001,g=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,W);g.addColorStop(0,hex8(p.color,'00'));g.addColorStop(1,hex8(p.color,'20'));ctx.globalAlpha=0.10+0.03*Math.sin(t2*2.5);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}});}
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
  if(p1.ultActive&&p1.charName==='Star Rage'&&p1.ultTimer>0)bots.push({s:'left',col:p1.color,msg:'◆ BLACK HOLE '+Math.ceil(p1.ultTimer/1000)+'s'});
  if(p2.ultActive&&p2.charName==='Star Rage'&&p2.ultTimer>0)bots.push({s:'right',col:p2.color,msg:'BLACK HOLE ◆ '+Math.ceil(p2.ultTimer/1000)+'s'});
  if(p1.ultActive&&p1.charName==='Cursed Vessel'&&p1.ultTimer>0)bots.push({s:'left',col:p1.color,msg:'◆ CURSED FINGERS '+Math.ceil(p1.ultTimer/1000)+'s'});
  if(p2.ultActive&&p2.charName==='Cursed Vessel'&&p2.ultTimer>0)bots.push({s:'right',col:p2.color,msg:'CURSED FINGERS ◆ '+Math.ceil(p2.ultTimer/1000)+'s'});
  if(p1.ultActive&&p1.charName==='Straw Doll'&&p1.ultTimer>0)bots.push({s:'left',col:p1.color,msg:'◆ RESONANCE '+Math.ceil(p1.ultTimer/1000)+'s'});
  if(p2.ultActive&&p2.charName==='Straw Doll'&&p2.ultTimer>0)bots.push({s:'right',col:p2.color,msg:'RESONANCE ◆ '+Math.ceil(p2.ultTimer/1000)+'s'});
  if(p1.isImmune()&&(p2.domainActive))txt('⊗ DOMAIN IMMUNE',PAD,H-58,10,'#22ff44','left');
  if(p2.isImmune()&&(p1.domainActive))txt('⊗ DOMAIN IMMUNE',W-PAD,H-58,10,'#22ff44','right');
  bots.forEach((b,bi)=>{const by=H-44-bi*18;ctx.fillStyle='rgba(0,0,0,0.65)';if(b.s==='left')ctx.fillRect(PAD-4,by-14,200,18);else ctx.fillRect(W-PAD-200,by-14,200,18);txt(b.msg,b.s==='left'?PAD:W-PAD,by,11,b.col,b.s);});
  // Binded Battle vow display
  if(gameMode==='bindedbattle'){
    const pad=PAD;
    if(p1.vow){const v=VOWS[p1.vow];let lab=v.icon+' '+v.short;if(p1.vow==='adaptation')lab+=' ('+p1.vowData.adaptStacks+'× reduce)';if(p1.vow==='sixeyes')lab+=' (-5hp/skill)';if((p1.vow==='discharged'||p1.vow==='overwhelming')&&p1.vowData.ultUsed)lab+=' 🔒';txt(lab,pad,H-76,10,v.color,'left');}
    if(p2.vow){const v=VOWS[p2.vow];let lab=v.short+' '+v.icon;if(p2.vow==='adaptation')lab='('+p2.vowData.adaptStacks+'× reduce) '+lab;if(p2.vow==='sixeyes')lab='(-5hp/skill) '+lab;if((p2.vow==='discharged'||p2.vow==='overwhelming')&&p2.vowData.ultUsed)lab='🔒 '+lab;txt(lab,W-pad,H-76,10,v.color,'right');}
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
  if(player.cursedShield>0){const sr=Math.min(1,player.cursedShield/200);ctx.fillStyle='rgba(255,0,80,0.25)';ctx.fillRect(x,y-10,bw*sr,8);ctx.strokeStyle='#ff3377';ctx.lineWidth=0.5;ctx.strokeRect(x,y-10,bw,8);ctx.shadowColor='#ff3377';ctx.shadowBlur=6;txt('🛡'+Math.ceil(player.cursedShield),side==='left'?x+bw-2:x+2,y+bh*0.38-2,9,'#ff3377',side==='left'?'right':'left',true);ctx.shadowBlur=0;}
  txt('P'+player.num+' · '+player.charName,side==='left'?x:x+bw,y+bh+16,14,player.color,side,true);
  txt(Math.ceil(player.hp)+'/'+maxHp,side==='left'?x+bw:x,y+bh+16,12,'#fff',side==='left'?'right':'left',true);
  const ux=side==='left'?x:x+bw-uw,ur=player.ult/MAX_ULT;
  ctx.fillStyle='#0a0a0a';ctx.fillRect(ux,y+bh+18,uw,uh);
  ctx.fillStyle=player.ult>=MAX_ULT?'#ffcc00':'#3a1c00';
  if(side==='left')ctx.fillRect(ux,y+bh+18,uw*ur,uh);else ctx.fillRect(ux+uw-uw*ur,y+bh+18,uw*ur,uh);
  ctx.strokeStyle='#2a2a2a';ctx.strokeRect(ux,y+bh+18,uw,uh);
  const ultSealed=(player.vow==='discharged'||player.vow==='overwhelming')&&player.vowData.ultUsed;
  const _pctrl=getCtrl(player.num);const uk=side==='left'?'['+_pctrl.sk[3].toUpperCase()+'] ULT':'ULT ['+_pctrl.sk[3].toUpperCase()+']';
  if(ultSealed){ctx.shadowColor='#ff3333';ctx.shadowBlur=6;txt('🔒 ULT SEALED',side==='left'?ux+3:ux+uw-3,y+bh+28,9,'#ff3333',side,true);ctx.shadowBlur=0;}
  else txt(player.ult>=MAX_ULT?'★ '+uk+' READY':Math.floor(player.ult)+'%  '+uk,side==='left'?ux+3:ux+uw-3,y+bh+28,9,player.ult>=MAX_ULT?'#ffcc00':'#555',side,true);
}

// ── SKILL BAR (below floor, big icons + CD timer) ──
function drawSkillBar(player,side){
  const BS=62,BH=92,GAP=5;
  const _sctrl=getCtrl(player.num);const kl=_sctrl.sk.map(k=>k.toUpperCase());
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

    // Panel bg
    ctx.fillStyle=isJP?'rgba(12,20,8,0.97)':(ready?(isU?'rgba(22,12,0,0.95)':'rgba(6,16,8,0.95)'):'rgba(5,5,8,0.92)');
    ctx.strokeStyle=isJP?'#ffcc00':(ready?col:'#181818');
    ctx.lineWidth=isJP?2.5:(ready?2:1);
    ctx.fillRect(bx,barY,BS,BH);ctx.strokeRect(bx,barY,BS,BH);

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

    // Skill name — tiny at bottom above timer
    const sk=player.def.skills[i];
    const nm=sk.name.length>10?sk.name.slice(0,9)+'…':sk.name;
    txt(isJP?'★'+nm:nm,bx+BS/2,barY+BH-19,7,isJP?'#ffcc00':(ready?col:'#383838'));

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
  btn(bx,220,bw,bh,'▶  PLAY','#00ff88','Start a match');
  btn(bx,300,bw,bh,'📖  INFORMATION','#00aaff','Characters & controls');
  btn(bx,380,bw,bh,'📜  HISTORY','#ffaa00','Past match results');
  btn(bx,460,bw,bh,'📋  PATCH NOTES','#cc88ff','Version history');
  btn(bx,540,bw,bh,'⌨  KEYBINDS','#ff9944','Change control presets');
  const _c1=getCtrl(1),_c2=getCtrl(2);
  txt('v8.0  ·  P1: ['+_c1.l.toUpperCase()+'/'+_c1.r.toUpperCase()+'] move  ['+_c1.u.toUpperCase()+'] jump  ['+_c1.sk.map(k=>k.toUpperCase()).join('/')+'] skills',W/2,618,10,'#333',undefined,false);
  txt('P2: ['+_c2.l.toUpperCase()+'/'+_c2.r.toUpperCase()+'] move  ['+_c2.u.toUpperCase()+'] jump  ['+_c2.sk.map(k=>k.toUpperCase()).join('/')+'] skills',W/2,631,10,'#333',undefined,false);
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
  btn(bx,506,bw,bh,'🎯  TRAINING','#44ff88','Practice vs dummy · hitboxes shown · infinite respawns');
  txt('Choose characters · [R] reset session · [ENTER] exit to menu',W/2,591,10,'#224433');
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
  const _vc1=getCtrl(1),_vc2=getCtrl(2);
  const _p1hint='['+_vc1.l.toUpperCase()+'/'+_vc1.r.toUpperCase()+'] choose  ['+_vc1.u.toUpperCase()+'] bind';
  const _p2hint='['+_vc2.l.toUpperCase()+'/'+_vc2.r.toUpperCase()+'] choose  ['+_vc2.u.toUpperCase()+'] bind';
  [[LCX,'P1','#00aaff',_p1hint],[RCX,'P2','#ff6622',_p2hint]].forEach(([cx,pn,pc,hint])=>{
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(cx-CW/2,startY-2,CW/2,26);
    ctx.strokeStyle=pc;ctx.lineWidth=1.5;ctx.strokeRect(cx-CW/2,startY-2,CW/2,26);
    ctx.shadowColor=pc;ctx.shadowBlur=10;txt(pn,cx-CW/4,startY+14,14,pc);ctx.shadowBlur=0;
    txt(hint,cx-CW/4,startY+14,9,'#888',undefined,false);
    ctx.shadowBlur=0;
  });

  const safeOpts=(opts)=>opts&&opts.length===3?opts:['overtime','enchain','eyeforaleg'];

  const _vck1=getCtrl(1).u.toUpperCase(),_vck2=getCtrl(2).u.toUpperCase();
  [[safeOpts(p1VowOptions),p1VowIdx,p1VowConf,LCX,_vck1],[safeOpts(p2VowOptions),p2VowIdx,p2VowConf,RCX,_vck2]].forEach(([opts,selIdx,conf,cx,ck])=>{
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

  const _totalCharsForQ=CHAR_NAMES.length;
  const _qMysteryRow=Math.floor(_totalCharsForQ/COLS);
  CHAR_NAMES.forEach((name,idx)=>{
    const def=CHARS[name];
    const col2=idx%COLS,row=Math.floor(idx/COLS);
    const rowStart=row*COLS;
    const charsInThisRow=Math.min(COLS,CHAR_NAMES.length-rowStart);
    // If this is the same row as ???, include the ??? slot in centering
    const effectiveCount=(row===_qMysteryRow)?charsInThisRow+1:charsInThisRow;
    const rowW=effectiveCount*(CW+GAP)-GAP;
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
    ctx.fillStyle=def.color;ctx.fillRect(mid-26,cardY+132,24,8);
    ctx.strokeStyle='#222';ctx.lineWidth=0.5;ctx.strokeRect(mid-26,cardY+132,24,8);
    ctx.fillStyle=def.color2;ctx.fillRect(mid+2,cardY+132,24,8);ctx.strokeRect(mid+2,cardY+132,24,8);

    // Character name + description — clipped to card width
    ctx.save();
    ctx.beginPath();ctx.rect(cardX+2,cardY+140,CW-4,CH-144);ctx.clip();
    txt(name.toUpperCase(),mid,cardY+152,9,def.color);
    // 2-line description
    def.desc.forEach((d,di)=>txt(d,mid,cardY+165+di*12,7,'#888',undefined,false));
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

  // ─── ??? MYSTERY CHARACTER ───
  {
    const totalChars=CHAR_NAMES.length;
    const col2=totalChars%COLS,row=Math.floor(totalChars/COLS);
    const rowStart=row*COLS;
    const charsInRow=totalChars-rowStart;
    const rowCount=charsInRow+1;
    const rowW=rowCount*(CW+GAP)-GAP;
    const cardX=(W-rowW)/2+col2*(CW+GAP);
    const cardY=startY+row*(CH+GAP);
    const t3=Date.now()*0.001;
    ctx.globalAlpha=0.5+0.3*Math.sin(t3*1.8);
    ctx.fillStyle='#06030e';ctx.strokeStyle='#220044';ctx.lineWidth=1.5;
    ctx.fillRect(cardX,cardY,CW,CH);ctx.strokeRect(cardX,cardY,CW,CH);
    ctx.shadowColor='#aa00ff';ctx.shadowBlur=16+8*Math.sin(t3*2.2);
    txt('???',cardX+CW/2,cardY+CH/2+10,40,'#550088');
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    txt('COMING SOON',cardX+CW/2,cardY+CH-14,7,'#220033',undefined,false);
  }
  const _sc1=getCtrl(1),_sc2=getCtrl(2);
  txt('P1: ['+_sc1.l.toUpperCase()+'/'+_sc1.r.toUpperCase()+'] browse  ['+_sc1.u.toUpperCase()+'] confirm     P2: ['+_sc2.l.toUpperCase()+'/'+_sc2.r.toUpperCase()+'] browse  ['+_sc2.u.toUpperCase()+'] confirm',W/2,H-28,11,'#333',undefined,false);
  if(aiEnabled){
    txt(p1Conf?'P1 ready! Bot will pick for P2...':'P1: ['+_sc1.l.toUpperCase()+'/'+_sc1.r.toUpperCase()+'] browse  ['+_sc1.u.toUpperCase()+'] confirm',W/2,H-12,12,p1Conf?'#ffcc00':'#444');
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
  ctx.shadowColor=wp.color;ctx.shadowBlur=50;txt('P'+wp.num+' WINS THE MATCH',W/2,H/2-65,62,wp.color);ctx.shadowBlur=0;
  txt(wp.charName.toUpperCase()+' REIGNS VICTORIOUS',W/2,H/2-10,20,'#9955cc');
  txt(GAME_MODES[gameMode].name.toUpperCase()+'  ·  P1: '+p1RoundWins+' — P2: '+p2RoundWins,W/2,H/2+25,15,'#555');
  const dotY=H/2+65,dotR=11;
  for(let r=0;r<winsNeeded();r++){const offs=(r-(winsNeeded()-1)/2)*26;ctx.fillStyle=r<p1RoundWins?p1.color:'#1a1a1a';ctx.shadowColor=r<p1RoundWins?p1.color:'transparent';ctx.shadowBlur=r<p1RoundWins?12:0;ctx.beginPath();ctx.arc(W/2-75+offs,dotY,dotR,0,Math.PI*2);ctx.fill();ctx.fillStyle=r<p2RoundWins?p2.color:'#1a1a1a';ctx.shadowColor=r<p2RoundWins?p2.color:'transparent';ctx.shadowBlur=r<p2RoundWins?12:0;ctx.beginPath();ctx.arc(W/2+75+offs,dotY,dotR,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;
  txt('P1',W/2-87,dotY+28,12,'#444');txt('P2',W/2+63,dotY+28,12,'#444');
  // Rematch + Menu buttons
  const bw=200,bh=48,by=H/2+120;
  btn(W/2-bw-12,by,bw,bh,'🔁  REMATCH','#ff8800');
  btn(W/2+12,by,bw,bh,'🏠  MAIN MENU','#555');
  txt('[R] Rematch  ·  [ENTER] Main Menu',W/2,by+bh+22,11,'#333');
}

function drawTrainingOverlay(){
  ctx.save();
  // Hitboxes
  ctx.lineWidth=2;
  if(p1){ctx.strokeStyle=p1.color;ctx.shadowColor=p1.color;ctx.shadowBlur=10;ctx.strokeRect(p1.x,p1.y,PW,PH);}
  if(p2){ctx.strokeStyle=p2.color;ctx.shadowColor=p2.color;ctx.shadowBlur=10;ctx.strokeRect(p2.x,p2.y,PW,PH);}
  ctx.shadowBlur=0;
  // Bottom hint
  txt('[R] Reset Session  ·  [ENTER] Exit Training',W/2,H-14,10,'#336633');
  ctx.restore();
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
  const _ic1=getCtrl(1),_ic2=getCtrl(2);
  txt('P1: ['+_ic1.l.toUpperCase()+'] Left  ['+_ic1.r.toUpperCase()+'] Right  ['+_ic1.u.toUpperCase()+'] Jump  |  ['+_ic1.sk.slice(0,3).map(k=>k.toUpperCase()).join('/')+'] Skills  ['+_ic1.sk[3].toUpperCase()+'] Ult',W/2,cy+28,11,'#9988bb',undefined,false);
  txt('P2: ['+_ic2.l.toUpperCase()+'] Left  ['+_ic2.r.toUpperCase()+'] Right  ['+_ic2.u.toUpperCase()+'] Jump  |  ['+_ic2.sk.slice(0,3).map(k=>k.toUpperCase()).join('/')+'] Skills  ['+_ic2.sk[3].toUpperCase()+'] Ult',W/2,cy+46,11,'#9988bb',undefined,false);
  txt('Mouse: Menus  ·  [ENTER]: Return to menu after match',W/2,cy+68,11,'#665577',undefined,false);
  txt('Domain Clash: Both ULT keys within 0.65s  →  QTE spam skills to win!',W/2,cy+86,11,'#9944cc',undefined,false);
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
  // Toggle minor patches button
  btn(W-200,20,160,38,patchHideMinor?'SHOW MINOR':'HIDE MINOR','#776688');
  const patches=[
    {ver:'v8.0',col:'#aa55ee',title:"A SOUL'S NIGHTMARE",minor:false,notes:[
      '★ NEW CHARACTER: Idle Transfiguration (Mahito) — purple soul manipulator',
      '  Skill 1 · Soul Punch (CD 2.5s): 20dmg + permanently reduces enemy MAX HP by 12 per hit (min 50)',
      '  Skill 2 · Soul Isomer (CD 4.5s): launches tracking transfigured human — 18dmg on contact. Absorbs ONE incoming hit for Mahito while in flight.',
      '  Skill 3 · Body Geometry (CD 5.5s): wide 200px soul burst — 26dmg + 0.7s root (movement nullified).',
      '  Ultimate · Self-Embodiment of Perfection (8s): TRUE DAMAGE domain — all hits bypass DR, Cursed Fingers shield, adaptation, and cursed nullification.',
      '  Note: Soul Punch maxHp reduction stacks; vs high-HP modes this punishes passive play hard.',
      '⚖ MANJI KICK CD: 4.5s → 5.0s (counter window still 1s)',
      '⚖ STAR RAGE — all skill CDs +1s: Mass Burst 2s→3s | Imaginary Mass 3s→4s | Mass Augment 5s→6s',
      '⚖ REBALANCE — shadowed characters:',
      '  Heavenly Restriction: Iron Guard CD 7.5s→5.5s | Seismic Slam CD 5.8s→5.0s',
      '  Projection Sorcery: Stagnation CD 6.5s→5.5s',
      '  Thunder God: Static Rush damage 15→20',
      '  Limitless: Cursed Blue damage 20→24',
      '  Fever Dreamer: Iron Ball 25→29dmg (44 jackpot) | Cursed Door 20→24dmg (38 jackpot)',
    ]},
    {ver:'v7.8',col:'#ff44aa',title:'BUG FIXES',minor:false,notes:[
      'ὁb CRITICAL FIX: Star Rage Black Hole visual disappeared when any domain background activated — Black Hole is now drawn in a dedicated pass after all domain backgrounds, so it always renders on top',
      'ὁb TRAINING DUMMY: respawning dummy no longer preserved active ult, domain, Black Hole orb, or cooldowns — all combat state is now fully cleared on respawn',
      'ὁb TRAINING RESET [R]: reset also now clears domainActive and blackHoleOrb on both players',
      'ὁb AI CLASH FIX (v7.7 regression): AI domain clash was calling useSkill() instead of rhythmClashKeyHit() — AI now properly participates in the rhythm note highway',
      'ὁb FX CRASH FIX (v7.7 regression): partial edit left blackHoleOrb draw code orphaned outside effects.forEach, causing ReferenceError on every frame',
      '★ Version updated to v7.8',
    ]},
    {ver:'v7.7',col:'#aa88ff',title:'GAMEPLAY IMPROVEMENTS',minor:false,notes:[
      '★ DOMAIN CLASH REWORK: replaced spam QTE with FNF-style rhythm note highway',
      '  Each player has 22 notes scrolling down 3 lanes over 11 seconds (1s GET READY + 10s fight)',
      '  Notes start sparse (first 1.5s), ramp up through the middle, ease off at the end',
      '  Scroll speed reduced to 0.075px/ms — notes visible well in advance',
      '  PERFECT (±55ms) = 2pts | GOOD (±110ms) = 1pt | MISS = 0pts',
      '  Shared power bar updates in real time showing who is winning the clash',
      '★ AI DOMAIN CLASH: AI bots now participate in the rhythm highway with difficulty scaling',
      '  Grade 3: ~32% miss rate, ±210ms timing spread (mostly GOOD/MISS)',
      '  Grade 1: ~14% miss rate, ±95ms spread (mix of PERFECT/GOOD)',
      '  Special: ~5% miss rate, ±42ms spread (mostly PERFECT)',
      '  Unclassified: ~1% miss rate, ±16ms spread (near-perfect every note)',
      '★ HIT FREEZE: large hits (≥30dmg) pause gameplay for 85ms for impact feel',
      '★ TRAINING MODE: dummy auto-respawns, [R] resets session, hitboxes shown',
      '★ REMATCH BUTTON: added to match-over screen alongside Main Menu',
      '★ Panel height increased and lanes widened to match longer highway duration',
    ]},
    {ver:'v7.6.1',col:'#ff8844',title:'EXTRA BUG FIXES',minor:false,notes:[
      'ὁb ULT BUG FIX: Defender was gaining ult from hits while attacker\'s ult was active — now blocked',
      'ὁb CLASH HINT FIX: Domain Clash hint showed hardcoded keys — now reads live keybind preset',
      'ὁb STRAW DOLL FIX: Black Flash on marked enemy now explicitly zeroes ult bar before activating ult',
      'ὁb DOMAIN CANCEL FIX: Star Rage skills spawned 13–14 effects at once, exceeding the transient cap and ejecting domain backgrounds from the array — cosmetic and pinned effects are now tracked separately',
    ]},
    {ver:'v7.6',col:'#ffcc00',title:'IDLE DEATH GAMBLE BUFF',minor:false,notes:[
      '⚖ Jackpot base chance reduced: 30% → 25%',
      '★ Jackpot win displays winning digits large in the background so both players can see',
      '★ Jackpot buff system: winning digit parity sets a carry-over buff for your NEXT domain',
      '  ODD digits (e.g. 777) → next domain rolls at 40% jackpot chance',
      '  EVEN digits (e.g. 888) → next domain rolls every 1.5s instead of 2.5s',
      '★ Buffs loop — each jackpot sets the next buff; chain runs as long as you keep winning',
      '★ Active buff announced when domain activates (screen flash + text label)',
      '★ Spin interval bar reflects live roll speed when speed-buff is active',
    ]},
    {ver:'v7.5',col:'#00ffcc',title:'OPTIMIZATION + AI REWORK',minor:false,notes:[
      '⚡ Performance: auto-detects low FPS (<45) and disables glow/shadows to recover framerate',
      '⚡ Performance: particle cap reduced to 28; cosmetic effects capped separately from functional ones',
      '⚡ Performance: shadowBlur moved outside draw loops — no longer set per-trail-segment',
      '★ AI: bots no longer block — they read live projectile hitboxes and dodge',
      '★ AI: hitbox-aware dodge — reads incoming projectile size/position, not just direction',
      '★ AI: mid-air dodge added — bot can dash sideways while airborne to evade',
      '★ AI: difficulty-scaled dodge: Grade 3 22% → Unclassified 99% reaction rate',
      '★ AI: all characters have strict skill range gates — no wasted CDs at wrong range',
    ]},
    {ver:'v7.4',col:'#88ccff',title:'MINOR CHANGES / BUG FIXES',minor:false,notes:[
      '✦ Cursed Vessel icon: fist with Sukuna tattoo marks, CE arcs, crimson flare',
      '★ Star Rage — ult active: all skills stun enemy 0.5s on hit',
      '★ Star Rage — Black Hole: owner no longer pulled by their own black hole; self-damage stays 30/s',
      '★ P2 skill preset 1 changed to Y/H/N/K (no conflicts). Preset 2: 7/8/9/0.',
      '὾2 SFX: hover/click/back/confirm on all menu buttons',
      '὾2 SFX: character browse/confirm, Black Flash distortion burst, nail strike',
      '὾2 SFX: heavy swing, Shrine cleave hit sound',
      'ὁb Vow Select: P2 hints now dynamically read active keybind preset',
      'ὁb P2 skill preset 2 had key conflict with movement — fixed',
    ]},
    {ver:'v7.3.1',col:'#ffdd44',title:'CLARIFICATIONS',minor:true,notes:[
      '⚖ Star Rage — Mass Burst: 35→25dmg (further reduced)',
      '⚖ Star Rage — Black Hole: enemy tick reverted to 30/s; user self-damage 15/s',
      '⚖ Cursed Vessel — Black Flash: 45→50dmg',
      '⚖ Cursed Vessel — Divergent Fist: 18→15dmg | Rush 6→5dmg | Final 12→10dmg',
      '⚖ Cursed Vessel — Cursed Fingers shield: restored to 100hp',
      '✦ Cursed Vessel color: #ff3377→#ff6600 (distinct from Shrine #ff3355)',
    ]},
    {ver:'v7.3',col:'#44ddaa',title:'THE REBALANCE OF 26 + DESIGN CHANGES',minor:false,notes:[
      '⚖ Star Rage — Mass Burst: 45→35dmg | Imaginary Mass: 40→28dmg | Mass Augment: 55→40dmg',
      '⚖ Star Rage — Black Hole: enemy 30/s→20/s, self 20/s→15/s',
      '⚖ Cursed Vessel — Black Flash: 65→45dmg, stun 600→500ms | Fist: 25→18dmg, shock 15→10dmg',
      '⚖ Cursed Vessel — Rush: 8→6dmg each, Final 16→12dmg | Shield: 100→65hp',
      '✦ Star Rage icon: accretion disk with gravitational lensing + Hawking jets',
      '✦ Straw Doll icon: rubber mallet with nail + shine sweep',
      '✦ Cursed Vessel icon: redesigned (fire theme)',
      '✦ Keybind page: side-by-side P1/P2 panels with conflict detection',
    ]},
    {ver:'v7.2',col:'#ee8844',title:'BUG EXTERMINATION PT.2',minor:true,notes:[
      'ὁb Keybind menu: preset buttons unclickable (isHov coords were offset)',
      'ὁb Keybind menu: active preset summary showed wrong values after switch',
      'ὁb Conflict detection: false positives when P1 and P2 used different preset types',
      'ὁb Apostrophe in v7.1 patch notes caused JS syntax error',
    ]},
    {ver:'v7.1',col:'#aaddff',title:'QUALITY OF LIFE UPDATE',minor:true,notes:[
      '★ Keybind presets: added in-game remapping (KEYBINDS screen)',
      '  P1 Mov 1: Q/W/E  Mov 2: A/W/D  |  Sk 1: 1,2,3/4  Sk 2: R,F,C/S',
      '  P2 Mov 1: U/I/O  Mov 2: J/I/L  |  Sk 1: Y,H,N/K  Sk 2: 7,8,9/0',
      'ὁb Fixed apostrophe crash in Shrine skill description',
    ]},
    {ver:'v7.0',col:'#ff3377',title:'CURSED VESSEL ARRIVES',minor:false,notes:[
      '★ New character: Cursed Vessel (Yuji Itadori) — orange CE brawler',
      '  Skill 1 · Divergent Fist (CD 2.8s): 25% chance Black Flash (50dmg + stun 500ms)',
      '    Otherwise: 15dmg punch + 10dmg cursed shock 0.2s later',
      '    Ult raises Black Flash chance to 50%. CD resets to 0 on Black Flash.',
      '  Skill 2 · Manji Kick (CD 4.5s): 1s counter window — attacker stunned 1.2s + takes 75% dmg back',
      '  Skill 3 · Cursed Rush (CD 3.4s): 4–5 hit combo 5dmg each + Final Blow 10dmg',
      '  Ultimate · Cursed Fingers (10s): 2× speed, 20% DR, 50% BF chance, 100hp shield',
      '  cantDomainClash: true — no domain expansion, IS affected by enemy domains',
    ]},
    {ver:'v6.0',col:'#ff8822',title:'STRAW DOLL + PLAYER VS AI + STAR RAGE BUFF',minor:false,notes:[
      '★ New character: Straw Doll (Noritoshi Kamo) — cursed nail + mark system',
      '  Skill 1 · Nail Barrage: 3 nails, 18dmg each, homing, marks on hit',
      '  Skill 2 · Resonance Orb: slow orb that marks on hit',
      '  Skill 3 · Blood Manipulation: heal or damage, consumes mark',
      '  Ultimate · Resonance (marked moveset): 3 powered skills consuming the mark',
      '★ Player vs AI mode added (4 difficulty tiers — Grade 3 / Grade 1 / Special / Unclassified)',
      '★ Star Rage Black Hole: orb thrown, auto-activates on enemy proximity',
      '★ History page: CLEAR HISTORY button added',
    ]},
    {ver:'v5.1',col:'#cc88ff',title:'STAR RAGE + REBALANCE',minor:false,notes:[
      '★ New character: Star Rage (Yuki Tsukumo) — imaginary mass fighter',
      '  Skill 1 · Mass Burst: 45dmg shockwave, 240px range (later rebalanced to 25dmg in v7.3.1)',
      '  Skill 2 · Imaginary Mass: dense 40dmg projectile (later 28dmg)',
      '  Skill 3 · Mass Augment: charge slam 55dmg + extreme knockback (later 40dmg)',
      '  Ultimate · Black Hole: throw slow orb → pulls both players; 30dmg/s to enemy',
      '★ New vows: Cursed Nullification, Cursed Regeneration, Cursed Vitality, Six Eyes, Domain Vow',
      '★ Flash Step: flat 10dmg streak, range grows each hit',
    ]},
    {ver:'v5.0',col:'#ff44cc',title:'MAJOR REBALANCE',minor:false,notes:[
      '◆ Jackpot: 30% chance (was 40%), lasts 14s (was 20s)',
      '◆ Malevolent Shrine: 10dmg/0.25s, slash storm VFX',
      '◆ Flash Step streak mechanic added',
    ]},
    {ver:'v4.0',col:'#ffcc00',title:'VOW SYSTEM + FEVER DREAMER',minor:false,notes:[
      '◆ Binding Vow system added to Binded Battle mode',
      '◆ Fever Dreamer (Hakari) added — Idle Death Gamble slot machine',
      '◆ Vows: Overtime, Enchain, Eye for a Leg, Adaptation, Discharged, Overwhelming',
    ]},
    {ver:'v3.0',col:'#ffaa00',title:'THUNDER GOD + DOMAIN CLASH',minor:false,notes:[
      '◆ Thunder God (Kashimo) added — Mythical Beast Amber transformation',
      '◆ Domain Clash QTE system for simultaneous domain activations',
      '◆ Voltage Cage trap + Charge debuff (Static Rush)',
    ]},
    {ver:'v2.0',col:'#55aaff',title:'LIMITLESS + DOMAINS',minor:false,notes:[
      '◆ Limitless (Gojo) added — Red / Blue / Hollow Purple / Infinite Void',
      '◆ Domain Expansion: Time Cell Moon Palace, Malevolent Shrine',
      '◆ Heavenly Restriction domain immunity added',
    ]},
    {ver:'v1.0',col:'#00ff88',title:'INITIAL RELEASE',minor:false,notes:[
      '◆ 2-player local fighting game — Cursed Clash',
      '◆ Projection Sorcery, Heavenly Restriction, Shrine — 3 launch characters',
      '◆ Casual + Quick Play modes, match history',
    ]},
  ];
  let patchHideMinorLocal=typeof patchHideMinor!=='undefined'?patchHideMinor:false;
  const visible=patches.filter(p=>!patchHideMinorLocal||!p.minor);
  const padL=80,padR=80;
  ctx.save();ctx.beginPath();ctx.rect(0,78,W,H-78);ctx.clip();
  let y=80-patchScroll;
  for(const p of visible){
    if(y>H)break;
    if(y+30>78){
      ctx.shadowColor=p.col;ctx.shadowBlur=12;
      ctx.fillStyle=p.col;ctx.globalAlpha=0.15;
      ctx.fillRect(padL,y-2,W-padL-padR,22);
      ctx.globalAlpha=1;ctx.shadowBlur=8;
      txt(p.ver+'  —  '+p.title,padL+12,y+14,13,p.col,'left');
      ctx.shadowBlur=0;
    }
    y+=26;
    for(const n of p.notes){
      if(y>H)break;
      if(y+14>78)txt(n,padL+20,y,10,'#888','left');
      y+=14;
    }
    y+=8;
  }
  ctx.restore();
  if(patchScroll<20)txt('▼ SCROLL',W/2,H-12,11,'#333');
}

function drawHistoryPage(){
  drawBackground2();
  btn(40,12,120,34,'← BACK','#555');
  ctx.shadowColor='#aa66ff';ctx.shadowBlur=16;txt('MATCH HISTORY',W/2,34,18,'#aa66ff');ctx.shadowBlur=0;
  btn(W-200,12,165,34,'CLEAR HISTORY','#cc4444');
  const hist=loadHistory();
  ctx.save();ctx.beginPath();ctx.rect(0,56,W,H-56);ctx.clip();
  const yoff=56-histScroll;
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
  if(hist.length>3&&histScroll<20){ctx.shadowBlur=0;txt('▼ SCROLL FOR MORE',W/2,H-22,12,'#333');}
}

function drawKeybindsPage(){
  drawBackground2();
  btn(40,20,120,38,'← BACK','#555');
  ctx.shadowColor='#ff9944';ctx.shadowBlur=18;
  txt('⌨  KEYBINDS',W/2,62,28,'#ff9944');ctx.shadowBlur=0;
  txt('Select a preset for each player — changes apply immediately',W/2,88,10,'#664422',undefined,false);

  // Detect key conflicts between P1 and P2
  const _kb1=getCtrl(1),_kb2=getCtrl(2);
  const k1all=[_kb1.l,_kb1.r,_kb1.u,..._kb1.sk];
  const k2all=[_kb2.l,_kb2.r,_kb2.u,..._kb2.sk];
  const conflicts=k1all.filter(k=>k2all.includes(k));

  // Preset button helper
  function _presetBtn(label,bx,by,bw,bh,active){
    const hov=isHov(bx,by,bw,bh);
    const sel=active;
    ctx.fillStyle=sel?'#1a0a00':(hov?'#1a0a00':'#080510');
    ctx.strokeStyle=sel?'#ff9944':(hov?'#ff9944':'#332211');
    ctx.lineWidth=sel?2:1;
    ctx.fillRect(bx,by,bw,bh);ctx.strokeRect(bx,by,bw,bh);
    if(sel||hov){
      const g=ctx.createLinearGradient(bx,0,bx+bw,0);
      g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(0.5,'rgba(255,153,68,0.22)');g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.fillRect(bx,by,bw,bh);
    }
    ctx.shadowColor=sel?'#ff9944':'transparent';ctx.shadowBlur=sel?10:0;
    txt(label,bx+bw/2,by+bh/2+7,sel?15:13,sel?'#fff':'#aa6633');
    ctx.shadowBlur=0;
  }

  // Panel draw helper
  function _panel(px,py,pw,ph,pnum,movPre,skPre){
    ctx.fillStyle='rgba(12,6,22,0.92)';ctx.strokeStyle='#ff9944';ctx.lineWidth=1;
    ctx.fillRect(px,py,pw,ph);ctx.strokeRect(px,py,pw,ph);
    ctx.fillStyle='#ff9944';ctx.fillRect(px,py,pw,4);
    ctx.shadowColor='#ff9944';ctx.shadowBlur=12;
    txt('PLAYER '+pnum,px+pw/2,py+30,16,'#ff9944');ctx.shadowBlur=0;

    const lbX=px+18;
    const b1x=px+120,b2x=px+340;

    // Movement presets
    const p1c1={movLabel:'1  ·  Q / W / E', skLabel:'1  ·  1, 2, 3  /  4'};
    const p1c2={movLabel:'2  ·  A / W / D', skLabel:'2  ·  R, F, C  /  S'};
    const p2c1={movLabel:'1  ·  U / I / O', skLabel:'1  ·  7, 8, 9  /  0'};
    const p2c2={movLabel:'2  ·  J / I / L', skLabel:'2  ·  Y, H, N  /  K'};
    const cfg=pnum===1?{c1:p1c1,c2:p1c2}:{c1:p2c1,c2:p2c2};
    const movPre1=pnum===1?1:1, movPre2=pnum===1?2:2;
    const curMovPre=pnum===1?p1MovPreset:p2MovPreset;
    const curSkPre=pnum===1?p1SkPreset:p2SkPreset;

    txt('MOVEMENT',lbX,py+66,10,'#888','left',false);
    _presetBtn(cfg.c1.movLabel,b1x,py+72,200,44,curMovPre===1);
    _presetBtn(cfg.c2.movLabel,b2x,py+72,200,44,curMovPre===2);
    txt('SKILLS',lbX,py+140,10,'#888','left',false);
    _presetBtn(cfg.c1.skLabel,b1x,py+146,200,44,curSkPre===1);
    _presetBtn(cfg.c2.skLabel,b2x,py+146,200,44,curSkPre===2);

    // Active summary
    const ctrl=getCtrl(pnum);
    const movSumm='Move: ['+ctrl.l.toUpperCase()+'/'+ctrl.r.toUpperCase()+']  Jump: ['+ctrl.u.toUpperCase()+']';
    const skSumm='Skills: ['+ctrl.sk.slice(0,3).map(k=>k.toUpperCase()).join('/')+']  Ult: ['+ctrl.sk[3].toUpperCase()+']';
    ctx.shadowColor='#ff9944';ctx.shadowBlur=4;
    txt(movSumm+'   '+skSumm,px+pw/2,py+218,10,'#ff9944',undefined,false);
    ctx.shadowBlur=0;
  }

  _panel(50,105,575,240,1,p1MovPreset,p1SkPreset);
  _panel(655,105,575,240,2,p2MovPreset,p2SkPreset);

  // Conflict warning
  if(conflicts.length>0){
    ctx.shadowColor='#ff3333';ctx.shadowBlur=10;
    txt('⚠ KEY CONFLICT: ['+conflicts.map(k=>k.toUpperCase()).join(', ')+'] used by both players',W/2,378,12,'#ff4444');
    ctx.shadowBlur=0;
  } else {
    ctx.shadowColor='#00ff88';ctx.shadowBlur=8;
    txt('✓ No conflicts',W/2,378,12,'#00ff88');
    ctx.shadowBlur=0;
  }
  txt('Click a preset button to switch — active preset glows orange',W/2,400,10,'#555',undefined,false);
}


function drawCursor(){
  ctx.save();ctx.strokeStyle='#cc88ff';ctx.lineWidth=1.5;ctx.shadowColor='#cc88ff';ctx.shadowBlur=8;
  ctx.beginPath();ctx.moveTo(mouseX-10,mouseY);ctx.lineTo(mouseX+10,mouseY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(mouseX,mouseY-10);ctx.lineTo(mouseX,mouseY+10);ctx.stroke();
  ctx.beginPath();ctx.arc(mouseX,mouseY,3,0,Math.PI*2);ctx.fillStyle='#cc88ff';ctx.fill();
  ctx.restore();
}