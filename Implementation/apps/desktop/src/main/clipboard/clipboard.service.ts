import { clipboard } from 'electron';
import { ClipboardEntry } from '../types/desktop.types.js';

export class ClipboardService {
  private history: ClipboardEntry[] = [];

  readText(): string {
    const text = clipboard.readText();
    if (text && (!this.history.length || this.history[0]?.text !== text)) {
      this.history.unshift({
        text,
        timestamp: new Date().toISOString(),
        format: 'text',
      });
      if (this.history.length > 50) this.history.pop();
    }
    return text;
  }

  writeText(text: string): void {
    clipboard.writeText(text);
    this.history.unshift({
      text,
      timestamp: new Date().toISOString(),
      format: 'text',
    });
  }

  getHistory(): ClipboardEntry[] {
    return [...this.history];
  }
}

export const clipboardService = new ClipboardService();
