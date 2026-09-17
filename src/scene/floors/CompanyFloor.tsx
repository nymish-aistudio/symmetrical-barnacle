import { useMemo } from 'react';
import { Vector3 } from 'three';
import { SLAB } from '../../story';
import { rng } from '../util';
import { KIT, LAMP_GLOW, Placed, SCREEN_GLOW, type Xf } from '../kit';
import { BAND, NZ, SZ, WX, EX, row } from '../layout';
import { Travellers, type Segment } from '../Travellers';

const F = 1.5; // furniture scale: the kits are 1 unit ≈ 1 m; the building reads best a little larger than life
const DESK_H = 0.38 * F;

/** The company's floor: an open-plan office that runs on email. */
export function CompanyFloor({ y }: { y: number }) {
  const top = y + SLAB.t / 2;
  const r = useMemo(() => rng(53), []);

  // clusters of four desks on the long bands, facing each other across the band
  const clusters = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (const cz of [NZ, SZ]) for (let k = 0; k < 6; k++) out.push({ x: -10.4 + k * 4.16, z: cz });
    return out;
  }, []);
  const desks = useMemo<Xf[]>(() => clusters.flatMap((c) => [
    { p: [c.x - 0.62 * F, top, c.z - 0.55 * F], ry: 0 }, { p: [c.x + 0.62 * F, top, c.z - 0.55 * F], ry: 0 },
    { p: [c.x - 0.62 * F, top, c.z + 0.55 * F], ry: Math.PI }, { p: [c.x + 0.62 * F, top, c.z + 0.55 * F], ry: Math.PI },
  ]), [clusters, top]);
  // the desk model's origin sits at its left-front; shift copies so the group is centred
  const deskAt = useMemo<Xf[]>(() => desks.map((d) => ({ p: [d.p[0] - 0.36 * F * (d.ry ? -1 : 1), d.p[1], d.p[2] + 0.1 * F * (d.ry ? -1 : 1)], ry: d.ry })), [desks]);
  const screens = useMemo<Xf[]>(() => desks.map((d) => ({ p: [d.p[0] - 0.19 * F * (d.ry ? -1 : 1), top + DESK_H, d.p[2] + (d.ry ? 0.06 : -0.06) * F], ry: d.ry })), [desks, top]);
  const keyboards = useMemo<Xf[]>(() => desks.map((d) => ({ p: [d.p[0] - 0.14 * F * (d.ry ? -1 : 1), top + DESK_H, d.p[2] + (d.ry ? -0.16 : 0.16) * F], ry: d.ry })), [desks, top]);
  const chairs = useMemo<Xf[]>(() => desks.map((d) => ({ p: [d.p[0], top, d.p[2] + (d.ry ? -0.62 : 0.62) * F], ry: d.ry ? 0 : Math.PI })), [desks, top]);
  const paper = useMemo<Xf[]>(() => desks.filter(() => r() < 0.45).map((d) => ({ p: [d.p[0] + 0.28 * F, top + DESK_H, d.p[2] + (r() - 0.5) * 0.2], ry: r() * 6.28 })), [desks, top, r]);

  // the west band: filing and shelves; the east band: kitchen and lounge
  const bookcases = useMemo<Xf[]>(() => row(6, BAND.w.z0 + 1.2, BAND.w.z1 - 1.2, (z) => ({ p: [BAND.w.x0 + 0.2, top, z + 0.6 * F], ry: Math.PI / 2 })), [top]);
  const filing = useMemo<Xf[]>(() => row(5, BAND.w.z0 + 2, BAND.w.z1 - 2, (z) => ({ p: [WX + 1.2, top, z], ry: -Math.PI / 2 })), [top]);
  const kitchen = useMemo<Xf[]>(() => row(3, EX - 0.9, EX + 1.1, (x) => ({ p: [x, top, BAND.e.z1 - 0.3], ry: Math.PI })), [top]);
  const lounge = useMemo(() => ({
    sofa: [{ p: [EX - 0.8, top, BAND.e.z0 + 1.2], ry: 0 }] as Xf[],
    chairs: [{ p: [EX + 1.6, top, BAND.e.z0 + 1.0], ry: -0.5 }, { p: [EX - 2.2, top, BAND.e.z0 + 2.4], ry: 1.2 }] as Xf[],
  }), [top]);
  const plants = useMemo<Xf[]>(() => [
    { p: [BAND.w.x0 + 0.8, top, BAND.w.z0 + 0.8] }, { p: [BAND.e.x1 - 0.8, top, BAND.e.z0 + 0.7] }, { p: [BAND.w.x0 + 0.8, top, BAND.w.z1 - 0.8] },
    { p: [-2.3, top, BAND.n.z1 - 0.6] }, { p: [6.1, top, BAND.s.z0 + 0.6] }, { p: [EX + 2.4, top, 1.5] },
  ], [top]);
  const smallPlants = useMemo<Xf[]>(() => desks.filter((_, i) => i % 5 === 0).map((d) => ({ p: [d.p[0] - 0.3 * F * (d.ry ? -1 : 1), top + DESK_H, d.p[2] + (d.ry ? 0.16 : -0.16) * F] })), [desks, top]);
  const lamps = useMemo<Xf[]>(() => [
    { p: [BAND.w.x0 + 0.5, top, 0] }, { p: [BAND.e.x1 - 0.5, top, -1.5] }, { p: [-12.2, top, BAND.n.z1 - 0.5] }, { p: [12.2, top, BAND.s.z0 + 0.5] },
  ], [top]);
  const bins = useMemo<Xf[]>(() => clusters.filter((_, i) => i % 2 === 1).map((c) => ({ p: [c.x + 1.75 * F, top, c.z + 0.9 * (c.z > 0 ? 1 : -1)] })), [clusters, top]);
  const tv = useMemo<Xf[]>(() => [{ p: [WX, top + 0.31 * F, BAND.w.z1 - 0.35], ry: Math.PI }], [top]);
  const tvStand = useMemo<Xf[]>(() => [{ p: [WX - 0.4 * F, top, BAND.w.z1 - 0.2], ry: 0 }], [top]);

  // email between screens
  const screenPos = useMemo(() => screens.map((s) => new Vector3(s.p[0], s.p[1] + 0.3, s.p[2])), [screens]);
  const threads = useMemo<Segment[]>(() => {
    const rr = rng(73); const out: Segment[] = [];
    for (let i = 0; i < 90; i++) {
      const a = screenPos[Math.floor(rr() * screenPos.length)], b = screenPos[Math.floor(rr() * screenPos.length)];
      if (a === b) continue;
      out.push([a.clone().add(new Vector3(0, 0.2, 0)), b.clone().add(new Vector3(0, 0.2, 0))]);
    }
    return out;
  }, [screenPos]);

  return (
    <group>
      <Placed src={KIT.furniture('desk')} at={deskAt} scale={F} />
      <Placed src={KIT.furniture('computerScreen')} at={screens} scale={F} overrides={SCREEN_GLOW} />
      <Placed src={KIT.furniture('computerKeyboard')} at={keyboards} scale={F} />
      <Placed src={KIT.furniture('chairDesk')} at={chairs} scale={F} />
      <Placed src={KIT.furniture('books')} at={paper} scale={F * 1.6} />
      <Placed src={KIT.furniture('bookcaseClosedWide')} at={bookcases} scale={F} />
      <Placed src={KIT.furniture('cabinetTelevision')} at={filing} scale={F} />
      <Placed src={KIT.furniture('kitchenCabinet')} at={kitchen} scale={F} />
      <Placed src={KIT.furniture('kitchenCoffeeMachine')} at={[{ p: [kitchen[1].p[0] - 0.1, top + 0.45 * F, kitchen[1].p[2] - 0.3], ry: Math.PI }]} scale={F} />
      <Placed src={KIT.furniture('kitchenFridgeSmall')} at={[{ p: [EX + 2.2, top, BAND.e.z1 - 0.35], ry: Math.PI }]} scale={F} />
      <Placed src={KIT.furniture('loungeSofa')} at={lounge.sofa} scale={F} />
      <Placed src={KIT.furniture('loungeChair')} at={lounge.chairs} scale={F} />
      <Placed src={KIT.furniture('pottedPlant')} at={plants} scale={F} />
      <Placed src={KIT.furniture('plantSmall2')} at={smallPlants} scale={F} />
      <Placed src={KIT.furniture('lampSquareFloor')} at={lamps} scale={F} overrides={LAMP_GLOW} />
      <Placed src={KIT.furniture('trashcan')} at={bins} scale={F * 0.7} />
      <Placed src={KIT.furniture('cabinetTelevision')} at={tvStand} scale={F} />
      <Placed src={KIT.furniture('televisionModern')} at={tv} scale={F} overrides={SCREEN_GLOW} />
      <Travellers segments={threads} perSegment={3} speed={[0.08, 0.22]} color={[1.7, 1.9, 2.3]} size={0.22} seed={79} />
      <pointLight position={[0, y + 5.5, 0]} color="#c9e4ff" intensity={34} distance={26} decay={2} />
      {lamps.map((l, i) => <pointLight key={i} position={[l.p[0], l.p[1] + 1.3, l.p[2]]} color="#ffd9a0" intensity={7} distance={7} decay={2} />)}
    </group>
  );
}
