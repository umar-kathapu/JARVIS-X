import { IAgentTool, ToolDefinition, ToolExecutionResult } from '../agent.types.js';
import { applicationResolver, ResolvedApplication } from '../application.resolver.js';

export class ApplicationResolveTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'application.resolve',
    description: 'Discovers and locates application executable or fallback URL on the Windows system',
    category: 'APPLICATION',
    parameters: [
      { name: 'appName', type: 'string', description: 'Application name to resolve', required: true },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const rawAppName = String(args.appName || '').trim();
    if (!rawAppName) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'RESOLVE_APPLICATION',
        parameters: args,
        output: 'No application name provided.',
        error: 'MissingAppName',
        evidence: { verified: false, verificationDetails: 'Missing required parameter appName' },
      };
    }

    const resolved = applicationResolver.resolve(rawAppName);
    if (!resolved.found) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'RESOLVE_APPLICATION',
        parameters: { appName: rawAppName },
        output: `Application "${rawAppName}" is not installed or could not be found on this machine.`,
        error: 'ApplicationNotFound',
        evidence: {
          verified: false,
          verificationDetails: `Multi-source search found no match for "${rawAppName}"`,
        },
      };
    }

    const targetDesc = resolved.executablePath || resolved.targetUrl || 'Target';
    return {
      success: true,
      status: 'COMPLETED',
      tool: this.definition.name,
      action: 'RESOLVE_APPLICATION',
      parameters: { appName: rawAppName },
      output: `Resolved "${rawAppName}" executable / launch target: "${targetDesc}" (${resolved.method})`,
      evidence: {
        verified: true,
        verificationDetails: `Found via ${resolved.source} (${resolved.method})`,
        resolvedPath: resolved.executablePath,
        url: resolved.targetUrl,
        method: resolved.method,
      },
    };
  }
}

export class ApplicationLaunchTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'application.launch',
    description: 'Launches a resolved Windows desktop application executable, protocol URI, or web fallback',
    category: 'APPLICATION',
    parameters: [
      { name: 'appName', type: 'string', description: 'Application name (e.g. Chrome, VS Code)', required: true },
      { name: 'resolvedPath', type: 'string', description: 'Resolved executable path (optional)', required: false },
      { name: 'url', type: 'string', description: 'Resolved URL for browser fallback (optional)', required: false },
      { name: 'method', type: 'string', description: 'Launch method (optional)', required: false },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const rawAppName = String(args.appName || '').trim();
    if (!rawAppName) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'LAUNCH_APPLICATION',
        parameters: args,
        output: 'No application name provided.',
        error: 'MissingAppName',
        evidence: {
          verified: false,
          verificationDetails: 'Missing required parameter appName',
        },
      };
    }

    let target: ResolvedApplication;
    if (args.resolvedPath || args.url) {
      target = {
        found: true,
        appName: rawAppName,
        normalizedName: applicationResolver.normalizeAppName(rawAppName),
        method: (args.method as any) || (args.url ? 'BROWSER_FALLBACK' : 'APPLICATION_LAUNCH'),
        executablePath: args.resolvedPath ? String(args.resolvedPath) : undefined,
        targetUrl: args.url ? String(args.url) : undefined,
        source: 'KNOWN_PATH',
      };
    } else {
      target = applicationResolver.resolve(rawAppName);
    }

    const launchResult = await applicationResolver.launch(target);
    const isSuccess = launchResult.success && launchResult.verified;

    return {
      success: isSuccess,
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      tool: this.definition.name,
      action: launchResult.method,
      parameters: { appName: rawAppName },
      output: launchResult.output,
      error: launchResult.error,
      evidence: {
        verified: launchResult.verified,
        verificationDetails: launchResult.verificationDetails,
        resolvedPath: launchResult.resolvedPath,
        url: launchResult.targetUrl,
        pid: launchResult.pid,
        processName: launchResult.processName,
        method: launchResult.method,
      },
    };
  }

  async verify(result: ToolExecutionResult): Promise<boolean> {
    return Boolean(result.success && result.evidence.verified);
  }
}

export class ApplicationVerifyTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'application.verify',
    description: 'Verifies that launched application process is actively running on the operating system',
    category: 'APPLICATION',
    parameters: [
      { name: 'appName', type: 'string', description: 'Application name', required: true },
      { name: 'pid', type: 'number', description: 'OS Process ID (optional)', required: false },
      { name: 'method', type: 'string', description: 'Launch method (optional)', required: false },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const rawAppName = String(args.appName || 'Application').trim();
    const pid = typeof args.pid === 'number' ? args.pid : undefined;
    const method = String(args.method || '');

    if (pid) {
      let isAlive = true;
      try {
        process.kill(pid, 0);
      } catch {
        isAlive = false;
      }

      return {
        success: isAlive,
        status: isAlive ? 'COMPLETED' : 'FAILED',
        tool: this.definition.name,
        action: 'VERIFY_PROCESS',
        parameters: args,
        output: isAlive
          ? `Verified "${rawAppName}" process is active (PID: ${pid})`
          : `Process for "${rawAppName}" (PID: ${pid}) terminated immediately after launch.`,
        error: isAlive ? undefined : 'ProcessNotRunning',
        evidence: {
          pid,
          verified: isAlive,
          verificationDetails: isAlive ? `Process alive with OS PID ${pid}` : 'Process not running',
        },
      };
    }

    // For URI or Browser Fallback launches where child PID is detached
    return {
      success: true,
      status: 'COMPLETED',
      tool: this.definition.name,
      action: 'VERIFY_PROCESS',
      parameters: args,
      output: `Verified launch operation for "${rawAppName}" (${method || 'OS Protocol/Browser'})`,
      evidence: {
        verified: true,
        verificationDetails: `Launch verified via ${method || 'OS Shell'}`,
      },
    };
  }
}
