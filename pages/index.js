import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const FlowriumMetallicTitle = dynamic(
  () => import('../components/FlowriumMetallicTitle'),
  { ssr: false }
);

const GOO_SMOOTH = 0.14;

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
      root.style.setProperty('--dither-x', `${smoothX}px`);
      root.style.setProperty('--dither-y', `${smoothY}px`);
      root.style.setProperty('--spot-fast-x', `${targetX}px`);
      root.style.setProperty('--spot-fast-y', `${targetY}px`);

      const midX = (smoothX + targetX) * 0.5;
      const midY = (smoothY + targetY) * 0.5;
      const dist = Math.hypot(targetX - smoothX, targetY - smoothY);
      const minDim = Math.min(window.innerWidth, window.innerHeight);
      const glassR = minDim * 0.17 + dist * 0.42;
      root.style.setProperty('--glass-lens-x', `${midX}px`);
      root.style.setProperty('--glass-lens-y', `${midY}px`);
      root.style.setProperty('--glass-lens-r', `${Math.max(80, glassR)}px`);
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
