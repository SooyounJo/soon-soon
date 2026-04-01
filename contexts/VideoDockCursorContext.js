import { useRouter } from 'next/router';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const VideoDockCursorContext = createContext(null);

const TBC_MS = 3000;

export function VideoDockCursorProvider({ children }) {
  const router = useRouter();
  const [videoTbcActive, setVideoTbcActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  useEffect(() => {
    const onRouteChangeStart = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setVideoTbcActive(false);
    };
    router.events.on('routeChangeStart', onRouteChangeStart);
    return () => router.events.off('routeChangeStart', onRouteChangeStart);
  }, [router]);

  const startVideoTbc = useCallback((onComplete) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVideoTbcActive(true);
    timerRef.current = setTimeout(() => {
      setVideoTbcActive(false);
      timerRef.current = null;
      if (typeof onComplete === 'function') onComplete();
    }, TBC_MS);
  }, []);

  const value = { videoTbcActive, startVideoTbc };
  return <VideoDockCursorContext.Provider value={value}>{children}</VideoDockCursorContext.Provider>;
}

export function useVideoDockCursor() {
  const ctx = useContext(VideoDockCursorContext);
  if (!ctx) {
    throw new Error('useVideoDockCursor must be used within VideoDockCursorProvider');
  }
  return ctx;
}

/** GlassCursorOverlay 등 Provider 밖/옵션용 */
export function useVideoTbcActive() {
  const ctx = useContext(VideoDockCursorContext);
  return ctx?.videoTbcActive ?? false;
}
