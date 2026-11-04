# Krishna Suryawanshi · Tapes

A portfolio built as a white studio stage: five VHS tapes on a wall rack and a TV/VCR. Hold the FLOW button on the VCR, say a tape name with Wispr Flow (or just click a tape), and the cassette flies into the VCR and plays as a small GBA-style room. Pick another tape to swap, or ← Back to eject.

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # tape-name matcher check
npm run build   # static site in dist/
```

## Where things live
| File | What to edit |
|---|---|
| `src/content.js` | Tape names, voice keywords, room titles and every exhibit's text. This is the file to dictate into. |
| `src/rooms.js` | 15×10 tile maps (letters `a`–`e` are the exhibits) and each room's colours and music. |
| `src/App.jsx` | Stage layout, TV button hit areas, rack ledge positions and the GSAP load / swap / eject timelines. |
| `src/Room.jsx` | The canvas room engine: movement, dialog, autoplay, sprites. |
| `src/Recorder.jsx` | Hold-to-speak: Wispr types into a hidden input, with browser speech recognition as a fallback. |
| `public/assets/` | Transparent WebP cutouts. Regenerate them with `scripts/cutout.py` (needs Pillow, numpy, scipy). |

Renaming a tape is just changing `label` and `keywords` in `content.js`. The sleeve stickers and cassette label are text overlays, so no image needs regenerating.

## Importing into Emergent
1. Push this folder to a GitHub repo (`.gitignore` keeps out the campaign files, secrets and private notes). If you zip instead, zip only `src/`, `public/`, `index.html`, `package.json`, `package-lock.json`, `vite.config.js` and `README.md`: a zip ignores `.gitignore`.
2. In Emergent, start a new project from that repo/zip and tell it: "This is a Vite + React app. Install with npm install and run npm run dev."
3. Edit by voice with Wispr Flow. Prompts that map cleanly onto the code:
   - "In src/content.js, change the KAIZEN tape's first exhibit text to: …"
   - "Rename the WORK tape to CAREER and add 'resume' to its keywords."
   - "In src/rooms.js, move exhibit c in the factory map one tile to the right."
4. Deploy from Emergent. The output is a static site with no backend or API keys.

Voice notes: holding FLOW focuses a hidden input and, in Chrome on a Mac, starts Wispr Flow hands-free through its `wispr-flow://` link (releasing stops it), so no Fn press is needed. The browser's own speech recognition listens at the same time; Wispr's text wins when it arrives. Add `?wispr=off` to the URL to skip the Wispr link. Clicking or tapping a tape (or arrow keys + Enter) always works without voice, including on mobile.
