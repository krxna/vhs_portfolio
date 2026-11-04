// Everything a visitor reads lives here. Rename a tape, change its keywords or rewrite an exhibit
// without touching any image. `room` picks a map from rooms.js; each object's `key` is its letter
// on that map, `sprite` is how it's drawn (machine, desk, shelf, plant, board, crate, bench, screen),
// and `text` is a list of paragraphs (long ones page automatically). Objects play in this order on autoplay.

import { FLOOR, PSST, SAVED, WHY } from './script.js'

// Landing text beside the TV
export const INTRO = {
  name: 'Krishna Suryawanshi', // full-width header across the top
  // the three steps in the dialogue box: what to do on arrival
  steps: [
    'Pick a tape off the rack. Start with UNSAID.',
    'Upon inserting the tape, the tape plays on its own. If you want to take over, use arrow keys to walk, Enter to talk to people or interact with the environment, and Escape to eject.',
    '(Only Chromium-based browsers on macOS) You can also hold FLOW on the VCR and say a tape\'s name to load it.',
  ],
  // the same steps on a phone: no keys, and no FLOW (macOS only)
  touchSteps: [
    'Pick a tape off the rack. Start with UNSAID.',
    'Upon inserting the tape, the tape plays on its own. If you want to take over, use the D-pad under the TV to walk and A to talk to people or interact with the environment. Tap ← Back to eject.',
  ],
}

// 1-bit pixel art, '#' = ink: the header's link icons, and the contacts on the TELL ME WHY end card
export const ICONS = {
  mail: ['############', '##........##', '#.#......#.#', '#..#....#..#', '#...#..#...#', '#....##....#', '#..........#', '############'],
  x: ['######.......##.', '.###.##.....##..', '..##..##...##...', '..###..##.###...', '...##..#####....', '....##..###.....', '.....##..##.....', '.....##..##.....', '.....###..##....', '....#####..##...', '....##..##.###..', '...##...##..##..', '..##.....##.###.', '.##.......######'],
  linkedin: ['##........', '##........', '..........', '##.##.###.', '##.####.##', '##.##...##', '##.##...##', '##.##...##', '##.##...##'],
}

// pixel icons under the name
export const LINKS = [
  { icon: 'mail', label: 'Email', href: 'mailto:krishnasuresh.s23@iiits.in' },
  { icon: 'x', label: 'X', href: 'https://x.com/krishna_gz' },
  { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/krishna-gz/' },
]

// the sign on the page, and the word ribbon that loops from it to the UNSAID tape
export const CAMPAIGN = 'Wispr Flow India campaign'
export const LOOP = 'WISPR FLOW INDIA CAMPAIGN  ·  PLAY THIS TAPE  ·  '

export const TAPES = [
  {
    label: 'UNSAID',
    keywords: ['unsaid', 'un said', 'film', 'campaign', 'grandfather', 'grandpa'],
    video: 'unsaid/film.mp4', // no room: the tape is just the film (src/Film.jsx)
  },
  {
    label: 'PSST',
    keywords: ['psst', 'pssst', 'pst', 'game jam', 'jam', 'iota', 'whisper', 'word of mouth'],
    room: 'resort',
    title: 'GAME JAM',
    script: PSST, // who's there, what they say, and the order it plays in: src/script.js
    objects: [
      { key: 'a', sprite: 'board', name: 'The posters', text: ["We were running a Game Jam at IOTA Club. Make a game, then play everyone else's. Money was tight, sponsors weren't biting, and posters, reels and banners got us 19 sign-ups."] },
      { key: 'b', sprite: 'desk', name: 'The idea', text: ["My idea was to stop explaining. Our team went up to juniors and asked, \"Have you heard of Game Jam? What do you think the prize pool is?\" Then they just walked off."] },
      { key: 'c', sprite: 'crate', name: 'The Coke deal', text: ["Talk to ten people, get a Coke. In about a week, pretty much everyone knew the name, even if they had no clue what it was."] },
      { key: 'd', sprite: 'screen', name: 'The reveal', text: ["Only then did we put the details out on Instagram and the college email. That's when sign-ups really took off."] },
      { key: 'e', sprite: 'shelf', name: 'The numbers', text: ["19 signed up from the posters. After we started asking around in person, that went to 167, and turnout was up 20% on last year.", "All it cost us was 8 Diet Cokes. We never tested which channel did what."] },
    ],
  },
  {
    label: 'SAVED',
    keywords: ['saved', 'leanstack', 'lean stack', '5s', 'kaizen', 'factory', 'audit'],
    room: 'fix',
    title: 'LEANSTACK',
    script: SAVED,
    objects: [
      { key: 'a', sprite: 'desk', name: 'The old way', text: ['5S is a Japanese method for keeping a workplace in order: Sort, Set in order, Shine, Standardise, Sustain. A 5S audit walks a site zone by zone and scores each S with a checklist.', 'It used to mean paper checklists, photos on a phone, then Excel, charts and a report assembled by hand. For a 30–40-zone plant, the reports alone took about 20 hours.'] },
      { key: 'b', sprite: 'board', name: 'The pitch', text: ['Nobody asked me to fix it. I took the idea of digitising 5S audits and Kaizen tracking (Kaizen: small, everyday improvements, photographed before and after) to the firm\'s lead consultant, and we built Leanstack.'] },
      { key: 'c', sprite: 'machine', name: 'The phone call', text: ['Zone leaders, the people in charge of each area, audit each other\'s zones too. One of them, who already distrusted the app, took a phone call in the middle of a 50-question audit.', 'The app had only kept his answers while it stayed open on screen. When he came back, it had started over from question 1.'] },
      { key: 'd', sprite: 'crate', name: 'The fix', text: ['I sat down on site with Claude Code and fixed it in about 5–10 minutes. Then I asked him to fill in 10–15 questions, and I called his phone. When he came back, his answers were still there. He kept going.'] },
      { key: 'e', sprite: 'screen', name: 'The report', text: ['Reports are now generated seconds after an audit is submitted. Leanstack is live at three firms, with about ten more planned.'] },
    ],
  },
  {
    label: 'ASK THE FLOOR',
    keywords: ['ask the floor', 'floor', 'inventory', 'stock', 'interviews'],
    room: 'floor',
    title: 'INVENTORY APP',
    script: FLOOR,
    objects: [
      { key: 'a', sprite: 'bench', name: 'The question', text: ['A customer asks a salesperson, "When can my order arrive?" The answer is spread across paper, messages and three other departments.'] },
      { key: 'b', sprite: 'board', name: 'Going there', text: ['I visited the client\'s plant, mapped who passes what to whom, and talked to the people who would actually use the app, not just their manager.'] },
      { key: 'c', sprite: 'screen', name: 'Sales view', text: ['Sales needs to see stock, availability and a delivery estimate immediately.'] },
      { key: 'd', sprite: 'bench', name: 'Production view', text: ['Production needs schedules, quantities and a timeline.'] },
      { key: 'e', sprite: 'desk', name: 'What changed', text: ['The plan started as one shared dashboard. After the interviews, each role gets its own view. Same data, different jobs.', 'Still in development. No usage numbers yet.'] },
    ],
  },
  {
    label: 'TELL ME WHY?',
    keywords: ['tell me why', 'why wispr', 'about', 'about me', 'krishna', 'contact', 'evolve', 'evolution'],
    room: 'studio',
    title: 'TELL ME WHY?',
    script: WHY, // Brendan evolving, form by form: src/script.js
    objects: [
      { key: 'a', sprite: 'machine', name: 'The plant', text: ['AB Associates, a manufacturing consulting firm. One-on-one with owners and founders, building solutions with their teams.', 'Learned: OWNERSHIP.'] },
      { key: 'b', sprite: 'desk', name: 'The lab', text: ['Research under respected cardiologists, working with them and their physician assistants.', 'Learned: ANALYSIS.'] },
      { key: 'c', sprite: 'shelf', name: 'The paper', text: ['A computer networking paper, published with my professor. Little guidance, a lot of determination.', 'Learned: ANALYSIS.'] },
      { key: 'd', sprite: 'screen', name: 'The camera', text: ['UNSAID, my first ad. Stories, UGC and AI video, wherever it means the most.', 'Learned: STORYTELLING.'] },
      { key: 'e', sprite: 'crate', name: 'The Coke crate', text: ['PR lead and events teams in college clubs. The Game Jam whisper trick.', 'Learned: WORD OF MOUTH.'] },
    ],
  },
]
