import { useMemo } from 'react';
import * as THREE from 'three';

/** What the building stands on: a dark plane with a survey grid that fades into the fog. */
export function Ground({ y = -37 }: { y?: number }) {
  const grid = useMemo(() => {
    const pts: number[] = [];
    const half = 240, step = 6;
    for (let i = -half; i <= half; i += step) { pts.push(-half, 0, i, half, 0, i); pts.push(i, 0, -half, i, 0, half); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, []);
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0b0f17" roughness={0.9} metalness={0.1} />
      </mesh>
      <lineSegments geometry={grid}>
        <lineBasicMaterial color="#4d5d80" transparent opacity={0.3} depthWrite={false} />
      </lineSegments>
      <pointLight position={[6, 9, 4]} color="#ffb672" intensity={140} distance={46} decay={2} />
    </group>
  );
}
