import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const FlowriumMetallicTitle = dynamic(
  () => import('../components/FlowriumMetallicTitle'),
  { ssr: false }
);

const GOO_SMOOTH = 0.14;

/** 물방울 2개: 서로 다른 궤적·속도(사인 합성), 화면 안에 유지 */
function presetDropletPositions() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const t = performance.now() * 0.001;
  const mx = Math.min(w, h) * 0.08;

  const x1 =
    w * 0.24 +
    w * 0.16 * Math.sin(t * 0.35) +
    w * 0.07 * Math.sin(t * 1.05 + 1.1) +
    w * 0.04 * Math.cos(t * 0.62 + 0.3);
  const y1 =
    h * 0.36 +
    h * 0.12 * Math.cos(t * 0.4) +
    h * 0.06 * Math.sin(t * 0.88 + 2) +
    h * 0.05 * Math.cos(t * 1.2);

  const x2 =
    w * 0.76 +
    w * 0.12 * Math.cos(t * 0.48 + 2.2) +
    w * 0.06 * Math.sin(t * 1.35 + 0.4) +
    w * 0.05 * Math.cos(t * 0.7);
  const y2 =
    h * 0.44 +
    h * 0.14 * Math.sin(t * 0.46 + 1) +
    h * 0.07 * Math.cos(t * 1.15 + 0.8) +
    h * 0.05 * Math.sin(t * 0.55);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  return {
    x1: clamp(x1, mx, w - mx),
    y1: clamp(y1, mx, h - mx),
    x2: clamp(x2, mx, w - mx),
    y2: clamp(y2, mx, h - mx),
  };
}

export default function Home() {
  useEffect(() => {
    const root = document.documentElement;
    let targetX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    let targetY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
    let smoothX = targetX;
    let smoothY = targetY;
    let raf = 0;
    let cancelled = false;

    const applyLensVars = () => {
      const { x1, y1, x2, y2 } = presetDropletPositions();
      root.style.setProperty('--spot-pre-1-x', `${x1}px`);
      root.style.setProperty('--spot-pre-1-y', `${y1}px`);
      root.style.setProperty('--spot-pre-2-x', `${x2}px`);
      root.style.setProperty('--spot-pre-2-y', `${y2}px`);

      root.style.setProperty('--dither-x', `${smoothX}px`);
      root.style.setProperty('--dither-y', `${smoothY}px`);
      root.style.setProperty('--spot-fast-x', `${targetX}px`);
      root.style.setProperty('--spot-fast-y', `${targetY}px`);
    };

    const tick = () => {
      if (cancelled) return;
      smoothX += (targetX - smoothX) * GOO_SMOOTH;
      smoothY += (targetY - smoothY) * GOO_SMOOTH;
      applyLensVars();
      raf = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    applyLensVars();
    raf = window.requestAnimationFrame(tick);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Flowrium</title>
        <meta name="description" content="Next.js + WebGL canvas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=block"
          rel="stylesheet"
        />
      </Head>
      <main className="page">
        <div className="bg-flower" aria-hidden>
          <img
            src="/maingra.png"
            alt=""
            className="bg-flower-video bg-flower-video-blur"
            draggable={false}
          />
          <div className="bg-dither bg-dither-masked" aria-hidden />
          <div className="bg-halftone-coarse bg-dither-masked" aria-hidden />
          {/* 배경(블러 구역)에만 글라스 느낌 — 커서 선명 원 안은 마스크로 완전 제외 */}
          <div className="bg-glass-field bg-glass-outer-masked" aria-hidden />
          <img
            src="/maingra.png"
            alt=""
            className="bg-flower-video bg-flower-video-sharp"
            draggable={false}
          />
        </div>
        <div className="title-overlay">
          <div className="metallic-title-inner title-scatter-wrap">
            <div className="metallic-layer">
              <FlowriumMetallicTitle
                seed={42}
                scale={2.75}
                patternSharpness={0.97}
                noiseScale={0.45}
                speed={0.22}
                liquid={0.88}
                mouseAnimation
                brightness={1.95}
                contrast={0.68}
                refraction={0.006}
                blur={0.028}
                chromaticSpread={0.06}
                fresnel={0.32}
                angle={0}
                waveAmplitude={0.88}
                distortion={0.78}
                contour={0.32}
                lightColor="#ffffff"
                darkColor="#0f0806"
                tintColor="#8b6914"
              />
            </div>
            <div className="title-dither bg-dither-masked" aria-hidden />
            <div className="title-halftone-coarse bg-dither-masked" aria-hidden />
          </div>
        </div>
      </main>
      <style jsx>{`
        .page {
          position: fixed;
          inset: 0;
          margin: 0;
          min-height: 100%;
          background: #f4f4f2;
        }
      `}</style>
    </>
  );
}
