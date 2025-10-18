import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = history[currentIndex];

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory((prev) => {
      const newValue = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev[currentIndex])
        : newState;
      
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newValue);
      
      if (newHistory.length > 50) newHistory.shift();
      
      return newHistory;
    });
    setCurrentIndex((prev) => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const reset = useCallback(() => {
    setHistory([initialState]);
    setCurrentIndex(0);
  }, [initialState]);

  return {
    state: current,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}
