import Head from 'next/head';
import Link from 'next/link';
import { useLayoutEffect } from 'react';
import { FIGMA_WHO_EMBED_SRC, FIGMA_WHO_PAGE_URL } from '../lib/figmaWhoEmbed';

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
        <header className="page-who-figma__bar">
          <Link className="page-who-figma__back" href="/">
            {'< Home'}
          </Link>
          <a
            className="page-who-figma__open"
            href={FIGMA_WHO_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Figma
          </a>
        </header>
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
