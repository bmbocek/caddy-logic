// CADDY LOGIC — App v1.0.4 Beta
// Premium aesthetic. Concise caddy voice. Merge engine. All fixes.
// Commit stays on same hole. Weather persists. Cards are short.
'use strict';

const state={name:'',hand:'right',range:'100s',bag:[],temp:'mild',showEverySwing:false,course:'',hole:1,
windState:0,windDir:'In Face',isRaining:false,shots:[],roundActive:false,yardage:150,skipDistance:false,
elevation:0,activeConditions:[],subScenario:null,rounds:[],recentCourses:[],currentScreen:'input',
onboarded:false,confScore:null,_smartClub:null,_heroClub:null,_adjusted:0,_mods:[],_isTee:false,_baseKey:'_default',_lastPlayText:''};

function $(id){return document.getElementById(id);}
let _commitLock=false;
function debounce(fn){if(_commitLock)return;_commitLock=true;fn();setTimeout(()=>{_commitLock=false;},600);}
function haptic(ms){if(navigator.vibrate)try{navigator.vibrate(ms||10);}catch(e){}}
function loadState(){try{const s=localStorage.getItem('cl-state');if(s)Object.assign(state,JSON.parse(s));}catch(e){}}
function saveState(){try{const s={...state};delete s._smartClub;delete s._heroClub;localStorage.setItem('cl-state',JSON.stringify(s));}catch(e){}}
function cleanupRounds(){if(state.rounds.length>20)state.rounds=state.rounds.slice(-20);saveState();}
// Truncate to first sentence
function firstSentence(t){if(!t)return'';const m=t.match(/^[^.!]+[.!]?/);return m?m[0].trim():t.substring(0,80);}

function init(){
  loadState();
  if(!state.onboarded)showOnboarding();
  else showMainApp();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
  setTimeout(()=>{const sp=$('splash');if(sp){sp.classList.add('fade');setTimeout(()=>sp.remove(),600);}},800);
}

// ONBOARDING
function showOnboarding(){$('onboarding').classList.remove('hidden');$('main-app').classList.add('hidden');}
function selectHand(el){document.querySelectorAll('[data-hand]').forEach(b=>b.classList.remove('selected'));el.classList.add('selected');state.hand=el.dataset.hand;}
function selectRange(el){document.querySelectorAll('[data-range]').forEach(b=>b.classList.remove('selected'));el.classList.add('selected');state.range=el.dataset.range;}
function obNext(step){$('ob-'+step).classList.add('hidden');if(step===1){state.name=$('ob-name').value.trim()||'Golfer';$('ob-2').classList.remove('hidden');}else if(step===2){state.bag=JSON.parse(JSON.stringify(CL.bags[state.range]||CL.bags['100s']));CL.sortBag(state.bag);$('ob-range-label').textContent=state.range;renderObBag();$('ob-3').classList.remove('hidden');}else if(step===3){showObConfirm();}haptic(10);}
function obBack(step){$('ob-'+step).classList.add('hidden');$('ob-'+(step-1)).classList.remove('hidden');haptic(10);}
function renderObBag(){$('ob-bag-list').innerHTML=state.bag.map((c,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #111;min-height:44px"><span style="font-size:14px" class="mg">${c.name}${c.teeOnly?' <span style="font-size:8px;color:var(--text-dimmer)">(tee)</span>':''}</span><div style="display:flex;align-items:center;gap:6px"><button class="club-adj-btn" onclick="obAdjDist(${i},-5)">−</button><span style="font-size:16px;font-weight:600;min-width:36px;text-align:center;cursor:pointer" class="mg" onclick="obTypeDist(${i})">${c.dist}</span><button class="club-adj-btn" onclick="obAdjDist(${i},5)">+</button></div></div>`).join('');}
function obAdjDist(i,d){state.bag[i].dist=Math.max(20,Math.min(400,state.bag[i].dist+d));CL.sortBag(state.bag);renderObBag();haptic(8);}
function obTypeDist(i){const v=prompt(state.bag[i].name+' distance:',state.bag[i].dist);if(v===null)return;const n=parseInt(v);if(isNaN(n)||n<20||n>400)return;state.bag[i].dist=n;CL.sortBag(state.bag);renderObBag();}
function showObConfirm(){$('ob-3').classList.add('hidden');$('ob-4').classList.remove('hidden');$('ob-confirm-name').textContent=state.name;const checks=[`${state.hand==='right'?'Right':'Left'}-handed`,`Range: ${state.range}`,`${state.bag.filter(c=>c.on).length} clubs`];$('ob-confirm-list').innerHTML=checks.map(c=>`<div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #111"><svg width="18" height="18" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" fill="none" stroke="var(--green)" stroke-width="1.2"/><path d="M4 7 L6 9 L10 5" fill="none" stroke="var(--green)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="font-size:14px" class="ms">${c}</span></div>`).join('');}
function obFinish(){state.onboarded=true;saveState();$('onboarding').classList.add('hidden');showMainApp();haptic(20);}

// MAIN APP
function showMainApp(){$('main-app').classList.remove('hidden');$('main-app').style.display='flex';buildConditionIcons();buildHoleGrid();buildElevRow();buildQuickJumps();buildWindPopup();restoreVisualState();initAbout();if(!state.roundActive)showPreround();}
function restoreVisualState(){$('hole-num').textContent=state.hole;updateYardageDisplay();updateWindIcon();updateWeatherIcon();document.querySelectorAll('.temp-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.temp-btn.'+state.temp).forEach(b=>b.classList.add('active'));state.activeConditions.forEach(k=>{const el=document.querySelector(`[data-cond="${k}"]`);if(el)el.classList.add('on');});document.querySelectorAll('.elev-btn').forEach(b=>{const m=parseInt(b.dataset.mod);if(m===state.elevation&&m!==0)b.classList.add(m>0?'active-up':'active-dn');});}
function initAbout(){$('about-privacy').textContent=CL.privacyPolicy;$('about-terms').textContent=CL.termsOfService;$('about-version').textContent='v'+CL.version+' · Built by Brian Bocek';}

// PRE-ROUND — only shows for fresh rounds
function showPreround(){const w=CL.getWelcome();$('pre-silver').textContent=w.silver;$('pre-copper').textContent=w.copper;$('pre-hole').value=state.hole;if(state.course)$('pre-course').value=state.course;$('preround').classList.remove('hidden');$('banner').classList.add('faded');}
function startRound(){state.course=$('pre-course').value.trim();state.hole=Math.max(1,Math.min(18,parseInt($('pre-hole').value)||1));state.roundActive=true;state.shots=[];if(state.course&&!state.recentCourses.includes(state.course)){state.recentCourses.unshift(state.course);state.recentCourses=state.recentCourses.slice(0,5);}$('hole-num').textContent=state.hole;$('preround').classList.add('hidden');$('banner').classList.remove('faded');saveState();haptic(15);}

// WIND — abbreviated labels: Off / Lt / Mod / Str
function cycleWind(){$('wind-popup').classList.remove('hidden');haptic(10);}
function buildWindPopup(){const sr=$('wind-speed-row'),dr=$('wind-dir-row');['Off','Lt','Mod','Str'].forEach((l,i)=>{const b=document.createElement('button');b.className='wind-opt'+(i===state.windState?' active':'');b.textContent=l;b.dataset.wind=i;b.onclick=()=>{window._pw=i;sr.querySelectorAll('.wind-opt').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(i>0)$('wind-dir-section').classList.add('show');else $('wind-dir-section').classList.remove('show');haptic(8);};sr.appendChild(b);});['Face','Back','Cr L','Cr R'].forEach((l,i)=>{const dirs=['In Face','At Back','Cross Left','Cross Right'];const b=document.createElement('button');b.className='wind-opt'+(dirs[i]===state.windDir?' active':'');b.textContent=l;b.dataset.dir=dirs[i];b.onclick=()=>{window._pd=dirs[i];dr.querySelectorAll('.wind-opt').forEach(x=>x.classList.remove('active'));b.classList.add('active');haptic(8);};dr.appendChild(b);});if(state.windState>0)$('wind-dir-section').classList.add('show');window._pw=state.windState;window._pd=state.windDir;}
function closeWindPopup(){state.windState=window._pw||0;state.windDir=window._pd||'In Face';updateWindIcon();$('wind-popup').classList.add('hidden');saveState();if(state.currentScreen==='output')whatsMyPlay();}
function updateWindIcon(){const s=state.windState;const labels=['Off','Lt','Mod','Str'];$('wind-label').textContent=labels[s];$('wind-label').style.color=s>0?'var(--silver)':'#666';let p='';if(s>=1)p+='<path d="M1 7 Q4 5 7 7 Q10 9 13 7" fill="none" stroke="'+(s>0?'#ccc':'#666')+'" stroke-width="1.3" stroke-linecap="round"/>';if(s>=2)p+='<path d="M1 4 Q4 2 7 4 Q10 6 13 4" fill="none" stroke="#ccc" stroke-width="1" stroke-linecap="round"/>';if(s>=3)p+='<path d="M1 10 Q4 8 7 10 Q10 12 13 10" fill="none" stroke="#ccc" stroke-width=".8" stroke-linecap="round"/>';if(s===0)p='<path d="M1 7 Q4 5 7 7 Q10 9 13 7" fill="none" stroke="#666" stroke-width="1.3" stroke-linecap="round"/>';$('wind-icon').innerHTML=p;}
function toggleWeather(){state.isRaining=!state.isRaining;updateWeatherIcon();saveState();if(state.currentScreen==='output')whatsMyPlay();haptic(10);}
function updateWeatherIcon(){const icon=$('weather-icon');if(state.isRaining)icon.innerHTML='<path d="M3 5 Q3 2 7 2 Q11 2 11 5 Q13 5 13 8 Q13 10 10 10 L4 10 Q1 10 1 8 Q1 6 3 5Z" fill="none" stroke="var(--blue)" stroke-width="1.1"/><line x1="4" y1="11" x2="3" y2="13" stroke="var(--blue)" stroke-width=".8"/><line x1="7" y1="11" x2="6" y2="13" stroke="var(--blue)" stroke-width=".8"/><line x1="10" y1="11" x2="9" y2="13" stroke="var(--blue)" stroke-width=".8"/>';else icon.innerHTML='<circle cx="7" cy="7" r="3" fill="none" stroke="var(--gold)" stroke-width="1.1"/><line x1="7" y1="1" x2="7" y2="3" stroke="var(--gold)" stroke-width=".9"/><line x1="7" y1="11" x2="7" y2="13" stroke="var(--gold)" stroke-width=".9"/><line x1="1" y1="7" x2="3" y2="7" stroke="var(--gold)" stroke-width=".9"/><line x1="11" y1="7" x2="13" y2="7" stroke="var(--gold)" stroke-width=".9"/>';}

// HOLE — manual advance only
function openHolePicker(){$('hole-picker').classList.remove('hidden');}
function closeHolePicker(){$('hole-picker').classList.add('hidden');}
function buildHoleGrid(){const g=$('hole-grid');g.innerHTML='';for(let i=1;i<=18;i++){const b=document.createElement('button');b.className='wind-opt';b.textContent=i;b.onclick=()=>{state.hole=i;$('hole-num').textContent=i;closeHolePicker();saveState();haptic(10);};g.appendChild(b);}}
function adjSettingsHole(d){state.hole=Math.max(1,Math.min(18,state.hole+d));$('hole-num').textContent=state.hole;$('set-hole').textContent=state.hole;saveState();haptic(8);if(state.hole>=18&&d>0&&state.shots.length>0)setTimeout(()=>{if(confirm('Hole 18. End round?'))endRound();},300);}

// INPUT
function adjustYard(dir){state.yardage=Math.max(5,Math.min(350,state.yardage+dir));state.skipDistance=false;updateYardageDisplay();haptic(8);}
function updateYardageDisplay(){$('yardage-num').textContent=state.skipDistance?'—':state.yardage;document.querySelectorAll('.qj-btn').forEach(b=>b.classList.toggle('active',parseInt(b.textContent)===state.yardage&&!state.skipDistance));}
function skipDistance(){state.skipDistance=true;state.yardage=0;updateYardageDisplay();haptic(10);}
function openKeypad(){const v=prompt('Yards:',state.skipDistance?'':state.yardage);if(v===null)return;const n=parseInt(v);if(!isNaN(n)&&n>=0&&n<=400){state.yardage=n;state.skipDistance=n===0;updateYardageDisplay();}}
function buildQuickJumps(){const qj=$('quick-jumps');[50,75,100,125,150,175,200].forEach(v=>{const b=document.createElement('button');b.className='qj-btn';b.textContent=v;b.onclick=()=>{state.yardage=v;state.skipDistance=false;updateYardageDisplay();haptic(8);};qj.appendChild(b);});}
function buildElevRow(){const r=$('elev-row');[{l:'None',m:0},{l:'▲Slt',m:4},{l:'▲Stp',m:10},{l:'▼Slt',m:-4},{l:'▼Stp',m:-10}].forEach(e=>{const b=document.createElement('button');b.className='elev-btn';b.textContent=e.l;b.dataset.mod=e.m;b.onclick=()=>{document.querySelectorAll('.elev-btn').forEach(x=>x.classList.remove('active-up','active-dn'));if(state.elevation===e.m){state.elevation=0;}else{state.elevation=e.m;if(e.m!==0)b.classList.add(e.m>0?'active-up':'active-dn');}haptic(8);};r.appendChild(b);});}
function setTemp(t){state.temp=t;document.querySelectorAll('.temp-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.temp-btn.'+t).forEach(b=>b.classList.add('active'));saveState();haptic(8);if(state.currentScreen==='output')whatsMyPlay();}

// CONDITIONS
function buildConditionIcons(){
  const terrain=['tee','fairway','lt_rough','dp_rough','bare_dirt','fwy_bnk','grn_bnk','divot'];
  const slope=['up_lie','dn_lie','below_ft','above_ft','trees','water','lip'];
  const icons={tee:'<line x1="3" y1="9" x2="11" y2="9" stroke="C" stroke-width="1.2"/><line x1="7" y1="4" x2="7" y2="9" stroke="C" stroke-width="1.2"/>',fairway:'<path d="M1 9 Q5 7 7 8.5 Q9 10 13 8" fill="none" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',lt_rough:'<path d="M1 10 Q3 8 5 10 Q7 8 9 10 Q11 8 13 10" fill="none" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',dp_rough:'<path d="M1 12 Q2 7 3 12 Q4 6 5 12 Q6 7 7 12 Q8 6 9 12 Q10 7 11 12" fill="none" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',bare_dirt:'<line x1="1" y1="9" x2="13" y2="9" stroke="C" stroke-width="1.2"/><circle cx="5" cy="9" r=".6" fill="C"/><circle cx="9" cy="9" r=".5" fill="C"/>',fwy_bnk:'<path d="M2 9 Q5 5 7 9 Q9 5 12 9" fill="none" stroke="C" stroke-width="1.2"/><line x1="2" y1="9" x2="12" y2="9" stroke="C" stroke-width=".8"/>',grn_bnk:'<path d="M2 8 Q5 4 7 8 Q9 4 12 8" fill="none" stroke="C" stroke-width="1.2"/><line x1="8" y1="2" x2="8" y2="5" stroke="C" stroke-width=".8"/>',divot:'<ellipse cx="7" cy="9" rx="3.5" ry="2" fill="none" stroke="C" stroke-width="1"/><circle cx="7" cy="7.5" r="1.2" fill="none" stroke="C" stroke-width=".9"/>',up_lie:'<line x1="2" y1="12" x2="12" y2="4" stroke="C" stroke-width="1.2"/><circle cx="7" cy="8" r="1.2" fill="none" stroke="C" stroke-width="1"/>',dn_lie:'<line x1="2" y1="4" x2="12" y2="12" stroke="C" stroke-width="1.2"/><circle cx="7" cy="8" r="1.2" fill="none" stroke="C" stroke-width="1"/>',below_ft:'<line x1="3" y1="2" x2="3" y2="12" stroke="C" stroke-width="1"/><circle cx="8" cy="10" r="1.2" fill="none" stroke="C" stroke-width="1"/>',above_ft:'<line x1="3" y1="2" x2="3" y2="12" stroke="C" stroke-width="1"/><circle cx="8" cy="5" r="1.2" fill="none" stroke="C" stroke-width="1"/>',trees:'<line x1="7" y1="1" x2="7" y2="12" stroke="C" stroke-width="1.4" stroke-linecap="round"/><path d="M3 7 Q5 3 7 5 Q9 3 11 7" fill="none" stroke="C" stroke-width="1"/>',water:'<path d="M1 8 Q4 5 7 8 Q10 11 13 8" fill="none" stroke="C" stroke-width="1.3" stroke-linecap="round"/>',lip:'<path d="M3 12 L3 5 Q3 3 7 3" fill="none" stroke="C" stroke-width="1.3" stroke-linecap="round"/><line x1="3" y1="12" x2="12" y2="12" stroke="C" stroke-width="1.2"/>'};
  function mk(key){const c=CL.conditions[key],svg=(icons[key]||'').replace(/C/g,'#888'),mod=c.mod>0?`<div class="ci-mod">+${c.mod}</div>`:'';return`<div class="cond-icon" data-cond="${key}" onclick="toggleCondition('${key}')"><svg width="14" height="14" viewBox="0 0 14 14">${svg}</svg>${mod}<div class="ci-label">${c.label}</div></div>`;}
  $('terrain-row').innerHTML=terrain.map(mk).join('');
  $('slope-row').innerHTML=slope.map(mk).join('');
}
function toggleCondition(key){haptic(10);const c=CL.conditions[key],el=document.querySelector(`[data-cond="${key}"]`),idx=state.activeConditions.indexOf(key);if(idx>=0){state.activeConditions.splice(idx,1);state.subScenario=null;el.classList.remove('on');saveState();return;}if(c.hasSub){openSubPanel(key);return;}if(c.group==='terrain'){state.activeConditions=state.activeConditions.filter(k=>CL.conditions[k].group!=='terrain');document.querySelectorAll('.cond-icon').forEach(e=>{if(CL.conditions[e.dataset.cond]&&CL.conditions[e.dataset.cond].group==='terrain')e.classList.remove('on');});}state.activeConditions.push(key);el.classList.add('on');saveState();}

// SUB-PANELS
function openSubPanel(key){const panel=$('sub-panel'),content=$('sub-content');const cb='<div style="text-align:right;margin-bottom:4px"><button class="sub-close" onclick="closeSubPanel()">✕</button></div>';if(key==='tee')content.innerHTML=cb+'<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">TEE SHOT</div></div><div class="sub-option" onclick="selectSub(\'tee\',\'par3\')"><div class="sub-option-label mc">Par 3</div></div><div class="sub-option" onclick="selectSub(\'tee\',\'par45\')"><div class="sub-option-label mc">Par 4 / 5</div></div>';else if(key==='trees'){const lD=state.hand==='right'?'Draw':'Fade',rD=state.hand==='right'?'Fade':'Draw';content.innerHTML=cb+'<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">TREES</div></div><div class="sub-option" onclick="this.querySelector(\'.dir-row\').style.display=\'flex\'"><div class="sub-option-label mc">Go Around</div><div class="dir-row" style="display:none;margin-top:10px"><button class="dir-btn" onclick="event.stopPropagation();selectSub(\'trees\',\'around_l\')"><div class="dir-label mc">Left</div><div class="dir-sub">'+lD+'</div></button><button class="dir-btn" onclick="event.stopPropagation();selectSub(\'trees\',\'around_r\')"><div class="dir-label ms">Right</div><div class="dir-sub">'+rD+'</div></button></div></div><div style="display:flex;gap:8px"><div class="sub-option" style="flex:1" onclick="selectSub(\'trees\',\'over\')"><div class="sub-option-label ms">Over</div></div><div class="sub-option" style="flex:1" onclick="selectSub(\'trees\',\'punch\')"><div class="sub-option-label ms">Punch</div></div></div>';}else if(key==='grn_bnk')content.innerHTML=cb+'<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">BUNKER LIE</div></div><div class="sub-option" onclick="selectSub(\'grn_bnk\',\'clean\')"><div class="sub-option-label mc">Clean</div></div><div class="sub-option" onclick="selectSub(\'grn_bnk\',\'plugged\')"><div class="sub-option-label mc">Plugged</div></div><div class="sub-option" onclick="selectSub(\'grn_bnk\',\'wet\')"><div class="sub-option-label mc">Wet Sand</div></div>';else if(key==='water')content.innerHTML=cb+'<div style="text-align:center;margin-bottom:12px"><div class="sub-title mc">WATER</div></div><div class="sub-option" onclick="this.querySelector(\'.dir-row\').style.display=\'flex\'"><div class="sub-option-label mc">In Front</div><div class="dir-row" style="display:none;margin-top:10px"><button class="dir-btn" onclick="event.stopPropagation();selectSub(\'water\',\'front_over\')"><div class="dir-label" style="color:var(--green)">Over</div></button><button class="dir-btn" onclick="event.stopPropagation();selectSub(\'water\',\'front_layup\')"><div class="dir-label ms">Lay Up</div></button></div></div><div class="sub-option" onclick="selectSub(\'water\',\'left\')"><div class="sub-option-label mc">Left</div></div><div class="sub-option" onclick="selectSub(\'water\',\'right\')"><div class="sub-option-label mc">Right</div></div><div class="sub-option" onclick="selectSub(\'water\',\'crossing\')"><div class="sub-option-label mc">Crossing</div></div>';panel.classList.add('open');}
function selectSub(parent,sub){state.subScenario=parent+'_'+sub;if(!state.activeConditions.includes(parent)){const c=CL.conditions[parent];if(c.group==='terrain'){state.activeConditions=state.activeConditions.filter(k=>CL.conditions[k].group!=='terrain');document.querySelectorAll('.cond-icon').forEach(e=>{if(CL.conditions[e.dataset.cond]&&CL.conditions[e.dataset.cond].group==='terrain')e.classList.remove('on');});}state.activeConditions.push(parent);const el=document.querySelector(`[data-cond="${parent}"]`);if(el)el.classList.add('on');}closeSubPanel();saveState();haptic(10);}
function closeSubPanel(){$('sub-panel').classList.remove('open');}

// WHAT'S MY PLAY — merge engine, concise cards
function whatsMyPlay(){
  resetCards();
  const isTee=state.subScenario&&state.subScenario.startsWith('tee_');
  const isPunch=state.subScenario==='trees_punch';
  const isLayup=state.subScenario==='water_front_layup';
  state._isTee=isTee;
  const isPutt=!state.skipDistance&&CL.isPutting(state.yardage);
  const isChip=!state.skipDistance&&CL.isShortGame(state.yardage)&&!isPutt;

  let baseKey='_default';
  if(isPutt)baseKey='putting';
  else if(isChip)baseKey='chipping';
  else if(state.subScenario&&CL.base[state.subScenario])baseKey=state.subScenario;
  else if(state.activeConditions.length){const last=state.activeConditions[state.activeConditions.length-1];if(CL.base[last])baseKey=last;}
  state._baseKey=baseKey;

  const slopeConds=state.activeConditions.filter(k=>{const c=CL.conditions[k];return c&&c.group==='slope';});
  const advice=CL.mergeAdvice(baseKey,slopeConds,state.windState,state.windDir,state.isRaining,state.hand);

  let adjusted=state.yardage,mods=[];
  if(state.windState>0){const wm=CL.getWindMod(state.windState,state.windDir);adjusted+=wm;mods.push({label:(wm>=0?'+':'')+wm+'w',color:'var(--silver)'});}
  if(state.isRaining){adjusted+=CL.rainMod;mods.push({label:'+'+CL.rainMod+'r',color:'var(--blue)'});}
  state.activeConditions.forEach(key=>{const c=CL.conditions[key];if(c&&c.mod>0){adjusted+=c.mod;mods.push({label:'+'+c.mod,color:'var(--green)'});}});
  if(state.elevation!==0){adjusted+=state.elevation;mods.push({label:(state.elevation>0?'+':'')+state.elevation+'e',color:state.elevation>0?'var(--green)':'var(--red)'});}
  const tempMod=CL.tempMods[state.temp]||0;
  if(tempMod!==0){adjusted+=tempMod;mods.push({label:(tempMod>0?'+':'')+tempMod+'t',color:state.temp==='hot'?'var(--red)':'var(--blue)'});}

  let smartClub=null,heroClub=null,layupClub=null,bestWedgeDist=0;
  if(!state.skipDistance&&!isPutt&&!isChip){
    smartClub=CL.findClub(state.bag,adjusted,isTee);
    if(!smartClub){alert('No active clubs.');return;}
    heroClub=CL.findHeroClub(state.bag,smartClub,adjusted,isTee,isPunch);
    if(isLayup){bestWedgeDist=CL.getBestWedgeDist(state.bag);layupClub=CL.findLayupClub(state.bag,state.yardage,bestWedgeDist);}
  }else{
    smartClub={name:isPutt?'Putter':isChip?'Wedge':'Setup',dist:0};
    heroClub={name:isPutt?'Putter':isChip?'Wedge':'Setup',dist:0};
  }

  const conf=CL.calcConfidence(state.activeConditions,state.windState,state.isRaining,smartClub.dist);

  // Concise play text for card fronts — caddy voice, 1-2 lines max
  let smartText=firstSentence(advice.smartText||'Center green. Smooth swing.');
  let heroText=firstSentence(advice.heroText||'At the pin. Full commit.');
  // Tee par 4/5: name safe club
  if(state.subScenario==='tee_par45'&&smartClub.dist>0){const safe=state.bag.filter(c=>c.on&&!c.teeOnly).sort((a,b)=>b.dist-a.dist);if(safe.length)smartText=safe[0].name+' to the fairway. '+smartText;}
  if(isLayup&&layupClub)smartText=layupClub.name+' — lay up to '+bestWedgeDist+' out.';

  // Extras from modifiers — append one-liners
  const extras=(advice.extras||[]).map(e=>firstSentence(e));

  const clubDisplay=(isLayup&&layupClub)?layupClub.name:smartClub.name;
  $('out-yardage').textContent=state.skipDistance?'—':state.yardage;
  $('out-adjusted').textContent=state.skipDistance?'—':adjusted;
  $('out-club').textContent=clubDisplay.toUpperCase();
  $('out-mods').innerHTML=mods.map(m=>`<div class="trust-mod-num" style="color:${m.color}">${m.label}</div>`).join('');
  $('conf-smart').style.width=conf.smart+'%';$('conf-hero').style.width=conf.hero+'%';

  // Situation tags
  let tags=[];
  if(state.subScenario)tags.push({label:CL.getSubLabel(state.subScenario,state.hand),type:'terrain'});
  else state.activeConditions.forEach(k=>{const c=CL.conditions[k];tags.push({label:c.label,type:c.group});});
  if(state.windState>0)tags.push({label:['','Lt','Mod','Str'][state.windState]+' '+state.windDir,type:'wind'});
  if(state.isRaining)tags.push({label:'Rain',type:'wind'});
  $('situation-summary').innerHTML=tags.length?tags.map(t=>`<span class="sit-tag ${t.type}">${t.label}</span>`).join('')+'<div style="font-size:10px;color:var(--text-dimmer);margin-top:3px">Tap yardage to edit</div>':'<div style="font-size:12px;color:var(--text-dim)">Clean lie</div>';

  // Card fronts — SHORT, caddy voice
  const kickerKey=baseKey.split('_')[0]||'_default';
  $('smart-text').innerHTML=`<div class="ms">${smartText}</div>${extras.length?'<div style="font-size:11px;color:var(--text-dim);margin-top:6px">'+extras.join(' ')+'</div>':''}<div class="card-kicker mc">${CL.getKicker(kickerKey)}</div>`;
  $('hero-text').innerHTML=`<div class="ms">${heroClub.name} — ${heroText}</div>${extras.length?'<div style="font-size:11px;color:var(--text-dim);margin-top:6px">'+extras.join(' ')+'</div>':''}<div class="card-kicker mc">${CL.getKicker(kickerKey)}</div>`;

  // Card backs — condensed: ball, swing, aim only + remember/danger
  buildSetupBack('smart-setup',advice,smartClub,'smart');
  buildSetupBack('hero-setup',advice,heroClub,'hero');

  state._smartClub=smartClub;state._heroClub=heroClub;state._adjusted=adjusted;state._mods=mods;
  state._lastPlayText=clubDisplay+' — '+smartText;
  showScreen('output');
}

function buildSetupBack(elId,advice,club,type){
  const el=$(elId),isH=type==='hero',lc=isH?'mc':'mg';let h='';
  // Show only the 3 most critical setup cues — first sentence each
  if(advice.ball)h+=`<div class="setup-row"><span class="setup-label ${lc}">Ball</span><span class="setup-value ms">${firstSentence(advice.ball)}</span></div>`;
  if(advice.swing)h+=`<div class="setup-row"><span class="setup-label ${lc}">Swing</span><span class="setup-value ms">${firstSentence(advice.swing)}</span></div>`;
  if(advice.aim)h+=`<div class="setup-row"><span class="setup-label ${lc}">Aim</span><span class="setup-value ms">${firstSentence(advice.aim)}</span></div>`;
  if(!isH&&advice.remember)h+=`<div class="remember-section"><div class="remember-label">REMEMBER</div><div class="remember-text">${firstSentence(advice.remember)}</div></div>`;
  if(isH&&advice.heroDanger)h+=`<div class="danger-section"><div class="danger-label">DANGER</div><div class="danger-text">${firstSentence(advice.heroDanger)}</div></div>`;
  h+=`<div class="closing-kicker"><span class="mc">${CL.getKicker(state._baseKey||'_default')}</span></div>`;
  el.innerHTML=h;
}
function flipCard(wrap){wrap.querySelector('.card-inner').classList.toggle('flipped');haptic(8);}
function resetCards(){document.querySelectorAll('.card-inner').forEach(c=>c.classList.remove('flipped'));}

// COMMIT — stays on same hole, only clears terrain/conditions, keeps weather
function commitSmart(){debounce(()=>{logShot('smart',state._smartClub);showCommitFlash('smart');afterCommit();});}
function commitHero(){debounce(()=>{logShot('hero',state._heroClub);showCommitFlash('hero');afterCommit();});}
function logShot(type,club){state.shots.push({hole:state.hole,yardage:state.yardage,adjusted:state._adjusted,conditions:[...state.activeConditions],sub:state.subScenario,subLabel:state.subScenario?CL.getSubLabel(state.subScenario,state.hand):'',wind:state.windState,windDir:state.windDir,rain:state.isRaining,elev:state.elevation,temp:state.temp,club:club?club.name:'',type:type,playText:state._lastPlayText||'',time:Date.now(),thumbs:null});saveState();}
function showCommitFlash(type){const f=document.createElement('div');f.className='commit-flash '+type;document.getElementById('app').appendChild(f);setTimeout(()=>f.remove(),500);haptic(20);}
function afterCommit(){
  // Clear shot-specific: terrain, slope, sub, yardage
  // KEEP: wind, rain, temp, elevation (course conditions)
  state.activeConditions=[];state.subScenario=null;state.yardage=150;state.skipDistance=false;
  document.querySelectorAll('.cond-icon').forEach(e=>e.classList.remove('on'));
  updateYardageDisplay();
  // Stay on same hole — don't advance
  goToInput();
}
function editFromOutput(){showScreen('input');}

// SCREENS
function showScreen(name){closeMenu();['input','output','bag','settings','history','insights','share','about','confessional'].forEach(s=>{const el=$('screen-'+s);if(el)el.classList.toggle('hidden',s!==name);});state.currentScreen=name;document.querySelectorAll('.menu-item[data-screen]').forEach(m=>m.classList.toggle('active-screen',m.dataset.screen===name));if(name==='bag')renderBag();if(name==='settings')renderSettings();if(name==='history')renderHistory();if(name==='insights')renderInsights();if(name==='about'){$('about-privacy').textContent=CL.privacyPolicy;$('about-terms').textContent=CL.termsOfService;}saveState();}
function goToInput(){closeMenu();showScreen('input');resetCards();}
function openMenu(){$('menu').classList.remove('hidden');haptic(10);}
function closeMenu(){$('menu').classList.add('hidden');}

// BAG
function renderBag(){CL.sortBag(state.bag);$('bag-list').innerHTML=state.bag.map((c,i)=>`<div class="club-row ${c.on?'':'off'}"><div class="toggle ${c.on?'on':'off'}" onclick="toggleClub(${i})"><div class="toggle-dot"></div></div><div class="club-row-name ${c.on?'mg':''}" style="${c.on?'':'color:#555'}" onclick="renameClub(${i})">${c.name}${c.teeOnly?' <span style="font-size:8px;color:var(--text-dimmer)">(tee)</span>':''}</div><div class="club-dist-area"><button class="club-adj-btn" onclick="adjClubDist(${i},-5)">−</button><div class="club-dist-num ${c.on?'mg':''}" style="${c.on?'':'color:#555'}" onclick="typeClubDist(${i})">${c.dist}</div><button class="club-adj-btn" onclick="adjClubDist(${i},5)">+</button><span class="club-dist-yds">yds</span></div><button class="club-delete" onclick="deleteClub(${i})">✕</button></div>`).join('');const lt=$('lefty-toggle');lt.classList.toggle('on',state.hand==='left');lt.classList.toggle('off',state.hand!=='left');}
function adjClubDist(i,d){state.bag[i].dist=Math.max(20,Math.min(400,state.bag[i].dist+d));CL.sortBag(state.bag);saveState();renderBag();haptic(8);}
function typeClubDist(i){const v=prompt('Distance (20–400):',state.bag[i].dist);if(v===null)return;const n=parseInt(v);if(isNaN(n)||n<20||n>400)return;state.bag[i].dist=n;CL.sortBag(state.bag);saveState();renderBag();}
function renameClub(i){const v=prompt('Club name:',state.bag[i].name);if(v&&v.trim()){state.bag[i].name=v.trim();if(v.toLowerCase().includes('driver'))state.bag[i].teeOnly=true;saveState();renderBag();}}
function toggleClub(i){state.bag[i].on=!state.bag[i].on;saveState();renderBag();haptic(10);}
function toggleLefty(){state.hand=state.hand==='right'?'left':'right';saveState();renderBag();haptic(10);}
function addClub(){const n=prompt('Club name:');if(!n)return;const d=prompt('Distance (20–400):','100');if(!d||isNaN(d))return;state.bag.push({name:n.trim(),dist:Math.max(20,Math.min(400,parseInt(d))),on:true,teeOnly:n.toLowerCase().includes('driver')});CL.sortBag(state.bag);saveState();renderBag();haptic(15);}
function deleteClub(i){if(!confirm('Delete '+state.bag[i].name+'?'))return;state.bag.splice(i,1);saveState();renderBag();haptic(15);}

// SETTINGS
function renderSettings(){$('set-course').value=state.course||'';$('set-hole').textContent=state.hole;$('set-shots').textContent=state.shots.length;const st=$('swing-toggle');st.classList.toggle('on',state.showEverySwing);st.classList.toggle('off',!state.showEverySwing);}
function updateCourse(v){state.course=v.trim();if(state.course&&!state.recentCourses.includes(state.course)){state.recentCourses.unshift(state.course);state.recentCourses=state.recentCourses.slice(0,5);}saveState();}
function toggleEverySwing(){state.showEverySwing=!state.showEverySwing;saveState();renderSettings();}

// CONFESSIONAL
function endRound(){showScreen('confessional');const total=state.shots.length,smart=state.shots.filter(s=>s.type==='smart').length,hero=state.shots.filter(s=>s.type==='hero').length;$('conf-stats').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid #111;margin-bottom:12px"><span style="font-size:14px" class="ms">Shots consulted</span><span style="font-size:28px;font-weight:600" class="mg">${total}</span></div><div style="display:flex;gap:10px"><div style="flex:1;text-align:center;padding:10px;border:1.5px solid #2a4a2a;border-radius:6px"><div style="font-size:26px;font-weight:600;color:var(--green)">${smart}</div><div style="font-size:10px;color:var(--green)">Smart Play</div></div><div style="flex:1;text-align:center;padding:10px;border:1.5px solid #3a2010;border-radius:6px"><div style="font-size:26px;font-weight:600;color:var(--copper)">${hero}</div><div style="font-size:10px;color:var(--copper)">Let It Eat</div></div></div>`;const heroShots=state.shots.filter(s=>s.type==='hero');$('conf-hero-box').innerHTML=heroShots.map(s=>`<div class="hero-moment"><div style="font-size:10px;color:var(--copper);letter-spacing:.08em;font-weight:600;margin-bottom:4px">HERO MOMENT</div><p style="font-size:13px;line-height:1.5" class="ms">Hole ${s.hole}. ${s.subLabel||'Clean lie'}. ${s.club}.</p><p style="font-family:var(--serif);font-size:12px;font-style:italic;margin-top:4px" class="mc">How'd that work out?</p></div>`).join('');state.confScore=null;$('conf-score').textContent='—';let pool;if(hero===0&&total>0)pool=CL.confessionalKickers.allSmart;else if(hero<=2)pool=CL.confessionalKickers.someHero;else pool=CL.confessionalKickers.manyHero;if(total===0)pool=CL.confessionalKickers.lowUsage;$('conf-kicker').innerHTML=`<p style="font-size:14px;line-height:1.5" class="ms">${total} shots. ${smart>0?smart+' times you listened.':'Caddy was waiting.'}</p><p style="font-family:var(--serif);font-size:13px;font-style:italic;margin-top:5px" class="mc">${pool[Math.floor(Math.random()*pool.length)]}</p>`;}
function adjScore(d){const defs={'80s':88,'90s':96,'100s':104,'110+':112};if(state.confScore===null)state.confScore=defs[state.range]||100;state.confScore=Math.max(50,Math.min(150,state.confScore+d));$('conf-score').textContent=state.confScore;haptic(8);}
function finishRound(){state.rounds.push({date:new Date().toLocaleDateString(),course:state.course,shots:[...state.shots],score:state.confScore,smart:state.shots.filter(s=>s.type==='smart').length,hero:state.shots.filter(s=>s.type==='hero').length});state.roundActive=false;state.shots=[];state.hole=1;$('hole-num').textContent='1';cleanupRounds();saveState();goToInput();haptic(20);}

// HISTORY — expandable with advice, thumbs, wind
function renderHistory(){const list=$('history-list');let h='';
  if(state.shots.length){h+=`<div style="padding:8px 0;border-bottom:1px solid #111"><div style="display:flex;justify-content:space-between"><span style="font-size:15px;font-weight:600" class="mg">Today${state.course?' — '+state.course:''}</span><span style="font-size:11px;color:var(--text-dim)">${state.shots.length}</span></div></div>`;
  h+=state.shots.slice().reverse().map((s,ri)=>{const idx=state.shots.length-1-ri;const windStr=s.wind>0?['','Lt','Mod','Str'][s.wind]+' '+s.windDir:'';
    return`<div class="shot-entry" onclick="this.querySelector('.shot-detail')?.classList.toggle('hidden')"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-size:13px;font-weight:600" class="ms">Hole ${s.hole}</span><span class="shot-tag ${s.type==='smart'?'smart':'hero'}">${s.type==='smart'?'Smart':'Hero'}</span></div><div style="font-size:12px;color:var(--text-dim)">${s.yardage?s.yardage+'y':'—'} · ${s.subLabel||s.conditions.map(c=>CL.conditions[c]?.label).join(' · ')||'Clean'} · <span class="mg">${s.club}</span></div><div class="shot-detail hidden">${s.playText?'<div style="font-size:12px;margin-bottom:6px" class="ms">'+s.playText+'</div>':''}${windStr?'<div style="font-size:10px;color:var(--silver)">Wind: '+windStr+(s.rain?' + Rain':'')+'</div>':s.rain?'<div style="font-size:10px;color:var(--blue)">Rain</div>':''}${s.adjusted&&s.adjusted!==s.yardage?'<div style="font-size:10px;color:var(--text-dim)">Plays '+s.adjusted+'</div>':''}<div class="thumb-row"><button class="thumb-btn up ${s.thumbs==='up'?'active':''}" onclick="event.stopPropagation();thumbShot(${idx},'up')">Good</button><button class="thumb-btn dn ${s.thumbs==='down'?'active':''}" onclick="event.stopPropagation();thumbShot(${idx},'down')">Bad</button><button class="delete-shot-btn" onclick="event.stopPropagation();deleteShot(${idx})">Delete</button></div></div></div>`;}).join('');}
  if(!h&&!state.rounds.length)h='<div style="text-align:center;padding:40px 0;color:var(--text-dimmer)">No shots yet.</div>';
  list.innerHTML=h;
}
function thumbShot(idx,dir){state.shots[idx].thumbs=state.shots[idx].thumbs===dir?null:dir;saveState();renderHistory();haptic(10);}
function deleteShot(idx){if(!confirm('Delete?'))return;state.shots.splice(idx,1);saveState();renderHistory();haptic(15);}

// WHAT'S WORKING — analyzes thumbs data
function renderInsights(){
  const shots=state.shots;const good=shots.filter(s=>s.thumbs==='up');const bad=shots.filter(s=>s.thumbs==='down');
  const total=shots.length,rated=good.length+bad.length;
  let h='';
  if(rated===0){h='<div style="text-align:center;padding:40px 0;color:var(--text-dimmer)">Rate your shots with Good/Bad in Shot History to see patterns.</div>';$('insights-content').innerHTML=h;return;}

  // Smart vs hero success
  const smartGood=good.filter(s=>s.type==='smart').length,smartBad=bad.filter(s=>s.type==='smart').length;
  const heroGood=good.filter(s=>s.type==='hero').length,heroBad=bad.filter(s=>s.type==='hero').length;
  const smartTotal=smartGood+smartBad,heroTotal=heroGood+heroBad;

  h+=`<div class="insight-card"><div class="insight-title mg">SMART PLAY</div><div class="insight-body">${smartTotal>0?smartGood+' good out of '+smartTotal+' rated.':'No Smart Play shots rated yet.'}</div></div>`;
  h+=`<div class="insight-card"><div class="insight-title mc">LET IT EAT</div><div class="insight-body">${heroTotal>0?heroGood+' good out of '+heroTotal+' rated.':'No hero shots rated yet.'}</div></div>`;

  // Group by terrain
  const terrainMap={};shots.filter(s=>s.thumbs).forEach(s=>{const key=s.subLabel||s.conditions.map(c=>CL.conditions[c]?.label).join(', ')||'Clean';if(!terrainMap[key])terrainMap[key]={good:0,bad:0};if(s.thumbs==='up')terrainMap[key].good++;else terrainMap[key].bad++;});

  const sorted=Object.entries(terrainMap).sort((a,b)=>(b[1].good+b[1].bad)-(a[1].good+a[1].bad));
  if(sorted.length){
    h+='<div class="section-label mc">BY SITUATION</div>';
    sorted.forEach(([key,v])=>{
      const pct=Math.round(v.good/(v.good+v.bad)*100);
      const cls=pct>=60?'good':'bad';
      h+=`<div class="insight-card ${cls}"><div class="insight-title ms">${key}</div><div class="insight-body">${v.good} good, ${v.bad} bad</div><div class="insight-stat" style="color:${pct>=60?'var(--green)':'var(--red)'}">${pct}% success</div></div>`;
    });
  }

  // Caddy observation
  if(heroTotal>0&&heroBad>heroGood)h+=`<div style="font-family:var(--serif);font-style:italic;font-size:13px;text-align:center;padding:16px 0" class="mc">Hero shots: ${heroGood} worked, ${heroBad} didn't. The numbers don't lie.</div>`;
  else if(smartTotal>0&&smartGood>smartBad)h+=`<div style="font-family:var(--serif);font-style:italic;font-size:13px;text-align:center;padding:16px 0" class="mc">Smart Play is working. Keep listening.</div>`;

  $('insights-content').innerHTML=h;
}

// SHARE
function showShare(){showScreen('share');const t=state.shots.length,s=state.shots.filter(x=>x.type==='smart').length,he=state.shots.filter(x=>x.type==='hero').length;let fk='';if(he===0&&t>0){const p=CL.flexKickers.perfect;fk=p[Math.floor(Math.random()*p.length)].replace(/{smart}/g,s).replace(/{total}/g,t);}else if(t>0){const p=CL.flexKickers.withHero;fk=p[Math.floor(Math.random()*p.length)].replace(/{smart}/g,s).replace(/{total}/g,t).replace(/{hero}/g,he);}let h='';if(t>0)h+=`<div style="border:1.5px solid;border-image:linear-gradient(135deg,#6B4420,var(--copper),#E8A878,var(--copper),#6B4420) 1;padding:24px;text-align:center;margin-bottom:14px;background:#050503">${state.course?'<div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">'+state.course+'</div>':''}<div style="font-size:9px;color:var(--text-dimmer);margin-bottom:12px">${new Date().toLocaleDateString()}</div><div style="display:flex;gap:12px;justify-content:center;margin-bottom:16px"><div><div style="font-size:36px;font-weight:600" class="mg">${t}</div><div style="font-size:10px;color:var(--text-dim)">shots</div></div><div style="width:1px;background:var(--border)"></div><div><div style="font-size:36px;font-weight:600;color:var(--green)">${s}</div><div style="font-size:10px;color:var(--green)">smart</div></div><div style="width:1px;background:var(--border)"></div><div><div style="font-size:36px;font-weight:600;color:var(--copper)">${he}</div><div style="font-size:10px;color:var(--copper)">hero</div></div></div><p style="font-family:var(--serif);font-size:15px;font-style:italic;line-height:1.5" class="mc">${fk}</p></div>`;else h+='<div style="text-align:center;padding:30px 0;color:var(--text-dimmer)">Play a round first.</div>';h+='<div style="font-size:10px;color:var(--text-dim);letter-spacing:.06em;margin:12px 0 8px;font-weight:600">SHARE TEXT</div>';CL.roasts.forEach(r=>{const txt=r.replace(/{total}/g,t||'?').replace(/{smart}/g,s||'?');h+=`<div class="roast-card"><div class="roast-text">${txt}</div><div class="roast-actions"><button class="roast-copy" onclick="copyText(this)">Copy</button><button class="roast-share" onclick="shareText(this)">Share</button></div></div>`;});$('share-content').innerHTML=h;}
function copyText(btn){const txt=btn.closest('.roast-card').querySelector('.roast-text').textContent;navigator.clipboard.writeText(txt).then(()=>{btn.textContent='Copied';btn.classList.add('copied');setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);}).catch(()=>{});}
function shareText(btn){const txt=btn.closest('.roast-card').querySelector('.roast-text').textContent;if(navigator.share)navigator.share({text:txt}).catch(()=>{});else{navigator.clipboard.writeText(txt).then(()=>{const t=$('clipboard-toast');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);});}}
function resetApp(){if(!confirm('Reset everything?'))return;if(!confirm('Cannot be undone.'))return;try{localStorage.removeItem('cl-state');}catch(e){}location.reload();}
document.addEventListener('DOMContentLoaded',init);
