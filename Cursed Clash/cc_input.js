// ── CURSED CLASH · cc_input.js ── onKeyDown, onMouseClick handlers
// ── INPUT HANDLERS ──
function onKeyDown(k){
  if(state==='characterselect'){
    if(k==='q'){p1Idx=(p1Idx-1+CHAR_NAMES.length)%CHAR_NAMES.length;p1Conf=false;}
    if(k==='e'){p1Idx=(p1Idx+1)%CHAR_NAMES.length;p1Conf=false;}
    if(k==='w'&&!p1Conf)p1Conf=true;
    if(!aiEnabled&&k==='u'){p2Idx=(p2Idx-1+CHAR_NAMES.length)%CHAR_NAMES.length;p2Conf=false;}
    if(!aiEnabled&&k==='o'){p2Idx=(p2Idx+1)%CHAR_NAMES.length;p2Conf=false;}
    if(!aiEnabled&&k==='i'&&!p2Conf)p2Conf=true;
    if(aiEnabled&&p1Conf&&!p2Conf){
      // Bot auto-confirms immediately
      p2Conf=true;
    }
    if(p1Conf&&p2Conf){
      if(gameMode==='bindedbattle'){
        p1VowOptions=randomVowOptions();p2VowOptions=randomVowOptions();
        p1VowIdx=0;p2VowIdx=0;p1VowConf=false;p2VowConf=false;
        p1Vow=null;p2Vow=null;
        setTimeout(()=>{state='vowselect';},80);
      } else {setTimeout(startMatch,80);}
    }
    return;
  }
  if(state==='vowselect'){
    if(!p1VowConf){if(k==='q')p1VowIdx=(p1VowIdx+2)%3;if(k==='e')p1VowIdx=(p1VowIdx+1)%3;if(k==='w'){p1VowConf=true;SFX.vowBind();}}
    if(!p2VowConf){if(k==='u')p2VowIdx=(p2VowIdx+2)%3;if(k==='o')p2VowIdx=(p2VowIdx+1)%3;if(k==='i'){p2VowConf=true;SFX.vowBind();}}
    if(p1VowConf&&p2VowConf){
      p1Vow=p1VowOptions[p1VowIdx];p2Vow=p2VowOptions[p2VowIdx];
      setTimeout(startMatch,80);
    }
    return;
  }
  if(state==='matchover'||state==='gameover'){if(k==='Enter')resetToMenu();return;}
  if(state!=='playing')return;
  if(domainClash&&domainClash.active&&domainClash.phase==='fight'){if(['1','2','3'].includes(k))domainClash.p1k++;if(['7','8','9'].includes(k))domainClash.p2k++;return;}
  if(k==='1')p1.useSkill(0,p2); if(k==='2')p1.useSkill(1,p2); if(k==='3')p1.useSkill(2,p2); if(k==='4')tryActivateDomain(p1,p2);
  if(k==='7')p2.useSkill(0,p1); if(k==='8')p2.useSkill(1,p1); if(k==='9')p2.useSkill(2,p1); if(k==='0')tryActivateDomain(p2,p1);
}

function onMouseClick(cx,cy){
  if(state==='mainmenu'){
    if(isHov(W/2-140,250,280,62))state='playmenu';
    if(isHov(W/2-140,335,280,62)){infoScroll=0;state='infopage';}
    if(isHov(W/2-140,420,280,62)){histScroll=0;state='historypage';}
    if(isHov(W/2-140,505,280,62))state='patchnotes';
  } else if(state==='playmenu'){
    if(isHov(40,30,110,38))state='mainmenu';
    if(isHov(W/2-190,118,380,72)){gameMode='casual';p1Conf=false;p2Conf=false;aiEnabled=false;state='characterselect';}
    if(isHov(W/2-190,215,380,72)){gameMode='quickplay';p1Conf=false;p2Conf=false;aiEnabled=false;state='characterselect';}
    if(isHov(W/2-190,312,380,72)){gameMode='bindedbattle';p1Conf=false;p2Conf=false;aiEnabled=false;state='characterselect';}
    if(isHov(W/2-190,409,380,72)){gameMode='pvai';aiEnabled=false;state='aidiffselect';}
  } else if(state==='aidiffselect'){
    if(isHov(40,30,110,38)){state='playmenu';return;}
    const bx=W/2-200,bw=400,bh=78;
    const diffs=['grade3','grade1','special','unclassified'];
    diffs.forEach((d,i)=>{
      const by=158+i*(bh+14);
      if(isHov(bx,by,bw,bh)&&aiIsUnlocked(d)){
        aiEnabled=true;aiDifficulty=d;
        // Pick a random char for P2, then let P1 pick
        p2Idx=Math.floor(Math.random()*CHAR_NAMES.length);
        p1Idx=0;p1Conf=false;p2Conf=false;
        state='characterselect';
      }
    });
  } else if(state==='vowselect'){
    if(isHov(40,20,120,38)){state='characterselect';p1Conf=false;p2Conf=false;}
  } else if(state==='infopage'){
    if(isHov(40,20,120,38))state='mainmenu';
  } else if(state==='patchnotes'){
    if(isHov(40,20,120,38))state='mainmenu';
  } else if(state==='historypage'){
    if(isHov(40,20,120,38))state='mainmenu';
    if(isHov(W-180,20,140,38)){clearHistory();}
  }
}