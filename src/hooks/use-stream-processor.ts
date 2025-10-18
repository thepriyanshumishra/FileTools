import { useState, useCallback } from 'react';
import { processFileInChunks } from '@/lib/utils/stream-processor';

export function useStreamProcessor() {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File, chunkSize?: number): Promise<ArrayBuffer> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await processFileInChunks(file, chunkSize, (p) => {
        setProgress(Math.round(p));
      });
      return result;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  return { processFile, progress, isProcessing };
}
