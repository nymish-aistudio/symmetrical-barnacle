/**
 * Formations: the shapes the 44,471-point substrate can take.
 * Each formation is an RGBA float texture: xyz position + a per-point value in w
 * (used for brightness/colour). All formations share the same point→texel
 * assignment, permuted so that any prefix of the draw range is a uniform sample.
 */

export const N = 44471;
export const TEX_W = 256;
export const TEX_H = 174; // 44,544 texels ≥ N
export const TEXELS = TEX_W * TEX_H;

export type FormationName = 'inbox' | 'ledger' | 'heat' | 'ring' | 'plate' | 'bins';
export const FORMATIONS: FormationName[] = ['inbox', 'ledger', 'heat', 'ring', 'plate', 'bins'];

export interface CameraPose { pos: [number, number, number]; look: [number, number, number] }

export const POSES: Record<FormationName, CameraPose> = {
  inbox:  { pos: [0, 0.8, 21],   look: [0, 0.2, 0] },
  ledger: { pos: [0, 12.5, 9.5], look: [0, 0, -0.5] },
  heat:   { pos: [0, 7.5, 15.5], look: [0, 0.4, 0] },
  ring:   { pos: [0, 7.5, 17],   look: [0, 0, 0] },
  plate:  { pos: [-7, 5.5, 15],  look: [0, 0, 0] },
  bins:   { pos: [0, 1.6, 19],   look: [0, 0.6, 0] },
};

/* deterministic PRNG so every load draws the same print */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rnd: () => number) {
  let u = 0, v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* cheap smooth value noise for the heat map */
function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function valueNoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number) {
  return 0.55 * valueNoise(x, y) + 0.3 * valueNoise(x * 2.1 + 3.7, y * 2.1 + 1.3) + 0.15 * valueNoise(x * 4.3 + 9.1, y * 4.3 + 7.7);
}

type Writer = (i: number, x: number, y: number, z: number, w: number) => void;

function inbox(rnd: () => number, put: Writer) {
  const centers = [[-5.2, 0.2, 0.4], [-1.6, -0.5, -0.6], [1.9, 0.6, 0.3], [5.4, -0.3, -0.2]];
  const share = [0.46, 0.25, 0.17, 0.12];
  const sigma = [1.7, 1.15, 0.95, 0.8];
  let i = 0;
  for (let c = 0; c < 4; c++) {
    const count = c === 3 ? N - i : Math.floor(N * share[c]);
    for (let k = 0; k < count; k++, i++) {
      const s = sigma[c] * (0.6 + 0.8 * rnd());
      put(i, centers[c][0] + gauss(rnd) * s * 1.35, centers[c][1] + gauss(rnd) * s * 0.75, centers[c][2] + gauss(rnd) * s * 0.55, 0.25 + 0.75 * (c / 3));
    }
  }
}

function ledger(rnd: () => number, put: Writer) {
  // a sheet on the desk: rows of cases, columns of fields, lying in x–z
  const cols = 257, rows = 173;
  const groupCols = 32, groupRows = 8;
  const dx = 0.058, dz = 0.058;
  const gapX = 0.22, gapZ = 0.12;
  const width = cols * dx + Math.floor(cols / groupCols) * gapX;
  const depth = rows * dz + Math.floor(rows / groupRows) * gapZ;
  let i = 0;
  for (let r = 0; r < rows && i < N; r++) {
    for (let c = 0; c < cols && i < N; c++, i++) {
      const x = c * dx + Math.floor(c / groupCols) * gapX - width / 2;
      const z = r * dz + Math.floor(r / groupRows) * gapZ - depth / 2;
      const header = r % groupRows === 0 ? 1 : 0;
      put(i, x, 0.02 * (rnd() - 0.5), z, header ? 1 : 0.35 + 0.25 * ((c % groupCols) / groupCols));
    }
  }
  for (; i < N; i++) put(i, (rnd() - 0.5) * width, 0, depth / 2 + 0.3, 0.4);
}

function heat(_rnd: () => number, put: Writer) {
  // opportunity heat map: a grid in x–z lifted by score
  const side = 211;
  const size = 13;
  let i = 0;
  for (let r = 0; r < side && i < N; r++) {
    for (let c = 0; c < side && i < N; c++, i++) {
      const u = c / (side - 1), v = r / (side - 1);
      const h = Math.pow(fbm(u * 5.2, v * 5.2), 1.35);
      put(i, (u - 0.5) * size, h * 3.4 - 1.1, (v - 0.5) * size, h);
    }
  }
}

function ring(rnd: () => number, put: Writer) {
  const R = 4.3;
  const nRing = Math.floor(N * 0.6);
  const nSat = Math.floor(N * 0.04);
  const nTarget = Math.floor(N * 0.045);
  let i = 0;
  for (; i < nRing; i++) {
    const a = rnd() * Math.PI * 2;
    const r = R + gauss(rnd) * 0.22;
    put(i, Math.cos(a) * r, gauss(rnd) * 0.08, Math.sin(a) * r, 0.2 + 0.2 * rnd());
  }
  for (let s = 0; s < 7; s++) {
    const a0 = (s / 7) * Math.PI * 2 + 0.35;
    const r0 = 7.4 + (s % 2) * 1.1;
    const cx = Math.cos(a0) * r0, cz = Math.sin(a0) * r0, cy = (s % 3 - 1) * 0.6;
    for (let k = 0; k < nSat; k++, i++) {
      put(i, cx + gauss(rnd) * 0.42, cy + gauss(rnd) * 0.3, cz + gauss(rnd) * 0.42, 0.75);
    }
  }
  {
    const a0 = -0.55, r0 = 10.6;
    const cx = Math.cos(a0) * r0, cz = Math.sin(a0) * r0;
    for (let k = 0; k < nTarget; k++, i++) put(i, cx + gauss(rnd) * 0.5, 1.4 + gauss(rnd) * 0.3, cz + gauss(rnd) * 0.5, 1.0);
  }
  // arcs of dust from ring to satellites
  for (; i < N; i++) {
    const s = Math.floor(rnd() * 7);
    const a0 = (s / 7) * Math.PI * 2 + 0.35;
    const r0 = 7.4 + (s % 2) * 1.1;
    const t = rnd();
    const r = R + (r0 - R) * t;
    const lift = Math.sin(t * Math.PI) * 1.6;
    put(i, Math.cos(a0) * r + gauss(rnd) * 0.08, lift + (s % 3 - 1) * 0.6 * t, Math.sin(a0) * r + gauss(rnd) * 0.08, 0.5);
  }
}

function plate(rnd: () => number, put: Writer) {
  // a coated part from a CAD file: 12 × 7 plate, 4 holes, two faces, edges, hole rims
  const W = 12, H = 7, T = 0.13, hr = 0.78;
  const holes = [[-4, 2], [4, 2], [-4, -2], [4, -2]];
  const inHole = (x: number, y: number) => holes.some(([hx, hy]) => (x - hx) ** 2 + (y - hy) ** 2 < hr * hr);
  const nFace = Math.floor(N * 0.68), nRim = Math.floor(N * 0.2);
  let i = 0;
  while (i < nFace) {
    const x = (rnd() - 0.5) * W, y = (rnd() - 0.5) * H;
    if (inHole(x, y)) continue;
    put(i++, x, y, (rnd() < 0.5 ? -T : T), 0.22 + 0.1 * rnd());
  }
  for (let k = 0; k < nRim; k++, i++) {
    const h = holes[k % 4];
    const a = rnd() * Math.PI * 2;
    put(i, h[0] + Math.cos(a) * hr, h[1] + Math.sin(a) * hr, (rnd() - 0.5) * 2 * T, 0.95);
  }
  const per = 2 * (W + H);
  for (; i < N; i++) {
    let d = rnd() * per, x = 0, y = 0;
    if (d < W) { x = -W / 2 + d; y = H / 2; }
    else if ((d -= W) < H) { x = W / 2; y = H / 2 - d; }
    else if ((d -= H) < W) { x = W / 2 - d; y = -H / 2; }
    else { d -= W; x = -W / 2; y = -H / 2 + d; }
    put(i, x, y, (rnd() - 0.5) * 2 * T, 0.75);
  }
}

function bins(rnd: () => number, put: Writer) {
  // classification histogram: a long tail across 12 packaging groups
  const raw = [0.30, 0.19, 0.12, 0.09, 0.07, 0.055, 0.045, 0.035, 0.028, 0.022, 0.018, 0.017];
  const sum = raw.reduce((a, b) => a + b, 0);
  const cw = 0.92, pitch = 1.16, depth = 0.6, maxH = 8.2, base = -3.2;
  const total = 12 * pitch - (pitch - cw);
  let i = 0;
  for (let b = 0; b < 12; b++) {
    const share = raw[b] / sum;
    const count = b === 11 ? N - i : Math.floor(N * share);
    const h = maxH * (raw[b] / raw[0]);
    const x0 = -total / 2 + b * pitch;
    for (let k = 0; k < count; k++, i++) {
      put(i, x0 + rnd() * cw, base + rnd() * h, (rnd() - 0.5) * depth, b / 11);
    }
  }
}

const BUILDERS: Record<FormationName, (rnd: () => number, put: Writer) => void> = { inbox, ledger, heat, ring, plate, bins };

export interface FormationSet {
  data: Record<FormationName, Float32Array>; // RGBA, TEXELS * 4
  seeds: Float32Array;                        // per texel, [0,1)
  sizes: Float32Array;                        // per texel
}

export function buildFormations(): FormationSet {
  const perm = new Uint32Array(N);
  for (let i = 0; i < N; i++) perm[i] = i;
  const shuffle = mulberry32(1337);
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(shuffle() * (i + 1));
    const t = perm[i]; perm[i] = perm[j]; perm[j] = t;
  }

  const data = {} as Record<FormationName, Float32Array>;
  FORMATIONS.forEach((name, fi) => {
    const arr = new Float32Array(TEXELS * 4);
    const rnd = mulberry32(101 + fi * 7919);
    const put: Writer = (i, x, y, z, w) => {
      const t = perm[i] * 4;
      arr[t] = x; arr[t + 1] = y; arr[t + 2] = z; arr[t + 3] = w;
    };
    BUILDERS[name](rnd, put);
    // park the unused texels far away and transparent
    for (let i = N; i < TEXELS; i++) { const t = i * 4; arr[t] = 0; arr[t + 1] = -999; arr[t + 2] = 0; arr[t + 3] = 0; }
    data[name] = arr;
  });

  const rnd = mulberry32(42);
  const seeds = new Float32Array(TEXELS);
  const sizes = new Float32Array(TEXELS);
  for (let i = 0; i < TEXELS; i++) { seeds[i] = rnd(); sizes[i] = 0.65 + Math.pow(rnd(), 2.2) * 1.1; }

  return { data, seeds, sizes };
}
