export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
  isAlwaysOnTop: boolean;
}

export interface SystemMetrics {
  cpuUsagePercentage: number;
  totalMemoryMb: number;
  usedMemoryMb: number;
  freeMemoryMb: number;
  platform: string;
  arch: string;
  uptimeSeconds: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
}

export interface ClipboardEntry {
  text: string;
  timestamp: string;
  format: 'text' | 'image' | 'html';
}

export interface TerminalSession {
  id: string;
  command: string;
  output: string;
  exitCode?: number;
}

export interface VoiceCommand {
  phrase: string;
  confidence: number;
  actionId: string;
}
