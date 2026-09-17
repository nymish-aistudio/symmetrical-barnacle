
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll, wireAnchors } from './lib/scroll';
import { setupDescent } from './lib/descent';
import { setupLift } from './lib/lift';
import { setupReveals } from './lib/reveal';
import { setupSheet } from './lib/sheet';

initScroll();
wireAnchors();
const refreshDescent = setupDescent();
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
  refreshDescent();
  document.documentElement.classList.add('is-ready');
});
