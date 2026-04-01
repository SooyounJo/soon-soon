import FigmaMcpCaseLayout from '../../components/FigmaMcpCaseLayout';
import { newPersonaHero, newPersonaStrip } from '../../lib/figmaMcpPortfolioCases';

export default function PageLabNewPersona() {
  return (
    <FigmaMcpCaseLayout
      headTitle="Lab · New Persona — flowrium"
      backHref="/lab"
      backLabel={'< Lab'}
      nodeId="834:975"
    >
      <h1 className="mcp-case__title">New Persona</h1>
      <p className="mcp-case__lede">‘사회 맞춤형 인스턴트 페르소나’</p>
      <p className="mcp-case__lede">‘Threejs 웹사이트 전시’</p>
      <p className="mcp-case__meta">Just · Desktop Web</p>
      <div className="mcp-case__tags">
        <span className="mcp-case__tag">Threejs</span>
        <span className="mcp-case__tag mcp-case__tag--dim">Blender</span>
      </div>

      <div className="mcp-case__media-block">
        <div className="mcp-case__hero">
          <img
            src={newPersonaHero}
            alt="New Persona — 메인 장면"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </div>
        <div className="mcp-case__wide-strip mcp-case__wide-strip--rail">
          {newPersonaStrip.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`프리뷰 ${i + 1}`}
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
