import { useMemo } from 'react';
import * as THREE from 'three';

/** What the building stands on: a dark plane with a survey grid that fades into the fog. */
export function Ground({ y = -42 }: { y?: number }) {
  const grid = useMemo(() => {
    const pts: number[] = [];
    const half = 160, step = 4;
    for (let i = -half; i <= half; i += step) { pts.push(-half, 0, i, half, 0, i); pts.push(i, 0, -half, i, 0, half); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, []);
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0a0d13" roughness={0.85} metalness={0.15} />
      </mesh>
      <lineSegments geometry={grid}>
        <lineBasicMaterial color="#3a4560" transparent opacity={0.35} depthWrite={false} />
      </lineSegments>
      <pointLight position={[8, 10, 6]} color="#ffb672" intensity={90} distance={40} decay={2} />
    </group>
  );
}
