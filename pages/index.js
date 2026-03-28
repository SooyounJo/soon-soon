import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const FlowriumMetallicTitle = dynamic(
  () => import('../components/FlowriumMetallicTitle'),
  { ssr: false }
);

/** 꼬리 원이 커서(큰 원)를 따라잡는 속도 — 클수록 빠름 */
const GOO_SMOOTH = 0.32;

const TITLE_LETTERS = 'FLOWRIUM'.split('');
const HERO_REVEAL_MS = 1050;
const N_LETTERS = TITLE_LETTERS.length;

function clamp01(t) {
  return Math.max(0, Math.min(1, t));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** i번째 글자 로컬 진행 0~1 (스크롤 구간의 앞쪽 82%에서 순차 완료) */
function letterScrollProgress(p, i, n) {
  const span = 0.82;
  const start = (i / n) * span;
  const end = ((i + 1) / n) * span;
  return clamp01((p - start) / Math.max(0.0001, end - start));
}
const LETTER_TITLE_PROPS = {
  scale: 2.4,
  patternSharpness: 0.97,
  noiseScale: 0.45,
  speed: 0.22,
  liquid: 0.88,
  mouseAnimation: true,
  brightness: 1.95,
  contrast: 0.68,
  refraction: 0.006,
  blur: 0.028,
  chromaticSpread: 0.06,
  fresnel: 0.32,
  angle: 0,
  waveAmplitude: 0.88,
  distortion: 0.78,
  contour: 0.32,
  lightColor: '#ffffff',
  darkColor: '#0f0806',
  tintColor: '#8b6914',
};

export default function Home() {
  const scrollSpacerRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('flowrium-home');

    let revealTimer;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setSpacerHeight = () => {
      const el = scrollSpacerRef.current;
      if (!el) return;
      const h = Math.max(window.innerHeight * 2.6, 1680);
      el.style.height = `${h}px`;
    };

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
    };

    const tick = () => {
      if (cancelled) return;
      smoothX += (targetX - smoothX) * GOO_SMOOTH;
      smoothY += (targetY - smoothY) * GOO_SMOOTH;
      applyLensVars();
      raf = window.requestAnimationFrame(tick);
    };

    const updateLetterFluid = (e) => {
      if (reduceMotion) return;
      const wraps = document.querySelectorAll('.letter-canvas-wrap');
      if (!wraps.length) return;
      const mx = e.clientX;
      const my = e.clientY;
      wraps.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const d = Math.hypot(dx, dy) + 90;
        const influence = Math.min(1, 400 / d);
        const fx = (dx / d) * 16 * influence;
        const fy = (dy / d) * 16 * influence;
        el.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;
      });
    };

    const onPointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      updateLetterFluid(e);
    };

    applyLensVars();
    raf = window.requestAnimationFrame(tick);

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    setSpacerHeight();

    let scrollRaf = 0;
    const syncScroll = () => {
      scrollRaf = 0;
      if (!root.classList.contains('hero-revealed')) {
        root.classList.remove('flowrium-scroll-end');
        return;
      }

      const y = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      let p = clamp01(y / maxScroll);
      if (reduceMotion) {
        p = p < 0.5 ? 0 : 1;
      }

      const blurPhase = 0.55;
      const blurT = smoothstep(0, blurPhase, p);
      const blurOp = 1 - blurT;
      const glassOp = 1 - blurT * 0.98;

      root.style.setProperty('--flowrium-blur-op', String(blurOp));
      root.style.setProperty('--flowrium-glass-op', String(glassOp));

      const lensEnd = 0.88;
      const lensGone = p >= lensEnd - 0.02;
      root.classList.toggle('flowrium-scroll-end', lensGone);

      const vh = window.innerHeight;
      const row = document.querySelector('.title-letters-row');
      let centerToTop = vh * 0.46;
      if (row && p > 0.02) {
        const h = row.getBoundingClientRect().height;
        centerToTop = Math.max(0, (vh - h) * 0.5 - 4);
      }
      const stackLift = p * centerToTop;
      root.style.setProperty('--title-stack-lift', `${-stackLift}px`);

      const letters = document.querySelectorAll('.title-letter');
      const ramp = smoothstep(0, 0.14, p);
      letters.forEach((el, i) => {
        const lp = letterScrollProgress(p, i, N_LETTERS);
        const rise = (1 - lp) * 26 * ramp;
        const sc = 1 - 0.5 * lp;
        el.style.transform = `translateY(${rise}px) scale(${sc})`;
      });
    };

    const onScroll = () => {
      if (!scrollRaf) scrollRaf = window.requestAnimationFrame(syncScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      setSpacerHeight();
      syncScroll();
    };
    window.addEventListener('resize', onResize);

    window.requestAnimationFrame(() => {
      setSpacerHeight();
      syncScroll();
    });

    revealTimer = window.setTimeout(() => {
      root.classList.add('hero-revealed');
      window.requestAnimationFrame(syncScroll);
    }, HERO_REVEAL_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(revealTimer);
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      root.classList.remove('flowrium-home', 'hero-revealed', 'flowrium-scroll-end');
      root.style.removeProperty('--flowrium-blur-op');
      root.style.removeProperty('--flowrium-glass-op');
      root.style.removeProperty('--title-stack-lift');
      document.querySelectorAll('.letter-canvas-wrap').forEach((el) => {
        el.style.transform = '';
      });
      document.querySelectorAll('.title-letter').forEach((el) => {
        el.style.transform = '';
      });
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
          <div className="bg-flower-clip">
            <img
              src="/maingra.png"
              alt=""
              className="bg-flower-video bg-flower-video-blur"
              draggable={false}
            />
            {/* 배경(블러 구역)에만 글라스 느낌 — 커서 선명 원 안은 마스크로 완전 제외 */}
            <div className="bg-glass-field bg-glass-outer-masked" aria-hidden />
            <img
              src="/maingra.png"
              alt=""
              className="bg-flower-video bg-flower-video-sharp"
              draggable={false}
            />
          </div>
          <div className="bg-dither bg-dither-masked bg-dither-viewport" aria-hidden />
          <div className="bg-halftone-coarse bg-dither-masked bg-dither-viewport" aria-hidden />
        </div>
        <div className="title-overlay">
          <div className="title-dither bg-dither-masked title-dither-viewport" aria-hidden />
          <div className="title-halftone-coarse bg-dither-masked title-dither-viewport" aria-hidden />
          <div className="title-overlay-inner">
            <p className="hero-intro-title font-bagel" aria-hidden>
              FLOWRIUM
            </p>
            <div className="metallic-title-inner title-scatter-wrap">
              <div className="title-letters-row">
                {TITLE_LETTERS.map((ch, i) => (
                  <span
                    key={`${ch}-${i}`}
                    className="title-letter"
                    style={{ '--letter-i': i }}
                  >
                    <div className="metallic-layer letter-canvas-wrap">
                      <FlowriumMetallicTitle
                        text={ch}
                        seed={42 + i}
                        {...LETTER_TITLE_PROPS}
                      />
                    </div>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div ref={scrollSpacerRef} className="page-scroll-spacer" aria-hidden />
      </main>
      <style jsx>{`
        .page {
          position: relative;
          margin: 0;
          min-height: 100vh;
          min-height: 100dvh;
          background: #f4f4f2;
        }
        .page-scroll-spacer {
          width: 100%;
          min-height: 220vh;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
