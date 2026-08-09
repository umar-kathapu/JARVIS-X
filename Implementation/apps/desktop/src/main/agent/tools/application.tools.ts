import { IAgentTool, ToolDefinition, ToolExecutionResult } from '../agent.types.js';
import { applicationResolver } from '../application.resolver.js';

export class ApplicationLaunchTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'application.launch',
    description: 'Discovers and launches Windows desktop applications using multi-source discovery (PATH, Start Menu, Program Files) with fallback to browser for web-first apps',
    category: 'APPLICATION',
    parameters: [
      { name: 'appName', type: 'string', description: 'Application name (e.g. Chrome, VS Code, Instagram, WhatsApp)', required: true },
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

    // 1. Multi-source Resolution
    const resolved = applicationResolver.resolve(rawAppName);

    // 2. Launch Execution
    const launchResult = await applicationResolver.launch(resolved);

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
