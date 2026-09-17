import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { SLAB } from '../../story';
import { inHole, rng, useInstances } from '../util';

/** The fund's floor: a spreadsheet made of light, with a few companies standing up out of it. */
export function FundFloor({ y, reduce }: { y: number; reduce: boolean }) {
  const top = y + SLAB.t / 2 + 0.02;
  const cells = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = -SLAB.w / 2 + 0.7; x < SLAB.w / 2 - 0.6; x += 0.56)
      for (let z = -SLAB.h / 2 + 0.7; z < SLAB.h / 2 - 0.6; z += 0.34)
        if (!inHole(x, z, 0.55)) out.push([x, z]);
    return out;
  }, []);
  const base = useMemo(() => new Float32Array(cells.length * 3), [cells]);
  const cellRef = useInstances(cells.length, (i, o, c, r) => {
    const [x, z] = cells[i];
    o.position.set(x, top, z);
    o.rotation.x = -Math.PI / 2;
    o.scale.set(0.5 + r() * 0.5, 1, 1);
    const hot = r() < 0.05;
    const b = hot ? 1.5 + r() * 0.5 : 0.22 + Math.pow(r(), 2.2) * 0.8;
    c.setRGB(0.72 * b, 0.82 * b, 1.05 * b);
    base[i * 3] = c.r; base[i * 3 + 1] = c.g; base[i * 3 + 2] = c.b;
  }, 11);

  // towers: portfolio companies as stacks of rows rising off the sheet
  const towers = useMemo(() => {
    const r = rng(19); const out: { x: number; z: number; h: number }[] = [];
    let guard = 0;
    while (out.length < 34 && guard++ < 400) {
      const [x, z] = cells[Math.floor(r() * cells.length)];
      if (Math.abs(z) < SLAB.hh / 2 + 1.2 && Math.abs(x) < SLAB.hw / 2 + 1.2) continue;
      out.push({ x, z, h: 3 + Math.floor(r() * 11) });
    }
    return out;
  }, [cells]);
  const towerCells = useMemo(() => towers.flatMap((t) => Array.from({ length: t.h }, (_, k) => ({ ...t, k }))), [towers]);
  const towerRef = useInstances(towerCells.length, (i, o, c, r) => {
    const t = towerCells[i];
    o.position.set(t.x, top + 0.12 + t.k * 0.2, t.z);
    const b = 0.7 + r() * 0.7 + (t.k === t.h - 1 ? 0.6 : 0);
    c.setRGB(0.78 * b, 0.86 * b, 1.05 * b);
  }, 23);

  const flicker = useRef({ t: 0, r: rng(5) });
  const tmp = useMemo(() => new Color(), []);
  useFrame((_, dt) => {
    if (reduce) return;
    const m = cellRef.current; if (!m || !m.instanceColor) return;
    flicker.current.t += dt;
    if (flicker.current.t < 0.04) return;
    flicker.current.t = 0;
    const r = flicker.current.r;
    for (let k = 0; k < 40; k++) {
      const i = Math.floor(r() * cells.length);
      const f = 0.55 + r() * 0.9;
      tmp.setRGB(base[i * 3] * f, base[i * 3 + 1] * f, base[i * 3 + 2] * f);
      m.setColorAt(i, tmp);
    }
    m.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={cellRef} args={[undefined, undefined, cells.length]} frustumCulled={false}>
        <planeGeometry args={[0.44, 0.14]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={towerRef} args={[undefined, undefined, towerCells.length]} frustumCulled={false}>
        <boxGeometry args={[0.44, 0.13, 0.14]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <pointLight position={[0, y + 7, 0]} color="#cfdcff" intensity={38} distance={26} decay={2} />
    </group>
  );
}
