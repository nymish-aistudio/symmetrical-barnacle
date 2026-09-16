import { gsap, ScrollTrigger } from './scroll';
import type { Substrate } from '../gl/substrate';
import type { FormationName } from '../gl/formations';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Each ledger row re-forms the substrate when it comes into view; figures count when a row opens. */
export function setupWork(substrate: Substrate | null, reduceMotion: boolean) {
  const rows = Array.from(document.querySelectorAll<HTMLElement>('.row'));
  if (substrate) {
    // the substrate recedes behind the ledger and returns when the reader scrolls back up
    ScrollTrigger.create({ trigger: '#work', start: 'top 80%', onEnter: () => substrate.fadeTo(0.45, 1.2), onLeaveBack: () => substrate.fadeTo(1, 1.2) });
  }
  rows.forEach((row) => {
    const form = row.dataset.form as FormationName | undefined;
    if (form && substrate) {
      ScrollTrigger.create({
        trigger: row, start: 'top 58%', end: 'bottom 42%',
        onToggle: (self) => { if (self.isActive) substrate.goTo(form); },
      });
    }
    const details = row.querySelector('details');
    const fig = row.querySelector<HTMLElement>('[data-count]');
    if (details && fig && !reduceMotion) {
      const end = parseInt(fig.dataset.count || '0', 10);
      let done = false;
      details.addEventListener('toggle', () => {
        if (!details.open || done) return;
        done = true;
        const o = { n: 0 };
        gsap.to(o, { n: end, duration: 1.1, ease: 'power3.out', onUpdate: () => { fig.textContent = fmt(o.n); } });
      });
    }
    // opening a row after the pin: let ScrollTrigger know heights changed
    details?.addEventListener('toggle', () => ScrollTrigger.refresh());
  });
}
