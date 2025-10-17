import JSZip from 'jszip';

export async function createZIP(files: File[]): Promise<Blob> {
  const zip = new JSZip();
  
  for (const file of files) {
    zip.file(file.name, file);
  }
  
  return await zip.generateAsync({ type: 'blob' });
}

export async function extractZIP(file: File): Promise<File[]> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  const files: File[] = [];
  
  for (const [filename, zipEntry] of Object.entries(contents.files)) {
    if (!zipEntry.dir) {
      const blob = await zipEntry.async('blob');
      files.push(new File([blob], filename));
    }
  }
  
  return files;
}

export async function viewZIPContents(file: File): Promise<string[]> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  
  return Object.keys(contents.files).filter(name => !contents.files[name].dir);
}
