// ── CURSED CLASH · cc_player.js ── Player class + all character skill methods
// To add a new character: add _newcharSkill(slot,opp) method, route it in useSkill()
// ── PLAYER ──
class Player{
  constructor(charName,sx,facing,num,altColor){
    this.charName=charName; this.def=CHARS[charName];
    this.x=sx; this.y=FLOOR-PH; this.vx=0; this.vy=0;
    this.facing=facing; this.onGround=true; this.num=num; this.altColor=altColor;
    this.hp=roundHP(roundNum); this.maxHp=this.hp; this.ult=0;
    this.stunned=0; this.blocking=false; this.blockTimer=0;
    this.ultActive=false; this.ultTimer=0;
    this.stagnationReady=false;
    this.domainActive=false; this.domainDmgTotal=0; this.domainTickAcc=0;
    this.cooldowns=[0,0,0,0];
    this.atkAnim=0; this.hurtAnim=0;
    this.movedThisFrame=false; this.infiniteVoidActive=false;
    this.timeCellSteps=0; // step counter for Time Cell 10dmg/5 steps
    this.chargeTimer=0; this.chargeDmgAcc=0; this.chargeOwnerColor='#00ccff';
    this.inThunderUlt=false; this.thunderUltTickAcc=0; this.thunderUltCDs=[0,0,0];
    this.thunderSkillGlow=0; // blue glow timer when TG uses a skill
    this._prevUltFull=false; // for ult-ready SFX
    // Fever Dreamer — Idle Death Gamble jackpot system
    this.jackpotActive=false; this.jackpotSlotTimer=0;
    this.jackpotDigits=[7,7,7]; this.jackpotHealAcc=0;
    this.jackpotSpinAnim=0; this.jackpotTimer=0;
    // Projection Sorcery streak state
    this.flashStreakCount=0; this.flashStreakTimer=0;
    // Star Rage black hole orb reference
    this.blackHoleOrb=null;
    // Straw Doll mark + Zone state
    this.strawDollMarked=false; this.strawDollMarkTimer=0;
    this.zoneActive=false; this.zoneTimer=0;
    // Binding Vow state
    this.vow=null;
    this.vowData={enchainTimer:5000,eyeAcc:0,adaptStacks:0,adaptAcc:0,ultUsed:false};
  }
  get color(){
    if(this.charName==='Thunder God'&&this.inThunderUlt){
      const opp=this.num===1?p2:p1;
      const bothAmber=opp&&opp.inThunderUlt;
      if(bothAmber) return this.num===1?'#cc99ff':'#6622bb';
      return this.altColor?this.def.ultColor2:this.def.ultColor;
    }
    return this.altColor?this.def.color2:this.def.color;
  }
  get cx(){return this.x+PW/2;} get cy(){return this.y+PH/2;}
  get ctrl(){return this.num===1?{l:'q',r:'e',u:'w',sk:['1','2','3','4']}:{l:'u',r:'o',u:'i',sk:['7','8','9','0']};}
  isImmune(){return this.charName==='Heavenly Restriction';}
  cantClash(){return this.charName==='Heavenly Restriction'||this.charName==='Thunder God'||this.charName==='Star Rage'||this.charName==='Straw Doll'||!!(this.def&&this.def.cantDomainClash);}

  update(dt,opp){
    this.movedThisFrame=false;
    for(let i=0;i<4;i++)this.cooldowns[i]=Math.max(0,this.cooldowns[i]-dt);
    if(this.inThunderUlt)for(let i=0;i<3;i++)this.thunderUltCDs[i]=Math.max(0,this.thunderUltCDs[i]-dt);
    this.stunned=Math.max(0,this.stunned-dt);
    this.blockTimer=Math.max(0,this.blockTimer-dt);
    if(this.blockTimer<=0)this.blocking=false;
    this.atkAnim=Math.max(0,this.atkAnim-dt);
    this.hurtAnim=Math.max(0,this.hurtAnim-dt);
    this.thunderSkillGlow=Math.max(0,this.thunderSkillGlow-dt);
    // Ult-ready sound
    const nowFull=this.ult>=MAX_ULT&&!this.ultActive;
    if(nowFull&&!this._prevUltFull)SFX.ultReady();
    this._prevUltFull=nowFull;

    // Ult timer
    if(this.ultTimer>0){
      this.ultTimer-=dt;
      if(this.ultTimer<=0){
        this.ultActive=false; this.domainActive=false; this.infiniteVoidActive=false;
        if(this.inThunderUlt){
          this.hp=0; this.inThunderUlt=false;
          SFX.burnout();
          spawnParticles(this.cx,this.cy,'#aa00ff',200); spawnParticles(this.cx,this.cy,'#fff',80);
          addFX({type:'screenFlash',color:'#ffffff',t:600,alpha:0.92,dur:600});
          addFX({type:'bigText',x:this.cx,y:this.cy-60,text:'BURNED OUT',color:'#ff44ff',t:2500});
        }
        if(this.charName==='Fever Dreamer'){
          // Domain expired without jackpot — clear domain state but keep jackpotTimer if running
          if(!this.jackpotActive){this.jackpotHealAcc=0;this.jackpotSpinAnim=0;}
        }
      }
    }

    // Thunder ult self-damage 10hp/s
    if(this.inThunderUlt&&this.ultActive){
      this.thunderUltTickAcc+=dt;
      while(this.thunderUltTickAcc>=1000){this.thunderUltTickAcc-=1000;this.hp=Math.max(0,this.hp-10);spawnParticles(this.cx,this.cy,'#aa00ff',8);addFX({type:'dmgNum',x:this.cx,y:this.y-18,val:10,color:'#ff44ff',t:800});}
    }

    // ── FEVER DREAMER — jackpot heal + slot machine spin ──
    if(this.charName==='Fever Dreamer'){
      // Standalone post-domain jackpot countdown
      if(this.jackpotTimer>0){
        this.jackpotTimer=Math.max(0,this.jackpotTimer-dt);
        if(this.jackpotTimer<=0){this.jackpotActive=false;this.jackpotHealAcc=0;addFX({type:'bigText',x:this.cx,y:this.y-55,text:'JACKPOT ENDED',color:'#884422',t:1200});}
      }
      // In-domain slot rolls
      if(this.ultActive){
        if(this.jackpotSpinAnim>0)this.jackpotSpinAnim=Math.max(0,this.jackpotSpinAnim-dt);
        this.jackpotSlotTimer-=dt;
        if(this.jackpotSlotTimer<=0){
          this.jackpotSlotTimer=2500;
          this.jackpotSpinAnim=700;
          const win=Math.random()<0.3;
          if(win){
            const d=Math.floor(Math.random()*10);
            this.jackpotDigits=[d,d,d];
            SFX.ultReady();
            spawnParticles(this.cx,this.cy,'#44ff88',100);spawnParticles(this.cx,this.cy,'#ffcc00',60);
            addFX({type:'jackpotWin',x:this.cx,y:this.cy,t:2200,owner:this});
            addFX({type:'bigText',x:this.cx,y:this.y-65,text:'★ JACKPOT ★',color:'#44ff88',t:2400});
            addFX({type:'screenFlash',color:'#44ff88',t:350,alpha:0.4,dur:350});
            // Cancel domain, grant 20s standalone jackpot
            this.ultActive=false;this.domainActive=false;this.ultTimer=0;
            this.jackpotActive=true;this.jackpotTimer=14000;this.jackpotHealAcc=0;
            effects=effects.filter(e=>e.type!=='gamblerBg');
            addFX({type:'bigText',x:W/2,y:H/2-50,text:'JACKPOT — 14 SECONDS',color:'#ffcc00',t:2800});
          } else {
            let d1=Math.floor(Math.random()*10),d2,d3;
            do{d2=Math.floor(Math.random()*10);}while(d2===d1);
            do{d3=Math.floor(Math.random()*10);}while(d3===d1||d3===d2);
            this.jackpotDigits=[d1,d2,d3];
            this.jackpotActive=false;this.jackpotHealAcc=0;
            addFX({type:'bigText',x:this.cx,y:this.y-55,text:'NO JACKPOT',color:'#884422',t:1100});
          }
        }
      }
      // +50 HP/s regen (CAN still die — no floor)
      if(this.jackpotActive&&this.hp>0){
        this.jackpotHealAcc+=dt;
        while(this.jackpotHealAcc>=200){
          this.jackpotHealAcc-=200;
          const maxHp=roundHP(roundNum);
          this.hp=Math.min(maxHp,this.hp+10);
          if(Math.random()<0.3)spawnParticles(this.cx,this.cy,this.color,5);
        }
      }
    }

    // Charge DoT
    if(this.chargeTimer>0){
      this.chargeTimer-=dt; this.chargeDmgAcc+=dt;
      while(this.chargeDmgAcc>=1000&&this.chargeTimer>0){this.chargeDmgAcc-=1000;this.hp=Math.max(0,this.hp-8);this.hurtAnim=150;spawnParticles(this.cx,this.cy,this.chargeOwnerColor,6);addFX({type:'dmgNum',x:this.cx,y:this.y-5,val:8,color:this.chargeOwnerColor,t:700});}
      if(this.chargeTimer<=0){this.chargeTimer=0;this.chargeDmgAcc=0;}
    }

    // Malevolent Shrine: 10dmg every 250ms — NO cap
    if(opp&&opp.domainActive&&opp.charName==='Shrine'&&!this.isImmune()){
      this.domainTickAcc+=dt;
      while(this.domainTickAcc>=250){
        this.domainTickAcc-=250;
        const tick=10;
        this.hp=Math.max(0,this.hp-tick); this.hurtAnim=160;
        if(!opp.ultActive)opp.ult=Math.min(MAX_ULT,opp.ult+tick*0.3);
        addFX({type:'dmgNum',x:this.cx+(Math.random()-.5)*40,y:this.y-8,val:tick,color:opp.color,t:750});
        if(Math.random()<0.65){
          // Big cross slashes across opponent body
          const sx=this.cx+(Math.random()-.5)*70,sy=this.cy+(Math.random()-.5)*55;
          const len=55+Math.random()*40;
          const ang=Math.random()*Math.PI;
          addFX({type:'slashLine',x1:sx-Math.cos(ang)*len,y1:sy-Math.sin(ang)*len,x2:sx+Math.cos(ang)*len,y2:sy+Math.sin(ang)*len,color:opp.color,t:280});
          addFX({type:'slashLine',x1:sx-Math.cos(ang+Math.PI/2)*len*0.7,y1:sy-Math.sin(ang+Math.PI/2)*len*0.7,x2:sx+Math.cos(ang+Math.PI/2)*len*0.7,y2:sy+Math.sin(ang+Math.PI/2)*len*0.7,color:opp.def.accent,t:220});
          addFX({type:'slashMark',x:sx,y:sy,color:opp.color,t:500});
          spawnParticles(sx,sy,opp.color,6);
        }
      }
    } else if(!(opp&&opp.domainActive&&opp.charName==='Shrine'))this.domainTickAcc=0;

    this.vy+=GRAVITY;
    if(this.stunned>0||this.infiniteVoidActive||(domainClash&&domainClash.active)){
      this.x+=this.vx; this.vx*=0.8; this.y+=this.vy; this._clamp(); return;
    }

    let spd=5.8;
    if(this.charName==='Projection Sorcery')spd=this.atkAnim>0?14:5.8;
    if(this.charName==='Heavenly Restriction')spd=5.0;
    if(this.charName==='Thunder God')spd=this.inThunderUlt?7.2:6.4;
    if(this.charName==='Fever Dreamer')spd=this.jackpotActive?7.8:6.0; // jackpot gives speed boost

    // Time Cell slowdown
    if(opp&&opp.domainActive&&opp.charName==='Projection Sorcery'&&!this.isImmune())spd*=0.5;

    const ctrl=this.ctrl;
    const wasOnGround=this.onGround;
    if(keys[ctrl.l]){this.vx=-spd;this.facing=-1;this.movedThisFrame=true;}
    else if(keys[ctrl.r]){this.vx=spd;this.facing=1;this.movedThisFrame=true;}
    else this.vx*=0.6;
    const didJump=keys[ctrl.u]&&this.onGround;
    if(didJump){this.vy=JUMP_VEL;this.onGround=false;this.movedThisFrame=true;}
    this.x+=this.vx; this.y+=this.vy; this._clamp();
    if(opp&&Math.abs(this.vx)<0.5)this.facing=opp.x>this.x?1:-1;

    // ── BINDING VOW TICK ──
    if(this.vow&&opp){
      if(this.vow==='enchain'){
        this.vowData.enchainTimer-=dt;
        if(this.vowData.enchainTimer<=0){
          this.vowData.enchainTimer=5000;
          if(Math.random()<0.25&&opp&&!opp.isImmune()&&opp.hp>0){
            const dmg=30;
            opp.hp=Math.max(0,opp.hp-dmg);opp.hurtAnim=450;
            // Build ult for this like shrine tick
            this.ult=Math.min(MAX_ULT,this.ult+dmg*0.3);
            addFX({type:'screenShake',t:280,mag:8});
            addFX({type:'screenFlash',color:'#ff0022',t:240,alpha:0.22,dur:240});
            addFX({type:'dmgNum',x:opp.cx,y:opp.y-5,val:dmg,color:'#ff2244',t:1100});
            // Cross slashes across opponent
            for(let si=0;si<4;si++){
              setTimeout(()=>{
                if(!opp||opp.hp<=0)return;
                const sx=opp.cx+(Math.random()-.5)*80,sy=opp.cy+(Math.random()-.5)*60;
                addFX({type:'slashLine',x1:sx-30,y1:sy-30,x2:sx+30,y2:sy+30,color:'#ff2244',t:320});
                addFX({type:'slashLine',x1:sx+30,y1:sy-30,x2:sx-30,y2:sy+30,color:'#cc0011',t:280});
                spawnParticles(sx,sy,'#ff0022',8);
              },si*60);
            }
            addFX({type:'bigText',x:opp.cx,y:opp.y-55,text:'⛓ ENCHAIN ⛓',color:'#ff2244',t:1400});
            SFX.enchainBurst();
          }
        }
      }
      if(this.vow==='overwhelming'&&!this.vowData.ultUsed&&!this.ultActive&&this.ult>=MAX_ULT&&opp){
        this.vowData.ultUsed=true;
        addFX({type:'bigText',x:this.cx,y:this.y-55,text:'💥 OVERWHELMING FORCE',color:'#aa44ff',t:1800});
        addFX({type:'screenFlash',color:'#aa44ff',t:300,alpha:0.35,dur:300});
        this.useSkill(3,opp,true);
      }
      // Cursed Regeneration: 10hp every 5s
      if(this.vow==='cursedRegen'&&this.hp>0){
        if(!this.vowData.regenAcc)this.vowData.regenAcc=0;
        this.vowData.regenAcc+=dt;
        while(this.vowData.regenAcc>=5000){
          this.vowData.regenAcc-=5000;
          const heal=Math.min(10,this.maxHp-this.hp);
          if(heal>0){
            this.hp+=heal;
            spawnParticles(this.cx,this.cy,'#55ff99',8);
            addFX({type:'bigText',x:this.cx,y:this.y-50,text:'+10 REGEN',color:'#55ff99',t:900});
          }
        }
      }
    }

    // Time Cell movement damage: 5dmg per 5 walking steps, 5dmg per jump — NO cap
    if(opp&&opp.domainActive&&opp.charName==='Projection Sorcery'&&!this.isImmune()){
      if(didJump){
        const dmg=5;
        this.hp=Math.max(0,this.hp-dmg);
        if(!opp.ultActive)opp.ult=Math.min(MAX_ULT,opp.ult+dmg*0.3);
        spawnParticles(this.cx,this.cy,'#00eeff',4);
        addFX({type:'dmgNum',x:this.cx,y:this.y-5,val:dmg,color:'#00eeff',t:700});
      } else if(this.movedThisFrame&&Math.abs(this.vx)>0.5){
        this.timeCellSteps++;
        if(this.timeCellSteps>=5){
          this.timeCellSteps=0;
          const dmg=5;
          this.hp=Math.max(0,this.hp-dmg);
          if(!opp.ultActive)opp.ult=Math.min(MAX_ULT,opp.ult+dmg*0.3);
          spawnParticles(this.cx,this.cy,'#00eeff',4);
          addFX({type:'dmgNum',x:this.cx,y:this.y-5,val:dmg,color:'#00eeff',t:700});
        }
      }
    } else if(!(opp&&opp.domainActive&&opp.charName==='Projection Sorcery')){
      this.timeCellSteps=0;
    }

    // Projection Sorcery streak timer — punish if streak≥3 and window expires without hitting
    if(this.charName==='Projection Sorcery'&&this.flashStreakCount>0&&this.flashStreakTimer>0){
      this.flashStreakTimer=Math.max(0,this.flashStreakTimer-dt);
      if(this.flashStreakTimer<=0){
        if(this.flashStreakCount>=3){
          // Timer expired at ×3+ streak = 3s stun
          this.stunned=Math.max(this.stunned,3000);
          this.cooldowns[0]=3000;
          addFX({type:'bigText',x:this.cx,y:this.y-55,text:'STREAK EXPIRED — 3s STUN',color:'#ff4422',t:1400});
          addFX({type:'screenShake',t:300,mag:8});
          spawnParticles(this.cx,this.cy,'#ff4422',20);
        }
        this.flashStreakCount=0;
      }
    }
    // Straw Doll: mark timer decay
    if(this.strawDollMarked){
      this.strawDollMarkTimer=Math.max(0,this.strawDollMarkTimer-dt);
      if(this.strawDollMarkTimer<=0){
        this.strawDollMarked=false;
        addFX({type:'bigText',x:this.cx,y:this.y-42,text:'MARK EXPIRED',color:'#ff8822',t:700});
      }
    }
    // Straw Doll: Zone buff timer
    if(this.zoneActive){
      this.zoneTimer=Math.max(0,this.zoneTimer-dt);
      if(this.zoneTimer<=0){
        this.zoneActive=false;
        addFX({type:'bigText',x:this.cx,y:this.y-42,text:'ZONE ENDED',color:'#ffaa00',t:800});
      }
    }
  } // end update()

  _clamp(){
    if(this.y+PH>=FLOOR){this.y=FLOOR-PH;this.vy=0;this.onGround=true;this.vx*=0.62;}
    if(this.x<0){this.x=0;this.vx=0;} if(this.x+PW>W){this.x=W-PW;this.vx=0;}
  }

  useSkill(slot,opp,forced=false){
    if(!forced&&(this.stunned>0||this.infiniteVoidActive))return;
    if(!forced&&slot===3&&this.ultActive)return;
    if(!forced&&slot===3&&this.ult<MAX_ULT)return;
    // Vow: ult permanently sealed after first use
    if(!forced&&slot===3&&(this.vow==='discharged'||this.vow==='overwhelming')&&this.vowData.ultUsed)return;
    if(!forced&&slot!==3&&this.cooldowns[slot]>0)return;
    if(!forced&&domainClash&&domainClash.active)return;
    // Thunder ult form skills
    if(this.inThunderUlt&&slot<3){this._thunderUltSkill(slot,opp);return;}
    if(this.inThunderUlt&&slot===3)return;
    this.cooldowns[slot]=this.def.skills[slot].cd; this.atkAnim=440;
    // Mark vow ult as used
    if(slot===3&&(this.vow==='discharged'||this.vow==='overwhelming'))this.vowData.ultUsed=true;
    // Thunder God: quick blue body glow on skill use
    if(this.charName==='Thunder God'&&slot<3)this.thunderSkillGlow=320;
    // Time Cell skill penalty: 30dmg per skill — NO cap
    if(opp&&opp.domainActive&&opp.charName==='Projection Sorcery'&&slot!==3&&!this.isImmune()){
      const dmg=30;
      this.hp=Math.max(0,this.hp-dmg); this.hurtAnim=280;
      if(!opp.ultActive)opp.ult=Math.min(MAX_ULT,opp.ult+dmg*0.4);
      spawnParticles(this.cx,this.cy,'#00eeff',20);
      addFX({type:'dmgNum',x:this.cx,y:this.y-5,val:dmg,color:'#00eeff',t:900});
    }
    if(this.charName==='Projection Sorcery')this._projSkill(slot,opp);
    else if(this.charName==='Heavenly Restriction')this._heavSkill(slot,opp);
    else if(this.charName==='Shrine')this._shrineSkill(slot,opp);
    else if(this.charName==='Limitless')this._limitlessSkill(slot,opp);
    else if(this.charName==='Thunder God')this._thunderSkill(slot,opp);
    else if(this.charName==='Fever Dreamer')this._feverSkill(slot,opp);
    else if(this.charName==='Star Rage')this._starRageSkill(slot,opp);
    else if(this.charName==='Straw Doll')this._strawDollSkill(slot,opp);
  }

  _projSkill(slot,opp){
    const col=this.color,glo=this.def.glow;
    switch(slot){
      case 0:{
        const streak=this.flashStreakCount;
        const dmg=10; // flat 10 dmg always
        const range=streak===0?220:streak===1?280:340;
        this.cooldowns[0]=80;
        this.flashStreakTimer=3000;
        SFX.whoosh();
        const trails=streak===0?4:streak===1?6:8;
        for(let s=0;s<trails;s++)addFX({type:'afterimage',x:this.x+this.facing*s*40,y:this.y,color:col,t:500-s*55,a:1-s*0.11});
        const ox=this.x;
        this.x=Math.max(0,Math.min(W-PW,this.x+this.facing*range));
        addFX({type:'speedTrail',x1:ox+PW/2,x2:this.cx,y:this.cy,color:col,t:400});
        addFX({type:'flashBurst',x:this.cx,y:this.cy,color:col,t:320});
        spawnParticles(ox+PW/2,this.cy,col,12+streak*8);
        spawnParticles(this.cx,this.cy,col,16+streak*8);
        const minX=Math.min(ox,this.x-10),maxX=Math.max(ox+PW,this.x+PW+10);
        const hit=opp.x+PW>minX&&opp.x<maxX&&Math.abs(this.cy-opp.cy)<PH+20;
        if(hit){
          this.dealDamage(opp,dmg);
          this.flashStreakCount=streak+1;
          if(streak===0)addFX({type:'bigText',x:opp.cx,y:opp.y-35,text:'FLASH ×1',color:col,t:700});
          else if(streak===1){addFX({type:'bigText',x:opp.cx,y:opp.y-35,text:'FLASH ×2',color:'#aaffff',t:800});addFX({type:'screenShake',t:120,mag:4});}
          else{addFX({type:'bigText',x:opp.cx,y:opp.y-35,text:'FLASH ×'+(streak+1),color:'#ffffff',t:900});addFX({type:'burstRing',x:opp.cx,y:opp.cy,color:col,t:380,r:60});}
        } else {
          // Any miss = 2s cooldown
          this.cooldowns[0]=2000;
          this.flashStreakCount=0;this.flashStreakTimer=0;
          if(streak>=3){
            // Breaking a ×3+ streak by missing = 3s stun
            this.stunned=Math.max(this.stunned,3000);
            this.cooldowns[0]=3000;
            addFX({type:'bigText',x:this.cx,y:this.y-55,text:'STREAK BROKEN — 3s STUN',color:'#ff4422',t:1400});
            addFX({type:'screenShake',t:300,mag:8});
            spawnParticles(this.cx,this.cy,'#ff4422',20);
          } else {
            addFX({type:'bigText',x:this.cx,y:this.y-42,text:'MISS — 2s CD',color:'#ff7744',t:700});
          }
        }
        break;}

      case 1:{SFX.electric();for(let i=0;i<4;i++){const ang=(i-1.5)*0.14;setTimeout(()=>{const bx=this.facing>0?this.x+PW+4:this.x-4;effects.push({type:'bolt',x:bx,y:this.y+PH*0.3+i*4,vx:Math.cos(ang)*this.facing*16,vy:Math.sin(ang)*8-3+i*1.5,owner:this,opp,dmg:12,color:col,glow:glo,t:1400,w:20,h:9,trail:[],tracking:true,trackTimer:600});},i*90);}addFX({type:'burstRing',x:this.facing>0?this.x+PW:this.x,y:this.y+PH*0.3,color:col,t:400,r:60});break;}
      case 2:{SFX.timeStop();this.stagnationReady=true;addFX({type:'screenFrost',owner:this,t:8000});addFX({type:'clockSpiral',x:this.cx,y:this.cy,t:900,color:col});spawnParticles(this.cx,this.cy,col,60);addFX({type:'stagnationAura',owner:this,t:9000});break;}
      case 3:{SFX.domain();this.ult=0;this.domainActive=true;this.domainDmgTotal=0;this.ultActive=true;this.ultTimer=7500;spawnParticles(this.cx,this.cy,col,120);addFX({type:'domainBg',owner:this,t:7500});addFX({type:'domainText',text:'Domain Expansion',sub:'TIME CELL MOON PALACE',color:col,t:3000});break;}
    }
  }

  _heavSkill(slot,opp){
    switch(slot){
      case 0:{SFX.crush();if(this._dist(opp)<120){this.dealDamage(opp,36);opp.vx=this.facing*26;opp.vy=-11;addFX({type:'crushSpin',owner:opp,t:400});}const ix=this.x+(this.facing>0?PW+25:-25);addFX({type:'crushRing',x:ix,y:this.cy,color:this.color,t:500});addFX({type:'groundCrack',x:ix,y:FLOOR,color:this.def.accent,t:800,big:false});spawnParticles(ix,this.cy,this.color,50);addFX({type:'bigText',x:ix,y:this.cy-35,text:'CRUSH',color:this.def.accent,t:550});break;}
      case 1:{SFX.guard();this.blocking=true;this.blockTimer=2500;addFX({type:'hexBarrier',owner:this,t:2500});spawnParticles(this.cx,this.cy,this.def.accent,40);addFX({type:'bigText',x:this.cx,y:this.y-30,text:'GUARD',color:this.def.accent,t:600});break;}
      case 2:{SFX.whoosh();this.vy=-18;this.vx=this.facing*3;addFX({type:'jumpTrail',owner:this,t:600});const self=this;const wait=setInterval(()=>{if(self.onGround){clearInterval(wait);SFX.seismic();addFX({type:'seismicWave',x:self.cx,y:FLOOR,t:750});addFX({type:'groundCrack',x:self.cx,y:FLOOR,color:self.color,t:1000,big:true});spawnParticles(self.cx,FLOOR,self.color,90);addFX({type:'screenShake',t:500,mag:14});if(self._dist(opp)<240){self.dealDamage(opp,30);opp.vy=-14;}}},16);break;}
      case 3:{SFX.domain();this.ult=0;this.ultActive=true;this.ultTimer=10000;addFX({type:'maxOutputAura',owner:this,t:10000,color:this.def.glow});addFX({type:'domainText',text:'Maximum Output',sub:'TRIPLE DAMAGE — 10 SECONDS',color:this.def.accent,t:2500});spawnParticles(this.cx,this.cy,this.def.accent,100);break;}
    }
  }

  _shrineSkill(slot,opp){
    const col=this.color;
    switch(slot){
      case 0:{SFX.slashHeavy();const reach=160;addFX({type:'arcSlash',x:this.cx,y:this.cy,facing:this.facing,color:col,t:450,rad:reach});spawnParticles(this.cx+this.facing*80,this.cy,col,45);if(this._dist(opp)<reach+25){this.dealDamage(opp,32);addFX({type:'slashMark',x:opp.cx,y:opp.cy,color:col,t:700});addFX({type:'bigText',x:opp.cx,y:opp.y-30,text:'CLEAVE',color:col,t:550});}break;}
      case 1:{SFX.slash();const bx=this.facing>0?this.x+PW:this.x;effects.push({type:'crossSlash',x:bx,y:this.cy,vx:this.facing*13,vy:0,owner:this,opp,dmg:26,color:col,t:1600,sz:42});addFX({type:'burstRing',x:bx,y:this.cy,color:col,t:350,r:50});addFX({type:'bigText',x:bx,y:this.cy-50,text:'DISMANTLE',color:col,t:500});break;}
      case 2:{SFX.vortex();this.atkAnim=1100;addFX({type:'slashVortex',owner:this,opp,t:1100});spawnParticles(this.cx,this.cy,col,80);addFX({type:'screenFlash',color:col,t:150,alpha:0.22,dur:150});addFX({type:'bigText',x:this.cx,y:this.cy-60,text:'SLASH FLOOD',color:col,t:700});let hits=0;const self=this;const doHit=()=>{if(hits>=6)return;const ang=(hits/6)*Math.PI*2+Math.random()*0.3;const ex=self.cx+Math.cos(ang)*80,ey=self.cy+Math.sin(ang)*55;addFX({type:'slashLine',x1:self.cx,y1:self.cy,x2:ex,y2:ey,color:col,t:280});addFX({type:'slashLine',x1:self.cx+Math.cos(ang+0.5)*20,y1:self.cy+Math.sin(ang+0.5)*20,x2:ex+Math.cos(ang+0.5)*30,y2:ey+Math.sin(ang+0.5)*30,color:self.def.accent,t:200});spawnParticles(ex,ey,col,8);if(self._dist(opp)<160){self.dealDamage(opp,14);addFX({type:'slashMark',x:opp.cx+(Math.random()-.5)*40,y:opp.cy+(Math.random()-.5)*40,color:col,t:600});}hits++;setTimeout(doHit,125);};doHit();break;}
      case 3:{SFX.domain();this.ult=0;this.domainActive=true;this.domainDmgTotal=0;this.domainTickAcc=0;this.ultActive=true;this.ultTimer=5000;spawnParticles(this.cx,this.cy,col,120);addFX({type:'malevolentBg',owner:this,t:5000});addFX({type:'domainText',text:'Domain Expansion',sub:'MALEVOLENT SHRINE',color:col,t:3000});addFX({type:'shrineSlashStorm',owner:this,t:5000});break;}
    }
  }

  _limitlessSkill(slot,opp){
    switch(slot){
      case 0:{SFX.vortex();const bx=this.facing>0?this.x+PW+8:this.x-8;effects.push({type:'redOrb',x:bx,y:this.cy,vx:this.facing*11,vy:-1,owner:this,opp,dmg:28,t:1800,trail:[]});addFX({type:'burstRing',x:bx,y:this.cy,color:'#ff2200',t:400,r:55});spawnParticles(bx,this.cy,'#ff4400',30);addFX({type:'bigText',x:bx,y:this.cy-50,text:'RED',color:'#ff3300',t:600});break;}
      case 1:{SFX.vortex();addFX({type:'blueVortex',x:opp.cx,y:opp.cy,owner:this,opp,t:1200});spawnParticles(opp.cx,opp.cy,'#0088ff',60);addFX({type:'bigText',x:opp.cx,y:opp.y-50,text:'BLUE',color:'#0099ff',t:600});const self=this;const pi=setInterval(()=>{if(!self||!opp)return clearInterval(pi);const dx=self.cx-opp.cx,dy=self.cy-opp.cy,d=Math.sqrt(dx*dx+dy*dy);if(d>0){opp.vx+=dx/d*4.5;opp.vy+=dy/d*2;}},16);setTimeout(()=>{clearInterval(pi);if(self._dist(opp)<120)self.dealDamage(opp,20);spawnParticles(this.cx,this.cy,'#0088ff',35);},1100);break;}
      case 2:{SFX.electricBig();const bx=this.facing>0?this.x+PW+10:this.x-10;effects.push({type:'hollowPurple',x:bx,y:this.cy-30,vx:this.facing*9,vy:0,owner:this,opp,dmg:55,t:2200,hit:false});addFX({type:'screenFlash',color:'#aa44ff',t:200,alpha:0.35,dur:200});spawnParticles(bx,this.cy,'#aa44ff',60);spawnParticles(bx,this.cy,'#ff2200',30);spawnParticles(bx,this.cy,'#0044ff',30);addFX({type:'bigText',x:W/2,y:H/2-20,text:'Hollow Purple',color:'#cc88ff',t:1800});break;}
      case 3:{SFX.domain();this.ult=0;this.domainActive=true;this.domainDmgTotal=0;this.ultActive=true;this.ultTimer=60000;
        if(!opp.isImmune()){opp.infiniteVoidActive=true;opp.stunned=5000;addFX({type:'infiniteVoidBg',t:5500});addFX({type:'domainText',text:'Domain Expansion',sub:'INFINITE VOID',color:'#ffffff',t:3500});addFX({type:'bigText',x:opp.cx,y:opp.y-20,text:'OVERWHELMED',color:'#cc88ff',t:4500});spawnParticles(W/2,H/2,'#fff',200);spawnParticles(W/2,H/2,'#aa88ff',150);const op=opp;setTimeout(()=>{op.infiniteVoidActive=false;op.stunned=0;},5000);}
        else{addFX({type:'domainText',text:'Domain Expansion',sub:'INFINITE VOID',color:'#ffffff',t:3000});spawnParticles(W/2,H/2,'#fff',80);addFX({type:'bigText',x:W/2,y:H/2+60,text:'HEAVENLY RESTRICTION RESISTS',color:'#22ff44',t:2500});}
        break;}
    }
  }

  _thunderSkill(slot,opp){
    switch(slot){
      case 0:{SFX.electric();const bx=this.facing>0?this.x+PW+4:this.x-4;const bCol=this.inThunderUlt?'#cc99ff':this.def.color;const bGlow=this.inThunderUlt?'#8800ff':this.def.glow;effects.push({type:'bolt',x:bx,y:this.cy,vx:this.facing*18,vy:0,owner:this,opp,dmg:20,color:bCol,glow:bGlow,t:1200,w:22,h:11,trail:[],tracking:true,trackTimer:500,onHitStun:800});spawnParticles(bx,this.cy,bCol,20);addFX({type:'burstRing',x:bx,y:this.cy,color:bCol,t:300,r:40});break;}
      case 1:{SFX.electric();const ox=this.x,oy=this.cy;this.x=Math.max(0,Math.min(W-PW,this.x+this.facing*240));addFX({type:'staticRushTrail',x1:ox,x2:this.x,y:oy,color:this.color,t:500});addFX({type:'burstRing',x:this.cx,y:this.cy,color:'#00aaff',t:400,r:65});spawnParticles(this.cx,this.cy,this.color,40);if(this._overlaps(opp)||this._dist(opp)<80){this.dealDamage(opp,15);opp.chargeTimer=3000;opp.chargeDmgAcc=0;opp.chargeOwnerColor=this.color;addFX({type:'bigText',x:opp.cx,y:opp.y-30,text:'CHARGED',color:'#00ccff',t:900});addFX({type:'chargeAura',owner:opp,t:3000});}break;}
      case 2:{SFX.electric();const cx2=this.facing>0?this.x+PW+40:this.x-140;effects.push({type:'voltageCage',x:cx2,y:FLOOR-160,w:140,h:160,owner:this,opp,t:8000,triggered:false});addFX({type:'bigText',x:cx2+70,y:FLOOR-170,text:'VOLTAGE CAGE',color:'#00ccff',t:700});spawnParticles(cx2+70,FLOOR-80,this.color,30);break;}
      case 3:{SFX.amber();this.ult=0;this.ultActive=true;this.ultTimer=30000;this.inThunderUlt=true;this.thunderUltTickAcc=0;this.thunderUltCDs=[0,0,0];spawnParticles(this.cx,this.cy,'#aa00ff',150);spawnParticles(this.cx,this.cy,'#ffaa00',80);addFX({type:'domainText',text:'Mythical Beast Amber',sub:'THUNDER GOD TRANSFORMATION',color:'#aa44ff',t:3200});addFX({type:'screenFlash',color:'#aa44ff',t:500,alpha:0.75,dur:500});addFX({type:'amberTransform',owner:this,t:800});break;}
    }
  }

  _thunderUltSkill(slot,opp){
    if(this.thunderUltCDs[slot]>0)return;
    this.atkAnim=450;
    this.thunderSkillGlow=320; // blue glow even in ult form
    switch(slot){
      case 0:{this.thunderUltCDs[0]=2500;SFX.electricBig();for(let i=-1;i<=1;i++){const ang=i*0.22;effects.push({type:'bolt',x:this.facing>0?this.x+PW:this.x,y:this.cy,vx:Math.cos(ang)*this.facing*15,vy:Math.sin(ang)*4-2,owner:this,opp,dmg:40,color:'#cc44ff',glow:'#8800ff',t:1300,w:24,h:12,trail:[],tracking:false});}spawnParticles(this.cx,this.cy,'#aa44ff',40);addFX({type:'bigText',x:this.cx,y:this.y-55,text:'PURPLE SURGE',color:'#cc44ff',t:700});break;}
      case 1:{this.thunderUltCDs[1]=4000;this.atkAnim=550;SFX.godslayer();addFX({type:'godslayer',x:opp.cx,y:0,t:700});spawnParticles(opp.cx,H/2,'#aa44ff',60);spawnParticles(opp.cx,FLOOR,'#fff',40);const self=this;setTimeout(()=>{if(self._dist(opp)<350){self.dealDamage(opp,65);opp.stunned=1000;addFX({type:'bigText',x:opp.cx,y:opp.y-30,text:'GODSLAYER',color:'#cc44ff',t:900});}},450);break;}
      case 2:{this.thunderUltCDs[2]=6000;this.atkAnim=600;SFX.electricBig();addFX({type:'amberDischarge',x:this.cx,y:this.cy,t:700});spawnParticles(this.cx,this.cy,'#aa44ff',100);spawnParticles(this.cx,this.cy,'#ffaa00',60);addFX({type:'screenFlash',color:'#aa44ff',t:350,alpha:0.45,dur:350});if(this._dist(opp)<240){this.dealDamage(opp,55);opp.vx=(opp.cx>this.cx?1:-1)*28;opp.vy=-13;addFX({type:'bigText',x:opp.cx,y:opp.y-30,text:'AMBER DISCHARGE',color:'#ffaa00',t:800});}break;}
    }
  }

  _feverSkill(slot,opp){
    const col=this.color,jp=this.jackpotActive;
    switch(slot){
      case 0:{ // Heavy Slug
        SFX.slug();SFX.crush();
        const dmg=jp?50:34;
        const ix=this.x+(this.facing>0?PW+18:-18);
        if(jp){
          // JACKPOT: triple shockwave, gold cracks, screen blast
          addFX({type:'screenFlash',color:'#44ff88',t:240,alpha:0.32,dur:240});
          addFX({type:'screenShake',t:420,mag:16});
          spawnParticles(ix,this.cy,'#ffcc00',60);spawnParticles(ix,this.cy,col,60);
          for(let i=0;i<3;i++)setTimeout(()=>addFX({type:'crushRing',x:ix,y:this.cy,color:i===0?'#ffcc00':'#44ff88',t:500}),i*80);
          addFX({type:'groundCrack',x:ix,y:FLOOR,color:'#ffcc00',t:900,big:true});
        } else {
          addFX({type:'crushRing',x:ix,y:this.cy,color:col,t:500});
          addFX({type:'groundCrack',x:ix,y:FLOOR,color:col,t:700,big:false});
          spawnParticles(ix,this.cy,col,40);
        }
        if(this._dist(opp)<130){
          this.dealDamage(opp,dmg);
          opp.vx=this.facing*(jp?32:24); opp.vy=jp?-15:-10;
          addFX({type:'bigText',x:opp.cx,y:opp.y-30,text:jp?'★ JACKPOT SLUG ★':'SLUG',color:jp?'#ffcc00':col,t:jp?900:650});
          addFX({type:'crushSpin',owner:opp,t:jp?650:420});
        }
        break;}
      case 1:{ // Iron Ball
        SFX.metalClang();SFX.crush();
        const dmg2=jp?38:25;
        const bx=this.facing>0?this.x+PW+6:this.x-6;
        const ballR=jp?26:18;
        effects.push({type:'ironBall',x:bx,y:this.cy-10,vx:this.facing*(jp?16:10),vy:jp?-5:-3,owner:this,opp,dmg:dmg2,t:2400,hit:false,r:ballR,bounces:jp?2:1,jp});
        if(jp){
          spawnParticles(bx,this.cy,'#ffcc00',45);spawnParticles(bx,this.cy,col,35);
          addFX({type:'burstRing',x:bx,y:this.cy,color:'#ffcc00',t:550,r:95});
          addFX({type:'burstRing',x:bx,y:this.cy,color:col,t:380,r:62});
          addFX({type:'bigText',x:bx,y:this.cy-60,text:'★ GRAND BALL ★',color:'#ffcc00',t:700});
        } else {
          addFX({type:'burstRing',x:bx,y:this.cy,color:col,t:400,r:55});
          addFX({type:'bigText',x:bx,y:this.cy-55,text:'IRON BALL',color:col,t:550});
          spawnParticles(bx,this.cy,col,18);
        }
        break;}
      case 2:{ // Cursed Door
        SFX.doorCreak();SFX.whoosh();
        const doorCol=this.color;
        const jp2=jp;
        const dw=jp2?110:80,dh=jp2?240:190;
        let dx=this.facing>0?this.x+PW+50:this.x-dw-50;
        dx=Math.max(20,Math.min(W-dw-20,dx));
        effects.push({type:'cursedDoor',x:dx,y:FLOOR-dh,w:dw,h:dh,ownerId:this.num,oppId:opp.num,dmg:jp2?32:20,dcol:doorCol,t:5000,trapped:false,trapTimer:0,launched:false,jp:jp2});
        addFX({type:'burstRing',x:dx+dw/2,y:FLOOR-dh/2,color:jp2?'#ffcc00':doorCol,t:500,r:jp2?120:80});
        spawnParticles(dx+dw/2,FLOOR-dh/2,doorCol,jp2?75:45);
        if(jp2){spawnParticles(dx+dw/2,FLOOR-dh/2,'#ffcc00',45);addFX({type:'screenFlash',color:doorCol,t:200,alpha:0.22,dur:200});}
        addFX({type:'bigText',x:dx+dw/2,y:FLOOR-dh-12,text:jp2?'★ GRAND DOOR ★':'CURSED DOOR',color:jp2?'#ffcc00':doorCol,t:750});
        break;}
      case 3:{ // Idle Death Gamble — domain
        SFX.domain();
        this.ult=0;this.ultActive=true;this.ultTimer=11000;
        this.domainActive=true;this.domainDmgTotal=0;
        this.jackpotActive=false;this.jackpotTimer=0;this.jackpotSlotTimer=2000;
        this.jackpotDigits=[7,7,7];this.jackpotHealAcc=0;this.jackpotSpinAnim=0;
        spawnParticles(this.cx,this.cy,col,130);spawnParticles(this.cx,this.cy,'#ffcc00',60);
        addFX({type:'gamblerBg',owner:this,t:11000});
        addFX({type:'domainText',text:'Domain Expansion',sub:'IDLE DEATH GAMBLE',color:col,t:3000});
        addFX({type:'screenFlash',color:col,t:400,alpha:0.45,dur:400});
        break;}
    }
  }

  dealDamage(opp,amount){
    if(this.zoneActive)amount=Math.round(amount*1.2); // THE ZONE buff
    if(opp.blocking){SFX.block();spawnParticles(opp.cx,opp.cy,'#fff',15);addFX({type:'blockSpark',x:opp.cx,y:opp.cy,t:350});return;}
    if(this.stagnationReady){this.stagnationReady=false;opp.stunned=2000;SFX.timeStop();addFX({type:'timeStopSplash',x:opp.cx,y:opp.cy,t:2000});addFX({type:'bigText',x:opp.cx,y:opp.y-18,text:'TIME STOPPED',color:'#aaccff',t:1800});spawnParticles(opp.cx,opp.cy,'#aaccff',60);}
    let dmg=amount;
    // Overtime vow — x1.5 after 60s
    if(this.vow==='overtime'&&bindedMatchTimer>60000)dmg=Math.round(dmg*1.5);
    // Cursed Vitality — deal 0.9x damage
    if(this.vow==='cursedVitality')dmg=Math.max(1,Math.round(dmg*0.9));
    // Adaptation damage reduction
    if(opp.vow==='adaptation'&&opp.vowData.adaptStacks>0){
      const red=Math.min(0.7,opp.vowData.adaptStacks*0.1);
      dmg=Math.max(1,Math.round(dmg*(1-red)));
    }
    // Cursed Nullification — permanent 20% DR
    if(opp.vow==='cursednull')dmg=Math.max(1,Math.round(dmg*0.8));
    if(this.ultActive&&this.charName==='Heavenly Restriction')dmg=Math.round(dmg*3);
    opp.hp=Math.max(0,opp.hp-dmg); opp.hurtAnim=300;
    if(!this.ultActive)this.ult=Math.min(MAX_ULT,this.ult+dmg*0.65);
    if(!opp.ultActive)opp.ult=Math.min(MAX_ULT,opp.ult+dmg*0.3);
    addFX({type:'screenShake',t:220,mag:dmg>28?12:7});
    addFX({type:'dmgNum',x:opp.cx,y:opp.y-5,val:dmg,color:this.color,t:1100});
    if(dmg>=28)SFX.bigHit(); else SFX.hit(dmg/30);
    // Eye for a Leg — attacker takes 1 per 4 received
    if(opp.vow==='eyeforaleg'){
      opp.vowData.eyeAcc+=amount;
      while(opp.vowData.eyeAcc>=4){
        opp.vowData.eyeAcc-=4;
        this.hp=Math.max(0,this.hp-1);
        spawnParticles(this.cx,this.cy,'#00ccaa',5);
      }
    }
    // Adaptation stack accumulation
    if(opp.vow==='adaptation'){
      opp.vowData.adaptAcc+=amount;
      while(opp.vowData.adaptAcc>=100&&opp.vowData.adaptStacks<7){
        opp.vowData.adaptAcc-=100;
        opp.vowData.adaptStacks++;
        const pct=opp.vowData.adaptStacks*10;
        addFX({type:'bigText',x:opp.cx,y:opp.y-55,text:'🛡 ADAPT +'+pct+'%',color:'#44ff88',t:1600});
        spawnParticles(opp.cx,opp.cy,'#44ff88',25);
      }
    }
  }

  _dist(opp){const dx=this.cx-opp.cx,dy=this.cy-opp.cy;return Math.sqrt(dx*dx+dy*dy);}
  _overlaps(opp){return this.x<opp.x+PW&&this.x+PW>opp.x&&this.y<opp.y+PH&&this.y+PH>opp.y;}

  _starRageSkill(slot,opp){
    const col=this.color;
    switch(slot){
      case 0:{ // Mass Burst — full imaginary mass slam, 45dmg, 240px range
        SFX.seismic();SFX.vortex();
        this.atkAnim=600;
        // Giant expanding shockwave rings
        for(let i=0;i<5;i++){
          setTimeout(()=>{
            addFX({type:'burstRing',x:this.cx,y:this.cy,color:i%2===0?col:'#ffffff',t:500,r:80+i*55});
            if(i===0)spawnParticles(this.cx,this.cy,col,60);
            if(i===1)spawnParticles(this.cx,this.cy,'#fff',30);
          },i*55);
        }
        addFX({type:'seismicWave',x:this.cx,y:FLOOR,t:800});
        addFX({type:'groundCrack',x:this.cx,y:FLOOR,color:col,t:1200,big:true});
        addFX({type:'screenShake',t:480,mag:18});
        addFX({type:'screenFlash',color:col,t:280,alpha:0.38,dur:280});
        // Gravity distortion lines from center
        for(let i=0;i<8;i++){
          const a=i/8*Math.PI*2;
          addFX({type:'slashLine',x1:this.cx,y1:this.cy,x2:this.cx+Math.cos(a)*220,y2:this.cy+Math.sin(a)*180,color:col,t:380});
        }
        if(this._dist(opp)<240){
          this.dealDamage(opp,45);
          opp.vx=this.facing*32;opp.vy=-15;
          addFX({type:'bigText',x:opp.cx,y:opp.y-45,text:'MASS BURST',color:col,t:900});
          addFX({type:'crushRing',x:opp.cx,y:opp.cy,color:col,t:500});
        }
        break;}
      case 1:{ // Imaginary Mass — windup, then fire fast straight dense shot, 40dmg
        SFX.vortex();this.atkAnim=600;
        // Wind-up charge
        spawnParticles(this.cx,this.cy,col,40);spawnParticles(this.cx,this.cy,'#000',20);
        addFX({type:'burstRing',x:this.cx,y:this.cy,color:col,t:420,r:50});
        addFX({type:'bigText',x:this.cx,y:this.cy-58,text:'IMAGINARY MASS',color:col,t:500});
        const self2=this;
        setTimeout(()=>{
          if(!self2)return;
          SFX.slug();
          const fx=self2.facing>0?self2.x+PW+8:self2.x-8;
          // Fast, straight, no gravity — bullet-like
          const orb={type:'massOrb',x:fx,y:self2.cy,vx:self2.facing*22,vy:0,
            owner:self2,opp,dmg:40,color:col,t:900,r:28,hit:false,trail:[],straight:true};
          effects.push(orb);
          addFX({type:'speedTrail',x1:self2.cx,x2:fx,y:self2.cy,color:col,t:300});
          addFX({type:'burstRing',x:fx,y:self2.cy,color:col,t:400,r:55});
          addFX({type:'screenShake',t:150,mag:7});
          spawnParticles(fx,self2.cy,col,25);
        },350);
        break;}
      case 2:{ // Mass Augment — charge up, powered devastating slam, 55dmg
        SFX.vortex();SFX.electricBig();
        this.atkAnim=700;
        spawnParticles(this.cx,this.cy,col,80);spawnParticles(this.cx,this.cy,'#fff',40);
        addFX({type:'screenFlash',color:col,t:250,alpha:0.45,dur:250});
        addFX({type:'bigText',x:this.cx,y:this.cy-60,text:'MASS AUGMENT',color:col,t:900});
        // Heavy mass aura ring
        addFX({type:'burstRing',x:this.cx,y:this.cy,color:col,t:700,r:80});
        addFX({type:'burstRing',x:this.cx,y:this.cy,color:'#fff',t:600,r:55});
        // After brief windup, slam forward
        const self=this;
        setTimeout(()=>{
          if(!self||!opp)return;
          const ox=self.x;
          self.x=Math.max(0,Math.min(W-PW,self.x+self.facing*200));
          addFX({type:'speedTrail',x1:ox+PW/2,x2:self.cx,y:self.cy,color:col,t:400});
          if(self._dist(opp)<180){
            self.dealDamage(opp,55);
            opp.vx=self.facing*40;opp.vy=-18;
            addFX({type:'screenShake',t:600,mag:22});
            addFX({type:'screenFlash',color:col,t:350,alpha:0.5,dur:350});
            addFX({type:'bigText',x:opp.cx,y:opp.y-50,text:'☆ FULL MASS STRIKE ☆',color:'#ffffff',t:1100});
            for(let i=0;i<6;i++)addFX({type:'burstRing',x:opp.cx,y:opp.cy,color:i%2===0?col:'#fff',t:450,r:50+i*40});
            addFX({type:'groundCrack',x:opp.cx,y:FLOOR,color:col,t:1000,big:true});
            spawnParticles(opp.cx,opp.cy,col,80);
          }
        },300);
        break;}
      case 3:{ // Black Hole — throw slow orb, activate on proximity/re-press
        SFX.domain();SFX.vortex();
        this.ult=0;this.ultActive=true;this.ultTimer=14000;
        const orb={type:'blackHoleOrb',x:this.cx,y:this.cy,
          vx:this.facing*3.5,vy:-1.5,
          owner:this,opp,t:14000,active:false,dmgAccUser:0,dmgAccEnemy:0,lastDmgTxt:0};
        effects.push(orb);
        this.blackHoleOrb=orb;
        spawnParticles(this.cx,this.cy,col,60);
        addFX({type:'bigText',x:this.cx,y:this.cy-65,text:'BLACK HOLE — PROXIMITY TRIGGER',color:col,t:2200});
        addFX({type:'screenFlash',color:col,t:300,alpha:0.4,dur:300});
        break;}
    }
  }


  _strawDollSkill(slot,opp){
    const col=this.color,self=this;
    const marked=opp&&opp.strawDollMarked;
    const consumeMark=()=>{
      if(opp&&opp.strawDollMarked){
        opp.strawDollMarked=false;opp.strawDollMarkTimer=0;
        addFX({type:'bigText',x:opp.cx,y:opp.y-52,text:'MARK CONSUMED',color:col,t:900});
      }
    };
    if(marked){
      // ═══ MARKED MOVESET ═══
      switch(slot){
        case 0:{ // Resonance Strike — 55dmg, consumes mark
          SFX.crush();SFX.seismic();this.atkAnim=500;
          addFX({type:'arcSlash',x:this.cx,y:this.cy,facing:this.facing,color:col,t:420,rad:170});
          addFX({type:'screenShake',t:320,mag:13});
          if(opp){
            for(let i=0;i<4;i++)setTimeout(()=>{
              if(!opp)return;
              addFX({type:'slashLine',x1:self.cx,y1:self.cy,x2:opp.cx+(Math.random()-.5)*40,y2:opp.cy+(Math.random()-.5)*40,color:col,t:300});
              spawnParticles(opp.cx,opp.cy,col,5);
            },i*60);
            this.dealDamage(opp,55);opp.vx=this.facing*18;opp.vy=-10;
            addFX({type:'bigText',x:opp.cx,y:opp.y-50,text:'RESONANCE STRIKE',color:'#fff',t:950});
            addFX({type:'screenFlash',color:col,t:200,alpha:0.32,dur:200});
            spawnParticles(opp.cx,opp.cy,col,45);
          }
          consumeMark();break;}
        case 1:{ // Soul Rend — 45dmg + 1.5s stun, consumes mark
          SFX.slashHeavy();this.atkAnim=400;
          if(opp){
            for(let i=0;i<3;i++)setTimeout(()=>{
              addFX({type:'burstRing',x:opp.cx,y:opp.cy,color:'#220033',t:580,r:40+i*38});
              addFX({type:'burstRing',x:opp.cx,y:opp.cy,color:col,t:500,r:24+i*28});
              spawnParticles(opp.cx,opp.cy,col,8);
            },i*80);
            this.dealDamage(opp,45);opp.stunned=Math.max(opp.stunned,1500);opp.vx*=0.2;
            addFX({type:'bigText',x:opp.cx,y:opp.y-54,text:'SOUL REND',color:'#dd66ff',t:1100});
            addFX({type:'screenShake',t:280,mag:10});
            addFX({type:'screenFlash',color:'#220033',t:260,alpha:0.38,dur:260});
          }
          consumeMark();break;}
        case 2:{ // Divergence — 65dmg AoE explosion, consumes mark
          SFX.domain();SFX.seismic();this.atkAnim=600;
          const ex=opp?opp.cx:this.cx,ey=opp?opp.cy:this.cy;
          spawnParticles(ex,ey,col,100);spawnParticles(ex,ey,'#ffddaa',50);
          addFX({type:'screenShake',t:500,mag:18});
          addFX({type:'screenFlash',color:col,t:320,alpha:0.5,dur:320});
          for(let i=0;i<6;i++)addFX({type:'burstRing',x:ex,y:ey,color:i%2===0?col:'#fff',t:400+i*50,r:36+i*46});
          addFX({type:'groundCrack',x:ex,y:FLOOR,color:col,t:900,big:true});
          if(opp){this.dealDamage(opp,65);opp.vx=this.facing*25;opp.vy=-16;
            addFX({type:'bigText',x:opp.cx,y:opp.y-64,text:'★ DIVERGENCE ★',color:'#fff',t:1200});}
          consumeMark();break;}
        case 3:{ // Black Flash — far dash, 90dmg + THE ZONE, consumes mark
          SFX.domain();SFX.whoosh();this.ult=0;this.ultActive=true;this.ultTimer=400;
          addFX({type:'bigText',x:this.cx,y:this.cy-72,text:'BLACK FLASH',color:'#000',t:900});
          addFX({type:'screenFlash',color:'#000',t:220,alpha:0.88,dur:220});
          spawnParticles(this.cx,this.cy,'#000',35);spawnParticles(this.cx,this.cy,col,35);
          const ox=this.cx;
          setTimeout(()=>{
            if(!self||!opp)return;
            self.x=Math.max(0,Math.min(W-PW,opp.cx+(self.facing>0?180:-180)-PW/2));
            addFX({type:'speedTrail',x1:ox,x2:self.cx,y:self.cy,color:col,t:480});
            spawnParticles(self.cx,self.cy,col,40);
            if(self._dist(opp)<200){
              addFX({type:'screenFlash',color:'#000',t:380,alpha:0.96,dur:380});
              addFX({type:'screenFlash',color:col,t:340,alpha:0.7,dur:340});
              addFX({type:'screenShake',t:700,mag:24});
              for(let i=0;i<8;i++)addFX({type:'burstRing',x:opp.cx,y:opp.cy,color:i%3===0?'#fff':(i%3===1?'#000':col),t:500,r:28+i*33});
              spawnParticles(opp.cx,opp.cy,'#000',80);spawnParticles(opp.cx,opp.cy,col,80);spawnParticles(opp.cx,opp.cy,'#fff',40);
              self.dealDamage(opp,90);opp.vx=self.facing*40;opp.vy=-20;
              addFX({type:'bigText',x:opp.cx,y:opp.y-74,text:'✦ BLACK FLASH ✦',color:'#fff',t:1400});
              self.zoneActive=true;self.zoneTimer=10000;
              addFX({type:'bigText',x:self.cx,y:self.cy-96,text:'⚡ THE ZONE ⚡',color:'#ffaa00',t:1600});
              addFX({type:'screenFlash',color:'#ffaa00',t:280,alpha:0.45,dur:280});
              spawnParticles(self.cx,self.cy,'#ffaa00',60);
            }
            consumeMark();
          },240);break;}
      }
    } else {
      // ═══ BASE MOVESET ═══
      switch(slot){
        case 0:{ // Hammer Strike — 34dmg, heavy stagger
          SFX.crush();SFX.seismic();this.atkAnim=480;
          const hx=this.facing>0?this.x+PW+10:this.x-10;
          addFX({type:'arcSlash',x:this.cx,y:this.cy,facing:this.facing,color:col,t:420,rad:165});
          addFX({type:'groundCrack',x:hx,y:FLOOR,color:col,t:850,big:false});
          addFX({type:'screenShake',t:280,mag:11});
          addFX({type:'burstRing',x:hx,y:this.cy,color:col,t:320,r:75});
          spawnParticles(hx,this.cy,col,35);
          if(this._dist(opp)<160){
            this.dealDamage(opp,34);opp.vx=this.facing*18;opp.vy=-11;
            opp.stunned=Math.max(opp.stunned,380);
            addFX({type:'bigText',x:opp.cx,y:opp.y-42,text:'HAMMER STRIKE',color:col,t:750});
          }
          break;}
        case 1:{ // Nail Barrage — 3 nails, 18dmg each
          SFX.whoosh();
          const ny=this.cy;
          [-0.2,0,0.2].forEach((ang,i)=>setTimeout(()=>{
            const nx=this.facing>0?this.x+PW+4:this.x-4;
            effects.push({type:'nail',x:nx,y:ny+ang*60,vx:this.facing*15,vy:ang*9,
              owner:this,opp,dmg:18,color:col,t:1600,hit:false,trail:[]});
            addFX({type:'burstRing',x:nx,y:ny+ang*60,color:col,t:180,r:18});
          },i*80));
          spawnParticles(this.facing>0?this.x+PW:this.x,ny,col,14);
          break;}
        case 2:{ // Resonance — 28dmg + MARK opponent
          SFX.vortex();SFX.enchainBurst();this.atkAnim=380;
          if(opp){
            for(let i=0;i<3;i++)setTimeout(()=>{
              addFX({type:'slashLine',x1:self.cx,y1:self.cy+(i-1)*18,x2:opp.cx,y2:opp.cy+(i-1)*18,color:col,t:480});
            },i*100);
            addFX({type:'burstRing',x:opp.cx,y:opp.cy,color:col,t:560,r:52});
            addFX({type:'burstRing',x:opp.cx,y:opp.cy,color:'#ffddaa',t:480,r:30});
            spawnParticles(opp.cx,opp.cy,col,32);spawnParticles(this.cx,this.cy,col,18);
            this.dealDamage(opp,28);
            opp.strawDollMarked=true;opp.strawDollMarkTimer=12000;
            addFX({type:'bigText',x:opp.cx,y:opp.y-54,text:'⛩ RESONANCE — MARKED',color:col,t:1100});
            addFX({type:'screenFlash',color:col,t:200,alpha:0.28,dur:200});
            addFX({type:'screenShake',t:180,mag:7});
          }
          break;}
        case 3:{ // Hairpin — fast dash, mark on hit, 32dmg
          SFX.domain();SFX.whoosh();this.ult=0;this.ultActive=true;this.ultTimer=380;
          const ox2=this.cx;
          addFX({type:'bigText',x:this.cx,y:this.cy-64,text:'HAIRPIN',color:col,t:850});
          addFX({type:'screenFlash',color:col,t:230,alpha:0.42,dur:230});
          spawnParticles(this.cx,this.cy,col,48);
          const tx=opp?opp.cx-(this.facing>0?PW+4:-PW-4):this.cx+this.facing*300;
          this.x=Math.max(0,Math.min(W-PW,tx-PW/2));
          addFX({type:'speedTrail',x1:ox2,x2:this.cx,y:this.cy,color:col,t:420});
          spawnParticles(this.cx,this.cy,col,38);
          if(opp&&this._dist(opp)<160){
            this.dealDamage(opp,32);
            opp.strawDollMarked=true;opp.strawDollMarkTimer=12000;
            addFX({type:'bigText',x:opp.cx,y:opp.y-60,text:'MARKED!',color:'#fff',t:950});
            addFX({type:'burstRing',x:opp.cx,y:opp.cy,color:col,t:420,r:62});
            addFX({type:'screenShake',t:260,mag:9});
            spawnParticles(opp.cx,opp.cy,col,38);
          }
          break;}
      }
    }
  }

  draw(){
    ctx.save();
    const col=this.color;
    // During malevolent shrine domain: opponent is transparent/ghostly
    const opp2=this===p1?p2:p1;
    const underShrine=opp2&&opp2.domainActive&&opp2.charName==='Shrine';
    if(underShrine){ctx.globalAlpha=0.32;}
    else if(this.hurtAnim>0)ctx.globalAlpha=0.45+0.55*Math.sin(this.hurtAnim*0.1);
    // Thunder God blue glow fades quickly on skill use
    const tgGlowing=this.charName==='Thunder God'&&this.thunderSkillGlow>0;
    let glowAmt=tgGlowing?50:(this.inThunderUlt?45:(this.ultActive?42:(this.atkAnim>0?20:(this.stagnationReady?22:0))));
    let glowCol=tgGlowing?'#00aaff':(this.inThunderUlt?'#aa00ff':(this.stagnationReady?'#99aaff':col));
    if(this.jackpotActive){glowAmt=100;glowCol='#00ff55';}
    if(this.chargeTimer>0)glowAmt=Math.max(glowAmt,12);
    if(this.chargeTimer>0&&!tgGlowing&&!this.inThunderUlt)glowCol=this.chargeOwnerColor;
    if(glowAmt>0){ctx.shadowColor=glowCol;ctx.shadowBlur=glowAmt;}
    const dc=this.stunned>0||this.infiniteVoidActive?'#3a2a60':(this.blocking?this.def.accent:(this.inThunderUlt?'#aa00ff':col));
    ctx.fillStyle=dc;
    ctx.fillRect(this.x+8,this.y+PH*0.57,PW*0.35,PH*0.43);
    ctx.fillRect(this.x+PW*0.58,this.y+PH*0.57,PW*0.35,PH*0.43);
    ctx.fillRect(this.x+5,this.y+PH*0.2,PW-10,PH*0.38);
    ctx.fillRect(this.x+11,this.y,PW-22,PH*0.21);
    if(this.atkAnim>0){ctx.shadowBlur=22;const ax=this.facing>0?this.x+PW:this.x-22;ctx.fillRect(ax,this.y+PH*0.22,22,PH*0.28);}
    else{ctx.shadowBlur=0;ctx.fillRect(this.x-8,this.y+PH*0.2,9,PH*0.3);ctx.fillRect(this.x+PW-1,this.y+PH*0.2,9,PH*0.3);}
    ctx.shadowBlur=0;
    if(this.infiniteVoidActive){ctx.shadowBlur=18;ctx.shadowColor='#aa88ff';ctx.fillStyle='#cc88ff';ctx.fillRect(this.x+11,this.y+4,PW-22,PH*0.21);ctx.fillStyle='#fff';for(let i=0;i<6;i++)ctx.fillRect(this.x+11+Math.random()*(PW-22),this.y+Math.random()*PH*0.21,3,3);}
    else{ctx.shadowBlur=0;ctx.fillStyle=this.inThunderUlt?'#ffffff':'#000';const ex=this.facing>0?this.x+PW*0.58:this.x+PW*0.15;ctx.fillRect(ex,this.y+6,9,6);if(this.inThunderUlt){ctx.fillStyle='#ffffff';ctx.shadowColor='#fff';ctx.shadowBlur=15;ctx.fillRect(ex,this.y+6,9,6);}else if(this.ultActive&&(this.charName==='Limitless'||this.charName==='Thunder God')){ctx.fillStyle=col;ctx.fillRect(ex,this.y+6,9,6);}}

    // Straw Doll: MARKED indicator on this player
    if(this.strawDollMarked){
      const _t=Date.now()*0.003;
      ctx.save();ctx.globalAlpha=0.45+0.2*Math.sin(_t*10);
      ctx.strokeStyle='#ff8822';ctx.lineWidth=2;ctx.shadowColor='#ff8822';ctx.shadowBlur=16;
      ctx.setLineDash([5,4]);ctx.strokeRect(this.x-5,this.y-5,PW+10,PH+10);ctx.setLineDash([]);
      [[this.x,this.y],[this.x+PW,this.y],[this.x,this.y+PH],[this.x+PW,this.y+PH]].forEach(([nx,ny])=>{
        ctx.fillStyle='#ff8822';ctx.globalAlpha=0.9;ctx.beginPath();ctx.arc(nx,ny,3.5,0,Math.PI*2);ctx.fill();});
      ctx.globalAlpha=0.8+0.2*Math.sin(_t*8);txt('⛩ MARKED',this.cx,this.y-14,8,'#ff8822');
      ctx.restore();
    }
    // THE ZONE aura
    if(this.zoneActive){
      const _t=Date.now()*0.003;
      ctx.save();ctx.globalAlpha=0.32+0.18*Math.sin(_t*12);
      ctx.strokeStyle='#ffaa00';ctx.lineWidth=3;ctx.shadowColor='#ffaa00';ctx.shadowBlur=22;
      ctx.beginPath();ctx.arc(this.cx,this.cy,PW*0.92,0,Math.PI*2);ctx.stroke();
      for(let _i=0;_i<6;_i++){const _a=_i/6*Math.PI*2+_t*5;ctx.globalAlpha=0.5;ctx.fillStyle='#ffaa00';ctx.beginPath();ctx.arc(this.cx+Math.cos(_a)*PW*0.92,this.cy+Math.sin(_a)*PW*0.92,2.5,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=0.65+0.3*Math.sin(_t*8);txt('ZONE',this.cx,this.y+PH+14,8,'#ffaa00');
      ctx.restore();
    }
    // Thunder ult purple aura
    if(this.inThunderUlt){
      const t2=Date.now()*0.001;
      ctx.shadowBlur=0;
      for(let i=0;i<6;i++){const ang=i/6*Math.PI*2+t2*3,r1=40,r2=65+Math.sin(t2*8+i)*15;ctx.globalAlpha=0.7;ctx.strokeStyle='#aa00ff';ctx.lineWidth=2;ctx.shadowColor='#aa00ff';ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(this.cx+Math.cos(ang)*r1,this.cy+Math.sin(ang)*r1);ctx.lineTo(this.cx+Math.cos(ang+0.35)*r2,this.cy+Math.sin(ang+0.35)*r2);ctx.stroke();}
      ctx.globalAlpha=1;
    }

    // Charge debuff visual
    if(this.chargeTimer>0){
      const t2=Date.now()*0.008;
      for(let i=0;i<4;i++){const ang=i*Math.PI/2+t2,r=48+Math.sin(t2*4+i)*10;ctx.globalAlpha=0.65;ctx.strokeStyle=this.chargeOwnerColor;ctx.lineWidth=2;ctx.shadowColor=this.chargeOwnerColor;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(this.cx+Math.cos(ang)*r,this.cy+Math.sin(ang)*r);ctx.lineTo(this.cx+Math.cos(ang+0.5)*(r+14),this.cy+Math.sin(ang+0.5)*(r+14));ctx.stroke();}
      ctx.globalAlpha=1;
    }

    // Star Rage: imaginary mass aura — orbiting stars + event horizon glow
    if(this.charName==='Star Rage'){
      const t2=Date.now()*0.001;
      const bhActive=this.ultActive;
      // Always draw subtle orbiting stars
      for(let i=0;i<6;i++){
        const a=i/6*Math.PI*2+t2*(bhActive?4:2);
        const r=bhActive?70:50;
        const sx=this.cx+Math.cos(a)*r,sy=this.cy+Math.sin(a)*r*0.6;
        const ss=bhActive?5:3.5;
        ctx.globalAlpha=0.7+0.3*Math.sin(t2*5+i);
        ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=bhActive?14:8;
        ctx.beginPath();ctx.arc(sx,sy,ss,0,Math.PI*2);ctx.fill();
        // Star tail
        ctx.globalAlpha=0.3;ctx.strokeStyle=col;ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(sx,sy);
        ctx.lineTo(sx-Math.cos(a)*12,sy-Math.sin(a)*12);ctx.stroke();
      }
      if(bhActive){
        // Black hole ult: strong distortion ring around player
        ctx.globalAlpha=0.55+0.2*Math.sin(t2*8);
        ctx.strokeStyle=col;ctx.lineWidth=3;ctx.shadowColor=col;ctx.shadowBlur=22;
        ctx.beginPath();ctx.arc(this.cx,this.cy,70,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha=0.25;ctx.setLineDash([5,4]);
        ctx.beginPath();ctx.arc(this.cx,this.cy,95,0,Math.PI*2);ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.globalAlpha=1;ctx.shadowBlur=0;
    }
    // Fever Dreamer: jackpot aura (during domain OR standalone 14s)
    if(this.charName==='Fever Dreamer'&&(this.ultActive||this.jackpotActive)){
      const t2=Date.now()*0.001;
      if(this.jackpotActive){
        // Bright green pulse ring
        ctx.globalAlpha=0.55+0.3*Math.sin(t2*10);
        ctx.strokeStyle='#44ff88';ctx.lineWidth=4;ctx.shadowColor='#44ff88';ctx.shadowBlur=35;
        ctx.strokeRect(this.x-18,this.y-18,PW+36,PH+36);
        // Green sparkles orbiting
        for(let i=0;i<8;i++){const a=i/8*Math.PI*2+t2*4,r=58+Math.sin(t2*6+i)*10;
          ctx.globalAlpha=0.75+0.25*Math.sin(t2*8+i);
          ctx.fillStyle=i%2===0?'#44ff88':'#ffcc00';ctx.shadowColor='#44ff88';ctx.shadowBlur=12;
          ctx.beginPath();ctx.arc(this.cx+Math.cos(a)*r,this.cy+Math.sin(a)*r*0.7,5,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
        // Standalone jackpot: show timer above head
        if(!this.ultActive&&this.jackpotTimer>0){
          const secs=Math.ceil(this.jackpotTimer/1000);
          ctx.font='bold 13px "Courier New"';ctx.textAlign='center';
          ctx.fillStyle='#44ff88';ctx.shadowColor='#44ff88';ctx.shadowBlur=12;
          ctx.fillText('★JP '+secs+'s',this.cx,this.y-80);
          ctx.shadowBlur=0;
        }
      } else {
        // Normal domain pulse (green, no jackpot yet)
        ctx.globalAlpha=0.25+0.15*Math.sin(t2*5);
        ctx.strokeStyle=this.color;ctx.lineWidth=2;ctx.shadowColor=this.color;ctx.shadowBlur=15;
        ctx.strokeRect(this.x-12,this.y-12,PW+24,PH+24);
        ctx.globalAlpha=1;
      }
      // Slot display above player (only during domain)
      if(this.ultActive){
        const sw=90,sh=36,sx2=this.cx-sw/2,sy2=this.y-72;
        ctx.globalAlpha=0.92;
        ctx.fillStyle='#0a0a0a';ctx.fillRect(sx2,sy2,sw,sh);
        ctx.strokeStyle=this.jackpotActive?'#44ff88':this.color;ctx.lineWidth=2;
        ctx.strokeRect(sx2,sy2,sw,sh);
        const spinning=this.jackpotSpinAnim>0;
        for(let d=0;d<3;d++){
          const rx=sx2+7+d*28,ry=sy2+4;
          ctx.fillStyle='#111';ctx.fillRect(rx,ry,22,28);
          ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.strokeRect(rx,ry,22,28);
          const dv=spinning?Math.floor(Date.now()*0.01+d*3)%10:this.jackpotDigits[d];
          ctx.shadowColor=this.jackpotActive?'#44ff88':this.color;ctx.shadowBlur=8;
          ctx.font='bold 18px "Courier New"';ctx.textAlign='center';
          ctx.fillStyle=this.jackpotActive?'#44ff88':'#aaffcc';
          ctx.fillText(String(dv),rx+11,ry+21);
        }
        ctx.shadowBlur=0;ctx.globalAlpha=1;
      }
    } // end Fever Dreamer aura

    ctx.globalAlpha=1;ctx.shadowBlur=0;
    // Player badge
    ctx.shadowColor=col; ctx.shadowBlur=10;
    ctx.fillStyle=col; ctx.fillRect(this.cx-18,this.y-22,36,14);
    ctx.shadowBlur=0;
    txt('P'+this.num,this.cx,this.y-12,10,'#000','center',true);

    if(this.stagnationReady){ctx.strokeStyle='#aabbff';ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.strokeRect(this.x-5,this.y-5,PW+10,PH+10);ctx.setLineDash([]);}
    if(this.domainActive){const p=0.4+0.35*Math.sin(Date.now()*0.009);ctx.globalAlpha=p;ctx.strokeStyle=col;ctx.lineWidth=4;ctx.shadowColor=col;ctx.shadowBlur=20;ctx.strokeRect(this.x-14,this.y-14,PW+28,PH+28);}
    ctx.restore();
  }
}