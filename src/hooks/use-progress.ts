import { useState, useCallback } from 'react';

export function useProgress() {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');

  const startProgress = useCallback((message: string = 'Processing...') => {
    setIsProcessing(true);
    setProgress(0);
    setStatus(message);
  }, []);

  const updateProgress = useCallback((value: number, message?: string) => {
    setProgress(Math.min(100, Math.max(0, value)));
    if (message) setStatus(message);
  }, []);

  const completeProgress = useCallback((message: string = 'Complete!') => {
    setProgress(100);
    setStatus(message);
    setTimeout(() => {
      setIsProcessing(false);
      setProgress(0);
      setStatus('');
    }, 1000);
  }, []);

  const resetProgress = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setStatus('');
  }, []);

  return {
    progress,
    isProcessing,
    status,
    startProgress,
    updateProgress,
    completeProgress,
    resetProgress,
  };
}
