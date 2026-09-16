import { ScrollTrigger } from './scroll';
import type { Substrate } from '../gl/substrate';

/** The substrate returns faintly, blue on paper, as the ring: the fund and its companies. */
export function setupClose(substrate: Substrate | null) {
  if (!substrate) return;
  ScrollTrigger.create({
    trigger: '#close', start: 'top 85%',
    onEnter: () => { substrate.setPaper(true); substrate.goTo('ring'); substrate.fadeTo(0.3, 1.6); },
    onLeaveBack: () => substrate.fadeTo(0, 0.8),
  });
}
