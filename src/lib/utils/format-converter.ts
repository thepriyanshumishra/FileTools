export const FORMAT_MAPPINGS: Record<string, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg'],
  video: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv'],
  audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'],
  document: ['pdf', 'docx', 'txt', 'rtf', 'odt'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
};

export function getAvailableFormats(fileType: string): string[] {
  for (const [category, formats] of Object.entries(FORMAT_MAPPINGS)) {
    if (fileType.includes(category)) {
      return formats;
    }
  }
  return [];
}

export function canConvert(fromFormat: string, toFormat: string): boolean {
  for (const formats of Object.values(FORMAT_MAPPINGS)) {
    if (formats.includes(fromFormat) && formats.includes(toFormat)) {
      return true;
    }
  }
  return false;
}

export function getFormatCategory(format: string): string | null {
  for (const [category, formats] of Object.entries(FORMAT_MAPPINGS)) {
    if (formats.includes(format.toLowerCase())) {
      return category;
    }
  }
  return null;
}

export function suggestFormat(file: File, purpose: 'web' | 'print' | 'archive'): string {
  const category = getFormatCategory(file.name.split('.').pop() || '');
  
  const suggestions: Record<string, Record<string, string>> = {
    image: { web: 'webp', print: 'png', archive: 'png' },
    video: { web: 'mp4', print: 'mp4', archive: 'mkv' },
    audio: { web: 'mp3', print: 'wav', archive: 'flac' },
    document: { web: 'pdf', print: 'pdf', archive: 'pdf' },
  };

  return suggestions[category || 'image']?.[purpose] || 'png';
}
