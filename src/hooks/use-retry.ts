import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  onRetry?: (attempt: number) => void;
}

export function useRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
) {
  const { maxAttempts = 3, delay = 1000, onRetry } = options;
  
  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    setIsRetrying(true);
    setError(null);

    for (let i = 0; i < maxAttempts; i++) {
      try {
        setAttempt(i + 1);
        if (i > 0) {
          onRetry?.(i + 1);
          await new Promise(resolve => setTimeout(resolve, delay * i));
        }
        const result = await fn();
        setIsRetrying(false);
        setAttempt(0);
        return result;
      } catch (err) {
        if (i === maxAttempts - 1) {
          setError(err as Error);
          setIsRetrying(false);
          throw err;
        }
      }
    }
    
    setIsRetrying(false);
    return null;
  }, [fn, maxAttempts, delay, onRetry]);

  const reset = useCallback(() => {
    setAttempt(0);
    setIsRetrying(false);
    setError(null);
  }, []);

  return {
    execute,
    reset,
    attempt,
    isRetrying,
    error,
    canRetry: attempt < maxAttempts && !isRetrying,
  };
}
