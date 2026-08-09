export class Notification {
  public title: string;
  public body: string;
  public silent?: boolean;

  constructor(options?: any) {
    this.title = options?.title || '';
    this.body = options?.body || '';
    this.silent = options?.silent;
  }

  static isSupported(): boolean {
    return true;
  }

  show(): void {}
  on(): void {}
}

export const clipboard = {
  readText: (): string => '',
  writeText: (_text: string): void => {},
};

export const app = {
  getPath: (): string => '',
  whenReady: async (): Promise<void> => {},
  on: (): void => {},
};

export const ipcMain = {
  handle: (): void => {},
  on: (): void => {},
};

export class BrowserWindow {
  public webPreferences: any;

  constructor(options?: any) {
    this.webPreferences = options?.webPreferences || {};
  }

  loadURL(_url: string): void {}
  loadFile(_file: string): void {}
  on(_event: string, _callback: Function): void {}
  getBounds() {
    return { width: 1280, height: 800, x: 0, y: 0 };
  }
  isMaximized(): boolean {
    return false;
  }
  isAlwaysOnTop(): boolean {
    return false;
  }
  setAlwaysOnTop(_flag: boolean): void {}

  static getAllWindows(): any[] {
    return [];
  }
  static fromWebContents(): any {
    return null;
  }
}

export const contextBridge = {
  exposeInMainWorld: (): void => {},
};

export const ipcRenderer = {
  invoke: async (): Promise<any> => {},
  on: (): void => {},
};
