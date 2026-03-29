import dynamic from 'next/dynamic';
import { useEffect, useLayoutEffect } from 'react';
import Head from 'next/head';
import { useLandingBlurUnlock } from '../hooks/useLandingBlurUnlock';

const GlassCursorOverlay = dynamic(
  () => import('../components/GlassCursorOverlay'),
  { ssr: false }
);

const HeroFlowriumGlass3D = dynamic(() => import('../components/HeroFlowriumGlass3D'), {
  ssr: false,
});

export default function Home() {
  useLandingBlurUnlock();

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
        <title>Flowrium</title>
        <meta name="description" content="Flowrium" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preload" href="/main%20vid.mp4" as="video" type="video/mp4" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=swap"
          rel="stylesheet"
        />
      </Head>
      <GlassCursorOverlay />
      <main className="page page-landing">
        <section className="landing-hero" aria-label="Flowrium hero">
          <div className="landing-hero-bg bg-flower" aria-hidden>
            <div className="bg-flower-clip">
              <video
                className="bg-flower-video landing-hero-video landing-hero-video-sharp"
                src="/main%20vid.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
              />
              <video
                className="bg-flower-video landing-hero-video landing-hero-video-blur-layer"
                src="/main%20vid.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
              />
            </div>
            <div className="bg-dither bg-dither-viewport landing-hero-dither" aria-hidden />
            <div
              className="bg-halftone-coarse bg-dither-viewport landing-hero-halftone"
              aria-hidden
            />
          </div>
          <div className="landing-hero-title">
            <div className="title-dither title-dither-viewport landing-title-dither" aria-hidden />
            <div
              className="title-halftone-coarse title-dither-viewport landing-title-halftone"
              aria-hidden
            />
            <div className="title-overlay-inner landing-hero-title-inner">
              <div className="hero-wordmark-wrap hero-wordmark-wrap--glass-hybrid">
                <div className="hero-flowrium-glass-shell">
                  <h1 className="bagel-fat-one-regular hero-flowrium-wordmark-glass hero-flowrium-wordmark-fallback">
                    FLOWRIUM
                  </h1>
                  <div className="hero-flowrium-webgl-mount">
                    <HeroFlowriumGlass3D />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <style jsx>{`
        .page {
          position: relative;
          margin: 0;
          min-height: 100%;
          background: #f4f4f2;
        }
      `}</style>
    </>
  );
}
