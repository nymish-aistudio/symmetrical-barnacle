import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Color, Mesh, ShaderMaterial } from 'three';
import { rig } from './rig';
import { smoothstep } from './util';

/** The night around the building: a steel-blue upper sky, a faint horizon, warmth gathering below. */
export function Sky() {
  const ref = useRef<Mesh>(null!);
  const mat = useMemo(() => new ShaderMaterial({
    side: BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: {
      uTop: { value: new Color('#22304f') },
      uMid: { value: new Color('#0c111b') },
      uBottom: { value: new Color('#090b10') },
      uWarm: { value: new Color('#22160d') },
      uWarmth: { value: 0 },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uTop, uMid, uBottom, uWarm; uniform float uWarmth;
      varying vec3 vDir;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        float h = vDir.y;
        vec3 c = mix(uMid, uTop, smoothstep(-0.05, 0.75, h));
        vec3 low = mix(uBottom, uWarm, uWarmth);
        c = mix(c, low, smoothstep(-0.05, -0.7, h));
        // a faint horizon band, brighter toward the top of the building
        c += uTop * 0.7 * exp(-pow((h - 0.05) * 4.0, 2.0));
        c += vec3(0.16, 0.12, 0.08) * exp(-pow((h + 0.12) * 7.0, 2.0)) * (0.6 + 0.4 * uWarmth);
        // fine grain so the gradient never bands
        c += (hash(gl_FragCoord.xy) - 0.5) * 0.012;
        gl_FragColor = vec4(c, 1.0);
      }`,
  }), []);
  useFrame(({ camera }) => {
    ref.current.position.copy(camera.position);
    mat.uniforms.uWarmth.value = smoothstep(0.35, 1, rig.depth) * (1 - rig.outside * 0.6);
  });
  return (
    <mesh ref={ref} material={mat} frustumCulled={false} renderOrder={-100}>
      <sphereGeometry args={[360, 40, 24]} />
    </mesh>
  );
}
