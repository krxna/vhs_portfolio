---
name: higgsfield-motion
description: Create premium motion ads for products and brands with the Higgsfield connector — 3D hyper-motion product videos, classic motion graphics, and full cinematic commercials up to 30 seconds. Use whenever the user wants a product motion video, a 3D product ad, hyper motion, motion design, an animated logo or brand promo, a product commercial, or "turn this product photo into a video." Analyzes the product from a photo, proposes cinematic lighting setups, builds a storyboard for approval, then renders the video in Higgsfield.
---

# Higgsfield Motion

You turn a product photo (or a logo) into a premium motion video — the kind of content brands normally pay a studio for. The workflow is always: **understand the product → light it → storyboard it → get approval → render.** The approval gate before rendering is what keeps quality high and revisions cheap.

**Requirement:** the Higgsfield connector must be connected in Claude (Settings → Connectors → Add custom connector → `https://mcp.higgsfield.ai/mcp`). If it is not connected, tell the user how to add it before continuing.

## Choose the mode

Pick silently when the request makes it obvious; otherwise ask once.

| Mode | Best for | Feel |
|---|---|---|
| **Hyper Motion** (default for physical products) | Clothing, cosmetics, drinks, gadgets, food, accessories | Macro detail, dramatic light, physics moments (fabric ripple, splash, particles), speed ramps, satisfying reassembly |
| **Classic Motion** | Apps, services, courses, logos, brand promos | Smooth transitions, clean typography, elegant camera moves |
| **Commercial** | A full ad with a story, up to 30 seconds | Cinematic scenes, a clear beginning–middle–end, script first |

Rule of thumb you can share: **Hyper Motion for physical products, Classic Motion for digital ones, Commercial when the brand wants a story.**

---


## Step 1 — Brief (one message, all at once)

1. **Product or logo:** upload a photo. A product photo becomes the identity reference — the product will look exactly like this in every frame. No logo? Offer to create a simple placeholder and say so.
2. **Length:** 5, 10, or 15 seconds for Hyper/Classic Motion (15 is the sweet spot); up to 30 seconds for Commercial.
3. **Format:** 16:9 (website, video platforms), 9:16 (vertical short-video ads and stories), or 1:1 (social feed). Ask where it will run.
4. **Mood:** a few words (dark premium, clean minimal, energetic, luxury, playful) — or let the skill suggest.
5. **Brand name and a short line** for the end card (optional).
6. **Commercial only:** the vibe in a sentence or two ("high-budget TV ad, super dynamic, urban night").

---

## Step 2 — Product read (show it to the user)

Before designing anything, analyze the uploaded photo and present a short product read:

- **What it is** and its category.
- **Shape and silhouette** — what makes it recognizable at a glance.
- **Materials and finish** — matte, glossy, textured, transparent, knit, metal — and how each reacts to light.
- **Colors** described through material ("deep black cotton with a slightly faded print").
- **Details to protect exactly** — logos, prints, labels, text, stitching. These must never change.
- **Hero angles** — the 2–3 angles where the product looks its best.
- **Physics that fits** — what motion moments suit this product (fabric ripple and fold for clothing, condensation and splash for drinks, light sweeps across metal for gadgets).

Keep it to a compact list. This step is why the product stays accurate later.

---

## Step 3 — Cinematic lighting setups

Propose 2–3 named lighting setups tailored to the product read, for example:

- **Dark premium** — one hard key light from above at a steep angle, deep shadows, a thin rim light tracing the silhouette.
- **Studio clean** — large soft light from the front-left, bright seamless background, gentle shadow under the product.
- **Neon edge** — dark set, two colored rim lights (one per side), glossy reflections on the surface below.

For each setup, generate **one quick hero still** of the product with the product photo as reference, so the user can see the light before anything moves. The user picks one (or mixes). That setup is used in every frame that follows.

---

## Step 4 — Script (Commercial mode only)

Write a short script before the storyboard:
- 4–6 beats with rough timings that add up to the chosen length;
- for each beat: what we see, the camera move, and any on-screen text or voiceover line;
- one clear ending with the product and brand name.

Show it and get an explicit **approve** or edits before moving on.

---

## Step 5 — Storyboard (never skip)

- Default **8 frames** (offer 6, 8, or 12 — more frames means more control).
- Generate the storyboard as **one image**: a single grid sheet with all frames, labeled "Frame 1, Frame 2…", using the product photo and the chosen lighting setup as references.

Default beats for a 15-second Hyper Motion ad:
1. Macro tease — an extreme close-up of a detail
2. Hero reveal — the full product in the chosen light
3. Physics moment — the motion that suits this product (from the product read)
4. Feature macro — texture, material, or mechanism
5. Second physics moment — a bigger, faster variation
6. Reassembly or settle — a satisfying return to rest
7. Product in context — in hand, worn, or on a surface
8. End card — product, logo, and one short line

For Classic Motion, replace the physics moments with smooth transitions and typography beats. For Commercial, follow the approved script.

Then show a one-line summary per frame plus the overall motion style, and ask: **"Approve the storyboard, or tell me what to change?"** Do not render until it is approved.

---

## Step 6 — Render

- Use the strongest video model available on Higgsfield for physics and product accuracy (Seedance 2.5 by default; confirm the current model with the connector's model lookup if unsure). Don't make the user pick models — just say which one you used.
- Render from the approved storyboard: each frame guides its shot, with continuous motion between neighboring shots. Run independent shots in parallel and report progress.
- Commercial mode: render the full length in a single pass if the model supports it; otherwise render scene by scene from the storyboard and present them in order.
- If audio generation is available, add light sound design (soft whooshes on transitions, one impact at the key moment). Ask about music only at the end.

**Quality check before showing:** the product matches the reference in every shot, protected details (logo, print, label) are intact, the end-card text is spelled correctly, and there are no warping artifacts during motion. Automatically re-render a failed shot once before showing it.

---

## Step 7 — Revisions (the storyboard-first rule)

When the user or their client asks for changes, **never re-render the video first.** Update the storyboard frames that need to change, show them, get approval, and only then re-render the affected shots. Stills cost far less than video, so this keeps revisions fast and cheap.

---

## Step 8 — Deliver and multiply

Present the final video, then offer variations: "Need versions for other colors, flavors, or models of this product? I can reuse the approved storyboard and lighting and only swap the product reference."

---

## Responsible use (always follow)

- **The product stays real:** never redesign, recolor, or "improve" the actual product — it must match the reference photo in every frame.
- **No third-party IP:** no other brands' logos, trademarked designs, copyrighted characters, or licensed music. Use only the user's own brand assets.
- **Truthful end cards:** no invented claims ("No. 1," "award-winning," made-up statistics). Logo, product name, and a neutral line — unless the user supplies a claim they can verify.
- **People in frame:** adults only, fictional people only — never the likeness of a real person or celebrity. Hyper Motion works best with no people at all, or hands and silhouettes.
- **Rights:** only animate products and logos the user owns or has permission to use.
- **AI disclosure:** if the video is published as an ad, remind the user once to follow the platform's AI-content labeling rules.
- Keep on-screen text short (2–4 words per frame) and spell-checked.
