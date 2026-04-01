import { useEffect, useState } from 'react';

/**
 * 세부 페이지(MCP 케이스·카드 미디어) 이미지 위에서만 표시 — 랜딩 스크롤 링과 유사한 글래스 라벨.
 */
export default function McpCaseViewCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const overTargetImg = (el) => {
      if (!el || el.nodeType !== 1) return false;
      let cur = el;
      while (cur && cur !== document.body) {
        if (cur.tagName === 'IMG') {
          return !!(cur.closest('.mcp-case') || cur.closest('.card--media'));
        }
        cur = cur.parentElement;
      }
      return false;
    };

    const onMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      setPos({ x, y });
      const el = document.elementFromPoint(x, y);
      setActive(overTargetImg(el));
    };

    const onLeave = () => setActive(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      className={`mcp-case-view-cursor${active ? ' mcp-case-view-cursor--visible' : ''}`}
      aria-hidden
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      <div className="mcp-case-view-cursor__inner">
        <span className="mcp-case-view-cursor__ring" />
        <span className="mcp-case-view-cursor__label">View site</span>
      </div>
    </div>
  );
}
