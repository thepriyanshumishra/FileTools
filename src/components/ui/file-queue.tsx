"use client";

import { useState } from 'react';
import { XMarkIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface QueueFile {
  id: string;
  file: File;
  preview?: string;
}

interface FileQueueProps {
  files: QueueFile[];
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onClear: () => void;
}

export function FileQueue({ files, onRemove, onReorder, onClear }: FileQueueProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (files.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">File Queue ({files.length})</h3>
        <button
          onClick={onClear}
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {files.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedIndex !== null && draggedIndex !== index) {
                onReorder(draggedIndex, index);
              }
              setDraggedIndex(null);
            }}
            className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-move"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.file.name}</p>
              <p className="text-xs text-zinc-500">
                {(item.file.size / 1024).toFixed(1)} KB
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => index > 0 && onReorder(index, index - 1)}
                disabled={index === 0}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded disabled:opacity-30"
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => index < files.length - 1 && onReorder(index, index + 1)}
                disabled={index === files.length - 1}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded disabled:opacity-30"
              >
                <ArrowDownIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
