// Game state for "Cari Bedanya: Senja": screens, timer, score, hints and
// the click rules. Rendering of the HUD and overlays lives here too; the two
// picture panels are drawn by render.js.

import { LEVELS, PANEL_W, PANEL_H } from './scenes.js';
import { drawScene, drawMarkers } from './render.js';
import { diffAtPoint, remainingCount, randomUnfound } from './differences.js';
import {
  playFind, playWrong, playHint, playClick, playLevelComplete, playWin, playTick,
  toggleMute, isMuted,
} from './audio.js';

export const VIEW_W = 1280;
export const VIEW_H = 720;

// Panel rectangles in logical view coordinates.
export const LEFT_PANEL = { x: 16, y: 76, w: 616, h: 564 };
export const RIGHT_PANEL = { x: 648, y: 76, w: 616, h: 564 };

const HINTS_PER_LEVEL = 3;
const HINT_MS = 2600;
const FIND_POINTS = 100;
const WRONG_PENALTY = 10;

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export class SpotGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.screen = 'start'; // start | playing | levelComplete | win | timeUp
    this.levelIndex = 0;
    this.found = new Set();
    this.score = 0;
    this.timeLeft = LEVELS[0].timeLimit;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.hintPulse = null; // { diff, until }
    this.wrongFlash = 0; // timestamp until which the screen edge flashes red
    this.shakeUntil = 0;
    this.pop = null; // { x, y, until } — "+100" popup at the last find
    this.levelBonus = 0;
    this.totalFound = 0;
    this.lastTickSecond = -1;
    this.buttons = []; // rebuilt every frame: { x, y, w, h, action }
    this.variant = new Set();
    this.now = 0;
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  startLevel(index) {
    this.levelIndex = index;
    this.found = new Set();
    this.timeLeft = this.level.timeLimit;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.hintPulse = null;
    this.pop = null;
    this.levelBonus = 0;
    this.lastTickSecond = -1;
    this.variant = new Set(this.level.diffs.map((d) => d.id));
    this.screen = 'playing';
  }

  startGame() {
    this.score = 0;
    this.totalFound = 0;
    this.startLevel(0);
  }

  selectLevel(index) {
    if (this.screen === 'start' || this.screen === 'win' || this.screen === 'timeUp') {
      this.levelIndex = index;
      this.startLevel(index);
    }
  }

  restartLevel() {
    if (this.screen === 'playing' || this.screen === 'timeUp' || this.screen === 'levelComplete') {
      this.startLevel(this.levelIndex);
    }
  }

  backToMenu() {
    this.screen = 'start';
    this.hintPulse = null;
  }

  confirm() {
    if (this.screen === 'start') this.startGame();
    else if (this.screen === 'levelComplete') this.nextLevel();
    else if (this.screen === 'win' || this.screen === 'timeUp') this.startGame();
  }

  nextLevel() {
    if (this.levelIndex + 1 < LEVELS.length) this.startLevel(this.levelIndex + 1);
    else this.screen = 'win';
  }

  useHint() {
    if (this.screen !== 'playing' || this.hintsLeft <= 0) return;
    const diff = randomUnfound(this.level, this.found);
    if (!diff) return;
    this.hintsLeft -= 1;
    this.hintPulse = { diff: diff.id, until: this.now + HINT_MS };
    playHint();
  }

  toggleMute() {
    toggleMute();
  }

  // --- clicking -----------------------------------------------------------

  panelAt(x, y) {
    for (const panel of [LEFT_PANEL, RIGHT_PANEL]) {
      if (x >= panel.x && x <= panel.x + panel.w && y >= panel.y && y <= panel.y + panel.h) {
        return {
          panel,
          px: ((x - panel.x) / panel.w) * PANEL_W,
          py: ((y - panel.y) / panel.h) * PANEL_H,
        };
      }
    }
    return null;
  }

  handleClick(x, y) {
    for (const button of this.buttons) {
      if (x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h) {
        button.action();
        return;
      }
    }
    if (this.screen !== 'playing') return;
    const hit = this.panelAt(x, y);
    if (!hit) return;
    const diff = diffAtPoint(this.level, hit.px, hit.py);
    if (diff && !this.found.has(diff.id)) {
      this.found.add(diff.id);
      this.totalFound += 1;
      this.score += FIND_POINTS;
      this.pop = { x, y, until: this.now + 900, text: `+${FIND_POINTS}` };
      playFind();
      if (remainingCount(this.level, this.found) === 0) {
        this.levelBonus = Math.round(this.timeLeft) * 5;
        this.score += this.levelBonus;
        this.screen = 'levelComplete';
        if (this.levelIndex === LEVELS.length - 1) playWin();
        else playLevelComplete();
      }
    } else if (!diff) {
      this.score = Math.max(0, this.score - WRONG_PENALTY);
      this.wrongFlash = this.now + 220;
      this.shakeUntil = this.now + 180;
      playWrong();
    }
  }

  // --- update -------------------------------------------------------------

  update(now, dt) {
    this.now = now;
    if (this.screen === 'playing') {
      this.timeLeft -= dt;
      const whole = Math.ceil(this.timeLeft);
      if (this.timeLeft <= 10.5 && whole !== this.lastTickSecond && this.timeLeft > 0) {
        this.lastTickSecond = whole;
        playTick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.screen = 'timeUp';
        playWrong();
      }
    }
    if (this.hintPulse && now > this.hintPulse.until) this.hintPulse = null;
    if (this.pop && now > this.pop.until) this.pop = null;
  }

  // --- drawing ------------------------------------------------------------

  draw(now) {
    const c = this.ctx;
    c.clearRect(0, 0, VIEW_W, VIEW_H);
    c.save();
    if (now < this.shakeUntil) {
      const mag = 5;
      c.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }
    this.drawBackdrop(c);
    if (this.screen === 'start') this.drawStart(c);
    else this.drawPlayfield(c, now);
    if (this.screen === 'levelComplete') this.drawLevelComplete(c);
    if (this.screen === 'win') this.drawWin(c);
    if (this.screen === 'timeUp') this.drawTimeUp(c);
    if (now < this.wrongFlash) {
      c.strokeStyle = 'rgba(210, 59, 46, 0.85)';
      c.lineWidth = 10;
      c.strokeRect(4, 4, VIEW_W - 8, VIEW_H - 8);
    }
    c.restore();
  }

  drawBackdrop(c) {
    const g = c.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, '#17102a');
    g.addColorStop(1, '#0d0819');
    c.fillStyle = g;
    c.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  drawHeader(c) {
    const level = this.level;
    const left = remainingCount(level, this.found);
    c.fillStyle = '#241a3d';
    c.fillRect(0, 0, VIEW_W, 64);
    c.fillStyle = '#3a2a5e';
    c.fillRect(0, 64, VIEW_W, 2);

    // Title and level name.
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillStyle = '#ffd76a';
    c.font = 'bold 24px system-ui, sans-serif';
    c.fillText('CARI BEDANYA', 20, 24);
    c.fillStyle = '#e8dcf5';
    c.font = '16px system-ui, sans-serif';
    c.fillText(`${level.name}  •  Level ${this.levelIndex + 1}/${LEVELS.length}  •  ${level.difficulty}`, 20, 48);

    // Remaining counter — big, centred, impossible to miss.
    const label = left === 0 ? 'SELESAI!' : `TERSISA ${left} DARI ${level.diffs.length}`;
    c.textAlign = 'center';
    c.fillStyle = left === 0 ? '#37d67a' : '#ffffff';
    c.font = 'bold 30px system-ui, sans-serif';
    c.fillText(label, 640, 26);
    c.fillStyle = '#c9b8e8';
    c.font = '14px system-ui, sans-serif';
    c.fillText('klik perbedaan di gambar kiri atau kanan', 640, 50);

    // Timer with a draining bar.
    const urgent = this.timeLeft <= 30;
    c.textAlign = 'right';
    c.fillStyle = urgent ? '#ff6b5e' : '#ffffff';
    c.font = 'bold 30px system-ui, sans-serif';
    c.fillText(fmtTime(this.timeLeft), 1260, 24);
    const barW = 150;
    const frac = Math.max(0, this.timeLeft / level.timeLimit);
    c.fillStyle = '#3a2a5e';
    c.fillRect(1260 - barW, 42, barW, 10);
    c.fillStyle = urgent ? '#ff6b5e' : '#37d67a';
    c.fillRect(1260 - barW, 42, barW * frac, 10);

    // Score, top right under the timer is crowded — put it left of the timer.
    c.textAlign = 'right';
    c.fillStyle = '#ffd76a';
    c.font = 'bold 20px system-ui, sans-serif';
    c.fillText(`SKOR ${this.score}`, 1060, 26);
    c.fillStyle = '#c9b8e8';
    c.font = '14px system-ui, sans-serif';
    c.fillText(`Petunjuk: ${this.hintsLeft}  (H)`, 1060, 48);
  }

  drawPlayfield(c, now) {
    this.buttons = [];
    this.drawHeader(c);
    const empty = new Set();
    const variant = this.variant;

    drawScene(c, this.level, empty, LEFT_PANEL.x, LEFT_PANEL.y, LEFT_PANEL.w, LEFT_PANEL.h);
    drawScene(c, this.level, variant, RIGHT_PANEL.x, RIGHT_PANEL.y, RIGHT_PANEL.w, RIGHT_PANEL.h);

    // Panel frames and labels.
    for (const [panel, tag] of [[LEFT_PANEL, 'ASLI'], [RIGHT_PANEL, 'CARI BEDANYA']]) {
      c.strokeStyle = '#6b5a9e';
      c.lineWidth = 3;
      c.strokeRect(panel.x, panel.y, panel.w, panel.h);
      c.fillStyle = '#241a3d';
      c.fillRect(panel.x, panel.y, 92, 26);
      c.fillStyle = '#e8dcf5';
      c.font = 'bold 14px system-ui, sans-serif';
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillText(tag, panel.x + 10, panel.y + 14);
    }

    drawMarkers(c, this.level, this.found, this.hintPulse, LEFT_PANEL.x, LEFT_PANEL.y, LEFT_PANEL.w, LEFT_PANEL.h, now);
    drawMarkers(c, this.level, this.found, this.hintPulse, RIGHT_PANEL.x, RIGHT_PANEL.y, RIGHT_PANEL.w, RIGHT_PANEL.h, now);

    // "+100" popup at the last find.
    if (this.pop) {
      const alpha = Math.min(1, (this.pop.until - now) / 400);
      c.globalAlpha = alpha;
      c.fillStyle = '#37d67a';
      c.font = 'bold 26px system-ui, sans-serif';
      c.textAlign = 'center';
      c.fillText(this.pop.text, this.pop.x, this.pop.y - 34);
      c.globalAlpha = 1;
    }

    // Footer: level dots, hint, restart, mute.
    c.fillStyle = '#241a3d';
    c.fillRect(0, 652, VIEW_W, 68);
    c.fillStyle = '#3a2a5e';
    c.fillRect(0, 652, VIEW_W, 2);
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillStyle = '#e8dcf5';
    c.font = 'bold 15px system-ui, sans-serif';
    c.fillText('Level:', 20, 686);
    LEVELS.forEach((lvl, i) => {
      const bx = 90 + i * 150;
      this.buttons.push({
        x: bx, y: 664, w: 138, h: 40,
        action: () => { playClick(); this.startLevel(i); },
      });
      c.fillStyle = i === this.levelIndex ? '#ffd76a' : '#3a2a5e';
      c.beginPath();
      c.roundRect(bx, 664, 138, 40, 8);
      c.fill();
      c.fillStyle = i === this.levelIndex ? '#241a3d' : '#e8dcf5';
      c.font = 'bold 13px system-ui, sans-serif';
      c.textAlign = 'center';
      c.fillText(`${i + 1}. ${lvl.short}`, bx + 69, 685);
    });

    this.footerButton(c, 560, 'Petunjuk (H)', this.hintsLeft <= 0 || this.screen !== 'playing', () => this.useHint());
    this.footerButton(c, 730, 'Ulangi Level (R)', false, () => { playClick(); this.restartLevel(); });
    this.footerButton(c, 900, isMuted() ? 'Suara: Mati (M)' : 'Suara: Hidup (M)', false, () => { this.toggleMute(); playClick(); });
    this.footerButton(c, 1070, 'Menu (Esc)', false, () => { playClick(); this.backToMenu(); });
  }

  footerButton(c, x, label, disabled, action) {
    const w = 160;
    this.buttons.push({ x, y: 664, w, h: 40, action });
    c.fillStyle = disabled ? '#2c2145' : '#4a3670';
    c.beginPath();
    c.roundRect(x, 664, w, 40, 8);
    c.fill();
    c.fillStyle = disabled ? '#6f6390' : '#ffffff';
    c.font = 'bold 14px system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(label, x + w / 2, 685);
  }

  dim(c) {
    c.fillStyle = 'rgba(10, 6, 20, 0.72)';
    c.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  panelCard(c, title, lines, buttonLabel, action) {
    const w = 560;
    const h = 170 + lines.length * 30;
    const x = (VIEW_W - w) / 2;
    const y = (VIEW_H - h) / 2;
    c.fillStyle = '#241a3d';
    c.beginPath();
    c.roundRect(x, y, w, h, 16);
    c.fill();
    c.strokeStyle = '#ffd76a';
    c.lineWidth = 3;
    c.stroke();
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#ffd76a';
    c.font = 'bold 32px system-ui, sans-serif';
    c.fillText(title, 640, y + 46);
    c.fillStyle = '#ffffff';
    c.font = '20px system-ui, sans-serif';
    lines.forEach((text, i) => c.fillText(text, 640, y + 92 + i * 30));
    const bw = 340;
    const bh = 48;
    const bx = 640 - bw / 2;
    const by = y + h - 66;
    this.buttons.push({ x: bx, y: by, w: bw, h: bh, action });
    c.fillStyle = '#ffd76a';
    c.beginPath();
    c.roundRect(bx, by, bw, bh, 10);
    c.fill();
    c.fillStyle = '#241a3d';
    c.font = 'bold 18px system-ui, sans-serif';
    c.fillText(buttonLabel, 640, by + 25);
  }

  drawStart(c) {
    this.buttons = [];
    // Mini preview: level 1 scene drawn large behind the menu card.
    drawScene(c, LEVELS[0], new Set(), 340, 30, 600, 340);
    c.fillStyle = 'rgba(10, 6, 20, 0.55)';
    c.fillRect(0, 0, VIEW_W, VIEW_H);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#ffd76a';
    c.font = 'bold 54px system-ui, sans-serif';
    c.fillText('CARI BEDANYA: SENJA', 640, 150);
    c.fillStyle = '#ffffff';
    c.font = '22px system-ui, sans-serif';
    c.fillText('Tiga suasana senja Indonesia — temukan semua perbedaannya!', 640, 198);
    c.fillStyle = '#c9b8e8';
    c.font = '18px system-ui, sans-serif';
    c.fillText('Dua gambar hampir sama. Klik perbedaan di gambar kiri atau kanan.', 640, 232);
    c.fillText('Setiap temuan +100 poin. Klik yang salah −10 poin. Waktu terus berjalan!', 640, 260);
    c.fillText('H = petunjuk   •   R = ulangi level   •   1 / 2 / 3 = pilih level', 640, 288);

    LEVELS.forEach((lvl, i) => {
      const bw = 300;
      const bx = 640 - (LEVELS.length * (bw + 20)) / 2 + i * (bw + 20);
      const by = 330;
      this.buttons.push({ x: bx, y: by, w: bw, h: 92, action: () => { playClick(); this.startLevel(i); } });
      c.fillStyle = '#2c2145';
      c.beginPath();
      c.roundRect(bx, by, bw, 92, 12);
      c.fill();
      c.strokeStyle = '#6b5a9e';
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = '#ffd76a';
      c.font = 'bold 20px system-ui, sans-serif';
      c.fillText(`${i + 1}. ${lvl.name}`, bx + bw / 2, by + 30);
      c.fillStyle = '#e8dcf5';
      c.font = '15px system-ui, sans-serif';
      c.fillText(`${lvl.diffs.length} perbedaan  •  ${fmtTime(lvl.timeLimit)}  •  ${lvl.difficulty}`, bx + bw / 2, by + 62);
    });

    const bw = 280;
    this.buttons.push({ x: 640 - bw / 2, y: 460, w: bw, h: 56, action: () => { playClick(); this.startGame(); } });
    c.fillStyle = '#ffd76a';
    c.beginPath();
    c.roundRect(640 - bw / 2, 460, bw, 56, 12);
    c.fill();
    c.fillStyle = '#241a3d';
    c.font = 'bold 24px system-ui, sans-serif';
    c.fillText('▶  MULAI BERMAIN', 640, 489);

    c.fillStyle = '#8f7fb5';
    c.font = '14px system-ui, sans-serif';
    c.fillText('Semua gambar digambar dengan kode — tanpa foto, tanpa aset luar.', 640, 560);
  }

  drawLevelComplete(c) {
    this.dim(c);
    const last = this.levelIndex === LEVELS.length - 1;
    this.panelCard(
      c,
      last ? 'SEMUA LEVEL SELESAI!' : 'LEVEL SELESAI!',
      [
        `${this.level.name}: semua ${this.level.diffs.length} perbedaan ketemu`,
        `Bonus waktu: +${this.levelBonus} poin`,
        `Skor sementara: ${this.score}`,
      ],
      last ? 'Lihat Hasil Akhir  (Enter)' : 'Level Berikutnya  (Enter)',
      () => { playClick(); this.nextLevel(); },
    );
  }

  drawWin(c) {
    this.dim(c);
    this.panelCard(
      c,
      'KAMU MENANG!',
      [
        `Semua ${this.totalFound} perbedaan di 3 level ketemu!`,
        `Skor akhir: ${this.score}`,
        'Senja memang paling enak dinikmati pelan-pelan.',
      ],
      'Main Lagi  (Enter)',
      () => { playClick(); this.startGame(); },
    );
  }

  drawTimeUp(c) {
    this.dim(c);
    const left = remainingCount(this.level, this.found);
    this.panelCard(
      c,
      "WAKTU HABIS!",
      [
        `${this.level.name}: masih ${left} perbedaan belum ketemu.`,
        `Skor: ${this.score}`,
      ],
      'Coba Lagi  (R)',
      () => { playClick(); this.restartLevel(); },
    );
  }
}
