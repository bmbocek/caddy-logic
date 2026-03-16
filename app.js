// CADDY LOGIC — Main Application v1.0
// 100% offline PWA. Zero external dependencies.

// ============================================
// STATE
// ============================================
const state = {
  // User profile
  name: '',
  hand: 'right',
  range: '100s',
  bag: [],
  temp: 'mild',
  showEverySwing: true,

  // Current round
  course: '',
  hole: 1,
  windState: 0,    // 0=off, 1=light, 2=mod, 3=strong
  isRaining: false,
  shots: [],        // current round shots
  roundActive: false,

  // Input state
  yardage: 150,
  skipDistance: false,
  elevation: 0,
  activeConditions: [],
  subScenario: null,

  // History
  rounds: [],       // all completed rounds

  // UI state
  currentScreen: 'input',
  windHintShown: false,
  confScore: null,
  onboarded: false
};

// ============================================
// INIT
// ============================================
function init() {
  loadState();
  if (!state.onboarded) {
    showOnboarding();
  } else {
    showMainApp();
  }
  registerSW();
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('caddy-logic-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('caddy-logic-state', JSON.stringify(state));
  } catch(e) {}
}

// ============================================
// ONBOARDING
// ============================================
function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
  document.getElementById('main-app').classList.add('hidden');
  state.range = '100s';
  state.hand = 'right';
}

function selectHand(el) {
  document.querySelectorAll('[data-hand]').forEach(b => {
    b.classList.remove('selected');
    b.querySelector('.ob-option-label').style.color = '#555';
  });
  el.classList.add('selected');
  el.querySelector('.ob-option-label').style.color = 'var(--green)';
  state.hand = el.dataset.hand;
}

function selectRange(el) {
  document.querySelectorAll('[data-range]').forEach(b => {
    b.classList.remove('selected');
    b.querySelector('.ob-option-label').style.color = '#555';
  });
  el.classList.add('selected');
  el.querySelector('.ob-option-label').style.color = 'var(--green)';
  state.range = el.dataset.range;
}

function obNext(step) {
  document.getElementById('ob-' + step).classList.add('hidden');
  
  if (step === 1) {
    state.name = document.getElementById('ob-name').value.trim() || 'Golfer';
    document.getElementById('ob-2').classList.remove('hidden');
  }
  else if (step === 2) {
    state.bag = JSON.parse(JSON.stringify(CL.bags[state.range] || CL.bags['100s']));
    document.getElementById('ob-range-label').textContent = state.range;
    renderObBag();
    document.getElementById('ob-3').classList.remove('hidden');
  }
  else if (step === 3) {
    // Go to My Bag edit mode then to confirmation
    showObConfirm();
  }
}

function obSkipBag() {
  state.bag = JSON.parse(JSON.stringify(CL.bags[state.range] || CL.bags['100s']));
  showObConfirm();
}

function showObConfirm() {
  document.getElementById('ob-3').classList.add('hidden');
  document.getElementById('ob-4').classList.remove('hidden');
  document.getElementById('ob-confirm-name').textContent = state.name;
  
  const list = document.getElementById('ob-confirm-list');
  const checks = [
    `${state.hand === 'right' ? 'Right' : 'Left'}-handed`,
    `Scoring range: ${state.range}`,
    `Bag: ${state.bag.filter(c => c.on).length} clubs loaded`
  ];
  list.innerHTML = checks.map(c => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #0a0a08">
      <svg width="16" height="16" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" fill="none" stroke="var(--green)" stroke-width="1.2"/><path d="M4 7 L6 9 L10 5" fill="none" stroke="var(--green)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span style="font-size:12px" class="ms">${c}</span>
    </div>
  `).join('');
}

function obFinish() {
  state.onboarded = true;
  saveState();
  document.getElementById('onboarding').classList.add('hidden');
  showMainApp();
}

function renderObBag() {
  const list = document.getElementById('ob-bag-list');
  list.innerHTML = state.bag.map(c => `
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #0a0a08">
      <span style="font-size:12px" class="mg">${c.name}</span>
      <span style="font-size:12px;font-weight:500" class="mg">${c.dist} yds</span>
    </div>
  `).join('');
}

// ============================================
// MAIN APP
// ============================================
function showMainApp() {
  document.getElementById('main-app').classList.remove('hidden');
  document.getElementById('main-app').style.display = 'flex';
  buildConditionIcons();
  buildHoleGrid();
  buildKeypad();

  // Show pre-round popup
  if (!state.roundActive || state.shots.length === 0) {
    showPreround();
  }
}

// ============================================
// PRE-ROUND
// ============================================
function showPreround() {
  const w = CL.getWelcome();
  document.getElementById('pre-silver').textContent = w.silver;
  document.getElementById('pre-copper').textContent = w.copper;
  document.getElementById('pre-hole').value = state.hole;
  if (state.course) document.getElementById('pre-course').value = state.course;
  document.getElementById('preround').classList.remove('hidden');
  document.getElementById('banner').classList.add('faded');
}

function startRound() {
  state.course = document.getElementById('pre-course').value.trim();
  state.hole = parseInt(document.getElementById('pre-hole').value) || 1;
  state.roundActive = true;
  state.shots = [];
  document.getElementById('hole-num').textContent = state.hole;
  document.getElementById('preround').classList.add('hidden');
  document.getElementById('banner').classList.remove('faded');
  saveState();
}

// ============================================
// BANNER — WIND & WEATHER
// ============================================
function cycleWind() {
  state.windState = (state.windState + 1) % 4;
  const w = CL.wind[state.windState];
  const btn = document.getElementById('wind-btn');
  const label = document.getElementById('wind-label');
  const icon = document.getElementById('wind-icon');
  
  label.textContent = state.windState === 0 ? 'Off' : '+' + w.mod;
  label.style.color = w.color;
  
  // Update icon lines based on state
  let paths = '';
  if (state.windState >= 1) paths += '<path d="M1 7 Q4 5 7 7 Q10 9 13 7" fill="none" stroke="' + w.color + '" stroke-width="1.3" stroke-linecap="round"/>';
  if (state.windState >= 2) paths += '<path d="M1 4 Q4 2 7 4 Q10 6 13 4" fill="none" stroke="' + w.color + '" stroke-width="1" stroke-linecap="round"/>';
  if (state.windState >= 3) paths += '<path d="M1 10 Q4 8 7 10 Q10 12 13 10" fill="none" stroke="' + w.color + '" stroke-width="0.8" stroke-linecap="round"/>';
  if (state.windState === 0) paths = '<path d="M1 7 Q4 5 7 7 Q10 9 13 7" fill="none" stroke="#555" stroke-width="1.3" stroke-linecap="round"/>';
  icon.innerHTML = paths;
  
  btn.classList.toggle('active-wind', state.windState > 0);

  // First-use hint
  if (state.windState === 1 && !state.windHintShown) {
    document.getElementById('wind-hint').classList.remove('hidden');
    state.windHintShown = true;
    saveState();
    setTimeout(() => document.getElementById('wind-hint').classList.add('hidden'), 2500);
  }
  saveState();
}

function toggleWeather() {
  state.isRaining = !state.isRaining;
  const icon = document.getElementById('weather-icon');
  const btn = document.getElementById('weather-btn');
  
  if (state.isRaining) {
    icon.innerHTML = '<path d="M3 5 Q3 2 7 2 Q11 2 11 5 Q13 5 13 8 Q13 10 10 10 L4 10 Q1 10 1 8 Q1 6 3 5Z" fill="none" stroke="var(--blue)" stroke-width="1.1"/><line x1="4" y1="11" x2="3" y2="13" stroke="var(--blue)" stroke-width="0.8"/><line x1="7" y1="11" x2="6" y2="13" stroke="var(--blue)" stroke-width="0.8"/><line x1="10" y1="11" x2="9" y2="13" stroke="var(--blue)" stroke-width="0.8"/>';
    btn.classList.add('active-rain');
  } else {
    icon.innerHTML = '<circle cx="7" cy="7" r="3" fill="none" stroke="var(--gold)" stroke-width="1.1"/><line x1="7" y1="1" x2="7" y2="3" stroke="var(--gold)" stroke-width="0.9"/><line x1="7" y1="11" x2="7" y2="13" stroke="var(--gold)" stroke-width="0.9"/><line x1="1" y1="7" x2="3" y2="7" stroke="var(--gold)" stroke-width="0.9"/><line x1="11" y1="7" x2="13" y2="7" stroke="var(--gold)" stroke-width="0.9"/>';
    btn.classList.remove('active-rain');
  }
  saveState();
}

// ============================================
// HOLE COUNTER
// ============================================
function advanceHole() {
  if (state.hole >= 18) {
    // End round prompt
    if (confirm('Hole 18 complete. End round?')) {
      endRound();
    }
    return;
  }
  state.hole++;
  document.getElementById('hole-num').textContent = state.hole;
  // Reset conditions
  resetConditions();
  saveState();
}

function openHolePicker() {
  document.getElementById('hole-picker').classList.remove('hidden');
}
function closeHolePicker() {
  document.getElementById('hole-picker').classList.add('hidden');
}
function buildHoleGrid() {
  const grid = document.getElementById('hole-grid');
  grid.innerHTML = '';
  for (let i = 1; i <= 18; i++) {
    const btn = document.createElement('button');
    btn.style.cssText = 'padding:8px;border:1px solid var(--dimmest);border-radius:3px;font-size:14px;font-weight:500;background:none;color:var(--silver);cursor:pointer;font-family:var(--font)';
    btn.textContent = i;
    btn.onclick = () => { state.hole = i; document.getElementById('hole-num').textContent = i; closeHolePicker(); saveState(); };
    grid.appendChild(btn);
  }
}

// ============================================
// INPUT STATE
// ============================================
function adjustYard(dir) {
  state.yardage = Math.max(10, Math.min(350, state.yardage + dir));
  updateYardageDisplay();
}

function setYard(val) {
  state.yardage = val;
  state.skipDistance = false;
  updateYardageDisplay();
  document.querySelectorAll('.qj-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.textContent) === val);
  });
}

function updateYardageDisplay() {
  document.getElementById('yardage-num').textContent = state.yardage;
  document.querySelectorAll('.qj-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.textContent) === state.yardage);
  });
}

function skipDistance() {
  state.skipDistance = true;
  state.yardage = 0;
  document.getElementById('yardage-num').textContent = '—';
  document.querySelectorAll('.qj-btn').forEach(b => b.classList.remove('active'));
}

function openKeypad() {
  document.getElementById('keypad').classList.remove('hidden');
  document.getElementById('keypad-display').textContent = state.skipDistance ? '' : state.yardage;
}
function closeKeypad() {
  const val = parseInt(document.getElementById('keypad-display').textContent);
  if (val && val > 0) {
    state.yardage = val;
    state.skipDistance = false;
    updateYardageDisplay();
  }
  document.getElementById('keypad').classList.add('hidden');
}
function buildKeypad() {
  const keys = document.getElementById('keypad-keys');
  const nums = [1,2,3,4,5,6,7,8,9,'C',0,'✓'];
  keys.innerHTML = '';
  nums.forEach(n => {
    const btn = document.createElement('button');
    btn.style.cssText = 'padding:14px;border:1px solid var(--dimmest);border-radius:3px;font-size:18px;font-weight:500;background:none;color:var(--silver);cursor:pointer;font-family:var(--font)';
    btn.textContent = n;
    if (n === 'C') {
      btn.style.color = 'var(--red)';
      btn.onclick = () => { document.getElementById('keypad-display').textContent = ''; };
    } else if (n === '✓') {
      btn.style.color = 'var(--green)';
      btn.onclick = closeKeypad;
    } else {
      btn.onclick = () => {
        const disp = document.getElementById('keypad-display');
        const cur = disp.textContent;
        if (cur.length < 3) disp.textContent = cur + n;
      };
    }
    keys.appendChild(btn);
  });
}

// Elevation
function toggleElev(btn) {
  const mod = parseInt(btn.dataset.mod);
  document.querySelectorAll('.elev-btn').forEach(b => {
    b.classList.remove('active-up', 'active-dn');
  });
  if (state.elevation === mod) {
    state.elevation = 0;
  } else {
    state.elevation = mod;
    btn.classList.add(mod > 0 ? 'active-up' : 'active-dn');
  }
}

// Conditions
function buildConditionIcons() {
  const terrainRow = document.getElementById('terrain-row');
  const slopeRow = document.getElementById('slope-row');
  
  const terrainConds = ['tee','fairway','lt_rough','dp_rough','bare_dirt','fwy_bnk','grn_bnk','divot'];
  const slopeConds = ['up_lie','dn_lie','below_ft','above_ft','trees','water','lip'];

  const icons = {
    tee: '<line x1="3" y1="8" x2="11" y2="8" stroke="CCC" stroke-width="1"/><line x1="7" y1="4" x2="7" y2="8" stroke="CCC" stroke-width="1"/>',
    fairway: '<path d="M1 9 Q5 7 7 8.5 Q9 10 13 8" fill="none" stroke="CCC" stroke-width="1" stroke-linecap="round"/>',
    lt_rough: '<path d="M1 10 Q3 8 5 10 Q7 8 9 10 Q11 8 13 10" fill="none" stroke="CCC" stroke-width="1" stroke-linecap="round"/>',
    dp_rough: '<path d="M1 12 Q2 7 3 12 Q4 6 5 12 Q6 7 7 12 Q8 6 9 12 Q10 7 11 12 Q12 7 13 12" fill="none" stroke="CCC" stroke-width="1" stroke-linecap="round"/>',
    bare_dirt: '<line x1="1" y1="9" x2="13" y2="9" stroke="CCC" stroke-width="1"/><circle cx="5" cy="9" r="0.5" fill="CCC"/><circle cx="9" cy="9" r="0.4" fill="CCC"/>',
    fwy_bnk: '<path d="M2 9 Q5 5 7 9 Q9 5 12 9" fill="none" stroke="CCC" stroke-width="1"/><line x1="2" y1="9" x2="12" y2="9" stroke="CCC" stroke-width="0.7"/>',
    grn_bnk: '<path d="M2 8 Q5 4 7 8 Q9 4 12 8" fill="none" stroke="CCC" stroke-width="1"/><line x1="8" y1="2" x2="8" y2="5" stroke="CCC" stroke-width="0.7"/>',
    divot: '<ellipse cx="7" cy="9" rx="3" ry="1.8" fill="none" stroke="CCC" stroke-width="0.8"/><circle cx="7" cy="7.5" r="1" fill="none" stroke="CCC" stroke-width="0.7"/>',
    up_lie: '<line x1="2" y1="12" x2="12" y2="4" stroke="CCC" stroke-width="1"/><circle cx="7" cy="8" r="1" fill="none" stroke="CCC" stroke-width="0.8"/>',
    dn_lie: '<line x1="2" y1="4" x2="12" y2="12" stroke="CCC" stroke-width="1"/><circle cx="7" cy="8" r="1" fill="none" stroke="CCC" stroke-width="0.8"/>',
    below_ft: '<line x1="3" y1="2" x2="3" y2="12" stroke="CCC" stroke-width="0.8"/><circle cx="8" cy="10" r="1" fill="none" stroke="CCC" stroke-width="0.8"/>',
    above_ft: '<line x1="3" y1="2" x2="3" y2="12" stroke="CCC" stroke-width="0.8"/><circle cx="8" cy="5" r="1" fill="none" stroke="CCC" stroke-width="0.8"/>',
    trees: '<line x1="7" y1="1" x2="7" y2="12" stroke="CCC" stroke-width="1.2" stroke-linecap="round"/><path d="M3 7 Q5 3 7 5 Q9 3 11 7" fill="none" stroke="CCC" stroke-width="0.8"/>',
    water: '<path d="M1 8 Q4 5 7 8 Q10 11 13 8" fill="none" stroke="CCC" stroke-width="1.1" stroke-linecap="round"/>',
    lip: '<path d="M3 12 L3 5 Q3 3 7 3" fill="none" stroke="CCC" stroke-width="1.2" stroke-linecap="round"/><line x1="3" y1="12" x2="12" y2="12" stroke="CCC" stroke-width="1"/>'
  };

  function makeIcon(key) {
    const c = CL.conditions[key];
    const col = '#555';
    const svgContent = (icons[key] || '').replace(/CCC/g, col);
    const modText = c.mod > 0 ? `<div class="ci-mod">+${c.mod}</div>` : '';
    return `<div class="cond-icon" data-cond="${key}" onclick="toggleCondition('${key}')">
      <svg width="12" height="12" viewBox="0 0 14 14">${svgContent}</svg>
      ${modText}
      <div class="ci-label">${c.label}</div>
    </div>`;
  }

  terrainRow.innerHTML = terrainConds.map(makeIcon).join('');
  slopeRow.innerHTML = slopeConds.map(makeIcon).join('');
}

function toggleCondition(key) {
  const c = CL.conditions[key];
  const el = document.querySelector(`[data-cond="${key}"]`);
  const idx = state.activeConditions.indexOf(key);

  if (c.hasSub) {
    openSubPanel(key);
    return;
  }

  if (idx >= 0) {
    state.activeConditions.splice(idx, 1);
    el.classList.remove('on');
  } else {
    // Remove others in same group if terrain
    if (c.group === 'terrain') {
      state.activeConditions = state.activeConditions.filter(k => CL.conditions[k].group !== 'terrain');
      document.querySelectorAll('.cond-icon').forEach(e => {
        if (CL.conditions[e.dataset.cond] && CL.conditions[e.dataset.cond].group === 'terrain') e.classList.remove('on');
      });
    }
    state.activeConditions.push(key);
    el.classList.add('on');
  }
}

// ============================================
// SUB-SCENARIO PANELS
// ============================================
function openSubPanel(key) {
  const panel = document.getElementById('sub-panel');
  const content = document.getElementById('sub-content');
  
  if (key === 'tee') {
    content.innerHTML = `
      <div style="text-align:center;margin-bottom:10px">
        <div class="sub-title mc">TEE SHOT</div>
        <div class="sub-desc">What's the hole?</div>
      </div>
      <div class="sub-option" onclick="selectSub('tee','par3')">
        <div class="sub-option-label mc">Par 3</div>
        <div class="sub-option-desc">Iron or wood to the green</div>
      </div>
      <div class="sub-option" onclick="selectSub('tee','par45')">
        <div class="sub-option-label mc">Par 4 / Par 5</div>
        <div class="sub-option-desc">Get it in the fairway</div>
      </div>
    `;
  }
  else if (key === 'trees') {
    const lDir = state.hand === 'right' ? 'Draw / Hook' : 'Fade / Slice';
    const rDir = state.hand === 'right' ? 'Fade / Slice' : 'Draw / Hook';
    content.innerHTML = `
      <div style="text-align:center;margin-bottom:10px">
        <div class="sub-title mc">TREES</div>
        <div class="sub-desc">What's your play?</div>
      </div>
      <div class="sub-option" onclick="this.querySelector('.dir-row').style.display='flex'">
        <div class="sub-option-label mc">Go Around</div>
        <div class="sub-option-desc">Shape the ball around the obstacle</div>
        <div class="dir-row" style="display:none;margin-top:8px">
          <button class="dir-btn" onclick="event.stopPropagation();selectSub('trees','around_l')">
            <div class="dir-label mc">Go Left</div>
            <div class="dir-sub">${lDir}</div>
          </button>
          <button class="dir-btn" onclick="event.stopPropagation();selectSub('trees','around_r')">
            <div class="dir-label" style="color:#555">Go Right</div>
            <div class="dir-sub">${rDir}</div>
          </button>
        </div>
      </div>
      <div style="display:flex;gap:6px">
        <div class="sub-option" style="flex:1" onclick="selectSub('trees','over')">
          <div class="sub-option-label" style="color:#555">Go Over</div>
          <div class="sub-option-desc">Launch it high</div>
        </div>
        <div class="sub-option" style="flex:1" onclick="selectSub('trees','punch')">
          <div class="sub-option-label" style="color:#555">Punch Out</div>
          <div class="sub-option-desc">Get to safety</div>
        </div>
      </div>
    `;
  }
  else if (key === 'grn_bnk') {
    content.innerHTML = `
      <div style="text-align:center;margin-bottom:10px">
        <div class="sub-title mc">GREENSIDE BUNKER</div>
        <div class="sub-desc">What's the lie?</div>
      </div>
      <div class="sub-option" onclick="selectSub('grn_bnk','clean')"><div class="sub-option-label mc">Clean Lie</div><div class="sub-option-desc">Ball sitting on top of the sand</div></div>
      <div class="sub-option" onclick="selectSub('grn_bnk','plugged')"><div class="sub-option-label mc">Plugged / Fried Egg</div><div class="sub-option-desc">Ball buried in the sand</div></div>
      <div class="sub-option" onclick="selectSub('grn_bnk','wet')"><div class="sub-option-label mc">Wet Sand</div><div class="sub-option-desc">Heavy, compacted sand</div></div>
    `;
  }

  panel.classList.add('open');
}

function selectSub(parent, sub) {
  state.subScenario = parent + '_' + sub;
  
  // Add parent to active conditions
  if (!state.activeConditions.includes(parent)) {
    // Remove others in same group if terrain
    const c = CL.conditions[parent];
    if (c.group === 'terrain') {
      state.activeConditions = state.activeConditions.filter(k => CL.conditions[k].group !== 'terrain');
      document.querySelectorAll('.cond-icon').forEach(e => {
        if (CL.conditions[e.dataset.cond] && CL.conditions[e.dataset.cond].group === 'terrain') e.classList.remove('on');
      });
    }
    state.activeConditions.push(parent);
    const el = document.querySelector(`[data-cond="${parent}"]`);
    if (el) el.classList.add('on');
  }
  
  closeSubPanel();
}

function closeSubPanel() {
  document.getElementById('sub-panel').classList.remove('open');
}

// ============================================
// WHAT'S MY PLAY? — Core engine
// ============================================
function whatsMyPlay() {
  // Calculate adjusted distance
  let adjusted = state.yardage;
  let mods = [];

  // Wind
  if (state.windState > 0) {
    const windMod = CL.wind[state.windState].mod;
    adjusted += windMod;
    mods.push({ label: '+' + windMod, color: 'var(--wind)', type: 'wind' });
  }

  // Conditions
  state.activeConditions.forEach(key => {
    const c = CL.conditions[key];
    if (c.mod > 0) {
      adjusted += c.mod;
      mods.push({ label: '+' + c.mod, color: 'var(--green)', type: key });
    }
  });

  // Elevation
  if (state.elevation !== 0) {
    adjusted += state.elevation;
    const sign = state.elevation > 0 ? '+' : '';
    mods.push({ label: sign + state.elevation, color: state.elevation > 0 ? 'var(--green)' : 'var(--red)', type: 'elev' });
  }

  // Find clubs
  const smartClub = CL.findClub(state.bag, adjusted);
  const heroClub = CL.findHeroClub(state.bag, smartClub, adjusted);

  if (!smartClub) {
    alert('No clubs in your bag. Add clubs in My Bag from the menu.');
    return;
  }

  // Get advice
  const adviceKey = state.subScenario || (state.activeConditions.length > 0 ? state.activeConditions[state.activeConditions.length - 1] : '_default');
  const advice = CL.advice[adviceKey] || CL.advice._default;
  
  // Get kickers
  const condForKicker = state.activeConditions.length > 0 ? state.activeConditions[state.activeConditions.length - 1] : '_default';
  const smartKicker = CL.getKicker(condForKicker);
  const heroKicker = CL.getKicker(condForKicker);

  // Confidence
  const conf = CL.calcConfidence(state.activeConditions, state.windState, state.isRaining, smartClub.dist);

  // Render output
  document.getElementById('out-yardage').textContent = state.skipDistance ? '—' : state.yardage;
  document.getElementById('out-adjusted').textContent = state.skipDistance ? '—' : adjusted;
  document.getElementById('out-club').textContent = smartClub.name.toUpperCase();

  // Mods display
  const modsEl = document.getElementById('out-mods');
  modsEl.innerHTML = mods.map(m => `<div class="trust-mod"><div class="trust-mod-num" style="color:${m.color}">${m.label}</div></div>`).join('');

  // Confidence bars (visual only — NO percentages)
  document.getElementById('conf-smart').style.width = conf.smart + '%';
  document.getElementById('conf-hero').style.width = conf.hero + '%';

  // Card text
  const smartText = `${smartClub.name} center green. ${advice.smart || ''}`;
  const heroText = `${heroClub.name} at the pin. ${adjusted} ${state.activeConditions.length > 0 ? 'with conditions stacked.' : 'clean look.'}`;
  
  document.getElementById('smart-text').textContent = smartText;
  document.getElementById('smart-kicker').textContent = smartKicker;
  document.getElementById('hero-text').textContent = heroText;
  document.getElementById('hero-kicker').textContent = heroKicker;

  // Setup backs
  buildSetupBack('smart-setup', advice, smartClub, 'smart');
  buildSetupBack('hero-setup', advice, heroClub, 'hero');

  // Store for commit
  state._currentSmartClub = smartClub;
  state._currentHeroClub = heroClub;
  state._currentAdjusted = adjusted;
  state._currentMods = mods;

  // Show output
  showScreen('output');
}

function buildSetupBack(elId, advice, club, type) {
  const el = document.getElementById(elId);
  const isHero = type === 'hero';
  const labelClass = isHero ? 'mc' : 'mg';
  
  let html = '';
  
  // Every Swing
  if (state.showEverySwing) {
    html += `<div class="every-swing">
      <div class="every-swing-label" style="color:${isHero ? 'var(--copper)' : 'var(--gold)'}">EVERY SWING</div>
      <div class="every-swing-text">${CL.everySwing}</div>
    </div>`;
  }

  // Setup rows
  if (advice.ball) html += `<div class="setup-row"><span class="setup-label ${labelClass}">Ball</span><span class="setup-value ms">${advice.ball}</span></div>`;
  if (advice.weight) html += `<div class="setup-row"><span class="setup-label ${labelClass}">Wt</span><span class="setup-value ms">${advice.weight}</span></div>`;
  if (advice.swing) html += `<div class="setup-row"><span class="setup-label ${labelClass}">Swing</span><span class="setup-value ms">${advice.swing}</span></div>`;

  // Remember / Danger
  if (!isHero && advice.smart) {
    html += `<div class="remember-section"><div class="remember-label">REMEMBER</div><div class="remember-text">${advice.smart}</div></div>`;
  }
  if (isHero && advice.hero) {
    html += `<div class="danger-section"><div class="danger-label">DANGER</div><div class="danger-text">${advice.hero}</div></div>`;
  }

  // Closing kicker
  const condForKicker = state.activeConditions.length > 0 ? state.activeConditions[state.activeConditions.length - 1] : '_default';
  html += `<div class="closing-kicker"><span class="mc">${CL.getKicker(condForKicker)}</span></div>`;

  el.innerHTML = html;
}

// ============================================
// COMMIT
// ============================================
function commitSmart() {
  logShot('smart', state._currentSmartClub);
  resetAndAdvance();
}

function commitHero() {
  logShot('hero', state._currentHeroClub);
  resetAndAdvance();
}

function logShot(type, club) {
  state.shots.push({
    hole: state.hole,
    yardage: state.yardage,
    adjusted: state._currentAdjusted,
    conditions: [...state.activeConditions],
    sub: state.subScenario,
    wind: state.windState,
    rain: state.isRaining,
    club: club.name,
    type: type,
    time: Date.now()
  });
  saveState();
}

function resetAndAdvance() {
  resetConditions();
  showScreen('input');
}

function resetConditions() {
  state.activeConditions = [];
  state.subScenario = null;
  state.elevation = 0;
  state.yardage = 150;
  state.skipDistance = false;
  document.querySelectorAll('.cond-icon').forEach(e => e.classList.remove('on'));
  document.querySelectorAll('.elev-btn').forEach(b => b.classList.remove('active-up', 'active-dn'));
  updateYardageDisplay();
}

function backToInput() {
  showScreen('input');
}

// ============================================
// SCREEN NAVIGATION
// ============================================
function showScreen(name) {
  closeMenu();
  const screens = ['input','output','bag','settings','history','discipline','share','feedback','about','confessional'];
  screens.forEach(s => {
    const el = document.getElementById('screen-' + s);
    if (el) el.classList.toggle('hidden', s !== name);
  });
  state.currentScreen = name;

  // Populate screens
  if (name === 'bag') renderBag();
  if (name === 'settings') renderSettings();
  if (name === 'history') renderHistory();
  if (name === 'discipline') renderDiscipline();
  if (name === 'share') renderShare();
}

// ============================================
// MY BAG
// ============================================
function renderBag() {
  const list = document.getElementById('bag-list');
  list.innerHTML = state.bag.map((club, i) => `
    <div class="club-row ${club.on ? '' : 'off'}">
      <div class="club-row-name ${club.on ? 'mg' : ''}" style="${club.on ? '' : 'color:#444'}" onclick="renameClub(${i})">${club.name}</div>
      <div class="club-dist-area">
        <button class="club-adj-btn" onclick="adjClubDist(${i},-5)">−</button>
        <div class="club-dist-num ${club.on ? 'mg' : ''}" style="${club.on ? '' : 'color:#444'}" onclick="typeClubDist(${i})">${club.dist}</div>
        <button class="club-adj-btn" onclick="adjClubDist(${i},5)">+</button>
        <span class="club-dist-yds">yds</span>
      </div>
      <div class="toggle ${club.on ? 'on' : 'off'}" onclick="toggleClub(${i})"><div class="toggle-dot"></div></div>
    </div>
  `).join('');

  // Lefty toggle state
  const lt = document.getElementById('lefty-toggle');
  lt.classList.toggle('on', state.hand === 'left');
  lt.classList.toggle('off', state.hand !== 'left');
}

function adjClubDist(idx, delta) {
  state.bag[idx].dist = Math.max(10, Math.min(350, state.bag[idx].dist + delta));
  saveState();
  renderBag();
}

function typeClubDist(idx) {
  const val = prompt('Enter distance in yards:', state.bag[idx].dist);
  if (val && !isNaN(val)) {
    state.bag[idx].dist = Math.max(10, Math.min(350, parseInt(val)));
    saveState();
    renderBag();
  }
}

function renameClub(idx) {
  const val = prompt('Club name:', state.bag[idx].name);
  if (val && val.trim()) {
    state.bag[idx].name = val.trim();
    saveState();
    renderBag();
  }
}

function toggleClub(idx) {
  state.bag[idx].on = !state.bag[idx].on;
  saveState();
  renderBag();
}

function toggleLefty() {
  state.hand = state.hand === 'right' ? 'left' : 'right';
  saveState();
  renderBag();
}

function addClub() {
  const name = prompt('Club name (e.g., 60°, 9-Wood, 2-Hybrid):');
  if (!name || !name.trim()) return;
  const dist = prompt('Distance in yards:', '100');
  if (!dist || isNaN(dist)) return;
  state.bag.push({ name: name.trim(), dist: parseInt(dist), on: true });
  state.bag.sort((a, b) => b.dist - a.dist);
  saveState();
  renderBag();
}

// ============================================
// ROUND SETTINGS
// ============================================
function renderSettings() {
  document.getElementById('set-course').textContent = state.course || '—';
  document.getElementById('set-hole').textContent = state.hole;
  document.getElementById('set-shots').textContent = state.shots.length;
}

function setTemp(temp, btn) {
  state.temp = temp;
  // Update all temp buttons in both preround and settings
  document.querySelectorAll('.temp-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.temp-btn.${temp}`).forEach(b => b.classList.add('active'));
  saveState();
}

// ============================================
// END ROUND / CONFESSIONAL
// ============================================
function endRound() {
  showScreen('confessional');
  
  const total = state.shots.length;
  const smart = state.shots.filter(s => s.type === 'smart').length;
  const hero = state.shots.filter(s => s.type === 'hero').length;
  
  // Stats box
  document.getElementById('conf-stats').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid #0a0a08;margin-bottom:10px">
      <span style="font-size:12px" class="ms">Shots consulted</span>
      <span style="font-size:24px;font-weight:500" class="mg">${total}</span>
    </div>
    <div style="display:flex;gap:10px">
      <div style="flex:1;text-align:center;padding:8px;border:1px solid #1a2a1a;border-radius:3px;background:rgba(93,170,104,0.03)">
        <div style="font-size:22px;font-weight:500;color:var(--green)">${smart}</div>
        <div style="font-size:9px;color:var(--green)">Smart Play</div>
      </div>
      <div style="flex:1;text-align:center;padding:8px;border:1px solid #2a1a10;border-radius:3px;background:rgba(212,132,90,0.03)">
        <div style="font-size:22px;font-weight:500;color:var(--copper)">${hero}</div>
        <div style="font-size:9px;color:var(--copper)">Let It Eat</div>
      </div>
    </div>
  `;

  // Hero moments
  const heroShots = state.shots.filter(s => s.type === 'hero');
  if (heroShots.length > 0) {
    document.getElementById('conf-hero-box').innerHTML = heroShots.map(s => `
      <div style="border:1px solid;border-image:linear-gradient(135deg,#2a1508,var(--copper),#2a1508) 1;padding:12px;margin-bottom:8px">
        <div style="font-size:8px;color:var(--copper);letter-spacing:0.08em;font-weight:500;margin-bottom:3px">YOUR HERO MOMENT</div>
        <p style="font-size:12px;line-height:1.45"><span class="ms">Hole ${s.hole}. ${s.conditions.length > 0 ? CL.conditions[s.conditions[0]].label + '.' : ''} The caddy had a different opinion. You chose ${s.club}.</span></p>
        <p style="font-family:var(--serif);font-size:11px;font-style:italic;margin-top:6px"><span class="mc">How'd that work out?</span></p>
      </div>
    `).join('');
  } else {
    document.getElementById('conf-hero-box').innerHTML = '';
  }

  // Score default based on range
  const scoreDefaults = { '80s': 88, '90s': 96, '100s': 104, '110+': 112 };
  state.confScore = null;
  document.getElementById('conf-score').textContent = '—';

  // Kicker
  let kickerPool;
  if (hero === 0 && total > 0) kickerPool = CL.confessionalKickers.allSmart;
  else if (hero <= 2) kickerPool = CL.confessionalKickers.someHero;
  else if (hero > 2) kickerPool = CL.confessionalKickers.manyHero;
  else kickerPool = CL.confessionalKickers.lowUsage;
  
  const kicker = kickerPool[Math.floor(Math.random() * kickerPool.length)];
  
  document.getElementById('conf-kicker').innerHTML = `
    <p style="font-size:14px;line-height:1.5"><span class="ms">${total} shots. ${smart} times you listened.</span></p>
    <p style="font-family:var(--serif);font-size:12px;font-style:italic;margin-top:4px"><span class="mc">${total === 0 ? 'Open the app next time. The caddy is lonely.' : kicker}</span></p>
  `;
}

function adjScore(dir) {
  const defaults = { '80s': 88, '90s': 96, '100s': 104, '110+': 112 };
  if (state.confScore === null) state.confScore = defaults[state.range] || 100;
  state.confScore = Math.max(50, Math.min(150, state.confScore + dir));
  document.getElementById('conf-score').textContent = state.confScore;
}

function finishRound() {
  // Save round to history
  state.rounds.push({
    date: new Date().toLocaleDateString(),
    course: state.course,
    shots: [...state.shots],
    score: state.confScore,
    smart: state.shots.filter(s => s.type === 'smart').length,
    hero: state.shots.filter(s => s.type === 'hero').length
  });
  state.roundActive = false;
  state.shots = [];
  state.hole = 1;
  document.getElementById('hole-num').textContent = '1';
  saveState();
  showScreen('input');
}

// ============================================
// SHOT HISTORY
// ============================================
function renderHistory() {
  const list = document.getElementById('history-list');
  let html = '';

  // Current round
  if (state.shots.length > 0) {
    html += `<div class="history-round">
      <div class="history-round-header">
        <span style="font-size:13px;font-weight:500" class="mg">Today${state.course ? ' — ' + state.course : ''}</span>
        <span style="font-size:10px;color:var(--dim)">${state.shots.length} shots</span>
      </div>`;
    html += state.shots.slice().reverse().map(s => `
      <div class="shot-entry">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="font-size:11px;font-weight:500" class="ms">Hole ${s.hole}</span>
          <span class="shot-tag ${s.type === 'smart' ? 'smart' : 'hero'}">${s.type === 'smart' ? 'Smart' : 'Let It Eat'}</span>
        </div>
        <div style="font-size:10px;color:#555;line-height:1.4">
          ${s.yardage ? s.yardage + ' yds' : 'Technique only'} · ${s.conditions.map(c => CL.conditions[c].label).join(' · ') || 'Clean'}<br>
          ${s.adjusted ? 'Adjusted: ' + s.adjusted + ' · ' : ''}<span class="mg">${s.club}</span>
        </div>
      </div>
    `).join('');
    html += '</div>';
  }

  // Previous rounds
  state.rounds.slice().reverse().forEach(r => {
    html += `<div class="history-round" style="opacity:0.6">
      <div class="history-round-header">
        <span style="font-size:12px;color:#555">${r.date}${r.course ? ' — ' + r.course : ''}</span>
        <span style="font-size:10px;color:var(--dimmer)">${r.shots.length} shots</span>
      </div>`;
    html += r.shots.slice().reverse().slice(0, 3).map(s => `
      <div class="shot-entry">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="font-size:10px;color:#555">Hole ${s.hole}</span>
          <span class="shot-tag ${s.type === 'smart' ? 'smart' : 'hero'}">${s.type === 'smart' ? 'Smart' : 'Let It Eat'}</span>
        </div>
        <div style="font-size:9px;color:#444">${s.club}</div>
      </div>
    `).join('');
    if (r.shots.length > 3) html += `<div style="font-size:9px;color:var(--dimmer);padding:4px">+ ${r.shots.length - 3} more shots</div>`;
    html += '</div>';
  });

  if (!html) html = '<div style="text-align:center;padding:40px 0;color:var(--dimmer)">No shots logged yet.<br>Use the app during your round.</div>';
  list.innerHTML = html;
}

// ============================================
// DISCIPLINE INDEX
// ============================================
function renderDiscipline() {
  const allRounds = state.rounds;
  const totalRounds = allRounds.length;
  const totalSmart = allRounds.reduce((sum, r) => sum + r.smart, 0);
  const totalHero = allRounds.reduce((sum, r) => sum + r.hero, 0);
  const totalShots = totalSmart + totalHero;
  const smartRate = totalShots > 0 ? Math.round((totalSmart / totalShots) * 100) : 0;

  document.getElementById('disc-stats').innerHTML = `
    <div class="stat-card"><div class="stat-num mg">${totalRounds}</div><div class="stat-label">Rounds</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--green)">${smartRate}%</div><div class="stat-label">Smart Rate</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--copper)">${totalHero}</div><div class="stat-label">Hero Shots</div></div>
  `;

  const roundsList = document.getElementById('disc-rounds');
  roundsList.innerHTML = allRounds.slice().reverse().map(r => `
    <div class="row">
      <div>
        <div style="font-size:11px;font-weight:500" class="ms">${r.date}${r.course ? ' — ' + r.course : ''}</div>
        <div style="font-size:8px;color:var(--dim);margin-top:2px">${r.score ? 'Score: ' + r.score + ' · ' : ''}${r.smart} smart, ${r.hero} hero</div>
      </div>
    </div>
  `).join('') || '<div style="text-align:center;padding:30px 0;color:var(--dimmer)">Complete a round to see your Discipline Index.</div>';
}

// ============================================
// SHARE & ROAST
// ============================================
function renderShare() {
  const lastRound = state.rounds.length > 0 ? state.rounds[state.rounds.length - 1] : null;
  const currentTotal = state.shots.length;
  const currentSmart = state.shots.filter(s => s.type === 'smart').length;
  const currentHero = state.shots.filter(s => s.type === 'hero').length;

  const total = lastRound ? lastRound.shots.length : currentTotal;
  const smart = lastRound ? lastRound.smart : currentSmart;
  const hero = lastRound ? lastRound.hero : currentHero;

  const content = document.getElementById('share-content');
  
  // Flex screen preview
  let flexKicker = '';
  if (hero === 0 && total > 0) {
    const pool = CL.flexKickers.perfect;
    flexKicker = pool[Math.floor(Math.random() * pool.length)].replace(/{smart}/g, smart).replace(/{total}/g, total);
  } else if (total > 0) {
    const pool = CL.flexKickers.withHero;
    flexKicker = pool[Math.floor(Math.random() * pool.length)].replace(/{smart}/g, smart).replace(/{total}/g, total).replace(/{hero}/g, hero);
  }

  let html = '';
  
  if (total > 0) {
    html += `
    <div style="border:1px solid;border-image:linear-gradient(135deg,#6B4420,var(--copper),#E8A878,var(--copper),#6B4420) 1;padding:20px;text-align:center;margin-bottom:12px;background:#050503">
      <div style="opacity:0.4;margin-bottom:10px"><span style="font-size:8px;letter-spacing:0.18em" class="mc">CADDY LOGIC</span></div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:12px">${state.course || 'Round'} · ${lastRound ? lastRound.date : 'Today'}</div>
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:14px">
        <div><div style="font-size:32px;font-weight:500" class="mg">${total}</div><div style="font-size:8px;color:var(--dim)">shots</div></div>
        <div style="width:1px;background:var(--dimmest)"></div>
        <div><div style="font-size:32px;font-weight:500;color:var(--green)">${smart}</div><div style="font-size:8px;color:var(--green)">smart</div></div>
        <div style="width:1px;background:var(--dimmest)"></div>
        <div><div style="font-size:32px;font-weight:500;color:var(--copper)">${hero}</div><div style="font-size:8px;color:var(--copper)">hero</div></div>
      </div>
      <p style="font-family:var(--serif);font-size:13px;font-style:italic;line-height:1.5"><span class="mc">${flexKicker}</span></p>
    </div>`;
  }

  // Roast texts
  html += '<div style="font-size:8px;color:var(--dim);letter-spacing:0.06em;margin:10px 0 6px">ROAST TEXT — tap to copy</div>';
  CL.roasts.forEach(r => {
    const text = r.replace(/{total}/g, total || '?').replace(/{smart}/g, smart || '?').replace(/{hero}/g, hero || '?')
      .replace(/{smartClub}/g, '7-Iron').replace(/{heroClub}/g, 'Driver');
    html += `<div style="border:1px solid var(--dimmest);border-radius:3px;padding:10px;margin-bottom:6px;cursor:pointer" onclick="copyText(this)">
      <p style="font-size:11px;line-height:1.45;color:var(--silver)">${text}</p>
    </div>`;
  });

  content.innerHTML = html;
}

function generateFlex() {
  showScreen('share');
}

function copyText(el) {
  const text = el.querySelector('p').textContent;
  navigator.clipboard.writeText(text).then(() => {
    el.style.borderColor = 'var(--green)';
    setTimeout(() => el.style.borderColor = '', 1500);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    el.style.borderColor = 'var(--green)';
    setTimeout(() => el.style.borderColor = '', 1500);
  });
}

// ============================================
// FEEDBACK
// ============================================
function sendFeedback() {
  const text = document.getElementById('feedback-text').value.trim();
  if (!text) return;
  // Store locally for beta
  try {
    const fb = JSON.parse(localStorage.getItem('caddy-logic-feedback') || '[]');
    fb.push({ text, date: Date.now() });
    localStorage.setItem('caddy-logic-feedback', JSON.stringify(fb));
  } catch(e) {}
  document.getElementById('feedback-text').value = '';
  alert('Thanks! Your feedback helps make the caddy smarter.');
  showScreen('input');
}

// ============================================
// HAMBURGER MENU
// ============================================
function openMenu() {
  document.getElementById('menu').classList.remove('hidden');
}
function closeMenu() {
  document.getElementById('menu').classList.add('hidden');
}

// ============================================
// TEMPERATURE COLORS
// ============================================
// Hot = red, Mild = green, Cold = blue (handled in CSS .active classes)

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', init);
