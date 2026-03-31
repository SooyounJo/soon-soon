import SubPageShell from '../components/SubPageShell';

/** 각 카드: eyebrow · title · body 세 블록 / 마지막 카드만 To be continued */
const CARDS = [
  {
    id: 'm1',
    eyebrow: 'Touch · Viewport',
    title: 'Mobile first',
    body: '작은 화면에서 제스처·안전 영역·가독성을 기본 전제로 레이아웃을 잡습니다.',
  },
  {
    id: 'm2',
    eyebrow: 'Typography · Motion',
    title: '2D surface',
    body: '평면 안에서 깊이가 느껴지도록 타이포 계층과 미세한 모션이 맞물리게 합니다.',
  },
  {
    id: 'm3',
    continuedOnly: true,
  },
];

export default function Page2D() {
  return <SubPageShell headTitle=">Mobile — flowrium" title=">Mobile" cards={CARDS} />;
}
