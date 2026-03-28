import { useCallback, useEffect, useRef } from 'react';

/**
 * WebGL2 우선, 없으면 WebGL1. 리사이즈 시 버퍼 크기 동기화.
 */
export default function WebGLCanvas({ className, style }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl2', { alpha: false, antialias: true }) ||
      canvas.getContext('webgl', { alpha: false, antialias: true });

    if (!gl) {
      console.error('WebGL을 사용할 수 없습니다.');
      return;
    }

    glRef.current = gl;

    const draw = () => {
      resize();
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    draw();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(draw) : null;
    if (ro) ro.observe(canvas);

    window.addEventListener('resize', draw);

    return () => {
      window.removeEventListener('resize', draw);
      if (ro) ro.disconnect();
      glRef.current = null;
    };
  }, [resize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        ...style,
      }}
    />
  );
}
