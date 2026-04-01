import FigmaMcpCaseLayout from '../../components/FigmaMcpCaseLayout';
import {
  lgHomeExtra,
  lgHomeHero,
  lgHomePhones,
  lgHomeStrip,
  lgHomeWide,
} from '../../lib/figmaMcpPortfolioCases';

export default function PageLgHomeAi() {
  return (
    <FigmaMcpCaseLayout headTitle="Multi · LG Home AI — flowrium" nodeId="834:776">
      <h1 className="mcp-case__title">LG Home AI</h1>
      <p className="mcp-case__lede">‘집안 공간을 지휘하는 AI 경험’</p>
      <p className="mcp-case__lede">‘모바일 기분 인풋으로 환경이 바뀌는 경험’</p>
      <p className="mcp-case__meta">Mobile × Multi Media</p>
      <div className="mcp-case__tags">
        <span className="mcp-case__tag">CSS</span>
        <span className="mcp-case__tag">Figma MCP</span>
        <span className="mcp-case__tag mcp-case__tag--dim">Socket.IO</span>
      </div>

      <div className="mcp-case__body-rail">
        <div className="mcp-case__body-rail-main">
          <div className="mcp-case__hero">
            <img
              src={lgHomeHero}
              alt="LG Home AI — Harmonic intelligence"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </div>
          <div className="mcp-case__hero">
            <img
              src={lgHomeWide}
              alt="LG Home AI — 캠퍼스 공간"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
          <div className="mcp-case__grid">
            {lgHomePhones.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`플로우 ${i + 1}`}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            ))}
          </div>
          <div className="mcp-case__hero">
            <img
              src={lgHomeExtra}
              alt="LG Home AI — 추가 뷰"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>
        <div className="mcp-case__wide-strip mcp-case__wide-strip--rail">
          {lgHomeStrip.map((src, i) => (
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
    </FigmaMcpCaseLayout>
  );
}
