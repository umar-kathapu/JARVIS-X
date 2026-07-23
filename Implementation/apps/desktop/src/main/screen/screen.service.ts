import { desktopCapturer } from 'electron';

export class ScreenService {
  async capturePrimaryScreen(): Promise<string> {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 },
    });
    const primary = sources[0];
    return primary ? primary.thumbnail.toDataURL() : '';
  }
}

export const screenService = new ScreenService();
