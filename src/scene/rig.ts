import { Vector3 } from 'three';

/** Shared mutable state between the camera, the atmosphere, the sound and the post-processing pass. */
export const rig = {
  focus: new Vector3(0, 21, 0),
  /** 0 = surface, 1 = the sheet; drives colour temperature and sound */
  depth: 0,
  /** how far outside the column the camera is, 0..1 */
  outside: 0,
  /** brief spike when the camera passes through a floor */
  pulse: 0,
  /** arrival dolly, 0..1, starts once the page is ready */
  intro: 0,
  started: false,
  /** rendered frames, for QA scripts that wait on the loop */
  frames: 0,
};
