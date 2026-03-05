// ── CURSED CLASH · cc_flow.js ── startMatch, startRound, endRound, resetToMenu
// ── GAME FLOW ──
function startMatch(){
  p1RoundWins=0;p2RoundWins=0;roundNum=1;matchRoundsData=[];
  startRound();
}

function startRound(){
  roundEndFired=false;
  bindedMatchTimer=0;
  const same=p1Idx===p2Idx;
  p1=new Player(CHAR_NAMES[p1Idx],200,1,1,false);
  p2=new Player(CHAR_NAMES[p2Idx],W-200-PW,-1,2,same);
  effects=[];particles=[];pendingDomainP1=null;pendingDomainP2=null;domainClash=null;
  // Apply Binding Vows for Binded Battle (after clearing effects so announcements survive)
  if(gameMode==='bindedbattle'){
    if(p1Vow){p1.vow=p1Vow;p1.vowData={enchainTimer:5000,eyeAcc:0,adaptStacks:0,adaptAcc:0,ultUsed:false};}
    if(p2Vow){p2.vow=p2Vow;p2.vowData={enchainTimer:5000,eyeAcc:0,adaptStacks:0,adaptAcc:0,ultUsed:false};}
    if(p1Vow==='discharged'||p1Vow==='overwhelming')p1.ult=MAX_ULT;
    if(p2Vow==='discharged'||p2Vow==='overwhelming')p2.ult=MAX_ULT;
    if(p1Vow==='cursedVitality'){p1.maxHp+=250;p1.hp=p1.maxHp;}
    if(p2Vow==='cursedVitality'){p2.maxHp+=250;p2.hp=p2.maxHp;}
    if(p1Vow==='cursedRegen')p1.vowData.regenAcc=0;
    if(p2Vow==='cursedRegen')p2.vowData.regenAcc=0;
    setTimeout(()=>{
      if(p1&&p1.vow)addFX({type:'vowBanner',vow:p1.vow,side:'left',t:3200});
      if(p2&&p2.vow)addFX({type:'vowBanner',vow:p2.vow,side:'right',t:3200});
    },400);
  }
  countdownTimer=3800;state='countdown';
}

let roundEndFired=false;
function endRound(winnerNum){
  // PvAI: check Unclassified unlock (player beat Shrine bot)
  if(aiEnabled && winnerNum===1 && p2 && p2.charName==='Shrine'){
    const needed=['grade3','grade1','special'];
    const key='cc_shrine_wins';
    try{
      const wins=JSON.parse(localStorage.getItem(key)||'[]');
      if(!wins.includes(aiDifficulty))wins.push(aiDifficulty);
      localStorage.setItem(key,JSON.stringify(wins));
      if(needed.every(d=>wins.includes(d))) aiUnlockUnclassified();
    }catch(e){}
  }
  if(roundEndFired)return;
  roundEndFired=true;
  SFX.ko();
  setTimeout(()=>SFX.roundWin(),600);
  roundWinnerNum=winnerNum;
  if(winnerNum===1)p1RoundWins++;else p2RoundWins++;
  matchRoundsData.push({round:roundNum,winner:winnerNum,p1HpLeft:Math.ceil(p1.hp),p2HpLeft:Math.ceil(p2.hp)});
  roundEndTimer=2800;state='roundend';
  const wn=winsNeeded();const maxR=GAME_MODES[gameMode].rounds.length;
  const matchDone=p1RoundWins>=wn||p2RoundWins>=wn||roundNum>=maxR;
  setTimeout(()=>{
    if(matchDone){
      const winner=p1RoundWins>p2RoundWins?'P1':(p2RoundWins>p1RoundWins?'P2':'Draw');
      saveHistory({id:Date.now(),date:new Date().toLocaleString(),mode:GAME_MODES[gameMode].name,p1Char:CHAR_NAMES[p1Idx],p2Char:CHAR_NAMES[p2Idx],p1Color:p1.color,p2Color:p2.color,p1Wins:p1RoundWins,p2Wins:p2RoundWins,winner,totalRounds:roundNum,rounds:matchRoundsData});
      state='matchover';
    } else {
      roundNum++;startRound();
    }
  },2800);
}

function resetToMenu(){
  roundEndFired=false;
  p1=p2=null;p1Conf=p2Conf=false;effects=[];particles=[];
  pendingDomainP1=null;pendingDomainP2=null;domainClash=null;
  roundNum=1;p1RoundWins=0;p2RoundWins=0;
  p1Vow=null;p2Vow=null;bindedMatchTimer=0;
  state='mainmenu';
  resetAI();
}