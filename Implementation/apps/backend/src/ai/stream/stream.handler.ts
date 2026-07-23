import { StreamChunk } from '../types/provider.types.js';

export class StreamHandler {
  private isAborted = false;

  abort(): void {
    this.isAborted = true;
  }

  processChunk(chunk: StreamChunk, callback: (chunk: StreamChunk) => void): void {
    if (this.isAborted) return;
    callback(chunk);
  }
}
