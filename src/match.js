// Find which tape a dictated sentence asks for. Exact keyword first, then one-typo tolerance
// (two for long words) so "kaisen" or "projets" still land. Returns the tape index or -1.
export function matchTape(text, tapes) {
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
  const joined = ` ${words.join(' ')} `
  for (const [i, t] of tapes.entries()) if (t.keywords.some(k => joined.includes(` ${k} `))) return i
  for (const [i, t] of tapes.entries())
    if (t.keywords.some(k => k.length > 3 && words.some(w => lev(w, k) <= (k.length > 6 ? 2 : 1)))) return i
  return -1
}

function lev(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] !== b[j - 1]))
    prev = cur
  }
  return prev[b.length]
}
