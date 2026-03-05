// ── CURSED CLASH · cc_chars.js ── character data + global state
// To add a new character: add entry to CHARS object, add skill method to cc_player.js,
//   add icon to cc_icons.js, add AI skill logic to cc_ai.js
// ── CHARACTERS  (all colors are 6-digit hex) ──
// P1 = bright/light variant   P2 = dark variant of same hue
const CHARS={
  'Projection Sorcery':{
    // vivid electric cyan — high contrast vs Heavenly Restriction grey
    color:'#00eeff', color2:'#006688', glow:'#00bbdd', accent:'#aaffff',
    desc:['Moves at 24fps during skill use','Spatial mastery & precision'],
    skills:[
      {name:'Flash Step',cd:80,desc:'Streak dash — 10dmg flat, range grows each hit. 3s window to continue. Miss at ×3+ = 10s cooldown.'},
      {name:'Rapid Barrage',cd:3800,desc:'Fire 4 tracking energy bolts — 12dmg each. Bolts home toward opponent.'},
      {name:'Stagnation',cd:6500,desc:'Charge next hit to freeze opponent in time — 2s stun.'},
      {name:'Time Cell Moon Palace',cd:0,isUlt:true,desc:'DOMAIN 7.5s: 5dmg/5 steps, 5dmg/jump, 30dmg/skill. No damage cap. Opponent moves 0.5x speed.'}]},
  'Heavenly Restriction':{
    // steel grey / dark slate
    color:'#c8c8d8', color2:'#444455', glow:'#9999aa', accent:'#eeeeff',
    desc:['Zero cursed energy — pure body','Immune to ALL domains & void'],
    skills:[
      {name:'Crushing Blow',cd:2200,desc:'Massive punch — 36dmg + heavy knockback. Launches opponent on hit.'},
      {name:'Iron Guard',cd:7500,desc:'Hex energy barrier absorbs ALL incoming hits for 2.5 seconds.'},
      {name:'Seismic Slam',cd:5800,desc:'Leap up, slam down — ground shockwave 30dmg in 240px range.'},
      {name:'Maximum Output',cd:0,isUlt:true,desc:'ULTIMATE 10s: All damage dealt is tripled. Cannot domain clash.'}]},
  'Shrine':{
    // vivid red / deep crimson
    color:'#ff3355', color2:'#880011', glow:'#ff0022', accent:'#ffbbcc',
    desc:["Sukuna's innate cursed technique","Cleaves and dismantles all in range"],
    skills:[
      {name:'Cleave',cd:1800,desc:'Wide arc slash — 32dmg, massive 160px range. Spinning arc visual.'},
      {name:'Dismantle',cd:2800,desc:'Traveling cross-shaped slash projectile — 26dmg on contact.'},
      {name:'Slash Flood',cd:5200,desc:'Vortex of 6 rotating slashes erupts — 14dmg each hit (84dmg max).'},
      {name:'Malevolent Shrine',cd:0,isUlt:true,desc:'DOMAIN 5s: 10dmg every 0.25s — no cap. Massive slashing VFX. Opponent rendered transparent.'}]},
  'Limitless':{
    // sky blue / deep navy blue
    color:'#55aaff', color2:'#112299', glow:'#3388ff', accent:'#cce8ff',
    desc:["Gojo's Infinity & Six Eyes","Red pushes, Blue pulls, Purple destroys"],
    skills:[
      {name:'Cursed Red',cd:2800,desc:'Red repulsion orb — 28dmg + massive pushback on contact. Fire trail.'},
      {name:'Cursed Blue',cd:3200,desc:'Gravity vortex pulls opponent toward you over 1.1s — 20dmg on arrival.'},
      {name:'Hollow Purple',cd:7000,desc:'Red + Blue merge into hollow sphere — 55dmg, largest hitbox.'},
      {name:'Infinite Void',cd:0,isUlt:true,desc:'DOMAIN: Overwhelm opponent with infinite information — 5s complete immobility. HR immune.'}]},
  'Thunder God':{
    // gold / dark gold  — ult form overrides to purple via get color()
    color:'#ffcc33', color2:'#aa7700', glow:'#ffaa00', accent:'#fff0aa',
    // ult colors stored separately (light purple P1 / dark purple P2)
    ultColor:'#cc99ff', ultColor2:'#6622bb',
    desc:["Kashimo's electric cursed technique","Lightning speed, destructive voltage"],
    skills:[
      {name:'Bolt Strike',cd:2000,desc:'Fast electric bolt — 20dmg + 0.8s stun on hit. Homes toward opponent.'},
      {name:'Static Rush',cd:3500,desc:'Electrifying dash — 15dmg + applies Charge DoT (8dmg/s × 3s).'},
      {name:'Voltage Cage',cd:5500,desc:'Plant electric trap — triggers on contact: 32dmg + 1.5s stun. Lasts 8s.'},
      {name:'Mythical Beast Amber',cd:0,isUlt:true,desc:'TRANSFORM 30s: Purple ult form, new skills, but LOSE 10HP/s. Instant death on expiry. Cannot domain clash.'}]},
  'Fever Dreamer':{
    // vivid green / deep forest — Hakari
    color:'#44ff88', color2:'#115533', glow:'#22cc66', accent:'#aaffcc',
    desc:["Hakari's rough cursed energy","Gambling with death — jackpot or nothing"],
    skills:[
      {name:'Heavy Slug',cd:1800,desc:'Rough CE close punch — 34dmg+stagger. 50dmg in jackpot. 120px range.'},
      {name:'Iron Ball',cd:2800,desc:'Summon heavy metal ball from nowhere — 25dmg+knockback. 38dmg in jackpot.'},
      {name:'Cursed Door',cd:5000,desc:'Door erupts from void — traps opponent 1.5s then launches 20dmg.'},
      {name:'Idle Death Gamble',cd:0,isUlt:true,desc:'DOMAIN 11s: Every 2.5s — 30% JACKPOT: +50HP/s + enhanced skills for 14 seconds.'}]},
  'Star Rage':{
    // Deep black/white with hot-pink/magenta star accent — very distinct
    color:'#ff44cc', color2:'#220033', glow:'#ff00aa', accent:'#ffffff',
    desc:["Yuki's Imaginary Mass technique","Accumulates mass with no restraint — becomes a black hole"],
    cantDomainClash:true,
    skills:[
      {name:'Mass Burst',cd:2000,desc:'Slam with full imaginary mass — 45dmg + massive knockback in 240px. Ground shockwave.'},
      {name:'Imaginary Mass',cd:3000,desc:'Wind-up, then fire a fast dense mass in a straight line — 40dmg. Heavy impact VFX on hit.'},
      {name:'Mass Augment',cd:5000,desc:'Charge yourself with imaginary mass — powered slam: 55dmg + extreme knockback. Short wind-up.'},
      {name:'Black Hole',cd:0,isUlt:true,desc:'Throw a slow orb — activate on proximity or press ult again. 10s: pulls EVERYWHERE. 20dmg/s user, 30dmg/s enemy. Cannot domain clash.'}]},
  'Straw Doll':{
    // Nobara Kugisaki — warm orange, cursed tool fighter
    color:'#ff8822', color2:'#882200', glow:'#ffaa44', accent:'#ffddb0',
    cantDomainClash:true,
    desc:["Kugisaki's Straw Doll technique","Resonance shatters body and soul alike"],
    skills:[
      {name:'Hammer Strike',cd:2000,desc:'Overhead hammer slam — 34dmg + heavy stagger, 160px range.'},
      {name:'Nail Barrage',cd:3200,desc:'Fire 3 nails in a spread — 18dmg each, 54 max.'},
      {name:'Resonance',cd:5000,desc:'Drive nail into straw doll — 28dmg + MARKS enemy for 12s, enabling Marked moveset.'},
      {name:'Hairpin',cd:0,isUlt:true,desc:'Fast hairpin dash — 32dmg on hit + MARKS enemy. Enables Marked moveset.'}],
    markedSkills:[
      {name:'Resonance Strike',cd:2000,desc:'[MARKED] Hammer + nail through doll — 55dmg. Consumes mark.'},
      {name:'Soul Rend',cd:3200,desc:'[MARKED] Pierce soul via doll — 45dmg + 1.5s stun. Consumes mark.'},
      {name:'Divergence',cd:5000,desc:'[MARKED] Explosive CE burst through doll — 65dmg AoE. Consumes mark.'},
      {name:'Black Flash',cd:0,isUlt:true,desc:'[MARKED] Far Black Flash dash — 90dmg on hit + THE ZONE (×1.2 dmg, 10s). Consumes mark.'}]}
};
const CHAR_NAMES=Object.keys(CHARS);

// ── STATE ──
let state='mainmenu';
let p1Idx=0,p2Idx=1,p1Conf=false,p2Conf=false;
let p1,p2,gameMode='casual';
let effects=[],particles=[];
let shakeX=0,shakeY=0;
let pendingDomainP1=null,pendingDomainP2=null,domainClash=null;
let roundNum=1,p1RoundWins=0,p2RoundWins=0;
let countdownTimer=0,roundEndTimer=0,roundWinnerNum=0;
let infoScroll=0,histScroll=0;
let matchRoundsData=[];
let p1VowOptions=[],p2VowOptions=[],p1VowIdx=0,p2VowIdx=0,p1VowConf=false,p2VowConf=false;
let p1Vow=null,p2Vow=null;
let bindedMatchTimer=0;

function roundHP(r){const mode=GAME_MODES[gameMode];return mode.rounds[Math.min(r-1,mode.rounds.length-1)];}
function winsNeeded(){return GAME_MODES[gameMode].winsNeeded;}