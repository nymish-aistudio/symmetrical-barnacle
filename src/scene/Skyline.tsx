import { useMemo } from 'react';
import { rng } from './util';
import { CITY_NIGHT, KIT, Placed, type Xf } from './kit';

const GROUND = -37;

/** "A partner sees forty of these." A skyline of real towers around ours, lit from their own windows. They top out below the fund floor: the surface sits above the city, and the descent goes down into it. */
export function Skyline({ mobile }: { mobile: boolean }) {
  const sets = useMemo(() => {
    const r = rng(211);
    const tall: Record<string, Xf[]> = { a: [], b: [], c: [], d: [], e: [] };
    const keys = Object.keys(tall);
    const n = mobile ? 22 : 34;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.22;
      const dist = 150 + r() * 130;
      const s = 4.5 + r() * 3.2;
      tall[keys[Math.floor(r() * keys.length)]].push({ p: [Math.cos(a) * dist, GROUND, Math.sin(a) * dist], ry: r() * Math.PI * 2, s });
    }
    const filler: Xf[] = [];
    const fn = mobile ? 24 : 48;
    for (let i = 0; i < fn; i++) {
      const a = (i / fn) * Math.PI * 2 + (r() - 0.5) * 0.3;
      const dist = 170 + r() * 130;
      filler.push({ p: [Math.cos(a) * dist, GROUND, Math.sin(a) * dist], ry: r() * Math.PI * 2, s: 5 + r() * 5 });
    }
    return { tall, filler };
  }, [mobile]);
  return (
    <group>
      {(['a', 'b', 'c', 'd', 'e'] as const).map((k) => sets.tall[k].length ? <Placed key={k} src={KIT.commercial(`building-skyscraper-${k}`)} at={sets.tall[k]} overrides={CITY_NIGHT} /> : null)}
      <Placed src={KIT.commercial('low-detail-building-a')} at={sets.filler.filter((_, i) => i % 3 === 0)} overrides={CITY_NIGHT} />
      <Placed src={KIT.commercial('low-detail-building-e')} at={sets.filler.filter((_, i) => i % 3 === 1)} overrides={CITY_NIGHT} />
      <Placed src={KIT.commercial('low-detail-building-i')} at={sets.filler.filter((_, i) => i % 3 === 2)} overrides={CITY_NIGHT} />
    </group>
  );
}
