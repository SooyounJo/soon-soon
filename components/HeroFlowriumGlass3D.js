import {
  Suspense,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
  Bounds,
  Center,
  Environment,
  Html,
  RoundedBox,
  MeshTransmissionMaterial,
  Text3D,
  useBounds,
} from '@react-three/drei';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import * as THREE from 'three';
import { useRouter } from 'next/router';
import WebGLSceneBoundary from './WebGLSceneBoundary';

const _v = new THREE.Vector3();
const _closest = new THREE.Vector3();
const _side = new THREE.Vector3();

/** 물방울 — 소수만, r·X/Z 다양 */
const WATER_DROPLETS = [
  { base: [5.9, 0, 0.52], r: 0.34, ph: [0.2, 0.9, 1.4] },
  { base: [-6.0, 0, 0.45], r: 0.16, ph: [1.1, 0.3, 2.0] },
  { base: [4.4, 0, 0.55], r: 0.28, ph: [0.7, 1.6, 0.5] },
  { base: [-4.6, 0, 0.65], r: 0.2, ph: [1.5, 0.8, 1.2] },
  { base: [0.2, 0, 0.9], r: 0.32, ph: [0.9, 1.3, 0.6] },
  { base: [-0.35, 0, 0.5], r: 0.15, ph: [1.3, 0.6, 1.1] },
  { base: [2.5, 0, 0.75], r: 0.22, ph: [0.33, 1.42, 2.15] },
  { base: [-2.6, 0, 0.3], r: 0.26, ph: [1.62, 0.25, 0.72] },
];

/** 비 궤도: 월드 Y(위→아래) */
const RAIN_Y_TOP = 4.6;
const RAIN_Y_BOTTOM = -4.2;

/** 글자·방울 낙하 강도 (월드 Y, 음수 = 아래) */
const LETTER_FALL_DIST = 9.35;
const LETTER_SCATTER = 2.35;
const DROPLET_FLOOR_Y = -5.85;

/** soon 위 · view 아래(세로 스택). 스크롤 p↑ → 씬 패닝으로 view가 화면 중앙으로 */
const TYPO_SOON_LOCAL_Y = 1.18;
const TYPO_VIEW_LOCAL_Y = -5.05;
const SCROLL_PAN_Y_AT_FULL = -TYPO_VIEW_LOCAL_Y;

/** 문서 스크롤 0~1: 여기까지 soon 낙하 / 이후 view + 물방울 원형 */
const PHASE1_END = 0.44;
/** view 아래 원형 슬롯 수 — 물방울 0..COUNT-1이 이 위치로 모임 */
const CIRCLE_DROPLET_COUNT = 4;
/** 정면 시야에 평평한 원(XY 평면, z=0) — 바닥(XZ)에 두면 원이 화면에서 타원처럼 보임 */
const DROPLET_CIRCLE_R = 2.85;
/** 원 중심의 Y (view 아래쪽) */
const DROPLET_CIRCLE_CENTER_Y = -3.35;

// 1-2) "Visual Coding" 2D 텍스트를 특정 구간에만 고정 노출
// (초입부: 물방울 계속 + 타이포 호버 유지 → PHASE1 말미에만 매핑)
const VISUAL_CODING_START = PHASE1_END - 0.045; // ~0.395

const BUTTONS_BASE_Y = -4.35; // 화면 하단 중앙 버튼 최종 위치(월드 y)
const BUTTONS_RISE_Y = 0.45; // 살짝 아래에서 올라오게 하는 시작 오프셋(월드 단위)

/**
 * 카메라 정면과 평행한 평면 위 슬롯 [x,y,z]
 * @param {number} i
 * @param {number} count
 */
function orbitSlotFrontalPlane(i, count) {
  const ang = (i / count) * Math.PI * 2 - Math.PI / 2;
  return [
    DROPLET_CIRCLE_R * Math.cos(ang),
    DROPLET_CIRCLE_CENTER_Y + DROPLET_CIRCLE_R * Math.sin(ang),
    0,
  ];
}

/** `public/fonts/BagelFatOne-Regular.ttf` — Three `TTFLoader`가 런타임에 typeface 형으로 파싱 (별도 JSON 불필요) */
const BAGEL_TTF = '/fonts/BagelFatOne-Regular.ttf';

const LINES_SOON = ['soon', '-', 'soon'];
const LINES_VIEW = ['view'];

/** 입체 스케일 — 화면 대비 (물방울 줄인 만큼 타이포 비중↑) */
const TEXT_SIZE = 1.34;
/** 줄 사이(라인 중심 간격) */
const LINE_STEP_EM = 1.18;
/** Text3D Z 익스트루드 */
const EXTRUDE_DEPTH = 0.175;
const BEVEL_THICKNESS = 0.062;
const BEVEL_SIZE = 0.054;
const BEVEL_SEGMENTS = 5;
const CURVE_SEGMENTS = 10;

/** 페이지·씬·굴절 FBO 공통 블랙 (--flowrium-mint-bg) */
const SCENE_BG = '#000000';
const SCENE_CLEAR_HEX = 0x000000;
const GLASS_CAPTURE_BG = new THREE.Color(SCENE_BG);

/** 스크롤 낙하 진행 0→1 (Canvas 내부에서 useFrame으로 스무딩) */
const ScrollFallContext = createContext(
  /** @type {React.MutableRefObject<number>} */ ({ current: 0 })
);

function easeScrollFall(p) {
  const u = Math.min(1, Math.max(0, p));
  return u * u * (3 - 2 * u);
}

/** 1페이즈(soon) 낙하에만 쓰는 진행 0→1 */
function scrollPhase1Ease(p) {
  const p1 = Math.min(1, p / PHASE1_END);
  return easeScrollFall(p1);
}

/** 2페이즈(view·원) 진행 0→1 */
function scrollPhase2Ease(p) {
  if (p <= PHASE1_END) return 0;
  return easeScrollFall(Math.min(1, (p - PHASE1_END) / (1 - PHASE1_END)));
}

function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * typeface glyph.ha로 한 줄의 글자 중심 X
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

/**
 * 멀티라인: 각 글자 world 위치 [x,y,z] (y는 위로 +)
 */
function buildLetterLayout(fontData, lines, size) {
  const lineStep = size * LINE_STEP_EM;
  const n = lines.length;
  const items = [];
  for (let li = 0; li < n; li++) {
    const line = lines[li];
    const y = ((n - 1) / 2 - li) * lineStep;
    const centers = getLetterCenters(fontData, line, size);
    const chars = Array.from(line);
    for (let i = 0; i < chars.length; i++) {
      items.push({
        char: chars[i],
        position: [centers[i][0], y, 0],
        key: `L${li}-C${i}-${chars[i]}`,
      });
    }
  }
  return items;
}

/**
 * MeshTransmission 샘플 일관을 위해 씬 배경·클리어를 페이지와 동일 색으로 통일.
 */
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

/** demand 루프: 로드·Bounds fit 동안 충분히 invalidate */
function DemandBootFrames() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      invalidate();
      if (now - t0 < 880) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);
  return null;
}

function RefitBoundsAfterLoad({ mode }) {
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
  }, [api, invalidate, mode]);
  return null;
}

/** 물방울 — 물에 가깝게(IOR·톤), 구는 살짝 찌그러진 물방울 형태 */
function DropletMaterial() {
  return (
    <MeshTransmissionMaterial
      backside
      backsideThickness={0.055}
      backsideEnvMapIntensity={0.82}
      samples={2}
      resolution={112}
      transmission={1}
      thickness={0.11}
      roughness={0.034}
      metalness={0.015}
      chromaticAberration={0.05}
      anisotropicBlur={0.078}
      distortion={0.12}
      distortionScale={0.26}
      temporalDistortion={0.012}
      ior={1.333}
      color="#f0f8ff"
      background={GLASS_CAPTURE_BG}
      envMapIntensity={1.15}
    />
  );
}

function GlassTransmission() {
  return (
    <MeshTransmissionMaterial
      backside
      backsideThickness={0.055}
      backsideEnvMapIntensity={0.9}
      samples={3}
      resolution={192}
      transmission={1}
      thickness={0.075}
      roughness={0.038}
      metalness={0.04}
      chromaticAberration={0.086}
      anisotropicBlur={0.078}
      distortion={0.16}
      distortionScale={0.35}
      temporalDistortion={0.014}
      ior={1.52}
      color="#ffffff"
      background={GLASS_CAPTURE_BG}
      envMapIntensity={1.32}
    />
  );
}

function ExtrudedLetter({ char, position, font, letterKey, floatPhase = 0, mode = 'soon' }) {
  const meshRef = useRef(null);
  const groupRef = useRef(null);
  const basePos = useRef(new THREE.Vector3(...position));
  const target = useRef({ rx: 0, ry: 0, z: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const scrollFallRef = useContext(ScrollFallContext);
  const hx = useMemo(() => hash01(`${letterKey}x`), [letterKey]);
  const hy = useMemo(() => hash01(`${letterKey}y`), [letterKey]);
  const hz = useMemo(() => hash01(`${letterKey}z`), [letterKey]);

  useLayoutEffect(() => {
    basePos.current.set(position[0], position[1], position[2]);
  }, [position]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const a = floatPhase;
    const p = scrollFallRef.current;
    const ampY = 0.042;
    const ampX = 0.018;
    const ampZ = 0.011;
    const fy =
      Math.sin(t * 1.08 + a) * ampY + Math.sin(t * 0.48 + a * 1.7) * ampY * 0.42;
    const fx = Math.cos(t * 0.85 + a * 2.03) * ampX;
    const fz = Math.sin(t * 0.62 + a * 0.95) * ampZ;

    const g = groupRef.current;
    const m = meshRef.current;

    if (mode === 'soon') {
      const e = scrollPhase1Ease(p);
      const settle = 1 - e * 0.94;
      const ang = (hx * 6.2831853 + floatPhase) * 1.17;
      const spreadR = e * LETTER_SCATTER;
      const spreadX = Math.cos(ang) * spreadR * (0.35 + hx * 0.65) + (hz - 0.5) * e * 0.55;
      const spreadZ = Math.sin(ang * 1.63) * spreadR * 0.88 + (hy - 0.5) * e * 0.9;
      const fallY = -e * LETTER_FALL_DIST;

      if (g) {
        g.position.set(
          basePos.current.x + fx * settle + spreadX,
          basePos.current.y + fy * settle + fallY,
          basePos.current.z + fz * settle + spreadZ
        );
        const tumble = 1 - e * 0.35;
        g.rotation.set(
          e * (hy - 0.5) * 2.05 * tumble,
          e * (hz - 0.5) * 2.65 * tumble,
          e * (hx - 0.5) * 1.85 * tumble
        );
        g.scale.setScalar(1);
      }

      if (m) {
        const k = Math.min(delta * 14, 0.38);
        const hover = 1 - e * 0.85;
        m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, target.current.rx * hover, k);
        m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, target.current.ry * hover, k);
        m.position.z = THREE.MathUtils.lerp(m.position.z, target.current.z * hover, k);
      }
    } else {
      const e2 = scrollPhase2Ease(p);
      const assemble = 1 - e2;
      const settle = 1 - e2 * 0.55;
      /** 정면에 가까울수록 떠다니는 흔들림 감소 */
      const floatDamp = 1 - e2 * 0.92;
      const spreadX = assemble * (hx - 0.5) * 1.05;
      const spreadY = assemble * (hy - 0.5) * 0.65;
      const spreadZ = assemble * (hz - 0.5) * 0.85;

      if (g) {
        g.position.set(
          basePos.current.x + fx * settle * floatDamp + spreadX,
          basePos.current.y + fy * settle * floatDamp + spreadY,
          basePos.current.z + fz * settle * floatDamp + spreadZ
        );
        g.rotation.set(
          assemble * (hy - 0.5) * 1.45,
          assemble * (hz - 0.5) * 1.85,
          assemble * (hx - 0.5) * 1.25
        );
        g.scale.setScalar(0.76 + 0.24 * e2);
      }

      if (m) {
        const k = Math.min(delta * 14, 0.38);
        const hover = 1 - e2 * 0.5;
        m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, target.current.rx * hover, k);
        m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, target.current.ry * hover, k);
        m.position.z = THREE.MathUtils.lerp(m.position.z, target.current.z * hover, k);
      }
    }
  });

  const onHover = () => {
    document.body.style.cursor = 'pointer';
    target.current = { rx: -0.42, ry: 0.38, z: 0.13 };
    invalidate();
  };
  const onLeave = () => {
    document.body.style.cursor = '';
    target.current = { rx: 0, ry: 0, z: 0 };
    invalidate();
  };

  return (
    <group ref={groupRef}>
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

function WaterDropletsField() {
  const camera = useThree((s) => s.camera);
  const raycaster = useThree((s) => s.raycaster);
  const invalidate = useThree((s) => s.invalidate);
  const scrollFallRef = useContext(ScrollFallContext);
  const stateRef = useRef(
    WATER_DROPLETS.map((o, i) => ({
      base: new THREE.Vector3(o.base[0], o.base[1], o.base[2]),
      ph: o.ph,
      r: o.r,
      flee: new THREE.Vector3(),
      mesh: /** @type {THREE.Mesh | null} */ (null),
      /** 0~1: 위→아래 진행, 넘치면 다시 위에서 */
      fall: (i / Math.max(1, WATER_DROPLETS.length) + o.ph[1] * 0.07) % 1,
      /** 낙하 속도 (방울마다 조금씩 다름, 전체적으로 느리게) */
      speed: 0.1 + (o.ph[0] % 1) * 0.06 + (i % 4) * 0.018,
    }))
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const ptr = state.pointer;
    const p = scrollFallRef.current;
    const e1 = scrollPhase1Ease(p);
    const e2 = scrollPhase2Ease(p);
    const settle = 1 - e1 * 0.92;
    raycaster.setFromCamera(ptr, camera);
    const ray = raycaster.ray;
    const dt = Math.min(delta * 60, 2.5);

    for (let i = 0; i < stateRef.current.length; i++) {
      const s = stateRef.current[i];
      const mesh = s.mesh;
      if (!mesh) continue;

      if (e1 < 0.985) {
        s.fall += s.speed * delta * 0.22 * (1 - e1 * 0.75);
        if (s.fall > 1) s.fall -= 1;
      }

      const rainY = THREE.MathUtils.lerp(RAIN_Y_TOP, RAIN_Y_BOTTOM, s.fall);
      const by = THREE.MathUtils.lerp(rainY, DROPLET_FLOOR_Y, e1);
      const sway =
        (Math.sin(t * 0.55 + s.ph[0]) * 0.18 + Math.sin(t * 1.1 + s.ph[1]) * 0.06) * settle;
      const bx = s.base.x + sway;
      const bz = (s.base.z + Math.cos(t * 0.42 + s.ph[2]) * 0.14) * (0.88 + e1 * 0.12);

      const oc = _v.set(bx, by, bz).sub(ray.origin);
      const proj = oc.dot(ray.direction);
      _closest.copy(ray.origin).addScaledVector(ray.direction, Math.max(0, proj));
      const distRay = _v.set(bx, by, bz).distanceTo(_closest);
      const near = 1.35;
      if (distRay < near && e2 < 0.65) {
        _v.set(bx, by, bz).sub(_closest);
        if (_v.lengthSq() < 1e-6) _v.set(1, 0.35, 0);
        _v.normalize();
        const push = (near - distRay) * 2.6 * dt;
        s.flee.addScaledVector(_v, push * 0.014);
      }

      s.flee.multiplyScalar(Math.pow(0.9, dt));

      let px = bx + s.flee.x;
      let py = by + s.flee.y;
      let pz = bz + s.flee.z;

      if (p >= PHASE1_END && i < CIRCLE_DROPLET_COUNT) {
        const [tx, ty, tz] = orbitSlotFrontalPlane(i, CIRCLE_DROPLET_COUNT);
        px = THREE.MathUtils.lerp(px, tx, e2);
        py = THREE.MathUtils.lerp(py, ty, e2);
        pz = THREE.MathUtils.lerp(pz, tz, e2);
        const g = 1 + e2 * 0.06;
        mesh.scale.set(0.88 * g, 1.14 * g, 0.92 * g);
      } else if (p >= PHASE1_END && i >= CIRCLE_DROPLET_COUNT) {
        const hide = Math.max(0.002, 1 - e2);
        mesh.scale.set(0.88 * hide, 1.14 * hide, 0.92 * hide);
      } else {
        mesh.scale.set(0.88, 1.14, 0.92);
      }

      mesh.position.set(px, py, pz);
      const spin = 1 - e1 * 0.88;
      mesh.rotation.x = t * 0.55 * spin * (1 - e2 * 0.75) + s.ph[0];
      mesh.rotation.y = t * 0.4 * spin * (1 - e2 * 0.75) + s.ph[1];

      mesh.visible = !(p >= PHASE1_END && i < CIRCLE_DROPLET_COUNT && e2 > 0.22);
    }
  });

  return (
    <group>
      {WATER_DROPLETS.map((o, i) => (
        <mesh
          key={i}
          ref={(el) => {
            stateRef.current[i].mesh = el;
          }}
          castShadow={false}
          receiveShadow={false}
          onPointerOver={(e) => {
            e.stopPropagation();
            const s = stateRef.current[i];
            _v.copy(e.object.position).sub(camera.position).normalize();
            s.flee.addScaledVector(_v, 0.72);
            _side.crossVectors(_v, new THREE.Vector3(0, 1, 0));
            if (_side.lengthSq() < 1e-4) _side.set(1, 0, 0);
            _side.normalize();
            s.flee.addScaledVector(_side, (Math.random() - 0.5) * 0.55);
            document.body.style.cursor = 'pointer';
            invalidate();
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = '';
            invalidate();
          }}
        >
          <sphereGeometry args={[o.r, 28, 28]} />
          <DropletMaterial />
        </mesh>
      ))}
    </group>
  );
}

/** view(TEXT_SIZE)보다 작은 원형 라벨 */
const NAV_TEXT_SIZE = 0.32;
const NAV_EXTRUDE = 0.068;

const NAV_ORBIT_ITEMS = [
  { label: '2d', path: '/2d' },
  { label: '3d', path: '/3d' },
  { label: 'VID', path: '/vid' },
  { label: 'OBJ', path: '/obj' },
];

function NavOrbitCluster() {
  const scrollRef = useContext(ScrollFallContext);
  const fontData = useLoader(TTFLoader, BAGEL_TTF);
  const router = useRouter();
  const invalidate = useThree((s) => s.invalidate);
  const rootRef = useRef(null);

  useFrame(() => {
    const e2 = scrollPhase2Ease(scrollRef.current);
    const reveal = THREE.MathUtils.smoothstep(e2, 0.36, 0.85);
    if (rootRef.current) {
      rootRef.current.visible = reveal > 0.02;
      rootRef.current.scale.setScalar(Math.max(0.001, reveal));
    }
  });

  const go =
    (path) =>
    (/** @type {THREE.Event & { stopPropagation: () => void }} */ e) => {
      e.stopPropagation();
      router.push(path);
    };

  const hoverProps = {
    onPointerOver: () => {
      document.body.style.cursor = 'pointer';
      invalidate();
    },
    onPointerOut: () => {
      document.body.style.cursor = '';
      invalidate();
    },
  };

  return (
    <group ref={rootRef}>
      {NAV_ORBIT_ITEMS.map((item, i) => {
        const [x, y, z] = orbitSlotFrontalPlane(i, CIRCLE_DROPLET_COUNT);
        return (
          <group key={`nav-${i}`} position={[x, y, z]}>
            <Center>
              <Text3D
                font={fontData}
                size={NAV_TEXT_SIZE}
                height={NAV_EXTRUDE}
                letterSpacing={0}
                lineHeight={1}
                curveSegments={10}
                bevelEnabled
                bevelThickness={0.024}
                bevelSize={0.02}
                bevelOffset={0}
                bevelSegments={4}
                {...hoverProps}
                onClick={go(item.path)}
              >
                {item.label}
                <GlassTransmission />
              </Text3D>
            </Center>
          </group>
        );
      })}
    </group>
  );
}

/** 문서 스크롤 0→1 ↔ smooth (양방향 연속). soon·방울 낙하 + 씬 패닝으로 view 중앙 정렬 */
function ScrollFallBridge({ children }) {
  const target = useRef(0);
  const smooth = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  const camera = useThree((s) => s.camera);
  const baseCam = useRef(/** @type {{ x: number; y: number; z: number } | null} */ (null));

  useLayoutEffect(() => {
    baseCam.current = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };
  }, [camera]);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      target.current = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      invalidate();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [invalidate]);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-14 * delta);
    const prev = smooth.current;
    smooth.current += (target.current - smooth.current) * k;

    const p = smooth.current;
    const e2 = scrollPhase2Ease(p);
    const b = baseCam.current;
    if (b) {
      camera.position.x = THREE.MathUtils.lerp(b.x, 0, e2);
      camera.position.y = b.y;
      camera.position.z = b.z;
    }

    if (
      Math.abs(prev - smooth.current) > 1e-5 ||
      Math.abs(target.current - smooth.current) > 2e-3
    ) {
      invalidate();
    }
  });

  return (
    <ScrollFallContext.Provider value={smooth}>
      <group>{children}</group>
    </ScrollFallContext.Provider>
  );
}

/** soon은 비스듬히 · view 구간은 스크롤(페이즈2)에 따라 정면으로 — 타이포·원형 라벨 동일 기울기 */
const TEXT_TILT_RX = 0.02;
const TEXT_TILT_RY = -0.05;

function ViewScrollFacingGroup({ children }) {
  const scrollRef = useContext(ScrollFallContext);
  const groupRef = useRef(null);

  useFrame(() => {
    const p = scrollRef.current;
    const inViewPhase = p >= PHASE1_END;
    const e2 = scrollPhase2Ease(p);
    const t = inViewPhase ? e2 : 0;
    const rx = THREE.MathUtils.lerp(TEXT_TILT_RX, 0, t);
    const ry = THREE.MathUtils.lerp(TEXT_TILT_RY, 0, t);
    if (groupRef.current) {
      groupRef.current.rotation.set(rx, ry, 0);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * 1) 특정 스크롤 구간: 중앙 2D 텍스트(Visual Coding) 매핑
 * 2) 다음 스크롤 구간(view): 아래 4개 글래스 모피즘 카드 노출
 * - view의 유리 3D 타이포는 그대로 유지
 * - 기존 orbit 3D 네비는 제거
 */
function ScrollMappedOverlays() {
  const scrollRef = useContext(ScrollFallContext);
  const codingRef = useRef(null);
  const invalidate = useThree((s) => s.invalidate);

  useFrame(() => {
    const p = scrollRef.current;
    const showCoding = p >= VISUAL_CODING_START && p < PHASE1_END;

    if (!codingRef.current) return;

    const t = THREE.MathUtils.smoothstep(
      VISUAL_CODING_START,
      VISUAL_CODING_START + 0.03,
      p
    );
    const opacity = showCoding ? t : 0;
    const y = (1 - t) * 4; // fullscreen 기준이라 이동량 줄임
    codingRef.current.style.opacity = String(opacity);
    codingRef.current.style.transform = `translate3d(0, ${y}px, 0)`;

    // demand frameloop: DOM 애니메이션이 끊기지 않게 1프레임 보정
    if (showCoding) invalidate();
  });

  return (
    <>
      <Html fullscreen center style={{ pointerEvents: 'none' }}>
        <div
          ref={codingRef}
          className="scroll-mapped-visualcoding bagel-fat-one-regular"
        >
          비주얼코딩
        </div>
      </Html>
      <ScrollGlassButtons />
    </>
  );
}

function GlassButton({
  label,
  font,
  position,
  onClick,
  w = 2.4,
  h = 0.42,
  d = 0.16,
  r = 0.24,
}) {
  const meshRef = useRef(null);
  const hoverRef = useRef(0);
  const invalidate = useThree((s) => s.invalidate);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const k = Math.min(delta * 10, 1);
    const targetScale = 1 + hoverRef.current * 0.03;
    const s = mesh.scale;
    s.setScalar(THREE.MathUtils.lerp(s.x, targetScale, k));
  });

  const onOver = () => {
    hoverRef.current = 1;
    document.body.style.cursor = 'pointer';
    invalidate();
  };

  const onOut = () => {
    hoverRef.current = 0;
    document.body.style.cursor = '';
    invalidate();
  };

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onOver();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onOut();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <mesh
        ref={meshRef}
        castShadow={false}
        receiveShadow={false}
      >
        <RoundedBox args={[w, h, d]} radius={r} smoothness={6} bevelSegments={2} steps={1} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.05}
          backsideEnvMapIntensity={0.62}
          samples={2}
          resolution={96}
          transmission={0.85}
          thickness={0.06}
          roughness={0.085}
          metalness={0.02}
          chromaticAberration={0.04}
          anisotropicBlur={0.075}
          distortion={0.09}
          distortionScale={0.22}
          temporalDistortion={0.008}
          ior={1.52}
          color="#f6fbff"
          background={GLASS_CAPTURE_BG}
          envMapIntensity={0.9}
        />
      </mesh>
      <Text3D
        font={font}
        size={0.36}
        height={0.0015}
        letterSpacing={0}
        lineHeight={1}
        bevelEnabled={false}
        curveSegments={6}
        bevelThickness={0}
        bevelSize={0}
        bevelOffset={0}
        bevelSegments={0}
        position={[0, 0, d * 0.45]}
      >
        {label}
      </Text3D>
    </group>
  );
}

function ScrollGlassButtons() {
  const scrollRef = useContext(ScrollFallContext);
  const router = useRouter();
  const invalidate = useThree((s) => s.invalidate);
  const fontData = useLoader(TTFLoader, BAGEL_TTF);
  const rootRef = useRef(null);
  const lastShowRef = useRef(false);

  const items = useMemo(
    () => [
      { label: '2D', path: '/2d', x: -1.75, yOff: 0, z: 0 },
      { label: '3D', path: '/3d', x: 1.75, yOff: 0, z: 0 },
      { label: 'VID', path: '/vid', x: -1.75, yOff: -0.82, z: 0 },
      { label: 'OBJ', path: '/obj', x: 1.75, yOff: -0.82, z: 0 },
    ],
    []
  );

  useFrame(() => {
    const p = scrollRef.current;
    const showButtons = p >= PHASE1_END;
    const root = rootRef.current;
    if (!root) return;

    root.visible = showButtons;
    const e2 = scrollPhase2Ease(p);
    const t = THREE.MathUtils.clamp((e2 - 0.02) / 0.25, 0, 1);
    const y = THREE.MathUtils.lerp(BUTTONS_BASE_Y - BUTTONS_RISE_Y, BUTTONS_BASE_Y, t);
    root.position.y = y;
    root.scale.setScalar(0.99 + 0.01 * t);
    if (showButtons !== lastShowRef.current) {
      lastShowRef.current = showButtons;
      invalidate();
    }
  });

  return (
    <group ref={rootRef} visible={false}>
      {items.map((item) => (
        <GlassButton
          key={item.path}
          label={item.label}
          font={fontData}
          position={[item.x, item.yOff, item.z]}
          onClick={() => router.push(item.path)}
        />
      ))}
    </group>
  );
}

/** 궤도 영역을 bounds에 넣기 위한 보이지 않는 구 반지름 */
const ORBIT_BOUNDS_PAD_R = DROPLET_CIRCLE_R + 0.75;

/**
 * Bounds.fit()용 보이지 않는 구 — 궤도만 포함하면 박스 중심이 아래로 치우쳐 타이포가 화면 위로 밀림.
 * y=0 기준 위·아래 대칭으로 같은 반지름의 구를 두어 수직 중심을 타이포 근처로 유지.
 */
function OrbitBoundsPadding() {
  const padMat = (
    <meshBasicMaterial
      transparent
      opacity={0}
      depthWrite={false}
      depthTest={false}
    />
  );
  const yLo = Math.min(TYPO_VIEW_LOCAL_Y, DROPLET_CIRCLE_CENTER_Y) - ORBIT_BOUNDS_PAD_R * 0.35;
  const yHi = Math.max(TYPO_SOON_LOCAL_Y, -DROPLET_CIRCLE_CENTER_Y) + ORBIT_BOUNDS_PAD_R * 0.35;
  return (
    <group>
      <mesh position={[0, yLo, 0]} raycast={() => null}>
        <sphereGeometry args={[ORBIT_BOUNDS_PAD_R, 10, 10]} />
        {padMat}
      </mesh>
      <mesh position={[0, yHi, 0]} raycast={() => null}>
        <sphereGeometry args={[ORBIT_BOUNDS_PAD_R, 10, 10]} />
        {padMat}
      </mesh>
    </group>
  );
}

function PhaseTypography({ lines, mode }) {
  const fontData = useLoader(TTFLoader, BAGEL_TTF);
  const invalidate = useThree((s) => s.invalidate);

  const letterItems = useMemo(
    () => buildLetterLayout(fontData, lines, TEXT_SIZE),
    [fontData, lines]
  );

  useLayoutEffect(() => {
    invalidate();
  }, [fontData, lines, invalidate]);

  return (
    <>
      {letterItems.map(({ char, position, key }, i) => (
        <ExtrudedLetter
          key={`${mode}-${key}`}
          letterKey={`${mode}-${key}`}
          char={char}
          position={position}
          font={fontData}
          mode={mode}
          floatPhase={i * 1.37 + char.charCodeAt(0) * 0.19}
        />
      ))}
    </>
  );
}

function HeroViewBlock() {
  const scrollRef = useContext(ScrollFallContext);
  const panRef = useRef(/** @type {THREE.Group | null} */ (null));

  useFrame(() => {
    const p = scrollRef.current;
    const u = easeScrollFall(p);
    const g = panRef.current;
    if (g) {
      g.position.y = u * SCROLL_PAN_Y_AT_FULL;
    }
  });

  return (
    <group ref={panRef}>
      <ViewScrollFacingGroup>
        <Bounds fit clip={false} observe={false} margin={2.12} maxDuration={0}>
          <RefitBoundsAfterLoad mode="stacked" />
          <OrbitBoundsPadding />
          <group position={[0, TYPO_SOON_LOCAL_Y, 0]}>
            <PhaseTypography lines={LINES_SOON} mode="soon" />
          </group>
          <group position={[0, TYPO_VIEW_LOCAL_Y, 0]}>
            <PhaseTypography lines={LINES_VIEW} mode="view" />
          </group>
        </Bounds>
        <WaterDropletsField />
      </ViewScrollFacingGroup>
    </group>
  );
}

export default function HeroFlowriumGlass3D({ onReady }) {
  useEffect(() => {
    return () => {
      if (typeof document === 'undefined') return;
      document
        .querySelector('.hero-flowrium-glass-shell')
        ?.classList.remove('hero-flowrium-webgl-text-ready');
    };
  }, []);

  return (
    <div className="hero-flowrium-glass-root hero-flowrium-glass-root--interactive">
      <WebGLSceneBoundary
        onError={() => {
          document
            .querySelector('.hero-flowrium-glass-shell')
            ?.classList.remove('hero-flowrium-webgl-text-ready');
          onReady?.();
        }}
        fallback={null}
      >
        <Canvas
          frameloop="demand"
          camera={{ position: [0.15, 0.06, 9.6], fov: 44 }}
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 1.22]}
          onCreated={({ gl, invalidate }) => {
            gl.setClearColor(SCENE_CLEAR_HEX, 1);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.24;
            document
              .querySelector('.hero-flowrium-glass-shell')
              ?.classList.add('hero-flowrium-webgl-text-ready');
            onReady?.();
            invalidate();
          }}
        >
          <SceneSolidBackdrop />
          <ambientLight intensity={0.28} />
          <directionalLight
            position={[-9, 11, 6]}
            intensity={2.85}
            color="#fffef8"
            castShadow={false}
          />
          <directionalLight position={[7.5, -3, 5.5]} intensity={1.05} color="#dce8ff" />
          <pointLight position={[-5.5, 8.5, 6.5]} intensity={1.15} color="#ffffff" />
          <hemisphereLight args={['#f2f6ff', '#2a3028', 0.62]} />
          <ScrollFallBridge>
            <Suspense fallback={null}>
              <DemandBootFrames />
              <Environment preset="studio" environmentIntensity={1.18} resolution={128} />
              <HeroViewBlock />
            </Suspense>
            <ScrollMappedOverlays />
          </ScrollFallBridge>
        </Canvas>
      </WebGLSceneBoundary>
    </div>
  );
}
