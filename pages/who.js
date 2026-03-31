import SubPageShell from '../components/SubPageShell';

const CARDS = [
  {
    id: 'who-1',
    title: 'About',
    subtitle: 'Profile',
    body: '포트폴리오와 작업 아카이브를 한곳에 모은 공간입니다.',
  },
  {
    id: 'who-2',
    title: 'Focus',
    subtitle: 'Code & Tech · UI/UX',
    body: '제품을 만드는 흐름 전체를 디자인과 구현로 연결하는 것에 집중합니다.',
  },
  {
    id: 'who-3',
    title: 'Contact',
    subtitle: 'Collaboration',
    body: '새 프로젝트나 실험적 협업 제안을 환영합니다.',
  },
];

export default function PageWho() {
  return <SubPageShell headTitle=">Who — flowrium" title=">Who" cards={CARDS} />;
}
