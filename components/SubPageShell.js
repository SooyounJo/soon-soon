import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFlowriumSubPageNoScrollClass } from '../hooks/useFlowriumDetailPageClass';
import CardSwap, { Card } from './CardSwap';
import SubPageTitle3D from './SubPageTitle3D';

export default function SubPageShell({ headTitle, title, cards = [], variant, children }) {
  useFlowriumSubPageNoScrollClass();
  const router = useRouter();
  const multiTwo = variant === 'multi-two';
  const lab = variant === 'lab';
  const mobile = variant === 'mobile';
  // Hub 스타일(좌측 3D 타이포 숨김)은 mobile/multi-two만 적용
  const hub = multiTwo || mobile;
  const showHubTypo = multiTwo || lab || mobile;
  const hubCardDelay = 3000;
  const hubPauseOnHover = hub ? false : false;

  const hubTypo = showHubTypo
    ? {
        tl: multiTwo ? 'Scene' : lab ? 'Lab' : 'Mobile',
        br: multiTwo ? 'Device' : lab ? 'Case' : 'UI',
      }
    : null;

  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main
        className={`page-sub page-sub--glass${hub ? ' page-sub--hub' : ''}${lab ? ' page-sub--lab' : ''}${multiTwo ? ' page-sub--multi-two' : ''}`}
      >
        {hubTypo ? (
          <div className="page-sub__hub-typo" aria-hidden>
            <span className="page-sub__hub-typo-tl">{hubTypo.tl}</span>
            <span className="page-sub__hub-typo-br">{hubTypo.br}</span>
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
        {children ? (
          <div className="page-sub__custom-wrap">{children}</div>
        ) : (
          <div
            className={`page-sub__card-swap-wrap${hub ? ' page-sub__card-swap-wrap--hub' : ''}`}
          >
            <CardSwap
              containerClassName={
                multiTwo
                  ? 'card-swap-container--flowrium card-swap-container--multi'
                  : 'card-swap-container--flowrium'
              }
              width={multiTwo ? 400 : lab ? 380 : mobile ? 400 : 440}
              height={multiTwo ? 480 : lab ? 460 : mobile ? 480 : 500}
              cardDistance={multiTwo ? 54 : lab ? 44 : mobile ? 48 : 50}
              verticalDistance={multiTwo ? 66 : lab ? 54 : mobile ? 58 : 60}
              delay={hubCardDelay}
              pauseOnHover={hubPauseOnHover}
              enableWheel
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
        )}
      </main>
    </>
  );
}
