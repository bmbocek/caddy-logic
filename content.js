// CADDY LOGIC — Content Database v1.0
// Every piece of advice uses "never had a lesson" language
// Every kicker references the specific situation
// Zero fabricated statistics — only real facts and observations

const CL = {

  // =============================================
  // AUTO-BAG DEFAULTS BY SCORING RANGE
  // =============================================
  bags: {
    '80s': [
      { name: 'Driver', dist: 240, on: true },
      { name: '3-Wood', dist: 220, on: true },
      { name: '5-Wood', dist: 195, on: true },
      { name: '3-Hybrid', dist: 180, on: true },
      { name: '4-Hybrid', dist: 170, on: true },
      { name: '5-Iron', dist: 160, on: true },
      { name: '6-Iron', dist: 150, on: true },
      { name: '7-Iron', dist: 140, on: true },
      { name: '8-Iron', dist: 130, on: true },
      { name: '9-Iron', dist: 120, on: true },
      { name: 'PW', dist: 110, on: true },
      { name: 'GW', dist: 90, on: true },
      { name: 'SW', dist: 70, on: true }
    ],
    '90s': [
      { name: 'Driver', dist: 220, on: true },
      { name: '3-Wood', dist: 200, on: true },
      { name: '5-Wood', dist: 180, on: true },
      { name: '4-Hybrid', dist: 165, on: true },
      { name: '5-Hybrid', dist: 155, on: true },
      { name: '6-Iron', dist: 140, on: true },
      { name: '7-Iron', dist: 130, on: true },
      { name: '8-Iron', dist: 120, on: true },
      { name: '9-Iron', dist: 110, on: true },
      { name: 'PW', dist: 100, on: true },
      { name: 'GW', dist: 80, on: true },
      { name: 'SW', dist: 65, on: true }
    ],
    '100s': [
      { name: 'Driver', dist: 200, on: true },
      { name: '3-Wood', dist: 180, on: true },
      { name: '5-Wood', dist: 160, on: true },
      { name: '5-Hybrid', dist: 145, on: true },
      { name: '6-Hybrid', dist: 135, on: true },
      { name: '7-Iron', dist: 120, on: true },
      { name: '8-Iron', dist: 110, on: true },
      { name: '9-Iron', dist: 100, on: true },
      { name: 'PW', dist: 90, on: true },
      { name: 'GW', dist: 75, on: true },
      { name: 'SW', dist: 55, on: true }
    ],
    '110+': [
      { name: 'Driver', dist: 180, on: true },
      { name: '3-Wood', dist: 160, on: true },
      { name: '5-Wood', dist: 145, on: true },
      { name: '6-Hybrid', dist: 130, on: true },
      { name: '7-Iron', dist: 110, on: true },
      { name: '8-Iron', dist: 100, on: true },
      { name: '9-Iron', dist: 90, on: true },
      { name: 'PW', dist: 80, on: true },
      { name: 'GW', dist: 65, on: true },
      { name: 'SW', dist: 50, on: true }
    ]
  },

  // All possible clubs for the full My Bag list
  allClubs: [
    'Driver','2-Wood','3-Wood','4-Wood','5-Wood','7-Wood','9-Wood',
    '2-Hybrid','3-Hybrid','4-Hybrid','5-Hybrid','6-Hybrid','7-Hybrid',
    '2-Iron','3-Iron','4-Iron','5-Iron','6-Iron','7-Iron','8-Iron','9-Iron',
    'PW','GW','52°','SW','56°','LW','60°','64°'
  ],

  // =============================================
  // CONDITIONS — modifiers & metadata
  // =============================================
  conditions: {
    // TERRAIN
    tee:        { label: 'Tee', mod: 0, group: 'terrain', hasSub: true, subs: ['par3','par45'] },
    fairway:    { label: 'Fairway', mod: 0, group: 'terrain' },
    lt_rough:   { label: 'Lt Rough', mod: 3, group: 'terrain' },
    dp_rough:   { label: 'Dp Rough', mod: 7, group: 'terrain' },
    bare_dirt:  { label: 'Bare Dirt', mod: 0, group: 'terrain' },
    fwy_bnk:    { label: 'Fwy Bnk', mod: 7, group: 'terrain' },
    grn_bnk:    { label: 'Grn Bnk', mod: 5, group: 'terrain', hasSub: true, subs: ['clean','plugged','wet'] },
    divot:      { label: 'Divot', mod: 3, group: 'terrain' },
    // LIE SLOPE
    up_lie:     { label: 'Up Lie', mod: 0, group: 'slope' },
    dn_lie:     { label: 'Dn Lie', mod: 0, group: 'slope' },
    below_ft:   { label: 'Below Ft', mod: 0, group: 'slope' },
    above_ft:   { label: 'Above Ft', mod: 0, group: 'slope' },
    // OBSTACLES
    trees:      { label: 'Trees', mod: 0, group: 'obstacle', hasSub: true, subs: ['around_l','around_r','over','punch'] },
    water:      { label: 'Water', mod: 0, group: 'obstacle' },
    lip:        { label: 'Lip', mod: 0, group: 'obstacle' }
  },

  // Wind states
  wind: [
    { label: 'Off', mod: 0, color: '#555', lines: 0 },
    { label: 'Light', mod: 3, color: '#B8B8B0', lines: 1 },
    { label: 'Moderate', mod: 7, color: '#B8B8B0', lines: 2 },
    { label: 'Strong', mod: 12, color: '#B8B8B0', lines: 3 }
  ],

  // Elevation
  elevation: [
    { label: 'None', mod: 0 },
    { label: '▲ Slight', mod: 4 },
    { label: '▲ Steep', mod: 10 },
    { label: '▼ Slight', mod: -4 },
    { label: '▼ Steep', mod: -10 }
  ],

  // =============================================
  // ADVICE DATABASE — setup cues per condition
  // =============================================
  advice: {
    _default: {
      ball: 'Center of stance for short irons. Line up with your shirt logo for mid-irons.',
      weight: 'Slightly favoring front foot for irons. Even for woods.',
      swing: 'Hit DOWN on irons — feel like you\'re hitting the ball into the ground. Sweep woods.',
      smart: 'Trust your number. Center green. Clean contact.',
      hero: 'You\'ve got a clean lie — if you\'re going to attack, this is the time.'
    },
    tee_par3: {
      ball: 'Tee it low — barely above the grass for irons, quarter of ball above face for woods.',
      weight: 'Even, slightly favoring front foot for irons.',
      swing: 'Smooth tempo. The tee gives you a perfect lie — use it.',
      smart: 'Center green. The pin is tempting but the tee is your gift.',
      hero: 'Flag hunting. Full swing at the pin. Perfect lie — best chance to attack.'
    },
    tee_par45: {
      ball: 'Driver: inside front heel, tee so half the ball is above the face. Wood/iron: tee flush with grass.',
      weight: 'Driver: 60% back foot, tilt lead shoulder up. Wood/iron: even.',
      swing: 'Driver: swing UP, head stays behind ball. Wood/iron: smooth sweep.',
      smart: 'Find the fairway. The short grass is 40 yards wide — just find it.',
      hero: 'Driver. Full send. Rip it.'
    },
    lt_rough: {
      ball: 'Same as fairway — don\'t change your setup for light rough.',
      weight: 'Slightly more on front foot than usual.',
      swing: 'Swing a touch more aggressively through. The grass grabs the face slightly.',
      smart: 'Club up one. The grass costs you a few yards. Aim center green.',
      hero: 'Play your normal shot. Light rough barely changes anything.'
    },
    dp_rough: {
      ball: 'Move it back one ball in your stance. Come down steeper.',
      weight: '65-70% on front foot. Stay there.',
      swing: 'Swing AGGRESSIVELY. The grass is going to grab your club — don\'t let it win.',
      smart: 'Club up two. Aim right — the rough closes the face and pulls it left. Get it out in one.',
      hero: 'Full swing from a terrible lie. You need perfect contact for full distance.'
    },
    bare_dirt: {
      ball: 'Move it back one ball. Hit ball first — there\'s nothing to cushion a fat shot.',
      weight: '65% front foot. Don\'t let the club bounce.',
      swing: 'Hit DOWN firmly. If you hit behind the ball, the club bounces and you blade it.',
      smart: 'Ball back, hands forward, hit down. The ground won\'t forgive a fat shot.',
      hero: 'Same technique at the pin. Risk is blading it. Reward is a clean strike with spin.'
    },
    fwy_bnk: {
      ball: 'Center of stance or slightly back. You MUST hit ball first.',
      weight: '60% front foot. Stay planted.',
      swing: 'Three-quarter swing. Smooth. Hit the BALL first — not the sand.',
      smart: 'Grip down. Ball first. Three-quarter swing for control. Club up one or two.',
      hero: 'Full swing from sand. Perfect ball-first contact or you\'re 50 yards short.'
    },
    grn_bnk_clean: {
      ball: 'Forward in stance — in line with your front heel.',
      weight: '60% front foot.',
      swing: 'Open your body LEFT (righties). Open the face BEFORE you grip. Hit the sand 2 inches BEHIND the ball.',
      smart: 'Open face, open stance, hit the sand behind the ball. Let the sand throw it out.',
      hero: 'Same technique but dial the distance. Longer swing = more distance.'
    },
    grn_bnk_plugged: {
      ball: 'Center to slightly back.',
      weight: '70% front foot. Lean into it.',
      swing: 'Square face — NOT open. Steep backswing. Slam into the sand close behind the ball.',
      smart: 'Square face, steep swing, dig it out. Ball comes out low and running — plan for it.',
      hero: 'Try to control the run. Good luck — plugged lies are unpredictable.'
    },
    grn_bnk_wet: {
      ball: 'Slightly back of center.',
      weight: '65% front foot.',
      swing: 'Hit closer to the ball — 1 inch behind instead of 2. Wet sand is heavy. More force.',
      smart: 'Closer contact than dry sand. Commit to the swing — wet sand doesn\'t splash, it thuds.',
      hero: 'Full commit. Wet sand needs more speed than you think.'
    },
    divot: {
      ball: 'Move it back one or two balls. Hit down steeply.',
      weight: '70% front foot.',
      swing: 'Hit DOWN aggressively. Punch the ball into the ground. The steep angle gets it out.',
      smart: 'Ball back, hands forward, steep downswing. Ball comes out lower and runs more.',
      hero: 'Same technique, but the margin for error is tiny from a crater.'
    },
    up_lie: {
      ball: 'Slightly forward — the slope moves your low point forward.',
      weight: 'Let gravity help — weight naturally falls back. Don\'t fight the hill.',
      swing: 'Tilt shoulders to MATCH the slope. Swing ALONG the hill, not into it. Ball flies higher and left.',
      smart: 'Shoulders match slope. Ball flies higher, less distance. Club up.',
      hero: 'Full swing uphill. Same setup but at the pin.'
    },
    dn_lie: {
      ball: 'Move it back — the slope moves your low point backward.',
      weight: 'Weight falls forward. Keep moving toward the target.',
      swing: 'Tilt shoulders to MATCH the slope. Chase the ball down the hill. Ball comes out lower, fades right.',
      smart: 'Ball back, shoulders match slope. Ball flies lower, runs more. Club down.',
      hero: 'Full swing downhill at the pin. Ball will run.'
    },
    below_ft: {
      ball: 'Center of stance.',
      weight: 'On your heels. Widen stance for stability.',
      swing: 'Bend MORE from hips. Sit into your legs. More up-and-down swing. Ball goes RIGHT (righties). Aim LEFT.',
      smart: 'Widen stance, bend more, aim left. The ball will fade right.',
      hero: 'Same setup, aim at the pin knowing it\'ll drift right.'
    },
    above_ft: {
      ball: 'Center of stance.',
      weight: 'On your toes — lean into the hill.',
      swing: 'Stand taller. Grip DOWN on the club. Ball will draw LEFT (righties). Aim RIGHT.',
      smart: 'Grip down, stand taller, aim right. The slope makes the ball hook left.',
      hero: 'Same setup, aim at the pin knowing it\'ll draw left.'
    },
    trees_around_l: {
      ball: 'Normal position for a draw — back of center.',
      weight: 'Normal.',
      swing: 'Aim body RIGHT of tree. Clubface at target. Swing along body line. The mismatch creates the curve.',
      smart: 'Draw around the tree. Aim 10 yards right, let the ball drift left.',
      hero: 'Full draw around the tree at the flag. Commit to the shape.'
    },
    trees_around_r: {
      ball: 'Normal position for a fade — forward of center.',
      weight: 'Normal.',
      swing: 'Aim body LEFT of tree. Clubface at target. Swing along body line.',
      smart: 'Fade around the tree. Aim 10 yards left, let the ball drift right.',
      hero: 'Full fade around the tree at the flag. Commit to the shape.'
    },
    trees_over: {
      ball: 'Forward in stance for maximum height.',
      weight: 'Stay behind the ball.',
      swing: 'Full swing. Let the loft do the work — don\'t try to scoop it.',
      smart: 'Club up one — higher loft costs distance. Make sure you CLEAR the tree.',
      hero: 'Thread it over the top at the pin. Clear the tree AND reach the green.'
    },
    trees_punch: {
      ball: 'Back in stance — inside back foot.',
      weight: '70% front foot.',
      swing: 'Half swing. LOW finish — hands stop at waist. Ball comes out low and running.',
      smart: '8-iron sideways to the fairway. Pick the widest gap.',
      hero: 'Thread it through the gap to the green. Low, running, through a window between trunks.'
    },
    water: {
      ball: 'Normal position. Don\'t change setup because of water.',
      weight: 'Normal. Don\'t tighten up.',
      swing: 'COMMIT. Full, committed swing. Pick a target past the water and swing to it.',
      smart: 'Can you carry it with two clubs to spare? Yes = go. No = lay up to your favorite wedge distance.',
      hero: 'Carry the water at the pin. You need perfect contact and full distance.'
    },
    lip: {
      ball: 'Forward for maximum height.',
      weight: 'Stay behind the ball.',
      swing: 'Full steep swing. Use your most lofted club. Get the ball up FAST.',
      smart: 'Use enough loft to CLEAR the lip with room to spare. Don\'t care about distance — just get over.',
      hero: 'Clear the lip AND control distance. If you don\'t get enough height, it rolls back.'
    }
  },

  // =============================================
  // KICKERS — rotating witty observations
  // =============================================
  kickers: {
    _default: [
      'Two putts from the middle beats three from the fringe.',
      'Boring golf is good golf.',
      'The fairway doesn\'t care about your ego.',
      'Par from the center of the green is always available.',
      'Your scorecard won\'t remember the boring shots. Just the number.',
      'The safe shot is the one you forget by the 19th hole.'
    ],
    tee_par3: [
      'Perfect lie, perfect target. Don\'t overthink the gift.',
      'The tee box is the only place the course can\'t trick you.',
      'Breathe. You chose this club for a reason.',
      'Nobody three-putts from the center of the green. Almost nobody.'
    ],
    tee_par45: [
      'The fairway doesn\'t care about your ego. Find it.',
      'You don\'t win holes on the tee. You lose them there.',
      'Driver goes further. 3-Wood goes straighter. Pick your priority.',
      'Trees are 90% air, but the wood always wins. Stay in the short stuff.',
      'Nobody ever said \'I wish I\'d tried to hit it further off the tee.\'',
      'The safe play off the tee sets up the hero play into the green.'
    ],
    lt_rough: [
      'It\'s rough, not a crime scene. You\'re fine.',
      'One club more. That\'s all the grass is costing you.',
      'The first cut is basically a fairway with a slight attitude problem.',
      'Don\'t panic. The grass barely has your ball.'
    ],
    dp_rough: [
      'The grass took your distance. Don\'t let it take your brain too.',
      'Get it out in one. That\'s the whole assignment.',
      'Your hybrid can\'t see the ball either.',
      'Bogey from the rough is a win. Double is what happens when you get ambitious.',
      'Aim right. The grass is going to twist that clubface shut.',
      'The hero play from deep rough is the leading cause of snowmen.'
    ],
    bare_dirt: [
      'Ball first. If you hit the dirt first, you\'ll be putting from the other green.',
      'Hard ground, hard truth: hit the ball before the ground.',
      'There\'s no grass to save you here. Precision only.',
      'Grip down, hit down. The ground doesn\'t care about your feelings.'
    ],
    fwy_bnk: [
      'Ball first. This isn\'t a beach shot — it\'s an iron shot in a sandbox.',
      'Grip down, dig in, hit ball first. That\'s the whole playbook.',
      'Three-quarter swing. Control beats power in sand.',
      'Hit the sand first and you get to hit from the sand again.'
    ],
    grn_bnk: [
      'Hit the sand hard. It started this fight.',
      'The sand does the work. You just need to show up with speed.',
      'Open face, open stance, and swing like you\'re not afraid.',
      'Decelerate in the bunker and you get to hit from the bunker again.',
      'The bounce on your wedge is designed for this exact shot.',
      'HITTING the lip means doing this shot again from the same spot.'
    ],
    divot: [
      'Someone else\'s divot, your problem. Ball back and dig it out.',
      'Lower trajectory, more run. Aim short of the pin.',
      'If golf had a \'that\'s not fair\' rule, divots would be exhibit A.',
      'The only way out is through. Hit down like you mean it.'
    ],
    up_lie: [
      'The hill is eating your distance. Feed it an extra club.',
      'Lean into the slope, not against it.',
      'Uphill means higher flight and less roll. Fly it all the way.',
      'Shoulders match slope. That\'s the entire thought for this shot.'
    ],
    dn_lie: [
      'The slope takes loft away. Club down or fly it over the green.',
      'Low and running. Aim short and let gravity help.',
      'Gravity is undefeated. Don\'t fight the slope.',
      'This ball is coming out hot and low. Plan for the run.'
    ],
    below_ft: [
      'The ball is going right. Aim left. That\'s the whole secret.',
      'Gravity wins every argument. Aim left.',
      'Your knees are doing more work than your arms here.',
      'Below your feet means above your skill level. Be honest about the aim.'
    ],
    above_ft: [
      'It\'s going left. Hard. Aim further right than feels comfortable.',
      'Choke up, aim right, and trust the draw.',
      'The slope closes your clubface for you. Plan for the hook.',
      'Stand tall, grip short. The hill is doing half the work.'
    ],
    trees: [
      'Sideways to the fairway. One shot lost, not three.',
      'The hero shot costs three strokes. The safe play costs one.',
      'Trees are 90% air, but the wood always wins.',
      'The gap looks bigger from behind the ball than it actually is.',
      'One swing to the fairway, then a full shot to the green. That\'s a bogey, not a triple.',
      'The forest doesn\'t have a highlight reel.'
    ],
    water: [
      'Golf balls don\'t float. If you can\'t clear it by two clubs, don\'t try.',
      'The splash is louder than you think.',
      'Lay up to your favorite wedge distance. A crisp wedge beats a wet long iron.',
      'Deceleration over water is how golf balls learn to swim.',
      'Your ego says go for it. Your wallet says those balls cost $4 each.'
    ],
    lip: [
      'The lip is non-negotiable. Clear it or repeat it.',
      'Get it OUT first. Get it CLOSE second.',
      'More loft than you think. The lip is always taller from down here.',
      'Your distance doesn\'t matter if the ball hits the lip and rolls back.'
    ]
  },

  // =============================================
  // PRE-ROUND WELCOME ROTATIONS
  // =============================================
  welcomes: [
    { silver: 'New round. Clean slate.', copper: 'Same mistakes are optional.' },
    { silver: '18 holes. One shot at a time.', copper: 'The scorecard only remembers the total.' },
    { silver: 'Breathe. Grip light. Pick a target.', copper: 'Everything else is noise.' },
    { silver: 'You brought the clubs. The course brought the trouble.', copper: 'Let\'s see who wins today.' },
    { silver: 'Every hole starts at zero.', copper: 'Keep it that way as long as possible.' },
    { silver: 'The course doesn\'t know your handicap.', copper: 'Play smarter than your number.' },
    { silver: 'You don\'t have to be great today.', copper: 'You just have to be smart.' },
    { silver: 'New day. New round.', copper: 'Old habits are the only enemy.' }
  ],

  // =============================================
  // CONFESSIONAL — post-round kickers
  // =============================================
  confessionalKickers: {
    allSmart: [
      'Zero hero shots. Zero drama. The caddy is impressed.',
      'You listened every time you asked. That\'s rarer than you think.',
      'All smart, all day. The boring golfer wins.',
      'No hero shots. Your ego took the day off.'
    ],
    someHero: [
      'How\'d that work out?',
      'The caddy tried to warn you.',
      'Bold choices were made. Results may vary.',
      'You asked the caddy and then did the opposite. Classic.'
    ],
    manyHero: [
      'The caddy is questioning your commitment to listening.',
      'Multiple hero attempts. The ego was fully in charge today.',
      'You asked the caddy a lot. You listened... less.',
      'The gap between knowing and doing. That\'s where your strokes live.'
    ],
    lowUsage: [
      'Everyone starts somewhere. Open the app more and see what happens.',
      'You asked once. Imagine if you asked on every trouble shot.',
      'One consultation. One smart decision. Build from there.'
    ]
  },

  // =============================================
  // FLEX SCREEN — share text rotations
  // =============================================
  flexKickers: {
    perfect: [
      'I listened to my caddy every time. {smart} for {smart}. Disciplined.',
      '{smart} shots consulted. {smart} times I listened. The boring golfer wins.',
      'Zero hero shots. My ego took the day off. — Caddy Logic'
    ],
    withHero: [
      'I listened to my caddy {smart} out of {total} times. That one hero shot? No comment.',
      '{total} shots. {smart} smart, {hero} hero. The caddy has notes.',
      'My caddy said Smart Play. I said Let It Eat. My caddy was right. — Caddy Logic'
    ]
  },

  // =============================================
  // SHARE ROAST — text message copy
  // =============================================
  roasts: [
    'Just got out-caddied by a phone app. I consulted Caddy Logic {total} times and listened {smart}. That {hero} time I didn\'t? Don\'t ask.',
    'My golf caddy app told me to hit {smartClub}. I hit {heroClub}. My golf caddy app was right.',
    'Downloaded @CaddyLogic and it\'s basically a therapist for my golf game. "How\'d that work out?" is my new least favorite question.',
    'Caddy Logic said center green. I said "I can reach that pin." Reader, I could not reach that pin.'
  ],

  // =============================================
  // EVERY SWING — universal basics
  // =============================================
  everySwing: 'Head down. Eye on the ball. Smooth back, accelerate through. Finish your swing.',

  // =============================================
  // CONFIDENCE MODEL — visual bar lengths
  // Bar is 0-100 scale, displayed as width %
  // NOT shown as a number to the user
  // =============================================
  confidence: {
    baseSmart: 90,
    baseHero: 60,
    penalties: {
      lt_rough:    { s: -3,  h: -5 },
      dp_rough:    { s: -12, h: -20 },
      bare_dirt:   { s: -5,  h: -10 },
      fwy_bnk:     { s: -10, h: -18 },
      grn_bnk:     { s: -8,  h: -15 },
      divot:       { s: -5,  h: -10 },
      up_lie:      { s: -3,  h: -5 },
      dn_lie:      { s: -5,  h: -10 },
      below_ft:    { s: -8,  h: -15 },
      above_ft:    { s: -5,  h: -10 },
      trees:       { s: -10, h: -25 },
      water:       { s: -5,  h: -15 },
      lip:         { s: -8,  h: -20 },
      wind_light:  { s: -2,  h: -3 },
      wind_mod:    { s: -3,  h: -5 },
      wind_strong: { s: -8,  h: -12 },
      rain:        { s: -3,  h: -5 },
      long_club:   { s: -3,  h: -8 }
    },
    min: 10
  },

  // Helper: get random kicker for a condition
  getKicker(condKey) {
    const pool = this.kickers[condKey] || this.kickers._default;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  // Helper: get random welcome
  getWelcome() {
    return this.welcomes[Math.floor(Math.random() * this.welcomes.length)];
  },

  // Helper: find best club for adjusted distance
  findClub(bag, adjustedDist) {
    const active = bag.filter(c => c.on).sort((a, b) => a.dist - b.dist);
    if (active.length === 0) return null;
    let best = active[0];
    let bestDiff = Math.abs(active[0].dist - adjustedDist);
    for (const club of active) {
      const diff = Math.abs(club.dist - adjustedDist);
      if (diff < bestDiff || (diff === bestDiff && club.dist >= adjustedDist)) {
        best = club;
        bestDiff = diff;
      }
    }
    return best;
  },

  // Helper: find hero club (one less club than smart)
  findHeroClub(bag, smartClub, adjustedDist) {
    const active = bag.filter(c => c.on).sort((a, b) => a.dist - b.dist);
    const smartIdx = active.findIndex(c => c.name === smartClub.name);
    if (smartIdx > 0) return active[smartIdx - 1];
    return smartClub;
  },

  // Helper: calculate confidence bar widths
  calcConfidence(activeConditions, windState, isRaining, clubDist) {
    let s = this.confidence.baseSmart;
    let h = this.confidence.baseHero;
    for (const cond of activeConditions) {
      const p = this.confidence.penalties[cond];
      if (p) { s += p.s; h += p.h; }
    }
    if (windState === 1) { s += this.confidence.penalties.wind_light.s; h += this.confidence.penalties.wind_light.h; }
    if (windState === 2) { s += this.confidence.penalties.wind_mod.s; h += this.confidence.penalties.wind_mod.h; }
    if (windState === 3) { s += this.confidence.penalties.wind_strong.s; h += this.confidence.penalties.wind_strong.h; }
    if (isRaining) { s += this.confidence.penalties.rain.s; h += this.confidence.penalties.rain.h; }
    if (clubDist && clubDist >= 170) { s += this.confidence.penalties.long_club.s; h += this.confidence.penalties.long_club.h; }
    return {
      smart: Math.max(this.confidence.min, Math.min(100, s)),
      hero: Math.max(this.confidence.min, Math.min(100, h))
    };
  }
};

if (typeof module !== 'undefined') module.exports = CL;
