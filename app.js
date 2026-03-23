// CADDY LOGIC — app.js v1.0.2 Beta
// All 62 fixes from HANDOFF.md implemented.
// Merge engine, layered advice, lefty flip, full state restore.

'use strict';

// =============================================
// GRACEFUL ERROR FALLBACK (#56)
// =============================================
window.onerror = function(msg, src, line) {
  console.error('Caddy Logic error:', msg, src, line);
  const splash = document.getElementById('splash');
  if (splash) splash.innerHTML = '<div style="color:#D94F4F;padding:40px;text-align:center;">Something went wrong.<br>Please refresh the page.</div>';
};

// =============================================
// STATE
// =============================================
const STATE = {
  bag: [],
  hand: 'right', // left or right
  hole: 1,
  courseName: '',
  yardage: 0,
  skipDist: false,
  terrain: null,      // condition key
  sub: null,          // sub-scenario key
  slopes: [],         // active slope keys
  obstacles: [],      // active obstacle keys (terrain group='obstacle')
  elevation: 0,       // index into CL.elevation
  windSpeed: 0,       // 0-3
  windDir: 'In Face',
  rain: false,
  temp: 'mild',       // hot/mild/cold
  lastChoice: 'smart',
  shots: [],          // current round
  rounds: [],         // past rounds
  everySwing: false,
  onboarded: false,
  screen: 'input',
  // Output cache for live recalc
  _outputData: null,
};

// =============================================
// DEBOUNCE HELPER (#62)
// =============================================
let _commitLock = false;
function debounceCommit(fn) {
  if (_commitLock) return;
  _commitLock = true;
  fn();
  setTimeout(() => { _commitLock = false; }, 600);
}

// =============================================
// HAPTIC HELPER (#59)
// =============================================
function haptic(ms) {
  if (navigator.vibrate) try { navigator.vibrate(ms || 10); } catch(e) {}
}

// =============================================
// LOCALSTORAGE HELPERS (#54)
// =============================================
const LS = {
  get(k) { try { return JSON.parse(localStorage.getItem('cl_' + k)); } catch(e) { return null; } },
  set(k, v) { try { localStorage.setItem('cl_' + k, JSON.stringify(v)); } catch(e) { /* #54 cap */ } },
  remove(k) { try { localStorage.removeItem('cl_' + k); } catch(e) {} },
  clear() { try { const keys = []; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('cl_'))keys.push(k);} keys.forEach(k=>localStorage.removeItem(k)); } catch(e) {} }
};

// Cleanup old rounds (#54) — keep last 20
function cleanupRounds() {
  const rounds = LS.get('rounds') || [];
  if (rounds.length > 20) {
    LS.set('rounds', rounds.slice(-20));
  }
}

// =============================================
// ONBOARDING
// =============================================
const OB = {
  step: 1,
  level: null,

  init() {
    if (STATE.onboarded) {
      document.getElementById('onboarding').classList.add('hidden');
      return;
    }
    document.getElementById('onboarding').classList.remove('hidden');
    this.showStep(1);
  },

  showStep(n) {
    this.step = n;
    document.querySelectorAll('.ob-step').forEach(el => el.classList.remove('active'));
    const target = document.querySelector(`.ob-step[data-step="${n}"]`);
    if (target) target.classList.add('active');
    // Update dots
    document.querySelectorAll('.ob-dots').forEach(dots => {
      dots.querySelectorAll('.ob-dot').forEach((d, i) => {
        d.classList.toggle('active', i === n - 1);
      });
    });
  },

  next() {
    haptic(10);
    if (this.step < 4) this.showStep(this.step + 1);
  },

  back() { // #5
    haptic(10);
    if (this.step > 1) this.showStep(this.step - 1);
  },

  pickLevel(level) {
    haptic(15);
    this.level = level;
    STATE.bag = JSON.parse(JSON.stringify(CL.bags[level]));
    LS.set('bag', STATE.bag);
    LS.set('level', level);
    this.renderBag();
    this.showStep(3); // Go to bag editor (#1)
  },

  renderBag() {
    const list = document.getElementById('ob-bag-list');
    if (!list) return;
    list.innerHTML = '';
    STATE.bag.forEach((c, i) => {
      if (!c.on) return;
      const row = document.createElement('div');
      row.className = 'ob-bag-item';
      row.innerHTML = `
        <span class="club-name">${c.name}</span>
        <div class="club-dist">
          <button onclick="OB.adjDist(${i},-5)" aria-label="Decrease ${c.name} distance">−</button>
          <span onclick="OB.typeDist(${i})" role="button" tabindex="0" aria-label="${c.name} distance">${c.dist}</span>
          <button onclick="OB.adjDist(${i},5)" aria-label="Increase ${c.name} distance">+</button>
        </div>`;
      list.appendChild(row);
    });
  },

  adjDist(i, delta) {
    haptic(8);
    const c = STATE.bag[i];
    c.dist = Math.max(20, Math.min(400, c.dist + delta)); // #34 validation
    LS.set('bag', STATE.bag);
    this.renderBag();
  },

  typeDist(i) {
    const c = STATE.bag[i];
    const v = prompt(`${c.name} distance (yards):`, c.dist);
    if (v === null) return;
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 20 || n > 400) { alert('Enter a distance between 20 and 400.'); return; } // #34
    c.dist = n;
    LS.set('bag', STATE.bag);
    this.renderBag();
  },

  finish() {
    haptic(20);
    STATE.onboarded = true;
    LS.set('onboarded', true);
    document.getElementById('onboarding').classList.add('hidden');
    APP.initInput();
  }
};

// =============================================
// APP — main controller
// =============================================
const APP = {
  // ---- INIT ----
  init() {
    this.restoreState(); // #9, #10, #11, #12, #13, #14, #15
    OB.init();
    if (STATE.onboarded) this.initInput();
    this.initAbout();
    this.renderBag();
    this.initSW();
    // Remove splash (#57)
    setTimeout(() => {
      const splash = document.getElementById('splash');
      if (splash) { splash.classList.add('fade'); setTimeout(() => splash.remove(), 600); }
    }, 800);
    // Inactivity detect for end round (#134 from decisions)
    this._lastActivity = Date.now();
    document.addEventListener('touchstart', () => { this._lastActivity = Date.now(); });
    setInterval(() => {
      if (STATE.shots.length > 0 && Date.now() - this._lastActivity > 7200000) {
        if (confirm('Been a while. End this round?')) this.menuGo('confessional');
      }
    }, 300000);
  },

  initSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  },

  // ---- STATE RESTORE (#9-#15) ----
  restoreState() {
    STATE.onboarded = LS.get('onboarded') || false;
    STATE.bag = LS.get('bag') || [];
    STATE.hand = LS.get('hand') || 'right';
    STATE.hole = LS.get('hole') || 1;
    STATE.courseName = LS.get('courseName') || '';
    STATE.windSpeed = LS.get('windSpeed') || 0;   // #10
    STATE.windDir = LS.get('windDir') || 'In Face';
    STATE.rain = LS.get('rain') || false;          // #11
    STATE.temp = LS.get('temp') || 'mild';         // #12
    STATE.yardage = LS.get('yardage') || 0;        // #13
    STATE.shots = LS.get('shots') || [];
    STATE.rounds = LS.get('rounds') || [];
    STATE.terrain = LS.get('terrain') || null;      // #14
    STATE.sub = LS.get('sub') || null;
    STATE.slopes = LS.get('slopes') || [];
    STATE.obstacles = LS.get('obstacles') || [];
    STATE.elevation = LS.get('elevation') || 0;
    STATE.skipDist = LS.get('skipDist') || false;
    STATE.everySwing = LS.get('everySwing') || false;
    STATE.lastChoice = LS.get('lastChoice') || 'smart';
    cleanupRounds(); // #54

    // Restore visual states
    document.getElementById('hole-num').textContent = STATE.hole;
    document.getElementById('course-name').value = STATE.courseName;
    document.getElementById('settings-hole').textContent = STATE.hole;

    // Wind icon restore (#10)
    const btnWind = document.getElementById('btn-wind');
    if (STATE.windSpeed > 0) btnWind.classList.add('active-wind');
    else btnWind.classList.remove('active-wind');

    // Rain restore (#11)
    const btnRain = document.getElementById('btn-rain');
    if (STATE.rain) btnRain.classList.add('active-rain');
    else btnRain.classList.remove('active-rain');

    // Wind popup restore
    document.querySelectorAll('.wind-speed-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.wind) === STATE.windSpeed);
    });
    const dirSec = document.getElementById('wind-dir-section');
    if (STATE.windSpeed > 0) {
      dirSec.classList.add('show');
      document.querySelectorAll('.wind-dir-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.dir === STATE.windDir);
      });
    }

    // Temp restore (#12)
    document.querySelectorAll('.temp-btn').forEach(b => {
      const t = b.dataset.temp;
      b.classList.remove('active-hot', 'active-mild', 'active-cold');
      if (t === STATE.temp) b.classList.add('active-' + t);
    });

    // Hand restore
    document.getElementById('hand-right').classList.toggle('active', STATE.hand === 'right');
    document.getElementById('hand-left').classList.toggle('active', STATE.hand === 'left');
  },

  // ---- INPUT SCREEN ----
  initInput() {
    // Welcome
    const w = CL.getWelcome();
    document.getElementById('welcome-silver').textContent = w.silver;
    document.getElementById('welcome-copper').textContent = w.copper;

    // Yardage restore (#13)
    const yi = document.getElementById('yardage-input');
    if (STATE.yardage > 0) yi.value = STATE.yardage;
    yi.addEventListener('input', () => {
      STATE.yardage = parseInt(yi.value, 10) || 0;
      LS.set('yardage', STATE.yardage);
    });

    // Skip dist restore
    if (STATE.skipDist) {
      yi.disabled = true;
      yi.style.opacity = '.4';
      document.getElementById('skip-dist-btn').textContent = 'Enter distance';
    }

    // Build condition grids
    this.buildCondGrid('terrain', 'terrain-grid');
    this.buildCondGrid('slope', 'slope-grid');
    this.buildCondGrid('obstacle', 'obstacle-grid');

    // Elevation
    this.buildElevRow();

    // Quick jump (#15)
    this.buildQuickJump();

    // Restore conditions visually (#14)
    this.restoreConditionsUI();
  },

  buildCondGrid(group, containerId) {
    const el = document.getElementById(containerId);
    el.innerHTML = '';
    for (const [key, cond] of Object.entries(CL.conditions)) {
      if (cond.group !== group) continue;
      const btn = document.createElement('button');
      btn.className = 'cond-btn';
      btn.textContent = cond.label;
      btn.dataset.cond = key;
      btn.setAttribute('aria-label', cond.label);
      btn.onclick = () => this.toggleCond(key, group);
      el.appendChild(btn);
    }
  },

  buildElevRow() {
    const el = document.getElementById('elev-row');
    el.innerHTML = '';
    CL.elevation.forEach((e, i) => {
      const btn = document.createElement('button');
      btn.className = 'elev-btn' + (i === STATE.elevation ? ' active' : '');
      btn.textContent = e.label;
      btn.onclick = () => {
        STATE.elevation = i;
        LS.set('elevation', i);
        el.querySelectorAll('.elev-btn').forEach((b, j) => b.classList.toggle('active', j === i));
        haptic(8);
      };
      el.appendChild(btn);
    });
  },

  buildQuickJump() {
    const qj = document.getElementById('quick-jump');
    qj.innerHTML = '';
    const presets = [
      { label: 'Tee', action: () => this.quickTerrain('tee') },
      { label: 'Fairway', action: () => this.quickTerrain('fairway') },
      { label: 'Rough', action: () => this.quickTerrain('lt_rough') },
      { label: 'Bunker', action: () => this.quickTerrain('fwy_bnk') },
      { label: 'Trees', action: () => this.quickTerrain('trees') },
      { label: 'Water', action: () => this.quickTerrain('water') },
    ];
    presets.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'qj-btn';
      btn.textContent = p.label;
      btn.onclick = () => { p.action(); haptic(10); };
      qj.appendChild(btn);
    });
    this.updateQuickJump(); // #15
  },

  quickTerrain(key) {
    // Clear terrain first
    this.clearTerrain();
    this.toggleCond(key, 'terrain');
    // Scroll to commit
    document.querySelector('.commit-row').scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  updateQuickJump() {
    document.querySelectorAll('.qj-btn').forEach(btn => {
      const labels = { 'Tee': 'tee', 'Fairway': 'fairway', 'Rough': 'lt_rough', 'Bunker': 'fwy_bnk', 'Trees': 'trees', 'Water': 'water' };
      const key = labels[btn.textContent];
      btn.classList.toggle('active', STATE.terrain === key);
    });
  },

  restoreConditionsUI() {
    // Terrain
    document.querySelectorAll('#terrain-grid .cond-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cond === STATE.terrain);
    });
    // Sub panels
    if (STATE.terrain && CL.conditions[STATE.terrain]?.hasSub) {
      const panel = document.getElementById('sub-' + STATE.terrain);
      if (panel) {
        panel.classList.add('open');
        if (STATE.sub) {
          panel.querySelectorAll('.cond-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.sub === STATE.sub);
          });
        }
      }
    }
    // Slopes
    document.querySelectorAll('#slope-grid .cond-btn').forEach(btn => {
      btn.classList.toggle('active', STATE.slopes.includes(btn.dataset.cond));
    });
    // Obstacles
    document.querySelectorAll('#obstacle-grid .cond-btn').forEach(btn => {
      const key = btn.dataset.cond;
      btn.classList.toggle('active', STATE.obstacles.includes(key) || STATE.terrain === key);
    });
    // Quick jump
    this.updateQuickJump();
  },

  // ---- CONDITION TOGGLING ----
  clearTerrain() {
    STATE.terrain = null;
    STATE.sub = null;
    LS.set('terrain', null);
    LS.set('sub', null);
    // Close sub panels
    document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('open'));
    // Deactivate terrain buttons
    document.querySelectorAll('#terrain-grid .cond-btn').forEach(b => b.classList.remove('active'));
    // Deactivate obstacle buttons that act as terrain
    document.querySelectorAll('#obstacle-grid .cond-btn').forEach(b => b.classList.remove('active'));
    STATE.obstacles = [];
    LS.set('obstacles', []);
  },

  toggleCond(key, group) {
    haptic(10);
    const cond = CL.conditions[key];
    if (!cond) return;

    if (group === 'terrain') {
      if (STATE.terrain === key) {
        // Deselect
        this.clearTerrain();
      } else {
        this.clearTerrain();
        STATE.terrain = key;
        LS.set('terrain', key);
        // Activate button
        document.querySelectorAll('#terrain-grid .cond-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.cond === key);
        });
        // Open sub panel if hasSub
        if (cond.hasSub) {
          const panel = document.getElementById('sub-' + key);
          if (panel) panel.classList.add('open');
        }
      }
    } else if (group === 'obstacle') {
      // Obstacles with hasSub act like terrain selection
      if (cond.hasSub) {
        if (STATE.terrain === key) {
          this.clearTerrain();
        } else {
          this.clearTerrain();
          STATE.terrain = key;
          LS.set('terrain', key);
          document.querySelectorAll('#obstacle-grid .cond-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.cond === key);
          });
          const panel = document.getElementById('sub-' + key);
          if (panel) panel.classList.add('open');
        }
      } else {
        // Simple obstacles like lip — toggle in obstacles array
        const idx = STATE.obstacles.indexOf(key);
        if (idx >= 0) STATE.obstacles.splice(idx, 1);
        else STATE.obstacles.push(key);
        LS.set('obstacles', STATE.obstacles);
        document.querySelectorAll('#obstacle-grid .cond-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.cond === key && STATE.obstacles.includes(key));
        });
      }
    } else if (group === 'slope') {
      const idx = STATE.slopes.indexOf(key);
      if (idx >= 0) STATE.slopes.splice(idx, 1);
      else STATE.slopes.push(key);
      LS.set('slopes', STATE.slopes);
      document.querySelectorAll('#slope-grid .cond-btn').forEach(b => {
        b.classList.toggle('active', STATE.slopes.includes(b.dataset.cond));
      });
    }
    this.updateQuickJump();
  },

  pickSub(parent, subKey) {
    haptic(10);
    STATE.sub = subKey;
    LS.set('sub', subKey);
    const panel = document.getElementById('sub-' + parent);
    if (panel) {
      panel.querySelectorAll('.cond-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.sub === subKey);
      });
    }
  },

  closeSub(parent) {
    const panel = document.getElementById('sub-' + parent);
    if (panel) panel.classList.remove('open');
    // Deselect the terrain
    this.clearTerrain();
  },

  // ---- SKIP DISTANCE (#18) ----
  toggleSkipDist() {
    STATE.skipDist = !STATE.skipDist;
    LS.set('skipDist', STATE.skipDist);
    const yi = document.getElementById('yardage-input');
    const btn = document.getElementById('skip-dist-btn');
    if (STATE.skipDist) {
      yi.disabled = true; yi.style.opacity = '.4';
      btn.textContent = 'Enter distance';
    } else {
      yi.disabled = false; yi.style.opacity = '1';
      btn.textContent = 'Skip distance — just tell me how to hit it';
    }
    haptic(10);
  },

  // ---- WIND (#10, direction popup) ----
  openWind() {
    haptic(10);
    document.getElementById('wind-popup').classList.add('open');
  },

  closeWind() {
    document.getElementById('wind-popup').classList.remove('open');
    // Live recalc if on output screen
    if (STATE.screen === 'output' && STATE._outputData) this.liveRecalc();
  },

  setWindSpeed(idx) {
    haptic(10);
    STATE.windSpeed = idx;
    LS.set('windSpeed', idx);
    document.querySelectorAll('.wind-speed-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.wind) === idx);
    });
    const dirSec = document.getElementById('wind-dir-section');
    if (idx > 0) dirSec.classList.add('show');
    else dirSec.classList.remove('show');
    // Wind icon
    document.getElementById('btn-wind').classList.toggle('active-wind', idx > 0);
  },

  setWindDir(dir) {
    haptic(10);
    STATE.windDir = dir;
    LS.set('windDir', dir);
    document.querySelectorAll('.wind-dir-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.dir === dir);
    });
  },

  // ---- RAIN (#11) ----
  toggleRain() {
    haptic(10);
    STATE.rain = !STATE.rain;
    LS.set('rain', STATE.rain);
    document.getElementById('btn-rain').classList.toggle('active-rain', STATE.rain);
    // Live recalc if on output
    if (STATE.screen === 'output' && STATE._outputData) this.liveRecalc();
  },

  // ---- TEMPERATURE (#12, #26) ----
  setTemp(t) {
    haptic(10);
    STATE.temp = t;
    LS.set('temp', t);
    document.querySelectorAll('.temp-btn').forEach(b => {
      const bt = b.dataset.temp;
      b.classList.remove('active-hot', 'active-mild', 'active-cold');
      if (bt === t) b.classList.add('active-' + bt);
    });
  },

  // ---- HOLE (#8) ----
  promptHole() {
    const v = prompt('Hole number (1-18):', STATE.hole);
    if (v === null) return;
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 1 || n > 18) return; // #8 clamp
    STATE.hole = n;
    LS.set('hole', n);
    document.getElementById('hole-num').textContent = n;
    document.getElementById('settings-hole').textContent = n;
    haptic(10);
  },

  adjHole(delta) {
    STATE.hole = Math.max(1, Math.min(18, STATE.hole + delta)); // #8
    LS.set('hole', STATE.hole);
    document.getElementById('hole-num').textContent = STATE.hole;
    document.getElementById('settings-hole').textContent = STATE.hole;
    haptic(8);
    // Auto-prompt end round at hole 18+ (#134)
    if (STATE.hole >= 18 && STATE.shots.length > 0 && delta > 0) {
      setTimeout(() => {
        if (confirm('Hole 18. End round?')) this.menuGo('confessional');
      }, 300);
    }
  },

  // ---- COURSE NAME (#37) ----
  saveCourse() {
    STATE.courseName = document.getElementById('course-name').value;
    LS.set('courseName', STATE.courseName);
  },

  // ---- COMMIT (Smart / Hero) ----
  commit(choice) {
    debounceCommit(() => {
      haptic(20);
      this._doCommit(choice);
    });
  },

  _doCommit(choice) {
    STATE.lastChoice = choice;
    LS.set('lastChoice', choice);

    const yardage = STATE.yardage;
    const isTee = STATE.terrain === 'tee';
    const bag = STATE.bag.filter(c => c.on);
    if (!bag.length) { alert('Set up your bag first.'); this.menuGo('bag'); return; }

    // Determine base key for advice
    let baseKey = '_default';
    if (STATE.sub) {
      baseKey = STATE.sub;
    } else if (STATE.terrain) {
      // Check for special detections
      if (CL.isPutting(yardage) && !STATE.skipDist) {
        baseKey = 'putting'; // #30
      } else if (CL.isShortGame(yardage) && !STATE.skipDist) {
        baseKey = 'chipping'; // #30
      } else if (CL.base[STATE.terrain]) {
        baseKey = STATE.terrain;
      }
    } else {
      // No terrain selected
      if (!STATE.skipDist && CL.isPutting(yardage)) baseKey = 'putting';
      else if (!STATE.skipDist && CL.isShortGame(yardage)) baseKey = 'chipping';
    }

    // Active slope/obstacle conditions for modifiers
    const activeConds = [...STATE.slopes, ...STATE.obstacles];

    // Get merged advice
    const advice = CL.mergeAdvice(baseKey, activeConds, STATE.windSpeed, STATE.windDir, STATE.rain, STATE.hand);

    // Calculate adjusted distance
    let adjustedDist = yardage;
    const terrainMod = STATE.terrain ? (CL.conditions[STATE.terrain]?.mod || 0) : 0;
    const elevMod = CL.elevation[STATE.elevation]?.mod || 0;
    const windMod = CL.getWindMod(STATE.windSpeed, STATE.windDir);
    const tempMod = CL.tempMods[STATE.temp] || 0;
    const rainMod = STATE.rain ? CL.rainMod : 0;
    adjustedDist += terrainMod + elevMod + windMod + tempMod + rainMod;

    // Club selection
    let smartClub = null, heroClub = null, layupClub = null, bestWedgeDist = 0;
    const isPunch = STATE.sub === 'trees_punch';
    const isLayup = STATE.sub === 'water_front_layup';
    const isPutt = !STATE.skipDist && CL.isPutting(yardage);
    const isChip = !STATE.skipDist && CL.isShortGame(yardage);

    if (!STATE.skipDist && !isPutt && !isChip) {
      smartClub = CL.findClub(bag, adjustedDist, isTee);
      heroClub = CL.findHeroClub(bag, smartClub, adjustedDist, isTee, isPunch);

      // Layup calculator (#28)
      if (isLayup) {
        bestWedgeDist = CL.getBestWedgeDist(bag);
        layupClub = CL.findLayupClub(bag, yardage, bestWedgeDist);
      }
    }

    // Confidence
    const confConds = [...activeConds];
    if (STATE.terrain && CL.confidence.penalties[STATE.terrain]) confConds.push(STATE.terrain);
    const conf = CL.calcConfidence(confConds, STATE.windSpeed, STATE.rain, smartClub?.dist);

    // Tee par 4/5 smart play names specific safe club (#29)
    let smartText = advice.smartText || '';
    let heroText = advice.heroText || '';
    if (STATE.sub === 'tee_par45' && smartClub) {
      // Find safe club (longest non-driver)
      const safeClubs = bag.filter(c => !c.teeOnly).sort((a, b) => b.dist - a.dist);
      const safeName = safeClubs.length ? safeClubs[0].name : smartClub.name;
      smartText = smartText.replace('to the fairway', safeName + ' to the fairway');
    }

    // Kicker
    let kickerKey = '_default';
    if (STATE.sub) {
      const parts = STATE.sub.split('_');
      // Map sub to kicker category
      if (STATE.sub.startsWith('tee_par3')) kickerKey = 'tee_par3';
      else if (STATE.sub.startsWith('tee_par4')) kickerKey = 'tee_par45';
      else if (STATE.sub.startsWith('trees')) kickerKey = 'trees';
      else if (STATE.sub.startsWith('water')) kickerKey = 'water';
      else if (STATE.sub.startsWith('grn_bnk')) kickerKey = 'grn_bnk';
    } else if (STATE.terrain) {
      kickerKey = STATE.terrain;
    }
    if (isPutt) kickerKey = 'putting';
    if (isChip) kickerKey = 'chipping';
    const kicker = CL.getKicker(kickerKey);

    // Sub label (#20)
    const subLabel = STATE.sub ? CL.getSubLabel(STATE.sub, STATE.hand) :
      (STATE.terrain ? CL.conditions[STATE.terrain]?.label || '' : '');

    // Store output data for live recalc
    STATE._outputData = {
      choice, baseKey, activeConds, advice,
      smartClub, heroClub, layupClub, bestWedgeDist,
      conf, smartText, heroText, kicker, subLabel,
      adjustedDist, yardage, isPutt, isChip, isLayup, isPunch
    };

    // Record shot
    const shot = {
      hole: STATE.hole,
      yardage,
      adjustedDist,
      terrain: STATE.terrain,
      sub: STATE.sub,
      slopes: [...STATE.slopes],
      obstacles: [...STATE.obstacles],
      elevation: STATE.elevation,
      wind: STATE.windSpeed,
      windDir: STATE.windDir,
      rain: STATE.rain,
      temp: STATE.temp,
      choice,
      club: choice === 'hero' ? heroClub?.name : smartClub?.name,
      timestamp: Date.now(),
      thumbs: null // #39
    };
    STATE.shots.push(shot);
    LS.set('shots', STATE.shots);

    // Show output
    this.renderOutput(choice);
    this.showScreen('output');
  },

  // ---- OUTPUT RENDERING ----
  renderOutput(choice) {
    const d = STATE._outputData;
    if (!d) return;

    // Club name
    const outClub = document.getElementById('out-club');
    if (d.isPutt) {
      outClub.textContent = 'Putter';
    } else if (d.isChip) {
      outClub.textContent = d.choice === 'hero' ? 'Wedge' : 'Chip';
    } else if (STATE.skipDist) {
      outClub.textContent = 'Setup'; // #18
    } else {
      const club = choice === 'hero' ? d.heroClub : d.smartClub;
      if (d.isLayup && choice === 'smart' && d.layupClub) {
        outClub.textContent = d.layupClub.name;
      } else {
        outClub.textContent = club?.name || 'Wedge';
      }
    }

    // Sub label
    document.getElementById('out-sublabel').textContent = d.subLabel;

    // Yardage display
    const yardEl = document.getElementById('out-yardage');
    if (STATE.skipDist || d.isPutt || d.isChip) {
      yardEl.innerHTML = d.isPutt ? 'Putting' : d.isChip ? 'Short Game' : 'Technique Only';
    } else {
      let yd = `${d.yardage} yds`;
      if (d.adjustedDist !== d.yardage) {
        yd += `<span class="adjusted">(plays ${d.adjustedDist})</span>`;
      }
      if (d.isLayup && choice === 'smart' && d.layupClub) {
        yd = `Lay up to ${d.bestWedgeDist} yds out`;
      }
      yardEl.innerHTML = yd;
    }

    // Confidence bars (visual only, NO percentages)
    document.getElementById('conf-smart').style.width = d.conf.smart + '%';
    document.getElementById('conf-hero').style.width = d.conf.hero + '%';

    // Toggle buttons
    this.showChoice(choice);

    // Kicker
    document.getElementById('out-kicker').textContent = d.kicker;

    // Every swing content (#38)
    document.getElementById('every-swing-content').textContent = CL.everySwing;
    if (STATE.everySwing) {
      document.getElementById('every-swing-content').classList.add('show');
    }
  },

  showChoice(choice) {
    STATE.lastChoice = choice;
    LS.set('lastChoice', choice);
    const d = STATE._outputData;
    if (!d) return;

    const ts = document.getElementById('toggle-smart');
    const th = document.getElementById('toggle-hero');
    ts.className = choice === 'smart' ? 'active-smart' : '';
    th.className = choice === 'hero' ? 'active-hero' : '';

    // Update club display
    const outClub = document.getElementById('out-club');
    if (!d.isPutt && !d.isChip && !STATE.skipDist) {
      if (d.isLayup && choice === 'smart' && d.layupClub) {
        outClub.textContent = d.layupClub.name;
      } else {
        const club = choice === 'hero' ? d.heroClub : d.smartClub;
        outClub.textContent = club?.name || 'Wedge';
      }
    }

    // Yardage for layup toggle
    const yardEl = document.getElementById('out-yardage');
    if (!STATE.skipDist && !d.isPutt && !d.isChip) {
      if (d.isLayup && choice === 'smart' && d.layupClub) {
        yardEl.innerHTML = `Lay up to ${d.bestWedgeDist} yds out`;
      } else {
        let yd = `${d.yardage} yds`;
        if (d.adjustedDist !== d.yardage) yd += `<span class="adjusted">(plays ${d.adjustedDist})</span>`;
        yardEl.innerHTML = yd;
      }
    }

    // Advice
    const container = document.getElementById('advice-container');
    const advice = d.advice;
    const fields = [
      { key: 'ball', label: 'Ball Position' },
      { key: 'weight', label: 'Weight' },
      { key: 'swing', label: 'Swing' },
      { key: 'aim', label: 'Aim' },
      { key: 'hands', label: 'Hands' },
      { key: 'remember', label: 'Remember' },
    ];

    let html = '';
    // Play text
    const playText = choice === 'hero' ? d.heroText : d.smartText;
    if (playText) {
      html += `<div class="advice-section"><div class="advice-label">${choice === 'hero' ? 'Let It Eat' : 'Smart Play'}</div><div class="advice-text">${playText}</div></div>`;
    }

    // Extras from modifiers
    if (advice.extras && advice.extras.length) {
      html += `<div class="advice-section"><div class="advice-label">Conditions</div><div class="advice-text">${advice.extras.join('\n\n')}</div></div>`;
    }

    // Detail fields
    fields.forEach(f => {
      if (advice[f.key]) {
        html += `<div class="advice-section"><div class="advice-label">${f.label}</div><div class="advice-text">${advice[f.key]}</div></div>`;
      }
    });

    // Hero danger
    if (choice === 'hero' && advice.heroDanger) {
      html += `<div class="hero-danger"><div class="advice-label">⚠️ Reality Check</div><div class="advice-text">${advice.heroDanger}</div></div>`;
    }

    container.innerHTML = html;
    haptic(10);
  },

  // ---- LIVE RECALC (wind/rain changes on output) ----
  liveRecalc() {
    const d = STATE._outputData;
    if (!d) return;

    // Recalc adjusted distance
    const terrainMod = STATE.terrain ? (CL.conditions[STATE.terrain]?.mod || 0) : 0;
    const elevMod = CL.elevation[STATE.elevation]?.mod || 0;
    const windMod = CL.getWindMod(STATE.windSpeed, STATE.windDir);
    const tempMod = CL.tempMods[STATE.temp] || 0;
    const rainMod = STATE.rain ? CL.rainMod : 0;
    d.adjustedDist = d.yardage + terrainMod + elevMod + windMod + tempMod + rainMod;

    // Recalc advice with new wind/rain
    d.advice = CL.mergeAdvice(d.baseKey, d.activeConds, STATE.windSpeed, STATE.windDir, STATE.rain, STATE.hand);

    // Recalc club
    const bag = STATE.bag.filter(c => c.on);
    const isTee = STATE.terrain === 'tee';
    if (!STATE.skipDist && !d.isPutt && !d.isChip) {
      d.smartClub = CL.findClub(bag, d.adjustedDist, isTee);
      d.heroClub = CL.findHeroClub(bag, d.smartClub, d.adjustedDist, isTee, d.isPunch);
      if (d.isLayup) {
        d.bestWedgeDist = CL.getBestWedgeDist(bag);
        d.layupClub = CL.findLayupClub(bag, d.yardage, d.bestWedgeDist);
      }
    }

    // Recalc confidence
    const confConds = [...d.activeConds];
    if (STATE.terrain && CL.confidence.penalties[STATE.terrain]) confConds.push(STATE.terrain);
    d.conf = CL.calcConfidence(confConds, STATE.windSpeed, STATE.rain, d.smartClub?.dist);

    this.renderOutput(STATE.lastChoice);
  },

  // ---- EVERY SWING (#38) ----
  toggleEverySwing() {
    STATE.everySwing = !STATE.everySwing;
    LS.set('everySwing', STATE.everySwing);
    document.getElementById('every-swing-content').classList.toggle('show', STATE.everySwing);
    haptic(10);
  },

  // ---- EDIT FROM OUTPUT (#21) — preserve conditions ----
  editFromOutput() {
    // Go back to input WITHOUT resetting conditions
    this.showScreen('input');
    // Focus yardage
    setTimeout(() => document.getElementById('yardage-input').focus(), 200);
  },

  // ---- NEXT SHOT ----
  nextShot() {
    haptic(15);
    // Advance hole
    this.adjHole(1);
    // Clear yardage but keep conditions (#35)
    STATE.yardage = 0;
    LS.set('yardage', 0);
    document.getElementById('yardage-input').value = '';
    STATE._outputData = null;
    this.showScreen('input');
  },

  // ---- SCREEN MANAGEMENT ----
  showScreen(name) {
    STATE.screen = name;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + name);
    if (target) target.classList.add('active');
    // Update menu highlight (#36)
    document.querySelectorAll('.menu-item[data-screen]').forEach(m => {
      m.classList.toggle('active-screen', m.dataset.screen === name);
    });
    window.scrollTo(0, 0);
  },

  goInput() {
    this.closeMenu();
    this.showScreen('input');
  },

  // ---- MENU ----
  openMenu() { haptic(10); document.getElementById('menu-overlay').classList.add('open'); document.getElementById('menu-panel').classList.add('open'); },
  closeMenu() { document.getElementById('menu-overlay').classList.remove('open'); document.getElementById('menu-panel').classList.remove('open'); },

  menuGo(screen) {
    this.closeMenu();
    if (screen === 'bag') { this.renderBag(); }
    if (screen === 'history') { this.renderHistory(); }
    if (screen === 'confessional') { this.renderConfessional(); }
    this.showScreen(screen);
  },

  // ---- MY BAG ----
  renderBag() {
    const list = document.getElementById('bag-list');
    if (!list) return;
    list.innerHTML = '';
    CL.sortBag(STATE.bag);
    STATE.bag.forEach((c, i) => {
      const row = document.createElement('div');
      row.className = 'bag-club';
      row.innerHTML = `
        <button class="bag-club-toggle ${c.on ? 'on' : ''}" onclick="APP.toggleClub(${i})" aria-label="Toggle ${c.name}"></button>
        <input class="bag-club-name" value="${c.name}" onchange="APP.renameClub(${i}, this.value)" aria-label="Club name">
        <div class="bag-club-dist">
          <button onclick="APP.adjClubDist(${i},-5)" aria-label="Decrease distance">−</button>
          <span class="dist-val" onclick="APP.typeClubDist(${i})" role="button" tabindex="0" aria-label="${c.name} distance: ${c.dist} yards">${c.dist}</span>
          <button onclick="APP.adjClubDist(${i},5)" aria-label="Increase distance">+</button>
        </div>
        <button class="bag-club-delete" onclick="APP.deleteClub(${i})" aria-label="Delete ${c.name}">🗑</button>
      `;
      list.appendChild(row);
    });

    // Hand toggle restore
    document.getElementById('hand-right').classList.toggle('active', STATE.hand === 'right');
    document.getElementById('hand-left').classList.toggle('active', STATE.hand === 'left');
  },

  toggleClub(i) {
    haptic(10);
    STATE.bag[i].on = !STATE.bag[i].on;
    LS.set('bag', STATE.bag);
    this.renderBag();
  },

  renameClub(i, name) {
    STATE.bag[i].name = name.trim() || STATE.bag[i].name;
    // Auto teeOnly for Driver (#33)
    if (name.toLowerCase().includes('driver')) STATE.bag[i].teeOnly = true;
    LS.set('bag', STATE.bag);
  },

  adjClubDist(i, delta) {
    haptic(8);
    STATE.bag[i].dist = Math.max(20, Math.min(400, STATE.bag[i].dist + delta));
    LS.set('bag', STATE.bag);
    CL.sortBag(STATE.bag);
    this.renderBag();
  },

  typeClubDist(i) {
    const c = STATE.bag[i];
    const v = prompt(`${c.name} distance (yards):`, c.dist);
    if (v === null) return;
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 20 || n > 400) { alert('Enter 20-400.'); return; } // #34
    c.dist = n;
    LS.set('bag', STATE.bag);
    CL.sortBag(STATE.bag);
    this.renderBag();
  },

  deleteClub(i) { // #32
    if (!confirm(`Delete ${STATE.bag[i].name}?`)) return;
    STATE.bag.splice(i, 1);
    LS.set('bag', STATE.bag);
    this.renderBag();
    haptic(15);
  },

  addClub() {
    const name = prompt('Club name:');
    if (!name) return;
    const dist = parseInt(prompt('Distance (yards):', '150'), 10);
    if (isNaN(dist) || dist < 20 || dist > 400) { alert('Enter 20-400.'); return; }
    const teeOnly = name.toLowerCase().includes('driver'); // #33
    STATE.bag.push({ name: name.trim(), dist, on: true, teeOnly });
    CL.sortBag(STATE.bag);
    LS.set('bag', STATE.bag);
    this.renderBag();
    haptic(15);
  },

  setHand(h) {
    haptic(10);
    STATE.hand = h;
    LS.set('hand', h);
    document.getElementById('hand-right').classList.toggle('active', h === 'right');
    document.getElementById('hand-left').classList.toggle('active', h === 'left');
  },

  // ---- SHOT HISTORY ----
  renderHistory() {
    const list = document.getElementById('history-list');
    const empty = document.getElementById('history-empty');
    list.innerHTML = '';

    if (!STATE.shots.length) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    // Reverse to show most recent first
    [...STATE.shots].reverse().forEach((shot, revIdx) => {
      const realIdx = STATE.shots.length - 1 - revIdx;
      const item = document.createElement('div');
      item.className = 'history-item';

      const choiceLabel = shot.choice === 'hero' ? '🔴 Let It Eat' : '🟢 Smart Play';
      const terrainLabel = shot.terrain ? (CL.conditions[shot.terrain]?.label || shot.terrain) : '';
      const subLabel = shot.sub ? CL.getSubLabel(shot.sub, STATE.hand) : '';

      // Wind direction in history (#41)
      let windStr = '';
      if (shot.wind > 0) {
        windStr = `🌬️ ${CL.windSpeeds[shot.wind]?.label || ''} ${shot.windDir || ''}`;
        if (shot.rain) windStr += ' 🌧️';
      } else if (shot.rain) {
        windStr = '🌧️ Rain';
      }

      // Thumbs state (#39)
      const thumbUp = shot.thumbs === 'up' ? 'thumb-active' : 'thumb-inactive';
      const thumbDn = shot.thumbs === 'down' ? 'thumb-active' : 'thumb-inactive';

      item.innerHTML = `
        <div class="history-top">
          <span class="history-hole">Hole ${shot.hole}</span>
          <span class="history-club">${shot.club || 'N/A'} · ${choiceLabel}</span>
        </div>
        <div class="history-detail">
          ${shot.yardage ? shot.yardage + ' yds' : 'No dist'}
          ${shot.adjustedDist && shot.adjustedDist !== shot.yardage ? ' (plays ' + shot.adjustedDist + ')' : ''}
          ${terrainLabel ? ' · ' + terrainLabel : ''}
          ${subLabel ? ' · ' + subLabel : ''}
        </div>
        ${windStr ? '<div class="history-wind">' + windStr + '</div>' : ''}
        <div class="history-actions">
          <button class="thumb-up ${thumbUp}" onclick="APP.thumbShot(${realIdx},'up')" aria-label="Thumbs up">👍</button>
          <button class="thumb-down ${thumbDn}" onclick="APP.thumbShot(${realIdx},'down')" aria-label="Thumbs down">👎</button>
          <button class="history-delete" onclick="APP.deleteShot(${realIdx})" aria-label="Delete shot">🗑</button>
        </div>
      `;
      list.appendChild(item);
    });
  },

  thumbShot(idx, dir) { // #39
    haptic(10);
    if (STATE.shots[idx].thumbs === dir) {
      STATE.shots[idx].thumbs = null; // Toggle off
    } else {
      STATE.shots[idx].thumbs = dir;
    }
    LS.set('shots', STATE.shots);
    this.renderHistory();
  },

  deleteShot(idx) { // #40
    if (!confirm('Delete this shot?')) return;
    STATE.shots.splice(idx, 1);
    LS.set('shots', STATE.shots);
    this.renderHistory();
    haptic(15);
  },

  // ---- CONFESSIONAL / ROUND RECAP (#45, #46) ----
  renderConfessional() {
    // Use CURRENT state.shots, not last saved round (#45)
    const shots = STATE.shots;
    const total = shots.length;
    const smart = shots.filter(s => s.choice === 'smart').length;
    const hero = shots.filter(s => s.choice === 'hero').length;
    const pct = total > 0 ? Math.round((smart / total) * 100) : 0;

    const statsEl = document.getElementById('conf-stats');
    statsEl.innerHTML = `
      <div class="confessional-title">Round Recap</div>
      <div class="confessional-stat"><span>Shots Consulted</span><span class="val">${total}</span></div>
      <div class="confessional-stat"><span>Smart Play</span><span class="val">${smart}</span></div>
      <div class="confessional-stat"><span>Let It Eat</span><span class="val">${hero}</span></div>
      <div class="confessional-stat"><span>Discipline Index</span><span class="val">${pct}%</span></div>
    `;

    // Kicker
    let kickerCat = 'lowUsage';
    if (total >= 5 && hero === 0) kickerCat = 'allSmart';
    else if (total >= 5 && hero <= 3) kickerCat = 'someHero';
    else if (hero > 3) kickerCat = 'manyHero';
    const kickers = CL.confessionalKickers[kickerCat];
    document.getElementById('conf-kicker').textContent = kickers[Math.floor(Math.random() * kickers.length)];

    // Score placeholder (#44) — grayed out placeholder, not "—"
    const scoreInput = document.getElementById('conf-score');
    scoreInput.value = '';
    scoreInput.placeholder = 'Score';
  },

  cancelRound() { // #46
    haptic(10);
    this.showScreen('input');
  },

  newRound() {
    haptic(20);
    // Save round
    const score = parseInt(document.getElementById('conf-score').value, 10);
    STATE.rounds.push({
      date: new Date().toISOString(),
      course: STATE.courseName,
      shots: [...STATE.shots],
      score: isNaN(score) ? null : score
    });
    LS.set('rounds', STATE.rounds);
    cleanupRounds();

    // Reset round state
    STATE.shots = [];
    STATE.hole = 1;
    STATE.yardage = 0;
    STATE.terrain = null;
    STATE.sub = null;
    STATE.slopes = [];
    STATE.obstacles = [];
    STATE.elevation = 0;
    STATE._outputData = null;

    LS.set('shots', []);
    LS.set('hole', 1);
    LS.set('yardage', 0);
    LS.set('terrain', null);
    LS.set('sub', null);
    LS.set('slopes', []);
    LS.set('obstacles', []);
    LS.set('elevation', 0);

    document.getElementById('hole-num').textContent = 1;
    document.getElementById('settings-hole').textContent = 1;
    document.getElementById('yardage-input').value = '';

    // Refresh welcome
    const w = CL.getWelcome();
    document.getElementById('welcome-silver').textContent = w.silver;
    document.getElementById('welcome-copper').textContent = w.copper;

    this.restoreConditionsUI();
    this.showScreen('input');
  },

  // ---- SHARE (#45, #47) ----
  shareRecap() {
    haptic(15);
    const shots = STATE.shots; // #45 current round
    const total = shots.length;
    const smart = shots.filter(s => s.choice === 'smart').length;
    const hero = shots.filter(s => s.choice === 'hero').length;
    const score = document.getElementById('conf-score').value;

    let text = `Caddy Logic Round Recap\n`;
    if (STATE.courseName) text += `${STATE.courseName}\n`;
    text += `${total} shots consulted · ${smart} smart · ${hero} hero\n`;
    if (score) text += `Score: ${score}\n`;
    text += `Discipline: ${total > 0 ? Math.round((smart/total)*100) : 0}%\n`;
    text += `Know the play. Make the call.`;

    this._share(text);
  },

  showFlex() {
    const shots = STATE.shots;
    const total = shots.length;
    const smart = shots.filter(s => s.choice === 'smart').length;
    const hero = shots.filter(s => s.choice === 'hero').length;

    // Course and date (#48)
    document.getElementById('flex-course').textContent = STATE.courseName || '';
    document.getElementById('flex-date').textContent = new Date().toLocaleDateString();

    // Pick flex text
    let flexArr;
    if (hero === 0 && total > 0) {
      flexArr = CL.flexKickers.perfect;
    } else {
      flexArr = CL.flexKickers.withHero;
    }
    let text = flexArr[Math.floor(Math.random() * flexArr.length)];
    text = text.replace('{total}', total).replace('{smart}', smart).replace('{hero}', hero);
    document.getElementById('flex-text').textContent = text;

    this.showScreen('flex');
  },

  shareFlex() {
    haptic(15);
    const text = document.getElementById('flex-text').textContent;
    let share = text;
    if (STATE.courseName) share = STATE.courseName + '\n' + share;
    share += '\n— Caddy Logic';
    this._share(share);
  },

  _share(text) {
    // #47 — navigator.share with clipboard fallback
    if (navigator.share) {
      navigator.share({ text }).catch(() => this._clipboard(text));
    } else {
      this._clipboard(text);
    }
  },

  _clipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      const toast = document.getElementById('clipboard-toast');
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
      const toast = document.getElementById('clipboard-toast');
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    });
  },

  // ---- ABOUT ----
  initAbout() {
    document.getElementById('about-privacy').textContent = CL.privacyPolicy;
    document.getElementById('about-terms').textContent = CL.termsOfService;
    document.getElementById('about-version').textContent = `v${CL.version} · Built by Brian Bocek`;
  },

  // ---- RESET APP (#55) ----
  resetApp() {
    if (!confirm('Reset all data? This removes your bag, history, and settings.')) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;
    LS.clear();
    location.reload();
  },
};

// =============================================
// BOOT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  APP.init();
});
