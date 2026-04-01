import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFlowriumSubPageNoScrollClass } from '../hooks/useFlowriumDetailPageClass';
import CardSwap, { Card } from './CardSwap';
import SubPageTitle3D from './SubPageTitle3D';

export default function SubPageShell({ headTitle, title, cards, variant }) {
  useFlowriumSubPageNoScrollClass();
  const router = useRouter();
  const multiTwo = variant === 'multi-two';
  const lab = variant === 'lab';
  const mobile = variant === 'mobile';

  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main
        className={`page-sub page-sub--glass${multiTwo ? ' page-sub--multi-two' : ''}${
          lab ? ' page-sub--lab' : ''
        }`}
      >
        {multiTwo ? (
          <div className="page-sub__multi-typo" aria-hidden>
            <span className="page-sub__multi-typo-tl">Scene</span>
            <span className="page-sub__multi-typo-br">Object</span>
          </div>
        ) : null}
        <div
          className={`page-sub__title-3d-wrap${lab ? ' page-sub__title-3d-wrap--lab' : ''}`}
          aria-hidden="true"
        >
          <SubPageTitle3D text={title} strongHover={lab} />
        </div>
        <p className="page-sub__back">
          <Link href="/">{'< Home'}</Link>
        </p>
        <h1 className="page-sub__title flowrium-sr-only">{title}</h1>
        <div
          className={`page-sub__card-swap-wrap${multiTwo ? ' page-sub__card-swap-wrap--multi-two' : ''}${
            lab ? ' page-sub__card-swap-wrap--lab' : ''
          }`}
        >
          <CardSwap
            containerClassName={
              multiTwo
                ? 'card-swap-container--flowrium card-swap-container--multi'
                : lab
                  ? 'card-swap-container--flowrium card-swap-container--lab'
                  : 'card-swap-container--flowrium'
            }
            width={multiTwo ? 540 : lab ? 480 : 620}
            height={multiTwo ? 620 : lab ? 520 : 640}
            cardDistance={multiTwo ? 76 : lab ? 54 : 68}
            verticalDistance={multiTwo ? 88 : lab ? 62 : 78}
            delay={mobile || multiTwo || lab ? 8000 : 5000}
            pauseOnHover={mobile || multiTwo || lab}
            skewAmount={multiTwo ? 14 : 6}
          >
            {cards.map((c) => (
              <Card
                key={c.id}
                customClass={
                  [c.imageSrc ? 'card--media' : '', c.href ? 'card--clickable' : '']
                    .filter(Boolean)
                    .join(' ') || undefined
                }
                role={c.href ? 'link' : undefined}
                tabIndex={c.href ? 0 : undefined}
                onClick={
                  c.href
                    ? (e) => {
                        e.preventDefault();
                        router.push(c.href);
                      }
                    : undefined
                }
                onKeyDown={
                  c.href
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(c.href);
                        }
                      }
                    : undefined
                }
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
