import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { volume } from './audio'

// A tape that is only a film (UNSAID): it plays on the CRT, and the VCR buttons drive it like a real VCR.
// Same handle as Room, so App needs no special cases: PLAY plays, STOP pauses, REW / FF skip 5 s.
export default forwardRef(function Film({ src, paused }, ref) {
  const v = useRef()

  useEffect(() => {
    const el = v.current
    if (paused) el.pause()
    else el.play().catch(() => {})
  }, [paused])

  useEffect(() => { // follow the VCR volume
    const id = setInterval(() => v.current && (v.current.volume = Math.min(1, volume() * 2)), 200)
    return () => clearInterval(id)
  }, [])

  useImperativeHandle(ref, () => ({
    play: () => v.current.play().catch(() => {}),
    stop: () => v.current.pause(),
    jump: d => (v.current.currentTime = Math.max(0, v.current.currentTime + d * 5)), // REW / FF: 5 s
    key(k, down) { // Space / Enter pause and play, ← → skip 5 s
      if (!down) return ['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(k)
      if (k === 'Enter' || k === ' ') v.current.paused ? v.current.play().catch(() => {}) : v.current.pause()
      else if (k === 'ArrowLeft' || k === 'ArrowRight') v.current.currentTime += k === 'ArrowLeft' ? -5 : 5
      else return false
      return true
    },
  }))

  return <video ref={v} src={'/assets/' + src} className="fill" style={{ objectFit: 'contain', background: '#000' }} playsInline />
})
