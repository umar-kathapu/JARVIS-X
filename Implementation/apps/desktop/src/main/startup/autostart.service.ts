import { app } from 'electron';

export class AutostartService {
  setAutoStart(enable: boolean): void {
    app.setLoginItemSettings({
      openAtLogin: enable,
      openAsHidden: true,
    });
  }

  isAutoStartEnabled(): boolean {
    return app.getLoginItemSettings().openAtLogin;
  }
}

export const autostartService = new AutostartService();
