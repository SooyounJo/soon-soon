import SubPageShell from '../components/SubPageShell';

const CARDS = [
  {
    id: 'm1',
    title: 'Mobile first',
    subtitle: 'Touch & viewport',
    body: '작은 화면에서 제스처·안전 영역·가독성을 기본 전제로 레이아웃을 잡습니다.',
  },
  {
    id: 'm2',
    title: '2D surface',
    subtitle: 'Typography & motion',
    body: '평면 안에서 깊이가 느껴지도록 타이포 계층과 미세한 모션이 맞물리게 합니다.',
  },
  {
    id: 'm3',
    title: 'Performance',
    subtitle: 'Perceived speed',
    body: '로딩·전환·스크롤을 사용자가 “빠르다”고 느끼는 기준까지 다듬습니다.',
  },
];

export default function Page2D() {
  return <SubPageShell headTitle=">Mobile — flowrium" title=">Mobile" cards={CARDS} />;
}
