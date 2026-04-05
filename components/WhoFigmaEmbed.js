import Head from 'next/head';
import { useLayoutEffect } from 'react';
import { FIGMA_WHO_EMBED_SRC } from '../lib/figmaWhoEmbed';

export default function WhoFigmaEmbed() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('flowrium-home', 'hero-revealed', 'flowrium-home-route');
    document.documentElement.classList.add('page-who-figma-root');
    return () => {
      document.documentElement.classList.remove('page-who-figma-root');
    };
  }, []);

  return (
    <>
      <Head>
        <title>&gt;Who — flowrium</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="page-who-figma">
        <div className="page-who-figma__scroll">
          <iframe
            className="page-who-figma__iframe"
            title="Who — Figma 이력 (node 848:1243)"
            src={FIGMA_WHO_EMBED_SRC}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </main>
    </>
  );
}
