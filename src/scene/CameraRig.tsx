import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, PerspectiveCamera, Vector3 } from 'three';
import { easing } from 'maath';
import { CHAPTERS, FLOORS, SHEET_Y, stationFractions } from '../story';
import { scroll } from '../scroll/progress';
import { rig } from './rig';
import { clamp01, smoothstep } from './util';
import { debug } from '../env';

const TOP_Y = CHAPTERS[0].cam.pos[1];

/** The camera rides a spline through the stations; scroll picks the position, the pointer breathes on it. */
export function CameraRig({ mobile, reduce }: { mobile: boolean; reduce: boolean }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const fr = useMemo(() => stationFractions(), []);
  const posCurve = useMemo(() => new CatmullRomCurve3(CHAPTERS.map((c) => new Vector3(...c.cam.pos)), false, 'centripetal', 0.5), []);
  const lookCurve = useMemo(() => new CatmullRomCurve3(CHAPTERS.map((c) => new Vector3(...c.cam.look)), false, 'centripetal', 0.5), []);
  const s = useRef({
    pos: new Vector3(...CHAPTERS[0].cam.pos).add(new Vector3(4, 9, 12)),
    look: new Vector3(...CHAPTERS[0].cam.look),
    prevY: TOP_Y + 9,
    tp: new Vector3(), tl: new Vector3(), off: new Vector3(), dolly: new Vector3(4, 9, 12),
  }).current;

  useFrame((st, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    rig.frames++;
    const camIdx = debug.cam ? CHAPTERS.findIndex((c) => c.id === debug.cam) : -1;
    const p = camIdx >= 0 ? fr[camIdx] : scroll.p, n = fr.length;
    let k = 0;
    while (k < n - 2 && p > fr[k + 1]) k++;
    const seg = fr[k + 1] - fr[k];
    let u = seg > 0 ? clamp01((p - fr[k]) / seg) : 0;
    u = smoothstep(0.16, 0.84, u);
    const t = p <= fr[0] ? 0 : (k + u) / (n - 1);
    posCurve.getPoint(t, s.tp);
    lookCurve.getPoint(t, s.tl);

    // arrival: the first station is approached from higher and farther away
    if (rig.started) rig.intro = debug.snap ? 1 : Math.min(1, rig.intro + dt / 3.2);
    const arrive = 1 - Math.pow(1 - rig.intro, 3);
    s.tp.addScaledVector(s.dolly, (1 - arrive) * (1 - clamp01(p * 40)));

    // portrait screens see less width: step back from the subject
    const aspect0 = st.size.width / Math.max(1, st.size.height);
    if (aspect0 < 0.9) s.tp.sub(s.tl).multiplyScalar(1.32).add(s.tl);

    if (reduce || debug.snap) { s.pos.copy(s.tp); s.look.copy(s.tl); }
    else { easing.damp3(s.pos, s.tp, 0.28, dt); easing.damp3(s.look, s.tl, 0.28, dt); }

    const idle = reduce ? 0 : 1;
    const time = st.clock.elapsedTime;
    s.off.set(
      (Math.sin(time * 0.23) * 0.22 + st.pointer.x * 0.55) * idle,
      (Math.cos(time * 0.19) * 0.16 + st.pointer.y * 0.3) * idle,
      Math.sin(time * 0.17) * 0.12 * idle,
    );
    camera.position.copy(s.pos).add(s.off);
    camera.lookAt(s.look);

    // the copy lives on the left, so the subject sits right of centre
    const dist = camera.position.distanceTo(s.look);
    const aspect = aspect0;
    const fov = aspect < 0.9 ? 62 : aspect < 1.3 ? 52 : 42;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.translateX(-dist * (mobile || aspect < 0.9 ? 0 : 0.19));

    rig.focus.copy(s.look);
    rig.depth = clamp01((TOP_Y - camera.position.y) / (TOP_Y - SHEET_Y));
    rig.outside = smoothstep(12, 24, Math.max(Math.abs(camera.position.x), Math.abs(camera.position.z)));

    const y = camera.position.y;
    if (rig.outside < 0.5) for (const f of FLOORS) if ((s.prevY - f.y) * (y - f.y) < 0) rig.pulse = 1;
    s.prevY = y;
    rig.pulse *= Math.exp(-dt * 3.4);
  });
  return null;
}
