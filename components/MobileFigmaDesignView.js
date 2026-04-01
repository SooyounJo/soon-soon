import Head from 'next/head';
import Link from 'next/link';

/**
 * Figma iframe 임베드 대신, Cursor **Figma MCP** `get_screenshot`(fileKey + nodeId)로
 * 뽑은 PNG/WebP를 `public/` 경로에 두고 여기서 표시합니다. (런타임에 MCP 호출 불가)
 *
 * fileKey: aIkou5NslP8rSqqOiAl7gf — Naver node 834:631, Manpa node 834:895
 */
export default function MobileFigmaDesignView({
  title,
  headTitle,
  figmaUrl,
  backHref,
  backLabel,
  /** 예: /mobile/figma/naver.png (MCP 스크린샷으로 교체) */
  imageSrc,
  imageAlt,
}) {
  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="page-figma-design">
        <header className="page-figma-design__bar">
          <Link className="page-figma-design__back" href={backHref}>
            {backLabel}
          </Link>
          <a
            className="page-figma-design__open"
            href={figmaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Figma에서 열기
          </a>
        </header>
        <div className="page-figma-design__canvas">
          <img
            className="page-figma-design__img"
            src={imageSrc}
            alt={imageAlt || title}
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </div>
      </main>
    </>
  );
}
