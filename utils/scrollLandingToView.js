/**
 * 랜딩 1뷰(soon) → 2뷰(view) 구간으로 스크롤 (min-height 200vh 레이아웃 기준)
 */
export default function scrollLandingToView(options = {}) {
  if (typeof window === 'undefined') return;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  if (maxScroll < 2) return;
  const vh = window.innerHeight;
  const target = Math.min(maxScroll, Math.max(vh * 0.92, maxScroll * 0.48));
  const reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = options.behavior || (reduce ? 'auto' : 'smooth');
  window.scrollTo({ top: target, behavior });
}
