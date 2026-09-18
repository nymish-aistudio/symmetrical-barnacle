import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FLOORS } from '../story';

/** Light falling down the atrium: tall soft planes that always face the camera. */
export function LightShafts() {
  const group = useRef<THREE.Group>(null!);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uColor: { value: new THREE.Color('#9fc2ff') }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uTime; varying vec2 vUv;
      void main(){
        float x = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float edge = pow(smoothstep(0.0, 1.0, x), 2.2);
        float fall = smoothstep(0.0, 0.25, vUv.y) * pow(vUv.y, 1.6);
        float flicker = 0.85 + 0.15 * sin(uTime * 0.7 + vUv.y * 6.0);
        gl_FragColor = vec4(uColor, edge * fall * 0.16 * flicker);
      }`,
  }), []);
  const shafts = useMemo(() => [
    { x: -1.5, z: 0.8, w: 3.2 }, { x: 2.2, z: -1.4, w: 2.4 }, { x: 0.4, z: 2.6, w: 1.8 },
  ], []);
  const top = FLOORS[0].y + 26, bottom = FLOORS[FLOORS.length - 1].y - 4;
  useFrame(({ camera, clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    for (const m of group.current.children) {
      const dx = camera.position.x - m.position.x, dz = camera.position.z - m.position.z;
      m.rotation.y = Math.atan2(dx, dz);
    }
  });
  return (
    <group ref={group}>
      {shafts.map((s, i) => (
        <mesh key={i} position={[s.x, (top + bottom) / 2, s.z]} material={mat} frustumCulled={false} renderOrder={5}>
          <planeGeometry args={[s.w, top - bottom]} />
        </mesh>
      ))}
    </group>
  );
}
