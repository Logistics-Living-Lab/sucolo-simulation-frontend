
const SCORE_GRADIENT_STOPS = [
  { t: 0, color: '#e53935' },      // red (low score)
  { t: 0.33, color: '#fb8c00' },   // orange
  { t: 0.66, color: '#fdd835' },   // yellow
  { t: 1, color: '#0ce913' }       // green (high score)
];

function hexToRgb(hex) {
  const m = hex.replace(/^#/, '').match(/^(?:[0-9a-f]{3}){1,2}$/i);
  if (!m) return null;
  let s = m[0];
  if (s.length === 3) {
    s = s.split('').map(c => c + c).join('');
  }
  const n = parseInt(s, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const h = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('');
}

function lerpRgb(colorA, colorB, f) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  if (!a || !b) return colorB;
  const r = a.r + (b.r - a.r) * f;
  const g = a.g + (b.g - a.g) * f;
  const b_ = a.b + (b.b - a.b) * f;
  return rgbToHex(r, g, b_);
}

export const colorUtils = {
  /** Default gradient stops (for legend etc.). */
  getGradientStops() {
    return SCORE_GRADIENT_STOPS;
  },

  getColorForScore(score) {
    const t = Math.max(0, Math.min(1, score));
    const stops = SCORE_GRADIENT_STOPS;
    if (stops.length === 0) return '#999';
    if (stops.length === 1) return stops[0].color;

    let i = 0;
    while (i + 1 < stops.length && stops[i + 1].t <= t) i++;
    if (i + 1 >= stops.length) return stops[stops.length - 1].color;

    const a = stops[i];
    const b = stops[i + 1];
    const f = (t - a.t) / (b.t - a.t);
    return lerpRgb(a.color, b.color, f);
  }
};