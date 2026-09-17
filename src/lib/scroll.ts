import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis: Lenis | null = null;

export function initScroll() {
  if (reduceMotion) return null;
  lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1.05, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/** Put a section where it reads best: centred if it fits, just below the nav if it does not. */
export function goTo(el: HTMLElement) {
  const top = el.getBoundingClientRect().top + window.scrollY;
  const h = el.offsetHeight;
  const y = Math.max(0, h <= window.innerHeight ? top - (window.innerHeight - h) / 2 : top - 78);
  if (lenis) lenis.scrollTo(y, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 3) });
  else window.scrollTo({ top: y });
}

/** Wire every in-page anchor through goTo so smooth scroll and the offset agree. */
export function wireAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      goTo(el);
      history.replaceState(null, '', `#${id}`);
    });
  });
}
