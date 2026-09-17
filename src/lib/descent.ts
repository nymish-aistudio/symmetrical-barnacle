import { hex, mix, type Oklch } from './color';

/** The two ends of the building. */
const LIGHT = { bg: [0.972, 0.007, 250], fg: [0.2, 0.028, 262], fg2: [0.47, 0.03, 258], accent: [0.6, 0.135, 60] } as Record<string, Oklch>;
const DEEP = { bg: [0.185, 0.024, 260], fg: [0.95, 0.008, 250], fg2: [0.72, 0.015, 250], accent: [0.78, 0.13, 72] } as Record<string, Oklch>;

const smooth = (t: number) => { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x); };
const topOf = (id: string) => { const el = document.getElementById(id); return el ? el.getBoundingClientRect().top + window.scrollY : 0; };

/**
 * Depth as a pure function of scroll position: 0 at the surface, 1 on the floor,
 * back to 0 when the page pulls back. Being stateless means a jump, a resize or a
 * refresh can never leave the page half-lit.
 */
export function setupDescent() {
  const root = document.documentElement;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  let marks = { a: 0, b: 1, c: 2, d: 3 };
  let last = -1;

  const measure = () => {
    const vh = window.innerHeight;
    marks = {
      a: topOf('fund') - vh * 0.55,          // the descent begins
      b: topOf('floor') - vh * 0.18,         // underground by the time you read the floor
      c: topOf('altitudes') - vh * 0.85,     // still deep
      d: topOf('altitudes') - vh * 0.1,      // back in the light
    };
  };

  const depthAt = (y: number) => {
    const { a, b, c, d } = marks;
    if (y <= a) return 0;
    if (y < b) return smooth((y - a) / Math.max(1, b - a));
    if (y < c) return 1;
    if (y < d) return 1 - smooth((y - c) / Math.max(1, d - c));
    return 0;
  };

  const apply = (t: number) => {
    if (Math.abs(t - last) < 0.002) return;
    last = t;
    const bg = hex(mix(LIGHT.bg, DEEP.bg, t));
    root.style.setProperty('--bg', bg);
    root.style.setProperty('--fg', hex(mix(LIGHT.fg, DEEP.fg, t)));
    root.style.setProperty('--fg-2', hex(mix(LIGHT.fg2, DEEP.fg2, t)));
    root.style.setProperty('--accent', hex(mix(LIGHT.accent, DEEP.accent, t)));
    root.style.setProperty('--logo-invert', t.toFixed(3));
    meta?.setAttribute('content', bg);
  };

  const update = () => apply(depthAt(window.scrollY));
  measure(); update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { measure(); update(); });
  document.fonts.ready.then(() => { measure(); update(); });
  return update;
}
