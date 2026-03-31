let cachedWebGLAvailability = null;

/**
 * Conservative WebGL capability check used for optional effects (e.g. cursor overlay).
 * Keep this permissive to avoid false negatives on some Windows GPU/driver setups.
 */
export function isWebGLAvailable() {
  if (cachedWebGLAvailability !== null) return cachedWebGLAvailability;
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('experimental-webgl');
    cachedWebGLAvailability = Boolean(gl);
    return cachedWebGLAvailability;
  } catch {
    cachedWebGLAvailability = false;
    return false;
  }
}
