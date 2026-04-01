import Head from 'next/head';
import Link from 'next/link';
import { useFlowriumMcpDetailClass } from '../../hooks/useFlowriumDetailPageClass';
import { naverFlowScreens, naverHeroDevice, naverStrip } from '../../lib/figmaMcpMobileCaseAssets';

export default function PageMobileNaver() {
  useFlowriumMcpDetailClass();

  return (
    <>
      <Head>
        <title>Mobile · Naver — flowrium</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="mcp-case mcp-case--naver" data-node-id="834:631">
        <header className="mcp-case__bar">
          <Link href="/2d">{'< Mobile'}</Link>
        </header>
        <div className="mcp-case__glow" aria-hidden />
        <div className="mcp-case__inner">
          <h1 className="mcp-case__title">Naver x Coex AI Agent Web</h1>
          <p className="mcp-case__lede">‘코엑스 안내용 AI 에이전트’</p>
          <p className="mcp-case__lede">‘미디어 월 QR코드를 통한 경험’</p>
          <p className="mcp-case__body">
            가상의 Sori라는 인물과 대화하며 코엑스 공간을 안내받는 웹 프로젝트
            <br />
            <span className="mcp-case__note">* WebGL AI 에이전트 코드 담당_1인</span>
          </p>
          <div className="mcp-case__tags">
            <span className="mcp-case__tag">WebGL</span>
            <span className="mcp-case__tag mcp-case__tag--dim">Spring</span>
          </div>

          <div className="mcp-case__body-rail">
            <div className="mcp-case__body-rail-main">
              <div className="mcp-case__aurora" aria-hidden />
              <div className="mcp-case__hero">
                <img
                  src={naverHeroDevice}
                  alt="Naver x Coex AI Agent — 주요 목업"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>
              <div className="mcp-case__grid">
                {naverFlowScreens.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`플로우 화면 ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                ))}
              </div>
            </div>
            <div className="mcp-case__strip mcp-case__strip--rail">
              {naverStrip.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`쇼케이스 ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
