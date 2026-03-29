import { useEffect } from 'react';
import { clamp01, smoothstep } from '../lib/flowriumMath';

const GOO_SMOOTH = 0.32;
const HERO_REVEAL_MS = 1050;

/**
 * 렌즈(연속 rAF) + 스크롤 동기화 + 포인터(스로틀).
 * WebGL은 단일 캔버스만 가정(.letter-canvas-wrap 1개).
 */
export function useFlowriumPageEffects(scrollSpacerRef) {
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

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let smoothX = targetX;
    let smoothY = targetY;
    let raf = 0;
    let cancelled = false;

    const applyLensVars = () => {
      root.style.setProperty('--dither-x', `${smoothX}px`);
      root.style.setProperty('--dither-y', `${smoothY}px`);
    };

    const tick = () => {
      if (cancelled) return;
      smoothX += (targetX - smoothX) * GOO_SMOOTH;
      smoothY += (targetY - smoothY) * GOO_SMOOTH;
      applyLensVars();
      raf = window.requestAnimationFrame(tick);
    };

    let fluidRaf = 0;
    let pendingFluidEvent = null;

    const flushFluid = () => {
      fluidRaf = 0;
      const e = pendingFluidEvent;
      pendingFluidEvent = null;
      if (!e || reduceMotion) return;
      const wrap = document.querySelector('.flowrium-title-block.letter-canvas-wrap');
      if (!wrap) return;
      const mx = e.clientX;
      const my = e.clientY;
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const d = Math.hypot(dx, dy) + 90;
      const influence = Math.min(1, 400 / d);
      const fx = (dx / d) * 16 * influence;
      const fy = (dy / d) * 16 * influence;
      wrap.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;
    };

    const onPointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      pendingFluidEvent = e;
      if (!fluidRaf) {
        fluidRaf = window.requestAnimationFrame(flushFluid);
      }
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
      const row = document.querySelector('.flowrium-title-row');
      let centerToTop = vh * 0.46;
      if (row && p > 0.02) {
        const h = row.getBoundingClientRect().height;
        centerToTop = Math.max(0, (vh - h) * 0.5 - 4);
      }
      const stackLift = p * centerToTop;
      root.style.setProperty('--title-stack-lift', `${-stackLift}px`);

      const block = document.querySelector('.flowrium-title-block');
      if (block) {
        const ramp = smoothstep(0, 0.2, p);
        const rise = (1 - smoothstep(0, 0.78, p)) * 22 * ramp;
        const sc = 1 - 0.5 * smoothstep(0.15, 0.92, p);
        block.style.transform = `translateY(${rise}px) scale(${sc})`;
      }
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
      if (fluidRaf) window.cancelAnimationFrame(fluidRaf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      root.classList.remove('flowrium-home', 'hero-revealed', 'flowrium-scroll-end');
      root.style.removeProperty('--flowrium-blur-op');
      root.style.removeProperty('--flowrium-glass-op');
      root.style.removeProperty('--title-stack-lift');
      const wrap = document.querySelector('.flowrium-title-block.letter-canvas-wrap');
      if (wrap) wrap.style.transform = '';
      const block = document.querySelector('.flowrium-title-block');
      if (block) block.style.transform = '';
    };
  }, [scrollSpacerRef]);
}
