import { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * 글래스 원형 커서 — framer-motion 스프링 추적.
 */
export default function GlassCursorOverlay() {
  const x = useSpring(0, { stiffness: 420, damping: 38, mass: 0.35 });
  const y = useSpring(0, { stiffness: 420, damping: 38, mass: 0.35 });

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="flowrium-glass-cursor-ring"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        width: 'clamp(48px, 14vw, 72px)',
        height: 'clamp(48px, 14vw, 72px)',
        borderRadius: '50%',
        aspectRatio: '1',
        pointerEvents: 'none',
        zIndex: 99999,
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 50%, rgba(200,210,220,0.08) 100%)',
        backdropFilter: 'blur(14px) saturate(1.25)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.25)',
        border: '1px solid rgba(255, 255, 255, 0.42)',
        boxShadow: `
          0 0 0 1px rgba(255, 80, 80, 0.12),
          0 0 0 1px rgba(80, 200, 255, 0.1),
          0 8px 32px rgba(0, 0, 0, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.35)
        `,
      }}
    />
  );
}
