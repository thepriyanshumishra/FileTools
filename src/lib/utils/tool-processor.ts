import * as imageTools from './image-tools';
import * as pdfTools from './pdf-tools';
import * as videoTools from './video-tools';
import * as audioTools from './audio-tools';
import * as documentTools from './document-tools';
import * as archiveTools from './archive-tools';
import { validateFileSize, validateMultipleFiles } from './file-validation';

export interface ToolOptions {
  toolName: string;
  files: File[];
  params?: Record<string, unknown>;
  onProgress?: (progress: number) => void;
}

export async function processTool(options: ToolOptions): Promise<Blob | Blob[]> {
  const { toolName, files, params = {} } = options;
  
  // Validate files
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }
  
  // Validate file sizes
  for (const file of files) {
    const validation = validateFileSize(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }
  }
  
  // Validate multiple files for merge operations
  const multipleFilesTools = ['Merge PDFs', 'Merge Audio', 'Merge Videos', 'Create ZIP'];
  if (multipleFilesTools.includes(toolName)) {
    const validation = validateMultipleFiles(files, 20);
    if (!validation.valid) {
      throw new Error(validation.error || 'Too many files');
    }
  }
  
  const file = files[0];

  // Image Tools
  if (toolName === 'Compress') {
    return await imageTools.compressImage(file, (params.quality as number) || 0.8);
  }
  if (toolName === 'Resize') {
    return await imageTools.resizeImage(file, (params.width as number) || 800, (params.height as number) || 600);
  }
  if (toolName === 'Convert Format' && file.type.startsWith('image/')) {
    return await imageTools.convertImageFormat(file, (params.format as string) || 'png');
  }
  if (toolName === 'Rotate') {
    return await imageTools.rotateImage(file, (params.degrees as number) || 90);
  }
  if (toolName === 'Crop') {
    return await imageTools.cropImage(file, (params.x as number) || 0, (params.y as number) || 0, (params.width as number) || 500, (params.height as number) || 500);
  }
  if (toolName === 'Rotate & Flip') {
    return await imageTools.flipImage(file, (params.horizontal as boolean) ?? true);
  }
  if (toolName === 'Adjust Brightness') {
    return await imageTools.adjustBrightness(file, (params.brightness as number) || 20);
  }
  if (toolName === 'Add Watermark' && file.type.startsWith('image/')) {
    return await imageTools.addWatermark(file, (params.text as string) || 'Watermark');
  }
  if (toolName === 'Apply Filters') {
    return await imageTools.applyFilter(file, (params.filter as string) || 'grayscale(100%)');
  }
  if (toolName === 'Blur Image') {
    return await imageTools.blurImage(file, (params.amount as number) || 5);
  }
  if (toolName === 'Sharpen Image') {
    return await imageTools.sharpenImage(file);
  }

  // PDF Tools
  if (toolName === 'Merge PDFs') {
    return await pdfTools.mergePDFs(files);
  }
  if (toolName === 'Split PDF') {
    return await pdfTools.splitPDF(file, (params.ranges as number[][]) || [[0, 1]]);
  }
  if (toolName === 'Rotate Pages') {
    return await pdfTools.rotatePDFPages(file, (params.rotation as number) || 90);
  }
  if (toolName === 'Remove Pages') {
    return await pdfTools.removePDFPages(file, (params.pageIndices as number[]) || [0]);
  }
  if (toolName === 'Extract Pages') {
    return await pdfTools.extractPDFPages(file, (params.pageIndices as number[]) || [0]);
  }
  if (toolName === 'Compress PDF') {
    return await pdfTools.compressPDF(file);
  }
  if (toolName === 'Organize Pages') {
    return await pdfTools.organizePDFPages(file, (params.pageOrder as number[]) || [0, 1, 2]);
  }

  // Video Tools
  if (toolName === 'Compress Video') {
    return await videoTools.compressVideo(file);
  }
  if (toolName === 'Trim Video') {
    return await videoTools.trimVideo(file, (params.startTime as number) || 0, (params.duration as number) || 10);
  }
  if (toolName === 'Extract Audio') {
    return await videoTools.extractAudioFromVideo(file);
  }
  if (toolName === 'Video to GIF') {
    return await videoTools.videoToGIF(file);
  }
  if (toolName === 'Rotate Video') {
    return await videoTools.rotateVideo(file, (params.degrees as number) || 90);
  }
  if (toolName === 'Merge Videos') {
    return await videoTools.mergeVideos(files);
  }
  if (toolName === 'Remove Audio') {
    return await videoTools.removeAudio(file);
  }
  if (toolName === 'Crop Video') {
    return await videoTools.cropVideo(file, (params.width as number) || 640, (params.height as number) || 480, (params.x as number) || 0, (params.y as number) || 0);
  }
  if (toolName === 'Change Speed' && file.type.startsWith('video/')) {
    return await videoTools.changeVideoSpeed(file, (params.speed as number) || 1.5);
  }
  if (toolName === 'Reverse Video') {
    return await videoTools.reverseVideo(file);
  }

  // Audio Tools
  if (toolName === 'Compress Audio') {
    return await audioTools.compressAudio(file);
  }
  if (toolName === 'Trim Audio') {
    return await audioTools.trimAudio(file, (params.startTime as number) || 0, (params.duration as number) || 10);
  }
  if (toolName === 'Merge Audio') {
    return await audioTools.mergeAudio(files);
  }
  if (toolName === 'Change Volume') {
    return await audioTools.changeAudioVolume(file, (params.volume as number) || 1.5);
  }
  if (toolName === 'Change Speed') {
    return await audioTools.changeAudioSpeed(file, (params.speed as number) || 1.5);
  }
  if (toolName === 'Add Fade') {
    return await audioTools.addFadeEffect(file, (params.fadeIn as number) || 2, (params.fadeOut as number) || 2);
  }
  if (toolName === 'Convert Format' && file.type.startsWith('audio/')) {
    return await audioTools.convertAudioFormat(file, (params.format as string) || 'mp3');
  }
  if (toolName === 'Reverse Audio') {
    return await audioTools.reverseAudio(file);
  }
  if (toolName === 'Extract Audio from Video') {
    return await videoTools.extractAudioFromVideo(file);
  }

  // Document Tools
  if (toolName === 'Format JSON') {
    return await documentTools.formatJSON(file);
  }
  if (toolName === 'Minify JSON') {
    return await documentTools.minifyJSON(file);
  }
  if (toolName === 'Validate JSON') {
    const result = await documentTools.validateJSON(file);
    if (!result.valid) throw new Error(result.error);
    return new Blob(['Valid JSON'], { type: 'text/plain' });
  }
  if (toolName === 'Convert to CSV' && file.type === 'application/json') {
    return await documentTools.jsonToCSV(file);
  }
  if (toolName === 'Convert to JSON' && file.name.endsWith('.csv')) {
    return await documentTools.csvToJSON(file);
  }
  if (toolName === 'Format XML') {
    return await documentTools.formatXML(file);
  }
  if (toolName === 'Validate XML') {
    const result = await documentTools.validateXML(file);
    if (!result.valid) throw new Error(result.error);
    return new Blob(['Valid XML'], { type: 'text/plain' });
  }
  if (toolName === 'Format Code' && file.name.endsWith('.css')) {
    return await documentTools.formatCSS(file);
  }
  if (toolName === 'Minify' && file.name.endsWith('.css')) {
    return await documentTools.minifyCSS(file);
  }
  if (toolName === 'Format Code' && file.name.endsWith('.html')) {
    return await documentTools.formatHTML(file);
  }
  if (toolName === 'Minify' && file.name.endsWith('.html')) {
    return await documentTools.minifyHTML(file);
  }
  if (toolName === 'Format Code' && file.name.endsWith('.js')) {
    return await documentTools.formatJS(file);
  }
  if (toolName === 'Minify' && file.name.endsWith('.js')) {
    return await documentTools.minifyJS(file);
  }

  // Archive Tools
  if (toolName === 'Create ZIP') {
    return await archiveTools.createZIP(files);
  }
  if (toolName === 'Extract') {
    const extractedFiles = await archiveTools.extractZIP(file);
    // Return first file or create a zip of all
    if (extractedFiles.length === 1) return extractedFiles[0];
    return await archiveTools.createZIP(extractedFiles);
  }
  if (toolName === 'View Contents') {
    const contents = await archiveTools.viewZIPContents(file);
    return new Blob([contents.join('\n')], { type: 'text/plain' });
  }

  throw new Error(`Tool "${toolName}" is not implemented yet`);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
