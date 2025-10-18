export async function processFileInChunks(
  file: File,
  chunkSize: number = 1024 * 1024,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  const chunks: Uint8Array[] = [];
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    const buffer = await chunk.arrayBuffer();
    chunks.push(new Uint8Array(buffer));
    
    offset += chunkSize;
    
    if (onProgress) {
      const progress = Math.min((offset / file.size) * 100, 100);
      onProgress(progress);
    }
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let position = 0;

  for (const chunk of chunks) {
    result.set(chunk, position);
    position += chunk.length;
  }

  return result.buffer;
}

export function createStreamReader(file: File) {
  const stream = file.stream();
  const reader = stream.getReader();
  
  return {
    async *read() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
}
