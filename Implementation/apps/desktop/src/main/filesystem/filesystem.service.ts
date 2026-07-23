import { dialog, BrowserWindow } from 'electron';
import fs from 'fs/promises';

export class FilesystemService {
  async selectFile(browserWindow?: BrowserWindow): Promise<string | null> {
    const result = await dialog.showOpenDialog(browserWindow || ({} as any), {
      properties: ['openFile'],
    });
    return result.canceled ? null : result.filePaths[0] || null;
  }

  async selectFolder(browserWindow?: BrowserWindow): Promise<string | null> {
    const result = await dialog.showOpenDialog(browserWindow || ({} as any), {
      properties: ['openDirectory'],
    });
    return result.canceled ? null : result.filePaths[0] || null;
  }

  async readFileText(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  async writeFileText(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, 'utf-8');
  }
}

export const filesystemService = new FilesystemService();
