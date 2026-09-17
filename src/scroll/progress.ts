import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CHAPTERS, chapterRanges } from '../story';

gsap.registerPlugin(ScrollTrigger);

/** One mutable scroll state, read by the render loop without React re-renders. */
export const scroll = { y: 0, p: 0, vh: 1, max: 1, v: 0 };
let lenis: Lenis | null = null;
const ranges = chapterRanges();

function measure() {
  scroll.vh = window.innerHeight;
  scroll.max = Math.max(1, document.documentElement.scrollHeight - scroll.vh);
}
function update() {
  const y = window.scrollY;
  scroll.v = y - scroll.y;
  scroll.y = y;
  scroll.p = Math.min(1, Math.max(0, y / scroll.max));
}

export function initScroll(reduce: boolean) {
  measure(); update();
  window.addEventListener('resize', () => { measure(); update(); });
  window.addEventListener('scroll', update, { passive: true });
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.075, smoothWheel: true, anchors: false });
    lenis.on('scroll', () => { update(); ScrollTrigger.update(); });
    gsap.ticker.add((t) => lenis?.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  return lenis;
}

/** 0..1 within a chapter's section (clamped) */
export function chapterLocal(id: string): number {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  if (i < 0) return 0;
  const [a, b] = ranges[i];
  return Math.min(1, Math.max(0, (scroll.p - a) / (b - a)));
}

export function scrollToChapter(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const y = top + Math.max(0, (el.offsetHeight - window.innerHeight) * 0.35);
  if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
  else window.scrollTo({ top: y, behavior: 'auto' });
}
