let imageWorker: Worker | null = null;

export function getImageWorker(): Worker {
  if (!imageWorker) {
    imageWorker = new Worker(new URL('../../workers/image-worker.ts', import.meta.url));
  }
  return imageWorker;
}

export function terminateImageWorker(): void {
  if (imageWorker) {
    imageWorker.terminate();
    imageWorker = null;
  }
}

export function processInWorker<T>(worker: Worker, type: string, data: any): Promise<T> {
  return new Promise((resolve, reject) => {
    const handler = (e: MessageEvent) => {
      worker.removeEventListener('message', handler);
      if (e.data.success) {
        resolve(e.data.result);
      } else {
        reject(new Error(e.data.error));
      }
    };
    
    worker.addEventListener('message', handler);
    worker.postMessage({ type, data });
  });
}
