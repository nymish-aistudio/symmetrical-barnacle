import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SLAB } from '../../story';
import { glowTexture, rng } from '../util';
import { FACTORY_SCREEN, KIT, Model, Placed, type Xf } from '../kit';
import { BAND, EX, NZ, SZ, WX, row } from '../layout';

const K = 1.5; // factory kit scale

/** The floor: a conveyor line with robot arms, machines, pipes, pallets, a crane, and a loader that never stops. */
export function PlantFloor({ y, reduce }: { y: number; reduce: boolean }) {
  const top = y + SLAB.t / 2;
  const r = useMemo(() => rng(83), []);

  // the conveyor along the north band
  const CONV_Y = top + 0.4 * K;
  const conveyor = useMemo<Xf[]>(() => row(7, -9, 9, (x) => ({ p: [x, top, NZ], ry: 0 })), [top]);
  const endMachines = useMemo<Xf[]>(() => [{ p: [-11.4, top, NZ], ry: Math.PI / 2 }, { p: [11.4, top, NZ], ry: -Math.PI / 2 }], [top]);
  const cones = useMemo<Xf[]>(() => [{ p: [-6, top, NZ + 1.9] }, { p: [6.5, top, NZ + 1.9] }, { p: [-2, top, SZ - 1.9] }, { p: [9.8, top, -2] }, { p: [WX + 2.2, top, -6.6] }], [top]);
  const screens = useMemo<Xf[]>(() => [{ p: [-4.2, top, BAND.n.z1 - 0.4], ry: Math.PI }, { p: [4.8, top, BAND.n.z1 - 0.4], ry: Math.PI }], [top]);

  // boxes ride the belt
  const N_BOX = 9;
  const beltBoxes = useMemo<Xf[]>(() => Array.from({ length: N_BOX }, (_, i) => ({ p: [-9 + (i / N_BOX) * 18, CONV_Y, NZ], ry: 0 })), [CONV_Y]);
  const beltAnim = useMemo(() => (i: number, t: number, xf: Xf) => {
    const speed = reduce ? 0 : 1.1;
    let x = -9 + ((i / N_BOX) * 18 + t * speed) % 18; if (x < -9) x += 18;
    xf.p[0] = x;
  }, [reduce]);

  // machines along the south band, pipes behind them
  const machines = useMemo<Xf[]>(() => [{ p: [-9.5, top, SZ], ry: 0 }, { p: [-2.5, top, SZ], ry: 0 }, { p: [6.5, top, SZ], ry: 0 }], [top]);
  const windowed = useMemo<Xf[]>(() => [{ p: [-6, top, SZ], ry: 0 }, { p: [2, top, SZ], ry: 0 }], [top]);
  const fortified = useMemo<Xf[]>(() => [{ p: [10.2, top, SZ], ry: 0 }], [top]);
  const pipes = useMemo<Xf[]>(() => row(7, -10.5, 10.5, (x, i) => ({ p: [x, top + 1.9, BAND.s.z0 + 0.6], ry: 0, s: i === 3 ? 0 : 1 })), [top]);
  const valve = useMemo<Xf[]>(() => [{ p: [0, top + 1.9, BAND.s.z0 + 0.6], ry: 0 }], [top]);
  const hoppers = useMemo(() => ({ round: [{ p: [-11.6, top, SZ + 0.4] }] as Xf[], square: [{ p: [12.0, top, -1.5] }] as Xf[] }), [top]);

  // west band: catwalk and stairs, a wall of turning cogs
  const catwalk = useMemo<Xf[]>(() => row(4, -3.2, 2.5, (z) => ({ p: [WX + 0.6, top + 1.2, z], ry: Math.PI / 2 })), [top]);
  const stairs = useMemo<Xf[]>(() => [{ p: [WX + 0.6, top, 4.9], ry: -Math.PI / 2 }], [top]);
  const cogs = useMemo<Xf[]>(() => [{ p: [BAND.w.x0 + 0.3, top + 1.4, -6.2], rx: 0, ry: 0, rz: Math.PI / 2 }, { p: [BAND.w.x0 + 0.3, top + 2.6, -5.1], rx: 0, ry: 0, rz: Math.PI / 2 }, { p: [BAND.w.x0 + 0.3, top + 1.5, -4.0], rx: 0, ry: 0, rz: Math.PI / 2 }], [top]);
  const cogAnim = useMemo(() => (i: number, t: number, xf: Xf) => { xf.ry = (reduce ? 0 : t * (i % 2 ? -0.9 : 0.9)) + i; }, [reduce]);

  // east band: pallets, the crane, a parked truck and the loading door
  const pallets = useMemo<Xf[]>(() => {
    const out: Xf[] = [];
    for (let i = 0; i < 9; i++) { const x = EX - 1.6 + (i % 3) * 1.55, z = 4.6 + Math.floor(i / 3) * 1.4; const n = 1 + Math.floor(r() * 3); for (let k = 0; k < n; k++) out.push({ p: [x, top + k * 0.55 * K, z], ry: (r() - 0.5) * 0.2 }); }
    return out;
  }, [top, r]);
  const longBoxes = useMemo<Xf[]>(() => [{ p: [EX + 1.2, top, -6.3], ry: 0.2 }, { p: [EX + 1.2, top + 0.55 * K, -6.3], ry: -0.1 }, { p: [EX - 0.6, top, -6.6], ry: 1.4 }], [top]);
  const door = useMemo<Xf[]>(() => [{ p: [BAND.e.x1 + 0.1, top, -1.5], ry: -Math.PI / 2 }], [top]);

  const armRef = useRef<THREE.Object3D[]>([]);
  const arm = (root: THREE.Object3D, t: number, phase: number) => {
    if (reduce) return;
    const b = root.getObjectByName('element-b'), c = root.getObjectByName('element-c'), d = root.getObjectByName('element-d');
    if (b) b.rotation.y = Math.sin(t * 0.9 + phase) * 0.7;
    if (c) c.rotation.z = -0.5 + Math.sin(t * 1.3 + phase) * 0.35;
    if (d) d.rotation.z = 0.4 + Math.cos(t * 1.7 + phase) * 0.35;
  };
  const craneArm = (root: THREE.Object3D, t: number) => {
    const a = root.getObjectByName('arm'); if (a) a.rotation.y = reduce ? 0.6 : Math.sin(t * 0.25) * 0.9;
  };
  const loader = useMemo(() => ({ path: [[EX - 1.5, -3.5], [EX - 1.5, 2.6], [8.0, 2.6], [8.0, -3.5]] as [number, number][], len: 0 }), []);
  loader.len = loader.path.reduce((acc, p, i) => { const q = loader.path[(i + 1) % 4]; return acc + Math.hypot(q[0] - p[0], q[1] - p[1]); }, 0);
  const driveLoop = (root: THREE.Object3D, t: number, speed: number, path: [number, number][], len: number, yy: number) => {
    let d = ((reduce ? 0 : t * speed) % len + len) % len;
    for (let i = 0; i < path.length; i++) {
      const p = path[i], q = path[(i + 1) % path.length]; const seg = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d <= seg) { const u = d / seg; root.position.set(p[0] + (q[0] - p[0]) * u, yy, p[1] + (q[1] - p[1]) * u); root.rotation.y = Math.atan2(q[0] - p[0], q[1] - p[1]); break; }
      d -= seg;
    }
    root.traverse((o) => { if (o.name.startsWith('wheel')) o.rotation.x += (reduce ? 0 : speed * 0.05); });
  };

  const lamps: [number, number, number][] = useMemo(() => [[-8.5, top + 3.6, 5.6], [8.2, top + 3.6, -5.8], [-1.5, top + 3.8, -7.4], [7.6, top + 3.4, 6.0], [WX, top + 4.2, 0]], [top]);

  return (
    <group>
      <Placed src={KIT.factory('conveyor-long')} at={conveyor} scale={K} />
      <Placed src={KIT.factory('box-small')} at={beltBoxes} scale={K * 0.8} animate={beltAnim} />
      <Placed src={KIT.factory('machine-window')} at={endMachines} scale={K} />
      <Placed src={KIT.factory('warning-orange')} at={cones} scale={K * 0.8} />
      <Placed src={KIT.factory('screen-panel-wide')} at={screens} scale={K} overrides={FACTORY_SCREEN} />
      <Placed src={KIT.factory('machine')} at={machines} scale={K} />
      <Placed src={KIT.factory('machine-window')} at={windowed} scale={K} />
      <Placed src={KIT.factory('machine-fortified')} at={fortified} scale={K} />
      <Placed src={KIT.factory('pipe-large-long')} at={pipes} scale={K} />
      <Placed src={KIT.factory('pipe-large-valve')} at={valve} scale={K} />
      <Placed src={KIT.factory('hopper-round')} at={hoppers.round} scale={K} />
      <Placed src={KIT.factory('hopper-square')} at={hoppers.square} scale={K} />
      <Placed src={KIT.factory('catwalk-straight')} at={catwalk} scale={K} />
      <Placed src={KIT.factory('catwalk-stairs')} at={stairs} scale={K} />
      <Placed src={KIT.factory('cog-a')} at={cogs} scale={K} animate={cogAnim} />
      <Placed src={KIT.factory('box-large')} at={pallets} scale={K} />
      <Placed src={KIT.factory('box-long')} at={longBoxes} scale={K} />
      <Placed src={KIT.factory('structure-doorway-wide')} at={door} scale={K} />

      <Model src={KIT.factory('robot-arm-a')} position={[-3.2, top, NZ + 1.65]} rotation={[0, Math.PI, 0]} scale={K} onFrame={(o, t) => { armRef.current[0] = o; arm(o, t, 0); }} />
      <Model src={KIT.factory('robot-arm-a')} position={[3.6, top, NZ + 1.65]} rotation={[0, Math.PI, 0]} scale={K} onFrame={(o, t) => { armRef.current[1] = o; arm(o, t, 2.1); }} />
      <Model src={KIT.factory('crane')} position={[EX, top, -0.5]} rotation={[0, 0, 0]} scale={K * 0.9} onFrame={craneArm} />
      <Model src={KIT.cars('tractor-shovel')} position={[EX - 1.5, top + 0.68 * 0.9, -3.5]} scale={0.9} onFrame={(o, t) => driveLoop(o, t, 1.6, loader.path, loader.len, top + 0.68 * 0.9)} />
      <Model src={KIT.cars('truck-flat')} position={[EX + 1.3, top + 0.3 * 0.9, 2.6]} rotation={[0, Math.PI / 2, 0]} scale={0.9} />

      {lamps.map((l, i) => <pointLight key={i} position={l} color="#ffb35c" intensity={48} distance={16} decay={2} />)}
      <Sparks origin={[-6, top + 1.5 * K, SZ + 0.6]} count={reduce ? 0 : 200} />
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
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}
