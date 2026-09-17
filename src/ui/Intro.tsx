import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Mark } from './Nav';

/** The arrival. A breathing mark and a line that fills while the building compiles. */
export function Intro({ ready, reduce }: { ready: boolean; reduce: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!bar.current) return;
    const tw = gsap.to(bar.current, { scaleX: 0.86, duration: 3.2, ease: 'power1.out' });
    return () => { tw.kill(); };
  }, []);
  useEffect(() => {
    if (!ready || !el.current) return;
    if (reduce) { setGone(true); return; }
    const tl = gsap.timeline({ onComplete: () => setGone(true) });
    if (bar.current) tl.to(bar.current, { scaleX: 1, duration: 0.35, ease: 'power2.out', overwrite: true });
    tl.to(el.current, { opacity: 0, duration: 1.1, ease: 'power2.inOut' }, 0.25);
  }, [ready, reduce]);
  if (gone) return null;
  return (
    <div className="intro" ref={el} aria-hidden="true">
      <span className="intro__mark"><Mark /></span>
      <span className="intro__bar"><i ref={bar} /></span>
      <span className="intro__word sign">Going down</span>
    </div>
  );
}
