import { gsap, ScrollTrigger } from './scroll';
import type { Substrate } from '../gl/substrate';

const PRINT = { bg: '#0f3a90', fg: '#eff6fb', fg2: '#b4d6ef', rule: 'rgba(239,246,251,0.18)', rule2: 'rgba(239,246,251,0.42)', btnBg: '#eff6fb', btnFg: '#0f3a90' };
const PAPER = { bg: '#f4f7fb', fg: '#101a2d', fg2: '#414d63', rule: 'rgba(16,26,45,0.14)', rule2: 'rgba(16,26,45,0.36)', btnBg: '#1545a2', btnFg: '#f4f7fb' };
type Theme = typeof PRINT;
const KEYS: Record<keyof Theme, string> = { bg: '--bg', fg: '--fg', fg2: '--fg-2', rule: '--rule', rule2: '--rule-2', btnBg: '--btn-bg', btnFg: '--btn-fg' };

/** Interpolators per token, built once. */
const lerps = (Object.keys(KEYS) as (keyof Theme)[]).map((k) => ({ prop: KEYS[k], f: gsap.utils.interpolate(PRINT[k], PAPER[k]) }));

export function applyTheme(p: number) {
  const root = document.documentElement;
  for (const { prop, f } of lerps) root.style.setProperty(prop, f(p));
}

/** The print develops into paper: theme tokens follow scroll across the gap, the substrate fades and switches ink. */
export function setupDevelop(substrate: Substrate | null, reduceMotion: boolean) {
  const zone = document.getElementById('develop');
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!zone) return;

  const toPaper = () => { substrate?.setPaper(true); substrate?.goTo('ring'); meta?.setAttribute('content', PAPER.bg); };
  const toPrint = () => { substrate?.setPaper(false); meta?.setAttribute('content', PRINT.bg); };

  if (reduceMotion) {
    ScrollTrigger.create({
      trigger: zone, start: 'top 60%',
      onEnter: () => { applyTheme(1); substrate?.setOpacity(0); toPaper(); },
      onLeaveBack: () => { applyTheme(0); substrate?.setOpacity(1); toPrint(); },
    });
    return;
  }

  ScrollTrigger.create({
    trigger: zone, start: 'top 88%', end: 'bottom 30%', scrub: 0.35,
    onUpdate: (self) => {
      const p = self.progress;
      applyTheme(p);
      // the substrate has already receded to 0.45 behind the ledger; it leaves in the first half
      substrate?.fadeTo(0.45 * (1 - Math.min(1, p / 0.55)));
    },
    onLeave: toPaper,
    onEnterBack: toPrint,
  });
}
