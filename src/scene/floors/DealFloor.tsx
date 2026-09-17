import { useMemo } from 'react';
import * as THREE from 'three';
import { SLAB } from '../../story';
import { rng } from '../util';
import { CITY_NIGHT, KIT, LAMP_GLOW, Placed, SCREEN_GLOW, type Xf } from '../kit';
import { BAND, EX, NZ, SZ, WX, row } from '../layout';

const F = 1.5;
const TABLE_H = 0.33 * F;

/** The deal's floor: the data room. Tables of boxes and binders, and a scale model of the target on a plinth. */
export function DealFloor({ y }: { y: number }) {
  const top = y + SLAB.t / 2;
  const r = useMemo(() => rng(31), []);

  // two rows of tables on each long band
  const tables = useMemo<Xf[]>(() => [
    ...row(12, -11.2, 11.2, (x) => ({ p: [x - 0.42 * F, top, NZ - 1.1 + 0.34], ry: 0 })),
    ...row(12, -11.2, 11.2, (x) => ({ p: [x - 0.42 * F, top, NZ + 1.1 + 0.34], ry: 0 })),
    ...row(12, -11.2, 11.2, (x) => ({ p: [x - 0.42 * F, top, SZ - 1.1 + 0.34], ry: 0 })),
    ...row(12, -11.2, 11.2, (x) => ({ p: [x - 0.42 * F, top, SZ + 1.1 + 0.34], ry: 0 })),
  ], [top]);
  const tableCentres = useMemo(() => tables.map((t) => [t.p[0] + 0.42 * F, t.p[2] - 0.34] as [number, number]), [tables]);

  // boxes stacked on most tables, binders on the rest, a few screens
  const boxes = useMemo<Xf[]>(() => {
    const out: Xf[] = [];
    tableCentres.forEach(([x, z], i) => {
      if (i % 7 === 3) return;
      const n = 1 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) out.push({ p: [x - 0.16 * F + (r() - 0.5) * 0.15, top + TABLE_H + k * 0.28 * F, z + 0.1 * F + (r() - 0.5) * 0.15], ry: (r() - 0.5) * 0.5 });
      if (r() < 0.4) out.push({ p: [x + 0.28 * F, top + TABLE_H, z + 0.12 * F], ry: (r() - 0.5) * 0.6 });
    });
    return out;
  }, [tableCentres, top, r]);
  const openBoxes = useMemo<Xf[]>(() => tableCentres.filter((_, i) => i % 5 === 2).map(([x, z]) => ({ p: [x + 0.2 * F, top + TABLE_H, z], ry: (r() - 0.5) * 0.8 })), [tableCentres, top, r]);
  const binders = useMemo<Xf[]>(() => tableCentres.filter((_, i) => i % 7 === 3).flatMap(([x, z]) => [
    { p: [x - 0.25 * F, top + TABLE_H, z], ry: r() * 6.28 }, { p: [x + 0.15 * F, top + TABLE_H, z + 0.1], ry: r() * 6.28 },
  ]), [tableCentres, top, r]);
  const screens = useMemo<Xf[]>(() => tableCentres.filter((_, i) => i % 11 === 5).map(([x, z]) => ({ p: [x - 0.2 * F, top + TABLE_H, z + 0.05], ry: z > 0 ? Math.PI : 0 })), [tableCentres, top]);
  const chairs = useMemo<Xf[]>(() => tableCentres.filter((_, i) => i % 3 !== 1).map(([x, z]) => ({ p: [x, top, z + (z > 0 ? 0.75 : -0.75)], ry: z > 0 ? Math.PI : 0 })), [tableCentres, top]);
  const lamps = useMemo<Xf[]>(() => tableCentres.filter((_, i) => i % 9 === 4).map(([x, z]) => ({ p: [x + 0.3 * F, top + TABLE_H, z - 0.15 * F] })), [tableCentres, top]);

  // shelves of binders along the west band, floor boxes waiting to be read
  const shelves = useMemo<Xf[]>(() => row(9, BAND.w.z0 + 0.8, BAND.w.z1 - 0.8, (z) => ({ p: [BAND.w.x0 + 0.2, top, z + 0.3 * F], ry: Math.PI / 2 })), [top]);
  const floorBoxes = useMemo<Xf[]>(() => {
    const out: Xf[] = [];
    for (let i = 0; i < 26; i++) { const z = BAND.w.z0 + 0.8 + r() * (BAND.w.z1 - BAND.w.z0 - 1.6); const x = WX + 0.4 + r() * 2.2; const n = 1 + Math.floor(r() * 3); for (let k = 0; k < n; k++) out.push({ p: [x, top + k * 0.28 * F, z], ry: (r() - 0.5) * 0.8 }); }
    return out;
  }, [top, r]);
  const coat = useMemo<Xf[]>(() => [{ p: [BAND.w.x1 - 0.5, top, BAND.w.z1 - 0.6] }], [top]);

  // the target, as an architectural model on a plinth in the east band
  const plinth = useMemo<Xf[]>(() => [{ p: [EX - 1.0, top, 0.8], ry: Math.PI / 2 }], [top]);
  const modelPos = useMemo(() => new THREE.Vector3(EX, top + 0.83 * F, 0), [top]);
  const model = useMemo<Xf[]>(() => [{ p: [modelPos.x, modelPos.y, modelPos.z], ry: 0.4 }], [modelPos]);
  const tethers = useMemo(() => {
    const pts: number[] = [];
    const to = modelPos.clone().add(new THREE.Vector3(0, 3.4, 0));
    tableCentres.filter((_, i) => i % 4 === 0).forEach(([x, z]) => pts.push(x, top + TABLE_H + 0.5, z, to.x, to.y, to.z));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, [tableCentres, modelPos, top]);
  const eastChairs = useMemo<Xf[]>(() => [{ p: [EX - 2.4, top, -1.4], ry: 1.2 }, { p: [EX + 2.3, top, -1.6], ry: -1.0 }, { p: [EX - 2.2, top, 2.6], ry: 2.1 }], [top]);
  const eastPlants = useMemo<Xf[]>(() => [{ p: [BAND.e.x1 - 0.7, top, BAND.e.z0 + 0.8] }, { p: [BAND.e.x1 - 0.7, top, BAND.e.z1 - 0.8] }], [top]);

  return (
    <group>
      <Placed src={KIT.furniture('table')} at={tables} scale={F} />
      <Placed src={KIT.furniture('cardboardBoxClosed')} at={boxes} scale={F} />
      <Placed src={KIT.furniture('cardboardBoxOpen')} at={openBoxes} scale={F} />
      <Placed src={KIT.furniture('books')} at={binders} scale={F * 1.8} />
      <Placed src={KIT.furniture('computerScreen')} at={screens} scale={F} overrides={SCREEN_GLOW} />
      <Placed src={KIT.furniture('chairDesk')} at={chairs} scale={F} />
      <Placed src={KIT.furniture('lampSquareTable')} at={lamps} scale={F} overrides={LAMP_GLOW} />
      <Placed src={KIT.furniture('bookcaseOpen')} at={shelves} scale={F} />
      <Placed src={KIT.furniture('cardboardBoxClosed')} at={floorBoxes} scale={F} />
      <Placed src={KIT.furniture('coatRackStanding')} at={coat} scale={F} />
      <Placed src={KIT.furniture('tableCross')} at={plinth} scale={F} />
      <Placed src={KIT.commercial('building-skyscraper-a')} at={model} scale={1.15} overrides={CITY_NIGHT} />
      <Placed src={KIT.furniture('chairDesk')} at={eastChairs} scale={F} />
      <Placed src={KIT.furniture('pottedPlant')} at={eastPlants} scale={F} />
      <lineSegments geometry={tethers}>
        <lineBasicMaterial color="#b9c6e2" transparent opacity={0.22} depthWrite={false} />
      </lineSegments>
      <pointLight position={[0, y + 5.5, 0]} color="#f5ecd8" intensity={30} distance={26} decay={2} />
      <spotLight position={[EX + 2, y + 6, 3]} target-position={[EX, top + 2, 0]} angle={0.5} penumbra={0.6} color="#dfe9ff" intensity={140} distance={14} decay={2} />
      {lamps.map((l, i) => <pointLight key={i} position={[l.p[0], l.p[1] + 0.5, l.p[2]]} color="#ffd9a0" intensity={4} distance={4} decay={2} />)}
    </group>
  );
}
