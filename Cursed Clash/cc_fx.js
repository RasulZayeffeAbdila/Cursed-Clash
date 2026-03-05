// ── CURSED CLASH · cc_fx.js ── Effects system (addFX, spawnParticles, updateFX, drawFX)
// To add a new effect type: add update logic in updateFX filter, add render case in drawFX switch
// ── EFFECTS ──
let _fxFiltering=false,_fxPending=[];
function addFX(e){if(_fxFiltering)_fxPending.push(e);else effects.push(e);}
function spawnParticles(x,y,color,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=Math.random()*6+2;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2.2,color,alpha:1,r:Math.random()*5+1.5,life:380+Math.random()*520});}}

function updateFX(dt){
  particles=particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.14;p.alpha=p.life/900;p.life-=dt;return p.life>0;});
  shakeX*=0.72;shakeY*=0.72;
  _fxFiltering=true;_fxPending=[];
  effects=effects.filter(e=>{
    e.t-=dt;
    if(e.type==='bolt'){
      e.x+=e.vx;e.y+=e.vy;
      if(e.trail){e.trail.push({x:e.x,y:e.y});if(e.trail.length>12)e.trail.shift();}
      if(e.tracking&&e.trackTimer>0&&e.opp){const dx=e.opp.cx-e.x,dy=e.opp.cy-e.y,d=Math.sqrt(dx*dx+dy*dy);if(d>0){e.vx+=dx/d*1.2;e.vy+=dy/d*0.8;}e.trackTimer-=dt;}
      if(!e.hit&&e.opp){const o=e.opp;if(e.x<o.x+PW&&e.x+e.w>o.x&&e.y<o.y+PH&&e.y+e.h>o.y){e.owner.dealDamage(o,e.dmg);if(e.onHitStun)o.stunned=Math.max(o.stunned,e.onHitStun);spawnParticles(e.x,e.y,e.color,14);addFX({type:'burstRing',x:e.x,y:e.y,color:e.color,t:300,r:40});e.hit=true;return false;}}
      if(e.x<-40||e.x>W+40||e.y<-40||e.y>H+40)return false;
    }
    if(e.type==='crossSlash'){e.x+=e.vx;e.y+=e.vy;if(!e.hit&&e.opp){const d=Math.hypot(e.x-e.opp.cx,e.y-e.opp.cy);if(d<e.sz+PW/2){e.owner.dealDamage(e.opp,e.dmg);spawnParticles(e.x,e.y,e.color,25);addFX({type:'crossImpact',x:e.x,y:e.y,color:e.color,t:450});e.hit=true;return false;}}if(e.x<-80||e.x>W+80)return false;}
    if(e.type==='redOrb'){e.x+=e.vx;e.y+=e.vy;if(e.trail){e.trail.push({x:e.x,y:e.y});if(e.trail.length>16)e.trail.shift();}if(!e.hit&&e.opp){const d=Math.hypot(e.x-e.opp.cx,e.y-e.opp.cy);if(d<55){e.owner.dealDamage(e.opp,e.dmg);e.opp.vx=e.vx*2.8;e.opp.vy=-13;spawnParticles(e.x,e.y,'#ff4400',50);addFX({type:'redExplosion',x:e.x,y:e.y,t:600});e.hit=true;return false;}}if(e.x<-60||e.x>W+60)return false;}
    if(e.type==='hollowPurple'){e.x+=e.vx;e.y+=e.vy;if(!e.hit&&e.opp){const d=Math.hypot(e.x-e.opp.cx,e.y-e.opp.cy);if(d<90){e.owner.dealDamage(e.opp,e.dmg);e.opp.vx=e.vx*2.2;e.opp.vy=-8;spawnParticles(e.x,e.y,'#aa44ff',80);spawnParticles(e.x,e.y,'#fff',40);addFX({type:'hollowImpact',x:e.x,y:e.y,t:900});addFX({type:'screenFlash',color:'#aa44ff',t:300,alpha:0.5,dur:300});e.hit=true;return false;}}if(e.x<-150||e.x>W+150)return false;}
    if(e.type==='voltageCage'&&!e.triggered&&e.opp){const o=e.opp;if(o.x<e.x+e.w&&o.x+PW>e.x&&o.y<e.y+e.h&&o.y+PH>e.y){e.owner.dealDamage(o,32);o.stunned=Math.max(o.stunned,1500);spawnParticles(o.cx,o.cy,'#00ccff',55);addFX({type:'bigText',x:o.cx,y:o.y-30,text:'SHOCKED!',color:'#00ccff',t:900});addFX({type:'burstRing',x:o.cx,y:o.cy,color:'#00aaff',t:400,r:70});e.triggered=true;return false;}}
    // Iron Ball — heavy physics projectile
    if(e.type==='ironBall'){
      e.vy+=0.45; // gravity
      e.x+=e.vx; e.y+=e.vy;
      if(e.y+e.r>=FLOOR&&e.bounces>0){e.y=FLOOR-e.r;e.vy*=-0.55;e.vx*=0.8;e.bounces--;spawnParticles(e.x,FLOOR,'#888',10);addFX({type:'screenShake',t:120,mag:5});}
      if(!e.hit&&e.opp){const d=Math.hypot(e.x-e.opp.cx,e.y-e.opp.cy);if(d<e.r+PW/2){e.owner.dealDamage(e.opp,e.dmg);e.opp.vx=e.vx*1.5;e.opp.vy=-10;spawnParticles(e.x,e.y,'#888',35);spawnParticles(e.x,e.y,e.owner.color,20);addFX({type:'crushRing',x:e.x,y:e.y,color:'#aaaaaa',t:450});addFX({type:'screenShake',t:200,mag:9});e.hit=true;return false;}}
      if(e.x<-80||e.x>W+80||e.y>H+80)return false;
    }
    // Cursed Door — trap + launch (safe: look up players by id each frame)
    if(e.type==='cursedDoor'){
      const owner=e.ownerId===1?p1:p2;
      const opp2=e.oppId===1?p1:p2;
      if(!e.trapped&&opp2){
        if(opp2.x<e.x+e.w&&opp2.x+PW>e.x&&opp2.y<e.y+e.h&&opp2.y+PH>e.y){
          e.trapped=true;e.trapTimer=1500;
          opp2.stunned=Math.max(opp2.stunned,1500);
          spawnParticles(e.x+e.w/2,e.y+e.h/2,e.dcol,45);
          addFX({type:'bigText',x:e.x+e.w/2,y:e.y-12,text:'TRAPPED!',color:e.dcol,t:1000});
        }
      }
      if(e.trapped&&e.trapTimer>0){
        e.trapTimer-=dt;
        if(opp2&&!opp2.blocking){
          opp2.x=Math.max(0,Math.min(W-PW,e.x+(e.w-PW)/2));
          opp2.vx=0;
        }
      }
      if(e.trapped&&e.trapTimer<=0&&!e.launched){
        e.launched=true;
        if(opp2&&owner){
          owner.dealDamage(opp2,e.dmg);
          opp2.vx=(opp2.cx>W/2?1:-1)*32;opp2.vy=-20;
          spawnParticles(e.x+e.w/2,e.y+e.h/2,e.dcol,70);
          addFX({type:'burstRing',x:e.x+e.w/2,y:e.y+e.h/2,color:e.dcol,t:500,r:100});
          addFX({type:'bigText',x:opp2.cx,y:opp2.y-35,text:'LAUNCHED!',color:e.dcol,t:900});
          addFX({type:'screenShake',t:250,mag:10});
        }
        return false;
      }
    }
    // Mass Orb — slow dense projectile for Star Rage skill 1
    if(e.type==='massOrb'){
      if(!e.straight)e.vy+=0.2; // gravity only for lobbed version
      e.x+=e.vx; e.y+=e.vy;
      if(e.trail){e.trail.push({x:e.x,y:e.y});if(e.trail.length>18)e.trail.shift();}
      if(!e.hit&&e.opp){
        const d=Math.hypot(e.x-e.opp.cx,e.y-e.opp.cy);
        if(d<e.r+PW/2){
          e.owner.dealDamage(e.opp,e.dmg);
          e.opp.vx=e.vx*2.8;e.opp.vy=-14;
          spawnParticles(e.x,e.y,e.owner.color,70);spawnParticles(e.x,e.y,'#000',30);
          addFX({type:'burstRing',x:e.x,y:e.y,color:e.owner.color,t:500,r:90});
          addFX({type:'burstRing',x:e.x,y:e.y,color:'#fff',t:450,r:55});
          addFX({type:'screenShake',t:400,mag:16});
          addFX({type:'screenFlash',color:e.owner.color,t:240,alpha:0.35,dur:240});
          addFX({type:'groundCrack',x:e.x,y:FLOOR,color:e.owner.color,t:900,big:true});
          addFX({type:'bigText',x:e.opp.cx,y:e.opp.y-50,text:'MASS IMPACT',color:e.owner.color,t:1000});
          e.hit=true;return false;
        }
      }
      if(e.x<-100||e.x>W+100||e.y>H+100)return false;
    }
    // Nail — Straw Doll projectile, thin fast piercing nail
    if(e.type==='nail'){
      e.vy+=0.18; // light arc
      e.x+=e.vx; e.y+=e.vy;
      if(e.trail){e.trail.push({x:e.x,y:e.y,vx:e.vx,vy:e.vy});if(e.trail.length>10)e.trail.shift();}
      if(!e.hit&&e.opp){
        const d=Math.hypot(e.x-e.opp.cx,e.y-e.opp.cy);
        if(d<PW*0.7){
          e.owner.dealDamage(e.opp,e.dmg);
          e.opp.vx+=e.vx*0.4;
          spawnParticles(e.x,e.y,e.owner.color,12);
          addFX({type:'slashMark',x:e.x,y:e.y,color:e.owner.color,t:500});
          addFX({type:'bigText',x:e.opp.cx,y:e.opp.y-30,text:'NAIL',color:e.owner.color,t:500});
          e.hit=true;return false;
        }
      }
      if(e.x<-60||e.x>W+60||e.y>H+60)return false;
    }
    // Black Hole Orb — slow projectile, activates on proximity or re-press
    if(e.type==='blackHoleOrb'){
      if(!e.active){
        // Move slowly
        e.x+=e.vx; e.y+=e.vy;
        e.vy+=0.06; // slight gravity
        // Bounce off floor
        if(e.y>FLOOR-22){e.y=FLOOR-22;e.vy*=-0.5;e.vx*=0.85;}
        // Clamp to screen
        if(e.x<20){e.x=20;e.vx=Math.abs(e.vx);}
        if(e.x>W-20){e.x=W-20;e.vx=-Math.abs(e.vx);}
        // Auto-activate if enemy close enough
        if(e.opp){
          const d=Math.hypot(e.x-e.opp.cx,e.y-e.opp.cy);
          if(d<90){
            e.active=true;e.t=10000;
            spawnParticles(e.x,e.y,e.owner?e.owner.color:'#ff44cc',120);
            addFX({type:'screenFlash',color:e.owner?e.owner.color:'#ff44cc',t:500,alpha:0.65,dur:500});
            addFX({type:'domainText',text:'Black Hole',sub:'SINGULARITY ACTIVATED',color:e.owner?e.owner.color:'#ff44cc',t:2800});
            addFX({type:'screenShake',t:700,mag:20});
          }
        }
      } else {
        // BLACK HOLE ACTIVE — pull EVERYONE; enemy gets crushed even when fleeing
        if(p1&&p2){
          [p1,p2].forEach(pl=>{
            const isUser=pl===e.owner;
            const dx=e.x-pl.cx,dy=e.y-pl.cy,d=Math.sqrt(dx*dx+dy*dy)+1;
            const nx=dx/d,ny=dy/d;
            // Dot product: positive = moving away from BH
            const dotProduct=pl.vx*(-nx)+pl.vy*(-ny);
            // User: escape dampens pull to 55% (fair for owner)
            // Enemy: escaping still pulls at 88% — you can't easily run
            const escapeScale=isUser?0.55:0.88;
            const forceScale=dotProduct>0?escapeScale:1.0;
            // Enemy gets 1.45x base force — much harder to resist
            const baseForce=(isUser?14:22)/(d*0.012+0.6);
            pl.vx+=nx*baseForce*forceScale;
            pl.vy+=ny*baseForce*0.65*forceScale;
            // Cap: enemy capped higher so pull overwhelms their movement
            const cap=isUser?26:34;
            const spd=Math.sqrt(pl.vx*pl.vx+pl.vy*pl.vy);
            if(spd>cap){pl.vx=pl.vx/spd*cap;pl.vy=pl.vy/spd*cap;}
            // Damage in 180px radius — 20/s user, 30/s enemy
            if(d<180&&pl.hp>0){
              const isUser=pl===e.owner;
              const dmgRate=isUser?20:30;
              const acc=isUser?'dmgAccUser':'dmgAccEnemy';
              e[acc]+=dt;
              const tickRate=1000/dmgRate;
              while(e[acc]>=tickRate){
                e[acc]-=tickRate;
                pl.hp=Math.max(0,pl.hp-1);pl.hurtAnim=100;
                if(Math.random()<0.12)spawnParticles(pl.cx,pl.cy,e.owner?e.owner.color:'#ff44cc',3);
              }
            }
          });
          // Damage numbers every second
          e.lastDmgTxt-=dt;
          if(e.lastDmgTxt<=0){
            e.lastDmgTxt=1000;
            [p1,p2].forEach(pl=>{
              const d2=Math.hypot(e.x-pl.cx,e.y-pl.cy);
              if(d2<180&&pl.hp>0){
                const isUser=pl===e.owner;
                addFX({type:'dmgNum',x:pl.cx,y:pl.y-5,val:isUser?20:30,color:e.owner?e.owner.color:'#ff44cc',t:900});
              }
            });
          }
        }
        if(e.t<=0&&e.owner)e.owner.ultActive=false;
        if(e.t<=0&&e.owner)e.owner.blackHoleOrb=null;
      }
    }
    // Legacy blackHoleDomain (keep for safety)
    if(e.type==='blackHoleDomain'&&p1&&p2){
      const bhR=180;
      [p1,p2].forEach(pl=>{
        const dx=e.x-pl.cx,dy=e.y-pl.cy,d=Math.sqrt(dx*dx+dy*dy);
        if(d>0&&d<bhR*1.8){const force=6*(1-Math.min(1,d/(bhR*1.8)));pl.vx+=dx/d*force;pl.vy+=dy/d*force*0.6;}
        if(d<bhR&&pl.hp>0){
          e.dmgAcc+=dt;
          while(e.dmgAcc>=50){e.dmgAcc-=50;pl.hp=Math.max(0,pl.hp-1);pl.hurtAnim=120;}
        }
      });
      if(e.t<=0&&e.owner)e.owner.ultActive=false;
    }
    if(e.type==='screenShake'){shakeX=(Math.random()-.5)*e.mag;shakeY=(Math.random()-.5)*e.mag;}
    return e.t>0;
  });
  _fxFiltering=false;
  for(let i=0;i<_fxPending.length;i++)effects.push(_fxPending[i]);
  _fxPending=[];
}

function drawFX(){
  // ── DOMAIN BACKGROUNDS (drawn first, under everything) ──
  effects.forEach(e=>{
    // IDLE DEATH GAMBLE — Hakari's train station domain
    if(e.type==='gamblerBg'&&e.owner){
      ctx.save();
      const t2=Date.now()*0.001;
      const fade=Math.min(1,(11000-e.t)/600);
      ctx.globalAlpha=fade;

      // Dark station concrete sky
      const sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,'#02080a');sky.addColorStop(0.4,'#030c0e');sky.addColorStop(1,'#01050a');
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

      // Overhead fluorescent ceiling panels
      ctx.globalAlpha=fade*0.55;
      for(let i=0;i<8;i++){
        const lx=i*W/7,flicker=0.6+0.4*Math.abs(Math.sin(t2*60+i*9));
        ctx.fillStyle=`rgba(180,255,210,${0.08*flicker})`;
        ctx.fillRect(lx-30,0,55,12);
        ctx.fillStyle=`rgba(180,255,210,${0.55*flicker})`;
        const lg=ctx.createLinearGradient(lx-30,0,lx-30,200);
        lg.addColorStop(0,`rgba(180,255,200,${0.18*flicker})`);lg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=lg;ctx.fillRect(lx-50,0,90,200);
      }

      // Train tracks (3-point perspective)
      ctx.globalAlpha=fade*0.7;
      ctx.strokeStyle='#1a3020';ctx.lineWidth=3;
      const vp={x:W/2,y:FLOOR-80};
      // 4 rail pairs
      [[-300,-120,300,120],[-160,-65,160,65]].forEach(([lo,li,ro,ri])=>{
        // Left rail
        ctx.beginPath();ctx.moveTo(vp.x+lo,H);ctx.lineTo(vp.x+li,vp.y);ctx.stroke();
        // Right rail
        ctx.beginPath();ctx.moveTo(vp.x+ro,H);ctx.lineTo(vp.x+ri,vp.y);ctx.stroke();
      });
      // Sleeper ties (horizontal)
      ctx.lineWidth=2;ctx.strokeStyle='#162a1c';
      for(let i=0;i<10;i++){const f=i/9,y2=vp.y+(H-vp.y)*f,wid=(120+180*f);ctx.beginPath();ctx.moveTo(vp.x-wid,y2);ctx.lineTo(vp.x+wid,y2);ctx.stroke();}

      // Platform edge stripe
      ctx.globalAlpha=fade*0.55;
      ctx.fillStyle='#1a2a1e';ctx.fillRect(0,FLOOR-3,W,3);
      ctx.fillStyle='#22ff66';ctx.globalAlpha=fade*0.15;
      ctx.fillRect(0,FLOOR-5,W,5);

      // Moving train blur (left side occasionally)
      const trainPhase=(t2*0.12)%1;
      if(trainPhase<0.35){
        const tx=-200+trainPhase*(W+600)/0.35;
        ctx.globalAlpha=fade*0.28;ctx.fillStyle='#334433';
        ctx.fillRect(tx,FLOOR-220,320,220);
        ctx.globalAlpha=fade*0.5;
        for(let w=0;w<5;w++){ctx.fillStyle=`rgba(180,255,200,0.18)`;ctx.fillRect(tx+w*64+6,FLOOR-180,38,70);}
      }

      // Station clock
      const clkX=W/2,clkY=90;
      ctx.globalAlpha=fade*0.8;
      ctx.strokeStyle='#22cc66';ctx.lineWidth=3;ctx.shadowColor='#22cc66';ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(clkX,clkY,42,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=fade*0.5;
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ctx.beginPath();ctx.moveTo(clkX+Math.cos(a)*34,clkY+Math.sin(a)*34);ctx.lineTo(clkX+Math.cos(a)*40,clkY+Math.sin(a)*40);ctx.stroke();}
      // Clock hands matching domain timer
      const elapsed=11-Math.max(0,e.t/1000);
      const ha=-Math.PI/2+elapsed/11*Math.PI*2;
      ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(clkX,clkY);ctx.lineTo(clkX+Math.cos(ha)*26,clkY+Math.sin(ha)*26);ctx.stroke();
      ctx.shadowBlur=0;

      // Slot machine number boards floating (showing owner's jackpot digits)
      if(e.owner&&e.owner.jackpotDigits){
        const jp=e.owner.jackpotActive,spinning=e.owner.jackpotSpinAnim>0;
        const boardX=W/2-100,boardY=FLOOR-380;
        ctx.globalAlpha=fade*0.9;
        // Outer panel
        ctx.fillStyle='#0a0d0a';ctx.fillRect(boardX,boardY,200,90);
        ctx.strokeStyle=jp?'#ffcc00':e.owner.color;ctx.lineWidth=3;
        ctx.strokeRect(boardX,boardY,200,90);
        // Label
        ctx.fillStyle=jp?'#ffcc00':e.owner.color;
        ctx.font='bold 11px "Courier New"';ctx.textAlign='center';
        ctx.fillText(jp?'★ JACKPOT ★':'ROLLING...',W/2,boardY+16);
        // Three digit reels
        for(let d=0;d<3;d++){
          const rx=boardX+10+d*64,ry=boardY+22;
          ctx.fillStyle='#050a05';ctx.fillRect(rx,ry,54,52);
          ctx.strokeStyle='#224422';ctx.lineWidth=1;ctx.strokeRect(rx,ry,54,52);
          const dv=spinning?Math.floor(Date.now()*0.018+d*7)%10:e.owner.jackpotDigits[d];
          ctx.shadowColor=jp?'#ffcc00':e.owner.color;ctx.shadowBlur=jp?18:6;
          ctx.fillStyle=jp?'#ffcc00':'#aaffcc';
          ctx.font=`bold 34px "Courier New"`;ctx.textAlign='center';
          ctx.fillText(String(dv),rx+27,ry+40);
        }
        ctx.shadowBlur=0;
        // Next spin timer bar
        const barW=180,barFill=barW*(1-Math.max(0,e.owner.jackpotSlotTimer)/2500);
        ctx.globalAlpha=fade*0.6;
        ctx.fillStyle='#111';ctx.fillRect(boardX+10,boardY+80,barW,8);
        ctx.fillStyle=e.owner.color;ctx.fillRect(boardX+10,boardY+80,barFill,8);
        ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.strokeRect(boardX+10,boardY+80,barW,8);
      }

      // Green cursed energy vignette
      ctx.globalAlpha=fade*0.4;
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.2,W/2,H/2,W*0.85);
      vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,8,2,0.9)');
      ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);

      ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.restore();
      return;
    }

    // MALEVOLENT SHRINE — Sukuna's dark torii domain
    if(e.type==='malevolentBg'&&e.owner){
      ctx.save();
      const t2=Date.now()*0.001;
      const fade=Math.min(1,(5000-e.t)/400);
      ctx.globalAlpha=fade;

      // Dark crimson sky
      const sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,'#0e0001');sky.addColorStop(0.5,'#1a0002');sky.addColorStop(1,'#0a0000');
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

      // Blood-red grid of Malevolent Shrine (diagonal slash pattern)
      ctx.globalAlpha=fade*(0.18+0.06*Math.sin(t2*2.2));
      ctx.strokeStyle='#cc1100';ctx.lineWidth=1.2;
      for(let i=-5;i<22;i++){
        const ox=i*80+(t2*18)%80;
        ctx.beginPath();ctx.moveTo(ox-100,0);ctx.lineTo(ox+H,H);ctx.stroke();
        ctx.beginPath();ctx.moveTo(W-ox+100,0);ctx.lineTo(W-ox-H,H);ctx.stroke();
      }

      // Torii gate silhouette centre
      ctx.globalAlpha=fade*0.92;
      ctx.fillStyle='#0d0000';
      // Left pillar
      ctx.fillRect(W/2-195,H-320,26,290);
      // Right pillar
      ctx.fillRect(W/2+169,H-320,26,290);
      // Top two beams
      ctx.fillRect(W/2-235,H-342,470,30);
      ctx.fillRect(W/2-215,H-372,430,24);
      // Crosspiece curve caps (ornament nubs)
      ctx.fillRect(W/2-255,H-342,22,18);ctx.fillRect(W/2+213,H-342,22,18);
      ctx.fillRect(W/2-233,H-372,18,14);ctx.fillRect(W/2+215,H-372,18,14);

      // Torii red paint
      ctx.fillStyle='#3a0000';
      ctx.fillRect(W/2-195,H-320,26,290);ctx.fillRect(W/2+169,H-320,26,290);
      ctx.fillRect(W/2-235,H-342,470,6);ctx.fillRect(W/2-215,H-372,430,5);

      // Sakura petals falling (crimson)
      ctx.globalAlpha=fade*0.6;
      for(let i=0;i<18;i++){
        const px=(i*137+t2*38+i*23)%W;
        const py=(t2*55+i*88)%FLOOR;
        const pr=3+Math.sin(i*1.7)*2;
        ctx.fillStyle=`hsl(${350+i*2},80%,${35+i*3}%)`;
        ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.fill();
      }

      // Ground energy cracks glowing red
      ctx.globalAlpha=fade*(0.4+0.15*Math.sin(t2*4));
      ctx.strokeStyle='#ff0011';ctx.lineWidth=1.5;ctx.shadowColor='#ff0011';ctx.shadowBlur=8;
      for(let i=0;i<6;i++){
        const cx2=80+i*200,seed=i*3.7;
        ctx.beginPath();ctx.moveTo(cx2,FLOOR);
        for(let j=0;j<5;j++)ctx.lineTo(cx2+(Math.cos(seed+j)*38),FLOOR-18-j*18);
        ctx.stroke();
      }
      ctx.shadowBlur=0;

      // Floating cursed energy orbs (dark red)
      ctx.globalAlpha=fade*(0.35+0.2*Math.sin(t2*3.5));
      for(let i=0;i<5;i++){
        const ox=W*0.12+i*W*0.19+Math.sin(t2*0.8+i)*55;
        const oy=120+Math.cos(t2*0.55+i*1.4)*50;
        const og=ctx.createRadialGradient(ox,oy,0,ox,oy,28);
        og.addColorStop(0,'#ff3300');og.addColorStop(0.5,'#880000');og.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=og;ctx.fillRect(ox-30,oy-30,60,60);
      }

      // Darkness vignette
      ctx.globalAlpha=fade*0.55;
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.2,W/2,H/2,W*0.85);
      vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,0.92)');
      ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);

      ctx.globalAlpha=1;ctx.restore();
      return;
    }

    // TIME CELL MOON PALACE — Naoya Zenin's projection domain
    if(e.type==='domainBg'&&e.owner&&e.owner.charName==='Projection Sorcery'){
      ctx.save();
      const t2=Date.now()*0.001;
      const fade=Math.min(1,(7500-e.t)/600);
      ctx.globalAlpha=fade;

      // Cold midnight blue sky
      const sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,'#00010d');sky.addColorStop(0.55,'#000818');sky.addColorStop(1,'#000205');
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

      // Moon — large and pale
      ctx.globalAlpha=fade*0.55;
      const mg=ctx.createRadialGradient(W*0.72,75,0,W*0.72,75,115);
      mg.addColorStop(0,'#ddeeff');mg.addColorStop(0.4,'#7799cc');mg.addColorStop(0.8,'#223366');mg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=mg;ctx.fillRect(W*0.72-120,0,240,230);
      // Moon craters
      ctx.globalAlpha=fade*0.2;ctx.fillStyle='#667799';
      [[W*0.72-25,55,14],[W*0.72+32,82,9],[W*0.72-8,102,7]].forEach(([mx,my,mr])=>{ctx.beginPath();ctx.arc(mx,my,mr,0,Math.PI*2);ctx.fill();});

      // Projection grid — converging vanishing-point lines
      ctx.globalAlpha=fade*(0.22+0.06*Math.sin(t2*1.8));
      ctx.strokeStyle='#2244bb';ctx.lineWidth=0.9;
      const vp={x:W/2,y:FLOOR*0.38};
      // Horizontal rails
      for(let j=0;j<10;j++){
        const gy=vp.y+j*((FLOOR-vp.y)/9);
        ctx.globalAlpha=fade*(0.08+0.14*(j/9));
        ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();
      }
      // Radial convergence spokes
      ctx.globalAlpha=fade*(0.14+0.05*Math.sin(t2*2));
      for(let k=-8;k<=8;k++){
        const ex=k*(W/8);
        ctx.beginPath();ctx.moveTo(vp.x,vp.y);ctx.lineTo(vp.x+ex,FLOOR+20);ctx.stroke();
      }

      // Palace architecture silhouette (Naoya's Moon Palace)
      ctx.globalAlpha=fade*0.82;
      ctx.fillStyle='#060814';
      // Main structure
      ctx.fillRect(W/2-280,H-220,560,185);
      // Roof tiers
      ctx.beginPath();ctx.moveTo(W/2-300,H-220);ctx.lineTo(W/2,H-390);ctx.lineTo(W/2+300,H-220);ctx.closePath();ctx.fill();
      ctx.fillStyle='#090d1f';
      ctx.beginPath();ctx.moveTo(W/2-200,H-280);ctx.lineTo(W/2,H-430);ctx.lineTo(W/2+200,H-280);ctx.closePath();ctx.fill();
      // Spire
      ctx.fillRect(W/2-10,H-430,20,120);ctx.beginPath();ctx.moveTo(W/2-18,H-430);ctx.lineTo(W/2,H-490);ctx.lineTo(W/2+18,H-430);ctx.closePath();ctx.fill();
      // Window lights
      ctx.fillStyle='#aabbff';ctx.globalAlpha=fade*(0.3+0.2*Math.sin(t2*2.5));
      [[W/2-180,H-180,22,28],[W/2-90,H-180,22,28],[W/2+68,H-180,22,28],[W/2+158,H-180,22,28],[W/2-30,H-280,24,32]].forEach(([wx,wy,ww,wh])=>ctx.fillRect(wx,wy,ww,wh));

      // Animated clock ring (24-frame projection technique)
      ctx.globalAlpha=fade*(0.45+0.15*Math.sin(t2*3));
      const col=e.owner.color;
      ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=12;
      for(let ri=0;ri<3;ri++){
        ctx.lineWidth=ri===0?1.8:0.9;ctx.globalAlpha=fade*(0.45-ri*0.12);
        ctx.beginPath();ctx.arc(W/2,H*0.28,52+ri*32,0,Math.PI*2);ctx.stroke();
      }
      // 24 tick marks around outer ring
      ctx.lineWidth=1.4;ctx.globalAlpha=fade*0.6;
      for(let m=0;m<24;m++){
        const ma=m/24*Math.PI*2+t2*0.08,isMaj=m%6===0;
        const r1=isMaj?96:112,r2=116;
        ctx.beginPath();
        ctx.moveTo(W/2+Math.cos(ma)*r1,H*0.28+Math.sin(ma)*r1);
        ctx.lineTo(W/2+Math.cos(ma)*r2,H*0.28+Math.sin(ma)*r2);
        ctx.stroke();
      }
      // Rotating hands
      ctx.lineWidth=2.5;ctx.globalAlpha=fade*0.9;
      ctx.beginPath();ctx.moveTo(W/2,H*0.28);ctx.lineTo(W/2+Math.cos(t2*0.4)*40,H*0.28+Math.sin(t2*0.4)*40);ctx.stroke();
      ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(W/2,H*0.28);ctx.lineTo(W/2+Math.cos(t2*1.8)*28,H*0.28+Math.sin(t2*1.8)*28);ctx.stroke();
      ctx.shadowBlur=0;

      // Stars
      ctx.globalAlpha=fade*0.5;ctx.fillStyle='#aabbdd';
      for(let s=0;s<35;s++){
        const sx=((s*197+73)%W),sy=((s*83+41)%(FLOOR*0.5));
        const ss=0.8+Math.sin(t2*2+s)*0.6;
        ctx.beginPath();ctx.arc(sx,sy,ss,0,Math.PI*2);ctx.fill();
      }

      // Cool blue vignette
      ctx.globalAlpha=fade*0.4;
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.25,W/2,H/2,W*0.8);
      vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,16,0.88)');
      ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);

      ctx.globalAlpha=1;ctx.restore();
      return;
    }

    if(e.type==='infiniteVoidBg'){ctx.save();const a=Math.max(0,e.t/5500),t2=Date.now()*0.001;ctx.globalAlpha=Math.min(0.82,a*0.9+0.06*Math.sin(t2*18));const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W);g.addColorStop(0,'#ffffff');g.addColorStop(0.4,'#cc99ff');g.addColorStop(1,'#110022');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.globalAlpha=0.35+0.2*Math.sin(t2*12);ctx.strokeStyle='#fff';ctx.lineWidth=0.8;for(let i=0;i<60;i++){const lx=(i*24+t2*55)%W,len=40+Math.random()*120,ly=(Date.now()*0.3+i*77)%H;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+(Math.random()-.5)*8,ly+len);ctx.stroke();}ctx.globalAlpha=0.25+0.15*Math.sin(t2*8);ctx.strokeStyle='#aa88ff';ctx.lineWidth=1;for(let i=1;i<9;i++){ctx.beginPath();ctx.arc(W/2,H/2,i*90+(t2*20)%90,0,Math.PI*2);ctx.stroke();}ctx.restore();}
    // BLACK HOLE active visual (the orb when activated)
    if(e.type==='blackHoleOrb'&&e.active){
      ctx.save();
      const t2=Date.now()*0.001;
      const a=Math.min(1,(14000-e.t+600)/900);
      const fade=e.t<1200?e.t/1200:1;
      const col2=e.owner?e.owner.color:'#ff44cc';
      // Dark void overlay pulled toward singularity
      ctx.globalAlpha=a*0.58*fade;
      const bg=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,W);
      bg.addColorStop(0,'#000000');bg.addColorStop(0.3,'#0a001a');bg.addColorStop(1,'rgba(0,0,6,0.4)');
      ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
      // WIND STREAKS — 80 streaks converging toward singularity from all angles
      for(let i=0;i<80;i++){
        const seed=i*137.508;
        const angle=seed%628/100+t2*0.9+i*0.04;
        const startR=250+Math.sin(seed)*160;
        const sx=e.x+Math.cos(angle)*startR,sy=e.y+Math.sin(angle)*startR;
        const endR=Math.max(58,(startR-200-Math.sin(t2*2+i)*40));
        const ex2=e.x+Math.cos(angle)*endR,ey2=e.y+Math.sin(angle)*endR;
        const wAlpha=(0.08+0.22*Math.sin(t2*4+i*0.5))*fade*a;
        ctx.globalAlpha=Math.max(0,wAlpha);
        ctx.strokeStyle=i%6===0?'#ffffff':(i%3===0?'#ffaaff':col2);
        ctx.lineWidth=0.5+Math.sin(i*0.7+t2)*0.6;
        ctx.shadowColor=col2;ctx.shadowBlur=i%10===0?5:2;
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex2,ey2);ctx.stroke();
      }
      // Accretion disc — 5 spinning rings
      for(let i=0;i<5;i++){
        const r=70+i*48+Math.sin(t2*2.5+i)*14;
        ctx.globalAlpha=a*(0.55-i*0.09)*fade;
        ctx.strokeStyle=i%2===0?col2:'#ffffff';
        ctx.lineWidth=3.5-i*0.5;ctx.shadowColor=col2;ctx.shadowBlur=22;
        ctx.beginPath();ctx.arc(e.x,e.y,r,0,Math.PI*2);ctx.stroke();
      }
      // Spinning matter jets
      ctx.globalAlpha=a*0.8*fade;
      for(let i=0;i<24;i++){
        const ang=i/24*Math.PI*2+t2*5;
        const r=52+Math.sin(t2*12+i)*20;
        ctx.strokeStyle=i%5===0?'#fff':(i%3===0?'#ffaaff':col2);
        ctx.lineWidth=2.2;ctx.shadowColor=col2;ctx.shadowBlur=8;
        ctx.beginPath();
        ctx.moveTo(e.x+Math.cos(ang)*r,e.y+Math.sin(ang)*r);
        ctx.lineTo(e.x+Math.cos(ang+0.35)*(r+32),e.y+Math.sin(ang+0.35)*(r+32));
        ctx.stroke();
      }
      // Pull force arrows from each player toward BH
      if(p1&&p2){
        [p1,p2].forEach(pl=>{
          const dx=e.x-pl.cx,dy=e.y-pl.cy,d=Math.sqrt(dx*dx+dy*dy)+1;
          if(d<500){
            const pA=Math.min(0.75,a*(1-d/500)*0.9*fade);
            ctx.globalAlpha=pA;
            ctx.strokeStyle=col2;ctx.lineWidth=2;ctx.shadowColor=col2;ctx.shadowBlur=10;
            for(let s=0.15;s<0.85;s+=0.22){
              const ax2=pl.cx+dx*s,ay2=pl.cy+dy*s;
              const aang=Math.atan2(dy,dx);const alen=14+s*22;
              ctx.beginPath();
              ctx.moveTo(ax2-Math.cos(aang)*alen*0.5,ay2-Math.sin(aang)*alen*0.5);
              ctx.lineTo(ax2+Math.cos(aang)*alen*0.5,ay2+Math.sin(aang)*alen*0.5);
              ctx.stroke();
            }
          }
        });
      }
      // Event horizon
      ctx.shadowBlur=0;ctx.globalAlpha=fade;
      const voidR=52+Math.sin(t2*15)*4;
      const vg=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,voidR+10);
      vg.addColorStop(0,'#000000');vg.addColorStop(0.78,'#000000');vg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=vg;ctx.beginPath();ctx.arc(e.x,e.y,voidR+10,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=col2;ctx.lineWidth=4;ctx.shadowColor=col2;ctx.shadowBlur=38;
      ctx.beginPath();ctx.arc(e.x,e.y,voidR,0,Math.PI*2);ctx.stroke();
      // Damage radius dashed ring
      ctx.globalAlpha=a*(0.3+0.13*Math.sin(t2*8))*fade;
      ctx.strokeStyle=col2;ctx.lineWidth=1.5;ctx.setLineDash([10,7]);ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(e.x,e.y,180,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.restore();
    }
  });

  effects.forEach(e=>{
    ctx.save();
    switch(e.type){
      case'afterimage':{ctx.globalAlpha=Math.max(0,(e.t/550)*(e.a||1));ctx.fillStyle=e.color;ctx.shadowColor=e.color;ctx.shadowBlur=10;ctx.fillRect(e.x+8,e.y+PH*0.57,PW*0.35,PH*0.43);ctx.fillRect(e.x+PW*0.58,e.y+PH*0.57,PW*0.35,PH*0.43);ctx.fillRect(e.x+5,e.y+PH*0.2,PW-10,PH*0.38);ctx.fillRect(e.x+11,e.y,PW-22,PH*0.21);break;}
      case'speedTrail':{const a=Math.max(0,e.t/350);ctx.globalAlpha=a*0.7;ctx.strokeStyle=e.color;ctx.lineWidth=4;ctx.shadowColor=e.color;ctx.shadowBlur=8;ctx.setLineDash([18,10]);ctx.beginPath();ctx.moveTo(e.x1,e.y-10);ctx.lineTo(e.x2,e.y-10);ctx.stroke();ctx.beginPath();ctx.moveTo(e.x1,e.y+10);ctx.lineTo(e.x2,e.y+10);ctx.stroke();ctx.setLineDash([]);break;}
      case'staticRushTrail':{const a=Math.max(0,e.t/500);ctx.globalAlpha=a*0.8;for(let i=0;i<8;i++){const xx=e.x1+(e.x2-e.x1)*(i/7);ctx.strokeStyle=`hsl(${190+i*8},100%,${55+i*4}%)`;ctx.lineWidth=3;ctx.shadowColor=e.color;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(xx,e.y-25);ctx.lineTo(xx+(Math.random()-.5)*22,e.y+55);ctx.stroke();}break;}
      case'flashBurst':{const a=Math.max(0,e.t/300);ctx.globalAlpha=a*0.85;const g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,100*(1-a)+10);g.addColorStop(0,'#ffffff');g.addColorStop(0.3,e.color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(e.x-120,e.y-120,240,240);break;}
      case'bolt':{if(e.trail&&e.trail.length>1){for(let i=1;i<e.trail.length;i++){const ta=i/e.trail.length;ctx.globalAlpha=ta*0.6;ctx.strokeStyle=e.glow||e.color;ctx.lineWidth=e.h*ta;ctx.shadowColor=e.color;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(e.trail[i-1].x,e.trail[i-1].y);ctx.lineTo(e.trail[i].x,e.trail[i].y);ctx.stroke();}}ctx.globalAlpha=1;ctx.fillStyle=e.color;ctx.shadowColor=e.color;ctx.shadowBlur=15;ctx.beginPath();ctx.ellipse(e.x,e.y,e.w/2,e.h/2,Math.atan2(e.vy,e.vx),0,Math.PI*2);ctx.fill();break;}
      case'redOrb':{if(e.trail&&e.trail.length>1){for(let i=1;i<e.trail.length;i++){const ta=i/e.trail.length;ctx.globalAlpha=ta*0.55;ctx.fillStyle=`hsl(${20-ta*20},100%,${40+ta*30}%)`;ctx.beginPath();ctx.arc(e.trail[i].x,e.trail[i].y,22*ta,0,Math.PI*2);ctx.fill();}}ctx.globalAlpha=1;const rg=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,32);rg.addColorStop(0,'#fff');rg.addColorStop(0.3,'#ff8800');rg.addColorStop(0.7,'#ff2200');rg.addColorStop(1,'#880000');ctx.fillStyle=rg;ctx.shadowColor='#ff4400';ctx.shadowBlur=30;ctx.beginPath();ctx.arc(e.x,e.y,32,0,Math.PI*2);ctx.fill();const t2=Date.now()*0.012;for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t2;ctx.fillStyle='#ffaa00';ctx.globalAlpha=0.8;ctx.beginPath();ctx.arc(e.x+Math.cos(a)*40,e.y+Math.sin(a)*25,5,0,Math.PI*2);ctx.fill();}break;}
      case'redExplosion':{const a=Math.max(0,Math.min(1,e.t/600));ctx.globalAlpha=a;for(let i=0;i<4;i++){const r=Math.max(0.5,(1-a)*(120+i*40));ctx.strokeStyle=`hsl(${20+i*15},100%,${50+i*10}%)`;ctx.lineWidth=5-i;ctx.shadowColor='#ff4400';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(e.x,e.y,r,0,Math.PI*2);ctx.stroke();}break;}
      case'hollowPurple':{const t2=Date.now()*0.004;const rg2=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,75);rg2.addColorStop(0,'#ffffff');rg2.addColorStop(0.2,'#cc88ff');rg2.addColorStop(0.55,'#7722dd');rg2.addColorStop(0.8,'#4400aa');rg2.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=0.95;ctx.fillStyle=rg2;ctx.shadowColor='#aa44ff';ctx.shadowBlur=50;ctx.beginPath();ctx.arc(e.x,e.y,75,0,Math.PI*2);ctx.fill();for(let i=0;i<3;i++){ctx.globalAlpha=0.4-i*0.1;ctx.strokeStyle=['#ff3300','#0033ff','#aa44ff'][i];ctx.lineWidth=4-i;ctx.beginPath();ctx.arc(e.x,e.y,75+(i+1)*22+Math.sin(t2+i)*8,0,Math.PI*2);ctx.stroke();}break;}
      case'hollowImpact':{const a=Math.max(0,Math.min(1,e.t/900));ctx.globalAlpha=a;for(let i=0;i<5;i++){ctx.strokeStyle=['#fff','#cc88ff','#aa44ff','#7700ff','#440088'][i];ctx.lineWidth=8-i*1.5;ctx.shadowColor='#aa44ff';ctx.shadowBlur=25;ctx.beginPath();ctx.arc(e.x,e.y,Math.max(0.5,(1-a)*(200+i*55)+15),0,Math.PI*2);ctx.stroke();}break;}
      case'blueVortex':{const a=Math.max(0,e.t/1200),t2=Date.now()*0.008;ctx.globalAlpha=a*0.85;for(let i=0;i<5;i++){const r=30+i*25;ctx.strokeStyle=`hsl(${200+i*12},100%,${50+i*6}%)`;ctx.lineWidth=3-i*0.4;ctx.shadowColor='#0088ff';ctx.shadowBlur=12;ctx.beginPath();for(let s=0;s<Math.PI*4;s+=0.1){const pr=r*(s/(Math.PI*4));ctx.lineTo(e.x+Math.cos(s+t2*3+i)*pr,e.y+Math.sin(s+t2*3+i)*pr);}ctx.stroke();}break;}
      case'voltageCage':{const t2=Date.now()*0.006;ctx.globalAlpha=0.75+0.2*Math.sin(t2*5);ctx.strokeStyle='#00aaff';ctx.lineWidth=2;ctx.shadowColor='#00aaff';ctx.shadowBlur=15;ctx.strokeRect(e.x,e.y,e.w,e.h);for(let i=0;i<6;i++){const px=e.x+(i/5)*e.w,amp=6+Math.sin(t2*4+i)*4;ctx.beginPath();ctx.moveTo(px,e.y);ctx.lineTo(px+(Math.random()-.5)*8,e.y-amp);ctx.stroke();}ctx.globalAlpha=0.2;ctx.fillStyle='#00aaff';ctx.fillRect(e.x,e.y,e.w,e.h);break;}
      case'chargeAura':{if(!e.owner||e.owner.chargeTimer<=0)break;const t2=Date.now()*0.008,a=0.5+0.25*Math.sin(t2*6);ctx.globalAlpha=a;ctx.strokeStyle=e.owner.chargeOwnerColor;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.strokeRect(e.owner.x-6,e.owner.y-6,PW+12,PH+12);ctx.setLineDash([]);break;}
      case'amberTransform':{if(!e.owner)break;const a=Math.max(0,e.t/800);ctx.globalAlpha=a*0.8;const g=ctx.createRadialGradient(e.owner.cx,e.owner.cy,0,e.owner.cx,e.owner.cy,120*(1-a)+10);g.addColorStop(0,'#ffffff');g.addColorStop(0.3,'#aa44ff');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);break;}
      case'godslayer':{const a=Math.max(0,e.t/700),lw=80*(0.5+a*0.5);ctx.globalAlpha=a*0.7;const g=ctx.createLinearGradient(e.x,0,e.x,FLOOR);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(0.3,'#aa44ff');g.addColorStop(0.7,'#ffffff');g.addColorStop(1,'#aa44ff');ctx.fillStyle=g;ctx.fillRect(e.x-lw/2,0,lw,FLOOR);ctx.globalAlpha=a;ctx.strokeStyle='#ffffff';ctx.lineWidth=4;ctx.shadowColor='#cc44ff';ctx.shadowBlur=20;ctx.beginPath();let gx=e.x;ctx.moveTo(gx,0);for(let gy=0;gy<FLOOR;gy+=30){gx=e.x+(Math.random()-.5)*40;ctx.lineTo(gx,gy);}ctx.lineTo(e.x,FLOOR);ctx.stroke();break;}
      case'amberDischarge':{const a=Math.max(0,Math.min(1,e.t/700));for(let i=0;i<5;i++){ctx.globalAlpha=a*(0.8-i*0.12);ctx.strokeStyle=i%2===0?'#aa44ff':'#ffaa00';ctx.lineWidth=6-i;ctx.shadowColor='#aa44ff';ctx.shadowBlur=25;ctx.beginPath();ctx.arc(e.x,e.y,Math.max(0.5,(1-a)*(150+i*40)+15),0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=a;for(let i=0;i<8;i++){const ang=i/8*Math.PI*2,r=Math.max(0.5,(1-a)*180+20);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(ang)*r,e.y+Math.sin(ang)*r);ctx.stroke();}break;}
      case'crossSlash':{const a=Math.max(0,e.t/1600);ctx.globalAlpha=a;ctx.strokeStyle=e.color;ctx.lineWidth=5;ctx.shadowColor=e.color;ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(e.x-e.sz,e.y-e.sz);ctx.lineTo(e.x+e.sz,e.y+e.sz);ctx.stroke();ctx.beginPath();ctx.moveTo(e.x+e.sz,e.y-e.sz);ctx.lineTo(e.x-e.sz,e.y+e.sz);ctx.stroke();break;}
      case'crossImpact':{const a=Math.max(0,e.t/450);for(let i=0;i<8;i++){const ang=i*Math.PI/4,len=(1-a)*70+10;ctx.globalAlpha=a;ctx.strokeStyle=e.color;ctx.lineWidth=4;ctx.shadowColor=e.color;ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(ang)*len,e.y+Math.sin(ang)*len);ctx.stroke();}break;}
      case'arcSlash':{const a=Math.max(0,e.t/450);ctx.globalAlpha=a;ctx.strokeStyle=e.color;ctx.lineWidth=7;ctx.shadowColor=e.color;ctx.shadowBlur=22;const sa=e.facing>0?-Math.PI*0.85:Math.PI*0.15,ea=e.facing>0?Math.PI*0.15:Math.PI*0.85+Math.PI;ctx.beginPath();ctx.arc(e.x,e.y,e.rad*(0.4+0.6*(1-a)),sa,ea);ctx.stroke();ctx.lineWidth=3;ctx.globalAlpha=a*0.45;ctx.beginPath();ctx.arc(e.x,e.y,e.rad*0.65*(0.4+0.6*(1-a)),sa,ea);ctx.stroke();break;}
      case'slashMark':{const a=Math.max(0,e.t/700);ctx.globalAlpha=a;ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.shadowColor=e.color;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(e.x-22,e.y-22);ctx.lineTo(e.x+22,e.y+22);ctx.stroke();ctx.beginPath();ctx.moveTo(e.x+16,e.y-12);ctx.lineTo(e.x-16,e.y+12);ctx.stroke();break;}
      case'slashLine':{const a=Math.max(0,e.t/280);ctx.globalAlpha=a;ctx.strokeStyle=e.color;ctx.lineWidth=5;ctx.shadowColor=e.color;ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(e.x1,e.y1);ctx.lineTo(e.x2,e.y2);ctx.stroke();break;}
      case'slashVortex':{if(!e.owner)break;const t2=Date.now()*0.001,a=Math.max(0,e.t/1100);for(let ring=0;ring<3;ring++){const rr=70+ring*40,spd=t2*(2.5+ring*1.2);for(let s=0;s<6;s++){const ang=s/6*Math.PI*2+spd,sx=e.owner.cx+Math.cos(ang)*rr,sy=e.owner.cy+Math.sin(ang)*rr,ex2=e.owner.cx+Math.cos(ang+0.4)*(rr+30),ey2=e.owner.cy+Math.sin(ang+0.4)*(rr+30);ctx.globalAlpha=a*(0.7-ring*0.15);ctx.strokeStyle=ring===0?e.owner.color:(ring===1?'#ff8888':'#ffcccc');ctx.lineWidth=4-ring;ctx.shadowColor=e.owner.color;ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex2,ey2);ctx.stroke();}}ctx.globalAlpha=a*0.6;ctx.strokeStyle=e.owner.color;ctx.lineWidth=3;ctx.shadowColor=e.owner.color;ctx.shadowBlur=20;ctx.beginPath();ctx.arc(e.owner.cx,e.owner.cy,60+Math.sin(t2*8)*10,0,Math.PI*2);ctx.stroke();break;}
      case'shrineSlashStorm':{
        if(!e.owner)break;
        const t2=Date.now()*0.001,a=Math.min(1,Math.max(0,e.t/5000));
        const opp2=e.owner===p1?p2:p1;
        const tx=opp2?opp2.cx:W/2,ty=opp2?opp2.cy:H/2;
        // Massive diagonal slashes flying across entire screen
        const numSlash=6;
        for(let i=0;i<numSlash;i++){
          const phase=t2*3.8+i*(Math.PI*2/numSlash);
          const angBase=(i%2===0?-Math.PI/4:Math.PI/4)+(Math.sin(phase)*0.25);
          const cx2=tx+(Math.cos(phase)*220),cy2=ty+(Math.sin(phase*0.7)*140);
          const len=120+Math.sin(phase*1.3+i)*60;
          const alpha=a*(0.4+0.3*Math.sin(phase));
          ctx.globalAlpha=Math.max(0,alpha);
          ctx.strokeStyle=i%3===0?e.owner.color:(i%3===1?e.owner.def.accent:'#ff2200');
          ctx.lineWidth=3+Math.sin(phase)*1.5;
          ctx.shadowColor=e.owner.color;ctx.shadowBlur=18;
          ctx.beginPath();
          ctx.moveTo(cx2-Math.cos(angBase)*len,cy2-Math.sin(angBase)*len);
          ctx.lineTo(cx2+Math.cos(angBase)*len,cy2+Math.sin(angBase)*len);
          ctx.stroke();
        }
        // Large X slashes on target every so often
        if(opp2){
          const xSlashPhase=t2*5;
          const xA=Math.max(0,(Math.sin(xSlashPhase)+1)*0.5*a*0.85);
          const xLen=80+Math.sin(xSlashPhase*0.7)*30;
          ctx.globalAlpha=xA;
          ctx.strokeStyle=e.owner.color;ctx.lineWidth=5;ctx.shadowColor='#ff0000';ctx.shadowBlur=22;
          ctx.beginPath();ctx.moveTo(tx-xLen,ty-xLen);ctx.lineTo(tx+xLen,ty+xLen);ctx.stroke();
          ctx.beginPath();ctx.moveTo(tx+xLen,ty-xLen);ctx.lineTo(tx-xLen,ty+xLen);ctx.stroke();
          // Vertical + horizontal
          ctx.globalAlpha=xA*0.6;ctx.strokeStyle='#ff4422';ctx.lineWidth=3;
          ctx.beginPath();ctx.moveTo(tx,ty-xLen*1.2);ctx.lineTo(tx,ty+xLen*1.2);ctx.stroke();
          ctx.beginPath();ctx.moveTo(tx-xLen*1.2,ty);ctx.lineTo(tx+xLen*1.2,ty);ctx.stroke();
        }
        // Full-screen diagonal sweep lines
        ctx.globalAlpha=a*0.09;
        ctx.strokeStyle='#cc1100';ctx.lineWidth=1;
        for(let i=0;i<8;i++){
          const sweep=(t2*90+i*160)%1400-200;
          ctx.beginPath();ctx.moveTo(sweep,0);ctx.lineTo(sweep+H,H);ctx.stroke();
          ctx.beginPath();ctx.moveTo(W-sweep,0);ctx.lineTo(W-sweep-H,H);ctx.stroke();
        }
        ctx.globalAlpha=1;ctx.shadowBlur=0;
        break;}
      case'burstRing':{const raw=e.t/400,a=Math.max(0,Math.min(1,raw));ctx.globalAlpha=a;ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.shadowColor=e.color;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(e.x,e.y,Math.max(0.5,(1-a)*e.r+5),0,Math.PI*2);ctx.stroke();break;}
      case'ironBall':{
        const t2=Date.now()*0.005;
        const ig=ctx.createRadialGradient(e.x-e.r*0.3,e.y-e.r*0.3,0,e.x,e.y,e.r);
        ig.addColorStop(0,'#cccccc');ig.addColorStop(0.4,'#777777');ig.addColorStop(0.8,'#333333');ig.addColorStop(1,'#111111');
        ctx.fillStyle=ig;ctx.shadowColor=e.jp?'#ffcc00':'#888888';ctx.shadowBlur=e.jp?28:15;
        ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill();
        // Outer energy ring — gold if jackpot
        ctx.strokeStyle=e.jp?'#ffcc00':(e.owner?e.owner.color:'#44ff88');ctx.lineWidth=e.jp?3.5:2;
        ctx.shadowColor=e.jp?'#ffcc00':(e.owner?e.owner.color:'#44ff88');ctx.shadowBlur=e.jp?30:18;
        ctx.beginPath();ctx.arc(e.x,e.y,e.r+5+Math.sin(t2*8)*3,0,Math.PI*2);ctx.stroke();
        if(e.jp){
          ctx.lineWidth=1.5;ctx.globalAlpha=0.5+0.3*Math.sin(t2*12);
          ctx.beginPath();ctx.arc(e.x,e.y,e.r+14+Math.sin(t2*6)*4,0,Math.PI*2);ctx.stroke();
          ctx.globalAlpha=1;
        }
        // Specular highlight
        ctx.fillStyle='rgba(255,255,255,0.4)';ctx.shadowBlur=0;
        ctx.beginPath();ctx.ellipse(e.x-e.r*0.3,e.y-e.r*0.3,e.r*0.25,e.r*0.16,Math.PI*-0.3,0,Math.PI*2);ctx.fill();
        break;}
      case'cursedDoor':{
        const t2=Date.now()*0.001;
        const dcol=e.dcol||'#44ff88';
        const a2=Math.min(1,(5000-Math.max(0,e.t-300))/400);
        ctx.globalAlpha=a2*0.92;
        // Door frame fill
        ctx.fillStyle='#080d0a';ctx.fillRect(e.x,e.y,e.w,e.h);
        // Frame outline — thicker/gold if jackpot
        ctx.strokeStyle=e.jp?'#ffcc00':dcol;ctx.lineWidth=e.jp?5:4;ctx.shadowColor=e.jp?'#ffcc00':dcol;ctx.shadowBlur=e.jp?25:16;
        ctx.strokeRect(e.x,e.y,e.w,e.h);
        // Door panel cross lines
        ctx.lineWidth=1.5;ctx.globalAlpha=a2*0.4;
        ctx.beginPath();ctx.moveTo(e.x,e.y+e.h*0.5);ctx.lineTo(e.x+e.w,e.y+e.h*0.5);ctx.stroke();
        ctx.beginPath();ctx.moveTo(e.x+e.w*0.5,e.y);ctx.lineTo(e.x+e.w*0.5,e.y+e.h);ctx.stroke();
        // Doorknob
        ctx.globalAlpha=a2*0.9;ctx.fillStyle=e.jp?'#ffcc00':dcol;ctx.shadowColor=e.jp?'#ffcc00':dcol;ctx.shadowBlur=8;
        ctx.beginPath();ctx.arc(e.x+e.w*0.8,e.y+e.h*0.5,7,0,Math.PI*2);ctx.fill();
        // Cursed energy seeping from sides
        ctx.globalAlpha=a2*(0.3+0.2*Math.sin(t2*6));ctx.strokeStyle=dcol;ctx.lineWidth=2;
        for(let i=0;i<5;i++){const sy=e.y+e.h*(0.1+i*0.18);ctx.beginPath();ctx.moveTo(e.x,sy);ctx.lineTo(e.x-10-Math.sin(t2*4+i)*8,sy);ctx.stroke();ctx.beginPath();ctx.moveTo(e.x+e.w,sy);ctx.lineTo(e.x+e.w+10+Math.sin(t2*3+i)*8,sy);ctx.stroke();}
        // Trap flash overlay
        if(e.trapped&&e.trapTimer>0){ctx.globalAlpha=0.3*Math.abs(Math.sin(Date.now()*0.02));ctx.fillStyle=e.jp?'#ffcc00':dcol;ctx.fillRect(e.x,e.y,e.w,e.h);}
        ctx.shadowBlur=0;ctx.globalAlpha=1;
        break;}
      case'jackpotWin':{
        const a=Math.max(0,Math.min(1,e.t/2000));
        ctx.globalAlpha=a*0.7;
        for(let i=0;i<12;i++){const ang=i/12*Math.PI*2,r=Math.max(1,(1-a)*160+20);ctx.strokeStyle=i%2===0?'#ffcc00':'#44ff88';ctx.lineWidth=Math.max(0.5,4-a*2);ctx.shadowColor='#ffcc00';ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(ang)*r,e.y+Math.sin(ang)*r);ctx.stroke();}
        [0.5,0.7,0.9].forEach((m,i)=>{ctx.globalAlpha=a*(0.6-i*0.15);ctx.strokeStyle='#ffcc00';ctx.lineWidth=Math.max(0.5,5-i);ctx.beginPath();ctx.arc(e.x,e.y,Math.max(1,(1-a)*(120+i*50)+10),0,Math.PI*2);ctx.stroke();});
        ctx.globalAlpha=1;ctx.shadowBlur=0;
        break;}
      case'crushRing':{const a=Math.max(0,Math.min(1,e.t/500));ctx.globalAlpha=a;for(let i=0;i<3;i++){ctx.strokeStyle=e.color;ctx.lineWidth=Math.max(0.5,5-i*1.5);ctx.shadowColor=e.color;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(e.x,e.y,Math.max(1,(1-a)*(80+i*30)+8),0,Math.PI*2);ctx.stroke();}break;}
      case'crushSpin':{if(!e.owner)break;const a=Math.max(0,e.t/400);ctx.globalAlpha=a*0.7;for(let i=0;i<4;i++){const ang=i*Math.PI/2+Date.now()*0.025;ctx.strokeStyle='#ffaa44';ctx.lineWidth=3;ctx.shadowColor='#ff8800';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(e.owner.cx+Math.cos(ang)*35,e.owner.cy+Math.sin(ang)*20,8,0,Math.PI*2);ctx.stroke();}break;}
      case'groundCrack':{const a=Math.max(0,e.t/1000);ctx.globalAlpha=a*0.8;ctx.strokeStyle=e.color;ctx.lineWidth=e.big?3:2;ctx.shadowColor=e.color;ctx.shadowBlur=8;const n=e.big?10:6;for(let i=0;i<n;i++){const ang=(i/n)*Math.PI+(Math.random()-.5)*0.4,len=(e.big?150:80)*(0.5+a*0.5);ctx.beginPath();let cx2=e.x,cy2=e.y;ctx.moveTo(cx2,cy2);for(let s=0;s<5;s++){cx2+=Math.cos(ang+(Math.random()-.5)*0.5)*len/5;cy2+=Math.sin(ang+(Math.random()-.5)*0.25)*len/10;ctx.lineTo(cx2,cy2);}ctx.stroke();}break;}
      case'seismicWave':{const a=Math.max(0,Math.min(1,e.t/750));ctx.globalAlpha=a;for(let i=0;i<3;i++){ctx.strokeStyle=['#ff8800','#ff4400','#ff0000'][i];ctx.lineWidth=5-i;ctx.shadowColor='#ff4400';ctx.shadowBlur=20;ctx.beginPath();ctx.ellipse(e.x,e.y,Math.max(0.5,(1-a)*(280+i*40)+15),Math.max(0.5,20+i*4),0,0,Math.PI*2);ctx.stroke();}break;}
      case'hexBarrier':{if(!e.owner)break;const a=0.55+0.3*Math.sin(Date.now()*0.012),t2=Date.now()*0.0015;ctx.globalAlpha=a;for(let i=0;i<7;i++){const ang=i*Math.PI/3.5+t2,hx=e.owner.cx+Math.cos(ang)*70,hy=e.owner.cy+Math.sin(ang)*70;ctx.strokeStyle=e.owner.def.accent;ctx.lineWidth=1.5;ctx.shadowColor=e.owner.def.accent;ctx.shadowBlur=12;ctx.beginPath();for(let j=0;j<7;j++){const ha=j*Math.PI/3,px=hx+Math.cos(ha)*17,py=hy+Math.sin(ha)*17;j===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();}break;}
      case'jumpTrail':{if(!e.owner)break;const a=Math.max(0,e.t/600)*0.4;ctx.globalAlpha=a;ctx.fillStyle=e.owner.color;ctx.fillRect(e.owner.x+5,e.owner.y+PH*0.2,PW-10,PH*0.38);break;}
      case'maxOutputAura':{if(!e.owner)break;const t2=Date.now()*0.001,p=0.3+0.25*Math.sin(t2*8);ctx.globalAlpha=p;ctx.strokeStyle=e.color||e.owner.def.glow;ctx.lineWidth=5;ctx.shadowColor=e.color||e.owner.def.glow;ctx.shadowBlur=28;ctx.strokeRect(e.owner.x-16,e.owner.y-16,PW+32,PH+32);for(let i=0;i<8;i++){const ang=i*Math.PI/4+t2*2,r1=48,r2=75+Math.sin(t2*5+i)*15;ctx.beginPath();ctx.moveTo(e.owner.cx+Math.cos(ang)*r1,e.owner.cy+Math.sin(ang)*r1);ctx.lineTo(e.owner.cx+Math.cos(ang)*r2,e.owner.cy+Math.sin(ang)*r2);ctx.stroke();}break;}
      case'screenFrost':{if(!e.owner||!e.owner.stagnationReady)break;const a=0.18+0.08*Math.sin(Date.now()*0.01);ctx.globalAlpha=a;const fg=ctx.createRadialGradient(W/2,H/2,H*0.15,W/2,H/2,H*0.85);fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(1,'#8899cc');ctx.fillStyle=fg;ctx.fillRect(0,0,W,H);break;}
      case'stagnationAura':{if(!e.owner||!e.owner.stagnationReady)break;const a=0.3+0.2*Math.sin(Date.now()*0.015);ctx.globalAlpha=a;ctx.strokeStyle='#aabbff';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(e.owner.x-8,e.owner.y-8,PW+16,PH+16);ctx.setLineDash([]);break;}
      case'clockSpiral':{const a=Math.max(0,e.t/900),col=e.color||'#ccddff';ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=2;ctx.shadowColor=col;ctx.shadowBlur=10;for(let i=0;i<3;i++){ctx.beginPath();for(let t2=0;t2<Math.PI*4;t2+=0.12){const r2=(t2/(Math.PI*4))*(90-i*22),ang=t2+i*2.1+(1-a)*6;const px=e.x+Math.cos(ang)*r2,py=e.y+Math.sin(ang)*r2;t2===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();}break;}
      case'timeStopSplash':{const a=Math.min(1,e.t/500);ctx.globalAlpha=a*0.4;ctx.fillStyle='#6688ff';ctx.fillRect(e.x-PW*0.5,e.y-PH*0.2,PW*2,PH*1.4);ctx.globalAlpha=a;ctx.strokeStyle='#ccddff';ctx.lineWidth=1.5;for(let i=0;i<10;i++){const ang=i*Math.PI/5+(1-a)*4,len=42*(1-a*0.3);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(ang)*len,e.y+Math.sin(ang)*len);ctx.stroke();}break;}
      case'blockSpark':{const a=Math.max(0,e.t/350);ctx.globalAlpha=a;ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let i=0;i<10;i++){const ang=i*Math.PI/5+Date.now()*0.012;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(ang)*30*(1-a),e.y+Math.sin(ang)*30*(1-a));ctx.stroke();}break;}
      case'screenFlash':{const a=Math.max(0,e.t/(e.dur||200))*(e.alpha||0.3);ctx.globalAlpha=a;ctx.fillStyle=e.color;ctx.fillRect(0,0,W,H);break;}
      case'bigText':{
        const a=Math.max(0,Math.min(1,e.t/700)),yo=(1-a)*-28;
        ctx.globalAlpha=a;
        // Dark pill background for readability
        ctx.font='bold 20px "Courier New"';ctx.textAlign='center';
        const tw=ctx.measureText(e.text).width;
        ctx.fillStyle=`rgba(0,0,0,${0.72*a})`;
        ctx.fillRect(e.x-tw/2-10,e.y+yo-17,tw+20,24);
        // Glow pass
        ctx.shadowColor=e.color;ctx.shadowBlur=18;
        txt(e.text,e.x,e.y+yo,20,e.color,'center',true);
        ctx.shadowBlur=0;
        break;}
      case'vowBanner':{
        if(!VOWS[e.vow])break;
        const v=VOWS[e.vow];
        const a=Math.max(0,Math.min(1,e.t/3200));
        const fadeOut=e.t<400?e.t/400:1;
        const bx=e.side==='left'?180:W-180,by=180;
        ctx.globalAlpha=fadeOut;
        // Banner background
        const bw=320,bh=72;
        ctx.fillStyle=`rgba(0,0,0,0.88)`;
        ctx.fillRect(bx-bw/2,by-bh/2,bw,bh);
        ctx.strokeStyle=v.color;ctx.lineWidth=2;ctx.shadowColor=v.color;ctx.shadowBlur=16;
        ctx.strokeRect(bx-bw/2,by-bh/2,bw,bh);
        // Top stripe
        const sg=ctx.createLinearGradient(bx-bw/2,0,bx+bw/2,0);
        sg.addColorStop(0,'rgba(0,0,0,0)');sg.addColorStop(0.5,v.color+'88');sg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=sg;ctx.fillRect(bx-bw/2,by-bh/2,bw,4);
        ctx.shadowBlur=0;
        // Text
        txt('BINDING VOW ACTIVE',bx,by-18,10,'#aaaaaa');
        ctx.shadowColor=v.color;ctx.shadowBlur=12;
        txt(v.icon+'  '+v.name,bx,by+4,16,v.color);ctx.shadowBlur=0;
        txt(v.desc.length>48?v.desc.slice(0,47)+'…':v.desc,bx,by+20,8,'#ccc',undefined,false);
        ctx.globalAlpha=1;ctx.shadowBlur=0;
        break;}
      case'domainText':{
        const a=Math.max(0,Math.min(1,e.t/3500));
        const sz1=Math.round(44+(1-a)*22),sz2=Math.round(28+(1-a)*12);
        // Dark overlay behind domain text
        ctx.globalAlpha=a*0.55;
        ctx.fillStyle='rgba(0,0,0,0.8)';
        ctx.fillRect(W/2-340,H/2-80,680,130);
        ctx.globalAlpha=a*0.95;
        ctx.shadowColor=e.color;ctx.shadowBlur=50;
        txt(e.text,W/2,H/2-44,sz1,e.color,'center',true);
        ctx.shadowBlur=0;
        txt(e.sub||'',W/2,H/2+6,sz2,'#ffffff','center',true);
        break;}
      case'dmgNum':{
        const a=Math.max(0,Math.min(1,e.t/1100)),yo=(1-a)*-72;
        const sz=e.val>28?30:22;
        ctx.globalAlpha=a;
        ctx.shadowColor=e.color;ctx.shadowBlur=14;
        txt('-'+e.val,e.x,e.y+yo,sz,e.color,'center',true);
        ctx.shadowBlur=0;
        break;}
      case'nail':{
        // Thin sharp nail with short trail
        if(e.trail&&e.trail.length>1){
          for(let i=1;i<e.trail.length;i++){
            const ta=i/e.trail.length;
            ctx.globalAlpha=ta*0.45;ctx.strokeStyle=e.color;ctx.lineWidth=2*ta;
            ctx.shadowColor=e.color;ctx.shadowBlur=6;
            ctx.beginPath();ctx.moveTo(e.trail[i-1].x,e.trail[i-1].y);ctx.lineTo(e.trail[i].x,e.trail[i].y);ctx.stroke();
          }
        }
        ctx.globalAlpha=1;ctx.shadowColor=e.color;ctx.shadowBlur=14;
        // Nail body — rotated in direction of travel
        const ang=Math.atan2(e.vy,e.vx);
        ctx.save();ctx.translate(e.x,e.y);ctx.rotate(ang);
        ctx.fillStyle=e.color;ctx.strokeStyle='#fff';ctx.lineWidth=1;
        ctx.fillRect(-14,-2.5,22,5);   // shaft
        ctx.beginPath();ctx.moveTo(8,-3);ctx.lineTo(14,0);ctx.lineTo(8,3);ctx.closePath();ctx.fill(); // tip
        ctx.fillStyle='#884400';ctx.fillRect(-14,-3,5,6); // head
        ctx.restore();
        ctx.shadowBlur=0;break;}
      case'massOrb':{
        if(e.trail&&e.trail.length>1){
          for(let i=1;i<e.trail.length;i++){
            const ta=i/e.trail.length;ctx.globalAlpha=ta*0.65;
            ctx.fillStyle=e.color;ctx.shadowColor=e.color;ctx.shadowBlur=10;
            ctx.beginPath();ctx.arc(e.trail[i].x,e.trail[i].y,e.r*ta*0.65,0,Math.PI*2);ctx.fill();
          }
        }
        const t2=Date.now()*0.004;ctx.globalAlpha=1;
        const mg=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r);
        mg.addColorStop(0,'#000000');mg.addColorStop(0.45,'#1a0014');mg.addColorStop(0.82,e.color);mg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=mg;ctx.shadowColor=e.color;ctx.shadowBlur=28;
        ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.shadowBlur=20;
        ctx.beginPath();ctx.arc(e.x,e.y,e.r+7+Math.sin(t2*9)*3,0,Math.PI*2);ctx.stroke();
        for(let i=0;i<8;i++){const ang=i/8*Math.PI*2+t2*4;ctx.globalAlpha=0.65;ctx.lineWidth=2;
          ctx.beginPath();ctx.moveTo(e.x+Math.cos(ang)*e.r,e.y+Math.sin(ang)*e.r);
          ctx.lineTo(e.x+Math.cos(ang)*(e.r+14),e.y+Math.sin(ang)*(e.r+14));ctx.stroke();}
        ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
      case'blackHoleOrb':{
        if(e.active)break; // active version rendered in bg pass
        const t2=Date.now()*0.003;
        const pulse=0.75+0.25*Math.sin(t2*14);
        const col2=e.owner?e.owner.color:'#ff44cc';
        ctx.globalAlpha=pulse;
        const vg2=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,24);
        vg2.addColorStop(0,'#000000');vg2.addColorStop(0.65,'#000000');vg2.addColorStop(1,col2);
        ctx.fillStyle=vg2;ctx.shadowColor=col2;ctx.shadowBlur=20;
        ctx.beginPath();ctx.arc(e.x,e.y,24,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=col2;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,28+Math.sin(t2*9)*3,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha=0.25*pulse;ctx.strokeStyle=col2;ctx.lineWidth=1.5;ctx.setLineDash([4,5]);
        ctx.beginPath();ctx.arc(e.x,e.y,90,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
        if(Math.sin(t2*7)>0.2){ctx.globalAlpha=Math.max(0,(Math.sin(t2*7)-0.2)*0.8);txt('▼ ACTIVATE',e.x,e.y-38,9,col2);}
        ctx.globalAlpha=1;ctx.shadowBlur=0;break;}
      case'massOrb':{
        // Draw trail
        if(e.trail&&e.trail.length>1){
          for(let i=1;i<e.trail.length;i++){
            const ta=i/e.trail.length;
            ctx.globalAlpha=ta*0.7;
            ctx.fillStyle=e.color;ctx.shadowColor=e.color;ctx.shadowBlur=12;
            ctx.beginPath();ctx.arc(e.trail[i].x,e.trail[i].y,e.r*ta*0.7,0,Math.PI*2);ctx.fill();
          }
        }
        // Dense core with void center
        const t2=Date.now()*0.004;
        ctx.globalAlpha=1;
        const mg=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r);
        mg.addColorStop(0,'#000000');mg.addColorStop(0.4,'#1a0014');mg.addColorStop(0.8,e.color);mg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=mg;ctx.shadowColor=e.color;ctx.shadowBlur=25;
        ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill();
        // Orbiting ring
        ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.shadowBlur=18;
        ctx.beginPath();ctx.arc(e.x,e.y,e.r+6+Math.sin(t2*8)*3,0,Math.PI*2);ctx.stroke();
        // Spin marks
        for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t2*4;ctx.globalAlpha=0.6;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x+Math.cos(a)*e.r,e.y+Math.sin(a)*e.r);ctx.lineTo(e.x+Math.cos(a)*(e.r+12),e.y+Math.sin(a)*(e.r+12));ctx.stroke();}
        ctx.globalAlpha=1;ctx.shadowBlur=0;
        break;}
      case'blackHoleOrb':{
        const t2=Date.now()*0.003;
        if(!e.active){
          // Pre-activation: small ominous orb
          const pulse=0.7+0.3*Math.sin(t2*12);
          ctx.globalAlpha=pulse;
          const col2=e.owner?e.owner.color:'#ff44cc';
          const vg=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,22);
          vg.addColorStop(0,'#000000');vg.addColorStop(0.7,'#000000');vg.addColorStop(1,col2);
          ctx.fillStyle=vg;ctx.shadowColor=col2;ctx.shadowBlur=18;
          ctx.beginPath();ctx.arc(e.x,e.y,22,0,Math.PI*2);ctx.fill();
          ctx.strokeStyle=col2;ctx.lineWidth=2;
          ctx.beginPath();ctx.arc(e.x,e.y,26+Math.sin(t2*8)*3,0,Math.PI*2);ctx.stroke();
          // Pulsing danger aura
          ctx.globalAlpha=0.22*pulse;ctx.strokeStyle=col2;ctx.lineWidth=1.5;ctx.setLineDash([4,5]);
          ctx.beginPath();ctx.arc(e.x,e.y,90,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
          // Warning text pulse
          if(Math.sin(t2*6)>0){ctx.globalAlpha=Math.sin(t2*6)*0.7;txt('⚠',e.x,e.y-40,12,col2);}
          ctx.globalAlpha=1;ctx.shadowBlur=0;
        }
        // Active state rendered in domain background pass below
        break;}
    }
    ctx.restore();
  });
  particles.forEach(p=>{ctx.save();ctx.globalAlpha=Math.max(0,p.alpha);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=5;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();});
}