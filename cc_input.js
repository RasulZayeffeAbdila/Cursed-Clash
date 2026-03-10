// ── CURSED CLASH · cc_input.js ── onKeyDown, onMouseClick handlers
// ── INPUT HANDLERS ──
function onKeyDown(k){
  const c1=getCtrl(1),c2=getCtrl(2);
  if(state==='characterselect'){
    if(k===c1.l){p1Idx=(p1Idx-1+CHAR_NAMES.length)%CHAR_NAMES.length;p1Conf=false;SFX.charBrowse();}
    if(k===c1.r){p1Idx=(p1Idx+1)%CHAR_NAMES.length;p1Conf=false;SFX.charBrowse();}
    if(k===c1.u&&!p1Conf){p1Conf=true;SFX.uiConfirm();}
    if(!aiEnabled&&!trainingMode&&k===c2.l){p2Idx=(p2Idx-1+CHAR_NAMES.length)%CHAR_NAMES.length;p2Conf=false;SFX.charBrowse();}
    if(!aiEnabled&&!trainingMode&&k===c2.r){p2Idx=(p2Idx+1)%CHAR_NAMES.length;p2Conf=false;SFX.charBrowse();}
    if(!aiEnabled&&!trainingMode&&k===c2.u&&!p2Conf){p2Conf=true;SFX.uiConfirm();}
    if((aiEnabled||trainingMode)&&p1Conf&&!p2Conf){p2Conf=true;}
    if(p1Conf&&p2Conf){
      if(gameMode==='bindedbattle'){
        p1VowOptions=randomVowOptions();p2VowOptions=randomVowOptions();
        p1VowIdx=0;p2VowIdx=0;p1VowConf=false;p2VowConf=false;
        p1Vow=null;p2Vow=null;
        setTimeout(()=>{state='vowselect';},80);
      } else if(trainingMode){setTimeout(startTraining,80);}
      else{setTimeout(startMatch,80);}
    }
    return;
  }
  if(state==='vowselect'){
    if(!p1VowConf){if(k===c1.l)p1VowIdx=(p1VowIdx+2)%3;if(k===c1.r)p1VowIdx=(p1VowIdx+1)%3;if(k===c1.u){p1VowConf=true;SFX.vowBind();}}
    if(!p2VowConf){if(k===c2.l)p2VowIdx=(p2VowIdx+2)%3;if(k===c2.r)p2VowIdx=(p2VowIdx+1)%3;if(k===c2.u){p2VowConf=true;SFX.vowBind();}}
    if(p1VowConf&&p2VowConf){
      p1Vow=p1VowOptions[p1VowIdx];p2Vow=p2VowOptions[p2VowIdx];
      setTimeout(startMatch,80);
    }
    return;
  }
  if(state==='matchover'||state==='gameover'){
    if(k==='Enter')resetToMenu();
    if(k==='r'||k==='R')rematch();
    return;
  }
  if(state==='playing'&&trainingMode){
    if(k==='Enter'){resetToMenu();return;}
    if(k==='r'||k==='R'){resetTraining();return;}
  }
  if(state!=='playing')return;
  // Rhythm clash: intercept skill keys during fight phase
  if(domainClash&&domainClash.active&&domainClash.phase==='fight'){
    const laneIdx1=c1.sk.slice(0,3).indexOf(k);
    if(laneIdx1>=0)rhythmClashKeyHit(1,laneIdx1);
    const laneIdx2=c2.sk.slice(0,3).indexOf(k);
    if(laneIdx2>=0)rhythmClashKeyHit(2,laneIdx2);
    return;
  }
  if(k===c1.sk[0])p1.useSkill(0,p2);if(k===c1.sk[1])p1.useSkill(1,p2);if(k===c1.sk[2])p1.useSkill(2,p2);if(k===c1.sk[3])tryActivateDomain(p1,p2);
  if(!aiEnabled&&!trainingMode){if(k===c2.sk[0])p2.useSkill(0,p1);if(k===c2.sk[1])p2.useSkill(1,p1);if(k===c2.sk[2])p2.useSkill(2,p1);if(k===c2.sk[3])tryActivateDomain(p2,p1);}
}

function onMouseClick(cx,cy){
  if(state==='mainmenu'){
    if(isHov(W/2-140,220,280,62)){SFX.uiConfirm();state='playmenu';}
    if(isHov(W/2-140,300,280,62)){SFX.uiClick();infoScroll=0;state='infopage';}
    if(isHov(W/2-140,380,280,62)){SFX.uiClick();histScroll=0;state='historypage';}
    if(isHov(W/2-140,460,280,62)){SFX.uiClick();patchScroll=0;state='patchnotes';}
    if(isHov(W/2-140,540,280,62)){SFX.uiClick();state='keybinds';}

  } else if(state==='playmenu'){
    if(isHov(40,30,110,38)){SFX.uiBack();state='mainmenu';}
    if(isHov(W/2-190,118,380,72)){SFX.uiConfirm();gameMode='casual';p1Conf=false;p2Conf=false;aiEnabled=false;trainingMode=false;state='characterselect';}
    if(isHov(W/2-190,215,380,72)){SFX.uiConfirm();gameMode='quickplay';p1Conf=false;p2Conf=false;aiEnabled=false;trainingMode=false;state='characterselect';}
    if(isHov(W/2-190,312,380,72)){SFX.uiConfirm();gameMode='bindedbattle';p1Conf=false;p2Conf=false;aiEnabled=false;trainingMode=false;state='characterselect';}
    if(isHov(W/2-190,409,380,72)){SFX.uiConfirm();gameMode='pvai';aiEnabled=false;trainingMode=false;state='aidiffselect';}
    if(isHov(W/2-190,506,380,72)){SFX.uiConfirm();gameMode='training';trainingMode=true;aiEnabled=false;p1Idx=0;p2Idx=1;p1Conf=false;p2Conf=false;state='characterselect';}
  } else if(state==='matchover'){
    if(isHov(W/2-212,H/2+120,200,48)){SFX.uiConfirm();rematch();}
    if(isHov(W/2+12,H/2+120,200,48)){SFX.uiBack();resetToMenu();}
  } else if(state==='aidiffselect'){
    if(isHov(40,30,110,38)){SFX.uiBack();state='playmenu';return;}
    const bx=W/2-200,bw=400,bh=78;
    const diffs=['grade3','grade1','special','unclassified'];
    diffs.forEach((d,i)=>{
      const by=158+i*(bh+14);
      if(isHov(bx,by,bw,bh)&&aiIsUnlocked(d)){
        SFX.uiConfirm();aiEnabled=true;aiDifficulty=d;
        // Pick a random char for P2, then let P1 pick
        p2Idx=Math.floor(Math.random()*CHAR_NAMES.length);
        p1Idx=0;p1Conf=false;p2Conf=false;
        state='characterselect';
      }
    });
  } else if(state==='vowselect'){
    if(isHov(40,20,120,38)){SFX.uiBack();state='characterselect';p1Conf=false;p2Conf=false;}
  } else if(state==='infopage'){
    if(isHov(40,20,120,38)){SFX.uiBack();state='mainmenu';}
  } else if(state==='keybinds'){
    if(isHov(40,20,120,38)){SFX.uiBack();state='mainmenu';}
    // P1 movement preset — matches _panel(50,105,...) b1x=170,b2x=390,by=177
    if(isHov(170,177,200,44)){SFX.uiClick();p1MovPreset=1;}
    if(isHov(390,177,200,44)){SFX.uiClick();p1MovPreset=2;}
    // P1 skill preset — by=105+146=251
    if(isHov(170,251,200,44)){SFX.uiClick();p1SkPreset=1;}
    if(isHov(390,251,200,44)){SFX.uiClick();p1SkPreset=2;}
    // P2 movement preset — px=655, b1x=775, b2x=995, by=177
    if(isHov(775,177,200,44)){SFX.uiClick();p2MovPreset=1;}
    if(isHov(995,177,200,44)){SFX.uiClick();p2MovPreset=2;}
    // P2 skill preset — by=251
    if(isHov(775,251,200,44)){SFX.uiClick();p2SkPreset=1;}
    if(isHov(995,251,200,44)){SFX.uiClick();p2SkPreset=2;}
  } else if(state==='patchnotes'){
    if(isHov(40,20,120,38)){SFX.uiBack();state='mainmenu';}
    if(isHov(W-200,20,160,38)){patchHideMinor=!patchHideMinor;patchScroll=0;}
  } else if(state==='historypage'){
    if(isHov(40,12,120,34)){SFX.uiBack();state='mainmenu';}
    if(isHov(W-200,12,165,34)){clearHistory();}
  }
}