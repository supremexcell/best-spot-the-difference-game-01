// Procedural canvas art for "Cari Bedanya: Senja".
// Every scene is drawn twice from the same code — the left panel with no variant,
// the right panel with a Set of difference ids switched on. Nothing is loaded
// from disk: all art is shapes, gradients and text drawn in code.

import { PANEL_W, PANEL_H } from './scenes.js';

// --- small drawing helpers -------------------------------------------------

function circle(c, x, y, r) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function line(c, x1, y1, x2, y2) {
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

// Deterministic pseudo-random in [0, 1) so both panels agree on stars, speckles.
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sparkle(c, x, y, r, colour) {
  c.fillStyle = colour;
  c.beginPath();
  c.moveTo(x, y - r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.quadraticCurveTo(x, y, x, y + r);
  c.quadraticCurveTo(x, y, x - r, y);
  c.quadraticCurveTo(x, y, x, y - r);
  c.fill();
}

function skyGradient(c, stops) {
  const g = c.createLinearGradient(0, 0, 0, 380);
  for (const [at, colour] of stops) g.addColorStop(at, colour);
  c.fillStyle = g;
  c.fillRect(0, 0, PANEL_W, 380);
}

function starField(c, seed, count, top, bottom) {
  const rnd = mulberry(seed);
  for (let i = 0; i < count; i++) {
    const x = 20 + rnd() * (PANEL_W - 40);
    const y = top + rnd() * (bottom - top);
    const r = 0.8 + rnd() * 1.8;
    c.fillStyle = `rgba(255, 244, 214, ${0.45 + rnd() * 0.5})`;
    circle(c, x, y, r);
  }
}

// --- Level 1: Warung Kopi Senja --------------------------------------------

function drawWarung(c, v) {
  skyGradient(c, [[0, '#241640'], [0.55, '#7a2d5e'], [0.85, '#e2603a'], [1, '#f7b95c']]);
  starField(c, 11, 26, 8, 150);

  // Sun, low over the rooftops. Difference "sun": gone on the right.
  if (!v.has('sun')) {
    const glow = c.createRadialGradient(110, 118, 10, 110, 118, 90);
    glow.addColorStop(0, 'rgba(255, 214, 106, 0.85)');
    glow.addColorStop(1, 'rgba(255, 214, 106, 0)');
    c.fillStyle = glow;
    c.fillRect(10, 18, 200, 200);
    c.fillStyle = '#ffd76a';
    circle(c, 110, 118, 42);
    c.fillStyle = '#ffedb0';
    circle(c, 110, 118, 30);
  }

  // Distant rooftops and lit windows.
  c.fillStyle = '#1d1030';
  c.fillRect(0, 268, 120, 82);
  c.fillRect(120, 292, 150, 58);
  c.fillRect(430, 280, 186, 70);
  c.fillStyle = '#ffd76a';
  for (const [wx, wy] of [[30, 290], [70, 310], [160, 310], [220, 305], [470, 300], [520, 315], [570, 295]]) {
    c.fillRect(wx, wy, 10, 12);
  }

  // Street and pavement.
  c.fillStyle = '#2a1a33';
  c.fillRect(0, 350, PANEL_W, PANEL_H - 350);
  c.fillStyle = '#3a2438';
  c.fillRect(0, 350, PANEL_W, 26);

  // String lights sagging across the top. Difference "bulb": one bulb stays dark.
  c.strokeStyle = '#1a1024';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(10, 58);
  c.quadraticCurveTo(308, 96, 606, 58);
  c.stroke();
  for (let i = 0; i < 11; i++) {
    const x = 30 + i * 55;
    const t = i / 10;
    const y = 58 + Math.sin(t * Math.PI) * 30 + 8;
    c.strokeStyle = '#1a1024';
    line(c, x, y - 6, x, y);
    if (i === 9 && v.has('bulb')) {
      c.fillStyle = '#4a4450';
      circle(c, x, y + 6, 7);
    } else {
      c.fillStyle = '#ffd76a';
      circle(c, x, y + 6, 7);
      c.fillStyle = 'rgba(255, 215, 106, 0.25)';
      circle(c, x, y + 6, 13);
    }
  }

  // Stall posts and striped awning.
  c.fillStyle = '#5a3a22';
  c.fillRect(168, 200, 12, 190);
  c.fillRect(438, 200, 12, 190);
  for (let i = 0; i < 8; i++) {
    c.fillStyle = i % 2 === 0 ? '#c0392b' : '#f5e6c8';
    const x = 150 + i * 40;
    c.beginPath();
    c.moveTo(x, 188);
    c.lineTo(x + 40, 188);
    c.lineTo(x + 34, 226);
    c.lineTo(x + 6, 226);
    c.closePath();
    c.fill();
  }
  c.fillStyle = '#8a5a2e';
  c.fillRect(150, 184, 320, 8);

  // Sign board. Difference "sign": SENJA becomes PAGI on the right.
  c.fillStyle = '#4a2f1d';
  rr(c, 210, 232, 200, 48, 8);
  c.fill();
  c.strokeStyle = '#d8b25c';
  c.lineWidth = 3;
  c.stroke();
  c.fillStyle = '#f5e6c8';
  c.font = 'bold 27px system-ui, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(v.has('sign') ? 'KOPI PAGI' : 'KOPI SENJA', 310, 258);

  // Hanging lantern under the awning.
  c.strokeStyle = '#1a1024';
  c.lineWidth = 2;
  line(c, 310, 226, 310, 292);
  c.fillStyle = '#ffb84d';
  circle(c, 310, 306, 15);
  c.fillStyle = 'rgba(255, 184, 77, 0.3)';
  circle(c, 310, 306, 24);

  // Counter.
  c.fillStyle = '#8a5a2e';
  c.fillRect(170, 380, 280, 14);
  c.fillStyle = '#6b4423';
  c.fillRect(178, 394, 264, 76);
  c.strokeStyle = '#4a2f1d';
  c.lineWidth = 2;
  for (let i = 1; i < 4; i++) line(c, 178 + i * 66, 394, 178 + i * 66, 470);

  // Bean jar.
  c.fillStyle = 'rgba(220, 235, 245, 0.85)';
  rr(c, 192, 344, 30, 38, 6);
  c.fill();
  c.fillStyle = '#5a3a22';
  for (const [bx, by] of [[200, 356], [212, 364], [202, 372], [214, 352]]) circle(c, bx, by, 3.5);

  // Kettle with steam. Difference "kettle": silver becomes red.
  c.strokeStyle = 'rgba(245, 230, 200, 0.7)';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(244, 336);
  c.quadraticCurveTo(238, 322, 246, 310);
  c.quadraticCurveTo(252, 300, 246, 290);
  c.stroke();
  c.beginPath();
  c.moveTo(262, 336);
  c.quadraticCurveTo(268, 322, 262, 310);
  c.stroke();
  c.fillStyle = v.has('kettle') ? '#d23b2e' : '#cfd6dd';
  c.beginPath();
  c.moveTo(232, 380);
  c.lineTo(232, 352);
  c.quadraticCurveTo(232, 336, 252, 336);
  c.quadraticCurveTo(272, 336, 272, 352);
  c.lineTo(272, 380);
  c.closePath();
  c.fill();
  c.fillStyle = v.has('kettle') ? '#a02c22' : '#9aa4ad';
  c.fillRect(244, 330, 16, 7);
  c.strokeStyle = v.has('kettle') ? '#a02c22' : '#9aa4ad';
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(232, 352);
  c.quadraticCurveTo(216, 348, 214, 362);
  c.stroke();
  c.beginPath();
  c.moveTo(272, 350);
  c.quadraticCurveTo(286, 344, 284, 360);
  c.stroke();

  // Cups on the counter. Difference "cup": a fourth cup appears.
  for (const cx of [330, 360, 390]) drawCup(c, cx, 356);
  if (v.has('cup')) drawCup(c, 420, 352);

  // Menu board leaning by the stall. Difference "price": 5K becomes 8K.
  c.save();
  c.translate(118, 402);
  c.rotate(-0.06);
  c.fillStyle = '#3a2418';
  rr(c, -26, -32, 52, 64, 5);
  c.fill();
  c.strokeStyle = '#d8b25c';
  c.lineWidth = 2;
  c.stroke();
  c.fillStyle = '#f5e6c8';
  c.font = 'bold 13px system-ui, sans-serif';
  c.textAlign = 'center';
  c.fillText('KOPI', 0, -10);
  c.font = 'bold 17px system-ui, sans-serif';
  c.fillText(v.has('price') ? '8K' : '5K', 0, 14);
  c.restore();

  // Stools, one with a sleeping cat. Difference "cat": the cat is gone.
  drawStool(c, 200, 486);
  drawStool(c, 432, 486);
  if (!v.has('cat')) {
    c.fillStyle = '#e8a34c';
    c.beginPath();
    c.ellipse(432, 452, 26, 14, 0, 0, Math.PI * 2);
    c.fill();
    circle(c, 452, 442, 11);
    c.beginPath();
    c.moveTo(444, 434);
    c.lineTo(447, 426);
    c.lineTo(451, 434);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(454, 434);
    c.lineTo(457, 426);
    c.lineTo(460, 434);
    c.closePath();
    c.fill();
    c.strokeStyle = '#e8a34c';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(408, 456);
    c.quadraticCurveTo(396, 446, 402, 436);
    c.stroke();
    c.strokeStyle = '#b97a2e';
    c.lineWidth = 2;
    line(c, 424, 442, 424, 460);
    line(c, 434, 440, 434, 462);
  }

  // Potted plant.
  c.fillStyle = '#b4502e';
  c.beginPath();
  c.moveTo(66, 452);
  c.lineTo(94, 452);
  c.lineTo(88, 480);
  c.lineTo(72, 480);
  c.closePath();
  c.fill();
  c.strokeStyle = '#3f7d3a';
  c.lineWidth = 5;
  for (const [dx, dy] of [[-12, -22], [0, -30], [12, -22], [-6, -14], [8, -14]]) {
    c.beginPath();
    c.moveTo(80, 452);
    c.quadraticCurveTo(80 + dx, 452 + dy / 2, 80 + dx, 452 + dy);
    c.stroke();
  }

  // Bicycle leaning by the stall. Difference "wheel": front wheel is gone.
  c.fillStyle = '#2b2b33';
  circle(c, 536, 492, 24);
  if (!v.has('wheel')) circle(c, 588, 492, 24);
  c.fillStyle = '#3a2438';
  circle(c, 536, 492, 17);
  if (!v.has('wheel')) circle(c, 588, 492, 17);
  c.strokeStyle = '#2b2b33';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(536, 492);
  c.lineTo(560, 462);
  c.lineTo(588, 492);
  c.lineTo(566, 492);
  c.lineTo(552, 470);
  c.lineTo(536, 492);
  c.moveTo(560, 462);
  c.lineTo(576, 462);
  c.moveTo(552, 470);
  c.lineTo(544, 452);
  c.stroke();
  c.fillStyle = '#2b2b33';
  circle(c, 560, 462, 4);
}

function drawCup(c, x, y) {
  c.fillStyle = '#f5e6c8';
  c.beginPath();
  c.moveTo(x - 9, y);
  c.lineTo(x + 9, y);
  c.lineTo(x + 7, y + 16);
  c.lineTo(x - 7, y + 16);
  c.closePath();
  c.fill();
  c.fillStyle = '#6b4423';
  c.fillRect(x - 8, y + 1, 16, 4);
  c.strokeStyle = '#f5e6c8';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x + 10, y + 8, 5, -Math.PI / 2, Math.PI / 2);
  c.stroke();
}

function drawStool(c, x, y) {
  c.fillStyle = '#5a3a22';
  c.fillRect(x - 4, y - 26, 8, 26);
  c.fillRect(x - 22, y - 26, 44, 8);
  c.fillStyle = '#8a5a2e';
  rr(c, x - 26, y - 34, 52, 10, 5);
  c.fill();
}

// --- Level 2: Pasar Malam --------------------------------------------------

function drawPasar(c, v) {
  skyGradient(c, [[0, '#0b1030'], [0.55, '#1b2a52'], [1, '#3a2a5e']]);
  starField(c, 22, 30, 8, 140);

  // One bright star. Difference "star": it is gone on the right.
  if (!v.has('star')) sparkle(c, 198, 58, 10, '#fff3c4');

  // Moon. Difference "moon": full becomes a crescent.
  c.fillStyle = '#f5ead0';
  circle(c, 502, 88, 34);
  if (v.has('moon')) {
    c.fillStyle = '#1b2a52';
    circle(c, 516, 80, 30);
  }
  c.fillStyle = 'rgba(245, 234, 208, 0.25)';
  circle(c, 502, 88, 44);

  // Ferris wheel silhouette in the distance.
  c.strokeStyle = '#14102a';
  c.lineWidth = 5;
  c.beginPath();
  c.arc(110, 215, 92, 0, Math.PI * 2);
  c.stroke();
  c.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    line(c, 110, 215, 110 + Math.cos(a) * 92, 215 + Math.sin(a) * 92);
  }
  c.fillStyle = '#14102a';
  circle(c, 110, 215, 10);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    c.fillRect(110 + Math.cos(a) * 92 - 7, 215 + Math.sin(a) * 92 - 5, 14, 10);
  }
  c.fillRect(104, 215, 12, 150);

  // Ground.
  c.fillStyle = '#171226';
  c.fillRect(0, 440, PANEL_W, PANEL_H - 440);
  c.fillStyle = '#241a38';
  c.fillRect(0, 440, PANEL_W, 14);

  // Paper lanterns strung between the stalls. Difference "lantern": red turns green.
  c.strokeStyle = '#0d0a1c';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(40, 128);
  c.quadraticCurveTo(308, 168, 580, 128);
  c.stroke();
  drawLantern(c, 258, 150, '#d23b2e');
  drawLantern(c, 308, 152, v.has('lantern') ? '#3fae5a' : '#d23b2e');
  drawLantern(c, 358, 150, '#e8a34c');

  // Stall A: sate. Difference "sign": SATE becomes SOTO.
  drawStall(c, 40, 190, 240, '#2e7d46', '#f5e6c8');
  c.fillStyle = '#3a2418';
  rr(c, 110, 238, 100, 34, 6);
  c.fill();
  c.fillStyle = '#f5e6c8';
  c.font = 'bold 22px system-ui, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(v.has('sign') ? 'SOTO' : 'SATE', 160, 256);
  // Vendor with a wide hat. Difference "hat": the hat is gone.
  c.fillStyle = '#7a4a2e';
  c.beginPath();
  c.arc(160, 318, 26, Math.PI, 0);
  c.fill();
  c.fillRect(134, 318, 52, 46);
  c.fillStyle = '#e8b98a';
  circle(c, 160, 296, 17);
  if (!v.has('hat')) {
    c.fillStyle = '#d8b25c';
    c.beginPath();
    c.moveTo(132, 288);
    c.quadraticCurveTo(160, 258, 188, 288);
    c.closePath();
    c.fill();
  }
  // Grill with skewers and smoke.
  c.fillStyle = '#1c1c22';
  c.fillRect(96, 372, 128, 16);
  c.strokeStyle = '#d8b25c';
  c.lineWidth = 3;
  for (const sx of [112, 136, 160, 184, 208]) line(c, sx, 372, sx, 356);
  c.strokeStyle = 'rgba(220, 220, 230, 0.55)';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(120, 352);
  c.quadraticCurveTo(114, 338, 122, 326);
  c.stroke();
  c.beginPath();
  c.moveTo(180, 352);
  c.quadraticCurveTo(186, 338, 178, 324);
  c.stroke();

  // Stall B: es teh.
  drawStall(c, 340, 190, 240, '#c96a1e', '#f5e6c8');
  c.fillStyle = '#3a2418';
  rr(c, 400, 238, 120, 34, 6);
  c.fill();
  c.fillStyle = '#f5e6c8';
  c.font = 'bold 22px system-ui, sans-serif';
  c.fillText('ES TEH', 460, 256);
  // Jars and cups on the counter.
  for (const [jx, jc] of [[400, '#e2703f'], [436, '#3fae5a'], [472, '#e8c33c']]) {
    c.fillStyle = 'rgba(220, 235, 245, 0.8)';
    rr(c, jx, 348, 26, 34, 5);
    c.fill();
    c.fillStyle = jc;
    c.fillRect(jx + 3, 362, 20, 17);
  }
  c.fillStyle = '#f5e6c8';
  for (const cx of [516, 540]) {
    c.fillRect(cx, 366, 14, 14);
  }

  // Balloons tied to the cart. Difference "balloon": the yellow one is gone.
  c.strokeStyle = '#c9c9d6';
  c.lineWidth = 2;
  const balloons = [
    [292, 262, '#d23b2e'], [316, 250, '#e8c33c'], [340, 262, '#3f7ddb'],
    [304, 282, '#3fae5a'], [330, 282, '#9b59d0'],
  ];
  for (const [bx, by, bc] of balloons) {
    if (bc === '#e8c33c' && v.has('balloon')) continue;
    line(c, bx, by + 16, 316, 330);
    c.fillStyle = bc;
    c.beginPath();
    c.ellipse(bx, by, 13, 16, 0, 0, Math.PI * 2);
    c.fill();
  }

  // Food cart in the middle. Difference "cartwheel": its wheel is gone.
  c.fillStyle = '#6b4423';
  rr(c, 250, 430, 132, 62, 8);
  c.fill();
  c.fillStyle = '#8a5a2e';
  c.fillRect(250, 430, 132, 10);
  c.fillStyle = '#f5e6c8';
  c.font = 'bold 15px system-ui, sans-serif';
  c.textAlign = 'center';
  c.fillText('BAKSO', 316, 466);
  c.strokeStyle = '#2b2b33';
  c.lineWidth = 4;
  line(c, 250, 430, 240, 400);
  line(c, 382, 430, 392, 400);
  c.fillStyle = '#2b2b33';
  if (!v.has('cartwheel')) circle(c, 302, 498, 15);
  c.fillStyle = '#3a2438';
  if (!v.has('cartwheel')) circle(c, 302, 498, 8);

  // Crates by stall B. Difference "crate": a third crate appears on top.
  drawCrate(c, 482, 432);
  drawCrate(c, 520, 432);
  if (v.has('crate')) drawCrate(c, 501, 398);
}

function drawLantern(c, x, y, colour) {
  c.fillStyle = colour;
  c.beginPath();
  c.ellipse(x, y, 16, 20, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.35)';
  c.lineWidth = 1.5;
  for (const dx of [-8, 0, 8]) {
    c.beginPath();
    c.ellipse(x + dx * 0.4, y, 4 + Math.abs(dx) * 0.4, 19, 0, 0, Math.PI * 2);
    c.stroke();
  }
  c.fillStyle = '#d8b25c';
  c.fillRect(x - 5, y - 23, 10, 5);
  c.fillRect(x - 5, y + 18, 10, 5);
}

function drawStall(c, x, y, w, stripe, light) {
  c.fillStyle = '#5a3a22';
  c.fillRect(x + 6, y + 30, 10, 170);
  c.fillRect(x + w - 16, y + 30, 10, 170);
  for (let i = 0; i < 6; i++) {
    c.fillStyle = i % 2 === 0 ? stripe : light;
    const sx = x + i * (w / 6);
    c.beginPath();
    c.moveTo(sx, y);
    c.lineTo(sx + w / 6, y);
    c.lineTo(sx + w / 6 - 8, y + 34);
    c.lineTo(sx + 8, y + 34);
    c.closePath();
    c.fill();
  }
  c.fillStyle = '#6b4423';
  c.fillRect(x, y + 190, w, 12);
  c.fillStyle = '#5a3a22';
  c.fillRect(x + 8, y + 202, w - 16, 62);
}

function drawCrate(c, x, y) {
  c.fillStyle = '#a8763e';
  c.fillRect(x, y, 34, 30);
  c.strokeStyle = '#6b4423';
  c.lineWidth = 2;
  c.strokeRect(x, y, 34, 30);
  line(c, x, y, x + 34, y + 30);
  line(c, x + 34, y, x, y + 30);
}

// --- Level 3: Pantai Senja -------------------------------------------------

function drawPantai(c, v) {
  skyGradient(c, [[0, '#3a1c5e'], [0.5, '#c94f6d'], [0.8, '#ff9e57'], [1, '#ffd27a']]);
  starField(c, 33, 14, 8, 90);

  // Kite. Difference "kite": it is gone on the right.
  if (!v.has('kite')) {
    c.fillStyle = '#d23b2e';
    c.beginPath();
    c.moveTo(138, 66);
    c.lineTo(162, 92);
    c.lineTo(138, 118);
    c.lineTo(114, 92);
    c.closePath();
    c.fill();
    c.fillStyle = '#ffd23e';
    c.beginPath();
    c.moveTo(138, 92);
    c.lineTo(150, 92);
    c.lineTo(138, 106);
    c.lineTo(126, 92);
    c.closePath();
    c.fill();
    c.strokeStyle = '#f5e6c8';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(138, 118);
    c.quadraticCurveTo(128, 140, 140, 158);
    c.quadraticCurveTo(150, 176, 138, 192);
    c.stroke();
    c.fillStyle = '#ffd23e';
    circle(c, 134, 140, 4);
    circle(c, 139, 162, 4);
  }

  // Sun over the sea.
  const glow = c.createRadialGradient(308, 150, 10, 308, 150, 100);
  glow.addColorStop(0, 'rgba(255, 224, 138, 0.9)');
  glow.addColorStop(1, 'rgba(255, 224, 138, 0)');
  c.fillStyle = glow;
  c.fillRect(198, 40, 220, 220);
  c.fillStyle = '#ffe08a';
  circle(c, 308, 150, 40);

  // Sea. Difference "reflect": the sun's path on the water is gone.
  const sea = c.createLinearGradient(0, 240, 0, 380);
  sea.addColorStop(0, '#d96a4a');
  sea.addColorStop(1, '#5e2a63');
  c.fillStyle = sea;
  c.fillRect(0, 240, PANEL_W, 140);
  if (!v.has('reflect')) {
    c.fillStyle = 'rgba(255, 215, 106, 0.55)';
    for (let i = 0; i < 7; i++) {
      const y = 252 + i * 18;
      const w = 60 + i * 14;
      c.fillRect(308 - w / 2, y, w, 6);
    }
  }
  c.strokeStyle = 'rgba(255, 240, 200, 0.35)';
  c.lineWidth = 2;
  for (const [wx, wy, wl] of [[80, 270, 60], [430, 290, 70], [180, 330, 80], [480, 340, 60]]) {
    line(c, wx, wy, wx + wl, wy);
  }

  // Boat. Difference "sail": the sail is gone, mast and hull stay.
  c.fillStyle = '#3a1c2e';
  c.beginPath();
  c.moveTo(424, 286);
  c.lineTo(484, 286);
  c.lineTo(470, 302);
  c.lineTo(438, 302);
  c.closePath();
  c.fill();
  c.strokeStyle = '#3a1c2e';
  c.lineWidth = 3;
  line(c, 454, 286, 454, 238);
  if (!v.has('sail')) {
    c.fillStyle = '#f5e6c8';
    c.beginPath();
    c.moveTo(456, 240);
    c.lineTo(456, 284);
    c.lineTo(486, 284);
    c.closePath();
    c.fill();
  }

  // Sand.
  c.fillStyle = '#e8c48f';
  c.fillRect(0, 380, PANEL_W, PANEL_H - 380);
  c.fillStyle = '#d9ad72';
  const rnd = mulberry(44);
  for (let i = 0; i < 40; i++) {
    circle(c, 20 + rnd() * (PANEL_W - 40), 392 + rnd() * 160, 1.5 + rnd() * 2);
  }
  // Footprints wandering to the water.
  c.fillStyle = 'rgba(120, 84, 44, 0.5)';
  for (let i = 0; i < 6; i++) {
    circle(c, 250 + i * 8, 520 - i * 20, 4);
    circle(c, 262 + i * 8, 512 - i * 20, 4);
  }

  // Left palm. Difference "coconut": a third coconut appears.
  drawPalm(c, 78, 384, 1);
  c.fillStyle = '#6b4423';
  circle(c, 88, 232, 8);
  circle(c, 106, 240, 8);
  if (v.has('coconut')) circle(c, 100, 220, 8);

  // Right palm, smaller.
  drawPalm(c, 528, 384, 0.7);

  // Beach umbrella. Difference "umbrella": red stripes become blue.
  c.fillStyle = 'rgba(120, 84, 44, 0.25)';
  c.beginPath();
  c.ellipse(382, 470, 70, 12, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#8a5a2e';
  c.lineWidth = 5;
  line(c, 382, 372, 382, 468);
  const stripeColour = v.has('umbrella') ? '#3f7ddb' : '#d23b2e';
  for (let i = 0; i < 6; i++) {
    const a0 = Math.PI + (i / 6) * Math.PI;
    const a1 = Math.PI + ((i + 1) / 6) * Math.PI;
    c.fillStyle = i % 2 === 0 ? stripeColour : '#f5e6c8';
    c.beginPath();
    c.moveTo(382, 372);
    c.arc(382, 372, 78, a0, a1);
    c.closePath();
    c.fill();
  }
  c.fillStyle = '#d8b25c';
  circle(c, 382, 372, 6);

  // Sandcastle with a flag. Difference "flag": red flag becomes yellow.
  c.fillStyle = '#dcb47e';
  c.fillRect(150, 420, 64, 44);
  c.beginPath();
  c.moveTo(150, 420);
  c.lineTo(162, 396);
  c.lineTo(174, 420);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(190, 420);
  c.lineTo(202, 396);
  c.lineTo(214, 420);
  c.closePath();
  c.fill();
  c.fillStyle = '#c9a06a';
  c.fillRect(150, 420, 64, 6);
  c.strokeStyle = '#6b4423';
  c.lineWidth = 3;
  line(c, 182, 396, 182, 366);
  c.fillStyle = v.has('flag') ? '#ffd23e' : '#d23b2e';
  c.beginPath();
  c.moveTo(182, 366);
  c.lineTo(206, 372);
  c.lineTo(182, 380);
  c.closePath();
  c.fill();

  // Surfboard stuck in the sand. Difference "board": teal becomes orange.
  c.save();
  c.translate(300, 452);
  c.rotate(0.28);
  c.fillStyle = v.has('board') ? '#e76f51' : '#2a9d8f';
  c.beginPath();
  c.ellipse(0, -18, 16, 52, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#f5e6c8';
  c.fillRect(-16, -30, 32, 8);
  c.restore();

  // Starfish. Difference "starfish": it is gone on the right.
  if (!v.has('starfish')) {
    c.fillStyle = '#e2703f';
    drawStarfish(c, 482, 502, 20);
  }
}

function drawPalm(c, x, baseY, scale) {
  c.strokeStyle = '#7a5230';
  c.lineWidth = 12 * scale;
  c.beginPath();
  c.moveTo(x, baseY);
  c.quadraticCurveTo(x + 6 * scale, baseY - 90 * scale, x + 18 * scale, baseY - 150 * scale);
  c.stroke();
  c.strokeStyle = '#3f7d3a';
  c.lineWidth = 7 * scale;
  const topX = x + 18 * scale;
  const topY = baseY - 150 * scale;
  for (const [dx, dy] of [[-52, 8], [-40, -26], [-8, -38], [26, -30], [52, -6], [44, 22]]) {
    c.beginPath();
    c.moveTo(topX, topY);
    c.quadraticCurveTo(topX + dx * 0.7, topY + dy * 0.6, topX + dx, topY + dy + 26 * scale);
    c.stroke();
  }
}

function drawStarfish(c, x, y, r) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) c.moveTo(px, py);
    else c.lineTo(px, py);
  }
  c.closePath();
  c.fill();
  c.fillStyle = '#ffd23e';
  circle(c, x, y, 3);
}

// --- dispatcher and markers ------------------------------------------------

export function drawScene(c, level, variant, px, py, pw, ph) {
  c.save();
  c.beginPath();
  c.rect(px, py, pw, ph);
  c.clip();
  c.translate(px, py);
  c.scale(pw / PANEL_W, ph / PANEL_H);
  if (level.id === 'warung') drawWarung(c, variant);
  else if (level.id === 'pasar') drawPasar(c, variant);
  else drawPantai(c, variant);
  c.restore();
}

// Green ring + check on every found difference, drawn on both panels.
// `pulse` is { diff, t } for a hint: an amber ring that breathes.
export function drawMarkers(c, level, found, pulse, px, py, pw, ph, now) {
  const sx = pw / PANEL_W;
  const sy = ph / PANEL_H;
  for (const diff of level.diffs) {
    if (!found.has(diff.id)) continue;
    const x = px + diff.x * sx;
    const y = py + diff.y * sy;
    const r = (diff.r + 10) * sx;
    c.strokeStyle = '#37d67a';
    c.lineWidth = 5;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = '#0c3d24';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r + 3, 0, Math.PI * 2);
    c.stroke();
    // Check mark at the ring's upper right.
    c.strokeStyle = '#37d67a';
    c.lineWidth = 6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x + r * 0.55, y - r * 0.75);
    c.lineTo(x + r * 0.8, y - r * 0.45);
    c.lineTo(x + r * 1.15, y - r * 1.0);
    c.stroke();
  }
  if (pulse) {
    const diff = level.diffs.find((d) => d.id === pulse.diff);
    if (diff && !found.has(diff.id)) {
      const x = px + diff.x * sx;
      const y = py + diff.y * sy;
      const breathe = 1 + 0.18 * Math.sin(now / 130);
      const r = (diff.r + 12) * sx * breathe;
      c.strokeStyle = '#ffc53d';
      c.lineWidth = 6;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = 'rgba(255, 197, 61, 0.18)';
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
  }
}
