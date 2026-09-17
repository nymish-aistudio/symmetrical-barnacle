import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Real things. The kits are Kenney's CC0 low-poly sets (furniture, factory, city, cars).
 * `Placed` draws many copies of one model as one InstancedMesh per part.
 * `Model` is a single animatable copy with named nodes.
 */

export interface Xf { p: [number, number, number]; ry?: number; rx?: number; rz?: number; s?: number | [number, number, number] }

export type MatOverride = Record<string, Partial<{
  color: string; emissive: string; emissiveIntensity: number; emissiveFromMap: boolean;
  roughness: number; metalness: number; transparent: boolean; opacity: number;
}>>;

type Std = THREE.MeshStandardMaterial;

/** The furniture kit ships in bright pastels; the building is quieter than that. */
const DEFAULTS: MatOverride = {
  carpet: { color: '#3d4a5f' }, carpetDarker: { color: '#2c3646' }, carpetWhite: { color: '#cfd6e2' },
  wood: { color: '#b39c7f' }, woodDark: { color: '#7d6b55' }, plant: { color: '#5f8a5a' },
  metalMedium: { color: '#6c7686' }, metalDark: { color: '#2a303b' },
};

export function applyOverride(src: THREE.Material, overrides?: MatOverride): THREE.Material {
  const m = src.clone() as Std;
  const o = { ...(DEFAULTS[src.name] ?? {}), ...(overrides?.[src.name] ?? overrides?.['*'] ?? {}) } as MatOverride[string];
  if (o && 'emissive' in m) {
    if (o.color) m.color.set(o.color);
    if (o.emissive) m.emissive.set(o.emissive);
    if (o.emissiveIntensity != null) m.emissiveIntensity = o.emissiveIntensity;
    if (o.emissiveFromMap && m.map) { m.emissiveMap = m.map; if (!o.emissive) m.emissive.set('#ffffff'); }
    if (o.roughness != null) m.roughness = o.roughness;
    if (o.metalness != null) m.metalness = o.metalness;
    if (o.transparent != null) m.transparent = o.transparent;
    if (o.opacity != null) m.opacity = o.opacity;
  }
  return m;
}

interface Part { geometry: THREE.BufferGeometry; material: THREE.Material; matrix: THREE.Matrix4 }

function collectParts(scene: THREE.Object3D, overrides?: MatOverride): Part[] {
  scene.updateMatrixWorld(true);
  const parts: Part[] = [];
  const cache = new Map<THREE.Material, THREE.Material>();
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    let mat = cache.get(src);
    if (!mat) { mat = applyOverride(src, overrides); cache.set(src, mat); }
    parts.push({ geometry: mesh.geometry, material: mat, matrix: mesh.matrixWorld.clone() });
  });
  return parts;
}

interface PlacedProps {
  src: string;
  at: Xf[];
  scale?: number;
  overrides?: MatOverride;
  /** mutate `xf` each frame (its `p` is a fresh copy) */
  animate?: (i: number, t: number, xf: Xf) => void;
}

/** Many copies of one model, one draw call per part. */
export function Placed({ src, at, scale = 1, overrides, animate }: PlacedProps) {
  const { scene } = useGLTF(src);
  const parts = useMemo(() => collectParts(scene, overrides), [scene, overrides]);
  const refs = useRef<THREE.InstancedMesh[]>([]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), m: new THREE.Matrix4(), xf: { p: [0, 0, 0] as [number, number, number] } as Xf }), []);

  const write = (i: number, xf: Xf) => {
    const { o, m } = tmp;
    o.position.set(xf.p[0], xf.p[1], xf.p[2]);
    o.rotation.set(xf.rx ?? 0, xf.ry ?? 0, xf.rz ?? 0);
    const s = xf.s ?? 1;
    if (typeof s === 'number') o.scale.setScalar(s * scale); else o.scale.set(s[0] * scale, s[1] * scale, s[2] * scale);
    o.updateMatrix();
    for (let k = 0; k < parts.length; k++) { const r = refs.current[k]; if (!r) continue; m.multiplyMatrices(o.matrix, parts[k].matrix); r.setMatrixAt(i, m); }
  };

  useLayoutEffect(() => {
    at.forEach((xf, i) => write(i, xf));
    for (const r of refs.current) { if (!r) continue; r.instanceMatrix.needsUpdate = true; r.computeBoundingSphere(); }
  }, [at, parts, scale]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((st) => {
    if (!animate) return;
    const t = st.clock.elapsedTime;
    for (let i = 0; i < at.length; i++) {
      const src = at[i];
      tmp.xf.p = [src.p[0], src.p[1], src.p[2]]; tmp.xf.ry = src.ry; tmp.xf.rx = src.rx; tmp.xf.rz = src.rz; tmp.xf.s = src.s;
      animate(i, t, tmp.xf);
      write(i, tmp.xf);
    }
    for (const r of refs.current) if (r) r.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {parts.map((part, k) => (
        <instancedMesh key={k} ref={(el) => { if (el) refs.current[k] = el; }} args={[part.geometry, part.material, at.length]} frustumCulled={false} />
      ))}
    </group>
  );
}

interface ModelProps {
  src: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  overrides?: MatOverride;
  onFrame?: (root: THREE.Object3D, t: number, dt: number) => void;
}

/** One copy of a model whose named nodes can be moved every frame. */
export function Model({ src, position, rotation, scale, overrides, onFrame }: ModelProps) {
  const { scene } = useGLTF(src);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    if (overrides) c.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.material = applyOverride(Array.isArray(m.material) ? m.material[0] : m.material, overrides); });
    return c;
  }, [scene, overrides]);
  useFrame((st, dt) => { onFrame?.(obj, st.clock.elapsedTime, Math.min(dt, 0.05)); });
  return <primitive object={obj} position={position} rotation={rotation} scale={scale} />;
}

/* ---------------------------------------------------------------- manifest */
export const KIT = {
  furniture: (n: string) => `/models/furniture/${n}.glb`,
  factory: (n: string) => `/models/factory/${n}.glb`,
  industrial: (n: string) => `/models/industrial/${n}.glb`,
  commercial: (n: string) => `/models/commercial/${n}.glb`,
  cars: (n: string) => `/models/cars/${n}.glb`,
};

export const SCREEN_GLOW: MatOverride = { metal: { emissive: '#b9dcff', emissiveIntensity: 1.4, roughness: 0.4 } };
export const LAMP_GLOW: MatOverride = { lamp: { emissive: '#ffd9a0', emissiveIntensity: 2.2 } };
export const CITY_NIGHT: MatOverride = { '*': { emissiveFromMap: true, emissiveIntensity: 0.18, color: '#7d8aa3', roughness: 0.85 } };
export const FACTORY_SCREEN: MatOverride = { '*': { emissiveFromMap: true, emissiveIntensity: 0.9 } };

/** Everything the scene needs, so the loader can fetch it all at once. */
export const MANIFEST = [
  ...['desk', 'chairDesk', 'computerScreen', 'computerKeyboard', 'computerMouse', 'laptop', 'bookcaseClosedWide', 'bookcaseOpen', 'cabinetTelevision', 'cardboardBoxClosed', 'cardboardBoxOpen', 'books', 'pottedPlant', 'plantSmall2', 'kitchenCoffeeMachine', 'kitchenCabinet', 'kitchenFridgeSmall', 'table', 'tableCross', 'loungeSofa', 'loungeChair', 'lampSquareFloor', 'lampSquareTable', 'trashcan', 'coatRackStanding', 'televisionModern'].map(KIT.furniture),
  ...['conveyor-long', 'machine', 'machine-window', 'machine-fortified', 'robot-arm-a', 'hopper-round', 'hopper-square', 'pipe-large-long', 'pipe-large-valve', 'box-small', 'box-large', 'box-long', 'catwalk-straight', 'catwalk-stairs', 'screen-panel-wide', 'cog-a', 'crane', 'crane-lift', 'warning-orange', 'structure-doorway-wide'].map(KIT.factory),
  ...['building-a', 'building-c', 'building-e', 'building-g', 'building-m', 'building-p', 'chimney-large', 'chimney-medium', 'water-tower', 'shipping-container-a', 'shipping-container-b', 'detail-tank-large'].map(KIT.industrial),
  ...['building-skyscraper-a', 'building-skyscraper-b', 'building-skyscraper-c', 'building-skyscraper-d', 'building-skyscraper-e', 'low-detail-building-a', 'low-detail-building-e', 'low-detail-building-i', 'low-detail-building-wide-a'].map(KIT.commercial),
  ...['delivery', 'van', 'truck-flat', 'tractor-shovel'].map(KIT.cars),
];
MANIFEST.forEach((p) => useGLTF.preload(p));
