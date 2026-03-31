import SubPageShell from '../components/SubPageShell';

const CARDS = [
  {
    id: 'e1',
    title: 'Experiment',
    subtitle: 'Try / measure',
    body: '가설을 짧은 프로토타입으로 검증하고, 메트릭·감각 둘 다 보고 다음을 정합니다.',
  },
  {
    id: 'e2',
    title: 'Shader & light',
    subtitle: 'Look dev',
    body: '단색 배경에서도 공간감이 나오도록 라이트 룩과 포스트를 실험합니다.',
  },
  {
    id: 'e3',
    title: 'Interaction',
    subtitle: 'Input → feedback',
    body: '스크롤·포인터·키 입력이 물리적으로 이어지는지 스프링과 커브로 조율합니다.',
  },
];

export default function Page3D() {
  return (
    <SubPageShell headTitle=">Experiment — flowrium" title=">Experiment" cards={CARDS} />
  );
}
