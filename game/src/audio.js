// Tiny WebAudio sound effects, all synthesized in code — no audio files.
// The context is created lazily on the first user gesture, so the game stays
// silent (and error-free) until the player interacts.

let context = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function audioContext() {
  if (!context) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(freq, startAt, length, type, gain) {
  const ctx = audioContext();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  amp.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + startAt + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + length);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + length + 0.05);
}

export function playFind() {
  tone(660, 0, 0.12, 'sine', 0.22);
  tone(880, 0.09, 0.18, 'sine', 0.22);
  tone(1320, 0.18, 0.22, 'sine', 0.14);
}

export function playWrong() {
  tone(160, 0, 0.18, 'square', 0.1);
  tone(110, 0.1, 0.22, 'square', 0.08);
}

export function playHint() {
  tone(520, 0, 0.1, 'triangle', 0.16);
  tone(780, 0.08, 0.14, 'triangle', 0.16);
}

export function playClick() {
  tone(440, 0, 0.06, 'triangle', 0.1);
}

export function playLevelComplete() {
  tone(523, 0, 0.14, 'sine', 0.2);
  tone(659, 0.12, 0.14, 'sine', 0.2);
  tone(784, 0.24, 0.2, 'sine', 0.2);
  tone(1047, 0.36, 0.32, 'sine', 0.2);
}

export function playWin() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((freq, i) => tone(freq, i * 0.13, 0.2, 'sine', 0.18));
}

export function playTick() {
  tone(980, 0, 0.05, 'square', 0.05);
}
