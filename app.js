// CADDY LOGIC — App v1.0.1 — All 40 fixes applied
const state = {
  name:'', hand:'right', range:'100s', bag:[], temp:'mild',
  showEverySwing:true, course:'', hole:1, windState:0, isRaining:false,
  shots:[], roundActive:false, yardage:150, skipDistance:false,
  elevation:0, activeConditions:[], subScenario:null,
  rounds:[], recentCourses:[], currentScreen:'input', onboarded:false,
  confScore:null,
  _currentSmartClub:null, _currentHeroClub:null, _currentAdjusted:0, _currentMods:[]
};

// INIT
function init() {
  loadState();
  if (!state.onboarded) showOnboarding();
  else showMainApp();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
}
function loadState() { try { const s = localStorage.getItem('cl-state'); if (s) Object.assign(state, JSON.parse(s)); } catch(e){} }
function saveState() { try { const s = {...state}; delete s._currentSmartClub; delete s._currentHeroClub; localStorage.setItem('cl-state', JSON.stringify(s)); } catch(e){} }

// ONBOARDING
function showOnboarding() { document.getElementById('onboarding').classList.remove('hidden'); document.getElementById('main-app').classList.add('hidden'); }
function selectHand(el) {
  document.querySelectorAll('[data-hand]').forEach(b => { b.classList.remove('selected'); b.querySelector('.ob-option-label').style.color = 'var(--text-dimmer)'; });
  el.classList.add('selected'); el.querySelector('.ob-option-label').style.color = 'var(--green)'; state.hand = el.dataset.hand;
}
function selectRange(el) {
  document.querySelectorAll('[data-range]').forEach(b => { b.classList.remove('selected'); b.querySelector('.ob-option-label').style.color = 'var(--text-dimmer)'; });
  el.classList.add('selected'); el.querySelector('.ob-option-label').style.color = 'var(--green)'; state.range = el.dataset.range;
}
function obNext(step) {
  document.getElementById('ob-'+step).classList.add('hidden');
  if (step===1) { state.name = document.getElementById('ob-name').value.trim()||'Golfer'; document.getElementById('ob-2').classList.remove('hidden'); }
  else if (step===2) { state.bag = JSON.parse(JSON.stringify(CL.bags[state.range]||CL.bags['100s'])); CL.sortBag(state.bag); document.getElementById('ob-range-label').textContent=state.range; renderObBag(); document.getElementById('ob-3').classList.remove('hidden'); }
  else if (step===3) { showObConfirm(); }
}
function obSkipBag() { state.bag = JSON.parse(JSON.stringify(CL.bags[state.range]||CL.bags['100s'])); CL.sortBag(state.bag); showObConfirm(); }
function showObConfirm() {
  document.getElementById('ob-3').classList.add('hidden'); document.getElementById('ob-4').classList.remove('hidden');
  document.getElementById('ob-confirm-name').textContent = state.name;
  const checks = [`${state.hand==='right'?'Right':'Left'}-handed`,`Scoring range: ${state.range}`,`Bag: ${state.bag.filter(c=>c.on).length} clubs loaded`];
  document.getElementById('ob-confirm-list').innerHTML = checks.map(c=>`<div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #111"><svg width="18" height="18" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" fill="none" stroke="var(--green)" stroke-width="1.2"/><path d="M4 7 L6 9 L10 5" fill="none" stroke="var(--green)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="font-size:14px" class="ms">${c}</span></div>`).join('');
}
function obFinish() { state.onboarded=true; saveState(); document.getElementById('onboarding').classList.add('hidden'); showMainApp(); }
function renderObBag() {
  document.getElementById('ob-bag-list').innerHTML = state.bag.map(c=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #111"><span style="font-size:14px" class="mg">${c.name}</span><span style="font-size:14px;font-weight:600" class="mg">${c.dist} yds</span></div>`).join('');
}

// MAIN APP
function showMainApp() {
  document.getElementById('main-app').classList.remove('hidden'); document.getElementById('main-app').style.display='flex';
  buildConditionIcons(); buildHoleGrid(); buildKeypad();
  // Fix #32: detect no active round
  if (!state.roundActive) showPreround();
}

// NAVIGATION — Fix #1, #2, #5
function goToInput() { closeMenu(); showScreen('input'); resetCards(); }
function flipCard(wrap) { wrap.querySelector('.card-inner').classList.toggle('flipped'); }
function resetCards() { document.querySelectorAll('.card-inner').forEach(c=>c.classList.remove('flipped')); }

// PRE-ROUND
function showPreround() {
  const w = CL.getWelcome();
  document.getElementById('pre-silver').textContent = w.silver;
  document.getElementById('pre-copper').textContent = w.copper;
  document.getElementById('pre-hole').value = state.hole;
  if (state.course) document.getElementById('pre-course').value = state.course;
  renderRecentCourses('pre-recent-courses');
  document.getElementById('preround').classList.remove('hidden');
  document.getElementById('banner').classList.add('faded');
}
function startRound() {
  state.course = document.getElementById('pre-course').value.trim();
  state.hole = parseInt(document.getElementById('pre-hole').value)||1;
  state.roundActive = true; state.shots = [];
  if (state.course && !state.recentCourses.includes(state.course)) { state.recentCourses.unshift(state.course); state.recentCourses = state.recentCourses.slice(0,5); }
  document.getElementById('hole-num').textContent = state.hole;
  document.getElementById('preround').classList.add('hidden');
  document.getElementById('banner').classList.remove('faded');
  saveState();
}

// RECENT COURSES — Fix #14
function renderRecentCourses(elId) {
  const el = document.getElementById(elId); if (!el) return;
  if (!state.recentCourses.length) { el.innerHTML=''; return; }
  el.innerHTML = state.recentCourses.map(c=>`<div class="recent-course" onclick="selectRecentCourse('${c.replace(/'/g,"\\'")}')">${c}</div>`).join('');
}
function selectRecentCourse(name) {
  document.getElementById('pre-course').value = name;
  const si = document.getElementById('set-course'); if (si) si.value = name;
  state.course = name;
}

// WIND — Fix #30, #31
function cycleWind() {
  state.windState = (state.windState+1)%4;
  const w = CL.wind[state.windState];
  document.getElementById('wind-label').textContent = w.label;
  document.getElementById('wind-label').style.color = w.color;
  const icon = document.getElementById('wind-icon');
  let p = '';
  if (state.windState>=1) p+='<path d="M1 7 Q4 5 7 7 Q10 9 13 7" fill="none" stroke="'+w.color+'" stroke-width="1.3" stroke-linecap="round"/>';
  if (state.windState>=2) p+='<path d="M1 4 Q4 2 7 4 Q10 6 13 4" fill="none" stroke="'+w.color+'" stroke-width="1" stroke-linecap="round"/>';
  if (state.windState>=3) p+='<path d="M1 10 Q4 8 7 10 Q10 12 13 10" fill="none" stroke="'+w.color+'" stroke-width=".8" stroke-linecap="round"/>';
  if (state.windState===0) p='<path d="M1 7 Q4 5 7 7 Q10 9 13 7" fill="none" stroke="#666" stroke-width="1.3" stroke-linecap="round"/>';
  icon.innerHTML = p;
  document.getElementById('wind-btn').classList.toggle('active-wind',state.windState>0);
  saveState();
}

function toggleWeather() {
  state.isRaining = !state.isRaining;
  const icon = document.getElementById('weather-icon');
  if (state.isRaining) icon.innerHTML='<path d="M3 5 Q3 2 7 2 Q11 2 11 5 Q13 5 13 8 Q13 10 10 10 L4 10 Q1 10 1 8 Q1 6 3 5Z" fill="none" stroke="var(--blue)" stroke-width="1.1"/><line x1="4" y1="11" x2="3" y2="13" stroke="var(--blue)" stroke-width=".8"/><line x1="7" y1="11" x2="6" y2="13" stroke="var(--blue)" stroke-width=".8"/><line x1="10" y1="11" x2="9" y2="13" stroke="var(--blue)" stroke-width=".8"/>';
  else icon.innerHTML='<circle cx="7" cy="7" r="3" fill="none" stroke="var(--gold)" stroke-width="1.1"/><line x1="7" y1="1" x2="7" y2="3" stroke="var(--gold)" stroke-width=".9"/><line x1="7" y1="11" x2="7" y2="13" stroke="var(--gold)" stroke-width=".9"/><line x1="1" y1="7" x2="3" y2="7" stroke="var(--gold)" stroke-width=".9"/><line x1="11" y1="7" x2="13" y2="7" stroke="var(--gold)" stroke-width=".9"/>';
  saveState();
}

// HOLE COUNTER
function advanceHole() {
  if (state.hole>=18) { if (confirm('Hole 18 complete. End round?')) endRound(); return; }
  state.hole++; document.getElementById('hole-num').textContent=state.hole;
  resetConditions(); goToInput(); saveState();
}
function openHolePicker() { document.getElementById('hole-picker').classList.remove('hidden'); }
function closeHolePicker() { document.getElementById('hole-picker').classList.add('hidden'); }
function buildHoleGrid() {
  const g = document.getElementById('hole-grid'); g.innerHTML='';
  for (let i=1;i<=18;i++) { const b=document.createElement('button'); b.style.cssText='padding:10px;border:1.5px solid var(--border);border-radius:4px;font-size:16px;font-weight:600;background:none;color:var(--text);cursor:pointer;font-family:var(--font);min-height:44px'; b.textContent=i; b.onclick=()=>{state.hole=i;document.getElementById('hole-num').textContent=i;closeHolePicker();goToInput();saveState();}; g.appendChild(b); }
}

// INPUT
function adjustYard(dir) { state.yardage=Math.max(10,Math.min(350,state.yardage+dir)); state.skipDistance=false; updateYardageDisplay(); }
function setYard(v) { state.yardage=v; state.skipDistance=false; updateYardageDisplay(); }
function updateYardageDisplay() { document.getElementById('yardage-num').textContent=state.yardage; document.querySelectorAll('.qj-btn').forEach(b=>b.classList.toggle('active',parseInt(b.textContent)===state.yardage)); }
function skipDistance() { state.skipDistance=true; state.yardage=0; document.getElementById('yardage-num').textContent='—'; document.querySelectorAll('.qj-btn').forEach(b=>b.classList.remove('active')); }
function openKeypad() { document.getElementById('keypad').classList.remove('hidden'); document.getElementById('keypad-display').textContent=state.skipDistance?'':state.yardage; }
function closeKeypad() { const v=parseInt(document.getElementById('keypad-display').textContent); if(v&&v>0){state.yardage=v;state.skipDistance=false;updateYardageDisplay();} document.getElementById('keypad').classList.add('hidden'); }
function buildKeypad() {
  const k=document.getElementById('keypad-keys');k.innerHTML='';
  [1,2,3,4,5,6,7,8,9,'C',0,'✓'].forEach(n=>{const b=document.createElement('button');b.style.cssText='padding:14px;border:1.5px solid var(--border);border-radius:4px;font-size:20px;font-weight:600;background:none;color:var(--text);cursor:pointer;font-family:var(--font);min-height:52px';b.textContent=n;
  if(n==='C'){b.style.color='var(--red)';b.onclick=()=>{document.getElementById('keypad-display').textContent='';};}
  else if(n==='✓'){b.style.color='var(--green)';b.onclick=closeKeypad;}
  else{b.onclick=()=>{const d=document.getElementById('keypad-display');if(d.textContent.length<3)d.textContent=d.textContent+n;};}
  k.appendChild(b);});
}
function toggleElev(btn) {
  const mod=parseInt(btn.dataset.mod);
  document.querySelectorAll('.elev-btn').forEach(b=>b.classList.remove('active-up','active-dn'));
  if(state.elevation===mod){state.elevation=0;}else{state.elevation=mod;btn.classList.add(mod>0?'active-up':'active-dn');}
}

// CONDITIONS — Fix #8: tap again to deselect
function buildConditionIcons() {
  const terrainConds=['tee','fairway','lt_rough','dp_rough','bare_dirt','fwy_bnk','grn_bnk','divot'];
  const slopeConds=['up_lie','dn_lie','below_ft','above_ft','trees','water','lip'];
  const icons={
    tee:'<line x1="3" y1="9" x2="11" y2="9" stroke="C" stroke-width="1.2"/><line x1="7" y1="4" x2="7" y2="9" stroke="C" stroke-width="1.2"/>',
    fairway:'<path d="M1 9 Q5 7 7 8.5 Q9 10 13 8" fill="none" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',
    lt_rough:'<path d="M1 10 Q3 8 5 10 Q7 8 9 10 Q11 8 13 10" fill="none" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',
    dp_rough:'<path d="M1 12 Q2 7 3 12 Q4 6 5 12 Q6 7 7 12 Q8 6 9 12 Q10 7 11 12" fill="none" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',
    bare_dirt:'<line x1="1" y1="9" x2="13" y2="9" stroke="C" stroke-width="1.2"/><circle cx="5" cy="9" r=".6" fill="C"/><circle cx="9" cy="9" r=".5" fill="C"/>',
    fwy_bnk:'<path d="M2 9 Q5 5 7 9 Q9 5 12 9" fill="none" stroke="C" stroke-width="1.2"/><line x1="2" y1="9" x2="12" y2="9" stroke="C" stroke-width=".8"/>',
    grn_bnk:'<path d="M2 8 Q5 4 7 8 Q9 4 12 8" fill="none" stroke="C" stroke-width="1.2"/><line x1="8" y1="2" x2="8" y2="5" stroke="C" stroke-width=".8"/>',
    divot:'<ellipse cx="7" cy="9" rx="3.5" ry="2" fill="none" stroke="C" stroke-width="1"/><circle cx="7" cy="7.5" r="1.2" fill="none" stroke="C" stroke-width=".9"/>',
    up_lie:'<line x1="2" y1="12" x2="12" y2="4" stroke="C" stroke-width="1.2"/><circle cx="7" cy="8" r="1.2" fill="none" stroke="C" stroke-width="1"/>',
    dn_lie:'<line x1="2" y1="4" x2="12" y2="12" stroke="C" stroke-width="1.2"/><circle cx="7" cy="8" r="1.2" fill="none" stroke="C" stroke-width="1"/>',
    below_ft:'<line x1="3" y1="2" x2="3" y2="12" stroke="C" stroke-width="1"/><circle cx="8" cy="10" r="1.2" fill="none" stroke="C" stroke-width="1"/>',
    above_ft:'<line x1="3" y1="2" x2="3" y2="12" stroke="C" stroke-width="1"/><circle cx="8" cy="5" r="1.2" fill="none" stroke="C" stroke-width="1"/>',
    trees:'<line x1="7" y1="1" x2="7" y2="12" stroke="C" stroke-width="1.4" stroke-linecap="round"/><path d="M3 7 Q5 3 7 5 Q9 3 11 7" fill="none" stroke="C" stroke-width="1"/>',
    water:'<path d="M1 8 Q4 5 7 8 Q10 11 13 8" fill="none" stroke="C" stroke-width="1.3" stroke-linecap="round"/>',
    lip:'<path d="M3 12 L3 5 Q3 3 7 3" fill="none" stroke="C" stroke-width="1.3" stroke-linecap="round"/><line x1="3" y1="12" x2="12" y2="12" stroke="C" stroke-width="1.2"/>'
  };
  function mk(key){const c=CL.conditions[key],col='#888',svg=(icons[key]||'').replace(/C/g,col),mod=c.mod>0?`<div class="ci-mod">+${c.mod}</div>`:'';
    return `<div class="cond-icon" data-cond="${key}" onclick="toggleCondition('${key}')"><svg width="14" height="14" viewBox="0 0 14 14">${svg}</svg>${mod}<div class="ci-label">${c.label}</div></div>`;}
  document.getElementById('terrain-row').innerHTML=terrainConds.map(mk).join('');
  document.getElementById('slope-row').innerHTML=slopeConds.map(mk).join('');
}

function toggleCondition(key) {
  const c=CL.conditions[key], el=document.querySelector(`[data-cond="${key}"]`), idx=state.activeConditions.indexOf(key);
  // Fix #8: if already active, deselect (even sub-scenario items)
  if (idx>=0) { state.activeConditions.splice(idx,1); state.subScenario=null; el.classList.remove('on'); return; }
  if (c.hasSub) { openSubPanel(key); return; }
  if (c.group==='terrain') { state.activeConditions=state.activeConditions.filter(k=>CL.conditions[k].group!=='terrain'); document.querySelectorAll('.cond-icon').forEach(e=>{if(CL.conditions[e.dataset.cond]&&CL.conditions[e.dataset.cond].group==='terrain')e.classList.remove('on');}); }
  state.activeConditions.push(key); el.classList.add('on');
}

// SUB PANELS — Fix #9: water sub-scenarios
function openSubPanel(key) {
  const panel=document.getElementById('sub-panel'),content=document.getElementById('sub-content');
  if(key==='tee') content.innerHTML=`<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">TEE SHOT</div><div class="sub-desc">What's the hole?</div></div><div class="sub-option" onclick="selectSub('tee','par3')"><div class="sub-option-label mc">Par 3</div><div class="sub-option-desc">Iron or wood to the green</div></div><div class="sub-option" onclick="selectSub('tee','par45')"><div class="sub-option-label mc">Par 4 / Par 5</div><div class="sub-option-desc">Get it in the fairway</div></div>`;
  else if(key==='trees'){
    const lD=state.hand==='right'?'Draw / Hook':'Fade / Slice', rD=state.hand==='right'?'Fade / Slice':'Draw / Hook';
    content.innerHTML=`<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">TREES</div><div class="sub-desc">What's your play?</div></div><div class="sub-option" onclick="this.querySelector('.dir-row').style.display='flex'"><div class="sub-option-label mc">Go Around</div><div class="sub-option-desc">Shape the ball around the obstacle</div><div class="dir-row" style="display:none;margin-top:10px"><button class="dir-btn" onclick="event.stopPropagation();selectSub('trees','around_l')"><div class="dir-label mc">Go Left</div><div class="dir-sub">${lD}</div></button><button class="dir-btn" onclick="event.stopPropagation();selectSub('trees','around_r')"><div class="dir-label" style="color:var(--text-dim)">Go Right</div><div class="dir-sub">${rD}</div></button></div></div><div style="display:flex;gap:8px"><div class="sub-option" style="flex:1" onclick="selectSub('trees','over')"><div class="sub-option-label" style="color:var(--text-dim)">Go Over</div><div class="sub-option-desc">Launch it high</div></div><div class="sub-option" style="flex:1" onclick="selectSub('trees','punch')"><div class="sub-option-label" style="color:var(--text-dim)">Punch Out</div><div class="sub-option-desc">Get to safety</div></div></div>`;
  }
  else if(key==='grn_bnk') content.innerHTML=`<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">GREENSIDE BUNKER</div><div class="sub-desc">What's the lie?</div></div><div class="sub-option" onclick="selectSub('grn_bnk','clean')"><div class="sub-option-label mc">Clean Lie</div><div class="sub-option-desc">Ball on top of the sand</div></div><div class="sub-option" onclick="selectSub('grn_bnk','plugged')"><div class="sub-option-label mc">Plugged / Fried Egg</div><div class="sub-option-desc">Ball buried</div></div><div class="sub-option" onclick="selectSub('grn_bnk','wet')"><div class="sub-option-label mc">Wet Sand</div><div class="sub-option-desc">Heavy, compacted</div></div>`;
  else if(key==='water') content.innerHTML=`<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">WATER HAZARD</div><div class="sub-desc">Where's the water?</div></div><div class="sub-option" onclick="this.querySelector('.dir-row').style.display='flex'"><div class="sub-option-label mc">In Front</div><div class="sub-option-desc">Between you and the green</div><div class="dir-row" style="display:none;margin-top:10px"><button class="dir-btn" onclick="event.stopPropagation();selectSub('water','front_over')"><div class="dir-label" style="color:var(--green)">Go Over</div><div class="dir-sub">Carry the water</div></button><button class="dir-btn" onclick="event.stopPropagation();selectSub('water','front_layup')"><div class="dir-label" style="color:var(--text-dim)">Lay Up</div><div class="dir-sub">Play it safe</div></button></div></div><div class="sub-option" onclick="selectSub('water','left')"><div class="sub-option-label mc">Water Left</div><div class="sub-option-desc">Aim away from the left side</div></div><div class="sub-option" onclick="selectSub('water','right')"><div class="sub-option-label mc">Water Right</div><div class="sub-option-desc">Aim away from the right side</div></div><div class="sub-option" onclick="selectSub('water','crossing')"><div class="sub-option-label mc">Crossing</div><div class="sub-option-desc">Must carry — no way around</div></div>`;
  panel.classList.add('open');
}
function selectSub(parent,sub) {
  state.subScenario=parent+'_'+sub;
  if(!state.activeConditions.includes(parent)){
    const c=CL.conditions[parent];
    if(c.group==='terrain'){state.activeConditions=state.activeConditions.filter(k=>CL.conditions[k].group!=='terrain');document.querySelectorAll('.cond-icon').forEach(e=>{if(CL.conditions[e.dataset.cond]&&CL.conditions[e.dataset.cond].group==='terrain')e.classList.remove('on');});}
    state.activeConditions.push(parent); const el=document.querySelector(`[data-cond="${parent}"]`); if(el)el.classList.add('on');
  }
  closeSubPanel();
}
function closeSubPanel(){document.getElementById('sub-panel').classList.remove('open');}

// WHAT'S MY PLAY — Core engine
function whatsMyPlay() {
  // Fix #18: reset cards
  resetCards();
  let adjusted=state.yardage, mods=[];
  if(state.windState>0){const wm=CL.wind[state.windState].mod;adjusted+=wm;mods.push({label:'+'+wm,color:'var(--silver)',type:'wind'});}
  state.activeConditions.forEach(key=>{const c=CL.conditions[key];if(c.mod>0){adjusted+=c.mod;mods.push({label:'+'+c.mod,color:'var(--green)',type:key});}});
  if(state.elevation!==0){adjusted+=state.elevation;mods.push({label:(state.elevation>0?'+':'')+state.elevation,color:state.elevation>0?'var(--green)':'var(--red)',type:'elev'});}

  const smartClub=CL.findClub(state.bag,adjusted);
  if(!smartClub){alert('No active clubs in your bag. Add clubs in My Bag.');return;}
  const heroClub=CL.findHeroClub(state.bag,smartClub,adjusted);
  const adviceKey=state.subScenario||(state.activeConditions.length?state.activeConditions[state.activeConditions.length-1]:'_default');
  const advice=CL.advice[adviceKey]||CL.advice._default;
  const condKey=state.activeConditions.length?state.activeConditions[state.activeConditions.length-1]:'_default';
  const conf=CL.calcConfidence(state.activeConditions,state.windState,state.isRaining,smartClub.dist);

  // Render
  document.getElementById('out-yardage').textContent=state.skipDistance?'—':state.yardage;
  document.getElementById('out-adjusted').textContent=state.skipDistance?'—':adjusted;
  document.getElementById('out-club').textContent=smartClub.name.toUpperCase();
  document.getElementById('out-mods').innerHTML=mods.map(m=>`<div class="trust-mod"><div class="trust-mod-num" style="color:${m.color}">${m.label}</div></div>`).join('');
  document.getElementById('conf-smart').style.width=conf.smart+'%';
  document.getElementById('conf-hero').style.width=conf.hero+'%';

  // Fix #10: Situation summary
  let sitTags=[];
  if(state.subScenario&&CL.subLabels[state.subScenario]) sitTags.push({label:CL.subLabels[state.subScenario],type:'terrain'});
  else state.activeConditions.forEach(k=>{const c=CL.conditions[k];sitTags.push({label:c.label+(c.mod>0?' +'+c.mod:''),type:c.group});});
  if(state.windState>0) sitTags.push({label:'Wind '+CL.wind[state.windState].label,type:'wind'});
  if(state.isRaining) sitTags.push({label:'Rain',type:'wind'});
  if(state.elevation!==0) sitTags.push({label:'Elev '+(state.elevation>0?'+':'')+state.elevation,type:'slope'});
  document.getElementById('situation-summary').innerHTML=sitTags.length?sitTags.map(t=>`<span class="sit-tag ${t.type}">${t.label}</span>`).join('')+'<div style="font-size:10px;color:var(--text-dimmer);margin-top:3px">Tap yardage row above to edit</div>':'<div style="font-size:12px;color:var(--text-dim)">Clean lie · No obstacles</div>';

  // Card text — Fix #16/#17: mechanics focused
  document.getElementById('smart-text').textContent=smartClub.name+' '+(advice.smartText||'center green.');
  document.getElementById('smart-kicker').textContent=CL.getKicker(condKey);
  document.getElementById('hero-text').textContent=heroClub.name+' '+(advice.heroText||'at the pin.');
  document.getElementById('hero-kicker').textContent=CL.getKicker(condKey);

  buildSetupBack('smart-setup',advice,smartClub,'smart');
  buildSetupBack('hero-setup',advice,heroClub,'hero');
  state._currentSmartClub=smartClub;state._currentHeroClub=heroClub;state._currentAdjusted=adjusted;state._currentMods=mods;
  showScreen('output');
}

function buildSetupBack(elId,advice,club,type) {
  const el=document.getElementById(elId),isH=type==='hero',lc=isH?'mc':'mg';
  let h='';
  if(state.showEverySwing) h+=`<div class="every-swing"><div class="every-swing-label" style="color:${isH?'var(--copper)':'var(--gold)'}">EVERY SWING</div><div class="every-swing-text">${CL.everySwing}</div></div>`;
  if(advice.ball) h+=`<div class="setup-row"><span class="setup-label ${lc}">Ball</span><span class="setup-value ms">${advice.ball}</span></div>`;
  if(advice.weight) h+=`<div class="setup-row"><span class="setup-label ${lc}">Weight</span><span class="setup-value ms">${advice.weight}</span></div>`;
  if(advice.swing) h+=`<div class="setup-row"><span class="setup-label ${lc}">Swing</span><span class="setup-value ms">${advice.swing}</span></div>`;
  if(advice.aim) h+=`<div class="setup-row"><span class="setup-label ${lc}">Aim</span><span class="setup-value ms">${isH?(advice.heroAim||advice.aim):advice.aim}</span></div>`;
  if(!isH&&advice.remember) h+=`<div class="remember-section"><div class="remember-label">REMEMBER</div><div class="remember-text">${advice.remember}</div></div>`;
  if(isH&&advice.heroDanger) h+=`<div class="danger-section"><div class="danger-label">DANGER</div><div class="danger-text">${advice.heroDanger}</div></div>`;
  const condKey=state.activeConditions.length?state.activeConditions[state.activeConditions.length-1]:'_default';
  h+=`<div class="closing-kicker"><span class="mc">${CL.getKicker(condKey)}</span></div>`;
  el.innerHTML=h;
}

// COMMIT
function commitSmart(){logShot('smart',state._currentSmartClub);resetAndAdvance();}
function commitHero(){logShot('hero',state._currentHeroClub);resetAndAdvance();}
function logShot(type,club){
  state.shots.push({hole:state.hole,yardage:state.yardage,adjusted:state._currentAdjusted,conditions:[...state.activeConditions],sub:state.subScenario,subLabel:state.subScenario?CL.subLabels[state.subScenario]:'',wind:state.windState,rain:state.isRaining,elev:state.elevation,club:club.name,type:type,time:Date.now()});
  saveState();
}
function resetAndAdvance(){resetConditions();goToInput();}
function resetConditions(){state.activeConditions=[];state.subScenario=null;state.elevation=0;state.yardage=150;state.skipDistance=false;document.querySelectorAll('.cond-icon').forEach(e=>e.classList.remove('on'));document.querySelectorAll('.elev-btn').forEach(b=>b.classList.remove('active-up','active-dn'));updateYardageDisplay();}

// SCREEN NAVIGATION
function showScreen(name) {
  closeMenu();
  const screens=['input','output','bag','settings','history','discipline','share','feedback','about','confessional','privacy','terms'];
  screens.forEach(s=>{const el=document.getElementById('screen-'+s);if(el)el.classList.toggle('hidden',s!==name);});
  state.currentScreen=name;
  if(name==='bag')renderBag();if(name==='settings')renderSettings();if(name==='history')renderHistory();
  if(name==='discipline')renderDiscipline();if(name==='share')renderShare();
  if(name==='privacy')document.getElementById('privacy-text').textContent=CL.privacyPolicy;
  if(name==='terms')document.getElementById('terms-text').textContent=CL.termsOfService;
}

// MY BAG — Fix #11, #12
function renderBag() {
  CL.sortBag(state.bag);
  const list=document.getElementById('bag-list');
  list.innerHTML=state.bag.map((c,i)=>`<div class="club-row ${c.on?'':'off'}"><div class="club-row-name ${c.on?'mg':''}" style="${c.on?'':'color:#555'}" onclick="renameClub(${i})">${c.name}</div><div class="club-dist-area"><button class="club-adj-btn" onclick="adjClubDist(${i},-5)">−</button><div class="club-dist-num ${c.on?'mg':''}" style="${c.on?'':'color:#555'}" onclick="typeClubDist(${i})">${c.dist}</div><button class="club-adj-btn" onclick="adjClubDist(${i},5)">+</button><span class="club-dist-yds">yds</span></div><div class="toggle ${c.on?'on':'off'}" onclick="toggleClub(${i})"><div class="toggle-dot"></div></div></div>`).join('');
  const lt=document.getElementById('lefty-toggle');lt.classList.toggle('on',state.hand==='left');lt.classList.toggle('off',state.hand!=='left');
}
function adjClubDist(i,d){state.bag[i].dist=Math.max(10,Math.min(350,state.bag[i].dist+d));CL.sortBag(state.bag);saveState();renderBag();}
function typeClubDist(i){const v=prompt('Distance in yards:',state.bag[i].dist);if(v&&!isNaN(v)){state.bag[i].dist=Math.max(10,Math.min(350,parseInt(v)));CL.sortBag(state.bag);saveState();renderBag();}}
function renameClub(i){const v=prompt('Club name:',state.bag[i].name);if(v&&v.trim()){state.bag[i].name=v.trim();saveState();renderBag();}}
function toggleClub(i){state.bag[i].on=!state.bag[i].on;saveState();renderBag();}
function toggleLefty(){state.hand=state.hand==='right'?'left':'right';saveState();renderBag();}
function addClub(){const n=prompt('Club name (e.g., 60°, 9-Wood):');if(!n||!n.trim())return;const d=prompt('Distance in yards:','100');if(!d||isNaN(d))return;state.bag.push({name:n.trim(),dist:parseInt(d),on:true});CL.sortBag(state.bag);saveState();renderBag();}

// ROUND SETTINGS — Fix #13, #14
function renderSettings(){
  document.getElementById('set-course').value=state.course||'';
  document.getElementById('set-hole').textContent=state.hole;
  document.getElementById('set-shots').textContent=state.shots.length;
  renderRecentCourses('recent-courses-area');
  const st=document.getElementById('swing-toggle');st.classList.toggle('on',state.showEverySwing);st.classList.toggle('off',!state.showEverySwing);
}
function updateCourse(v){state.course=v.trim();if(state.course&&!state.recentCourses.includes(state.course)){state.recentCourses.unshift(state.course);state.recentCourses=state.recentCourses.slice(0,5);}saveState();}
function setTemp(t,btn){state.temp=t;document.querySelectorAll('.temp-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll(`.temp-btn.${t}`).forEach(b=>b.classList.add('active'));saveState();}
function toggleEverySwing(){state.showEverySwing=!state.showEverySwing;saveState();renderSettings();}

// END ROUND / CONFESSIONAL
function endRound() {
  showScreen('confessional');
  const total=state.shots.length,smart=state.shots.filter(s=>s.type==='smart').length,hero=state.shots.filter(s=>s.type==='hero').length;
  document.getElementById('conf-stats').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid #111;margin-bottom:12px"><span style="font-size:14px" class="ms">Shots consulted</span><span style="font-size:28px;font-weight:600" class="mg">${total}</span></div><div style="display:flex;gap:10px"><div style="flex:1;text-align:center;padding:10px;border:1.5px solid #2a4a2a;border-radius:6px;background:rgba(93,170,104,0.04)"><div style="font-size:26px;font-weight:600;color:var(--green)">${smart}</div><div style="font-size:10px;color:var(--green)">Smart Play</div></div><div style="flex:1;text-align:center;padding:10px;border:1.5px solid #3a2010;border-radius:6px;background:rgba(212,132,90,0.04)"><div style="font-size:26px;font-weight:600;color:var(--copper)">${hero}</div><div style="font-size:10px;color:var(--copper)">Let It Eat</div></div></div>`;
  const heroShots=state.shots.filter(s=>s.type==='hero');
  document.getElementById('conf-hero-box').innerHTML=heroShots.map(s=>`<div class="hero-moment"><div style="font-size:10px;color:var(--copper);letter-spacing:.08em;font-weight:600;margin-bottom:4px">YOUR HERO MOMENT</div><p style="font-size:14px;line-height:1.5"><span class="ms">Hole ${s.hole}. ${s.subLabel||s.conditions.map(c=>CL.conditions[c]?.label).join(' · ')||'Clean lie'}. You chose ${s.club}.</span></p><p style="font-family:var(--serif);font-size:13px;font-style:italic;margin-top:6px"><span class="mc">How'd that work out?</span></p></div>`).join('');
  state.confScore=null;document.getElementById('conf-score').textContent='—';
  let pool;if(hero===0&&total>0)pool=CL.confessionalKickers.allSmart;else if(hero<=2)pool=CL.confessionalKickers.someHero;else if(hero>2)pool=CL.confessionalKickers.manyHero;else pool=CL.confessionalKickers.lowUsage;
  const kick=pool[Math.floor(Math.random()*pool.length)];
  document.getElementById('conf-kicker').innerHTML=`<p style="font-size:16px;line-height:1.5"><span class="ms">${total} shots. ${smart>0?smart+' times you listened.':'The caddy was waiting.'}</span></p><p style="font-family:var(--serif);font-size:14px;font-style:italic;margin-top:5px"><span class="mc">${total===0?'Open the app next time. The caddy is lonely.':kick}</span></p>`;
}
function adjScore(d){const defs={'80s':88,'90s':96,'100s':104,'110+':112};if(state.confScore===null)state.confScore=defs[state.range]||100;state.confScore=Math.max(50,Math.min(150,state.confScore+d));document.getElementById('conf-score').textContent=state.confScore;}
function finishRound(){state.rounds.push({date:new Date().toLocaleDateString(),course:state.course,shots:[...state.shots],score:state.confScore,smart:state.shots.filter(s=>s.type==='smart').length,hero:state.shots.filter(s=>s.type==='hero').length});state.roundActive=false;state.shots=[];state.hole=1;document.getElementById('hole-num').textContent='1';saveState();goToInput();}

// SHOT HISTORY — Fix #15
function renderHistory(){
  const list=document.getElementById('history-list');let h='';
  if(state.shots.length){
    h+=`<div class="history-round"><div class="history-round-header"><span style="font-size:15px;font-weight:600" class="mg">Today${state.course?' — '+state.course:''}</span><span style="font-size:11px;color:var(--text-dim)">${state.shots.length} shots</span></div>`;
    h+=state.shots.slice().reverse().map(s=>`<div class="shot-entry" onclick="this.querySelector('.shot-detail')?.classList.toggle('hidden')"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-size:13px;font-weight:600" class="ms">Hole ${s.hole}</span><span class="shot-tag ${s.type==='smart'?'smart':'hero'}">${s.type==='smart'?'Smart':'Let It Eat'}</span></div><div style="font-size:12px;color:var(--text-dim);line-height:1.4">${s.yardage?s.yardage+' yds':'Technique only'} · ${s.subLabel||s.conditions.map(c=>CL.conditions[c]?.label).join(' · ')||'Clean'} · <span class="mg">${s.club}</span></div><div class="shot-detail hidden"><strong>Full situation:</strong><br>${s.subLabel||s.conditions.map(c=>CL.conditions[c]?.label+' '+(CL.conditions[c]?.mod>0?'+'+CL.conditions[c]?.mod:'')).join(' · ')||'Clean lie'}${s.wind?' · Wind '+CL.wind[s.wind]?.label:''}${s.elev?' · Elev '+(s.elev>0?'+':'')+s.elev:''}${s.adjusted?'<br>Adjusted: '+s.adjusted+' yds':''}</div></div>`).join('');
    h+='</div>';
  }
  state.rounds.slice().reverse().forEach(r=>{h+=`<div class="history-round" style="opacity:.6"><div class="history-round-header"><span style="font-size:13px;color:var(--text-dim)">${r.date}${r.course?' — '+r.course:''}</span><span style="font-size:10px;color:var(--text-dimmer)">${r.shots.length} shots</span></div>`;h+=r.shots.slice().reverse().slice(0,3).map(s=>`<div class="shot-entry"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:12px;color:var(--text-dim)">Hole ${s.hole}</span><span class="shot-tag ${s.type==='smart'?'smart':'hero'}">${s.type==='smart'?'Smart':'Let It Eat'}</span></div><div style="font-size:11px;color:var(--text-dimmer)">${s.club}</div></div>`).join('');if(r.shots.length>3)h+=`<div style="font-size:10px;color:var(--text-dimmer);padding:6px">+ ${r.shots.length-3} more</div>`;h+='</div>';});
  if(!h) h='<div style="text-align:center;padding:40px 0;color:var(--text-dimmer);font-size:14px">No shots logged yet.<br>Use the app during your round.</div>';
  list.innerHTML=h;
}

// DISCIPLINE
function renderDiscipline(){
  const r=state.rounds,tr=r.length,ts=r.reduce((s,x)=>s+x.smart,0),th=r.reduce((s,x)=>s+x.hero,0),tt=ts+th,sr=tt?Math.round(ts/tt*100):0;
  document.getElementById('disc-stats').innerHTML=`<div class="stat-card"><div class="stat-num mg">${tr}</div><div class="stat-label">Rounds</div></div><div class="stat-card"><div class="stat-num" style="color:var(--green)">${sr}%</div><div class="stat-label">Smart Rate</div></div><div class="stat-card"><div class="stat-num" style="color:var(--copper)">${th}</div><div class="stat-label">Hero Shots</div></div>`;
  document.getElementById('disc-rounds').innerHTML=r.slice().reverse().map(x=>`<div class="row"><div><div style="font-size:13px;font-weight:600" class="ms">${x.date}${x.course?' — '+x.course:''}</div><div style="font-size:10px;color:var(--text-dim);margin-top:2px">${x.score?'Score: '+x.score+' · ':''}${x.smart} smart, ${x.hero} hero</div></div></div>`).join('')||'<div style="text-align:center;padding:30px 0;color:var(--text-dimmer);font-size:14px">Complete a round to see your Discipline Index.</div>';
}

// SHARE — Fix #6, #7
function renderShare(){
  const lr=state.rounds.length?state.rounds[state.rounds.length-1]:null;
  const t=lr?lr.shots.length:state.shots.length,s=lr?lr.smart:state.shots.filter(x=>x.type==='smart').length,he=lr?lr.hero:state.shots.filter(x=>x.type==='hero').length;
  let fk='';
  if(he===0&&t>0){const p=CL.flexKickers.perfect;fk=p[Math.floor(Math.random()*p.length)].replace(/{smart}/g,s).replace(/{total}/g,t);}
  else if(t>0){const p=CL.flexKickers.withHero;fk=p[Math.floor(Math.random()*p.length)].replace(/{smart}/g,s).replace(/{total}/g,t).replace(/{hero}/g,he);}
  let h='';
  if(t>0) h+=`<div style="border:1.5px solid;border-image:linear-gradient(135deg,#6B4420,var(--copper),#E8A878,var(--copper),#6B4420) 1;padding:24px;text-align:center;margin-bottom:14px;background:#050503"><div style="opacity:.4;margin-bottom:12px"><span style="font-size:10px;letter-spacing:.18em" class="mc">CADDY LOGIC</span></div><div style="font-size:11px;color:var(--text-dim);margin-bottom:14px">${state.course||'Round'} · ${lr?lr.date:'Today'}</div><div style="display:flex;gap:12px;justify-content:center;margin-bottom:16px"><div><div style="font-size:36px;font-weight:600" class="mg">${t}</div><div style="font-size:10px;color:var(--text-dim)">shots</div></div><div style="width:1px;background:var(--border)"></div><div><div style="font-size:36px;font-weight:600;color:var(--green)">${s}</div><div style="font-size:10px;color:var(--green)">smart</div></div><div style="width:1px;background:var(--border)"></div><div><div style="font-size:36px;font-weight:600;color:var(--copper)">${he}</div><div style="font-size:10px;color:var(--copper)">hero</div></div></div><p style="font-family:var(--serif);font-size:15px;font-style:italic;line-height:1.5"><span class="mc">${fk}</span></p></div>`;
  else h+='<div style="text-align:center;padding:30px 0;color:var(--text-dimmer);font-size:14px">Play a round first to generate your Flex Screen.</div>';
  h+='<div style="font-size:10px;color:var(--text-dim);letter-spacing:.06em;margin:12px 0 8px;font-weight:600">ROAST TEXT — tap copy or share</div>';
  CL.roasts.forEach(r=>{const txt=r.replace(/{total}/g,t||'?').replace(/{smart}/g,s||'?').replace(/{hero}/g,he||'?').replace(/{smartClub}/g,'7-Iron').replace(/{heroClub}/g,'Driver');
    h+=`<div class="roast-card"><div class="roast-text">${txt}</div><div class="roast-actions"><button class="roast-copy" onclick="copyRoast(this,'${txt.replace(/'/g,"\\'")}')">Copy</button><button class="roast-share" onclick="shareRoast('${txt.replace(/'/g,"\\'")}')">Share</button></div></div>`;
  });
  document.getElementById('share-content').innerHTML=h;
}
function copyRoast(btn,txt){navigator.clipboard.writeText(txt).then(()=>{btn.textContent='Copied!';btn.classList.add('copied');setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);}).catch(()=>{btn.textContent='Copied!';btn.classList.add('copied');});}
function shareRoast(txt){if(navigator.share)navigator.share({text:txt}).catch(()=>{});else{navigator.clipboard.writeText(txt);}}

// FEEDBACK — Fix #6
function sendFeedback(){const t=document.getElementById('feedback-text').value.trim();if(!t)return;try{const fb=JSON.parse(localStorage.getItem('cl-feedback')||'[]');fb.push({text:t,date:Date.now()});localStorage.setItem('cl-feedback',JSON.stringify(fb));}catch(e){}document.getElementById('feedback-text').value='';alert('Thanks! Your feedback helps make the caddy smarter.');goToInput();}

// MENU
function openMenu(){document.getElementById('menu').classList.remove('hidden');}
function closeMenu(){document.getElementById('menu').classList.add('hidden');}
function openHolePicker(){document.getElementById('hole-picker').classList.remove('hidden');}
function closeHolePicker(){document.getElementById('hole-picker').classList.add('hidden');}

document.addEventListener('DOMContentLoaded',init);
