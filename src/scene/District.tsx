import { useMemo } from 'react';
import * as THREE from 'three';
import { rng } from './util';
import { CITY_NIGHT, KIT, Model, Placed, type Xf } from './kit';

const GROUND = -37;
const S = 4.2; // industrial kit scale on the ground

/** What the building stands on: an industrial district at night, with traffic. */
export function District({ mobile, reduce }: { mobile: boolean; reduce: boolean }) {
  const r = useMemo(() => rng(307), []);
  const lots = useMemo(() => {
    const out: Record<string, Xf[]> = { a: [], c: [], e: [], g: [], m: [], p: [] };
    const keys = Object.keys(out);
    const n = mobile ? 14 : 26;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.3;
      const dist = 24 + r() * 58;
      out[keys[Math.floor(r() * keys.length)]].push({ p: [Math.cos(a) * dist, GROUND, Math.sin(a) * dist], ry: Math.round(r() * 4) * (Math.PI / 2) + (r() - 0.5) * 0.2 });
    }
    return out;
  }, [mobile, r]);
  const chimneys = useMemo<Xf[]>(() => Array.from({ length: 6 }, () => { const a = r() * Math.PI * 2, d = 30 + r() * 50; return { p: [Math.cos(a) * d, GROUND, Math.sin(a) * d] }; }), [r]);
  const towers = useMemo<Xf[]>(() => [{ p: [-46, GROUND, 18] }, { p: [52, GROUND, -30] }], []);
  const tanks = useMemo<Xf[]>(() => [{ p: [38, GROUND, 40] }, { p: [-30, GROUND, -52] }], []);
  const containers = useMemo<Xf[]>(() => {
    const out: Xf[] = [];
    for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, d = 26 + r() * 40; const k = Math.floor(r() * 2); out.push({ p: [Math.cos(a) * d, GROUND + k * 1.29 * S * 0.6, Math.sin(a) * d], ry: Math.round(r() * 2) * (Math.PI / 2) + (r() - 0.5) * 0.15, s: 0.6 }); }
    return out;
  }, [r]);

  // roads as faint light lines, and vehicles that follow them
  const loops = useMemo(() => [
    { pts: [[-40, -40], [40, -40], [40, 40], [-40, 40]] as [number, number][], speed: 7, model: 'delivery', scale: 1.6 },
    { pts: [[-62, -20], [-62, 62], [30, 62], [30, 24], [-20, 24], [-20, -20]] as [number, number][], speed: 8.5, model: 'van', scale: 1.6 },
    { pts: [[60, -60], [60, 10], [-10, 10], [-10, -60]] as [number, number][], speed: 6, model: 'truck-flat', scale: 1.7 },
  ], []);
  const roads = useMemo(() => {
    const pts: number[] = [];
    for (const l of loops) for (let i = 0; i < l.pts.length; i++) { const p = l.pts[i], q = l.pts[(i + 1) % l.pts.length]; pts.push(p[0], GROUND + 0.03, p[1], q[0], GROUND + 0.03, q[1]); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, [loops]);
  const drive = (root: THREE.Object3D, t: number, loop: typeof loops[number], yy: number) => {
    const len = loop.pts.reduce((acc, p, i) => { const q = loop.pts[(i + 1) % loop.pts.length]; return acc + Math.hypot(q[0] - p[0], q[1] - p[1]); }, 0);
    let d = ((reduce ? 0 : t * loop.speed) % len + len) % len;
    for (let i = 0; i < loop.pts.length; i++) {
      const p = loop.pts[i], q = loop.pts[(i + 1) % loop.pts.length]; const seg = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d <= seg) { const u = d / seg; root.position.set(p[0] + (q[0] - p[0]) * u, yy, p[1] + (q[1] - p[1]) * u); root.rotation.y = Math.atan2(q[0] - p[0], q[1] - p[1]); break; }
      d -= seg;
    }
    root.traverse((o) => { if (o.name.startsWith('wheel')) o.rotation.x += reduce ? 0 : 0.25; });
  };

  return (
    <group>
      {(['a', 'c', 'e', 'g', 'm', 'p'] as const).map((k) => lots[k].length ? <Placed key={k} src={KIT.industrial(`building-${k}`)} at={lots[k]} scale={S} overrides={CITY_NIGHT} /> : null)}
      <Placed src={KIT.industrial('chimney-large')} at={chimneys.slice(0, 3)} scale={S} overrides={CITY_NIGHT} />
      <Placed src={KIT.industrial('chimney-medium')} at={chimneys.slice(3)} scale={S} overrides={CITY_NIGHT} />
      <Placed src={KIT.industrial('water-tower')} at={towers} scale={S} overrides={CITY_NIGHT} />
      <Placed src={KIT.industrial('detail-tank-large')} at={tanks} scale={S} overrides={CITY_NIGHT} />
      <Placed src={KIT.industrial('shipping-container-a')} at={containers.filter((_, i) => i % 2 === 0)} scale={S} overrides={CITY_NIGHT} />
      <Placed src={KIT.industrial('shipping-container-b')} at={containers.filter((_, i) => i % 2 === 1)} scale={S} overrides={CITY_NIGHT} />
      <lineSegments geometry={roads}>
        <lineBasicMaterial color="#8fa6d6" transparent opacity={0.28} depthWrite={false} />
      </lineSegments>
      {loops.map((l) => (
        <Model key={l.model} src={KIT.cars(l.model)} scale={l.scale} overrides={CITY_NIGHT} onFrame={(o, t) => drive(o, t, l, GROUND + (l.model === 'delivery' ? 1.0 : 0.3) * l.scale)} />
      ))}
    </group>
  );
}
