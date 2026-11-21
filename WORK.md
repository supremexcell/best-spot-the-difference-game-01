# WORK.md — Cari Bedanya: Senja

Spot-the-difference entry for `best-spot-the-difference-game-20261121-0451`
($50, 10 × $5, deadline Sat 21 Nov 2026 23:51 WIB). Built in this session,
in the builder's own words, from the kit's starter layout only.

## The game

Original theme, all art drawn procedurally in canvas 2D (no photos, no
external assets, no fetched fonts/sounds — WebAudio beeps are synthesised
in code). Three Indonesian dusk scenes, each 8 differences, escalating
difficulty:

1. **Warung Kopi Senja** (2:30, Mudah) — street coffee stall at dusk.
   Sun missing, sign SENJA→PAGI, cat gone, kettle silver→red, 4th cup,
   one string-light bulb dark, bicycle front wheel gone, menu 5K→8K.
2. **Pasar Malam** (2:30, Sedang) — night market. Full moon→crescent,
   lantern red→green, one balloon gone, SATE→SOTO, cart wheel gone,
   3rd crate, vendor hat gone, one bright star gone.
3. **Pantai Senja** (3:00, Sulit) — beach sunset. Kite gone, 3rd coconut,
   boat sail gone, sun reflection gone, umbrella red→blue, flag red→yellow,
   surfboard teal→orange, starfish gone.

Gameplay: click a difference on EITHER panel to mark it (green ring +
check on both panels), big centred counter "TERSISA n DARI 8", countdown
timer with draining bar (red + tick under 30 s), 3 hints per level (H —
amber pulsing ring on an unfound difference), wrong click −10 points +
red flash + screen shake, +100 per find, time bonus +5/second left,
level-complete and win screens. Keys: H hint, R restart, 1/2/3 level,
M mute, Enter confirm, Esc menu. Start screen shows a dimmed preview of
level 1 and the three level cards.

## Files (one clear job each)

- `main.ts` — hand-in program: copies game/ + screenshots/ to
  MAKEFUN_OUTPUT_DIR (or /output), writes dossier.json via buildDossier.
- `serve.ts` — local static server for game/ (dev convenience).
- `game/index.html` — canvas shell, loads `src/main.js` as a module.
- `game/src/scenes.js` — level data: names, time limits, difference
  positions/labels (panel space 616×564).
- `game/src/render.js` — all procedural scene drawing + found/hint markers.
- `game/src/differences.js` — hit-testing (nearest unfound circle wins).
- `game/src/game.js` — state machine, timer, score, hints, HUD, overlays.
- `game/src/input.js` — pointer/keyboard → logical 1280×720 coordinates.
- `game/src/audio.js` — synthesised WebAudio effects.
- `game/src/main.js` — bootstrap, animation loop, `?shot=` staging hook,
  `window.__game` test handle (state, diffs, clickAt).
- `vendor/makefun-game.ts`, `LICENSE` — kit copies, unchanged.

## Screenshots — how they were staged

Taken with headless Chromium (CDP, `../shots.mjs`) by playing the game
with REAL mouse clicks at the differences' coordinates — no compositing,
no editing. The `?shot=` URL params in `main.js` are an unused fallback
for the same states and are not what produced these files.

- `screenshots/1-cover.png` (1280×720, 141 KiB) — level 1 mid-game:
  3 found (sun, sign, cat), 5 left, counter "TERSISA 5 DARI 8", timer 2:30.
- `screenshots/2-level2.png` (1280×720, 129 KiB) — level 2 mid-game:
  5 found (moon, lantern, balloon, sign, cart wheel), 3 left.
- `screenshots/3-win.png` (1280×720, 144 KiB) — win screen after all
  24 differences found ("KAMU MENANG!", final score 4775 in that run).

## Verification (this session, 21 Nov 2026 ~12:10 WIB)

- Play-test via CDP, 14/14 checks pass: start → play → timer counts down
  → wrong click −10, no find → H hint costs one hint → all 8 level-1 diffs
  → level complete (score 800 + time bonus) → level 2 → R restarts →
  levels 2+3 complete → win screen. Zero console errors/exceptions.
- Runtime network check (CDP Network domain): 8 requests, all local
  (index + 7 modules); ZERO external requests. `game/` contains no
  `http(s)://`, no fetch/XHR/Worker/Image.
- `main.ts` run twice to two dirs: byte-identical (`diff -r` clean),
  including after the final favicon edit.
- `makefun check --worktree`: 4 passed (competition_open, snapshot,
  license_osi, entrypoint); 1 failed — `transcripts_present`, EXPECTED
  (no bundle yet; bundling happens at submit prep, after approval).
  The 5 "at submission" rows (repo public/owner/created-after-open/
  commit/duplicate) are untestable until the GitHub repo exists.
- Screenshots visually inspected: two panels side by side, rings +
  checks on found differences, counter and timer readable, no text
  overflow after the footer-button and overlay-card fixes.

## Still needed (not done here)

- Vicko approves the game (play it at http://localhost:8080 while the
  dev server runs, or from the screenshots above).
- Create the public GitHub repo (after opening), push, bundle transcripts,
  submit before 23:51 WIB today.
