// Pointer and keyboard input: converts raw browser events into game actions.
// The canvas is drawn at a fixed logical size (1280 x 720) and scaled by CSS,
// so client coordinates are mapped back through the canvas bounding box.

export function installInput(canvas, game) {
  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const point = toLogical(event);
    game.handleClick(point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') game.useHint();
    else if (key === 'r') game.restartLevel();
    else if (key === 'm') game.toggleMute();
    else if (key === '1' || key === '2' || key === '3') game.selectLevel(Number(key) - 1);
    else if (key === 'enter' || key === ' ') game.confirm();
    else if (key === 'escape') game.backToMenu();
  });
}
