import { SLAB } from '../story';
import type { Xf } from './kit';

/** The ring of floor around the atrium, as four bands. All in slab-local x/z. */
export const BAND = {
  n: { z0: SLAB.hh / 2 + 0.3, z1: SLAB.h / 2 - 0.3, x0: -SLAB.w / 2 + 0.4, x1: SLAB.w / 2 - 0.4 },
  s: { z0: -SLAB.h / 2 + 0.3, z1: -SLAB.hh / 2 - 0.3, x0: -SLAB.w / 2 + 0.4, x1: SLAB.w / 2 - 0.4 },
  w: { x0: -SLAB.w / 2 + 0.3, x1: -SLAB.hw / 2 - 0.3, z0: -SLAB.h / 2 + 0.4, z1: SLAB.h / 2 - 0.4 },
  e: { x0: SLAB.hw / 2 + 0.3, x1: SLAB.w / 2 - 0.3, z0: -SLAB.h / 2 + 0.4, z1: SLAB.h / 2 - 0.4 },
};
export const NZ = (BAND.n.z0 + BAND.n.z1) / 2;   // 6.75
export const SZ = -NZ;
export const WX = (BAND.w.x0 + BAND.w.x1) / 2;   // -9.75
export const EX = -WX;

export const row = (n: number, x0: number, x1: number, f: (x: number, i: number) => Xf): Xf[] =>
  Array.from({ length: n }, (_, i) => f(n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1), i));
