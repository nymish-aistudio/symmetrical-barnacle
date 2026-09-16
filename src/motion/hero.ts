import { gsap, SplitText } from './scroll';
import type { Substrate } from '../gl/substrate';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** One page-load sequence, then a scroll-scrubbed morph from inbox to ledger. */
export function setupHero(substrate: Substrate | null, reduceMotion: boolean) {
  const h = document.getElementById('hero-h');
  const copy = document.getElementById('hero-copy');
  const beat1 = document.getElementById('beat-1');
  const beat2 = document.getElementById('beat-2');
  const count = document.getElementById('beat-count');
  const tb = document.getElementById('titleblock');
  const tbObject = document.getElementById('tb-object');
  const frame = document.querySelector<HTMLElement>('.frame');
  const hint = document.querySelector<HTMLElement>('.hero__hint');
  if (!h || !copy) return;

  const kicker = copy.querySelector('.hero__kicker');
  const lede = copy.querySelector('.hero__lede');
  const cta = copy.querySelector('.hero__cta');

  /* ------------------------------------------------------------ load */
  if (reduceMotion) {
    substrate?.setOpacity(1);
    substrate?.goTo('ledger');
    if (tbObject) tbObject.textContent = 'One case ledger';
  } else {
    if (substrate) substrate.setOpacity(0);
    const split = new SplitText(h, { type: 'lines', mask: 'lines', linesClass: 'hero__line' });
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });
    intro
      .set([kicker, lede, cta, tb, hint], { opacity: 0 })
      .set(frame, { opacity: 0 })
      .from(split.lines, { yPercent: 112, duration: 1.3, stagger: 0.09 }, 0)
      .to(frame, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0.1)
      .to(kicker, { opacity: 1, duration: 0.9 }, 0.35)
      .fromTo(lede, { y: 18 }, { y: 0, opacity: 1, duration: 1.1 }, 0.55)
      .fromTo(cta, { y: 14 }, { y: 0, opacity: 1, duration: 1.0 }, 0.7)
      .to(tb, { opacity: 1, duration: 0.9 }, 0.9)
      .to(hint, { opacity: 1, duration: 0.8 }, 1.3)
      .add(() => split.revert());
    if (substrate) intro.add(() => substrate.fadeTo(1, 2.0), 0.2);
  }

  if (reduceMotion) return;

  /* ---------------------------------------------------------- scroll */
  const scrub = { t: 0 };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.55 },
  });

  // 0 → 0.3: the copy compresses and lifts away
  tl.to(h, { fontVariationSettings: '"wdth" 72', letterSpacing: '-0.04em', y: -60, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
    .to([kicker, lede, cta], { y: -30, opacity: 0, duration: 0.22, stagger: 0.02, ease: 'power2.in' }, 0)
    .to(hint, { opacity: 0, duration: 0.1 }, 0);

  // 0.12 → 0.72: the scatter becomes a ledger
  if (substrate) {
    tl.to(scrub, {
      t: 1, duration: 0.6,
      onUpdate: () => {
        substrate.scrub('inbox', 'ledger', scrub.t);
        if (tbObject) tbObject.textContent = scrub.t > 0.5 ? 'One case ledger' : 'Four shared inboxes';
      },
    }, 0.12);
  }

  // 0.28 → 0.58: beat 1 (count)
  const c = { n: 0 };
  tl.fromTo(beat1, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.28)
    .to(c, { n: 44471, duration: 0.3, onUpdate: () => { if (count) count.textContent = fmt(c.n); } }, 0.28)
    .to(beat1, { autoAlpha: 0, y: -24, duration: 0.08, ease: 'power2.in' }, 0.58);

  // 0.64 → 0.92: beat 2
  tl.fromTo(beat2, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.64)
    .to(beat2, { autoAlpha: 0, y: -24, duration: 0.08, ease: 'power2.in' }, 0.92);

  tl.to(tb, { opacity: 0, duration: 0.06 }, 0.94);
}
