import SubPageShell from '../components/SubPageShell';

import memorytone from '../assets/lab/memorytone.png';
import flowrium from '../assets/lab/flowrium.png';
import newPersona from '../assets/lab/new-persona.png';

/**
 * Lab 카드 이미지 — webpack 번들에 포함되어 public 누락·배포 경로 문제 없이 로드됨.
 * (StaticImageData.src = 해시된 _next/static/media/ URL)
 */
const CARDS = [
  {
    id: 'lab-memorytone',
    imageSrc: memorytone.src,
    imageAlt: 'Memorytone — portable record player',
    href: '/lab/memorytone',
  },
  {
    id: 'lab-flowrium',
    imageSrc: flowrium.src,
    imageAlt: 'Flowrium — moss and flowers',
    href: '/lab/flowrium',
  },
  {
    id: 'lab-new-persona',
    imageSrc: newPersona.src,
    imageAlt: 'New Persona',
    href: '/lab/new-persona',
  },
];

export default function PageLab() {
  return (
    <SubPageShell
      headTitle=">Lab — flowrium"
      title=">Lab"
      cards={CARDS}
      variant="lab"
    />
  );
}
