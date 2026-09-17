export const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const mobile = typeof window !== 'undefined' && (window.innerWidth < 820 || window.matchMedia('(pointer: coarse)').matches);
export const dpr: [number, number] = [1, 1.5];

const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
/** debug switches for visual QA: ?fx=0 (no post), ?glass=0 (plain slabs), ?snap=1 (camera snaps, no arrival dolly), ?cam=<chapter id> (hold the camera at a station regardless of scroll) */
export const debug = { fx: q?.get('fx') !== '0', glass: q?.get('glass') !== '0', snap: q?.get('snap') === '1', cam: q?.get('cam') ?? '' };
