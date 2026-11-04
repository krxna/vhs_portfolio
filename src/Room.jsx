import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { IMAGE_MAPS, MAPS, THEMES } from './rooms'
import { ICONS, LINKS } from './content'
import { music, tone, track } from './audio'

// GBA-style room: 240×160 view of 16px world tiles, drawn at 2× so dialog text stays crisp.
// Image maps (rooms.js IMAGE_MAPS) are 32px-tile PNGs, so one PNG pixel = one canvas pixel; they scroll.
// A tape with a `script` (src/script.js) gets people to talk to and plays its beats; otherwise autoplay
// just visits the exhibits in order.
const T = 16, Z = 2, VW = 240, VH = 160, FONT = '20px VT323', SMALL = '16px VT323'
const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' }
const DIRS = ['down', 'left', 'up', 'right']
const ROW = { down: 0, left: 1, right: 2, up: 3 } // walk-sheet rows
const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
const FADE = 1.2 // seconds to black, and back, when the party starts

// a phone or tablet: no arrow keys, so App shows an on-screen D-pad + A that feed the same key() calls
export const TOUCH = matchMedia('(pointer: coarse)').matches

const IMG = {}
const img = src => IMG[src] ||= Object.assign(new Image(), { src: '/assets/' + src })

function init(tape) {
  const im = IMAGE_MAPS[tape.room], map = im ? im.grid : MAPS[tape.room], pos = {}, sc = tape.script
  let px = 7, py = 8
  map.forEach((row, y) => [...row].forEach((c, x) => (c === 'P' ? ((px = x), (py = y)) : (pos[c] = { x, y }))))
  const objs = tape.objects.map(o => ({ ...o, ...pos[o.key], seen: false }))
  return {
    map, im, sc, theme: THEMES[tape.room], objs,
    people: Object.entries(sc?.people ?? {}).map(([id, p]) => ({ ...p, id, x: p.at[0], y: p.at[1], talked: false })),
    beats: sc?.beats ?? objs.map(o => ({ to: o.key })),
    props: sc?.props ?? [], tags: [], phone: null,
    beat: -1, buzz: false, party: null, fade: null, stats: null, sign: { text: tape.title, t0: 0 },
    px, py, dir: 'up', move: null, dialog: null, auto: null, held: [], t: 0, dark: 0,
    sheet: sc?.player, evo: null, items: [], moves: null,
  }
}

const objAt = (s, x, y) => s.objs.find(o => o.x === x && o.y === y)
const personAt = (s, x, y) => s.people.find(p => p.x === x && p.y === y)
const gameAt = (s, x, y) => s.party?.games?.some(g => g[0] === x && g[1] === y)
const propAt = (s, x, y) => s.props.some(p => p[0] === x && p[1] === y)
const free = (s, x, y) => '.PD'.includes(s.map[y]?.[x] ?? '#') && !objAt(s, x, y) && !personAt(s, x, y) && !gameAt(s, x, y) && !propAt(s, x, y)
const target = (s, to) => Array.isArray(to) ? { x: to[0], y: to[1] } : s.objs.find(o => o.key === to) ?? s.people.find(p => p.id === to)
// narrating to the viewer (the player's own lines, or an exhibit's text, away from people): face the screen
const facing = (s, d = s.dialog) => (d?.narrate && !s.move && [s.sc?.me, d.who].includes(d.pages[d.page].name) ? 'down' : s.dir)
const lines = (s, p) => (s.party && p.partyTalk) || (s.buzz && p.buzz) || p.talk // what someone says right now

// BFS to any tile next to o; returns the steps and the direction to face at the end.
function route(s, o) {
  const k = (x, y) => y * 1000 + x, prev = new Map([[k(s.px, s.py), null]]), q = [[s.px, s.py]]
  while (q.length) {
    const [x, y] = q.shift()
    for (const [d, [dx, dy]] of Object.entries(D))
      if (x + dx === o.x && y + dy === o.y) {
        const path = []
        for (let c = k(x, y); prev.get(c); c = prev.get(c)[0]) path.unshift(prev.get(c)[1])
        return { path, face: d }
      }
    for (const [d, [dx, dy]] of Object.entries(D)) {
      const nx = x + dx, ny = y + dy
      if (!prev.has(k(nx, ny)) && free(s, nx, ny)) prev.set(k(nx, ny), [k(x, y), d]), q.push([nx, ny])
    }
  }
  return null
}

// autoplay: head for the current beat's target (party and stats beats need no walk)
function plan(s) {
  while (s.auto && s.auto.i < s.beats.length) {
    const b = s.beats[s.auto.i], t = b.to && target(s, b.to), r = t ? route(s, t) : { path: [], face: s.dir }
    if (r) return Object.assign(s.auto, r)
    s.auto.i++
  }
  s.auto = null
}

function wrap(ctx, text, max) {
  const out = []
  let line = ''
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w
    if (line && ctx.measureText(t).width > max) out.push(line), (line = w)
    else line = t
  }
  return [...out, line]
}

// lines: 'text' (said by `who`) or ['Name', 'text']; each becomes one or more 3-line pages
function open(s, ctx, who, say) {
  ctx.font = FONT
  const pages = [].concat(say).flatMap(l => {
    const [name, txt] = Array.isArray(l) ? l : [who, l], ls = wrap(ctx, txt, 432), out = []
    for (let k = 0; k < ls.length; k += 3) out.push({ name, lines: ls.slice(k, k + 3) })
    return out
  })
  s.dialog = { pages, page: 0, chars: 0, until: 0, who }
  tone(880, 0.05)
}
const pageLen = d => d.pages[d.page].lines.join('').length

// walk up to someone (or something) and hear them out
function talk(s, ctx, t, say) {
  if ('talk' in t) (t.face = OPP[s.dir]), (t.talked = true)
  else t.seen = true
  const l = say ?? t.text ?? lines(s, t)
  if (l) open(s, ctx, t.name, l), (s.dialog.narrate = !('talk' in t)), (s.dialog.target = t) // narrate: at an exhibit or zone, not a person

}

function runBeat(s, ctx, i) {
  const b = s.beats[i]
  s.beat = i
  s.stats = null
  // the form and items so far follow from the evolutions before this beat, so REW / FF land right.
  // An evolution's `item` can be one name or a list; everything earned stays with him.
  const evos = s.beats.slice(0, i).map(b => b.evolve).filter(Boolean)
  if (s.sc?.player) (s.sheet = evos.at(-1)?.to ?? s.sc.player), (s.items = evos.flatMap(e => e.item ?? []))
  s.moves = b.moves ?? null
  if (b.buzz) s.buzz = true
  s.phone = b.score ? { ...b.score, t0: s.t } : null
  s.selfie = b.selfie ? { t0: s.t } : null
  for (const g of b.tags ?? (b.tag ? [b.tag] : [])) s.tags = [...s.tags.filter(h => h[0] !== g[0] || h[1] !== g[1]), g]
  if (b.ring) target(s, b.ring).alert = s.t
  if (b.party) s.fade = { t0: s.t, b }
  else if (b.stats) s.stats = { t0: s.t }
  else if (b.evolve) s.evo = { ...b.evolve, from: s.sheet, t0: s.t }
  else talk(s, ctx, target(s, b.to), b.say)
  if (s.auto && !s.dialog && !s.fade && !s.stats && !s.evo) s.auto.i++, plan(s) // nothing to say: next beat
  // party and stats beats hold the screen for a while before autoplay moves on
  if (s.auto && (b.party || b.stats)) s.auto.wait = s.t + (b.party ? 2 * FADE : 0) + (b.hold ?? (b.party ? 12 : 20))
}

// halfway through the fade: night, everyone on the dance floor, the crowd turns up
function partyTime(s) {
  const b = s.fade.b
  s.party = { floor: b.floor, cam: b.cam, games: b.games }
  s.people.forEach(p => p.party && ([p.x, p.y] = p.party, (p.dance = true)))
  // crowd: [x, y, look, face]; anyone given a face stays put (playing a game, say) instead of dancing
  s.people.push(...(s.sc?.crowd ?? []).map(([x, y, look, face]) => ({ x, y, look, face: face ?? 'down', dance: !face })))
  Object.assign(s, { px: b.at[0], py: b.at[1], dir: 'up', move: null, dialog: null, sign: { text: b.title, t0: s.t } })
}

function advance(s) {
  const d = s.dialog
  if (d.chars < pageLen(d)) return void (d.chars = pageLen(d))
  if (++d.page < d.pages.length) return void ((d.chars = 0), (d.until = 0), tone(660, 0.04))
  s.dialog = null
  if (s.auto) s.auto.i++, plan(s)
}

function update(s, dt, ctx) {
  s.t += dt
  if (s.im?.night) s.dark += ((s.party ? 0.85 : 0) - s.dark) * Math.min(1, dt * 0.8)
  if (s.fade) {
    const k = s.t - s.fade.t0
    if (k > FADE && !s.party) partyTime(s)
    if (k > 2 * FADE) s.fade = null
    return
  }
  if (s.evo) {
    if (s.t - s.evo.t0 < EVO) return
    s.sheet = s.evo.to
    s.items = [...s.items, ...[].concat(s.evo.item ?? [])]
    s.evo = null
    if (s.auto) s.auto.i++, plan(s)
    return
  }
  if (s.selfie) {
    const k = s.t - s.selfie.t0
    if (k >= SNAP && !s.selfie.clicked) (s.selfie.clicked = true), tone(2400, 0.03, 'square', 0.05), tone(1200, 0.05, 'square', 0.04)
    if (k < SHOW) return
  }
  const d = s.dialog
  if (d) {
    const len = pageLen(d)
    if (d.chars < len) {
      const before = d.chars
      d.chars = Math.min(len, d.chars + dt * 65)
      if (Math.floor(d.chars / 3) > Math.floor(before / 3)) tone(1200, 0.015, 'square', 0.02)
    } else if (s.auto) {
      d.until ||= s.t + 4 // every page stays up 4s once it's typed out
      if (s.t > d.until) advance(s)
    }
    return
  }
  if (s.auto?.wait) {
    if (s.t < s.auto.wait) return
    s.auto.wait = 0
    s.auto.i++
    return plan(s)
  }
  if (s.move) {
    s.move.t += dt / 0.16
    if (s.move.t < 1) return
    s.px = s.move.x
    s.py = s.move.y
    s.move = null
  }
  let dir = s.held.at(-1)
  if (s.auto) {
    if (!s.auto.path.length) return void ((s.dir = s.auto.face), runBeat(s, ctx, s.auto.i))
    dir = s.auto.path.shift()
  }
  if (!dir) return
  s.dir = dir
  const nx = s.px + D[dir][0], ny = s.py + D[dir][1]
  if (free(s, nx, ny)) s.move = { x: nx, y: ny, fx: s.px, fy: s.py, t: 0 }
  if (s.party && !s.auto) s.party.cam = null // walking off: the camera follows you again
}

// ---------- drawing ----------
const R = (c, col, x, y, w, h) => ((c.fillStyle = col), c.fillRect(x, y, w, h))
const BOOKS = ['#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#e9c46a', '#8d5bd6']

const SPR = {
  machine(c, X, Y, t) {
    R(c, '#7d8590', X + 1, Y + 2, 14, 13); R(c, '#a9b1bb', X + 1, Y + 2, 14, 2); R(c, '#2b3440', X + 3, Y + 5, 10, 5)
    R(c, '#4ade80', X + 4, Y + 6, 1 + (Math.floor(t * 12) % 8), 3)
    R(c, Math.sin(t * 6) > 0 ? '#ff5050' : '#702020', X + 11, Y + 11, 2, 2); R(c, '#3a3f47', X + 1, Y + 15, 14, 1)
  },
  desk(c, X, Y) {
    R(c, '#a0693c', X, Y + 7, 16, 4); R(c, '#c58a55', X, Y + 7, 16, 1)
    R(c, '#6b4426', X + 1, Y + 11, 2, 5); R(c, '#6b4426', X + 13, Y + 11, 2, 5)
    R(c, '#222', X + 4, Y + 1, 8, 6); R(c, '#5ab0ff', X + 5, Y + 2, 6, 4); R(c, '#222', X + 7, Y + 6, 2, 1)
  },
  shelf(c, X, Y) {
    R(c, '#7a4a2a', X + 1, Y, 14, 16); R(c, '#3b2414', X + 2, Y + 1, 12, 6); R(c, '#3b2414', X + 2, Y + 8, 12, 6)
    BOOKS.forEach((b, i) => { R(c, b, X + 2 + i * 2, Y + 2 + (i % 2), 2, 5 - (i % 2)); R(c, BOOKS[5 - i], X + 2 + i * 2, Y + 9 + ((i + 1) % 2), 2, 5 - ((i + 1) % 2)) })
  },
  plant(c, X, Y) {
    R(c, '#b5562c', X + 5, Y + 10, 6, 5); R(c, '#cf6a3a', X + 4, Y + 10, 8, 2)
    R(c, '#2f9e44', X + 4, Y + 3, 8, 7); R(c, '#3cbf55', X + 6, Y + 1, 4, 3); R(c, '#2f9e44', X + 2, Y + 6, 3, 3); R(c, '#3cbf55', X + 11, Y + 5, 3, 3)
  },
  board(c, X, Y) {
    R(c, '#9aa3ad', X, Y, 16, 12); R(c, '#f4f7fb', X + 1, Y + 1, 14, 10)
    R(c, '#e55', X + 3, Y + 3, 8, 1); R(c, '#36c', X + 3, Y + 5, 10, 1); R(c, '#2a2', X + 3, Y + 7, 6, 1)
    R(c, '#555', X + 3, Y + 12, 1, 4); R(c, '#555', X + 12, Y + 12, 1, 4)
  },
  crate(c, X, Y) {
    R(c, '#b07a3c', X + 1, Y + 3, 14, 12); R(c, '#d39a55', X + 1, Y + 3, 14, 2)
    R(c, '#7a5226', X + 1, Y + 8, 14, 1); R(c, '#7a5226', X + 7, Y + 3, 1, 12)
  },
  bench(c, X, Y, t) {
    R(c, '#d7dde3', X, Y + 8, 16, 8); R(c, '#fff', X, Y + 8, 16, 1); R(c, '#9aa7b3', X, Y + 15, 16, 1)
    R(c, '#4cc9f0', X + 2, Y + 3, 3, 5); R(c, '#f72585', X + 7, Y + 1, 2, 7); R(c, '#b5e48c', X + 11, Y + 4, 3, 4)
    R(c, '#fff', X + 7, Y - (Math.floor(t * 3) % 3), 1, 1)
  },
  screen(c, X, Y, t) {
    R(c, '#333', X + 1, Y + 1, 14, 14); R(c, `hsl(${(t * 60) % 360} 70% 55%)`, X + 2, Y + 2, 12, 8)
    R(c, '#f33', X + 3, Y + 12, 2, 2); R(c, '#3cf', X + 7, Y + 12, 2, 2); R(c, '#fd3', X + 11, Y + 12, 2, 2)
  },
}

function player(c, X, Y, dir, walking, t) {
  const f = walking ? Math.floor(t * 8) % 2 : 0, skin = '#f1c27d', hair = '#2b1d14'
  R(c, 'rgba(0,0,0,.22)', X + 3, Y + 14, 10, 2)
  Y -= 3
  R(c, '#2a2f6b', X + 5, Y + 12, 2, 4 - f); R(c, '#2a2f6b', X + 9, Y + 12, 2, 3 + f)
  R(c, '#7b5cff', X + 4, Y + 7, 8, 6); R(c, skin, X + 3, Y + 8, 1, 4); R(c, skin, X + 12, Y + 8, 1, 4)
  R(c, skin, X + 4, Y + 1, 8, 6); R(c, hair, X + 4, Y, 8, 2)
  if (dir === 'up') R(c, hair, X + 4, Y, 8, 6)
  else if (dir === 'down') R(c, hair, X + 4, Y + 2, 1, 2), R(c, hair, X + 11, Y + 2, 1, 2), R(c, '#222', X + 6, Y + 4, 1, 2), R(c, '#222', X + 9, Y + 4, 1, 2)
  else if (dir === 'left') R(c, hair, X + 9, Y + 1, 3, 4), R(c, '#222', X + 5, Y + 4, 1, 2)
  else R(c, hair, X + 4, Y + 1, 3, 4), R(c, '#222', X + 10, Y + 4, 1, 2)
}

function text(c, str, x, y, col = '#303040', shadow = '#d4d4dc') {
  c.font = FONT
  c.fillStyle = shadow
  c.fillText(str, x + 2, y + 2)
  c.fillStyle = col
  c.fillText(str, x, y)
}

// one 64px frame of a 4×4 walk sheet, feet on tile (X, Y)
function actor(c, sheet, col, dir, X, Y) {
  const i = img(sheet)
  if (i.complete) c.drawImage(i, col * 64, ROW[dir] * 64, 64, 64, X - 8, Y - 16, 32, 32)
}

function marker(c, s, o) {
  if (o.seen) return
  const b = Math.sin(s.t * 5) > 0 ? 0 : 1
  R(c, '#1a1a1a', o.x * T + 6, o.y * T - 8 + b, 4, 8); R(c, '#ffd60a', o.x * T + 7, o.y * T - 7 + b, 2, 4); R(c, '#ffd60a', o.x * T + 7, o.y * T - 2 + b, 2, 1)
}

// a little "…" bubble over people you haven't talked to yet
function bubble(c, s, p) {
  const X = p.x * T + 3, Y = p.y * T - 22 + (Math.sin(s.t * 3 + p.x) > 0 ? 0 : 1)
  R(c, '#1a1a1a', X, Y, 11, 7); R(c, '#fff', X + 1, Y + 1, 9, 5); R(c, '#fff', X + 2, Y + 6, 2, 2)
  for (let k = 0; k < 3; k++) R(c, '#1a1a1a', X + 2 + k * 3, Y + 3, 1, 1)
}

// who is saying the current line: 'me' (the player), a person on the map, or nobody.
// A line with no name is said by whoever you walked up to; a named line goes to the nearest person with that name,
// and 'Phone' to whoever's phone rang last.
function speaker(s) {
  const d = s.dialog
  if (!d || s.fade) return null
  const name = d.pages[d.page].name, me = s.sc?.me
  if (name === me || (d.narrate && name === d.who)) return 'me'
  if (name === d.who && d.target && 'talk' in d.target) return d.target
  if (name === 'Phone') return s.people.filter(p => p.alert != null).sort((a, b) => b.alert - a.alert)[0] ?? null
  const dist = p => Math.hypot(p.x - s.px, p.y - s.py)
  return s.people.filter(p => p.name === name).sort((a, b) => dist(a) - dist(b))[0] ?? null
}

// a bobbing white arrow over whoever is talking
function pointer(c, s, x, y) {
  const X = x + 8, Y = y - 24 + (Math.floor(s.t * 4) % 2)
  for (let i = 0; i < 6; i++) R(c, '#1a1a1a', X - 5 + i, Y + i, 11 - 2 * i, 1)
  for (let i = 1; i < 4; i++) R(c, '#fff', X - 4 + i, Y + i, 9 - 2 * i, 1)
}

// a red "!" over someone whose phone is ringing
function alert(c, s, p) {
  const X = p.x * T + 4, Y = p.y * T - 24 + (Math.floor(s.t * 6) % 2)
  R(c, '#1a1a1a', X, Y, 8, 11); R(c, '#e03131', X + 1, Y + 1, 6, 9); R(c, '#fff', X + 3, Y + 2, 2, 4); R(c, '#fff', X + 3, Y + 7, 2, 2)
}

// a zone's audit score, left on a little sign once it's been scored
function tag(c, x, y, txt) {
  const col = BAND(parseInt(txt))
  R(c, '#5a4a3a', x * T + 7, y * T + 8, 2, 8); R(c, '#1a1a1a', x * T - 1, y * T - 1, 18, 11); R(c, col, x * T, y * T, 16, 9)
  c.font = '9px VT323'
  c.fillStyle = '#fff'
  c.fillText(txt, x * T + 8 - c.measureText(txt).width / 2, y * T + 7)
}

// floor clutter for the 5S audit
const PROP = {
  box(c, X, Y) { R(c, '#6b4f1d', X + 1, Y + 4, 14, 12); R(c, '#c8a040', X + 2, Y + 5, 12, 10); R(c, '#e8c860', X + 2, Y + 5, 12, 3); R(c, '#8a6a20', X + 7, Y + 5, 2, 10) },
  paper(c, X, Y) { R(c, '#9a9aa4', X + 4, Y + 9, 8, 5); R(c, '#f6f6f6', X + 4, Y + 8, 7, 5); R(c, '#cfcfd6', X + 6, Y + 10, 3, 1); R(c, '#f6f6f6', X + 10, Y + 12, 4, 3) },
  can(c, X, Y) { R(c, '#3a3a44', X + 3, Y + 9, 10, 5); R(c, '#d21f2b', X + 4, Y + 10, 7, 3); R(c, '#e4e4ec', X + 11, Y + 10, 1, 3) },
  trash(c, X, Y) { R(c, '#6b4a10', X + 3, Y + 9, 9, 5); R(c, '#f2b134', X + 4, Y + 9, 7, 4); R(c, '#3b82c4', X + 6, Y + 10, 3, 2); R(c, '#f6f6f6', X + 11, Y + 12, 3, 2) },
}

function glow(c, x, y, r, col) {
  const g = c.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, col)
  g.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
  c.fillStyle = g
  c.fillRect(x - r, y - r, 2 * r, 2 * r)
}

const can = (c, x, y) => (R(c, '#3a3a44', x, y, 5, 8), R(c, '#e4e4ec', x + 1, y + 1, 3, 6), R(c, '#fff', x + 1, y + 1, 1, 6), R(c, '#d21f2b', x + 1, y + 3, 3, 2))
const GIVE = 2.5, HOLD = 14 // seconds between cans, and how long each one lasts

// the stall: a can goes over the counter to each spot in `to` in turn. Whoever has one turns round and
// sips it every few seconds; when it's finished they face the stall again and wait for the next round.
function handout(c, s, { from, to }) {
  const n = Math.floor(s.t / GIVE), k = (s.t / GIVE - n) / 0.5
  to.forEach(([x, y], i) => {
    const last = n - ((((n - i) % to.length) + to.length) % to.length), held = s.t - (last * GIVE + 0.5) // last round this spot got a can
    const p = personAt(s, x, y), has = last >= 0 && held >= 0 && held < HOLD
    if (p) p.face = has ? 'down' : 'up'
    if (!has) return
    const sip = held % 3 > 2.2
    can(c, x * T + (sip ? 6 : 11), y * T + (sip ? -11 : -1))
  })
  if (k > 1) return
  const [tx, ty] = to[n % to.length]
  can(c, (from[0] + (tx - from[0]) * k) * T + 6, (from[1] + (ty - from[1]) * k) * T - 10 * Math.sin(k * Math.PI))
}

// disco: colour spots sweeping the dance floor and its LED tiles flashing
function disco(c, s) {
  const [x0, y0, x1, y1] = s.party.floor, cx = ((x0 + x1 + 1) / 2) * T, cy = ((y0 + y1 + 1) / 2) * T
  for (let i = 0; i < 5; i++) {
    const x = cx + Math.sin(s.t * 1.3 + i * 1.7) * (x1 - x0) * 8, y = cy + Math.cos(s.t * 0.9 + i * 2.3) * (y1 - y0) * 8, r = 44
    glow(c, x, y, r, `hsla(${(i * 72 + s.t * 90) % 360}, 100%, 60%, .55)`)
  }
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      if ((x * 7 + y * 13 + Math.floor(s.t * 4)) % 5 === 0) R(c, `hsla(${(x * 40 + y * 25 + s.t * 120) % 360}, 100%, 60%, .35)`, x * T, y * T, T, T)
}

function drawImageMap(s, c, X, Y) {
  const bg = img(s.im.img), w = bg.width / Z, h = bg.height / Z, [fx, fy] = s.party?.cam ? s.party.cam.map(v => v * T) : [X, Y]
  const fit = (v, m, V) => (m < V ? (m - V) / 2 : Math.max(0, Math.min(m - V, v + T / 2 - V / 2))) // a map smaller than the screen sits centred
  const cx = fit(fx, w, VW), cy = fit(fy, h, VH)
  s.left = X - cx > VW / 2 // player on the right half: the phone goes left
  R(c, '#000', 0, 0, VW, VH)
  c.translate(-Math.round(cx), -Math.round(cy))
  if (bg.complete) c.drawImage(bg, 0, 0, w, h)
  for (const [x, y, kind] of s.props) PROP[kind](c, x * T, y * T)
  // people back to front so whoever is lower on screen overlaps; at the party they dance (spin + bob)
  const beat = Math.floor(s.t * 2.5), hop = (k) => (s.party && (Math.floor(s.t * 5) + k) % 2 ? 2 : 0)
  const people = s.people.map((p, k) => [p.y * T, () => p.dance ? actor(c, p.look, 0, DIRS[(beat + k) % 4], p.x * T, p.y * T - hop(k)) : actor(c, p.look, 0, p.face, p.x * T, p.y * T)])
  // bits of the map art redrawn over whoever stands behind them (a shop counter): [x, y, w, h] in PNG pixels
  for (const [x, y, w, h] of s.im.front ?? []) people.push([(y + h) / Z, () => bg.complete && c.drawImage(bg, x, y, w, h, x / Z, y / Z, w / Z, h / Z)])
  for (const [x, y] of s.party?.games ?? []) people.push([y * T, () => SPR.screen(c, x * T, y * T, s.t)])
  const dance = s.party && !s.move && !s.auto?.path?.length
  if (!s.hideMe) people.push([Y, () => actor(c, s.im.player, s.move ? Math.floor(s.t * 8) % 4 : dance ? [1, 0, 3, 0][beat % 4] : 0, facing(s), X, Y - (dance ? hop(0) : 0))])
  people.sort((a, b) => a[0] - b[0]).forEach(p => p[1]())
  if (s.sc?.stall) handout(c, s, s.sc.stall)
  const n = s.im.night, layer = src => img(src).complete && c.drawImage(img(src), 0, 0, w, h)
  if (n && s.dark > 0.01) {
    c.globalAlpha = s.dark
    layer(n.mask)
    c.globalCompositeOperation = 'lighter'
    layer(Math.floor(s.t * 2) % 2 ? n.glowA : n.glowB)
    if (s.party) disco(c, s)
    for (const [x, y] of s.party?.games ?? []) glow(c, x * T + 8, y * T + 6, 20, 'hsla(190, 100%, 70%, .5)')
    c.globalCompositeOperation = 'source-over'
    c.globalAlpha = 1
  }
  const sp = !s.hideMe && speaker(s)
  if (!s.party && !s.hideMe) { // a selfie shows the room, not the game's markers
    s.objs.forEach(o => marker(c, s, o))
    const inLine = p => s.sc?.stall?.to.some(([x, y]) => x === p.x && y === p.y) // no bubbles over the can queue
    s.people.forEach(p => p.talk && !p.talked && p !== sp && !inLine(p) && !(s.t - p.alert < 3) && bubble(c, s, p))
    s.people.forEach(p => s.t - p.alert < 3 && alert(c, s, p))
    s.tags.forEach(g => tag(c, ...g))
  }
  if (sp === 'me') pointer(c, s, X, Y)
  else if (sp) pointer(c, s, sp.x * T, sp.y * T - (s.t - sp.alert < 3 ? 12 : 0)) // above the "!" while their phone rings
  c.setTransform(Z, 0, 0, Z, 0, 0)
  return [X - Math.round(cx), Y - Math.round(cy)] // where the player sits on screen
}

function draw(s, c) {
  const th = s.theme
  c.setTransform(Z, 0, 0, Z, 0, 0)
  c.imageSmoothingEnabled = false
  const m = s.move, k = m ? m.t : 0
  const X = Math.round((m ? m.fx + (m.x - m.fx) * k : s.px) * T), Y = Math.round((m ? m.fy + (m.y - m.fy) * k : s.py) * T)
  if (s.im && s.selfie) selfie(s, c, X, Y)
  else if (s.im) drawImageMap(s, c, X, Y)
  else if (s.sc?.stage) stage(c, s) // TELL ME WHY: no room, just Brendan on the green backdrop
  else drawTiles(s, c, th, X, Y)
  hud(s, c)
}

// the audit's selfie: the room behind the player, zoomed in, with the player up close facing the camera.
// The room is drawn off screen without him (and without markers), then blown up 2x around where he stands.
const SNAP = 1.6, SHOW = 2.6, WAIST = 112 // the selfie: the shutter goes at SNAP, the dialog comes up at SHOW

function selfie(s, c, X, Y) {
  const o = (s.off ||= Object.assign(document.createElement('canvas'), { width: VW * Z, height: VH * Z })), oc = o.getContext('2d')
  oc.setTransform(Z, 0, 0, Z, 0, 0)
  oc.imageSmoothingEnabled = false
  s.hideMe = true
  const [sx, sy] = drawImageMap(s, oc, X, Y)
  s.hideMe = false
  const k = s.t - s.selfie.t0, W = VW * Z, H = VH * Z, w = W / 2, h = H / 2
  const x0 = Math.max(0, Math.min(W - w, (sx + 8) * Z - w / 2)), y0 = Math.max(0, Math.min(H - h, (sy + 12) * Z - h / 2))
  // held at arm's length: the frame is tilted and shakes a little until the shutter goes, then freezes
  const sh = k < SNAP ? [Math.sin(k * 9) * 3, Math.cos(k * 7) * 2] : [0, 0]
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.imageSmoothingEnabled = false
  R(c, '#000', 0, 0, W, H)
  c.translate(W / 2 + sh[0], H / 2 + sh[1]); c.rotate(-0.07); c.scale(1.14, 1.14); c.translate(-W / 2, -H / 2)
  c.filter = 'blur(2px)' // the room behind him is out of focus, like a phone's front camera
  c.drawImage(o, x0, y0, w, h, 0, 0, W, H)
  c.filter = 'none'
  // him, close to the lens: face above the dialog, cut at the waist, his shirt running on out of the frame
  c.save(); c.scale(Z, Z); c.beginPath(); c.rect(-40, -40, 320, 40 + WAIST); c.clip()
  c.scale(6, 6); actor(c, s.im.player, 0, 'down', 12, 8); c.restore()
  c.save(); c.scale(Z, Z); R(c, '#101014', 72, WAIST, 98, 80); R(c, '#2e2e44', 76, WAIST, 90, 80); c.restore()
  c.save(); c.scale(Z, Z); arm(c); c.restore()
  c.setTransform(Z, 0, 0, Z, 0, 0)
  const f = (k - SNAP) / 0.4 // shutter flash
  if (f >= 0 && f < 1) R(c, `rgba(255,255,255,${1 - f})`, 0, 0, VW, VH)
}

// his arm reaching out to the phone, foreshortened: thin at the shoulder, wide where it leaves the frame
function arm(c) {
  const ax = 146, ay = 94, bx = 262, by = 196, L2 = (bx - ax) ** 2 + (by - ay) ** 2 // from his shoulder out past the bottom-right corner
  for (let y = 108; y < 200; y += 2)
    for (let x = 130; x < 266; x += 2) {
      const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / L2))
      const d = Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)), hw = 9 + t * 16
      if (d < hw) R(c, d > hw - 2.5 ? '#202020' : d < hw * 0.45 ? '#e0604a' : '#c0392b', x, y, 2, 2)
    }
}

function drawTiles(s, c, th, X0, Y0) {
  s.map.forEach((row, y) => [...row].forEach((ch, x) => {
    const X = x * T, Y = y * T
    if (ch === '#') {
      const face = s.map[y + 1] && s.map[y + 1][x] !== '#'
      if (!face) return R(c, th.wall[2], X, Y, T, T)
      R(c, th.wall[0], X, Y, T, T); R(c, th.wall[1], X, Y + 5, T, 1); R(c, th.wall[1], X, Y + 10, T, 1); R(c, th.wall[2], X, Y + 13, T, 3)
      return
    }
    R(c, th.floor[(x + y) % 2], X, Y, T, T); R(c, th.floor[2], X, Y, T, 1); R(c, th.floor[2], X, Y, 1, T)
    if (ch === 'D') R(c, '#8a3b2e', X + 2, Y + 4, 12, 10), R(c, '#b0503f', X + 3, Y + 5, 10, 8)
    if (ch === 'x') SPR[th.deco](c, X, Y, s.t)
  }))
  for (const o of s.objs) SPR[o.sprite](c, o.x * T, o.y * T, s.t), marker(c, s, o)
  player(c, X0, Y0, facing(s), !!s.move, s.t)
  if (speaker(s) === 'me') pointer(c, s, X0, Y0 + 8) // reading an exhibit out
}

// ---------- TELL ME WHY: Brendan evolving, Emerald style ----------
// old form, then white silhouettes flickering old/new faster and faster, a flash, the new form, the move it learned
const EVO = 11, FLICK = 1.8, REVEAL = 6, LEARN = 8.5

// a form is a 4×4 walk sheet like resort/brendan.png (or one square frame); its front frame is the top-left one
const frame = i => (i.width > i.height ? i.height : i.width / 4 >= 32 ? i.width / 4 : i.width)
// a form's front frame as a white silhouette (cached per sheet)
const SIL = {}
function silhouette(sheet) {
  const i = img(sheet)
  if (!i.complete) return null
  if (SIL[sheet]) return SIL[sheet]
  const f = frame(i), o = Object.assign(document.createElement('canvas'), { width: f, height: f }), oc = o.getContext('2d')
  oc.drawImage(i, 0, 0, f, f, 0, 0, f, f)
  oc.globalCompositeOperation = 'source-in'
  R(oc, '#fff', 0, 0, f, f)
  return (SIL[sheet] = o)
}

// what each form earns (drawn at 1px per unit, scaled up around him and in the move list)
const ITEM = {
  tablet(c) { R(c, '#1a1a22', 0, 0, 7, 9); R(c, '#e8f0ff', 1, 1, 5, 7); R(c, '#1B7F4B', 2, 2, 3, 1); R(c, '#BE7D0F', 2, 4, 3, 1); R(c, '#B3261E', 2, 6, 2, 1) },
  laptop(c) { R(c, '#2b2f3a', 0, 0, 10, 6); R(c, '#5ab0ff', 1, 1, 8, 4); R(c, '#fff', 2, 3, 1, 1); R(c, '#fff', 4, 2, 1, 1); R(c, '#fff', 6, 3, 1, 1); R(c, '#9aa3ad', -1, 6, 12, 2) },
  papers(c) { R(c, '#cfcfd6', 1, 1, 7, 9); R(c, '#fff', 0, 0, 7, 9); R(c, '#9a9aa4', 1, 2, 5, 1); R(c, '#9a9aa4', 1, 4, 4, 1); R(c, '#9a9aa4', 1, 6, 5, 1); R(c, '#ffd60a', 6, 1, 2, 2); R(c, '#f72585', 6, 4, 2, 2) },
  can(c) { const i = img('resort/diet_coke.png'); if (i.complete) c.drawImage(i, 0, 0, 7.5, 13) }, // your Diet Coke art, 15×26 at 2×
  camera(c) { R(c, '#1a1a22', 0, 2, 10, 6); R(c, '#3a3f47', 6, 0, 3, 2); R(c, '#5ab0ff', 2, 3, 4, 4); R(c, '#1a1a22', 3, 4, 2, 2); R(c, '#e03131', 8, 3, 1, 1); R(c, '#555', 4, 8, 2, 3) },
  phone(c) { R(c, '#1a1a22', 0, 0, 6, 10); R(c, '#fff8f4', 1, 1, 4, 7); R(c, '#e03131', 2, 3, 2, 2); R(c, '#555a66', 2, 9, 2, 1) },
}
const icon = (c, f, x, y, k) => (c.save(), c.translate(x, y), c.scale(k, k), f(c), c.restore())

// the green backdrop (original art, in the spirit of a GBA battle / evolution screen): a soft gradient,
// slow drifting light bands, and a pale oval platform he stands on
function backdrop(c, s) {
  const g = c.createLinearGradient(0, 0, 0, VH)
  g.addColorStop(0, '#d6f5c8'); g.addColorStop(0.5, '#86d29a'); g.addColorStop(1, '#3f9a6a')
  c.fillStyle = g
  c.fillRect(0, 0, VW, VH)
  for (let y = (s.t * 6) % 10 - 10; y < VH; y += 10) R(c, 'rgba(255,255,255,.12)', 0, Math.round(y), VW, 3)
  c.fillStyle = '#4f9e6a'; c.beginPath(); c.ellipse(VW / 2, 92, 62, 13, 0, 0, 7); c.fill()
  c.fillStyle = '#e6f7d6'; c.beginPath(); c.ellipse(VW / 2, 90, 58, 11, 0, 0, 7); c.fill()
}

// where earned items sit on the platform around him (never on him), filling outwards: right, left, right, ...
const SLOTS = [[28, 58], [-52, 58], [44, 30], [-68, 30], [54, 74], [-80, 74], [20, 8], [-44, 8]]

// Brendan on his platform (the sheet's front frame, feet on the oval) with every item he's earned around him.
// `fresh` items (just earned) bob. While the move list is up, the items move into it instead.
function stage(c, s, sheet = s.sheet, white = false, items = s.moves ? [] : s.items, fresh = 0) {
  backdrop(c, s)
  const src = white ? silhouette(sheet) : img(sheet), cx = VW / 2
  if (src && (white || src.complete)) { const f = white ? src.width : frame(src); c.drawImage(src, 0, 0, f, f, cx - 48, 3, 96, 96) }
  items.forEach((it, i) => { const [dx, dy] = SLOTS[i % SLOTS.length], bob = i >= items.length - fresh ? Math.round(Math.sin(s.t * 5)) : 0; icon(c, ITEM[it], cx + dx, dy + bob, 2) })
}

function evolution(c, s) {
  const e = s.evo, k = s.t - e.t0, cx = VW / 2, cy = 50
  // which body is on screen: the old one, flickering silhouettes (faster and faster, a blip on every swap), then the new one
  let sheet = k < REVEAL ? e.from : e.to, white = false
  if (k > FLICK && k < REVEAL) {
    const n = Math.floor(((k - FLICK) / (REVEAL - FLICK)) ** 1.7 * 26)
    sheet = n % 2 ? e.to : e.from
    white = true
    if (n !== e.n) (e.n = n), tone(440 + n * 30, 0.05, 'square', 0.03)
  }
  if (k > REVEAL && !e.rung) (e.rung = true), [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'square', 0.04), i * 120))
  if (k > LEARN && !e.learned) (e.learned = true), [784, 988, 1175].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'triangle', 0.06), i * 110))
  const got = k > REVEAL ? [].concat(e.item ?? []) : []
  stage(c, s, sheet, white, [...s.items, ...got], got.length)
  if (white) glow(c, cx, cy, 64, 'rgba(255,255,255,.45)')
  if (k > REVEAL) for (let i = 0; i < 8; i++) { // sparkles
    const a = i * 0.8 + k * 2, r = 34 + ((k * 30 + i * 9) % 20)
    if ((i + Math.floor(k * 6)) % 3) R(c, '#fff', cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 2)
  }
  R(c, '#2c3e7a', 3, 111, 234, 46); R(c, '#fff', 5, 113, 230, 42)
  c.setTransform(1, 0, 0, 1, 0, 0)
  const say = k < REVEAL ? ['What? KRISHNA is evolving!'] : k < LEARN || !e.move ? ['Congratulations! KRISHNA', `evolved into ${e.name}!`] : [`KRISHNA learned ${e.move}!`]
  say.forEach((l, i) => text(c, l, 22, 250 + i * 22))
  c.setTransform(Z, 0, 0, Z, 0, 0)
  if (k < 0.3 || (k > REVEAL && k < REVEAL + 0.4)) R(c, `rgba(255,255,255,${k < 0.3 ? 1 - k / 0.3 : 1 - (k - REVEAL) / 0.4})`, 0, 0, VW, VH)
}

// Emerald's move list, top right, while he decides what to forget: each skill with the items that taught it,
// and under it the form that learned it. moves: [['OWNERSHIP', ['tablet'], 'CONSULTANT'], ...]
function moveList(c, moves) {
  const x = 126, w = 110, row = 24
  R(c, '#2c3e7a', x, 4, w, 8 + moves.length * row); R(c, '#fff', x + 2, 6, w - 4, 4 + moves.length * row)
  moves.forEach(([, items], i) => items.forEach((it, k) => icon(c, ITEM[it], x + 5 + k * 14, 10 + i * row, 1.5)))
  c.setTransform(1, 0, 0, 1, 0, 0)
  moves.forEach(([m, , form], i) => {
    text(c, m, (x + 36) * Z, (9 + i * row + 10) * Z)
    c.font = SMALL
    c.fillStyle = '#6b6b78'
    if (form) c.fillText(form, (x + 36) * Z, (9 + i * row + 19) * Z)
  })
  c.setTransform(Z, 0, 0, Z, 0, 0)
}

const SIGN = 4 // seconds the location sign stays up

// Leanstack's rating bands (audit5s packages/domain/src/rating-scale.ts)
const BAND = n => (n >= 90 ? '#1B7F4B' : n >= 75 ? '#2A7097' : n >= 60 ? '#BE7D0F' : '#B3261E')

// the Leanstack audit on Brendan's phone: each S's bar fills to its percentage, then the zone score
function phone(c, s) {
  const p = s.phone, k = s.t - p.t0, y0 = 4 + Math.max(0, 1 - k / 0.3) ** 2 * 100, marks = p.marks ?? [], x0 = s.left ? 4 : 158
  R(c, '#1a1a22', x0, y0, 78, 94); R(c, '#2b2f3a', x0 + 1, y0 + 1, 76, 92); R(c, '#fff8f4', x0 + 4, y0 + 8, 70, 80)
  R(c, p.lost ? '#B3261E' : '#601A16', x0 + 4, y0 + 8, 70, 18); R(c, '#FF7300', x0 + 4, y0 + 26, 70, 1); R(c, '#555a66', x0 + 33, y0 + 3, 12, 2)
  if (p.call) return call(c, p, k, x0, y0)
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.font = SMALL
  const [num, name] = p.zone.split(' · '), L = (x0 + 7) * Z, Rt = (x0 + 71) * Z
  c.fillStyle = '#fff'
  c.fillText(num, L, (y0 + 16) * Z); c.fillText(name, L, (y0 + 24) * Z)
  if (p.q) return question(c, p, k, x0, y0, L)
  marks.forEach(([label, n], i) => {
    const t = k - 0.4 - i * 0.4
    if (t < 0) return
    const y = y0 + 30 + i * 10, f = Math.min(1, t / 0.6), pct = `${Math.round(n * f)}%`
    c.fillStyle = '#601A16'
    c.fillText(label, L, (y + 5) * Z)
    c.fillText(pct, Rt - c.measureText(pct).width, (y + 5) * Z)
    c.setTransform(Z, 0, 0, Z, 0, 0)
    R(c, '#ead2ca', x0 + 7, y + 6, 64, 2); R(c, BAND(n), x0 + 7, y + 6, Math.round(64 * f * n / 100), 2)
    c.setTransform(1, 0, 0, 1, 0, 0)
  })
  if (k > 0.4 + marks.length * 0.4 + 0.3) {
    const avg = marks.length && Math.round(marks.reduce((a, m) => a + m[1], 0) / marks.length)
    c.fillStyle = p.lost ? '#B3261E' : marks.length ? BAND(avg) : '#1B7F4B'
    c.fillText(marks.length ? `${avg}% · ${p.note}` : p.note, L, (y0 + (marks.length ? 85 : 50)) * Z)
  }
  c.setTransform(Z, 0, 0, Z, 0, 0)
}

// an incoming call over the audit: who's calling, and answer / decline buttons that pulse while it rings
function call(c, p, k, x0, y0) {
  R(c, '#1d2733', x0 + 4, y0 + 8, 70, 80)
  const ring = Math.floor(k * 3) % 2
  R(c, '#3d4a5c', x0 + 29, y0 + 24, 20, 20); R(c, '#8fa3bf', x0 + 31, y0 + 26, 16, 16) // caller avatar
  for (const [dx, col] of [[16, '#2fb344'], [52, '#e03131']]) {
    if (ring) R(c, col + '55', x0 + dx - 7, y0 + 67, 14, 14)
    R(c, col, x0 + dx - 5, y0 + 69, 10, 10)
  }
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.font = SMALL
  const mid = (t, y) => c.fillText(t, (x0 + 39) * Z - c.measureText(t).width / 2, y * Z)
  c.fillStyle = '#c9d4e3'
  mid('Incoming call', y0 + 18)
  c.fillStyle = '#1d2733'
  mid(p.call[0].toUpperCase(), y0 + 37)
  c.fillStyle = '#fff'
  mid(p.call, y0 + 55)
  c.fillStyle = '#c9d4e3'
  mid('mobile', y0 + 62)
  c.setTransform(Z, 0, 0, Z, 0, 0)
}

// one question as the app shows it: which S and number, the checkpoint, then the 2 · 1 · 0 · NA boxes.
// `pick` gets tapped a beat after the phone comes up; called with the transform at 1 (text in screen px).
const CHIPS = [['2', '#1B7F4B', '#d6eee0'], ['1', '#BE7D0F', '#f6e6c8'], ['0', '#B3261E', '#f4d4d0'], ['NA', '#555a66', '#e2e2e8']]
function question(c, p, k, x0, y0, L) {
  const [sec, num] = p.head.split(' · ')
  c.fillStyle = '#FF7300'
  c.fillText(sec, L, (y0 + 33) * Z)
  c.fillStyle = '#fff'
  c.fillText(num, (x0 + 71) * Z - c.measureText(num).width, (y0 + 16) * Z) // up in the header, beside the zone
  c.fillStyle = '#601A16'
  wrap(c, p.q, 64 * Z).slice(0, 6).forEach((l, i) => c.fillText(l, L, (y0 + 40 + i * 6) * Z))
  const tapped = k > 1.2
  CHIPS.forEach(([m, col, tint], i) => {
    const x = x0 + 8 + i * 16, y = y0 + 72, on = tapped && p.pick === m
    c.setTransform(Z, 0, 0, Z, 0, 0)
    R(c, col, x - (on ? 1 : 0), y - (on ? 1 : 0), 14 + (on ? 2 : 0), 10 + (on ? 2 : 0)); R(c, on ? col : tint, x + 1, y + 1, 12, 8)
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.fillStyle = on ? '#fff' : col
    c.fillText(m, (x + 7) * Z - c.measureText(m).width / 2, (y + 7.5) * Z)
  })
  if (p.note) {
    c.fillStyle = p.lost ? '#B3261E' : '#1B7F4B'
    c.fillText(p.note, L, (y0 + 88) * Z)
  }
  c.setTransform(Z, 0, 0, Z, 0, 0)
}

// the results screen: rows slide in one by one and their numbers count up
function results(c, s) {
  const st = s.sc.stats, k0 = s.t - s.stats.t0
  R(c, 'rgba(0,0,0,.55)', 0, 0, VW, VH)
  R(c, '#2c3e7a', 10, 8, 220, 144); R(c, '#f8f0d8', 12, 10, 216, 140); R(c, '#2c3e7a', 12, 10, 216, 20)
  c.setTransform(1, 0, 0, 1, 0, 0)
  text(c, st.title, 38, 50, '#fff', '#1a274f')
  st.rows.forEach(([label, val, pic], i) => {
    const k = Math.min(1, (k0 - 0.5 - i * 0.45) / 1.2)
    if (k <= 0) return
    const e = 1 - (1 - k) ** 3, y = 88 + i * 26
    c.globalAlpha = Math.min(1, k * 3)
    text(c, label, 40, y)
    const v = val.replace(/\d+/, n => Math.round(+n * e))
    c.font = FONT
    const pw = pic ? 21 : 0
    if (pic && img(pic).complete) c.drawImage(img(pic), 440 - 15, y - 21)
    text(c, v, 440 - pw - c.measureText(v).width, y, '#2c6b2f', '#cfe8c8')
    c.globalAlpha = 1
  })
  if (st.note && k0 > 0.5 + st.rows.length * 0.45 + 0.6) {
    c.font = SMALL
    const y0 = st.links ? 196 : 252 // links take the space under the note
    wrap(c, st.note, 400).forEach((ln, i) => { c.fillStyle = '#6b6b78'; c.fillText(ln, 40, y0 + i * 16) })
    if (st.links) contacts(c, s)
  }
  if (k0 > 0.5 + st.rows.length * 0.45 + 0.6) { // how to carry on once the tour's done
    c.font = SMALL
    const parts = [['Use ', '#303040'], [TOUCH ? 'the D-pad' : 'arrow keys', '#2c3e7a'], [' and ', '#303040'], [TOUCH ? 'A' : 'Enter', '#2c3e7a'], [' to explore', '#303040']]
    const w = parts.reduce((n, [t]) => n + c.measureText(t).width, 0)
    let x = VW - w / 2 + 8
    if (Math.floor(s.t * 2) % 2) (c.fillStyle = '#2c3e7a'), c.fillText('▶', x - 18, 296)
    for (const [t, col] of parts) (c.fillStyle = col), c.fillText(t, x, 296), (x += c.measureText(t).width)
  }
  c.setTransform(Z, 0, 0, Z, 0, 0)
}

// the end card's contacts: the header's pixel icons, each with its address. Email on one row, X and LinkedIn below.
// Each one is clickable: its box (icon + address, canvas px) goes in s.hits for the canvas's click handler.
function contacts(c, s) {
  const rows = [[LINKS[0]], LINKS.slice(1)]
  s.hits = []
  c.font = SMALL
  rows.forEach((row, r) => {
    let x = 40
    const y = 226 + r * 26 // text baseline, screen px
    for (const l of row) {
      const x0 = x, g = ICONS[l.icon], k = 14 / g.length // icon 14 screen px tall
      c.fillStyle = '#2c3e7a'
      g.forEach((line, gy) => [...line].forEach((ch, gx) => ch === '#' && c.fillRect(x + gx * k, y - 13 + gy * k, k + 0.3, k + 0.3)))
      x += Math.max(...g.map(line => line.length)) * k + 6
      const t = l.href.replace(/^mailto:|^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
      c.fillText(t, x, y)
      const w = c.measureText(t).width
      R(c, '#2c3e7a', x, y + 2, w, 1) // underlined, like a link
      s.hits.push({ x0: x0 - 4, y0: y - 17, x1: x + w + 4, y1: y + 6, href: l.href })
      x += w + 22
    }
  })
}

function hud(s, c) {
  const k = s.t - s.sign.t0
  if (k < SIGN) { // location sign, GBA style
    const y = k < 0.25 ? -24 + k * 112 : k > SIGN - 0.25 ? 4 - (k - SIGN + 0.25) * 112 : 4
    c.font = FONT
    const w = Math.max(120, c.measureText(s.sign.text).width / Z + 28)
    R(c, '#7a5a2a', 4, y, w, 20); R(c, '#f8f0d8', 6, y + 2, w - 4, 16)
    c.setTransform(1, 0, 0, 1, 0, 0)
    text(c, s.sign.text, 20, (y + 14) * Z)
    c.setTransform(Z, 0, 0, Z, 0, 0)
  }
  if (s.phone) phone(c, s)
  if (s.stats) results(c, s)
  if (s.moves) moveList(c, s.moves)
  if (s.evo) return evolution(c, s)
  if (s.fade) {
    const f = (s.t - s.fade.t0) / FADE
    R(c, `rgba(0,0,0,${f < 1 ? f : Math.max(0, 2 - f)})`, 0, 0, VW, VH)
  }

  const d = s.dialog
  if (!d || (s.selfie && s.t - s.selfie.t0 < SHOW)) return
  const pg = d.pages[d.page]
  c.font = FONT
  const nameW = Math.ceil(c.measureText(pg.name).width / Z) + 10
  if (pg.name) R(c, '#2c3e7a', 5, 99, nameW, 14)
  R(c, '#2c3e7a', 3, 111, 234, 46); R(c, '#fff', 5, 113, 230, 42)
  c.setTransform(1, 0, 0, 1, 0, 0)
  if (pg.name) text(c, pg.name, 20, 222, '#fff', '#1a274f') // system lines (evolution, moves) have no name
  let left = Math.floor(d.chars)
  pg.lines.forEach((ln, i) => {
    text(c, ln.slice(0, Math.max(0, left)), 22, 250 + i * 22)
    left -= ln.length
  })
  if (d.chars >= pageLen(d) && Math.sin(s.t * 8) > 0) {
    c.setTransform(Z, 0, 0, Z, 0, 0)
    R(c, '#e04040', 225, 149, 6, 2); R(c, '#e04040', 226, 151, 4, 1); R(c, '#e04040', 227, 152, 2, 1)
  }
}

export default forwardRef(function Room({ tape, paused }, ref) {
  const cv = useRef(), st = useRef(null), ctx = useRef(), pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    const c = (ctx.current = cv.current.getContext('2d'))
    st.current = init(tape)
    document.fonts?.load(FONT)
    let last = performance.now(), raf
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!pausedRef.current) update(st.current, dt, c)
      draw(st.current, c)
      const tr = st.current.theme.track // the second track takes over for the party
      if (tr) track(pausedRef.current ? null : tr[st.current.dark > 0.4 ? 1 : 0] ?? tr[0])
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [tape])

  useEffect(() => {
    const th = THEMES[tape.room]
    music(paused || th.track ? null : th.notes)
    return () => (music(null), track(null))
  }, [tape, paused])

  useImperativeHandle(ref, () => ({
    // returns true when the key was used, so the page doesn't scroll
    key(k, down) {
      const s = st.current
      const dir = KEYS[k]
      if (dir) {
        // walking takes control back from autoplay (and clears its phone / selfie / results); Enter only hurries the page along
        if (down) Object.assign(s, { auto: null, phone: null, selfie: null, stats: null })
        s.held = s.held.filter(x => x !== dir)
        if (down) s.held.push(dir)
        return true
      }
      if (!down || !['Enter', ' ', 'z', 'Z'].includes(k)) return false
      if (s.stats) s.stats = null
      else if (s.dialog) advance(s)
      else if (!s.move && !s.fade && !s.auto) {
        const x = s.px + D[s.dir][0], y = s.py + D[s.dir][1], t = objAt(s, x, y) ?? personAt(s, x, y)
        if (t) talk(s, ctx.current, t)
      }
      return true
    },
    // picks the story up at the next beat it hasn't played
    play() {
      if (st.current.beat >= st.current.beats.length - 1) st.current = init(tape) // the tour's over: play it from the top
      const s = st.current
      Object.assign(s, { dialog: null, move: null, held: [], stats: null })
      s.auto = { i: Math.min(s.beat + 1, s.beats.length - 1), path: [] }
      plan(s)
    },
    stop() {
      if (st.current) (st.current.auto = null), (st.current.held = [])
    },
    // REW / FF: jump to the previous / next beat and play it
    jump(delta) {
      const s = st.current, i = Math.max(0, Math.min(s.beats.length - 1, s.beat + delta)), b = s.beats[i], t = b.to && target(s, b.to)
      tone(300, 0.08, 'sawtooth', 0.04)
      Object.assign(s, { dialog: null, move: null, fade: null, evo: null })
      if (s.auto) Object.assign(s.auto, { i, path: [], wait: 0 })
      if (!t) return runBeat(s, ctx.current, i)
      for (const [face, [dx, dy]] of [['up', D.up], ['left', D.left], ['right', D.right], ['down', D.down]])
        if (free(s, t.x - dx, t.y - dy)) {
          Object.assign(s, { px: t.x - dx, py: t.y - dy, dir: face })
          return runBeat(s, ctx.current, i)
        }
    },
  }))

  // the end card's contacts (s.hits, set by contacts()) open their link in a new tab on click
  const hit = e => {
    const s = st.current, r = cv.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) * 480) / r.width, y = ((e.clientY - r.top) * 320) / r.height
    return s?.stats && s.hits?.find(h => x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1)
  }
  const click = e => {
    const h = hit(e)
    if (!h) return st.current?.dialog && advance(st.current) // tapping the dialog box reads on, like Enter
    window.open(h.href, '_blank', 'noopener') // every contact link, email included, opens in a new tab
  }
  return <canvas ref={cv} width={480} height={320} className="fill pixel" onClick={click}
    onMouseMove={e => (cv.current.style.cursor = hit(e) ? 'pointer' : '')} />
})
