import SubPageShell from '../components/SubPageShell';

import cardMulti1 from '../assets/multi/card-multi-1.png';
import cardMulti2 from '../assets/multi/card-multi-2.png';

/**
 * >Multi — 레퍼런스 카드 2장 (번들 import, 카드 스왑마다 각 이미지 1:1 대응)
 * 1: 그리드 배경 + 화이트 카드(전시/스크롤 캡슐 레퍼런스)
 * 2: Memorytone 프레임 + 듀얼 폰 / Harmonic·intelligence
 */
const CARDS = [
  {
    id: 'multi-lg-home-ai',
    imageSrc: cardMulti1.src,
    imageAlt: 'Multi — LG Home AI harmonic card',
    href: '/obj/lg-home-ai',
  },
  {
    id: 'multi-platform-l',
    imageSrc: cardMulti2.src,
    imageAlt: 'Multi — Platform-L card on thumbnail grid',
    href: '/obj/platform-l',
  },
  {
    id: 'multi-tbc',
    continuedOnly: true,
  },
];

export default function PageObj() {
  return (
    <SubPageShell
      headTitle=">Multi — flowrium"
      title=">Multi"
      cards={CARDS}
      variant="multi-two"
    />
  );
}
