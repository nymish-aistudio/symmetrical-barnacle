import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, FogExp2 } from 'three';
import { rig } from './rig';
import { lerp, smoothstep } from './util';

/** Colour temperature follows depth: cold at altitude, warm at the floor, neutral outside. */
export function Atmosphere() {
  const scene = useThree((s) => s.scene);
  const c = useMemo(() => ({ cold: new Color('#0c111b'), warm: new Color('#1a120c'), neutral: new Color('#0d121c'), out: new Color() }), []);
  useEffect(() => {
    scene.background = c.cold.clone();
    scene.fog = new FogExp2(c.cold.getHex(), 0.0085);
  }, [scene, c]);
  let last = '';
  useFrame(() => {
    c.out.copy(c.cold).lerp(c.warm, smoothstep(0.42, 1, rig.depth)).lerp(c.neutral, rig.outside);
    if (!(scene.background instanceof Color)) scene.background = c.out.clone(); else scene.background.copy(c.out);
    const fog = scene.fog as FogExp2 | null;
    if (fog) { fog.color.copy(c.out); fog.density = lerp(0.0085, 0.0045, rig.outside); }
    const hex = '#' + c.out.getHexString();
    if (hex !== last) { last = hex; document.documentElement.style.setProperty('--bg', hex); }
  });
  return null;
}
