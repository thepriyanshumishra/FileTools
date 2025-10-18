import { useEffect, useRef } from 'react';
import { getImageWorker, terminateImageWorker, processInWorker } from '@/lib/utils/worker-manager';

export function useImageWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = getImageWorker();
    return () => {
      terminateImageWorker();
    };
  }, []);

  const compressImage = async (file: Blob, quality: number = 0.8): Promise<Blob> => {
    if (!workerRef.current) throw new Error('Worker not initialized');
    return processInWorker<Blob>(workerRef.current, 'compress', { file, quality });
  };

  const resizeImage = async (file: Blob, width: number, height: number): Promise<Blob> => {
    if (!workerRef.current) throw new Error('Worker not initialized');
    return processInWorker<Blob>(workerRef.current, 'resize', { file, width, height });
  };

  return { compressImage, resizeImage };
}
