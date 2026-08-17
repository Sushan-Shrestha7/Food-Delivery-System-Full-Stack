export function getRating(id) {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const steps = 16; // 3.5, 3.6, ... 5.0 in 0.1 increments
  const value = 3.5 + (hash % steps) * 0.1;
  return Math.round(value * 10) / 10;
}

export function renderStars(rating) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return "★".repeat(full) + (hasHalf ? "⯪" : "") + "☆".repeat(empty);
}
