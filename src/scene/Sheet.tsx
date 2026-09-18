import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { SHEET_Y } from '../story';
import { chapterLocal } from '../scroll/progress';
import { clamp01, glowTexture, rng, smoothstep, useInstances } from './util';

const INK = '#2a2723', INK2 = '#6b655c';
const FONT = '/fonts/HostGrotesk.ttf';

/** field highlights on the sheet, in sheet-local x/y: [x, y, w, h] */
const FIELDS: [number, number, number, number][] = [
  [2.55, 4.55, 1.9, 0.44],
  [-1.85, 3.9, 3.1, 0.38],
  [-1.0, 3.22, 4.8, 0.38],
  [-1.6, 1.08, 6.6, 0.42],
  [-1.6, 0.46, 6.6, 0.42],
  [-1.6, -0.16, 6.6, 0.42],
  [-1.6, -0.78, 6.6, 0.42],
  [-1.6, -1.4, 6.6, 0.42],
];
const ROWS = [
  ['Frame 1200 × 800', '12', '11.5 m²'],
  ['Panel 600 × 400', '40', '9.6 m²'],
  ['Bracket L 90', '120', '2.2 m²'],
  ['Cover plate', '8', '1.9 m²'],
  ['Rail 2400', '6', '3.8 m²'],
];
const COLS = 6, LROWS = 9;

/** One document in the dark, becoming a record. */
export function Sheet() {
  const y = SHEET_Y;
  const group = useRef<THREE.Group>(null!);

  const hiRef = useInstances(FIELDS.length, (i, o, c) => { const [x, fy, w, h] = FIELDS[i]; o.position.set(x, fy, 0.03); o.scale.set(w, h, 1); c.setRGB(2.2, 1.45, 0.65); }, 131);
  const hiMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0, depthWrite: false }), []);

  const cellPos = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let r = 0; r < LROWS; r++) for (let c = 0; c < COLS; c++) out.push(new THREE.Vector3(5.6 + c * 0.86, 4.2 - r * 0.56, 0));
    return out;
  }, []);
  const ledgerRef = useInstances(cellPos.length, (i, o, c) => { o.position.copy(cellPos[i]); c.setRGB(0.1, 0.12, 0.17); }, 137);
  const dim = useMemo(() => new THREE.Color(0.1, 0.12, 0.17), []);
  const lit = useMemo(() => new THREE.Color(1.25, 1.45, 1.9), []);
  const head = useMemo(() => new THREE.Color(1.9, 2.1, 2.5), []);
  const tmpC = useMemo(() => new THREE.Color(), []);

  const N = 520;
  const stream = useMemo(() => {
    const r = rng(139);
    const f = new Uint8Array(N), c = new Uint8Array(N), s = new Float32Array(N), pos = new Float32Array(N * 3), j = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      f[i] = i % FIELDS.length;
      c[i] = Math.floor(r() * cellPos.length);
      s[i] = 0.28 + f[i] * 0.045 + r() * 0.16;
      j[i * 2] = (r() - 0.5); j[i * 2 + 1] = (r() - 0.5);
    }
    return { f, c, s, pos, j };
  }, [cellPos.length]);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(stream.pos, 3)); return g; }, [stream]);
  const mat = useMemo(() => new THREE.PointsMaterial({ size: 0.11, map: glowTexture(), color: new THREE.Color(2.0, 1.6, 1.0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), []);

  const DUR = 0.2;
  useFrame(() => {
    const u = chapterLocal('sheet');
    // fields light up one by one
    hiMat.opacity = 0.9 * smoothstep(0.08, 0.16, u);
    const hi = hiRef.current;
    if (hi && hi.instanceColor) {
      for (let i = 0; i < FIELDS.length; i++) {
        const k = smoothstep(0.1 + i * 0.04, 0.16 + i * 0.04, u);
        tmpC.setRGB(2.2 * k, 1.45 * k, 0.65 * k);
        hi.setColorAt(i, tmpC);
      }
      hi.instanceColor.needsUpdate = true;
    }
    // particles carry the values across
    const { f, c, s, pos, j } = stream;
    for (let i = 0; i < N; i++) {
      const k = clamp01((u - s[i]) / DUR);
      if (k <= 0 || k >= 1) { pos[i * 3 + 1] = -999; continue; }
      const [fx, fy, fw] = FIELDS[f[i]];
      const ax = fx + j[i * 2] * fw * 0.8, ay = fy + j[i * 2 + 1] * 0.2;
      const b = cellPos[c[i]];
      const e = k * k * (3 - 2 * k);
      pos[i * 3] = ax + (b.x - ax) * e;
      pos[i * 3 + 1] = ay + (b.y - ay) * e + Math.sin(k * Math.PI) * 1.6;
      pos[i * 3 + 2] = Math.sin(k * Math.PI) * 2.8;
    }
    geo.attributes.position.needsUpdate = true;
    // cells light as their values land
    const lg = ledgerRef.current;
    if (lg && lg.instanceColor) {
      for (let i = 0; i < cellPos.length; i++) {
        const arrive = 0.34 + (i / cellPos.length) * 0.5;
        const k = smoothstep(arrive, arrive + 0.05, u);
        tmpC.copy(dim).lerp(i < COLS ? head : lit, k);
        lg.setColorAt(i, tmpC);
      }
      lg.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={group} position={[0, y, 0]}>
      {/* the paper */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[8, 11]} />
        <meshStandardMaterial color="#e6dfd0" roughness={0.95} />
      </mesh>
      <Text font={FONT} position={[-3.5, 4.55, 0.02]} fontSize={0.42} anchorX="left" anchorY="middle" color={INK} letterSpacing={0.02}>DELIVERY NOTE</Text>
      <Text font={FONT} position={[1.65, 4.55, 0.02]} fontSize={0.3} anchorX="left" anchorY="middle" color={INK}>No. 0417</Text>
      <Text font={FONT} position={[-3.5, 3.9, 0.02]} fontSize={0.27} anchorX="left" anchorY="middle" color={INK2}>Date   03 / 09</Text>
      <Text font={FONT} position={[-3.5, 3.22, 0.02]} fontSize={0.27} anchorX="left" anchorY="middle" color={INK2}>Customer   ——————————————</Text>
      <Text font={FONT} position={[-3.5, 2.6, 0.02]} fontSize={0.27} anchorX="left" anchorY="middle" color={INK2}>Site   ——————————————</Text>
      <Text font={FONT} position={[-3.5, 1.72, 0.02]} fontSize={0.24} anchorX="left" anchorY="middle" color={INK2} letterSpacing={0.06}>ITEM</Text>
      <Text font={FONT} position={[1.1, 1.72, 0.02]} fontSize={0.24} anchorX="left" anchorY="middle" color={INK2} letterSpacing={0.06}>QTY</Text>
      <Text font={FONT} position={[2.3, 1.72, 0.02]} fontSize={0.24} anchorX="left" anchorY="middle" color={INK2} letterSpacing={0.06}>AREA</Text>
      {ROWS.map((row, i) => (
        <group key={i} position={[0, 1.08 - i * 0.62, 0.02]}>
          <Text font={FONT} position={[-3.5, 0, 0]} fontSize={0.27} anchorX="left" anchorY="middle" color={INK}>{row[0]}</Text>
          <Text font={FONT} position={[1.1, 0, 0]} fontSize={0.27} anchorX="left" anchorY="middle" color={INK}>{row[1]}</Text>
          <Text font={FONT} position={[2.3, 0, 0]} fontSize={0.27} anchorX="left" anchorY="middle" color={INK}>{row[2]}</Text>
        </group>
      ))}
      <Text font={FONT} position={[-3.5, -3.7, 0.02]} fontSize={0.27} anchorX="left" anchorY="middle" color={INK2}>Received by   ——————————</Text>
      <Text font={FONT} position={[-3.5, -4.5, 0.02]} fontSize={0.22} anchorX="left" anchorY="middle" color={INK2}>Signed on arrival. Copy to accounts.</Text>

      {/* the highlights */}
      <instancedMesh ref={hiRef} args={[undefined, undefined, FIELDS.length]} material={hiMat} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>

      {/* the record */}
      <instancedMesh ref={ledgerRef} args={[undefined, undefined, cellPos.length]} frustumCulled={false}>
        <planeGeometry args={[0.8, 0.26]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <Text font="/fonts/BarlowCondensed-Medium.ttf" position={[5.2, 5.05, 0]} fontSize={0.34} anchorX="left" anchorY="middle" color="#9fb0d0" letterSpacing={0.12}>RECORD 0417</Text>

      <points geometry={geo} material={mat} frustumCulled={false} />
      <pointLight position={[2, 3, 7]} color="#ffd9a8" intensity={46} distance={26} decay={2} />
    </group>
  );
}
