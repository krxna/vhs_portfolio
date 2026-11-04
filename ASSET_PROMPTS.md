# ChatGPT asset prompts

Generate each image in ChatGPT and save it to `assets/generated/` using the filename shown. Ask for the highest resolution available.
When a prompt says "attach", upload that file alongside the prompt.

✅ Done: `tv.png` (A), `recorder.png` (B), `organizer.png` (3, needs edit 3b). Their prompts are kept below for reference and regeneration.

Every image shares one style so the pieces composite cleanly:
> Studio product photograph, perfectly front-facing orthographic view (camera dead-center at the object's mid-height, no perspective tilt, no top surface visible), pure white #FFFFFF seamless background, soft even diffused studio lighting from the front-top, crisp sharp focus edge to edge, ultra-detailed realistic materials, no props, no floor, no cast shadow, no reflection.

---

## ✅ A. TV/VCR cleanup → `tv.png` (done)
Attach: `assets/vhs_tv/ChatGPT image of a 1990s TV_VHS combo….jpeg`

```
Edit this image. Keep the TV/VCR combo exactly as it is: same design, proportions, Daewoo logo, VHS slot, transport buttons, speaker grille, power and eject buttons, and the volume – / + buttons with their VOLUME label.
Make only these changes:
1. Remove the "CH ▲" and "CH ▼" buttons and their "CH" labels on the right side. Fill that area with the same smooth black plastic so it looks like they were never there.
2. Remove the wooden table and the wall. Place the TV on a pure white #FFFFFF seamless background with no shadow.
3. Make the screen a plain dark, powered-off CRT: deep charcoal glass with a subtle curved reflection and no on-screen text.
Front-facing orthographic studio product photo, soft even lighting, ultra-sharp, photorealistic, highest resolution.
```
(Your final version swapped the Daewoo logo for "KRISHNA SURYAWANSHI".)

## ✅ B. Sony PS-F9 recorder → `recorder.png` (done)
Attach: `assets/audio_recorders/e67fa61554d926a5e9fb09999143c84c.jpg`

```
Turn this flat illustration into a real photograph of the actual Sony PS-F9 (1983) linear-tracking turntable standing upright, holding a black vinyl record.
Match the reference's layout exactly: tall silver/white body with a rounded top, dark navy circular hub with a grey "SONY" center cap, the "Linear Tracking" strip with the tonearm scale, the red dot pattern, the START/STOP panel, the DISC HOLD button and the MANUAL arrow buttons at the bottom. Vinyl record behind it with realistic fine grooves and a soft sheen.
Remove the CorkyMats logo, the caption text and the border.
Front-facing orthographic studio product photo on pure white #FFFFFF, no shadow, soft even lighting, brushed-aluminium and satin-plastic materials, ultra-sharp, photorealistic, highest resolution.
```
(Your final version swapped "SONY" for the Flow logo and "It's a Sony" for "It's a Flow".)

---

## 1. Turntable without the record → `turntable_body.png`
Attach: `assets/generated/recorder.png`

```
Edit this image. Remove the black vinyl record completely and keep only the turntable body, exactly as it is: same brushed-aluminium body, navy hub with the grey "Flow" center cap, Linear Tracking strip, red dot pattern, "It's a Flow" text, PS-F9 text, START/STOP, DISC HOLD and MANUAL buttons, and the feet. Nothing changes except the record is gone.
Where the record was, show only pure white #FFFFFF background. Keep the same size, position, framing and canvas size so it overlays the original perfectly. No shadow. Photorealistic, ultra-sharp, highest resolution.
```

## 2. Record on its own → `vinyl.png`
Attach: `assets/generated/recorder.png`

```
From this image, create the black 12-inch vinyl record on its own, as a complete perfect circle seen exactly face-on, with nothing in front of it. Same record: deep black, realistic fine concentric grooves, a few slightly wider gaps between tracks, a soft satin sheen. In the center, a plain black center label area with a small spindle hole (no paper label, no text).
Pure white #FFFFFF background, no shadow, perfectly centered, filling about 90% of a square canvas. Photorealistic, ultra-sharp, highest resolution.
```

## 3. VHS organizer → `organizer.png`
Attach: `assets/generated/recorder.png` and `assets/generated/tv.png` (style and material reference)

```
A photorealistic 1980s Japanese hi-fi component called a "VHS organizer", designed to match the attached brushed-aluminium turntable and black TV. Seen exactly front-on. One wide, low unit made of two joined sections, about 3 times wider than it is tall:

LEFT SECTION (about 40% of the width): a solid box with a clean brushed-aluminium front panel and matte black top edge, with no slot or opening on the front (records feed in from the top, which isn't visible from this angle). On the front panel: a row of 6 small square push-buttons, each with a tiny unlit amber LED window, small white printed labels under them, a small "Flow" wordmark, and a round power LED (off).

RIGHT SECTION (about 60% of the width): an open-top rack of 5 equal, tall, narrow vertical bays side by side, separated by thin matte-black dividers. Each bay is sized exactly for a VHS sleeve standing upright with its spine facing forward. The bays are EMPTY, showing only the dark matte interior. Along the bottom of the right section is a brushed-aluminium label strip with 5 small engraved labels, one centered under each bay: "XYZ", "ABC", "DEF", "GHI", "JKL".

Four small black rubber feet.
Front-facing orthographic studio product photo, camera dead-center, pure white #FFFFFF seamless background, no cast shadow, soft even diffused lighting, ultra-sharp, photorealistic materials, highest resolution.
```

## 3b. Organizer edit → overwrite `organizer.png`
Attach: `assets/generated/organizer.png`

```
Edit this image. Keep everything exactly the same (same size, framing, materials, lighting, Flow logo, power LED, the 5 bays, and the brushed-aluminium label strip under the bays), except for these three changes:
0. Remove the text "XYZ", "ABC", "DEF", "GHI", "JKL" from the label strip under the bays, leaving the strip as plain, clean brushed aluminium with no text.
1. Remove the horizontal chrome slot near the top of the left section completely. Extend the brushed-aluminium front panel up to the top black edge so the front face is clean and uninterrupted, with no opening of any kind on the front.
2. Replace the row of six buttons with a row of FOUR identical buttons (same style: dark square push-buttons, each with a small amber LED window), evenly spaced and centered in the same area. Their labels underneath, left to right: "◀", "▶", "⤨ RANDOM", "LOAD". Same label font, size and color as before (the ⤨ shuffle symbol sits just left of the word RANDOM).
Front-facing orthographic view, pure white #FFFFFF background, no shadow, photorealistic, ultra-sharp, highest resolution.
```

## 3c. Organizer, slim bays → overwrite `organizer.png`
Attach: `assets/generated/organizer.png` and `assets/vhs_tapes/VHS.jpeg` (for the spine proportions)

```
Edit this image. Keep the LEFT section exactly the same (brushed-aluminium panel, Flow logo, POWER LED, the four buttons and their labels ◀ ▶ RANDOM LOAD, the feet, the overall height, materials and lighting).
Redesign only the RIGHT rack section so it holds VHS sleeves standing upright with their narrow spines facing forward, like the spines in the second attached image:
- 5 tall, very NARROW vertical slots, each about one sixth as wide as it is tall, separated by thin matte-black dividers. The slots are empty, showing only the dark matte interior.
- Because the slots are much narrower, the right section becomes much narrower too, roughly 40% of the left section's width. Keep the same height, top edge and black finish.
- Remove the aluminium label strip under the slots; the rack's black front lip runs straight across instead.
- Keep the rubber foot under the right end.
Front-facing orthographic view, pure white #FFFFFF background, no shadow, photorealistic, ultra-sharp, highest resolution.
```

## 3d. Organizer, open-top rack + narrower left → overwrite `organizer.png`
Attach: `assets/generated/organizer.png`

```
Edit this image. Keep the same design, materials, height, lighting, the 5 narrow slots, and every element on the left panel (Flow logo, POWER label and LED, the four buttons with their amber LED windows, and their labels ◀ ▶ RANDOM LOAD). Make only these two changes:
1. Make the LEFT aluminium section much narrower, about the same width as the right rack section (roughly 55% of its current width). Rearrange its contents compactly to fit: Flow logo top-left, POWER label and LED top-right, the four buttons in one evenly spaced row with tighter gaps, and their labels underneath. Nothing is removed, it's just more compact. Move the left rubber foot in to match.
2. Remove the solid black top rail that runs across the top of the RIGHT rack section. The rack must be OPEN at the top: each of the 5 narrow slots opens straight up to the sky, so a VHS sleeve can be lifted vertically out of it. The thin black dividers and the two outer side walls end at the same height as the top of the left section, with clean squared-off tops and nothing connecting them across the top. Behind and above the open slots is only pure white #FFFFFF background.
Front-facing orthographic view, pure white #FFFFFF background, no shadow, photorealistic, ultra-sharp, highest resolution.
```

## 4. Five VHS sleeve spines → `vhs_sleeves.png`
Attach: `assets/vhs_tapes/VHS.jpeg` (style reference)

The titles are left blank on purpose. I'll write them on in code with a marker font, so you can rename tapes anytime in `content.js`.

```
Five real cardboard VHS sleeves (cassette cases) standing upright, photographed straight-on from the spine, side by side with wide even white gaps so none touch. Copy the look of the attached reference: vintage 80s VHS spines with colored stripe blocks, small "VHS" logo boxes and "T-120". Do NOT use any real brand names (no Polaroid, Kodak, RCA, BASF, maxell, Gemini, Orchid).
Each spine has a BLANK white paper sticker label in its middle third, with no writing on it at all, ready to be written on by hand.
1. Black spine, yellow stripe block with diagonal black stripes, blank white sticker.
2. White spine with a stack of rainbow color blocks (pink, orange, yellow, green, blue), blank white sticker.
3. Grey ribbed spine with blue, green and red bands, blank white sticker.
4. Black spine with orange and red stripes, blank white sticker.
5. Cream spine with a single bold teal band, blank white sticker.
Each sleeve is the same size: tall and narrow, about 1 wide to 7.5 tall.
Front-facing orthographic studio photo, pure white #FFFFFF background, no shadow, soft even lighting, realistic printed cardboard and paper-sticker texture, ultra-sharp, photorealistic, highest resolution.
```

## 5. VHS cassette, label end → `vhs_cassette.png`

```
A single real black VHS videocassette standing upright, photographed straight-on from its narrow spine/label end, so it reads as a tall narrow black plastic block, about 1 wide to 7.5 tall. Glossy-satin black plastic with fine molded ridges, a plain cream paper label sticker running down most of its length with a thin red line, and a tiny molded "VHS" logo near the bottom. No sleeve, no case.
Front-facing orthographic studio product photo, pure white #FFFFFF background, no shadow, soft even lighting, ultra-sharp, photorealistic, highest resolution.
```

---

### Tips
- If ChatGPT adds a shadow or a floor, reply "same image, remove the shadow and floor, pure white background only".
- For 1 and 2, it matters most that the size and position stay identical to `recorder.png` so the layers line up. If they drift, I'll re-align them in code. No need to regenerate.
- I only need the shape of the 5 sleeves to match each other; I'll cut them apart.

---

## 6. Slanted tape rack → `tape_rack.png`
Attach: `assets/generated/tv.png` and `assets/generated/vhs_sleeves.png` (style, material and scale reference)

```
A photorealistic wall-mounted VHS tape rack, designed to match the attached black TV/VCR. Seen exactly front-on. A tall, narrow frame of matte black plastic and dark brushed metal, with 5 identical slanted ledges stacked one above the other. Each ledge rises toward the right at exactly 10 degrees, and all 5 are parallel and evenly spaced. Each ledge is long enough for one VHS sleeve lying on its side with its spine facing forward. The vertical gap between ledges is about 1.6 times the thickness of a VHS spine. A thin lip along the front edge of each ledge stops a tape from sliding off.
The rack is EMPTY, with no tapes on it. Only the ledges, two side rails and a back panel show, with small mounting screws.
Front-facing orthographic studio product photo, camera dead-center, pure white #FFFFFF seamless background, no cast shadow, soft even diffused lighting, ultra-sharp, photorealistic materials, highest resolution, tall portrait canvas.
```

## 7. Flow button on the VCR → `tv_flow.png`
Attach: `assets/generated/tv.png` and `assets/flow_logo.png`

```
Edit this image. Keep everything exactly the same: same canvas size, framing, position, lighting, screen, "KRISHNA SURYAWANSHI" text, VHS slot, every other button and label, speaker grille and volume buttons. Change only these two things:
1. The REC button (far right of the transport row, with the red dot) keeps the exact same size, shape, position and black plastic material as the STOP / REW / PLAY / FF buttons beside it. Replace the red dot with ONLY the five-bar icon from the attached logo (no word, no text on the button), printed in the same off-white silkscreen as the ■ ◀◀ ▶ ▶▶ symbols on the other buttons, centered on the button face at the same size as those symbols.
2. Change the small label "REC" above that button to "FLOW", using the exact same font, size, color and baseline as the "STOP", "REW", "PLAY" and "FF" labels.
Photorealistic, ultra-sharp, highest resolution, pure white #FFFFFF background, no shadow.
```
