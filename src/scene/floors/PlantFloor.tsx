import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SLAB } from '../../story';
import { glowTexture, ringSpread, rng, useInstances } from '../util';

/** The floor: machines, carts, orders hanging on paper, work lights, and the sparks of something being made. */
export function PlantFloor({ y, reduce }: { y: number; reduce: boolean }) {
  const top = y + SLAB.t / 2;
  const machines = useMemo(() => {
    const r = rng(83);
    const sizes: [number, number, number][] = [[3.2, 2.2, 2.0], [2.4, 3.0, 2.4], [3.8, 1.8, 1.6], [2.0, 2.6, 2.0], [2.8, 2.0, 3.0], [1.6, 3.3, 1.6], [3.4, 2.4, 2.2], [2.2, 1.6, 2.2]];
    return sizes.map((s, i) => { const [x, z] = ringSpread(i, sizes.length, r, 3.0, 1.6); return { x, z, s, rot: (r() - 0.5) * 0.3 }; });
  }, []);
  const machRef = useInstances(machines.length, (i, o) => { const m = machines[i]; o.position.set(m.x, top + m.s[1] / 2, m.z); o.scale.set(...m.s); o.rotation.y = m.rot; }, 89);
  const tanks = useMemo(() => { const r = rng(97); return Array.from({ length: 3 }, (_, i) => { const [x, z] = ringSpread(i + 0.5, 3, r, 2.6, 1.2); return { x, z }; }); }, []);
  const tankRef = useInstances(tanks.length, (i, o) => { const t = tanks[i]; o.position.set(t.x, top + 1.6, t.z); }, 101);

  const carts = useMemo(() => { const r = rng(103); return Array.from({ length: 12 }, (_, i) => { const [x, z] = ringSpread(i + 0.3, 12, r, 1.6, 2.0); return { x, z, rot: r() * Math.PI }; }); }, []);
  const cartLines = useMemo(() => {
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, 1.3, 1.0));
    const pts: number[] = [];
    const src = edges.attributes.position.array as Float32Array;
    const m = new THREE.Matrix4(), v = new THREE.Vector3();
    for (const c of carts) {
      m.makeRotationY(c.rot).setPosition(c.x, top + 0.75, c.z);
      for (let i = 0; i < src.length; i += 3) { v.set(src[i], src[i + 1], src[i + 2]).applyMatrix4(m); pts.push(v.x, v.y, v.z); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, [carts, top]);

  // orders hanging on paper
  const sheets = useMemo(() => { const r = rng(107); return Array.from({ length: 28 }, (_, i) => { const [x, z] = ringSpread(i, 28, r, 2.0, 2.4); return { x, z, rot: r() * Math.PI, ph: r() * 6.28 }; }); }, []);
  const sheetRef = useInstances(sheets.length, (i, o) => { const s = sheets[i]; o.position.set(s.x, top + 2.1, s.z); o.rotation.y = s.rot; }, 109);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((st) => {
    if (reduce) return;
    const m = sheetRef.current; if (!m) return;
    const t = st.clock.elapsedTime;
    for (let i = 0; i < sheets.length; i++) {
      const s = sheets[i];
      dummy.position.set(s.x, top + 2.1, s.z);
      dummy.rotation.set(0, s.rot, Math.sin(t * 0.9 + s.ph) * 0.08);
      dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  const lamps: [number, number, number][] = useMemo(() => [[-8.5, top + 3.4, 5.2], [8.2, top + 3.4, -5.4], [-1.5, top + 3.6, -7.2], [7.6, top + 3.2, 5.6]], [top]);
  const lampRef = useInstances(lamps.length, (i, o, c) => { o.position.set(...lamps[i]); o.rotation.x = Math.PI / 2; c.setRGB(2.6, 1.9, 1.1); }, 113);

  return (
    <group>
      <instancedMesh ref={machRef} args={[undefined, undefined, machines.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2c2723" roughness={0.6} metalness={0.35} />
      </instancedMesh>
      <instancedMesh ref={tankRef} args={[undefined, undefined, tanks.length]} frustumCulled={false}>
        <cylinderGeometry args={[1.0, 1.0, 3.2, 20]} />
        <meshStandardMaterial color="#332c26" roughness={0.5} metalness={0.4} />
      </instancedMesh>
      <lineSegments geometry={cartLines}>
        <lineBasicMaterial color="#e0aa6a" transparent opacity={0.55} depthWrite={false} />
      </lineSegments>
      <instancedMesh ref={sheetRef} args={[undefined, undefined, sheets.length]} frustumCulled={false}>
        <planeGeometry args={[0.5, 0.72]} />
        <meshStandardMaterial color="#dccfb8" roughness={1} side={2} />
      </instancedMesh>
      <instancedMesh ref={lampRef} args={[undefined, undefined, lamps.length]} frustumCulled={false}>
        <planeGeometry args={[0.9, 0.26]} />
        <meshBasicMaterial toneMapped={false} side={2} />
      </instancedMesh>
      {lamps.map((l, i) => <pointLight key={i} position={[l[0], l[1] - 0.3, l[2]]} color="#ffb35c" intensity={52} distance={17} decay={2} />)}
      <Sparks origin={[machines[1].x, top + 1.3, machines[1].z]} count={reduce ? 0 : 220} />
    </group>
  );
}

function Sparks({ origin, count }: { origin: [number, number, number]; count: number }) {
  const st = useMemo(() => {
    const r = rng(127);
    const pos = new Float32Array(Math.max(1, count) * 3), vel = new Float32Array(Math.max(1, count) * 3), life = new Float32Array(Math.max(1, count));
    for (let i = 0; i < count; i++) life[i] = r() * 1.2;
    return { pos, vel, life, r };
  }, [count]);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(st.pos, 3)); return g; }, [st]);
  const mat = useMemo(() => new THREE.PointsMaterial({ size: 0.09, map: glowTexture(), color: new THREE.Color(2.6, 1.7, 0.7), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), []);
  const ref = useRef<THREE.Points>(null!);
  useFrame((_, dtRaw) => {
    if (!count) return;
    const dt = Math.min(dtRaw, 0.05);
    const { pos, vel, life, r } = st;
    for (let i = 0; i < count; i++) {
      life[i] -= dt;
      if (life[i] <= 0) {
        life[i] = 0.5 + r() * 0.9;
        pos[i * 3] = origin[0]; pos[i * 3 + 1] = origin[1]; pos[i * 3 + 2] = origin[2];
        const a = r() * Math.PI * 2, s = 1.5 + r() * 2.5;
        vel[i * 3] = Math.cos(a) * s * 0.6; vel[i * 3 + 1] = 2.5 + r() * 3.5; vel[i * 3 + 2] = Math.sin(a) * s * 0.6;
      }
      vel[i * 3 + 1] -= 9.8 * dt;
      pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
    }
    geo.attributes.position.needsUpdate = true;
  });
  if (!count) return null;
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}
