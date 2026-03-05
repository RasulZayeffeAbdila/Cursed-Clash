// ── CURSED CLASH · cc_icons.js ── drawCharIcon, drawSkillIcon  v6.1
// CHARACTER ICONS: add case to drawCharIcon switch (before closing })
// SKILL ICONS:     add case to drawSkillIcon switch (before closing })

// ════ CHARACTER ICONS (all animated) ════
function drawCharIcon(name,cx,cy,sz,col){
  ctx.save();
  ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=sz*0.07;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.shadowColor=col;ctx.shadowBlur=sz*0.3;
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
    ctx.lineWidth=sz*0.075;ctx.shadowBlur=sz*0.4;
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
    ctx.strokeStyle='#ffffff';ctx.lineWidth=sz*0.07;ctx.shadowColor='#ffffff';ctx.shadowBlur=sz*0.5;
    ctx.beginPath();ctx.moveTo(cx-sz*0.1,cy-sz*0.04);ctx.lineTo(cx+sz*0.1,cy+sz*0.04);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx-sz*0.1,cy+sz*0.04);ctx.lineTo(cx+sz*0.1,cy-sz*0.04);ctx.stroke();
    ctx.globalAlpha=1;ctx.shadowColor=col;ctx.shadowBlur=0;break;}

  case'Shrine':{
    // Malevolent Shrine: imposing torii gate with cursed eye + CE drips + pulse aura
    ctx.shadowColor=col;ctx.shadowBlur=sz*0.45;
    // Outer cursed aura ring — animated slow pulse
    ctx.globalAlpha=0.1+0.07*Math.sin(t*2);ctx.strokeStyle=col;ctx.lineWidth=sz*0.03;ctx.setLineDash([sz*0.05,sz*0.05]);
    ctx.beginPath();ctx.arc(cx,cy,sz*0.56,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=1;
    // Left pillar
    ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=sz*0.04;
    ctx.fillRect(cx-sz*0.38,cy-sz*0.26,sz*0.14,sz*0.72);
    // Right pillar
    ctx.fillRect(cx+sz*0.24,cy-sz*0.26,sz*0.14,sz*0.72);
    // Main crossbeam
    ctx.fillRect(cx-sz*0.46,cy-sz*0.3,sz*0.92,sz*0.12);
    // Upper beam (wider)
    ctx.fillRect(cx-sz*0.5,cy-sz*0.46,sz*1.0,sz*0.11);
    // Upturned beam end caps
    ctx.globalAlpha=0.7;
    [{x:cx-sz*0.5,flip:false},{x:cx+sz*0.5,flip:true}].forEach(({x,flip})=>{
      ctx.save();ctx.translate(x,cy-sz*0.4);
      ctx.beginPath();ctx.arc(0,0,sz*0.055,flip?Math.PI*1.5:Math.PI*0.5,flip?Math.PI*0.5:Math.PI*1.5,flip);ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha=1;
    // Cursed eye in gate opening — animated blink
    const blink=Math.sin(t*0.7);const eyeScaleY=blink>0.94?0.04:1.0;
    const eyeH=sz*0.1*eyeScaleY;
    if(eyeH>sz*0.003){
      const gx=ctx.createRadialGradient(cx,cy+sz*0.05,0,cx,cy+sz*0.05,sz*0.13);
      gx.addColorStop(0,'#ffffff');gx.addColorStop(0.3,col);gx.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gx;ctx.globalAlpha=0.88+0.12*Math.sin(t*7);
      ctx.beginPath();ctx.ellipse(cx,cy+sz*0.05,sz*0.13,eyeH,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#000000';ctx.globalAlpha=1;
      ctx.beginPath();ctx.ellipse(cx,cy+sz*0.05,sz*0.045,eyeH*0.45,0,0,Math.PI*2);ctx.fill();
    }
    // CE drips from both pillar tops
    [cx-sz*0.31,cx+sz*0.31].forEach((dx,di)=>{
      const d2=sz*0.04+sz*0.09*Math.abs(Math.sin(t*1.4+di*1.7));
      ctx.globalAlpha=0.65;ctx.lineWidth=sz*0.028;ctx.strokeStyle=col;ctx.shadowBlur=sz*0.18;
      ctx.beginPath();ctx.moveTo(dx,cy-sz*0.26);ctx.lineTo(dx,cy-sz*0.26+d2);ctx.stroke();
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(dx,cy-sz*0.26+d2,sz*0.024,0,Math.PI*2);ctx.fill();
    });
    ctx.globalAlpha=1;ctx.shadowBlur=0;break;}

  case'Limitless':{
    // Six Eyes — animated orbiting stars (unchanged, already had animation)
    const eW=sz*0.46,eH=sz*0.3;
    ctx.fillStyle='#cce8ff';ctx.beginPath();ctx.moveTo(cx-eW,cy);ctx.bezierCurveTo(cx-eW*0.45,cy-eH*1.6,cx+eW*0.45,cy-eH*1.6,cx+eW,cy);ctx.bezierCurveTo(cx+eW*0.45,cy+eH*1.4,cx-eW*0.45,cy+eH*1.4,cx-eW,cy);ctx.fill();
    ctx.fillStyle='#1177ff';ctx.shadowBlur=sz*0.4;ctx.shadowColor='#55aaff';ctx.beginPath();ctx.arc(cx,cy,eH*0.9,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#001133';ctx.beginPath();ctx.arc(cx,cy,eH*0.46,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=col;ctx.lineWidth=sz*0.13;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(cx-eW,cy);ctx.bezierCurveTo(cx-eW*0.45,cy-eH*1.6,cx+eW*0.45,cy-eH*1.6,cx+eW,cy);ctx.stroke();
    ctx.lineWidth=sz*0.055;ctx.beginPath();ctx.moveTo(cx-eW,cy);ctx.bezierCurveTo(cx-eW*0.45,cy+eH*1.4,cx+eW*0.45,cy+eH*1.4,cx+eW,cy);ctx.stroke();
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(cx-eH*0.3,cy-eH*0.26,eH*0.26,eH*0.15,Math.PI*-0.35,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+eH*0.22,cy+eH*0.2,eH*0.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=col;ctx.shadowColor=col;
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t*0.8;const s=sz*0.052;const px=cx+Math.cos(a)*eW*1.1,py=cy+Math.sin(a)*eH*1.05;ctx.globalAlpha=0.8+0.2*Math.sin(t*5+i);ctx.shadowBlur=sz*0.4;ctx.beginPath();ctx.moveTo(px,py-s*1.9);ctx.lineTo(px+s*0.5,py-s*0.5);ctx.lineTo(px+s*1.9,py);ctx.lineTo(px+s*0.5,py+s*0.5);ctx.lineTo(px,py+s*1.9);ctx.lineTo(px-s*0.5,py+s*0.5);ctx.lineTo(px-s*1.9,py);ctx.lineTo(px-s*0.5,py-s*0.5);ctx.closePath();ctx.fill();}
    ctx.globalAlpha=1;ctx.shadowBlur=0;break;}

  case'Thunder God':{
    // Bold lightning bolt alternating gold→purple with glowing aura
    // Phase: 0→1 = gold, 1→2 = transition, 2→3 = purple, 3→4 = transition (4s cycle)
    const phase=(t*0.45)%1; // 0..1 cycle
    const toGold=phase<0.5;
    const blend=toGold?(1-Math.cos(phase*Math.PI*2)*0.5)*0.5:(1+Math.cos((phase-0.5)*Math.PI*2)*0.5)*0.5;
    // Gold=#ffaa00, Purple=#aa44ff — lerp
    const lr=(r1,r2)=>Math.round(r1+(r2-r1)*blend);
    const boltCol=`rgb(${lr(255,170)},${lr(170,68)},${lr(0,255)})`;
    const auraCol=`rgba(${lr(255,170)},${lr(170,68)},${lr(0,255)},`;
    // Outer aura — faint ring that breathes
    const auraPulse=0.18+0.14*Math.sin(t*6);
    ctx.globalAlpha=auraPulse;ctx.strokeStyle=boltCol;ctx.lineWidth=sz*0.055;ctx.shadowColor=boltCol;ctx.shadowBlur=sz*0.8;
    ctx.beginPath();ctx.arc(cx,cy,sz*0.55,0,Math.PI*2);ctx.stroke();
    // Second inner aura
    ctx.globalAlpha=auraPulse*1.8;ctx.lineWidth=sz*0.035;ctx.shadowBlur=sz*0.5;
    ctx.beginPath();ctx.arc(cx,cy,sz*0.4,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;
    // Bolt body
    ctx.fillStyle=boltCol;ctx.strokeStyle=boltCol;ctx.shadowColor=boltCol;ctx.shadowBlur=sz*0.55;ctx.lineWidth=sz*0.04;
    ctx.beginPath();ctx.moveTo(cx+sz*0.07,cy-sz*0.44);ctx.lineTo(cx-sz*0.14,cy-sz*0.02);ctx.lineTo(cx+sz*0.06,cy-sz*0.02);ctx.lineTo(cx-sz*0.1,cy+sz*0.44);ctx.lineTo(cx+sz*0.2,cy+sz*0.08);ctx.lineTo(cx-sz*0.01,cy+sz*0.08);ctx.closePath();ctx.fill();
    // White hot core
    ctx.fillStyle='rgba(255,255,255,0.55)';ctx.shadowBlur=0;
    ctx.beginPath();ctx.moveTo(cx+sz*0.05,cy-sz*0.38);ctx.lineTo(cx-sz*0.09,cy-sz*0.01);ctx.lineTo(cx+sz*0.04,cy-sz*0.01);ctx.lineTo(cx-sz*0.07,cy+sz*0.36);ctx.lineTo(cx+sz*0.15,cy+sz*0.05);ctx.lineTo(cx+sz*0.01,cy+sz*0.05);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.globalAlpha=1;break;}

  case'Fever Dreamer':{
    // Pachinko cabinet with animated ball — unchanged + ball bounce anim
    const lw2=sz*0.07;ctx.lineWidth=lw2;
    ctx.globalAlpha=0.3;ctx.fillRect(cx-sz*0.34,cy-sz*0.47,sz*0.68,sz*0.94);ctx.globalAlpha=1;ctx.strokeRect(cx-sz*0.34,cy-sz*0.47,sz*0.68,sz*0.94);
    ctx.globalAlpha=0.4;ctx.fillStyle=col;ctx.fillRect(cx-sz*0.26,cy-sz*0.37,sz*0.52,sz*0.54);ctx.globalAlpha=1;ctx.lineWidth=lw2*0.8;ctx.strokeRect(cx-sz*0.26,cy-sz*0.37,sz*0.52,sz*0.54);
    ctx.lineWidth=0;ctx.fillStyle=col;
    for(let pr=0;pr<3;pr++)for(let pc=0;pc<3;pc++){ctx.beginPath();ctx.arc(cx-sz*0.13+pc*sz*0.13,cy-sz*0.22+pr*sz*0.14,sz*0.045,0,Math.PI*2);ctx.fill();}
    const bpx=cx+Math.sin(t*5)*sz*0.13,bpy=cy-sz*0.08+Math.cos(t*6.5)*sz*0.1;
    ctx.fillStyle='#ffffff';ctx.shadowColor=col;ctx.shadowBlur=sz*0.4;ctx.beginPath();ctx.arc(bpx,bpy,sz*0.07,0,Math.PI*2);ctx.fill();ctx.shadowBlur=sz*0.3;
    ctx.fillStyle=col;ctx.font=`bold ${Math.floor(sz*0.15)}px "Courier New"`;ctx.textAlign='center';ctx.fillText('7 7 7',cx,cy+sz*0.44);break;}

  case'Star Rage':{
    // Void black hole + spinning 8-point star spikes (already animated)
    const vg=ctx.createRadialGradient(cx,cy,0,cx,cy,sz*0.42);vg.addColorStop(0,'#000000');vg.addColorStop(0.5,'#1a0014');vg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=vg;ctx.beginPath();ctx.arc(cx,cy,sz*0.48,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=0.9;ctx.strokeStyle=col;ctx.lineWidth=sz*0.05;ctx.shadowColor=col;ctx.shadowBlur=sz*0.6;ctx.beginPath();ctx.arc(cx,cy,sz*0.3,0,Math.PI*2);ctx.stroke();
    ctx.lineWidth=sz*0.06;for(let i=0;i<8;i++){const a=i/8*Math.PI*2+t*0.5;const outer=sz*(i%2===0?0.48:0.32);ctx.globalAlpha=0.7+0.3*Math.sin(t*4+i);ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.12,cy+Math.sin(a)*sz*0.12);ctx.lineTo(cx+Math.cos(a)*outer,cy+Math.sin(a)*outer);ctx.stroke();}
    ctx.globalAlpha=0.5;ctx.lineWidth=sz*0.04;ctx.beginPath();ctx.arc(cx+sz*0.1,cy,sz*0.22,Math.PI*0.6,Math.PI*1.8);ctx.stroke();ctx.beginPath();ctx.arc(cx-sz*0.1,cy,sz*0.22,Math.PI*1.6,Math.PI*2.8);ctx.stroke();
    ctx.shadowBlur=0;ctx.globalAlpha=1;break;}

  case'Straw Doll':{
    // A heavy cursed hammer — occasionally flashes with a bright shine streak
    ctx.shadowColor=col;ctx.shadowBlur=sz*0.5;
    // Handle — slightly angled, dark wood grain
    const hx1=cx+sz*0.04,hy1=cy+sz*0.52,hx2=cx-sz*0.08,hy2=cy-sz*0.18;
    ctx.lineWidth=sz*0.1;ctx.strokeStyle=col;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(hx1,hy1);ctx.lineTo(hx2,hy2);ctx.stroke();
    // Handle wood grain lines
    ctx.globalAlpha=0.22;ctx.lineWidth=sz*0.025;ctx.strokeStyle='#ffddaa';
    for(let i=0;i<4;i++){const u=0.2+i*0.18;ctx.beginPath();ctx.moveTo(hx1+(hx2-hx1)*u-sz*0.04,hy1+(hy2-hy1)*u);ctx.lineTo(hx1+(hx2-hx1)*u+sz*0.04,hy1+(hy2-hy1)*u);ctx.stroke();}
    ctx.globalAlpha=1;
    // Hammer head — heavy rectangle, rotated to match handle
    ctx.save();ctx.translate(hx2,hy2);ctx.rotate(-0.7);
    // Shadow fill for depth
    ctx.fillStyle=col;ctx.globalAlpha=0.92;ctx.shadowBlur=sz*0.55;
    ctx.fillRect(-sz*0.26,-sz*0.14,sz*0.52,sz*0.28);
    // Edge bevel highlight
    ctx.globalAlpha=0.18;ctx.fillStyle='#ffffff';ctx.fillRect(-sz*0.26,-sz*0.14,sz*0.52,sz*0.06);
    ctx.globalAlpha=0.12;ctx.fillRect(-sz*0.26,-sz*0.14,sz*0.05,sz*0.28);
    // Cursed rune etched into head — two vertical lines
    ctx.globalAlpha=0.4;ctx.strokeStyle=col;ctx.lineWidth=sz*0.03;
    ctx.beginPath();ctx.moveTo(-sz*0.08,-sz*0.1);ctx.lineTo(-sz*0.08,sz*0.1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sz*0.08,-sz*0.1);ctx.lineTo(sz*0.08,sz*0.1);ctx.stroke();
    ctx.globalAlpha=1;ctx.restore();
    // Occasional shine streak — every ~2.5s a bright flash sweeps the head
    const shineCycle=(t*0.4)%1; // 0..1 every 2.5s
    const shineActive=shineCycle>0.82; // flash for last 18% of cycle
    if(shineActive){
      const sp=(shineCycle-0.82)/0.18; // 0..1 within flash
      const fadeA=sp<0.5?sp*2:(1-sp)*2;
      ctx.save();ctx.translate(hx2,hy2);ctx.rotate(-0.7);
      // Swept shine line across head
      const sx=-sz*0.26+sp*sz*0.52;
      const sg=ctx.createLinearGradient(sx-sz*0.1,0,sx+sz*0.1,0);
      sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(0.5,`rgba(255,255,255,${(fadeA*0.9).toFixed(2)})`);sg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=sg;ctx.globalAlpha=1;ctx.fillRect(sx-sz*0.12,-sz*0.14,sz*0.24,sz*0.28);
      // Star sparkle at shine centre
      ctx.fillStyle=`rgba(255,255,255,${(fadeA*0.95).toFixed(2)})`;
      ctx.shadowColor='#ffffff';ctx.shadowBlur=sz*0.5;
      const ss=sz*0.06;
      ctx.beginPath();ctx.moveTo(sx,0-ss*1.8);ctx.lineTo(sx+ss*0.4,0-ss*0.4);ctx.lineTo(sx+ss*1.8,0);ctx.lineTo(sx+ss*0.4,0+ss*0.4);ctx.lineTo(sx,0+ss*1.8);ctx.lineTo(sx-ss*0.4,0+ss*0.4);ctx.lineTo(sx-ss*1.8,0);ctx.lineTo(sx-ss*0.4,0-ss*0.4);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    // CE glow around head
    const glowP=0.3+0.2*Math.sin(t*8);
    ctx.globalAlpha=glowP;ctx.strokeStyle=col;ctx.lineWidth=sz*0.035;ctx.shadowBlur=sz*0.5;
    ctx.save();ctx.translate(hx2,hy2);ctx.rotate(-0.7);ctx.strokeRect(-sz*0.28,-sz*0.16,sz*0.56,sz*0.32);ctx.restore();
    ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
  }
  ctx.restore();
}

// ════ SKILL ICONS ════
function drawSkillIcon(charName,slot,cx,cy,sz,col,inThunderUlt){
  ctx.save();
  ctx.strokeStyle=col;ctx.fillStyle=col;
  ctx.lineWidth=sz*0.1;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.shadowColor=col;ctx.shadowBlur=sz*0.22;
  const t=Date.now()*0.001;

  if(inThunderUlt){
    switch(slot){
      case 0:{[-sz*0.25,0,sz*0.25].forEach(oy=>{ctx.beginPath();ctx.moveTo(cx-sz*0.38,cy+oy);ctx.lineTo(cx-sz*0.1,cy+oy-sz*0.16);ctx.lineTo(cx+sz*0.08,cy+oy-sz*0.04);ctx.lineTo(cx+sz*0.38,cy+oy-sz*0.18);ctx.stroke();});break;}
      case 1:{ctx.globalAlpha=0.25;ctx.fillRect(cx-sz*0.14,cy-sz*0.48,sz*0.28,sz*0.96);ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(cx,cy-sz*0.48);ctx.lineTo(cx-sz*0.13,cy+sz*0.12);ctx.lineTo(cx,cy+sz*0.48);ctx.lineTo(cx+sz*0.13,cy+sz*0.12);ctx.closePath();ctx.fill();ctx.lineWidth=sz*0.08;ctx.beginPath();ctx.moveTo(cx-sz*0.25,cy-sz*0.05);ctx.lineTo(cx+sz*0.25,cy-sz*0.05);ctx.stroke();break;}
      case 2:{[sz*0.16,sz*0.3,sz*0.44].forEach(r=>{ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();});ctx.lineWidth=sz*0.07;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.44,cy+Math.sin(a)*sz*0.44);ctx.lineTo(cx+Math.cos(a)*sz*0.6,cy+Math.sin(a)*sz*0.6);ctx.stroke();}ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.arc(cx,cy,sz*0.09,0,Math.PI*2);ctx.fill();break;}
    }
    ctx.restore();return;
  }

  switch(charName){
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
    case 0:{ctx.lineWidth=sz*0.08;ctx.fillStyle='#ff3300';ctx.shadowColor='#ff3300';ctx.shadowBlur=sz*0.35;ctx.beginPath();ctx.arc(cx,cy,sz*0.26,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=col;for(let i=0;i<4;i++){const a=i/4*Math.PI*2,r=sz*0.26;ctx.lineWidth=sz*0.075;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.lineTo(cx+Math.cos(a)*(r+sz*0.2),cy+Math.sin(a)*(r+sz*0.2));ctx.stroke();ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r+sz*0.2),cy+Math.sin(a)*(r+sz*0.2));ctx.lineTo(cx+Math.cos(a-0.45)*(r+sz*0.1),cy+Math.sin(a-0.45)*(r+sz*0.1));ctx.lineTo(cx+Math.cos(a+0.45)*(r+sz*0.1),cy+Math.sin(a+0.45)*(r+sz*0.1));ctx.closePath();ctx.fill();}break;}
    case 1:{ctx.lineWidth=sz*0.07;for(let i=0;i<4;i++){ctx.globalAlpha=0.35+i*0.18;ctx.beginPath();let moved=false;for(let t2=0;t2<Math.PI*(1.4+i*0.35);t2+=0.1){const r=sz*(0.44-t2*0.06);if(r<sz*0.04)break;const px=cx+Math.cos(t2+i*0.78)*r,py=cy+Math.sin(t2+i*0.78)*r;moved?(ctx.lineTo(px,py)):(ctx.moveTo(px,py),moved=true);}ctx.stroke();}ctx.globalAlpha=1;ctx.fillStyle='#0055ff';ctx.shadowColor='#0055ff';ctx.shadowBlur=sz*0.3;ctx.beginPath();ctx.arc(cx,cy,sz*0.1,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;break;}
    case 2:{ctx.shadowBlur=0;ctx.fillStyle='#ff0000';ctx.shadowColor='#ff0000';ctx.shadowBlur=sz*0.2;ctx.beginPath();ctx.arc(cx,cy,sz*0.32,Math.PI/2,Math.PI*1.5);ctx.fill();ctx.fillStyle='#0044ff';ctx.shadowColor='#0044ff';ctx.beginPath();ctx.arc(cx,cy,sz*0.32,Math.PI*1.5,Math.PI/2);ctx.fill();ctx.fillStyle='#cc44ff';ctx.shadowColor='#cc44ff';ctx.shadowBlur=sz*0.5;ctx.beginPath();ctx.arc(cx,cy,sz*0.13,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;break;}
    case 3:{for(let i=1;i<=5;i++){ctx.globalAlpha=0.15+i*0.14;ctx.lineWidth=sz*(0.04+i*0.01);ctx.beginPath();ctx.arc(cx,cy,sz*i*0.09,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;ctx.lineWidth=sz*0.035;ctx.globalAlpha=0.38;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.46,cy+Math.sin(a)*sz*0.46);ctx.lineTo(cx+Math.cos(a)*sz*0.62,cy+Math.sin(a)*sz*0.62);ctx.stroke();}ctx.globalAlpha=1;ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.arc(cx,cy,sz*0.07,0,Math.PI*2);ctx.fill();break;}
    }break;
  case'Thunder God':
    switch(slot){
    case 0:{ctx.lineWidth=sz*0.09;ctx.beginPath();ctx.moveTo(cx-sz*0.44,cy-sz*0.1);ctx.lineTo(cx-sz*0.1,cy-sz*0.1);ctx.lineTo(cx-sz*0.2,cy+sz*0.08);ctx.lineTo(cx+sz*0.18,cy+sz*0.08);ctx.lineTo(cx+sz*0.08,cy+sz*0.22);ctx.lineTo(cx+sz*0.44,cy+sz*0.22);ctx.stroke();ctx.globalAlpha=0.45;ctx.lineWidth=sz*0.05;ctx.beginPath();ctx.arc(cx+sz*0.44,cy+sz*0.22,sz*0.11,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;break;}
    case 1:{ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.moveTo(cx-sz*0.44,cy);ctx.lineTo(cx+sz*0.18,cy);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+sz*0.08,cy-sz*0.22);ctx.lineTo(cx+sz*0.44,cy);ctx.lineTo(cx+sz*0.08,cy+sz*0.22);ctx.closePath();ctx.fill();ctx.lineWidth=sz*0.05;ctx.globalAlpha=0.6;[[-sz*0.22,-sz*0.28],[-sz*0.04,-sz*0.32],[sz*0.16,-sz*0.28],[sz*0.3,-sz*0.3]].forEach(([ox,oy])=>{ctx.beginPath();ctx.moveTo(cx+ox,cy+oy);ctx.lineTo(cx+ox+sz*0.06,cy+sz*0.03);ctx.stroke();});ctx.globalAlpha=1;break;}
    case 2:{ctx.lineWidth=sz*0.09;ctx.strokeRect(cx-sz*0.36,cy-sz*0.32,sz*0.72,sz*0.64);ctx.lineWidth=sz*0.055;ctx.globalAlpha=0.65;for(let i=0;i<4;i++){const x2=cx-sz*0.28+i*sz*0.19;ctx.beginPath();ctx.moveTo(x2,cy-sz*0.32);ctx.lineTo(x2+sz*0.06,cy-sz*0.46);ctx.lineTo(x2+sz*0.12,cy-sz*0.32);ctx.stroke();}ctx.globalAlpha=0.28;ctx.beginPath();ctx.moveTo(cx-sz*0.3,cy-sz*0.26);ctx.lineTo(cx+sz*0.3,cy+sz*0.26);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+sz*0.3,cy-sz*0.26);ctx.lineTo(cx-sz*0.3,cy+sz*0.26);ctx.stroke();ctx.globalAlpha=1;break;}
    case 3:{ctx.lineWidth=sz*0.06;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.2,cy+Math.sin(a)*sz*0.2);ctx.lineTo(cx+Math.cos(a)*sz*0.48,cy+Math.sin(a)*sz*0.48);ctx.stroke();}ctx.globalAlpha=0.4;for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/6;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.14,cy+Math.sin(a)*sz*0.14);ctx.lineTo(cx+Math.cos(a)*sz*0.36,cy+Math.sin(a)*sz*0.36);ctx.stroke();}ctx.globalAlpha=1;ctx.fillStyle='#ffaa00';ctx.shadowColor='#aa44ff';ctx.shadowBlur=sz*0.5;ctx.beginPath();ctx.moveTo(cx+sz*0.05,cy-sz*0.28);ctx.lineTo(cx-sz*0.1,cy);ctx.lineTo(cx+sz*0.04,cy);ctx.lineTo(cx-sz*0.07,cy+sz*0.28);ctx.lineTo(cx+sz*0.14,cy+sz*0.06);ctx.lineTo(cx+sz*0.01,cy+sz*0.06);ctx.closePath();ctx.fill();ctx.shadowBlur=0;break;}
    }break;
  case'Fever Dreamer':
    switch(slot){
    case 0:{ctx.fillRect(cx-sz*0.22,cy-sz*0.16,sz*0.44,sz*0.32);ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=sz*0.03;for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(cx-sz*0.22+i*sz*0.148,cy-sz*0.16);ctx.lineTo(cx-sz*0.22+i*sz*0.148,cy+sz*0.04);ctx.stroke();}ctx.strokeStyle=col;ctx.lineWidth=sz*0.08;for(let i=-2;i<=2;i++){const a=i*0.22,r=sz*0.22;ctx.globalAlpha=0.55+Math.abs(i)*0.1;ctx.beginPath();ctx.moveTo(cx+r,cy+Math.sin(a)*r*0.3);ctx.lineTo(cx+r+Math.cos(a)*sz*0.28,cy+Math.sin(a)*sz*0.28);ctx.stroke();}ctx.globalAlpha=1;ctx.lineWidth=sz*0.06;ctx.globalAlpha=0.5;ctx.beginPath();ctx.moveTo(cx+sz*0.22,cy+sz*0.16);ctx.lineTo(cx+sz*0.44,cy+sz*0.38);ctx.stroke();ctx.globalAlpha=1;break;}
    case 1:{const ig=ctx.createRadialGradient(cx-sz*0.1,cy-sz*0.1,0,cx,cy,sz*0.38);ig.addColorStop(0,'#aaaaaa');ig.addColorStop(0.5,'#555555');ig.addColorStop(1,'#1a1a1a');ctx.fillStyle=ig;ctx.shadowBlur=sz*0.3;ctx.beginPath();ctx.arc(cx,cy,sz*0.38,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=sz*0.07;ctx.shadowColor=col;ctx.shadowBlur=sz*0.35;ctx.beginPath();ctx.arc(cx,cy,sz*0.46,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(255,255,255,0.35)';ctx.shadowBlur=0;ctx.beginPath();ctx.ellipse(cx-sz*0.14,cy-sz*0.14,sz*0.1,sz*0.07,Math.PI*-0.3,0,Math.PI*2);ctx.fill();break;}
    case 2:{ctx.lineWidth=sz*0.08;ctx.strokeRect(cx-sz*0.28,cy-sz*0.44,sz*0.56,sz*0.88);ctx.globalAlpha=0.2;ctx.fillRect(cx-sz*0.28,cy-sz*0.44,sz*0.56,sz*0.88);ctx.globalAlpha=1;ctx.lineWidth=sz*0.05;ctx.globalAlpha=0.5;ctx.beginPath();ctx.moveTo(cx-sz*0.28,cy);ctx.lineTo(cx+sz*0.28,cy);ctx.stroke();ctx.globalAlpha=1;ctx.lineWidth=sz*0.07;ctx.beginPath();ctx.arc(cx-sz*0.22,cy-sz*0.28,sz*0.06,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(cx-sz*0.22,cy+sz*0.12,sz*0.06,0,Math.PI*2);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(cx+sz*0.18,cy-sz*0.06,sz*0.07,0,Math.PI*2);ctx.fill();ctx.lineWidth=sz*0.04;ctx.globalAlpha=0.45;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(cx+sz*0.28,cy-sz*0.2+i*sz*0.2);ctx.lineTo(cx+sz*0.42,cy-sz*0.2+i*sz*0.2+Math.sin(i)*sz*0.06);ctx.stroke();}ctx.globalAlpha=1;break;}
    case 3:{ctx.lineWidth=sz*0.07;ctx.strokeRect(cx-sz*0.38,cy-sz*0.38,sz*0.76,sz*0.76);ctx.globalAlpha=0.15;ctx.fillRect(cx-sz*0.38,cy-sz*0.38,sz*0.76,sz*0.76);ctx.globalAlpha=1;for(let d=0;d<3;d++){const rx=cx-sz*0.28+d*sz*0.28,ry=cy-sz*0.2,rw=sz*0.24,rh=sz*0.36;ctx.lineWidth=sz*0.05;ctx.strokeRect(rx,ry,rw,rh);ctx.globalAlpha=0.2;ctx.fillRect(rx,ry,rw,rh);ctx.globalAlpha=1;ctx.fillStyle='#ffcc00';ctx.shadowColor='#ffcc00';ctx.shadowBlur=sz*0.3;ctx.font=`bold ${Math.floor(sz*0.26)}px "Courier New"`;ctx.textAlign='center';ctx.fillText('7',rx+rw/2,ry+rh*0.78);}ctx.shadowBlur=0;ctx.fillStyle=col;ctx.font=`bold ${Math.floor(sz*0.14)}px "Courier New"`;ctx.textAlign='center';ctx.fillText('\u2605 7 7 7 \u2605',cx,cy-sz*0.44);break;}
    }break;
  case'Star Rage':
    switch(slot){
    case 0:{[sz*0.12,sz*0.26,sz*0.42].forEach((r,i)=>{ctx.globalAlpha=1-i*0.25;ctx.lineWidth=sz*(0.09-i*0.02);ctx.beginPath();ctx.arc(cx,cy,r+Math.sin(t*5+i)*sz*0.03,0,Math.PI*2);ctx.stroke();});ctx.globalAlpha=1;ctx.lineWidth=sz*0.1;ctx.beginPath();ctx.arc(cx,cy,sz*0.09,0,Math.PI*2);ctx.fill();for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t;ctx.globalAlpha=0.5;ctx.lineWidth=sz*0.05;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.42,cy+Math.sin(a)*sz*0.42);ctx.lineTo(cx+Math.cos(a)*sz*0.58,cy+Math.sin(a)*sz*0.58);ctx.stroke();}ctx.globalAlpha=1;break;}
    case 1:{ctx.lineWidth=sz*0.08;ctx.beginPath();ctx.moveTo(cx-sz*0.28,cy);ctx.lineTo(cx-sz*0.08,cy-sz*0.22);ctx.lineTo(cx+sz*0.36,cy);ctx.lineTo(cx-sz*0.08,cy+sz*0.22);ctx.closePath();ctx.fill();[0.28,0.42,0.56].forEach((d,i)=>{ctx.globalAlpha=0.6-i*0.15;ctx.beginPath();ctx.arc(cx-sz*d,cy,sz*(0.07-i*0.015),0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;break;}
    case 2:{for(let i=0;i<3;i++){const a=i/3*Math.PI*2+t;ctx.globalAlpha=0.5+i*0.15;ctx.lineWidth=sz*0.08;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.38,cy+Math.sin(a)*sz*0.38);ctx.lineTo(cx+Math.cos(a+0.6)*sz*0.2,cy+Math.sin(a+0.6)*sz*0.2);ctx.stroke();}ctx.globalAlpha=1;ctx.beginPath();ctx.arc(cx,cy,sz*0.1,0,Math.PI*2);ctx.fill();break;}
    case 3:{const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,sz*0.45);bg.addColorStop(0,'#000000');bg.addColorStop(0.6,'#200015');bg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=bg;ctx.beginPath();ctx.arc(cx,cy,sz*0.48,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=sz*0.06;ctx.shadowColor=col;ctx.shadowBlur=sz*0.5;ctx.beginPath();ctx.arc(cx,cy,sz*0.28,0,Math.PI*2);ctx.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2+t*2;const r=sz*0.38+Math.sin(t*8+i)*sz*0.06;ctx.globalAlpha=0.6;ctx.lineWidth=sz*0.03;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*sz*0.28,cy+Math.sin(a)*sz*0.28);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.stroke();}ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    }break;
  case'Straw Doll':
    switch(slot){
    case 0:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.3;ctx.lineWidth=sz*0.12;ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(cx-sz*0.22,cy+sz*0.46);ctx.lineTo(cx+sz*0.16,cy-sz*0.1);ctx.stroke();ctx.save();ctx.translate(cx+sz*0.16,cy-sz*0.1);ctx.rotate(-0.65);ctx.fillStyle=col;ctx.fillRect(-sz*0.24,-sz*0.1,sz*0.38,sz*0.2);ctx.restore();ctx.lineWidth=sz*0.04;ctx.globalAlpha=0.7;for(let i=0;i<5;i++){const a=i/5*Math.PI+0.5;ctx.beginPath();ctx.moveTo(cx+sz*0.12,cy-sz*0.2);ctx.lineTo(cx+sz*0.12+Math.cos(a)*sz*0.22,cy-sz*0.2+Math.sin(a)*sz*0.22);ctx.stroke();}ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    case 1:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.28;[[-0.22,-0.1],[0,0],[0.22,0.1]].forEach(([dy,rot])=>{ctx.save();ctx.translate(cx+sz*0.1,cy+dy*sz);ctx.rotate(rot);ctx.fillStyle=col;ctx.strokeStyle='#fff';ctx.lineWidth=sz*0.025;ctx.fillRect(-sz*0.22,-sz*0.04,sz*0.32,sz*0.08);ctx.beginPath();ctx.moveTo(sz*0.1,-sz*0.05);ctx.lineTo(sz*0.18,0);ctx.lineTo(sz*0.1,sz*0.05);ctx.closePath();ctx.fill();ctx.fillStyle='#884400';ctx.fillRect(-sz*0.22,-sz*0.05,sz*0.07,sz*0.1);ctx.restore();});ctx.shadowBlur=0;break;}
    case 2:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.36;ctx.lineWidth=sz*0.06;ctx.strokeStyle=col;ctx.globalAlpha=0.2;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(cx+sz*0.14,cy,sz*0.12,sz*0.23,0.1,0,Math.PI*2);ctx.fill();ctx.globalAlpha=0.9;ctx.beginPath();ctx.ellipse(cx+sz*0.14,cy,sz*0.12,sz*0.23,0.1,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(cx+sz*0.14,cy-sz*0.26,sz*0.08,0,Math.PI*2);ctx.stroke();ctx.lineWidth=sz*0.03;ctx.globalAlpha=0.7;ctx.setLineDash([sz*0.04,sz*0.04]);for(let i=0;i<3;i++){const oy=(i-1)*sz*0.16;ctx.beginPath();ctx.moveTo(cx-sz*0.28,cy+oy);ctx.lineTo(cx+sz*0.02,cy+oy*0.5);ctx.stroke();}ctx.setLineDash([]);ctx.globalAlpha=1;ctx.lineWidth=sz*0.05;ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(cx-sz*0.28,cy);ctx.lineTo(cx+sz*0.04,cy);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(cx-sz*0.28,cy,sz*0.05,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;break;}
    case 3:{ctx.shadowColor=col;ctx.shadowBlur=sz*0.32;ctx.lineWidth=sz*0.055;ctx.strokeStyle=col;ctx.globalAlpha=0.7;ctx.beginPath();ctx.moveTo(cx-sz*0.32,cy+sz*0.1);ctx.lineTo(cx+sz*0.2,cy+sz*0.1);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+sz*0.08,cy-sz*0.06);ctx.lineTo(cx+sz*0.24,cy+sz*0.1);ctx.lineTo(cx+sz*0.08,cy+sz*0.26);ctx.stroke();ctx.globalAlpha=0.5+0.45*Math.sin(t*8);ctx.fillStyle=col;ctx.shadowBlur=sz*0.5;ctx.beginPath();ctx.moveTo(cx+sz*0.04,cy-sz*0.38);ctx.lineTo(cx-sz*0.08,cy-sz*0.04);ctx.lineTo(cx+sz*0.02,cy-sz*0.04);ctx.lineTo(cx-sz*0.1,cy+sz*0.36);ctx.lineTo(cx+sz*0.14,cy+sz*0.02);ctx.lineTo(cx+sz*0.02,cy+sz*0.02);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
    }break;
  }
  ctx.restore();
}