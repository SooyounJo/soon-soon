import Link from 'next/link';
import { useCallback } from 'react';

/**
 * 하단 캡슐: 2줄 벽돌(위 2 · 아래 3). transform 없음.
 */
const DOCK_LINKS_TOP = [
  { href: '/who', label: '>Who', z: 2 },
  { href: '/2d', label: '>Mobile', z: 2 },
];
const DOCK_LINKS_BOTTOM = [
  { href: '/obj', label: '>Multi', z: 3 },
  { href: '/lab', label: '>Lab', z: 5 },
  { href: '/vid', label: '>Video', z: 4 },
];
const RETURN_TO_VIEW_KEY = 'flowrium:return-to-view';

export default function LandingGlassDockNav({ visible }) {
  const markReturnToView = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(RETURN_TO_VIEW_KEY, '1');
    } catch (_) {
      // ignore storage errors
    }
  }, []);

  const renderWrap = (item, i, globalIndex) => (
    <span
      key={item.href}
      className="landing-glass-dock__btn-wrap"
      style={{ zIndex: item.z }}
    >
      <Link
        href={item.href}
        className={`landing-glass-dock__btn landing-glass-dock__btn--i${globalIndex + 1}`}
        onClick={markReturnToView}
      >
        {item.label}
      </Link>
    </span>
  );

  return (
    <nav
      className={`landing-glass-dock${visible ? ' landing-glass-dock--visible' : ''}`}
      aria-label="Main navigation"
    >
      <div className="landing-glass-dock__rail">
        <div className="landing-glass-dock__brick">
          {DOCK_LINKS_TOP.map((item, i) => renderWrap(item, i, i))}
          {DOCK_LINKS_BOTTOM.map((item, i) => renderWrap(item, i, i + DOCK_LINKS_TOP.length))}
        </div>
      </div>
    </nav>
  );
}
