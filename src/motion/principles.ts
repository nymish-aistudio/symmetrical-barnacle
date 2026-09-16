import { gsap } from './scroll';

/** Each principle gains weight and width as it crosses the reading line. */
export function setupPrinciples(reduceMotion: boolean) {
  const heads = Array.from(document.querySelectorAll<HTMLElement>('.p__h'));
  if (reduceMotion) { heads.forEach((h) => (h.style.fontVariationSettings = '"wdth" 118, "wght" 700')); return; }
  heads.forEach((h) => {
    gsap.fromTo(h, { fontVariationSettings: '"wdth" 82, "wght" 300' }, {
      fontVariationSettings: '"wdth" 118, "wght" 700', ease: 'none',
      scrollTrigger: { trigger: h.closest('.p') || h, start: 'top 82%', end: 'center 48%', scrub: 0.3 },
    });
  });
}
