export interface BatchRule {
  id: string;
  name: string;
  condition: (file: File) => boolean;
  action: {
    type: 'rename' | 'convert' | 'compress' | 'resize';
    params: Record<string, any>;
  };
}

export function createBatchRule(
  name: string,
  condition: (file: File) => boolean,
  action: BatchRule['action']
): BatchRule {
  return {
    id: Date.now().toString(),
    name,
    condition,
    action,
  };
}

export function applyBatchRules(files: File[], rules: BatchRule[]): Map<File, BatchRule[]> {
  const fileRules = new Map<File, BatchRule[]>();

  files.forEach(file => {
    const applicableRules = rules.filter(rule => rule.condition(file));
    if (applicableRules.length > 0) {
      fileRules.set(file, applicableRules);
    }
  });

  return fileRules;
}

// Predefined rule conditions
export const CONDITIONS = {
  largeFile: (size: number) => (file: File) => file.size > size,
  fileType: (type: string) => (file: File) => file.type.includes(type),
  fileExtension: (ext: string) => (file: File) => file.name.endsWith(ext),
  fileName: (pattern: RegExp) => (file: File) => pattern.test(file.name),
};

// Predefined actions
export const ACTIONS = {
  compress: (quality: number) => ({ type: 'compress' as const, params: { quality } }),
  resize: (width: number, height: number) => ({ type: 'resize' as const, params: { width, height } }),
  convert: (format: string) => ({ type: 'convert' as const, params: { format } }),
  rename: (pattern: string) => ({ type: 'rename' as const, params: { pattern } }),
};
