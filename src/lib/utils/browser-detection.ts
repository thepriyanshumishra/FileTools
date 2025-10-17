export function isBrowserSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for required features
  const hasWebAssembly = typeof WebAssembly !== 'undefined';
  const hasCanvas = !!document.createElement('canvas').getContext;
  const hasFileReader = typeof FileReader !== 'undefined';
  const hasBlob = typeof Blob !== 'undefined';
  
  return hasWebAssembly && hasCanvas && hasFileReader && hasBlob;
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getDeviceMemory(): number {
  if (typeof window === 'undefined') return 4;
  // @ts-expect-error - navigator.deviceMemory is experimental
  return navigator.deviceMemory || 4;
}

export function canHandleLargeFiles(): boolean {
  const memory = getDeviceMemory();
  const mobile = isMobile();
  
  // Mobile or low memory devices
  if (mobile || memory < 4) return false;
  return true;
}

export function getRecommendedMaxFileSize(): number {
  const memory = getDeviceMemory();
  const mobile = isMobile();
  
  if (mobile) return 50 * 1024 * 1024; // 50MB
  if (memory < 4) return 100 * 1024 * 1024; // 100MB
  if (memory < 8) return 200 * 1024 * 1024; // 200MB
  return 500 * 1024 * 1024; // 500MB
}

export function shouldDisableFFmpeg(): boolean {
  const mobile = isMobile();
  const memory = getDeviceMemory();
  
  // Disable FFmpeg on low-end devices
  return mobile && memory < 4;
}

export function getBrowserWarning(): string | null {
  if (!isBrowserSupported()) {
    return 'Your browser is not supported. Please use a modern browser like Chrome, Firefox, or Edge.';
  }
  
  if (isMobile()) {
    return 'Mobile devices may experience slower processing. For best results, use a desktop browser.';
  }
  
  if (getDeviceMemory() < 4) {
    return 'Your device has limited memory. Large files may cause issues.';
  }
  
  return null;
}
