// CADDY LOGIC — Content Database v2.0
// Smart Play = HOW to set up and execute the safe shot (mechanics first)
// Let It Eat = HOW to set up and execute the risky alternative
// Zero fabricated statistics. Real facts and observations only.

const CL = {

  version: '1.0.1 Beta',

  bags: {
    '80s': [
      {name:'Driver',dist:240,on:true},{name:'3-Wood',dist:220,on:true},{name:'5-Wood',dist:195,on:true},
      {name:'3-Hybrid',dist:180,on:true},{name:'4-Hybrid',dist:170,on:true},{name:'5-Iron',dist:160,on:true},
      {name:'6-Iron',dist:150,on:true},{name:'7-Iron',dist:140,on:true},{name:'8-Iron',dist:130,on:true},
      {name:'9-Iron',dist:120,on:true},{name:'PW',dist:110,on:true},{name:'GW',dist:90,on:true},{name:'SW',dist:70,on:true}
    ],
    '90s': [
      {name:'Driver',dist:220,on:true},{name:'3-Wood',dist:200,on:true},{name:'5-Wood',dist:180,on:true},
      {name:'4-Hybrid',dist:165,on:true},{name:'5-Hybrid',dist:155,on:true},{name:'6-Iron',dist:140,on:true},
      {name:'7-Iron',dist:130,on:true},{name:'8-Iron',dist:120,on:true},{name:'9-Iron',dist:110,on:true},
      {name:'PW',dist:100,on:true},{name:'GW',dist:80,on:true},{name:'SW',dist:65,on:true}
    ],
    '100s': [
      {name:'Driver',dist:200,on:true},{name:'3-Wood',dist:180,on:true},{name:'5-Wood',dist:160,on:true},
      {name:'5-Hybrid',dist:145,on:true},{name:'6-Hybrid',dist:135,on:true},{name:'7-Iron',dist:120,on:true},
      {name:'8-Iron',dist:110,on:true},{name:'9-Iron',dist:100,on:true},{name:'PW',dist:90,on:true},
      {name:'GW',dist:75,on:true},{name:'SW',dist:55,on:true}
    ],
    '110+': [
      {name:'Driver',dist:180,on:true},{name:'3-Wood',dist:160,on:true},{name:'5-Wood',dist:145,on:true},
      {name:'6-Hybrid',dist:130,on:true},{name:'7-Iron',dist:110,on:true},{name:'8-Iron',dist:100,on:true},
      {name:'9-Iron',dist:90,on:true},{name:'PW',dist:80,on:true},{name:'GW',dist:65,on:true},{name:'SW',dist:50,on:true}
    ]
  },

  conditions: {
    tee:       {label:'Tee',mod:0,group:'terrain',hasSub:true},
    fairway:   {label:'Fairway',mod:0,group:'terrain'},
    lt_rough:  {label:'Lt Rough',mod:3,group:'terrain'},
    dp_rough:  {label:'Dp Rough',mod:7,group:'terrain'},
    bare_dirt: {label:'Bare Dirt',mod:0,group:'terrain'},
    fwy_bnk:   {label:'Fwy Bnk',mod:7,group:'terrain'},
    grn_bnk:   {label:'Grn Bnk',mod:5,group:'terrain',hasSub:true},
    divot:     {label:'Divot',mod:3,group:'terrain'},
    up_lie:    {label:'Up Lie',mod:0,group:'slope'},
    dn_lie:    {label:'Dn Lie',mod:0,group:'slope'},
    below_ft:  {label:'Below Ft',mod:0,group:'slope'},
    above_ft:  {label:'Above Ft',mod:0,group:'slope'},
    trees:     {label:'Trees',mod:0,group:'obstacle',hasSub:true},
    water:     {label:'Water',mod:0,group:'obstacle',hasSub:true},
    lip:       {label:'Lip',mod:0,group:'obstacle'}
  },

  subLabels: {
    tee_par3:'Tee · Par 3',tee_par45:'Tee · Par 4/5',
    trees_around_l:'Trees · Go Left (Draw)',trees_around_r:'Trees · Go Right (Fade)',
    trees_over:'Trees · Go Over',trees_punch:'Trees · Punch Out',
    grn_bnk_clean:'Greenside Bunker · Clean',grn_bnk_plugged:'Greenside Bunker · Plugged',grn_bnk_wet:'Greenside Bunker · Wet',
    water_front_over:'Water In Front · Over',water_front_layup:'Water In Front · Lay Up',
    water_left:'Water Left · Aim Away',water_right:'Water Right · Aim Away',water_crossing:'Water Crossing · Carry'
  },

  wind: [
    {label:'0mph',mod:0,color:'#999'},
    {label:'+3mph',mod:3,color:'#ccc'},
    {label:'+7mph',mod:7,color:'#ccc'},
    {label:'+12mph',mod:12,color:'#ccc'}
  ],

  elevation: [
    {label:'None',mod:0},{label:'▲ Slight',mod:4},{label:'▲ Steep',mod:10},
    {label:'▼ Slight',mod:-4},{label:'▼ Steep',mod:-10}
  ],

  // =============================================
  // ADVICE — mechanics focused
  // Each entry: ball, weight, swing, aim, remember
  // smartText = front of Smart Play card
  // heroText = front of Let It Eat card
  // heroDanger = Danger section on hero card back
  // =============================================
  advice: {
    _default: {
      ball:'Center of stance for short irons. In line with shirt logo for mid-irons. Inside front heel for woods.',
      weight:'Slightly favoring front foot for irons. Even for woods and hybrids.',
      swing:'Hit DOWN on irons — the divot comes AFTER the ball. Sweep woods off the turf.',
      aim:'Center of the green. Biggest target, biggest margin.',
      remember:'Clean contact beats perfect aim. Solid strike is the only goal.',
      smartText:'center green. Solid contact, smooth tempo. Let the club do the work.',
      heroText:'at the pin. Same fundamentals, smaller target. Full commitment.',
      heroDanger:'Missing the pin means missing the green. Center green is 30 feet from the pin at worst.'
    },
    tee_par3: {
      ball:'Tee it low — barely above the grass for irons. Quarter of ball above face for hybrids/woods.',
      weight:'Even. Slight favor toward front foot with irons.',
      swing:'Smooth tempo. The tee is a perfect lie — don\'t waste it by swinging harder than normal.',
      aim:'Center of the green. The pin is tempting but center green means guaranteed on.',
      remember:'Best lie you\'ll have all hole. Don\'t complicate it. Smooth swing, solid contact.',
      smartText:'center green. Perfect lie, smooth swing. Green is the target, not the pin.',
      heroText:'at the flag. Same smooth tempo, same solid contact, tighter target.',
      heroDanger:'Pin-seeking adds risk with zero extra reward unless you\'re inside 10 feet.'
    },
    tee_par45: {
      ball:'Driver: inside front heel, tee high — half the ball above the face. Wood: tee flush with grass.',
      weight:'Driver: 60% back foot, lead shoulder tilted up. You\'re swinging UP through the ball.',
      swing:'Driver: sweep UP through impact. Feel the club going up as it hits the ball. Head stays behind.',
      aim:'Center of the fairway. It\'s 30-40 yards wide. That\'s a huge target.',
      remember:'The fairway is the target. Any ball in the fairway is a win. Distance is secondary.',
      smartText:'to the fairway. Smooth tempo, find the short grass. The fairway sets up everything.',
      heroText:'driver, full send. Same fundamentals — head down, full turn, trust your swing.',
      heroDanger:'Driver is the longest club and hardest to control. Fairway wood hits fairway more often.'
    },
    lt_rough: {
      ball:'Same as fairway. Don\'t change your setup for light rough.',
      weight:'55% front foot — just a touch more than normal.',
      swing:'Swing slightly more aggressively through impact. Grass grabs the face — don\'t let it slow you.',
      aim:'Center green. Light rough barely changes direction. The face closes slightly — aim a touch right.',
      remember:'Club up one. The grass costs a few yards. Aim slightly right (righties) — rough closes the face.',
      smartText:'center green. Same swing as fairway, just swing through a bit harder. The rough barely matters.',
      heroText:'at the pin. Light rough is almost a fairway lie. If you\'re going to attack, this is reasonable.',
      heroDanger:'Light rough is barely a penalty. The real danger is overthinking a simple shot.'
    },
    dp_rough: {
      ball:'Move ball BACK one ball in stance. This steepens your attack to cut through the grass.',
      weight:'65-70% front foot. Plant it there and KEEP it there.',
      swing:'Swing AGGRESSIVELY through impact. The grass grabs the club HARD — you need speed to cut through. Never decelerate.',
      aim:'Aim RIGHT of target (righties). Deep grass closes face and pulls ball left. The deeper the rough, the more left.',
      remember:'Grass closes face, kills distance. Club up two. Aim right. Swing hard. Don\'t try to be precise — just get it OUT.',
      smartText:'center green. Ball back, weight forward, swing hard through. The grass is going to grab — fight through it.',
      heroText:'at the pin from deep rough. Full commitment. Same setup but you need perfect contact.',
      heroDanger:'Miss-hits from deep rough go nowhere. The grass wins and you advance 30 yards.'
    },
    bare_dirt: {
      ball:'Move back one ball. Hit ball first — there\'s ZERO cushion for a fat shot.',
      weight:'65% front foot. Don\'t let the club bounce off hard ground.',
      swing:'Hit DOWN firmly. Ball first, THEN ground. Fat = club bounces off dirt = you blade it 50 yards over the green.',
      aim:'Center green. Ball-first contact is the only priority here.',
      remember:'Hard ground, zero forgiveness. Hit the ball before the ground or you blade it. Ball back, hands forward.',
      smartText:'center green. Ball back, hands ahead, hit DOWN. The ground won\'t forgive a fat shot.',
      heroText:'at the pin from hard pan. Perfect ball-first contact gets you spin and control.',
      heroDanger:'Fat shots on bare dirt = bladed over the green. Zero margin for error.'
    },
    fwy_bnk: {
      ball:'Center or slightly back. You MUST hit ball first — not sand.',
      weight:'60% front foot. Dig feet into sand for stability.',
      swing:'THREE-QUARTER swing maximum. Smooth tempo. Ball first, then sand. Don\'t try to help it up.',
      aim:'Center green. Solid contact from sand IS the win.',
      remember:'Ball first. NOT sand first. Grip down one inch. Three-quarter swing. Control over power.',
      smartText:'center green from sand. Grip down, ball first, three-quarter swing. Control is everything in a bunker.',
      heroText:'at the flag from fairway sand. Full swing, perfect ball-first contact required.',
      heroDanger:'Any sand before the ball costs you 50+ yards. Three-quarter to center green is the smart play.'
    },
    grn_bnk_clean: {
      ball:'FORWARD — in line with front heel.',
      weight:'60% front foot. Open your stance — feet aim LEFT of target (righties).',
      swing:'Open face BEFORE you grip. Swing along your foot line (left). Hit sand 2 inches BEHIND ball. Sand throws ball out. ACCELERATE through.',
      aim:'Center of green. The ball pops up soft and stops quickly.',
      remember:'You\'re NOT hitting the ball. You\'re hitting SAND behind it. The sand launches the ball. Never decelerate.',
      smartText:'out of the bunker to center green. Open face, open stance, hit 2 inches behind the ball. Let the sand do all the work.',
      heroText:'at the pin. Same technique. Control distance with backswing length — longer swing = more distance.',
      heroDanger:'Distance control from bunkers is the hardest skill in golf. Getting out is the win.'
    },
    grn_bnk_plugged: {
      ball:'Center to slightly back. NOT forward like a clean lie.',
      weight:'70% front foot. Lean into it.',
      swing:'SQUARE face — NOT open. Steep backswing with wrist hinge. SLAM into sand close behind ball. Don\'t worry about follow-through.',
      aim:'Just get it OUT. Anywhere on the green is a win.',
      remember:'SQUARE face for plugged. NOT open. Steep swing, slam sand. Ball comes out low and hot — plan for the run.',
      smartText:'out of the plugged lie. Square face, steep swing, slam the sand. It comes out low and running. Anywhere on the green is a great result.',
      heroText:'at the pin from a plugged lie. Same technique, but aim for the ball to land short and run to the hole.',
      heroDanger:'Plugged lies are the most unpredictable shot in golf. Sometimes it pops, sometimes it stays.'
    },
    grn_bnk_wet: {
      ball:'Slightly back of center.',
      weight:'65% front foot.',
      swing:'Hit CLOSER to ball than dry — 1 inch behind instead of 2. Wet sand is heavy. More speed needed.',
      aim:'Center green. Wet sand makes distance unpredictable.',
      remember:'Wet sand is HEAVY. More speed, closer contact. Commit — wet sand punishes deceleration brutally.',
      smartText:'out of wet sand onto the green. Closer contact than dry, more speed, full commit through.',
      heroText:'at the pin from wet sand. Full commit with extra speed.',
      heroDanger:'Wet sand chunks differently. Ball can come out hot or not at all. Just get on the green.'
    },
    divot: {
      ball:'Back one or two balls. Need a STEEP angle to get under the ball.',
      weight:'70% front foot. Planted.',
      swing:'Hit DOWN aggressively. Punch the ball into the ground. Don\'t scoop — the loft lifts it.',
      aim:'Center green. Ball comes out low and runs more than normal.',
      remember:'Low, hot ball flight. Aim short. The steep angle removes loft. Plan for extra run.',
      smartText:'center green from the divot. Ball back, hands forward, punch down. Expect lower trajectory and more roll.',
      heroText:'at the pin from a divot. Same steep punch, tighter target. Plan for the run.',
      heroDanger:'Thin shots from divots are common. Either perfect or screaming over the green.'
    },
    up_lie: {
      ball:'Slightly forward — uphill moves your low point forward.',
      weight:'Gravity pulls you back. Let it. Lean INTO the hill, don\'t fight it.',
      swing:'Tilt shoulders to MATCH the slope. Swing ALONG the hill. Don\'t fight the terrain.',
      aim:'Ball flies HIGHER and LEFT (righties). Aim right. Club UP — extra height costs distance.',
      remember:'Shoulders match slope. Higher flight, less distance, pulls left. Club up. Ball stops dead — fly it all the way.',
      smartText:'center green. Match your shoulders to the hill, swing along the slope. Club up for the lost distance.',
      heroText:'at the pin from an uphill lie. Same slope mechanics, tighter line. Aim right of pin — it\'ll pull left.',
      heroDanger:'Ball stops DEAD on uphill shots. No roll. Fly it the full distance to your target.'
    },
    dn_lie: {
      ball:'BACK in stance — downhill moves low point backward.',
      weight:'Falls forward naturally. Let it. Keep moving toward target.',
      swing:'Shoulders MATCH slope. Chase the ball down the hill after impact.',
      aim:'Lower flight, goes RIGHT (righties). Aim left. Club DOWN — lower flight adds distance.',
      remember:'Shoulders match slope. Low flight, lots of run, fades right. Club down for extra distance.',
      smartText:'center green. Match shoulders to downhill slope, swing along it. Club down — ball will run.',
      heroText:'at the pin on the downslope. Low, running ball. Pick your landing spot short.',
      heroDanger:'Low, running shots. Easy to fly the green because ball doesn\'t check up.'
    },
    below_ft: {
      ball:'Center of stance.',
      weight:'On your heels. WIDEN stance for stability.',
      swing:'Bend MORE from hips. Sit into legs like a barstool. More up-and-down swing path.',
      aim:'Ball goes RIGHT (righties). Aim LEFT. Steeper slope = more fade.',
      remember:'WIDEN stance. Bend more. Aim left. Ball WILL fade right. Guaranteed.',
      smartText:'center green, aim left. Widen stance, bend from hips. The ball will drift right — plan for it.',
      heroText:'at the pin, accounting for the rightward drift. Aim left of the flag.',
      heroDanger:'The ball going right is almost guaranteed. Double-miss right and you\'re in real trouble.'
    },
    above_ft: {
      ball:'Center of stance.',
      weight:'On your toes. Lean into the hill.',
      swing:'Stand TALLER. Grip DOWN 1-2 inches. Flatter, more around-the-body swing.',
      aim:'Ball goes LEFT (righties). Aim RIGHT. Steeper slope = more draw/hook.',
      remember:'GRIP DOWN. Stand taller. Aim right. Ball WILL draw/hook left. Guaranteed.',
      smartText:'center green, aim right. Grip down, stand taller. The ball will draw left — aim for it.',
      heroText:'at the pin, playing the natural draw. Aim right of the flag.',
      heroDanger:'Hook left is guaranteed. Aim left AND it hooks = disaster. Always aim right.'
    },
    trees_around_l: {
      ball:'Slightly back of center for a draw path.',
      weight:'Normal.',
      swing:'Body aims RIGHT of tree. Clubface aims at target (left of tree). Swing along body line. Mismatch creates left curve.',
      aim:'Start the ball right of the tree, let it curve left around it.',
      remember:'Body right, face at target. Swing your body. Ball curves left. COMMIT — half swings go straight into the tree.',
      smartText:'draw left around the tree. Body aims right, clubface at target. Swing along your body line — the ball curves left.',
      heroText:'full draw to the green, curving left around the tree. Same setup, full commitment.',
      heroDanger:'Not enough curve = tree. Too much curve = way left. The gap looks bigger from behind the ball.'
    },
    trees_around_r: {
      ball:'Slightly forward for a fade path.',
      weight:'Normal.',
      swing:'Body aims LEFT of tree. Clubface at target (right of tree). Swing along body. Ball curves right.',
      aim:'Start ball left of tree, let it curve right.',
      remember:'Body left, face at target. Swing your body. Ball curves right. Full commit.',
      smartText:'fade right around the tree. Body aims left, clubface at target. Swing your body line — ball curves right.',
      heroText:'full fade to the green, curving right around the tree. Same setup, full send.',
      heroDanger:'No curve = tree. Too much curve = way right. Commit to the shape or don\'t try it.'
    },
    trees_over: {
      ball:'FORWARD in stance — inside front heel. Maximum launch.',
      weight:'Stay BEHIND the ball. 60% back foot.',
      swing:'Full swing. Trust the loft. Do NOT scoop — scooping causes thin shots that hit the tree.',
      aim:'Straight over the tree. Give yourself clearance.',
      remember:'The LOFT lifts the ball. Not your hands. If you\'re not sure you clear it, punch out sideways.',
      smartText:'over the tree with maximum loft. Ball forward, stay behind it. The club does the lifting.',
      heroText:'over the tree AT the green. You need height AND distance.',
      heroDanger:'Ball doesn\'t get up fast enough = hits tree, drops straight down. Punch out is safer.'
    },
    trees_punch: {
      ball:'BACK in stance — inside back foot.',
      weight:'70% front foot.',
      swing:'HALF swing. LOW finish — hands stop at waist height. Ball comes out low and running.',
      aim:'Widest gap. The fairway. Safety.',
      remember:'Low and running. Pick the WIDEST gap. One shot to the fairway = bogey. Through the trees = triple.',
      smartText:'sideways to the fairway. Pick the widest gap. Half swing, low finish, ball comes out running.',
      heroText:'through the gap to the green. Low, running, through a window between trunks. Full commit to the line.',
      heroDanger:'Trees are 90% air, but the wood always wins. The gap looks bigger than it is.'
    },
    water_front_over: {
      ball:'Normal position for the club. Don\'t change setup because of water.',
      weight:'Normal. Don\'t tighten up. Tension kills distance over water.',
      swing:'FULL, COMMITTED swing. Pick a target on the OTHER side of the water and swing to it. Never decelerate.',
      aim:'Center of the green, past the water. Commit to a full swing.',
      remember:'Can you carry it with TWO clubs to spare? Yes = go. No = lay up. Deceleration over water is how balls swim.',
      smartText:'over the water with your safe club. The one that carries it with room to spare. Not your exact-distance club.',
      heroText:'at the pin over the water. Full commit. Your exact-distance club or one less. Zero margin for error.',
      heroDanger:'Exact-distance club over water requires PERFECT contact. One yard short = splash. Club up.'
    },
    water_front_layup: {
      ball:'Normal position.',
      weight:'Normal.',
      swing:'Smooth, controlled swing. You\'re hitting to a SPECIFIC distance — your favorite wedge yardage.',
      aim:'Lay up to YOUR number. What distance do you hit your wedge best? Go there.',
      remember:'Lay up to your best wedge distance, not just "short of the water." A 80-yard wedge is easier than a 40-yard pitch.',
      smartText:'lay up to your favorite wedge distance. Pick a specific target. Smooth, controlled swing to that yardage.',
      heroText:'challenge the water anyway. Full swing at the green.',
      heroDanger:'Laying up is the smart play when the carry is tight. A crisp wedge from the fairway beats a wet ball.'
    },
    water_left: {
      ball:'Normal.',
      weight:'Normal.',
      swing:'Normal swing. The water is a mental hazard more than a physical one from here.',
      aim:'Aim RIGHT. Away from the water. Give yourself a cushion. Miss AWAY from the hazard.',
      remember:'Aim away from the water. Miss to the SAFE side. A ball in the rough right is better than a ball in the water left.',
      smartText:'center-right of green, away from the water. Aim to miss on the safe side. Right rough beats wet ball.',
      heroText:'at the pin even though water is left. Trust your line and commit.',
      heroDanger:'Pulls and hooks go in the water. Aim right of the pin — even a slight miss left stays dry.'
    },
    water_right: {
      ball:'Normal.',
      weight:'Normal.',
      swing:'Normal swing. Don\'t steer — steering causes the exact miss you\'re trying to avoid.',
      aim:'Aim LEFT. Away from the water. Miss to the safe side.',
      remember:'Aim away from water. Miss SAFE. Don\'t steer the ball — steering causes pushes and slices toward the water.',
      smartText:'center-left of green, away from the water. Aim to miss safe. Left rough beats a penalty stroke.',
      heroText:'at the pin with water right. Commit to your line — steering causes the exact miss you fear.',
      heroDanger:'Pushes and slices go in the water. Aim left of the pin and let the shot come back to it.'
    },
    water_crossing: {
      ball:'Normal for the club you\'re hitting.',
      weight:'Normal. Don\'t tighten up.',
      swing:'Full, committed swing. You must CARRY the water — there\'s no option around it.',
      aim:'Over the water. Pick a target on land on the other side and commit to it.',
      remember:'You MUST carry this. Use a club with margin. If you can\'t carry with two clubs to spare, don\'t cross — go sideways.',
      smartText:'over the water crossing. Use a club that carries with margin. Full, committed swing to a target past the water.',
      heroText:'over the crossing at the pin. Tight carry, tight target. Full send.',
      heroDanger:'No layup option with crossing water. You carry it or you don\'t. Use enough club.'
    },
    lip: {
      ball:'FORWARD for maximum height.',
      weight:'Stay behind the ball.',
      swing:'Full steep swing. Most lofted club. Get the ball UP fast.',
      aim:'Over the lip. Height first, distance second.',
      remember:'Clear the lip or do this again. More loft than you think. The lip is always taller from down here.',
      smartText:'over the lip with maximum loft. Height is the only priority. Distance doesn\'t matter if it hits the lip.',
      heroText:'over the lip AND control distance. Clear the lip with enough to reach the target.',
      heroDanger:'Hit the lip = ball rolls back to your feet. Use more loft than you think.'
    }
  },

  // =============================================
  // KICKERS — expanded, 8-12 per situation
  // =============================================
  kickers: {
    _default: [
      'The boring shot is the one your scorecard likes best.',
      'Two putts from the middle beats three from the fringe.',
      'Your scorecard doesn\'t remember which shot was exciting.',
      'Par from center green is always available.',
      'Center green. Every time. Until you have a reason not to.',
      'Solid contact. That\'s the whole assignment.',
      'The safe shot is the one you forget by the 19th hole.',
      'Nobody three-putts from the center. Almost nobody.',
      'A smooth swing beats a hard swing 18 times out of 18.',
      'The best shot you\'ll hit today will feel easy.'
    ],
    tee_par3: [
      'Perfect lie, big target. Don\'t overthink the gift.',
      'The tee box is the only place the course can\'t trick you.',
      'Breathe. You chose this club for a reason.',
      'Nobody talks about the par they made from center green. But they all count the same.',
      'The pin is a distraction. The green is the target.',
      'Tee it, trust it, swing smooth. That\'s par-3 golf.',
      'Your caddy says center green. Your ego says pin. Your caddy has a better track record.',
      'Every par 3 green has a middle. That\'s your spot.'
    ],
    tee_par45: [
      'The fairway is 35 yards wide. Find it.',
      'You don\'t win holes on the tee. You lose them there.',
      'Driver goes further. Fairway wood goes straighter. Pick your priority.',
      'Trees are 90% air, but the wood always wins.',
      'Nobody ever said "I wish I\'d tried to hit it further off the tee."',
      'The safe play off the tee sets up the hero play into the green.',
      'Fairway, approach, two putts. That\'s a good hole. Make it happen off the tee.',
      'The most important shot on a par 4 is the one that finds the fairway.',
      'A 3-Wood in the fairway beats a driver in the trees. Every single time.',
      'Your playing partners don\'t remember your tee shot. They remember your score.'
    ],
    lt_rough: [
      'It\'s rough, not a crime scene. You\'re fine.',
      'One club more. That\'s all the grass is costing you.',
      'The first cut is basically a fairway with an attitude problem.',
      'Don\'t panic. The grass barely has your ball.',
      'Light rough is golf\'s way of saying "close enough."',
      'Same swing, same setup, slightly more commitment through impact.',
      'The grass grabbed your ball. Don\'t let it grab your confidence.',
      'One extra club and a normal swing. That\'s the play.'
    ],
    dp_rough: [
      'The grass took your distance. Don\'t let it take your brain too.',
      'Get it out in one. That\'s the whole assignment.',
      'Your hybrid can\'t see the ball either. Grab a shorter club.',
      'Bogey from deep rough is a win. Double is what happens when you get ambitious.',
      'Aim right. The grass closes the face. Every time.',
      'The hero play from deep rough is the leading cause of snowmen.',
      'Club up. Swing hard. Aim right. That\'s the recipe from deep rough.',
      'The ball is sitting down. Your expectations should too.',
      'Advance the ball to the fairway. That\'s winning from here.',
      'Two shots from the rough to the green is fine. One shot to the next fairway bunker is not.'
    ],
    bare_dirt: [
      'Ball first. If you hit the dirt first, you\'re putting from the parking lot.',
      'Hard ground, hard truth: hit the ball before the ground.',
      'There\'s no grass to save you. Precision or pain.',
      'Grip down, hit down. The ground doesn\'t care about your feelings.',
      'Clean contact from bare dirt is a legitimate skill. Today you learn it.',
      'The ball is sitting on concrete. Treat it that way.',
      'Ball back, hands forward, hit down. Three thoughts. That\'s all you need.',
      'Fat shots on hard pan don\'t stay fat. They become thin shots over the green.'
    ],
    fwy_bnk: [
      'Ball first. This isn\'t a beach shot — it\'s an iron shot in a sandbox.',
      'Grip down, dig in, hit ball first. That\'s the whole playbook.',
      'Three-quarter swing. Control beats power in sand.',
      'Hit the sand first and you get to hit from the sand again.',
      'Your feet are in sand. Your ball doesn\'t have to stay there.',
      'Every fairway bunker shot starts with the same thought: ball first.',
      'Dig in. Grip down. Ball first. Three things. Remember them.',
      'The sand is testing your discipline. Pass the test.',
      'Three-quarter swings from fairway bunkers advance the ball 85% as far with 200% more reliability.'
    ],
    grn_bnk: [
      'Hit the sand hard. It started this fight.',
      'The sand does the work. You just need speed.',
      'Open face, open stance, and swing like you\'re not afraid.',
      'Decelerate in the bunker and you get to hit from the bunker again.',
      'The bounce on your wedge was DESIGNED for this exact shot.',
      'The lip is always taller than you think from down here.',
      'You\'re not hitting the ball. You\'re hitting the sand. The sand moves the ball.',
      'Every bunker shot you\'ve seen on TV used the same technique. Open, behind, accelerate.',
      'A bunker shot onto the green — any part of the green — is a great shot.',
      'The ball doesn\'t know it\'s in a bunker. But you do. Stay calm.'
    ],
    divot: [
      'Someone else\'s divot, your problem. Ball back and dig it out.',
      'Lower trajectory, more run. Aim short of the pin.',
      'If golf had a "that\'s not fair" rule, divots would be exhibit A.',
      'The only way out is through. Hit down like you mean it.',
      'Steep and aggressive. That\'s divot golf.',
      'Plan for the run. This ball is coming in hot.',
      'Ball back, hands ahead, steep swing. Three moves.',
      'Your playing partner feels bad for you. Use that energy.'
    ],
    up_lie: [
      'The hill is eating your distance. Feed it an extra club.',
      'Lean into the slope, not against it.',
      'Uphill = higher flight, less roll. Fly it all the way.',
      'Shoulders match slope. That\'s the entire thought.',
      'Match the hill. The ball knows which way is up.',
      'Club up. The uphill takes 5-10 yards. Give them back.',
      'Your ball will stop dead when it lands. Plan accordingly.',
      'The hill is your enemy today. Give it what it wants — an extra club.'
    ],
    dn_lie: [
      'Low and running. Aim short and let gravity help.',
      'Gravity is undefeated. Don\'t fight the slope.',
      'This ball is coming out hot. Plan for the run.',
      'Chase the ball down the hill. Let the club follow the slope.',
      'Club down. The slope adds distance you didn\'t ask for.',
      'Downhill lies are why golf is hard. Respect it.',
      'Ball back, shoulders match slope. Two thoughts.',
      'The ball will run 20% further than normal. Aim 20% shorter.'
    ],
    below_ft: [
      'The ball is going right. Aim left. That\'s the whole secret.',
      'Gravity wins every argument. Aim left.',
      'Your knees are doing more work than your arms here.',
      'Below your feet means above your skill level. Be honest about the aim.',
      'Widen. Bend. Aim left. Those are your three words.',
      'The fade is guaranteed. The only question is how much.',
      'Sit into it like you\'re on a barstool. Reach for the ball.',
      'Everything about this lie wants the ball to go right. Let it — aim left.'
    ],
    above_ft: [
      'It\'s going left. Hard. Aim further right than feels comfortable.',
      'Choke up, aim right, and trust the draw.',
      'The slope closes your clubface. Plan for the hook.',
      'Stand tall, grip short. The hill is doing half the work.',
      'Grip down so you don\'t chunk it into the hill.',
      'The ball WILL hook left. That\'s not a mistake — it\'s physics.',
      'Aim right of right. Then a little more right.',
      'This is free draw spin. Use it — aim right and let it curve.'
    ],
    trees: [
      'Sideways to the fairway. One shot lost, not three.',
      'The hero shot costs three strokes. The safe play costs one.',
      'Trees are 90% air, but the wood always wins.',
      'The gap looks bigger from behind the ball than it actually is.',
      'One swing to the fairway, then a full shot to the green. That\'s a bogey, not a triple.',
      'The forest doesn\'t have a highlight reel.',
      'Punch outs win championships. Hero shots win stories.',
      'Every tree on this course has been hit by someone smarter than you. Take the safe route.',
      'Your ball in the fairway is worth three in the trees.',
      'A bogey you can live with. A triple you\'ll talk about for the wrong reasons.'
    ],
    water: [
      'Golf balls don\'t float. If you can\'t clear it by two clubs, don\'t try.',
      'The splash is louder than you think.',
      'Lay up to your favorite wedge distance. A crisp wedge beats a wet long iron.',
      'Deceleration over water is how golf balls learn to swim.',
      'Your ego says go for it. Your wallet says those balls cost $4 each.',
      'Water doesn\'t care about your feelings. Use enough club.',
      'Tension kills distance. The water creates tension. Swing smooth.',
      'The water is a mental hazard. Your swing doesn\'t know it\'s there unless you tell it.',
      'Two clubs of margin over water. That\'s the rule. No exceptions.',
      'A penalty stroke from the water turns par into double. Lay up turns par into bogey. The math is clear.',
      'Full commit or lay up. There is no middle ground over water.',
      'The drop zone is never where you want to be. Use enough club.'
    ],
    lip: [
      'The lip is non-negotiable. Clear it or repeat it.',
      'Get it OUT first. Get it CLOSE second.',
      'More loft than you think. The lip is always taller from down here.',
      'Your distance doesn\'t matter if the ball hits the lip and rolls back.',
      'Lob wedge, full swing, maximum height. Worry about distance later.',
      'The lip doesn\'t negotiate. Use enough loft.',
      'If the ball hits the lip, you do this again. Use more loft.',
      'Height over the lip first. Everything else is bonus.'
    ]
  },

  // =============================================
  // PRE-ROUND WELCOMES
  // =============================================
  welcomes: [
    {silver:'New round. Clean slate.',copper:'Same mistakes are optional.'},
    {silver:'18 holes. One shot at a time.',copper:'The scorecard only remembers the total.'},
    {silver:'Breathe. Grip light. Pick a target.',copper:'Everything else is noise.'},
    {silver:'You brought the clubs.',copper:'Let\'s see who wins today.'},
    {silver:'Every hole starts at zero.',copper:'Keep it that way as long as possible.'},
    {silver:'The course doesn\'t know your handicap.',copper:'Play smarter than your number.'},
    {silver:'You don\'t have to be great today.',copper:'You just have to be smart.'},
    {silver:'New day. New round.',copper:'Old habits are the only enemy.'},
    {silver:'Good golf is boring golf.',copper:'Let\'s be boring together.'},
    {silver:'The caddy is ready.',copper:'Are you?'},
    {silver:'Fairways and greens.',copper:'Everything else is optional.'},
    {silver:'Your swing is your swing.',copper:'Your decisions are where we come in.'}
  ],

  // =============================================
  // CONFESSIONAL KICKERS
  // =============================================
  confessionalKickers: {
    allSmart: [
      'Zero hero shots. Zero drama. The caddy is impressed.',
      'You listened every time you asked. That\'s rarer than you think.',
      'All smart, all day. The boring golfer wins.',
      'No hero shots. Your ego took the day off.',
      'Perfect discipline. The caddy has nothing to complain about.',
      'Every shot smart. That\'s how you improve without changing your swing.'
    ],
    someHero: [
      'How\'d that work out?',
      'The caddy tried to warn you.',
      'Bold choices were made. Results may vary.',
      'You asked the caddy and then did the opposite. Classic.',
      'One or two hero moments. The caddy noted them.',
      'Almost perfect discipline. Almost.'
    ],
    manyHero: [
      'The caddy is questioning your commitment to listening.',
      'Multiple hero attempts. The ego was fully in charge today.',
      'You asked the caddy a lot. You listened... less.',
      'The gap between knowing and doing. That\'s where your strokes live.',
      'The caddy talked. The ego listened louder.',
      'More hero shots than smart plays. That\'s honest, at least.'
    ],
    lowUsage: [
      'Everyone starts somewhere. Open the app more and see what happens.',
      'You asked once. Imagine if you asked on every trouble shot.',
      'One consultation. One smart decision. Build from there.',
      'The caddy was available all day. You checked in briefly.',
      'Imagine if you asked more often.'
    ]
  },

  flexKickers: {
    perfect: [
      '{smart} shots consulted. {smart} times I listened. Discipline.',
      'Zero hero shots. My ego took the day off. — Caddy Logic',
      'I listened to my caddy every time. The boring golfer wins.'
    ],
    withHero: [
      '{total} shots. {smart} smart, {hero} hero. My caddy has notes.',
      'I listened to my caddy {smart} out of {total} times. No comment on the rest.',
      'My caddy said Smart Play. I said Let It Eat. My caddy was right. — Caddy Logic'
    ]
  },

  roasts: [
    'Just got out-caddied by a phone app. Consulted Caddy Logic {total} times and listened {smart}. That hero shot? Don\'t ask.',
    'My golf caddy app told me to hit center green. I said "I can reach that pin." Reader, I could not reach that pin.',
    'Downloaded @CaddyLogic and it\'s basically a therapist for my golf game. "How\'d that work out?" is my new least favorite question.',
    'Caddy Logic said lay up. I said "I can carry the water." The water said no.',
    '{total} shots today. The caddy was right {smart} times. My ego was right... still calculating.',
    'My caddy app told me to punch out sideways. I went through the trees. Trees: 1. Me: 0.'
  ],

  everySwing: 'Head down. Eye on the ball. Smooth back, accelerate through. Finish your swing.',

  // =============================================
  // CONFIDENCE MODEL — bar widths (visual only)
  // =============================================
  confidence: {
    baseSmart: 90, baseHero: 55,
    penalties: {
      lt_rough:{s:-3,h:-5},dp_rough:{s:-12,h:-22},bare_dirt:{s:-5,h:-12},
      fwy_bnk:{s:-10,h:-20},grn_bnk:{s:-8,h:-15},divot:{s:-5,h:-10},
      up_lie:{s:-3,h:-5},dn_lie:{s:-5,h:-10},below_ft:{s:-8,h:-15},above_ft:{s:-5,h:-10},
      trees:{s:-10,h:-25},water:{s:-5,h:-18},lip:{s:-8,h:-20},
      wind_1:{s:-2,h:-3},wind_2:{s:-3,h:-6},wind_3:{s:-8,h:-14},
      rain:{s:-3,h:-5},long_club:{s:-3,h:-8}
    },
    min: 8
  },

  // =============================================
  // PRIVACY POLICY
  // =============================================
  privacyPolicy: `Caddy Logic collects zero data. Everything stays on your device.\n\nNo accounts. No sign-ups. No tracking. No analytics. No ads. No data sold.\n\nYour club distances, shot history, and round data are stored locally on your phone using your browser's storage. If you clear your browser data, this information is deleted.\n\nWe don't know who you are, where you play, or what you shoot. That's by design.\n\nYour caddy, your data.`,

  termsOfService: `Caddy Logic provides golf strategy suggestions for recreational use only.\n\nThis app is not a substitute for professional golf instruction. All advice is general guidance based on common golf situations.\n\nNot approved for use during sanctioned tournament play per USGA Rule 4.3.\n\nUse at your own discretion. Caddy Logic is not responsible for any outcomes on the golf course.\n\nBy using this app, you acknowledge that golf involves inherent risks and that club selection and shot strategy are ultimately your responsibility.\n\nKnow the play. Make the call.`,

  // =============================================
  // HELPERS
  // =============================================
  getKicker(key) {
    const pool = this.kickers[key] || this.kickers._default;
    return pool[Math.floor(Math.random() * pool.length)];
  },
  getWelcome() {
    return this.welcomes[Math.floor(Math.random() * this.welcomes.length)];
  },
  findClub(bag, dist) {
    const active = bag.filter(c => c.on).sort((a, b) => b.dist - a.dist);
    if (!active.length) return null;
    // Find club where distance >= adjusted (enough club)
    let best = null;
    for (const c of active) {
      if (c.dist >= dist) best = c;
    }
    // If no club reaches, use longest
    if (!best) best = active[0];
    // If exact match or closest, prefer slightly more club
    return best;
  },
  findHeroClub(bag, smartClub, dist) {
    const active = bag.filter(c => c.on).sort((a, b) => b.dist - a.dist);
    const idx = active.findIndex(c => c.name === smartClub.name);
    // Hero uses one less club (shorter) for a tighter shot
    if (idx < active.length - 1) return active[idx + 1];
    return smartClub;
  },
  calcConfidence(conds, wind, rain, clubDist) {
    let s = this.confidence.baseSmart, h = this.confidence.baseHero;
    for (const c of conds) {
      const p = this.confidence.penalties[c];
      if (p) { s += p.s; h += p.h; }
    }
    if (wind >= 1) { const wk = 'wind_' + wind; const p = this.confidence.penalties[wk]; if (p) { s += p.s; h += p.h; } }
    if (rain) { s += this.confidence.penalties.rain.s; h += this.confidence.penalties.rain.h; }
    if (clubDist && clubDist >= 170) { s += this.confidence.penalties.long_club.s; h += this.confidence.penalties.long_club.h; }
    return { smart: Math.max(this.confidence.min, Math.min(100, s)), hero: Math.max(this.confidence.min, Math.min(100, h)) };
  },
  sortBag(bag) {
    return bag.sort((a, b) => b.dist - a.dist);
  }
};
if (typeof module !== 'undefined') module.exports = CL;
