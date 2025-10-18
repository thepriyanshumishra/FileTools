"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilePreviewProps {
  file: File;
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.onerror = () => setError('Failed to load preview');
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setPreview('pdf');
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass max-w-4xl w-full max-h-[90vh] overflow-auto rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{file.name}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : preview === 'pdf' ? (
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
              <p className="text-zinc-600 dark:text-zinc-400">PDF Preview</p>
            </div>
          ) : file.type.startsWith('image/') && preview ? (
            <img src={preview} alt={file.name} className="max-w-full max-h-[500px] object-contain rounded-lg" />
          ) : file.type.startsWith('video/') && preview ? (
            <video src={preview} controls className="max-w-full max-h-[500px] rounded-lg" />
          ) : file.type.startsWith('audio/') && preview ? (
            <audio src={preview} controls className="w-full" />
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">Preview not available</p>
          )}
        </div>
      </div>
    </div>
  );
}
