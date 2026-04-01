const CASE_WEBSITE_BY_NODE_ID = {
  // Mobile
  '834:631': 'https://coexblobtest.vercel.app/',
  '834:895': 'https://manpa-wheat.vercel.app/',

  // Multi
  '834:937': 'https://l-ver2.onrender.com/mobile',
  '834:776': 'https://lgaffectionateintelligence.onrender.com/mobile',

  // Lab
  '834:860': 'https://conmid.vercel.app/intro',
  '834:827': 'https://f-lo-r-lum.vercel.app/',
  '834:975': 'https://sagak.vercel.app/',
};

export function getCaseWebsiteUrlForNodeId(nodeId) {
  if (!nodeId) return null;
  return CASE_WEBSITE_BY_NODE_ID[nodeId] || null;
}

