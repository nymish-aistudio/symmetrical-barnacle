import { useEffect, useMemo, useRef, useState } from 'react';
import { CHAPTERS, chapterRanges } from '../story';
import { scroll, scrollToChapter } from '../scroll/progress';

/** The lift panel: where you are in the building, and a way to go straight there. */
export function Elevator() {
  const starts = useMemo(() => chapterRanges().map((r) => r[0]), []);
  const [active, setActive] = useState(0);
  const car = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0, last = -1;
    const loop = () => {
      const p = scroll.p;
      if (car.current) car.current.style.top = `${(p * 100).toFixed(2)}%`;
      let i = 0; for (let k = 0; k < starts.length; k++) if (p >= starts[k] - 0.004) i = k;
      if (i !== last) { last = i; setActive(i); }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [starts]);
  return (
    <nav className="lift" aria-label="Chapters">
      <ol className="lift__list">
        {CHAPTERS.map((c, i) => (
          <li key={c.id}><button className={i === active ? 'is-active' : ''} onClick={() => scrollToChapter(c.id)} aria-current={i === active ? 'true' : undefined}>{c.nav}</button></li>
        ))}
      </ol>
      <div className="lift__track" aria-hidden="true"><div className="lift__car" ref={car} /></div>
    </nav>
  );
}
