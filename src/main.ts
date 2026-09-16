import { setupScroll, ScrollTrigger } from './motion/scroll';
import { setupNav } from './motion/nav';
import { setupHero } from './motion/hero';
import { setupAltitudes } from './motion/altitudes';
import { setupWork } from './motion/work';
import { setupDevelop } from './motion/develop';
import { setupMethod } from './motion/method';
import { setupPrinciples } from './motion/principles';
import { setupClose } from './motion/close';
import { Substrate } from './gl/substrate';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.innerWidth < 900 || window.matchMedia('(pointer: coarse)').matches;

let substrate: Substrate | null = null;
const canvas = document.getElementById('substrate') as HTMLCanvasElement | null;
if (canvas) {
  try {
    substrate = new Substrate({ canvas, reduceMotion, mobile });
    substrate.start();
  } catch (err) {
    console.warn('[aistudio] WebGL unavailable, continuing without the substrate', err);
    canvas.remove();
  }
}

const lenis = setupScroll(reduceMotion);
if (import.meta.env.DEV) Object.assign(window as unknown as Record<string, unknown>, { __substrate: substrate, __lenis: lenis, __ScrollTrigger: ScrollTrigger });
setupNav();
setupHero(substrate, reduceMotion);
setupAltitudes(substrate, reduceMotion);
setupWork(substrate, reduceMotion);
setupDevelop(substrate, reduceMotion);
setupMethod(reduceMotion);
setupPrinciples(reduceMotion);
setupClose(substrate);

// fonts settle line breaks; make sure trigger positions are measured after them
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());
