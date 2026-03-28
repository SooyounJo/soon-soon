/**
 * 고정 배경: 블러/선명 이미지, 디더, 글라스
 */
export default function FlowriumBackground() {
  return (
    <div className="bg-flower" aria-hidden>
      <img
        src="/maingra.png"
        alt=""
        className="bg-flower-video bg-flower-video-blur"
        draggable={false}
      />
      <div className="bg-dither bg-dither-masked" aria-hidden />
      <div className="bg-halftone-coarse bg-dither-masked" aria-hidden />
      <div className="bg-glass-field bg-glass-outer-masked" aria-hidden />
      <img
        src="/maingra.png"
        alt=""
        className="bg-flower-video bg-flower-video-sharp"
        draggable={false}
      />
    </div>
  );
}
