import FigmaMcpCaseLayout from '../../components/FigmaMcpCaseLayout';
import { flowriumCaseHero, flowriumCaseStrip } from '../../lib/figmaMcpPortfolioCases';

export default function PageLabFlowriumCase() {
  return (
    <FigmaMcpCaseLayout headTitle="Lab · Flowrium — flowrium" nodeId="834:827">
      <div className="mcp-case__layout mcp-case__layout--flowrium">
        <div className="mcp-case__info">
          <h1 className="mcp-case__title">Flowrium</h1>
          <p className="mcp-case__lede">‘지구 모티프 향수 브랜드 웹사이트’</p>
          <p className="mcp-case__lede">‘WebGL을 활용한 공간 구성’</p>
          <p className="mcp-case__meta">Just · Desktop Web</p>
          <div className="mcp-case__tags">
            <span className="mcp-case__tag">WebGL</span>
            <span className="mcp-case__tag">Midjourney</span>
            <span className="mcp-case__tag mcp-case__tag--dim">Figma MCP</span>
          </div>
        </div>

        <div className="mcp-case__hero mcp-case__hero--main">
          <img
            src={flowriumCaseHero}
            alt="Flowrium — 히어로"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </div>

        <div className="mcp-case__rail" style={{ '--rail-count': flowriumCaseStrip.length }}>
          {flowriumCaseStrip.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`섹션 ${i + 1}`}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          ))}
        </div>
      </div>
    </FigmaMcpCaseLayout>
  );
}
