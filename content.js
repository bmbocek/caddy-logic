// CADDY LOGIC — Content Database v4.0
// LAYERED ADVICE ENGINE: base terrain advice + slope/obstacle modifiers
// Every instruction explicit for someone who never had a lesson.
// No "normal." No jargon. Physical landmarks. "Toothpaste tube" level.
// Smart Play = safe mechanics. Let It Eat = bold but not stupid.

const CL = {
version: '1.0.4 Beta',

// =============================================
// BAGS
// =============================================
bags: {
'80s':[{name:'Driver',dist:240,on:true,teeOnly:true},{name:'3-Wood',dist:220,on:true},{name:'5-Wood',dist:195,on:true},{name:'3-Hybrid',dist:180,on:true},{name:'4-Hybrid',dist:170,on:true},{name:'5-Iron',dist:160,on:true},{name:'6-Iron',dist:150,on:true},{name:'7-Iron',dist:140,on:true},{name:'8-Iron',dist:130,on:true},{name:'9-Iron',dist:120,on:true},{name:'PW',dist:110,on:true},{name:'GW',dist:90,on:true},{name:'SW',dist:70,on:true}],
'90s':[{name:'Driver',dist:220,on:true,teeOnly:true},{name:'3-Wood',dist:200,on:true},{name:'5-Wood',dist:180,on:true},{name:'4-Hybrid',dist:165,on:true},{name:'5-Hybrid',dist:155,on:true},{name:'6-Iron',dist:140,on:true},{name:'7-Iron',dist:130,on:true},{name:'8-Iron',dist:120,on:true},{name:'9-Iron',dist:110,on:true},{name:'PW',dist:100,on:true},{name:'GW',dist:80,on:true},{name:'SW',dist:65,on:true}],
'100s':[{name:'Driver',dist:200,on:true,teeOnly:true},{name:'3-Wood',dist:180,on:true},{name:'5-Wood',dist:160,on:true},{name:'5-Hybrid',dist:145,on:true},{name:'6-Hybrid',dist:135,on:true},{name:'7-Iron',dist:120,on:true},{name:'8-Iron',dist:110,on:true},{name:'9-Iron',dist:100,on:true},{name:'PW',dist:90,on:true},{name:'GW',dist:75,on:true},{name:'SW',dist:55,on:true}],
'110+':[{name:'Driver',dist:180,on:true,teeOnly:true},{name:'3-Wood',dist:160,on:true},{name:'5-Wood',dist:145,on:true},{name:'6-Hybrid',dist:130,on:true},{name:'7-Iron',dist:110,on:true},{name:'8-Iron',dist:100,on:true},{name:'9-Iron',dist:90,on:true},{name:'PW',dist:80,on:true},{name:'GW',dist:65,on:true},{name:'SW',dist:50,on:true}]
},

// =============================================
// CONDITIONS
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

// Dynamic sub labels for lefty
getSubLabel(key, hand) {
  if (!key) return '';
  const base = this.subLabels[key] || key;
  if (hand === 'left') {
    return base.replace('Go Left', 'Go Left (Fade)').replace('Go Right', 'Go Right (Draw)');
  }
  return base.replace('Go Left', 'Go Left (Draw)').replace('Go Right', 'Go Right (Fade)');
},

// =============================================
// WIND with direction
// =============================================
windSpeeds: [
{label:'0mph',mod:0},
{label:'Light',modFace:3,modBack:-3,modCross:2},
{label:'Moderate',modFace:7,modBack:-5,modCross:3},
{label:'Strong',modFace:12,modBack:-8,modCross:5}
],
windDirections: ['In Face','At Back','Cross Left','Cross Right'],

elevation: [{label:'None',mod:0},{label:'▲ Slight',mod:4},{label:'▲ Steep',mod:10},{label:'▼ Slight',mod:-4},{label:'▼ Steep',mod:-10}],

// Rain and temp modifiers
rainMod: 5,
tempMods: { hot: -5, mild: 0, cold: 7 },

// =============================================
// LAYERED ADVICE ENGINE
// Base advice: full setup for each terrain/sub
// Modifiers: slope + obstacle overlays that modify base
// Merge function combines them
// =============================================

// BASE ADVICE — terrain and sub-scenario specific
// Each has: ball, weight, swing, aim, hands, remember
// Plus: smartText, heroText, heroDanger
base: {
_default: {
  ball:'Short irons (9,PW,GW,SW): middle of stance, between your feet. Mid-irons (7,8): one ball forward of center, in line with your shirt logo. Long irons/hybrids: two balls forward. Woods: inside front heel.',
  weight:'Irons: start 50/50, shift to 70-80% front foot through impact. Hybrids/woods: stay 50/50.',
  swing:'Grip light — like an open tube of toothpaste. Let arms hang straight down. For irons: hit DOWN on the ball to make it go UP. Divot comes AFTER ball. For woods: sweep it off the turf.',
  aim:'Center of the green. Pick a specific spot. Align feet, hips, shoulders parallel to target line.',
  hands:'Hands ahead of ball. Grip end points at your front hip. Ten-finger grip: hands packed tight working as one unit.',
  remember:'Tension kills the swing. Grip light. Shoulders down and relaxed. Smooth back, accelerate through. Finish your swing — don\'t quit.',
  smartText:'center green. Grip light, arms hanging, pick your specific target. Smooth swing, solid contact.',
  heroText:'at the pin. Same fundamentals, smaller target. Full commitment to the swing.',
  heroDanger:'Missing the pin means possibly missing the green. Center green is a 30-foot putt at worst — two putts.'
},
tee_par3: {
  ball:'Irons: tee very low — flush with grass top. Still hit DOWN on it. Woods/Hybrids: tee so 1/4 of ball is above clubface. Play slightly forward of center. Sweep it — level strike.',
  weight:'Irons: start 50/50, shift to 70% front through impact. Woods: even, 50/50.',
  swing:'Smooth tempo. Perfect lie — don\'t swing harder than your practice swing. Grip light. Turn shoulders, don\'t sway hips. Head down until AFTER ball is gone.',
  aim:'Center of the green. Not the pin. The CENTER. Your job is to be on the green, putting.',
  hands:'Hands ahead. Shaft leaning slightly toward target.',
  remember:'Best lie you\'ll have all hole. Smooth swing, solid contact. Don\'t complicate it by swinging harder.',
  smartText:'center green. Smooth tempo off the tee. Perfect lie — don\'t waste it swinging too hard.',
  heroText:'at the flag. Same smooth swing, tighter target. Perfect lie — if you\'re going to attack, now is reasonable.',
  heroDanger:'Pin-seeking means missing the green if you miss. Center green means a putt no matter what.'
},
tee_par45: {
  ball:'Driver: inside front heel. Tee HIGH — half the ball above top of clubface. Lead shoulder slightly higher than trail shoulder. Woods: tee flush with grass, slightly forward of center.',
  weight:'Driver: 60% on back foot at setup. Shift forward through swing. Head stays BEHIND ball at impact. Woods: start 50/50, shift forward.',
  swing:'Driver: sweep UP through ball — feel club going up as it hits. Turn shoulders fully — don\'t sway hips side to side. Keep lead arm extended but relaxed (don\'t lock elbow). Follow through fully — arms high, chest facing target. Woods: smooth sweep off tee.',
  aim:'Center of fairway. It\'s 30-40 yards wide. Huge target. Pick the middle.',
  hands:'Ten-finger grip: hands packed tight, working as one. Grip light — toothpaste tube.',
  remember:'The fairway wins the hole. Not distance. A ball in the fairway sets up everything next.',
  smartText:'to the fairway. Smooth tempo, grip light, turn shoulders. Find the short grass.',
  heroText:'driver, full send. Tee high, weight back, swing UP through it. Head behind ball. Full turn, full finish.',
  heroDanger:'Driver is longest and hardest to control. 3-Wood in the fairway beats driver in the trees. Every time.'
},
fairway: {
  ball:'Short irons: middle of stance. Mid-irons: in line with shirt logo. Long clubs: two balls forward of center.',
  weight:'Start 50/50. Through impact, shift to 70-80% front foot for irons. Even for woods/hybrids.',
  swing:'Grip light — toothpaste tube. Arms hang down. Hit DOWN on irons — divot comes after the ball. Sweep woods/hybrids off the turf. Smooth tempo. Head down until ball is gone.',
  aim:'Center of green. Pick a specific spot on the green — a discoloration, a sprinkler head, anything.',
  hands:'Hands ahead of ball at address and impact. Shaft leans toward target.',
  remember:'Clean lie. Clean swing. This is the shot golf is designed around. Smooth, solid contact. Let the club do the work.',
  smartText:'center green from the fairway. Clean lie, smooth swing. Pick your spot and commit.',
  heroText:'at the pin from the fairway. Clean lie — if you\'re going to attack a pin, this is the time.',
  heroDanger:'Even from a perfect lie, the pin is a small target. Center green is always available.'
},
lt_rough: {
  ball:'Same position as fairway. Don\'t change anything for light rough.',
  weight:'Start 50/50. Through impact, 60% front foot — just a touch more forward than fairway.',
  swing:'Swing a bit more aggressively through impact. Grass grabs the clubface — need speed to cut through. Grip a touch firmer. Don\'t slow down at the ball.',
  aim:'Center green. Grass closes face slightly, pulling ball left (right-handers). Aim a touch right.',
  hands:'Hands ahead. Same as fairway.',
  remember:'One club more. Grass costs a few yards. Aim slightly right — rough closes the face. That\'s it. Light rough is barely a penalty.',
  smartText:'center green. Same as fairway, swing a bit harder through grass. One club more. Aim touch right.',
  heroText:'at the pin. Light rough is almost a fairway lie. Same setup, more commitment through.',
  heroDanger:'Light rough barely changes anything. The danger is overthinking it and getting tense.'
},
dp_rough: {
  ball:'Move ball BACK one ball-width in stance. Steepens your angle to cut through thick grass.',
  weight:'65-70% front foot at address. Keep it there. Don\'t drift back.',
  swing:'Swing AGGRESSIVELY. Thick grass grabs clubface HARD, tries to twist it closed and slow it down. Need speed to power through. Hinge wrists more on backswing for steeper angle. Think chopping, not sweeping.',
  aim:'Aim RIGHT of target (right-handers). Deep grass grabs face, twists closed, pulls ball LEFT. Aim 10-20 yards right.',
  hands:'Hands well ahead. Grip firmer — grass tries to twist club in hands.',
  remember:'Club up TWO. Grass kills distance. 7-iron from deep rough = 9-iron from fairway distance. Aim right. Swing hard. Just advance the ball.',
  smartText:'center green. Ball back, weight forward, grip firm, swing HARD through grass. Club up two. Aim right.',
  heroText:'at the pin from deep rough. Same setup, need perfect contact. Almost no margin.',
  heroDanger:'Miss-hits from deep rough barely move. Grass wins, you advance 20-30 yards.'
},
bare_dirt: {
  ball:'Move back one ball-width. Zero grass under ball — nothing cushions a miss.',
  weight:'65% front foot. Keep planted. Hit ball FIRST, then ground.',
  swing:'Hit DOWN firmly. Ball first, THEN ground scrapes after. Hit behind ball even slightly = club bounces off hard ground = leading edge catches middle = shoots over green like a line drive. Grip down one inch for control.',
  aim:'Center green. Clean contact is the only priority.',
  hands:'Hands well ahead. Shaft leaning forward toward target. This helps hit down.',
  remember:'Hard ground = zero forgiveness. Hit behind ball = club bounces = blade it. Ball back, hands forward, hit down. Only thought.',
  smartText:'center green. Ball back, hands ahead, hit DOWN on ball before ground. Grip down one inch.',
  heroText:'at the pin from hard pan. Perfect ball-first contact gets spin. Miss-hit = disaster.',
  heroDanger:'Fat shots on bare dirt = club bounces off surface = blade it 50 yards over green.'
},
fwy_bnk: {
  ball:'Center or slightly back. MUST hit ball first — NOT sand.',
  weight:'60% front foot. Dig feet into sand about one inch for stability. Grip DOWN one inch to compensate for being lower.',
  swing:'THREE-QUARTER swing MAXIMUM. Smooth tempo. Ball first, then sand. Don\'t try to help ball up — club loft does that. Keep lower body quiet — sand is unstable, big weight shifts cause slipping.',
  aim:'Center green. Clean contact from a fairway bunker IS the win.',
  hands:'Hands ahead. Grip down one inch from top of club.',
  remember:'Ball first. NOT sand first. Sand before ball = 50+ yards lost instantly. Grip down. Dig in. Three-quarter. Ball first.',
  smartText:'center green from sand. Grip down, dig feet in, ball first, three-quarter swing. Control over power.',
  heroText:'at the flag from fairway sand. Full swing needed. Must pure it — sand before impact kills shot.',
  heroDanger:'Full swings from fairway bunkers are one of hardest shots for any golfer. Three-quarter to center green is almost always smarter.'
},
grn_bnk_clean: {
  ball:'FORWARD — in line with front heel. Open stance: feet aim LEFT of target (right-handers). Body faces left, clubface faces target.',
  weight:'60% front foot. Keep it there throughout.',
  swing:'Open clubface BEFORE you grip it. Then grip. Swing along foot line (aims left). Hit SAND 2 inches BEHIND ball. NOT hitting ball — hitting sand behind it. Sand explodes and throws ball up. ACCELERATE through sand. Never slow down — decelerating sticks club in sand, ball stays.',
  aim:'Center green. Ball pops up high, lands soft, stops quick.',
  hands:'Grip AFTER opening face. Light grip. Let club slide through sand.',
  remember:'Hitting SAND, not ball. 2 inches behind. Sand launches ball. Accelerate through. Bounce on bottom of wedge is designed for this.',
  smartText:'out of bunker to center green. Open face, open stance, hit sand 2 inches behind ball. Accelerate. Let sand do the work.',
  heroText:'close to pin. Same technique. Longer backswing = more distance. Shorter = less. Technique doesn\'t change.',
  heroDanger:'Distance control from bunkers takes years. Getting OUT onto any part of green is a great shot.'
},
grn_bnk_plugged: {
  ball:'Center or slightly back. NOT forward like clean lie.',
  weight:'70% front foot. Lean into it.',
  swing:'SQUARE clubface — do NOT open it. Opposite of clean lie. Pick club up steeply by hinging wrists hard. SLAM into sand close behind ball. Hit down HARD. Don\'t worry about follow-through — club might stop in sand and that\'s fine.',
  aim:'Anywhere on green is a WIN.',
  hands:'Hands ahead. Firm grip — slamming into heavy sand.',
  remember:'SQUARE face. NOT open. Key difference from clean lie. Steep swing, slam sand. Ball comes out LOW and RUNNING — plan for roll.',
  smartText:'out of plugged lie. Square face (not open), steep swing, slam sand close behind ball. Comes out low, runs a lot. Anywhere on green is great.',
  heroText:'toward pin from plugged lie. Same technique. Aim to land short — ball will run to hole.',
  heroDanger:'Plugged lies are most unpredictable shot. Sometimes pops out, sometimes doesn\'t. Getting out is the only goal.'
},
grn_bnk_wet: {
  ball:'Center or slightly back.',
  weight:'65% front foot.',
  swing:'Hit CLOSER to ball than dry sand — 1 inch behind instead of 2. Wet sand is HEAVY, doesn\'t splash. Need MORE clubhead speed. Swing harder than you think. Commit fully — slowing down in wet sand buries club.',
  aim:'Center green. Wet sand makes distance unpredictable.',
  hands:'Firm grip. Powering through heavy sand.',
  remember:'Wet sand is heavy. Closer contact (1 inch not 2). More speed. Full commit. Slow down = club stuck = ball stays.',
  smartText:'out of wet sand onto green. Hit closer to ball, swing harder, commit fully. Wet sand punishes hesitation.',
  heroText:'at pin from wet sand. Full speed, full commit.',
  heroDanger:'Wet sand is completely different from dry. Ball can come out screaming or not at all. Just get on green.'
},
divot: {
  ball:'Back one or two ball-widths. Way back. Need STEEP angle to get under ball in the hole.',
  weight:'70% front foot. Planted.',
  swing:'Hit DOWN aggressively — punch ball into ground. Steep angle gets club under ball. Don\'t scoop or help up — causes hitting back edge of divot and skulling it. Hit down, let loft lift.',
  aim:'Center green. Ball comes out LOWER and HOTTER. Runs more on landing. Aim short of pin.',
  hands:'Hands well ahead. Shaft leaning strongly toward target.',
  remember:'Low, hot ball flight. Aim short, plan for run. Steep angle removes loft — 7-iron from divot acts like 5-iron in height.',
  smartText:'center green from divot. Ball back, hands ahead, punch down steeply. Lower flight, more roll.',
  heroText:'at pin from divot. Same punch. Plan for ball to land short and run to flag.',
  heroDanger:'Thin shots from divots are very common. Either perfect or a line drive over the green.'
},
trees_around_l: {
  ball:'Slightly back of center. Helps create inside-out path for a draw/hook that curves left.',
  weight:'50/50. Don\'t change weight for a draw.',
  swing:'Point BODY (feet, hips, shoulders) RIGHT of tree — that\'s where ball starts. Point CLUBFACE at TARGET (left of tree). Swing along BODY line, not at target. Difference between body aim and face aim curves ball left.',
  aim:'Body right of tree. Face at target. Ball starts right, curves left around obstacle.',
  hands:'Grip like you usually would. Don\'t manipulate face with hands — body/face mismatch creates curve.',
  remember:'Body right. Face at target. Swing body line. Ball curves LEFT. COMMIT — half-swings go straight into tree.',
  smartText:'shape it left around the tree. Body aims right of tree, clubface at target. Swing your body line.',
  heroText:'full draw to the green, curving left around tree. Same setup, full commitment.',
  heroDanger:'Not enough curve = tree. Too much = way left. Gap always looks bigger from behind ball.'
},
trees_around_r: {
  ball:'Slightly forward of center. Helps create outside-in path for a fade/slice curving right.',
  weight:'50/50.',
  swing:'Point BODY LEFT of tree. CLUBFACE at TARGET (right of tree). Swing along BODY line. Mismatch creates fade/slice curving right.',
  aim:'Body left. Face at target. Ball starts left, curves right.',
  hands:'Don\'t force curve with hands. Alignment does the work.',
  remember:'Body left. Face at target. Swing body. Ball curves RIGHT. Full commit.',
  smartText:'shape it right around tree. Body left, clubface at target. Swing body line.',
  heroText:'full fade to green, curving right around tree. Full send.',
  heroDanger:'No curve = tree. Too much = way right. Commit fully or pick different shot.'
},
trees_over: {
  ball:'FORWARD — inside front heel. Maximum launch angle.',
  weight:'60% back foot. Stay BEHIND ball. Don\'t slide forward — delofts club, ball won\'t get high enough.',
  swing:'Full swing. Trust club LOFT to get ball up. Do NOT scoop or lift with hands — causes thin shots straight into tree. Swing through, let loft do the lifting.',
  aim:'Straight over tree. Give yourself clearance.',
  hands:'Hands even with ball (not ahead). Preserves loft.',
  remember:'Club loft lifts ball. Not your hands. If not confident you clear it, punch out sideways.',
  smartText:'over tree with high-lofted club. Ball forward, stay behind it, full swing. Trust the loft.',
  heroText:'over tree AT the green. Need height AND distance. Full commitment.',
  heroDanger:'Ball doesn\'t get up fast enough = hits tree, drops to your feet.'
},
trees_punch: {
  ball:'BACK in stance — off back foot or close to it.',
  weight:'70% front foot. Planted.',
  swing:'HALF swing — hands to waist height, no higher. LOW finish — hands stop at waist. Ball comes out low, running. Use 7 or 8 iron.',
  aim:'WIDEST gap to fairway. Largest opening. Safety only.',
  hands:'Hands well ahead. Firm grip.',
  remember:'Low and running. Widest gap. One shot sideways = bogey. Through trees and hit = triple.',
  smartText:'punch to fairway. 7 or 8 iron, ball back, half swing, low finish. Widest gap.',
  heroText:'driver stinger through the gap. Low, screaming, full distance through a window between trunks.',
  heroDanger:'Trees are 90% air, but the 10% that\'s wood always wins. Gap is smaller than it looks.'
},
water_front_over: {
  ball:'Same position for whatever club you chose. Don\'t change setup because of water.',
  weight:'Same as club dictates. Don\'t tighten up. Tension kills distance — over water, lost distance = wet ball.',
  swing:'FULL, COMMITTED swing. Pick target on GREEN past water. Swing to that target. Don\'t think about water. Slowing down over water is #1 cause of wet balls.',
  aim:'Center green. Past the water. Commit to getting ball to the other side.',
  hands:'Same grip. Light — toothpaste tube. Tension is the enemy over water.',
  remember:'Can you carry with TWO clubs to spare? If carry is 150 and water is 140, only 10 yards margin — not enough. Club UP for 20+ yard margin. Can\'t reach with margin? LAY UP.',
  smartText:'over water with SAFE club — carries it with plenty of margin. Not exact-distance club.',
  heroText:'at the pin over water. Tighter club. Full commit — any slowing down = splash.',
  heroDanger:'Exact-distance over water needs PERFECT contact. One yard short = splash. Use more club.'
},
water_front_layup: {
  ball:'Same as a regular fairway shot for whatever club you hit.',
  weight:'Same as a regular fairway shot.',
  swing:'Smooth, controlled swing. Hitting to a SPECIFIC distance — your favorite wedge yardage. Controlled, not maxed out.',
  aim:'Specific spot in fairway that leaves your best wedge distance to green. Not just "short of water" — a SPECIFIC yardage.',
  hands:'Same as regular shot.',
  remember:'Lay up to BEST wedge distance. 80-yard wedge from fairway is way easier than 30-yard pitch from just short of water.',
  smartText:'lay up to your best wedge distance. Smooth, controlled swing to that target.',
  heroText:'go for green over water anyway. Full swing, full commitment, full risk.',
  heroDanger:'Laying up costs one shot. Water costs two (penalty + drop). The math is clear.'
},
water_left: {
  ball:'Same as regular shot.',
  weight:'Same as regular shot.',
  swing:'Same swing. Water is MENTAL hazard here. Biggest danger: getting tense and pulling ball left toward water. Stay loose. Grip light.',
  aim:'Aim RIGHT — AWAY from water. Give cushion. Miss to safe side. Right rough beats water.',
  hands:'Same grip. Don\'t tighten up.',
  remember:'Aim away from water. Miss SAFE. Tension and guiding ball cause exactly the pull you\'re avoiding.',
  smartText:'center-right of green, away from water. Aim to miss safe. Loose grip, confident swing.',
  heroText:'at the pin even with water left. Trust your line. Tension pulls left toward water — stay loose.',
  heroDanger:'Pulls and hooks go in water. Guiding ball away often causes exactly the pull you fear. Aim right, swing free.'
},
water_right: {
  ball:'Same as regular shot.',
  weight:'Same as regular shot.',
  swing:'Same swing. Don\'t guide ball away from water — guiding causes push/slice toward water. Confident, free swing. Stay relaxed.',
  aim:'Aim LEFT — AWAY from water. Miss to safe side.',
  hands:'Light grip. Don\'t squeeze.',
  remember:'Aim away. Miss LEFT is safe. Guiding away from right causes pushes and slices — exactly what puts it in water.',
  smartText:'center-left of green, away from water. Relaxed swing, don\'t guide.',
  heroText:'at the pin with water right. Free, relaxed swing. Tightening up causes the push you fear.',
  heroDanger:'Pushes and slices find water. More you guide away, more likely you push it in. Aim left, swing free.'
},
water_crossing: {
  ball:'Same position for the club.',
  weight:'Same as club dictates.',
  swing:'Full, committed swing. MUST carry this water — no way around. Pick target on other side, commit. Full swing, full follow-through.',
  aim:'Over water to safest landing past it.',
  hands:'Light grip. Stay relaxed. Full swing.',
  remember:'MUST carry. Use club with MARGIN. Carry is 150? Use club you hit 170. Can\'t carry with two clubs to spare? Go sideways.',
  smartText:'over water crossing. Club with plenty of margin. Full, committed swing.',
  heroText:'over crossing at the pin. Tight carry, tight target. Full send.',
  heroDanger:'No layup with crossing water. Carry it or don\'t. Make sure you have enough club.'
},
lip: {
  ball:'FORWARD — inside front heel. Maximum launch.',
  weight:'60% back foot. Stay behind ball to preserve loft.',
  swing:'Full, steep swing with most lofted club (lob or sand wedge). Get ball UP fast. Lip is ALWAYS taller than it looks from bottom.',
  aim:'Over the lip. Pick spot above lip.',
  hands:'Hands even with ball (not ahead). Preserves max loft.',
  remember:'Clear lip or repeat shot. More loft than you think. Lip is ALWAYS taller from down here.',
  smartText:'over lip with max loft. Height is ONLY priority.',
  heroText:'over lip AND control distance. Max loft, full swing, trust height.',
  heroDanger:'Hit lip = ball rolls back to feet. Use more loft than you think.'
},
chipping: {
  ball:'Low chip (lots of green): ball off BACK foot. High chip (over obstacle): ball off FRONT foot. Standard chip: slightly back of center.',
  weight:'70% on FRONT foot. Keep it there the ENTIRE swing. Do NOT shift back. Ever.',
  swing:'Short backswing. ACCELERATE through ball — never slow down at impact (#1 chipping mistake). Like a putt with a little wrist hinge. Follow through LOW and LEFT across your body (right-handers) — do NOT aim arms at target.',
  aim:'Pick specific landing spot on green. Ball flies to that spot, then rolls like a putt the rest of way.',
  hands:'Hands FORWARD — shaft leans toward target. Critical. This is the most important setup detail for chipping.',
  remember:'Get ball on ground ROLLING like a putt as soon as possible. Rolling ball is easier to control. Less loft when you can. Accelerate through — never decelerate.',
  smartText:'chip to center green. Weight forward, hands forward, accelerate through. Get it rolling ASAP.',
  heroText:'chip tight to pin. Same technique, tighter landing spot. Commit to landing zone.',
  heroDanger:'Chipping to tight pin with obstacle = higher shot, less roll. Ball forward, more loft, same acceleration.'
},
putting: {
  ball:'Center of stance. Eyes directly over ball or slightly inside ball line.',
  weight:'Even, 50/50. Slight favor front foot is fine. Stay STILL — zero body movement.',
  swing:'Rock SHOULDERS — pendulum motion. Wrists and lower body completely still. Nothing moves except shoulders. Smooth, even tempo back and through — same speed each direction. Head DOWN, LISTEN for ball to drop. Looking up early ruins stroke — shoulders open.',
  aim:'Speed dictates line. Get PACE right first, then line. Putt that rolls 2 feet past on a miss = right speed. Read break — ball curves toward low side of green.',
  hands:'Light grip. Wrists locked — no wrist action. Shoulders do all work.',
  remember:'Speed first, line second. Head down, listen. Smooth tempo. Wrists dead still. Rock shoulders.',
  smartText:'center of hole. Read break, pick speed, rock shoulders. Head down and listen.',
  heroText:'aggressive line. Same stroke, more pace. Die it in or charge the back — pick one, commit.',
  heroDanger:'Aggressive putting means aggressive comebacks on miss. Give yourself a tap-in if you miss.'
}
},

// =============================================
// SLOPE/OBSTACLE MODIFIERS
// These MODIFY the base terrain advice
// priority: 1=override base, 2=append to base
// =============================================
modifiers: {
up_lie: {
  ballMod: 'ALSO: Move ball slightly FORWARD — uphill moves your low point forward.',
  weightMod: 'SLOPE ADJUSTMENT: Weight naturally falls back on uphill. Lean INTO the hill. Spine perpendicular to slope.',
  swingMod: 'SLOPE: Tilt shoulders to MATCH slope angle. Swing ALONG the hill. Ball will fly HIGHER and pull LEFT.',
  aimMod: 'SLOPE: Aim RIGHT — uphill makes ball go higher and curve left. Club UP one — extra height costs distance. Ball stops dead on landing.',
  extra: 'Shoulders match slope. Higher, shorter, pulls left. Club up. Zero roll — fly it all the way.'
},
dn_lie: {
  ballMod: 'ALSO: Move ball BACK more — downhill moves low point backward.',
  weightMod: 'SLOPE: Weight falls forward naturally. Let it. Keep moving toward target through swing.',
  swingMod: 'SLOPE: Tilt shoulders to MATCH slope — lead shoulder lower. Chase ball DOWN the hill with club after impact. Ball flies LOWER, pushes RIGHT.',
  aimMod: 'SLOPE: Aim LEFT — lower flight, pushes right. Club DOWN one — lower flight adds distance from run. Ball runs A LOT.',
  extra: 'Shoulders match slope. Low flight, lots of run, pushes right. Club down. Aim left.'
},
below_ft: {
  ballMod: 'Keep ball in center of stance.',
  weightMod: 'SLOPE: Weight on heels. WIDEN stance for stability — you\'re reaching down for ball.',
  swingMod: 'SLOPE: Bend MORE from hips. Sit into legs like a barstool. Swing more up-and-down. Grip all the way to end of club for max reach.',
  aimMod: 'SLOPE: Aim LEFT — ball WILL go RIGHT. Guaranteed. Steeper slope = more right.',
  extra: 'WIDEN stance. Bend more. Aim LEFT. Ball WILL fade/push right.'
},
above_ft: {
  ballMod: 'Keep ball in center of stance.',
  weightMod: 'SLOPE: Weight on toes — lean into uphill slope. Ball is closer to you.',
  swingMod: 'SLOPE: Stand TALLER. Grip DOWN 1-2 inches — slope puts ball closer. Swing feels flatter, more around body.',
  aimMod: 'SLOPE: Aim RIGHT — ball WILL go LEFT. Slope closes clubface creating draw/hook. Steeper = more hook.',
  extra: 'GRIP DOWN. Stand taller. Aim RIGHT. Ball WILL draw/hook LEFT.'
},
// Wind modifiers for advice text
wind_face: {
  aimMod: 'WIND: Into the wind. Club up. Swing smooth — DON\'T swing harder. Harder swing = more spin = ball balloons up and loses distance. Smooth tempo with more club is the answer.',
  extra: 'Into wind: more club, smoother swing. NOT harder swing.'
},
wind_back: {
  aimMod: 'WIND: Downwind. Ball will fly further and roll more. Club DOWN. Expect extra distance and run.',
  extra: 'Downwind: club down, expect more distance and roll.'
},
wind_cross_l: {
  aimMod: 'WIND: Crosswind from left. Ball will be pushed RIGHT. Aim LEFT to compensate. The stronger the wind, the further left you aim.',
  extra: 'Wind from left pushes ball right. Aim left.'
},
wind_cross_r: {
  aimMod: 'WIND: Crosswind from right. Ball will be pushed LEFT. Aim RIGHT to compensate.',
  extra: 'Wind from right pushes ball left. Aim right.'
},
rain: {
  swingMod: 'RAIN: Wet conditions. Grip the club firmly — rain makes the grip slippery. Ball won\'t spin as much from wet grass. Expect the ball to fly lower and run more when it lands. Wet greens hold better but fairway shots will skid and run.',
  extra: 'Rain: firmer grip, ball runs more, less spin. Wet greens can actually hold approach shots better.'
}
},

// =============================================
// ADVICE MERGE ENGINE
// Combines base + active modifiers
// =============================================
mergeAdvice(baseKey, activeConditions, windState, windDir, isRaining, hand) {
  const base = this.base[baseKey] || this.base._default;
  const result = { ...base };
  const extras = [];

  // Apply slope modifiers
  for (const cond of activeConditions) {
    const mod = this.modifiers[cond];
    if (mod) {
      if (mod.ballMod) result.ball += '\n\n' + mod.ballMod;
      if (mod.weightMod) result.weight += '\n\n' + mod.weightMod;
      if (mod.swingMod) result.swing += '\n\n' + mod.swingMod;
      if (mod.aimMod) result.aim += '\n\n' + mod.aimMod;
      if (mod.extra) extras.push(mod.extra);
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
      if (windMod.aimMod) result.aim += '\n\n' + windMod.aimMod;
      if (windMod.extra) extras.push(windMod.extra);
    }
  }

  // Rain modifier
  if (isRaining) {
    const rm = this.modifiers.rain;
    if (rm.swingMod) result.swing += '\n\n' + rm.swingMod;
    if (rm.extra) extras.push(rm.extra);
  }

  // Flip directions for lefty
  if (hand === 'left') {
    for (const key of ['ball','weight','swing','aim','hands','remember','smartText','heroText','heroDanger']) {
      if (result[key]) result[key] = this.flipDirections(result[key]);
    }
    extras.forEach((e, i) => { extras[i] = this.flipDirections(e); });
  }

  result.extras = extras;
  return result;
},

// Flip left/right directions for lefty
flipDirections(text) {
  if (!text) return text;
  // Use placeholders to avoid double-swap
  return text
    .replace(/\bLEFT\b/g, '%%RIGHT%%')
    .replace(/\bRIGHT\b/g, '%%LEFT%%')
    .replace(/\bleft\b/g, '%%right%%')
    .replace(/\bright\b/g, '%%left%%')
    .replace(/\(right-handers\)/g, '(left-handers)')
    .replace(/\(right-handed\)/g, '(left-handed)')
    .replace(/%%RIGHT%%/g, 'RIGHT')
    .replace(/%%LEFT%%/g, 'LEFT')
    .replace(/%%right%%/g, 'right')
    .replace(/%%left%%/g, 'left');
},

// =============================================
// KICKERS — 8-12 per situation
// =============================================
kickers: {
_default:['The boring shot is the one your scorecard likes best.','Two putts from the middle beats three from the fringe.','Solid contact. That\'s the whole assignment.','The safe shot is the one you forget by the 19th hole.','A smooth swing beats a hard swing 18 out of 18.','The best shot you hit today will feel easy.','Aim small, miss small.','Trust your yardages. Swing smooth, don\'t force it.','Pick a specific target. Not "the green." A spot.','Tension kills the swing. Grip light.','Center green. Every time.'],
tee_par3:['Perfect lie, big target. Don\'t overthink it.','Tee box can\'t trick you. Rest of the hole can.','Breathe. You chose this club for a reason.','The pin is a distraction. Green is the target.','Tee it, trust it, swing smooth.','Your caddy says center green. Your ego says pin. Your caddy is right.','A two-putt par from center green counts the same as a birdie tap-in.','Every par 3 green has a middle. That\'s your spot.'],
tee_par45:['The fairway is 35 yards wide. Find it.','You don\'t win holes on the tee. You lose them there.','Driver goes further. Fairway wood goes straighter.','Trees are 90% air, but the wood always wins.','3-Wood in fairway beats driver in trees. Every time.','Fairway, approach, two putts. That\'s a good hole.','Your partners don\'t remember your tee shot. They remember your score.','Safe play off the tee sets up everything next.','The most important shot on a par 4 finds the fairway.','Nobody ever said "I wish I\'d tried to hit it further."'],
fairway:['Clean lie. Smooth swing. This is what golf is supposed to feel like.','Fairway shots are where scores are made. Make this one count.','You did the hard work finding the fairway. Now finish the job.','Pick your spot. Trust your club. Commit.','This is the reward for finding the fairway.','Clean lie, clean mind. Just you and the target.'],
lt_rough:['It\'s rough, not a crime scene. You\'re fine.','One club more. That\'s all the grass costs you.','First cut is basically a fairway with attitude.','Don\'t let grass grab your confidence.','Light rough is golf\'s way of saying "close enough."','One extra club and a committed swing. That\'s the play.','Don\'t overthink light rough. Barely a penalty.'],
dp_rough:['Grass took your distance. Don\'t let it take your brain.','Get it out in one. Whole assignment.','Bogey from deep rough is a win.','Aim right. Grass closes face. Every time.','Hero play from deep rough = leading cause of big numbers.','Club up. Swing hard. Aim right. That\'s the recipe.','Ball is sitting down. Your expectations should too.','Advance to fairway. That\'s winning from here.','Two shots from rough to green is fine. One shot that stays in rough is not.'],
bare_dirt:['Ball first. Dirt first = club bounces = trouble.','Hard ground, hard truth: ball before ground.','No grass to save you. Precision or pain.','Ball back, hands forward, hit down. Three thoughts.','Fat shots on hard ground become thin shots over the green.','Ball is sitting on concrete. Treat it that way.'],
fwy_bnk:['Ball first. Iron shot in a sandbox.','Grip down, dig in, ball first. Whole playbook.','Three-quarter swing. Control beats power in sand.','Sand before ball and you try again from same spot.','Every fairway bunker shot starts with: ball first.','Three-quarter from sand that finds green > full swing that stays in bunker.'],
grn_bnk:['Hit the sand hard. It started this fight.','Sand does the work. You just need speed.','Slow down in bunker and you stay in bunker.','Bounce on your wedge was DESIGNED for this.','You\'re not hitting ball. You\'re hitting sand.','A bunker shot onto any part of green is a great shot.','Accelerate. That\'s the whole bunker thought.','Lip is always taller than you think.','Every pro hits bunkers the same way. Open, behind, through.'],
divot:['Someone else\'s divot, your problem.','Lower trajectory, more run. Aim short.','Steep and aggressive. That\'s divot golf.','Plan for run. Coming in hot and low.','Ball back, hands ahead, steep swing. Three moves.','The only way out is down and through.'],
trees:['Sideways to fairway. One shot lost, not three.','Hero shot costs three strokes. Safe play costs one.','Trees are 90% air, but wood always wins.','Gap looks bigger from behind ball.','Punch outs win tournaments. Hero shots win stories nobody believes.','Ball in fairway > three in trees.','Bogey you can live with. Triple haunts you.','Every tree has been hit by someone who thought they could thread it.'],
water:['Golf balls don\'t float. Two clubs margin or lay up.','Splash is louder than you think.','Crisp wedge from fairway beats wet long iron.','Slowing down over water = how balls learn to swim.','Ego says go. Wallet says balls cost $4.','Two clubs margin over water. That\'s the rule.','Laying up costs one shot. Water costs two. Math is clear.','Full commit or lay up. No middle ground.','Water is mental. Your swing doesn\'t know it\'s there.'],
lip:['Lip is non-negotiable. Clear it or repeat.','Get it OUT first. CLOSE second.','More loft than you think. Always taller from down here.','Height first. Everything else is bonus.','Hit lip = ball rolls back to feet.'],
chipping:['Get ball on ground rolling ASAP.','Weight forward. Hands forward. Accelerate.','Landing spot first, then let it roll like a putt.','Decelerating is #1 chipping mistake.','Less loft when you can. More when you must.','Follow through LOW and LEFT. Don\'t aim arms at target.'],
putting:['Speed dictates line. Pace first.','Head down. Listen for it.','Rock shoulders. Nothing else moves.','2 feet past on a miss = right speed.','Wrists dead still. Shoulders only.','Two putts from anywhere is never bad.'],
up_lie:['Hill is eating distance. Feed it an extra club.','Lean into slope. Match it.','Shoulders match slope. That\'s the entire thought.','Club up. Zero roll on landing.','Ball goes higher and left. Aim right, club up.'],
dn_lie:['Low and running. Aim short.','Gravity is undefeated.','Coming out hot and low. Plan for run.','Club down. Slope adds distance you didn\'t ask for.','Ball runs 20% further than expected.'],
below_ft:['Ball is going right. Aim left. That\'s the secret.','Widen. Bend. Aim left. Three words.','Fade is guaranteed. Plan for it.','Sit into it like a barstool.'],
above_ft:['Going left. Aim further right than comfortable.','Choke up, aim right, trust the draw.','Grip down so you don\'t chunk into hill.','Free draw spin from slope. Use it — aim right.']
},

// =============================================
// WELCOMES
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
{silver:'The course doesn\'t know your handicap.',copper:'Play smarter than your number.'}
],

// =============================================
// CONFESSIONAL KICKERS
// =============================================
confessionalKickers: {
allSmart:['Zero hero shots. Zero drama. The caddy is impressed.','You listened every time. Rarer than you think.','All smart, all day. Boring golfer wins.','Perfect discipline. Caddy has nothing to complain about.'],
someHero:['How\'d that work out?','The caddy tried to warn you.','Bold choices were made.','You asked then did the opposite. Classic.','Almost perfect discipline. Almost.'],
manyHero:['Caddy is questioning your commitment.','Multiple hero attempts. Ego was in charge.','You asked a lot. Listened... less.','The gap between knowing and doing.'],
lowUsage:['Everyone starts somewhere. Open the app more.','Imagine if you asked on every trouble shot.','One consultation. One smart decision. Build from there.']
},

flexKickers: {
perfect:['{smart} shots. {smart} times I listened. Discipline.','{smart} for {smart}. Ego took the day off. — Caddy Logic'],
withHero:['{total} shots. {smart} smart, {hero} hero. Caddy has notes.','Listened {smart} out of {total} times. No comment on the rest.']
},

roasts: [
'Consulted Caddy Logic {total} times. Listened {smart}. That hero shot? Don\'t ask.',
'Caddy app said center green. I said "I can reach that pin." I could not.',
'"How\'d that work out?" is now my least favorite question. Thanks @CaddyLogic.',
'Caddy Logic said lay up. I said "I can carry the water." The water said no.',
'{total} shots. Caddy was right {smart} times. My ego was right... still calculating.',
'Caddy app said punch out. I went through the trees. Trees: 1. Me: 0.'
],

everySwing: 'Grip light — like an open tube of toothpaste. Arms hang straight down. Pick a specific target. Feet, hips, shoulders parallel to target line. Head down. Smooth back, accelerate through. Finish your swing.',

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
  // Find shortest club that reaches (enough club)
  let best=null;
  for(let i=active.length-1;i>=0;i--){if(active[i].dist>=dist){best=active[i];break;}}
  if(!best)best=active[0];
  return best;
},

// Hero club — bold but not stupid. 1-2 clubs more aggressive. CAN use driver for punch stinger.
findHeroClub(bag,smartClub,dist,isTee,isPunch){
  const active=bag.filter(c=>c.on&&(isTee||isPunch||!c.teeOnly)).sort((a,b)=>b.dist-a.dist);
  if(isPunch)return active[0]; // driver stinger for hero punch
  const smartIdx=active.findIndex(c=>c.name===smartClub.name);
  if(smartIdx>0)return active[smartIdx-1]; // one club longer/more aggressive
  return active[0]; // already longest
},

// Layup calculator: given distance to green and best wedge distance, find the layup club
findLayupClub(bag, distToGreen, bestWedgeDist) {
  const layupDist = distToGreen - bestWedgeDist;
  if (layupDist <= 0) return null;
  return this.findClub(bag, layupDist, false);
},

// Best wedge distance: find the distance the golfer's shortest club goes
getBestWedgeDist(bag) {
  const active = bag.filter(c => c.on && !c.teeOnly).sort((a, b) => a.dist - b.dist);
  if (!active.length) return 80;
  // Second shortest is usually better than absolute shortest
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

// Short game detection
isShortGame(yardage) {
  return yardage > 0 && yardage <= 60;
},

// Detect if this is a putting situation (very short, on green)
isPutting(yardage) {
  return yardage > 0 && yardage <= 15;
}
};

if(typeof module!=='undefined')module.exports=CL;
