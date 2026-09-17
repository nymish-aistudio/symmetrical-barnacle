import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SLAB } from '../../story';
import { bakeEdges, inHole, rng, useInstances, type Xf as EXf } from '../util';
import { KIT, LAMP_GLOW, Placed, SCREEN_GLOW, type Xf } from '../kit';
import { BAND, WX, row } from '../layout';

const F = 1.5;

/** The fund's floor: a spreadsheet made of light, a boardroom at one end, and a few companies standing up out of the sheet. */
export function FundFloor({ y, reduce }: { y: number; reduce: boolean }) {
  const top = y + SLAB.t / 2 + 0.02;

  // the sheet covers three bands; the west band is the boardroom
  const cells = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = BAND.w.x1 + 0.4; x < SLAB.w / 2 - 0.6; x += 0.56)
      for (let z = -SLAB.h / 2 + 0.7; z < SLAB.h / 2 - 0.6; z += 0.34)
        if (!inHole(x, z, 0.55)) out.push([x, z]);
    return out;
  }, []);
  const base = useMemo(() => new Float32Array(cells.length * 3), [cells]);
  const cellRef = useInstances(cells.length, (i, o, c, r) => {
    const [x, z] = cells[i];
    o.position.set(x, top, z); o.rotation.x = -Math.PI / 2; o.scale.set(0.5 + r() * 0.5, 1, 1);
    const hot = r() < 0.05;
    const b = hot ? 1.25 + r() * 0.35 : 0.18 + Math.pow(r(), 2.2) * 0.62;
    c.setRGB(0.66 * b, 0.78 * b, 1.05 * b);
    base[i * 3] = c.r; base[i * 3 + 1] = c.g; base[i * 3 + 2] = c.b;
  }, 11);

  const towers = useMemo(() => {
    const r = rng(19); const out: { x: number; z: number; h: number }[] = [];
    let guard = 0;
    while (out.length < 26 && guard++ < 600) {
      const [x, z] = cells[Math.floor(r() * cells.length)];
      if (Math.abs(z) < SLAB.hh / 2 + 1.4 && Math.abs(x) < SLAB.hw / 2 + 1.4) continue;
      if (out.some((t) => Math.abs(t.x - x) < 1.3 && Math.abs(t.z - z) < 0.9)) continue;
      out.push({ x, z, h: 4 + Math.floor(r() * 14) });
    }
    return out;
  }, [cells]);
  const towerCells = useMemo(() => towers.flatMap((t) => Array.from({ length: t.h }, (_, k) => ({ ...t, k }))), [towers]);
  const towerRef = useInstances(towerCells.length, (i, o, c, r) => {
    const t = towerCells[i];
    o.position.set(t.x, top + 0.12 + t.k * 0.2, t.z);
    const b = 0.6 + r() * 0.3 + (t.k === t.h - 1 ? 0.5 : 0);
    c.setRGB(0.8 * b, 0.88 * b, 1.05 * b);
  }, 23);
  const towerEdges = useMemo(() => bakeEdges(new THREE.BoxGeometry(0.5, 1, 0.2), towers.map<EXf>((t) => ({ p: [t.x, top + 0.12 + (t.h * 0.2) / 2 - 0.1, t.z], s: [1, t.h * 0.2, 1] }))), [towers, top]);

  const flicker = useRef({ t: 0, r: rng(5) });
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    if (reduce) return;
    const m = cellRef.current; if (!m || !m.instanceColor) return;
    flicker.current.t += dt; if (flicker.current.t < 0.04) return; flicker.current.t = 0;
    const r = flicker.current.r;
    for (let k = 0; k < 40; k++) { const i = Math.floor(r() * cells.length); const f = 0.55 + r() * 0.9; tmp.setRGB(base[i * 3] * f, base[i * 3 + 1] * f, base[i * 3 + 2] * f); m.setColorAt(i, tmp); }
    m.instanceColor.needsUpdate = true;
  });

  // the boardroom on the west band
  const TABLE_H = 0.83 * F;
  const tables = useMemo<Xf[]>(() => [{ p: [WX + 0.8, top, -3.05], ry: Math.PI / 2 }, { p: [WX + 0.8, top, 0.0], ry: Math.PI / 2 }], [top]);
  const chairs = useMemo<Xf[]>(() => [
    ...row(5, -4.2, 2.6, (z) => ({ p: [WX - 1.5, top, z], ry: Math.PI / 2 })),
    ...row(5, -4.2, 2.6, (z) => ({ p: [WX + 1.5, top, z], ry: -Math.PI / 2 })),
    { p: [WX, top, 3.9], ry: Math.PI },
  ], [top]);
  const laptops = useMemo<Xf[]>(() => [
    { p: [WX - 0.9, top + TABLE_H, -3.2], ry: Math.PI / 2 }, { p: [WX + 0.5, top + TABLE_H, -1.6], ry: -Math.PI / 2 },
    { p: [WX - 0.9, top + TABLE_H, 0.2], ry: Math.PI / 2 }, { p: [WX + 0.5, top + TABLE_H, 1.9], ry: -Math.PI / 2 },
  ], [top, TABLE_H]);
  const papers = useMemo<Xf[]>(() => [{ p: [WX + 0.1, top + TABLE_H, -2.2], ry: 0.4 }, { p: [WX - 0.3, top + TABLE_H, 1.0], ry: -0.7 }, { p: [WX + 0.4, top + TABLE_H, 3.0], ry: 1.9 }], [top, TABLE_H]);
  const tvStand = useMemo<Xf[]>(() => [{ p: [WX - 0.6, top, BAND.w.z0 + 0.45], ry: 0 }], [top]);
  const tv = useMemo<Xf[]>(() => [{ p: [WX, top + 0.31 * F, BAND.w.z0 + 0.42], ry: 0 }], [top]);
  const shelves = useMemo<Xf[]>(() => row(3, BAND.w.z0 + 1.6, BAND.w.z0 + 5.2, (z) => ({ p: [BAND.w.x0 + 0.2, top, z + 0.6 * F], ry: Math.PI / 2 })), [top]);
  const lamps = useMemo<Xf[]>(() => [{ p: [BAND.w.x0 + 0.6, top, BAND.w.z1 - 0.7] }, { p: [BAND.w.x1 - 0.6, top, BAND.w.z0 + 0.7] }], [top]);
  const plants = useMemo<Xf[]>(() => [{ p: [BAND.w.x1 - 0.7, top, BAND.w.z1 - 0.8] }, { p: [BAND.w.x0 + 0.7, top, 6.2] }], [top]);

  return (
    <group>
      <instancedMesh ref={cellRef} args={[undefined, undefined, cells.length]} frustumCulled={false}>
        <planeGeometry args={[0.44, 0.14]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={towerRef} args={[undefined, undefined, towerCells.length]} frustumCulled={false}>
        <boxGeometry args={[0.44, 0.13, 0.14]} />
        <meshStandardMaterial roughness={0.35} metalness={0.1} emissive="#8fa9e0" emissiveIntensity={0.35} />
      </instancedMesh>
      <lineSegments geometry={towerEdges}>
        <lineBasicMaterial color="#e6eeff" transparent opacity={0.55} depthWrite={false} />
      </lineSegments>

      <Placed src={KIT.furniture('tableCross')} at={tables} scale={F} />
      <Placed src={KIT.furniture('chairDesk')} at={chairs} scale={F} />
      <Placed src={KIT.furniture('laptop')} at={laptops} scale={F * 0.8} overrides={SCREEN_GLOW} />
      <Placed src={KIT.furniture('books')} at={papers} scale={F * 1.6} />
      <Placed src={KIT.furniture('cabinetTelevision')} at={tvStand} scale={F} />
      <Placed src={KIT.furniture('televisionModern')} at={tv} scale={F * 1.3} overrides={SCREEN_GLOW} />
      <Placed src={KIT.furniture('bookcaseClosedWide')} at={shelves} scale={F} />
      <Placed src={KIT.furniture('lampSquareFloor')} at={lamps} scale={F} overrides={LAMP_GLOW} />
      <Placed src={KIT.furniture('pottedPlant')} at={plants} scale={F} />

      <pointLight position={[0, y + 7, 0]} color="#cfdcff" intensity={30} distance={26} decay={2} />
      <pointLight position={[WX, y + 4.5, 0]} color="#ffe2b8" intensity={22} distance={12} decay={2} />
    </group>
  );
}
