import { useLayoutEffect } from 'react';

/** MCP/2d 케이스 등 — 뷰포트 단일 화면(바깥 스크롤 없음) */
export function useFlowriumMcpDetailClass() {
  useLayoutEffect(() => {
    document.documentElement.classList.add('flowrium-mcp-detail');
    return () => document.documentElement.classList.remove('flowrium-mcp-detail');
  }, []);
}

/** SubPageShell 기반 목록·카드 페이지 */
export function useFlowriumSubPageNoScrollClass() {
  useLayoutEffect(() => {
    document.documentElement.classList.add('flowrium-page-sub-no-scroll');
    return () => document.documentElement.classList.remove('flowrium-page-sub-no-scroll');
  }, []);
}
