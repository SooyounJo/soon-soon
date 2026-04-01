import FigmaMcpCaseLayout from '../../components/FigmaMcpCaseLayout';
import {
  platformLColumn,
  platformLFocus,
  platformLHero,
  platformLWide,
} from '../../lib/figmaMcpPortfolioCases';

export default function PagePlatformL() {
  return (
    <FigmaMcpCaseLayout
      headTitle="Multi · Platform-L — flowrium"
      backHref="/obj"
      backLabel={'< Multi'}
      nodeId="834:937"
    >
      <h1 className="mcp-case__title">Platform-L 무라카미 하루키전</h1>
      <p className="mcp-case__lede">‘무라카미 하루키에게 한 마디’</p>
      <p className="mcp-case__lede">‘슬라이드로 미디어월 인터랙션’</p>
      <p className="mcp-case__meta">Mobile × Desktop Web</p>
      <div className="mcp-case__tags">
        <span className="mcp-case__tag">Figma MCP</span>
        <span className="mcp-case__tag mcp-case__tag--dim">Socket.IO</span>
      </div>

      <div className="mcp-case__body-rail">
        <div className="mcp-case__body-rail-main">
          <div className="mcp-case__hero">
            <img
              src={platformLHero}
              alt="Platform-L — 메인 보드"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </div>
          <div className="mcp-case__hero">
            <img
              src={platformLFocus}
              alt="Platform-L — 포커스 화면"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
          <div className="mcp-case__grid">
            {platformLColumn.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`화면 ${i + 1}`}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            ))}
          </div>
        </div>
        <div className="mcp-case__wide-strip mcp-case__wide-strip--rail">
          {platformLWide.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`패널 ${i + 1}`}
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
