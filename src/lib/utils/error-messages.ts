export interface ErrorSolution {
  message: string;
  solutions: string[];
  code?: string;
}

export const ERROR_MESSAGES: Record<string, ErrorSolution> = {
  FILE_TOO_LARGE: {
    message: 'File size exceeds the limit',
    solutions: [
      'Try compressing the file first',
      'Split the file into smaller parts',
      'Use a desktop application for large files',
    ],
    code: 'FILE_TOO_LARGE',
  },
  UNSUPPORTED_FORMAT: {
    message: 'File format is not supported',
    solutions: [
      'Check the supported formats list',
      'Convert the file to a supported format first',
      'Try a different tool',
    ],
    code: 'UNSUPPORTED_FORMAT',
  },
  PROCESSING_FAILED: {
    message: 'File processing failed',
    solutions: [
      'Check if the file is corrupted',
      'Try a different file',
      'Refresh the page and try again',
    ],
    code: 'PROCESSING_FAILED',
  },
  NETWORK_ERROR: {
    message: 'Network connection lost',
    solutions: [
      'Check your internet connection',
      'Try again in a few moments',
      'Files are processed locally, so this might be a temporary issue',
    ],
    code: 'NETWORK_ERROR',
  },
  BROWSER_NOT_SUPPORTED: {
    message: 'Your browser doesn\'t support this feature',
    solutions: [
      'Update your browser to the latest version',
      'Try using Chrome, Firefox, or Edge',
      'Enable JavaScript if disabled',
    ],
    code: 'BROWSER_NOT_SUPPORTED',
  },
  MEMORY_ERROR: {
    message: 'Not enough memory to process this file',
    solutions: [
      'Close other tabs and applications',
      'Try processing a smaller file',
      'Use a device with more RAM',
    ],
    code: 'MEMORY_ERROR',
  },
  INVALID_FILE: {
    message: 'File appears to be corrupted or invalid',
    solutions: [
      'Try opening the file in its native application',
      'Re-download or re-create the file',
      'Check if the file extension matches the actual format',
    ],
    code: 'INVALID_FILE',
  },
};

export function getErrorMessage(error: Error | string): ErrorSolution {
  const errorStr = typeof error === 'string' ? error : error.message;
  
  if (errorStr.includes('size') || errorStr.includes('large')) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }
  if (errorStr.includes('format') || errorStr.includes('type')) {
    return ERROR_MESSAGES.UNSUPPORTED_FORMAT;
  }
  if (errorStr.includes('network') || errorStr.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  if (errorStr.includes('memory') || errorStr.includes('heap')) {
    return ERROR_MESSAGES.MEMORY_ERROR;
  }
  if (errorStr.includes('browser') || errorStr.includes('support')) {
    return ERROR_MESSAGES.BROWSER_NOT_SUPPORTED;
  }
  if (errorStr.includes('corrupt') || errorStr.includes('invalid')) {
    return ERROR_MESSAGES.INVALID_FILE;
  }
  
  return ERROR_MESSAGES.PROCESSING_FAILED;
}
