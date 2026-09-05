import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn, execFile } from 'child_process';

async function getElectronShell() {
  try {
    const el: any = await import('electron');
    return el.shell || el.default?.shell || null;
  } catch {
    return null;
  }
}

export interface ResolvedApplication {
  found: boolean;
  appName: string;
  normalizedName: string;
  method: 'APPLICATION_LAUNCH' | 'URI_LAUNCH' | 'BROWSER_FALLBACK';
  executablePath?: string;
  targetUrl?: string;
  source: 'KNOWN_PATH' | 'PATH_ENV' | 'START_MENU' | 'REGISTRY' | 'URI_PROTOCOL' | 'WEB_FALLBACK' | 'UNKNOWN';
}

export interface ApplicationLaunchResult {
  success: boolean;
  method: 'APPLICATION_LAUNCH' | 'URI_LAUNCH' | 'BROWSER_FALLBACK';
  launchMethod?: 'FRESH_LAUNCH' | 'ALREADY_RUNNING' | 'URI_PROTOCOL' | 'BROWSER_FALLBACK';
  appName: string;
  resolvedPath?: string;
  targetUrl?: string;
  pid?: number;
  pids?: number[];
  processName?: string;
  verified: boolean;
  verificationDetails: string;
  output: string;
  error?: string;
}

export class ApplicationResolver {
  // Aliases mapping user query terms to canonical search names
  private readonly ALIAS_MAP: Record<string, string[]> = {
    'vs code': ['code.exe', 'code.cmd', 'code', 'visual studio code'],
    'vscode': ['code.exe', 'code.cmd', 'code', 'visual studio code'],
    'visual studio code': ['code.exe', 'code.cmd', 'code', 'visual studio code'],
    'code': ['code.exe', 'code.cmd', 'code', 'visual studio code'],
    'chrome': ['chrome.exe', 'google chrome'],
    'google chrome': ['chrome.exe', 'google chrome'],
    'antigravity': ['antigravity.exe', 'antigravity-ide', 'antigravity'],
    'antigravity-ide': ['antigravity.exe', 'antigravity-ide', 'antigravity'],
    'whatsapp': ['whatsapp.exe', 'whatsapp'],
    'instagram': ['instagram.exe', 'instagram'],
    'spotify': ['spotify.exe', 'spotify'],
    'discord': ['discord.exe', 'discord'],
    'notepad': ['notepad.exe', 'notepad'],
    'calc': ['calc.exe', 'calculator'],
    'calculator': ['calc.exe', 'calculator'],
    'explorer': ['explorer.exe', 'file explorer'],
    'file explorer': ['explorer.exe', 'file explorer'],
    'settings': ['ms-settings:'],
    'windows settings': ['ms-settings:'],
    'terminal': ['wt.exe', 'powershell.exe', 'cmd.exe'],
    'powershell': ['powershell.exe'],
    'cmd': ['cmd.exe'],
  };

  // Known fallback web URLs for web-first apps when not installed locally
  private readonly WEB_FALLBACKS: Record<string, string> = {
    instagram: 'https://www.instagram.com/',
    whatsapp: 'https://web.whatsapp.com/',
    spotify: 'https://open.spotify.com/',
    discord: 'https://discord.com/app',
    twitter: 'https://twitter.com/',
    x: 'https://x.com/',
    youtube: 'https://www.youtube.com/',
    github: 'https://github.com/',
    netflix: 'https://www.netflix.com/',
  };

  // Well-known static locations
  private readonly KNOWN_LOCATIONS: Record<string, string[]> = {
    code: [
      path.join(os.homedir(), 'AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe'),
      path.join(os.homedir(), 'AppData\\Local\\Programs\\Microsoft VS Code\\bin\\code.cmd'),
      'C:\\Program Files\\Microsoft VS Code\\Code.exe',
      'C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe',
    ],
    chrome: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
    ],
    antigravity: [
      path.join(os.homedir(), 'AppData\\Local\\Programs\\antigravity-ide\\antigravity.exe'),
      path.join(os.homedir(), 'AppData\\Local\\Programs\\Antigravity\\Antigravity.exe'),
      path.join(os.homedir(), 'AppData\\Local\\Programs\\antigravity-ide\\Antigravity.exe'),
    ],
    whatsapp: [
      path.join(os.homedir(), 'AppData\\Local\\WhatsApp\\WhatsApp.exe'),
      path.join(os.homedir(), 'AppData\\Local\\Programs\\WhatsApp\\WhatsApp.exe'),
      'C:\\Program Files\\WhatsApp\\WhatsApp.exe',
    ],
    spotify: [
      path.join(os.homedir(), 'AppData\\Roaming\\Spotify\\Spotify.exe'),
      path.join(os.homedir(), 'AppData\\Local\\Microsoft\\WindowsApps\\Spotify.exe'),
    ],
    discord: [
      path.join(os.homedir(), 'AppData\\Local\\Discord\\Update.exe'),
    ],
    notepad: ['C:\\Windows\\System32\\notepad.exe', 'C:\\Windows\\notepad.exe'],
    calc: ['C:\\Windows\\System32\\calc.exe'],
    explorer: ['C:\\Windows\\explorer.exe'],
  };

  /**
   * Normalizes arbitrary user application input string
   */
  normalizeAppName(rawName: string): string {
    return (rawName || '')
      .trim()
      .toLowerCase()
      .replace(/^(?:please\s+)?(?:open|launch|start|run)\s+(?:the\s+)?/i, '')
      .replace(/\s+(?:app|application|program|software)$/i, '')
      .replace(/\.exe$/i, '')
      .trim();
  }

  /**
   * Discovers and resolves an installed Windows application using multi-source discovery
   */
  resolve(rawAppName: string): ResolvedApplication {
    const normalized = this.normalizeAppName(rawAppName);
    const searchTerms = this.ALIAS_MAP[normalized] || [normalized, `${normalized}.exe`];

    // 1. Check Known File Paths
    for (const term of searchTerms) {
      const cleanTerm = term.replace(/\.exe$/, '').replace(/\.cmd$/, '');
      const candidates = this.KNOWN_LOCATIONS[cleanTerm] || [];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return {
            found: true,
            appName: rawAppName,
            normalizedName: normalized,
            method: 'APPLICATION_LAUNCH',
            executablePath: candidate,
            source: 'KNOWN_PATH',
          };
        }
      }
    }

    // 2. Check System32 & Windows Directories Directly
    for (const term of searchTerms) {
      const baseName = term.endsWith('.exe') ? term : `${term}.exe`;
      const sys32Path = path.join('C:\\Windows\\System32', baseName);
      if (fs.existsSync(sys32Path)) {
        return {
          found: true,
          appName: rawAppName,
          normalizedName: normalized,
          method: 'APPLICATION_LAUNCH',
          executablePath: sys32Path,
          source: 'KNOWN_PATH',
        };
      }
    }

    // 3. Search PATH Environment Variable
    const pathEntries = (process.env.PATH || '').split(path.delimiter);
    for (const term of searchTerms) {
      const extensions = ['.exe', '.cmd', '.bat', ''];
      for (const ext of extensions) {
        const fileToFind = term.endsWith(ext) && ext !== '' ? term : `${term}${ext}`;
        for (const dir of pathEntries) {
          if (!dir) continue;
          const fullPath = path.join(dir, fileToFind);
          try {
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
              return {
                found: true,
                appName: rawAppName,
                normalizedName: normalized,
                method: 'APPLICATION_LAUNCH',
                executablePath: fullPath,
                source: 'PATH_ENV',
              };
            }
          } catch {}
        }
      }
    }

    // 4. Search Windows Start Menu Shortcuts (.lnk)
    const startMenuRoots = [
      path.join(os.homedir(), 'AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs'),
      'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs',
      path.join(os.homedir(), 'Desktop'),
    ];

    for (const term of searchTerms) {
      for (const root of startMenuRoots) {
        if (fs.existsSync(root)) {
          const lnkPath = this.findShortcutInDir(root, term);
          if (lnkPath) {
            return {
              found: true,
              appName: rawAppName,
              normalizedName: normalized,
              method: 'APPLICATION_LAUNCH',
              executablePath: lnkPath,
              source: 'START_MENU',
            };
          }
        }
      }
    }

    // 5. Special Windows URI Scheme for Settings
    if (normalized === 'settings' || normalized === 'windows settings') {
      return {
        found: true,
        appName: rawAppName,
        normalizedName: normalized,
        method: 'URI_LAUNCH',
        executablePath: 'ms-settings:',
        source: 'URI_PROTOCOL',
      };
    }

    // 6. Graceful Browser Fallback for Web-First Apps (e.g. Instagram, Web WhatsApp)
    if (this.WEB_FALLBACKS[normalized]) {
      return {
        found: true,
        appName: rawAppName,
        normalizedName: normalized,
        method: 'BROWSER_FALLBACK',
        targetUrl: this.WEB_FALLBACKS[normalized],
        source: 'WEB_FALLBACK',
      };
    }

    return {
      found: false,
      appName: rawAppName,
      normalizedName: normalized,
      method: 'APPLICATION_LAUNCH',
      source: 'UNKNOWN',
    };
  }

  // Mapping application normalized names to known process image names
  private readonly PROCESS_NAME_MAP: Record<string, string[]> = {
    'vs code': ['Code.exe', 'code.exe'],
    'vscode': ['Code.exe', 'code.exe'],
    'visual studio code': ['Code.exe', 'code.exe'],
    'code': ['Code.exe', 'code.exe'],
    'chrome': ['chrome.exe'],
    'google chrome': ['chrome.exe'],
    'antigravity': ['antigravity.exe', 'Antigravity.exe', 'antigravity-ide.exe', 'Code.exe', 'electron.exe'],
    'antigravity-ide': ['antigravity.exe', 'Antigravity.exe', 'antigravity-ide.exe', 'Code.exe', 'electron.exe'],
    'whatsapp': ['WhatsApp.exe', 'WhatsApp.Root.exe'],
    'spotify': ['Spotify.exe'],
    'discord': ['Discord.exe', 'Update.exe'],
    'notepad': ['notepad.exe', 'Notepad.exe'],
    'calc': ['CalculatorApp.exe', 'calc.exe', 'Calculator.exe'],
    'calculator': ['CalculatorApp.exe', 'calc.exe', 'Calculator.exe'],
    'explorer': ['explorer.exe'],
    'file explorer': ['explorer.exe'],
    'terminal': ['WindowsTerminal.exe', 'wt.exe'],
    'powershell': ['powershell.exe', 'pwsh.exe'],
    'cmd': ['cmd.exe'],
  };

  // In-flight launch mutex map to prevent race conditions on concurrent identical requests
  private readonly inFlightLaunches = new Map<string, Promise<ApplicationLaunchResult>>();

  // In-flight process lookup map to coalesce concurrent findRunningProcesses queries
  private readonly inFlightProcessChecks = new Map<string, Promise<number[]>>();

  // Known live processes tracked across launch lifecycles for immediate deduplication
  private readonly trackedAppPids = new Map<string, Set<number>>();

  /**
   * Generates a canonical identifier key for an application target
   */
  getCanonicalAppKey(target: ResolvedApplication): string {
    const images = this.getProcessImageNames(target);
    if (images.length > 0) {
      return images[0]!.toLowerCase();
    }
    return (target.normalizedName || target.appName || '').toLowerCase();
  }

  /**
   * Resolves candidate process image names for a given application
   */
  getProcessImageNames(target: ResolvedApplication): string[] {
    const normalized = target.normalizedName || this.normalizeAppName(target.appName);
    const list = new Set<string>();

    const mapped = this.PROCESS_NAME_MAP[normalized];
    if (mapped) {
      for (const img of mapped) list.add(img);
    }

    if (target.executablePath) {
      const base = path.basename(target.executablePath);
      list.add(base);
      if (base.toLowerCase().endsWith('.cmd') || base.toLowerCase().endsWith('.bat') || base.toLowerCase().endsWith('.lnk')) {
        const clean = base.replace(/\.(cmd|bat|lnk)$/i, '.exe');
        list.add(clean);
      }
    }

    if (list.size === 0 && normalized) {
      list.add(`${normalized}.exe`);
    }

    return Array.from(list);
  }

  /**
   * Discovers active running OS process IDs for the target application (coalesced for concurrency)
   */
  async findRunningProcesses(target: ResolvedApplication): Promise<number[]> {
    const key = this.getCanonicalAppKey(target);

    // Fast-path: Check known tracked live PIDs before querying OS process table
    const trackedSet = this.trackedAppPids.get(key);
    if (trackedSet && trackedSet.size > 0) {
      const aliveTracked: number[] = [];
      for (const pid of Array.from(trackedSet)) {
        try {
          process.kill(pid, 0);
          aliveTracked.push(pid);
        } catch (err: any) {
          if (err?.code === 'EPERM') {
            aliveTracked.push(pid);
          } else {
            trackedSet.delete(pid);
          }
        }
      }
      if (aliveTracked.length > 0) {
        return Array.from(new Set(aliveTracked));
      }
    }

    const inFlight = this.inFlightProcessChecks.get(key);
    if (inFlight) {
      return inFlight;
    }

    const checkPromise = this.executeFindRunningProcesses(target);
    this.inFlightProcessChecks.set(key, checkPromise);

    try {
      return await checkPromise;
    } finally {
      this.inFlightProcessChecks.delete(key);
    }
  }

  private async executeFindRunningProcesses(target: ResolvedApplication): Promise<number[]> {
    const key = this.getCanonicalAppKey(target);
    const imageNames = this.getProcessImageNames(target);
    if (imageNames.length === 0) return [];
    const targetSet = new Set(imageNames.map((n) => n.toLowerCase()));

    const systemRoot = process.env.SystemRoot || process.env.WINDIR || 'C:\\Windows';
    const tasklistCandidates = [
      path.join(systemRoot, 'System32', 'tasklist.exe'),
      path.join(systemRoot, 'Sysnative', 'tasklist.exe'),
      'tasklist.exe',
    ];
    let tasklistCmd = 'tasklist.exe';
    for (const cand of tasklistCandidates) {
      if (cand === 'tasklist.exe' || fs.existsSync(cand)) {
        tasklistCmd = cand;
        break;
      }
    }

    const args =
      imageNames.length === 1
        ? ['/FI', `IMAGENAME eq ${imageNames[0]}`, '/FO', 'CSV', '/NH']
        : ['/FO', 'CSV', '/NH'];

    return new Promise<number[]>((resolve) => {
      execFile(
        tasklistCmd,
        args,
        { windowsHide: true, maxBuffer: 10 * 1024 * 1024, timeout: 4000 },
        (err, stdout) => {
          const foundPids: number[] = [];
          if (!err && stdout) {
            const lines = stdout.split(/\r?\n/);
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith('INFO:') || trimmed.startsWith('Image Name') || trimmed.startsWith('===')) continue;

              let imageName = '';
              let pid = 0;

              if (trimmed.startsWith('"')) {
                const parts = trimmed.split('","').map((p) => p.replace(/^"|"$/g, '').trim());
                if (parts.length >= 2) {
                  imageName = (parts[0] || '').toLowerCase();
                  pid = parseInt(parts[1] || '0', 10);
                }
              } else {
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 2) {
                  imageName = (parts[0] || '').toLowerCase();
                  pid = parseInt(parts[1] || '0', 10);
                }
              }

              if (imageName && targetSet.has(imageName) && !isNaN(pid) && pid > 0) {
                foundPids.push(pid);
                if (!this.trackedAppPids.has(key)) {
                  this.trackedAppPids.set(key, new Set());
                }
                this.trackedAppPids.get(key)!.add(pid);
              }
            }
          }
          resolve(Array.from(new Set(foundPids)));
        }
      );
    });
  }

  /**
   * Safely launches the resolved application and verifies execution (with in-flight deduplication)
   */
  async launch(target: ResolvedApplication): Promise<ApplicationLaunchResult> {
    const lockKey = this.getCanonicalAppKey(target);
    const inFlight = this.inFlightLaunches.get(lockKey);
    if (inFlight) {
      return inFlight;
    }

    const launchPromise = this.executeLaunchWithDeduplication(target);
    this.inFlightLaunches.set(lockKey, launchPromise);

    try {
      return await launchPromise;
    } finally {
      this.inFlightLaunches.delete(lockKey);
    }
  }

  private async executeLaunchWithDeduplication(target: ResolvedApplication): Promise<ApplicationLaunchResult> {
    if (!target.found) {
      return {
        success: false,
        method: target.method,
        appName: target.appName,
        verified: false,
        verificationDetails: `Application "${target.appName}" could not be resolved in PATH, Start Menu, or Program Files.`,
        output: `Application "${target.appName}" is not installed or could not be found on this machine.`,
        error: 'ApplicationNotFound',
      };
    }

    // Case 1: Browser Fallback (e.g. Instagram, Web Services)
    if (target.method === 'BROWSER_FALLBACK' && target.targetUrl) {
      try {
        const electronShell = await getElectronShell();
        if (electronShell && typeof electronShell.openExternal === 'function') {
          await electronShell.openExternal(target.targetUrl).catch(() => {});
        } else {
          execFile('cmd.exe', ['/c', 'start', '', target.targetUrl], () => {});
        }
        return {
          success: true,
          method: 'BROWSER_FALLBACK',
          launchMethod: 'BROWSER_FALLBACK',
          appName: target.appName,
          targetUrl: target.targetUrl,
          verified: true,
          verificationDetails: `Launched browser fallback to ${target.targetUrl} (Desktop package not found locally)`,
          output: `Opened ${target.appName} in web browser at ${target.targetUrl} (Browser Fallback)`,
        };
      } catch (err: any) {
        return {
          success: false,
          method: 'BROWSER_FALLBACK',
          launchMethod: 'BROWSER_FALLBACK',
          appName: target.appName,
          targetUrl: target.targetUrl,
          verified: false,
          verificationDetails: `Failed to open browser fallback URL: ${err.message}`,
          output: `Failed to open ${target.appName} via browser fallback: ${err.message}`,
          error: err.message,
        };
      }
    }

    // Case 2: URI Scheme (e.g. ms-settings:)
    if (target.method === 'URI_LAUNCH' && target.executablePath) {
      try {
        const electronShell = await getElectronShell();
        if (electronShell && typeof electronShell.openExternal === 'function') {
          await electronShell.openExternal(target.executablePath).catch(() => {});
        } else {
          execFile('cmd.exe', ['/c', 'start', '', target.executablePath], () => {});
        }
        return {
          success: true,
          method: 'URI_LAUNCH',
          launchMethod: 'URI_PROTOCOL',
          appName: target.appName,
          resolvedPath: target.executablePath,
          verified: true,
          verificationDetails: `Launched Windows Protocol URI "${target.executablePath}"`,
          output: `Opened ${target.appName} via Windows Protocol (${target.executablePath})`,
        };
      } catch (err: any) {
        return {
          success: false,
          method: 'URI_LAUNCH',
          launchMethod: 'URI_PROTOCOL',
          appName: target.appName,
          verified: false,
          verificationDetails: `Failed to launch protocol: ${err.message}`,
          output: `Failed to launch ${target.appName}: ${err.message}`,
          error: err.message,
        };
      }
    }

    // Case 3: Binary / Executable / Shortcut Launch
    const execPath = target.executablePath!;

    // Generic Process Check: inspect if application is already running on the operating system
    const existingPids = await this.findRunningProcesses(target);
    if (existingPids.length > 0) {
      const primaryPid = existingPids[0];
      const procName = path.basename(execPath);
      return {
        success: true,
        method: 'APPLICATION_LAUNCH',
        launchMethod: 'ALREADY_RUNNING',
        appName: target.appName,
        resolvedPath: execPath,
        processName: procName,
        pid: primaryPid,
        pids: existingPids,
        verified: true,
        verificationDetails: `Application "${target.appName}" is already running with PID(s): ${existingPids.join(', ')}. Preserved existing active instance without duplicate launch.`,
        output: `Application "${target.appName}" is already running (PID: ${primaryPid}). Preserved existing instance without duplicate launch.`,
      };
    }

    return new Promise((resolve) => {
      try {
        // If it is a .lnk or .cmd, use shell execute
        if (execPath.endsWith('.lnk') || execPath.endsWith('.cmd')) {
          execFile('cmd.exe', ['/c', 'start', '', execPath], { windowsHide: true, timeout: 5000 }, async (err) => {
            if (err) {
              return resolve({
                success: false,
                method: 'APPLICATION_LAUNCH',
                launchMethod: 'FRESH_LAUNCH',
                appName: target.appName,
                resolvedPath: execPath,
                verified: false,
                verificationDetails: `Failed to start shortcut/cmd: ${err.message}`,
                output: `Failed to launch ${target.appName}: ${err.message}`,
                error: err.message,
              });
            }
            // Give 250ms for Windows to register process and capture PID
            setTimeout(async () => {
              const freshPids = await this.findRunningProcesses(target);
              const foundPid = freshPids.length > 0 ? freshPids[0] : undefined;
              resolve({
                success: true,
                method: 'APPLICATION_LAUNCH',
                launchMethod: 'FRESH_LAUNCH',
                appName: target.appName,
                resolvedPath: execPath,
                processName: path.basename(execPath),
                pid: foundPid,
                pids: freshPids,
                verified: true,
                verificationDetails: foundPid
                  ? `Launched application shortcut/script from ${execPath} (PID: ${foundPid})`
                  : `Launched application shortcut/script from ${execPath}`,
                output: foundPid
                  ? `Application "${target.appName}" started successfully (PID: ${foundPid})`
                  : `Application "${target.appName}" started successfully from "${execPath}"`,
              });
            }, 250);
          });
          return;
        }

        // Direct executable spawn
        const child = spawn(execPath, [], {
          detached: true,
          stdio: 'ignore',
        });

        child.on('error', (spawnErr: any) => {
          resolve({
            success: false,
            method: 'APPLICATION_LAUNCH',
            launchMethod: 'FRESH_LAUNCH',
            appName: target.appName,
            resolvedPath: execPath,
            verified: false,
            verificationDetails: `Process spawn error: ${spawnErr.message}`,
            output: `Failed to start process for "${target.appName}": ${spawnErr.message}`,
            error: spawnErr.message || 'SpawnFailed',
          });
        });

        child.unref();

        const pid = child.pid;
        if (!pid) {
          return resolve({
            success: false,
            method: 'APPLICATION_LAUNCH',
            launchMethod: 'FRESH_LAUNCH',
            appName: target.appName,
            resolvedPath: execPath,
            verified: false,
            verificationDetails: 'Process spawn returned no OS PID',
            output: `Failed to start process for "${target.appName}"`,
            error: 'SpawnFailed',
          });
        }

        // Verify process survival and discover any delegated child processes
        setTimeout(async () => {
          let isAlive = true;
          try {
            process.kill(pid, 0);
          } catch (err: any) {
            isAlive = err?.code === 'EPERM';
          }

          const freshPids = await this.executeFindRunningProcesses(target);
          const hasRunningProcess = isAlive || freshPids.length > 0;
          const confirmedPid = isAlive ? pid : freshPids[0] || pid;

          const key = this.getCanonicalAppKey(target);
          if (!this.trackedAppPids.has(key)) {
            this.trackedAppPids.set(key, new Set());
          }
          if (confirmedPid) {
            this.trackedAppPids.get(key)!.add(confirmedPid);
          }
          for (const p of freshPids) {
            this.trackedAppPids.get(key)!.add(p);
          }

          resolve({
            success: true,
            method: 'APPLICATION_LAUNCH',
            launchMethod: 'FRESH_LAUNCH',
            appName: target.appName,
            resolvedPath: execPath,
            processName: path.basename(execPath),
            pid: confirmedPid,
            pids: freshPids.length > 0 ? freshPids : [confirmedPid],
            verified: hasRunningProcess,
            verificationDetails: hasRunningProcess
              ? `Process verified active with OS PID ${confirmedPid}`
              : `Process spawned with PID ${pid}`,
            output: `Application "${target.appName}" started successfully (PID: ${confirmedPid})`,
          });
        }, 200);
      } catch (err: any) {
        resolve({
          success: false,
          method: 'APPLICATION_LAUNCH',
          launchMethod: 'FRESH_LAUNCH',
          appName: target.appName,
          resolvedPath: execPath,
          verified: false,
          verificationDetails: `Spawn error: ${err.message}`,
          output: `Error launching "${target.appName}": ${err.message}`,
          error: err.message,
        });
      }
    });
  }

  private findShortcutInDir(dir: string, searchTerm: string, depth = 0): string | null {
    if (depth > 2) return null;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        const itemLower = item.toLowerCase();

        if (stat.isFile() && itemLower.endsWith('.lnk')) {
          if (itemLower.includes(searchTerm)) {
            return fullPath;
          }
        } else if (stat.isDirectory()) {
          const found = this.findShortcutInDir(fullPath, searchTerm, depth + 1);
          if (found) return found;
        }
      }
    } catch {}
    return null;
  }
}

export const applicationResolver = new ApplicationResolver();
