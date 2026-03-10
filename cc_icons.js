// ════ CHARACTER ICONS (all animated) ════
// ── SKILL ICON CACHE — pre-render static skill icons to offscreen canvas for performance ──
// Animated char icons (drawCharIcon) are NOT cached since they use time-based animation
// drawSkillIcon IS cacheable when not animating — cached on first draw per char/slot/col/ready state

const _siCache = {};
function _siKey(charName,slot,col,inThunderUlt){ return charName+'|'+slot+'|'+col+'|'+(inThunderUlt?1:0); }

function drawCharIcon(name,cx,cy,sz,col){
  ctx.save();
  ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=sz*0.07;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.shadowColor=col;ctx.shadowBlur=sz*0.17;
  const t=Date.now()*0.001;
  switch(name){

  case'Projection Sorcery':{
    // Original: 3 stacked glass panes with rivets + animated scan-line shimmer
    const pw=sz*0.34,ph=sz*0.5;
    const offX=[-sz*0.24,0,sz*0.24],offY=[sz*0.06,-sz*0.06,sz*0.06];
    offX.forEach((ox,pi)=>{
      const px=cx+ox,py=cy+offY[pi];
      ctx.globalAlpha=0.1+pi*0.1;ctx.fillStyle=col;
      ctx.fillRect(px-pw/2,py-ph/2,pw,ph);
      // Animated scan-line sliding down each pane (offset by pane index)
      const scanY=py-ph/2+((t*0.55+pi*0.33)%1)*ph;
      const sg=ctx.createLinearGradient(0,scanY-sz*0.06,0,scanY+sz*0.06);
      sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(0.5,'rgba(255,255,255,0.26)');sg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=sg;ctx.globalAlpha=1;ctx.fillRect(px-pw/2,scanY-sz*0.06,pw,sz*0.12);
      // Shine streak
      ctx.globalAlpha=0.16;ctx.fillStyle='#ffffff';
      ctx.beginPath();ctx.moveTo(px-pw/2+sz*0.04,py-ph/2+sz*0.04);ctx.lineTo(px-pw/2+pw*0.5,py-ph/2+sz*0.04);ctx.lineTo(px-pw/2+sz*0.04,py-ph/2+ph*0.5);ctx.closePath();ctx.fill();
      ctx.globalAlpha=1;ctx.strokeStyle=col;ctx.lineWidth=sz*(pi===2?0.09:0.06);
      ctx.strokeRect(px-pw/2,py-ph/2,pw,ph);
    });
    // Rivets on frontmost pane
    const fp=cx+sz*0.24,fy=cy+sz*0.06;
    ctx.fillStyle=col;ctx.globalAlpha=0.9;
    [[fp-pw/2,fy-ph/2],[fp+pw/2,fy-ph/2],[fp-pw/2,fy+ph/2],[fp+pw/2,fy+ph/2]].forEach(([rx,ry])=>{ctx.beginPath();ctx.arc(rx,ry,sz*0.045,0,Math.PI*2);ctx.fill();});
    ctx.globalAlpha=1;break;}

  case'Heavenly Restriction':{
    // Two chains crossing at centre forming an X, break-flash at intersection
    const pulse=0.85+0.15*Math.sin(t*4);
    ctx.lineWidth=sz*0.075;ctx.shadowBlur=sz*0.22;
    const drawChain=(pts,ang)=>{
      pts.forEach(([ox,oy])=>{
        ctx.save();ctx.translate(cx+ox,cy+oy);ctx.rotate(ang);
        ctx.globalAlpha=pulse;ctx.strokeStyle=col;
        ctx.beginPath();ctx.rect(-sz*0.14,-sz*0.055,sz*0.28,sz*0.11);ctx.stroke();
        ctx.restore();
      });
    };
    drawChain([[-sz*0.38,-sz*0.38],[-sz*0.19,-sz*0.19],[0,0],[sz*0.19,sz*0.19],[sz*0.38,sz*0.38]],Math.PI*0.25);
    drawChain([[sz*0.38,-sz*0.38],[sz*0.19,-sz*0.19],[0,0],[-sz*0.19,sz*0.19],[-sz*0.38,sz*0.38]],-Math.PI*0.25);
    // Break-flash at centre
    ctx.globalAlpha=0.25+0.65*Math.abs(Math.sin(t*2.5));
    ctx.strokeStyle='#ffffff';ctx.lineWidth=sz*0.07;ctx.shadowColor='#ffffff';ctx.shadowBlur=sz*0.28;
    ctx.beginPath();ctx.moveTo(cx-sz*0.1,cy-sz*0.04);ctx.lineTo(cx+sz*0.1,cy+sz*0.04);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx-sz*0.1,cy+sz*0.04);ctx.lineTo(cx+sz*0.1,cy-sz*0.04);ctx.stroke();
    ctx.globalAlpha=1;ctx.shadowColor=col;ctx.shadowBlur=0;break;}

  case'Shrine':{
    // Malevolent Shrine — unmistakeable animated torii with cursed eye + beam rays
    ctx.shadowColor=col;ctx.shadowBlur=sz*0.28;
    // ── Pulsing outer curse ring ──
    const outerA=0.18+0.16*Math.abs(Math.sin(t*2.2));
    ctx.globalAlpha=outerA;ctx.strokeStyle=col;ctx.lineWidth=sz*0.045;ctx.setLineDash([sz*0.06,sz*0.06]);
    ctx.beginPath();ctx.arc(cx,cy,sz*0.58,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=1;
    // ── Pillars ──
    ctx.fillStyle=col;ctx.shadowBlur=sz*0.28;
    ctx.fillRect(cx-sz*0.38,cy-sz*0.24,sz*0.15,sz*0.7);
    ctx.fillRect(cx+sz*0.23,cy-sz*0.24,sz*0.15,sz*0.7);
    // ── Main crossbeam ──
    ctx.fillRect(cx-sz*0.48,cy-sz*0.28,sz*0.96,sz*0.13);
    // ── Upper beam (wider, upturned ends) ──
    ctx.fillRect(cx-sz*0.52,cy-sz*0.44,sz*1.04,sz*0.12);
    // Upturned tips
    ctx.save();ctx.translate(cx-sz*0.52,cy-sz*0.38);ctx.beginPath();ctx.arc(0,0,sz*0.06,-Math.PI,0,true);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(cx+sz*0.52,cy-sz*0.38);ctx.beginPath();ctx.arc(0,0,sz*0.06,0,Math.PI,true);ctx.fill();ctx.restore();
    // ── Cursed eye — blinking, bright ──
    const blink2=Math.sin(t*0.75);
    const eyeOpenY=blink2>0.93?sz*0.005:sz*0.1*(0.7+0.3*Math.sin(t*12));
    if(eyeOpenY>sz*0.004){
      ctx.globalAlpha=0.95;ctx.shadowBlur=sz*0.39;
      // White sclera glow
      const eg=ctx.createRadialGradient(cx,cy+sz*0.05,0,cx,cy+sz*0.05,sz*0.18);
      eg.addColorStop(0,'#ffffff');eg.addColorStop(0.28,col);eg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=eg;ctx.beginPath();ctx.ellipse(cx,cy+sz*0.05,sz*0.18,eyeOpenY,0,0,Math.PI*2);ctx.fill();
      // Black pupil
      ctx.fillStyle='#000';ctx.globalAlpha=1;ctx.shadowBlur=0;
      ctx.beginPath();ctx.ellipse(cx,cy+sz*0.05,sz*0.055,eyeOpenY*0.45,0,0,Math.PI*2);ctx.fill();
    }
    // ── Radiating CE beam rays (rotate over time) — most obvious animation ──
    const rayT=t*1.8;
    ctx.lineWidth=sz*0.03;ctx.shadowBlur=sz*0.28;
    for(let ri=0;ri<6;ri++){
      const baseA=ri/6*Math.PI*2+rayT;
      const rayLen=sz*(0.28+0.18*Math.abs(Math.sin(rayT*0.9+ri*1.1)));
      const rayA=0.55+0.45*Math.abs(Math.sin(rayT*1.3+ri));
      ctx.globalAlpha=rayA*0.65;ctx.strokeStyle=col;
      ctx.beginPath();
      ctx.moveTo(cx+Math.cos(baseA)*sz*0.15,cy+sz*0.05+Math.sin(baseA)*sz*0.09);
      ctx.lineTo(cx+Math.cos(baseA)*rayLen,cy+sz*0.05+Math.sin(baseA)*rayLen*0.55);
      ctx.stroke();
    }
    // ── CE drips from beam ends ──
    [cx-sz*0.31,cx+sz*0.31].forEach((dx,di)=>{
      const dLen=sz*0.06+sz*0.12*Math.abs(Math.sin(t*1.5+di*1.8));
      ctx.globalAlpha=0.85;ctx.lineWidth=sz*0.04;ctx.strokeStyle=col;ctx.shadowBlur=sz*0.17;
      ctx.beginPath();ctx.moveTo(dx,cy-sz*0.24);ctx.lineTo(dx,cy-sz*0.24+dLen);ctx.stroke();
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(dx,cy-sz*0.24+dLen,sz*0.03,0,Math.PI*2);ctx.fill();
    });
    ctx.globalAlpha=1;ctx.shadowBlur=0;break;}

  case'Limitless':{
    // Six Eyes — animated orbiting stars (unchanged, already had animation)
    const eW=sz*0.46,eH=sz*0.3;
    ctx.fillStyle='#cce8ff';ctx.beginPath();ctx.moveTo(cx-eW,cy);ctx.bezierCurveTo(cx-eW*0.45,cy-eH*1.6,cx+eW*0.45,cy-eH*1.6,cx+eW,cy);ctx.bezierCurveTo(cx+eW*0.45,cy+eH*1.4,cx-eW*0.45,cy+eH*1.4,cx-eW,cy);ctx.fill();
    ctx.fillStyle='#1177ff';ctx.shadowBlur=sz*0.22;ctx.shadowColor='#55aaff';ctx.beginPath();ctx.arc(cx,cy,eH*0.9,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#001133';ctx.beginPath();ctx.arc(cx,cy,eH*0.46,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=col;ctx.lineWidth=sz*0.13;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(cx-eW,cy);ctx.bezierCurveTo(cx-eW*0.45,cy-eH*1.6,cx+eW*0.45,cy-eH*1.6,cx+eW,cy);ctx.stroke();
    ctx.lineWidth=sz*0.055;ctx.beginPath();ctx.moveTo(cx-eW,cy);ctx.bezierCurveTo(cx-eW*0.45,cy+eH*1.4,cx+eW*0.45,cy+eH*1.4,cx+eW,cy);ctx.stroke();
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(cx-eH*0.3,cy-eH*0.26,eH*0.26,eH*0.15,Math.PI*-0.35,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+eH*0.22,cy+eH*0.2,eH*0.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=col;ctx.shadowColor=col;
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t*0.8;const s=sz*0.052;const px=cx+Math.cos(a)*eW*1.1,py=cy+Math.sin(a)*eH*1.05;ctx.globalAlpha=0.8+0.2*Math.sin(t*5+i);ctx.shadowBlur=sz*0.22;ctx.beginPath();ctx.moveTo(px,py-s*1.9);ctx.lineTo(px+s*0.5,py-s*0.5);ctx.lineTo(px+s*1.9,py);ctx.lineTo(px+s*0.5,py+s*0.5);ctx.lineTo(px,py+s*1.9);ctx.lineTo(px-s*0.5,py+s*0.5);ctx.lineTo(px-s*1.9,py);ctx.lineTo(px-s*0.5,py-s*0.5);ctx.closePath();ctx.fill();}
    ctx.globalAlpha=1;ctx.shadowBlur=0;break;}

  case'Thunder God':{
    // Lightning bolt loops: GOLD phase → PURPLE phase, each ~2s, clear aura ring
    // cycle: 0..0.5 = gold, 0.5..1 = purple  (smooth cross-fade)
    const cyc=(t*0.28)%1;  // full cycle ~3.5s — slow enough to be very obvious
    const toPurple=cyc>=0.5;
    // Smooth 0..1 blend within each half
    const blend2=toPurple?((cyc-0.5)*2):(cyc*2);
    // Ease in/out
    const ease=blend2<0.5?2*blend2*blend2:1-Math.pow(-2*blend2+2,2)/2;
    // Gold=#ffaa00  Purple=#aa44ff
    const rr=Math.round(toPurple?255-ease*(255-170):170+ease*(255-170));
    const gg=Math.round(toPurple?170-ease*(170-68):68+ease*(170-68));
    const bb=Math.round(toPurple?0+ease*255:255-ease*255);
    const bCol=`rgb(${rr},${gg},${bb})`;
    // Pulse makes aura breathe
    const auraPulse=0.22+0.18*Math.sin(t*7);
    // ── Outer aura ring ──
    ctx.globalAlpha=auraPulse;ctx.strokeStyle=bCol;ctx.lineWidth=sz*0.07;
    ctx.shadowColor=bCol;ctx.shadowBlur=sz*0.5;
    ctx.beginPath();ctx.arc(cx,cy,sz*0.56,0,Math.PI*2);ctx.stroke();
    // Inner tight aura ring
    ctx.globalAlpha=auraPulse*1.5;ctx.lineWidth=sz*0.04;ctx.shadowBlur=sz*0.3;
    ctx.beginPath();ctx.arc(cx,cy,sz*0.38,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;
    // ── Bolt body ──
    ctx.fillStyle=bCol;ctx.strokeStyle=bCol;ctx.lineWidth=sz*0.04;
    ctx.shadowColor=bCol;ctx.shadowBlur=sz*0.33;
    ctx.beginPath();
    ctx.moveTo(cx+sz*0.07,cy-sz*0.44);ctx.lineTo(cx-sz*0.14,cy-sz*0.02);
    ctx.lineTo(cx+sz*0.06,cy-sz*0.02);ctx.lineTo(cx-sz*0.1,cy+sz*0.44);
    ctx.lineTo(cx+sz*0.2,cy+sz*0.08);ctx.lineTo(cx-sz*0.01,cy+sz*0.08);
    ctx.closePath();ctx.fill();
    // White hot core overlay
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.shadowBlur=0;
    ctx.beginPath();
    ctx.moveTo(cx+sz*0.05,cy-sz*0.36);ctx.lineTo(cx-sz*0.09,cy-sz*0.01);
    ctx.lineTo(cx+sz*0.04,cy-sz*0.01);ctx.lineTo(cx-sz*0.07,cy+sz*0.36);
    ctx.lineTo(cx+sz*0.15,cy+sz*0.05);ctx.lineTo(cx+sz*0.01,cy+sz*0.05);
    ctx.closePath();ctx.fill();
    // ── Color label flash at transition peak ──
    // Color label removed per v6.4
    ctx.globalAlpha=1;ctx.shadowBlur=0;break;}

  case'Fever Dreamer':{
    // Pachinko cabinet with animated ball — unchanged + ball bounce anim
    const lw2=sz*0.07;ctx.lineWidth=lw2;
    ctx.globalAlpha=0.3;ctx.fillRect(cx-sz*0.34,cy-sz*0.47,sz*0.68,sz*0.94);ctx.globalAlpha=1;ctx.strokeRect(cx-sz*0.34,cy-sz*0.47,sz*0.68,sz*0.94);
    ctx.globalAlpha=0.4;ctx.fillStyle=col;ctx.fillRect(cx-sz*0.26,cy-sz*0.37,sz*0.52,sz*0.54);ctx.globalAlpha=1;ctx.lineWidth=lw2*0.8;ctx.strokeRect(cx-sz*0.26,cy-sz*0.37,sz*0.52,sz*0.54);
    ctx.lineWidth=0;ctx.fillStyle=col;
    for(let pr=0;pr<3;pr++)for(let pc=0;pc<3;pc++){ctx.beginPath();ctx.arc(cx-sz*0.13+pc*sz*0.13,cy-sz*0.22+pr*sz*0.14,sz*0.045,0,Math.PI*2);ctx.fill();}
    const bpx=cx+Math.sin(t*5)*sz*0.13,bpy=cy-sz*0.08+Math.cos(t*6.5)*sz*0.1;
    ctx.fillStyle='#ffffff';ctx.shadowColor=col;ctx.shadowBlur=sz*0.22;ctx.beginPath();ctx.arc(bpx,bpy,sz*0.07,0,Math.PI*2);ctx.fill();ctx.shadowBlur=sz*0.17;
    ctx.fillStyle=col;ctx.font=`bold ${Math.floor(sz*0.15)}px "Courier New"`;ctx.textAlign='center';ctx.fillText('7 7 7',cx,cy+sz*0.44);break;}

  case'Star Rage':{
    // ── Dramatic black hole: deep void, hot accretion disk, lensing ring, infalling arcs ──
    // Background gravitational lensing — dim curved streaks bending toward center
    ctx.save();
    for(let i=0;i<12;i++){
      const baseAng=i/12*Math.PI*2+t*0.18;
      const bendR=sz*(0.52+0.14*Math.sin(t*0.9+i));
      const startX=cx+Math.cos(baseAng)*bendR, startY=cy+Math.sin(baseAng)*bendR*0.6;
      const cpX=cx+Math.cos(baseAng+0.38)*sz*0.28, cpY=cy+Math.sin(baseAng+0.38)*sz*0.28*0.6;
      ctx.globalAlpha=0.18+0.12*Math.sin(t*1.4+i);ctx.strokeStyle=col;ctx.lineWidth=sz*0.018;ctx.shadowBlur=0;
      ctx.beginPath();ctx.moveTo(startX,startY);ctx.quadraticCurveTo(cpX,cpY,cx,cy);ctx.stroke();
    }
    ctx.restore();
    // Event horizon — pure black void
    const vg=ctx.createRadialGradient(cx,cy,0,cx,cy,sz*0.22);
    vg.addColorStop(0,'#000');vg.addColorStop(0.8,'#050005');vg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=vg;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(cx,cy,sz*0.22,0,Math.PI*2);ctx.fill();
    // Accretion disk — glowing ellipse rotating around the void
    ctx.save();ctx.translate(cx,cy);ctx.rotate(t*0.8);
    const diskColors=['#ff6600','#ff3300','#ffaa00','#cc0044'];
    for(let layer=0;layer<4;layer++){
      const lw=sz*(0.07-layer*0.015);
      const rx=sz*(0.34+layer*0.04), ry=sz*(0.12+layer*0.02);
      const al=0.85-layer*0.15;
      const dc=ctx.createLinearGradient(-rx,0,rx,0);
      dc.addColorStop(0,diskColors[layer]);dc.addColorStop(0.5,'#ffffff');dc.addColorStop(1,diskColors[(layer+2)%4]);
      ctx.globalAlpha=al;ctx.strokeStyle=dc;ctx.lineWidth=lw;ctx.shadowColor=diskColors[layer];ctx.shadowBlur=sz*0.19;
      ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
    // Photon sphere — bright thin gravitational lensing ring
    ctx.globalAlpha=0.9+0.1*Math.sin(t*6);ctx.strokeStyle='#fff';ctx.lineWidth=sz*0.03;
    ctx.shadowColor='#fff';ctx.shadowBlur=sz*0.33;
    ctx.beginPath();ctx.arc(cx,cy,sz*0.24,0,Math.PI*2);ctx.stroke();
    // Inner void re-drawn on top to keep center black
    ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.shadowBlur=0;
    ctx.beginPath();ctx.arc(cx,cy,sz*0.2,0,Math.PI*2);ctx.fill();
    // Hawking jets — two polar beams shooting up/down
    for(let s=-1;s<=1;s+=2){
      ctx.globalAlpha=0.45+0.3*Math.sin(t*4+s);ctx.strokeStyle=col;ctx.lineWidth=sz*0.03;
      ctx.shadowColor=col;ctx.shadowBlur=sz*0.22;
      ctx.beginPath();ctx.moveTo(cx,cy+s*sz*0.22);ctx.lineTo(cx+(Math.sin(t*3)*sz*0.04),cy+s*sz*0.58);ctx.stroke();
    }
    ctx.shadowBlur=0;ctx.globalAlpha=1;break;}

  case'Straw Doll':{
    // Nobara's distinctive rubber mallet — wide flat head, short sturdy handle, nail through face, shine sweep
    ctx.shadowColor=col;ctx.shadowBlur=sz*0.25;
    // ── Handle — short, straight, vertical ──
    const hdlX=cx+sz*0.06,hdlTop=cy+sz*0.12,hdlBot=cy+sz*0.56;
    ctx.strokeStyle=col;ctx.lineWidth=sz*0.14;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(hdlX,hdlTop);ctx.lineTo(hdlX,hdlBot);ctx.stroke();
    // Handle grip tape bands
    ctx.strokeStyle='#000';ctx.lineWidth=sz*0.04;ctx.globalAlpha=0.5;
    for(let b=0;b<4;b++){const by=hdlTop+sz*0.04+(b/3.6)*sz*0.36;ctx.beginPath();ctx.moveTo(hdlX-sz*0.1,by);ctx.lineTo(hdlX+sz*0.1,by);ctx.stroke();}
    ctx.globalAlpha=1;
    // ── Hammer head — wide flat rubber mallet, wider than tall ──
    ctx.save();ctx.translate(cx,cy-sz*0.06);
    const hw=sz*0.54,hh=sz*0.28;
    ctx.fillStyle=col;ctx.shadowBlur=sz*0.28;
    ctx.fillRect(-hw*0.5,-hh*0.5,hw,hh);
    // Rubber face texture — subtle horizontal line across center
    ctx.globalAlpha=0.18;ctx.fillStyle='#fff';
    ctx.fillRect(-hw*0.5,-hh*0.08,hw,hh*0.16);
    ctx.globalAlpha=0.14;ctx.fillRect(-hw*0.5,-hh*0.5,hw,hh*0.18);
    ctx.globalAlpha=1;
    // Striking face edge highlight
    ctx.strokeStyle=col;ctx.lineWidth=sz*0.045;ctx.globalAlpha=0.55;ctx.shadowBlur=sz*0.22;
    ctx.beginPath();ctx.moveTo(hw*0.5,-hh*0.5);ctx.lineTo(hw*0.5,hh*0.5);ctx.stroke();
    ctx.globalAlpha=1;
    // ── Nail sticking out of striking face ──
    const nailX=hw*0.5+sz*0.01,nailLen=sz*0.28;
    ctx.strokeStyle='#cccccc';ctx.lineWidth=sz*0.055;ctx.shadowColor='#aaaaaa';ctx.shadowBlur=sz*0.11;
    ctx.beginPath();ctx.moveTo(nailX,0);ctx.lineTo(nailX+nailLen,0);ctx.stroke();
    // Nail head (flat disk)
    ctx.fillStyle='#aaaaaa';ctx.lineWidth=sz*0.02;
    ctx.beginPath();ctx.ellipse(nailX-sz*0.01,0,sz*0.04,sz*0.065,0,0,Math.PI*2);ctx.fill();
    // Nail point
    ctx.strokeStyle='#dddddd';ctx.lineWidth=sz*0.03;
    ctx.beginPath();ctx.moveTo(nailX+nailLen,0);ctx.lineTo(nailX+nailLen+sz*0.1,-sz*0.01);ctx.stroke();
    ctx.restore();
    // ── Shine sweep across head ──
    const scyc=(t*0.42)%1;
    if(scyc>0.78){
      const sp=(scyc-0.78)/0.22;
      const fa=sp<0.5?sp*2:(1-sp)*2;
      ctx.save();ctx.translate(cx,cy-sz*0.06);
      const sx=-sz*0.27+sp*sz*0.54;
      const sg=ctx.createLinearGradient(sx-sz*0.1,0,sx+sz*0.1,0);
      sg.addColorStop(0,'rgba(255,255,255,0)');
      sg.addColorStop(0.5,`rgba(255,255,255,${(fa*0.92).toFixed(2)})`);
      sg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=sg;ctx.fillRect(sx-sz*0.12,-sz*0.14,sz*0.24,sz*0.28);
      // Sparkle at peak
      if(fa>0.8){ctx.fillStyle=`rgba(255,255,255,${fa.toFixed(2)})`;ctx.shadowColor='#fff';ctx.shadowBlur=sz*0.28;const ss=sz*0.055;ctx.beginPath();ctx.moveTo(sx,0-ss*1.8);ctx.lineTo(sx+ss*0.4,0-ss*0.4);ctx.lineTo(sx+ss*1.8,0);ctx.lineTo(sx+ss*0.4,0+ss*0.4);ctx.lineTo(sx,0+ss*1.8);ctx.lineTo(sx-ss*0.4,0+ss*0.4);ctx.lineTo(sx-ss*1.8,0);ctx.lineTo(sx-ss*0.4,0-ss*0.4);ctx.closePath();ctx.fill();}
      ctx.restore();
    }
    // CE glow pulse
    const gp2=0.25+0.2*Math.sin(t*8);
    ctx.save();ctx.translate(cx,cy-sz*0.06);ctx.globalAlpha=gp2;ctx.strokeStyle=col;ctx.lineWidth=sz*0.035;ctx.shadowBlur=sz*0.25;
    ctx.strokeRect(-sz*0.28,-sz*0.15,sz*0.56,sz*0.3);ctx.restore();
    ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
  case'Cursed Vessel':{
    // Diamond outline with pulsing red Sukuna aura
    const bhPhase=(t*0.55)%1;
    const auraPulse=0.45+0.45*Math.sin(t*5.5);
    const auraPulse2=0.28+0.28*Math.sin(t*3.8+1.2);
    // ── Outermost diffuse aura glow (wide, low opacity) ──
    ctx.globalAlpha=auraPulse*0.35;
    ctx.shadowColor='#cc0022';ctx.shadowBlur=sz*0.75;
    ctx.strokeStyle='#880011';ctx.lineWidth=sz*0.045;
    ctx.beginPath();
    ctx.moveTo(cx,cy-sz*0.68);ctx.lineTo(cx+sz*0.50,cy);
    ctx.lineTo(cx,cy+sz*0.68);ctx.lineTo(cx-sz*0.50,cy);ctx.closePath();ctx.stroke();
    // ── Sukuna aura spikes — 4 cursed-energy beams pulsing outward ──
    ctx.globalAlpha=auraPulse2*0.55;ctx.lineWidth=sz*0.03;ctx.strokeStyle='#ff1133';
    ctx.shadowColor='#ff1133';ctx.shadowBlur=sz*0.4;
    for(let i=0;i<4;i++){
      const a=i/4*Math.PI*2+t*0.35;
      const r1=sz*0.52,r2=sz*(0.7+0.14*Math.sin(t*3.5+i*1.6));
      ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1*0.82);
      ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2*0.82);ctx.stroke();
    }
    // ── Mid aura ring — tighter red pulse ──
    ctx.globalAlpha=auraPulse*0.5;ctx.lineWidth=sz*0.035;ctx.strokeStyle='#dd0033';
    ctx.shadowBlur=sz*0.45;
    ctx.beginPath();
    ctx.moveTo(cx,cy-sz*0.56);ctx.lineTo(cx+sz*0.41,cy);
    ctx.lineTo(cx,cy+sz*0.56);ctx.lineTo(cx-sz*0.41,cy);ctx.closePath();ctx.stroke();
    // ── Main diamond outline (bright, solid) ──
    ctx.globalAlpha=1;ctx.shadowColor='#ff3355';ctx.shadowBlur=sz*0.28;
    ctx.strokeStyle=col;ctx.lineWidth=sz*0.1;ctx.lineCap='miter';ctx.lineJoin='miter';
    ctx.beginPath();
    ctx.moveTo(cx,cy-sz*0.5);ctx.lineTo(cx+sz*0.37,cy);
    ctx.lineTo(cx,cy+sz*0.5);ctx.lineTo(cx-sz*0.37,cy);ctx.closePath();ctx.stroke();
    // ── Inner diamond echo (dim, slightly rotated to give depth) ──
    ctx.globalAlpha=0.32+0.18*Math.sin(t*7);ctx.lineWidth=sz*0.04;
    ctx.strokeStyle='#ff5566';ctx.shadowBlur=sz*0.14;
    ctx.beginPath();
    ctx.moveTo(cx,cy-sz*0.28);ctx.lineTo(cx+sz*0.21,cy);
    ctx.lineTo(cx,cy+sz*0.28);ctx.lineTo(cx-sz*0.21,cy);ctx.closePath();ctx.stroke();
    // ── Sukuna cross-mark at center ──
    ctx.globalAlpha=0.7;ctx.lineWidth=sz*0.055;ctx.strokeStyle='#ff2244';
    ctx.shadowColor='#ff0022';ctx.shadowBlur=sz*0.22;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(cx-sz*0.14,cy);ctx.lineTo(cx+sz*0.14,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,cy-sz*0.14);ctx.lineTo(cx,cy+sz*0.14);ctx.stroke();
    // ── Crimson possession flare (periodic, at bhPhase peak) ──
    if(bhPhase>0.88){
      const flFade=(1-(bhPhase-0.88)/0.12);
      ctx.globalAlpha=flFade*0.6;ctx.strokeStyle='#cc1133';ctx.lineWidth=sz*0.08;
      ctx.shadowColor='#cc1133';ctx.shadowBlur=sz*0.6;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.62,0,Math.PI*2);ctx.stroke();
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;break;}

  case'Idle Transfiguration':{
    // Mahito — warped humanoid silhouette with soul distortion rings
    ctx.shadowColor=col;ctx.shadowBlur=sz*0.28;
    // Soul distortion rings
    for(let i=0;i<3;i++){
      ctx.globalAlpha=0.18+i*0.1+0.12*Math.sin(t*3+i);
      ctx.strokeStyle=col;ctx.lineWidth=sz*(0.04-i*0.01);
      ctx.beginPath();ctx.ellipse(cx,cy,sz*(0.24+i*0.14),sz*(0.4+i*0.1),Math.sin(t*0.6+i)*0.3,0,Math.PI*2);ctx.stroke();
    }
    ctx.globalAlpha=1;
    // Warped body — head
    ctx.fillStyle=col;ctx.shadowBlur=sz*0.2;
    ctx.beginPath();ctx.arc(cx,cy-sz*0.26,sz*0.14,0,Math.PI*2);ctx.fill();
    // Torso (distorted)
    ctx.save();ctx.translate(cx,cy);ctx.scale(1+Math.sin(t*2)*0.08,1+Math.cos(t*1.5)*0.06);
    ctx.fillRect(-sz*0.12,-sz*0.12,sz*0.24,sz*0.36);ctx.restore();
    // Warped arms
    ctx.lineWidth=sz*0.08;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(cx,cy-sz*0.06);
    ctx.quadraticCurveTo(cx-sz*0.38,cy+sz*0.08+Math.sin(t*4)*sz*0.1,cx-sz*0.28,cy+sz*0.28);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,cy-sz*0.06);
    ctx.quadraticCurveTo(cx+sz*0.38,cy+Math.cos(t*4)*sz*0.1,cx+sz*0.28,cy+sz*0.28);ctx.stroke();
    // Soul crack lines
    ctx.globalAlpha=0.45+0.35*Math.abs(Math.sin(t*4));
    ctx.lineWidth=sz*0.03;ctx.strokeStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=sz*0.14;
    for(let i=0;i<4;i++){const a=i*Math.PI*0.5+t*0.8;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*sz*0.55,cy+Math.sin(a)*sz*0.45);ctx.stroke();}
    ctx.globalAlpha=1;ctx.shadowBlur=0;break;}

  }// end switch(name) — always restore outer save to prevent shadow state bleed
  ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// SKILL ICONS — separate function, properly isolated from char icons
// Called: drawSkillIcon(charName, slot, cx, cy, sz, col, inThunderUlt)
// ─────────────────────────────────────────────────────────────
function drawSkillIcon(name,slot,cx,cy,sz,col,inThunderUlt){
  ctx.save();
  ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=sz*0.07;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.shadowColor=col;ctx.shadowBlur=sz*0.13;
  const t=Date.now()*0.001;
  switch(name){
  case'Projection Sorcery':
    switch(slot){
    case 0:{[0,1,2].forEach(i=>{ctx.globalAlpha=0.3+i*0.35;ctx.lineWidth=sz*(0.07+i*0.025);const ox=cx-sz*0.28+i*sz*0.26;ctx.beginPath();ctx.moveTo(ox,cy-sz*0.34);ctx.lineTo(ox+sz*0.22,cy);ctx.lineTo(ox,cy+sz*0.34);ctx.stroke();});ctx.globalAlpha=1;break;}
    case 1:{for(let i=0;i<4;i++){const ang=(i-1.5)*0.26,ex=cx+Math.cos(ang)*sz*0.44,ey=cy+Math.sin(ang)*sz*0.44;ctx.globalAlpha=0.45+i*0.14;ctx.lineWidth=sz*0.08;ctx.beginPath();ctx.moveTo(cx-sz*0.18,cy);ctx.lineTo(ex,ey);ctx.stroke();ctx.beginPath();ctx.arc(ex,ey,sz*0.07,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;break;}
    case 2:{ctx.lineWidth=sz*0.07;ctx.beginPath();ctx.arc(cx,cy,sz*0.4,0,Math.PI*2);ctx.stroke();ctx.lineWidth=sz*0.11;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,cy-sz*0.24);ctx.stroke();ctx.lineWidth=sz*0.07;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+sz*0.16,cy+sz*0.18);ctx.stroke();ctx.globalAlpha=0.5;ctx.lineWidth=sz*0.04;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.14,cy+Math.sin(a)*sz*0.14);ctx.lineTo(cx+Math.cos(a)*sz*0.38,cy+Math.sin(a)*sz*0.38);ctx.stroke();}ctx.globalAlpha=1;ctx.lineWidth=sz*0.07;ctx.beginPath();ctx.arc(cx,cy,sz*0.06,0,Math.PI*2);ctx.fill();break;}
    case 3:{ctx.lineWidth=sz*0.07;ctx.beginPath();ctx.arc(cx,cy,sz*0.4,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#000820';ctx.beginPath();ctx.arc(cx+sz*0.14,cy-sz*0.06,sz*0.28,0,Math.PI*2);ctx.fill();ctx.fillStyle=col;ctx.globalAlpha=0.8;[[cx-sz*0.14,cy+sz*0.08,sz*0.04],[cx-sz*0.25,cy-sz*0.18,sz*0.03],[cx-sz*0.05,cy-sz*0.26,sz*0.025]].forEach(([sx,sy,sr])=>{ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;break;}
    }break;
  case'Heavenly Restriction':
    switch(slot){
    case 0:{ctx.fillRect(cx-sz*0.22,cy-sz*0.17,sz*0.44,sz*0.34);ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=sz*0.035;for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(cx-sz*0.22+i*sz*0.148,cy-sz*0.17);ctx.lineTo(cx-sz*0.22+i*sz*0.148,cy+sz*0.04);ctx.stroke();}ctx.strokeStyle=col;ctx.lineWidth=sz*0.07;for(let i=-2;i<=2;i++){const a=i*0.2,r=sz*0.22;ctx.globalAlpha=0.5+Math.abs(i)*0.14;ctx.beginPath();ctx.moveTo(cx+r,cy+Math.sin(a)*r*0.3);ctx.lineTo(cx+r+Math.cos(a)*sz*0.26,cy+Math.sin(a)*sz*0.26);ctx.stroke();}ctx.globalAlpha=1;break;}
    case 1:{ctx.lineWidth=sz*0.09;ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*Math.PI*2-Math.PI/6,r=sz*0.42;i===0?ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}ctx.closePath();ctx.globalAlpha=0.18;ctx.fill();ctx.globalAlpha=1;ctx.stroke();ctx.lineWidth=sz*0.07;ctx.beginPath();ctx.moveTo(cx,cy-sz*0.22);ctx.lineTo(cx,cy+sz*0.22);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-sz*0.2,cy);ctx.lineTo(cx+sz*0.2,cy);ctx.stroke();break;}
    case 2:{ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.moveTo(cx,cy-sz*0.42);ctx.lineTo(cx,cy+sz*0.06);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-sz*0.2,cy-sz*0.06);ctx.lineTo(cx,cy+sz*0.22);ctx.lineTo(cx+sz*0.2,cy-sz*0.06);ctx.fill();ctx.lineWidth=sz*0.06;[1,1.55,2.1].forEach((m,i)=>{ctx.globalAlpha=0.85-i*0.25;ctx.beginPath();ctx.ellipse(cx,cy+sz*0.32,sz*0.16*m,sz*0.08,0,0,Math.PI*2);ctx.stroke();});ctx.globalAlpha=1;break;}
    case 3:{ctx.lineWidth=sz*0.06;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.22,cy+Math.sin(a)*sz*0.22);ctx.lineTo(cx+Math.cos(a+Math.PI/8)*sz*0.36,cy+Math.sin(a+Math.PI/8)*sz*0.36);ctx.lineTo(cx+Math.cos(a+Math.PI/4)*sz*0.22,cy+Math.sin(a+Math.PI/4)*sz*0.22);ctx.stroke();}ctx.globalAlpha=0.15;ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.arc(cx,cy,sz*0.44,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=col;ctx.fillRect(cx-sz*0.15,cy-sz*0.12,sz*0.3,sz*0.24);break;}
    }break;
  case'Shrine':
    switch(slot){
    case 0:{ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.arc(cx,cy,sz*0.37,Math.PI*1.1,Math.PI*0.1);ctx.stroke();ctx.lineWidth=sz*0.055;ctx.globalAlpha=0.45;[sz*0.25,sz*0.31].forEach(r=>{ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*1.12,Math.PI*0.08);ctx.stroke();});ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(cx+sz*0.31,cy-sz*0.21);ctx.lineTo(cx+sz*0.44,cy-sz*0.04);ctx.lineTo(cx+sz*0.22,cy-sz*0.04);ctx.closePath();ctx.fill();break;}
    case 1:{ctx.lineWidth=sz*0.11;ctx.beginPath();ctx.moveTo(cx-sz*0.4,cy-sz*0.4);ctx.lineTo(cx+sz*0.4,cy+sz*0.4);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+sz*0.4,cy-sz*0.4);ctx.lineTo(cx-sz*0.4,cy+sz*0.4);ctx.stroke();ctx.globalAlpha=0.3;ctx.lineWidth=sz*0.05;ctx.beginPath();ctx.moveTo(cx-sz*0.3,cy-sz*0.4);ctx.lineTo(cx+sz*0.4,cy+sz*0.3);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+sz*0.3,cy-sz*0.4);ctx.lineTo(cx-sz*0.4,cy+sz*0.3);ctx.stroke();ctx.globalAlpha=1;break;}
    case 2:{ctx.lineWidth=sz*0.08;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.1,cy+Math.sin(a)*sz*0.1);ctx.lineTo(cx+Math.cos(a+0.78)*sz*0.44,cy+Math.sin(a+0.78)*sz*0.44);ctx.stroke();}ctx.globalAlpha=0.38;ctx.lineWidth=sz*0.05;for(let i=0;i<6;i++){const a=i/6*Math.PI*2+0.4;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.06,cy+Math.sin(a)*sz*0.06);ctx.lineTo(cx+Math.cos(a+0.55)*sz*0.3,cy+Math.sin(a+0.55)*sz*0.3);ctx.stroke();}ctx.globalAlpha=1;ctx.lineWidth=sz*0.08;ctx.beginPath();ctx.arc(cx,cy,sz*0.09,0,Math.PI*2);ctx.fill();break;}
    case 3:{ctx.fillRect(cx-sz*0.3,cy-sz*0.24,sz*0.11,sz*0.54);ctx.fillRect(cx+sz*0.19,cy-sz*0.24,sz*0.11,sz*0.54);ctx.fillRect(cx-sz*0.38,cy-sz*0.28,sz*0.76,sz*0.1);ctx.fillRect(cx-sz*0.43,cy-sz*0.42,sz*0.86,sz*0.09);break;}
    }break;
  case'Limitless':
    switch(slot){
    case 0:{ctx.lineWidth=sz*0.08;ctx.fillStyle='#ff3300';ctx.shadowColor='#ff3300';ctx.shadowBlur=sz*0.19;ctx.beginPath();ctx.arc(cx,cy,sz*0.26,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=col;for(let i=0;i<4;i++){const a=i/4*Math.PI*2,r=sz*0.26;ctx.lineWidth=sz*0.075;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.lineTo(cx+Math.cos(a)*(r+sz*0.2),cy+Math.sin(a)*(r+sz*0.2));ctx.stroke();ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r+sz*0.2),cy+Math.sin(a)*(r+sz*0.2));ctx.lineTo(cx+Math.cos(a-0.45)*(r+sz*0.1),cy+Math.sin(a-0.45)*(r+sz*0.1));ctx.lineTo(cx+Math.cos(a+0.45)*(r+sz*0.1),cy+Math.sin(a+0.45)*(r+sz*0.1));ctx.closePath();ctx.fill();}break;}
    case 1:{ctx.lineWidth=sz*0.07;for(let i=0;i<4;i++){ctx.globalAlpha=0.35+i*0.18;ctx.beginPath();let moved=false;for(let t2=0;t2<Math.PI*(1.4+i*0.35);t2+=0.1){const r=sz*(0.44-t2*0.06);if(r<sz*0.04)break;const px=cx+Math.cos(t2+i*0.78)*r,py=cy+Math.sin(t2+i*0.78)*r;moved?(ctx.lineTo(px,py)):(ctx.moveTo(px,py),moved=true);}ctx.stroke();}ctx.globalAlpha=1;ctx.fillStyle='#0055ff';ctx.shadowColor='#0055ff';ctx.shadowBlur=sz*0.17;ctx.beginPath();ctx.arc(cx,cy,sz*0.1,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;break;}
    case 2:{ctx.fillStyle='#ff0000';ctx.shadowColor='#ff0000';ctx.shadowBlur=sz*0.11;ctx.beginPath();ctx.arc(cx,cy,sz*0.32,Math.PI/2,Math.PI*1.5);ctx.fill();ctx.fillStyle='#0044ff';ctx.shadowColor='#0044ff';ctx.beginPath();ctx.arc(cx,cy,sz*0.32,Math.PI*1.5,Math.PI/2);ctx.fill();ctx.fillStyle='#cc44ff';ctx.shadowColor='#cc44ff';ctx.shadowBlur=sz*0.28;ctx.beginPath();ctx.arc(cx,cy,sz*0.13,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;break;}
    case 3:{for(let i=1;i<=5;i++){ctx.globalAlpha=0.15+i*0.14;ctx.lineWidth=sz*(0.04+i*0.01);ctx.beginPath();ctx.arc(cx,cy,sz*i*0.09,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;ctx.lineWidth=sz*0.035;ctx.globalAlpha=0.38;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.46,cy+Math.sin(a)*sz*0.46);ctx.lineTo(cx+Math.cos(a)*sz*0.62,cy+Math.sin(a)*sz*0.62);ctx.stroke();}ctx.globalAlpha=1;ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.arc(cx,cy,sz*0.07,0,Math.PI*2);ctx.fill();break;}
    }break;
  case'Thunder God':
    switch(slot){
    case 0:{ctx.lineWidth=sz*0.09;ctx.beginPath();ctx.moveTo(cx-sz*0.44,cy-sz*0.1);ctx.lineTo(cx-sz*0.1,cy-sz*0.1);ctx.lineTo(cx-sz*0.2,cy+sz*0.08);ctx.lineTo(cx+sz*0.18,cy+sz*0.08);ctx.lineTo(cx+sz*0.08,cy+sz*0.22);ctx.lineTo(cx+sz*0.44,cy+sz*0.22);ctx.stroke();ctx.globalAlpha=0.45;ctx.lineWidth=sz*0.05;ctx.beginPath();ctx.arc(cx+sz*0.44,cy+sz*0.22,sz*0.11,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;break;}
    case 1:{ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.moveTo(cx-sz*0.44,cy);ctx.lineTo(cx+sz*0.18,cy);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+sz*0.08,cy-sz*0.22);ctx.lineTo(cx+sz*0.44,cy);ctx.lineTo(cx+sz*0.08,cy+sz*0.22);ctx.closePath();ctx.fill();ctx.lineWidth=sz*0.05;ctx.globalAlpha=0.6;[[-sz*0.22,-sz*0.28],[-sz*0.04,-sz*0.32],[sz*0.16,-sz*0.28],[sz*0.3,-sz*0.3]].forEach(([ox,oy])=>{ctx.beginPath();ctx.moveTo(cx+ox,cy+oy);ctx.lineTo(cx+ox+sz*0.06,cy+sz*0.03);ctx.stroke();});ctx.globalAlpha=1;break;}
    case 2:{ctx.lineWidth=sz*0.09;ctx.strokeRect(cx-sz*0.36,cy-sz*0.32,sz*0.72,sz*0.64);ctx.lineWidth=sz*0.055;ctx.globalAlpha=0.65;for(let i=0;i<4;i++){const x2=cx-sz*0.28+i*sz*0.19;ctx.beginPath();ctx.moveTo(x2,cy-sz*0.32);ctx.lineTo(x2+sz*0.06,cy-sz*0.46);ctx.lineTo(x2+sz*0.12,cy-sz*0.32);ctx.stroke();}ctx.globalAlpha=0.28;ctx.beginPath();ctx.moveTo(cx-sz*0.3,cy-sz*0.26);ctx.lineTo(cx+sz*0.3,cy+sz*0.26);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+sz*0.3,cy-sz*0.26);ctx.lineTo(cx-sz*0.3,cy+sz*0.26);ctx.stroke();ctx.globalAlpha=1;break;}
    case 3:{ctx.lineWidth=sz*0.06;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.2,cy+Math.sin(a)*sz*0.2);ctx.lineTo(cx+Math.cos(a)*sz*0.48,cy+Math.sin(a)*sz*0.48);ctx.stroke();}ctx.globalAlpha=0.4;for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/6;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.14,cy+Math.sin(a)*sz*0.14);ctx.lineTo(cx+Math.cos(a)*sz*0.36,cy+Math.sin(a)*sz*0.36);ctx.stroke();}ctx.globalAlpha=1;ctx.fillStyle='#ffaa00';ctx.shadowColor='#aa44ff';ctx.shadowBlur=sz*0.28;ctx.beginPath();ctx.moveTo(cx+sz*0.05,cy-sz*0.28);ctx.lineTo(cx-sz*0.1,cy);ctx.lineTo(cx+sz*0.04,cy);ctx.lineTo(cx-sz*0.07,cy+sz*0.28);ctx.lineTo(cx+sz*0.14,cy+sz*0.06);ctx.lineTo(cx+sz*0.01,cy+sz*0.06);ctx.closePath();ctx.fill();ctx.shadowBlur=0;break;}
    }break;
  case'Fever Dreamer':
    switch(slot){
    case 0:{ctx.fillRect(cx-sz*0.22,cy-sz*0.16,sz*0.44,sz*0.32);ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=sz*0.03;for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(cx-sz*0.22+i*sz*0.148,cy-sz*0.16);ctx.lineTo(cx-sz*0.22+i*sz*0.148,cy+sz*0.04);ctx.stroke();}ctx.strokeStyle=col;ctx.lineWidth=sz*0.08;for(let i=-2;i<=2;i++){const a=i*0.22,r=sz*0.22;ctx.globalAlpha=0.55+Math.abs(i)*0.1;ctx.beginPath();ctx.moveTo(cx+r,cy+Math.sin(a)*r*0.3);ctx.lineTo(cx+r+Math.cos(a)*sz*0.28,cy+Math.sin(a)*sz*0.28);ctx.stroke();}ctx.globalAlpha=1;ctx.lineWidth=sz*0.06;ctx.globalAlpha=0.5;ctx.beginPath();ctx.moveTo(cx+sz*0.22,cy+sz*0.16);ctx.lineTo(cx+sz*0.44,cy+sz*0.38);ctx.stroke();ctx.globalAlpha=1;break;}
    case 1:{const ig=ctx.createRadialGradient(cx-sz*0.1,cy-sz*0.1,0,cx,cy,sz*0.38);ig.addColorStop(0,'#aaaaaa');ig.addColorStop(0.5,'#555555');ig.addColorStop(1,'#1a1a1a');ctx.fillStyle=ig;ctx.shadowBlur=sz*0.17;ctx.beginPath();ctx.arc(cx,cy,sz*0.38,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=sz*0.07;ctx.shadowColor=col;ctx.shadowBlur=sz*0.19;ctx.beginPath();ctx.arc(cx,cy,sz*0.46,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(255,255,255,0.35)';ctx.shadowBlur=0;ctx.beginPath();ctx.ellipse(cx-sz*0.14,cy-sz*0.14,sz*0.1,sz*0.07,Math.PI*-0.3,0,Math.PI*2);ctx.fill();break;}
    case 2:{ctx.lineWidth=sz*0.08;ctx.strokeRect(cx-sz*0.28,cy-sz*0.44,sz*0.56,sz*0.88);ctx.globalAlpha=0.2;ctx.fillRect(cx-sz*0.28,cy-sz*0.44,sz*0.56,sz*0.88);ctx.globalAlpha=1;ctx.lineWidth=sz*0.05;ctx.globalAlpha=0.5;ctx.beginPath();ctx.moveTo(cx-sz*0.28,cy);ctx.lineTo(cx+sz*0.28,cy);ctx.stroke();ctx.globalAlpha=1;ctx.lineWidth=sz*0.07;ctx.beginPath();ctx.arc(cx-sz*0.22,cy-sz*0.28,sz*0.06,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(cx-sz*0.22,cy+sz*0.12,sz*0.06,0,Math.PI*2);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(cx+sz*0.18,cy-sz*0.06,sz*0.07,0,Math.PI*2);ctx.fill();ctx.lineWidth=sz*0.04;ctx.globalAlpha=0.45;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(cx+sz*0.28,cy-sz*0.2+i*sz*0.2);ctx.lineTo(cx+sz*0.42,cy-sz*0.2+i*sz*0.2+Math.sin(i)*sz*0.06);ctx.stroke();}ctx.globalAlpha=1;break;}
    case 3:{ctx.lineWidth=sz*0.07;ctx.strokeRect(cx-sz*0.38,cy-sz*0.38,sz*0.76,sz*0.76);ctx.globalAlpha=0.15;ctx.fillRect(cx-sz*0.38,cy-sz*0.38,sz*0.76,sz*0.76);ctx.globalAlpha=1;for(let d=0;d<3;d++){const rx=cx-sz*0.28+d*sz*0.28,ry=cy-sz*0.2,rw=sz*0.24,rh=sz*0.36;ctx.lineWidth=sz*0.05;ctx.strokeRect(rx,ry,rw,rh);ctx.globalAlpha=0.2;ctx.fillRect(rx,ry,rw,rh);ctx.globalAlpha=1;ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=sz*0.17;ctx.font=`bold ${Math.floor(sz*0.26)}px "Courier New"`;ctx.textAlign='center';ctx.fillText('7',rx+rw/2,ry+rh*0.78);}ctx.shadowBlur=0;ctx.fillStyle=col;ctx.font=`bold ${Math.floor(sz*0.14)}px "Courier New"`;ctx.textAlign='center';ctx.fillText('\u2605 7 7 7 \u2605',cx,cy-sz*0.44);break;}
    }break;
  case'Star Rage':
    switch(slot){
    case 0:{[sz*0.12,sz*0.26,sz*0.42].forEach((r,i)=>{ctx.globalAlpha=1-i*0.25;ctx.lineWidth=sz*(0.09-i*0.02);ctx.beginPath();ctx.arc(cx,cy,r+Math.sin(t*5+i)*sz*0.03,0,Math.PI*2);ctx.stroke();});ctx.globalAlpha=1;ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.arc(cx,cy,sz*0.09,0,Math.PI*2);ctx.fill();for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t;ctx.globalAlpha=0.5;ctx.lineWidth=sz*0.05;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.42,cy+Math.sin(a)*sz*0.42);ctx.lineTo(cx+Math.cos(a)*sz*0.58,cy+Math.sin(a)*sz*0.58);ctx.stroke();}ctx.globalAlpha=1;break;}
    case 1:{ctx.lineWidth=sz*0.08;ctx.beginPath();ctx.moveTo(cx-sz*0.28,cy);ctx.lineTo(cx-sz*0.08,cy-sz*0.22);ctx.lineTo(cx+sz*0.36,cy);ctx.lineTo(cx-sz*0.08,cy+sz*0.22);ctx.closePath();ctx.fill();[0.28,0.42,0.56].forEach((d,i)=>{ctx.globalAlpha=0.6-i*0.15;ctx.beginPath();ctx.arc(cx-sz*d,cy,sz*(0.07-i*0.015),0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;break;}
    case 2:{for(let i=0;i<3;i++){const a=i/3*Math.PI*2+t;ctx.globalAlpha=0.5+i*0.15;ctx.lineWidth=sz*0.08;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.38,cy+Math.sin(a)*sz*0.38);ctx.lineTo(cx+Math.cos(a+0.6)*sz*0.2,cy+Math.sin(a+0.6)*sz*0.2);ctx.stroke();}ctx.globalAlpha=1;ctx.beginPath();ctx.arc(cx,cy,sz*0.1,0,Math.PI*2);ctx.fill();break;}
    case 3:{const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,sz*0.45);bg.addColorStop(0,'#000000');bg.addColorStop(0.6,'#200015');bg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=bg;ctx.beginPath();ctx.arc(cx,cy,sz*0.48,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=sz*0.06;ctx.shadowColor=col;ctx.shadowBlur=sz*0.28;ctx.beginPath();ctx.arc(cx,cy,sz*0.28,0,Math.PI*2);ctx.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2+t*2;const r=sz*0.38+Math.sin(t*8+i)*sz*0.06;ctx.globalAlpha=0.6;ctx.lineWidth=sz*0.03;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.28,cy+Math.sin(a)*sz*0.28);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.stroke();}ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    }break;
  case'Cursed Vessel':
    switch(slot){
    case 0:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.22;ctx.fillStyle=col;
      ctx.fillRect(cx-sz*0.2,cy-sz*0.16,sz*0.4,sz*0.32);
      ctx.globalAlpha=0.8;ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=sz*0.28;
      ctx.beginPath();ctx.moveTo(cx+sz*0.06,cy-sz*0.4);ctx.lineTo(cx-sz*0.08,cy-sz*0.02);
      ctx.lineTo(cx+sz*0.02,cy-sz*0.02);ctx.lineTo(cx-sz*0.1,cy+sz*0.38);
      ctx.lineTo(cx+sz*0.12,cy+sz*0.04);ctx.lineTo(cx+sz*0.02,cy+sz*0.04);ctx.closePath();ctx.fill();
      ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    case 1:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.22;ctx.strokeStyle=col;ctx.lineWidth=sz*0.1;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(cx-sz*0.3,cy+sz*0.3);ctx.lineTo(cx+sz*0.3,cy-sz*0.3);ctx.stroke();
      ctx.lineWidth=sz*0.04;ctx.globalAlpha=0.6;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.35,0,Math.PI*1.5);ctx.stroke();
      ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    case 2:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.19;ctx.fillStyle=col;
      for(let i=0;i<5;i++){const a=-0.6+i*0.3,r=sz*0.3;
        ctx.globalAlpha=0.4+i*0.12;
        ctx.beginPath();ctx.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,sz*(0.06+i*0.015),0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    case 3:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.33;
      ctx.lineWidth=sz*0.06;ctx.strokeStyle=col;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.38,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=0.55;ctx.strokeStyle='#000';ctx.lineWidth=sz*0.04;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.22,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=0.8+0.2*Math.sin(t*8);ctx.fillStyle=col;ctx.shadowBlur=sz*0.39;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.1,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    }break;
  case'Straw Doll':
    switch(slot){
    case 0:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.17;ctx.lineWidth=sz*0.12;ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(cx-sz*0.22,cy+sz*0.46);ctx.lineTo(cx+sz*0.16,cy-sz*0.1);ctx.stroke();ctx.save();ctx.translate(cx+sz*0.16,cy-sz*0.1);ctx.rotate(-0.65);ctx.fillStyle=col;ctx.fillRect(-sz*0.24,-sz*0.1,sz*0.38,sz*0.2);ctx.restore();ctx.lineWidth=sz*0.04;ctx.globalAlpha=0.7;for(let i=0;i<5;i++){const a=i/5*Math.PI+0.5;ctx.beginPath();ctx.moveTo(cx+sz*0.12,cy-sz*0.2);ctx.lineTo(cx+sz*0.12+Math.cos(a)*sz*0.22,cy-sz*0.2+Math.sin(a)*sz*0.22);ctx.stroke();}ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    case 1:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.15;[[-0.22,-0.1],[0,0],[0.22,0.1]].forEach(([dy,rot])=>{ctx.save();ctx.translate(cx+sz*0.1,cy+dy*sz);ctx.rotate(rot);ctx.fillStyle=col;ctx.strokeStyle='#fff';ctx.lineWidth=sz*0.025;ctx.fillRect(-sz*0.22,-sz*0.04,sz*0.32,sz*0.08);ctx.beginPath();ctx.moveTo(sz*0.1,-sz*0.05);ctx.lineTo(sz*0.18,0);ctx.lineTo(sz*0.1,sz*0.05);ctx.closePath();ctx.fill();ctx.fillStyle='#884400';ctx.fillRect(-sz*0.22,-sz*0.05,sz*0.07,sz*0.1);ctx.restore();});ctx.shadowBlur=0;break;}
    case 2:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.2;ctx.lineWidth=sz*0.06;ctx.strokeStyle=col;ctx.globalAlpha=0.2;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(cx+sz*0.14,cy,sz*0.12,sz*0.23,0.1,0,Math.PI*2);ctx.fill();ctx.globalAlpha=0.9;ctx.beginPath();ctx.ellipse(cx+sz*0.14,cy,sz*0.12,sz*0.23,0.1,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(cx+sz*0.14,cy-sz*0.26,sz*0.08,0,Math.PI*2);ctx.stroke();ctx.lineWidth=sz*0.03;ctx.globalAlpha=0.7;ctx.setLineDash([sz*0.04,sz*0.04]);for(let i=0;i<3;i++){const oy=(i-1)*sz*0.16;ctx.beginPath();ctx.moveTo(cx-sz*0.28,cy+oy);ctx.lineTo(cx+sz*0.02,cy+oy*0.5);ctx.stroke();}ctx.setLineDash([]);ctx.globalAlpha=1;ctx.lineWidth=sz*0.05;ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(cx-sz*0.28,cy);ctx.lineTo(cx+sz*0.04,cy);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(cx-sz*0.28,cy,sz*0.05,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;break;}
    case 3:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.18;ctx.lineWidth=sz*0.055;ctx.strokeStyle=col;ctx.globalAlpha=0.7;ctx.beginPath();ctx.moveTo(cx-sz*0.32,cy+sz*0.1);ctx.lineTo(cx+sz*0.2,cy+sz*0.1);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+sz*0.08,cy-sz*0.06);ctx.lineTo(cx+sz*0.24,cy+sz*0.1);ctx.lineTo(cx+sz*0.08,cy+sz*0.26);ctx.stroke();ctx.globalAlpha=0.5+0.45*Math.sin(t*8);ctx.fillStyle=col;ctx.shadowBlur=sz*0.28;ctx.beginPath();ctx.moveTo(cx+sz*0.04,cy-sz*0.38);ctx.lineTo(cx-sz*0.08,cy-sz*0.04);ctx.lineTo(cx+sz*0.02,cy-sz*0.04);ctx.lineTo(cx-sz*0.1,cy+sz*0.36);ctx.lineTo(cx+sz*0.14,cy+sz*0.02);ctx.lineTo(cx+sz*0.02,cy+sz*0.02);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    }break;
  case'Idle Transfiguration':
    switch(slot){
    case 0:{// Soul Punch — fist with soul cracks
      ctx.shadowColor=col;ctx.shadowBlur=sz*0.22;ctx.fillStyle=col;
      ctx.fillRect(cx-sz*0.2,cy-sz*0.14,sz*0.4,sz*0.28);
      // Soul crack lines radiating from fist
      ctx.strokeStyle=col;ctx.lineWidth=sz*0.04;ctx.globalAlpha=0.7;
      for(let i=0;i<5;i++){const a=-0.6+i*0.3,r1=sz*0.22,r2=sz*(0.38+Math.random()*0.1);
        ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);ctx.stroke();}
      ctx.globalAlpha=0.9;ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=sz*0.15;
      ctx.beginPath();ctx.arc(cx+sz*0.22,cy,sz*0.07,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    case 1:{// Soul Isomer — small warped humanoid
      ctx.shadowColor=col;ctx.shadowBlur=sz*0.2;ctx.strokeStyle=col;ctx.lineWidth=sz*0.08;ctx.lineCap='round';
      ctx.beginPath();ctx.arc(cx,cy-sz*0.28,sz*0.1,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy-sz*0.18);ctx.lineTo(cx,cy+sz*0.1);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy-sz*0.1);ctx.lineTo(cx-sz*0.18,cy+sz*0.08);
      ctx.moveTo(cx,cy-sz*0.1);ctx.lineTo(cx+sz*0.18,cy+sz*0.04);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy+sz*0.1);ctx.lineTo(cx-sz*0.12,cy+sz*0.32);
      ctx.moveTo(cx,cy+sz*0.1);ctx.lineTo(cx+sz*0.12,cy+sz*0.28);ctx.stroke();
      ctx.globalAlpha=0.45;ctx.lineWidth=sz*0.035;
      for(let i=0;i<3;i++){const a=i/3*Math.PI*2;ctx.beginPath();ctx.arc(cx,cy,sz*(0.22+i*0.1),a,a+Math.PI*0.6);ctx.stroke();}
      ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    case 2:{// Body Geometry — distortion wave
      ctx.shadowColor=col;ctx.shadowBlur=sz*0.22;ctx.lineWidth=sz*0.07;ctx.strokeStyle=col;
      for(let i=0;i<4;i++){ctx.globalAlpha=1-i*0.2;ctx.beginPath();ctx.arc(cx,cy,sz*(0.1+i*0.1),0,Math.PI*2);ctx.stroke();}
      ctx.globalAlpha=1;ctx.lineWidth=sz*0.05;
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.globalAlpha=0.5;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.4,cy+Math.sin(a)*sz*0.4);ctx.lineTo(cx+Math.cos(a)*sz*0.56,cy+Math.sin(a)*sz*0.56);ctx.stroke();}
      ctx.globalAlpha=1;ctx.fillStyle=col;ctx.shadowBlur=sz*0.28;ctx.beginPath();ctx.arc(cx,cy,sz*0.06,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;break;}
    case 3:{// Domain — void with soul silhouettes
      ctx.shadowColor=col;ctx.shadowBlur=sz*0.28;
      const dg=ctx.createRadialGradient(cx,cy,0,cx,cy,sz*0.45);
      dg.addColorStop(0,'#220033');dg.addColorStop(0.5,'#110022');dg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=dg;ctx.beginPath();ctx.arc(cx,cy,sz*0.48,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=col;ctx.lineWidth=sz*0.06;ctx.globalAlpha=0.9;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.32,0,Math.PI*2);ctx.stroke();
      // Mini soul figures
      ctx.globalAlpha=0.55;ctx.lineWidth=sz*0.045;ctx.lineCap='round';
      [-sz*0.2,sz*0.2].forEach(ox=>{
        ctx.beginPath();ctx.arc(cx+ox,cy-sz*0.22,sz*0.07,0,Math.PI*2);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+ox,cy-sz*0.15);ctx.lineTo(cx+ox,cy+sz*0.04);ctx.stroke();
      });
      ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    }break;
  }// end switch(name)
  ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.restore();
}