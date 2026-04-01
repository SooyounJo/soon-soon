import SubPageShell from '../components/SubPageShell';

/** 각 카드: eyebrow · title · body / 앞 두 카드는 클릭 시 Figma 세부 페이지 */
const CARDS = [
  {
    id: 'm1',
    eyebrow: 'Mobile',
    title: 'Naver',
    body: '네이버 방향 UI — Figma 프로토타입을 이 페이지에서 바로 확인합니다.',
    href: '/2d/naver',
  },
  {
    id: 'm2',
    eyebrow: 'Mobile',
    title: 'Manpa',
    body: '만파 방향 UI — Figma 디자인을 반응형 임베드로 봅니다.',
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
