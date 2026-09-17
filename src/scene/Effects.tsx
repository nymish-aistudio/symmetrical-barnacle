import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import { rig } from './rig';

/** Cinematic pass: bloom on the lights, focus on the chapter, a frost of aberration when passing a floor. */
export function Effects({ mobile, reduce }: { mobile: boolean; reduce: boolean }) {
  const offset = useMemo(() => new Vector2(0.0008, 0.0005), []);
  useFrame(() => {
    const p = reduce ? 0 : rig.pulse;
    offset.set(0.0008 + p * 0.007, 0.0005 + p * 0.0045);
  });
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.8} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur radius={0.72} />
      {mobile ? <></> : <DepthOfField target={rig.focus} focalLength={0.018} bokehScale={1.5} height={560} />}
      <ChromaticAberration offset={offset} radialModulation modulationOffset={0.4} blendFunction={BlendFunction.NORMAL} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.22} />
      <Vignette eskil={false} offset={0.2} darkness={0.8} />
    </EffectComposer>
  );
}
