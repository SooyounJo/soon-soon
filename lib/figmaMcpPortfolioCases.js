/**
 * Figma MCP get_design_context — Multi / Lab 세부 보드 (에셋 URL은 기간 후 갱신 가능)
 */
const B = 'https://www.figma.com/api/mcp/asset';

const u = (id) => `${B}/${id}`;

/* —— Multi · Platform-L (834:937) —— */
export const PLATFORM_L_FIGMA_DEV_URL =
  'https://www.figma.com/design/aIkou5NslP8rSqqOiAl7gf/%EC%A1%B0%EC%88%98%EC%97%B0-%EA%B3%B5%EA%B0%84?node-id=834-937&m=dev';

export const platformLHero = u('02bdd359-a353-4d66-a66b-6dc61f39af12');
export const platformLFocus = u('7b212847-97cb-4012-a868-0aef90fe40f9');
export const platformLColumn = [
  u('5ec4c04a-9ed3-408f-a8f2-8f10b3b4cf76'),
  u('e1b22248-c1f1-488f-95df-aa74236e251e'),
  u('b85916bb-aa12-41a3-a58d-4cf8cd917121'),
  u('f483562d-4191-491b-9c15-0b68fe479273'),
  u('9c4dff48-4417-462d-a151-5a91ddaf9aae'),
];
export const platformLWide = [u('ed59f60a-276e-4460-8b2e-34b247def21b'), u('4af23842-56b0-437a-9a6a-26a93f373f1c')];

/* —— Multi · LG Home AI (834:776) —— */
export const LG_HOME_AI_FIGMA_DEV_URL =
  'https://www.figma.com/design/aIkou5NslP8rSqqOiAl7gf/%EC%A1%B0%EC%88%98%EC%97%B0-%EA%B3%B5%EA%B0%84?node-id=834-776&m=dev';

export const lgHomeHero = u('636b0bfa-d573-46f9-8268-3a6114390711');
export const lgHomeWide = u('934d0765-a416-4057-b459-99cb14a09fab');
export const lgHomePhones = [
  u('e0545711-379e-40fb-89f8-3c483081a594'),
  u('6801b65f-e4da-4efe-8f4a-33aa0c3b155d'),
  u('539fb834-50d6-408d-9992-7e210cc8d0df'),
  u('f16e9ab6-4597-4eb0-bf50-c347d2b50000'),
  u('1f91192e-358a-403b-9d5e-2c5c07b18a3f'),
  u('ce61de2d-6adb-487e-b237-2bf8abae30c2'),
  u('cc1d839c-d4e3-45ea-b0c6-1508ac95f28a'),
];
export const lgHomeStrip = [
  u('1121db3d-b321-4ff6-8b9b-5aed776e3f2f'),
  u('63311b46-757c-4754-b380-e97ad805e2b8'),
  u('f302413c-1292-496c-96dd-c40fc3d7b931'),
  u('eb8ef7d1-fc87-493f-9a16-71b59da57b26'),
];
export const lgHomeExtra = u('963fdba8-43c3-4e4d-9091-5f23d9be5bfd');

/* —— Lab · Memorytone (834:860) —— */
export const MEMORYTONE_FIGMA_DEV_URL =
  'https://www.figma.com/design/aIkou5NslP8rSqqOiAl7gf/%EC%A1%B0%EC%88%98%EC%97%B0-%EA%B3%B5%EA%B0%84?node-id=834-860&m=dev';

export const memorytoneHero = u('707ebc44-c41b-4070-9fdb-6899f447a03d');
export const memorytoneGallery = [
  u('b78b346c-6d86-46d0-bf6e-38d88c205ba7'),
  u('8744dfa1-0fb3-4f43-9671-ea7fb82cf330'),
  u('e443619f-3937-429d-8177-85fea1f24e4f'),
  u('46fa0393-8d26-4121-bd31-0f92635aa0bb'),
  u('5bd30572-88b4-4f5f-b6c9-7b38b09d0c85'),
];

/* —— Lab · Flowrium (834:827) —— */
export const FLOWRIUM_CASE_FIGMA_DEV_URL =
  'https://www.figma.com/design/aIkou5NslP8rSqqOiAl7gf/%EC%A1%B0%EC%88%98%EC%97%B0-%EA%B3%B5%EA%B0%84?node-id=834-827&m=dev';

export const flowriumCaseHero = u('e4d7fd88-89d2-48a8-b2ba-0d8e555079bf');
export const flowriumCaseStrip = [
  u('2c9da360-7e22-4691-8221-652ae5c222bc'),
  u('15de2a11-ee4a-49ff-a868-453bb240a7c9'),
  u('ec2c3d55-7209-4d57-8949-60c92ac44c6e'),
  u('417c957e-9bc9-45c4-ad08-f022d6f61702'),
  u('c61b5496-5003-4024-bb58-6aafea4b51b2'),
];

/* —— Lab · New Persona (834:975) —— */
export const NEW_PERSONA_FIGMA_DEV_URL =
  'https://www.figma.com/design/aIkou5NslP8rSqqOiAl7gf/%EC%A1%B0%EC%88%98%EC%97%B0-%EA%B3%B5%EA%B0%84?node-id=834-975&m=dev';

export const newPersonaHero = u('2ca16260-b1eb-4011-be9d-3f41e8745039');
export const newPersonaStrip = [
  u('48e1ab65-8ec8-4178-8ff6-d366a97cd4cb'),
  u('2e6e4354-f5b0-4aa5-8123-f75dfdff7809'),
  u('1e2ec24b-869e-492a-bf3f-d10477328a12'),
  u('e36f61e3-186f-48b4-912b-cb22c6e747f2'),
  u('11b28423-7f24-4cc6-b21c-7dfa442faa29'),
];
