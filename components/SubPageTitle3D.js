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

const SCENE_BG = '#000000';

/** 네비용 `>Who` 등 → 3D에는 `>` 제외 */
function titleFor3D(raw) {
  if (!raw) return '';
  return raw.replace(/^>\s*/, '').trim();
}

/** Hero `SceneSolidBackdrop` 와 동일 — transmission 재질이 투명 배경에선 회색으로 죽으므로 검정 필수 */
function SceneSolidBackdrop() {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    scene.background = new THREE.Color(SCENE_BG);
    invalidate();
    return () => {
      scene.background = null;
    };
  }, [scene, invalidate]);
  return null;
}

const GLASS_BASE = {
  transparent: true,
  transmission: 0.94,
  thickness: 0.12,
  roughness: 0.028,
  metalness: 0.03,
  ior: 1.52,
  color: '#fafcff',
  envMapIntensity: 1.65,
  emissive: '#f0f4ff',
  emissiveIntensity: 0.24,
  attenuationColor: '#ffffff',
  attenuationDistance: 0.52,
  clearcoat: 0.55,
  clearcoatRoughness: 0.09,
};

/**
 * Hero ExtrudedLetter mode=view 부유 + 포인터 호버 시 살짝 커지고 하이라이트(히어로 타이포와 유사).
 */
function FloatingTitleMesh({ text, font, textSize, reduceMotion, strongHover = false }) {
  const hs = strongHover ? 1.5 : 1;
  const groupRef = useRef(null);
  const matRef = useRef(/** @type {THREE.MeshPhysicalMaterial | null} */ (null));
  const hoverTarget = useRef(0);
  const hoverSmoothed = useRef(0);
  const extrudeScale = textSize / TEXT_SIZE_BASE;
  const floatPhase = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
  }, [text]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    const mat = matRef.current;
    if (!g) return;

    if (!reduceMotion) {
      hoverSmoothed.current = THREE.MathUtils.damp(
        hoverSmoothed.current,
        hoverTarget.current,
        strongHover ? 12 : 10,
        delta
      );
    } else {
      hoverSmoothed.current = 0;
    }
    const h = hoverSmoothed.current;

    if (mat) {
      mat.envMapIntensity = GLASS_BASE.envMapIntensity + h * 0.28 * hs;
      mat.emissiveIntensity = GLASS_BASE.emissiveIntensity + h * 0.26 * hs;
      mat.clearcoat = GLASS_BASE.clearcoat + h * 0.12 * hs;
    }

    const t = state.clock.elapsedTime;
    const a = floatPhase;
    const floatMul = strongHover ? 1.18 : 1;
    const bobScale = 1 + Math.sin(t * 0.92 + a * 2.1) * 0.01 * floatMul;
    const scaleBoost = 1 + h * (0.045 + (strongHover ? 0.028 : 0)) * hs;
    g.scale.setScalar(scaleBoost * bobScale);

    if (reduceMotion) {
      g.position.set(0, 0, 0);
      g.rotation.set(0, 0, 0);
      g.scale.setScalar(1);
      if (mat) {
        mat.envMapIntensity = GLASS_BASE.envMapIntensity;
        mat.emissiveIntensity = GLASS_BASE.emissiveIntensity;
        mat.clearcoat = GLASS_BASE.clearcoat;
      }
      return;
    }
    // 서브페이지: "그 자리에서 살짝 부유" — 이동/회전량을 작게 고정
    const ampX = 0.032 * floatMul;
    const ampY = 0.052 * floatMul;
    const ampZ = 0.02 * floatMul;
    const fx = Math.cos(t * 0.75 + a * 2.03) * ampX + Math.cos(t * 0.33 + a * 1.2) * ampX * 0.35;
    const fy = Math.sin(t * 0.9 + a) * ampY + Math.sin(t * 0.41 + a * 1.7) * ampY * 0.42;
    const fz = Math.sin(t * 0.6 + a * 0.95) * ampZ;

    const rxIdle = Math.sin(t * 0.72 + a) * 0.03 * floatMul;
    const ryIdle = Math.cos(t * 0.58 + a * 1.3) * 0.028 * floatMul;
    const rzIdle = Math.sin(t * 0.46 + a * 0.77) * 0.022 * floatMul;

    const hz = h * (0.06 + (strongHover ? 0.05 : 0)) * hs;
    g.position.set(
      fx,
      fy,
      fz + hz
    );
    g.rotation.set(
      rxIdle + h * (0.04 + (strongHover ? 0.035 : 0)) * hs,
      ryIdle - h * (0.035 + (strongHover ? 0.04 : 0)) * hs,
      rzIdle + h * (strongHover ? 0.022 : 0) * hs
    );
  });

  const onPointerOver = (e) => {
    e.stopPropagation();
    hoverTarget.current = 1;
  };
  const onPointerOut = (e) => {
    e.stopPropagation();
    hoverTarget.current = 0;
  };

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
          onPointerOver={reduceMotion ? undefined : onPointerOver}
          onPointerOut={reduceMotion ? undefined : onPointerOut}
        >
          {text}
          <meshPhysicalMaterial
            ref={matRef}
            transparent={GLASS_BASE.transparent}
            transmission={GLASS_BASE.transmission}
            thickness={GLASS_BASE.thickness}
            roughness={GLASS_BASE.roughness}
            metalness={GLASS_BASE.metalness}
            ior={GLASS_BASE.ior}
            color={GLASS_BASE.color}
            envMapIntensity={GLASS_BASE.envMapIntensity}
            emissive={GLASS_BASE.emissive}
            emissiveIntensity={GLASS_BASE.emissiveIntensity}
            attenuationColor={GLASS_BASE.attenuationColor}
            attenuationDistance={GLASS_BASE.attenuationDistance}
            clearcoat={GLASS_BASE.clearcoat}
            clearcoatRoughness={GLASS_BASE.clearcoatRoughness}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function SubPageTitleScene({ text, strongHover = false }) {
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

  /** view 비율 유지 후 2배 스케일 — 카메라 z 를 당겨 프레이밍 맞춤 */
  const textSize = useMemo(() => {
    const len = Math.max(4, text.length);
    const fromView = (TEXT_SIZE_VIEW * 4) / len;
    const base = Math.min(TEXT_SIZE_VIEW * 1.02, Math.max(1.35, fromView));
    return base * 2;
  }, [text]);

  return (
    <>
      <SceneSolidBackdrop />
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
        strongHover={strongHover}
      />
    </>
  );
}

/**
 * 서브페이지 3D 타이틀 — 히어로 `view`와 동일 씬 배경(#000)·조명·GlassTransmission·톤매핑.
 * (투명 캔버스는 physical transmission 이 화면 밖을 굴절할 때 회색/무광처럼 보임)
 */
export default function SubPageTitle3D({ text, strongHover = false }) {
  const meshText = titleFor3D(text);
  if (!meshText) return null;

  return (
    <WebGLSceneBoundary fallback={null}>
      <Canvas
        className={`page-sub__title-3d-canvas${strongHover ? ' page-sub__title-3d-canvas--hoverable' : ''}`}
        frameloop="always"
        resize={{ debounce: 120, scroll: false }}
        camera={{ position: [0, 0.06, 14.25], fov: 44 }}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={1}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.45;
          invalidate();
        }}
      >
        <Suspense fallback={null}>
          <SubPageTitleScene text={meshText} strongHover={strongHover} />
        </Suspense>
      </Canvas>
    </WebGLSceneBoundary>
  );
}
