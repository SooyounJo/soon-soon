import dynamic from 'next/dynamic';
import { FLOWRIUM_METALLIC_PROPS, TITLE_LETTERS } from '../../lib/flowriumTitleProps';

const FlowriumMetallicTitle = dynamic(
  () => import('../FlowriumMetallicTitle'),
  { ssr: false }
);

/**
 * 인트로 텍스트 + 뷰포트 전체 타이틀용 디더 + 단일 메탈릭 캔버스
 * 스플릿 느낌은 가벼운 .title-letter-slot 오버레이 스태거( WebGL 1회만 )
 */
export default function FlowriumTitleStack() {
  return (
    <div className="title-overlay">
      <div className="title-overlay-inner">
        <div
          className="title-dither-viewport title-dither bg-dither-masked"
          aria-hidden
        />
        <div
          className="title-halftone-viewport title-halftone-coarse bg-dither-masked"
          aria-hidden
        />
        <p className="hero-intro-title font-bagel" aria-hidden>
          FLOWRIUM
        </p>
        <div className="metallic-title-inner title-scatter-wrap">
          <div className="title-metallic-row">
            <div className="title-metallic-canvas-layer">
              <div className="metallic-layer title-metallic-canvas-wrap">
                <FlowriumMetallicTitle seed={42} {...FLOWRIUM_METALLIC_PROPS} />
              </div>
            </div>
            {TITLE_LETTERS.map((ch, i) => (
              <span
                key={`slot-${ch}-${i}`}
                className="title-letter-slot"
                data-letter-i={i}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
