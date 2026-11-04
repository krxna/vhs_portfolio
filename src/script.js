// The scripts the tapes play. Edit any line and the tape changes; nothing else needs touching.
//
// people: everyone standing around.
//   at: [x, y] tile on the map · look: their Emerald sprite (public/assets/emerald/) · face: up / down / left / right
//   name: on their dialog box · talk: what they say when you walk up and press Enter
//   buzz: what they say once word has spread (from the beat marked `buzz: true`)
//   party: where they dance [x, y] · partyTalk: what they say there
// crowd: extra people who only show up for the party: [x, y, look], or [x, y, look, face] to stand still (playing a game)
// stall: the Coke stall hands a can from `from` to each spot in `to`, in turn
// beats: the autoplay, in order. Each one walks the player to `to` (an exhibit letter from content.js, or a person)
//   and plays `say`. A line is 'text' (said by whoever you walked up to) or ['Name', 'text'] for anyone else.
//   No `say` on an exhibit plays its text from content.js. `party: true` starts the party, `stats: true` shows the results;
//   `hold: seconds` on either sets how long autoplay stays on it.
// stats: the results screen. A number in a value counts up; [label, value, picture] draws a picture after it.

const E = name => `emerald/${name}.png`
const ME = 'Krishna', TEAM = 'PR team', JR = 'Junior', STALL = 'Stall'

export const PSST = {
  me: ME, // the player: their lines at an exhibit are said to the viewer, facing the screen
  people: {
    // juniors (first-years) who've never heard of Game Jam
    f1: { at: [12, 40], look: E('lass'), face: 'up', name: JR, party: [25, 15],
      talk: ["Posters? Honestly, I walk past those every day. Never read one."],
      buzz: ["Okay, I give up. What IS Game Jam? Everyone keeps asking me."],
      partyTalk: ["I made a game. Me! It's mostly bugs, but people are playing it."] },
    f2: { at: [20, 38], look: E('youngster'), face: 'right', name: JR, party: [27, 17],
      talk: ["Game what?"],
      buzz: ["Three different people asked me about Game Jam today. Three! What even is it?"],
      partyTalk: ["Our game's a racing thing. The car only turns left. It's a feature now."] },
    f3: { at: [37, 40], look: E('girl_3'), face: 'left', name: JR, party: [33, 15],
      talk: ["Is that a club thing? I only just figured out where the canteen is."],
      buzz: ["Someone asked me how big I think the prize pool is. How would I know? Now I really want to know."],
      partyTalk: ["I just played like six games in a row. Some of these are actually good!"] },
    f4: { at: [24, 31], look: E('school_kid_m'), face: 'down', name: JR, party: [31, 17],
      talk: ["I think I saw a reel? Maybe? I scroll fast."],
      buzz: ["Nobody will tell me anything about it. Which is exactly why I'm signing up."],
      partyTalk: ["Same time next year? I already have an idea."] },
    f5: { at: [35, 24], look: E('girl_1'), face: 'down', name: JR, party: [29, 14],
      talk: ["Sorry, assignments. So many assignments."],
      buzz: ["Everyone's talking about the prize pool. How big is it? Just tell me!"],
      partyTalk: ["Okay, fine. This was so worth it."] },
    f6: { at: [10, 37], look: E('boy_1'), face: 'right', name: JR, party: [24, 18],
      talk: ["Not really my thing, I think."],
      buzz: ["I keep hearing the name. Wait, do you actually make the games? Like, yourself?"],
      partyTalk: ["Turns out it was totally my thing."] },

    // my team, who go and ask
    t1: { at: [40, 32], look: E('reporter_f'), face: 'left', name: TEAM, party: [34, 18],
      talk: ["So we just ask, then walk off? Kind of evil. I love it."],
      buzz: ["They keep chasing us for details now. We're not telling them a thing."],
      partyTalk: ["A week ago they didn't know the name. Look at them now."] },
    t2: { at: [38, 35], look: E('boy_3'), face: 'up', name: TEAM, party: [23, 16],
      talk: ["Ten people, one Coke. Got it."],
      buzz: ["That's ten people. Coke me."],
      partyTalk: ["I'm never doubting the Coke plan again."] },

    // the Diet Coke stall, open, with a line out front
    seller: { at: [45, 18.4], look: E('mart_employee'), face: 'down', name: STALL },
    q1: { at: [44, 20], look: E('gameboy_kid'), face: 'up', name: TEAM,
      talk: ["Eight people down. Two more and that can's mine."], partyTalk: ["Got my Coke. Worth every single chat."] },
    q2: { at: [46, 20], look: E('girl_2'), face: 'up', name: JR,
      talk: ["Wait, you get a Coke just for talking to people? Where do I sign?"] },
    q3: { at: [43, 20], look: E('boy_2'), face: 'right', name: JR,
      talk: ["Some guy just asked if I'd heard of Game Jam and then just walked off. Who does that?"] },
    q4: { at: [47, 20], look: E('woman_2'), face: 'left', name: TEAM,
      talk: ["Diet, please. That's ten people. I've earned it."] },
    q5: { at: [42, 20], look: E('picnicker'), face: 'up', name: JR,
      talk: ["I don't even know what Game Jam is yet. I'm just here for the Coke."], partyTalk: ["Okay, now I know what Game Jam is."] },
    q6: { at: [48, 20], look: E('man_3'), face: 'up', name: TEAM,
      talk: ["Ten juniors, all asked about the prize pool. Not one of them guessed right."] },
    q7: { at: [43, 21], look: E('woman_5'), face: 'up', name: JR,
      talk: ["My friend got one, so obviously I need one too."] },
    q8: { at: [47, 21], look: E('camper'), face: 'up', name: TEAM,
      talk: ["Is this line for Coke or for Game Jam? Honestly, both work."] },
  },

  stall: { from: [45, 18.4], to: [[44, 20], [46, 20], [43, 20], [47, 20], [42, 20], [48, 20], [43, 21], [47, 21]] },

  crowd: [
    [26, 13, E('beauty')], [28, 16, E('camper')], [30, 13, E('picnicker')], [32, 16, E('man_3')], [24, 14, E('rich_boy')], [34, 14, E('woman_5')],
    [26, 16, E('woman_3')], [30, 16, E('boy_2')], [32, 13, E('lass')], [28, 13, E('girl_2')], [35, 16, E('youngster')], [23, 13, E('twin')],
    [27, 10, E('artist')], [29, 9, E('psychic_m')], [31, 10, E('hex_maniac')], // the band, up on stage
    [23, 11, E('gameboy_kid'), 'up'], [25, 11, E('school_kid_m'), 'up'], [33, 11, E('girl_3'), 'up'], [35, 11, E('boy_1'), 'up'], // on stage, playing each other's games
  ],

  beats: [
    { to: 'a', say: [[ME, "So we did the usual thing for Game Jam 2026, a flagship event of IOTA, the club I was a PR Lead at. Posters, reels, banners, the whole thing."], [ME, "19 sign-ups. Nineteen. For a Game Jam. Come on."]] },
    { to: 'f1', say: ["Game Jam? No idea, sorry. Is that a club thing?", [ME, "(Okay. Nobody's reading the posters.)"]] },
    { to: 'b', say: [[ME, "So in the club meeting I said: let's stop explaining it."], [ME, "Make people curious enough that they go looking for it themselves."]] },
    { to: 't1', say: [
      [ME, "Here's the plan. Go find the juniors. Just ask them, \"Hey, have you heard of Game Jam?\""],
      "That's it?",
      [ME, "Then ask what they think the prize pool is. And then... just leave."],
      "Leave? Without telling them anything?",
      [ME, "Yep. Let them wonder. They'll go ask their friends, and their friends will ask theirs."],
    ] },
    { to: 't2', say: ["Okay, but why would anyone go around doing this?", [ME, "Talk to ten people, you get a Coke."], "Ten people, one Coke. Deal."] },
    { to: 'c', say: [[STALL, "Ten people already? Fair enough. Here you go."], [ME, "Honestly? Cheapest marketing we ever did."]] },
    { to: 'f2', buzz: true, say: ["Three different people asked me about Game Jam today. Three! What even is it?", [ME, "Can't tell you yet. Soon, though."]] },
    { to: 'f5', say: ["Everyone's talking about the prize pool. How big is it? Just tell me!", [ME, "You'll find out. Promise."]] },
    { to: 'd', say: [[ME, "About a week in, pretty much everyone knew the name. They just didn't know what it was."], [ME, "That's when we dropped the details on Instagram and the college email."], [ME, "And the registrations finally started coming in."]] },
    { party: true, title: 'GAME JAM NIGHT', hold: 6, at: [29, 18], cam: [29, 13], floor: [23, 13, 35, 17], games: [[23, 10], [25, 10], [33, 10], [35, 10]] },
    // at: where you end up · cam: what the camera frames · floor: the dance floor [x0, y0, x1, y1] · games: screens people play on
    { to: 'f2', say: ["Our game's a racing thing. The car only turns left.", [ME, "That's... a choice."], "It's a feature now. Go play it!"] },
    { to: 't1', say: ["A week ago they didn't even know the name. Now look at them.", [ME, "Everyone made a game, and now everyone's playing everyone else's. That's the whole point."]] },
    { stats: true },
  ],

  stats: {
    title: 'GAME JAM: HOW IT WENT',
    rows: [
      ['Initial sign-ups', '19'],
      ['After implementing my strategy', '167'],
      ['Turnout vs last year', 'up 20%'],
      ['Time to spread the name', 'about 1 week'],
      ['What it cost us', '8', 'resort/diet_coke.png'], // a third item draws that picture after the value
    ],
    note: "19 came from posters, reels and banners. 167 after we started asking around in person. We never tested which channel did what.",
  },
}

// SAVED (Leanstack). Same fields as PSST, plus:
// props: things on the floor, [x, y, kind]: trash / paper / can / box. They block the way.
// a beat's `to` can also be a tile [x, y] (a zone to audit)
// score: the Leanstack phone pops up while that beat plays: zone, marks [[S, percent]] (optional),
//   or one question: head ('1S SORT · Q2/50', numbered across all 50), q (the question), pick ('2' / '1' / '0' / 'NA', tapped after a moment)
//   note at the bottom, lost: true turns it red · tag: [x, y, '40%'] leaves a score sign over the zone (tags: [...] for several)
// selfie: true shows the audit selfie (the player up close, the room behind him) while that beat plays
// score: { call: 'Name' } shows an incoming call from Name instead
// ring: someone's phone rings (red "!" over them)
// Facts follow ~/main/audit5s: 10 questions per S, each 2 / 1 / 0 / NA, scored as a percentage.
const LEAD = 'Zone leader', BOSS = 'Lead consultant', PHONE = 'Phone', STAFF = 'Office staff'
const S5 = (a, b, c, d, e) => [['1S SORT', a], ['2S SET IN ORDER', b], ['3S SHINE', c], ['4S STANDARDISE', d], ['5S SUSTAIN', e]]

export const SAVED = {
  me: ME,
  people: {
    // sat at the computer desk, on its chair
    boss: { at: [4, 3], look: E('devon_employee'), face: 'up', name: BOSS,
      talk: ["Two full days of report work after every big audit. If your app gets rid of that, I'm listening."] },
    lead: { at: [7, 8], look: E('man_4'), face: 'down', name: LEAD,
      talk: ["Smartphones and me? We're still getting to know each other."] },
    // works in the storage corner (Zone 1) and knows it's a mess
    staff: { at: [11, 5], look: E('woman_1'), face: 'left', name: STAFF,
      talk: ["Please don't look at the storage corner. We're... getting to it."] },
  },

  props: [
    [11, 4, 'box'], [8, 5, 'box'], [10, 5, 'paper'], [11, 3, 'paper'], // storage: boxes left wherever they landed
    [4, 10, 'trash'], [8, 10, 'can'], [9, 11, 'paper'], // desks: rubbish on the floor
  ],

  beats: [
    // cold open: the moment it all nearly fell apart, then back to the start
    { to: 'lead', ring: 'lead', score: { call: 'Plant Manager' },
      say: [[PHONE, "Ring ring!"], "Hello? ...Yes, sir. ...Okay, coming."] },
    { to: 'lead', score: { zone: 'ZONE 7 · OFFICE', head: '1S SORT · Q1/50', q: 'Only required files, documents and stationery are kept on desks and in cabinets.', lost: true, note: 'AUDIT RESET' },
      say: ["...Hang on. Where'd it all go? It's back on question 1!", [ME, "(He never trusted this app. Now he had proof.)"], [ME, "Let me back up."]] },
    { to: 'a', say: [
      [ME, "I was working with a lean consulting firm. They help factories and offices run better."],
      [ME, "One of their main tools is 5S: a checklist for keeping a workplace in order. Sort, set in order, shine, standardise, sustain."],
      [ME, "A consultant walks the site area by area. Each area is a zone, and each zone gets scored against that checklist. That's a 5S audit."],
      [ME, "Back then it was paper, phone photos, then hours in Excel building the report. For a plant with 30 to 40 zones, about two full working days."],
    ] },
    { to: 'boss', say: [
      [ME, "Nobody asked me to, but I went to the lead consultant with an idea. What if all of it lived on a phone?"],
      [ME, "The 5S audits, and the Kaizen tracking too. Kaizen is their word for small, everyday improvements: spot a problem, fix it, photo before and after."],
      "The questions, the photos, the scores... all of it?",
      [ME, "All of it. And the report makes itself the moment you hit submit."],
      "...Okay. Show me.",
    ] },
    { to: 'b', score: { zone: 'ZONE 1 · OFFICE', head: '1S SORT · Q1/50', q: 'Only required files, documents and stationery are kept on desks and in cabinets.' },
      say: [
      [ME, "Here's how an audit runs in the app. You pick the zone and type in the zone leader's name, the person in charge of keeping it in shape."],
      [ME, "Then 50 questions, one at a time. Under each one, four boxes: 2 is well implemented, 1 is progressing, 0 is needs improvement."],
      [ME, "NA if the question doesn't apply here. At the end, the marks add up to a percentage for the zone. Let me show you."],
    ] },
    { to: [9, 4], selfie: true, say: [
      [ME, "Zone 1, the storage corner. Every audit starts the same way: a selfie, and the phone notes the location."],
      [ME, "Proof that I was actually standing here, not filling it in from my desk."],
    ] },
    { to: [9, 4], score: { zone: 'ZONE 1 · OFFICE', head: '1S SORT · Q2/50', q: 'Unused or non-working equipment (printers, phones, chairs) is removed from the office.', pick: '0' },
      say: [
      [STAFF, "Please don't look at the storage corner. We're... getting to it."],
      [ME, "\"Unused or non-working equipment is removed from the office.\" Boxes everywhere. Nothing's been removed. So I tap 0."],
      [ME, "Then a photo, marked as a nonconformity. That's audit-speak for \"this isn't up to standard\"."],
    ] },
    { to: [9, 4], tag: [10, 3, '40%'], score: { zone: 'ZONE 1 · OFFICE', marks: S5(45, 30, 50, 40, 35), note: 'NEEDS SUPPORT' },
      say: [
      [ME, "50 questions later, the app adds it all up: a score for each S, and one for the whole zone."],
      [ME, "90% and up is Outstanding. 75 is On Track. 60 is Improving. Below that, Needs Support. This zone got 40%."],
    ] },
    { to: [5, 9], tags: [[1, 4, '92%'], [6, 8, '62%']], // mid-floor, so the camera frames both signs above the dialog
      say: [[ME, "Zone by zone, same routine. The shelves got 92%, Outstanding. The desks, with rubbish on the floor, got 62%."]] },
    { to: 'lead', say: [
      [ME, "Remember him? He's a zone leader. They audit each other's zones too, so they'd be using this app every week."],
      [ME, "If they didn't trust it, they'd go back to paper, and the reports would go back to Excel. And he wasn't exactly a phone person."],
      "I'll give it a go. But if this thing eats my work, I'm going back to paper.",
    ] },
    { to: 'lead', score: { zone: 'ZONE 7 · OFFICE', head: '3S SHINE · Q23/50', q: 'Computers, keyboards, phones and printers are clean and in working order.', pick: '1' },
      say: [[ME, "And he was doing fine. Zone 7, question 23 of 50. Then came that phone call."]] },
    { to: 'lead', score: { zone: 'ZONE 7 · OFFICE', head: '1S SORT · Q1/50', q: 'Only required files, documents and stationery are kept on desks and in cabinets.', lost: true, note: 'AUDIT RESET' },
      say: [
      [ME, "Here's what happened. The app only held on to his answers while it stayed open on the screen."],
      [ME, "Taking the call pushed it into the background. When he came back, it had started over, and all 22 answers were gone."],
      [ME, "For someone who already didn't trust the app, that was all the proof he needed. Every zone leader would be back on paper by next week."],
    ] },
    { to: 'd', say: [
      [ME, "So I sat down right there with Claude Code and fixed it. Took maybe 5 to 10 minutes."],
      [ME, "Now every tap is saved on the phone the moment you make it. Take a call, switch apps, whatever."],
      [ME, "You come back to the same question, with every answer still there."],
    ] },
    { to: 'lead', say: [[ME, "Do me a favour. Start the audit again, answer 10 or 15 questions, and I'll call you."], "Fine. One more chance."] },
    { to: 'lead', ring: 'lead', score: { call: ME },
      say: [[PHONE, "Ring ring!"], "It's you. Very funny.", [ME, "Hang up and go back to the app."]] },
    { to: 'lead', score: { zone: 'ZONE 7 · OFFICE', head: '2S SET IN ORDER · Q14/50', q: 'Any document / file can be retrieved within 60 seconds (retrieval test).', pick: '2', note: 'ANSWERS STILL HERE' },
      say: ["...Huh. It's all still there. Question 14, right where I left it.", "Alright, alright. I'll keep going."] },
    { to: 'e', say: [
      [ME, "And when you submit? Scores, charts and the report are ready within seconds. No Excel."],
      [ME, "Every nonconformity photo goes to that zone's leader as something to fix, with a spot for the after photo. That's the Kaizen side of it."],
    ] },
    { to: 'c', say: [
      [ME, "But that phone call is what I actually took away from all this."],
      [ME, "Making the work faster wasn't enough. People only switch to something new when they trust it won't lose their work."],
      [ME, "One lost audit nearly undid everything. A 10-minute fix, and proving it to him on the spot, is what won him back."],
    ] },
    { stats: true },
  ],

  stats: {
    title: 'LEANSTACK: HOW IT WENT',
    rows: [
      ['Reports, 30–40-zone plant', 'about 20 h'],
      ['Report after submitting', 'seconds'],
      ['Firms using it', '3'],
      ['More firms planned', 'about 10'],
    ],
  },
}

// ASK THE FLOOR (inventory app). Same fields as PSST. Facts follow the interview record: four roles,
// one shared dashboard that became a view per role, still in development, no usage numbers.
const SALES = 'Sales', CUST = 'Customer', OWNER = 'Owner', PROD = 'Production', SHOP = 'Shop floor', LOGI = 'Logistics'

export const FLOOR = {
  me: ME,
  people: {
    sales: { at: [1, 6], look: E('man_2'), face: 'up', name: SALES,
      talk: ["Stock's in one register, production's on a whiteboard, trucks are on someone's phone. I just want one answer."] },
    cust: { at: [2, 6], look: E('man_5'), face: 'left', name: CUST,
      talk: ["Simple question. When does my order arrive?"] },
    owner: { at: [4, 8], look: E('gentleman'), face: 'up', name: OWNER,
      talk: ["Everyone here has a piece of the answer. Nobody has all of it."] },
    prod: { at: [12, 11], look: E('expert_m'), face: 'up', name: PROD,
      talk: ["Don't ask me \"when\". Show me what's due, how many, and by which day."] },
    shop: { at: [10, 7], look: E('hiker'), face: 'up', name: SHOP,
      talk: ["I make the stuff. The questions usually reach me third-hand."] },
    logi: { at: [18, 9], look: E('sailor'), face: 'right', name: LOGI,
      talk: ["Tell me what's ready and when. Then I can book the truck."] },
  },

  beats: [
    { to: 'cust', say: ["When can my order arrive?", [SALES, "Let me check and call you back."], [ME, "(That \"let me check\" is the whole problem.)"]] },
    { to: 'sales', say: [
      "To answer him, I message the warehouse for stock, production for what's still being made, and logistics for a truck.",
      "Then I wait. Then I guess.",
    ] },
    { to: 'a' },
    { to: 'owner', say: [
      "Everyone here has a piece of the answer. Nobody has all of it.",
      [ME, "The first plan was one shared dashboard for everyone. But before building it, I wanted to meet the people who'd actually use it."],
    ] },
    { to: 'b' },
    { to: 'prod', say: ["Don't ask me \"when\". Show me what's due, how many, and by which day.", [ME, "(Sales wants an answer. Production wants a schedule.)"]] },
    { to: 'shop', say: ["I make the stuff. The questions usually reach me third-hand.", [ME, "(Which is why I asked him directly, not just his manager.)"]] },
    { to: 'logi', say: ["Tell me what's ready and when. Then I can book the truck.", [ME, "(Same data again. A different question.)"]] },
    { to: 'c' },
    { to: 'd' },
    { to: 'e' },
    { to: 'sales', say: [
      [ME, "So next time a customer asks?"],
      "Stock, what's left to make and a delivery estimate, right on my screen. No calls.",
      [ME, "That's the plan. It's still being built."],
    ] },
    { stats: true },
  ],

  stats: {
    title: 'INVENTORY APP: WHERE IT IS',
    rows: [
      ['Roles the app connects', '4'],
      ['Dashboards planned', '1 per role'],
      ['Status', 'in development'],
      ['Usage numbers', 'none yet'],
    ],
    note: 'Owner, sales, production and logistics.',
  },
}

// TELL ME WHY? Brendan "evolves" through every room that taught me what moves people (campaign/tell-me-why.md).
// `evolve` plays the Emerald evolution screen: `to` is the new form's walk sheet (public/assets/tmw/formN.png,
// unedited copies of resort/brendan.png until you drop in your own outfit sheets), `item` what he
// earns (it stays on the platform with him from then on). It can be a list. `moves` shows the move list ([skill, items, the form that learned it]) during that beat's lines.
const F = n => `tmw/form${n}.png`, SYS = '' // system lines have no name tab

export const WHY = {
  me: ME,
  player: F(0),
  stage: true, // no room to walk: every beat plays on the evolution backdrop
  beats: [
    { to: [7, 7], say: [
      [ME, "I've always been fascinated by what moves people."],
      [ME, "I get a kick out of making people feel something. After seeing our campaign, they shouldn't be the same person they were a few seconds ago."],
      [SYS, "KRISHNA already knows CURIOSITY. Every room since taught him a new move."],
    ] },
    { to: [7, 7], evolve: { to: F(1), name: 'CONSULTANT', move: 'OWNERSHIP', item: 'tablet' } },
    { to: [7, 7], say: [
      [ME, "At AB Associates, a manufacturing consulting firm, I sat one-on-one with company owners and founders, and built solutions with their teams."],
      [ME, "The app I built is used by companies with more than 100 crore turnover. When it's that real, nobody else is going to own it for you."],
    ] },
    { to: [7, 7], evolve: { to: F(2), name: 'RESEARCHER', move: 'ANALYSIS', item: ['laptop', 'papers'] } },
    { to: [7, 7], say: [
      [ME, "Then research. I did research under some of the most respected cardiologists, working with them and their physician assistants."],
      [ME, "And at college I got a computer networking paper published with my professor. A topic I chose myself, with very little guidance."],
      [ME, "Both times, nobody was going to hand me the answer. I owned it: read everything I could find, tested it, evaluated it, analysed it."],
      [ME, "Most of the work was condensing. Consolidating dozens of papers, datasets and case reports into a few insights someone could actually use."],
      [ME, "And when the data didn't make sense, I asked the people closest to it. That's where the answers were."],
    ] },
    { to: [7, 7], evolve: { to: F(4), name: 'GUERRILLA MARKETER', move: 'WORD OF MOUTH', item: 'can' } },
    { to: [7, 7], say: [
      [ME, "As a PR lead and on events teams in college clubs, my job was getting people to show up."],
      [ME, "For Game Jam I stole a trick, like an artist. We asked first-years if they'd heard of it, then walked off. No details."],
      [ME, "It ended up doing wonders. That's the PSST tape."],
    ] },
    { to: [7, 7], evolve: { to: F(5), name: 'STORYTELLER', move: 'STORYTELLING', item: 'camera' } },
    { to: [7, 7], say: [
      [ME, "Then I made my first ad, about a grandfather who never said what he felt. That's UNSAID."],
      [ME, "I love being creative like this: seeing how a story moves people, and what they do after it."],
      [ME, "And I like getting my hands dirty with AI video, wherever it means the most."],
    ] },
    { to: [7, 7], evolve: { to: F(6), name: 'GROWTH INTERN', item: 'phone' } }, // no move: the move list comes next
    { to: [7, 7], moves: [['OWNERSHIP', ['tablet'], 'CONSULTANT'], ['ANALYSIS', ['laptop', 'papers'], 'RESEARCHER'], ['WORD OF MOUTH', ['can'], 'GUERRILLA MARKETER'], ['STORYTELLING', ['camera'], 'STORYTELLER']], say: [
      [SYS, "KRISHNA wants to learn GROWTH."],
      [SYS, "But KRISHNA can't learn more than four moves. Delete a move to make room for GROWTH?"],
      [ME, "No. GROWTH needs all of them."],
    ] },
    { to: [7, 7], say: [
      [ME, "Founders, doctors, professors, first-years. Working with all of them taught me what people want, what they respond to, and what pulls them in."],
      [ME, "At Wispr Flow I want to design UGC campaigns, pick creators, see the results, and learn it end to end."],
      [ME, "I want to craft in-person experiences and events, for a more intimate, wholehearted reach."],
      [ME, "I'd love to join Wispr Flow as a growth intern."],
    ] },
    { stats: true, hold: 30 },
  ],

  stats: {
    title: 'TELL ME WHY: NEXT FORM',
    rows: [
      ['UGC campaigns', 'creators + results'],
      ['In-person events', 'intimate reach'],
      ['AI video', 'where it matters'],
      ['Next form', 'Wispr Flow'],
    ],
    note: "I'd love to join Wispr Flow as a growth intern.",
    links: true, // the header's email / X / LinkedIn icons, with their addresses (LINKS in content.js)
  },
}
