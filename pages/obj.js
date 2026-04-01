import SubPageShell from '../components/SubPageShell';

import cardExhibitionGrid from '../assets/multi/card-exhibition-grid.png';
import cardMemorytoneHarmonic from '../assets/multi/card-memorytone-harmonic.png';

/**
 * >Multi — 레퍼런스 카드 2장 (번들 import, 카드 스왑마다 각 이미지 1:1 대응)
 * 1: 그리드 배경 + 화이트 카드(전시/스크롤 캡슐 레퍼런스)
 * 2: Memorytone 프레임 + 듀얼 폰 / Harmonic·intelligence
 */
const CARDS = [
  {
    id: 'multi-exhibition',
    imageSrc: cardExhibitionGrid.src,
    imageAlt: 'Multi — exhibition card on thumbnail grid',
    href: '/obj/platform-l',
  },
  {
    id: 'multi-memorytone',
    imageSrc: cardMemorytoneHarmonic.src,
    imageAlt: 'Multi — Memorytone harmonic card',
    href: '/obj/lg-home-ai',
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
