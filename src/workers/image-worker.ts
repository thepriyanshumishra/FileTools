/// <reference lib="webworker" />

self.onmessage = async (e: MessageEvent) => {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'compress':
        const compressed = await compressImage(data.file, data.quality);
        self.postMessage({ success: true, result: compressed });
        break;
      case 'resize':
        const resized = await resizeImage(data.file, data.width, data.height);
        self.postMessage({ success: true, result: resized });
        break;
      default:
        throw new Error('Unknown operation');
    }
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};

async function compressImage(file: Blob, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas context not available');
  
  ctx.drawImage(bitmap, 0, 0);
  return await canvas.convertToBlob({ type: 'image/jpeg', quality });
}

async function resizeImage(file: Blob, width: number, height: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas context not available');
  
  ctx.drawImage(bitmap, 0, 0, width, height);
  return await canvas.convertToBlob({ type: 'image/png' });
}

export {};
