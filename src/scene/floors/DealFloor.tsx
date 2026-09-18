import { useMemo } from 'react';
import * as THREE from 'three';
import { SLAB } from '../../story';
import { ringSpread, rng, useInstances } from '../util';

/** The deal's floor: the data room. Piles of documents tethered to a silhouette of the target. */
export function DealFloor({ y }: { y: number }) {
  const top = y + SLAB.t / 2;
  const piles = useMemo(() => {
    const r = rng(31);
    return Array.from({ length: 26 }, (_, i) => { const [x, z] = ringSpread(i, 26, r, 2.2, 2.6); return { x, z, n: 6 + Math.floor(r() * 26), rot: (r() - 0.5) * 0.9 }; });
  }, []);
  const sheets = useMemo(() => piles.flatMap((p, pi) => Array.from({ length: p.n }, (_, k) => ({ p, pi, k }))), [piles]);
  const sheetRef = useInstances(sheets.length, (i, o, _c, r) => {
    const { p, k } = sheets[i];
    o.position.set(p.x + (r() - 0.5) * 0.07, top + 0.014 + k * 0.03, p.z + (r() - 0.5) * 0.07);
    o.rotation.y = p.rot + (r() - 0.5) * 0.12;
  }, 37);

  // the target, seen from outside: a dark block with a few lit windows, on the far side of the ring
  const site = useMemo(() => new THREE.Vector3(0, top, -SLAB.h / 2 + 2.6), [top]);
  const silhouette = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.8, 3.8, 1.9)), []);
  const windows = useMemo(() => {
    const r = rng(41); const out: [number, number, number][] = [];
    for (let i = 0; i < 26; i++) {
      const side = r() < 0.7 ? 0 : 1;
      const wx = side === 0 ? -1.2 + r() * 2.4 : 1.42;
      const wz = side === 0 ? 0.97 : -0.8 + r() * 1.6;
      out.push([wx, 0.35 + r() * 3.1, wz]);
    }
    return out;
  }, []);
  const winRef = useInstances(windows.length, (i, o, c, r) => {
    const [wx, wy, wz] = windows[i];
    o.position.set(wx, wy, wz);
    if (wx > 1.7) o.rotation.y = Math.PI / 2;
    const b = 0.9 + r() * 1.3;
    c.setRGB(1.0 * b, 0.95 * b, 0.8 * b);
  }, 43);

  const tethers = useMemo(() => {
    const pts: number[] = [];
    const to = new THREE.Vector3(site.x, top + 1.9, site.z);
    for (const p of piles) pts.push(p.x, top + 0.03 * p.n + 0.05, p.z, to.x, to.y, to.z);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, [piles, site, top]);

  return (
    <group>
      <instancedMesh ref={sheetRef} args={[undefined, undefined, sheets.length]} frustumCulled={false}>
        <boxGeometry args={[1.25, 0.028, 0.92]} />
        <meshStandardMaterial color="#d8d1c4" roughness={0.9} metalness={0} />
      </instancedMesh>
      <group position={[site.x, top + 1.9, site.z]}>
        <lineSegments geometry={silhouette}>
          <lineBasicMaterial color="#95a4c4" transparent opacity={0.55} />
        </lineSegments>
        <mesh><boxGeometry args={[2.8, 3.8, 1.9]} /><meshStandardMaterial color="#0c1018" roughness={0.9} /></mesh>
        <instancedMesh ref={winRef} args={[undefined, undefined, windows.length]} position={[0, -1.9, 0]} frustumCulled={false}>
          <planeGeometry args={[0.22, 0.14]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      </group>
      <lineSegments geometry={tethers}>
        <lineBasicMaterial color="#9fb0d2" transparent opacity={0.16} depthWrite={false} />
      </lineSegments>
      <pointLight position={[0, y + 5.5, 0]} color="#e8eefa" intensity={30} distance={24} decay={2} />
    </group>
  );
}
