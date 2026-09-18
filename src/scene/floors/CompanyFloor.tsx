import { useMemo } from 'react';
import { Vector3 } from 'three';
import { SLAB } from '../../story';
import { ringSpread, rng, useInstances } from '../util';
import { Travellers, type Segment } from '../Travellers';

/** The company's floor: desks, screens, and the email that actually runs the place. */
export function CompanyFloor({ y }: { y: number }) {
  const top = y + SLAB.t / 2;
  const desks = useMemo(() => {
    const r = rng(53);
    const out: { x: number; z: number; rot: number }[] = [];
    // clusters of four
    for (let c = 0; c < 14; c++) {
      const [cx, cz] = ringSpread(c, 14, r, 3.4, 1.4);
      const rot = Math.floor(r() * 4) * (Math.PI / 2);
      for (let k = 0; k < 4; k++) {
        const dx = (k % 2 === 0 ? -0.8 : 0.8), dz = (k < 2 ? -0.5 : 0.5);
        const x = cx + dx * Math.cos(rot) - dz * Math.sin(rot), z = cz + dx * Math.sin(rot) + dz * Math.cos(rot);
        out.push({ x, z, rot });
      }
    }
    return out;
  }, []);
  const deskRef = useInstances(desks.length, (i, o) => { const d = desks[i]; o.position.set(d.x, top + 0.36, d.z); o.rotation.y = d.rot; }, 59);
  const screenPos = useMemo(() => desks.map((d) => new Vector3(d.x, top + 0.98, d.z)), [desks, top]);
  const screenRef = useInstances(desks.length, (i, o, c, r) => {
    const d = desks[i];
    o.position.copy(screenPos[i]);
    o.rotation.y = d.rot + (r() - 0.5) * 0.5;
    const b = 1.1 + r() * 0.9;
    c.setRGB(0.85 * b, 0.95 * b, 1.0 * b);
  }, 61);

  // cabinets and paper along the walls
  const cabinets = useMemo(() => { const r = rng(67); return Array.from({ length: 16 }, (_, i) => { const [x, z] = ringSpread(i, 16, r, 1.1, 1.2); return { x, z, h: 0.9 + r() * 1.2, rot: r() * Math.PI }; }); }, []);
  const cabRef = useInstances(cabinets.length, (i, o) => { const c = cabinets[i]; o.position.set(c.x, top + c.h / 2, c.z); o.scale.set(1, c.h, 1); o.rotation.y = c.rot; }, 71);

  const threads = useMemo<Segment[]>(() => {
    const r = rng(73); const out: Segment[] = [];
    for (let i = 0; i < 90; i++) {
      const a = screenPos[Math.floor(r() * screenPos.length)], b = screenPos[Math.floor(r() * screenPos.length)];
      if (a === b) continue;
      out.push([a.clone().add(new Vector3(0, 0.25, 0)), b.clone().add(new Vector3(0, 0.25, 0))]);
    }
    return out;
  }, [screenPos]);

  return (
    <group>
      <instancedMesh ref={deskRef} args={[undefined, undefined, desks.length]} frustumCulled={false}>
        <boxGeometry args={[1.4, 0.72, 0.7]} />
        <meshStandardMaterial color="#232a38" roughness={0.75} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={screenRef} args={[undefined, undefined, desks.length]} frustumCulled={false}>
        <planeGeometry args={[0.52, 0.3]} />
        <meshBasicMaterial toneMapped={false} side={2} />
      </instancedMesh>
      <instancedMesh ref={cabRef} args={[undefined, undefined, cabinets.length]} frustumCulled={false}>
        <boxGeometry args={[0.8, 1, 0.5]} />
        <meshStandardMaterial color="#2b2f3a" roughness={0.85} />
      </instancedMesh>
      <Travellers segments={threads} perSegment={3} speed={[0.08, 0.22]} color={[1.7, 1.9, 2.3]} size={0.24} seed={79} />
      <pointLight position={[0, y + 5.5, 0]} color="#e9eef8" intensity={26} distance={24} decay={2} />
    </group>
  );
}
