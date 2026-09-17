import { useLayoutEffect, useRef } from 'react';
import { BufferGeometry, CanvasTexture, Color, EdgesGeometry, Float32BufferAttribute, InstancedMesh, Matrix4, Object3D, Vector3 } from 'three';
import { SLAB } from '../story';

/** deterministic PRNG so every load draws the same building */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** is (x, z) over the atrium void? */
export const inHole = (x: number, z: number, m = 0.4) => Math.abs(x) < SLAB.hw / 2 + m && Math.abs(z) < SLAB.hh / 2 + m;
/** is (x, z) on the slab at all? */
export const onSlab = (x: number, z: number, m = 0.5) => Math.abs(x) < SLAB.w / 2 - m && Math.abs(z) < SLAB.h / 2 - m;

/** a random point on the ring of floor around the atrium */
export function ringPoint(r: () => number, margin = 0.6): [number, number] {
  for (let i = 0; i < 64; i++) {
    const x = (r() - 0.5) * (SLAB.w - margin * 2), z = (r() - 0.5) * (SLAB.h - margin * 2);
    if (!inHole(x, z, margin)) return [x, z];
  }
  return [SLAB.w / 2 - 2, 0];
}

/** Point i of n spread evenly around the ring of floor, at `inset` from the outer edge, with a little jitter. */
export function ringSpread(i: number, n: number, r: () => number, inset = 3.2, jitter = 0.9): [number, number] {
  const w = SLAB.w - inset * 2, h = SLAB.h - inset * 2;
  const per = 2 * (w + h);
  let d = ((i + 0.5) / n) * per + (r() - 0.5) * (per / n) * 0.6;
  d = ((d % per) + per) % per;
  let x = 0, z = 0;
  if (d < w) { x = -w / 2 + d; z = -h / 2; }
  else if ((d -= w) < h) { x = w / 2; z = -h / 2 + d; }
  else if ((d -= h) < w) { x = w / 2 - d; z = h / 2; }
  else { d -= w; x = -w / 2; z = h / 2 - d; }
  return [x + (r() - 0.5) * jitter, z + (r() - 0.5) * jitter];
}

/** Fill an InstancedMesh once. `fill` positions instance i on `o` and colours it on `c`. */
export function useInstances(count: number, fill: (i: number, o: Object3D, c: Color, r: () => number) => void, seed = 1) {
  const ref = useRef<InstancedMesh>(null!);
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    const o = new Object3D(); const c = new Color(); const r = rng(seed);
    for (let i = 0; i < count; i++) {
      o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); c.setRGB(1, 1, 1);
      fill(i, o, c, r);
      o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, c);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [count, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

let glow: CanvasTexture | null = null;
/** soft round sprite for points */
export function glowTexture() {
  if (glow) return glow;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.4, 'rgba(255,255,255,0.5)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
  glow = new CanvasTexture(c);
  return glow;
}

export interface Xf { p: [number, number, number]; r?: [number, number, number]; s?: [number, number, number] }

/** Outline many copies of a shape in one draw call: crisp edges are what make small boxes legible at a distance. */
export function bakeEdges(base: BufferGeometry, xfs: Xf[], threshold = 30): BufferGeometry {
  const edges = new EdgesGeometry(base, threshold);
  const src = edges.attributes.position.array as Float32Array;
  const out: number[] = [];
  const m = new Matrix4(), o = new Object3D(), v = new Vector3();
  for (const x of xfs) {
    o.position.set(...x.p); o.rotation.set(...(x.r ?? [0, 0, 0])); o.scale.set(...(x.s ?? [1, 1, 1])); o.updateMatrix(); m.copy(o.matrix);
    for (let i = 0; i < src.length; i += 3) { v.set(src[i], src[i + 1], src[i + 2]).applyMatrix4(m); out.push(v.x, v.y, v.z); }
  }
  edges.dispose();
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(out, 3)); return g;
}
