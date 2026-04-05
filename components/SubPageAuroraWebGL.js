import { useEffect, useState } from 'react';
import Aurora from './Aurora';

export default function SubPageAuroraWebGL({
  colorStops = ['#ffffff', '#ffffff', '#ffffff'],
  blend = 0.55,
  amplitude = 1.0,
  speed = 1,
}) {
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(Boolean(mq.matches));
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: '55vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.55,
        mixBlendMode: 'screen',
        filter: 'blur(12px)',
      }}
    >
      <Aurora
        colorStops={colorStops}
        blend={blend}
        amplitude={amplitude}
        speed={reduceMotion ? 0 : speed}
      />
    </div>
  );
}

