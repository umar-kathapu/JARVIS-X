import fs from 'fs';
import path from 'path';
import os from 'os';
import { ParsedGoalIntent, IntentType, ExtractedEntities } from './agent.types.js';

export class NLUService {
  /**
   * Dynamically parses natural language goal into Intent and structured Entities
   */
  parseGoal(goal: string): ParsedGoalIntent {
    const rawGoal = (goal || '').trim();
    const normalized = rawGoal.toLowerCase();

    // 1. Browser & Web Navigation / Search Intent
    if (this.isBrowserOrSearchIntent(normalized)) {
      return this.parseBrowserIntent(rawGoal, normalized);
    }

    // 2. Application Launch Intent (Open / Launch / Start App)
    if (this.isApplicationLaunchIntent(normalized)) {
      return this.parseApplicationIntent(rawGoal, normalized);
    }

    // 3. Filesystem Operations Intent (Create folder, find files, read file)
    if (this.isFilesystemIntent(normalized)) {
      return this.parseFilesystemIntent(rawGoal, normalized);
    }

    // 4. System Telemetry, Diagnostics & Software Checks
    if (this.isSystemOrSoftwareIntent(normalized)) {
      return this.parseSystemOrSoftwareIntent(rawGoal, normalized);
    }

    // 5. Developer / Terminal Commands Intent
    if (this.isTerminalCommandIntent(normalized)) {
      return this.parseTerminalIntent(rawGoal, normalized);
    }

    // 6. Native OS Services: Screenshot, Clipboard, Notification, Music
    if (this.isNativeOsServiceIntent(normalized)) {
      return this.parseNativeOsIntent(rawGoal, normalized);
    }

    // Default Fallback
    return {
      rawGoal,
      primaryIntent: 'UNKNOWN',
      entities: { text: rawGoal },
      confidence: 0.3,
    };
  }

  private isBrowserOrSearchIntent(text: string): boolean {
    return (
      text.startsWith('search ') ||
      text.includes('search for ') ||
      text.includes('google for ') ||
      text.includes('youtube for ') ||
      text.includes('navigate to ') ||
      text.includes('go to ') ||
      text.includes('http://') ||
      text.includes('https://') ||
      text.includes('.com') ||
      text.includes('.org') ||
      text.includes('.io') ||
      text.includes('.dev')
    );
  }

  private parseBrowserIntent(rawGoal: string, text: string): ParsedGoalIntent {
    // Check if it is a search intent
    const searchMatch = rawGoal.match(
      /(?:search(?:ing)?\s+(?:google|youtube|web|the\s+web)?\s*(?:for)?\s+|google\s+for\s+|youtube\s+and\s+search\s+for\s+)(.+)/i,
    );
    if (searchMatch && searchMatch[1]) {
      const isYouTube = text.includes('youtube');
      return {
        rawGoal,
        primaryIntent: 'SEARCH_WEB',
        entities: {
          searchQuery: searchMatch[1].trim(),
          url: isYouTube
            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchMatch[1].trim())}`
            : `https://www.google.com/search?q=${encodeURIComponent(searchMatch[1].trim())}`,
        },
        confidence: 0.95,
      };
    }

    // Check if it's a URL navigation intent
    const urlMatch = rawGoal.match(
      /(?:navigate\s+to|go\s+to|open)\s+(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i,
    );
    let targetUrl = urlMatch ? urlMatch[1] : '';
    if (targetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    return {
      rawGoal,
      primaryIntent: 'OPEN_URL',
      entities: {
        url: targetUrl || 'https://www.google.com',
      },
      confidence: 0.9,
    };
  }

  private isApplicationLaunchIntent(text: string): boolean {
    return (
      (text.startsWith('open ') || text.startsWith('launch ') || text.startsWith('start ')) &&
      !text.includes('folder') &&
      !text.includes('file') &&
      !text.includes('directory') &&
      !text.includes('navigate to') &&
      !text.includes('search ')
    );
  }

  private parseApplicationIntent(rawGoal: string, text: string): ParsedGoalIntent {
    // Extract application target name dynamically
    let appName = rawGoal
      .replace(/^(?:please\s+)?(?:open|launch|start|run)\s+(?:the\s+)?/i, '')
      .replace(/\s+(?:app|application|program)$/i, '')
      .trim();

    return {
      rawGoal,
      primaryIntent: 'OPEN_APPLICATION',
      entities: {
        appName,
      },
      confidence: 0.9,
    };
  }

  private isFilesystemIntent(text: string): boolean {
    return (
      text.includes('create a folder') ||
      text.includes('create folder') ||
      text.includes('create directory') ||
      text.includes('make a directory') ||
      text.includes('find all') ||
      text.includes('find pdf') ||
      text.includes('find files') ||
      text.includes('largest files') ||
      text.includes('list files') ||
      text.includes('read file') ||
      text.includes('open my') ||
      text.includes('downloads folder') ||
      text.includes('desktop')
    );
  }

  private parseFilesystemIntent(rawGoal: string, text: string): ParsedGoalIntent {
    // 1. Create Directory
    if (text.includes('create') && (text.includes('folder') || text.includes('directory'))) {
      const folderMatch = rawGoal.match(
        /create\s+(?:a\s+)?(?:folder|directory)\s+(?:called|named)?\s*["']?([^"'\s]+)["']?(?:\s+(?:on|in|at)\s+(?:my\s+|the\s+)?([a-zA-Z0-9_-]+))?/i,
      );
      const folderName = folderMatch ? folderMatch[1] : 'NewFolder';
      const rawLocation = folderMatch ? folderMatch[2]?.toLowerCase() : '';
      const targetLocation = rawLocation || (text.includes('download') ? 'downloads' : text.includes('document') ? 'documents' : 'desktop');

      const userProfile = process.env.USERPROFILE || os.homedir();
      const oneDrive = process.env.OneDrive || path.join(userProfile, 'OneDrive');

      let resolvedBasePath = userProfile;
      if (targetLocation.includes('desktop') || text.includes('desktop')) {
        const oneDriveDesktop = path.join(oneDrive, 'Desktop');
        resolvedBasePath = fs.existsSync(oneDriveDesktop) ? oneDriveDesktop : path.join(userProfile, 'Desktop');
      } else if (targetLocation.includes('download') || text.includes('download')) {
        resolvedBasePath = path.join(userProfile, 'Downloads');
      } else if (targetLocation.includes('document') || text.includes('document')) {
        const oneDriveDocs = path.join(oneDrive, 'Documents');
        resolvedBasePath = fs.existsSync(oneDriveDocs) ? oneDriveDocs : path.join(userProfile, 'Documents');
      }

      return {
        rawGoal,
        primaryIntent: 'CREATE_DIRECTORY',
        entities: {
          folderName,
          path: path.join(resolvedBasePath, folderName || 'NewFolder'),
        },
        confidence: 0.95,
      };
    }

    // 2. Search / Find Files
    if (text.includes('find') || text.includes('search') || text.includes('largest')) {
      const extMatch = text.match(/(pdf|txt|png|jpg|mp3|zip|json|ts|js)/i);
      const pattern = extMatch ? `*.${extMatch[1]}` : '*';

      let searchPath = os.homedir();
      if (text.includes('download')) searchPath = path.join(os.homedir(), 'Downloads');
      else if (text.includes('desktop')) searchPath = path.join(os.homedir(), 'Desktop');
      else if (text.includes('document')) searchPath = path.join(os.homedir(), 'Documents');
      else if (text.includes('music')) searchPath = path.join(os.homedir(), 'Music');

      return {
        rawGoal,
        primaryIntent: 'SEARCH_FILES',
        entities: {
          filePattern: pattern,
          path: searchPath,
        },
        confidence: 0.9,
      };
    }

    // 3. Read File
    if (text.startsWith('read file') || text.includes('read file') || text.startsWith('read ') || text.includes('read the file')) {
      const fileMatch = rawGoal.match(/read\s+(?:the\s+)?file\s+["']?([^"']+)["']?/i);
      const filePath = fileMatch ? fileMatch[1].trim() : rawGoal.replace(/read\s+(?:the\s+)?(?:file\s+)?/i, '').trim();
      return {
        rawGoal,
        primaryIntent: 'READ_FILE',
        entities: {
          path: filePath,
        },
        confidence: 0.95,
      };
    }

    // 4. Open Folder / List Files
    let targetPath = os.homedir();
    if (text.includes('music')) targetPath = path.join(os.homedir(), 'Music');
    else if (text.includes('download')) targetPath = path.join(os.homedir(), 'Downloads');
    else if (text.includes('desktop')) targetPath = path.join(os.homedir(), 'Desktop');

    return {
      rawGoal,
      primaryIntent: 'LIST_FILES',
      entities: { path: targetPath },
      confidence: 0.85,
    };
  }

  private isSystemOrSoftwareIntent(text: string): boolean {
    return (
      text.includes('cpu') ||
      text.includes('ram') ||
      text.includes('memory') ||
      text.includes('diagnostics') ||
      text.includes('system info') ||
      text.includes('system status') ||
      text.includes('installed') ||
      text.includes('check whether') ||
      text.includes('check if')
    );
  }

  private parseSystemOrSoftwareIntent(rawGoal: string, text: string): ParsedGoalIntent {
    // Check if software is installed
    if (text.includes('installed') || text.includes('check whether') || text.includes('check if')) {
      const swMatch = text.match(/(?:check\s+(?:whether|if)\s+)?([a-zA-Z0-9_.-]+)(?:\s+is\s+installed)?/i);
      let softwareName = swMatch ? swMatch[1]?.toLowerCase() : 'node';
      if (softwareName?.includes('node')) softwareName = 'node';
      if (softwareName?.includes('git')) softwareName = 'git';
      if (softwareName?.includes('python')) softwareName = 'python';

      return {
        rawGoal,
        primaryIntent: 'CHECK_SOFTWARE',
        entities: { softwareName: softwareName || 'node' },
        confidence: 0.95,
      };
    }

    // System Diagnostics
    if (text.includes('diagnostic')) {
      return {
        rawGoal,
        primaryIntent: 'SYSTEM_DIAGNOSTICS',
        entities: {},
        confidence: 0.95,
      };
    }

    // System Metrics (CPU, RAM)
    return {
      rawGoal,
      primaryIntent: 'SYSTEM_METRICS',
      entities: {},
      confidence: 0.9,
    };
  }

  private isTerminalCommandIntent(text: string): boolean {
    return text.startsWith('run git') || text.startsWith('git ') || text.startsWith('run command') || text.includes('in the jarvis-x project') || text.includes('in my project');
  }

  private parseTerminalIntent(rawGoal: string, text: string): ParsedGoalIntent {
    let command = 'git';
    let args: string[] = ['status'];

    if (text.includes('git status')) {
      command = 'git';
      args = ['status'];
    } else if (text.includes('git log')) {
      command = 'git';
      args = ['log', '-n', '5', '--oneline'];
    } else {
      const parts = rawGoal.replace(/^run\s+/i, '').trim().split(' ');
      command = parts[0] || 'git';
      args = parts.slice(1);
    }

    return {
      rawGoal,
      primaryIntent: 'TERMINAL_COMMAND',
      entities: {
        command,
        commandArgs: args,
      },
      confidence: 0.9,
    };
  }

  private isNativeOsServiceIntent(text: string): boolean {
    return (
      text.includes('screenshot') ||
      text.includes('screen capture') ||
      text.includes('clipboard') ||
      text.includes('notification') ||
      text.includes('scan my music') ||
      text.includes('music library')
    );
  }

  private parseNativeOsIntent(rawGoal: string, text: string): ParsedGoalIntent {
    if (text.includes('screenshot') || text.includes('screen capture')) {
      return {
        rawGoal,
        primaryIntent: 'SCREEN_CAPTURE',
        entities: {},
        confidence: 0.95,
      };
    }

    if (text.includes('clipboard')) {
      const isCopy = text.includes('copy') || text.includes('write');
      const copyMatch = rawGoal.match(/copy\s+["']?([^"']+)["']?\s+to\s+clipboard/i);
      return {
        rawGoal,
        primaryIntent: isCopy ? 'CLIPBOARD_WRITE' : 'CLIPBOARD_READ',
        entities: { text: copyMatch ? copyMatch[1] : 'JARVIS-X Agent Telemetry' },
        confidence: 0.9,
      };
    }

    if (text.includes('notification')) {
      const notifyMatch = rawGoal.match(/notification\s*[:"-]?\s*(.+)/i);
      return {
        rawGoal,
        primaryIntent: 'NOTIFICATION',
        entities: {
          notificationTitle: 'JARVIS-X Autonomous Agent',
          notificationBody: notifyMatch ? notifyMatch[1] : 'Autonomous action executed successfully.',
        },
        confidence: 0.9,
      };
    }

    if (text.includes('music')) {
      return {
        rawGoal,
        primaryIntent: 'MUSIC_LIBRARY_SCAN',
        entities: { path: path.join(os.homedir(), 'Music') },
        confidence: 0.95,
      };
    }

    return {
      rawGoal,
      primaryIntent: 'UNKNOWN',
      entities: { text: rawGoal },
      confidence: 0.5,
    };
  }
}

export const nluService = new NLUService();
