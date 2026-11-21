# Cari Bedanya: Senja — the best spot the difference game

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/supremexcell/best-spot-the-difference-game-01/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/supremexcell/best-spot-the-difference-game-01/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Entry for the [make.fun](https://make.fun) bounty
**[best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)** — $50, 10 places × $5, deadline
Sat 21 Nov 2026 23:51 WIB. A complete, original spot-the-difference game
that plays offline in a desktop browser from its own static files.

Referral code: `bj2pae9c` — join make.fun with it and we both get a bonus.

## The game

**Cari Bedanya: Senja** — three Indonesian dusk scenes, each with 8
differences to find, escalating difficulty:

1. **Warung Kopi Senja** (2:30, Mudah) — a street coffee stall at dusk.
   The sun is missing, the sign reads SENJA on one side and PAGI on the
   other, the cat is gone, the kettle turned red, a fourth cup appeared,
   one string-light bulb went dark, the bicycle's front wheel vanished,
   and the menu went from 5K to 8K.
2. **Pasar Malam** (2:30, Sedang) — a night market. Full moon became a
   crescent, a lantern turned green, one balloon floated away, SATE
   became SOTO, a cart wheel is gone, a third crate appeared, the
   vendor's hat vanished, and one bright star went out.
3. **Pantai Senja** (3:00, Sulit) — a beach sunset. The kite is gone, a
   third coconut appeared, the boat lost its sail, the sun's reflection
   vanished, the umbrella turned blue, the flag turned yellow, the
   surfboard turned orange, and the starfish is gone.

Click a difference on EITHER panel to mark it (green ring + check on both
panels). A big centred counter reads "TERSISA n DARI 8". There is a
countdown timer with a draining bar (red + tick under 30 s), 3 hints per
level (H — an amber pulsing ring on an unfound difference), −10 points
for a wrong click with a red flash and screen shake, +100 per find, a
time bonus of +5 per second left, and level-complete and win screens.
Keys: H hint, R restart, 1/2/3 level, M mute, Enter confirm, Esc menu.

## Originality

Everything is original: the theme, the scenes, the names, the art and the
sounds. All art is drawn procedurally in canvas 2D — no photos, no
external assets, no fetched fonts or sounds (the WebAudio effects are
synthesised in code). No commercial game was copied.

## The program

`main.ts` (Node 22, stdlib only, no network, deterministic) copies
`game/` and `screenshots/` to `$MAKEFUN_OUTPUT_DIR` (or `/output`),
byte-verifies every copied file against its source with a sha256 compare
and fails loudly on any mismatch, then writes `dossier.json` via the
vendored `vendor/makefun-game.ts`. Two runs produce identical bytes.

Play it locally: serve `game/` with any static server and open
`game/index.html` in desktop Chrome. Or run `node serve.ts`.

## Screenshots

Real renders of the game's own code, taken by playing it with real
mouse clicks through headless Chromium:

- `screenshots/1-cover.png` — level 1 mid-game: 3 found, 5 left
- `screenshots/2-level2.png` — level 2 mid-game: 5 found, 3 left
- `screenshots/3-win.png` — win screen after all 24 differences found

## License

MIT — see `LICENSE`.
