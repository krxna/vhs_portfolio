import { useEffect, useRef, useState } from 'react'

// Press-and-hold voice capture. While held, an off-screen input has focus so Wispr Flow (Fn)
// types straight into it; the browser's own speech recognition listens too, as a fallback.
// On release we wait for Wispr's text to land, then hand back whichever we got (Wispr's wins).
//
// The hold also drives Wispr through its URL scheme, so no Fn press is needed. Only on desktop
// Mac in Chromium browsers: Safari shows an error alert for apps it can't find, and phones don't
// run Wispr's desktop app. Visitors without Wispr just get nothing from that link. ?wispr=off turns it off.
const ua = navigator.userAgent
// Embedded Chromium (the Claude app's preview pane, other Electron apps) also says "Chrome", but there
// the link hands focus to another app and Wispr pastes into that app's window instead of this page.
export const WISPR = /Macintosh/.test(ua) && /Chrome|Chromium|Edg/.test(ua) && !/Electron|Claude\//.test(ua) && navigator.maxTouchPoints === 0 &&
  new URLSearchParams(location.search).get('wispr') !== 'off'
const wispr = cmd => (location.href = `wispr-flow://${cmd}-hands-free`)

// Wispr records with its own mic access, so the page never needs one. Asking for it anyway (Chrome's
// speech fallback) pops Chrome's permission prompt, which takes focus and swallows Wispr's paste.
// So alongside Wispr the fallback only runs once the mic is already allowed, and never prompts.
let micOK = false
navigator.permissions?.query({ name: 'microphone' }).then(p => {
  micOK = p.state === 'granted'
  p.onchange = () => (micOK = p.state === 'granted')
}).catch(() => {})

export function useVoice(onResult) {
  const input = useRef(), sr = useRef(null), parts = useRef([]), cb = useRef(), run = useRef(0)
  const heard = { get current() { return parts.current.join(' ') } }
  const [state, setState] = useState('idle') // idle | listening | waiting
  cb.current = onResult

  // Wispr pastes with Cmd+V. Chrome fires the paste event every time, but sometimes never inserts
  // the text (seen live: paste "WORK ", no input event). So take the text from the event itself,
  // wherever focus is on the page.
  useEffect(() => {
    if (state === 'idle') return
    const onPaste = e => {
      const t = e.clipboardData?.getData('text')
      if (!t) return
      e.preventDefault()
      input.current.value += t
      input.current.dispatchEvent(new Event('input'))
    }
    document.addEventListener('paste', onPaste, true)
    return () => document.removeEventListener('paste', onPaste, true)
  }, [state === 'idle'])

  // Pressed again while the last take is still waiting for Wispr: carry on with the same take,
  // so text Wispr pastes late (or Chrome's last words) still counts instead of being wiped.
  function start() {
    run.current++ // the pending stop() hands over to this hold's stop()
    sr.current?.stop()
    sr.current = null
    if (state !== 'waiting') {
      input.current.value = ''
      parts.current = []
    }
    input.current.focus({ preventScroll: true })
    if (WISPR) wispr('start')
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR && (!WISPR || micOK)) {
      try {
        const r = new SR()
        r.lang = 'en-US'
        r.continuous = true
        r.interimResults = true
        const k = parts.current.push('') - 1 // each recognizer fills its own slot, an older one can still finish
        r.onresult = e => (parts.current[k] = [...e.results].map(x => x[0].transcript).join(' '))
        r.onerror = () => {}
        r.start()
        sr.current = r
      } catch {
        sr.current = null
      }
    }
    setState('listening')
  }

  async function stop() {
    const id = run.current
    setState('waiting')
    if (WISPR) wispr('stop')
    sr.current?.stop() // final words can still arrive after stop()
    // Wispr pastes in one go: continue 120ms after the input last changed, or give up at the timeout
    await new Promise(done => {
      let quiet
      // with no Wispr text, Chrome's own transcript is enough after 1.5s
      const give = setTimeout(finish, WISPR && !heard.current ? 4000 : 1500)
      const onInput = () => (clearTimeout(quiet), (quiet = setTimeout(finish, 120)))
      function finish() {
        clearTimeout(give)
        clearTimeout(quiet)
        input.current.removeEventListener('input', onInput)
        done()
      }
      input.current.addEventListener('input', onInput)
      if (input.current.value.trim()) onInput() // text already landed during the hold
    })
    if (id !== run.current) return // a new hold took over while we waited
    const text =input.current.value.trim() || heard.current.trim()
    sr.current = null
    input.current.blur()
    setState('idle')
    cb.current(text)
  }

  const el = <input ref={input} aria-label="Dictation" tabIndex={-1} style={{ position: 'fixed', left: -9999, top: 0, opacity: 0 }} />
  return { start, stop, state, el }
}
