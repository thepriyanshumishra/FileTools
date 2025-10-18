import { useState, useCallback } from 'react';

export interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}

export function useBatchProcessing() {
  const [files, setFiles] = useState<BatchFile[]>([]);

  const addFiles = useCallback((newFiles: File[]) => {
    const batchFiles: BatchFile[] = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending' as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...batchFiles]);
    return batchFiles;
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<BatchFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const clearCompleted = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== 'completed'));
  }, []);

  return {
    files,
    addFiles,
    updateFile,
    removeFile,
    clearAll,
    clearCompleted,
  };
}
