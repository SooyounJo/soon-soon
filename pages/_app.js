import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* 방향성 블러(가로/세로 stdDeviation 다름) + 교차 패스로 물 스며듦 느낌 */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none' }}
        aria-hidden
      >
        <defs>
          <filter
            id="flowrium-blur-soak"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            {/* 단일 패스로 비용 절감 — 이전 이중 가우시안과 유사한 느낌은 stdDeviation 튜닝으로 맞춤 */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          {/* 랜딩 히어로: 초기 상태만 강하게 — 휠로 선명 레이어와 크로스페이드 */}
          <filter
            id="flowrium-blur-landing"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
          </filter>
        </defs>
      </svg>
      <Component {...pageProps} />
    </>
  );
}
