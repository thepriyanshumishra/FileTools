export interface QualityPreset {
  name: string;
  description: string;
  settings: {
    quality?: number;
    compression?: number;
    resolution?: { width: number; height: number };
    bitrate?: number;
    format?: string;
  };
}

export const QUALITY_PRESETS: Record<string, QualityPreset[]> = {
  image: [
    {
      name: 'Web',
      description: 'Optimized for web (fast loading)',
      settings: { quality: 0.8, resolution: { width: 1920, height: 1080 } },
    },
    {
      name: 'Print',
      description: 'High quality for printing',
      settings: { quality: 0.95, resolution: { width: 3840, height: 2160 } },
    },
    {
      name: 'Archive',
      description: 'Maximum quality for archival',
      settings: { quality: 1.0, resolution: { width: 7680, height: 4320 } },
    },
  ],
  video: [
    {
      name: 'Web',
      description: 'Optimized for web streaming',
      settings: { bitrate: 2000, resolution: { width: 1280, height: 720 } },
    },
    {
      name: 'HD',
      description: 'High definition quality',
      settings: { bitrate: 5000, resolution: { width: 1920, height: 1080 } },
    },
    {
      name: '4K',
      description: 'Ultra HD quality',
      settings: { bitrate: 15000, resolution: { width: 3840, height: 2160 } },
    },
  ],
  pdf: [
    {
      name: 'Screen',
      description: 'Optimized for screen viewing',
      settings: { quality: 0.7, compression: 5 },
    },
    {
      name: 'Print',
      description: 'High quality for printing',
      settings: { quality: 0.9, compression: 2 },
    },
    {
      name: 'Prepress',
      description: 'Professional printing',
      settings: { quality: 1.0, compression: 0 },
    },
  ],
};

export function getPreset(category: string, presetName: string): QualityPreset | undefined {
  return QUALITY_PRESETS[category]?.find(p => p.name === presetName);
}

export function applyPreset(preset: QualityPreset, currentSettings: Record<string, any>): Record<string, any> {
  return { ...currentSettings, ...preset.settings };
}
