import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll, reduceMotion, wireAnchors } from './lib/scroll';
import { setupBackdrop } from './lib/backdrop';
import { setupLift } from './lib/lift';
import { setupReveals } from './lib/reveal';
import { setupSheet } from './lib/sheet';

initScroll();
wireAnchors();
setupBackdrop(reduceMotion);
setupLift();
setupSheet();

const nav = document.getElementById('nav');
const stick = () => nav?.classList.toggle('is-stuck', window.scrollY > 24);
window.addEventListener('scroll', stick, { passive: true });
stick();

// split the headings only once the webfont is in, or the lines break in the wrong places
document.fonts.ready.then(() => {
  setupReveals();
  ScrollTrigger.refresh();
  document.documentElement.classList.add('is-ready');
});
