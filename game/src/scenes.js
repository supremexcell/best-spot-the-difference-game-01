// Level data for "Cari Bedanya: Senja" — three original Indonesian dusk scenes.
// Each level lists its differences: an id, a short label, and the spot (x, y, radius)
// inside a panel, in the panel's own 616 x 564 coordinate space. Both panels draw
// from the same scene description; the right panel just switches on the ids in its
// variant set. The renderer in render.js is what actually changes the picture.

export const PANEL_W = 616;
export const PANEL_H = 564;

export const LEVELS = [
  {
    id: 'warung',
    name: 'Warung Kopi Senja',
    short: 'Warung Kopi',
    tagline: 'Warung kopi di ujung jalan saat matahari turun',
    timeLimit: 150,
    difficulty: 'Mudah',
    diffs: [
      { id: 'sun',     label: 'Matahari hilang',          x: 110, y: 118, r: 50 },
      { id: 'sign',    label: 'Tulisan papan berubah',    x: 310, y: 256, r: 48 },
      { id: 'cat',     label: 'Kucing di kursi hilang',   x: 432, y: 452, r: 42 },
      { id: 'kettle',  label: 'Warna teko berubah',       x: 252, y: 344, r: 44 },
      { id: 'cup',     label: 'Satu cangkir tambahan',    x: 420, y: 352, r: 26 },
      { id: 'bulb',    label: 'Satu lampu gantung mati',  x: 520, y: 82,  r: 22 },
      { id: 'wheel',   label: 'Roda sepeda hilang',       x: 566, y: 492, r: 32 },
      { id: 'price',   label: 'Harga di menu berubah',    x: 118, y: 402, r: 36 },
    ],
  },
  {
    id: 'pasar',
    name: 'Pasar Malam',
    short: 'Pasar Malam',
    tagline: 'Lampu lampion dan asap sate di malam minggu',
    timeLimit: 150,
    difficulty: 'Sedang',
    diffs: [
      { id: 'moon',    label: 'Bulan jadi sabit',         x: 502, y: 88,  r: 44 },
      { id: 'lantern', label: 'Warna lampion berubah',   x: 308, y: 152, r: 30 },
      { id: 'balloon', label: 'Satu balon hilang',        x: 316, y: 286, r: 28 },
      { id: 'sign',    label: 'Tulisan warung berubah',   x: 160, y: 206, r: 46 },
      { id: 'cartwheel', label: 'Roda gerobak hilang',    x: 302, y: 498, r: 28 },
      { id: 'crate',   label: 'Satu peti tambahan',       x: 508, y: 420, r: 30 },
      { id: 'hat',     label: 'Topi penjual hilang',      x: 162, y: 252, r: 30 },
      { id: 'star',    label: 'Satu bintang hilang',      x: 198, y: 58,  r: 22 },
    ],
  },
  {
    id: 'pantai',
    name: 'Pantai Senja',
    short: 'Pantai Senja',
    tagline: 'Pasir, ombak, dan layang-layang terakhir hari itu',
    timeLimit: 180,
    difficulty: 'Sulit',
    diffs: [
      { id: 'kite',     label: 'Layang-layang hilang',    x: 138, y: 92,  r: 34 },
      { id: 'coconut',  label: 'Satu kelapa tambahan',    x: 96,  y: 232, r: 26 },
      { id: 'sail',     label: 'Layar perahu hilang',     x: 452, y: 262, r: 44 },
      { id: 'reflect',  label: 'Pantulan matahari hilang', x: 308, y: 306, r: 46 },
      { id: 'umbrella', label: 'Warna payung berubah',    x: 382, y: 362, r: 46 },
      { id: 'flag',     label: 'Warna bendera berubah',   x: 182, y: 402, r: 26 },
      { id: 'board',    label: 'Warna papan selancar berubah', x: 300, y: 452, r: 34 },
      { id: 'starfish', label: 'Bintang laut hilang',     x: 482, y: 502, r: 28 },
    ],
  },
];

export function levelById(id) {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}
