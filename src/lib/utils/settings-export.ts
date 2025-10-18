export interface ExportedSettings {
  version: string;
  timestamp: Date;
  settings: Record<string, any>;
  profiles?: any[];
}

export function exportSettings(settings: Record<string, any>, profiles?: any[]): string {
  const exported: ExportedSettings = {
    version: '1.0',
    timestamp: new Date(),
    settings,
    profiles,
  };
  return JSON.stringify(exported, null, 2);
}

export function importSettings(json: string): ExportedSettings {
  const parsed = JSON.parse(json);
  if (!parsed.version || !parsed.settings) {
    throw new Error('Invalid settings file');
  }
  return parsed;
}

export function downloadSettings(settings: Record<string, any>, profiles?: any[]): void {
  const json = exportSettings(settings, profiles);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `filetools-settings-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
