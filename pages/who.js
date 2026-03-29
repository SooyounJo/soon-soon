import Head from 'next/head';
import Link from 'next/link';

export default function PageWho() {
  return (
    <>
      <Head>
        <title>WHO — flowrium</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="page-sub">
        <p>
          <Link href="/">← Home</Link>
        </p>
        <h1>WHO</h1>
      </main>
      <style jsx>{`
        main.page-sub {
          min-height: 100vh;
          background: #000;
          color: #fff;
          padding: 2rem;
          font-family: system-ui, sans-serif;
        }
        main.page-sub a {
          color: #aaa;
        }
      `}</style>
    </>
  );
}
