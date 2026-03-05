// ── CURSED CLASH · cc_sfx.js ── Web Audio SFX engine
// ── SFX ENGINE ──
const SFX=(()=>{
  let ac=null;
  function g(){
    if(!ac)try{ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}
    if(ac.state==='suspended')ac.resume();
    return ac;
  }
  function tone(freq,type,dur,vol){
    const c=g();if(!c)return;
    const o=c.createOscillator(),gn=c.createGain();
    o.type=type;o.frequency.value=freq;
    gn.gain.setValueAtTime(0,c.currentTime);
    gn.gain.linearRampToValueAtTime(vol,c.currentTime+0.005);
    gn.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.005+dur);
    o.connect(gn);gn.connect(c.destination);
    o.start();o.stop(c.currentTime+dur+0.05);
  }
  function sweep(f1,f2,type,dur,vol){
    const c=g();if(!c)return;
    const o=c.createOscillator(),gn=c.createGain();
    o.type=type;o.frequency.setValueAtTime(f1,c.currentTime);
    o.frequency.exponentialRampToValueAtTime(f2,c.currentTime+dur);
    gn.gain.setValueAtTime(vol,c.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur);
    o.connect(gn);gn.connect(c.destination);
    o.start();o.stop(c.currentTime+dur+0.05);
  }
  function noise(dur,vol,lpHz=2000){
    const c=g();if(!c)return;
    const buf=c.createBuffer(1,c.sampleRate*dur,c.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const src=c.createBufferSource(),f=c.createBiquadFilter(),gn=c.createGain();
    f.type='lowpass';f.frequency.value=lpHz;
    gn.gain.setValueAtTime(vol,c.currentTime);gn.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur);
    src.buffer=buf;src.connect(f);f.connect(gn);gn.connect(c.destination);src.start();
  }
  return{
    hit(p=1){noise(0.07,0.28*p,800);tone(80,'sine',0.07,0.3*p)},
    bigHit(){noise(0.14,0.5,450);tone(50,'sine',0.18,0.6);tone(200,'sawtooth',0.05,0.18)},
    block(){tone(900,'square',0.04,0.18);tone(500,'square',0.07,0.14)},
    slash(){noise(0.1,0.2,5000);tone(340,'sawtooth',0.06,0.14)},
    slashHeavy(){noise(0.15,0.38,3500);tone(180,'sawtooth',0.12,0.26)},
    whoosh(){noise(0.16,0.2,8000);sweep(650,180,'sine',0.16,0.2)},
    crush(){noise(0.17,0.45,250);tone(42,'sine',0.22,0.72);tone(90,'sawtooth',0.08,0.26)},
    seismic(){noise(0.5,0.58,180);tone(28,'sine',0.6,0.88);tone(56,'sine',0.3,0.38)},
    guard(){tone(500,'square',0.05,0.28);noise(0.08,0.16,4500)},
    electric(){noise(0.12,0.18,7000);sweep(280,65,'sawtooth',0.15,0.28);sweep(560,130,'square',0.12,0.18)},
    electricBig(){noise(0.35,0.5,6000);sweep(900,85,'sawtooth',0.45,0.55);tone(55,'sine',0.5,0.4)},
    vortex(){noise(0.38,0.28,3000);tone(140,'sawtooth',0.48,0.3)},
    timeStop(){const c=g();if(!c)return;const o=c.createOscillator(),gn=c.createGain();o.type='sine';o.frequency.setValueAtTime(1400,c.currentTime);o.frequency.setValueAtTime(180,c.currentTime+0.04);gn.gain.setValueAtTime(0.4,c.currentTime);gn.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.65);o.connect(gn);gn.connect(c.destination);o.start();o.stop(c.currentTime+0.75)},
    domain(){noise(0.6,0.3,1000);tone(48,'sine',1.4,0.7);tone(96,'sine',0.9,0.35);setTimeout(()=>tone(980,'sine',0.22,0.25),350)},
    domainClash(){noise(0.4,0.45,2200);for(let i=0;i<6;i++)setTimeout(()=>tone(180+Math.random()*380,'sawtooth',0.08,0.25),i*65);tone(52,'sine',0.9,0.52)},
    countdown(){tone(1050,'sine',0.07,0.35)},
    fight(){[0,85,170].forEach((d,i)=>setTimeout(()=>tone(440+i*220,'square',0.1,0.3),d));setTimeout(()=>{noise(0.13,0.25,3000);tone(190,'sawtooth',0.26,0.42)},200)},
    ko(){sweep(700,65,'sine',1.1,0.5);noise(0.25,0.38,350)},
    roundWin(){[0,110,220,330].forEach((d,i)=>{const f=[523,659,784,1047][i];setTimeout(()=>tone(f,'triangle',0.2,0.42),d)})},
    burnout(){noise(0.85,0.7,1500);sweep(1300,32,'sawtooth',1.6,0.65)},
    ultReady(){[0,75].forEach((d,i)=>setTimeout(()=>tone(660+i*330,'sine',0.13,0.28),d))},
    amber(){noise(0.55,0.5,4000);sweep(1100,52,'sawtooth',0.7,0.6);tone(52,'sine',1.0,0.52)},
    godslayer(){noise(0.2,0.4,1200);sweep(1500,78,'sawtooth',0.5,0.5);tone(58,'sine',0.6,0.48)},
    metalClang(){noise(0.18,0.6,400);tone(155,'square',0.1,0.45);sweep(800,200,'sawtooth',0.15,0.28)},
    slug(){noise(0.15,0.65,250);tone(52,'sine',0.18,0.62);tone(140,'sawtooth',0.06,0.22)},
    doorCreak(){sweep(200,80,'sawtooth',0.55,0.35);noise(0.4,0.18,600);tone(95,'sine',0.3,0.25)},
    vowBind(){[0,80,160].forEach((d,i)=>setTimeout(()=>tone([380,300,220][i],'square',0.13,0.35),d));setTimeout(()=>noise(0.5,0.28,1100),170)},
    enchainBurst(){noise(0.28,0.42,900);tone(88,'sawtooth',0.4,0.45);sweep(600,80,'sine',0.38,0.3)},
    overtimeAlert(){[0,120,240].forEach((d,i)=>setTimeout(()=>tone(260+i*130,'square',0.14,0.38),d))}
  };
})();