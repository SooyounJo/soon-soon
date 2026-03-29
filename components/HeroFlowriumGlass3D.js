import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
  Bounds,
  Center,
  Environment,
  MeshTransmissionMaterial,
  Text3D,
  useBounds,
} from '@react-three/drei';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import * as THREE from 'three';

/** `public/fonts/BagelFatOne-Regular.ttf` — Three `TTFLoader`가 런타임에 typeface 형으로 파싱 (별도 JSON 불필요) */
const BAGEL_TTF = '/fonts/BagelFatOne-Regular.ttf';

const WORD = 'FLOWRIUM';
const LETTERS = Array.from(WORD);

/** 입체 스케일 — 작을수록 뷰에 여유 (Bounds 클리핑 완화) */
const TEXT_SIZE = 0.48;
/** Text3D Z 익스트루드 */
const EXTRUDE_DEPTH = 0.12;
const BEVEL_THICKNESS = 0.05;
const BEVEL_SIZE = 0.04;
/** 세그먼트 ↓ = 폴리곤·렉 감소 */
const BEVEL_SEGMENTS = 5;
const CURVE_SEGMENTS = 10;

/** MeshTransmission FBO 캡처 시 배경 대역 — 블러 영상 톤에 맞춘 민트·그레이 */
const GLASS_CAPTURE_BG = new THREE.Color('#c2d4cc');

/**
 * typeface 데이터의 glyph.ha(어드밴스)로 각 글자 중심 X — 한 줄 정렬
 * (고정 step 보다 폰트 메트릭에 맞춤)
 */
function getLetterCenters(fontData, word, size) {
  const resolution = fontData.resolution || 1000;
  const scale = size / resolution;
  const chars = Array.from(word);
  const widths = chars.map((ch) => {
    const g = fontData.glyphs[ch] || fontData.glyphs['?'];
    return g && g.ha != null ? g.ha * scale : size * 0.55;
  });
  const total = widths.reduce((a, b) => a + b, 0);
  const centers = [];
  let left = -total / 2;
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i];
    centers.push([left + w / 2, 0, 0]);
    left += w;
  }
  return centers;
}

/** demand 루프: 로드·Bounds fit 동안 충분히 invalidate */
function DemandBootFrames() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      invalidate();
      if (now - t0 < 720) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);
  return null;
}

function RefitBoundsAfterLoad() {
  const api = useBounds();
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const run = () => {
      api.refresh();
      api.reset().fit();
      invalidate();
    };
    run();
    const ids = [80, 240, 600].map((ms) => window.setTimeout(run, ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [api, invalidate]);
  return null;
}

function GlassTransmission() {
  return (
    <MeshTransmissionMaterial
      backside
      backsideThickness={0.06}
      backsideEnvMapIntensity={0.75}
      samples={4}
      resolution={256}
      transmission={1}
      thickness={0.08}
      roughness={0.045}
      metalness={0.06}
      chromaticAberration={0.1}
      anisotropicBlur={0.06}
      distortion={0.16}
      distortionScale={0.35}
      temporalDistortion={0.02}
      ior={1.52}
      color="#f5f9fc"
      background={GLASS_CAPTURE_BG}
      envMapIntensity={1.05}
    />
  );
}

function ExtrudedLetter({ char, position, font }) {
  const meshRef = useRef(null);
  const target = useRef({ rx: 0, ry: 0, z: 0 });
  const invalidate = useThree((s) => s.invalidate);

  useFrame((_, delta) => {
    const m = meshRef.current;
    if (!m) return;
    const k = Math.min(delta * 14, 0.38);
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, target.current.rx, k);
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, target.current.ry, k);
    m.position.z = THREE.MathUtils.lerp(m.position.z, target.current.z, k);
    const eps = 0.002;
    if (
      Math.abs(m.rotation.x - target.current.rx) > eps ||
      Math.abs(m.rotation.y - target.current.ry) > eps ||
      Math.abs(m.position.z - target.current.z) > eps
    ) {
      invalidate();
    }
  });

  const onHover = () => {
    document.body.style.cursor = 'pointer';
    target.current = { rx: -0.42, ry: 0.38, z: 0.14 };
    invalidate();
  };
  const onLeave = () => {
    document.body.style.cursor = '';
    target.current = { rx: 0, ry: 0, z: 0 };
    invalidate();
  };

  return (
    <group position={position}>
      <Center>
        <Text3D
          ref={meshRef}
          font={font}
          size={TEXT_SIZE}
          height={EXTRUDE_DEPTH}
          letterSpacing={0}
          lineHeight={1}
          curveSegments={CURVE_SEGMENTS}
          bevelEnabled
          bevelThickness={BEVEL_THICKNESS}
          bevelSize={BEVEL_SIZE}
          bevelOffset={0}
          bevelSegments={BEVEL_SEGMENTS}
          onPointerOver={onHover}
          onPointerOut={onLeave}
        >
          {char}
          <GlassTransmission />
        </Text3D>
      </Center>
    </group>
  );
}

function FlowriumExtrudedLetters() {
  const fontData = useLoader(TTFLoader, BAGEL_TTF);
  const invalidate = useThree((s) => s.invalidate);
  const letterPositions = useMemo(
    () => getLetterCenters(fontData, WORD, TEXT_SIZE),
    [fontData]
  );

  useLayoutEffect(() => {
    invalidate();
  }, [fontData, invalidate]);

  return (
    <Bounds fit clip={false} observe margin={0.58} maxDuration={0.22}>
      <RefitBoundsAfterLoad />
      <group rotation={[0.035, -0.08, 0]}>
        {LETTERS.map((ch, i) => (
          <ExtrudedLetter key={`${ch}-${i}`} char={ch} position={letterPositions[i]} font={fontData} />
        ))}
      </group>
    </Bounds>
  );
}

export default function HeroFlowriumGlass3D() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const shell = document.querySelector('.hero-flowrium-glass-shell');
    shell?.classList.add('hero-flowrium-webgl-text-ready');
    return () => {
      shell?.classList.remove('hero-flowrium-webgl-text-ready');
    };
  }, []);

  return (
    <div className="hero-flowrium-glass-root hero-flowrium-glass-root--interactive">
      <Canvas
        frameloop="demand"
        camera={{ position: [0.35, 0.1, 5.4], fov: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={[1, 1.35]}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.14;
          invalidate();
        }}
      >
        <ambientLight intensity={0.16} />
        <directionalLight
          position={[-9, 11, 6]}
          intensity={2.35}
          color="#fffaf4"
          castShadow={false}
        />
        <directionalLight position={[7.5, -3, 5.5]} intensity={0.72} color="#c8dcf0" />
        <pointLight position={[-5.5, 8.5, 6.5]} intensity={0.85} color="#fffdfb" />
        <hemisphereLight args={['#eef4ff', '#1c2218', 0.52]} />
        <Suspense fallback={null}>
          <DemandBootFrames />
          <Environment preset="studio" environmentIntensity={0.98} resolution={128} />
          <FlowriumExtrudedLetters />
        </Suspense>
      </Canvas>
    </div>
  );
}
