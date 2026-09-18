import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Points, PointsMaterial, Vector3 } from 'three';
import { glowTexture, rng } from './util';

export type Segment = [Vector3, Vector3];

interface Props {
  segments: Segment[];
  perSegment?: number;
  speed?: [number, number];
  color?: [number, number, number];
  size?: number;
  seed?: number;
  /** evaluated each frame; lets a chapter fade the travellers in */
  opacity?: () => number;
  frozen?: boolean;
}

/** Small lights travelling along lines: email between desks, learning between floors. */
export function Travellers({ segments, perSegment = 3, speed = [0.12, 0.3], color = [1.6, 1.8, 2.2], size = 0.16, seed = 7, opacity, frozen }: Props) {
  const n = segments.length * perSegment;
  const state = useMemo(() => {
    const r = rng(seed);
    const t = new Float32Array(n), v = new Float32Array(n), seg = new Uint16Array(n);
    for (let i = 0; i < n; i++) { t[i] = r(); v[i] = speed[0] + r() * (speed[1] - speed[0]); seg[i] = Math.floor(i / perSegment); }
    return { t, v, seg, pos: new Float32Array(n * 3) };
  }, [n, perSegment, seed, speed]);
  const geo = useMemo(() => { const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(state.pos, 3)); return g; }, [state]);
  const mat = useMemo(() => new PointsMaterial({ size, map: glowTexture(), color: new Color(...color), transparent: true, opacity: 1, depthWrite: false, blending: AdditiveBlending, toneMapped: false, sizeAttenuation: true }), [size, color]);
  const ref = useRef<Points>(null!);
  const tmp = useMemo(() => new Vector3(), []);

  useFrame((_, dt) => {
    const { t, v, seg, pos } = state;
    for (let i = 0; i < n; i++) {
      if (!frozen) { t[i] += v[i] * dt; if (t[i] > 1) t[i] -= 1; }
      const [a, b] = segments[seg[i]];
      tmp.lerpVectors(a, b, t[i]);
      pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = tmp.z;
    }
    geo.attributes.position.needsUpdate = true;
    if (opacity) { const o = opacity(); mat.opacity = o; ref.current.visible = o > 0.005; }
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}
