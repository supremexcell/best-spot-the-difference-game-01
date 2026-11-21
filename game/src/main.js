// Bootstrap for "Cari Bedanya: Senja": canvas setup, animation loop, and a
// deterministic screenshot staging hook.
//
//   ?shot=mid&level=1&found=3   — start level 1 with its first 3 differences
//                                 already found, as if the player had clicked
//                                 them (score 300, timer near full)
//   ?shot=win                   — jump straight to the win screen, as if all
//                                 three levels had been completed
//
// The staging only sets state the real game can reach; the pixels are always
// the game's own rendering. It exists so screenshots can be taken without
// hand-driving the mouse, and is documented in WORK.md.

import { SpotGame, VIEW_W, VIEW_H } from './game.js';
import { installInput } from './input.js';

const canvas = document.getElementById('game');
const statusLine = document.getElementById('status');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.style.width = `${Math.floor(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW_H * scale)}px`;
}

const game = new SpotGame(canvas);
installInput(canvas, game);

// Exposed for automated play-testing (headless Chrome driving real clicks):
// state, the current level's differences and their panel coordinates.
window.__game = {
  game,
  state: () => ({
    screen: game.screen,
    level: game.levelIndex,
    found: [...game.found],
    score: game.score,
    timeLeft: Math.round(game.timeLeft),
    hintsLeft: game.hintsLeft,
  }),
  diffs: () => game.level.diffs.map((d) => ({ id: d.id, x: d.x, y: d.y, r: d.r })),
  clickAt: (x, y) => game.handleClick(x, y),
};

function applyShotParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  if (shot === 'win') {
    game.startGame();
    for (let i = 0; i < 3; i++) {
      game.found = new Set(game.level.diffs.map((d) => d.id));
      game.score += game.level.diffs.length * 100;
      game.totalFound += game.level.diffs.length;
      if (i < 2) game.startLevel(i + 1);
    }
    game.screen = 'win';
    return;
  }
  if (shot === 'mid') {
    const level = Math.min(2, Math.max(0, Number(params.get('level') ?? 1) - 1));
    const found = Math.min(8, Math.max(0, Number(params.get('found') ?? 3)));
    game.startLevel(level);
    game.level.diffs.slice(0, found).forEach((d) => game.found.add(d.id));
    game.score = found * 100;
    game.totalFound = found;
    game.timeLeft = game.level.timeLimit - 25;
  }
}

applyShotParams();
fitCanvas();
window.addEventListener('resize', fitCanvas);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  game.update(now, dt);
  game.draw(now);
  const left = game.screen === 'playing'
    ? `${game.level.diffs.length - game.found.size} perbedaan tersisa, ${Math.ceil(game.timeLeft)} detik`
    : game.screen;
  if (statusLine.textContent !== left) statusLine.textContent = left;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
