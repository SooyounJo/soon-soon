import dynamic from 'next/dynamic';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import Head from 'next/head';
import CircularText from '../components/CircularText';
import GlassCursorOverlay from '../components/GlassCursorOverlay';
import LandingGlassDockNav from '../components/LandingGlassDockNav';
import scrollLandingToView from '../utils/scrollLandingToView';

/** HeroFlowriumGlass3D PHASE1_END 와 동기 */
const LANDING_GLASS_NAV_AFTER = 0.44;
const RETURN_TO_VIEW_KEY = 'flowrium:return-to-view';

const HeroFlowriumGlass3D = dynamic(() => import('../components/HeroFlowriumGlass3D'), {
  ssr: false,
});

export default function Home() {
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [showEntryLoader, setShowEntryLoader] = useState(true);
  const [isLoaderLeaving, setIsLoaderLeaving] = useState(false);
  const [loaderStartedAt, setLoaderStartedAt] = useState(() => Date.now());
  const [showGlassNav, setShowGlassNav] = useState(false);

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
    // 랜딩 진입 시 스크롤 복원으로 중간 프레임에서 시작되는 현상 방지
    const prev = window.history.scrollRestoration;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    let shouldRestoreView = false;
    try {
      shouldRestoreView = window.sessionStorage.getItem(RETURN_TO_VIEW_KEY) === '1';
      if (shouldRestoreView) {
        window.sessionStorage.removeItem(RETURN_TO_VIEW_KEY);
      }
    } catch (_) {
      shouldRestoreView = false;
    }

    const navEntry =
      typeof window.performance?.getEntriesByType === 'function'
        ? window.performance.getEntriesByType('navigation')[0]
        : null;
    const isBackForward = Boolean(navEntry && navEntry.type === 'back_forward');

    if (isBackForward && shouldRestoreView) {
      requestAnimationFrame(() => {
        scrollLandingToView({ behavior: 'auto' });
      });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = prev;
      }
    };
  }, []);

  useEffect(() => {
    if (!isHeroReady) return;
    const elapsed = Date.now() - loaderStartedAt;
    const remain = Math.max(0, 4000 - elapsed);
    const leaveId = window.setTimeout(() => {
      setIsLoaderLeaving(true);
    }, remain);
    const hideId = window.setTimeout(() => {
      setShowEntryLoader(false);
      setIsLoaderLeaving(false);
    }, remain + 560);
    return () => {
      window.clearTimeout(leaveId);
      window.clearTimeout(hideId);
    };
  }, [isHeroReady, loaderStartedAt]);

  useEffect(() => {
    const onResize = () => {
      document
        .querySelector('.hero-flowrium-glass-shell')
        ?.classList.remove('hero-flowrium-webgl-text-ready');
      setIsHeroReady(false);
      setShowEntryLoader(true);
      setIsLoaderLeaving(false);
      setLoaderStartedAt(Date.now());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = window.scrollY / maxScroll;
      setShowGlassNav(isHeroReady && p >= LANDING_GLASS_NAV_AFTER);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHeroReady]);

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
          className={`flowrium-entry-loader${isLoaderLeaving ? ' flowrium-entry-loader--leave' : ''}`}
          aria-hidden
        >
          <div className="flowrium-entry-loader-inner">
            <CircularText
              text="soon-soon-soon-soon-"
              spinDuration={12}
              className="flowrium-entry-loader-circular"
            />
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
              <button
                type="button"
                className="landing-hero-chrome-line landing-hero-chrome-line--scroll-trigger landing-hero-chrome-line--wobble landing-hero-chrome-line--menu"
                title="Scroll to view"
                onClick={scrollLandingToView}
              >
                Menu
              </button>
              <span className="landing-hero-chrome-line landing-hero-chrome-line--end landing-hero-chrome-line--wobble">
                dus10167@gmail.com
                <br />
                dus10167@naver.com
              </span>
            </div>
            <div className="landing-hero-chrome-bottom">
              <span className="landing-hero-chrome-line landing-hero-chrome-line--corner landing-hero-chrome-line--wobble">
                Archive
                <br />
                2024-2026
              </span>
              <span className="landing-hero-chrome-line landing-hero-chrome-line--center landing-hero-chrome-line--wobble-center">
                SooYoun Jo
              </span>
              <span className="landing-hero-chrome-line landing-hero-chrome-line--corner landing-hero-chrome-line--end landing-hero-chrome-line--wobble">
                UI &amp; UX Design
                <br />
                Code &amp; Tech Design
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
        <LandingGlassDockNav visible={showGlassNav} />
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
