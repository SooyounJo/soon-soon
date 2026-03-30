import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

/** 히어로 씬과 동일 — 굴절 배경 톤 */
const CURSOR_GLASS_BG = new THREE.Color('#000000');

function CursorSceneBackdrop() {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.background = null;
  }, [scene]);
  return null;
}

/**
 * 포인터를 추적하는 유리 구 — CSS 글래스 링 대신 WebGL MeshTransmission
 */
function GlassCursorBall() {
  const meshRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      invalidate();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [invalidate]);

  useLayoutEffect(() => {
    invalidate();
  }, [invalidate]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { viewport } = state;
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    const tx = mouse.current.x * halfW;
    const ty = mouse.current.y * halfH;
    const k = Math.min(delta * 14, 1);
    const px = smooth.current.x;
    const py = smooth.current.y;
    smooth.current.x += (tx - smooth.current.x) * k;
    smooth.current.y += (ty - smooth.current.y) * k;
    mesh.position.set(smooth.current.x, smooth.current.y, 0);
    const settling =
      Math.abs(tx - smooth.current.x) > 0.02 ||
      Math.abs(ty - smooth.current.y) > 0.02 ||
      Math.abs(px - smooth.current.x) > 0.002 ||
      Math.abs(py - smooth.current.y) > 0.002;
    if (settling) invalidate();
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.28, 24, 24]} />
      <MeshTransmissionMaterial
        backside
        backsideThickness={0.052}
        backsideEnvMapIntensity={0.7}
        samples={2}
        resolution={112}
        transmission={1}
        thickness={0.17}
        roughness={0.045}
        metalness={0.06}
        chromaticAberration={0.08}
        anisotropicBlur={0.06}
        distortion={0.14}
        distortionScale={0.32}
        temporalDistortion={0.018}
        ior={1.52}
        color="#f4f9fc"
        background={CURSOR_GLASS_BG}
        envMapIntensity={1.02}
      />
    </mesh>
  );
}

export default function GlassCursorOverlay() {
  return (
    <div
      className="flowrium-glass-cursor-webgl"
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      <Canvas
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
        }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', stencil: false }}
        frameloop="demand"
        dpr={[1, 1.12]}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          invalidate();
        }}
      >
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={72} near={0.1} far={200} />
        <CursorSceneBackdrop />
        <ambientLight intensity={0.22} />
        <directionalLight position={[5, 8, 6]} intensity={1.35} color="#fffaf6" />
        <directionalLight position={[-4, -2, 4]} intensity={0.35} color="#c8dcff" />
        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.92} resolution={64} />
          <GlassCursorBall />
        </Suspense>
      </Canvas>
    </div>
  );
}
