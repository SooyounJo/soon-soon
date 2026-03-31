import SubPageShell from '../components/SubPageShell';

const CARDS = [
  {
    id: 'v1',
    title: 'Motion story',
    subtitle: 'Edit rhythm',
    body: '컷 길이와 사운드 포인트에 맞춰 시선이 끊기지 않게 배치합니다.',
  },
  {
    id: 'v2',
    title: 'UI capture',
    subtitle: 'Screen recording',
    body: '제품 데모는 실제 플로우를 따라가며 불필요한 대기 프레임을 줄입니다.',
  },
  {
    id: 'v3',
    title: 'Color & grade',
    subtitle: 'Consistency',
    body: '브랜드 톤과 맞는 컬러 그레이딩으로 채널 간 톤 차이를 줄입니다.',
  },
];

export default function PageVid() {
  return <SubPageShell headTitle=">Video — flowrium" title=">Video" cards={CARDS} />;
}
