import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useVideoDockCursor } from '../contexts/VideoDockCursorContext';

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
  const router = useRouter();
  const { startVideoTbc } = useVideoDockCursor();
  const [videoDisabled, setVideoDisabled] = useState(false);
  /** 첫 클릭: TBC 3초만 보여 준 뒤 복구. 이후 클릭에서만 /vid 이동 */
  const [videoTbcPlayed, setVideoTbcPlayed] = useState(false);

  const markReturnToView = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(RETURN_TO_VIEW_KEY, '1');
    } catch (_) {
      // ignore storage errors
    }
  }, []);

  const onDockClick = useCallback(
    (e, item) => {
      if (item.href === '/vid') {
        if (videoTbcPlayed) {
          markReturnToView();
          return;
        }
        e.preventDefault();
        if (videoDisabled) return;
        if (
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
          markReturnToView();
          router.push('/vid');
          return;
        }
        markReturnToView();
        setVideoDisabled(true);
        startVideoTbc(() => {
          setVideoDisabled(false);
          setVideoTbcPlayed(true);
        });
        return;
      }
      markReturnToView();
    },
    [markReturnToView, router, startVideoTbc, videoDisabled, videoTbcPlayed]
  );

  const renderWrap = (item, i, globalIndex) => {
    const isVideo = item.href === '/vid';
    return (
      <span
        key={item.href}
        className="landing-glass-dock__btn-wrap"
        style={{ zIndex: item.z }}
      >
        <Link
          href={item.href}
          className={`landing-glass-dock__btn landing-glass-dock__btn--i${globalIndex + 1}${
            isVideo && videoDisabled ? ' landing-glass-dock__btn--disabled' : ''
          }`}
          onClick={(e) => onDockClick(e, item)}
          aria-disabled={isVideo && videoDisabled ? true : undefined}
          tabIndex={isVideo && videoDisabled ? -1 : undefined}
        >
          {item.label}
        </Link>
      </span>
    );
  };

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
