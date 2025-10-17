import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
}

export async function convertVideoFormat(file: File, outputFormat: string): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.' + outputFormat;
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: `video/${outputFormat}` });
}

export async function compressVideo(file: File): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp4';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-crf', '28', '-preset', 'fast', outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'video/mp4' });
}

export async function trimVideo(file: File, startTime: number, duration: number): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp4';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-ss', startTime.toString(), '-t', duration.toString(), '-c', 'copy', outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'video/mp4' });
}

export async function extractAudioFromVideo(file: File): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp3';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-vn', '-acodec', 'libmp3lame', outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'audio/mp3' });
}

export async function videoToGIF(file: File): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.gif';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-vf', 'fps=10,scale=320:-1:flags=lanczos', outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'image/gif' });
}

export async function rotateVideo(file: File, degrees: number): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp4';
  
  const transpose = degrees === 90 ? '1' : degrees === 180 ? '2' : degrees === 270 ? '2' : '0';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-vf', `transpose=${transpose}`, outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'video/mp4' });
}
