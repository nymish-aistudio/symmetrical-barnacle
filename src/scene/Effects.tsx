import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Noise, Vignette, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import { rig } from './rig';

/** Cinematic pass: bloom on the lights, focus on the chapter, a frost of aberration when passing a floor. */
export function Effects({ mobile, reduce }: { mobile: boolean; reduce: boolean }) {
  const offset = useMemo(() => new Vector2(0, 0), []);
  useFrame(() => {
    const p = reduce ? 0 : rig.pulse;
    offset.set(p * 0.007, p * 0.0045);
  });
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {mobile ? <></> : <SMAA />}
      <Bloom intensity={0.55} luminanceThreshold={0.74} luminanceSmoothing={0.25} mipmapBlur radius={0.55} />
      {mobile ? <></> : <DepthOfField target={rig.focus} focalLength={0.012} bokehScale={1.0} height={480} />}
      <ChromaticAberration offset={offset} radialModulation modulationOffset={0.4} blendFunction={BlendFunction.NORMAL} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.08} />
      <Vignette eskil={false} offset={0.22} darkness={0.72} />
    </EffectComposer>
  );
}
