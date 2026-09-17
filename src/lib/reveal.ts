import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { reduceMotion } from './scroll';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Split a heading into masked lines so it can rise out of the page. */
function split(el: HTMLElement) {
  return new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
}

/** One orchestrated page-load, then one reveal per section as it crosses the reading line. */
export function setupReveals() {
  const heroHeading = document.querySelector<HTMLElement>('#surface .statement');
  const heroRest = Array.from(document.querySelectorAll<HTMLElement>('#surface [data-load]'));

  if (reduceMotion) {
    gsap.set([...heroRest, ...document.querySelectorAll('[data-reveal]')], { clearProps: 'all' });
    return;
  }

  gsap.set(heroRest, { opacity: 0 });

  const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.12 });
  if (heroHeading) {
    const s = split(heroHeading);
    intro.from(s.lines, { yPercent: 135, duration: 1.25, stagger: 0.085 }, 0);
  }
  intro.fromTo(heroRest.filter((e) => e.dataset.load === '2'), { y: 16 }, { opacity: 1, y: 0, duration: 1.05 }, 0.5);
  intro.fromTo(heroRest.filter((e) => e.dataset.load === '3'), { y: 14 }, { opacity: 1, y: 0, duration: 1 }, 0.66);
  intro.to(heroRest.filter((e) => e.dataset.load === '4'), { opacity: 1, duration: 0.9 }, 1.1);

  // every other statement rises once, as it arrives
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (el === heroHeading) return;
    const s = split(el);
    gsap.from(s.lines, {
      yPercent: 132, duration: 1.05, ease: 'expo.out', stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 84%', once: true },
    });
  });

  // supporting copy follows a beat later
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 18, duration: 0.95, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}
