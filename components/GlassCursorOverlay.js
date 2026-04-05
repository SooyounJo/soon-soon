import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useVideoTbcActive } from '../contexts/VideoDockCursorContext';
import scrollLandingToView from '../utils/scrollLandingToView';

/**
 * 두 번째 WebGL 캔버스 없음 — 히어로와 컨텍스트/메모리 경합 제거.
 * 초기: 캡슐 라벨 / 이후: 가벼운 CSS 링.
 */
export default function GlassCursorOverlay() {
  const router = useRouter();
  const isHome = router.pathname === '/';
  const SCROLL_TO_RING_THRESHOLD = 6;
  const videoTbcActive = useVideoTbcActive();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hasPointer, setHasPointer] = useState(false);
  const [showLandingCapsule, setShowLandingCapsule] = useState(true);

  useEffect(() => {
    const onMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setHasPointer(true);
    };
    const onScroll = () => {
      if (!isHome) return;
      setShowLandingCapsule(window.scrollY < SCROLL_TO_RING_THRESHOLD);
    };
    if (isHome) onScroll();
    window.addEventListener('pointermove', onMove, { passive: true });
    if (isHome) window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (isHome) window.removeEventListener('scroll', onScroll);
    };
  }, [isHome]);

  if (videoTbcActive) {
    return null;
  }

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
      {isHome && showLandingCapsule ? (
        <button
          type="button"
          className={`flowrium-scroll-capsule-cursor${
            hasPointer ? ' flowrium-scroll-capsule-cursor--visible' : ''
          }`}
          style={{
            transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
          }}
          aria-label="Scroll down to view"
          title="View"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            scrollLandingToView();
          }}
        >
          <span>Scroll Down</span>
        </button>
      ) : (
        <div
          className={`flowrium-css-cursor-ring${
            isHome && !showLandingCapsule ? ' flowrium-css-cursor-ring--view' : ''
          }${hasPointer ? ' flowrium-css-cursor-ring--visible' : ''}`}
          style={{
            transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
          }}
        />
      )}
    </div>
  );
}
