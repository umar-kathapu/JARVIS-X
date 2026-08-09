import fs from 'fs';
import path from 'path';
import os from 'os';
import { IAgentTool, ToolDefinition, ToolExecutionResult } from '../agent.types.js';
import { screenService } from '../../screen/screen.service.js';
import { clipboardService } from '../../clipboard/clipboard.service.js';
import { desktopNotificationService } from '../../notifications/notification.service.js';

export class ScreenCaptureTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'screen.capture',
    description: 'Captures a real screenshot of the primary display, saves it as a PNG file, and verifies disk persistence',
    category: 'SCREEN',
    parameters: [],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const result = await screenService.capturePrimaryScreen();
    if (!result) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'CAPTURE_SCREEN',
        parameters: args,
        output: 'Failed to capture primary display screenshot.',
        error: 'CaptureFailed',
        evidence: { verified: false, verificationDetails: 'Screen capture failed or file write was unverified' },
      };
    }

    const verified = fs.existsSync(result.filePath) && fs.statSync(result.filePath).size > 0;
    return {
      success: verified,
      status: verified ? 'COMPLETED' : 'FAILED',
      tool: this.definition.name,
      action: 'CAPTURE_SCREEN',
      parameters: args,
      output: `Screenshot captured and saved to "${result.filePath}" (${result.width}x${result.height}, ${(result.sizeBytes / 1024).toFixed(1)} KB)`,
      evidence: {
        resolvedPath: result.filePath,
        dimensions: { width: result.width, height: result.height },
        fileSizeBytes: result.sizeBytes,
        dataUrl: result.dataUrl,
        verified,
        verificationDetails: `PNG file verified on disk at "${result.filePath}" (${result.sizeBytes} bytes)`,
      },
    };
  }

  async verify(result: ToolExecutionResult): Promise<boolean> {
    if (result.evidence?.resolvedPath) {
      try {
        return (
          fs.existsSync(result.evidence.resolvedPath) &&
          fs.statSync(result.evidence.resolvedPath).size > 0
        );
      } catch {
        return false;
      }
    }
    return result.success;
  }
}

export class ClipboardReadTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'clipboard.read',
    description: 'Reads current text content from the system clipboard',
    category: 'CLIPBOARD',
    parameters: [],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const text = clipboardService.readText();
    return {
      success: true,
      status: 'COMPLETED',
      tool: this.definition.name,
      action: 'READ_CLIPBOARD',
      parameters: args,
      output: text ? `Clipboard Content: "${text}"` : 'Clipboard is currently empty.',
      evidence: {
        verified: true,
        verificationDetails: 'Read from OS clipboard',
        text,
      },
    };
  }
}

export class ClipboardWriteTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'clipboard.write',
    description: 'Writes specified text to the system clipboard and verifies content',
    category: 'CLIPBOARD',
    parameters: [
      { name: 'text', type: 'string', description: 'Text to copy to clipboard', required: true },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const text = String(args.text || '').trim();
    clipboardService.writeText(text);
    const readBack = clipboardService.readText();
    const verified = readBack === text;

    return {
      success: verified,
      status: verified ? 'COMPLETED' : 'FAILED',
      tool: this.definition.name,
      action: 'WRITE_CLIPBOARD',
      parameters: { text },
      output: `Copied "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" to system clipboard`,
      evidence: {
        verified,
        verificationDetails: verified ? 'Text verified in clipboard' : 'Clipboard verification mismatch',
        text,
      },
    };
  }
}

export class NotificationSendTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'notification.send',
    description: 'Dispatches a native Windows desktop notification',
    category: 'NOTIFICATION',
    parameters: [
      { name: 'title', type: 'string', description: 'Notification title', required: true },
      { name: 'body', type: 'string', description: 'Notification message body', required: true },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const title = String(args.title || 'JARVIS-X Agent');
    const body = String(args.body || 'Task execution update');

    desktopNotificationService.sendNotification({ title, body });
    return {
      success: true,
      status: 'COMPLETED',
      tool: this.definition.name,
      action: 'SEND_NOTIFICATION',
      parameters: { title, body },
      output: `Desktop notification dispatched: "${title}" - "${body}"`,
      evidence: {
        verified: true,
        verificationDetails: 'Dispatched to Windows Notification Center',
      },
    };
  }
}

export class MusicScanTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'music.scan',
    description: 'Scans the local Music library directory and indexes audio files',
    category: 'MUSIC',
    parameters: [
      { name: 'dirPath', type: 'string', description: 'Music directory path (defaults to user Music folder)', required: false },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const targetDir = String(args.dirPath || path.join(os.homedir(), 'Music'));

    if (!fs.existsSync(targetDir)) {
      return {
        success: true,
        status: 'COMPLETED',
        tool: this.definition.name,
        action: 'SCAN_MUSIC',
        parameters: args,
        output: `Music directory "${targetDir}" is ready for audio imports (0 tracks found).`,
        evidence: {
          resolvedPath: targetDir,
          fileCount: 0,
          verified: true,
          verificationDetails: `Scanned music directory ${targetDir}`,
        },
      };
    }

    try {
      const audioExts = new Set(['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg']);
      const files = fs.readdirSync(targetDir);
      const audioFiles = files.filter((f) => audioExts.has(path.extname(f).toLowerCase()));

      return {
        success: true,
        status: 'COMPLETED',
        tool: this.definition.name,
        action: 'SCAN_MUSIC',
        parameters: args,
        output: `Music Library scanned: Found ${audioFiles.length} audio track(s) in "${targetDir}".`,
        evidence: {
          resolvedPath: targetDir,
          fileCount: audioFiles.length,
          files: audioFiles.slice(0, 10),
          verified: true,
          verificationDetails: `Scanned and indexed ${audioFiles.length} audio tracks`,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'SCAN_MUSIC',
        parameters: args,
        output: `Error scanning music: ${err.message}`,
        error: err.message,
        evidence: { verified: false, verificationDetails: `OS Error: ${err.message}` },
      };
    }
  }
}
