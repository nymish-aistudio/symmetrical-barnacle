import { gsap, ScrollTrigger } from './scroll';
import type { Substrate } from '../gl/substrate';
import type { FormationName } from '../gl/formations';

/** Three panels on one pin; the substrate re-forms for each. */
export function setupAltitudes(substrate: Substrate | null, reduceMotion: boolean) {
  const alts = Array.from(document.querySelectorAll<HTMLElement>('.alt'));
  const index = Array.from(document.querySelectorAll<HTMLElement>('#alts-index li'));
  if (!alts.length) return;

  const forms = alts.map((a) => (a.dataset.form as FormationName) || 'heat');
  const activate = (i: number) => {
    index.forEach((li, k) => li.classList.toggle('is-active', k === i));
    substrate?.goTo(forms[i]);
  };

  const mm = gsap.matchMedia();

  mm.add({ desktop: '(min-width: 900px)', motion: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
    if (!ctx.conditions?.desktop || !ctx.conditions?.motion) return;
    const n = alts.length;
    // cross-fade panels along the pin
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.alts', start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    });
    alts.forEach((el, i) => {
      const t0 = i / n, t1 = (i + 1) / n;
      if (i === 0) tl.set(el, { autoAlpha: 1, y: 0 }, 0);
      else tl.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.07, ease: 'power2.out' }, t0);
      if (i < n - 1) tl.to(el, { autoAlpha: 0, y: -28, duration: 0.07, ease: 'power2.in' }, t1 - 0.07);
    });
    // formation per third
    const triggers = alts.map((_, i) => ScrollTrigger.create({
      trigger: '.alts',
      start: () => `top+=${(i / n) * 100}% top`,
      end: () => `top+=${((i + 1) / n) * 100}% top`,
      onToggle: (self) => { if (self.isActive) activate(i); },
    }));
    return () => { tl.kill(); triggers.forEach((t) => t.kill()); };
  });

  mm.add({ mobile: '(max-width: 899px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    if (!ctx.conditions?.mobile && !ctx.conditions?.reduce) return;
    const triggers = alts.map((el, i) => ScrollTrigger.create({
      trigger: el, start: 'top 62%', end: 'bottom 40%',
      onToggle: (self) => { if (self.isActive) activate(i); },
    }));
    return () => triggers.forEach((t) => t.kill());
  });

  void reduceMotion;
}

