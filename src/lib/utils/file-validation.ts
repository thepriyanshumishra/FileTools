export const FILE_SIZE_LIMITS = {
  image: 50 * 1024 * 1024, // 50MB
  pdf: 100 * 1024 * 1024, // 100MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 100 * 1024 * 1024, // 100MB
  document: 50 * 1024 * 1024, // 50MB
  default: 100 * 1024 * 1024, // 100MB
};

export function getFileSizeLimit(fileType: string): number {
  if (fileType.startsWith('image/')) return FILE_SIZE_LIMITS.image;
  if (fileType === 'application/pdf') return FILE_SIZE_LIMITS.pdf;
  if (fileType.startsWith('video/')) return FILE_SIZE_LIMITS.video;
  if (fileType.startsWith('audio/')) return FILE_SIZE_LIMITS.audio;
  return FILE_SIZE_LIMITS.default;
}

export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const limit = getFileSizeLimit(file.type);
  if (file.size > limit) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(limit)} limit`,
    };
  }
  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function validateFileType(file: File, allowedExtensions: string[]): { valid: boolean; error?: string } {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File type .${extension} is not supported. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }
  return { valid: true };
}

export function validateMultipleFiles(files: File[], maxFiles: number = 10): { valid: boolean; error?: string } {
  if (files.length > maxFiles) {
    return {
      valid: false,
      error: `Maximum ${maxFiles} files allowed`,
    };
  }
  return { valid: true };
}
