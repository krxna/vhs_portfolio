import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { CAMPAIGN, INTRO, LINKS, LOOP, TAPES, ICONS } from './content'
import { matchTape } from './match'
import { useVoice, WISPR } from './Recorder'
import Room, { TOUCH } from './Room'
import Film from './Film'
import { noise, setVolume, tone } from './audio'

const A = '/assets/'
// Each render is shown at a fixed scale (native px → stage px). Feature coordinates below are in
// native px of the trimmed WebPs in public/assets (see scripts/cutout.py).
const TV = { s: 0.52, w: 1101, h: 1116 }
const T = 1.05 // tape size: sleeves lie on their side on the rack, cassettes match
const SLEEVE = { w: 43 * T, h: 237.6 * T }, CAS = { w: 30 * T, h: 225 * T } // upright spine boxes
const NUDGE = 9 // the selected tape slides this far along its ledge (about 11px of room before the post)
const SINK = 78 // zoomed in: how much of the rack hides past the left edge (stops just before the labels)
const ZS = 0.7 // zoomed in (wide): rack + tapes shrink so the TV gets the room
// wall rack: each ledge's top-face line (+3 so tapes rest on it) as native y at x=100 and x=850; tapes sit centred at x=470
const RACK = { s: 0.32, w: 936, h: 1432, mid: 470, ledges: [[197, 55], [493, 351], [789, 645], [1085, 941], [1362, 1229]] }
const nudge = (t, on) => ({ x: on ? t.ux * NUDGE : 0, y: on ? t.uy * NUDGE : 0 })
// cassette scale at the VCR flap: PEEK sits proud of it, PARK is pushed in with the spine still showing
const PEEK = 1.33 * TV.s / 0.45 / T, PARK = 1.22 * TV.s / 0.45 / T

const TV_BTNS = [
  ['eject', 'Eject', [60, 879, 135, 915]],
  ['power', 'Power', [64, 957, 130, 1022]],
  ['stop', 'Stop', [192, 970, 286, 1022]],
  ['rew', 'Previous exhibit', [288, 970, 382, 1022]],
  ['play', 'Play tour', [384, 970, 510, 1022]],
  ['ff', 'Next exhibit', [512, 970, 606, 1022]],
  ['flow', 'Hold to talk with Flow', [608, 970, 712, 1022]],
  ['voldown', 'Volume down', [922, 919, 991, 957]],
  ['volup', 'Volume up', [992, 919, 1057, 957]],
]

const PAD_H = 150 // touch controls strip under the TV (match .pad in index.css)
// a D-pad button holds its arrow down for as long as the finger stays on it, and at least 150 ms,
// so a quick tap still lands on a frame and takes one step
const hold = (room, k) => {
  let t0 = 0
  const up = () => setTimeout(() => room.current?.key(k, false), Math.max(0, 150 - (performance.now() - t0)))
  return {
    onPointerDown: e => (e.preventDefault(), e.currentTarget.setPointerCapture?.(e.pointerId), (t0 = performance.now()), room.current?.key(k, true)),
    onPointerUp: up, onPointerCancel: up, onLostPointerCapture: up, onContextMenu: e => e.preventDefault(),
  }
}

const box = (s, [x0, y0, x1, y1]) => ({ left: x0 * s, top: y0 * s, width: (x1 - x0) * s, height: (y1 - y0) * s })
const wait = ms => new Promise(r => setTimeout(r, ms))
// clientWidth, not innerWidth: mobile widens the layout viewport to fit the unscaled stage
const vp = () => [document.documentElement.clientWidth, document.documentElement.clientHeight]
const pickMode = () => (vp()[0] < vp()[1] * 0.95 ? 'tall' : 'wide')

function geo(mode) {
  const wide = mode === 'wide'
  const tvW = TV.w * TV.s, tvH = TV.h * TV.s, rackW = RACK.w * RACK.s, rackH = RACK.h * RACK.s
  // tall: the TV sits low enough for the campaign sign to fit between the intro and the TV
  const W = wide ? 1200 : 640, H = wide ? 810 : 290 + tvH + 40 + rackH + 40
  const tv = wide ? { x: 560, y: H - 40 - tvH } : { x: (W - tvW) / 2, y: 290 }
  const intro = wide ? { left: 40, top: 30, width: 490 } : { left: 40, top: 30, width: W - 80 }
  const rack = wide ? { x: 0, y: H - 40 - rackH } : { x: (W - rackW) / 2, y: tv.y + tvH + 40 }
  // each tape lies on its ledge: bottom edge on the ledge line, rotated to its slope
  const tapes = RACK.ledges.map(([y0, y1]) => {
    const r = Math.atan2(y0 - y1, 750), py = y0 + ((y1 - y0) * (RACK.mid - 100)) / 750
    const cx = RACK.mid * RACK.s - (Math.sin(r) * SLEEVE.w) / 2, cy = py * RACK.s - (Math.cos(r) * SLEEVE.w) / 2
    return { x: cx - SLEEVE.h / 2, y: cy - SLEEVE.w / 2, cx: rack.x + cx, cy: rack.y + cy, a: (-r * 180) / Math.PI, ux: Math.cos(r), uy: -Math.sin(r) }
  })
  // zoomed in: the intro drops out of frame and the rack slides up beside the TV, its left part sunk off-screen
  const x0 = wide ? tv.x - 30 - (rackW - SINK) * ZS : Math.min(tv.x, rack.x) - 20, y0 = Math.min(tv.y, rack.y) - 20
  const x1 = tv.x + tvW + 20, y1 = Math.max(tv.y + tvH, rack.y + rackH) + 20
  return {
    W, H, wide, tv, tvW, tvH, intro, rack, rackW, rackH, tapes, frame: [x0, y0, x1 - x0, y1 - y0],
    slot: { x: tv.x + 524 * TV.s, y: tv.y + 852 * TV.s },
    screen: box(TV.s, [119, 116, 981, 714]),
  }
}

// Stage camera: out fits the whole stage, in fills the viewport with the TV.
function cam(G, zoomed) {
  const [w, vh] = vp(), top = zoomed ? 0 : headH(), h = vh - top - (zoomed && TOUCH ? PAD_H : 0) // the touch pad gets the bottom
  const [cx, cy, cw, ch] = zoomed ? G.frame : [0, 0, G.W, G.H]
  const scale = Math.min(w / cw, h / ch) * (zoomed ? 0.98 : 1)
  let x = w / 2 - (cx + cw / 2) * scale
  // wide + zoomed: centre the TV, unless that would push the rack's labels off the left edge
  if (zoomed && G.wide) x = Math.max(w / 2 - (G.tv.x + G.tvW / 2) * scale, -cx * scale)
  return { x, y: top + h / 2 - (cy + ch / 2) * scale, scale, transformOrigin: '0 0' }
}

// the name header spans the viewport edge to edge: HEAD_W x HEAD_H viewBox, 56px side margins, 32px above and below
const HEAD_W = 1000, HEAD_H = 84
const SOCIAL_H = 44 + 12 // icon buttons + gap under the name (match .socials in index.css)
const headH = () => ((vp()[0] - 112) * HEAD_H) / HEAD_W + 64 + SOCIAL_H

// 1-bit pixel art (ICONS in content.js), drawn crisp at any size
function PixelIcon({ rows }) {
  const w = Math.max(...rows.map(r => r.length)), d = rows.flatMap((r, y) => [...r].map((c, x) => (c === '#' ? `M${x} ${y}h1v1h-1z` : ''))).join('')
  return <svg viewBox={`0 0 ${w} ${rows.length}`} shapeRendering="crispEdges" aria-hidden="true"><path d={d} /></svg>
}

// zoomed in (wide): the rack shrinks to ZS and hugs the viewport's left edge with SINK (rack px) hidden past it
function rackPose(G, zoomed) {
  if (!zoomed || !G.wide) return { x: 0, scale: 1, transformOrigin: '0 50%' }
  const { x, scale } = cam(G, true)
  return { x: -x / scale - (G.rack.x + SINK * ZS), scale: ZS, transformOrigin: '0 50%' }
}

// tape view: the controls card sits right of the TV when the viewport leaves room, else as a bottom strip
function sideSpot(G) {
  const { x, y, scale } = cam(G, true), left = x + (G.tv.x + G.tvW) * scale + 28
  return vp()[0] - left >= 230 ? { left, top: y + (G.tv.y + G.screen.top + G.screen.height / 2) * scale } : null
}

// Chrome asks "Open Wispr Flow?" the first time the page fires the wispr-flow:// link; remember once it worked
const ALLOWED = 'wispr-allowed'
const allowed = () => { try { return localStorage.getItem(ALLOWED) === '1' } catch { return false } }
const remember = () => { try { localStorage.setItem(ALLOWED, '1') } catch {} }

function Static() {
  const c = useRef()
  useEffect(() => {
    const x = c.current.getContext('2d'), img = x.createImageData(160, 110)
    let raf
    const f = () => {
      for (let i = 0; i < img.data.length; i += 4) img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.random() * 255, (img.data[i + 3] = 255)
      x.putImageData(img, 0, 0)
      raf = requestAnimationFrame(f)
    }
    f()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={c} width={160} height={110} className="fill" />
}

export default function App() {
  const [mode, setMode] = useState(pickMode)
  const g = useMemo(() => geo(mode), [mode])
  const [sel, setSel] = useState(0)
  const [loaded, setLoaded] = useState(null)
  const [screen, setScreen] = useState('blue') // blue | static | room
  const [power, setPower] = useState(true)
  const [vol, setVol] = useState(3)
  const [osd, setOsd] = useState(null)
  const [casLabel, setCasLabel] = useState('')
  const [side, setSide] = useState(null)
  const [hint, setHint] = useState(false)
  const cas = useRef(), scr = useRef(), room = useRef()
  const sleeves = useRef([]), busy = useRef(false), holding = useRef(false), holdT = useRef()
  const loadedRef = useRef(null), live = useRef(), osdT = useRef()
  const wrap = useRef(), stage = useRef(), stackEl = useRef(), zoomed = useRef(false)
  live.current = { power, sel, screen }
  const voice = useVoice(onVoice)

  useLayoutEffect(() => {
    const fit = () => {
      const m = pickMode()
      setMode(m)
      const G = geo(m)
      gsap.set(stage.current, cam(G, zoomed.current))
      gsap.set(stackEl.current, rackPose(G, zoomed.current))
      setSide(sideSpot(G))
    }
    gsap.set(sleeves.current, { rotation: j => geo('wide').tapes[j].a }) // same slopes in both layouts
    fit()
    setVolume((3 / 5) * 0.8)
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])

  // the selected tape slides along its ledge
  useEffect(() => {
    if (!busy.current) gsap.to(sleeves.current, { x: j => nudge(g.tapes[j], j === sel).x, y: j => nudge(g.tapes[j], j === sel).y, duration: 0.25, ease: 'power2.out' })
  }, [sel])
  const select = i => setSel((i + TAPES.length) % TAPES.length)

  function zoomTo(z) {
    zoomed.current = z
    gsap.to(wrap.current, { backgroundColor: z ? '#121214' : '#ffffff', duration: 0.8 })
    gsap.to(stage.current.querySelectorAll('.intro, .shadow, .loop'), { autoAlpha: z ? 0 : 1, duration: 0.4 })
    gsap.to(stackEl.current, { ...rackPose(g, z), duration: 0.8, ease: 'power2.inOut' })
    return gsap.to(stage.current, { ...cam(g, z), duration: 0.8, ease: 'power2.inOut' })
  }

  function flash(text, ms = Math.max(2500, text.length * 90)) { // long enough to read
    setOsd(text)
    clearTimeout(osdT.current)
    osdT.current = setTimeout(() => setOsd(null), ms)
  }
  const say = flash // voice feedback goes to the TV's on-screen display

  // Where tape i's (nudged) sleeve sits right now in stage px, `along` px out along its ledge.
  // Zoomed in, the rack is shrunk by k and shifted by sx around its left-middle (see rackPose).
  function rackAt(i, along = 0) {
    const t = g.tapes[i], n = nudge(t, true), ox = g.rack.x, oy = g.rack.y + g.rackH / 2
    const k = gsap.getProperty(stackEl.current, 'scaleX'), sx = gsap.getProperty(stackEl.current, 'x')
    return { x: ox + (t.cx + n.x + t.ux * along - ox) * k + sx - CAS.w / 2, y: oy + (t.cy + n.y + t.uy * along - oy) * k - CAS.h / 2, k, rotation: 90 + t.a }
  }
  const atSlot = { x: () => g.slot.x - CAS.w / 2, y: () => g.slot.y - CAS.h / 2 }

  // cassette slides out of sleeve i along its ledge, then flies into the VCR flap
  function fromSleeve(i) {
    const c = cas.current, s = rackAt(i), o = rackAt(i, CAS.h * 0.75)
    gsap.set(c, { left: 0, top: 0, x: s.x, y: s.y, rotation: s.rotation, scale: s.k, opacity: 1, zIndex: 4, filter: 'brightness(1)' })
    return gsap.timeline()
      .to(c, { x: o.x, y: o.y, duration: 0.5, ease: 'power2.out' })
      .set(c, { zIndex: 10 })
      .to(c, { x: atSlot.x(), y: atSlot.y(), rotation: 90, scale: PEEK, duration: 0.7, ease: 'power2.inOut' })
      .to(c, { scale: PARK, filter: 'brightness(0.45)', duration: 0.35, ease: 'power1.in' })
      .add(() => tone(90, 0.15, 'square', 0.1))
  }
  // the reverse: out of the flap, over to sleeve i, and pushed back inside it
  function toSleeve(i) {
    const c = cas.current, s = rackAt(i), o = rackAt(i, CAS.h * 0.75)
    gsap.set(c, { left: 0, top: 0, x: atSlot.x(), y: atSlot.y(), rotation: 90, scale: PARK, opacity: 1, zIndex: 10, filter: 'brightness(0.45)' })
    tone(120, 0.12, 'square', 0.08)
    return gsap.timeline()
      .to(c, { scale: PEEK, filter: 'brightness(1)', duration: 0.35, ease: 'power1.out' })
      .to(c, { x: o.x, y: o.y, rotation: s.rotation, scale: s.k, duration: 0.7, ease: 'power2.inOut' })
      .set(c, { zIndex: 4 })
      .to(c, { x: s.x, y: s.y, duration: 0.4, ease: 'power2.in' })
      .set(c, { opacity: 0 })
  }

  // zoomed in: the old tape goes back into its sleeve and the new one comes out of its own, camera stays put
  async function swap(i) {
    if (busy.current || i === loadedRef.current) return
    busy.current = true
    const old = loadedRef.current
    room.current?.stop()
    setScreen('static')
    noise(0.3)
    setCasLabel(TAPES[old].label)
    await toSleeve(old)
    setCasLabel(TAPES[i].label)
    setSel(i)
    await gsap.to(sleeves.current, { x: j => nudge(g.tapes[j], j === i).x, y: j => nudge(g.tapes[j], j === i).y, duration: 0.2 })
    flash(`CH ${i + 1} · ${TAPES[i].label}`, 3000)
    await fromSleeve(i)
    loadedRef.current = i
    setLoaded(i)
    if (!live.current.power) await togglePower()
    setScreen('static')
    noise(0.45)
    await wait(350)
    setScreen('room')
    room.current?.play() // a loaded tape starts its tour on its own
    busy.current = false
  }

  async function load(i) {
    if (zoomed.current) return swap(i)
    if (busy.current) return
    busy.current = true
    if (loadedRef.current !== null) await eject(true)
    setSel(i)
    setCasLabel(TAPES[i].label)
    await gsap.to(sleeves.current, { x: j => nudge(g.tapes[j], j === i).x, y: j => nudge(g.tapes[j], j === i).y, duration: 0.2 })
    await fromSleeve(i)
    loadedRef.current = i
    setLoaded(i)
    if (!live.current.power) await togglePower()
    setScreen('static')
    noise(0.45)
    const zoom = zoomTo(true)
    await wait(350)
    setScreen('room')
    await zoom
    flash(TOUCH ? 'PICK A TAPE TO SWITCH' : 'HOLD FLOW OR PICK A TAPE TO SWITCH', 4500)
    room.current?.play()
    busy.current = false
  }

  async function eject(internal = false) {
    const i = loadedRef.current
    if (i === null || (busy.current && !internal)) return
    busy.current = true
    room.current?.stop()
    setScreen('static')
    noise(0.3)
    await wait(200)
    setScreen('blue')
    loadedRef.current = null
    setLoaded(null)
    if (zoomed.current) await zoomTo(false)
    setCasLabel(TAPES[i].label)
    await toSleeve(i)
    if (!internal) busy.current = false
  }

  async function togglePower() {
    const el = scr.current
    tone(70, 0.1, 'sine', 0.1)
    if (live.current.power) {
      room.current?.stop()
      await gsap.timeline()
        .to(el, { scaleY: 0.01, filter: 'brightness(3)', duration: 0.18, ease: 'power2.in' })
        .to(el, { scaleX: 0, duration: 0.15 })
      setPower(false)
    } else {
      setPower(true)
      await gsap.timeline()
        .fromTo(el, { scaleX: 0, scaleY: 0.01, filter: 'brightness(3)' }, { scaleX: 1, duration: 0.15 })
        .to(el, { scaleY: 1, filter: 'brightness(1)', duration: 0.22, ease: 'power2.out' })
    }
  }

  function changeVol(d) {
    const v = Math.max(0, Math.min(5, vol + d))
    setVol(v)
    setVolume((v / 5) * 0.8)
    tone(880, 0.05)
    flash(`VOLUME ${'▮'.repeat(v)}${'▯'.repeat(5 - v)}`)
  }

  async function play() {
    if (!live.current.power) await togglePower()
    if (loadedRef.current === null) return load(live.current.sel) // loading starts the tour
    if (TAPES[loadedRef.current].video) room.current?.key(' ', true) // a film: PLAY toggles pause, like Space
    else room.current?.play()
  }

  // Every press starts a fresh take: no guard on busy/waiting, and a hold whose release we
  // never saw (window lost focus mid-press) is simply replaced instead of locking the button.
  function holdStart(e) {
    e.preventDefault() // keep focus on the dictation input
    e.currentTarget.setPointerCapture?.(e.pointerId)
    clearTimeout(holdT.current)
    holding.current = true
    if (WISPR && !allowed()) setHint(true)
    voice.start()
    // ponytail: auto-release before Chrome's 5s user-activation window closes, or the
    // wispr-flow://stop link gets blocked and Wispr stays stuck in hands-free
    holdT.current = setTimeout(holdEnd, 4500)
    say(WISPR ? 'LISTENING… SAY A TAPE NAME, THEN LET GO' : 'HOLD FN AND SAY A TAPE NAME, THEN LET GO', 60000)
    tone(520, 0.05)
  }
  function holdEnd() {
    if (!holding.current) return
    holding.current = false
    clearTimeout(holdT.current)
    say('TRANSCRIBING… ONE SEC', 60000)
    voice.stop()
  }
  async function onVoice(text) {
    if (!text) return say("Didn't catch that. Hold and say a tape name.")
    if (WISPR) remember(), setHint(false) // text arrived, so the browser lets the page open Wispr now
    while (busy.current) await new Promise(r => setTimeout(r, 50)) // spoken mid-animation: load once it lands
    const i = matchTape(text, TAPES)
    if (i < 0) return say(`“${text}”: no tape by that name. Try ${TAPES.map(t => t.label).join(', ')}.`, 4000)
    say(`“${text}” → ${TAPES[i].label}`)
    load(i).then(() => loadedRef.current === i && room.current?.play()) // spoken: start the tour too
  }

  const tvAction = {
    eject: () => eject(),
    power: togglePower,
    stop: () => room.current?.stop(),
    rew: () => room.current?.jump(-1),
    play,
    ff: () => room.current?.jump(1),
    voldown: () => changeVol(-1),
    volup: () => changeVol(1),
  }

  useEffect(() => {
    const on = down => e => {
      const tag = e.target.tagName, inRoom = loadedRef.current !== null && power && screen === 'room'
      // in a room, the tape / VCR button you clicked keeps focus: drop it so Enter talks instead of re-clicking it
      if (inRoom && tag === 'BUTTON') e.target.blur()
      else if (tag === 'INPUT' || (tag === 'BUTTON' && (e.key === 'Enter' || e.key === ' '))) return
      if (zoomed.current && (e.key === '[' || e.key === ']')) {
        if (down && !e.repeat) swap((loadedRef.current + (e.key === ']' ? 1 : -1) + TAPES.length) % TAPES.length)
        return e.preventDefault()
      }
      if (loadedRef.current !== null && power && screen === 'room') {
        if (down && e.key === 'Escape') return eject()
        if (room.current?.key(e.key, down)) e.preventDefault()
        return
      }
      if (!down || e.repeat || busy.current) return
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') select(sel - 1)
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') select(sel + 1)
      else if (e.key === 'Enter') load(sel)
      else return
      e.preventDefault()
    }
    const d = on(true), u = on(false)
    addEventListener('keydown', d)
    addEventListener('keyup', u)
    return () => (removeEventListener('keydown', d), removeEventListener('keyup', u))
  })

  const shadow = (x, y, w) => <div className="shadow" style={{ left: x + w * 0.06, top: y - 10, width: w * 0.88, height: 22 }} />

  return (
    <div ref={wrap} className="wrap">
      <header className="head" data-on={loaded === null}>
        <h1>
          <svg viewBox={`0 0 ${HEAD_W} ${HEAD_H}`} role="img" aria-label={INTRO.name}>
            <text x="0" y="50%" dy="0.36em" textLength={HEAD_W - 6} lengthAdjust="spacing" fontSize={HEAD_H * 0.92}>{INTRO.name}</text>
          </svg>
        </h1>
        <nav className="socials">
          {LINKS.map(l => (
            <a key={l.icon} href={l.href || '#'} aria-label={l.label} title={l.label} target="_blank" rel="noreferrer">
              <PixelIcon rows={ICONS[l.icon]} />
            </a>
          ))}
        </nav>
      </header>
      {voice.el}
      {loaded !== null && <button className="back" onClick={() => eject()}>← Back</button>}
      {loaded !== null && TOUCH && (
        <aside className="pad" aria-label="Controls">
          {TAPES[loaded].video ? <p>▶ PLAY pauses / plays · REW / FF skip 5 s · ← Back ejects</p> : (<>
            <div className="dpad">
              {['Up', 'Left', 'Right', 'Down'].map(d => (
                <button key={d} className={d} aria-label={`Walk ${d.toLowerCase()}`} {...hold(room, 'Arrow' + d)}>{{ Up: '↑', Left: '←', Right: '→', Down: '↓' }[d]}</button>
              ))}
            </div>
            <p>Walk to take over the tour.<br />A: look, then next line.<br />▶ PLAY picks the tour back up.</p>
            <button className="a" aria-label="A: look, or next line" onPointerDown={e => (e.preventDefault(), room.current?.key('Enter', true))}>A</button>
          </>)}
        </aside>
      )}
      {loaded !== null && !TOUCH && (
        <aside className={side ? 'controls side' : 'controls strip'} style={side ?? undefined} aria-label="Controls">
          {TAPES[loaded].video ? (<>
            <b>It plays like a tape.</b>
            <p><span><kbd>Space</kbd></span> pause / play</p>
            <p><span><kbd>←</kbd><kbd>→</kbd></span> <span>skip back / forward <span style={{ fontFamily: 'VT323, monospace', fontSize: '1.3em' }}>5</span> s</span></p>
            <p><span><kbd>Esc</kbd></span> eject the tape</p>
          </>) : (<>
            <b>It plays itself. Take over anytime.</b>
            <p><span><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd></span> stop the tour and walk around</p>
            <p><span><kbd>Enter</kbd></span> <span>look at what you're facing (the <em>!</em> spots), then next line</span></p>
            <p><span><kbd>▶ PLAY</kbd></span> on the VCR picks the tour back up</p>
            <p><span><kbd>Esc</kbd></span> eject the tape</p>
          </>)}
        </aside>
      )}
      {hint && <AllowWispr onClose={() => (remember(), setHint(false))} />}
      <div ref={stage} className="stage" style={{ width: g.W, height: g.H, '--k': T }}>
        {shadow(g.tv.x, g.tv.y + g.tvH, g.tvW)}

        <div className="intro" style={g.intro}>
          <ol className="how">{(TOUCH ? INTRO.touchSteps : INTRO.steps).map((t, i) => <li key={i}>{t.includes('FLOW') && <FlowLogo />}{t}</li>)}</ol>
          <i className="more" aria-hidden="true" />
        </div>

        <Loop g={g} />

        <div className="tv" style={{ left: g.tv.x, top: g.tv.y, width: g.tvW, height: g.tvH }}>
          <img src={A + 'tv.webp'} alt="TV/VCR combo" />
          <div ref={scr} className="screen" style={g.screen}>
            {loaded !== null && (
              <div key={loaded} className="fill flick">{TAPES[loaded].video
                ? <Film ref={room} src={TAPES[loaded].video} paused={!power || screen !== 'room'} />
                : <Room ref={room} tape={TAPES[loaded]} paused={!power || screen !== 'room'} />}</div>
            )}
            {loaded === null && (
              <div className="blue">
                <span>VIDEO 1</span>
                <b>NO TAPE</b>
                <p>{TOUCH ? 'Pick a tape · ▶ PLAY for a tour' : <>Hold FLOW below and say a tape name.<br />Or pick a tape · ▶ PLAY for a tour</>}</p>
              </div>
            )}
            {screen === 'static' && <Static />}
            {osd && <div className="osd">{osd}</div>}
          </div>
          <div className="glass" style={g.screen} />
          <i className="operate" data-on={power} style={box(TV.s, [116, 827, 134, 845])} />
          {TV_BTNS.map(([id, label, r]) => id === 'flow' ? (
            <button key={id} className="hit flow" data-state={voice.state} data-idle={loaded === null} aria-label={label} style={box(TV.s, r)}
              onPointerDown={holdStart} onPointerUp={holdEnd} onPointerCancel={holdEnd} onLostPointerCapture={holdEnd} onContextMenu={e => e.preventDefault()} />
          ) : (
            <button key={id} className={`hit ${id === 'power' ? 'round' : ''}`} aria-label={label} style={box(TV.s, r)} onClick={tvAction[id]} />
          ))}
          {/* a film tape (UNSAID): REW / FF skip 5 s, printed under the buttons like the labels above them */}
          {loaded !== null && TAPES[loaded].video && [['−5s', 288, 382], ['+5s', 512, 606]].map(([t, x0, x1]) => (
            <span key={t} className="btn-note" style={{ ...box(TV.s, [x0, 1024, x1, 1040]), fontSize: 13 * TV.s }}>{t}</span>
          ))}
        </div>

        <div ref={cas} className="cassette" style={{ width: CAS.w, height: CAS.h }}>
          <img src={A + 'vhs_cassette.webp'} alt="" />
          <span className="marker cas-label">{casLabel}</span>
        </div>

        <div ref={stackEl} className="stack" style={{ left: g.rack.x, top: g.rack.y, width: g.rackW, height: g.rackH }}>
        <img src={A + 'tape_rack.webp'} alt="" />
        {TAPES.map((t, i) => (
          <button key={i} ref={el => (sleeves.current[i] = el)} className="sleeve" aria-label={`Load ${t.label}`}
            style={{ left: g.tapes[i].x, top: g.tapes[i].y, width: SLEEVE.h, height: SLEEVE.w }} onClick={() => load(i)}>
            {/* the spine art is upright; it lies on its side here */}
            <div className="spine" style={{ width: SLEEVE.w, height: SLEEVE.h, left: (SLEEVE.h - SLEEVE.w) / 2, top: (SLEEVE.w - SLEEVE.h) / 2 }}>
              <img src={`${A}sleeve${i + 1}.webp`} alt="" />
              <span className="marker sticker" style={t.label.length > 10 ? { fontSize: 'calc(10px * var(--k))' } : null}>{t.label}</span>
            </div>
          </button>
        ))}
        </div>
      </div>
    </div>
  )
}

const LOOP_PTS = [[0, 0], [0.15, 0.14], [0.38, 0.24], [0.6, 0.17], [0.62, 0.02], [0.5, -0.03], [0.42, 0.09], [0.54, 0.22], [0.8, 0.18], [1, 0]]

// Wispr-style word ribbon: runs up from the campaign sign, curls once, and ends at the first tape (UNSAID).
function Loop({ g }) {
  const tp = useRef(), [n, setN] = useState(2)
  const t = g.tapes[0], E = [g.rack.x + g.rackW - 14, t.cy]
  // sign: wide sits in the gap between rack and TV; tall sits above the TV, where a phone sees it first,
  // and the ribbon leaves its right end, runs down the TV's right side and in to the first tape
  const S = g.wide ? [(g.rack.x + g.rackW + g.tv.x) / 2, g.H - 70] : [g.W / 2, g.tv.y - 76]
  // a cursive loop drawn in (along, across) the S→E line, across pointing away from the rack; smoothed with Catmull-Rom
  const dx = E[0] - S[0], dy = E[1] - S[1], r = g.W - 20, y = S[1] + 23
  const P = g.wide ? LOOP_PTS.map(([u, v]) => [S[0] + u * dx - v * dy, S[1] + u * dy + v * dx])
    : [[S[0] + 132, y], [r - 50, y + 4], [r, g.tv.y + 40], [r, g.tv.y + g.tvH], [r - 20, g.rack.y + 10], E]
  const q = i => P[Math.max(0, Math.min(P.length - 1, i))]
  const d = `M${P[0]}` + P.slice(1).map((p, j) => {
    const [a, b, c, e] = [q(j - 1), q(j), p, q(j + 2)]
    return ` C${b[0] + (c[0] - a[0]) / 6},${b[1] + (c[1] - a[1]) / 6} ${c[0] - (e[0] - b[0]) / 6},${c[1] - (e[1] - b[1]) / 6} ${c}`
  }).join('')
  useEffect(() => {
    let tw, dead = false
    document.fonts.ready.then(() => {
      if (dead) return
      const el = tp.current, one = el.parentNode.getSubStringLength(0, LOOP.length)
      setN(Math.ceil(el.parentNode.previousSibling.getTotalLength() / one) + 1)
      tw = gsap.fromTo(el, { attr: { startOffset: -one } }, { attr: { startOffset: 0 }, duration: one / 40, ease: 'none', repeat: -1 })
    })
    return () => (dead = true, tw?.kill())
  }, [d])
  return (
    <>
      <svg className="loop" width={g.W} height={g.H} aria-hidden="true">
        <path id="loop-path" d={d} />
        <text dy="0.35em"><textPath ref={tp} href="#loop-path" startOffset="0">{LOOP.repeat(n)}</textPath></text>
      </svg>
      <div className="loop campaign" style={{ left: S[0], top: S[1] }}>{CAMPAIGN}</div>
    </>
  )
}

// First Flow press: Chrome's "Open Wispr Flow?" prompt drops down from the top centre. Dim the page, point
// at it, and show which two things to click so the visitor allows it for good.
function AllowWispr({ onClose }) {
  return (
    <div className="allow" role="dialog" aria-label="Allow this page to open Wispr Flow">
      <svg className="allow-arrow" viewBox="0 0 40 90" aria-hidden="true"><path d="M20 88V8M6 22 20 6l14 16" /></svg>
      <div className="allow-card">
        <b>Your browser just asked to open Wispr Flow (up there ↑)</b>
        <div className="mock" aria-hidden="true">
          <div className="mock-title">Open Wispr Flow?</div>
          <div className="mock-row"><i className="ring">1</i><span className="box">✓</span> Always allow this site to open links of this type</div>
          <div className="mock-btns"><span>Cancel</span><span className="go"><i className="ring">2</i>Open Wispr Flow</span></div>
        </div>
        <ol>
          <li>Tick <strong>Always allow</strong>, so it never asks again</li>
          <li>Click <strong>Open Wispr Flow</strong></li>
        </ol>
        <p>Then hold <FlowLogo /> Flow again and say a tape name.</p>
        <button onClick={onClose}>Done</button>
      </div>
    </div>
  )
}

// Wispr Flow's mark: five bars like a voice level meter
function FlowLogo() {
  return (
    <svg className="flow-logo" viewBox="0 0 559 542" aria-hidden="true">
      {[[0, 0, 542], [118, 245, 243], [236, 90, 358], [354, 245, 243], [472, 0, 542]].map(([x, y, h], k) => <rect key={k} x={x} y={y} width="87" height={h} rx="43.5" />)}
    </svg>
  )
}
