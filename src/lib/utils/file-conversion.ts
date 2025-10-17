import { FileWithPreview } from "@/lib/store/conversion";
import { validateFileSize, validateFileType, formatFileSize } from "./file-validation";
import { getRecommendedMaxFileSize } from "./browser-detection";

type ConversionOptions = {
  outputFormat: string;
  onProgress?: (progress: number) => void;
};

// Map of supported local conversions
const LOCAL_CONVERSIONS = new Set([
  "jpg-to-png",
  "png-to-jpg",
  "jpg-to-webp",
  "png-to-webp",
]);

// Maximum file size for local processing (10MB)
const MAX_LOCAL_SIZE = 10 * 1024 * 1024;

export function canProcessLocally(file: File, outputFormat: string): boolean {
  const conversion = `${getFileExtension(file)}-to-${outputFormat}`;
  return file.size <= MAX_LOCAL_SIZE && LOCAL_CONVERSIONS.has(conversion);
}

export function getFileExtension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() || "";
}

export async function convertFile(
  file: FileWithPreview,
  options: ConversionOptions
): Promise<Blob> {
  const { outputFormat, onProgress } = options;

  // Simulate conversion delay - replace with actual conversion logic
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i <= 100; i += 10) {
    onProgress?.(i);
    await delay(200);
  }

  // For demo purposes, just return the original file
  // In a real app, implement actual conversion logic here
  return file;

  // Example implementation for image conversion:
  // if (canProcessLocally(file, outputFormat)) {
  //   return await convertImageLocally(file, outputFormat)
  // } else {
  //   return await convertViaAPI(file, outputFormat)
  // }
}

// Example local image conversion using browser APIs
async function convertImageLocally(
  file: File,
  outputFormat: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert image"));
          }
        },
        `image/${outputFormat}`,
        0.8
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

// Example API conversion
async function convertViaAPI(file: File, outputFormat: string): Promise<Blob> {
  // Implement API call to backend service
  // For now, just return the original file
  return file;
}

export function getSupportedOutputFormats(file: File): string[] {
  const extension = getFileExtension(file);

  // Define supported conversions for each file type
  const conversionMap: Record<string, string[]> = {
    pdf: ["docx", "jpg", "png"],
    jpg: ["png", "webp", "pdf"],
    png: ["jpg", "webp", "pdf"],
    docx: ["pdf"],
    mp3: ["wav", "ogg"],
    mp4: ["gif", "webm"],
  };

  return conversionMap[extension] || [];
}

export function validateFile(file: File, allowedExtensions?: string[]): string | null {
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation.error || "File size exceeds limit";
  }

  // Check device-specific limits
  const maxSize = getRecommendedMaxFileSize();
  if (file.size > maxSize) {
    return `File too large for your device. Maximum recommended: ${formatFileSize(maxSize)}`;
  }

  if (allowedExtensions) {
    const typeValidation = validateFileType(file, allowedExtensions);
    if (!typeValidation.valid) {
      return typeValidation.error || "Invalid file type";
    }
  }

  return null;
}
