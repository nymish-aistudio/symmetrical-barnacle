import { useMemo } from 'react';
import * as THREE from 'three';
import { FLOORS, SLAB } from '../story';
import { rng } from './util';

/** "A partner sees forty of these." Other buildings, faint in the fog, around ours. */
export function GhostColumns({ count = 40 }: { count?: number }) {
  const geo = useMemo(() => {
    const r = rng(211);
    const pts: number[] = [];
    const rect = (cx: number, y: number, cz: number, w: number, h: number) => {
      const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - h / 2, z1 = cz + h / 2;
      pts.push(x0, y, z0, x1, y, z0, x1, y, z0, x1, y, z1, x1, y, z1, x0, y, z1, x0, y, z1, x0, y, z0);
    };
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (r() - 0.5) * 0.3;
      const d = 52 + r() * 70;
      const cx = Math.cos(a) * d, cz = Math.sin(a) * d;
      const s = 0.5 + r() * 0.7;
      const w = SLAB.w * s, h = SLAB.h * s;
      const lift = (r() - 0.5) * 10;
      for (const f of FLOORS) rect(cx, f.y * s + lift, cz, w, h);
      // corner struts
      const top = FLOORS[0].y * s + lift, bottom = FLOORS[FLOORS.length - 1].y * s + lift;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) pts.push(cx + sx * w / 2, bottom, cz + sz * h / 2, cx + sx * w / 2, top, cz + sz * h / 2);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, [count]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#9db0d6" transparent opacity={0.16} depthWrite={false} />
    </lineSegments>
  );
}
