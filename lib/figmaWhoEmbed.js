/**
 * Figma MCP `get_design_context` 기준 — fileKey + node 848:1243 (이력).
 * @see https://www.figma.com/design/aIkou5NslP8rSqqOiAl7gf/%EC%A1%B0%EC%88%98%EC%97%B0-%EA%B3%B5%EA%B0%84?node-id=848-1243
 */
export const FIGMA_WHO_FILE_KEY = 'aIkou5NslP8rSqqOiAl7gf';

export const FIGMA_WHO_NODE_ID = '848-1243';

/** 공유용 원본 링크 (브라우저·임베드 url 파라미터) */
export const FIGMA_WHO_PAGE_URL = `https://www.figma.com/design/${FIGMA_WHO_FILE_KEY}/%EC%A1%B0%EC%88%98%EC%97%B0-%EA%B3%B5%EA%B0%84?node-id=${FIGMA_WHO_NODE_ID}`;

/** Figma 공식 embed (스크롤은 플레이어/래퍼에서 처리) */
export const FIGMA_WHO_EMBED_SRC = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(FIGMA_WHO_PAGE_URL)}`;
