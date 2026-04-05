import SubPageShell from '../components/SubPageShell';

import labCard1 from '../assets/lab/lab-card-1.png';
import labCard2 from '../assets/lab/lab-card-2.png';
import labCard3 from '../assets/lab/lab-card-3.png';

/**
 * Lab 카드 이미지 — webpack 번들에 포함되어 public 누락·배포 경로 문제 없이 로드됨.
 * (StaticImageData.src = 해시된 _next/static/media/ URL)
 */
const CARDS = [
  {
    id: 'lab-memorytone',
    imageSrc: labCard1.src,
    imageAlt: 'Memorytone — portable record player',
    href: '/lab/memorytone',
  },
  {
    id: 'lab-flowrium',
    imageSrc: labCard2.src,
    imageAlt: 'Flowrium — moss and flowers',
    href: '/lab/flowrium',
  },
  {
    id: 'lab-new-persona',
    imageSrc: labCard3.src,
    imageAlt: 'New Persona',
    href: '/lab/new-persona',
  },
  {
    id: 'lab-tbc',
    continuedOnly: true,
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
