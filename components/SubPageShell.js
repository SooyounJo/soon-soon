import Head from 'next/head';
import Link from 'next/link';
import CardSwap, { Card } from './CardSwap';
import SubPageTitle3D from './SubPageTitle3D';

export default function SubPageShell({ headTitle, title, cards, variant }) {
  const multiTwo = variant === 'multi-two';

  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main
        className={`page-sub page-sub--glass${multiTwo ? ' page-sub--multi-two' : ''}`}
      >
        {multiTwo ? (
          <div className="page-sub__multi-typo" aria-hidden>
            <span className="page-sub__multi-typo-tl">Scene</span>
            <span className="page-sub__multi-typo-br">Object</span>
          </div>
        ) : null}
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
        <div
          className={`page-sub__card-swap-wrap${multiTwo ? ' page-sub__card-swap-wrap--multi-two' : ''}`}
        >
          <CardSwap
            containerClassName={
              multiTwo
                ? 'card-swap-container--flowrium card-swap-container--multi'
                : 'card-swap-container--flowrium'
            }
            width={multiTwo ? 540 : 620}
            height={multiTwo ? 620 : 640}
            cardDistance={multiTwo ? 76 : 68}
            verticalDistance={multiTwo ? 88 : 78}
            delay={5000}
            pauseOnHover={false}
            skewAmount={multiTwo ? 14 : 6}
          >
            {cards.map((c) => (
              <Card
                key={c.id}
                customClass={c.imageSrc ? 'card--media' : undefined}
              >
                {c.continuedOnly ? (
                  <p className="card__continued" lang="en">
                    To be continued
                  </p>
                ) : c.imageSrc ? (
                  <figure className="card__figure">
                    <img
                      className="card__img"
                      src={c.imageSrc}
                      alt={c.imageAlt || ''}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </figure>
                ) : (
                  <>
                    {c.eyebrow ? <p className="card__eyebrow">{c.eyebrow}</p> : null}
                    {c.title ? <h3>{c.title}</h3> : null}
                    {c.subtitle ? <p className="card__sub">{c.subtitle}</p> : null}
                    {c.body ? <p className="card__body">{c.body}</p> : null}
                  </>
                )}
              </Card>
            ))}
          </CardSwap>
        </div>
        {multiTwo ? (
          <div className="page-sub__scroll-hint" role="note">
            <p className="page-sub__scroll-hint-line">위로 스크롤 하여</p>
            <p className="page-sub__scroll-hint-line page-sub__scroll-hint-line--emph">
              체험을 시작하기
            </p>
          </div>
        ) : null}
      </main>
    </>
  );
}
