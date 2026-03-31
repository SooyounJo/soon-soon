import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Center, Environment, Text3D } from '@react-three/drei';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import * as THREE from 'three';
import WebGLSceneBoundary from './WebGLSceneBoundary';

/** HeroFlowriumGlass3D — view 라인과 동일 */
const BAGEL_TTF = '/fonts/BagelFatOne-Regular.ttf';
const TEXT_SIZE_BASE = 1.48;
const TEXT_SIZE_VIEW = 3.52;
const EXTRUDE_DEPTH = 0.175;
const BEVEL_THICKNESS = 0.062;
const BEVEL_SIZE = 0.054;
const BEVEL_SEGMENTS = 3;
const CURVE_SEGMENTS = 6;

/** ExtrudedLetter `GlassTransmission` 과 동일 */
function GlassTransmission() {
  return (
    <meshPhysicalMaterial
      transparent
      transmission={0.94}
      thickness={0.12}
      roughness={0.028}
      metalness={0.03}
      ior={1.52}
      color="#fafcff"
      envMapIntensity={1.65}
      emissive="#f0f4ff"
      emissiveIntensity={0.24}
      attenuationColor="#ffffff"
      attenuationDistance={0.52}
      clearcoat={0.55}
      clearcoatRoughness={0.09}
    />
  );
}

function SceneTransparentClear() {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    scene.background = null;
    invalidate();
    return () => {
      scene.background = null;
    };
  }, [scene, invalidate]);
  return null;
}

/**
 * Hero ExtrudedLetter mode=view, 스크롤 끝(e2=1, assemble=0) 일 때와 같은 부유·회전식.
 */
function FloatingTitleMesh({ text, font, textSize, reduceMotion }) {
  const groupRef = useRef(null);
  const extrudeScale = textSize / TEXT_SIZE_BASE;
  const floatPhase = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
  }, [text]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    if (reduceMotion) {
      g.position.set(0, 0, 0);
      g.rotation.set(0, 0, 0);
      return;
    }
    const t = state.clock.elapsedTime;
    const e2 = 1;
    const assemble = 1 - e2;
    const settle = 1 - e2 * 0.55;
    const floatDamp = 0.14 + 0.86 * (1 - e2 * 0.92);
    const breath = 0.11 + 0.89 * e2;
    const a = floatPhase;

    const ampY = 0.056;
    const ampX = 0.026;
    const ampZ = 0.017;
    const fy =
      Math.sin(t * 1.08 + a) * ampY + Math.sin(t * 0.48 + a * 1.7) * ampY * 0.42;
    const fx = Math.cos(t * 0.85 + a * 2.03) * ampX;
    const fz = Math.sin(t * 0.62 + a * 0.95) * ampZ;

    const rxIdle = Math.sin(t * 0.88 + a) * 0.055 * breath;
    const ryIdle = Math.cos(t * 0.66 + a * 1.3) * 0.045 * breath;
    const rzIdle = Math.sin(t * 0.52 + a * 0.77) * 0.038 * breath;

    g.position.set(
      fx * settle * floatDamp,
      fy * settle * floatDamp,
      fz * settle * floatDamp
    );
    g.rotation.set(
      assemble * 0 + rxIdle,
      assemble * 0 + ryIdle,
      assemble * 0 + rzIdle
    );
  });

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font={font}
          size={textSize}
          height={EXTRUDE_DEPTH * extrudeScale}
          letterSpacing={0}
          lineHeight={1}
          curveSegments={CURVE_SEGMENTS}
          bevelEnabled
          bevelThickness={BEVEL_THICKNESS * extrudeScale}
          bevelSize={BEVEL_SIZE * extrudeScale}
          bevelOffset={0}
          bevelSegments={BEVEL_SEGMENTS}
        >
          {text}
          <GlassTransmission />
        </Text3D>
      </Center>
    </group>
  );
}

function SubPageTitleScene({ text }) {
  const font = useLoader(TTFLoader, BAGEL_TTF);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /** view 한 단어(3.52) 기준으로 길이에 비례 축소 — 짧은 타이틀은 view 에 가깝게 */
  const textSize = useMemo(() => {
    const len = Math.max(4, text.length);
    const fromView = (TEXT_SIZE_VIEW * 4) / len;
    return Math.min(TEXT_SIZE_VIEW * 1.02, Math.max(1.35, fromView));
  }, [text]);

  return (
    <>
      <SceneTransparentClear />
      <ambientLight intensity={0.42} />
      <directionalLight
        position={[-9, 11, 6]}
        intensity={3.85}
        color="#ffffff"
        castShadow={false}
      />
      <directionalLight position={[7.5, -3, 5.5]} intensity={1.52} color="#e8f0ff" />
      <directionalLight position={[0.5, 6, 9]} intensity={1.35} color="#fff8f0" />
      <pointLight position={[-5.5, 8.5, 6.5]} intensity={1.72} color="#ffffff" />
      <pointLight position={[6, 4, 7]} intensity={0.95} color="#dff5ff" />
      <hemisphereLight args={['#f6f9ff', '#1a1e1c', 0.88]} />
      <Environment
        preset="studio"
        environmentIntensity={1.48}
        resolution={56}
        frames={6}
      />
      <FloatingTitleMesh
        text={text}
        font={font}
        textSize={textSize}
        reduceMotion={reduceMotion}
      />
    </>
  );
}

/**
 * 서브페이지 좌측 중앙 — 히어로 `view`(PhaseTypography view)와 동일 조명·머티리얼·톤매핑.
 */
export default function SubPageTitle3D({ text }) {
  if (!text) return null;

  return (
    <WebGLSceneBoundary fallback={null}>
      <Canvas
        className="page-sub__title-3d-canvas"
        frameloop="always"
        resize={{ debounce: 120, scroll: false }}
        camera={{ position: [0, 0.06, 10.35], fov: 44 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={1}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.45;
          invalidate();
        }}
      >
        <Suspense fallback={null}>
          <SubPageTitleScene text={text} />
        </Suspense>
      </Canvas>
    </WebGLSceneBoundary>
  );
}
