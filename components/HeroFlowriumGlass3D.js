import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
  Bounds,
  Center,
  Environment,
  Html,
  MeshTransmissionMaterial,
  Text3D,
  useBounds,
} from '@react-three/drei';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import * as THREE from 'three';
import { useRouter } from 'next/router';
import WebGLSceneBoundary from './WebGLSceneBoundary';

const _v = new THREE.Vector3();
const _wKickLetter = new THREE.Vector3();
const _wKickDir = new THREE.Vector3();
const _repelW = new THREE.Vector3();
const _repelTgt = new THREE.Vector3();
const _viewDir = new THREE.Vector3();
const _quatInv = new THREE.Quaternion();
const _planeHit = new THREE.Vector3();

/** 타이포 커서 밀어내기 — 평면(XY, z=0) 포인터 기준 */
const POINTER_REPEL_RADIUS = 7.35;
const POINTER_REPEL_MAX_PUSH = 1.52;
const POINTER_REPEL_SPRING_K = 40;
const POINTER_REPEL_SPRING_C = 11;

/** 물방울 — r·X/Z 다양, 낙하 위상 분산 (0..3은 phase2 시 원형 슬롯으로 합류) */
const WATER_DROPLETS = [
  { base: [5.9, 0, 0.52], r: 0.34, ph: [0.2, 0.9, 1.4] },
  { base: [-6.0, 0, 0.45], r: 0.16, ph: [1.1, 0.3, 2.0] },
  { base: [4.4, 0, 0.55], r: 0.28, ph: [0.7, 1.6, 0.5] },
  { base: [-4.6, 0, 0.65], r: 0.2, ph: [1.5, 0.8, 1.2] },
  { base: [0.2, 0, 0.9], r: 0.32, ph: [0.9, 1.3, 0.6] },
  { base: [-0.35, 0, 0.5], r: 0.15, ph: [1.3, 0.6, 1.1] },
  { base: [2.5, 0, 0.75], r: 0.22, ph: [0.33, 1.42, 2.15] },
  { base: [-2.8, 0, 0.58], r: 0.19, ph: [0.55, 1.08, 1.65] },
  { base: [3.35, 0, 0.68], r: 0.25, ph: [1.25, 0.45, 2.35] },
  { base: [-5.35, 0, 0.78], r: 0.3, ph: [0.88, 1.72, 0.92] },
  { base: [6.15, 0, 0.42], r: 0.17, ph: [1.62, 0.22, 1.08] },
  { base: [1.1, 0, 0.82], r: 0.21, ph: [0.4, 1.5, 2.05] },
  { base: [-1.65, 0, 0.72], r: 0.27, ph: [1.95, 0.65, 0.38] },
  { base: [4.95, 0, 0.88], r: 0.14, ph: [0.72, 1.22, 1.88] },
  { base: [-3.55, 0, 0.62], r: 0.23, ph: [1.38, 0.88, 2.22] },
  { base: [0.85, 0, 0.48], r: 0.18, ph: [2.05, 1.15, 0.55] },
  { base: [5.45, 0, 0.95], r: 0.26, ph: [0.15, 1.95, 1.42] },
  { base: [-4.95, 0, 0.55], r: 0.2, ph: [1.48, 0.38, 2.48] },
];

/** 비 궤도: 월드 Y(위→아래) */
const RAIN_Y_TOP = 4.6;
const RAIN_Y_BOTTOM = -4.2;

/** 글자·방울 낙하 강도 (월드 Y, 음수 = 아래) */
const LETTER_FALL_DIST = 9.35;
const LETTER_SCATTER = 2.35;
const DROPLET_FLOOR_Y = -5.85;

/** soon 위 · view 아래(세로 스택). 스크롤 p↑ → 씬 패닝으로 view가 화면 중앙으로 */
const TYPO_SOON_LOCAL_Y = 0.92;
/** view `Text3D` 그룹 로컬 Y — soon 스택 대비 상대 위치만 */
const TYPO_VIEW_LOCAL_Y = 0.38;
/** 첫 프레임 pan 기준 */
const HERO_STACK_BASE_Y = 0.15;
/**
 * 스크롤 끝(u=1)에서 view 그룹의 목표 **월드 Y** (클수록 화면에서 더 위).
 * 기존: SCROLL_PAN = -TYPO_VIEW - BASE → pan+TYPO 항상 0이라 TYPO만 바꿔도 화면에서 안 움직임.
 */
const VIEW_AT_REST_WORLD_Y = 1.55;
const SCROLL_PAN_Y_AT_FULL =
  VIEW_AT_REST_WORLD_Y - TYPO_VIEW_LOCAL_Y - HERO_STACK_BASE_Y;

/** 문서 스크롤 0~1: 여기까지 soon 낙하 / 이후 view + 물방울 원형 */
const PHASE1_END = 0.44;
/** view 아래 원형 슬롯 수 — 물방울 0..COUNT-1이 이 위치로 모임 */
const CIRCLE_DROPLET_COUNT = 4;
/** 정면 시야에 평평한 원(XY 평면, z=0) — 바닥(XZ)에 두면 원이 화면에서 타원처럼 보임 */
const DROPLET_CIRCLE_R = 2.85;
/** 원 중심의 Y (view 아래쪽) — 스크롤 후 화면 밖으로 더 내려가기 위해 하단으로 */
const DROPLET_CIRCLE_CENTER_Y = -4.55;

// 1-2) "Visual Coding" 2D 텍스트를 특정 구간에만 고정 노출
// (초입부: 물방울 계속 + 타이포 호버 유지 → PHASE1 말미에만 매핑)
const VISUAL_CODING_START = PHASE1_END - 0.045; // ~0.395

/** view 구간(p2)에서 soon 타이포·방울을 뷰포트 아래로 추가 밀어냄 */
const SOON_TYPO_PHASE2_EXIT = 14;
const DROPLET_PHASE2_OFFSCREEN = 18;

/**
 * 카메라 정면과 평행한 평면 위 슬롯 [x,y,z]
 * @param {number} i
 * @param {number} count
 */
function orbitSlotFrontalPlane(
  i,
  count,
  radius = DROPLET_CIRCLE_R,
  centerY = DROPLET_CIRCLE_CENTER_Y
) {
  const ang = (i / count) * Math.PI * 2 - Math.PI / 2;
  return [
    radius * Math.cos(ang),
    centerY + radius * Math.sin(ang),
    0,
  ];
}

/** `public/fonts/BagelFatOne-Regular.ttf` — Three `TTFLoader`가 런타임에 typeface 형으로 파싱 (별도 JSON 불필요) */
const BAGEL_TTF = '/fonts/BagelFatOne-Regular.ttf';

const LINES_SOON = ['soon', '-', 'soon'];
const LINES_VIEW = ['view'];

/** 입체 스케일 — soon / view 분리(view는 스크롤 후 화면을 크게 채움) */
const TEXT_SIZE_SOON = 2.42;
/** 뷰포트 밖 잘림 방지 — 필요 시 VIEW_AT_REST_WORLD_Y 와 함께 조정 */
const TEXT_SIZE_VIEW = 3.52;
/** ExtrudedLetter 베벨·익스트루드 기준 */
const TEXT_SIZE_BASE = TEXT_SIZE_SOON;
/** 줄 사이(라인 중심 간격) */
const LINE_STEP_EM = 0.72;
/** Text3D Z 익스트루드 */
const EXTRUDE_DEPTH = 0.175;
const BEVEL_THICKNESS = 0.062;
const BEVEL_SIZE = 0.054;
const BEVEL_SEGMENTS = 3;
const CURVE_SEGMENTS = 6;
/** soon 타이포는 더 말랑하게(베벨 라운딩 강화) */
const SOON_BEVEL_MULT = 1.55;

/** 페이지·씬·굴절 FBO 공통 블랙 (--flowrium-mint-bg) */
const SCENE_BG = '#000000';
const SCENE_CLEAR_HEX = 0x000000;
const GLASS_CAPTURE_BG = new THREE.Color(SCENE_BG);

/** 스크롤 낙하 진행 0→1 (Canvas 내부에서 useFrame으로 스무딩) */
const ScrollFallContext = createContext(
  /** @type {React.MutableRefObject<number>} */ ({ current: 0 })
);

/** 글자 클릭 시 무중력 흩어짐 → 복귀 */
const KickScatterContext = createContext(
  /** @type {{ kickRef: React.MutableRefObject<{ startT: number; origin: THREE.Vector3; amp: number }>, trigger: (p: THREE.Vector3, elapsed: number) => void } | null} */ (
    null
  )
);

/**
 * @param {THREE.Object3D} g
 * @param {number} t clock elapsed
 * @param {number} letterPhase
 * @param {{ startT: number; origin: THREE.Vector3; amp: number }} ks
 */
function kickScatterDelta(g, t, letterPhase, ks) {
  const elapsed = t - ks.startT;
  if (elapsed < 0 || elapsed > 2.75) {
    return { px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0 };
  }
  g.getWorldPosition(_wKickLetter);
  _wKickDir.copy(_wKickLetter).sub(ks.origin);
  const dist = Math.max(0.16, _wKickDir.length());
  _wKickDir.multiplyScalar(1 / dist);
  const falloff = ks.amp / (dist * 0.2 + 0.3);
  const env =
    Math.exp(-elapsed * 0.82) * (1 + 0.52 * Math.sin(elapsed * 13.5 + letterPhase * 2.15));
  const mag = falloff * env * 1.08;
  const px = _wKickDir.x * mag;
  const py = _wKickDir.y * mag;
  const pz = _wKickDir.z * mag * 0.74;
  const bob = Math.sin(elapsed * 10.5 + letterPhase * 1.7) * Math.exp(-elapsed * 1.08);
  const rx = _wKickDir.y * mag * 0.58 + bob * mag * 0.22;
  const ry = -_wKickDir.x * mag * 0.46 + bob * mag * 0.14;
  const rz = _wKickDir.z * mag * 0.52 + bob * mag * 0.26;
  return { px, py, pz, rx, ry, rz };
}

/**
 * @param {THREE.Object3D} g
 * @param {THREE.Camera} camera
 * @param {{ cursorHit: { current: THREE.Vector3 }; valid: { current: boolean } } | null} pointerRepel
 * @param {THREE.Vector3} tgtOut 부모 로컬 기준 밀어내기 목표
 */
function computePointerRepelTarget(g, camera, pointerRepel, tgtOut) {
  tgtOut.set(0, 0, 0);
  if (!pointerRepel?.valid.current) return;
  g.getWorldPosition(_wKickLetter);
  _repelW.copy(_wKickLetter).sub(pointerRepel.cursorHit.current);
  const dist = _repelW.length();
  const R = POINTER_REPEL_RADIUS;
  if (dist >= R || dist < 1e-6) return;
  _repelW.normalize();
  const w = (1 - dist / R) ** 1.58 * POINTER_REPEL_MAX_PUSH;
  _repelW.multiplyScalar(w);
  camera.getWorldPosition(_v);
  _viewDir.copy(_wKickLetter).sub(_v).normalize();
  _repelW.addScaledVector(_viewDir, -_repelW.dot(_viewDir));
  if (g.parent) {
    g.parent.getWorldQuaternion(_quatInv);
    _quatInv.invert();
    tgtOut.copy(_repelW).applyQuaternion(_quatInv);
  } else {
    tgtOut.copy(_repelW);
  }
}

/**
 * @param {number} delta
 * @param {THREE.Vector3} tgt
 * @param {THREE.Vector3} pos
 * @param {THREE.Vector3} vel
 */
function stepPointerRepelSpring(delta, tgt, pos, vel) {
  const k = POINTER_REPEL_SPRING_K;
  const c = POINTER_REPEL_SPRING_C;
  vel.x += (tgt.x - pos.x) * k * delta - vel.x * c * delta;
  vel.y += (tgt.y - pos.y) * k * delta - vel.y * c * delta;
  vel.z += (tgt.z - pos.z) * k * delta - vel.z * c * delta;
  pos.x += vel.x * delta;
  pos.y += vel.y * delta;
  pos.z += vel.z * delta;
}

/** 포인터 → 월드 z=0 평면 — 타이포 천천 떨어짐(스프링) */
const PointerRepelContext = createContext(
  /** @type {{ cursorHit: React.MutableRefObject<THREE.Vector3>; valid: React.MutableRefObject<boolean> } | null} */ (
    null
  )
);

/** 모바일 등 coarse pointer에서 품질/빈도 다운 */
const PerfContext = createContext({ coarse: false });

function PointerRepelBinder({ children }) {
  const cursorHit = useRef(new THREE.Vector3());
  const valid = useRef(false);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const api = useMemo(() => ({ cursorHit, valid }), []);

  useFrame((state) => {
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const hit = state.raycaster.ray.intersectPlane(plane, _planeHit);
    if (hit) {
      cursorHit.current.copy(hit);
      valid.current = true;
    } else {
      valid.current = false;
    }
  });

  return <PointerRepelContext.Provider value={api}>{children}</PointerRepelContext.Provider>;
}

function KickScatterBridge({ children }) {
  const kickRef = useRef({
    startT: -1e9,
    origin: new THREE.Vector3(),
    amp: 1.58,
  });
  const invalidate = useThree((s) => s.invalidate);
  const trigger = useCallback(
    (/** @type {THREE.Vector3} */ point, /** @type {number} */ elapsed) => {
      kickRef.current.startT = elapsed;
      kickRef.current.origin.copy(point);
      invalidate();
    },
    [invalidate]
  );
  const api = useMemo(() => ({ kickRef, trigger }), [trigger]);

  return <KickScatterContext.Provider value={api}>{children}</KickScatterContext.Provider>;
}

/** 스크롤 끝(p≈1)에서도 킥 애니가 돌아가도록 demand invalidate */
function KickDemandInvalidate() {
  const api = useContext(KickScatterContext);
  const invalidate = useThree((s) => s.invalidate);
  const { coarse } = useContext(PerfContext);
  const lastRef = useRef(0);
  useFrame((state) => {
    if (!api) return;
    const dt = state.clock.elapsedTime - api.kickRef.current.startT;
    if (dt <= 0.015 || dt >= 2.9) return;

    const now = performance.now();
    const fps = coarse ? 24 : 45;
    if (now - lastRef.current < 1000 / fps) return;
    lastRef.current = now;
    invalidate();
  });
  return null;
}

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
/** 리사이즈·첫 로드 후 WebGL/Bounds/PMREM가 안정될 때까지 기다린 뒤 상위 로더 해제 */
function HeroStableNotifier({ onStable }) {
  const timeoutRef = useRef(0);
  const hasFirstStableRef = useRef(false);

  const schedule = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    const delayMs = hasFirstStableRef.current ? 380 : 760;
    timeoutRef.current = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          hasFirstStableRef.current = true;
          onStable?.();
        });
      });
    }, delayMs);
  }, [onStable]);

  useEffect(() => {
    schedule();
    const onResize = () => schedule();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(timeoutRef.current);
    };
  }, [schedule]);

  return null;
}

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
      if (now - t0 < 420) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);
  return null;
}

function RefitBoundsAfterLoad({ mode }) {
  const api = useBounds();
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  const runRef = useRef(() => {});

  useLayoutEffect(() => {
    runRef.current = () => {
      api.refresh();
      api.reset().fit();
      invalidate();
    };
  }, [api, invalidate]);

  useEffect(() => {
    const run = () => runRef.current?.();

    run();
    const ids = [120, 280, 820].map((ms) => window.setTimeout(run, ms));

    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) run();
      });
    }

    const onPageShow = () => run();
    window.addEventListener('pageshow', onPageShow);
    return () => {
      cancelled = true;
      window.removeEventListener('pageshow', onPageShow);
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [mode]);

  // 캔버스 사이즈가 바뀌는 순간(모바일 주소창/회전/리로드 타이밍)에도 재-fit
  useEffect(() => {
    runRef.current?.();
  }, [size.width, size.height]);
  return null;
}

/** 물방울 — 물에 가깝게(IOR·톤), 구는 살짝 찌그러진 물방울 형태 */
function DropletMaterial() {
  const { coarse } = useContext(PerfContext);
  return (
    <MeshTransmissionMaterial
      backside
      transmission={1}
      thickness={0.45}
      roughness={0.032}
      ior={1.333}
      color="#f8fbff"
      chromaticAberration={coarse ? 0.014 : 0.028}
      anisotropicBlur={coarse ? 0.006 : 0.012}
      distortion={coarse ? 0.08 : 0.12}
      distortionScale={coarse ? 0.18 : 0.24}
      temporalDistortion={coarse ? 0.05 : 0.09}
      samples={coarse ? 2 : 4}
      resolution={coarse ? 96 : 144}
    />
  );
}

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

function ExtrudedLetter({
  char,
  position,
  font,
  letterKey,
  floatPhase = 0,
  mode = 'soon',
  textSize = TEXT_SIZE_SOON,
}) {
  const { coarse } = useContext(PerfContext);
  const bevelMult = !coarse && mode === 'soon' ? SOON_BEVEL_MULT : 1;
  const groupRef = useRef(null);
  const basePos = useRef(new THREE.Vector3(...position));
  const scrollFallRef = useContext(ScrollFallContext);
  const kickApi = useContext(KickScatterContext);
  const pointerRepel = useContext(PointerRepelContext);
  const { clock, camera, invalidate } = useThree();
  const hoverRef = useRef(0);
  const repelPos = useRef(new THREE.Vector3());
  const repelVel = useRef(new THREE.Vector3());
  const hx = useMemo(() => hash01(`${letterKey}x`), [letterKey]);
  const hy = useMemo(() => hash01(`${letterKey}y`), [letterKey]);
  const hz = useMemo(() => hash01(`${letterKey}z`), [letterKey]);

  useLayoutEffect(() => {
    basePos.current.set(position[0], position[1], position[2]);
  }, [position]);

  const extrudeScale = textSize / TEXT_SIZE_BASE;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const a = floatPhase;
    const p = scrollFallRef.current;
    const ampY = 0.056;
    const ampX = 0.026;
    const ampZ = 0.017;
    const fy =
      Math.sin(t * 1.08 + a) * ampY + Math.sin(t * 0.48 + a * 1.7) * ampY * 0.42;
    const fx = Math.cos(t * 0.85 + a * 2.03) * ampX;
    const fz = Math.sin(t * 0.62 + a * 0.95) * ampZ;

    const g = groupRef.current;
    if (mode === 'soon') {
      const e = scrollPhase1Ease(p);
      const e2exit = scrollPhase2Ease(p);
      const settle = 1 - e * 0.94;
      const ang = (hx * 6.2831853 + floatPhase) * 1.17;
      const spreadR = e * LETTER_SCATTER;
      const spreadX = Math.cos(ang) * spreadR * (0.35 + hx * 0.65) + (hz - 0.5) * e * 0.55;
      const spreadZ = Math.sin(ang * 1.63) * spreadR * 0.88 + (hy - 0.5) * e * 0.9;
      const fallY = -e * LETTER_FALL_DIST;
      const phase2Drop = e2exit * e2exit * SOON_TYPO_PHASE2_EXIT;
      /** e===0 이면 회전이 0이 되던 문제 → 상시 미세 록/스웨이 */
      const idleRock = (1 - e * 0.82) * (1 - e2exit * 0.65);
      const rxIdle = Math.sin(t * 0.93 + a * 1.06) * 0.1 * idleRock;
      const ryIdle = Math.cos(t * 0.71 + a * 1.52) * 0.085 * idleRock;
      const rzIdle = Math.sin(t * 0.58 + a * 0.88) * 0.065 * idleRock;

      if (g) {
        computePointerRepelTarget(g, camera, pointerRepel, _repelTgt);
        stepPointerRepelSpring(delta, _repelTgt, repelPos.current, repelVel.current);
        const twigMul =
          _repelTgt.lengthSq() > 1e-10 || repelPos.current.lengthSq() > 1e-8 ? 0.22 : 1;
        const hoverK = hoverRef.current;
        const hoverWobble =
          (Math.sin(t * 4.35 + a * 1.3) * hoverK + Math.cos(t * 6.2 + a * 0.77) * hoverK * 0.55) *
          twigMul;
        const hoverNudge =
          (Math.sin(t * 5.5 + a * 1.8) * hoverK * 0.052 + Math.cos(t * 4.1 + a) * hoverK * 0.038) *
          twigMul;
        const kick = kickApi
          ? kickScatterDelta(g, t, a, kickApi.kickRef.current)
          : { px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0 };
        g.position.set(
          basePos.current.x +
            fx * settle +
            spreadX +
            hoverNudge +
            kick.px +
            repelPos.current.x,
          basePos.current.y +
            fy * settle +
            fallY -
            phase2Drop +
            hoverNudge * 0.85 +
            kick.py +
            repelPos.current.y,
          basePos.current.z +
            fz * settle +
            spreadZ -
            hoverNudge * 0.65 +
            kick.pz +
            repelPos.current.z
        );
        const tumble = 1 - e * 0.35;
        g.rotation.set(
          e * (hy - 0.5) * 2.05 * tumble + rxIdle + hoverWobble * 0.22 + kick.rx,
          e * (hz - 0.5) * 2.65 * tumble + ryIdle + hoverWobble * 0.3 + kick.ry,
          e * (hx - 0.5) * 1.85 * tumble + rzIdle + hoverWobble * 0.24 + kick.rz
        );
        g.scale.setScalar(
          1 + Math.sin(t * 1.15 + a * 0.9) * 0.012 * idleRock + hoverK * 0.12
        );
      }

    } else {
      const e2 = scrollPhase2Ease(p);
      const viewReveal = THREE.MathUtils.smoothstep(p, PHASE1_END - 0.015, PHASE1_END + 0.08);
      const assemble = 1 - e2;
      const settle = 1 - e2 * 0.55;
      /** 정면에 가까울수록 떠다니는 흔들림 감소 — 완전히 0은 아님 */
      const floatDamp = 0.14 + 0.86 * (1 - e2 * 0.92);
      const spreadX = assemble * (hx - 0.5) * 1.05;
      const spreadY = assemble * (hy - 0.5) * 0.65;
      const spreadZ = assemble * (hz - 0.5) * 0.85;
      const breath = 0.11 + 0.89 * e2;
      const rxIdle = Math.sin(t * 0.88 + a) * 0.055 * breath;
      const ryIdle = Math.cos(t * 0.66 + a * 1.3) * 0.045 * breath;
      const rzIdle = Math.sin(t * 0.52 + a * 0.77) * 0.038 * breath;

      if (g) {
        g.visible = viewReveal > 0.01;
        computePointerRepelTarget(g, camera, pointerRepel, _repelTgt);
        stepPointerRepelSpring(delta, _repelTgt, repelPos.current, repelVel.current);
        const twigMul =
          _repelTgt.lengthSq() > 1e-10 || repelPos.current.lengthSq() > 1e-8 ? 0.22 : 1;
        const hoverK = hoverRef.current;
        const hoverWobble =
          (Math.sin(t * 3.95 + a * 1.1) * hoverK + Math.cos(t * 5.8 + a * 0.9) * hoverK * 0.6) *
          twigMul;
        const hoverNudge =
          (Math.sin(t * 5.2 + a * 1.4) * hoverK * 0.048 +
            Math.cos(t * 4.4 + a * 0.6) * hoverK * 0.04) *
          twigMul;
        const kick = kickApi
          ? kickScatterDelta(g, t, a, kickApi.kickRef.current)
          : { px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0 };
        g.position.set(
          basePos.current.x +
            fx * settle * floatDamp +
            spreadX +
            hoverNudge +
            kick.px +
            repelPos.current.x,
          basePos.current.y +
            fy * settle * floatDamp +
            spreadY +
            hoverNudge * 0.9 +
            kick.py +
            repelPos.current.y,
          basePos.current.z +
            fz * settle * floatDamp +
            spreadZ -
            hoverNudge * 0.55 +
            kick.pz +
            repelPos.current.z
        );
        g.rotation.set(
          assemble * (hy - 0.5) * 1.45 + rxIdle + hoverWobble * 0.16 + kick.rx,
          assemble * (hz - 0.5) * 1.85 + ryIdle + hoverWobble * 0.22 + kick.ry,
          assemble * (hx - 0.5) * 1.25 + rzIdle + hoverWobble * 0.18 + kick.rz
        );
        /* 스크롤 초반에 너무 작아 보이지 않게 바닥만 살짝 올림(1.0 근처에서 기존과 동일) */
        g.scale.setScalar((0.8 + 0.2 * e2 + hoverK * 0.11) * viewReveal);
      }

    }
    if (
      pointerRepel &&
      (repelPos.current.lengthSq() > 1e-8 || repelVel.current.lengthSq() > 1e-8)
    ) {
      invalidate();
    }
    const targetHover = hoverRef.current > 0.5 ? 1 : 0;
    hoverRef.current = THREE.MathUtils.damp(hoverRef.current, targetHover, 26, delta);
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
          curveSegments={coarse ? 4 : CURVE_SEGMENTS}
          bevelEnabled={!coarse}
          bevelThickness={coarse ? 0 : BEVEL_THICKNESS * extrudeScale * bevelMult}
          bevelSize={coarse ? 0 : BEVEL_SIZE * extrudeScale * bevelMult}
          bevelOffset={0}
          bevelSegments={coarse ? 0 : BEVEL_SEGMENTS}
          onPointerOver={(e) => {
            e.stopPropagation();
            hoverRef.current = 1;
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            hoverRef.current = 0;
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            kickApi?.trigger(e.point, clock.elapsedTime);
          }}
        >
          {char}
          <GlassTransmission />
        </Text3D>
      </Center>
    </group>
  );
}

function WaterDropletsField() {
  const { coarse } = useContext(PerfContext);
  const scrollFallRef = useContext(ScrollFallContext);
  const droplets = useMemo(
    () => (coarse ? WATER_DROPLETS.slice(0, 10) : WATER_DROPLETS),
    [coarse]
  );
  const stateRef = useRef(
    droplets.map((o, i) => ({
      base: new THREE.Vector3(o.base[0], o.base[1], o.base[2]),
      ph: o.ph,
      r: o.r,
      mesh: /** @type {THREE.Mesh | null} */ (null),
      /** 0~1: 위→아래 진행, 넘치면 다시 위에서 */
      fall: (i / Math.max(1, droplets.length) + o.ph[1] * 0.07) % 1,
      /** 낙하 속도 (방울마다 조금씩 다름, 전체적으로 느리게) */
      speed: 0.1 + (o.ph[0] % 1) * 0.06 + (i % 4) * 0.018,
    }))
  );
  const coarseAccumRef = useRef(0);

  useFrame((state, delta) => {
    // 모바일에서는 업데이트 빈도를 낮춰 CPU/GPU 비용 절감
    if (coarse) {
      coarseAccumRef.current += delta;
      if (coarseAccumRef.current < 1 / 20) return;
      delta = coarseAccumRef.current;
      coarseAccumRef.current = 0;
    }
    const t = state.clock.elapsedTime;
    const p = scrollFallRef.current;
    const e1 = scrollPhase1Ease(p);
    const e2 = scrollPhase2Ease(p);
    const settle = 1 - e1 * 0.92;

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

      let px = bx;
      let py = by;
      let pz = bz;
      py -= e2 * e2 * DROPLET_PHASE2_OFFSCREEN;

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

      mesh.visible = !(p >= PHASE1_END && i < CIRCLE_DROPLET_COUNT && e2 > 0.12);
    }
  });

  return (
    <group>
      {droplets.map((o, i) => (
        <mesh
          key={i}
          ref={(el) => {
            stateRef.current[i].mesh = el;
          }}
          castShadow={false}
          receiveShadow={false}
        >
          <sphereGeometry args={[o.r, coarse ? 8 : 10, coarse ? 8 : 10]} />
          <DropletMaterial />
        </mesh>
      ))}
    </group>
  );
}

/** view 주변 3D 원형 라벨 — view 확대에 맞춤 */
const NAV_ORBIT_RADIUS = 4.88;
const NAV_TEXT_SIZE = 1.26;
const NAV_EXTRUDE = 0.25;

const NAV_ORBIT_ITEMS = [
  { label: '2d', path: '/2d' },
  { label: 'Lab', path: '/lab' },
  { label: 'VID', path: '/vid' },
  { label: 'OBJ', path: '/obj' },
];

function NavOrbitCluster() {
  const scrollRef = useContext(ScrollFallContext);
  const fontData = useLoader(TTFLoader, BAGEL_TTF);
  const router = useRouter();
  const invalidate = useThree((s) => s.invalidate);
  const rootRef = useRef(null);
  const hoverIndexRef = useRef(-1);
  const itemRefs = useRef([]);
  const springRef = useRef(NAV_ORBIT_ITEMS.map(() => ({ x: 0, v: 0 })));

  useFrame((_, delta) => {
    const e2 = scrollPhase2Ease(scrollRef.current);
    const reveal = THREE.MathUtils.smoothstep(e2, 0.36, 0.85);
    if (rootRef.current) {
      rootRef.current.visible = reveal > 0.02;
      rootRef.current.scale.setScalar(Math.max(0.001, reveal));
    }

    let needsMoreFrames = false;
    const k = 62;
    const c = 8.5;
    for (let i = 0; i < springRef.current.length; i++) {
      const s = springRef.current[i];
      const target = hoverIndexRef.current === i ? 1 : 0;
      const a = (target - s.x) * k - s.v * c;
      s.v += a * delta;
      s.x += s.v * delta;
      if (Math.abs(target - s.x) > 0.001 || Math.abs(s.v) > 0.001) {
        needsMoreFrames = true;
      } else {
        s.x = target;
        s.v = 0;
      }
      const g = itemRefs.current[i];
      if (g) {
        g.scale.setScalar(1 + s.x * 0.4);
        g.position.y = s.x * 0.14;
        g.rotation.z = s.x * 0.14;
        g.rotation.x = s.x * 0.07;
      }
    }
    if (needsMoreFrames) invalidate();
  });

  const go =
    (path) =>
    (/** @type {THREE.Event & { stopPropagation: () => void }} */ e) => {
      e.stopPropagation();
      router.push(path);
    };

  const hoverProps = (i) => ({
    onPointerOver: () => {
      hoverIndexRef.current = i;
      document.body.style.cursor = 'pointer';
      invalidate();
    },
    onPointerOut: () => {
      if (hoverIndexRef.current === i) hoverIndexRef.current = -1;
      document.body.style.cursor = '';
      invalidate();
    },
  });

  return (
    <group ref={rootRef}>
      {NAV_ORBIT_ITEMS.map((item, i) => {
        const [x, y, z] = orbitSlotFrontalPlane(
          i,
          CIRCLE_DROPLET_COUNT,
          NAV_ORBIT_RADIUS
        );
        return (
          <group key={`nav-${i}`} position={[x, y, z]}>
            <group
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
            >
            <Center>
              <Text3D
                font={fontData}
                size={NAV_TEXT_SIZE}
                height={NAV_EXTRUDE}
                letterSpacing={0}
                lineHeight={1}
                curveSegments={10}
                bevelEnabled
                bevelThickness={0.056}
                bevelSize={0.047}
                bevelOffset={0}
                bevelSegments={4}
                {...hoverProps(i)}
                onClick={go(item.path)}
              >
                {item.label}
                <GlassTransmission />
              </Text3D>
            </Center>
            </group>
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
  const lastTgt = useRef(0);

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
      const raw = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      // 체감 감도 ↓: 스크롤 입력 자체도 약간 저역통과(급격한 점프 방지)
      const kIn = 1 - Math.exp(-8);
      lastTgt.current += (raw - lastTgt.current) * kIn;
      target.current = lastTgt.current;
      invalidate();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [invalidate]);

  useFrame((_, delta) => {
    // 무겁게: 값↓ = 느리게 따라감(더 관성)
    const k = 1 - Math.exp(-7.5 * delta);
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
const TEXT_TILT_RX = 0;
const TEXT_TILT_RY = 0;

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
 * 2) 다음 스크롤 구간(view): 하단 네비는 페이지 CSS(landing-glass-dock)
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
    </>
  );
}

/** 궤도 영역을 bounds에 넣기 위한 보이지 않는 구 반지름 */
const ORBIT_BOUNDS_PAD_R = DROPLET_CIRCLE_R + 0.75;

/**
 * Bounds.fit()용 보이지 않는 구.
 * 첫 화면은 soon만 중심에 와야 하므로 fit 중심도 soon 로컬 Y에 고정.
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
  const yMid = TYPO_SOON_LOCAL_Y;
  const padY = ORBIT_BOUNDS_PAD_R * 0.72;
  return (
    <group>
      <mesh position={[0, yMid - padY, 0]} raycast={() => null}>
        <sphereGeometry args={[ORBIT_BOUNDS_PAD_R, 8, 8]} />
        {padMat}
      </mesh>
      <mesh position={[0, yMid + padY, 0]} raycast={() => null}>
        <sphereGeometry args={[ORBIT_BOUNDS_PAD_R, 8, 8]} />
        {padMat}
      </mesh>
    </group>
  );
}

/**
 * frameloop="demand" 일 때 비·부유 애니가 돌아가도록 스크롤 구간에서 매 프레임 invalidate
 */
function DemandSceneInvalidate() {
  const scrollRef = useContext(ScrollFallContext);
  const invalidate = useThree((s) => s.invalidate);
  const { coarse } = useContext(PerfContext);
  const lastRef = useRef(0);
  useFrame(() => {
    const p = scrollRef.current;
    if (p >= 0.999) return;
    const now = performance.now();
    const fps = coarse ? 24 : 45;
    if (now - lastRef.current < 1000 / fps) return;
    lastRef.current = now;
    invalidate();
  });
  return null;
}

function PhaseTypography({ lines, mode }) {
  const fontData = useLoader(TTFLoader, BAGEL_TTF);
  const invalidate = useThree((s) => s.invalidate);
  const textSize = mode === 'view' ? TEXT_SIZE_VIEW : TEXT_SIZE_SOON;

  const letterItems = useMemo(
    () => buildLetterLayout(fontData, lines, textSize),
    [fontData, lines, textSize]
  );

  useLayoutEffect(() => {
    invalidate();
  }, [fontData, lines, textSize, invalidate]);

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
          textSize={textSize}
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
      g.position.y = HERO_STACK_BASE_Y + u * SCROLL_PAN_Y_AT_FULL;
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
        </Bounds>
        <group position={[0, TYPO_VIEW_LOCAL_Y, 0]}>
          <PhaseTypography lines={LINES_VIEW} mode="view" />
        </group>
        <WaterDropletsField />
      </ViewScrollFacingGroup>
    </group>
  );
}

export default function HeroFlowriumGlass3D({ onReady }) {
  const [isCoarsePointer, setIsCoarsePointer] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return Boolean(window.matchMedia('(pointer: coarse)').matches);
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(pointer: coarse)');
    const onChange = () => setIsCoarsePointer(Boolean(mq.matches));
    onChange();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  const onHeroStable = useCallback(() => {
    if (typeof document !== 'undefined') {
      document
        .querySelector('.hero-flowrium-glass-shell')
        ?.classList.add('hero-flowrium-webgl-text-ready');
    }
    onReady?.();
  }, [onReady]);

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
        }}
        fallback={null}
      >
        <Canvas
          frameloop="demand"
          resize={{ debounce: 180, scroll: false }}
          camera={{ position: [0, 0.06, 10.35], fov: 44 }}
          gl={{
            alpha: false,
            antialias: !isCoarsePointer,
            powerPreference: isCoarsePointer ? 'low-power' : 'high-performance',
            stencil: false,
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={isCoarsePointer ? 0.85 : 0.95}
          onCreated={({ gl, invalidate }) => {
            gl.setClearColor(SCENE_CLEAR_HEX, 1);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.45;
            invalidate();
          }}
        >
          <PerfContext.Provider value={{ coarse: isCoarsePointer }}>
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
            <ScrollFallBridge>
              <KickScatterBridge>
                <PointerRepelBinder>
                  <KickDemandInvalidate />
                  <DemandSceneInvalidate />
                  <Suspense fallback={null}>
                    <DemandBootFrames />
                    <Environment
                      preset="studio"
                      environmentIntensity={1.48}
                    resolution={isCoarsePointer ? 32 : 48}
                    frames={isCoarsePointer ? 3 : 4}
                    />
                    <HeroViewBlock />
                  </Suspense>
                  <ScrollMappedOverlays />
                </PointerRepelBinder>
              </KickScatterBridge>
            </ScrollFallBridge>
            <HeroStableNotifier onStable={onHeroStable} />
          </PerfContext.Provider>
        </Canvas>
      </WebGLSceneBoundary>
    </div>
  );
}
