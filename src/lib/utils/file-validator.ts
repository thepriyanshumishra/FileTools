export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export interface ValidationRules {
  maxSize?: number;
  minSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export function validateFile(file: File, rules: ValidationRules): ValidationResult {
  const warnings: string[] = [];

  // Check file size
  if (rules.maxSize && file.size > rules.maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(rules.maxSize / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  if (rules.minSize && file.size < rules.minSize) {
    return {
      valid: false,
      error: `File size is too small. Minimum size is ${(rules.minSize / 1024).toFixed(2)}KB`,
    };
  }

  // Check file type
  if (rules.allowedTypes && rules.allowedTypes.length > 0) {
    const isTypeAllowed = rules.allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      return {
        valid: false,
        error: `File type "${file.type}" is not supported. Allowed types: ${rules.allowedTypes.join(', ')}`,
      };
    }
  }

  // Check file extension
  if (rules.allowedExtensions && rules.allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !rules.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension ".${extension}" is not supported. Allowed extensions: ${rules.allowedExtensions.join(', ')}`,
      };
    }
  }

  // Warnings for large files
  if (file.size > 100 * 1024 * 1024) {
    warnings.push('Large file detected. Processing may take longer.');
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function validateFiles(files: File[], rules: ValidationRules): ValidationResult[] {
  return files.map(file => validateFile(file, rules));
}
