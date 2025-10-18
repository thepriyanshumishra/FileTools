"use client";

import { getAvailableFormats, suggestFormat } from '@/lib/utils/format-converter';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface FormatSelectorProps {
  file: File;
  onSelect: (format: string) => void;
  selectedFormat?: string;
}

export function FormatSelector({ file, onSelect, selectedFormat }: FormatSelectorProps) {
  const formats = getAvailableFormats(file.type);
  const suggested = suggestFormat(file, 'web');

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Output Format</label>
      
      <div className="flex flex-wrap gap-2">
        {formats.map((format) => (
          <button
            key={format}
            onClick={() => onSelect(format)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              selectedFormat === format
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-purple-300'
            } ${format === suggested ? 'ring-2 ring-purple-200 dark:ring-purple-800' : ''}`}
          >
            <span className="uppercase text-sm font-semibold">{format}</span>
            {format === suggested && (
              <SparklesIcon className="inline w-4 h-4 ml-1 text-purple-500" />
            )}
          </button>
        ))}
      </div>
      
      {suggested && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          <SparklesIcon className="inline w-3 h-3" /> {suggested.toUpperCase()} is recommended for web use
        </p>
      )}
    </div>
  );
}
