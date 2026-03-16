// CADDY LOGIC — Content Database v3.0
// GOLDEN RULE: Every instruction explicit for someone who never had a lesson.
// No "normal." No jargon. Physical landmarks only.
// Smart Play = safe mechanics. Let It Eat = bold but not stupid.

const CL = {
version:'1.0.1 Beta',
bags:{
'80s':[{name:'Driver',dist:240,on:true,teeOnly:true},{name:'3-Wood',dist:220,on:true},{name:'5-Wood',dist:195,on:true},{name:'3-Hybrid',dist:180,on:true},{name:'4-Hybrid',dist:170,on:true},{name:'5-Iron',dist:160,on:true},{name:'6-Iron',dist:150,on:true},{name:'7-Iron',dist:140,on:true},{name:'8-Iron',dist:130,on:true},{name:'9-Iron',dist:120,on:true},{name:'PW',dist:110,on:true},{name:'GW',dist:90,on:true},{name:'SW',dist:70,on:true}],
'90s':[{name:'Driver',dist:220,on:true,teeOnly:true},{name:'3-Wood',dist:200,on:true},{name:'5-Wood',dist:180,on:true},{name:'4-Hybrid',dist:165,on:true},{name:'5-Hybrid',dist:155,on:true},{name:'6-Iron',dist:140,on:true},{name:'7-Iron',dist:130,on:true},{name:'8-Iron',dist:120,on:true},{name:'9-Iron',dist:110,on:true},{name:'PW',dist:100,on:true},{name:'GW',dist:80,on:true},{name:'SW',dist:65,on:true}],
'100s':[{name:'Driver',dist:200,on:true,teeOnly:true},{name:'3-Wood',dist:180,on:true},{name:'5-Wood',dist:160,on:true},{name:'5-Hybrid',dist:145,on:true},{name:'6-Hybrid',dist:135,on:true},{name:'7-Iron',dist:120,on:true},{name:'8-Iron',dist:110,on:true},{name:'9-Iron',dist:100,on:true},{name:'PW',dist:90,on:true},{name:'GW',dist:75,on:true},{name:'SW',dist:55,on:true}],
'110+':[{name:'Driver',dist:180,on:true,teeOnly:true},{name:'3-Wood',dist:160,on:true},{name:'5-Wood',dist:145,on:true},{name:'6-Hybrid',dist:130,on:true},{name:'7-Iron',dist:110,on:true},{name:'8-Iron',dist:100,on:true},{name:'9-Iron',dist:90,on:true},{name:'PW',dist:80,on:true},{name:'GW',dist:65,on:true},{name:'SW',dist:50,on:true}]
},
conditions:{
tee:{label:'Tee',mod:0,group:'terrain',hasSub:true},fairway:{label:'Fairway',mod:0,group:'terrain'},
lt_rough:{label:'Lt Rough',mod:3,group:'terrain'},dp_rough:{label:'Dp Rough',mod:7,group:'terrain'},
bare_dirt:{label:'Bare Dirt',mod:0,group:'terrain'},fwy_bnk:{label:'Fwy Bnk',mod:7,group:'terrain'},
grn_bnk:{label:'Grn Bnk',mod:5,group:'terrain',hasSub:true},divot:{label:'Divot',mod:3,group:'terrain'},
up_lie:{label:'Up Lie',mod:0,group:'slope'},dn_lie:{label:'Dn Lie',mod:0,group:'slope'},
below_ft:{label:'Below Ft',mod:0,group:'slope'},above_ft:{label:'Above Ft',mod:0,group:'slope'},
trees:{label:'Trees',mod:0,group:'obstacle',hasSub:true},water:{label:'Water',mod:0,group:'obstacle',hasSub:true},
lip:{label:'Lip',mod:0,group:'obstacle'}
},
subLabels:{
tee_par3:'Tee · Par 3',tee_par45:'Tee · Par 4/5',
trees_around_l:'Trees · Go Left (Draw)',trees_around_r:'Trees · Go Right (Fade)',
trees_over:'Trees · Go Over',trees_punch:'Trees · Punch Out',
grn_bnk_clean:'Bunker · Clean',grn_bnk_plugged:'Bunker · Plugged',grn_bnk_wet:'Bunker · Wet Sand',
water_front_over:'Water Front · Over',water_front_layup:'Water Front · Lay Up',
water_left:'Water Left',water_right:'Water Right',water_crossing:'Water Crossing'
},
windSpeeds:[
{label:'0mph',mod:0},
{label:'Light',modFace:3,modBack:-3,modCross:2},
{label:'Moderate',modFace:7,modBack:-5,modCross:3},
{label:'Strong',modFace:12,modBack:-8,modCross:5}
],
windDirections:['In Face','At Back','Cross Left','Cross Right'],
elevation:[{label:'None',mod:0},{label:'▲ Slight',mod:4},{label:'▲ Steep',mod:10},{label:'▼ Slight',mod:-4},{label:'▼ Steep',mod:-10}],
rainMod:5,
advice:{
_default:{
ball:'Short irons (9,PW,GW,SW): middle of stance, right between your feet. Mid-irons (7,8): one ball forward of center, in line with your shirt logo. Long irons/hybrids: two balls forward. Woods: inside your front heel.',
weight:'Irons: start 50/50, shift to 70-80% front foot as you swing through the ball. Hybrids/woods: stay 50/50 throughout.',
swing:'Grip light — hold it like an open tube of toothpaste. Let arms hang straight down. For irons: hit DOWN on the ball to make it go UP. The divot comes AFTER the ball. For woods/hybrids: sweep it off the turf, level strike.',
aim:'Center of the green. Pick a specific spot. Align feet, hips, and shoulders all parallel to your target line.',
hands:'Hands ahead of the ball at address. Grip end of club points at your front hip.',
remember:'Tension kills the swing. Grip light. Shoulders down and relaxed. Smooth back, accelerate through. Finish your swing.',
smartText:'center green. Grip light, arms hanging, pick your target. Smooth swing, solid contact.',
heroText:'at the pin. Same fundamentals, smaller target. Full commitment.',
heroDanger:'Missing the pin means possibly missing the green. Center green is a 30-foot putt at worst — two putts.'
},
tee_par3:{
ball:'Irons: tee it very low — flush with the top of the grass. Still hit DOWN on it. Woods/Hybrids: tee so 1/4 of ball is above the clubface. Sweep it — level strike.',
weight:'Irons: start 50/50, shift to 70% front foot through impact. Woods: even, 50/50.',
swing:'Smooth tempo. This is a perfect lie — don\'t swing harder than your practice swing. Grip light. Turn shoulders, don\'t sway hips. Head down until AFTER the ball is gone.',
aim:'Center of the green. Not the pin. The CENTER.',
hands:'Hands ahead. Shaft leaning slightly toward target.',
remember:'Best lie you\'ll have all hole. Don\'t complicate it by swinging harder. Smooth is far.',
smartText:'center green. Smooth tempo off the tee. Perfect lie — don\'t waste it swinging too hard.',
heroText:'at the flag. Same smooth swing, tighter target. The lie is perfect — if you\'re going to attack, now is the time.',
heroDanger:'Pin-seeking means missing the green if you miss. Center green means a putt no matter what.'
},
tee_par45:{
ball:'Driver: inside front heel. Tee HIGH — half the ball above the top of the clubface. Lead shoulder slightly higher than trail shoulder. Woods: tee flush with the grass, slightly forward of center.',
weight:'Driver: 60% on back foot at setup. Shift forward as you swing through. Head stays BEHIND the ball at impact. Woods: start 50/50, shift forward.',
swing:'Driver: sweep UP through the ball — feel the club going up as it hits. Turn shoulders fully — don\'t sway hips side to side. Keep lead arm extended but relaxed. Follow through fully — arms high, chest facing target. Woods: smooth sweep off the tee.',
aim:'Center of the fairway. It\'s 30-40 yards wide. Huge target.',
hands:'Ten-finger grip: hands packed tight, working as one unit. Grip light — toothpaste tube.',
remember:'The fairway wins the hole. Not distance. A ball in the fairway sets up everything next.',
smartText:'to the fairway. Smooth tempo, grip light, turn your shoulders. Find the short grass.',
heroText:'driver, full send. Tee it high, weight back, swing UP. Head behind the ball. Full turn, full finish.',
heroDanger:'Driver is the longest and hardest to control. 3-Wood in the fairway beats driver in the trees. Every time.'
},
lt_rough:{
ball:'Same position as a fairway shot. Don\'t change anything for light rough.',
weight:'Start 50/50. Through impact, 60% front foot — just a touch more forward than a fairway shot.',
swing:'Swing a bit more aggressively through impact. The grass grabs the clubface — you need speed to cut through. Grip a touch firmer.',
aim:'Center green. Grass closes the face slightly, pulling ball left (right-handers). Aim a touch right.',
hands:'Hands ahead of ball. Same as fairway.',
remember:'One club more. Grass costs a few yards. Aim slightly right — rough closes the face.',
smartText:'center green. Same as fairway, swing a bit harder through the grass. One club more. Aim a touch right.',
heroText:'at the pin. Light rough is almost a fairway lie. Same setup, more commitment through.',
heroDanger:'Light rough barely changes anything. The real danger is overthinking it and getting tense.'
},
dp_rough:{
ball:'Move ball BACK one ball-width in stance. This steepens your angle to cut through thick grass.',
weight:'65-70% front foot at address. Keep it there. Don\'t drift back.',
swing:'Swing AGGRESSIVELY. Thick grass grabs the clubface HARD and tries to twist it closed. You need speed to power through. Hinge wrists more on backswing for steeper angle down to ball.',
aim:'Aim RIGHT of target (right-handers). Deep grass grabs face and twists it closed, pulling ball LEFT. Aim 10-20 yards right.',
hands:'Hands well ahead. Grip firmer — grass tries to twist the club.',
remember:'Club up TWO. Grass kills distance. Aim right. Swing hard. Just advance the ball.',
smartText:'center green. Ball back, weight forward, grip firm, swing HARD through the grass. Club up two. Aim right.',
heroText:'at the pin from deep rough. Same setup but you need perfect contact. Almost no margin.',
heroDanger:'Miss-hits from deep rough barely move. The grass wins and you advance 20-30 yards.'
},
bare_dirt:{
ball:'Move back one ball-width. Zero grass under the ball — nothing to cushion a miss.',
weight:'65% front foot. Keep it planted. Hit ball FIRST, then ground.',
swing:'Hit DOWN firmly. Ball first, THEN ground scrapes after. If you hit behind the ball, club bounces off hard ground and the leading edge catches the middle — it shoots over the green. Grip down one inch.',
aim:'Center green. Clean contact is the only priority.',
hands:'Hands well ahead. Shaft leaning forward toward target.',
remember:'Hard ground = zero forgiveness. Hit behind the ball and the club bounces. Ball back, hands forward, hit down.',
smartText:'center green. Ball back, hands ahead, hit DOWN before the ground. Grip down one inch.',
heroText:'at the pin from hard pan. Perfect ball-first contact gets you spin. Miss-hit is disaster.',
heroDanger:'Fat shots on bare dirt = club bounces off surface = you blade it 50 yards over the green.'
},
fwy_bnk:{
ball:'Center of stance or slightly back. MUST hit ball first — not sand.',
weight:'60% front foot. Dig feet into sand about one inch for stability. Grip DOWN one inch to compensate for being lower.',
swing:'THREE-QUARTER swing maximum. Smooth tempo. Ball first, then sand. Don\'t try to help ball up. Keep lower body quiet — sand is unstable, big weight shifts cause slipping.',
aim:'Center green. Clean contact from a fairway bunker IS the win.',
hands:'Hands ahead. Grip down one inch from top of club.',
remember:'Ball first. NOT sand first. Sand before ball = 50+ yards lost instantly. Grip down. Dig in. Three-quarter. Ball first.',
smartText:'center green from sand. Grip down, dig feet in, ball first, three-quarter swing. Control over power.',
heroText:'at the flag from fairway sand. Full swing. Must pure it — any sand before impact kills the shot.',
heroDanger:'Full swings from fairway bunkers are one of the hardest shots in golf. Three-quarter to center green is almost always smarter.'
},
grn_bnk_clean:{
ball:'FORWARD — in line with front heel. Open stance: feet aim LEFT of target (right-handers). Body faces left, clubface faces target.',
weight:'60% front foot. Keep it there throughout.',
swing:'Open clubface BEFORE you grip it. Then grip. Swing along your foot line (aims left). Hit SAND 2 inches BEHIND ball. You\'re NOT hitting the ball — hitting the sand behind it. Sand explodes and throws ball up. ACCELERATE through — never slow down in a bunker.',
aim:'Center of green. Ball pops up high, lands soft, stops quick.',
hands:'Grip AFTER opening face. Light grip. Let club slide through sand.',
remember:'Hit SAND, not ball. 2 inches behind. Sand launches ball. Accelerate through. The bounce on your wedge is designed for this.',
smartText:'out of the bunker to center green. Open face, open stance, hit sand 2 inches behind ball. Accelerate. Let sand do the work.',
heroText:'close to the pin. Same technique. Longer backswing = more distance. Shorter = less. Technique stays the same.',
heroDanger:'Distance control from bunkers takes years. Getting OUT onto any part of the green is a great shot.'
},
grn_bnk_plugged:{
ball:'Center or slightly back. NOT forward like a clean lie.',
weight:'70% front foot. Lean into it.',
swing:'SQUARE the clubface — do NOT open it. Opposite of clean lie. Pick club up steeply by hinging wrists hard. SLAM into sand close behind ball. Hit down HARD. Don\'t worry about follow-through — club might stop in sand.',
aim:'Anywhere on the green is a WIN.',
hands:'Hands ahead. Firm grip — slamming into heavy sand.',
remember:'SQUARE face. NOT open. Key difference from clean lie. Steep swing, slam sand. Ball comes out LOW and RUNNING — plan for roll.',
smartText:'out of plugged lie. Square face (not open), steep swing, slam sand close behind ball. Comes out low, runs a lot. Anywhere on green is great.',
heroText:'toward the pin from plugged lie. Same technique. Aim to land short — ball will run to hole.',
heroDanger:'Plugged lies are the most unpredictable shot. Sometimes pops out, sometimes doesn\'t. Getting out is the only goal.'
},
grn_bnk_wet:{
ball:'Center or slightly back.',
weight:'65% front foot.',
swing:'Hit CLOSER to ball than dry sand — 1 inch behind instead of 2. Wet sand is HEAVY, doesn\'t splash. Need MORE speed. Swing harder than you think. Commit — slowing down in wet sand buries the club.',
aim:'Center green. Wet sand makes distance unpredictable.',
hands:'Firm grip. Powering through heavy sand.',
remember:'Wet sand is heavy. Closer contact (1 inch not 2). More speed. Full commit. Slow down = club stuck = ball stays.',
smartText:'out of wet sand onto green. Hit closer to ball, swing harder, commit fully. Wet sand punishes hesitation.',
heroText:'at the pin from wet sand. Full speed, full commit.',
heroDanger:'Wet sand is completely different from dry. Ball can come out screaming or not at all. Just get on the green.'
},
divot:{
ball:'Back one or two ball-widths. Way back. Need steep angle to get under ball in the divot hole.',
weight:'70% front foot. Planted.',
swing:'Hit DOWN aggressively — punch ball into the ground. Steep angle gets club under ball. Don\'t scoop or help it up — that causes you to hit the back edge of the divot and skull it. Hit down, let loft lift it.',
aim:'Center green. Ball comes out LOWER and HOTTER. Runs more on landing. Aim short of pin.',
hands:'Hands well ahead. Shaft leaning strongly toward target.',
remember:'Low, hot ball flight. Aim short, plan for run. The steep angle removes loft — 7-iron from divot acts like 5-iron in height.',
smartText:'center green from divot. Ball back, hands ahead, punch down steeply. Lower flight, more roll.',
heroText:'at the pin from divot. Same punch. Plan for ball to land short and run to flag.',
heroDanger:'Thin shots from divots are very common. Either perfect or a line drive over the green.'
},
up_lie:{
ball:'Slightly forward — uphill moves your low point forward.',
weight:'Weight naturally falls back because of hill. Don\'t fight it. Lean INTO hill so spine is roughly perpendicular to slope.',
swing:'Tilt shoulders to MATCH slope angle. If ground goes up-left, right shoulder drops. Swing ALONG the hill, following slope. Ball flies HIGHER and pulls LEFT (right-handers).',
aim:'Aim RIGHT. Uphill makes ball go higher and curve left. Club UP one — extra height costs distance. Ball stops dead on landing (no roll).',
hands:'Hands in line with ball or slightly ahead.',
remember:'Shoulders match slope. Higher, shorter, pulls left. Club up. No roll — fly it the full distance.',
smartText:'center green. Match shoulders to hill. Swing along slope. Club up — uphill eats distance. Aim right — pulls left.',
heroText:'at the pin from uphill. Same slope setup. Aim right of pin, let natural left pull bring it back.',
heroDanger:'Ball stops DEAD uphill. Zero roll. Must fly it the full distance to target.'
},
dn_lie:{
ball:'BACK in stance — downhill moves low point backward.',
weight:'Falls forward naturally. Let it. Keep moving toward target.',
swing:'Shoulders MATCH slope — lead shoulder lower. Chase ball DOWN the hill with club after impact. Ball flies LOWER, pushes RIGHT (right-handers). Runs a LOT.',
aim:'Aim LEFT. Lower flight, pushes right. Club DOWN one — lower flight adds distance from run.',
hands:'Hands ahead. Shaft leans toward target.',
remember:'Shoulders match slope. Low flight, lots of run, pushes right. Club down. Aim left. Land short, let it run.',
smartText:'center green. Match shoulders to downhill. Swing along slope. Club down — ball runs. Aim left — pushes right.',
heroText:'at the pin downhill. Low, running shot. Land short, let run bring it to flag.',
heroDanger:'Low, fast-running shots. Easy to fly the green because ball doesn\'t check up.'
},
below_ft:{
ball:'Center of stance.',
weight:'On your heels. WIDEN stance for stability. You\'re reaching down for the ball.',
swing:'Bend MORE from hips. Sit into legs like a barstool. Swing is more up-and-down than around body. Grip all the way to end of club for maximum reach.',
aim:'Aim LEFT. Ball WILL go RIGHT (right-handers). Steeper slope = more right. Guaranteed.',
hands:'Grip to end of club. Hands ahead.',
remember:'WIDEN stance. Bend more. Aim LEFT. Ball WILL fade/push right. The steeper the slope, the further right.',
smartText:'center green, aim LEFT. Widen stance, bend from hips, sit into legs. Ball will drift right — plan for it.',
heroText:'at the pin, aiming left. Let natural rightward drift bring it back to target.',
heroDanger:'Ball going right is guaranteed. Aim right AND it pushes right = double the miss.'
},
above_ft:{
ball:'Center of stance.',
weight:'On your toes — lean into uphill slope. Ball is closer to you.',
swing:'Stand TALLER. Grip DOWN 1-2 inches — slope puts ball closer, full club length hits ground behind ball. Swing feels flatter, more around body.',
aim:'Aim RIGHT. Ball WILL go LEFT (right-handers). Slope closes clubface creating draw/hook. Steeper = more hook.',
hands:'Grip down 1-2 inches from top.',
remember:'GRIP DOWN. Stand taller. Aim RIGHT. Ball WILL draw/hook LEFT. Aim left AND it hooks = serious trouble.',
smartText:'center green, aim RIGHT. Grip down, stand taller, lean into slope. Ball will draw/hook left.',
heroText:'at the pin, playing natural draw. Aim right of flag, let slope bring it back.',
heroDanger:'Hook left is guaranteed. Aim left AND it hooks = way off target. Always aim right.'
},
trees_around_l:{
ball:'Slightly back of center to help create inside-out path for a draw.',
weight:'50/50. Don\'t change weight for a draw.',
swing:'Point BODY (feet, hips, shoulders) RIGHT of tree — that\'s where ball starts. Point CLUBFACE at TARGET (left of tree). Swing along BODY line. Difference between body aim and face aim creates LEFT curve.',
aim:'Body right of tree. Face at target. Ball starts right, curves left around obstacle.',
hands:'Grip like you usually would. Don\'t manipulate face with hands — body/face mismatch creates curve.',
remember:'Body right. Face at target. Swing body line. Ball curves LEFT. COMMIT — half-swings go straight into tree.',
smartText:'draw left around tree. Body aims right of tree, clubface at target. Swing your body line — ball curves left.',
heroText:'full draw to the green, curving left around tree. Same setup, full commitment to the shape.',
heroDanger:'Not enough curve = tree. Too much curve = way left. Gap always looks bigger from behind the ball.'
},
trees_around_r:{
ball:'Slightly forward of center for outside-in path creating a fade.',
weight:'50/50.',
swing:'Point BODY LEFT of tree. CLUBFACE at TARGET (right of tree). Swing along BODY line. Mismatch creates fade/slice curving RIGHT.',
aim:'Body left. Face at target. Ball starts left, curves right.',
hands:'Don\'t force curve with hands. Alignment does the work.',
remember:'Body left. Face at target. Swing body. Ball curves RIGHT. Full commit.',
smartText:'fade right around tree. Body left, clubface at target. Swing body line — ball curves right.',
heroText:'full fade to the green, curving right around tree. Full send.',
heroDanger:'No curve = tree. Too much = way right. Commit completely or pick a different shot.'
},
trees_over:{
ball:'FORWARD — inside front heel. Maximum launch angle.',
weight:'60% back foot. Stay BEHIND ball. Don\'t slide forward — that delofts and ball won\'t get high enough.',
swing:'Full swing. Trust club LOFT to get ball up. Do NOT scoop or lift with hands — causes thin shots straight into tree. Swing through, let loft do the lifting.',
aim:'Straight over tree. Give yourself clearance.',
hands:'Hands even with ball (not ahead). Preserves loft.',
remember:'Club loft lifts ball. Not your hands. If not confident you clear it, punch out sideways.',
smartText:'over tree with high-lofted club. Ball forward, stay behind it, full swing. Trust loft.',
heroText:'over tree AT the green. Need height AND distance. Full commitment.',
heroDanger:'Ball doesn\'t get up fast enough = hits tree, drops to your feet.'
},
trees_punch:{
ball:'BACK in stance — off back foot or close to it.',
weight:'70% front foot. Planted.',
swing:'HALF swing — hands to waist height, no higher. LOW finish — hands stop at waist. Ball comes out low, running. Use 7 or 8 iron.',
aim:'WIDEST gap to fairway. Largest opening between trees. Safety only.',
hands:'Hands well ahead. Firm grip.',
remember:'Low and running. Widest gap. One shot sideways = bogey. Through the trees and hit = triple.',
smartText:'punch to fairway. 7 or 8 iron, ball back, half swing, low finish. Widest gap. Fairway in one.',
heroText:'driver stinger through the gap. Tee-height contact, sweeping blow, ball stays under branches. Full distance through the window.',
heroDanger:'Trees are 90% air, but the 10% that\'s wood always wins. The gap is smaller than it looks.'
},
water_front_over:{
ball:'Same position for whatever club you chose. Don\'t change setup because of water.',
weight:'Same as the club dictates. Don\'t tighten up. Tension kills distance — over water, lost distance = wet ball.',
swing:'FULL, COMMITTED swing. Pick target on GREEN past the water. Swing to that target. Don\'t think about water. Slowing down over water is the #1 cause of wet balls. Commit.',
aim:'Center green. Past the water. Commit to getting ball to other side.',
hands:'Same grip. Grip LIGHT — toothpaste tube. Tension is the enemy over water.',
remember:'Can you carry with TWO clubs to spare? If carry is 150 and water is 140, only 10 yards margin — not enough. Club UP for 20+ yard margin. Can\'t reach with margin? LAY UP.',
smartText:'over water with SAFE club — carries it with plenty of margin. Not exact-distance club. Smooth, committed swing.',
heroText:'at the pin over water. Tighter club selection. Full commit — any slowing down and ball goes swimming.',
heroDanger:'Exact-distance club over water needs PERFECT contact. One yard short = splash. Use more club.'
},
water_front_layup:{
ball:'Same as a regular fairway shot.',
weight:'Same as a regular fairway shot.',
swing:'Smooth, controlled swing. You\'re hitting to a SPECIFIC distance — your favorite wedge yardage. If you love your pitching wedge from 90 yards, land it 90 yards out.',
aim:'Specific spot in fairway that leaves your best wedge distance. Not just "short of water" — a SPECIFIC yardage.',
hands:'Same as regular shot.',
remember:'Lay up to your BEST wedge distance. 80-yard wedge from fairway is way easier than 30-yard pitch from just short of water.',
smartText:'lay up to your best wedge distance. Smooth, controlled swing to that target. Crisp wedge from fairway beats wet ball.',
heroText:'go for the green over water anyway. Full swing, full commitment, full risk.',
heroDanger:'Laying up costs one shot. Water costs two (penalty + drop). The math is clear.'
},
water_left:{
ball:'Same as a regular shot.',
weight:'Same as a regular shot.',
swing:'Same swing. Water is a MENTAL hazard here. Biggest danger is getting tense and pulling ball left toward water. Stay loose. Grip light.',
aim:'Aim RIGHT — AWAY from water. Give yourself a cushion. Miss to the safe side. Right rough beats water.',
hands:'Same grip. Don\'t tighten up.',
remember:'Aim away from water. Miss to SAFE side. Tension and trying to guide the ball cause exactly the pull you\'re trying to avoid.',
smartText:'center-right of green, away from water. Aim to miss safe. Loose grip, confident swing.',
heroText:'at the pin even with water left. Trust your line. Tension pulls ball left toward water — stay loose.',
heroDanger:'Pulls and hooks go in the water. Trying to guide ball away often causes exactly the pull you fear. Aim right, swing free.'
},
water_right:{
ball:'Same as a regular shot.',
weight:'Same as a regular shot.',
swing:'Same swing. Don\'t try to guide ball away from water — guiding causes the push/slice toward water. Confident, free swing. Stay relaxed.',
aim:'Aim LEFT — AWAY from water. Miss to safe side.',
hands:'Light grip. Don\'t squeeze.',
remember:'Aim away. Miss LEFT is safe. Trying to guide away from right side causes pushes and slices — exactly what puts it in water.',
smartText:'center-left of green, away from water. Relaxed swing, don\'t guide. Left rough beats penalty.',
heroText:'at the pin with water right. Free, relaxed swing. Tightening up causes the push you fear.',
heroDanger:'Pushes and slices find water. More you try to guide away, more likely you push it in. Aim left, swing free.'
},
water_crossing:{
ball:'Same position for the club.',
weight:'Same as the club dictates.',
swing:'Full, committed swing. MUST carry this water — no way around. Pick target on other side, commit. Full swing, full follow-through.',
aim:'Over the water to safest landing past it.',
hands:'Grip light. Stay relaxed. Full swing.',
remember:'MUST carry. Use club with MARGIN. Carry is 150? Use a club you hit 170. Can\'t carry with two clubs to spare? Go sideways around it.',
smartText:'over the water crossing. Club with plenty of margin. Full, committed swing. Don\'t cut it close.',
heroText:'over crossing at the pin. Tight carry, tight target. Full send.',
heroDanger:'No layup with crossing water. Carry it or don\'t. Make sure you have enough club.'
},
lip:{
ball:'FORWARD — inside front heel. Maximum launch.',
weight:'60% back foot. Stay behind ball to preserve loft.',
swing:'Full, steep swing with most lofted club (lob or sand wedge). Get ball UP fast. Lip is ALWAYS taller than it looks from bottom.',
aim:'Over the lip. Pick spot above lip.',
hands:'Hands even with ball (not ahead). Preserves max loft.',
remember:'Clear lip or repeat shot from same spot. More loft than you think. Lip is ALWAYS taller from down here.',
smartText:'over lip with max loft. Height is ONLY priority. Distance doesn\'t matter if ball hits lip.',
heroText:'over lip AND control distance to pin. Max loft, full swing, trust the height.',
heroDanger:'Hit lip = ball rolls back to your feet. Use more loft than you think.'
},
chipping:{
ball:'Low chip (lots of green): ball off BACK foot. High chip (over obstacle): ball off FRONT foot.',
weight:'Weight on FRONT foot. 70% front. Keep it there the ENTIRE swing. Do NOT shift back.',
swing:'Short backswing. ACCELERATE through ball — never slow down at impact (#1 chipping mistake). Think putt with a little wrist hinge. Follow through LOW and LEFT across your body (right-handers) — don\'t aim arms at target.',
aim:'Pick specific landing spot on green. Ball flies to that spot, then rolls like a putt the rest of the way.',
hands:'Hands FORWARD — shaft leans toward target. Critical.',
remember:'Get ball on ground ROLLING like a putt as soon as possible. Rolling ball is easier to control. Use less loft when you can. Accelerate through.',
smartText:'chip to center green. Weight forward, hands forward, accelerate through. Get it rolling ASAP.',
heroText:'chip tight to pin. Same technique, tighter landing spot. Commit to landing zone.',
heroDanger:'Tight pin with obstacle = higher shot, less roll. Ball forward, more loft, same acceleration.'
},
putting:{
ball:'Center of stance. Eyes directly over ball.',
weight:'Even, 50/50. Slight favor front foot is fine. Stay STILL — zero body movement.',
swing:'Rock SHOULDERS — pendulum motion. Wrists and lower body completely still. Nothing moves except shoulders rocking. Smooth, even tempo back and through — same speed each direction. Head DOWN, LISTEN for ball to drop. Looking up early ruins stroke because shoulders open.',
aim:'Speed dictates line. Get PACE right first, then line. Putt that rolls 2 feet past on a miss = right speed.',
hands:'Light grip. Wrists locked — no wrist action. Shoulders only.',
remember:'Speed first, line second. Head down, listen. Smooth tempo. Wrists dead still. Rock shoulders.',
smartText:'center of hole. Read break, pick speed, rock shoulders. Head down and listen.',
heroText:'aggressive line to make it. Same stroke, more pace. Die it in or charge the back — pick one, commit.',
heroDanger:'Aggressive putting means aggressive comebacks if you miss. Give yourself a tap-in on the miss.'
}
},
kickers:{
_default:['The boring shot is the one your scorecard likes best.','Two putts from the middle beats three from the fringe.','Your scorecard doesn\'t remember which shot was exciting.','Center green. Every time.','Solid contact. That\'s the whole assignment.','The safe shot is the one you forget by the 19th hole.','A smooth swing beats a hard swing 18 out of 18.','The best shot you hit today will feel easy.','Aim small, miss small.','Trust your yardages. Swing smooth, don\'t force it.','Pick a specific target. Not "the green." A spot.'],
tee_par3:['Perfect lie, big target. Don\'t overthink the gift.','The tee box can\'t trick you. The rest of the hole can.','Breathe. You chose this club for a reason.','The pin is a distraction. The green is the target.','Every par 3 green has a middle. That\'s your spot.','A two-putt par from center green counts the same as a tap-in birdie.','Tee it, trust it, swing smooth.','Your caddy says center green. Your ego says pin. Your caddy is right.'],
tee_par45:['The fairway is 35 yards wide. Find it.','You don\'t win holes on the tee. You lose them there.','Driver goes further. Fairway wood goes straighter.','Trees are 90% air, but the wood always wins.','Nobody ever said "I wish I\'d tried to hit it further."','3-Wood in the fairway beats driver in the trees. Every time.','Fairway, approach, two putts. That\'s a good hole.','Your playing partners don\'t remember your tee shot. They remember your score.','The safe play off the tee sets up everything next.','The most important shot on a par 4 is the one that finds short grass.'],
lt_rough:['It\'s rough, not a crime scene. You\'re fine.','One club more. That\'s all the grass costs you.','First cut is basically a fairway with attitude.','Same swing, slightly more commitment through impact.','Don\'t let the grass grab your confidence.','One extra club and a committed swing. That\'s the play.','Light rough is golf\'s way of saying "close enough."','Don\'t overthink light rough. It\'s barely a penalty.'],
dp_rough:['The grass took your distance. Don\'t let it take your brain.','Get it out in one. Whole assignment.','Bogey from deep rough is a win. Double is what happens when you get ambitious.','Aim right. Grass closes the face. Every time.','The hero play from deep rough is the leading cause of big numbers.','Club up. Swing hard. Aim right. That\'s the recipe.','The ball is sitting down. Your expectations should too.','Advance to the fairway. That\'s winning from here.','Two shots to the green from rough is fine. One shot that stays in rough is not.','Your hybrid can\'t see the ball either.'],
bare_dirt:['Ball first. Dirt first = club bounces = trouble.','Hard ground, hard truth: ball before ground.','No grass to save you. Precision or pain.','Grip down, hit down. Ground doesn\'t forgive.','Ball back, hands forward, hit down. Three thoughts.','Fat shots on hard ground become thin shots over the green.','The ball is sitting on concrete. Treat it that way.','Clean contact from bare dirt is a real skill. Today you learn it.'],
fwy_bnk:['Ball first. Iron shot in a sandbox.','Grip down, dig in, ball first. Whole playbook.','Three-quarter swing. Control beats power in sand.','Sand before ball and you try again from same spot.','Every fairway bunker shot starts with: ball first.','Dig in. Grip down. Ball first. Three things.','The sand is testing your discipline. Pass the test.','Three-quarter from sand that finds the green > full swing that stays in bunker.'],
grn_bnk:['Hit the sand hard. It started this fight.','The sand does the work. You just need speed.','Open face, open stance, swing like you mean it.','Slow down in the bunker and you stay in the bunker.','The bounce on your wedge was DESIGNED for this.','You\'re not hitting the ball. You\'re hitting sand. Sand moves the ball.','A bunker shot onto any part of the green is a great shot.','Accelerate. That\'s the whole bunker thought.','The lip is always taller than you think.','Every pro hits bunkers the same way. Open, behind, through.'],
divot:['Someone else\'s divot, your problem. Ball back, dig it out.','Lower trajectory, more run. Aim short.','If golf had a "not fair" rule, divots would be exhibit A.','Steep and aggressive. That\'s divot golf.','Plan for run. Coming in hot and low.','Ball back, hands ahead, steep swing. Three moves.','The only way out is down and through.'],
up_lie:['Hill is eating your distance. Feed it an extra club.','Lean into the slope. Match it.','Uphill = higher flight, dead stop. Fly it all the way.','Shoulders match slope. That\'s the entire thought.','Club up. Uphill takes 5-10 yards.','Ball stops dead on landing. Plan for zero roll.','The ball goes higher and left. Aim right, club up.'],
dn_lie:['Low and running. Aim short, let gravity help.','Gravity is undefeated. Don\'t fight the slope.','Coming out hot and low. Plan for the run.','Chase ball down the hill with the club.','Club down. Slope adds distance you didn\'t ask for.','Ball back, shoulders match slope. Two thoughts.','Ball runs 20% further than expected. Aim shorter.'],
below_ft:['Ball is going right. Aim left. That\'s the secret.','Gravity wins every argument. Aim left.','Widen. Bend. Aim left. Three words.','Fade is guaranteed. Plan for it.','Sit into it like a barstool. Reach for the ball.','Everything pushes right. Let it — aim left.','Your knees work harder than your arms here.'],
above_ft:['Going left. Aim further right than feels comfortable.','Choke up, aim right, trust the draw.','Slope closes your clubface. Hook is guaranteed.','Stand tall, grip short. Hill does half the work.','Grip down so you don\'t chunk it into the hill.','Aim right of right. Then more right.','Free draw spin from the slope. Use it — aim right.'],
trees:['Sideways to the fairway. One shot lost, not three.','Hero shot costs three strokes. Safe play costs one.','Trees are 90% air, but the wood always wins.','Gap looks bigger from behind the ball.','One swing to fairway, full shot to green. That\'s a bogey.','The forest doesn\'t have a highlight reel.','Punch outs win tournaments. Hero shots win stories nobody believes.','Every tree has been hit by someone who thought they could thread it.','Ball in fairway > three in the trees.','Bogey you can live with. Triple haunts you.'],
water:['Golf balls don\'t float. Two clubs of margin or lay up.','Splash is louder than you think.','Crisp wedge from fairway beats wet long iron.','Slowing down over water is how balls learn to swim.','Ego says go. Wallet says balls cost $4 each.','Water doesn\'t care about your feelings. Use enough club.','Tension kills distance. Water creates tension. Breathe.','Two clubs margin over water. That\'s the rule.','Penalty from water turns par into double. Layup turns par into bogey.','Full commit or lay up. No middle ground.','Water is a mental hazard. Your swing doesn\'t know it\'s there.','Drop zone is never where you want to be.'],
lip:['Lip is non-negotiable. Clear it or repeat.','Get it OUT first. CLOSE second.','More loft than you think. Always taller from down here.','Distance doesn\'t matter if ball hits lip.','Max loft, full swing, max height. Distance is secondary.','Hit lip = ball rolls back to your feet.','Height first. Everything else is bonus.'],
chipping:['Get ball on ground rolling ASAP.','Rolling ball is easier to control than flying ball.','Weight forward. Hands forward. Accelerate through.','Landing spot first, then let it roll like a putt.','Decelerating is the #1 chipping mistake. Commit through.','Less loft when you can. More when you must.','Bad chip to middle of green > great chip attempt that doesn\'t make it.','Follow through LOW and LEFT. Don\'t aim arms at target.'],
putting:['Speed dictates line. Pace first.','Head down. Listen for it.','Rock shoulders. Nothing else moves.','Smooth tempo. Same speed back and through.','2 feet past on a miss = right speed.','Read the break. Ball goes to the low side.','Wrists dead still. Shoulders only.','Two putts from anywhere on green is never bad.']
},
welcomes:[
{silver:'New round. Clean slate.',copper:'Same mistakes are optional.'},
{silver:'18 holes. One shot at a time.',copper:'Scorecard only remembers the total.'},
{silver:'Breathe. Grip light. Pick a target.',copper:'Everything else is noise.'},
{silver:'You brought the clubs.',copper:'Let\'s see who wins.'},
{silver:'Every hole starts at zero.',copper:'Keep it that way as long as possible.'},
{silver:'The course doesn\'t know your handicap.',copper:'Play smarter than your number.'},
{silver:'You don\'t have to be great today.',copper:'You just have to be smart.'},
{silver:'Good golf is boring golf.',copper:'Let\'s be boring together.'},
{silver:'The caddy is ready.',copper:'Are you?'},
{silver:'Fairways and greens.',copper:'Everything else is optional.'},
{silver:'Grip light. Head down. Smooth tempo.',copper:'That covers about 80% of it.'},
{silver:'Your swing is your swing.',copper:'Your decisions are where we come in.'}
],
confessionalKickers:{
allSmart:['Zero hero shots. Zero drama. The caddy is impressed.','You listened every time you asked. Rarer than you think.','All smart, all day. Boring golfer wins.','Perfect discipline. Caddy has nothing to complain about.'],
someHero:['How\'d that work out?','The caddy tried to warn you.','Bold choices were made. Results may vary.','You asked the caddy then did the opposite. Classic.'],
manyHero:['Caddy is questioning your commitment to listening.','Multiple hero attempts. Ego was in charge today.','You asked a lot. Listened... less.','The gap between knowing and doing.'],
lowUsage:['Everyone starts somewhere. Open the app more.','Imagine if you asked on every trouble shot.','One consultation. One smart decision. Build from there.']
},
flexKickers:{
perfect:['{smart} shots. {smart} times I listened. Discipline.','{smart} for {smart}. My ego took the day off. — Caddy Logic'],
withHero:['{total} shots. {smart} smart, {hero} hero. My caddy has notes.','I listened {smart} out of {total} times. No comment on the rest.']
},
roasts:[
'Consulted Caddy Logic {total} times. Listened {smart}. That hero shot? Don\'t ask.',
'My caddy app said center green. I said "I can reach that pin." I could not.',
'Downloaded @CaddyLogic. "How\'d that work out?" is now my least favorite question.',
'Caddy Logic said lay up. I said "I can carry the water." The water said no.',
'{total} shots. Caddy was right {smart} times. My ego was right... still calculating.',
'Caddy app said punch out. I went through the trees. Trees: 1. Me: 0.'
],
everySwing:'Grip light — like an open tube of toothpaste. Arms hang straight down. Pick a specific target. Feet, hips, shoulders parallel to target line. Head down. Smooth back, accelerate through. Finish your swing.',
privacyPolicy:'Caddy Logic collects zero data. Everything stays on your device.\n\nNo accounts. No sign-ups. No tracking. No analytics. No ads. No data sold.\n\nYour club distances, shot history, and round data are stored locally on your phone. Clear your browser data and it\'s gone.\n\nWe don\'t know who you are, where you play, or what you shoot. By design.\n\nYour caddy, your data.',
termsOfService:'Caddy Logic provides golf strategy suggestions for recreational use only.\n\nNot a substitute for professional instruction. General guidance for common situations.\n\nNot approved for sanctioned tournament play per USGA Rule 4.3.\n\nUse at your own discretion.\n\nKnow the play. Make the call.',
confidence:{baseSmart:90,baseHero:55,penalties:{lt_rough:{s:-3,h:-5},dp_rough:{s:-12,h:-22},bare_dirt:{s:-5,h:-12},fwy_bnk:{s:-10,h:-20},grn_bnk:{s:-8,h:-15},divot:{s:-5,h:-10},up_lie:{s:-3,h:-5},dn_lie:{s:-5,h:-10},below_ft:{s:-8,h:-15},above_ft:{s:-5,h:-10},trees:{s:-10,h:-25},water:{s:-5,h:-18},lip:{s:-8,h:-20},wind_1:{s:-2,h:-3},wind_2:{s:-3,h:-6},wind_3:{s:-8,h:-14},rain:{s:-3,h:-5},long_club:{s:-3,h:-8}},min:8},
getKicker(key){const p=this.kickers[key]||this.kickers._default;return p[Math.floor(Math.random()*p.length)];},
getWelcome(){return this.welcomes[Math.floor(Math.random()*this.welcomes.length)];},
// FIND CLUB — Smart Play: NEVER driver off non-tee
findClub(bag,dist,isTee){
const active=bag.filter(c=>c.on&&(isTee||!c.teeOnly)).sort((a,b)=>b.dist-a.dist);
if(!active.length)return null;
let best=null;
for(let i=active.length-1;i>=0;i--){if(active[i].dist>=dist){best=active[i];break;}}
if(!best)best=active[0];
return best;
},
// HERO CLUB — bold but not stupid. 1-2 clubs more aggressive. CAN include driver for punch/stinger.
findHeroClub(bag,smartClub,dist,isTee,isPunch){
const active=bag.filter(c=>c.on).sort((a,b)=>b.dist-a.dist);// hero ignores teeOnly
const smartIdx=active.findIndex(c=>c.name===smartClub.name);
// For punch outs, hero could be a driver stinger or longest club
if(isPunch)return active[0];
// Otherwise go 1-2 clubs more aggressive (shorter distance but riskier from this lie)
// Actually hero should be the club that REACHES the green from further — so go 1-2 longer
if(smartIdx>0)return active[smartIdx-1];// one club longer
if(smartIdx===0)return active[0];// already the longest
return smartClub;
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
}
};
if(typeof module!=='undefined')module.exports=CL;
