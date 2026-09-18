import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, HueSaturation, Noise, Vignette, SMAA, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { Vector2 } from 'three';
import { rig } from './rig';

/** Cinematic pass, tuned for clarity: anti-aliasing, bloom on the true lights only, aberration only when passing a floor. */
export function Effects({ mobile, reduce }: { mobile: boolean; reduce: boolean }) {
  const offset = useMemo(() => new Vector2(0, 0), []);
  const dpr = useThree((s) => s.viewport.dpr);
  useFrame(() => {
    const p = reduce ? 0 : rig.pulse;
    offset.set(p * 0.0032, p * 0.002);
  });
  return (
    <EffectComposer key={dpr} multisampling={0} enableNormalPass={false}>
      {mobile ? <></> : <SMAA />}
      <Bloom intensity={0.42} luminanceThreshold={0.9} luminanceSmoothing={0.12} mipmapBlur radius={0.5} />
      <HueSaturation saturation={-0.22} />
      <ChromaticAberration offset={offset} radialModulation modulationOffset={0.4} blendFunction={BlendFunction.NORMAL} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.06} />
      <Vignette eskil={false} offset={0.24} darkness={0.66} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
