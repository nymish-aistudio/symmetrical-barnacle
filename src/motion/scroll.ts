import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

export { gsap, ScrollTrigger, SplitText };

/** Smooth scroll driven by the GSAP ticker so ScrollTrigger and Lenis share one clock. */
export function setupScroll(reduceMotion: boolean): Lenis | null {
  if (reduceMotion) return null;
  const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: { offset: -72 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
