import dynamic from 'next/dynamic';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import Head from 'next/head';

const GlassCursorOverlay = dynamic(
  () => import('../components/GlassCursorOverlay'),
  { ssr: false }
);

const HeroFlowriumGlass3D = dynamic(() => import('../components/HeroFlowriumGlass3D'), {
  ssr: false,
});

const GradientText = dynamic(() => import('../components/GradientText'), { ssr: false });

export default function Home() {
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [showEntryLoader, setShowEntryLoader] = useState(true);

  const handleHeroReady = useCallback(() => {
    setIsHeroReady(true);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.add(
      'flowrium-home',
      'hero-revealed',
      'flowrium-glass-cursor'
    );
  }, []);

  useEffect(() => {
    document.documentElement.classList.add(
      'flowrium-home',
      'hero-revealed',
      'flowrium-glass-cursor'
    );

    return () => {
      document.documentElement.classList.remove(
        'flowrium-home',
        'hero-revealed',
        'flowrium-glass-cursor'
      );
    };
  }, []);

  useEffect(() => {
    if (!isHeroReady) return;
    const id = window.setTimeout(() => setShowEntryLoader(false), 520);
    return () => window.clearTimeout(id);
  }, [isHeroReady]);

  useEffect(() => {
    const failSafe = window.setTimeout(() => {
      setShowEntryLoader(false);
    }, 9000);
    return () => window.clearTimeout(failSafe);
  }, []);

  return (
    <>
      <Head>
        <title>soon-soon</title>
        <meta name="description" content="soon-soon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=swap"
          rel="stylesheet"
        />
      </Head>
      <GlassCursorOverlay />
      {showEntryLoader ? (
        <div
          className={`flowrium-entry-loader${isHeroReady ? ' flowrium-entry-loader--leave' : ''}`}
          aria-hidden
        >
          <div className="flowrium-entry-loader-wordmark bagel-fat-one-regular">
            <span className="flowrium-entry-loader-line">soon</span>
            <span className="flowrium-entry-loader-dash">-</span>
            <span className="flowrium-entry-loader-line">soon</span>
          </div>
        </div>
      ) : null}
      <main className="page page-landing page-landing--mint page-landing--scroll-gravity">
        <section
          className="landing-hero landing-hero--fixed-gravity"
          aria-label="soon-soon hero"
        >
          <div className="landing-hero-chrome" aria-hidden="true">
            <div className="landing-hero-chrome-top">
              <span className="landing-hero-chrome-line">
                flowrium — surface, glass, motion
              </span>
              <span className="landing-hero-chrome-line landing-hero-chrome-line--end">
                lab / index / experiments
              </span>
            </div>
            <div className="landing-hero-chrome-bottom">
              <span className="landing-hero-chrome-line landing-hero-chrome-line--corner">
                © flowrium
              </span>
              <span className="landing-hero-chrome-scroll landing-hero-chrome-scroll-hint-wrap">
                <GradientText
                  colors={['#22C55E', '#4ADE80', '#86EFAC']}
                  animationSpeed={8}
                  showBorder={false}
                  className="landing-hero-chrome-scroll--gradient"
                >
                  Scroll Down
                </GradientText>
              </span>
              <span className="landing-hero-chrome-line landing-hero-chrome-line--corner landing-hero-chrome-line--end">
                digital · spatial · type
              </span>
            </div>
          </div>
          <div className="landing-hero-title">
            <div className="title-overlay-inner landing-hero-title-inner">
              <div className="hero-wordmark-wrap hero-wordmark-wrap--glass-hybrid">
                <div className="hero-flowrium-glass-shell">
                  <h1 className="bagel-fat-one-regular hero-flowrium-wordmark-glass hero-flowrium-wordmark-fallback hero-soon-soon-fallback">
                    <span className="hero-soon-soon-line">soon</span>
                    <span className="hero-soon-soon-dash" aria-hidden="true">
                      -
                    </span>
                    <span className="hero-soon-soon-line">soon</span>
                  </h1>
                  <div className="hero-flowrium-webgl-mount">
                    <HeroFlowriumGlass3D onReady={handleHeroReady} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="landing-scroll-spacer" aria-hidden="true" />
      </main>
      <style jsx>{`
        .page {
          position: relative;
          margin: 0;
          min-height: 100%;
          background: var(--flowrium-mint-bg, #000000);
        }
      `}</style>
    </>
  );
}
