import { useLayoutEffect, useRef } from 'react';

/** 휠·터치 누적으로만 증가 — 이 값에 도달하면 배경이 완전 선명 */
const WHEEL_TO_SHARP = 3400;

/**
 * 랜딩: 문서 스크롤 없이 휠/스와이프로만 --landing-sharp-t 0→1.
 * 블러 완료 후에도 overflow 유지 — 아래로 페이지가 늘어나 빈 영역으로 내려가지 않게 함.
 */
export function useLandingBlurUnlock() {
  const accRef = useRef(0);
  const touchYRef = useRef(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('flowrium-landing-scroll-lock');
    root.style.setProperty('--landing-sharp-t', '0');

    const apply = () => {
      const t = Math.min(1, Math.max(0, accRef.current / WHEEL_TO_SHARP));
      root.style.setProperty('--landing-sharp-t', String(t));
      if (t >= 1) {
        root.classList.add('flowrium-landing-blur-done');
      }
    };

    const onWheel = (e) => {
      if (root.classList.contains('flowrium-landing-blur-done')) return;
      e.preventDefault();
      accRef.current += e.deltaY;
      accRef.current = Math.max(0, Math.min(WHEEL_TO_SHARP, accRef.current));
      apply();
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) touchYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (root.classList.contains('flowrium-landing-blur-done')) return;
      if (touchYRef.current == null || e.touches.length !== 1) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      const dy = touchYRef.current - y;
      touchYRef.current = y;
      accRef.current += dy * 3.4;
      accRef.current = Math.max(0, Math.min(WHEEL_TO_SHARP, accRef.current));
      apply();
    };

    const onTouchEnd = () => {
      touchYRef.current = null;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      root.classList.remove('flowrium-landing-scroll-lock', 'flowrium-landing-blur-done');
      root.style.removeProperty('--landing-sharp-t');
    };
  }, []);
}
