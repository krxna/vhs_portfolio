# Cassette environments

Design for the world inside each tape, built from `wispr_flow_portfolio_interview_master_record.md` and the packs in `~/main/rea`. Asset paths below are relative to `~/main/rea/`. All claims shown in-world follow §2 "What not to overclaim" in the master record.

---

## 0. One house style for every tape

The Summer Resort event has to be in, so the **Unbreakable Ties (UT) rip sets the style for every tape**. It's a Pokémon Essentials game: 32 px tiles, prerendered maps, and 4×4 walk sheets (64 px frames, rows facing down/left/right/up). Mixing in 16 px Emerald art would look like two different games.

| Decision | Value |
|---|---|
| Tile | 32 px |
| Viewport | 480×320 (15×10 tiles, twice the current 240×160 GBA canvas, same 3:2 ratio, so the TV screen cutout doesn't change) |
| Map art | One prerendered PNG per room from `unbreakable_ties_rip/MapRenders/`, cropped to its non-black bounds |
| Collision / exhibits | Keep the existing string-grid idea from `src/rooms.js`, laid over the PNG at 32 px (`#` blocked, `a–e` exhibits, `P` start, `D` exit) |
| Camera | Follows the player; clamps to map edges. Rooms ≤15×10 tiles don't scroll |
| Characters | `unbreakable_ties_rip/Graphics/Characters/*.png`, the standard 4×4 sheets |
| Dialogue box | `unbreakable_ties_rip/Graphics/Windowskins/` (THE SIGNAL uses `Summer Resort event/Graphics/Battlebacks/summer_message.png`) |
| Memory / flashback rooms | Same PNG with a CSS `sepia()` + vignette, the way UT does its own flashbacks |
| Time of day | `Summer Resort event/Graphics/Fogs/*` overlays (day / eve / night light masks), only in THE SIGNAL |

Engine change: `Room.jsx` currently draws procedural 16 px tiles. It needs to draw `map.png` first, then sprites, then a fog overlay. The grid, BFS autoplay and dialogue code can stay as they are.

**Exception, Emerald interiors:** the user picked the Emerald lab (THE FIX) and Devon Corp office (THE PEOPLE). They're 16 px tiles, so draw them at 2× with nearest-neighbour scaling to land on the same 32 px grid. They look chunkier than the UT rooms, which is fine because each one is a short indoor stop. If the jump between styles shows, run the Emerald tiles through the same CSS filter as the memory rooms, or keep them the only room in their tape segment.

**Player sprite:** `ESTUDIANTE M.png` (navy hair, blue uniform) for the candidate in every tape. Avoid the UT protagonists (`PLAYER_1_*`, `Player1_*` pictures), because people who know the game will recognise them.

---

## 01 · UNSAID: the family home

**Brief (§13.01):** where the grandfather film was conceived. The TV plays the film; objects show the insight, script, Flow demo and BTS.

**Rooms**

| Room | Map | Why |
|---|---|---|
| Home (main) | `486_Casa de Edward.png` (800×576) | Warm living room with a TV on the back wall, a sofa and rug in the middle and a kitchen on the right. It reads as a family home without needing changes |
| Memory: the small house | `702_Casa de _PN.png` (960×800) | A bare one-room wooden cabin, sepia. "We had almost nothing" |
| Memory: the market | `699_Tienda agropecuaria.png` (960×640) | A counter with produce stalls, sepia. The bargaining memory |

**Cast:** grandfather `ABUELO.png`, grandmother `ABUELA.png`, granddaughter `ESTUDIANTE_F.png` (she walks in from school, which matches Act 1).

**Autoplay**
1. Fade in on the home. ABUELO sits on the sofa, quiet; ABUELA is in the kitchen.
2. ESTUDIANTE_F enters through the bottom door ("home from school"), walks to ABUELO, and a "…" bubble appears. Caption card: *the insight* (typing friction vs feeling, §11).
3. The player walks to the TV. **a · TV** plays the hero film (placeholder card until it exists: "Film in production. Storyboard below").
4. The player walks past the photo frames on the wall, and two short sepia memory rooms play with a single dictated line each ("She makes tea for me every morning." / the market line). Each is about 6 s and walks back out.
5. Back home, the epilogue caption covers why emotional storytelling sells a dictation tool.

**Exhibits**

| Key | Object (on the map) | Content |
|---|---|---|
| a | TV | Hero film / 20–30 s cutdown |
| b | Kitchen table | Notebook: insight, treatment, script versions |
| c | Phone on the sofa side table (overlay sprite) | Real Flow dictation into a WhatsApp self-chat, recorded for real (§11 "do not fabricate the UI") |
| d | Shelf by the window | Camera: BTS, storyboard frames |
| e | Wall frames | The two memory rooms + alternative hooks |

**Music:** a quiet UT track, e.g. `Audio/BGM/Edu_Lena.ogg` or `LAZOS.ogg`. Audition first.

---

## 02 · THE SIGNAL: the Summer Resort (Game Jam)

**This is where the Summer Resort goes.** It fits the Game Jam better than any other tape: it's already a one-off event with a stage, an **INFO/registration hut**, a **"Redeem points" booth**, crowds of guests, and day/eve/night lighting. The Game Jam's story maps onto it almost one to one.

**Rooms**

| Room | Map | Role in the story |
|---|---|---|
| The venue (main) | `Summer Resort event/MapRenders/025_Summer Resort.png` (1888×1888 = 59×59 tiles, camera scrolls) | Campus and event, compressed into one festival ground |
| Club HQ | `Summer Resort event/MapRenders/027_Summer Info Resort.png` (960×640) | The IOTA club meeting where the idea gets pitched, plus the registration counter |

**How the resort's landmarks become the Game Jam**

| Resort landmark | Becomes | What happens there |
|---|---|---|
| INFO hut (right) → 027 interior | **IOTA Club HQ + registration desk** | The meeting scene. The counter's sign shows the live count |
| "Redeem Summer Points" booth (top right) | **The Coke booth** | "Talk to 10 first-years → 1 Coke" (§3 Q5, the real incentive) |
| Beach towels / loungers (bottom) | **First-years hanging out** | NPCs whose idle lines change each "day" |
| Ice-cream cart (left) | **Poster stand** | The ordinary announcements nobody read |
| Painter's easel (by the INFO hut) | **The outreach plan** | Who goes where, the "don't explain, just ask" script |
| Wooden ring stage (centre) | **The Jam floor** | Teams of 1–3 coding (final montage) |
| Concert stage + LED screens (top) | **The reveal** | The Instagram/email announcement, then real IOTA photos on the screen |
| Cave (top left) | Optional easter egg | Budget/vendor ledger: a short "behind the scenes" note, no hero story (§3 Q10) |

**Cast:** first-years `CHICA GUAY_SUMMER.png`, `CHICO GUAY_SUMMER.png`, `SEÑOR COMUN_SUMMER.png`, `chica_SUMMER.png`; PR juniors `ESTUDIANTE_F.png` / `CHICA GUAY.png` in uniform so they stand out from the beach crowd. **Don't use the Alola character overworlds** (`SUMMERRESORT_KUKUI_OW` etc.) or UT's named cast (Liberty, Sakura, Celeste). They're recognisable characters, and nothing in the Game Jam story needs them.

**Autoplay** (the fog overlays show the week passing)

| Beat | Lighting | Action |
|---|---|---|
| 1 | `Summer Resort_A_day.png` | The camera pans down the beach. NPCs ignore the poster stand. The INFO sign reads **"Registrations: ~27"** |
| 2 | day | The player enters the hut (027) and pitches at the counter. Dialogue: the curiosity idea. Juniors nod |
| 3 | `Summer Resort_B_day.png` | Juniors fan out to the loungers. Bubbles: *"Heard of Game Jam?" "What do you think the prize is?"* No details given |
| 4 | `Summer Resort_A.png` (eve) | Ambient lines change: *"Everyone keeps saying Game Jam…"*. One junior collects a Coke at the booth (`SUMMERPOINTS.png` ticket pops up) |
| 5 | `Summer Resort_night.png` (spotlights) | Stage screens light up with the **Instagram + institute email reveal**. `Pictures/SUMMER_UI_DANCE_BG.png` (crowd silhouette) as a 1 s transition card |
| 6 | night | Cut to the centre stage: teams at the Jam floor. The stage screen cycles **real IOTA Game Jam photos**. The INFO sign reads **"Participants: ~160"** |

**Exhibits:** a · poster stand, b · outreach easel, c · Coke booth, d · INFO counter (both numbers, with the caveat text: *"~27 initial registrations; ~160 final participants. Different measures, not a measured lift."*), e · stage screen (real photos).

**Audio / UI from the event pack:** BGM `Audio/BGM/Summer Event.ogg` for beats 1–4, `FINAL_RESORT.ogg` from the reveal on. Dialogue box `Battlebacks/summer_message.png`. Plaques `Characters/SUMMER_PLACAS_*.png` as colour-coded team markers on the Jam floor. Pink stage banners `Characters/PANEL SUMMER.png`, retextured with "GAME JAM" through a text overlay, not by editing the PNG.

Optional opener if the beach-as-campus feels like too big a jump: 2 s in `227_School.png` (a classroom of `ESTUDIANTE_*`) before the cut to the resort.

---

## 03 · THE FIX: Leanstack on the shop floor

**Rooms**

| Room | Map | Role |
|---|---|---|
| Shop floor (main) | `494_Almacén.png` (640×576) | Crates, green containers and yellow-black hazard tape. It reads as a factory floor. Label 3–4 areas **Zone 1–4** with floor-text overlays |
| Consultant's office | **Emerald** `Pokemon Emerald/map_renders/LittlerootTown_ProfessorBirchsLab.png` (208×208, 13×13 tiles, drawn at 2×) | The old way: paper → phone photos → Excel → report. Desks with PCs and paper stacks for the Excel grind, bookshelves as paper-form archives, and the central machine becomes the report generator Leanstack replaces. Use `…BirchsLabWithTable.png` for the "after" state: the cleared table is where the auto-generated report lands |
| Training corner | `043_Sparrow School.png` (768×768) | SOP training session with zone leaders at desks (optional) |

**Cast:** zone leader / auditor `GRANJERO_M.png` (the most blue-collar-looking sheet, though work overalls would be better if a pass through `Characters/` finds them); owner/lead consultant `OFICINISTA.png`.

**Autoplay** (§13.03)
1. **Office (Emerald lab):** a paper pile, a phone, and an Excel window as an overlay. A caption gives the old flow and "~20 h of report prep for a 30–40-zone plant (estimate)".
2. The player pitches digitisation to `OFICINISTA`.
3. **Floor (494):** the auditor walks Zone 1 → 2 with the phone, ticking questions (the real Leanstack screenshot fades in, picture-in-picture).
4. A **☎ RING** emote. The auditor steps away, comes back, and the progress bar drops to 0. A "!" bubble shows his frustration.
5. The player sits down at a crate (a laptop overlay) and a 5–10 min timer card plays.
6. **The demo:** the auditor answers 10–15 questions, the player "calls", ☎ RING, he comes back, and the answers are still there. ✓ He carries on.
7. A report pops out "seconds after submit" (real anonymised report screenshot).

**Exhibits:** a · paper desk (old flow), b · zone board (5S + Kaizen screens), c · auditor (the incident, told in his voice), d · laptop crate (the fix), e · report printer (generated report + "1 firm live, ~10 planned").

Extra props, if needed, from `free-office-pixel-art/` (licence: "free to use any way you want"): `printer.png`, `desk-with-pc.png`, `water-cooler.png`. Check the scale against 32 px before using them.

---

## 04 · THE PEOPLE: inventory discovery

**Rooms**

| Room | Map | Role |
|---|---|---|
| Sales floor | `440_Centro Comercial (PB).png` (640×640) | A counter with a promo screen. Salesperson + customer |
| Production / stores | `368_Almacén.png` (or `367`, which has damage decals) | Shelving and a central aisle. Production and logistics |
| Owner's office / design room | **Emerald** `Pokemon Emerald/map_renders/RustboroCity_DevonCorp_2F.png` (304×144, 19×9 tiles, drawn at 2×) | Rows of PC desks plus a whiteboard (top left). The player pins the interview cards on the whiteboard, and they split into the sales and production views on two of the PCs. `DevonCorp_3F` (a boardroom table) works for the owner meeting |

**Cast:** salesperson `OFICINISTA2.png`, customer `MADRE RANDOM.png`, production lead `GRANJERO_M.png`, logistics `CAMARERO.png` (a stand-in until a driver sprite turns up), owner `OFICINISTA.png`.

**Autoplay** (§13.04)
1. **Sales:** the customer asks, "When can my order arrive?" The salesperson's thought bubble cycles through 📄 💬 📞 with no answer.
2. The player walks through the back door into **production**, then interviews each role in turn. Each conversation drops a coloured card on the floor (role → what they need).
3. The cards merge into **two different dashboards**. Walking onto the sales tile shows the sales view; the production tile shows the production view (real WIP screenshots).
4. A banner at the end: **"Under development."**

**Exhibits:** a · customer question, b · interview notes per role, c · sales view, d · production view, e · the design change (one shared dashboard → role-specific views).

---

## 05 · TELL ME WHY?: the studio

**Rooms**

| Room | Map | Role |
|---|---|---|
| Creative studio (main) | `515_Despacho de Liberty.png` (800×640) | Posters, a dual-monitor desk, a neon strip. It already feels like a creator's room. Swap the anime posters for campaign-wall overlays |
| Gallery corridor | `424_Galería de Arte.png` (2112×1280, use the left T-shaped wing only) | Framed pictures on the walls = the optional background achievements |

**Autoplay**
1. Studio: the player sits at the desk, and a monitor overlay shows the challenge build being dictated in Flow (real footage).
2. Campaign wall: alternative hooks, the brief, the metrics he'd test.
3. Walk out into the gallery. The frames are discoverable but **not** stopped at in autoplay: TEDx, cardiology analysis, mine-safety patent (wording follows §9: "designed", "fault-tolerant").
4. The gallery's bottom door gets a sign overlay, **WISPR FLOW**. The player walks through and the screen fades to the end card.

**Exhibits:** a · desk monitor (how this site was built with Flow), b · campaign wall, c · "why Wispr / why growth", d · gallery frames (optional achievements), e · the WISPR FLOW door (contact).

---

## 6. Asset rights

Section 1 of the master record says *"Do not use copyrighted Pokémon sprites, maps, music, branding, or copied game assets without rights."* Everything from the UT rip, including the Summer Resort, is from a fan game, and some of its event sprites are Nintendo characters (the Alola cast, the Psyduck/Pikachu props on the INFO hut and sign). The plan above already leaves out the named characters, but the maps and music are still ripped assets. The options:
- Ship it this way for the challenge and credit it ("Environments: Pokémon Unbreakable Ties fan-game assets"), or
- Ask the UT team for permission, or
- Use UT only as layout reference and rebuild the rooms from free packs. (LimeZu `Modern tiles_Free` is **non-commercial only**. Kenney is CC0, but it's 16 px and a different style.)

Small Pokémon props baked into the PNGs (Psyduck on the INFO roof, Pikachu on the sign, the Pokéball rugs in 027) can be painted out in a few minutes per map if you want the ground to be cleaner.

## 7. Build order

1. Engine: PNG background + 32 px grid + 4×4 sprite sheets + fog layer (one change to `Room.jsx`).
2. **THE SIGNAL** first: it has the most assets ready, and the scrolling map tests the camera.
3. THE FIX → UNSAID → THE PEOPLE → THE NEXT FRAME. Each one after the first is a new grid + `content.js` entry.
