/** OKLCH → sRGB hex. Interpolating in OKLCH keeps the descent from going muddy in the middle. */
export type Oklch = [L: number, C: number, h: number];

const f = (x: number) => {
  const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
};

export function hex([L, C, h]: Oklch): string {
  const r = (h * Math.PI) / 180, a = C * Math.cos(r), b = C * Math.sin(r);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return '#'
    + f(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)
    + f(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)
    + f(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
}

export const mix = (a: Oklch, b: Oklch, t: number): Oklch => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
