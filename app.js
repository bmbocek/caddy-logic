// CADDY LOGIC — App v1.0.3 Beta — Premium aesthetic restored + all 62 fixes + merge engine
'use strict';

// STATE
const state={name:'',hand:'right',range:'100s',bag:[],temp:'mild',showEverySwing:true,course:'',hole:1,
windState:0,windDir:'In Face',isRaining:false,shots:[],roundActive:false,yardage:150,skipDistance:false,
elevation:0,activeConditions:[],subScenario:null,rounds:[],recentCourses:[],currentScreen:'input',
onboarded:false,confScore:null,_smartClub:null,_heroClub:null,_adjusted:0,_mods:[],_isTee:false,_baseKey:'_default'};

// HELPERS
function $(id){return document.getElementById(id);}
let _commitLock=false;
function debounce(fn){if(_commitLock)return;_commitLock=true;fn();setTimeout(()=>{_commitLock=false;},600);}
function haptic(ms){if(navigator.vibrate)try{navigator.vibrate(ms||10);}catch(e){}}
function loadState(){try{const s=localStorage.getItem('cl-state');if(s){const p=JSON.parse(s);Object.assign(state,p);}}catch(e){}}
function saveState(){try{const s={...state};delete s._smartClub;delete s._heroClub;localStorage.setItem('cl-state',JSON.stringify(s));}catch(e){}}
// Cleanup old rounds (#54)
function cleanupRounds(){if(state.rounds.length>20)state.rounds=state.rounds.slice(-20);saveState();}

// INIT
function init(){
  loadState();
  if(!state.onboarded)showOnboarding();
  else showMainApp();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
  // Splash (#57)
  setTimeout(()=>{const sp=$('splash');if(sp){sp.classList.add('fade');setTimeout(()=>sp.remove(),600);}},800);
  // Inactivity (#134)
  let lastAct=Date.now();
  document.addEventListener('touchstart',()=>{lastAct=Date.now();});
  setInterval(()=>{if(state.shots.length>0&&Date.now()-lastAct>7200000){if(confirm('Been a while. End round?'))endRound();}},300000);
}

// ONBOARDING
function showOnboarding(){$('onboarding').classList.remove('hidden');$('main-app').classList.add('hidden');}
function selectHand(el){document.querySelectorAll('[data-hand]').forEach(b=>{b.classList.remove('selected');});el.classList.add('selected');state.hand=el.dataset.hand;}
function selectRange(el){document.querySelectorAll('[data-range]').forEach(b=>{b.classList.remove('selected');});el.classList.add('selected');state.range=el.dataset.range;}
function obNext(step){
  $('ob-'+step).classList.add('hidden');
  if(step===1){state.name=$('ob-name').value.trim()||'Golfer';$('ob-2').classList.remove('hidden');}
  else if(step===2){state.bag=JSON.parse(JSON.stringify(CL.bags[state.range]||CL.bags['100s']));CL.sortBag(state.bag);$('ob-range-label').textContent=state.range;renderObBag();$('ob-3').classList.remove('hidden');}
  else if(step===3){showObConfirm();}
  haptic(10);
}
function obBack(step){$('ob-'+step).classList.add('hidden');$('ob-'+(step-1)).classList.remove('hidden');haptic(10);}
function renderObBag(){$('ob-bag-list').innerHTML=state.bag.map((c,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #111;min-height:44px"><span style="font-size:14px" class="mg">${c.name}${c.teeOnly?' <span style="font-size:8px;color:var(--text-dimmer)">(tee)</span>':''}</span><div style="display:flex;align-items:center;gap:6px"><button class="club-adj-btn" onclick="obAdjDist(${i},-5)">−</button><span style="font-size:16px;font-weight:600;min-width:36px;text-align:center;cursor:pointer" class="mg" onclick="obTypeDist(${i})">${c.dist}</span><button class="club-adj-btn" onclick="obAdjDist(${i},5)">+</button></div></div>`).join('');}
function obAdjDist(i,d){state.bag[i].dist=Math.max(20,Math.min(400,state.bag[i].dist+d));CL.sortBag(state.bag);renderObBag();haptic(8);}
function obTypeDist(i){const v=prompt(state.bag[i].name+' distance:',state.bag[i].dist);if(v===null)return;const n=parseInt(v);if(isNaN(n)||n<20||n>400){alert('Enter 20–400.');return;}state.bag[i].dist=n;CL.sortBag(state.bag);renderObBag();}
function showObConfirm(){
  $('ob-3').classList.add('hidden');$('ob-4').classList.remove('hidden');
  $('ob-confirm-name').textContent=state.name;
  const checks=[`${state.hand==='right'?'Right':'Left'}-handed`,`Scoring range: ${state.range}`,`Bag: ${state.bag.filter(c=>c.on).length} clubs loaded`];
  $('ob-confirm-list').innerHTML=checks.map(c=>`<div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #111"><svg width="18" height="18" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" fill="none" stroke="var(--green)" stroke-width="1.2"/><path d="M4 7 L6 9 L10 5" fill="none" stroke="var(--green)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="font-size:14px" class="ms">${c}</span></div>`).join('');
}
function obFinish(){state.onboarded=true;saveState();$('onboarding').classList.add('hidden');showMainApp();haptic(20);}

// MAIN APP
function showMainApp(){$('main-app').classList.remove('hidden');$('main-app').style.display='flex';buildConditionIcons();buildHoleGrid();buildElevRow();buildQuickJumps();buildWindPopup();restoreVisualState();initAbout();if(!state.roundActive)showPreround();}

function restoreVisualState(){
  $('hole-num').textContent=state.hole;
  updateYardageDisplay();
  updateWindIcon();
  updateWeatherIcon();
  // Restore temp
  document.querySelectorAll('.temp-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.temp-btn.'+state.temp).forEach(b=>b.classList.add('active'));
  // Restore conditions visually
  state.activeConditions.forEach(k=>{const el=document.querySelector(`[data-cond="${k}"]`);if(el)el.classList.add('on');});
  // Restore elevation
  document.querySelectorAll('.elev-btn').forEach(b=>{const m=parseInt(b.dataset.mod);if(m===state.elevation&&m!==0)b.classList.add(m>0?'active-up':'active-dn');});
}

function initAbout(){$('about-privacy').textContent=CL.privacyPolicy;$('about-terms').textContent=CL.termsOfService;$('about-version').textContent='v'+CL.version+' · Built by Brian Bocek';}

// PRE-ROUND
function showPreround(){
  const w=CL.getWelcome();$('pre-silver').textContent=w.silver;$('pre-copper').textContent=w.copper;
  $('pre-hole').value=state.hole;if(state.course)$('pre-course').value=state.course;
  $('preround').classList.remove('hidden');$('banner').classList.add('faded');
}
function startRound(){
  state.course=$('pre-course').value.trim();state.hole=Math.max(1,Math.min(18,parseInt($('pre-hole').value)||1));
  state.roundActive=true;state.shots=[];
  if(state.course&&!state.recentCourses.includes(state.course)){state.recentCourses.unshift(state.course);state.recentCourses=state.recentCourses.slice(0,5);}
  $('hole-num').textContent=state.hole;$('preround').classList.add('hidden');$('banner').classList.remove('faded');saveState();haptic(15);
}

// WIND — direction popup
function cycleWind(){$('wind-popup').classList.remove('hidden');haptic(10);}
function buildWindPopup(){
  const sr=$('wind-speed-row'),dr=$('wind-dir-row');
  ['Off','Light','Mod','Strong'].forEach((l,i)=>{
    const b=document.createElement('button');b.className='wind-opt'+(i===state.windState?' active':'');b.textContent=l;b.dataset.wind=i;
    b.onclick=()=>{window._pendingWind=i;sr.querySelectorAll('.wind-opt').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    if(i>0)$('wind-dir-section').classList.add('show');else $('wind-dir-section').classList.remove('show');haptic(8);};
    sr.appendChild(b);
  });
  ['In Face','At Back','Cross L','Cross R'].forEach((l,i)=>{
    const dirs=['In Face','At Back','Cross Left','Cross Right'];
    const b=document.createElement('button');b.className='wind-opt'+(dirs[i]===state.windDir?' active':'');b.textContent=l;b.dataset.dir=dirs[i];
    b.onclick=()=>{window._pendingDir=dirs[i];dr.querySelectorAll('.wind-opt').forEach(x=>x.classList.remove('active'));b.classList.add('active');haptic(8);};
    dr.appendChild(b);
  });
  if(state.windState>0)$('wind-dir-section').classList.add('show');
  window._pendingWind=state.windState;window._pendingDir=state.windDir;
}
function closeWindPopup(){
  state.windState=window._pendingWind||0;state.windDir=window._pendingDir||'In Face';
  updateWindIcon();$('wind-popup').classList.add('hidden');saveState();
  if(state.currentScreen==='output')whatsMyPlay();
}
function updateWindIcon(){
  const s=state.windState,w=CL.windSpeeds[s];
  $('wind-label').textContent=w.label;$('wind-label').style.color=s>0?'#ccc':'#888';
  let p='';
  if(s>=1)p+='<path d="M1 7 Q4 5 7 7 Q10 9 13 7" fill="none" stroke="'+(s>0?'#ccc':'#666')+'" stroke-width="1.3" stroke-linecap="round"/>';
  if(s>=2)p+='<path d="M1 4 Q4 2 7 4 Q10 6 13 4" fill="none" stroke="#ccc" stroke-width="1" stroke-linecap="round"/>';
  if(s>=3)p+='<path d="M1 10 Q4 8 7 10 Q10 12 13 10" fill="none" stroke="#ccc" stroke-width=".8" stroke-linecap="round"/>';
  if(s===0)p='<path d="M1 7 Q4 5 7 7 Q10 9 13 7" fill="none" stroke="#666" stroke-width="1.3" stroke-linecap="round"/>';
  $('wind-icon').innerHTML=p;
}
function toggleWeather(){
  state.isRaining=!state.isRaining;updateWeatherIcon();saveState();
  if(state.currentScreen==='output')whatsMyPlay();haptic(10);
}
function updateWeatherIcon(){
  const icon=$('weather-icon');
  if(state.isRaining)icon.innerHTML='<path d="M3 5 Q3 2 7 2 Q11 2 11 5 Q13 5 13 8 Q13 10 10 10 L4 10 Q1 10 1 8 Q1 6 3 5Z" fill="none" stroke="var(--blue)" stroke-width="1.1"/><line x1="4" y1="11" x2="3" y2="13" stroke="var(--blue)" stroke-width=".8"/><line x1="7" y1="11" x2="6" y2="13" stroke="var(--blue)" stroke-width=".8"/><line x1="10" y1="11" x2="9" y2="13" stroke="var(--blue)" stroke-width=".8"/>';
  else icon.innerHTML='<circle cx="7" cy="7" r="3" fill="none" stroke="var(--gold)" stroke-width="1.1"/><line x1="7" y1="1" x2="7" y2="3" stroke="var(--gold)" stroke-width=".9"/><line x1="7" y1="11" x2="7" y2="13" stroke="var(--gold)" stroke-width=".9"/><line x1="1" y1="7" x2="3" y2="7" stroke="var(--gold)" stroke-width=".9"/><line x1="11" y1="7" x2="13" y2="7" stroke="var(--gold)" stroke-width=".9"/>';
}

// HOLE
function advanceHole(){if(state.hole>=18){if(confirm('Hole 18 complete. End round?'))endRound();return;}state.hole=Math.min(18,state.hole+1);$('hole-num').textContent=state.hole;saveState();}
function openHolePicker(){$('hole-picker').classList.remove('hidden');}
function closeHolePicker(){$('hole-picker').classList.add('hidden');}
function buildHoleGrid(){const g=$('hole-grid');g.innerHTML='';for(let i=1;i<=18;i++){const b=document.createElement('button');b.className='wind-opt';b.textContent=i;b.onclick=()=>{state.hole=i;$('hole-num').textContent=i;closeHolePicker();saveState();haptic(10);};g.appendChild(b);}}
function adjSettingsHole(d){state.hole=Math.max(1,Math.min(18,state.hole+d));$('hole-num').textContent=state.hole;$('set-hole').textContent=state.hole;saveState();haptic(8);if(state.hole>=18&&d>0&&state.shots.length>0)setTimeout(()=>{if(confirm('Hole 18. End round?'))endRound();},300);}

// INPUT — yardage
function adjustYard(dir){state.yardage=Math.max(10,Math.min(350,state.yardage+dir));state.skipDistance=false;updateYardageDisplay();haptic(8);}
function updateYardageDisplay(){$('yardage-num').textContent=state.skipDistance?'—':state.yardage;document.querySelectorAll('.qj-btn').forEach(b=>b.classList.toggle('active',parseInt(b.textContent)===state.yardage&&!state.skipDistance));}
function skipDistance(){state.skipDistance=true;state.yardage=0;updateYardageDisplay();haptic(10);}
function openKeypad(){const v=prompt('Yards to target:',state.skipDistance?'':state.yardage);if(v===null)return;const n=parseInt(v);if(!isNaN(n)&&n>=0&&n<=400){state.yardage=n;state.skipDistance=n===0;updateYardageDisplay();}}
function buildQuickJumps(){const qj=$('quick-jumps');[50,75,100,125,150,175,200].forEach(v=>{const b=document.createElement('button');b.className='qj-btn';b.textContent=v;b.onclick=()=>{state.yardage=v;state.skipDistance=false;updateYardageDisplay();haptic(8);};qj.appendChild(b);});}
function buildElevRow(){const r=$('elev-row');[{l:'None',m:0},{l:'▲ Slight',m:4},{l:'▲ Steep',m:10},{l:'▼ Slight',m:-4},{l:'▼ Steep',m:-10}].forEach(e=>{const b=document.createElement('button');b.className='elev-btn';b.textContent=e.l;b.dataset.mod=e.m;b.onclick=()=>{document.querySelectorAll('.elev-btn').forEach(x=>x.classList.remove('active-up','active-dn'));if(state.elevation===e.m){state.elevation=0;}else{state.elevation=e.m;if(e.m!==0)b.classList.add(e.m>0?'active-up':'active-dn');}haptic(8);};r.appendChild(b);});}
function setTemp(t,btn){state.temp=t;document.querySelectorAll('.temp-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.temp-btn.'+t).forEach(b=>b.classList.add('active'));saveState();haptic(8);}

// CONDITIONS — SVG icon grid
function buildConditionIcons(){
  const terrain=['tee','fairway','lt_rough','dp_rough','bare_dirt','fwy_bnk','grn_bnk','divot'];
  const slope=['up_lie','dn_lie','below_ft','above_ft','trees','water','lip'];
  const icons={tee:'<line x1="3" y1="9" x2="11" y2="9" stroke="C" stroke-width="1.2"/><line x1="7" y1="4" x2="7" y2="9" stroke="C" stroke-width="1.2"/>',fairway:'<path d="M1 9 Q5 7 7 8.5 Q9 10 13 8" fill="none" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',lt_rough:'<path d="M1 10 Q3 8 5 10 Q7 8 9 10 Q11 8 13 10" fill="none" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',dp_rough:'<path d="M1 12 Q2 7 3 12 Q4 6 5 12 Q6 7 7 12 Q8 6 9 12 Q10 7 11 12" fill="none" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',bare_dirt:'<line x1="1" y1="9" x2="13" y2="9" stroke="C" stroke-width="1.2"/><circle cx="5" cy="9" r=".6" fill="C"/><circle cx="9" cy="9" r=".5" fill="C"/>',fwy_bnk:'<path d="M2 9 Q5 5 7 9 Q9 5 12 9" fill="none" stroke="C" stroke-width="1.2"/><line x1="2" y1="9" x2="12" y2="9" stroke="C" stroke-width=".8"/>',grn_bnk:'<path d="M2 8 Q5 4 7 8 Q9 4 12 8" fill="none" stroke="C" stroke-width="1.2"/><line x1="8" y1="2" x2="8" y2="5" stroke="C" stroke-width=".8"/>',divot:'<ellipse cx="7" cy="9" rx="3.5" ry="2" fill="none" stroke="C" stroke-width="1"/><circle cx="7" cy="7.5" r="1.2" fill="none" stroke="C" stroke-width=".9"/>',up_lie:'<line x1="2" y1="12" x2="12" y2="4" stroke="C" stroke-width="1.2"/><circle cx="7" cy="8" r="1.2" fill="none" stroke="C" stroke-width="1"/>',dn_lie:'<line x1="2" y1="4" x2="12" y2="12" stroke="C" stroke-width="1.2"/><circle cx="7" cy="8" r="1.2" fill="none" stroke="C" stroke-width="1"/>',below_ft:'<line x1="3" y1="2" x2="3" y2="12" stroke="C" stroke-width="1"/><circle cx="8" cy="10" r="1.2" fill="none" stroke="C" stroke-width="1"/>',above_ft:'<line x1="3" y1="2" x2="3" y2="12" stroke="C" stroke-width="1"/><circle cx="8" cy="5" r="1.2" fill="none" stroke="C" stroke-width="1"/>',trees:'<line x1="7" y1="1" x2="7" y2="12" stroke="C" stroke-width="1.4" stroke-linecap="round"/><path d="M3 7 Q5 3 7 5 Q9 3 11 7" fill="none" stroke="C" stroke-width="1"/>',water:'<path d="M1 8 Q4 5 7 8 Q10 11 13 8" fill="none" stroke="C" stroke-width="1.3" stroke-linecap="round"/>',lip:'<path d="M3 12 L3 5 Q3 3 7 3" fill="none" stroke="C" stroke-width="1.3" stroke-linecap="round"/><line x1="3" y1="12" x2="12" y2="12" stroke="C" stroke-width="1.2"/>'};
  function mk(key){const c=CL.conditions[key],svg=(icons[key]||'').replace(/C/g,'#888'),mod=c.mod>0?`<div class="ci-mod">+${c.mod}</div>`:'';return `<div class="cond-icon" data-cond="${key}" onclick="toggleCondition('${key}')" aria-label="${c.label}"><svg width="14" height="14" viewBox="0 0 14 14">${svg}</svg>${mod}<div class="ci-label">${c.label}</div></div>`;}
  $('terrain-row').innerHTML=terrain.map(mk).join('');
  $('slope-row').innerHTML=slope.map(mk).join('');
}
function toggleCondition(key){
  haptic(10);
  const c=CL.conditions[key],el=document.querySelector(`[data-cond="${key}"]`),idx=state.activeConditions.indexOf(key);
  if(idx>=0){state.activeConditions.splice(idx,1);state.subScenario=null;el.classList.remove('on');saveState();return;}
  if(c.hasSub){openSubPanel(key);return;}
  if(c.group==='terrain'){state.activeConditions=state.activeConditions.filter(k=>CL.conditions[k].group!=='terrain');document.querySelectorAll('.cond-icon').forEach(e=>{if(CL.conditions[e.dataset.cond]&&CL.conditions[e.dataset.cond].group==='terrain')e.classList.remove('on');});}
  state.activeConditions.push(key);el.classList.add('on');saveState();
}

// SUB-PANELS with close buttons
function openSubPanel(key){
  const panel=$('sub-panel'),content=$('sub-content');
  const closeBtn='<div style="text-align:right;margin-bottom:4px"><button class="sub-close" onclick="closeSubPanel()" aria-label="Close">✕</button></div>';
  if(key==='tee')content.innerHTML=closeBtn+'<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">TEE SHOT</div><div class="sub-desc">What\'s the hole?</div></div><div class="sub-option" onclick="selectSub(\'tee\',\'par3\')"><div class="sub-option-label mc">Par 3</div><div class="sub-option-desc">Iron or wood to the green</div></div><div class="sub-option" onclick="selectSub(\'tee\',\'par45\')"><div class="sub-option-label mc">Par 4 / Par 5</div><div class="sub-option-desc">Find the fairway</div></div>';
  else if(key==='trees'){
    const lD=state.hand==='right'?'Draw / Hook':'Fade / Slice',rD=state.hand==='right'?'Fade / Slice':'Draw / Hook';
    content.innerHTML=closeBtn+'<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">TREES</div><div class="sub-desc">What\'s your play?</div></div><div class="sub-option" onclick="this.querySelector(\'.dir-row\').style.display=\'flex\'"><div class="sub-option-label mc">Go Around</div><div class="sub-option-desc">Shape the ball around the obstacle</div><div class="dir-row" style="display:none;margin-top:10px"><button class="dir-btn" onclick="event.stopPropagation();selectSub(\'trees\',\'around_l\')"><div class="dir-label mc">Go Left</div><div class="dir-sub">'+lD+'</div></button><button class="dir-btn" onclick="event.stopPropagation();selectSub(\'trees\',\'around_r\')"><div class="dir-label" style="color:var(--text-dim)">Go Right</div><div class="dir-sub">'+rD+'</div></button></div></div><div style="display:flex;gap:8px"><div class="sub-option" style="flex:1" onclick="selectSub(\'trees\',\'over\')"><div class="sub-option-label" style="color:var(--text-dim)">Go Over</div><div class="sub-option-desc">Launch it high</div></div><div class="sub-option" style="flex:1" onclick="selectSub(\'trees\',\'punch\')"><div class="sub-option-label" style="color:var(--text-dim)">Punch Out</div><div class="sub-option-desc">Get to safety</div></div></div>';
  }
  else if(key==='grn_bnk')content.innerHTML=closeBtn+'<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">GREENSIDE BUNKER</div><div class="sub-desc">What\'s the lie?</div></div><div class="sub-option" onclick="selectSub(\'grn_bnk\',\'clean\')"><div class="sub-option-label mc">Clean Lie</div></div><div class="sub-option" onclick="selectSub(\'grn_bnk\',\'plugged\')"><div class="sub-option-label mc">Plugged / Fried Egg</div></div><div class="sub-option" onclick="selectSub(\'grn_bnk\',\'wet\')"><div class="sub-option-label mc">Wet Sand</div></div>';
  else if(key==='water')content.innerHTML=closeBtn+'<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">WATER HAZARD</div><div class="sub-desc">Where\'s the water?</div></div><div class="sub-option" onclick="this.querySelector(\'.dir-row\').style.display=\'flex\'"><div class="sub-option-label mc">In Front</div><div class="sub-option-desc">Between you and the green</div><div class="dir-row" style="display:none;margin-top:10px"><button class="dir-btn" onclick="event.stopPropagation();selectSub(\'water\',\'front_over\')"><div class="dir-label" style="color:var(--green)">Go Over</div><div class="dir-sub">Carry the water</div></button><button class="dir-btn" onclick="event.stopPropagation();selectSub(\'water\',\'front_layup\')"><div class="dir-label" style="color:var(--text-dim)">Lay Up</div><div class="dir-sub">Play it safe</div></button></div></div><div class="sub-option" onclick="selectSub(\'water\',\'left\')"><div class="sub-option-label mc">Water Left</div></div><div class="sub-option" onclick="selectSub(\'water\',\'right\')"><div class="sub-option-label mc">Water Right</div></div><div class="sub-option" onclick="selectSub(\'water\',\'crossing\')"><div class="sub-option-label mc">Crossing</div><div class="sub-option-desc">Must carry — no way around</div></div>';
  panel.classList.add('open');
}
function selectSub(parent,sub){state.subScenario=parent+'_'+sub;if(!state.activeConditions.includes(parent)){const c=CL.conditions[parent];if(c.group==='terrain'){state.activeConditions=state.activeConditions.filter(k=>CL.conditions[k].group!=='terrain');document.querySelectorAll('.cond-icon').forEach(e=>{if(CL.conditions[e.dataset.cond]&&CL.conditions[e.dataset.cond].group==='terrain')e.classList.remove('on');});}state.activeConditions.push(parent);const el=document.querySelector(`[data-cond="${parent}"]`);if(el)el.classList.add('on');}closeSubPanel();saveState();haptic(10);}
function closeSubPanel(){$('sub-panel').classList.remove('open');}

// WHAT'S MY PLAY — with merge engine
function whatsMyPlay(){
  resetCards();
  const isTee=state.subScenario&&state.subScenario.startsWith('tee_');
  const isPunch=state.subScenario==='trees_punch';
  const isLayup=state.subScenario==='water_front_layup';
  state._isTee=isTee;

  // Short game / putting detection (#30)
  const isPutt=!state.skipDistance&&CL.isPutting(state.yardage);
  const isChip=!state.skipDistance&&CL.isShortGame(state.yardage)&&!isPutt;

  // Determine base key for merge engine
  let baseKey='_default';
  if(isPutt)baseKey='putting';
  else if(isChip)baseKey='chipping';
  else if(state.subScenario&&CL.base[state.subScenario])baseKey=state.subScenario;
  else if(state.activeConditions.length){const last=state.activeConditions[state.activeConditions.length-1];if(CL.base[last])baseKey=last;}
  state._baseKey=baseKey;

  // Active slope conditions for modifiers
  const slopeConds=state.activeConditions.filter(k=>{const c=CL.conditions[k];return c&&(c.group==='slope');});

  // Merge advice (#23/#24)
  const advice=CL.mergeAdvice(baseKey,slopeConds,state.windState,state.windDir,state.isRaining,state.hand);

  // Calculate adjusted distance
  let adjusted=state.yardage,mods=[];
  if(state.windState>0){const wm=CL.getWindMod(state.windState,state.windDir);adjusted+=wm;mods.push({label:(wm>=0?'+':'')+wm+' wind',color:'var(--silver)',type:'wind'});}
  if(state.isRaining){adjusted+=CL.rainMod;mods.push({label:'+'+CL.rainMod+' rain',color:'var(--blue)',type:'rain'});}
  state.activeConditions.forEach(key=>{const c=CL.conditions[key];if(c&&c.mod>0){adjusted+=c.mod;mods.push({label:'+'+c.mod,color:'var(--green)',type:key});}});
  if(state.elevation!==0){adjusted+=state.elevation;mods.push({label:(state.elevation>0?'+':'')+state.elevation,color:state.elevation>0?'var(--green)':'var(--red)',type:'elev'});}
  // Temperature (#26)
  const tempMod=CL.tempMods[state.temp]||0;
  if(tempMod!==0){adjusted+=tempMod;mods.push({label:(tempMod>0?'+':'')+tempMod+' temp',color:state.temp==='hot'?'var(--red)':'var(--blue)',type:'temp'});}

  // Club selection
  let smartClub=null,heroClub=null,layupClub=null,bestWedgeDist=0;
  if(!state.skipDistance&&!isPutt&&!isChip){
    smartClub=CL.findClub(state.bag,adjusted,isTee);
    if(!smartClub){alert('No active clubs. Check My Bag.');return;}
    heroClub=CL.findHeroClub(state.bag,smartClub,adjusted,isTee,isPunch);
    if(isLayup){bestWedgeDist=CL.getBestWedgeDist(state.bag);layupClub=CL.findLayupClub(state.bag,state.yardage,bestWedgeDist);}
  }else if(!isPutt&&!isChip){
    // Skip distance — technique only (#18)
    smartClub={name:'Setup',dist:0};heroClub={name:'Setup',dist:0};
  }else{
    smartClub={name:isPutt?'Putter':'Wedge',dist:0};heroClub={name:isPutt?'Putter':'Wedge',dist:0};
  }

  const conf=CL.calcConfidence(state.activeConditions,state.windState,state.isRaining,smartClub.dist);

  // Tee par 4/5 smart play names safe club (#29)
  let smartText=advice.smartText||'center green.';
  if(state.subScenario==='tee_par45'&&smartClub.dist>0){
    const safe=state.bag.filter(c=>c.on&&!c.teeOnly).sort((a,b)=>b.dist-a.dist);
    if(safe.length)smartText=smartText.replace('to the fairway',safe[0].name+' to the fairway');
  }
  // Layup text
  if(isLayup&&layupClub){smartText=layupClub.name+' — lay up to '+bestWedgeDist+' yds out. '+smartText;}

  // Display
  $('out-yardage').textContent=state.skipDistance?'—':state.yardage;
  $('out-adjusted').textContent=state.skipDistance?'—':adjusted;
  const clubDisplay=isLayup&&layupClub?layupClub.name:smartClub.name;
  $('out-club').textContent=clubDisplay.toUpperCase();
  $('out-mods').innerHTML=mods.map(m=>`<div class="trust-mod-num" style="color:${m.color}">${m.label}</div>`).join('<div style="margin:0 2px;color:var(--text-dimmer)">·</div>');
  $('conf-smart').style.width=conf.smart+'%';
  $('conf-hero').style.width=conf.hero+'%';

  // Situation tags
  let tags=[];
  if(state.subScenario){const sl=CL.getSubLabel(state.subScenario,state.hand);tags.push({label:sl,type:'terrain'});}
  else state.activeConditions.forEach(k=>{const c=CL.conditions[k];tags.push({label:c.label+(c.mod>0?' +'+c.mod:''),type:c.group});});
  if(state.windState>0)tags.push({label:'Wind '+CL.windSpeeds[state.windState].label+' '+state.windDir,type:'wind'});
  if(state.isRaining)tags.push({label:'Rain +'+CL.rainMod,type:'wind'});
  if(state.elevation!==0)tags.push({label:'Elev '+(state.elevation>0?'+':'')+state.elevation,type:'slope'});
  if(tempMod!==0)tags.push({label:state.temp+' '+(tempMod>0?'+':'')+tempMod,type:'wind'});
  $('situation-summary').innerHTML=tags.length?tags.map(t=>`<span class="sit-tag ${t.type}">${t.label}</span>`).join('')+'<div style="font-size:10px;color:var(--text-dimmer);margin-top:3px">Tap yardage to edit</div>':'<div style="font-size:12px;color:var(--text-dim)">Clean lie · No obstacles</div>';

  // Cards — front text
  const condKey=state.activeConditions.length?state.activeConditions[state.activeConditions.length-1]:'_default';
  const kickerKey=baseKey==='_default'?condKey:baseKey.split('_')[0]||condKey;
  $('smart-text').textContent=clubDisplay+' — '+smartText;
  $('smart-text').innerHTML+='<div class="card-kicker mc" style="margin-top:8px">'+CL.getKicker(kickerKey)+'</div>';
  $('hero-text').textContent=heroClub.name+' — '+(advice.heroText||'at the pin.');
  $('hero-text').innerHTML+='<div class="card-kicker mc" style="margin-top:8px">'+CL.getKicker(kickerKey)+'</div>';

  // Cards — back setup
  buildSetupBack('smart-setup',advice,smartClub,'smart');
  buildSetupBack('hero-setup',advice,heroClub,'hero');

  state._smartClub=smartClub;state._heroClub=heroClub;state._adjusted=adjusted;state._mods=mods;
  showScreen('output');
}

function buildSetupBack(elId,advice,club,type){
  const el=$(elId),isH=type==='hero',lc=isH?'mc':'mg';let h='';
  if(state.showEverySwing)h+=`<div class="every-swing"><div class="every-swing-label" style="color:${isH?'var(--copper)':'var(--gold)'}">EVERY SWING</div><div class="every-swing-text">${CL.everySwing}</div></div>`;
  ['ball','weight','swing','aim','hands'].forEach(k=>{
    if(advice[k])h+=`<div class="setup-row"><span class="setup-label ${lc}">${k.charAt(0).toUpperCase()+k.slice(1)}</span><span class="setup-value ms">${advice[k]}</span></div>`;
  });
  // Extras from modifiers
  if(advice.extras&&advice.extras.length)h+=`<div class="setup-row"><span class="setup-label ${lc}">Note</span><span class="setup-value ms">${advice.extras.join(' ')}</span></div>`;
  if(!isH&&advice.remember)h+=`<div class="remember-section"><div class="remember-label">REMEMBER</div><div class="remember-text">${advice.remember}</div></div>`;
  if(isH&&advice.heroDanger)h+=`<div class="danger-section"><div class="danger-label">DANGER</div><div class="danger-text">${advice.heroDanger}</div></div>`;
  h+=`<div class="closing-kicker"><span class="mc">${CL.getKicker(state._baseKey||'_default')}</span></div>`;
  el.innerHTML=h;
}

function flipCard(wrap){wrap.querySelector('.card-inner').classList.toggle('flipped');haptic(8);}
function resetCards(){document.querySelectorAll('.card-inner').forEach(c=>c.classList.remove('flipped'));}

// COMMIT (#62 debounce)
function commitSmart(){debounce(()=>{logShot('smart',state._smartClub);resetAndAdvance();haptic(20);});}
function commitHero(){debounce(()=>{logShot('hero',state._heroClub);resetAndAdvance();haptic(20);});}
function logShot(type,club){state.shots.push({hole:state.hole,yardage:state.yardage,adjusted:state._adjusted,conditions:[...state.activeConditions],sub:state.subScenario,subLabel:state.subScenario?CL.getSubLabel(state.subScenario,state.hand):'',wind:state.windState,windDir:state.windDir,rain:state.isRaining,elev:state.elevation,temp:state.temp,club:club?club.name:'',type:type,time:Date.now(),thumbs:null});saveState();}
function resetAndAdvance(){advanceHole();goToInput();}
function editFromOutput(){showScreen('input');} // #21 preserve conditions
function resetConditions(){state.activeConditions=[];state.subScenario=null;state.elevation=0;state.yardage=150;state.skipDistance=false;document.querySelectorAll('.cond-icon').forEach(e=>e.classList.remove('on'));document.querySelectorAll('.elev-btn').forEach(b=>b.classList.remove('active-up','active-dn'));updateYardageDisplay();}

// SCREENS
function showScreen(name){closeMenu();['input','output','bag','settings','history','share','about','confessional'].forEach(s=>{const el=$('screen-'+s);if(el)el.classList.toggle('hidden',s!==name);});state.currentScreen=name;
  // Active menu item (#36)
  document.querySelectorAll('.menu-item[data-screen]').forEach(m=>m.classList.toggle('active-screen',m.dataset.screen===name));
  if(name==='bag')renderBag();if(name==='settings')renderSettings();if(name==='history')renderHistory();
  if(name==='about'){$('about-privacy').textContent=CL.privacyPolicy;$('about-terms').textContent=CL.termsOfService;}
  saveState();
}
function goToInput(){closeMenu();showScreen('input');resetCards();}
function openMenu(){$('menu').classList.remove('hidden');haptic(10);}
function closeMenu(){$('menu').classList.add('hidden');}

// MY BAG (#32 delete, #33 teeOnly, #34 validation)
function renderBag(){CL.sortBag(state.bag);$('bag-list').innerHTML=state.bag.map((c,i)=>`<div class="club-row ${c.on?'':'off'}"><div class="toggle ${c.on?'on':'off'}" onclick="toggleClub(${i})"><div class="toggle-dot"></div></div><div class="club-row-name ${c.on?'mg':''}" style="${c.on?'':'color:#555'}" onclick="renameClub(${i})">${c.name}${c.teeOnly?' <span style="font-size:8px;color:var(--text-dimmer)">(tee)</span>':''}</div><div class="club-dist-area"><button class="club-adj-btn" onclick="adjClubDist(${i},-5)">−</button><div class="club-dist-num ${c.on?'mg':''}" style="${c.on?'':'color:#555'}" onclick="typeClubDist(${i})">${c.dist}</div><button class="club-adj-btn" onclick="adjClubDist(${i},5)">+</button><span class="club-dist-yds">yds</span></div><button class="club-delete" onclick="deleteClub(${i})" aria-label="Delete">✕</button></div>`).join('');const lt=$('lefty-toggle');lt.classList.toggle('on',state.hand==='left');lt.classList.toggle('off',state.hand!=='left');}
function adjClubDist(i,d){state.bag[i].dist=Math.max(20,Math.min(400,state.bag[i].dist+d));CL.sortBag(state.bag);saveState();renderBag();haptic(8);}
function typeClubDist(i){const v=prompt('Distance (20–400):',state.bag[i].dist);if(v===null)return;const n=parseInt(v);if(isNaN(n)||n<20||n>400){alert('Enter 20–400.');return;}state.bag[i].dist=n;CL.sortBag(state.bag);saveState();renderBag();}
function renameClub(i){const v=prompt('Club name:',state.bag[i].name);if(v&&v.trim()){state.bag[i].name=v.trim();if(v.toLowerCase().includes('driver'))state.bag[i].teeOnly=true;saveState();renderBag();}}
function toggleClub(i){state.bag[i].on=!state.bag[i].on;saveState();renderBag();haptic(10);}
function toggleLefty(){state.hand=state.hand==='right'?'left':'right';saveState();renderBag();haptic(10);}
function addClub(){const n=prompt('Club name:');if(!n||!n.trim())return;const d=prompt('Distance (20–400):','100');if(!d||isNaN(d))return;const dist=Math.max(20,Math.min(400,parseInt(d)));state.bag.push({name:n.trim(),dist:dist,on:true,teeOnly:n.toLowerCase().includes('driver')});CL.sortBag(state.bag);saveState();renderBag();haptic(15);}
function deleteClub(i){if(!confirm('Delete '+state.bag[i].name+'?'))return;state.bag.splice(i,1);saveState();renderBag();haptic(15);}

// SETTINGS (#37 oninput, #38 every swing toggle)
function renderSettings(){$('set-course').value=state.course||'';$('set-hole').textContent=state.hole;$('set-shots').textContent=state.shots.length;const st=$('swing-toggle');st.classList.toggle('on',state.showEverySwing);st.classList.toggle('off',!state.showEverySwing);}
function updateCourse(v){state.course=v.trim();if(state.course&&!state.recentCourses.includes(state.course)){state.recentCourses.unshift(state.course);state.recentCourses=state.recentCourses.slice(0,5);}saveState();}
function toggleEverySwing(){state.showEverySwing=!state.showEverySwing;saveState();renderSettings();}

// END ROUND / CONFESSIONAL (#45 uses current shots, #46 cancel)
function endRound(){showScreen('confessional');
  const total=state.shots.length,smart=state.shots.filter(s=>s.type==='smart').length,hero=state.shots.filter(s=>s.type==='hero').length;
  $('conf-stats').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid #111;margin-bottom:12px"><span style="font-size:14px" class="ms">Shots consulted</span><span style="font-size:28px;font-weight:600" class="mg">${total}</span></div><div style="display:flex;gap:10px"><div style="flex:1;text-align:center;padding:10px;border:1.5px solid #2a4a2a;border-radius:6px"><div style="font-size:26px;font-weight:600;color:var(--green)">${smart}</div><div style="font-size:10px;color:var(--green)">Smart Play</div></div><div style="flex:1;text-align:center;padding:10px;border:1.5px solid #3a2010;border-radius:6px"><div style="font-size:26px;font-weight:600;color:var(--copper)">${hero}</div><div style="font-size:10px;color:var(--copper)">Let It Eat</div></div></div>`;
  const heroShots=state.shots.filter(s=>s.type==='hero');
  $('conf-hero-box').innerHTML=heroShots.map(s=>`<div class="hero-moment"><div style="font-size:10px;color:var(--copper);letter-spacing:.08em;font-weight:600;margin-bottom:4px">YOUR HERO MOMENT</div><p style="font-size:14px;line-height:1.5" class="ms">Hole ${s.hole}. ${s.subLabel||s.conditions.map(c=>CL.conditions[c]?.label).join(' · ')||'Clean lie'}. You chose ${s.club}.</p><p style="font-family:var(--serif);font-size:13px;font-style:italic;margin-top:6px" class="mc">How'd that work out?</p></div>`).join('');
  state.confScore=null;$('conf-score').textContent='—';
  let pool;if(hero===0&&total>0)pool=CL.confessionalKickers.allSmart;else if(hero<=2)pool=CL.confessionalKickers.someHero;else pool=CL.confessionalKickers.manyHero;if(total===0)pool=CL.confessionalKickers.lowUsage;
  const kick=pool[Math.floor(Math.random()*pool.length)];
  $('conf-kicker').innerHTML=`<p style="font-size:16px;line-height:1.5" class="ms">${total} shots. ${smart>0?smart+' times you listened.':'The caddy was waiting.'}</p><p style="font-family:var(--serif);font-size:14px;font-style:italic;margin-top:5px" class="mc">${kick}</p>`;
}
function adjScore(d){const defs={'80s':88,'90s':96,'100s':104,'110+':112};if(state.confScore===null)state.confScore=defs[state.range]||100;state.confScore=Math.max(50,Math.min(150,state.confScore+d));$('conf-score').textContent=state.confScore;haptic(8);}
function finishRound(){state.rounds.push({date:new Date().toLocaleDateString(),course:state.course,shots:[...state.shots],score:state.confScore,smart:state.shots.filter(s=>s.type==='smart').length,hero:state.shots.filter(s=>s.type==='hero').length});state.roundActive=false;state.shots=[];state.hole=1;$('hole-num').textContent='1';cleanupRounds();saveState();goToInput();haptic(20);}

// HISTORY (#39 thumbs, #40 delete, #41 wind direction)
function renderHistory(){const list=$('history-list');let h='';
  if(state.shots.length){h+=`<div style="padding:8px 0;border-bottom:1px solid #111"><div style="display:flex;justify-content:space-between"><span style="font-size:15px;font-weight:600" class="mg">Today${state.course?' — '+state.course:''}</span><span style="font-size:11px;color:var(--text-dim)">${state.shots.length} shots</span></div></div>`;
  h+=state.shots.slice().reverse().map((s,ri)=>{const idx=state.shots.length-1-ri;
    const windStr=s.wind>0?'Wind '+CL.windSpeeds[s.wind]?.label+' '+(s.windDir||'')+(s.rain?' + Rain':''):(s.rain?'Rain':'');
    return `<div class="shot-entry"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-size:13px;font-weight:600" class="ms">Hole ${s.hole}</span><span class="shot-tag ${s.type==='smart'?'smart':'hero'}">${s.type==='smart'?'Smart':'Let It Eat'}</span></div><div style="font-size:12px;color:var(--text-dim);line-height:1.4">${s.yardage?s.yardage+' yds':'Technique'} · ${s.subLabel||s.conditions.map(c=>CL.conditions[c]?.label).join(' · ')||'Clean'} · <span class="mg">${s.club}</span></div>${windStr?'<div style="font-size:10px;color:var(--silver);margin-top:2px">'+windStr+'</div>':''}<div class="thumb-row"><button class="thumb-btn up ${s.thumbs==='up'?'active':''}" onclick="thumbShot(${idx},'up')">Good</button><button class="thumb-btn dn ${s.thumbs==='down'?'active':''}" onclick="thumbShot(${idx},'down')">Bad</button><button class="delete-shot-btn" onclick="deleteShot(${idx})">Delete</button></div></div>`;}).join('');}
  state.rounds.slice().reverse().forEach(r=>{h+=`<div style="padding:8px 0;border-bottom:1px solid #111;opacity:.6"><div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:var(--text-dim)">${r.date}${r.course?' — '+r.course:''}</span><span style="font-size:10px;color:var(--text-dimmer)">${r.shots.length} shots${r.score?' · '+r.score:''}</span></div></div>`;});
  if(!h)h='<div style="text-align:center;padding:40px 0;color:var(--text-dimmer);font-size:14px">No shots logged yet.</div>';
  list.innerHTML=h;
}
function thumbShot(idx,dir){state.shots[idx].thumbs=state.shots[idx].thumbs===dir?null:dir;saveState();renderHistory();haptic(10);}
function deleteShot(idx){if(!confirm('Delete this shot?'))return;state.shots.splice(idx,1);saveState();renderHistory();haptic(15);}

// SHARE (#45 current shots, #47 clipboard fallback, #48 course+date)
function showShare(){showScreen('share');
  const t=state.shots.length,s=state.shots.filter(x=>x.type==='smart').length,he=state.shots.filter(x=>x.type==='hero').length;
  let fk='';if(he===0&&t>0){const p=CL.flexKickers.perfect;fk=p[Math.floor(Math.random()*p.length)].replace(/{smart}/g,s).replace(/{total}/g,t);}else if(t>0){const p=CL.flexKickers.withHero;fk=p[Math.floor(Math.random()*p.length)].replace(/{smart}/g,s).replace(/{total}/g,t).replace(/{hero}/g,he);}
  let h='';
  if(t>0)h+=`<div style="border:1.5px solid;border-image:linear-gradient(135deg,#6B4420,var(--copper),#E8A878,var(--copper),#6B4420) 1;padding:24px;text-align:center;margin-bottom:14px;background:#050503">${state.course?'<div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">'+state.course+'</div>':''}<div style="font-size:9px;color:var(--text-dimmer);margin-bottom:12px">${new Date().toLocaleDateString()}</div><div style="display:flex;gap:12px;justify-content:center;margin-bottom:16px"><div><div style="font-size:36px;font-weight:600" class="mg">${t}</div><div style="font-size:10px;color:var(--text-dim)">shots</div></div><div style="width:1px;background:var(--border)"></div><div><div style="font-size:36px;font-weight:600;color:var(--green)">${s}</div><div style="font-size:10px;color:var(--green)">smart</div></div><div style="width:1px;background:var(--border)"></div><div><div style="font-size:36px;font-weight:600;color:var(--copper)">${he}</div><div style="font-size:10px;color:var(--copper)">hero</div></div></div><p style="font-family:var(--serif);font-size:15px;font-style:italic;line-height:1.5" class="mc">${fk}</p></div>`;
  else h+='<div style="text-align:center;padding:30px 0;color:var(--text-dimmer)">Play a round first.</div>';
  h+='<div style="font-size:10px;color:var(--text-dim);letter-spacing:.06em;margin:12px 0 8px;font-weight:600">SHARE TEXT</div>';
  CL.roasts.forEach(r=>{const txt=r.replace(/{total}/g,t||'?').replace(/{smart}/g,s||'?').replace(/{hero}/g,he||'?');h+=`<div class="roast-card"><div class="roast-text">${txt}</div><div class="roast-actions"><button class="roast-copy" onclick="copyText(this,'${txt.replace(/'/g,"\\'")}')">Copy</button><button class="roast-share" onclick="shareText('${txt.replace(/'/g,"\\'")}')">Share</button></div></div>`;});
  $('share-content').innerHTML=h;
}
function copyText(btn,txt){navigator.clipboard.writeText(txt).then(()=>{btn.textContent='Copied';btn.classList.add('copied');setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);}).catch(()=>{showToast('Copy failed');});}
function shareText(txt){if(navigator.share)navigator.share({text:txt}).catch(()=>{});else{navigator.clipboard.writeText(txt).then(()=>showToast('Copied'));}}
function showToast(msg){const t=$('clipboard-toast');t.textContent=msg||'Copied';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}

// RESET (#55)
function resetApp(){if(!confirm('Reset all data? Bag, history, settings — everything.'))return;if(!confirm('Are you sure? Cannot be undone.'))return;try{localStorage.removeItem('cl-state');}catch(e){}location.reload();}

document.addEventListener('DOMContentLoaded',init);
