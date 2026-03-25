// CADDY LOGIC — Content Database v5.0
// LAYERED ADVICE ENGINE with club-type awareness, combination overrides, accordion setup cues
// Every instruction verified against PGA/LPGA professional sources
// Voice: Direct caddy cue → one-line why → human kicker
// Zero jargon. Physical landmarks. "Toothpaste tube" level.
// Smart Play = safe mechanics. Let It Eat = bold but not stupid.

const CL = {
version: '1.0.5 Beta',

// =============================================
// BAGS — preset club sets by scoring range
// =============================================
bags: {
'80s':[{name:'Driver',dist:240,on:true,teeOnly:true},{name:'3-Wood',dist:220,on:true},{name:'5-Wood',dist:195,on:true},{name:'3-Hybrid',dist:180,on:true},{name:'4-Hybrid',dist:170,on:true},{name:'5-Iron',dist:160,on:true},{name:'6-Iron',dist:150,on:true},{name:'7-Iron',dist:140,on:true},{name:'8-Iron',dist:130,on:true},{name:'9-Iron',dist:120,on:true},{name:'PW',dist:110,on:true},{name:'GW',dist:90,on:true},{name:'SW',dist:70,on:true}],
'90s':[{name:'Driver',dist:220,on:true,teeOnly:true},{name:'3-Wood',dist:200,on:true},{name:'5-Wood',dist:180,on:true},{name:'4-Hybrid',dist:165,on:true},{name:'5-Hybrid',dist:155,on:true},{name:'6-Iron',dist:140,on:true},{name:'7-Iron',dist:130,on:true},{name:'8-Iron',dist:120,on:true},{name:'9-Iron',dist:110,on:true},{name:'PW',dist:100,on:true},{name:'GW',dist:80,on:true},{name:'SW',dist:65,on:true}],
'100s':[{name:'Driver',dist:200,on:true,teeOnly:true},{name:'3-Wood',dist:180,on:true},{name:'5-Wood',dist:160,on:true},{name:'5-Hybrid',dist:145,on:true},{name:'6-Hybrid',dist:135,on:true},{name:'7-Iron',dist:120,on:true},{name:'8-Iron',dist:110,on:true},{name:'9-Iron',dist:100,on:true},{name:'PW',dist:90,on:true},{name:'GW',dist:75,on:true},{name:'SW',dist:55,on:true}],
'110+':[{name:'Driver',dist:180,on:true,teeOnly:true},{name:'3-Wood',dist:160,on:true},{name:'5-Wood',dist:145,on:true},{name:'6-Hybrid',dist:130,on:true},{name:'7-Iron',dist:110,on:true},{name:'8-Iron',dist:100,on:true},{name:'9-Iron',dist:90,on:true},{name:'PW',dist:80,on:true},{name:'GW',dist:65,on:true},{name:'SW',dist:50,on:true}]
},

// =============================================
// CONDITIONS — terrain, slope, obstacle
// =============================================
conditions: {
tee:{label:'Tee',mod:0,group:'terrain',hasSub:true},
fairway:{label:'Fairway',mod:0,group:'terrain'},
lt_rough:{label:'Lt Rough',mod:3,group:'terrain'},
dp_rough:{label:'Dp Rough',mod:7,group:'terrain'},
bare_dirt:{label:'Bare Dirt',mod:0,group:'terrain'},
fwy_bnk:{label:'Fwy Bnk',mod:7,group:'terrain'},
grn_bnk:{label:'Grn Bnk',mod:5,group:'terrain',hasSub:true},
divot:{label:'Divot',mod:3,group:'terrain'},
up_lie:{label:'Up Lie',mod:0,group:'slope'},
dn_lie:{label:'Dn Lie',mod:0,group:'slope'},
below_ft:{label:'Below Ft',mod:0,group:'slope'},
above_ft:{label:'Above Ft',mod:0,group:'slope'},
trees:{label:'Trees',mod:0,group:'obstacle',hasSub:true},
water:{label:'Water',mod:0,group:'obstacle',hasSub:true},
lip:{label:'Lip',mod:0,group:'obstacle'}
},

subLabels: {
tee_par3:'Tee · Par 3',tee_par45:'Tee · Par 4/5',
trees_around_l:'Trees · Go Left',trees_around_r:'Trees · Go Right',
trees_over:'Trees · Go Over',trees_punch:'Trees · Punch Out',
grn_bnk_clean:'Bunker · Clean',grn_bnk_plugged:'Bunker · Plugged',grn_bnk_wet:'Bunker · Wet',
water_front_over:'Water Front · Over',water_front_layup:'Water Front · Lay Up',
water_left:'Water Left',water_right:'Water Right',water_crossing:'Water Crossing'
},

getSubLabel(key, hand) {
  if (!key) return '';
  const base = this.subLabels[key] || key;
  if (hand === 'left') return base.replace('Go Left', 'Go Left (Fade)').replace('Go Right', 'Go Right (Draw)');
  return base.replace('Go Left', 'Go Left (Draw)').replace('Go Right', 'Go Right (Fade)');
},

// =============================================
// WIND / WEATHER / ELEVATION
// =============================================
windSpeeds: [
{label:'Off',mod:0},
{label:'Lt',modFace:3,modBack:-3,modCross:2},
{label:'Mod',modFace:7,modBack:-5,modCross:3},
{label:'Str',modFace:12,modBack:-8,modCross:5}
],
windDirections: ['In Face','At Back','Cross Left','Cross Right'],
elevation: [{label:'None',mod:0},{label:'▲ Slight',mod:4},{label:'▲ Steep',mod:10},{label:'▼ Slight',mod:-4},{label:'▼ Steep',mod:-10}],
rainMod: 5,
tempMods: { hot: -5, mild: 0, cold: 7 },

// =============================================
// CLUB TYPE CLASSIFIER
// Used to filter setup advice to match recommended club
// =============================================
clubType(name) {
  if (!name) return 'mid_iron';
  const n = name.toLowerCase();
  if (n.includes('driver')) return 'driver';
  if (n.includes('wood') || n === '3w' || n === '5w' || n === '7w') return 'fwy_wood';
  if (n.includes('hybrid') || n.includes('rescue')) return 'hybrid';
  if (/^[2-4]-?iron$/i.test(n) || n === '2i' || n === '3i' || n === '4i') return 'long_iron';
  if (/^[5-7]-?iron$/i.test(n) || n === '5i' || n === '6i' || n === '7i') return 'mid_iron';
  if (/^[8-9]-?iron$/i.test(n) || n === '8i' || n === '9i') return 'short_iron';
  if (n.includes('pw') || n.includes('gw') || n.includes('sw') || n.includes('lw') || n.includes('lob') || n.includes('sand') || n.includes('gap') || n.includes('wedge') || /^\d{2}°?$/.test(n)) return 'wedge';
  if (n.includes('putter') || n.includes('putt')) return 'putter';
  // Fallback by distance
  return 'mid_iron';
},

// =============================================
// CLUB-SPECIFIC SETUP CUES
// Each club type has ball position, weight, swing feel
// These are the universal "every swing" cues filtered by club
// =============================================
clubSetup: {
driver: {
  setup: [
    {label:'Ball',cue:'Inside front heel. Tee high — half ball above clubface.',why:'You\'re hitting UP through this one. Forward position + high tee = launch angle.'},
    {label:'Weight',cue:'60% back foot at setup. Head stays behind ball.',why:'Leaning forward delofts the driver. That\'s where pop-ups come from.'},
    {label:'Swing',cue:'Sweep UP through ball. Full shoulder turn.',why:'Driver is the only club you hit on the upswing. Every other club goes down.'},
    {label:'Arms',cue:'Extended. Straight as possible. Don\'t lock elbow.',why:'Bent arms = topped ball. Extension = compression = distance.'},
    {label:'Head',cue:'Behind ball at impact. Don\'t sway forward.',why:'Swaying forward changes the low point. Ball goes nowhere good.'}
  ]
},
fwy_wood: {
  setup: [
    {label:'Ball',cue:'Two balls forward of center. Just inside front heel.',why:'Woods need a sweeping strike, not a descending one. Forward position enables that.'},
    {label:'Weight',cue:'Start 50/50. Stay balanced throughout.',why:'Woods from the turf need a level strike. No weight shift drama.'},
    {label:'Swing',cue:'Sweep it off the turf. Don\'t try to help it up.',why:'The loft does the lifting. Scooping causes thin shots.'},
    {label:'Head',cue:'Down through impact. Trust the club.',why:'Looking up pulls shoulders open. Ball goes right.'}
  ]
},
hybrid: {
  setup: [
    {label:'Ball',cue:'One to two balls forward of center.',why:'Hybrids are designed to launch easily. Slightly forward gets a clean sweep.'},
    {label:'Weight',cue:'Start 50/50. Slight shift to front through impact.',why:'Treat it like a long iron for weight, but swing it like a wood.'},
    {label:'Swing',cue:'Smooth sweep. Don\'t try to hit down hard.',why:'Hybrids replace long irons because they\'re more forgiving. Let them be.'},
    {label:'Grip',cue:'Light. Don\'t squeeze.',why:'Tension kills clubhead speed. Hybrids need speed to launch.'}
  ]
},
long_iron: {
  setup: [
    {label:'Ball',cue:'One to two balls forward of center.',why:'Long irons need a shallower angle than short irons but still descending.'},
    {label:'Weight',cue:'Start 50/50. Shift to 65% front through impact.',why:'Weight forward ensures ball-first contact. Essential with less loft.'},
    {label:'Swing',cue:'Smooth tempo. Don\'t try to kill it.',why:'Long irons punish overswinging. Smooth swing = better contact = more distance.'},
    {label:'Head',cue:'Down. Eyes on ball. Don\'t help it up.',why:'The loft lifts the ball. Scooping causes thin shots that go nowhere.'}
  ]
},
mid_iron: {
  setup: [
    {label:'Ball',cue:'Center to one ball forward. In line with shirt logo.',why:'Mid-irons want a descending blow. Center position delivers that.'},
    {label:'Weight',cue:'70-80% front foot through impact.',why:'Weight forward = ball first, ground second. That\'s what makes it go up.'},
    {label:'Swing',cue:'Hit DOWN on ball. Divot comes AFTER ball.',why:'Irons aren\'t scoops. The loft does the lifting. You do the hitting.'},
    {label:'Head',cue:'Down. Eyes on ball. Don\'t peek.',why:'Looking up pulls shoulders open. Ball goes right. You go crazy.'}
  ]
},
short_iron: {
  setup: [
    {label:'Ball',cue:'Center of stance. Between your feet.',why:'Short irons are precision clubs. Center position = most consistent contact.'},
    {label:'Weight',cue:'70-80% front foot through impact.',why:'Weight forward compresses the ball. Compression = spin = control.'},
    {label:'Swing',cue:'Controlled. Three-quarter is fine. Don\'t max out.',why:'Short irons are for accuracy, not distance. Smooth = straight.'},
    {label:'Hands',cue:'Ahead of ball. Shaft leans toward target.',why:'Forward hands deloft slightly for a penetrating flight that holds the wind.'}
  ]
},
wedge: {
  setup: [
    {label:'Ball',cue:'Center to slightly back. Narrow stance.',why:'Back position steepens the angle. Steeper = more spin = ball stops.'},
    {label:'Weight',cue:'60-70% front foot. Stay there.',why:'Wedges need a descending blow. Weight back = fat shot = embarrassment.'},
    {label:'Swing',cue:'Controlled distance. Not full power.',why:'Wedges are feel clubs. Swinging hard removes feel. Pick a landing spot.'},
    {label:'Finish',cue:'Abbreviate follow-through for control.',why:'Short finish = lower flight = less roll. Full finish = higher = more spin.'}
  ]
},
putter: {
  setup: [
    {label:'Ball',cue:'Center of stance. Eyes over ball.',why:'Eyes over the ball lets you see the true line. Offset = misread.'},
    {label:'Weight',cue:'50/50. Slight favor front. Stay STILL.',why:'Zero body movement. If your body moves, the putter path changes.'},
    {label:'Stroke',cue:'Rock shoulders. Pendulum. Wrists dead.',why:'Shoulders are the biggest muscles involved. They\'re the most consistent.'},
    {label:'Head',cue:'Down. LISTEN for ball to drop.',why:'Looking up too early opens shoulders. Putt pulls left every time.'}
  ]
}
},

// =============================================
// BASE ADVICE — Expanded scenarios
// Each has: smartText, heroText, heroDanger
// setup[] = [{label, cue, why}, ...] for accordion card back
// =============================================
base: {
_default: {
  smartText:'center green. Pick a specific spot. Smooth swing, solid contact.',
  heroText:'at the pin. Same fundamentals, smaller target. Full commitment.',
  heroDanger:'Missing the pin means possibly missing the green. Center green is a two-putt at worst.',
  setup:[
    {label:'Ball',cue:'Position for your club type. Short irons center, long clubs forward.',why:'Each club has a different low point. Match the ball to the club.'},
    {label:'Weight',cue:'Irons: 70-80% front at impact. Woods: 50/50.',why:'Irons hit down. Woods sweep. Weight position controls the angle.'},
    {label:'Grip',cue:'Light — like an open tube of toothpaste.',why:'Tension kills speed and feel. Light grip = faster clubhead = more distance.'},
    {label:'Aim',cue:'Feet, hips, shoulders all parallel to target line.',why:'Your body aims the club. Misaligned body = misaimed shot. Every time.'},
    {label:'Tempo',cue:'Smooth back, accelerate through. Finish the swing.',why:'Deceleration is the #1 amateur mistake. Commit to the finish.'}
  ]
},

tee_par3: {
  smartText:'center green. Smooth tempo off the tee. Best lie all hole — don\'t waste it.',
  heroText:'at the flag. Perfect lie. If you\'re going to attack, now\'s the time.',
  heroDanger:'Pin-seeking means missing the green if you miss. Center green means a putt no matter what.',
  setup:[
    {label:'Tee',cue:'Irons: tee flush with grass. Woods: 1/4 ball above clubface.',why:'Low tee for irons keeps descending strike. Higher tee for woods enables sweep.'},
    {label:'Swing',cue:'Same as practice swing. Don\'t swing harder because it\'s a tee.',why:'Perfect lie tempts you to overswing. Overswing = miss. Smooth = green.'},
    {label:'Aim',cue:'CENTER of the green. Not the pin. The center.',why:'The green is 30+ feet wide. Anywhere on it is a putt. The pin is 4 inches.'},
    {label:'Head',cue:'Down until ball is gone.',why:'Looking up early pulls shoulders open. Ball goes right. Stay down.'}
  ]
},

tee_par45: {
  smartText:'to the fairway. Smooth tempo, grip light, turn shoulders. Find the short grass.',
  heroText:'full send. Tee high, weight back, sweep UP through it. Full turn, full finish.',
  heroDanger:'Longest club is hardest to control. Fairway wood in the short grass beats driver in the trees.',
  setup:[
    {label:'Ball',cue:'Inside front heel. Tee high — half ball above clubface.',why:'Forward position + high tee = upward strike = launch and distance.'},
    {label:'Weight',cue:'60% back foot. Shift forward through swing.',why:'Weight back enables upward strike. Head stays behind ball at impact.'},
    {label:'Turn',cue:'Full shoulder turn. Don\'t sway hips side to side.',why:'Rotation creates power. Swaying moves the low point. Rotation good, sway bad.'},
    {label:'Arms',cue:'Extended through impact. Straight, not locked.',why:'Extension through the ball compresses it. Bent arms top it.'},
    {label:'Finish',cue:'Chest faces target. Arms high.',why:'Full finish means you committed. Half finish means you quit on it.'}
  ]
},

fairway: {
  smartText:'center green from the fairway. Clean lie, smooth swing. Pick your spot.',
  heroText:'at the pin from the fairway. Clean lie — if you\'re going to attack, this is it.',
  heroDanger:'Even from a perfect lie, the pin is a small target. Center green is always available.',
  setup:[
    {label:'Ball',cue:'Position for your club. Center for short irons, forward for long.',why:'Clean lie means the turf does its job. Match ball to club and swing.'},
    {label:'Weight',cue:'Start 50/50. Shift to front through impact for irons.',why:'Weight forward compresses the ball against the turf. That\'s solid contact.'},
    {label:'Swing',cue:'Smooth tempo. Head down until ball is gone.',why:'Clean lie is the shot golf was designed around. Don\'t complicate it.'},
    {label:'Target',cue:'Pick a SPECIFIC spot. Not "the green." A spot.',why:'Vague targets get vague results. Specific target = specific commitment.'}
  ]
},

lt_rough: {
  smartText:'center green. Swing a bit harder through the grass. One club more.',
  heroText:'at the pin. Light rough is almost a fairway lie. More commitment through.',
  heroDanger:'Light rough barely changes anything. The danger is overthinking it.',
  setup:[
    {label:'Ball',cue:'Same as fairway. Don\'t change anything.',why:'Light rough doesn\'t require a different setup. Keep it simple.'},
    {label:'Grip',cue:'Slightly firmer than normal.',why:'Grass grabs the clubface slightly. Firmer grip holds it square.'},
    {label:'Swing',cue:'Commit through impact. Don\'t slow down.',why:'Grass resists the clubhead. Speed cuts through. Deceleration doesn\'t.'},
    {label:'Aim',cue:'Touch right of target.',why:'Rough closes the face slightly. Ball pulls left. Aim right to compensate.'},
    {label:'Club',cue:'One club more than fairway distance.',why:'Grass between face and ball reduces spin and distance. Extra club covers it.'}
  ]
},

dp_rough: {
  smartText:'center green. Ball back, weight forward, grip firm, swing HARD. Club up one or two.',
  heroText:'at the pin from deep rough. Need perfect contact. Almost no margin.',
  heroDanger:'Miss-hits from deep rough barely move. Grass wins, you advance 30 yards.',
  setup:[
    {label:'Ball',cue:'One ball BACK in stance.',why:'Steeper angle cuts through thick grass before it can grab and twist the clubface.'},
    {label:'Weight',cue:'65-70% front foot. Stay planted.',why:'Drifting back = fat shot = ball moves three feet. Grass wins.'},
    {label:'Grip',cue:'Firmer than normal. Hold on.',why:'Thick grass grabs the hosel and tries to twist the club closed in your hands.'},
    {label:'Swing',cue:'Swing AGGRESSIVELY. Hinge wrists more.',why:'Thick grass kills speed. Need extra speed to power through. Think chopping.'},
    {label:'Aim',cue:'10-15 yards RIGHT of target.',why:'Deep rough closes the face hard. Ball pulls LEFT. Every time.'},
    {label:'Club',cue:'Club up one or two depending on lie.',why:'Ball sitting down = two clubs more. Ball visible = one club more.'}
  ]
},

bare_dirt: {
  smartText:'center green. Ball back, hands ahead, hit DOWN. Grip down one inch.',
  heroText:'at the pin from hard pan. Perfect ball-first contact or disaster.',
  heroDanger:'Fat shots on bare dirt = club bounces off surface = blade it 50 yards over.',
  setup:[
    {label:'Ball',cue:'One ball back of normal.',why:'Zero grass cushion. Need to catch ball first. Back position ensures it.'},
    {label:'Weight',cue:'65% front foot. Keep planted.',why:'Must hit ball FIRST then ground. Weight forward moves low point forward.'},
    {label:'Swing',cue:'Hit DOWN firmly. Ball first, ground scrapes after.',why:'Hit behind even slightly = club bounces off hard ground = skulled shot.'},
    {label:'Grip',cue:'Down one inch. Choke up for control.',why:'Shorter grip = more control = better chance of clean contact on an unforgiving lie.'},
    {label:'Hands',cue:'Well ahead. Shaft leans toward target.',why:'Forward hands steepen the angle. Steeper angle = ball first.'}
  ]
},

fwy_bnk: {
  smartText:'center green from sand. Grip down, dig feet in slightly, ball first. Three-quarter swing.',
  heroText:'at the flag from fairway sand. Must pure it. Sand before ball kills the shot.',
  heroDanger:'Full swings from fairway bunkers are one of the hardest shots. Three-quarter to center green is almost always smarter.',
  setup:[
    {label:'Ball',cue:'Center or slightly back. MUST hit ball first.',why:'Sand before ball = 50+ yards lost. Back position catches ball before sand.'},
    {label:'Feet',cue:'Wiggle in slightly for stability. Don\'t dig deep.',why:'Deep dig lowers your body. Grip down compensates but too deep = inconsistent.'},
    {label:'Grip',cue:'Down one inch from top.',why:'You\'re slightly lower from digging in. Grip down matches the height change.'},
    {label:'Swing',cue:'Three-quarter MAX. Keep lower body quiet.',why:'Sand is unstable. Big weight shifts = slipping. Control beats power here.'},
    {label:'Contact',cue:'Ball FIRST. Then sand. Not the other way.',why:'This is the opposite of greenside bunker. Ball first = distance. Sand first = nothing.'}
  ]
},

grn_bnk_clean: {
  smartText:'out of bunker to center green. Open face, open stance, hit sand 2 inches behind. Accelerate.',
  heroText:'close to pin. Same technique. Longer backswing = more distance.',
  heroDanger:'Distance control from bunkers takes years. Getting OUT onto green is a great shot.',
  setup:[
    {label:'Face',cue:'Open clubface BEFORE you grip. Then grip.',why:'Opening after gripping = your hands will square it on the downswing. Open first.'},
    {label:'Stance',cue:'Open. Feet aim LEFT. Clubface aims at target.',why:'You swing along foot line. Open stance creates the cutting motion through sand.'},
    {label:'Ball',cue:'Forward — in line with front heel.',why:'Forward position lets club enter sand behind ball and slide under it.'},
    {label:'Contact',cue:'Hit SAND 2 inches behind ball. NOT the ball.',why:'Sand explodes and carries ball up. You never touch the ball directly.'},
    {label:'Speed',cue:'ACCELERATE through. Never slow down.',why:'Decelerating sticks the club in sand. Ball stays. Accelerating splashes it out.'},
    {label:'Weight',cue:'60% front foot. Keep it there.',why:'Forward weight steepens the descent into sand. Needed for the splash.'}
  ]
},

grn_bnk_plugged: {
  smartText:'out of plugged lie. Square face (NOT open), steep swing, slam sand close behind. Comes out low, runs.',
  heroText:'toward pin from plugged lie. Same technique. Aim to land short — ball will run to hole.',
  heroDanger:'Plugged lies are the most unpredictable shot. Getting out is the only goal.',
  setup:[
    {label:'Face',cue:'SQUARE. Do NOT open it. Opposite of clean lie.',why:'Square face digs into sand and gets under the buried ball. Open face bounces off.'},
    {label:'Ball',cue:'Center or slightly back. NOT forward.',why:'Forward position with a plugged ball = club slides over top. Back gets under it.'},
    {label:'Swing',cue:'Pick club up steeply. SLAM into sand close behind ball.',why:'Steep angle is the only way to get under a plugged ball. Think chopping.'},
    {label:'Grip',cue:'Firm. You\'re slamming into heavy sand.',why:'Impact is violent. Loose grip = club twists = ball goes sideways.'},
    {label:'Expect',cue:'LOW and RUNNING. Plan for lots of roll.',why:'Plugged balls come out low with no spin. Anywhere on green is a win.'}
  ]
},

grn_bnk_wet: {
  smartText:'out of wet sand onto green. Hit closer to ball, swing harder, commit fully.',
  heroText:'at pin from wet sand. Full speed, full commit.',
  heroDanger:'Wet sand is completely different from dry. Ball can come out screaming or not at all.',
  setup:[
    {label:'Contact',cue:'Hit 1 inch behind ball. Not 2 like dry sand.',why:'Wet sand is heavy. Doesn\'t splash. Closer contact = less resistance.'},
    {label:'Speed',cue:'MORE than you think. Swing harder.',why:'Wet sand is heavy. It resists the club more. Need extra speed to get through.'},
    {label:'Grip',cue:'Firm. Powering through heavy sand.',why:'Wet sand grabs the club. Firm grip keeps it moving.'},
    {label:'Commit',cue:'Full commit. Do NOT decelerate.',why:'Slowing down in wet sand = club stuck = ball stays. Commit or stay in the bunker.'}
  ]
},

divot: {
  smartText:'center green from divot. Ball back, hands ahead, punch down steeply.',
  heroText:'at pin from divot. Same punch. Plan for ball to land short and run.',
  heroDanger:'Either perfect contact or a line drive over the green. No in between.',
  setup:[
    {label:'Ball',cue:'Back one or two ball-widths. Way back.',why:'Need STEEP angle to get under ball sitting in the hole. Back position steepens it.'},
    {label:'Weight',cue:'70% front foot. Planted.',why:'Forward weight drives the club down into the divot. Back weight = skull.'},
    {label:'Swing',cue:'Hit DOWN aggressively. Punch it.',why:'Steep angle gets club under ball. Scooping catches the back edge and skulls it.'},
    {label:'Hands',cue:'Well ahead. Shaft leaning toward target.',why:'Forward hands deloft the club and steepen the attack. Both needed from a divot.'},
    {label:'Expect',cue:'Lower, hotter ball flight. Aim short. Plan for run.',why:'Steep angle + forward hands = less loft = ball comes out low and rolls more.'}
  ]
},

trees_around_l: {
  smartText:'shape it left around the tree. Body aims right, clubface at target. Swing your body line.',
  heroText:'full draw to the green, curving left around tree. Full commitment.',
  heroDanger:'Not enough curve = tree. Too much = way left. Gap always looks bigger from behind the ball.',
  setup:[
    {label:'Body',cue:'Point feet, hips, shoulders RIGHT of tree.',why:'Body aim is where ball STARTS. Ball starts right, then curves left around tree.'},
    {label:'Face',cue:'Point clubface at TARGET (left of tree).',why:'Difference between body aim and face aim creates the curve. Face at target = draws left.'},
    {label:'Swing',cue:'Swing along BODY line. Not at target.',why:'Swinging at the target fights the setup. Swing your body line and trust the curve.'},
    {label:'Ball',cue:'Slightly back of center.',why:'Back position helps create inside-out path. Inside-out = draw.'},
    {label:'Commit',cue:'FULL swing. Half swings go straight into the tree.',why:'Curve requires clubhead speed. Tentative swings don\'t curve enough.'}
  ]
},

trees_around_r: {
  smartText:'shape it right around tree. Body left, clubface at target. Swing body line.',
  heroText:'full fade to green, curving right around tree. Full send.',
  heroDanger:'No curve = tree. Too much = way right. Commit fully or pick a different shot.',
  setup:[
    {label:'Body',cue:'Point feet, hips, shoulders LEFT of tree.',why:'Ball starts where body aims. Starts left, curves right around obstacle.'},
    {label:'Face',cue:'Point clubface at TARGET (right of tree).',why:'Body left + face at target = outside-in path = fade/slice curving right.'},
    {label:'Swing',cue:'Swing along BODY line.',why:'Trust the alignment. Swing path + face mismatch creates the curve.'},
    {label:'Ball',cue:'Slightly forward of center.',why:'Forward position promotes outside-in path. Outside-in = fade.'},
    {label:'Commit',cue:'Full swing. Commit or pick a safer shot.',why:'Half-hearted curve attempts go straight. Into the tree.'}
  ]
},

trees_over: {
  smartText:'over tree with high-lofted club. Ball forward, stay behind it, full swing. Trust the loft.',
  heroText:'over tree AT the green. Need height AND distance. Full commitment.',
  heroDanger:'Ball doesn\'t get up fast enough = hits tree, drops to your feet.',
  setup:[
    {label:'Ball',cue:'FORWARD — inside front heel. Maximum launch.',why:'Forward position adds effective loft. More loft = higher launch = clears tree.'},
    {label:'Weight',cue:'60% back foot. Stay BEHIND ball.',why:'Sliding forward delofts the club. Ball won\'t get high enough. Stay back.'},
    {label:'Hands',cue:'Even with ball. Not ahead.',why:'Hands ahead delofts. You need MAXIMUM loft. Keep hands level.'},
    {label:'Swing',cue:'Full swing. Trust the LOFT to get it up.',why:'Do NOT scoop or lift with hands. That causes thin shots straight into trunk.'},
    {label:'Decide',cue:'Not confident you clear it? Punch out sideways.',why:'One shot sideways = bogey. Through trees and hit = triple. Do the math.'}
  ]
},

trees_punch: {
  smartText:'punch to fairway. Ball back, half swing, low finish. Widest gap.',
  heroText:'stinger through the gap. Low, screaming, full distance through a window.',
  heroDanger:'Trees are 90% air, but the 10% that\'s wood always wins. Gap is smaller than it looks.',
  setup:[
    {label:'Ball',cue:'BACK in stance — off back foot.',why:'Back position delofts the club. Less loft = lower ball flight = stays under branches.'},
    {label:'Weight',cue:'70% front foot. Planted.',why:'Forward weight keeps the ball low. Back weight helps it up — opposite of what you want.'},
    {label:'Swing',cue:'HALF swing. Hands to waist, no higher.',why:'Partial swing = control. You need precision through the gap, not power.'},
    {label:'Finish',cue:'LOW finish. Hands stop at waist height.',why:'Low finish keeps ball low. High finish = high ball = hits branches.'},
    {label:'Aim',cue:'WIDEST gap to fairway. Safety only.',why:'Widest gap is the highest percentage play. Tight gap is a lottery ticket.'}
  ]
},

water_front_over: {
  smartText:'over water with SAFE club. Carries it with plenty of margin. Not exact-distance club.',
  heroText:'at the pin over water. Tighter club. Full commit — any slowing down = splash.',
  heroDanger:'Exact-distance over water needs PERFECT contact. One yard short = splash.',
  setup:[
    {label:'Club',cue:'TWO clubs of margin over the water.',why:'If carry is 150 and water is 140, only 10 yards margin. Not enough. Club up.'},
    {label:'Grip',cue:'Light. Toothpaste tube.',why:'Tension kills distance. Over water, lost distance = wet ball.'},
    {label:'Swing',cue:'FULL, COMMITTED swing. Don\'t think about water.',why:'Slowing down over water is the #1 cause of wet balls. Commit.'},
    {label:'Target',cue:'Pick a spot on the GREEN past the water.',why:'Aim at the green, not "over the water." Positive target, not negative avoidance.'},
    {label:'Decide',cue:'Can\'t carry with two clubs to spare? LAY UP.',why:'Laying up costs one shot. Water costs two (penalty + drop). Math is clear.'}
  ]
},

water_front_layup: {
  smartText:'lay up to your best wedge distance. Smooth, controlled swing to that target.',
  heroText:'go for the green over water anyway. Full swing, full commitment, full risk.',
  heroDanger:'Laying up costs one shot. Water costs two. The math is clear.',
  setup:[
    {label:'Target',cue:'Specific spot leaving your best wedge distance.',why:'Not just "short of water." A SPECIFIC yardage. 80-yard wedge > 30-yard pitch.'},
    {label:'Swing',cue:'Smooth, controlled. Hitting to a distance, not maxing out.',why:'You\'re playing position. Control = specific distance = perfect next shot.'},
    {label:'Club',cue:'Whatever reaches your layup target with a controlled swing.',why:'Three-quarter 7-iron to a specific spot beats full 9-iron to "somewhere short."'},
    {label:'Mental',cue:'This is the SMART play. Not the weak play.',why:'Tour pros lay up when the math doesn\'t work. You should too.'}
  ]
},

water_left: {
  smartText:'center-right of green, away from water. Aim to miss safe. Loose grip, confident swing.',
  heroText:'at the pin with water left. Trust your line. Stay loose.',
  heroDanger:'Pulls and hooks go in water. Guiding ball away causes exactly the pull you fear.',
  setup:[
    {label:'Aim',cue:'RIGHT of target. Away from water. Give cushion.',why:'Right rough beats water. Aim where the miss is safe.'},
    {label:'Grip',cue:'Light. Don\'t tighten up.',why:'Tension causes pulls. Pulls go left. Left is water. Stay loose.'},
    {label:'Swing',cue:'Same swing as always. Don\'t guide it.',why:'Guiding the ball away from water causes the exact pull you\'re trying to avoid.'},
    {label:'Mental',cue:'Swing to your target. Forget the water exists.',why:'Your swing doesn\'t know water is there. Only your brain does. Don\'t let it interfere.'}
  ]
},

water_right: {
  smartText:'center-left of green, away from water. Relaxed swing, don\'t guide.',
  heroText:'at the pin with water right. Free, relaxed swing.',
  heroDanger:'Pushes and slices find water. The more you guide away, the more likely you push it in.',
  setup:[
    {label:'Aim',cue:'LEFT of target. Away from water.',why:'Left rough beats water. Aim where the miss is safe.'},
    {label:'Grip',cue:'Light. Don\'t squeeze.',why:'Squeezing causes pushes and slices. Both go right. Right is water.'},
    {label:'Swing',cue:'Confident, free swing. Stay relaxed.',why:'Guiding the ball away from right causes pushes and slices. Exactly what puts it in water.'},
    {label:'Mental',cue:'Pick your target and commit. Forget the hazard.',why:'Water is a mental hazard more than physical. Your swing is the same shot either way.'}
  ]
},

water_crossing: {
  smartText:'over water crossing. Club with plenty of margin. Full, committed swing.',
  heroText:'over crossing at the pin. Tight carry, tight target. Full send.',
  heroDanger:'No layup with crossing water. Carry it or don\'t. Make sure you have enough club.',
  setup:[
    {label:'Club',cue:'Club with MARGIN. Carry is 150? Use club you hit 170.',why:'MUST carry. No layup option. Two clubs of margin minimum.'},
    {label:'Swing',cue:'Full, committed. Pick target on other side.',why:'Any deceleration = short = splash. Must carry. Full send.'},
    {label:'Grip',cue:'Light. Stay relaxed. Full swing.',why:'Tension over water is the enemy. Relaxed grip = full speed = full carry.'},
    {label:'Decide',cue:'Can\'t carry with margin? Go sideways.',why:'Better to lose a shot going around than two shots going in.'}
  ]
},

lip: {
  smartText:'over lip with max loft. Height is the ONLY priority.',
  heroText:'over lip AND control distance. Max loft, full swing.',
  heroDanger:'Hit the lip = ball rolls back to feet. Use more loft than you think.',
  setup:[
    {label:'Club',cue:'Most lofted club. Lob or sand wedge.',why:'Height is non-negotiable. The lip must be cleared or you repeat the shot.'},
    {label:'Ball',cue:'FORWARD — inside front heel.',why:'Forward position preserves maximum loft. Maximum loft = maximum height.'},
    {label:'Weight',cue:'60% back foot. Stay behind ball.',why:'Forward weight delofts the club. You need every degree of loft available.'},
    {label:'Hands',cue:'Even with ball. Not ahead.',why:'Hands ahead delofts. Keep them level to preserve height.'},
    {label:'Swing',cue:'Full, steep swing. Get ball UP fast.',why:'Lip is ALWAYS taller than it looks from below. Always. Commit to height.'}
  ]
},

chipping: {
  smartText:'chip to center green. Weight forward, hands forward, accelerate through.',
  heroText:'chip tight to pin. Same technique, tighter landing spot.',
  heroDanger:'Chipping to tight pin with obstacle = higher shot, less roll. Same acceleration.',
  setup:[
    {label:'Weight',cue:'70% FRONT foot. Keep it there. Don\'t shift back.',why:'Weight back = fat shot = ball goes 3 feet. Front foot is non-negotiable.'},
    {label:'Hands',cue:'FORWARD. Shaft leans toward target.',why:'This is the most important setup detail. Hands forward = clean contact = control.'},
    {label:'Ball',cue:'Low chip: back foot. High chip: front foot.',why:'Back = less loft = runs. Forward = more loft = stops. Pick based on green.'},
    {label:'Swing',cue:'Short back, ACCELERATE through. Never decelerate.',why:'Deceleration is the #1 chipping mistake. Accelerate. Always.'},
    {label:'Landing',cue:'Pick a specific landing SPOT. Ball flies there, then rolls like a putt.',why:'Get ball on ground rolling ASAP. Rolling ball is easier to control than flying ball.'}
  ]
},

chip_bump_run: {
  smartText:'bump and run to the pin. Low loft, back of stance, let it roll.',
  heroText:'run it right at the hole. Commit to the speed.',
  heroDanger:'Ball runs further than expected on fast greens. Pick landing spot carefully.',
  setup:[
    {label:'Club',cue:'7, 8, or 9 iron. Less loft = more roll.',why:'Ball gets on the ground quickly and rolls like a putt. Easiest chip to control.'},
    {label:'Ball',cue:'Back of stance. Off back foot.',why:'Back position delofts club even more. Ball comes out low, hits ground fast, rolls.'},
    {label:'Weight',cue:'70% front. Stay there.',why:'Same as any chip. Weight forward. Non-negotiable.'},
    {label:'Swing',cue:'Like a long putt. Shoulders rock, wrists quiet.',why:'This is basically putting with an iron. Same feel, same simplicity.'},
    {label:'Vision',cue:'See the ball landing just on the green and rolling to the hole.',why:'Visualize the roll. Where it lands matters less. Where it stops matters most.'}
  ]
},

chip_flop: {
  smartText:'flop shot over obstacle. Max loft, open face, full swing for a short shot.',
  heroText:'flop it tight to a tucked pin. Precise landing, maximum height.',
  heroDanger:'Thin flop = skull across the green. This shot requires full commitment.',
  setup:[
    {label:'Club',cue:'Lob wedge or sand wedge. Widest sole.',why:'Need maximum loft to get ball up fast and land it soft.'},
    {label:'Face',cue:'Open wide BEFORE gripping. Face aims at sky.',why:'Open face = maximum loft = maximum height. Open before grip.'},
    {label:'Ball',cue:'Forward. Inside front heel.',why:'Forward position adds even more height. Ball goes up, not forward.'},
    {label:'Swing',cue:'Full, aggressive swing for a short distance.',why:'Open face + full swing = high, soft shot that travels surprisingly short. Trust it.'},
    {label:'Commit',cue:'100% commitment. No deceleration.',why:'Backing off a flop = blade it. This shot only works at full speed.'}
  ]
},

chip_pitch: {
  smartText:'pitch to the green. Controlled partial swing. Pick a landing spot.',
  heroText:'attack the pin from 30-60 out. Wedge to a tight target.',
  heroDanger:'Partial swings are hard to control distance. Pick a club you can hit with a smooth motion.',
  setup:[
    {label:'Club',cue:'Wedge that reaches with a 3/4 swing. Don\'t max out.',why:'Controlled 3/4 > full swing. You need feel, not power.'},
    {label:'Ball',cue:'Center of stance. Slightly narrower stance.',why:'Center position with partial swing gives clean, consistent contact.'},
    {label:'Weight',cue:'Slight favor front foot. Stay centered.',why:'Not as much forward press as a chip. This is a mini full swing.'},
    {label:'Swing',cue:'Match backswing to follow-through. Same length both sides.',why:'Equal length back and through = consistent distance. Short back, long through = skulled.'},
    {label:'Landing',cue:'Pick a specific landing spot. Commit to it.',why:'30-60 yards is scoring distance. This is where good rounds happen.'}
  ]
},

putting: {
  smartText:'center of hole. Read break, pick speed, rock shoulders. Head down.',
  heroText:'aggressive line. Same stroke, more pace. Commit to speed.',
  heroDanger:'Aggressive putting means aggressive comebacks on miss.',
  setup:[
    {label:'Speed',cue:'Get PACE right first, then line. 2 feet past on a miss = right speed.',why:'Speed dictates line. A putt that dies 4 feet short never had a chance.'},
    {label:'Stroke',cue:'Rock SHOULDERS. Wrists and body completely still.',why:'Shoulders are a pendulum. Wrists add variables. Variables miss putts.'},
    {label:'Head',cue:'DOWN. LISTEN for ball to drop.',why:'Looking up early opens shoulders. Putt pulls left. Listen instead.'},
    {label:'Read',cue:'Ball curves toward the low side. Always.',why:'Gravity pulls the ball downhill. Read the slope, aim high side.'},
    {label:'Routine',cue:'Same routine every putt. Two looks, commit, go.',why:'Consistency breeds confidence. Confidence makes putts. That simple.'}
  ]
},

putt_lag: {
  smartText:'lag to a 3-foot circle around the hole. Speed is everything.',
  heroText:'go for it from distance. Commit to pace and line.',
  heroDanger:'Leaving a 30-footer 6 feet past is aggressive. Leaving it 6 feet short is lazy.',
  setup:[
    {label:'Speed',cue:'Think about rolling ball to a 3-foot circle. Not the hole.',why:'3-foot circle = tap-in range. Two putts from anywhere is never bad.'},
    {label:'Stroke',cue:'Longer backswing. Same tempo. Don\'t jab.',why:'Distance comes from length of stroke, not speed. Jabbing = no distance control.'},
    {label:'Read',cue:'On long putts, focus on the LAST 6 feet. That\'s where break matters.',why:'Ball is moving fast for the first half. It only curves when it slows down near the hole.'},
    {label:'Eyes',cue:'Take one more look at the hole than you think you need.',why:'Long putts are feel shots. More looks = better feel for distance.'}
  ]
},

putt_short: {
  smartText:'firm, confident stroke into center of cup. Don\'t get cute.',
  heroText:'charge the back of the cup. Aggressive. Take the break out.',
  heroDanger:'Charging a short putt means a 3-footer coming back if you miss.',
  setup:[
    {label:'Line',cue:'Pick a line and COMMIT. Don\'t change your mind over the ball.',why:'Indecision is the #1 killer of short putts. Pick it and go.'},
    {label:'Speed',cue:'Firm enough to hold the line. Ball should hit the back of the cup.',why:'A putt that dies at the hole breaks more. Firm putt holds its line.'},
    {label:'Head',cue:'DOWN. Do NOT look up. Listen.',why:'Short putts miss because you peek. Every time. Listen for the rattle.'},
    {label:'Routine',cue:'Don\'t stand over it too long. See it, set it, hit it.',why:'The longer you stand over a short putt, the more doubts creep in.'}
  ]
},

putt_downhill: {
  smartText:'barely touch it. Let gravity do the work.',
  heroText:'commit to your line and let it die at the hole.',
  heroDanger:'Too firm on a downhill putt = 6 feet past. Downhill coming back.',
  setup:[
    {label:'Speed',cue:'HALF the speed you think. Gravity adds the rest.',why:'Downhill putts always go further than expected. Always. Underclub your speed.'},
    {label:'Stroke',cue:'Shorter backswing. Let the slope carry the ball.',why:'You barely need to hit this. The hill does the work.'},
    {label:'Aim',cue:'More break than you read. Ball curves more when slow.',why:'Slow ball = more time for gravity to pull it sideways. Over-read the break.'},
    {label:'Head',cue:'Down. Don\'t watch it roll. Listen.',why:'Temptation to watch is huge on downhillers. Stay down. Trust it.'}
  ]
},

putt_uphill: {
  smartText:'hit it. Ball dies into the hill. Be aggressive with speed.',
  heroText:'charge it past the hole. Uphill comebacker is easy.',
  heroDanger:'Leaving an uphill putt short is the biggest waste in golf.',
  setup:[
    {label:'Speed',cue:'Firmer than you think. Hit it PAST the hole.',why:'Uphill putts need extra speed to fight gravity. Never leave them short.'},
    {label:'Aim',cue:'LESS break than you read. Ball is moving fast.',why:'Fast ball breaks less. Uphill putts are straighter than they look.'},
    {label:'Mental',cue:'This is the putt you want. Uphill = aggressive.',why:'Uphill comebacks are easy. You can\'t hurt yourself. Attack.'},
    {label:'Stroke',cue:'Longer backswing. Same tempo. Don\'t jab at it.',why:'Need more energy. Get it from backswing length, not from jabbing.'}
  ]
},

putt_sidehill_l: {
  smartText:'aim right. Ball will break LEFT. Play more break than you see.',
  heroText:'hold the high line. Trust your read.',
  heroDanger:'Amateurs under-read break by 60%. Aim higher than comfortable.',
  setup:[
    {label:'Aim',cue:'Aim RIGHT of hole. Ball breaks LEFT.',why:'Gravity pulls ball toward the low side. Low side is left.'},
    {label:'Speed',cue:'Die it at the hole. Firm putts break less but miss further.',why:'Soft speed lets the ball take the break. Firm speed holds the line but risks a long miss.'},
    {label:'Read',cue:'More break than you think. Double what you see.',why:'Amateurs consistently under-read break. The pros aim way higher than you\'d expect.'},
    {label:'Weight',cue:'Lean slightly into the uphill side for balance.',why:'Sidehill lies affect your stance. Lean into the hill to keep stroke straight.'}
  ]
},

putt_sidehill_r: {
  smartText:'aim left. Ball will break RIGHT. Play more break than you see.',
  heroText:'hold the high line. Trust your speed.',
  heroDanger:'Same as any breaking putt — you\'re probably under-reading it.',
  setup:[
    {label:'Aim',cue:'Aim LEFT of hole. Ball breaks RIGHT.',why:'Gravity pulls ball right toward the low side.'},
    {label:'Speed',cue:'Match speed to break. Softer = more break taken.',why:'Speed and line are connected. Choose your combination.'},
    {label:'Read',cue:'More break than you think. Seriously.',why:'Every amateur under-reads break. Aim higher. Then a little higher.'},
    {label:'Commit',cue:'Trust the line and don\'t steer it.',why:'Starting the ball on your intended line is all you can control. Trust it.'}
  ]
}
},

// =============================================
// COMBINATION OVERRIDES
// When base + modifier merge isn't specific enough
// App checks combos FIRST, then falls back to merge
// Key format: 'baseKey+modifierKey'
// =============================================
combos: {
'dp_rough+dn_lie': {
  smartText:'short iron or wedge only. Ball way back, steep angle. Expect low and running.',
  heroText:'try to advance it. Ball comes out low and hot. Cannot be stopped.',
  heroDanger:'Low bullet off a downslope from thick grass. Uncontrollable distance. If slope is severe, punch sideways.',
  setup:[
    {label:'Club',cue:'Wedge or short iron ONLY.',why:'Long clubs from this combo go nowhere predictable. Take your medicine.'},
    {label:'Ball',cue:'WAY back. Off back foot.',why:'Steep angle + downslope = must catch ball early before grass grabs club.'},
    {label:'Aim',cue:'Short of green. Plan for 30+ yards of run.',why:'No spin from rough + downhill = ball runs like concrete. Plan for it.'},
    {label:'Weight',cue:'Into the slope. Front foot dominant.',why:'Gravity pulls you forward. Go with it. Fighting the slope causes fat shots.'}
  ]
},
'dp_rough+up_lie': {
  smartText:'club up two. Ball goes higher and shorter from uphill. Aim right.',
  heroText:'full swing up the hill. Ball will launch high — need extra club for distance.',
  heroDanger:'Uphill from deep rough = maximum height, minimum distance. Take way more club.',
  setup:[
    {label:'Club',cue:'Club up TWO from rough + ONE more for uphill = three clubs more.',why:'Rough eats distance. Uphill eats distance. Combined they eat a LOT.'},
    {label:'Shoulders',cue:'Match the slope. Right shoulder lower than left.',why:'Shoulders parallel to slope = clean contact along the hill.'},
    {label:'Aim',cue:'Right of target. Uphill + rough both pull left.',why:'Double whammy. Both conditions close the face. Aim further right than usual.'},
    {label:'Swing',cue:'Aggressive through the grass. Full commit up the hill.',why:'Need speed through grass AND need to fight uphill. Swing hard.'}
  ]
},
'dp_rough+below_ft': {
  smartText:'widen stance. Sit deep. Aim LEFT. Ball will push right hard.',
  heroText:'full commit from the worst lie combination. Must hold posture.',
  heroDanger:'Ball below feet from deep rough = reaching into thick grass. Skulled shots are likely.',
  setup:[
    {label:'Stance',cue:'WIDE. Sit into knees. Bend from hips.',why:'Ball is below you AND buried. Need stability and reach.'},
    {label:'Grip',cue:'Full length. End of club.',why:'Need every inch of shaft to reach the ball.'},
    {label:'Aim',cue:'LEFT. Ball goes RIGHT from below feet AND rough pushes left.',why:'Below feet fade is stronger than rough pull. Net result = right. Aim left.'},
    {label:'Expect',cue:'Contact will be inconsistent. Get it moving forward.',why:'This is survival golf. Advancing the ball is winning.'}
  ]
},
'dp_rough+above_ft': {
  smartText:'grip down. Stand taller. Aim RIGHT. Ball will hook left hard.',
  heroText:'control the hook from above-feet deep rough. Good luck.',
  heroDanger:'Above feet from deep rough = maximum hook. Ball goes LEFT. Way left.',
  setup:[
    {label:'Grip',cue:'Down 2+ inches. Ball is much closer to you.',why:'Slope puts ball at hip height. Regular grip = fat shot into hill.'},
    {label:'Aim',cue:'WAY right. Both conditions push ball left.',why:'Above feet = draw. Deep rough = closed face. Combined = big hook left.'},
    {label:'Swing',cue:'Three-quarter. Control over power.',why:'Full swings from this lie are unpredictable. Controlled swing = some control.'},
    {label:'Club',cue:'One extra. Rough eats distance.',why:'Above-feet lie doesn\'t cost much distance, but the rough does.'}
  ]
},
'fwy_bnk+below_ft': {
  smartText:'survival shot. Get it out. Get it forward. That\'s winning from here.',
  heroText:'clean contact from one of golf\'s hardest lies. Full commitment or don\'t try.',
  heroDanger:'This is the hardest combination in golf. Getting out of the bunker IS the win.',
  setup:[
    {label:'Stance',cue:'WIDE. Sit deep into knees. Bend more from hips.',why:'You\'re reaching down into sand with ball even lower. Need maximum stability.'},
    {label:'Grip',cue:'Full length. All the way to end.',why:'Ball is far below you. Need every inch of the shaft.'},
    {label:'Swing',cue:'Three-quarter MAX. Ball first. Don\'t dig.',why:'Unstable footing + reaching = full swing will lose balance.'},
    {label:'Aim',cue:'LEFT. Ball will fade/push right.',why:'Below feet always fades. In sand it fades even more. Aim well left.'}
  ]
},
'fwy_bnk+above_ft': {
  smartText:'grip down. Stand taller. Ball will draw left. Aim right.',
  heroText:'control the draw from elevated sand. Shorter grip, taller stance.',
  heroDanger:'Above feet in sand = easy to chunk. Grip down enough.',
  setup:[
    {label:'Grip',cue:'Down 1-2 inches. Ball is closer to you.',why:'If you don\'t grip down, club digs into sand before the ball. Fat city.'},
    {label:'Aim',cue:'Right. Ball will draw/hook left.',why:'Slope closes the face. Draw is guaranteed. More slope = more draw.'},
    {label:'Swing',cue:'Smooth. Ball first. Keep it controlled.',why:'Sand + slope = two variables. Smooth swing = manage both.'},
    {label:'Stance',cue:'Stand taller. Less knee bend.',why:'Ball is higher than your feet. Standing tall matches the ball height.'}
  ]
},
'fwy_bnk+up_lie': {
  smartText:'club up one. Ball will fly higher. Match shoulders to slope.',
  heroText:'full swing up the hill from sand. Must be clean. Ball-first.',
  heroDanger:'Uphill fairway bunker = higher flight = shorter distance. Take more club.',
  setup:[
    {label:'Shoulders',cue:'Match the slope. Swing along the hill.',why:'Fighting the slope causes fat shots. Go WITH the hill.'},
    {label:'Club',cue:'One more club. Uphill adds height, costs distance.',why:'Slope adds loft. Extra loft = less distance. Compensate with more club.'},
    {label:'Contact',cue:'Ball first. Always. Especially uphill.',why:'Uphill tempts you to hit behind it. Stay committed to ball-first.'},
    {label:'Weight',cue:'Into the slope. Lean toward the low foot.',why:'Gravity pulls you back. Fight it by pressing into the slope.'}
  ]
},
'fwy_bnk+dn_lie': {
  smartText:'more loft. Ball comes out low from downhill sand. Don\'t fight it.',
  heroText:'controlled downhill bunker escape. Ball will run.',
  heroDanger:'Downhill fairway bunker = ball comes out low and fast. Hard to stop.',
  setup:[
    {label:'Club',cue:'One more club of LOFT. Slope delofts everything.',why:'Downhill takes loft off. 7-iron plays like a 5-iron in trajectory.'},
    {label:'Shoulders',cue:'Match slope. Lead shoulder lower.',why:'Parallel shoulders = clean contact down the slope.'},
    {label:'Ball',cue:'Slightly back. Catch it before the downslope.',why:'Downhill moves the low point back. Ball back catches it clean.'},
    {label:'Expect',cue:'Low trajectory. Plan for extra run.',why:'Delofted club + downhill = bullet. Ball will run after landing.'}
  ]
},
'grn_bnk_clean+lip': {
  smartText:'max loft. Open face WIDE. Steep swing. Height is the only goal.',
  heroText:'over a high lip AND close to the pin. Extreme loft required.',
  heroDanger:'Hit the lip = ball rolls back to your feet in the bunker. Use way more loft.',
  setup:[
    {label:'Club',cue:'Most lofted club in your bag. Lob wedge if you have one.',why:'Lip is ALWAYS taller from below. You need every degree of loft.'},
    {label:'Face',cue:'Open WIDE. Face aims at the sky.',why:'Maximum loft gets ball UP fast. Over the lip. That\'s the only mission.'},
    {label:'Swing',cue:'Full, steep, aggressive. Hard into the sand.',why:'Need speed to get the height. Soft swing = not enough height = lip.'},
    {label:'Aim',cue:'Anywhere on the green. Height is priority.',why:'Don\'t think about the pin. Think about clearing the lip. Pin is bonus.'}
  ]
},
'grn_bnk_plugged+lip': {
  smartText:'extreme difficulty. Square face, slam sand, hope it clears. Take the penalty if needed.',
  heroText:'somehow clear the lip from a plugged lie. Pray.',
  heroDanger:'Plugged ball behind a high lip may be unplayable. Consider taking a drop.',
  setup:[
    {label:'Reality',cue:'Assess if this is actually possible.',why:'Plugged ball comes out LOW. High lip requires HIGH. These contradict each other.'},
    {label:'Face',cue:'Slightly open. Compromise between dig and loft.',why:'Square digs under ball (good for plugged) but doesn\'t give height (bad for lip).'},
    {label:'Swing',cue:'Maximum force straight down into sand.',why:'Only chance is blasting it hard enough to pop it up over the lip.'},
    {label:'Option',cue:'Consider playing sideways or taking unplayable.',why:'One penalty stroke beats three failed attempts at an impossible shot.'}
  ]
},
'chipping+dn_lie': {
  smartText:'swing down WITH the slope. Weight forward. Ball will run. Plan for it.',
  heroText:'run it down the hill to the pin. Speed control is everything.',
  heroDanger:'Downhill chips always roll further than you expect. Always.',
  setup:[
    {label:'Club',cue:'Less loft. PW or 9-iron. Let it run.',why:'Ball flies lower off a downslope. Less loft = more roll control.'},
    {label:'Weight',cue:'Into the slope. Front foot. Stay there.',why:'Weight back on a downhill chip = blade it across the green.'},
    {label:'Shoulders',cue:'Match the slope. Swing DOWN the hill.',why:'Fighting the slope causes chunks. Go with it.'},
    {label:'Speed',cue:'HALF the speed you think. Gravity adds the rest.',why:'Downhill chips run. A lot. Under-hit it. Seriously.'},
    {label:'Alternative',cue:'Consider putting if fringe allows it.',why:'Scottie Scheffler putts from downhill lies when possible. Simpler and safer.'}
  ]
},
'chipping+up_lie': {
  smartText:'ball will fly higher and stop quicker. Aim past the hole.',
  heroText:'launch it high and land it soft near the pin.',
  heroDanger:'Uphill chips stop fast. You might leave it short.',
  setup:[
    {label:'Ball',cue:'Slightly forward. Match the upslope.',why:'Uphill moves the effective ball position back. Compensate by moving it forward.'},
    {label:'Club',cue:'Less loft than normal. Slope adds loft for you.',why:'Hill acts as a launch pad. Your PW plays like a SW from an uphill lie.'},
    {label:'Speed',cue:'Firmer than flat. Hill absorbs energy.',why:'Ball stops faster going uphill. Hit it a little harder to compensate.'},
    {label:'Shoulders',cue:'Match the slope. Swing UP the hill.',why:'Parallel shoulders = clean contact. Fighting the slope = fat shot.'}
  ]
},
'chipping+below_ft': {
  smartText:'widen stance. Bend knees. Ball will fade right on landing.',
  heroText:'hold the chip on line despite the sidehill.',
  heroDanger:'Below feet chip = reaching for ball = easy to skull it.',
  setup:[
    {label:'Stance',cue:'Wider. More knee bend. Stay down.',why:'Ball is below your normal plane. Need to get lower to reach it cleanly.'},
    {label:'Aim',cue:'Slightly left. Ball fades right on landing.',why:'Sidehill affects roll just like a putt. Plan for the ball to drift right.'},
    {label:'Grip',cue:'End of club. Need the length.',why:'Don\'t choke down on a below-feet chip. You need maximum reach.'},
    {label:'Posture',cue:'Stay in your posture through impact. Do NOT stand up.',why:'Standing up = blade it. Stay down until ball is gone.'}
  ]
},
'chipping+above_ft': {
  smartText:'grip down. Ball will draw left on landing.',
  heroText:'control the draw chip to a tight pin.',
  heroDanger:'Above feet chip = ball draws left. Aim right of target.',
  setup:[
    {label:'Grip',cue:'Down 1-2 inches. Ball is closer to you.',why:'Not gripping down = fat shot into the hill. Grip down, stand taller.'},
    {label:'Aim',cue:'Right of target. Ball will draw left.',why:'Slope closes the face slightly. Ball draws on the ground too.'},
    {label:'Stance',cue:'Stand taller. Less knee bend.',why:'Ball is higher. Match your height to the ball, not the other way around.'},
    {label:'Swing',cue:'Normal chip motion. Don\'t get complicated.',why:'Setup changes handle the slope. Swing stays the same.'}
  ]
},
'putting+up_lie': {
  smartText:'uphill putt. Hit it firm. Can\'t hurt yourself.',
  heroText:'charge it. Uphill comebacker is a tap-in.',
  heroDanger:'Leaving an uphill putt short is the biggest waste in golf. Hit it.',
  setup:[
    {label:'Speed',cue:'FIRM. You cannot hit this too hard.',why:'Uphill putts die fast. Even 3 feet past is an easy comebacker.'},
    {label:'Break',cue:'Less break than you read. Fast ball = straighter.',why:'You\'re hitting this firm. Firm balls break less. Play less break.'},
    {label:'Mental',cue:'This is the putt you WANT. Be aggressive.',why:'There\'s almost no downside. Uphill = safety net. Attack.'}
  ]
},
'putting+dn_lie': {
  smartText:'barely touch it. Gravity is doing 80% of the work.',
  heroText:'die it at the hole. Perfect speed.',
  heroDanger:'Hit this too hard and it\'s 6 feet past. Downhill coming back. Nightmare.',
  setup:[
    {label:'Speed',cue:'BARELY touch it. Shortest backswing possible.',why:'Gravity accelerates the ball after you hit it. You\'re just starting the roll.'},
    {label:'Break',cue:'WAY more break than you see. Ball is moving slow = more curve.',why:'Slow-moving ball takes every inch of break. Double your read.'},
    {label:'Mental',cue:'Don\'t be afraid to leave it short. 2-foot uphill = easy.',why:'Short is better than 6-foot downhill comebacker. Take the safe two-putt.'}
  ]
},
'putting+below_ft': {
  smartText:'ball will break RIGHT. Aim left of hole.',
  heroText:'hold the high line. Trust speed and commit.',
  heroDanger:'Under-reading this break is the most common amateur mistake.',
  setup:[
    {label:'Aim',cue:'LEFT of hole. Ball breaks RIGHT.',why:'Gravity pulls ball toward low side. Low side is right when ball is below feet.'},
    {label:'Break',cue:'More than you think. Seriously. Then add more.',why:'Every study shows amateurs under-read break by 60%. Aim higher.'},
    {label:'Stance',cue:'Widen slightly. Lean into the uphill side.',why:'Sidehill stance affects your stroke path. Compensate with wider base.'}
  ]
},
'putting+above_ft': {
  smartText:'ball will break LEFT. Aim right of hole.',
  heroText:'hold the line. Trust the read.',
  heroDanger:'Same as any break — you\'re almost certainly under-reading it.',
  setup:[
    {label:'Aim',cue:'RIGHT of hole. Ball breaks LEFT.',why:'Gravity pulls ball left toward low side.'},
    {label:'Break',cue:'More than you see. Double it.',why:'Amateurs under-read. Always. When in doubt, more break.'},
    {label:'Grip',cue:'Slightly down. Ball is closer.',why:'Don\'t chunk the green. Grip down to match the ball height.'}
  ]
},
'water_front_over+wind_face': {
  smartText:'into the wind over water. Need EXTRA margin. Club way up.',
  heroText:'fight the wind over water. Full commit or don\'t try.',
  heroDanger:'Wind + water = the hardest carry in golf. Club up more than you think.',
  setup:[
    {label:'Club',cue:'THREE clubs of margin. Wind kills carry.',why:'Wind into your face + water in front = need massive margin. Club way up.'},
    {label:'Swing',cue:'Smooth. DO NOT swing harder into wind.',why:'Harder swing = more spin = ball balloons = falls SHORT. More club, smoother swing.'},
    {label:'Decide',cue:'If it\'s even questionable, LAY UP.',why:'Wind over water magnifies every mistake. If you\'re not sure, you don\'t carry it.'}
  ]
},
'water_front_over+wind_back': {
  smartText:'downwind over water helps. Club DOWN. Ball will carry further.',
  heroText:'downwind over water. Favorable conditions. Attack.',
  heroDanger:'Downwind can carry ball OVER the green. Club down.',
  setup:[
    {label:'Club',cue:'Club DOWN one. Wind adds distance to the carry.',why:'Downwind pushes ball further. Don\'t overshoot the green.'},
    {label:'Carry',cue:'You\'re more likely to clear. Check margin anyway.',why:'Wind helps but isn\'t guaranteed. Still need carry margin.'},
    {label:'Roll',cue:'Ball rolls more downwind. Aim shorter.',why:'Less backspin downwind = more roll on landing. Aim for front of green.'}
  ]
},
'water_crossing+wind_face': {
  smartText:'worst case. Into wind over must-carry water. Need huge margin.',
  heroText:'send it into the wind over crossing water. Total commitment.',
  heroDanger:'If you can\'t carry it with 3 clubs of margin, go sideways. Period.',
  setup:[
    {label:'Club',cue:'THREE clubs margin. Maybe four.',why:'Wind kills carry distance. Crossing water = no layup option. Must carry.'},
    {label:'Swing',cue:'SMOOTH. Let the club do the work.',why:'Swinging harder into wind creates spin. Spin makes ball balloon and fall short. Into water.'},
    {label:'Decide',cue:'Sideways might cost one shot. Water costs two.',why:'Go around if the carry isn\'t comfortable. Smart golf.'}
  ]
},
'water_left+wind_cross_l': {
  smartText:'wind pushing toward water. Aim FURTHER right. Maximum cushion.',
  heroText:'hold against the wind with water left. Requires precise aim.',
  heroDanger:'Crosswind from left pushes ball LEFT. Water is left. Aim way right.',
  setup:[
    {label:'Aim',cue:'Well RIGHT of target. Wind pushes left toward water.',why:'Wind + water on same side = double danger. Over-compensate with aim.'},
    {label:'Grip',cue:'Light. Don\'t guide. Don\'t steer.',why:'Steering against wind causes the exact pulls you\'re trying to avoid.'},
    {label:'Club',cue:'Account for wind push in club selection.',why:'Crosswind adds distance to the side. Your straight shot ends up left in water.'}
  ]
},
'water_right+wind_cross_r': {
  smartText:'wind pushing toward water right. Aim FURTHER left.',
  heroText:'hold against rightward wind with water right. Precise.',
  heroDanger:'Crosswind from right + water right = danger zone. Aim well left.',
  setup:[
    {label:'Aim',cue:'Well LEFT. Wind pushes right toward water.',why:'Same-side wind and water = double danger. Over-aim left.'},
    {label:'Swing',cue:'Free and smooth. Do NOT tighten up.',why:'Tightening up causes pushes and slices. Both go right. Right is water.'},
    {label:'Club',cue:'Account for wind push.',why:'Wind adds lateral distance. Your straight shot drifts into hazard.'}
  ]
},
'bare_dirt+dn_lie': {
  smartText:'ball way back. Hit DOWN firmly. Ball comes out low and hot.',
  heroText:'control shot from hardpan on a downslope. Expert-level difficulty.',
  heroDanger:'Fat shot on downhill hardpan = club bounces = blade it. Zero forgiveness.',
  setup:[
    {label:'Ball',cue:'WAY back. Off back foot.',why:'Downhill + bare dirt = two reasons to move ball back. Low point changes twice.'},
    {label:'Weight',cue:'Into the slope. Front foot heavy.',why:'Gravity wants to push you forward. Let it. It\'s where you need to be.'},
    {label:'Swing',cue:'Firm, descending blow. Don\'t try to help it.',why:'Ball-first is life or death on bare dirt. Downhill makes it even more critical.'},
    {label:'Expect',cue:'Lowest trajectory possible. Plan for massive run.',why:'Delofted club + downhill + hardpan = laser beam. Ball runs forever.'}
  ]
},
'bare_dirt+up_lie': {
  smartText:'uphill on hard ground. Ball goes higher than expected. Club up.',
  heroText:'launch it off the uphill hard pan. Clean contact required.',
  heroDanger:'Uphill bare dirt = height without distance. Take more club.',
  setup:[
    {label:'Shoulders',cue:'Match the slope. Right shoulder lower.',why:'Parallel shoulders = clean contact on hardpan. Essential.'},
    {label:'Club',cue:'One more. Height costs distance.',why:'Uphill adds loft. Ball goes higher and shorter. Compensate.'},
    {label:'Contact',cue:'Ball first. THEN ground.',why:'Hard ground doesn\'t forgive. Fat = bounce = skull.'},
    {label:'Aim',cue:'Right of target. Uphill pulls left.',why:'Uphill lie promotes a draw. Ball goes left.'}
  ]
},
'lt_rough+dn_lie': {
  smartText:'ball comes out lower with less spin. Plan for extra run.',
  heroText:'downhill from light rough. Manageable. Commit to it.',
  heroDanger:'Light rough + downhill is not that different from downhill fairway. Don\'t overthink it.',
  setup:[
    {label:'Ball',cue:'Slightly back. Match the slope.',why:'Downhill moves the low point back. Ball back catches it clean.'},
    {label:'Shoulders',cue:'Match slope. Lead shoulder lower.',why:'Swing along the hill for clean contact.'},
    {label:'Club',cue:'Down one. Ball flies lower, runs more.',why:'Downhill delofts. Ball goes further. Take less club.'},
    {label:'Aim',cue:'Left of target. Ball pushes right from downhill.',why:'Slope opens face through impact. Ball leaks right.'}
  ]
},
'lt_rough+up_lie': {
  smartText:'ball goes higher, stops faster. Club up one.',
  heroText:'attack from uphill light rough. Good opportunity.',
  heroDanger:'Extra height from uphill = might come up short. Take more club.',
  setup:[
    {label:'Club',cue:'One more than normal. Height costs distance.',why:'Uphill + rough = shorter shot. Compensate with extra club.'},
    {label:'Shoulders',cue:'Match slope. Swing along the hill.',why:'Parallel to slope = clean contact.'},
    {label:'Aim',cue:'Right of target. Uphill promotes a draw.',why:'Ball will pull left. Aim right.'},
    {label:'Expect',cue:'Ball stops dead on landing. No roll.',why:'High trajectory from uphill = soft landing = zero roll.'}
  ]
},
'fairway+up_lie': {
  smartText:'clean lie, uphill. Club up one. Ball flies higher and stops dead.',
  heroText:'attack pin from uphill fairway. Extra height = soft landing.',
  heroDanger:'Uphill fairway is one of the easier uneven lies. Don\'t overthink it.',
  setup:[
    {label:'Club',cue:'One more. Slope adds loft.',why:'7-iron from uphill plays like an 8-iron in distance. Club up.'},
    {label:'Shoulders',cue:'Match the slope. Right shoulder lower.',why:'Tilting WITH slope is the key adjustment. Everything else stays the same.'},
    {label:'Aim',cue:'Right of target. Ball draws left from uphill.',why:'Uphill lie closes face slightly. Ball curves left.'},
    {label:'Weight',cue:'Into the slope. Lean toward low foot.',why:'Gravity pulls you back. Fight it by pressing forward into the hill.'}
  ]
},
'fairway+dn_lie': {
  smartText:'club down one. Ball flies lower, runs more. Aim left.',
  heroText:'controlled shot from downhill fairway. Trust the setup.',
  heroDanger:'Downhill fairway = lower trajectory, more distance. Take less club.',
  setup:[
    {label:'Club',cue:'Down one. Slope delofts, adds distance.',why:'7-iron plays like a 6-iron from downhill. Extra distance from lower flight.'},
    {label:'Ball',cue:'Slightly back. Match the slope.',why:'Downhill moves low point back. Ball back ensures clean contact.'},
    {label:'Shoulders',cue:'Match slope. Lead shoulder lower.',why:'Swing DOWN the hill for clean contact. Don\'t fight the slope.'},
    {label:'Aim',cue:'Left. Ball pushes right from downhill.',why:'Downhill opens face through impact. Ball fades right.'},
    {label:'Weight',cue:'75% front foot. Stay over the ball.',why:'Weight must stay downhill. Shifting back = fat shot.'}
  ]
},
'fairway+below_ft': {
  smartText:'widen stance. Bend knees more. Aim LEFT. Ball fades right.',
  heroText:'hold the line from a hanging lie. Maintain posture.',
  heroDanger:'Standing up through impact = skulled shot. Stay in your posture.',
  setup:[
    {label:'Stance',cue:'WIDEN. Sit into knees like a barstool.',why:'Ball is below you. Need stability and reach. Wide + bent = both.'},
    {label:'Grip',cue:'Full length. End of club for max reach.',why:'Don\'t choke down when reaching for a ball below your feet.'},
    {label:'Aim',cue:'LEFT. Ball WILL fade/push right. Guaranteed.',why:'Below feet opens face. Fade is inevitable. Aim left to compensate.'},
    {label:'Posture',cue:'Stay in your posture through impact.',why:'Biggest mistake: standing up. Causes skulled shots. Stay bent.'}
  ]
},
'fairway+above_ft': {
  smartText:'grip down. Stand taller. Aim RIGHT. Ball draws left.',
  heroText:'control the draw from an elevated lie.',
  heroDanger:'Not gripping down enough = fat shot into the hill.',
  setup:[
    {label:'Grip',cue:'Down 1-2 inches. Ball is closer to you.',why:'Ball above feet = shorter effective distance. Grip down to match.'},
    {label:'Aim',cue:'RIGHT. Ball WILL draw/hook left.',why:'Slope closes face. Hook is the natural result. Aim right.'},
    {label:'Stance',cue:'Stand taller. Less knee bend.',why:'Ball is higher. Match your height to the ball position.'},
    {label:'Swing',cue:'More around your body. Flatter feel.',why:'Slope changes the swing plane. Let it. Don\'t fight it.'}
  ]
},
'trees_punch+dn_lie': {
  smartText:'low punch from downhill. Ball stays even lower. Use widest gap.',
  heroText:'screaming low runner from downhill through trees.',
  heroDanger:'Downhill punch comes out like a bullet. Make sure the gap is wide.',
  setup:[
    {label:'Ball',cue:'Way back. Off back foot.',why:'Both conditions want ball back. Way back ensures low, clean contact.'},
    {label:'Swing',cue:'Half swing. Low finish. Chase ball down the hill.',why:'Low finish keeps ball low. Downslope keeps it lower. Running fast.'},
    {label:'Gap',cue:'Widest possible opening.',why:'Ball is coming out hot and low. Need maximum clearance.'},
    {label:'Weight',cue:'Front foot. Into the slope.',why:'Downhill wants weight forward. Punch wants weight forward. Both agree.'}
  ]
},
'trees_punch+up_lie': {
  smartText:'punch from uphill. Ball comes out higher than normal punch. Aim lower.',
  heroText:'stinger up the hill through the gap. Ball will rise more.',
  heroDanger:'Uphill adds height to your punch. Check branch clearance above too.',
  setup:[
    {label:'Ball',cue:'Further back than normal. Compensate for uphill loft.',why:'Uphill adds loft. Moving ball back takes loft off. Keeps ball low.'},
    {label:'Swing',cue:'More aggressive. Hill absorbs energy.',why:'Uphill saps power. Need to swing harder to advance the ball.'},
    {label:'Check',cue:'Look UP. Uphill punch goes higher than flat punch.',why:'Ball might clear ground trees but hit overhead branches. Check clearance.'}
  ]
},
'trees_over+dn_lie': {
  smartText:'very difficult. Downhill reduces loft. May not clear the tree. Consider sideways.',
  heroText:'over the tree from a downhill lie. Need extreme loft.',
  heroDanger:'Downhill delofts every club. Tree clearance becomes much harder.',
  setup:[
    {label:'Club',cue:'MOST lofted club. Downhill eats your loft.',why:'If your lob wedge is 60°, downhill might make it play like 50°. May not be enough.'},
    {label:'Assess',cue:'Can you actually clear it? Be honest.',why:'Downhill + trees over = extremely hard combo. Punch sideways might save a shot.'},
    {label:'If going',cue:'Ball forward. Weight back. Full swing.',why:'Same as flat "over" setup but with even more commitment to height.'}
  ]
}
},

// =============================================
// SLOPE/OBSTACLE MODIFIERS
// Append to base advice when no combo override exists
// =============================================
modifiers: {
up_lie: {
  ballMod:'SLOPE: Move ball slightly FORWARD — uphill moves low point forward.',
  weightMod:'SLOPE: Lean INTO the hill. Spine perpendicular to slope.',
  swingMod:'SLOPE: Tilt shoulders to MATCH slope. Swing ALONG the hill. Ball flies HIGHER, pulls LEFT.',
  aimMod:'SLOPE: Aim RIGHT. Club UP one — height costs distance. Ball stops dead on landing.',
  extra:'Uphill: club up, aim right, match shoulders to slope.'
},
dn_lie: {
  ballMod:'SLOPE: Move ball BACK — downhill moves low point backward.',
  weightMod:'SLOPE: Weight forward. Keep moving toward target through swing.',
  swingMod:'SLOPE: Match shoulders to slope. Chase ball DOWN the hill. Ball flies LOWER, pushes RIGHT.',
  aimMod:'SLOPE: Aim LEFT. Club DOWN one — lower flight rolls further.',
  extra:'Downhill: club down, aim left, low flight runs a lot.'
},
below_ft: {
  ballMod:'Keep ball center.',
  weightMod:'SLOPE: Weight on heels. WIDEN stance. Sit into knees.',
  swingMod:'SLOPE: Bend MORE from hips. Grip to END of club for reach. More up-and-down swing.',
  aimMod:'SLOPE: Aim LEFT — ball WILL fade/push RIGHT. Guaranteed.',
  extra:'Below feet: widen, bend, aim LEFT. Ball goes right.'
},
above_ft: {
  ballMod:'Keep ball center.',
  weightMod:'SLOPE: Weight on toes. Lean into uphill slope.',
  swingMod:'SLOPE: Stand TALLER. Grip DOWN 1-2 inches. Flatter, more around-body swing.',
  aimMod:'SLOPE: Aim RIGHT — ball WILL draw/hook LEFT.',
  extra:'Above feet: grip down, stand tall, aim RIGHT. Ball goes left.'
},
wind_face: {
  aimMod:'WIND: Into the wind. Club UP. Swing SMOOTH — don\'t swing harder. Harder = more spin = balloons.',
  extra:'Into wind: more club, smoother swing. NOT harder swing.'
},
wind_back: {
  aimMod:'WIND: Downwind. Club DOWN. Ball flies further and rolls more.',
  extra:'Downwind: less club, expect extra distance and roll.'
},
wind_cross_l: {
  aimMod:'WIND: Crosswind from left pushes ball RIGHT. Aim LEFT to compensate.',
  extra:'Wind from left pushes right. Aim left.'
},
wind_cross_r: {
  aimMod:'WIND: Crosswind from right pushes ball LEFT. Aim RIGHT.',
  extra:'Wind from right pushes left. Aim right.'
},
rain: {
  swingMod:'RAIN: Grip firmly — rain makes grip slippery. Ball flies lower, runs more. Less spin from wet grass.',
  extra:'Rain: firmer grip, less spin, more run. Wet greens hold approach shots.'
}
},

// =============================================
// ADVICE MERGE ENGINE — checks combos first
// =============================================
mergeAdvice(baseKey, activeConditions, windState, windDir, isRaining, hand) {
  // Check combination overrides FIRST
  for (const cond of activeConditions) {
    const comboKey = baseKey + '+' + cond;
    if (this.combos[comboKey]) {
      const combo = { ...this.combos[comboKey] };
      // Still apply wind/rain modifiers
      const extras = [];
      if (windState > 0) {
        let wm = null;
        if (windDir === 'In Face') wm = this.modifiers.wind_face;
        else if (windDir === 'At Back') wm = this.modifiers.wind_back;
        else if (windDir === 'Cross Left') wm = this.modifiers.wind_cross_l;
        else if (windDir === 'Cross Right') wm = this.modifiers.wind_cross_r;
        if (wm && wm.extra) extras.push(wm.extra);
      }
      if (isRaining && this.modifiers.rain.extra) extras.push(this.modifiers.rain.extra);
      combo.extras = extras;
      // Flip for lefty
      if (hand === 'left') {
        for (const key of ['smartText','heroText','heroDanger']) {
          if (combo[key]) combo[key] = this.flipDirections(combo[key]);
        }
        if (combo.setup) combo.setup.forEach(s => {
          if (s.cue) s.cue = this.flipDirections(s.cue);
          if (s.why) s.why = this.flipDirections(s.why);
        });
        extras.forEach((e, i) => { extras[i] = this.flipDirections(e); });
      }
      return combo;
    }
  }

  // No combo override — use standard merge
  const base = this.base[baseKey] || this.base._default;
  const result = {
    smartText: base.smartText,
    heroText: base.heroText,
    heroDanger: base.heroDanger,
    setup: base.setup ? JSON.parse(JSON.stringify(base.setup)) : [],
  };
  const extras = [];

  // Apply slope modifiers — append extra setup cues
  for (const cond of activeConditions) {
    const mod = this.modifiers[cond];
    if (mod) {
      if (mod.extra) extras.push(mod.extra);
      // Add slope cue to setup if not already a combo
      if (mod.aimMod) result.setup.push({label:'Slope',cue:mod.extra||mod.aimMod,why:mod.aimMod});
    }
  }

  // Wind modifier
  if (windState > 0) {
    let windMod = null;
    if (windDir === 'In Face') windMod = this.modifiers.wind_face;
    else if (windDir === 'At Back') windMod = this.modifiers.wind_back;
    else if (windDir === 'Cross Left') windMod = this.modifiers.wind_cross_l;
    else if (windDir === 'Cross Right') windMod = this.modifiers.wind_cross_r;
    if (windMod) {
      if (windMod.extra) extras.push(windMod.extra);
    }
  }

  // Rain
  if (isRaining) {
    const rm = this.modifiers.rain;
    if (rm.extra) extras.push(rm.extra);
  }

  // Flip for lefty
  if (hand === 'left') {
    for (const key of ['smartText','heroText','heroDanger']) {
      if (result[key]) result[key] = this.flipDirections(result[key]);
    }
    if (result.setup) result.setup.forEach(s => {
      if (s.cue) s.cue = this.flipDirections(s.cue);
      if (s.why) s.why = this.flipDirections(s.why);
    });
    extras.forEach((e, i) => { extras[i] = this.flipDirections(e); });
  }

  result.extras = extras;
  return result;
},

flipDirections(text) {
  if (!text) return text;
  return text
    .replace(/\bLEFT\b/g,'%%RIGHT%%').replace(/\bRIGHT\b/g,'%%LEFT%%')
    .replace(/\bleft\b/g,'%%right%%').replace(/\bright\b/g,'%%left%%')
    .replace(/\(right-handers\)/g,'(left-handers)').replace(/\(right-handed\)/g,'(left-handed)')
    .replace(/%%RIGHT%%/g,'RIGHT').replace(/%%LEFT%%/g,'LEFT')
    .replace(/%%right%%/g,'right').replace(/%%left%%/g,'left');
},

// =============================================
// KICKERS — Expanded to 15+ per category
// Direct caddy voice. Human sidekick ending.
// =============================================
kickers: {
_default:[
'The boring shot is the one your scorecard likes best.',
'Two putts from the middle beats three from the fringe.',
'Solid contact. That\'s the whole assignment.',
'The safe shot is the one you forget by the 19th hole.',
'A smooth swing beats a hard swing 18 out of 18.',
'The best shot you hit today will feel easy.',
'Aim small, miss small.',
'Trust your yardages. Swing smooth.',
'Pick a specific target. Not "the green." A spot.',
'Tension kills the swing. Grip light.',
'Center green. Every time.',
'Nobody ever birdied a shot they overthought.',
'Commit to the target. Not the outcome.',
'Simple swing, simple result. Complexity is the enemy.',
'The club does the work. Let it.'
],
tee_par3:[
'Perfect lie, big target. Don\'t overthink it.',
'Tee box can\'t trick you. The rest of the hole can.',
'Breathe. You chose this club for a reason.',
'The pin is a distraction. Green is the target.',
'Tee it, trust it, swing smooth.',
'Center green counts the same as pin high.',
'A two-putt par from center green is still a par.',
'Every par 3 green has a middle. That\'s your spot.',
'This is the best lie all hole. Use it.',
'Smooth tempo off a perfect lie. What could go wrong.',
'Don\'t complicate the simplest tee shot in golf.',
'The tee does the work. You just swing.',
'If you\'re debating clubs, take more.',
'One putt from 30 feet happens. One putt from the bunker doesn\'t.',
'Pin sheets change daily. The center of the green never moves.'
],
tee_par45:[
'The fairway is 35 yards wide. Find it.',
'You don\'t win holes on the tee. You lose them there.',
'Longer club goes further. Shorter club goes straighter.',
'3-Wood in fairway beats driver in trees. Every time.',
'Fairway, approach, two putts. That\'s a good hole.',
'Your partners don\'t remember your tee shot. They remember your score.',
'Safe play off the tee sets up everything next.',
'The most important shot on a par 4 finds the fairway.',
'Nobody ever said "I wish I\'d hit it further." Actually, nobody credible.',
'The fairway wins the hole. Not distance.',
'Grip light. Turn shoulders. Head down. That covers most of it.',
'This fairway is wider than it looks from the tee box.',
'Smooth tempo. The ball doesn\'t know you\'re on the tee.',
'The trees don\'t move. Hit it where they aren\'t.',
'A ball in play is worth two in the woods.'
],
fairway:[
'Clean lie. No excuses. Pick your spot.',
'Fairway shots are where scores are made.',
'You did the hard work finding this lie. Finish the job.',
'Pick your spot. Trust your club. Commit.',
'This is the reward for finding the fairway.',
'Clean lie, clean mind. You and the target.',
'Fairway iron to the green. This is golf.',
'Smooth swing from a perfect lie. Don\'t get cute.',
'Every good round has a fairway iron that finds the green.',
'The club was designed for this exact shot.',
'Pick a specific spot. Hit it there. Move on.',
'Clean contact from a clean lie. Golf at its simplest.',
'You earned this lie. Don\'t waste it overthinking.',
'The fairway rewards the player who found it.',
'Solid contact. That\'s all. The lie does the rest.'
],
lt_rough:[
'It\'s rough, not a crime scene. You\'re fine.',
'One club more. That\'s all the grass costs you.',
'First cut is basically a fairway with attitude.',
'Don\'t let grass grab your confidence.',
'Light rough is golf\'s way of saying "close enough."',
'One extra club and a committed swing. That\'s it.',
'Don\'t overthink light rough. Barely a penalty.',
'Swing through it. The grass loses.',
'Light rough forgives. Deep rough punishes. Be grateful.',
'Same swing, extra club, touch more speed. Done.',
'The rough adds three yards. Your ego adds ten.',
'A clean strike from the first cut plays almost the same.',
'One club more. Done. Next thought.',
'Light rough is a speed bump, not a wall.',
'Commit through impact. Grass quits when you don\'t.'
],
dp_rough:[
'Grass took your distance. Don\'t let it take your brain.',
'Get it out in one. Whole assignment.',
'Bogey from deep rough is a win. Accept it.',
'Aim right. Grass closes face. Every time.',
'Hero from deep rough = big numbers. Every time.',
'Club up. Swing hard. Aim right. That\'s the recipe.',
'Ball is sitting down. Your expectations should too.',
'Advance to fairway. That\'s winning from here.',
'Two shots to green from rough is fine. One that stays in rough is not.',
'The grass doesn\'t care about your swing speed.',
'Your ego wants the green. Your scorecard wants the fairway.',
'Advance it. That\'s the whole assignment.',
'Deep rough is golf\'s way of saying "not here."',
'Swing harder than you think. Grass eats everything.',
'Take your medicine. Live to play the next shot.'
],
bare_dirt:[
'Ball first. Dirt first = trouble.',
'Hard ground, hard truth: ball before ground.',
'No grass to save you. Precision or pain.',
'Ball back, hands forward, hit down. Three thoughts.',
'Fat shots on hard ground become thin shots over green.',
'Ball on concrete. Treat it that way.',
'Zero margin. Ball first is the only thought.',
'Hard pan rewards precision. Punishes everything else.',
'This lie separates golfers from ball hitters.',
'Clean contact from bare dirt is an achievement. Own it.',
'Down and through. The ground won\'t help you.',
'There\'s no grass between you and disaster. Be precise.',
'Ball first. Everything else is a prayer.',
'Hard pan doesn\'t care about your feelings. Hit down.',
'Precision shot from an unforgiving lie. Focus.'
],
fwy_bnk:[
'Ball first. Iron shot in a sandbox.',
'Grip down, dig in, ball first. Whole playbook.',
'Three-quarter swing. Control beats power in sand.',
'Sand before ball and you try again from same spot.',
'Every fairway bunker shot starts with: ball first.',
'Three-quarter from sand to green > full swing that stays.',
'Control the contact. Distance is secondary.',
'Sand is unstable. You shouldn\'t be.',
'Smooth from the bunker beats aggressive from the bunker.',
'The lip decides your club. Check it first.',
'Ball first. Then sand. In that order.',
'Quiet lower body. Upper body does the work here.',
'Getting out and advancing the ball is always a win.',
'Sand doesn\'t forgive fat shots. Neither will your score.',
'Clean contact from a fairway bunker is a great shot. Period.'
],
grn_bnk:[
'Hit the sand hard. It started this fight.',
'Sand does the work. You just need speed.',
'Slow down in a bunker and you stay in the bunker.',
'Bounce on your wedge was designed for this.',
'You\'re not hitting ball. You\'re hitting sand.',
'A bunker shot onto any part of green is a great shot.',
'Accelerate. That\'s the whole bunker thought.',
'Lip is always taller than you think.',
'Open, behind, through. That\'s the entire technique.',
'Sand launches the ball. Speed launches the sand.',
'Getting out is the only goal. Close is a bonus.',
'Decelerate in sand and the ball sends you a thank-you card.',
'Trust the bounce. That\'s literally what it\'s designed for.',
'Two inches behind. Not the ball. The sand behind the ball.',
'The bunker doesn\'t care if you\'re scared. Swing hard anyway.'
],
divot:[
'Someone else\'s divot, your problem.',
'Lower trajectory, more run. Aim short.',
'Steep and aggressive. That\'s divot golf.',
'Plan for run. Coming in hot and low.',
'Ball back, hands ahead, steep swing. Three moves.',
'The only way out is down and through.',
'Unlucky lie. Smart response. That\'s golf.',
'Steep angle removes loft. Plan for lower flight.',
'Divot lies reward commitment. Punish hesitation.',
'Punch it out. It\'ll run. Plan accordingly.',
'Down and through. Don\'t try to help it up.',
'The ball doesn\'t know it\'s in a divot. You do. Stay smooth.',
'Scoop from a divot = skull over the green. Hit down.',
'Someone left you a gift. Hit it forward.',
'Steep, firm, committed. That\'s the divot playbook.'
],
trees:[
'Sideways to fairway. One shot lost, not three.',
'Hero shot costs three strokes. Safe play costs one.',
'Trees are 90% air, but wood always wins.',
'Gap looks bigger from behind the ball.',
'Punch outs win tournaments. Hero shots win stories.',
'Ball in fairway > three in trees.',
'Bogey you can live with. Triple haunts you.',
'Every tree has been hit by someone who thought they could.',
'Take your medicine. Fairway in one shot.',
'The gap is smaller than it looks. It always is.',
'One shot sideways saves three shots of drama.',
'The tree doesn\'t move. Hit it where the tree isn\'t.',
'Punch to fairway = bogey. Through the trees = double minimum.',
'Your ego sees a gap. Your caddy sees a tree.',
'The forest doesn\'t negotiate.'
],
water:[
'Golf balls don\'t float. Two clubs margin or lay up.',
'Splash is louder than you think.',
'Crisp wedge from fairway beats wet long iron.',
'Slowing down over water = how balls learn to swim.',
'Ego says go. Math says lay up.',
'Two clubs margin over water. That\'s the rule.',
'Laying up costs one shot. Water costs two.',
'Full commit or lay up. No middle ground over water.',
'Water is mental. Your swing doesn\'t know it\'s there.',
'Tension over water kills distance. Exactly what you can\'t afford.',
'The caddy says more club. The caddy is right.',
'Your ball doesn\'t know there\'s water. Don\'t tell it.',
'Lay up to your favorite wedge distance. Not "short of water."',
'One penalty shot beats two. That\'s the water math.',
'Carry it with margin or don\'t carry it at all.'
],
lip:[
'Lip is non-negotiable. Clear it or repeat.',
'Get it OUT first. Close second.',
'More loft than you think. Always taller from down here.',
'Height first. Everything else is bonus.',
'Hit lip = ball rolls back to feet.',
'The lip doesn\'t look that high from up there. It\'s that high.',
'Maximum loft. Minimum ego.',
'If you think you need more loft, you need more loft.',
'Over the lip is the only goal. Everything else is bonus.',
'Steep swing, max loft, full commit. Or take a drop.',
'Lip is always taller from the bottom. Always.',
'Clear the lip and you\'re a hero. Hit it and repeat.',
'One shot out beats two shots trying.',
'Height. Height. Height. That\'s the whole thought.',
'The lip doesn\'t care how far you need to hit it. Clear it first.'
],
chipping:[
'Get ball on ground rolling ASAP.',
'Weight forward. Hands forward. Accelerate.',
'Landing spot first, then let it roll like a putt.',
'Decelerating is the #1 chipping mistake.',
'Less loft when you can. More when you must.',
'Think of it as a putt with a hinge.',
'The ball wants to roll. Let it.',
'Short back, full commit through. That\'s chipping.',
'Rolling ball = control. Flying ball = hope.',
'Pick a spot. Land on it. Ball does the rest.',
'Front foot. Hands forward. That\'s the setup. Done.',
'The simpler the chip, the better the result.',
'Chip it like a putt. Simple, repeatable, boring.',
'A chip that rolls to 4 feet is better than one that flies to 2.',
'Get it on the green. Two putts. Move on.'
],
putting:[
'Speed dictates line. Pace first.',
'Head down. Listen for it.',
'Rock shoulders. Nothing else moves.',
'2 feet past on a miss = right speed.',
'Wrists dead still. Shoulders only.',
'Two putts from anywhere is never bad.',
'See the line. Trust the line. Roll it on the line.',
'Same routine every time. That\'s what makes putts.',
'Speed, speed, speed. Then line.',
'The hole is 4 inches wide. That\'s massive.',
'Smooth back, smooth through. Same speed both ways.',
'Listen for it. Don\'t watch for it.',
'Confidence makes more putts than technique.',
'Pick your line. Commit to your speed. Let go.',
'Every putt is straight. You just aim at a different spot.'
],
up_lie:[
'Hill is eating distance. Feed it an extra club.',
'Lean into slope. Match it.',
'Shoulders match slope. That\'s the entire thought.',
'Club up. Zero roll on landing.',
'Ball goes higher and left. Aim right, club up.',
'The hill is a launch pad. Extra club, aim right.',
'Uphill lies add loft. Loft costs distance. Compensate.',
'Match the slope. Don\'t fight it. Golf with gravity.',
'This is actually one of the easier uneven lies.',
'Ball stops dead uphill. Fly it all the way there.',
'Height is free from an uphill lie. Distance isn\'t.',
'Right shoulder lower. That\'s the only setup change.',
'Don\'t try to help the ball up. The hill does that.',
'Extra club and a smooth swing. Uphill is manageable.',
'Lean into the hill. Swing along it. Simple.'
],
dn_lie:[
'Low and running. Aim short.',
'Gravity is undefeated.',
'Coming out hot and low. Plan for run.',
'Club down. Slope adds distance you didn\'t ask for.',
'Ball runs 20% further than expected.',
'Match the slope. Don\'t fight it.',
'Downhill takes loft away. Ball comes out lower.',
'Shoulders parallel to slope. That\'s the key.',
'Low trajectory, more distance, ball leaks right.',
'Stay over it. Don\'t fall back up the hill.',
'Three-quarter swing. Control matters more than power here.',
'This lie punishes casting. Stay compact.',
'Ball back, weight forward, aim left. Downhill playbook.',
'The hill decides the trajectory. You decide the club.',
'Plan for run. Then plan for more run.'
],
below_ft:[
'Ball is going right. Aim left. That\'s the secret.',
'Widen. Bend. Aim left. Three words.',
'Fade is guaranteed. Plan for it.',
'Sit into it like a barstool.',
'Stay in your posture. Standing up skulls it.',
'Wider stance = stability. You need it here.',
'Ball below feet = longest reach shot. Full grip, wide stance.',
'Aim left. Ball goes right. Trust it.',
'Don\'t fight the fade. Ride it.',
'Knee flex is your friend on this lie.',
'The ball is lower than you think. Get down to it.',
'Maintain posture through impact. Don\'t stand up early.',
'Extra club. The fade costs a little distance.',
'Grip the end. Need every inch.',
'Uncomfortable lie. Comfortable miss is right side.'
],
above_ft:[
'Going left. Aim further right than comfortable.',
'Choke up, aim right, trust the draw.',
'Grip down so you don\'t chunk into the hill.',
'Free draw spin from slope. Use it — aim right.',
'The ball is closer to you. Grip down.',
'Stand taller. Swing flatter. Ball draws left.',
'More slope = more draw. Aim further right.',
'This lie gives you a free draw. Use it.',
'Grip down. Stand tall. Aim right. Three adjustments.',
'Ball above feet = natural draw. Don\'t fight it.',
'The slope closes your clubface. That\'s the draw.',
'Aim right of target. Trust the draw.',
'Not gripping down enough = fat shot into the hill.',
'Flatter swing feels weird. Trust it.',
'Grip down, aim right, and let the slope do its thing.'
]
},

// =============================================
// WELCOMES — 30 rotations
// =============================================
welcomes: [
{silver:'New round. Clean slate.',copper:'Same mistakes are optional.'},
{silver:'18 holes. One shot at a time.',copper:'Scorecard only remembers the total.'},
{silver:'Breathe. Grip light. Pick a target.',copper:'Everything else is noise.'},
{silver:'You brought the clubs.',copper:'Let\'s see who wins.'},
{silver:'Every hole starts at zero.',copper:'Keep it that way as long as possible.'},
{silver:'You don\'t have to be great today.',copper:'You just have to be smart.'},
{silver:'Good golf is boring golf.',copper:'Let\'s be boring together.'},
{silver:'The caddy is ready.',copper:'Are you?'},
{silver:'Grip light. Head down. Smooth tempo.',copper:'That covers about 80% of it.'},
{silver:'Your swing is your swing.',copper:'Your decisions are where we come in.'},
{silver:'Fairways and greens.',copper:'Everything else is optional.'},
{silver:'The course doesn\'t know your handicap.',copper:'Play smarter than your number.'},
{silver:'The course doesn\'t owe you anything.',copper:'Go earn it.'},
{silver:'Smooth tempo. Light grip. Specific target.',copper:'That\'s the whole game.'},
{silver:'Last round is history.',copper:'This one isn\'t written yet.'},
{silver:'Fairway first. Green second. Hole third.',copper:'In that order. Always.'},
{silver:'The ball goes where the club tells it.',copper:'The club goes where you tell it.'},
{silver:'Play the shot in front of you.',copper:'Not the one you wish you had.'},
{silver:'Nobody remembers the drive.',copper:'Everybody remembers the score.'},
{silver:'Trust the process.',copper:'The scorecard takes care of itself.'},
{silver:'One shot. One thought. One target.',copper:'Everything else is a distraction.'},
{silver:'Smart golf is simple golf.',copper:'Simple golf is good golf.'},
{silver:'Commit to every shot.',copper:'Even the boring ones. Especially the boring ones.'},
{silver:'Tension is the enemy.',copper:'Relax your hands. Relax your mind.'},
{silver:'Pick your target. Hit your target.',copper:'That\'s literally the game.'},
{silver:'The flag is optional.',copper:'The green is mandatory.'},
{silver:'Keep it in play.',copper:'Heroics are earned, not borrowed.'},
{silver:'Your caddy has one job.',copper:'Make sure you don\'t do something stupid.'},
{silver:'Every good round starts with a plan.',copper:'Every bad round starts with "I think I can reach it."'},
{silver:'The first tee is just a beginning.',copper:'The 18th is where it counts.'}
],

// =============================================
// CONFESSIONAL KICKERS — 12 per category
// =============================================
confessionalKickers: {
allSmart:[
'Zero hero shots. Zero drama. The caddy is impressed.',
'You listened every time. Rarer than you think.',
'All smart, all day. Boring golfer wins.',
'Perfect discipline. Caddy has nothing to complain about.',
'The caddy is speechless. In a good way.',
'You played the percentages every time. That\'s how it\'s done.',
'Not a single hero shot. Your ego took the day off.',
'Full discipline. Full round. Full respect.',
'The scorecard thanks you for your restraint.',
'Smart play, every shot. That\'s not common.',
'Zero drama. Maximum discipline. Caddy approved.',
'You played exactly like we asked. That almost never happens.'
],
someHero:[
'How\'d that work out?',
'The caddy tried to warn you.',
'Bold choices were made.',
'You asked then did the opposite. Classic.',
'Almost perfect discipline. Almost.',
'Mostly smart. Occasionally spicy.',
'A few hero moments. The caddy noticed.',
'Smart play with a side of ego.',
'You listened. Mostly.',
'The caddy\'s notes say "good round, some concerns."',
'Discipline with a asterisk.',
'Smart play dominant. Hero play memorable.'
],
manyHero:[
'Caddy is questioning your commitment.',
'Multiple hero attempts. Ego was in charge.',
'You asked a lot. Listened... less.',
'The gap between knowing and doing.',
'Your caddy needs a raise after that round.',
'The course won today. You know why.',
'Lots of consultation. Limited compliance.',
'Hero shots were the theme. Results were the plot twist.',
'The caddy talked. The ego talked louder.',
'If you already knew the answer, why did you ask?',
'Bold strategy. Let\'s see if it paid off.',
'The caddy is filing a formal complaint.'
],
lowUsage:[
'Everyone starts somewhere. Open the app more.',
'Imagine if you asked on every trouble shot.',
'One consultation. One smart decision. Build from there.',
'The caddy was here the whole time. Waiting.',
'Start asking. That\'s step one.',
'The caddy can\'t help if you don\'t ask.',
'More consultations = more smart decisions = lower scores.',
'Use the caddy. That\'s the whole point.'
]
},

flexKickers: {
perfect:[
'{smart} shots. {smart} times I listened. Discipline.',
'{smart} for {smart}. Ego took the day off. — Caddy Logic',
'Perfect discipline over {smart} shots. The caddy approves.',
'{smart} smart plays. Zero hero shots. Boring golf wins.',
'Listened to the caddy {smart} times. {smart} for {smart}. Math checks out.',
'{smart} shots. {smart} right decisions. That\'s how it\'s done.',
'Full discipline. {smart} shots consulted. {smart} smart.',
'Zero hero attempts in {smart} shots. Self-control is a skill.',
'{smart} for {smart}. The caddy is taking credit.',
'Discipline index: 100%. The caddy is impressed.'
],
withHero:[
'{total} shots. {smart} smart, {hero} hero. Caddy has notes.',
'Listened {smart} out of {total} times. No comment on the rest.',
'{total} consultations. {smart} smart. {hero} hero. Work in progress.',
'Discipline: {smart}/{total}. Hero attempts: {hero}. Room for improvement.',
'{smart} right decisions. {hero} questionable ones. Out of {total}.',
'{total} shots. Caddy was right {smart} times. Ego was right... still calculating.',
'Smart: {smart}. Hero: {hero}. Total: {total}. The math is honest.',
'{smart} smart plays. {hero} hero plays. The caddy remembers all of them.',
'Consulted {total} times. Followed advice {smart} times. Progress.',
'{total} shots. {smart} disciplined. {hero} adventurous. No comment.'
]
},

roasts: [
'Consulted Caddy Logic {total} times. Listened {smart}. Hero shot? Don\'t ask.',
'Caddy app said center green. I said pin. The bunker said hello.',
'"How\'d that work out?" is now my least favorite question.',
'Caddy Logic said lay up. I said "I can carry." The water said no.',
'{total} shots. Caddy was right {smart} times. My ego was right... still calculating.',
'Caddy said punch out. I went through the trees. Trees: 1. Me: 0.',
'Downloaded a caddy app. Ignored it {hero} times. Scored accordingly.',
'My caddy app said 7-iron. I said driver. The forest said "welcome back."',
'Caddy Logic: {smart} right answers. Me: {hero} wrong decisions.',
'Asked the caddy {total} times. Listened {smart}. Discipline index: pending.',
'Caddy app said smooth tempo. I said full send. Ball said "goodbye."',
'Consulted. Considered. Ignored. Regretted. — My Golf Summary.',
'Used Caddy Logic all round. Smart rate: {smart}/{total}. Caddy is filing grievance.',
'My discipline index has room for improvement. And a second opinion.',
'Caddy said "center green." I heard "center of the bunker."',
'If listening to my caddy was a sport, I\'d shoot an 83.',
'{total} shots consulted. {smart} times I listened. The other {hero} times are between me and the trees.',
'The caddy said lay up. I said hero. The scorecard said "told you so."',
'Smart plays: {smart}. Hero plays: {hero}. Regret plays: we don\'t count those.',
'Caddy Logic gave me the play. I gave it my best interpretation.'
],

everySwing: 'Grip light. Arms hang straight down. Pick a specific target. Feet, hips, shoulders parallel to target line. Head down. Smooth back, accelerate through. Finish your swing.',

privacyPolicy: 'Caddy Logic collects zero data. Everything stays on your device.\n\nNo accounts. No sign-ups. No tracking. No analytics. No ads. No data sold.\n\nYour club distances, shot history, and round data are stored locally on your phone. Clear your browser data and it\'s gone.\n\nWe don\'t know who you are, where you play, or what you shoot. By design.\n\nYour caddy, your data.',
termsOfService: 'Caddy Logic provides golf strategy suggestions for recreational use only.\n\nNot a substitute for professional instruction.\n\nNot approved for sanctioned tournament play per USGA Rule 4.3.\n\nUse at your own discretion.\n\nKnow the play. Make the call.',

confidence:{baseSmart:90,baseHero:55,penalties:{lt_rough:{s:-3,h:-5},dp_rough:{s:-12,h:-22},bare_dirt:{s:-5,h:-12},fwy_bnk:{s:-10,h:-20},grn_bnk:{s:-8,h:-15},divot:{s:-5,h:-10},up_lie:{s:-3,h:-5},dn_lie:{s:-5,h:-10},below_ft:{s:-8,h:-15},above_ft:{s:-5,h:-10},trees:{s:-10,h:-25},water:{s:-5,h:-18},lip:{s:-8,h:-20},wind_1:{s:-2,h:-3},wind_2:{s:-3,h:-6},wind_3:{s:-8,h:-14},rain:{s:-3,h:-5},long_club:{s:-3,h:-8}},min:8},

// =============================================
// HELPERS
// =============================================
getKicker(key){const p=this.kickers[key]||this.kickers._default;return p[Math.floor(Math.random()*p.length)];},
getWelcome(){return this.welcomes[Math.floor(Math.random()*this.welcomes.length)];},

// Smart club — NEVER driver off non-tee
findClub(bag,dist,isTee){
  const active=bag.filter(c=>c.on&&(isTee||!c.teeOnly)).sort((a,b)=>b.dist-a.dist);
  if(!active.length)return null;
  let best=null;
  for(let i=active.length-1;i>=0;i--){if(active[i].dist>=dist){best=active[i];break;}}
  if(!best)best=active[0];
  return best;
},

// Hero club — bold but not stupid. 1-2 clubs more aggressive. CAN use driver for punch stinger only.
findHeroClub(bag,smartClub,dist,isTee,isPunch){
  const active=bag.filter(c=>c.on&&(isTee||isPunch||!c.teeOnly)).sort((a,b)=>b.dist-a.dist);
  if(isPunch)return active[0]; // driver stinger for hero punch
  const smartIdx=active.findIndex(c=>c.name===smartClub.name);
  if(smartIdx>0)return active[smartIdx-1];
  return active[0];
},

// Layup calculator
findLayupClub(bag, distToGreen, bestWedgeDist) {
  const layupDist = distToGreen - bestWedgeDist;
  if (layupDist <= 0) return null;
  return this.findClub(bag, layupDist, false);
},

getBestWedgeDist(bag) {
  const active = bag.filter(c => c.on && !c.teeOnly).sort((a, b) => a.dist - b.dist);
  if (!active.length) return 80;
  return active.length > 1 ? active[1].dist : active[0].dist;
},

calcConfidence(conds,wind,rain,clubDist){
  let s=this.confidence.baseSmart,h=this.confidence.baseHero;
  for(const c of conds){const p=this.confidence.penalties[c];if(p){s+=p.s;h+=p.h;}}
  if(wind>=1){const wk='wind_'+wind;const p=this.confidence.penalties[wk];if(p){s+=p.s;h+=p.h;}}
  if(rain){s+=this.confidence.penalties.rain.s;h+=this.confidence.penalties.rain.h;}
  if(clubDist&&clubDist>=170){s+=this.confidence.penalties.long_club.s;h+=this.confidence.penalties.long_club.h;}
  return{smart:Math.max(this.confidence.min,Math.min(100,s)),hero:Math.max(this.confidence.min,Math.min(100,h))};
},

sortBag(bag){return bag.sort((a,b)=>b.dist-a.dist);},

getWindMod(speed,dir){
  if(speed===0)return 0;
  const w=this.windSpeeds[speed];
  if(dir==='In Face')return w.modFace;
  if(dir==='At Back')return w.modBack;
  return w.modCross;
},

isShortGame(yardage) { return yardage > 0 && yardage <= 60; },
isPutting(yardage) { return yardage > 0 && yardage <= 15; }
};

// =============================================
// EXPANSION — Additional base scenarios, combos, and kickers
// Merged into CL object after initial definition
// =============================================

// Additional base scenarios
Object.assign(CL.base, {
pine_straw: {
  smartText:'similar to bare dirt. Ball first, don\'t scoop. Ball may sit up or nestle down.',
  heroText:'attack from pine straw. Clean contact is possible if ball is sitting up.',
  heroDanger:'Pine needles slide. Feet can slip. Smooth, controlled swing.',
  setup:[
    {label:'Ball',cue:'Play it as it lies. Center or slightly back.',why:'Pine straw varies. If ball is sitting up, normal position. Nestled down, move it back.'},
    {label:'Feet',cue:'Test your footing. Needles are slippery.',why:'Feet sliding during the swing ruins everything. Make sure you\'re stable.'},
    {label:'Swing',cue:'Smooth. Don\'t try to kill it. Ball first.',why:'Pine straw is like bare dirt — hit behind it and the club skips.'},
    {label:'Club',cue:'Same as fairway distance. Pine straw doesn\'t cost much.',why:'Ball sitting on needles often flies fairly normal. Don\'t over-adjust.'}
  ]
},
wet_lie: {
  smartText:'ball in wet/muddy area. Grip firm, ball back, expect less spin.',
  heroText:'power through the wet lie. Clean contact from mud is expert-level.',
  heroDanger:'Mud on ball = unpredictable flight. Could go anywhere.',
  setup:[
    {label:'Ball',cue:'Slightly back. Need to catch ball before mud.',why:'Wet ground grabs the club. Ball back steepens angle to cut through.'},
    {label:'Grip',cue:'FIRM. Wet grips slip. Wet grass grabs club.',why:'Double whammy: slippery handle + grabbing turf. Firm grip handles both.'},
    {label:'Expect',cue:'Less spin. More run. Unpredictable curve if mud on ball.',why:'Mud between face and ball kills spin. Mud on one side = ball curves opposite.'},
    {label:'Club',cue:'One more. Wet conditions cost distance.',why:'Wet grass slows the club. Ball doesn\'t compress as cleanly.'}
  ]
},
against_collar: {
  smartText:'ball against fringe collar. Putt it or use hybrid to bump.',
  heroText:'chip from against the collar. Tricky but possible.',
  heroDanger:'Thin contact from the collar = ball races across green.',
  setup:[
    {label:'Option 1',cue:'PUTT. Firm stroke. Ball pops over the lip.',why:'Putting is the safest play. Firm enough to pop over the fringe edge.'},
    {label:'Option 2',cue:'Hybrid bump. Sole sits behind ball, bellied stroke.',why:'Hybrid\'s flat sole rides the fringe. Like a putt with a bigger club.'},
    {label:'Avoid',cue:'Don\'t try to chip with a wedge from here.',why:'Leading edge catches the collar lip. Skulls or fat shots.'},
    {label:'Setup',cue:'Hands forward. Stroke through. Don\'t decelerate.',why:'Same as any short-game shot. Forward hands, commit through.'}
  ]
},
under_tree: {
  smartText:'low branches overhead. Keep ball LOW. Punch with short iron.',
  heroText:'thread it low under branches and advance it max distance.',
  heroDanger:'Full swing = ball goes up = hits branches. Half swing only.',
  setup:[
    {label:'Club',cue:'Short or mid iron. 7-8 iron ideal.',why:'Lower-lofted club keeps ball lower. But you need enough loft to advance it.'},
    {label:'Ball',cue:'BACK in stance. Off back foot.',why:'Back position delofts the club. Ball stays low under branches.'},
    {label:'Swing',cue:'Half to three-quarter. LOW finish.',why:'Low finish = low ball. High finish = branches. Keep hands below waist.'},
    {label:'Check',cue:'Look at BRANCH HEIGHT. How high can the ball go?',why:'Walk to the branches. Hold your club up. Know your clearance before swinging.'}
  ]
},
cart_path: {
  smartText:'take relief if available. If not, play it like hardpan.',
  heroText:'hit off the cart path. Risky for your club and your wrists.',
  heroDanger:'Cart path can damage your club. Can also hurt your wrists from vibration. Take relief.',
  setup:[
    {label:'First',cue:'Check rules. You get FREE RELIEF from cart path.',why:'USGA rules allow a free drop within one club length of nearest relief point. Take it.'},
    {label:'If must',cue:'Treat like bare dirt. Ball back, hit down.',why:'Hard surface = club bounces. Same technique as hardpan.'},
    {label:'Club',cue:'Use an old club you don\'t mind scratching.',why:'Cart path will damage the sole of your club. Don\'t sacrifice your favorite iron.'},
    {label:'Wrists',cue:'Short, controlled swing. Impact is harsh.',why:'Vibration from hitting off pavement can hurt. Three-quarter swing max.'}
  ]
},
severe_stance: {
  smartText:'one foot way higher than the other. Widen stance, shorten swing.',
  heroText:'full shot from a severe slope. Balance is everything.',
  heroDanger:'Full swings from severe stances lose balance. Three-quarter max.',
  setup:[
    {label:'Stance',cue:'As WIDE as comfortable. Lower your center of gravity.',why:'Wide stance = stability. You need every bit of it.'},
    {label:'Swing',cue:'Three-quarter MAX. Prioritize balance.',why:'Full swing from a severe stance = falling over = mishit.'},
    {label:'Club',cue:'One or two more. Shorter swing = less distance.',why:'You\'re sacrificing swing length for balance. Extra club compensates.'},
    {label:'Grip',cue:'Adjust grip length to match the slope.',why:'Uphill foot side = grip down. Downhill foot side = full length.'}
  ]
}
});

// Additional combination overrides
Object.assign(CL.combos, {
'trees_around_l+below_ft': {
  smartText:'draw around tree from a hanging lie. Ball wants to fade but you need draw. Difficult.',
  heroText:'fight the hanging lie to draw it left. Expert shot.',
  heroDanger:'Below feet promotes fade. Draw requires inside-out. These conflict.',
  setup:[
    {label:'Reality',cue:'Conflicting lies. Below feet fades, draw goes left.',why:'The slope wants the ball right. The shot shape wants it left. Hard combo.'},
    {label:'Stance',cue:'Wide. Sit deep. Aim MORE right to account for slope.',why:'Over-compensate the body aim. Slope will try to flatten your draw.'},
    {label:'Commit',cue:'Full swing. Half-hearted = straight into tree.',why:'Need full speed for the curve. Tentative swings don\'t curve enough.'},
    {label:'Backup',cue:'Consider punching sideways instead.',why:'If the draw from below feet seems risky, safe play saves strokes.'}
  ]
},
'trees_around_r+above_ft': {
  smartText:'fade around tree from above-feet lie. Slope helps — natural fade from this lie.',
  heroText:'ride the natural fade around the tree. Slope is your friend here.',
  heroDanger:'Above feet promotes draw, which conflicts with fade. But less extreme than opposite.',
  setup:[
    {label:'Advantage',cue:'Slope wants to draw but fade setup counters it.',why:'The two forces partially cancel. Shot may fly straighter than expected.'},
    {label:'Aim',cue:'Left of tree as normal for fade. Account for draw tendency.',why:'Slope adds draw. Fade setup fights it. May need to aim further left.'},
    {label:'Grip',cue:'Down for the slope. Normal everything else.',why:'Grip down for above-feet. Don\'t over-complicate the rest.'}
  ]
},
'trees_over+up_lie': {
  smartText:'uphill helps! Ball launches higher off the slope. Good for clearing tree.',
  heroText:'use the uphill to launch it high and far over the tree.',
  heroDanger:'Ball goes very high from uphill. Check if TOO high = wind catches it.',
  setup:[
    {label:'Good news',cue:'Uphill ADDS launch. Easier to clear the tree.',why:'Slope acts as a launch pad. Ball goes higher than from a flat lie.'},
    {label:'Club',cue:'You might need LESS loft than flat. Slope adds loft.',why:'Don\'t double up on loft. Slope already helps with height.'},
    {label:'Shoulders',cue:'Match slope. Swing up the hill.',why:'Parallel shoulders let the slope do the launching. Don\'t fight it.'},
    {label:'Wind',cue:'High ball + wind = trouble. Check conditions.',why:'Very high shots are vulnerable to wind. Factor it in.'}
  ]
},
'lt_rough+below_ft': {
  smartText:'light rough from a hanging lie. Aim left, ball fades right, one extra club.',
  heroText:'hold the line from light rough below feet.',
  heroDanger:'Below feet + rough = slightly more fade. Not a disaster. Manage it.',
  setup:[
    {label:'Stance',cue:'Widen. Sit into knees.',why:'Need reach and stability. Rough adds resistance.'},
    {label:'Aim',cue:'LEFT. Ball fades right from below feet.',why:'Slope dominates the direction here. Rough is secondary.'},
    {label:'Club',cue:'One more. Rough + fade both cost distance.',why:'Two small penalties add up to one club difference.'}
  ]
},
'lt_rough+above_ft': {
  smartText:'light rough from ball above feet. Grip down, aim right, ball draws left.',
  heroText:'ride the draw from above-feet light rough.',
  heroDanger:'Above feet + rough both close the face. Aim further right than normal.',
  setup:[
    {label:'Grip',cue:'Down 1-2 inches.',why:'Ball is closer. Must grip down or fat shot into hill.'},
    {label:'Aim',cue:'RIGHT. Both conditions push ball left.',why:'Above feet = draw. Rough = closed face. Double left. Aim well right.'},
    {label:'Club',cue:'One more for the rough.',why:'Slope doesn\'t cost distance. Rough does. One extra club.'}
  ]
},
'bare_dirt+below_ft': {
  smartText:'hardpan from a hanging lie. Absolute precision required. Consider laying up.',
  heroText:'clean contact from hardpan below feet. Tour-level difficulty.',
  heroDanger:'Two of the hardest conditions combined. Fat = bounce = skull. Be conservative.',
  setup:[
    {label:'Stance',cue:'Wide and low. Maximum stability.',why:'Reaching down to bare dirt. Must be stable AND precise.'},
    {label:'Contact',cue:'Ball first. Only thought. Ball first.',why:'Hard ground + reaching = tiny margin. Ball first or disaster.'},
    {label:'Club',cue:'Consider punching with a shorter club.',why:'Three-quarter 8-iron > full 5-iron from this lie. Control wins.'},
    {label:'Aim',cue:'Left. Ball fades right from below feet.',why:'Standard below-feet adjustment still applies.'}
  ]
},
'bare_dirt+above_ft': {
  smartText:'hardpan from ball above feet. Grip down hard. Ball goes left.',
  heroText:'control the draw from hardpan above feet.',
  heroDanger:'Fat shot on hardpan above feet = club skips into ball. Thin shot. Grip down enough.',
  setup:[
    {label:'Grip',cue:'Down 2 inches. Ball is close and surface is hard.',why:'Not enough grip-down = sole hits ground first = bounce = skull.'},
    {label:'Aim',cue:'Right. Ball draws left from above feet.',why:'Slope closes face. Ball hooks left.'},
    {label:'Contact',cue:'Ball first. Clean, descending blow.',why:'Hard ground demands precision. No margin for fat shots.'}
  ]
},
'water_left+wind_cross_r': {
  smartText:'wind pushes ball AWAY from water left. Favorable conditions. Trust it.',
  heroText:'wind helping push ball right, away from water. Good conditions to attack.',
  heroDanger:'Wind is your friend here. Ball moves away from trouble. Play your normal shot.',
  setup:[
    {label:'Advantage',cue:'Wind pushes RIGHT. Water is LEFT. Wind helps.',why:'Crosswind from right moves ball away from the water hazard.'},
    {label:'Aim',cue:'Normal aim. Maybe even slightly at the water knowing wind pushes away.',why:'Don\'t over-compensate. Wind is doing the work.'},
    {label:'Swing',cue:'Normal, confident swing.',why:'Favorable conditions. Don\'t overthink it.'}
  ]
},
'water_right+wind_cross_l': {
  smartText:'wind pushes ball AWAY from water right. Favorable. Play your shot.',
  heroText:'wind helping push ball left, away from water. Attack.',
  heroDanger:'Wind is on your side here. Ball moves away from trouble.',
  setup:[
    {label:'Advantage',cue:'Wind pushes LEFT. Water is RIGHT. Wind helps.',why:'Crosswind from left moves ball away from the water.'},
    {label:'Aim',cue:'Normal or slightly toward the water. Wind corrects.',why:'Don\'t fight the wind. Let it help.'},
    {label:'Swing',cue:'Normal, confident swing.',why:'Good conditions. Play your game.'}
  ]
}
});

// =============================================
// EXPANDED KICKERS — doubling every category
// =============================================
const _xk = {
_default:[
'The scorecard doesn\'t have a column for style points.',
'Commit. That\'s the only swing thought.',
'The ball doesn\'t care what happened last hole.',
'Routine. Commit. Execute. Repeat.',
'One shot at a time. Literally.',
'If you\'re thinking about two things, you\'re thinking about one too many.',
'The target doesn\'t move. Your focus might.',
'Let the club do what it was designed to do.',
'Smooth is fast. Fast is smooth.',
'Commit to the shot. Not the result.',
'Play the shot you have, not the shot you want.',
'The simpler the thought, the better the swing.',
'Trust what you practiced.',
'Don\'t try to be perfect. Try to be committed.',
'One target. One club. One thought.'
],
tee_par3:[
'Green is 5,000 square feet. That\'s a huge target.',
'The tee is the easiest lie in golf. Don\'t waste it.',
'Pick your club. Trust your club. Hit your club.',
'Par 3s are won with club selection, not swing speed.',
'The hole is only 150 yards. Your 7-iron has been doing this your whole life.',
'Don\'t let a short hole make you short-change your routine.',
'Center green from 150 is closer than pin-high in the bunker.',
'This is the most controlled shot you\'ll hit all day.',
'Breathe. This hole is over in one swing if you commit.',
'The green has been there for decades. It\'ll be there when your ball arrives.',
'Your practice swing was perfect. Do that one again.',
'Iron off a tee. Golf\'s equivalent of a free throw.',
'Tempo doesn\'t know the hole number.',
'The pin moves. The center doesn\'t.',
'One good swing. That\'s all this hole requires.'
],
tee_par45:[
'Position A is the fairway. Everything else is Position B.',
'The fairway is the biggest target on this hole. Find it.',
'Your second shot thanks you for finding the fairway.',
'Fairway percentage is the stat that matters.',
'Swing smooth. You\'re not trying to impress anyone.',
'The ball knows what to do if you let the club work.',
'Width of the fairway > length of the drive.',
'Good drives are forgotten. Bad drives are remembered.',
'Tempo. Grip. Commit. Everything else is noise.',
'The scorecard doesn\'t measure carry distance.',
'Find the fairway and the hole opens up.',
'Nobody ever regretted finding the short grass.',
'Your driver wants to help. Just let it.',
'Fairway first. Distance is a bonus.',
'This shot sets up the next three. Make it count.'
],
fairway:[
'You found it. Now finish the job.',
'Clean lie. Clean thoughts. Clean swing.',
'The fairway rewards those who find it.',
'This is the lie you worked for. Execute.',
'Target. Club. Swing. That\'s the list.',
'Clean contact from a clean lie. Golf simplified.',
'You\'re standing in the fairway. Act like you belong here.',
'The green is waiting. Go find it.',
'This shot is why you hit it straight off the tee.',
'Fairway approach. This is your moment.',
'Trust the club you chose. Swing to the target.',
'The hard part is done. You\'re in the fairway.',
'Pick your spot. Commit. Smooth.',
'Fairway to green. That\'s the plan. Execute it.',
'Your best swing of the day will come from a clean lie.'
],
lt_rough:[
'First cut of rough. Basically VIP seating.',
'The rough is trying to scare you. Don\'t let it.',
'One club difference between here and the fairway.',
'Light rough is golf saying "you were close."',
'Extra club. Extra commitment. Same result.',
'Barely in the rough. Barely a penalty.',
'The grass cost you three yards. Not the hole.',
'Treat it like a fairway with a little attitude.',
'Don\'t adjust your confidence. Just your club.',
'First cut forgives. Second cut doesn\'t.',
'Almost fairway. Almost doesn\'t count. Almost.',
'The rough adds yards. Your brain adds fear. Only one matters.',
'One club more handles the grass. Smooth swing handles the rest.',
'Light rough is a minor inconvenience, not a crisis.',
'You\'re three yards from the fairway. Relax.'
],
dp_rough:[
'Get out. That\'s the whole plan.',
'Deep rough turns heroes into triple bogeys.',
'Club up. Expectations down.',
'The grass is going to fight you. Fight back harder.',
'Sometimes the best shot is sideways.',
'Get back to the fairway. Heroics are for later.',
'Bogey from here is a good score. Accept it.',
'The rough doesn\'t care about your handicap.',
'Swing hard. Grip hard. Aim right.',
'Advance the ball. Everything else is bonus.',
'This is where discipline separates the smart from the sorry.',
'Grass won the battle. Don\'t let it win the war.',
'Three from the fairway beats four from deeper rough.',
'The caddy says advance it. The caddy means it.',
'Deep rough is golf\'s timeout corner.'
],
bare_dirt:[
'Precision lie. Precision shot.',
'The ground doesn\'t forgive. Neither will your score.',
'Ball first or bust.',
'Hard pan, hard truths.',
'This lie tests nerve. Stay committed.',
'No grass means no margin. No margin means focus.',
'Ball back. Hands forward. Hit down. Repeat.',
'Clean contact from dirt is an achievement.',
'Don\'t try anything fancy from hard pan.',
'Grip down. Control up.',
'Hard ground, soft grip. Actually, firm grip. Hard ground.',
'This lie rewards one thing: ball-first contact.',
'Bare dirt is golf\'s honesty test.',
'The club doesn\'t bounce if you hit ball first.',
'Precision from an unforgiving surface. Welcome to golf.'
],
fwy_bnk:[
'Getting out is winning.',
'Sand before ball = sand again.',
'Control is the only option. Power is a luxury.',
'Clean contact from a bunker is worth bragging about.',
'The lip decides your club. Respect the lip.',
'Ball first from sand. That\'s the mantra.',
'Three-quarter swing. Full commitment.',
'Quiet feet. Quiet lower body. Clean contact.',
'Fairway bunkers aren\'t failures. They\'re situations.',
'The PGA Tour average from fairway bunkers is lousy. You\'re not alone.',
'Get out. Advance. Live to play the next shot.',
'Sand tests patience. Don\'t let it win.',
'Clean contact from sand is the reward for good fundamentals.',
'The bunker doesn\'t define the hole. Your response does.',
'Grip down. Dig in. Ball first. That\'s the whole thing.'
],
grn_bnk:[
'Splash it out. Sand does the heavy lifting.',
'Speed through sand. Speed. Speed. Speed.',
'You\'re closer to the hole than you think.',
'The bounce exists for this exact moment.',
'Two inches behind. Let sand do its job.',
'Bunker shot on the green = great shot. Don\'t need it close.',
'Accelerate. The sand will handle the rest.',
'Open face. Open stance. Open mind.',
'Hit sand. Not ball. Trust the process.',
'The bunker isn\'t the problem. Deceleration is.',
'Commit to the speed. Sand eats soft swings.',
'Think of it as a splash, not a shot.',
'The pros practice bunker shots more than any other. There\'s a reason.',
'Speed + open face + sand behind ball = out every time.',
'Two inches behind. Accelerate through. That\'s the secret.'
],
divot:[
'You didn\'t deserve this lie. Play it anyway.',
'Steep angle is the only escape from a divot.',
'Ball back. Way back. Then a little further back.',
'Hit down into the divot. Ball goes up out of it.',
'Unlucky lie meets smart play. Smart play wins.',
'The divot was someone else\'s mistake. Don\'t make it yours.',
'Steep. Aggressive. Committed. That\'s divot golf.',
'Plan for a lower ball flight. It\'s coming in hot.',
'Down and through. The divot is the past. The green is the future.',
'No scooping from a divot. Only punching.',
'This lie separates thinkers from quitters.',
'Hit down. Trust loft. That\'s the divot recipe.',
'Someone else\'s divot, your opportunity for a great recovery.',
'Steep swing + forward hands = escape velocity.',
'Down is the only way out of a hole. Literally.'
],
trees:[
'The smartest shot in the woods is back to the fairway.',
'Gap analysis: is it wider than your miss pattern? No? Punch out.',
'The tree has been there longer than you. Respect it.',
'One shot to safety beats three shots through the woods.',
'The woods are for hiking. The fairway is for golf.',
'Every heroic tree shot has an unheroic backstory.',
'Punch to fairway. Chip to green. Two-putt. That\'s a bogey. Take it.',
'The gap looks huge through binoculars. It\'s not.',
'Trees don\'t negotiate. They don\'t move. Hit around them.',
'Bogey from the trees = victory. Double = defeat.',
'Your ego sees a hero shot. The math sees a tree.',
'Fairway is 10 yards to your left. Go find it.',
'The gap that looks like a doorway is usually a window.',
'Smart play from the trees is the most important shot of the hole.',
'One penalty shot now saves three later.'
],
water:[
'The water is still. Your hands shouldn\'t be.',
'Math never lies. Two club margin or lay up.',
'Tension and water are best friends. Don\'t introduce them.',
'Your wedge from the fairway > your long iron from the drop zone.',
'The water penalty costs two strokes. The mental penalty costs more.',
'Commit to carrying it or commit to laying up. No in-between.',
'The splash you hear is two strokes leaving your scorecard.',
'Every ball in the water started with "I think I can reach it."',
'Lay up to your distance. Not to "short of water."',
'The caddy says more club. The caddy is always right over water.',
'Water is a tax on ego.',
'Your carry distance isn\'t your max. It\'s your average. Use average over water.',
'Full commit or lay up. The middle ground is underwater.',
'Two clubs of margin. Not one. Two.',
'The scorecard doesn\'t know how pretty the carry was. It knows the number.'
],
lip:[
'The lip laughs at low shots.',
'If you think you have enough loft, add more.',
'Height or nothing. Those are the options.',
'From down here, everything looks clearable. It\'s not.',
'Max loft. Full swing. Hope for the best.',
'The lip is always — ALWAYS — taller from below.',
'Getting over the lip is the only success metric right now.',
'Don\'t think about where the ball goes. Think about if it gets OUT.',
'Lob wedge for a reason.',
'One shot over the lip = progress. One shot into the lip = repeat.',
'The lip doesn\'t care about your distance to the pin.',
'Height first. Distance second. Always from below a lip.',
'Full loft. Full swing. Full commitment.',
'Over is the only direction that matters.',
'The lip is judge and jury. Appeal with more loft.'
],
chipping:[
'Roll it like a putt with a club change.',
'Landing spot. That\'s the one thought.',
'Accelerate through. Don\'t baby it.',
'The simpler the chip, the closer it finishes.',
'Hands forward is the secret to chipping. Tell everyone.',
'Get it on the green. Two putts. Walk to the next tee.',
'Weight forward. Always. Non-negotiable.',
'Less loft when you can. The ball wants to roll.',
'Pick a spot. Hit to it. Let the ball do the rest.',
'Chip with your practice stroke. Not your "real" stroke.',
'The ball doesn\'t know it\'s a chip shot. Swing smooth.',
'Rolling ball > flying ball. Always.',
'Deceleration is the only unforgivable sin in chipping.',
'70% front foot. 100% commitment.',
'See the landing spot. Hit the landing spot. Done.'
],
putting:[
'The hole is 4.25 inches wide. Respect it.',
'Green reading is 90% eyes, 10% feel.',
'Same speed back and through. Pendulum.',
'Short putts miss because you looked up. Stay down.',
'Speed is the most important variable. Not line.',
'The putt doesn\'t know you need it. Stay calm.',
'Routine is everything on the greens.',
'Two putts from 30 feet is great. Don\'t three-putt.',
'Shoulder rock. That\'s the entire putting motion.',
'Die it or bang it. Pick one and commit.',
'Your practice stroke was perfect. Do it again for real.',
'Uphill putts are gifts. Hit them firm.',
'Downhill putts are puzzles. Solve them soft.',
'The hole isn\'t moving. Your hands might be. Stay still.',
'Read it. Set it. Roll it. Move on.'
],
up_lie:[
'Free height from the slope. Use it.',
'The hill is doing half the work for you.',
'This is the friendly uneven lie.',
'Extra club handles the extra height.',
'Match the slope and swing. That\'s it.',
'Uphill lies are manageable. Don\'t overcomplicate them.',
'Ball goes high. Ball goes left. Two adjustments.',
'The slope adds loft. You add club. Done.',
'Easiest of the four uneven lies. Play it that way.',
'Lean in. Swing along. Club up. Three moves.',
'Height is automatic here. Just manage direction.',
'Aim right. Every uphill shot pulls left.',
'Zero roll on landing. Fly it all the way.',
'The hill launches the ball. You just aim it.',
'Club up and trust the setup. Uphill is the easy one.'
],
dn_lie:[
'The hill takes loft. The hill gives distance. Accept both.',
'Low and running. That\'s all you get from here.',
'Match the slope. Chase the ball down the hill.',
'This is the hardest of the uneven lies for most golfers.',
'Ball back, weight forward, aim left. Downhill survival guide.',
'The ball will run more than you think. It always does.',
'Stay down through impact. Don\'t fight the slope.',
'Lower trajectory means more roll. Plan your landing.',
'Downhill delofts. Take more loft to compensate.',
'75% front foot. Stay committed downhill.',
'Chase the club down the slope through impact.',
'Low finish. Low ball. Plan for run.',
'Aim left. Downhill pushes right.',
'Don\'t try to help it up. The loft does that. Even reduced loft.',
'Downhill lies reward commitment. Punish hesitation.'
],
below_ft:[
'The uncomfortable lie. Wide stance, deep knee flex.',
'Fade is coming. Aim for it.',
'Maintain posture. That\'s the only secret.',
'Stay down. Ball goes right. That\'s the deal.',
'Wider stance = better contact from this lie.',
'Full grip length. Need every inch.',
'This lie makes everyone uncomfortable. Play through it.',
'Posture is king on a hanging lie.',
'Aim left. Live with the fade.',
'Sit into it. Stay in it. Don\'t stand up.',
'Extra club. Fade costs distance.',
'The ball is lower than you think. Get down to it.',
'Knee flex is the answer to most below-feet problems.',
'Stay in your posture through impact. That\'s the whole battle.',
'Wide. Bent. Left aim. Ball goes right. That\'s below feet.'
],
above_ft:[
'Slope gives you a free draw. Take it.',
'Grip down. The ball is right there.',
'Stand tall. Swing flat. Ball goes left.',
'Aim right. The slope handles the rest.',
'Not gripping down = chunk city. Grip down.',
'Flatter swing feels different. That\'s normal. Trust it.',
'The slope closes your face. Plan for the draw.',
'Ball above feet = draw. That\'s physics. Aim right.',
'Grip down enough. Then a little more.',
'Stand taller than normal. The ball is closer.',
'This lie gives you shape. Use it.',
'Draw spin is free from this lie. Aim right, let it work.',
'The slope does the work. You just aim.',
'More slope = more hook. Adjust aim accordingly.',
'Grip down, aim right, swing smooth. Above-feet playbook.'
]
};
// Merge expanded kickers
for (const [key, arr] of Object.entries(_xk)) {
  if (CL.kickers[key]) CL.kickers[key] = CL.kickers[key].concat(arr);
  else CL.kickers[key] = arr;
}


// =============================================
// ADDITIONAL BASE SCENARIOS — Approach distances, specialty shots
// =============================================
Object.assign(CL.base, {
approach_wedge: {
  smartText:'scoring zone. This is where rounds are made. Pick a specific landing spot.',
  heroText:'attack the pin from wedge distance. This is your best chance at birdie.',
  heroDanger:'Inside 100 yards, even pros miss greens 30% of the time. Center green is smart.',
  setup:[
    {label:'Distance',cue:'Pick a SPECIFIC landing spot. Not "the green."',why:'Wedge distance is about precision. Vague targets get vague results.'},
    {label:'Club',cue:'Three-quarter swing is better than full with less club.',why:'Controlled partial swing = consistent distance. Full swing = variable.'},
    {label:'Swing',cue:'Smooth, controlled. Same tempo back and through.',why:'Equal length backswing and follow-through = predictable distance.'},
    {label:'Weight',cue:'60-70% front foot. Stay centered.',why:'Forward weight compresses for spin. Back weight = thin or fat.'},
    {label:'Finish',cue:'Abbreviated follow-through for lower, controlled flight.',why:'Short finish = lower trajectory = less affected by wind.'}
  ]
},
approach_short_iron: {
  smartText:'short iron approach. Center green. Pick your spot and commit.',
  heroText:'short iron at the pin. You should be aggressive from this distance.',
  heroDanger:'Short irons should find the green. Missing here costs strokes.',
  setup:[
    {label:'Ball',cue:'Center of stance.',why:'Short irons want a descending blow. Center position delivers it.'},
    {label:'Weight',cue:'70-80% front at impact.',why:'Compress the ball. Weight forward is how short irons stop on greens.'},
    {label:'Swing',cue:'Don\'t try to kill it. Smooth, controlled.',why:'Short irons are accuracy clubs. Overswinging sacrifices control.'},
    {label:'Target',cue:'Specific spot on the green. Pick the discoloration, sprinkler, anything.',why:'Specific target = specific commitment = better result.'}
  ]
},
approach_mid_iron: {
  smartText:'mid iron approach. Center green. Solid contact is the priority.',
  heroText:'mid iron at the flag. Good contact from mid iron = scoring opportunity.',
  heroDanger:'Mid irons are where solid contact matters most. Flush it or leave it center.',
  setup:[
    {label:'Ball',cue:'Center to one ball forward. In line with shirt logo.',why:'Mid irons need slightly more forward position than short irons.'},
    {label:'Swing',cue:'Hit DOWN on ball. Trust the loft.',why:'Mid irons still go down through impact. Don\'t scoop.'},
    {label:'Tempo',cue:'Smooth. One speed back, accelerate through.',why:'Rushing a mid iron = thin shot = over the green or short.'},
    {label:'Commit',cue:'Pick your club and COMMIT. Don\'t second-guess.',why:'Indecision between two clubs = bad swing with either.'}
  ]
},
approach_long: {
  smartText:'long approach. Anywhere on the green is a great shot from here.',
  heroText:'long iron or hybrid at the flag. Aggressive from distance. Respect the difficulty.',
  heroDanger:'Long approaches miss greens more than they hit them. Front edge or center = success.',
  setup:[
    {label:'Club',cue:'Enough club to reach. Don\'t try to max out a shorter club.',why:'Maxing out a 7-iron is worse than smooth 6-iron. Always take enough club.'},
    {label:'Target',cue:'Center of green. Or front edge. Anywhere on the putting surface.',why:'From 180+, being on the green AT ALL is a great shot.'},
    {label:'Swing',cue:'Smooth. Full turn, full follow-through. Don\'t steer.',why:'Long clubs need speed. Speed comes from rotation, not force.'},
    {label:'Expect',cue:'Some dispersion is normal. 10-15 yard spread.',why:'Even Tour pros have 20-yard dispersion from 200. Relax your expectations.'}
  ]
},
layup_strategy: {
  smartText:'lay up to your favorite wedge distance. Not to "short of trouble."',
  heroText:'go for it if the math works. Otherwise, lay up smart.',
  heroDanger:'A perfect layup sets up an easy birdie putt. A dumb hero sets up double.',
  setup:[
    {label:'Target',cue:'Pick a SPECIFIC yardage. Your best wedge distance.',why:'80-90 yard wedge from fairway > 30 yard pitch from random spot.'},
    {label:'Club',cue:'Whatever reaches your layup target with a 3/4 swing.',why:'Control matters more than power. You\'re playing position chess.'},
    {label:'Avoid',cue:'Don\'t lay up to an awkward distance (40-60 yards).',why:'Half-wedge shots are the hardest in golf. Lay up to a full wedge distance.'},
    {label:'Fairway',cue:'Lay up to the FAIRWAY. Not the rough. Pick a spot.',why:'Wedge from fairway > wedge from rough. Every time.'}
  ]
},
dogleg_left: {
  smartText:'aim at the corner. Safe club to the turn. Set up approach.',
  heroText:'cut the corner. High risk, high reward. Need to carry the trouble.',
  heroDanger:'Cutting the corner saves 20 yards. Missing costs 2 strokes. Do the math.',
  setup:[
    {label:'Aim',cue:'Outside of the corner. Leave room for the turn.',why:'Ball in the fairway past the corner = perfect approach angle.'},
    {label:'Club',cue:'Whatever reaches the corner with a 3/4 swing.',why:'Don\'t need max distance. Need position at the turn.'},
    {label:'Shape',cue:'A draw helps here if you can hit one.',why:'Draw curves with the hole. But straight to the corner works fine.'},
    {label:'Trouble',cue:'What\'s on the inside of the corner? Trees? Water? OB?',why:'Know what the penalty is for missing before you decide to cut it.'}
  ]
},
dogleg_right: {
  smartText:'aim at the corner. Safe club to the turn.',
  heroText:'cut the right corner. Need to carry whatever\'s there.',
  heroDanger:'Same math as any dogleg. Saving 20 yards vs. losing 2 strokes.',
  setup:[
    {label:'Aim',cue:'Outside of the corner. Room to turn.',why:'Fairway past the corner sets up approach from the correct angle.'},
    {label:'Club',cue:'Reach the corner. Don\'t need more.',why:'Position over power. Find the turn.'},
    {label:'Shape',cue:'A fade helps here if you have one.',why:'Fade curves with the dogleg. Straight to corner also works.'},
    {label:'Assess',cue:'What\'s inside the corner? Risk vs. reward.',why:'Know the penalty before choosing the aggressive play.'}
  ]
},
par5_reachable: {
  smartText:'set up a wedge approach. Two good shots to scoring range.',
  heroText:'go for the green in two. Need to carry the trouble.',
  heroDanger:'Par 5 in two = eagle putt. Par 5 in trouble = bogey or worse.',
  setup:[
    {label:'Assess',cue:'Can you reach with a club you trust? Not your max club.',why:'Reaching a par 5 in two with your career shot is not a plan. It\'s a prayer.'},
    {label:'Safe',cue:'Lay up to 80-100 yards. Wedge to birdie range.',why:'Wedge from 90 = legitimate birdie chance. Long iron to water = bogey.'},
    {label:'If going',cue:'Need 20+ yard margin over trouble.',why:'Long shots to par 5 greens are not precision plays. Need margin.'},
    {label:'Green',cue:'Where\'s the miss? Front, left, right? Plan the miss.',why:'If you miss the green going for it, where does the ball go? Plan for that.'}
  ]
},
tight_fairway: {
  smartText:'accuracy club off the tee. Not driver. Find the short grass.',
  heroText:'driver on a tight hole. Full commitment to a specific target.',
  heroDanger:'Tight fairway + driver = maximum risk. Accuracy club is the caddy recommendation.',
  setup:[
    {label:'Club',cue:'3-Wood, hybrid, or long iron. Whatever you hit straightest.',why:'Tight holes punish misses. The club you hit straightest is the right club.'},
    {label:'Target',cue:'Pick the widest part of the fairway. Aim there.',why:'Don\'t aim at the edge. Aim at the widest spot. Leave room for error.'},
    {label:'Swing',cue:'75% power. Smooth and controlled.',why:'Tight fairways don\'t need distance. They need accuracy.'},
    {label:'Mental',cue:'Par is a GREAT score on tight holes.',why:'Don\'t try to birdie a hard hole. Par it and move on.'}
  ]
},
morning_dew: {
  smartText:'wet grass. Ball will skid more, spin less. Club up for approaches.',
  heroText:'attack despite morning conditions. Adjust for wet.',
  heroDanger:'Dew reduces spin on every shot. Greens hold approach shots but chips slide.',
  setup:[
    {label:'Approach',cue:'One extra club. Wet grass reduces spin and distance.',why:'Moisture between face and ball = less compression = less distance.'},
    {label:'Chips',cue:'Ball will SKID off wet grass. Land it short.',why:'Wet surface = less friction = ball runs further than expected.'},
    {label:'Putts',cue:'Greens are slower in the morning. Hit firmer.',why:'Dew slows the ball on the green. Be more aggressive with speed.'},
    {label:'Grip',cue:'Dry your grips between shots. Towel on the bag.',why:'Wet grips slip. Dry them every shot.'}
  ]
}
});

// =============================================
// MORE COMBINATION OVERRIDES
// =============================================
Object.assign(CL.combos, {
'divot+dn_lie': {
  smartText:'divot on a downslope. Double the steep angle. Ball comes out like a bullet.',
  heroText:'advance it from the worst combination of bad luck.',
  heroDanger:'Skull city. Ball way back, hit down hard, plan for a laser.',
  setup:[
    {label:'Ball',cue:'Way back. Off back foot or further.',why:'Both conditions want ball back. Way, way back.'},
    {label:'Angle',cue:'Steepest angle possible. Punch DOWN hard.',why:'Must get under ball in divot while going downhill. Maximum steep.'},
    {label:'Expect',cue:'Lowest trajectory you\'ve ever seen. 50+ yards of roll.',why:'Super delofted, aggressive descending blow = screaming line drive.'},
    {label:'Club',cue:'Short iron. More loft than you think.',why:'Everything delofts from this lie. 9-iron plays like a 6-iron.'}
  ]
},
'divot+up_lie': {
  smartText:'divot on an upslope. Steep angle, but slope adds height. Manageable.',
  heroText:'attack from a divot uphill. Ball actually launches OK.',
  heroDanger:'Better than flat divot. Slope helps get under the ball.',
  setup:[
    {label:'Ball',cue:'Back, but not as far as flat divot.',why:'Uphill compensates. Ball doesn\'t need to be as far back.'},
    {label:'Swing',cue:'Still steep and aggressive. Punch it.',why:'Divot still requires descending blow. Slope just adds loft back.'},
    {label:'Club',cue:'Same as normal from this distance. Slope and divot roughly cancel.',why:'Divot costs loft. Slope adds loft. Net effect is close to normal.'}
  ]
},
'grn_bnk_wet+lip': {
  smartText:'wet sand behind a high lip. Extremely difficult. Get it out.',
  heroText:'blast through wet sand over a high lip. Full commitment.',
  heroDanger:'Wet sand + lip = the hardest greenside shot. Consider playing to a different part of the green.',
  setup:[
    {label:'Face',cue:'Open. Need maximum loft for the lip.',why:'Lip requires height. Open face provides it. Even in wet sand.'},
    {label:'Speed',cue:'MAXIMUM. Wet sand is heavy AND you need height.',why:'Need speed to get through heavy sand AND enough launch to clear lip.'},
    {label:'Contact',cue:'Closer to ball than normal. 1 inch behind.',why:'Wet sand technique: closer contact. But still hit sand, not ball.'},
    {label:'Backup',cue:'Playing to the side of the green might be smarter.',why:'If the lip is severe and sand is wet, the sideways route may save a shot.'}
  ]
},
'water_crossing+wind_back': {
  smartText:'downwind helps carry crossing water. Good conditions. Trust it.',
  heroText:'downwind over crossing water. Favorable. Attack.',
  heroDanger:'Downwind means ball carries further. But also rolls more on landing.',
  setup:[
    {label:'Club',cue:'Down one from normal. Wind adds carry.',why:'Downwind helps you carry the water. Don\'t overshoot.'},
    {label:'Commit',cue:'Full swing. Wind does the rest.',why:'Favorable conditions. Swing with confidence.'},
    {label:'Landing',cue:'Aim shorter. Ball will roll more downwind.',why:'Less backspin in downwind = more run on landing.'}
  ]
},
'lt_rough+below_ft': {
  smartText:'light rough, ball below feet. Widen stance, aim left, one extra club.',
  heroText:'hold the line from first cut on a hanging lie.',
  heroDanger:'Manageable combo. Fade is guaranteed. Aim left and commit.',
  setup:[
    {label:'Stance',cue:'Wider than normal. Bend knees.',why:'Need stability and reach. Both conditions demand it.'},
    {label:'Aim',cue:'LEFT. Ball fades right from below feet.',why:'Below feet dominates direction here.'},
    {label:'Club',cue:'One more than normal. Fade and rough both cost.',why:'Two small distance penalties. One extra club covers both.'}
  ]
},
'lt_rough+above_ft': {
  smartText:'light rough, ball above feet. Grip down, aim right.',
  heroText:'ride the draw from above-feet first cut.',
  heroDanger:'Both conditions push ball left. Aim further right than normal.',
  setup:[
    {label:'Grip',cue:'Down 1-2 inches. Ball is closer.',why:'Above feet requires grip adjustment.'},
    {label:'Aim',cue:'Right. Both rough and slope push left.',why:'Double left tendency. Compensate with aim.'},
    {label:'Club',cue:'One more for the rough.',why:'Rough costs distance. Slope doesn\'t significantly.'}
  ]
}
});

// =============================================
// COURSE MANAGEMENT WISDOM — injected into kickers
// =============================================
const _courseManagement = [
'The best players miss in the right places.',
'Missing the green in the right spot is better than hitting it in the wrong one.',
'Every hole has a bail-out. Know where yours is.',
'Double bogey usually starts with an aggressive decision.',
'Bogey is not a bad score. Triple is a bad score.',
'The difference between 85 and 95 is decision-making, not swing mechanics.',
'Three good shots in a row is a rhythm. Four is a streak. Don\'t break it with ego.',
'The smartest shot on the course is the one nobody remembers.',
'Great courses reward position. Not power.',
'Play to the fat side of the green. Every time.',
'The worst miss on any hole is the one that brings a penalty into play.',
'Par is always available. Birdie sometimes is. Eagle rarely is. Plan accordingly.',
'When in doubt, take more club.',
'The back of the green is closer to the next tee than the water in front.',
'Your 15-handicap self doesn\'t need to play hero shots. Play your game.',
'Every stroke saved on course management is a stroke you didn\'t need to earn with your swing.',
'The flag is a suggestion. The center of the green is always the answer.',
'Know your miss. Plan for your miss. Your miss is your friend if you plan for it.',
'Course management is free strokes. No practice required.',
'Think about where you want your NEXT shot to be. Not this one.'
];
CL.kickers._default = CL.kickers._default.concat(_courseManagement);

// =============================================
// SCORING ZONE KICKERS (under 100 yards)
// =============================================
CL.kickers.scoring_zone = [
'Inside 100. This is where scores are made.',
'Wedge distance is birdie distance. Commit.',
'The scoring zone rewards precision. Not power.',
'Pick a landing spot and hit it. That\'s the whole plan.',
'Three-quarter wedge > full wedge. Every time.',
'Under 100 is where amateurs become good players.',
'This shot decides the hole. Pick your spot.',
'Wedge in hand, flag in sight. Don\'t overthink it.',
'You practiced this shot. Trust your practice.',
'Scoring zone. Scoring club. Scoring opportunity.',
'Inside 100 yards, the target shrinks. Your focus should too.',
'This is what your wedges were made for.',
'A crisp wedge to 10 feet changes the whole round.',
'Precision distance. Precision club. Precision swing.',
'The scoring zone doesn\'t forgive lazy swings.'
];

// =============================================
// PENALTY AVOIDANCE KICKERS
// =============================================
CL.kickers.penalty_avoid = [
'Penalty strokes are the most expensive shots in golf.',
'The OB stake is a two-shot penalty. Is it worth it?',
'Re-tee beats hero shot from an impossible lie.',
'Drop zones exist because the rules understand ego.',
'Provisional ball: two words that save 10-minute searches.',
'One shot penalty now saves three shots of drama later.',
'The smart play from trouble is the boring play. Be boring.',
'Avoid the big number. Everything else sorts itself out.',
'Double bogey comes from compounding one bad decision with another.',
'Take your medicine. The scorecard has 18 holes, not one.',
'The penalty stroke is the tax on aggressive play. Pay it and move on.',
'Unplayable lie? Take the drop. Ego doesn\'t get strokes back.',
'The re-tee is a reset. Not a failure.',
'Provisional ball from the tee. Smart insurance policy.',
'Three off the tee still beats searching for five minutes.'
];

// =============================================
// MENTAL GAME KICKERS
// =============================================
CL.kickers.mental = [
'The next shot is the most important one. Always.',
'Bad shot? Flush it. You\'ve got a new one coming.',
'One hole at a time. One shot at a time.',
'Your best round starts with forgetting the last one.',
'The course doesn\'t know your last hole score. Play this one.',
'Frustration helps your opponents. Not you.',
'Three deep breaths before every shot. Your heart rate thanks you.',
'Focus on process, not outcome. The score takes care of itself.',
'The ball doesn\'t know you\'re nervous. Keep it that way.',
'Pre-shot routine is your anchor. Same thing every time.',
'Confidence isn\'t feeling good. It\'s committing anyway.',
'The swing you\'re about to make is the only one that matters.',
'Play with your swing today. Not the swing you had last week.',
'Accept the lie. Plan the shot. Commit. Execute.',
'Golf is 90% mental. The other 10% is also mental.'
];

// =============================================
// ADDITIONAL KICKER EXPANSIONS
// =============================================
const _xk2 = {
chipping:[
'Land it and let it roll. That\'s the whole game inside 30 yards.',
'A chip to 5 feet is a great shot. Stop trying for 1 foot.',
'The chip and the putt are a team. Let them work together.',
'Less air time, more ground time. The ball prefers rolling.',
'Weight forward, hands forward, accelerate. Say it in your sleep.',
'The bump-and-run is the safest chip. Use it when you can.',
'A bad chip leaves you 15 feet away. A bad flop leaves you off the green.',
'Pick the least exciting chip option. That\'s usually the right one.',
'Chipping is putting with a different club. Same feel, same simplicity.',
'The landing spot is everything. Pick it before you pick the club.',
'Don\'t fly it to the hole. Fly it to the landing spot.',
'Less loft = more forgiveness. Use it.',
'The fringe is your friend. Use it for bump-and-runs.',
'Practice chipping more than anything else. It\'s where scores live.',
'A good chipper saves 5 shots a round. Minimum.'
],
putting:[
'The ball is round. The hole is round. They want to be together.',
'Speed kills three-putts. Get the speed right and line handles itself.',
'Nobody three-putts from 10 feet. They three-putt from 35.',
'Lag putting is the most underrated skill in golf.',
'The first putt decides everything. Make it count.',
'Read the putt, trust the read, roll it. Don\'t re-read over the ball.',
'Two putts from anywhere on the green is solid golf.',
'The hole is 4.25 inches. Your ball is 1.68 inches. There\'s room.',
'Smooth stroke. Every time. Fast greens, slow greens, same stroke.',
'Your eyes and feet do the reading. Your shoulders do the rolling.',
'The best putters in the world miss 40% from 8 feet. Relax.',
'Pace, pace, pace. Line is secondary to pace.',
'One look, two looks, address, roll. Don\'t stand over it.',
'Short backswing putts miss short. Give yourself enough backstroke.',
'Trust your first read. Second guesses miss more than first instincts.'
],
trees:[
'The safest play from the trees is the smartest play from the trees.',
'If you can see the flag, it doesn\'t mean you can reach it.',
'The gap closes as the ball gets closer. Perspective lies.',
'One shot to the fairway is always better than two in the trees.',
'The tree that looks thin from here is three feet wide.',
'Punch out. Pitch on. Two-putt. That\'s a bogey. Move on.',
'The hero shot from the trees goes right 10% of the time.',
'Getting out is the victory. Getting close is the bonus.',
'The caddy says punch. The caddy has seen this movie before.',
'Trees are the best teachers. They teach patience.',
'Your 7-iron out of the trees to the fairway is the smartest club in the bag.',
'Bogey from the trees is the new par. Accept it.',
'The gap looks bigger in your mind than in reality.',
'The tree is not going to move. You are.',
'Sideways is not giving up. It\'s growing up.'
],
water:[
'Water is the most expensive real estate on the golf course.',
'Every ball in the water was hit by someone who "almost made it."',
'Your carry distance on the range ≠ your carry distance over water.',
'The tension you feel is adding 10 yards to your next shot. In the wrong direction.',
'Lay up to 80. Wedge to 10 feet. Make the putt. That\'s a birdie without the risk.',
'The drop zone is always worse than where you would have been if you laid up.',
'Two strokes is the cost of water. Is the reward worth two strokes?',
'The best players in the world lay up when the numbers don\'t work.',
'Water doesn\'t care about your 3-wood from the practice range.',
'Commit to carrying it or commit to laying up. Anything in between goes swimming.',
'Your caddy says lay up. Your ego says go. Your wallet says balls cost money.',
'The carry looks shorter from behind the ball. It\'s not.',
'More club. Always more club over water.',
'The splash you\'re about to hear costs two strokes and your confidence.',
'If the carry isn\'t comfortable, it isn\'t clearable.'
]
};
for (const [key, arr] of Object.entries(_xk2)) {
  if (CL.kickers[key]) CL.kickers[key] = CL.kickers[key].concat(arr);
  else CL.kickers[key] = arr;
}

// =============================================
// ADDITIONAL WELCOME MESSAGES
// =============================================
CL.welcomes = CL.welcomes.concat([
{silver:'The only shot that matters is the next one.',copper:'So make it a good one.'},
{silver:'Golf rewards the patient.',copper:'And punishes the impatient.'},
{silver:'New holes. Same fundamentals.',copper:'Grip light. Head down. Commit.'},
{silver:'The course is the same for everyone.',copper:'Your decisions are not.'},
{silver:'You packed 14 clubs.',copper:'The caddy will tell you which one.'},
{silver:'Every fairway is a fresh start.',copper:'Every green is a chance.'},
{silver:'Weather changes. Wind changes. Course changes.',copper:'Your process doesn\'t.'},
{silver:'Some days you play the course.',copper:'Some days the course plays you.'},
{silver:'Smart play. Smart decisions. Smart score.',copper:'That\'s the formula.'},
{silver:'Ready when you are.',copper:'The caddy never takes a day off.'}
]);

// =============================================
// ADDITIONAL ROASTS
// =============================================
CL.roasts = CL.roasts.concat([
'Downloaded a golf strategy app. My strategy was to ignore it.',
'Caddy Logic discipline index: let\'s not talk about it.',
'The caddy said center green. My ball said "hold my beer."',
'My hero shots made the highlight reel. The wrong kind.',
'Caddy Logic consulted: {total}. Caddy Logic followed: {smart}. Caddy Logic ignored: regrettable.',
'{total} times I asked for advice. {smart} times I took it. {hero} times I had a better idea. I didn\'t.',
'Used the caddy app all day. The caddy is now seeking therapy.',
'My round in one sentence: smart play recommended, hero play selected.',
'Consulted Caddy Logic every hole. Listened every other hole. Scored accordingly.',
'The app said safe. I said aggressive. The scorecard said 97.'
]);

// =============================================
// ADDITIONAL CONFESSIONAL KICKERS
// =============================================
CL.confessionalKickers.allSmart = CL.confessionalKickers.allSmart.concat([
'Pure discipline. The caddy is taking credit.',
'Not one hero shot. The rarest round in golf.',
'Discipline index: perfect. Caddy index: proud.',
'You played exactly the way the caddy asked. Revolutionary.'
]);
CL.confessionalKickers.someHero = CL.confessionalKickers.someHero.concat([
'Some hero, mostly smart. We\'ll take it.',
'The caddy\'s report card: B+. Could be an A.',
'A few detours from the plan. Overall, strong.',
'Mostly disciplined with moments of creativity.'
]);
CL.confessionalKickers.manyHero = CL.confessionalKickers.manyHero.concat([
'The caddy is writing a strongly worded letter.',
'Hero play was the theme. The caddy was a spectator.',
'More hero than smart. The scorecard noticed.',
'The caddy wonders why you downloaded the app.'
]);

// =============================================
// ADDITIONAL FLEX KICKERS
// =============================================
CL.flexKickers.perfect = CL.flexKickers.perfect.concat([
'Every shot consulted. Every time I listened. {smart} for {smart}.',
'The caddy spoke. I listened. {smart} times. — Caddy Logic',
'Discipline over ego. {smart} shots. {smart} smart plays.'
]);
CL.flexKickers.withHero = CL.flexKickers.withHero.concat([
'{total} consultations. {smart} followed. {hero} ignored. The caddy has opinions.',
'Smart: {smart}. Hero: {hero}. Total: {total}. Math doesn\'t lie.',
'{total} times I asked the caddy. {smart} times I agreed. Work in progress.'
]);


// =============================================
// ROUND 3 EXPANSION — More scenarios, combos, kickers to reach 4000+ lines
// =============================================

// Additional specialty base scenarios
Object.assign(CL.base, {
dew_morning: {
  smartText:'morning conditions. Extra club, expect less spin, greens are slow.',
  heroText:'attack in morning conditions. Adjust for dew.',
  heroDanger:'Dew changes everything. Spin is reduced. Greens are slower.',
  setup:[
    {label:'Club',cue:'One extra. Wet grass costs distance.',why:'Moisture between face and ball = less compression.'},
    {label:'Spin',cue:'Expect less. Ball will roll more on landing.',why:'Water on grooves kills backspin. Plan for run-out.'},
    {label:'Greens',cue:'Slower. Putt firmer.',why:'Dew adds friction on the green. Ball won\'t roll as far.'},
    {label:'Grip',cue:'Keep grips dry. Towel every shot.',why:'Wet grip = club rotates = directional disaster.'},
    {label:'Chips',cue:'Ball skids off wet grass. Land shorter.',why:'Less friction between club and ball AND ball and grass.'}
  ]
},
firm_afternoon: {
  smartText:'firm conditions. Ball bounces and rolls. Aim short of target.',
  heroText:'use the firm conditions. Run it onto the green.',
  heroDanger:'Firm greens don\'t hold shots. Plan for bounce and roll.',
  setup:[
    {label:'Landing',cue:'Short of the green. Let it bounce on.',why:'Firm greens reject high shots. Running it on controls better.'},
    {label:'Club',cue:'Consider less club. Ball will roll further.',why:'Firm turf = less friction = more roll. Don\'t overshoot.'},
    {label:'Chips',cue:'More run than morning. Adjust landing spot.',why:'Firm and dry surface = maximum roll on chips.'},
    {label:'Putts',cue:'Faster greens in afternoon. Softer stroke.',why:'Afternoon sun firms and speeds up the greens.'}
  ]
},
punch_low: {
  smartText:'keep it low. Ball back, short swing, low finish.',
  heroText:'stinger. Maximum distance under the wind.',
  heroDanger:'Low shots run. A lot. Plan your landing accordingly.',
  setup:[
    {label:'Ball',cue:'Back of stance. Off back foot.',why:'Back position delofts club. Less loft = lower trajectory.'},
    {label:'Swing',cue:'Three-quarter. Hands stay low through impact.',why:'Full swing = full height. Short swing = controlled, low flight.'},
    {label:'Finish',cue:'LOW. Hands below chest. Abbreviated.',why:'Low finish is the mirror of low ball flight. Where your hands go, the ball goes.'},
    {label:'Use',cue:'Wind, branches, or when you need max run.',why:'Punch shots are utility shots. Use them when height hurts you.'}
  ]
},
high_shot: {
  smartText:'launch it high. Ball forward, weight back, full loft.',
  heroText:'maximum height. Over obstacle or to stop fast.',
  heroDanger:'High shots are wind magnets. Check conditions first.',
  setup:[
    {label:'Ball',cue:'Forward. Inside front heel.',why:'Forward position adds loft. More loft = more height.'},
    {label:'Weight',cue:'Slightly back. Stay behind the ball.',why:'Weight behind ball adds dynamic loft at impact.'},
    {label:'Hands',cue:'Even with ball. Not ahead.',why:'Hands ahead delofts. You want maximum loft for height.'},
    {label:'Swing',cue:'Full swing. Let the club do the work.',why:'Trust the loft. Don\'t try to scoop or lift. The club is designed for height.'},
    {label:'Wind',cue:'High shots + wind = unpredictable. Factor it.',why:'Height = hang time. Hang time = wind has more time to push the ball.'}
  ]
}
});

// More combination overrides for common course situations
Object.assign(CL.combos, {
'fairway+below_ft+wind_face': {
  smartText:'hanging lie into the wind. Club up two. Aim LEFT. Smooth swing.',
  heroText:'fight the wind from a hanging lie. Double challenge.',
  heroDanger:'Below feet fades right + headwind kills distance. Two club adjustment minimum.',
  setup:[
    {label:'Club',cue:'Up TWO. Fade costs distance AND wind costs distance.',why:'Both conditions eat yardage. Compensate aggressively.'},
    {label:'Aim',cue:'LEFT. Wind AND fade both push right.',why:'Headwind exaggerates the fade. Aim further left than normal.'},
    {label:'Swing',cue:'SMOOTH. Harder swing into wind = more spin = balloon.',why:'The temptation is to swing harder. That makes it worse. More club, less effort.'},
    {label:'Stance',cue:'Wide. Sit into knees. Stable base.',why:'Two challenges mean you need maximum stability.'}
  ]
},
'fairway+above_ft+wind_back': {
  smartText:'above-feet lie with wind behind. Ball will draw AND carry further. Club down.',
  heroText:'ride the draw downwind. Extra distance available.',
  heroDanger:'Double hook danger. Above feet draws + downwind carries further. May overshoot.',
  setup:[
    {label:'Club',cue:'Down one or two. Wind + draw both add distance.',why:'Downwind carries further. Draw rolls further. Combined = lots of extra distance.'},
    {label:'Aim',cue:'Further right than normal above-feet adjustment.',why:'Wind may push the draw even further left. Over-compensate.'},
    {label:'Grip',cue:'Down for the slope as normal.',why:'Standard above-feet adjustment still required.'}
  ]
},
'dp_rough+wind_face': {
  smartText:'deep rough into the wind. Club up THREE. Just advance it.',
  heroText:'fight through rough and wind. Maximum commitment required.',
  heroDanger:'Two distance killers combined. Rough + wind = significantly shorter shot.',
  setup:[
    {label:'Club',cue:'Up THREE. Rough eats two clubs, wind eats one.',why:'Combined distance loss is severe. Take way more club.'},
    {label:'Swing',cue:'Aggressive through grass. But smooth for wind.',why:'Need speed for grass but smooth to avoid ballooning.'},
    {label:'Expect',cue:'May not reach the green. That\'s OK.',why:'Fairway with a short approach > stuck in rough again.'}
  ]
},
'grn_bnk_clean+up_lie': {
  smartText:'uphill bunker shot. Ball launches higher. May come up short.',
  heroText:'use the uphill to get maximum height and soft landing.',
  heroDanger:'Uphill bunker = very high, very short. Swing harder than you think.',
  setup:[
    {label:'Speed',cue:'More than flat bunker shot. Hill absorbs energy.',why:'Uphill saps speed from the sand splash. Compensate with more swing.'},
    {label:'Shoulders',cue:'Match the slope.',why:'Parallel shoulders let the club slide through sand along the slope.'},
    {label:'Expect',cue:'Very high, very soft. May come up short.',why:'Uphill adds loft to already open clubface. Ball goes way up.'}
  ]
},
'grn_bnk_clean+dn_lie': {
  smartText:'downhill bunker shot. Extremely difficult. Just get it out.',
  heroText:'downhill sand splash. One of the hardest shots in golf.',
  heroDanger:'Ball comes out low and fast from downhill sand. Very hard to stop.',
  setup:[
    {label:'Weight',cue:'Into the slope. Front foot heavy.',why:'Must stay over the ball going downhill. Weight back = blade it.'},
    {label:'Shoulders',cue:'Match slope. Lead shoulder low.',why:'Swing along the slope for clean sand contact.'},
    {label:'Face',cue:'Open WIDER than normal.',why:'Downhill takes loft away. Extra open compensates.'},
    {label:'Expect',cue:'Lower trajectory than flat bunker. More roll.',why:'Even with open face, downhill reduces effective loft.'},
    {label:'Goal',cue:'On the green is a WIN from this lie.',why:'This is one of the hardest greenside shots. Lower your expectations.'}
  ]
},
'trees_around_l+up_lie': {
  smartText:'draw around tree from uphill. Slope helps — ball naturally draws from uphill.',
  heroText:'use the uphill to launch a high draw around the tree.',
  heroDanger:'Uphill promotes draw. Your draw setup adds more. Watch for over-hook.',
  setup:[
    {label:'Advantage',cue:'Slope promotes draw. Same direction as your shot shape.',why:'Uphill closes face slightly = natural draw. You WANT draw. Double help.'},
    {label:'Aim',cue:'Less right than flat. Slope adds draw for you.',why:'Don\'t over-draw by aiming too far right. Slope is already helping.'},
    {label:'Club',cue:'One more. Uphill costs distance.',why:'Standard uphill adjustment still applies.'}
  ]
},
'trees_around_r+dn_lie': {
  smartText:'fade around tree from downhill. Slope helps — ball naturally fades from downhill.',
  heroText:'use the downhill to enhance the fade around the tree.',
  heroDanger:'Downhill promotes fade. Combined with fade setup, ball may slice too much.',
  setup:[
    {label:'Advantage',cue:'Slope promotes fade. Same direction as your shot shape.',why:'Downhill opens face = natural fade. You want fade. Double help.'},
    {label:'Aim',cue:'Less left than flat. Slope adds fade for you.',why:'Don\'t over-fade. Slope is already pushing ball right.'},
    {label:'Club',cue:'Down one. Downhill adds distance.',why:'Standard downhill adjustment. Ball will go further.'}
  ]
},
'putting+wind_face': {
  smartText:'putting into the wind. Won\'t affect short putts. Long putts: hit firmer.',
  heroText:'same stroke. Wind barely affects putts. Commit.',
  heroDanger:'Wind affects you more than the ball on putts. Stay steady.',
  setup:[
    {label:'Stance',cue:'Wider for stability in wind.',why:'Wind can push your body during the stroke. Wide stance resists it.'},
    {label:'Speed',cue:'On long putts, slightly firmer. Wind creates friction.',why:'Strong wind can slow a long putt by a foot or two.'},
    {label:'Mental',cue:'Wind is distracting. Focus on routine.',why:'The wind affects your concentration more than your ball. Stay locked in.'}
  ]
}
});

// =============================================
// FINAL KICKER MEGABLOCK — reaching 800+ total
// =============================================
const _xk3 = {
_default:[
'Every shot is a fresh start. Even after a bad one.',
'The club in your hand is the right club if you commit.',
'Don\'t aim at trouble. Aim away from it.',
'Contact is king. Everything else is secondary.',
'A committed swing to the wrong target beats an uncommitted swing to the right one.',
'If you\'re between clubs, always take more.',
'The best shot on this hole is the one that gives you the best next shot.',
'Practice swings are free. Use them.',
'Athletic posture. Athletic result.',
'The follow-through tells you everything about the swing.',
'Golf is not about your best shot. It\'s about your worst.',
'A good decision poorly executed beats a bad decision perfectly executed.',
'The fairway is always open. The pin isn\'t.',
'Your best round ever will feel boring. That\'s by design.',
'If you\'re not sure, hit more club. There\'s no trophy for "I would have been right."',
'The difference between a good player and a great player is decision-making.',
'Hit it solid. That fixes 80% of problems.',
'When in doubt, aim for the biggest target available.',
'Golf is chess. Not checkers.',
'Every round has 3-4 shots that define it. Make them smart ones.',
'Process over outcome. Always.',
'Don\'t confuse a good result from a bad swing with a good decision.',
'You don\'t need to play perfect golf. You need to avoid terrible golf.',
'Swing thoughts: maximum one. Two is too many.',
'The practice swing is practice. The real swing is commitment.'
],
tee_par3:[
'This hole is 150 yards. Your 7-iron has been waiting for this.',
'Par 3 strategy: find the green. Everything else is bonus.',
'The tee shot IS the approach shot. Treat it like one.',
'You get a tee. You get a perfect lie. Don\'t waste it being nervous.',
'Middle of the green from 170 yards IS a good shot. Believe it.',
'The only bad par 3 tee shot is one that finds trouble.',
'Par 3s are the simplest holes on the course. One shot to the green.',
'You\'ve hit this club 1000 times. Do it one more time.'
],
tee_par45:[
'Hit it in the fairway and the rest of the hole takes care of itself.',
'Driver is a privilege, not a right. Earn it with a good swing.',
'The most important swing of the hole is the first one.',
'From the fairway, you can do anything. From the trees, you can do nothing.',
'Nobody cares how far you drive it. They care what you score.',
'Tempo off the first tee. That sets the whole round.',
'Smooth off the tee. Aggressive on approach. Smart around the green.',
'If you hit fairway, you\'re already beating 60% of golfers.'
],
fairway:[
'This is where good golf lives.',
'Fairway approach is the most important shot on any hole.',
'You\'ve done the hard part. Now finish it.',
'Approach from the fairway is your scoring opportunity.',
'The green is right there. Go get it.',
'Clean lie deserves a clean swing.',
'Pick the spot. Commit to the club. Execute.',
'Fairway approach. The shot that defines your round.'
],
grn_bnk:[
'The bunker is just sand. Your wedge is designed for sand.',
'Two inches behind. Speed through. That\'s the whole technique.',
'Bunker shot on the green is a win. Don\'t pressure yourself for close.',
'The bounce is your friend. Open the face and let it work.',
'Think splash, not dig. Splash gets it out.',
'Every pro hits bunker shots the same way. Open, behind, through.',
'The bunker is not the enemy. Your deceleration is.',
'Full speed into sand. The sand does the heavy lifting.'
],
water:[
'More club. Less ego. Simple equation.',
'If you wouldn\'t bet $50 on carrying it, don\'t try.',
'Water penalties come in pairs: the stroke and the confidence loss.',
'Lay up to your distance. That\'s an investment, not a surrender.',
'The water is not testing your distance. It\'s testing your judgment.',
'Smart over water = boring score. Hero over water = expensive score.',
'Your caddy says lay up. Listen to your caddy.',
'The drop zone is always an option. It\'s never the plan.'
],
trees:[
'The tree heard your swing thought. It doesn\'t care.',
'One shot out of the trees is one shot saved.',
'Bogey is a score. Not a failure.',
'The gap is an illusion. The trunk is real.',
'Punch out. Two-putt for bogey. Walk to the next tee with a clear head.',
'Your ego will recover from a punch-out. Your score won\'t recover from a triple.',
'The only thing worse than being in the trees is hitting another one.',
'Safe play from the trees IS the hero play. It just doesn\'t feel like it.'
],
chipping:[
'The best chip shots are boring chip shots.',
'Land it, roll it, tap it in. That\'s the dream.',
'A chip to 6 feet is a GOOD chip. Stop being disappointed.',
'The closer you are to the green, the simpler the shot should be.',
'Hands forward. Weight forward. Everything else is style.',
'The bump and run is the highest-percentage chip. Use it when you can.',
'A chip and two putts is par. That\'s not settling. That\'s smart.',
'The landing spot matters more than the swing. Pick it first.'
],
putting:[
'The best putters have the best routines.',
'Speed, speed, speed. Then maybe think about line.',
'Two putts from anywhere = good putting. Period.',
'Lag putting eliminates three-putts. Three-putts eliminate good rounds.',
'The putting stroke is simple. Your brain makes it complicated.',
'Read it once. Trust it. Roll it. Next hole.',
'Uphill is your friend. Downhill is your test.',
'The hole is bigger than you think when you commit to your line.'
],
up_lie:[
'The hill is helping you. Accept the help.',
'Extra height is free. Extra club costs one selection.',
'Uphill is the gentle uneven lie. Don\'t overthink it.',
'Ball goes high, stops fast, pulls left. Three adjustments.',
'The slope is a launch pad. Club up and use it.',
'Uphill lies are where good setup pays off.',
'Match the slope. The slope is on your side here.',
'More club, aim right, smooth swing. Uphill solved.'
],
dn_lie:[
'The ball wants to go low. Let it.',
'Downhill demands commitment. No quitting on this shot.',
'Low and running is the default from here. Plan accordingly.',
'Shoulders down the hill. Swing down the hill. Trust it.',
'Aim short and left. Ball runs further and right.',
'The downhill lie is harder than it looks. Respect it.',
'Stay over the ball. Don\'t fall back up the hill.',
'Weight forward. Chase the ball down the slope.'
],
below_ft:[
'The hanging lie is uncomfortable. That\'s OK. Play through it.',
'Fade is inevitable from here. Aim left and let it happen.',
'Wide stance. Deep knees. Full grip. Stay in posture.',
'The ball wants to go right. Don\'t fight it.',
'Maintain posture. That\'s the only battle from this lie.',
'Extra club covers the fade\'s distance loss.',
'Knee flex is the answer. Stay low through impact.',
'Aim left. Trust the fade. Smooth swing.'
],
above_ft:[
'Free draw from the slope. Use it wisely.',
'Grip down or pay the price with a fat shot.',
'Aim right. The slope handles the rest.',
'Stand taller, swing flatter, trust the draw.',
'Ball above feet is manageable. Grip down and play it.',
'The slope closes your face. That\'s your draw spin.',
'More slope = more draw. Adjust aim accordingly.',
'Grip down. Aim right. Smooth. Above-feet handled.'
]
};
for (const [key, arr] of Object.entries(_xk3)) {
  if (CL.kickers[key]) CL.kickers[key] = CL.kickers[key].concat(arr);
  else CL.kickers[key] = arr;
}

// =============================================
// ADDITIONAL WELCOMES FOR VARIETY
// =============================================
CL.welcomes = CL.welcomes.concat([
{silver:'The first tee is a fresh start.',copper:'The 18th is where you prove it.'},
{silver:'Your clubs are ready.',copper:'Your caddy is ready.'},
{silver:'Fairway. Green. Hole.',copper:'In that order. Every hole.'},
{silver:'Golf is simple.',copper:'Golfers are complicated.'},
{silver:'Somewhere out there, your best round is waiting.',copper:'Today might be the day.'},
{silver:'The greens won\'t read themselves.',copper:'And the caddy can\'t swing for you.'},
{silver:'Warm up your hands. Clear your mind.',copper:'The course is ready when you are.'},
{silver:'One more round.',copper:'One more chance to get it right.'},
{silver:'Light grip. Clear eyes. Full hearts.',copper:'Can\'t lose.'},
{silver:'The ball is on the tee.',copper:'The rest is up to you.'},
{silver:'18 fresh chances.',copper:'Don\'t waste them on hero shots.'},
{silver:'Your caddy has been waiting.',copper:'Let\'s make some smart decisions.'},
{silver:'Same course. Different day.',copper:'Different decisions make different scores.'},
{silver:'Golf doesn\'t get easier.',copper:'You get smarter.'},
{silver:'The caddy remembers everything.',copper:'Especially the hero shots that didn\'t work.'},
{silver:'Ready to play?',copper:'The caddy certainly is.'},
{silver:'New round, old fundamentals.',copper:'Grip light. Head down. Commit.'},
{silver:'Play the course. Not the scorecard.',copper:'The scorecard takes care of itself.'},
{silver:'Your pre-round thought:',copper:'What would a smart golfer do?'},
{silver:'Every round is a story.',copper:'Make this one worth telling.'}
]);

// =============================================
// ADDITIONAL ROASTS FOR SHARE VARIETY
// =============================================
CL.roasts = CL.roasts.concat([
'The caddy said 7-iron. I hit driver. The caddy is no longer speaking to me.',
'My Caddy Logic discipline score is classified for national security reasons.',
'Started listening to the caddy on hole 12. Too little too late.',
'The app said Smart Play. I heard "hold my beer."',
'Caddy Logic gave {total} perfect recommendations. I followed {smart}. Improvement is a journey.',
'Hero shot from the trees. Hero shot into the water. Hero shot into the next fairway. Pattern detected.',
'The caddy\'s report: "Patient seems allergic to good advice."',
'My discipline index would be higher if I didn\'t count the back nine.',
'Caddy said center green. Every time. I aimed at pins. Most of the time.',
'Played 18 holes with Caddy Logic. The caddy deserves a vacation.'
]);

// =============================================
// ADDITIONAL CONFESSIONAL VARIETY
// =============================================
CL.confessionalKickers.allSmart = CL.confessionalKickers.allSmart.concat([
'Not a single hero shot. The scorecard thanks you.',
'100% discipline. 100% caddy-approved.',
'You played smart from start to finish. That\'s rare.',
'The caddy has zero complaints. First time in recorded history.'
]);
CL.confessionalKickers.someHero = CL.confessionalKickers.someHero.concat([
'Smart with a sprinkle of ego. Classic round.',
'The caddy gave an A for effort. A B- for compliance.',
'Mostly disciplined. The exceptions are noted.',
'Good round with a few plot twists.'
]);
CL.confessionalKickers.manyHero = CL.confessionalKickers.manyHero.concat([
'The caddy is considering a career change.',
'Hero shots outnumbered smart plays. The caddy is concerned.',
'If hero shots counted double, you\'d be a great golfer.',
'The caddy spoke. The ego shouted louder.'
]);
CL.confessionalKickers.lowUsage = CL.confessionalKickers.lowUsage.concat([
'The caddy was available all 18 holes. Just saying.',
'One consultation is a start. Eighteen is a strategy.',
'The caddy can\'t help if the caddy doesn\'t get asked.',
'Baby steps. The caddy is patient.'
]);

// =============================================
// ADDITIONAL FLEX KICKERS
// =============================================
CL.flexKickers.perfect = CL.flexKickers.perfect.concat([
'Listened to my caddy every single time. {smart} for {smart}.',
'Discipline index: maximum. Ego index: minimum.',
'{smart} shots. {smart} right decisions. Zero regrets.'
]);
CL.flexKickers.withHero = CL.flexKickers.withHero.concat([
'Caddy recommended smart {smart} times. I listened {smart} times. The other {hero} are pending review.',
'Mostly smart. Occasionally bold. Always interesting.',
'{total} shots with the caddy. {smart} agreements. {hero} creative differences.'
]);

if(typeof module!=='undefined')module.exports=CL;
