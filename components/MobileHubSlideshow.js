import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { manpaHero, manpaThumbs, naverFlowScreens, naverHeroDevice, naverStrip } from '../lib/figmaMcpMobileCaseAssets';

const AUTO_MS = 2600;

export default function MobileHubSlideshow({ naverCoverSrc, manpaCoverSrc }) {
  const router = useRouter();
  const wheelRef = useRef(null);
  const lastWheelAtRef = useRef(0);

  const projects = useMemo(
    () => [
      {
        id: 'naver',
        title: 'Naver x Coex',
        subtitle: 'AI Agent web',
        cover: naverCoverSrc,
        href: '/2d/naver',
        slides: [naverHeroDevice, ...naverFlowScreens, ...naverStrip],
      },
      {
        id: 'manpa',
        title: 'ManPa-',
        subtitle: 'SikJuk',
        cover: manpaCoverSrc,
        href: '/2d/manpa',
        slides: [manpaHero, ...manpaThumbs.filter((s) => s !== manpaHero)],
      },
    ],
    [manpaCoverSrc, naverCoverSrc]
  );

  const [activeProjectId, setActiveProjectId] = useState('naver');
  const active = projects.find((p) => p.id === activeProjectId) || projects[0];
  const [idx, setIdx] = useState(0);
  const total = active.slides.length;

  useEffect(() => {
    setIdx(0);
  }, [activeProjectId]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((v) => (v + 1) % Math.max(1, total));
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [total]);

  useEffect(() => {
    const node = wheelRef.current;
    if (!node) return undefined;

    const onWheel = (e) => {
      const dy = e.deltaY;
      if (Math.abs(dy) < 4) return;
      const now = Date.now();
      if (now - lastWheelAtRef.current < 220) return;
      lastWheelAtRef.current = now;

      e.preventDefault();
      setIdx((v) => {
        const next = dy > 0 ? v + 1 : v - 1;
        const mod = Math.max(1, total);
        return (next + mod) % mod;
      });
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [total]);

  return (
    <section className="mobile-hub" aria-label="Mobile projects slideshow">
      <div className="mobile-hub__left" aria-label="Projects">
        {projects.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`mobile-hub__thumb card--clickable${p.id === active.id ? ' mobile-hub__thumb--active' : ''}`}
            onClick={() => setActiveProjectId(p.id)}
          >
            <img className="mobile-hub__thumb-img" src={p.cover} alt={`${p.title} cover`} draggable={false} />
            <span className="mobile-hub__thumb-meta">
              <span className="mobile-hub__thumb-title">{p.title}</span>
              <span className="mobile-hub__thumb-sub">{p.subtitle}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mobile-hub__right" ref={wheelRef}>
        <button
          type="button"
          className="mobile-hub__stage card--clickable"
          onClick={() => router.push(active.href)}
          aria-label={`Open ${active.title}`}
        >
          <img
            className="mobile-hub__stage-img"
            src={active.slides[Math.min(idx, total - 1)]}
            alt={`${active.title} slide ${idx + 1}`}
            draggable={false}
            loading="eager"
            decoding="async"
          />
          <div className="mobile-hub__stage-hud" aria-hidden>
            <span className="mobile-hub__stage-hud-title">{active.title}</span>
            <span className="mobile-hub__stage-hud-count">
              {Math.min(idx + 1, total)}/{total}
            </span>
          </div>
        </button>
      </div>
    </section>
  );
}

