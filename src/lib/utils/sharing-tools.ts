export interface ShareableLink {
  id: string;
  url: string;
  expiresAt: Date;
  fileName: string;
}

export function generateShareableLink(fileName: string, expiresInHours: number = 24): ShareableLink {
  const id = Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  
  return {
    id,
    url: `${window.location.origin}/share/${id}`,
    expiresAt,
    fileName,
  };
}

export async function generateQRCode(text: string, size: number = 256): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  canvas.width = size;
  canvas.height = size;

  // Simple QR code placeholder (in production, use a QR library)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  ctx.fillStyle = '#000000';
  ctx.font = '12px monospace';
  ctx.fillText('QR Code', 10, size / 2);
  ctx.fillText(text.substring(0, 20), 10, size / 2 + 20);

  return canvas.toDataURL('image/png');
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export async function shareViaWebShare(data: {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }

  await navigator.share(data);
}

export function downloadFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function createDownloadLink(blob: Blob, fileName: string): string {
  return URL.createObjectURL(blob);
}
