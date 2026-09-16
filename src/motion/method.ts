import { gsap } from './scroll';

/** The rail draws as the four moves come into view. */
export function setupMethod(reduceMotion: boolean) {
  const path = document.getElementById('rail-draw');
  if (!path || reduceMotion) return;
  gsap.fromTo(path, { drawSVG: '0%' }, {
    drawSVG: '100%', ease: 'none',
    scrollTrigger: { trigger: '.method', start: 'top 55%', end: 'bottom 75%', scrub: 0.4 },
  });
}
