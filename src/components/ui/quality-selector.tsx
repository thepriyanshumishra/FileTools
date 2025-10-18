"use client";

import { QUALITY_PRESETS, applyPreset } from '@/lib/utils/quality-presets';

interface QualitySelectorProps {
  category: 'image' | 'video' | 'pdf';
  onSelect: (settings: Record<string, any>) => void;
  currentSettings: Record<string, any>;
}

export function QualitySelector({ category, onSelect, currentSettings }: QualitySelectorProps) {
  const presets = QUALITY_PRESETS[category] || [];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quality Preset</label>
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelect(applyPreset(preset, currentSettings))}
            className="p-3 text-left rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
          >
            <div className="font-semibold text-sm">{preset.name}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
