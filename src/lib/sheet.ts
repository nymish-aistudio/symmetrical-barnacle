import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduceMotion } from './scroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * The one piece of imagery on the page: a delivery note, read field by field,
 * becoming a record. It is scrubbed, so the reader drives it.
 */
export function setupSheet() {
  const fig = document.getElementById('sheet-fig');
  if (!fig) return;
  const marks = fig.querySelectorAll('.sheet__mark');
  const cells = fig.querySelectorAll('.sheet__grid b, .sheet__grid s');

  if (reduceMotion) {
    gsap.set(marks, { scaleX: 1 });
    gsap.set(cells, { opacity: 1 });
    return;
  }

  gsap.set(marks, { scaleX: 0 });
  gsap.set(cells, { opacity: 0.2 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: fig, start: 'top 78%', end: 'bottom 62%', scrub: 0.5 },
  });
  tl.to(marks, { scaleX: 1, duration: 0.42, ease: 'power2.out', stagger: { each: 0.05 } }, 0);
  tl.to(cells, { opacity: 1, duration: 0.3, stagger: { each: 0.018 } }, 0.3);
}
