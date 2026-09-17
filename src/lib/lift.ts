/** The rail: which floor you are on, and a car that rides the whole page. */
export function setupLift() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.lift__list a'));
  const car = document.getElementById('lift-car');
  const sections = links.map((a) => document.getElementById(a.dataset.lift!)!).filter(Boolean);
  if (!links.length || !sections.length) return;

  let active = -1;
  let frame = 0;

  const tick = () => {
    frame = 0;
    const y = window.scrollY, vh = window.innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    if (car) car.style.top = `${Math.min(100, Math.max(0, (y / max) * 100)).toFixed(2)}%`;

    // the section whose top has most recently passed the reading line
    const line = y + vh * 0.42;
    let i = 0;
    for (let k = 0; k < sections.length; k++) {
      if (sections[k].getBoundingClientRect().top + y <= line) i = k;
    }
    if (i !== active) {
      links[active]?.classList.remove('is-at');
      links[i].classList.add('is-at');
      active = i;
    }
  };

  const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  tick();
}
