// Hit-testing for differences: a click lands on a difference when it falls inside
// that difference's circle, on either panel. The nearest unfound difference wins
// when circles overlap.

export function diffAtPoint(level, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const diff of level.diffs) {
    const dx = x - diff.x;
    const dy = y - diff.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= diff.r && dist < bestDist) {
      best = diff;
      bestDist = dist;
    }
  }
  return best;
}

export function remainingCount(level, found) {
  let left = 0;
  for (const diff of level.diffs) {
    if (!found.has(diff.id)) left++;
  }
  return left;
}

export function firstUnfound(level, found) {
  return level.diffs.find((diff) => !found.has(diff.id)) ?? null;
}

export function randomUnfound(level, found) {
  const open = level.diffs.filter((diff) => !found.has(diff.id));
  if (open.length === 0) return null;
  return open[Math.floor(Math.random() * open.length)];
}
