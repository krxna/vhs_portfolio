# Wispr Flow portfolio: VHS TV + tape rack + GBA-style rooms

## ▶ Current state (2 Nov 2026), read this first
The turntable and organizer are **gone** (their code was removed; the old `organizer`, `turntable_body` and `vinyl` webps are still in `public/assets/` but unused). Everything below "Original plan" describes the old design and is kept only for history.

**Layout now (`src/App.jsx`):**
- Landing (white): intro text top-left (`INTRO` in `src/content.js`), a stack of 5 tapes lying on their side under it (`.stack` / `.sleeve`, upright spine art rotated 90° inside `.spine`), and the TV/VCR on the right. Portrait/mobile: text, then TV, then tapes.
- Click a tape (or arrows + Enter): the cassette slides out of its sleeve and flies into the VCR slot, then the camera zooms in.
- Tape view (dark): the intro fades, the stack slides in next to the TV (`g.shift`), a fixed `← Back` button (top-left) ejects. Clicking another tape swaps without zooming out.
- Voice: the **Flow** button on the VCR (was REC) is hold-to-talk. Feedback goes to the TV's green OSD text. `useVoice` in `src/Recorder.jsx` is unchanged.

**Done (2 Nov):** new `tv.webp` re-measured (screen, buttons, slot, LED; CSS Flow overlay removed, the hit box only glows while listening). `tape_rack` is exported by `cutout.py`; tapes sit on its measured ledges (`RACK` in `App.jsx`, ~10–11°), the selected tape lifts off its ledge, cassettes slide out along the ledge. Wide stage is now 1200×810 so the rack fits under the intro; portrait centres the rack under the TV. Checked desktop + mobile (load, swap, Back, Flow hold). README updated.

**Next:** fill `content.js` with real text; test real Wispr dictation in Chrome (the browser pane blocks the mic).

Tools: Python packages are in `.venv/` (Pillow, scipy, numpy). The dev server runs on `localhost:5174` (`npm run dev -- --port 5174`). Asset prompts are in `ASSET_PROMPTS.md` (sections 6 and 7 are the rack and the Flow button).

---

# Original plan (superseded)

## Context
This is for the Wispr Flow hiring challenge (submissions close 4 Nov 2026). The final site has to be built on Emergent using Wispr Flow, so I'll build it here as Vite + React and you'll import it into Emergent and make edits there by voice.

The stage is pure white with photo-real hardware: the "Flow" PS-F9 turntable, an invented VHS organizer, and the TV/VCR (now branded with your name, CH buttons removed). Visitors can explore the room with the arrow keys and Enter, or press Autoplay to watch a scripted walkthrough.

**Load sequence (from your sketches):**
1. Press and hold the turntable. The record spins while you dictate a sentence containing a tape name ("…show me XYZ…").
2. Release. The turntable rotates 90° counter-clockwise to lie on its side, with the record on the left.
3. The record detaches and drops straight down into the slot on top of the organizer's left unit. The LEDs flash.
4. The VHS sleeve whose label matches the name you said (XYZ / ABC / DEF / GHI / JKL) rises out of its bay. At the same time, the black VHS cassette slides up out of the sleeve.
5. The cassette rotates to horizontal and flies down into the TV's VHS slot. The sleeve drops back into its bay and the turntable returns upright.
6. The TV flickers on and the GBA-style room for that tape plays.

**Organizer buttons pick the tape (each lights its own LED when pressed). They're also the no-voice way in, including on mobile:**
- Tape names live only in `content.js`. The organizer strip (engraved-style CSS text) and the sleeve stickers (marker font, slight tilt, `mix-blend-mode: multiply`) are text overlays, so renaming a tape never means regenerating an image.
- **◀ / ▶:** move the selection between the 5 bays. The selected bay's sleeve lifts slightly.
- **⤨ RANDOM:** the LEDs sweep across and each sleeve lifts in turn, then it lands on a random tape and loads it.
- **LOAD:** loads the selected tape (steps 4–6 above).

**TV buttons control playback (the real buttons in `tv.png`, as hit areas with a pressed state):**
- **PLAY:** autoplay, where the character walks the room and opens each exhibit in order.
- **STOP:** stops autoplay and gives control back to the arrow keys.
- **REW / FF:** jump to the previous or next exhibit.
- **REC:** same as holding the turntable (hold to speak).
- **EJECT:** the cassette comes back out of the TV and into its sleeve, and the room closes.
- **POWER:** turns the screen off and on (CRT collapse to a line).
- **VOLUME − / +:** room music and sound effects.

All sizes are set in code, not in the images. The record is scaled so its diameter is just under the width of the organizer's left section (it reads as a 7"/10" record), and the turntable is scaled with it. The record feeds in from the top. The slot isn't visible from the front, so in step 3 the record drops straight down, sits behind the organizer layer, and is clipped at its top edge. It looks like it's sliding down into the unit. A tiny bounce and the LED flash sell the landing.

Quality bar: `assets/_.jpeg`, a clean studio product shot on white. The hardware is **hyper-realistic, not illustrated**. Only the content on the TV screen is pixel art, because it's meant to look like a GBA game.

## 1. Photoreal asset pipeline (do this first; it decides how good everything looks)
The source photos are 640–1200px wide and have backgrounds. Each object becomes a set of transparent PNG layers at roughly 2400px on the long edge, shown at about half size so they stay sharp on retina screens.

| Asset | File | Status |
|---|---|---|
| TV/VCR | `generated/tv.png` | ✅ done. I'll cut out the screen as a hole for the canvas and the slot as a mask for the cassette going in |
| Turntable with record | `generated/recorder.png` | ✅ done (used as the reference for the two below) |
| Turntable body, no record | `generated/turntable_body.png` | needed: rotates on release |
| Record on its own | `generated/vinyl.png` | needed: spins, then drops |
| VHS organizer | `generated/organizer.png` | needed: left unit with a record slot on top and LEDs, plus 5 sleeve bays and a label strip |
| 5 VHS sleeve spines | `generated/vhs_sleeves.png` | needed: in the style of `vhs_tapes/VHS.jpeg`, with your own labels |
| VHS cassette, label end | `generated/vhs_cassette.png` | needed: rises out of the sleeve and goes into the TV |

Tools (no Higgsfield): you generate the images in ChatGPT using the prompts in `ASSET_PROMPTS.md` and save them to `assets/generated/`. I cut them out locally with macOS Vision (a Swift script), upscale them with Real-ESRGAN (a free offline binary, downloaded once you OK it), and touch them up with Pillow. Every output goes into `public/assets/` as WebP with alpha.

Realism in motion: a soft contact shadow under every object (blurred ellipse PNG), a shadow that scales with height on anything flying, a little motion blur (CSS `filter: blur` during fast tweens), CRT glass reflection over the screen, scanlines and vignette on the screen canvas, and a brief static burst when a tape loads.

## 2. App structure (keeping it lean)
```
src/
  App.jsx          stage layout + load sequence (GSAP timeline)
  Recorder.jsx     press-and-hold, Wispr capture, speech fallback
  Room.jsx         canvas GBA-style engine (tiles, player, dialog, BFS autoplay)
  content.js       tapes → rooms → objects → text (you fill this in by dictating)
  rooms/*.js       tile maps per room (factory, lab, office)
```
- Dependencies: `gsap` only, for the rotate → drop → rise → fly → insert timeline. Everything else uses native APIs.
- **Voice:** holding the mouse button focuses an off-screen `<input>` and shows "hold Fn to speak" (Wispr's hotkey types into whatever has focus). When you release, I wait up to about 1.5s for Wispr's text to land, then fuzzy-match it against the tape keywords in `content.js`. If there's no text and `webkitSpeechRecognition` exists, the browser's speech recognition captures during the hold instead. The tape spines can also be clicked, as a no-voice fallback.
- **Rooms:** a 240×160 logical canvas (GBA resolution) scaled up as whole-pixel multiples with `image-rendering: pixelated`, using original 16px tiles in a FireRed/Emerald-inspired style that I draw myself. No ripped Nintendo sprites, for IP reasons. There's one interior room per tape (5 in total), e.g. a factory floor for the kaizen/5S app, a growth lab for Wispr campaign ideas, and an office for work experience. Controls: arrow keys and Enter. Autoplay walks a BFS path through `content.js` objects in order and opens each dialog with a typewriter effect; any key press takes back control. An eject button returns to the stage.
- Layout: everything sits on a white background and the stage scales to the viewport. On mobile, the organizer stacks under the TV and the tape spines become tap targets.

## 3. Order of work
1. You generate the remaining assets from `ASSET_PROMPTS.md`. I cut them out locally and review the cutouts with you before going further.
2. Static stage composition at full fidelity, then compare against `_.jpeg`.
3. Load animation timeline.
4. Recorder voice capture plus fallback.
5. Room engine plus the 5 rooms with placeholder text in `content.js`.
6. Export notes for importing into Emergent.

## Verification
- `npm run dev`, then open it in the browser pane: check each asset at 1x and 2x zoom (no halos or jaggies on the cutouts) and confirm the CH buttons are gone.
- Hold → dictate "kaizen" with Wispr and confirm the factory tape loads. Repeat with Wispr off (speech fallback) and by clicking a spine.
- In each room: walk with the arrow keys, interact with Enter, run Autoplay all the way through, take back control mid-run, and eject.
- Mobile width (375px): layout and tap-to-load.
