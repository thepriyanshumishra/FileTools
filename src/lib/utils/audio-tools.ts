import { fetchFile } from '@ffmpeg/util';
import { loadFFmpeg } from './video-tools';

export async function convertAudioFormat(file: File, outputFormat: string): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.' + outputFormat;
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: `audio/${outputFormat}` });
}

export async function compressAudio(file: File): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp3';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-b:a', '128k', outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'audio/mp3' });
}

export async function trimAudio(file: File, startTime: number, duration: number): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp3';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-ss', startTime.toString(), '-t', duration.toString(), '-c', 'copy', outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'audio/mp3' });
}

export async function mergeAudio(files: File[]): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputs: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const inputName = `input${i}.` + files[i].name.split('.').pop();
    await ffmpeg.writeFile(inputName, await fetchFile(files[i]));
    inputs.push(inputName);
  }
  
  const filterComplex = inputs.map((_, i) => `[${i}:a]`).join('') + `concat=n=${inputs.length}:v=0:a=1[out]`;
  const args = inputs.flatMap(input => ['-i', input]);
  args.push('-filter_complex', filterComplex, '-map', '[out]', 'output.mp3');
  
  await ffmpeg.exec(args);
  
  const data = await ffmpeg.readFile('output.mp3');
  return new Blob([data as BlobPart], { type: 'audio/mp3' });
}

export async function changeAudioVolume(file: File, volume: number): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp3';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-af', `volume=${volume}`, outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'audio/mp3' });
}

export async function changeAudioSpeed(file: File, speed: number): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp3';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-filter:a', `atempo=${speed}`, outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'audio/mp3' });
}

export async function addFadeEffect(file: File, fadeIn: number, fadeOut: number): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp3';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-af', `afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOut}:d=3`, outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'audio/mp3' });
}

export async function reverseAudio(file: File): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.mp3';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-af', 'areverse', outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  return new Blob([data as BlobPart], { type: 'audio/mp3' });
}
