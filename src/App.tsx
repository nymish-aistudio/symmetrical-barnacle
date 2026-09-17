import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';
import { Scene } from './scene/Scene';
import { rig } from './scene/rig';
import { Nav } from './ui/Nav';
import { Elevator } from './ui/Elevator';
import { Story } from './ui/Story';
import { Intro } from './ui/Intro';
import { Footer } from './ui/Footer';
import { initScroll, scroll } from './scroll/progress';
import { dpr, mobile, reduceMotion } from './env';

let scrollInit = false;

export default function App() {
  const [ready, setReady] = useState(false);
  const [frame, setFrame] = useState(false);
  const [res, setRes] = useState(dpr[1]);

  useEffect(() => {
    if (scrollInit) return;
    scrollInit = true;
    const lenis = initScroll(reduceMotion);
    if (import.meta.env.DEV) Object.assign(window as unknown as Record<string, unknown>, { __lenis: lenis, __scroll: scroll, __rig: rig });
  }, []);

  // ready when the first frame has drawn and fonts are in; never later than a few seconds
  useEffect(() => {
    let cancelled = false;
    const go = () => { if (!cancelled) { setReady(true); rig.started = true; } };
    const fallback = setTimeout(go, 6000);
    if (frame) document.fonts.ready.then(() => setTimeout(go, 400));
    return () => { cancelled = true; clearTimeout(fallback); };
  }, [frame]);

  return (
    <>
      <div className={`gl ${ready ? 'is-ready' : ''}`} aria-hidden="true">
        <Canvas
          dpr={res}
          gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false, depth: true }}
          camera={{ fov: 42, near: 0.2, far: 400, position: [11, 50, 28] }}
          onCreated={({ gl }) => { gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; setTimeout(() => setFrame(true), 50); }}
        >
          {/* trade resolution for frame rate when the machine cannot keep up */}
          <PerformanceMonitor onDecline={() => setRes(1)} onIncline={() => setRes(dpr[1])} flipflops={2} onFallback={() => setRes(1)} />
          <Suspense fallback={null}>
            <Scene mobile={mobile} reduce={reduceMotion} />
          </Suspense>
        </Canvas>
      </div>
      <div className="scrim" aria-hidden="true" />
      <div className="scrim scrim--right" aria-hidden="true" />
      <Intro ready={ready} reduce={reduceMotion} />
      <Nav />
      <Elevator />
      <main>
        <Story ready={ready} reduce={reduceMotion} />
      </main>
      <Footer />
    </>
  );
}
