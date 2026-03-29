import dynamic from 'next/dynamic';
import { useEffect, useLayoutEffect } from 'react';
import Head from 'next/head';

const GlassCursorOverlay = dynamic(
  () => import('../components/GlassCursorOverlay'),
  { ssr: false }
);

const HeroFlowriumGlass3D = dynamic(() => import('../components/HeroFlowriumGlass3D'), {
  ssr: false,
});

export default function Home() {
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
      <main className="page page-landing page-landing--mint page-landing--scroll-gravity">
        <section
          className="landing-hero landing-hero--fixed-gravity"
          aria-label="soon-soon hero"
        >
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
                    <HeroFlowriumGlass3D />
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
