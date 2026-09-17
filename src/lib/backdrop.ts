import { ShaderMount, meshGradientFragmentShader, getShaderColorFromString, ShaderFitOptions } from '@paper-design/shaders';

/**
 * The page sits on a slow mesh gradient with grain, so the light has somewhere to come
 * from. It moves at a twelfth of real time: you notice it only if you stop and look.
 */
const COLORS = ['#ffffff', '#e7eef9', '#ccdcf2', '#f4f8fd', '#dce7f7'];

export function setupBackdrop(reduce: boolean) {
  const el = document.getElementById('backdrop');
  if (!el) return;
  try {
    new ShaderMount(
      el,
      meshGradientFragmentShader,
      {
        u_fit: ShaderFitOptions.cover,
        u_scale: 2.1, u_rotation: 0,
        u_originX: 0.5, u_originY: 0.5, u_offsetX: 0, u_offsetY: 0,
        u_worldWidth: 0, u_worldHeight: 0,
        u_colors: COLORS.map(getShaderColorFromString),
        u_colorsCount: COLORS.length,
        u_distortion: 0.78,
        u_swirl: 0.5,
        u_grainMixer: 0.12,
        u_grainOverlay: 0.035,
      },
      undefined,
      reduce ? 0 : 0.12,   // speed
      0,                   // frame
      1,                   // min pixel ratio: it is a soft gradient, it does not need retina
      1920 * 1080,         // pixel budget
    );
    el.classList.add('is-on');
  } catch {
    el.remove();           // no WebGL: the flat background colour is the fallback
  }
}
