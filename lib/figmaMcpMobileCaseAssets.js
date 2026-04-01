/**
 * Figma 공식 MCP(get_design_context)에서 내려준 에셋 URL.
 * 호스트 정책상 일정 기간 후 만료될 수 있어, 갱신 시 MCP로 동일 노드를 다시 받으면 됩니다.
 * node 834:631 (Naver), 834:895 (Manpa)
 */
const A = 'https://www.figma.com/api/mcp/asset';

export const NAVER_FIGMA_DEV_URL =
  'https://www.figma.com/design/aIkou5NslP8rSqqOiAl7gf/%EC%A1%B0%EC%88%98%EC%97%B0-%EA%B3%B5%EA%B0%84?node-id=834-631&m=dev';

export const MANPA_FIGMA_DEV_URL =
  'https://www.figma.com/design/aIkou5NslP8rSqqOiAl7gf/%EC%A1%B0%EC%88%98%EC%97%B0-%EA%B3%B5%EA%B0%84?node-id=834-895&m=dev';

/** 큰 목업(디바이스 프레임) */
export const naverHeroDevice = `${A}/c47dfc81-98d1-440c-be39-089d7f93cadd`;

/** 플로우 스크린 캡처(그리드) */
export const naverFlowScreens = [
  `${A}/4ad8eff9-e660-4b86-8d04-48d9e11be8a5`,
  `${A}/abd4c773-191b-4b97-a1b1-445135975758`,
  `${A}/8010afb5-327c-48dd-ac12-a5159e7a6833`,
  `${A}/8fd2fa02-1a1a-4c6f-803a-4ee17eb2d363`,
  `${A}/9312943f-5f8c-431b-9c69-4f7e6f8fb64c`,
  `${A}/a87dd9d9-507a-4769-b03a-36aedc5a5088`,
  `${A}/9430e869-4c57-417b-81c5-24627be1a4fc`,
  `${A}/4dd618cc-c30e-448e-a606-2772f4c96d56`,
  `${A}/881f7cdc-a9a0-422e-b79d-47e9b37c9c1a`,
];

/** 하단 쇼케이스 / 모션 카드 */
export const naverStrip = [
  `${A}/519f8d86-ca74-47ab-b20e-6c805b466f01`,
  `${A}/eb5663f3-b4ee-4c6d-b0a7-071b79ed2470`,
  `${A}/cb9ef01e-d22a-4693-8f81-5993155b4e54`,
  `${A}/f419b28f-b57b-4498-8d81-d7cc963a1391`,
  `${A}/5e440165-8a4a-41eb-a4c5-120817d65ced`,
  `${A}/ed83674c-cab7-40fc-aba0-2cd53824ae34`,
];

/** 우측 대형 비주얼 + 그리드 썸네일(만파) */
export const manpaHero = `${A}/5c3b6248-9d71-4230-9d30-31553eee0d34`;

export const manpaThumbs = [
  `${A}/5c3b6248-9d71-4230-9d30-31553eee0d34`,
  `${A}/32fc3e2a-6ac9-45a7-abf2-f624c0aa80ad`,
  `${A}/11d550e3-7693-4704-913e-b34cd5d25034`,
  `${A}/0e82fd00-bbac-4b8a-9b48-c37ebfddd6ef`,
  `${A}/6f39248c-50ea-42fc-ad7e-2853633ab35a`,
  `${A}/45242cd8-8dee-42b8-8aa3-7a420f506d62`,
  `${A}/324c637c-b183-4e57-b080-07e48bcd8768`,
  `${A}/9d8a9944-c7d2-4f43-a79f-e64580eed52d`,
  `${A}/c0ccd194-7a1f-4037-a944-401949fe3f53`,
  `${A}/59029666-436a-4701-9998-e6ca493f18a5`,
  `${A}/fc28c764-ec80-4b49-8fb0-ed38d74e6396`,
  `${A}/8e2111c0-71f1-4d40-b4cb-c85bb7ffc16d`,
  `${A}/614f5462-4371-4703-a049-be58984c8060`,
  `${A}/1f8f715a-3a0b-4398-9fdd-1d5d5f613957`,
];
