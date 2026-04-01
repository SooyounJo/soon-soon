import { useEffect, useState } from 'react';
import { getCaseWebsiteUrlForNodeId } from '../lib/caseWebsites';

/**
 * 세부 페이지(MCP 케이스·카드 미디어) 이미지 위에서만 표시 — 랜딩 스크롤 링과 유사한 글래스 라벨.
 */
export default function McpCaseViewCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState('View');
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    const getHoverInfo = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const card = el.closest?.('.card--clickable');
      if (card) return { label: 'View', url: null };

      const caseMedia = el.closest?.(
        '.mcp-case__hero, .mcp-case__rail, .mcp-case__grid, .mcp-case__strip, .mcp-case__wide-strip'
      );
      if (caseMedia && el.closest?.('.mcp-case')) {
        const nodeId = el.closest('.mcp-case')?.dataset?.nodeId;
        return { label: 'Go website', url: getCaseWebsiteUrlForNodeId(nodeId) };
      }

      let cur = el;
      while (cur && cur !== document.body) {
        if (cur.tagName === 'IMG') {
          if (cur.closest('.mcp-case')) {
            const nodeId = cur.closest('.mcp-case')?.dataset?.nodeId;
            return { label: 'Go website', url: getCaseWebsiteUrlForNodeId(nodeId) };
          }
          if (cur.closest('.card--media')) return { label: 'View', url: null };
          return false;
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
      const next = getHoverInfo(el);
      if (next) {
        // 링(GlassCursorOverlay)과 겹치지 않게, 활성화 순간에 바로 숨김
        root.classList.add('flowrium-mcp-view-cursor-active');
        setLabel(next.label);
        setUrl(next.url);
        setActive(true);
      } else {
        root.classList.remove('flowrium-mcp-view-cursor-active');
        setUrl(null);
        setActive(false);
      }
    };

    const onPointerDownCapture = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const el = document.elementFromPoint(x, y);
      const info = getHoverInfo(el);
      if (!info?.url) return;
      // 링크/버튼 등 기존 인터랙션은 보존
      if (el?.closest?.('a, button, input, textarea, select, [role="button"]')) return;
      e.preventDefault();
      e.stopPropagation();
      window.location.assign(info.url);
    };

    const onLeave = () => setActive(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDownCapture, true);
    document.addEventListener('pointerleave', onLeave);
    return () => {
      root.classList.remove('flowrium-mcp-view-cursor-active');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onPointerDownCapture, true);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const showRing = Boolean(url);

  return (
    <div
      className={`mcp-case-view-cursor${active ? ' mcp-case-view-cursor--visible' : ''}`}
      aria-hidden
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      <div
        className={`mcp-case-view-cursor__inner${
          showRing ? '' : ' mcp-case-view-cursor__inner--textonly'
        }`}
      >
        {showRing ? <span className="mcp-case-view-cursor__ring" /> : null}
        <span className="mcp-case-view-cursor__label">{label}</span>
      </div>
    </div>
  );
}
