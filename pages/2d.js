import SubPageShell from '../components/SubPageShell';

/** 각 카드: 이미지 스택(CardSwap) — 클릭 시 세부 페이지 */
import naverCover from '../assets/mobile/naver.png';
import manpaCover from '../assets/mobile/manpa.png';

const CARDS = [
  {
    id: 'm1',
    imageSrc: naverCover.src,
    imageAlt: 'Naver x Coex — AI Agent web',
    href: '/2d/naver',
  },
  {
    id: 'm2',
    imageSrc: manpaCover.src,
    imageAlt: 'ManPa — SikJuk',
    href: '/2d/manpa',
  },
  {
    id: 'm3',
    continuedOnly: true,
  },
];

export default function Page2D() {
  return (
    <SubPageShell
      headTitle=">Mobile — flowrium"
      title=">Mobile"
      cards={CARDS}
      variant="mobile"
    />
  );
}
