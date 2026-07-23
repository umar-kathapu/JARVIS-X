import { exec } from 'child_process';
import { TerminalSession } from '../types/desktop.types.js';

export class TerminalService {
  async executeCommand(command: string): Promise<TerminalSession> {
    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        resolve({
          id: `term_${Date.now()}`,
          command,
          output: stdout || stderr || error?.message || '',
          exitCode: error ? 1 : 0,
        });
      });
    });
  }
}

export const terminalService = new TerminalService();
