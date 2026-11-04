// Tiny WebAudio kit: blips, tape static and a looping chiptune per room.
let ctx, out, beat, vol = 0.5

function ac() {
  if (!ctx) {
    ctx = new AudioContext()
    out = ctx.createGain()
    out.gain.value = vol
    out.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export const volume = () => vol

export function setVolume(v) {
  vol = v
  if (out) out.gain.value = v
  if (bgm) bgm.volume = v * 0.6
}

// A room's real soundtrack, looping. Same src keeps playing (safe to call every frame); null pauses.
let bgm
export function track(src) {
  if (!src) return void bgm?.pause()
  if (bgm?.dataset.src !== src) {
    bgm?.pause()
    bgm = Object.assign(new Audio('/assets/' + src), { loop: true, volume: vol * 0.6 })
    bgm.dataset.src = src
  }
  if (bgm.paused) bgm.play().catch(() => {})
}

export function tone(freq, dur = 0.06, type = 'square', gain = 0.05) {
  const c = ac(), t = c.currentTime, o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(1e-4, t + dur)
  o.connect(g).connect(out)
  o.start(t)
  o.stop(t + dur + 0.02)
}

export function noise(dur = 0.4, gain = 0.06) {
  const c = ac(), b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = c.createBufferSource(), g = c.createGain()
  g.gain.value = gain
  s.buffer = b
  s.connect(g).connect(out)
  s.start()
}

export function music(notes) {
  clearInterval(beat)
  if (!notes) return
  let i = 0
  beat = setInterval(() => {
    const n = notes[i % notes.length]
    if (n) tone(n, 0.16, 'square', 0.015)
    if (i % 4 === 0) tone(notes[0] / 2, 0.3, 'triangle', 0.05)
    i++
  }, 190)
}
