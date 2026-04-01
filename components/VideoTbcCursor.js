import { useEffect, useState } from 'react';
import { useVideoTbcActive } from '../contexts/VideoDockCursorContext';

/**
 * 랜딩 >Video 클릭 후 3초간 — 도크 캡슐과 같은 톤의 필 + "To Be Continued".
 */
export default function VideoTbcCursor() {
  const videoTbcActive = useVideoTbcActive();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!videoTbcActive) return undefined;
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [videoTbcActive]);

  useEffect(() => {
    const el = document.documentElement;
    if (videoTbcActive) {
      el.classList.add('flowrium-video-tbc-active');
    } else {
      el.classList.remove('flowrium-video-tbc-active');
    }
    return () => el.classList.remove('flowrium-video-tbc-active');
  }, [videoTbcActive]);

  if (!videoTbcActive) return null;

  return (
    <div
      className="flowrium-video-tbc-cursor"
      aria-hidden
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      <div className="flowrium-video-tbc-cursor__inner">
        <span className="flowrium-video-tbc-cursor__label">To Be Continued</span>
      </div>
    </div>
  );
}
