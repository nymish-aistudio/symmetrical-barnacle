import { useMemo } from 'react';
import * as THREE from 'three';
import { FrontSide } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshTransmissionMaterial, Text } from '@react-three/drei';
import { FLOORS, SLAB } from '../story';

function roundedRect(w: number, h: number, r: number, path: THREE.Path) {
  const x = -w / 2, y = -h / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y); path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r); path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h); path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r); path.quadraticCurveTo(x, y, x + r, y);
  return path;
}

function slab(y: number) {
  const shape = roundedRect(SLAB.w, SLAB.h, 1.4, new THREE.Shape()) as THREE.Shape;
  shape.holes.push(roundedRect(SLAB.hw, SLAB.hh, 1.0, new THREE.Path()));
  const g = new THREE.ExtrudeGeometry(shape, { depth: SLAB.t, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y - SLAB.t / 2, 0);
  return g;
}

/** The building: four glass floors around an atrium, drawn like a section. */
export function Column({ mobile }: { mobile: boolean }) {
  const merged = useMemo(() => mergeGeometries(FLOORS.map((f) => slab(f.y)))!, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(merged, 25), [merged]);
  // survey grid on each floor, skipping the atrium
  const grid = useMemo(() => {
    const pts: number[] = [];
    const step = 2;
    for (const f of FLOORS) {
      const y = f.y + SLAB.t / 2 + 0.005;
      for (let x = -SLAB.w / 2 + step; x < SLAB.w / 2; x += step) {
        if (Math.abs(x) < SLAB.hw / 2) { pts.push(x, y, -SLAB.h / 2 + 0.5, x, y, -SLAB.hh / 2, x, y, SLAB.hh / 2, x, y, SLAB.h / 2 - 0.5); }
        else pts.push(x, y, -SLAB.h / 2 + 0.5, x, y, SLAB.h / 2 - 0.5);
      }
      for (let z = -SLAB.h / 2 + step; z < SLAB.h / 2; z += step) {
        if (Math.abs(z) < SLAB.hh / 2) { pts.push(-SLAB.w / 2 + 0.5, y, z, -SLAB.hw / 2, y, z, SLAB.hw / 2, y, z, SLAB.w / 2 - 0.5, y, z); }
        else pts.push(-SLAB.w / 2 + 0.5, y, z, SLAB.w / 2 - 0.5, y, z);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, []);
  const struts = useMemo(() => {
    const pts: number[] = [];
    const top = FLOORS[0].y + 3.2, bottom = FLOORS[FLOORS.length - 1].y - 1.6;
    const xs = [-SLAB.w / 2 + 0.9, SLAB.w / 2 - 0.9], zs = [-SLAB.h / 2 + 0.9, SLAB.h / 2 - 0.9];
    for (const x of xs) for (const z of zs) pts.push(x, bottom, z, x, top, z);
    const hx = [-SLAB.hw / 2 - 0.35, SLAB.hw / 2 + 0.35], hz = [-SLAB.hh / 2 - 0.35, SLAB.hh / 2 + 0.35];
    for (const x of hx) for (const z of hz) pts.push(x, bottom, z, x, top, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  return (
    <group>
      <mesh geometry={merged}>
        {mobile ? (
          <meshPhysicalMaterial color="#c8d3ea" transparent opacity={0.22} roughness={0.55} metalness={0} depthWrite={false} />
        ) : (
          <MeshTransmissionMaterial
            samples={3} resolution={320} transmission={1} roughness={0.22} thickness={0.7} ior={1.42}
            chromaticAberration={0.04} anisotropicBlur={0.3} distortion={0.05} distortionScale={0.5} temporalDistortion={0.02}
            color="#cfe0fb" attenuationDistance={5} attenuationColor="#a9c4f5"
          />
        )}
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#b4c6e6" transparent opacity={0.45} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={grid}>
        <lineBasicMaterial color="#7f93b8" transparent opacity={0.16} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={struts}>
        <lineBasicMaterial color="#8a98b6" transparent opacity={0.18} depthWrite={false} />
      </lineSegments>
      {FLOORS.map((f) => [-1, 1].map((side) => (
        <Text
          key={`${f.id}${side}`}
          font="/fonts/BarlowCondensed-Medium.ttf"
          position={[side * (-SLAB.hw / 2 - 0.08), f.y + 0.95, 0]}
          rotation={[0, side * Math.PI / 2, 0]}
          fontSize={0.62}
          letterSpacing={0.12}
          color="#c3cee4"
          fillOpacity={0.85}
          anchorX="center"
          anchorY="middle"
          material-side={FrontSide}
        >
          {f.plaque}
        </Text>
      )))}
    </group>
  );
}
