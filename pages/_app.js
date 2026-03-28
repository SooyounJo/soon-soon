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
            <feGaussianBlur in="SourceGraphic" stdDeviation="24 9" result="b1" />
            <feGaussianBlur in="b1" stdDeviation="9 22" result="b2" />
          </filter>
        </defs>
      </svg>
      <Component {...pageProps} />
    </>
  );
}
