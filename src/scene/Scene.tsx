import { useEffect } from 'react';
import { Environment, Lightformer, Sparkles } from '@react-three/drei';
import { Atmosphere } from './Atmosphere';
import { CameraRig } from './CameraRig';
import { Column } from './Column';
import { Effects } from './Effects';
import { Sheet } from './Sheet';
import { AltitudeThreads } from './AltitudeThreads';
import { Sky } from './Sky';
import { Ground } from './Ground';
import { GhostColumns } from './GhostColumns';
import { LightShafts } from './LightShafts';
import { FundFloor } from './floors/FundFloor';
import { DealFloor } from './floors/DealFloor';
import { CompanyFloor } from './floors/CompanyFloor';
import { PlantFloor } from './floors/PlantFloor';
import { FLOORS } from '../story';
import { debug } from '../env';

function SceneReady({ onReady }: { onReady: () => void }) { useEffect(() => { onReady(); }, [onReady]); return null; }

export function Scene({ mobile, reduce, onReady }: { mobile: boolean; reduce: boolean; onReady: () => void }) {
  const y = Object.fromEntries(FLOORS.map((f) => [f.id, f.y])) as Record<string, number>;
  return (
    <>
      <Atmosphere />
      <CameraRig mobile={mobile} reduce={reduce} />
      <Sky />
      <hemisphereLight args={['#33425f', '#1a120c', 0.7]} />
      <directionalLight position={[18, 60, 26]} intensity={2.2} color="#e3e9ff" />
      {/* a cold back-fill so the column reads as a solid object rather than a silhouette */}
      <directionalLight position={[-30, 20, -20]} intensity={0.6} color="#7f95c8" />
      <ambientLight intensity={0.1} color="#b9c6e4" />
      {/* the reflections the clear glass needs, built from lightformers rather than an HDRI */}
      <Environment resolution={mobile ? 64 : 128} frames={1}>
        <Lightformer form="rect" intensity={1.8} color="#dfe8ff" position={[0, 42, 0]} rotation-x={Math.PI / 2} scale={[70, 70, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#ffd3a1" position={[0, -44, 0]} rotation-x={-Math.PI / 2} scale={[70, 70, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[34, 12, 30]} scale={12} />
      </Environment>
      <GhostColumns count={mobile ? 22 : 40} />
      <Ground />
      <LightShafts />
      <Column mobile={mobile || !debug.glass} />
      <FundFloor y={y.fund} reduce={reduce} />
      <DealFloor y={y.deal} />
      <CompanyFloor y={y.company} />
      <PlantFloor y={y.plant} reduce={reduce} />
      <Sheet />
      <AltitudeThreads />
      <Sparkles count={mobile ? 80 : 220} scale={[40, 80, 40]} position={[0, 0, 0]} size={mobile ? 1.6 : 1.2} speed={reduce ? 0 : 0.14} opacity={0.2} color="#dfe7ff" noise={0.6} />
      {debug.fx ? <Effects mobile={mobile} reduce={reduce} /> : null}
      <SceneReady onReady={onReady} />
    </>
  );
}
