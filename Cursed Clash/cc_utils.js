// ── CURSED CLASH · cc_utils.js ── text, buttons, history, hex helpers
// ── TEXT HELPER (readable outline) ──
function txt(str,x,y,size,col,align='center',bold=true){
  ctx.textAlign=align; ctx.font=(bold?'bold ':'')+size+'px "Courier New"';
  // Strong dark outline for all text
  ctx.strokeStyle='rgba(0,0,0,0.98)'; ctx.lineWidth=Math.max(2.5,size*0.22); ctx.lineJoin='round';
  ctx.strokeText(str,x,y); ctx.fillStyle=col; ctx.fillText(str,x,y);
}
function isHov(x,y,w,h){return mouseX>=x&&mouseX<=x+w&&mouseY>=y&&mouseY<=y+h;}
function btn(x,y,w,h,label,color='#aa66ff',subLabel=''){
  const hov=isHov(x,y,w,h);
  ctx.fillStyle=hov?'#1a0a3a':'#080510'; ctx.strokeStyle=hov?color:'#331155'; ctx.lineWidth=hov?2:1;
  ctx.fillRect(x,y,w,h); ctx.strokeRect(x,y,w,h);
  if(hov){const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,hex8(color,'55'));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);}
  ctx.shadowColor=hov?color:'transparent'; ctx.shadowBlur=hov?12:0;
  txt(label,x+w/2,y+h/2+(subLabel?-4:8),hov?22:20,hov?'#fff':color);
  if(subLabel){ctx.shadowBlur=0;txt(subLabel,x+w/2,y+h/2+16,11,'#666');}
  ctx.shadowBlur=0; return hov;
}

// ── HISTORY ──
function loadHistory(){try{const h=localStorage.getItem('cursedClash_v5');return h?JSON.parse(h):[];}catch(e){return[];}}
function saveHistory(rec){try{const h=loadHistory();h.unshift(rec);if(h.length>50)h.splice(50);localStorage.setItem('cursedClash_v5',JSON.stringify(h));}catch(e){}}
function clearHistory(){try{localStorage.removeItem('cursedClash_v5');}catch(e){}}

// ── HEX HELPER — safely append 2-char alpha to any hex color ──
// Expands 3-digit #rgb → #rrggbb before appending so addColorStop never gets a 5-digit hex
function hex8(col,alpha){
  if(!col||typeof col!=='string')return '#000000'+alpha;
  let c=col.trim();
  if(c.charAt(0)==='#'&&c.length===4){c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];}
  // strip any existing alpha suffix beyond 7 chars
  if(c.length>7)c=c.slice(0,7);
  return c+alpha;
}