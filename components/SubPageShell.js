import Head from 'next/head';
import Link from 'next/link';
import CardSwap, { Card } from './CardSwap';
import SubPageTitle3D from './SubPageTitle3D';

export default function SubPageShell({ headTitle, title, cards }) {
  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="page-sub page-sub--glass">
        <div
          className="page-sub__title-3d-wrap"
          aria-hidden="true"
        >
          <SubPageTitle3D text={title} />
        </div>
        <p className="page-sub__back">
          <Link href="/">← Home</Link>
        </p>
        <h1 className="page-sub__title flowrium-sr-only">{title}</h1>
        <div className="page-sub__card-swap-wrap">
          <CardSwap
            containerClassName="card-swap-container--flowrium"
            width={500}
            height={540}
            cardDistance={60}
            verticalDistance={72}
            delay={5000}
            pauseOnHover={false}
          >
            {cards.map((c) => (
              <Card key={c.id}>
                <h3>{c.title}</h3>
                {c.subtitle ? <p className="card__sub">{c.subtitle}</p> : null}
                {c.body ? <p className="card__body">{c.body}</p> : null}
              </Card>
            ))}
          </CardSwap>
        </div>
      </main>
    </>
  );
}
