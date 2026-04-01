import Head from 'next/head';
import Link from 'next/link';
import { useFlowriumMcpDetailClass } from '../../hooks/useFlowriumDetailPageClass';
import { manpaHero, manpaThumbs } from '../../lib/figmaMcpMobileCaseAssets';

export default function PageMobileManpa() {
  useFlowriumMcpDetailClass();

  return (
    <>
      <Head>
        <title>Mobile · Manpa — flowrium</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="mcp-case mcp-case--manpa" data-node-id="834:895">
        <header className="mcp-case__bar">
          <Link href="/2d">{'< Mobile'}</Link>
        </header>
        <div className="mcp-case__glow" aria-hidden />
        <div className="mcp-case__inner">
          <div className="mcp-case__split">
            <div className="mcp-case__split-main">
              <h1 className="mcp-case__title">만파식적</h1>
              <p className="mcp-case__lede">‘도시 속 명상, 인터랙션 아트 웹’</p>
              <p className="mcp-case__lede">‘숨을 쉬어 인풋을 넣어보세요’</p>
              <p className="mcp-case__body">
                Mobile x Media Wall — 파동·호흡 기반 인터랙션을 모바일과 미디어월에서 연결한
                프로젝트 보드입니다.
              </p>
              <div className="mcp-case__tags">
                <span className="mcp-case__tag">WebGL</span>
                <span className="mcp-case__tag mcp-case__tag--dim">Figma MCP</span>
              </div>

              <div className="mcp-case__grid">
                {manpaThumbs.map((src, i) => (
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt={`만파 화면 ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                ))}
              </div>
            </div>

            <div className="mcp-case__banner">
              <img
                src={manpaHero}
                alt="만파식적 — 주요 비주얼"
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
