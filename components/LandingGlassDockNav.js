import Link from 'next/link';
import { useCallback } from 'react';

/**
 * 하단 한 줄 + lift + Figma 840:1021 각도.
 * backdrop-filter 는 “transform 이 있는 조상” 아래에 두면 Chrome에서 WebGL 뒤를 못 보고 회색 덩어리가 됨.
 * 그래서 rotate 는 글래스와 같은 노드(링크)에만 준다(조상 span 은 transform 없음).
 * @see https://www.figma.com/design/aIkou5NslP8rSqqOiAl7gf/Untitled?node-id=840-1021
 */
const DOCK_LINKS = [
  { href: '/who', label: '>Who', z: 1, lift: 0, rotateDeg: 105 },
  { href: '/2d', label: '>Mobile', z: 2, lift: 18, rotateDeg: 90 },
  { href: '/obj', label: '>Multi', z: 3, lift: 0, rotateDeg: 75 },
  { href: '/3d', label: '>Experiment', z: 5, lift: 28, rotateDeg: 100.89 },
  { href: '/vid', label: '>Video', z: 4, lift: 6, rotateDeg: 66.35 },
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

  return (
    <nav
      className={`landing-glass-dock${visible ? ' landing-glass-dock--visible' : ''}`}
      aria-label="Main navigation"
    >
      <div className="landing-glass-dock__rail">
        {DOCK_LINKS.map((item, i) => (
          <span
            key={item.href}
            className="landing-glass-dock__btn-wrap"
            style={{
              zIndex: item.z,
              marginBottom: item.lift ? `${item.lift}px` : undefined,
            }}
          >
            <Link
              href={item.href}
              className={`landing-glass-dock__btn landing-glass-dock__btn--i${i + 1}`}
              style={{
                transform: `rotate(${item.rotateDeg}deg) translateZ(0)`,
              }}
              onClick={markReturnToView}
            >
              {item.label}
            </Link>
          </span>
        ))}
      </div>
    </nav>
  );
}
