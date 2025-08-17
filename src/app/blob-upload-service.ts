import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BlobSASPermissions,
  BlockBlobClient
} from '@azure/storage-blob';

@Injectable({
  providedIn: 'root'
})
export class BlobUploadService {
  constructor(private http: HttpClient) {}

  // Tu API debe generar una SAS URL para ESTE blob (nombre único)
  getSasUrl(fileName: string) {
    return this.http.get<{ sasUrl: string }>(`https://localhost:7033/Product/SAS?fileName=${encodeURIComponent(fileName)}`);
  }

  /**
   * Sube usando el método de alto nivel del SDK (chunking y paralelismo incluidos).
   * - blockSize controla el tamaño del chunk.
   * - concurrency controla cuántos chunks van en paralelo.
   * - onProgress recibe bytes subidos.
   */
  async uploadWithChunks(
    sasUrl: string,
    file: File,
    opts?: {
      blockSizeMB?: number;      // tamaño chunk (MB)
      concurrency?: number;      // # chunks paralelos
      contentType?: string;      // Content-Type
      metadata?: Record<string, string>;
      signal?: AbortSignal;      // para cancelación
      onProgress?: (percent: number) => void;
    }
  ): Promise<void> {
    const blockSize = Math.max(1, opts?.blockSizeMB ?? 4) * 1024 * 1024; // default 4MB
    const concurrency = opts?.concurrency ?? 4;

    const client = new BlockBlobClient(sasUrl);

    let last = 0;
    await client.uploadData(file, {
      blockSize,
      concurrency,
      onProgress: (ev) => {
        if (opts?.onProgress) {
          const loaded = ev.loadedBytes ?? 0;
          // ev.loadedBytes es acumulado; calculemos %
          const percent = Math.floor((loaded / file.size) * 100);
          if (percent !== last) {
            last = percent;
            opts.onProgress(percent);
          }
        }
      },
      abortSignal: opts?.signal,
      blobHTTPHeaders: {
        blobContentType: opts?.contentType || file.type || 'application/octet-stream'
      },
      metadata: opts?.metadata
    });
  }
}
