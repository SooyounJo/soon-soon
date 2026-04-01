import SubPageShell from '../components/SubPageShell';
import MobileHubSlideshow from '../components/MobileHubSlideshow';

/** 각 카드: eyebrow · title · body / 앞 두 카드는 클릭 시 Figma 세부 페이지 */
import naverCover from '../assets/mobile/naver.png';
import manpaCover from '../assets/mobile/manpa.png';

export default function Page2D() {
  return (
    <SubPageShell
      headTitle=">Mobile — flowrium"
      title=">Mobile"
      variant="mobile"
    >
      <MobileHubSlideshow naverCoverSrc={naverCover.src} manpaCoverSrc={manpaCover.src} />
    </SubPageShell>
  );
}
