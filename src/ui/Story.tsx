import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ADVISORS, CALENDLY, CHAPTERS, FOUNDERS, TENETS } from '../story';
import { scrollToChapter } from '../scroll/progress';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

/** The chapters, as real text in the document. Each one is pinned while the camera is at its station. */
export function Story({ ready, reduce }: { ready: boolean; reduce: boolean }) {
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>('.ch').forEach((sec) => {
        const plaque = sec.querySelector<HTMLElement>('.ch__plaque');
        const statement = sec.querySelector<HTMLElement>('.statement');
        const rest = Array.from(sec.querySelectorAll<HTMLElement>('.ch__body, .ch__actions, .ch__hint, .tenets, .people, .ch__mail'));
        if (reduce) return;
        const split = statement ? new SplitText(statement, { type: 'lines', mask: 'lines', linesClass: 'ch__line' }) : null;
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
        if (plaque) tl.fromTo(plaque, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.8 }, 0);
        if (split) tl.fromTo(split.lines, { yPercent: 108 }, { yPercent: 0, duration: 1.15, stagger: 0.085 }, 0.05);
        if (rest.length) tl.fromTo(rest, { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.09 }, 0.4);
        const text = plaque?.textContent ?? '';
        ScrollTrigger.create({
          trigger: sec, start: 'top 62%', end: 'bottom 38%',
          onToggle: (self) => {
            if (self.isActive) {
              tl.timeScale(1).play();
              if (plaque) gsap.fromTo(plaque, { scrambleText: { text, chars: '0123456789−', speed: 0.7 } }, { duration: 0.9, scrambleText: { text, chars: '0123456789−', speed: 0.7, revealDelay: 0.15 } });
            } else tl.timeScale(2).reverse();
          },
        });
      });
      ScrollTrigger.refresh();
    });
    return () => ctx.revert();
  }, [ready, reduce]);

  return (
    <div className="story">
      {CHAPTERS.map((c, i) => (
        <section className={`ch ch--${c.id}`} id={c.id} key={c.id} style={{ height: `${c.length}vh` }} aria-labelledby={`h-${c.id}`}>
          <div className="ch__pin">
            <div className="ch__text">
              <p className="ch__plaque sign">{c.plaque}</p>
              {i === 0 ? <h1 id={`h-${c.id}`} className="statement">{c.statement}</h1> : <h2 id={`h-${c.id}`} className="statement">{c.statement}</h2>}
              <p className="ch__body">{c.body}</p>
              {c.id === 'surface' && (
                <>
                  <div className="ch__actions">
                    <a className="plate plate--solid" href={CALENDLY} target="_blank" rel="noopener">Book a conversation</a>
                    <button className="plate" onClick={() => scrollToChapter('fund')}>Descend</button>
                  </div>
                  <p className="ch__hint sign">Scroll to descend</p>
                </>
              )}
              {c.id === 'method' && (
                <ul className="tenets">
                  {TENETS.map(([t, d]) => <li key={t}><b>{t}</b><p>{d}</p></li>)}
                </ul>
              )}
              {c.id === 'who' && (
                <div className="people">
                  {FOUNDERS.map((f) => (
                    <div className="person" key={f.name}>
                      <span className="person__mono" aria-hidden="true">{f.initials}</span>
                      <div>
                        <h3>{f.name}</h3>
                        <p className="person__role">{f.role}</p>
                        <p className="person__bio">{f.bio}</p>
                        <p className="person__links"><a href={f.linkedin} target="_blank" rel="noopener">LinkedIn</a><a href={`mailto:${f.email}`}>{f.email}</a></p>
                      </div>
                    </div>
                  ))}
                  <div className="advisors"><span className="sign">Advisors</span>{ADVISORS.map(([n, r]) => <p key={n}><b>{n}</b> · {r}</p>)}</div>
                </div>
              )}
              {c.id === 'start' && (
                <>
                  <div className="ch__actions"><a className="plate plate--solid" href={CALENDLY} target="_blank" rel="noopener">Book a conversation</a></div>
                  <p className="ch__mail">Not ready for a call? Write to <a href="mailto:sharad@aistudio.ae">sharad@aistudio.ae</a>. One sentence about the company is enough.</p>
                </>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
