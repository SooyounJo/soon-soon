import SubPageShell from '../components/SubPageShell';

const CARDS = [
  {
    id: 'o1',
    title: 'Multi-object',
    subtitle: 'Scenes',
    body: '하나의 장면에 여러 메시·머티리얼·라이트가 어우러질 때의 균형을 맞춥니다.',
  },
  {
    id: 'o2',
    title: 'Material',
    subtitle: 'Glass & metal',
    body: '굴절·반사·굵기의 미묘한 차이로 재질이 읽히게 조절합니다.',
  },
  {
    id: 'o3',
    title: 'LOD & instancing',
    subtitle: 'Scale',
    body: '디테일과 프레임 예산 사이에서 인스턴싱·LOD를 선택합니다.',
  },
];

export default function PageObj() {
  return <SubPageShell headTitle=">Multi — flowrium" title=">Multi" cards={CARDS} />;
}
