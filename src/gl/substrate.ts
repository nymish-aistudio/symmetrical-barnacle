import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, DataTexture, FloatType,
  NearestFilter, NormalBlending, PerspectiveCamera, Points, RGBAFormat, Scene,
  ShaderMaterial, Vector3, WebGLRenderer,
} from 'three';
import gsap from 'gsap';
import vert from './shaders/points.vert.glsl';
import frag from './shaders/points.frag.glsl';
import { buildFormations, FormationName, FormationSet, N, POSES, TEXELS, TEX_H, TEX_W } from './formations';

export interface SubstrateOptions {
  canvas: HTMLCanvasElement;
  reduceMotion: boolean;
  mobile: boolean;
}

/** A morph target: a named formation, or the hero's scroll-scrubbed blend of two. */
type Slot = FormationName | 'scrub';

const PI = Math.PI;
const stagger = (m: number, seed: number) => {
  let k = (m - seed * 0.35) / 0.65;
  k = k < 0 ? 0 : k > 1 ? 1 : k;
  return k * k * (3 - 2 * k);
};

/**
 * The substrate: 44,471 points that re-form into the shape of whatever the reader
 * is looking at. One Points object, one material. The GPU mixes two textures; when a
 * new target arrives mid-morph, the CPU reproduces the shader's maths to snapshot what
 * is on screen, so a retarget never pops.
 */
export class Substrate {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(34, 1, 0.1, 200);
  private material: ShaderMaterial;
  private textures: Record<FormationName, DataTexture>;
  private scratch: DataTexture;
  private scratchCpu: Float32Array;
  private set: FormationSet;

  private target: Slot = 'inbox';
  private cpuA: Float32Array;
  private scrubPair = { from: 'inbox' as FormationName, to: 'ledger' as FormationName, t: 0 };
  private mixTween: gsap.core.Tween | null = null;
  private opacityTween: gsap.core.Tween | null = null;
  private opacityScale: number;

  private pose = { pos: new Vector3(), look: new Vector3() };
  private poseFrom = { pos: new Vector3(), look: new Vector3() };
  private poseTo = { pos: new Vector3(), look: new Vector3() };
  private poseT = 1;
  private poseTween: gsap.core.Tween | null = null;

  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private shift = 0.22;
  private time = 0;
  private running = false;
  private raf = 0;
  private lastFrame = 0;
  private visible = true;
  private opts: SubstrateOptions;

  readonly paper = { on: false };

  constructor(opts: SubstrateOptions) {
    this.opts = opts;
    this.opacityScale = opts.mobile ? 0.62 : 1;
    this.renderer = new WebGLRenderer({ canvas: opts.canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    const dpr = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2);
    this.renderer.setPixelRatio(dpr);

    this.set = buildFormations();
    this.textures = {} as Record<FormationName, DataTexture>;
    (Object.keys(this.set.data) as FormationName[]).forEach((name) => {
      this.textures[name] = this.makeTexture(this.set.data[name]);
    });
    this.scratchCpu = new Float32Array(TEXELS * 4);
    this.scratch = this.makeTexture(this.scratchCpu);
    this.cpuA = this.set.data.inbox;

    const geo = new BufferGeometry();
    const uv = new Float32Array(TEXELS * 2);
    for (let i = 0; i < TEXELS; i++) {
      uv[i * 2] = ((i % TEX_W) + 0.5) / TEX_W;
      uv[i * 2 + 1] = (Math.floor(i / TEX_W) + 0.5) / TEX_H;
    }
    geo.setAttribute('position', new BufferAttribute(new Float32Array(TEXELS * 3), 3));
    geo.setAttribute('aUv', new BufferAttribute(uv, 2));
    geo.setAttribute('aSeed', new BufferAttribute(this.set.seeds, 1));
    geo.setAttribute('aSize', new BufferAttribute(this.set.sizes, 1));
    geo.setDrawRange(0, opts.mobile ? Math.min(N, 16000) : N);
    geo.boundingSphere = null;

    this.material = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      uniforms: {
        uA: { value: this.textures.inbox },
        uB: { value: this.textures.inbox },
        uC: { value: this.textures.inbox },
        uD: { value: this.textures.ledger },
        uMix: { value: 0 },
        uScrubT: { value: 0 },
        uBScrub: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: opts.mobile ? 1.25 : 1.0 },
        uDpr: { value: dpr },
        uSwirl: { value: opts.reduceMotion ? 0 : 1 },
        uIdle: { value: opts.reduceMotion ? 0 : 1 },
        uColLo: { value: new Color('#7fb6e8').multiplyScalar(0.55) },
        uColHi: { value: new Color('#ffffff') },
        uOpacity: { value: this.opacityScale },
      },
    });

    const points = new Points(geo, this.material);
    points.frustumCulled = false;
    this.scene.add(points);

    const p = POSES.inbox;
    this.pose.pos.set(...p.pos); this.pose.look.set(...p.look);
    this.poseTo.pos.copy(this.pose.pos); this.poseTo.look.copy(this.pose.look);
    this.poseFrom.pos.copy(this.pose.pos); this.poseFrom.look.copy(this.pose.look);

    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (!opts.mobile && !opts.reduceMotion) {
      window.addEventListener('pointermove', (e) => {
        this.pointer.tx = e.clientX / window.innerWidth - 0.5;
        this.pointer.ty = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      this.visible = document.visibilityState === 'visible';
      if (this.visible) { this.lastFrame = 0; this.kick(); }
    });
  }

  private makeTexture(data: Float32Array) {
    const t = new DataTexture(data, TEX_W, TEX_H, RGBAFormat, FloatType);
    t.magFilter = NearestFilter; t.minFilter = NearestFilter; t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  }

  /* ---------------------------------------------------------------- sizing */
  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.shift = w < 900 ? 0 : 0.22;
    this.kick();
  }

  /* ------------------------------------------------------------- formations */
  /** Morph to a named formation. */
  goTo(name: FormationName, duration = 1.7) {
    if (this.target === name) return;
    this.retarget(name, duration);
    this.movePose(POSES[name].pos, POSES[name].look, duration * 1.05);
  }

  /** Follow the hero scroll: the target becomes a live blend of two formations. */
  scrub(from: FormationName, to: FormationName, t: number) {
    const u = this.material.uniforms;
    this.scrubPair = { from, to, t };
    u.uC.value = this.textures[from];
    u.uD.value = this.textures[to];
    u.uScrubT.value = t;
    const entering = this.target !== 'scrub';
    if (entering) this.retarget('scrub', 0.9);

    const a = POSES[from], b = POSES[to];
    const e = gsap.parseEase('power2.inOut')(t);
    const pos = new Vector3(a.pos[0] + (b.pos[0] - a.pos[0]) * e, a.pos[1] + (b.pos[1] - a.pos[1]) * e, a.pos[2] + (b.pos[2] - a.pos[2]) * e);
    const look = new Vector3(a.look[0] + (b.look[0] - a.look[0]) * e, a.look[1] + (b.look[1] - a.look[1]) * e, a.look[2] + (b.look[2] - a.look[2]) * e);
    if (entering) this.movePose(pos, look, 0.9);
    else if (this.poseT < 1) { this.poseTo.pos.copy(pos); this.poseTo.look.copy(look); }
    else { this.pose.pos.copy(pos); this.pose.look.copy(look); }
    this.kick();
  }

  private retarget(slot: Slot, duration: number) {
    const u = this.material.uniforms;
    this.snapshotIntoA();
    this.target = slot;
    if (slot === 'scrub') {
      u.uBScrub.value = 1;
    } else {
      u.uBScrub.value = 0;
      u.uB.value = this.textures[slot];
    }
    u.uMix.value = 0;
    this.mixTween?.kill();
    this.mixTween = null;
    if (this.opts.reduceMotion || duration <= 0) {
      u.uMix.value = 1;
      this.settle();
      this.kick();
      return;
    }
    this.mixTween = gsap.to(u.uMix, {
      value: 1, duration, ease: 'power2.inOut',
      onUpdate: () => this.kick(),
      onComplete: () => { this.mixTween = null; this.settle(); },
    });
  }

  /** After a morph completes, A becomes the target so the next morph starts clean. */
  private settle() {
    const u = this.material.uniforms;
    if (this.target === 'scrub') return; // stay at mix 1: what is shown is the live blend of C and D
    u.uA.value = this.textures[this.target];
    this.cpuA = this.set.data[this.target];
    u.uB.value = this.textures[this.target];
    u.uMix.value = 0;
  }

  /** Evaluate the current B (a formation, or the scrub blend) for texel i into out[o..o+3]. */
  private sampleB(i: number, o: number, out: Float32Array, seeds: Float32Array, t: number) {
    if (this.target === 'scrub') {
      const c = this.set.data[this.scrubPair.from], d = this.set.data[this.scrubPair.to];
      const s = seeds[i];
      const k2 = stagger(this.scrubPair.t, s);
      let x = c[o] + (d[o] - c[o]) * k2, y = c[o + 1] + (d[o + 1] - c[o + 1]) * k2, z = c[o + 2] + (d[o + 2] - c[o + 2]) * k2;
      const sw = Math.sin(k2 * PI) * (this.material.uniforms.uSwirl.value as number) * 1.1;
      if (sw !== 0) {
        x += sw * Math.sin(y * 1.3 + t * 0.9 + s * 6.2831);
        y += sw * Math.cos(x * 1.1 - t * 0.7 + s * 3.1);
        z += sw * Math.sin(z * 1.7 + t * 0.5 + s * 3.0);
      }
      out[0] = x; out[1] = y; out[2] = z; out[3] = c[o + 3] + (d[o + 3] - c[o + 3]) * k2;
    } else {
      const b = this.set.data[this.target];
      out[0] = b[o]; out[1] = b[o + 1]; out[2] = b[o + 2]; out[3] = b[o + 3];
    }
  }

  /** Reproduce the shader on the CPU so a retarget starts from exactly what is on screen. */
  private snapshotIntoA() {
    const u = this.material.uniforms;
    const mix = u.uMix.value as number;
    if (mix <= 0 && this.target !== 'scrub') return;              // A is what is on screen
    if (mix >= 1 && this.target !== 'scrub') { this.settle(); return; }
    const a = this.cpuA, seeds = this.set.seeds, out = this.scratchCpu, t = this.time;
    const swirlAmp = (u.uSwirl.value as number) * 1.1;
    const b = new Float32Array(4);
    for (let i = 0; i < TEXELS; i++) {
      const o = i * 4, s = seeds[i];
      this.sampleB(i, o, b, seeds, t);
      const k = stagger(mix, s);
      let x = a[o] + (b[0] - a[o]) * k, y = a[o + 1] + (b[1] - a[o + 1]) * k, z = a[o + 2] + (b[2] - a[o + 2]) * k;
      const sw = Math.sin(k * PI) * swirlAmp;
      if (sw !== 0) {
        const dx = Math.sin(y * 1.3 + t * 0.9 + s * 6.2831);
        const dy = Math.cos(x * 1.1 - t * 0.7 + s * 3.1);
        const dz = Math.sin(z * 1.7 + t * 0.5 + s * 3.0);
        x += sw * dx; y += sw * dy; z += sw * dz;
      }
      out[o] = x; out[o + 1] = y; out[o + 2] = z; out[o + 3] = a[o + 3] + (b[3] - a[o + 3]) * k;
    }
    this.scratch.needsUpdate = true;
    // A now points at the snapshot; keep an independent CPU copy so the next snapshot can read it
    this.cpuA = new Float32Array(out);
    u.uA.value = this.scratch;
    u.uBScrub.value = 0;
    u.uMix.value = 0;
  }

  private movePose(pos: Vector3 | [number, number, number], look: Vector3 | [number, number, number], duration: number) {
    const to = { pos: Array.isArray(pos) ? new Vector3(...pos) : pos, look: Array.isArray(look) ? new Vector3(...look) : look };
    this.poseTween?.kill();
    if (this.opts.reduceMotion || duration <= 0) {
      this.pose.pos.copy(to.pos); this.pose.look.copy(to.look);
      this.poseTo.pos.copy(to.pos); this.poseTo.look.copy(to.look);
      this.poseT = 1;
      this.kick();
      return;
    }
    this.poseFrom.pos.copy(this.pose.pos); this.poseFrom.look.copy(this.pose.look);
    this.poseTo.pos.copy(to.pos); this.poseTo.look.copy(to.look);
    this.poseT = 0;
    this.poseTween = gsap.to(this, { poseT: 1, duration, ease: 'power2.inOut', onUpdate: () => this.kick() });
  }

  /* ---------------------------------------------------------------- looks */
  /** Fade to an opacity. Any fade in flight is replaced, so callers never fight. */
  fadeTo(v: number, duration = 0) {
    this.opacityTween?.kill();
    this.opacityTween = null;
    const u = this.material.uniforms.uOpacity;
    const to = v * this.opacityScale;
    if (this.opts.reduceMotion || duration <= 0) { u.value = to; this.kick(); return; }
    this.opacityTween = gsap.to(u, { value: to, duration, ease: 'power2.out', onUpdate: () => this.kick() });
  }
  setOpacity(v: number) { this.fadeTo(v, 0); }

  /** Print (white on blue, additive) or paper (blue on white, normal). */
  setPaper(on: boolean) {
    if (this.paper.on === on) return;
    this.paper.on = on;
    const u = this.material.uniforms;
    if (on) {
      this.material.blending = NormalBlending;
      (u.uColLo.value as Color).set('#1545a2').multiplyScalar(0.9);
      (u.uColHi.value as Color).set('#0f3a90');
    } else {
      this.material.blending = AdditiveBlending;
      (u.uColLo.value as Color).set('#7fb6e8').multiplyScalar(0.55);
      (u.uColHi.value as Color).set('#ffffff');
    }
    this.material.needsUpdate = true;
    this.kick();
  }

  /* ----------------------------------------------------------------- loop */
  start() { this.running = true; this.kick(); }
  stop() { this.running = false; }

  private kick() {
    if (this.raf || !this.running || !this.visible) return;
    this.raf = requestAnimationFrame((ts) => this.frame(ts));
  }

  private frame(ts: number) {
    this.raf = 0;
    if (!this.running || !this.visible) return;
    const dt = this.lastFrame ? Math.min(0.05, (ts - this.lastFrame) / 1000) : 0.016;
    this.lastFrame = ts;
    if (!this.opts.reduceMotion) this.time += dt;
    this.material.uniforms.uTime.value = this.time;

    if (this.poseT < 1) {
      const e = gsap.parseEase('power2.inOut')(this.poseT);
      this.pose.pos.lerpVectors(this.poseFrom.pos, this.poseTo.pos, e);
      this.pose.look.lerpVectors(this.poseFrom.look, this.poseTo.look, e);
    }
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.04;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.04;

    const idle = this.opts.reduceMotion ? 0 : 1;
    const orbit = Math.sin(this.time * 0.11) * 0.28 * idle + this.pointer.x * 0.9;
    const bob = Math.cos(this.time * 0.09) * 0.14 * idle + this.pointer.y * 0.5;
    const d = this.pose.pos.length();
    const dir = this.pose.pos.clone().normalize();
    const cx = dir.x * Math.cos(orbit) - dir.z * Math.sin(orbit);
    const cz = dir.x * Math.sin(orbit) + dir.z * Math.cos(orbit);
    this.camera.position.set(cx * d, dir.y * d + bob, cz * d);
    this.camera.lookAt(this.pose.look);
    const dist = this.camera.position.distanceTo(this.pose.look);
    const viewW = 2 * dist * Math.tan((this.camera.fov * PI) / 360) * this.camera.aspect;
    this.camera.translateX(-viewW * this.shift);

    this.renderer.render(this.scene, this.camera);

    const opacity = this.material.uniforms.uOpacity.value as number;
    if (!this.opts.reduceMotion && opacity > 0.001) this.raf = requestAnimationFrame((t) => this.frame(t));
  }
}
