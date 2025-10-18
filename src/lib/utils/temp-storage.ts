interface StoredFile {
  id: string;
  blob: Blob;
  fileName: string;
  expiresAt: Date;
  createdAt: Date;
}

class TempStorage {
  private storage = new Map<string, StoredFile>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startCleanup();
    }
  }

  store(blob: Blob, fileName: string, expiresInHours: number = 24): string {
    const id = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    this.storage.set(id, {
      id,
      blob,
      fileName,
      expiresAt,
      createdAt: new Date(),
    });

    return id;
  }

  retrieve(id: string): StoredFile | null {
    const file = this.storage.get(id);
    if (!file) return null;

    if (new Date() > file.expiresAt) {
      this.storage.delete(id);
      return null;
    }

    return file;
  }

  delete(id: string): boolean {
    return this.storage.delete(id);
  }

  private cleanup() {
    const now = new Date();
    for (const [id, file] of this.storage.entries()) {
      if (now > file.expiresAt) {
        this.storage.delete(id);
      }
    }
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.storage.clear();
  }
}

export const tempStorage = new TempStorage();
