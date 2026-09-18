import { useMemo } from 'react';
import { Vector3 } from 'three';
import { FLOORS, SLAB } from '../story';
import { chapterLocal } from '../scroll/progress';
import { rng, smoothstep } from './util';
import { Travellers, type Segment } from './Travellers';

/** When the camera pulls back, learning travels between the floors. */
export function AltitudeThreads() {
  const segments = useMemo<Segment[]>(() => {
    const r = rng(149);
    const bottom = FLOORS[FLOORS.length - 1].y - 1, top = FLOORS[0].y + 2.5;
    const out: Segment[] = [];
    for (let i = 0; i < 14; i++) {
      const side = Math.floor(r() * 4);
      const x = side < 2 ? (side === 0 ? -1 : 1) * (SLAB.w / 2 - 1.2 - r() * 2.5) : (r() - 0.5) * (SLAB.w - 4);
      const z = side < 2 ? (r() - 0.5) * (SLAB.h - 4) : (side === 2 ? -1 : 1) * (SLAB.h / 2 - 1.2 - r() * 2);
      out.push([new Vector3(x, bottom, z), new Vector3(x, top, z)]);
    }
    return out;
  }, []);
  return (
    <Travellers
      segments={segments} perSegment={4} speed={[0.06, 0.14]} color={[1.7, 1.9, 2.4]} size={0.34} seed={151}
      opacity={() => Math.max(smoothstep(0.05, 0.35, chapterLocal('altitudes')), smoothstep(0.0, 0.3, chapterLocal('who')), smoothstep(0.0, 0.3, chapterLocal('start'))) * 0.9}
    />
  );
}
