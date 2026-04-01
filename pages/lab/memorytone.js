import FigmaMcpCaseLayout from '../../components/FigmaMcpCaseLayout';
import { memorytoneGallery, memorytoneHero } from '../../lib/figmaMcpPortfolioCases';

export default function PageLabMemorytone() {
  return (
    <FigmaMcpCaseLayout
      headTitle="Lab · Memorytone — flowrium"
      backHref="/lab"
      backLabel={'< Lab'}
      nodeId="834:860"
    >
      <h1 className="mcp-case__title">Memorytone</h1>
      <p className="mcp-case__lede">‘여행 기억을 기반으로 음악을 추천해주는 웹’</p>
      <p className="mcp-case__lede">‘Threejs 음악 추천 경험’</p>
      <p className="mcp-case__meta">Just · Desktop Web</p>
      <div className="mcp-case__tags">
        <span className="mcp-case__tag">Threejs</span>
        <span className="mcp-case__tag">Blender</span>
        <span className="mcp-case__tag mcp-case__tag--dim">AI Music</span>
      </div>

      <div className="mcp-case__media-block">
        <div className="mcp-case__hero">
          <img
            src={memorytoneHero}
            alt="Memorytone — 3D 스튜디오"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </div>
        <div className="mcp-case__wide-strip mcp-case__wide-strip--rail">
          {memorytoneGallery.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`갤러리 ${i + 1}`}
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
