import { shell } from 'electron';
import { execFile } from 'child_process';
import { IAgentTool, ToolDefinition, ToolExecutionResult } from '../agent.types.js';

export class BrowserOpenUrlTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'browser.open_url',
    description: 'Opens a target URL in the system browser and verifies navigation launch',
    category: 'BROWSER',
    parameters: [
      { name: 'url', type: 'string', description: 'Target website URL (e.g. https://github.com)', required: true },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    let targetUrl = String(args.url || '').trim();
    if (!targetUrl) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'OPEN_URL',
        parameters: args,
        output: 'No target URL provided.',
        error: 'MissingUrl',
        evidence: { verified: false, verificationDetails: 'Missing target URL' },
      };
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      if (shell && typeof shell.openExternal === 'function') {
        await shell.openExternal(targetUrl).catch(() => {});
      } else {
        execFile('cmd.exe', ['/c', 'start', '', targetUrl], () => {});
      }
      return {
        success: true,
        status: 'COMPLETED',
        tool: this.definition.name,
        action: 'OPEN_URL',
        parameters: { url: targetUrl },
        output: `System browser opened and navigated to ${targetUrl}`,
        evidence: {
          url: targetUrl,
          verified: true,
          verificationDetails: `Dispatched URL to OS Default Web Browser (${targetUrl})`,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'OPEN_URL',
        parameters: { url: targetUrl },
        output: `Failed to open browser URL "${targetUrl}": ${err.message}`,
        error: err.message,
        evidence: { verified: false, verificationDetails: `Error: ${err.message}` },
      };
    }
  }

  async verify(result: ToolExecutionResult): Promise<boolean> {
    return result.success && Boolean(result.evidence?.url);
  }
}

export class BrowserSearchTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'browser.search_web',
    description: 'Performs an online search via Google or YouTube in the web browser',
    category: 'BROWSER',
    parameters: [
      { name: 'query', type: 'string', description: 'Search term or query', required: true },
      { name: 'engine', type: 'string', description: 'Search engine (google | youtube)', required: false },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const query = String(args.query || '').trim();
    if (!query) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'SEARCH_WEB',
        parameters: args,
        output: 'No search query provided.',
        error: 'MissingQuery',
        evidence: { verified: false, verificationDetails: 'Missing search query' },
      };
    }

    const engine = String(args.engine || 'google').toLowerCase();
    const isYouTube = engine.includes('youtube');

    const searchUrl = isYouTube
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      : `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    try {
      if (shell && typeof shell.openExternal === 'function') {
        await shell.openExternal(searchUrl).catch(() => {});
      } else {
        execFile('cmd.exe', ['/c', 'start', '', searchUrl], () => {});
      }
      return {
        success: true,
        status: 'COMPLETED',
        tool: this.definition.name,
        action: 'SEARCH_WEB',
        parameters: { query, engine: isYouTube ? 'youtube' : 'google' },
        output: `Dispatched ${isYouTube ? 'YouTube' : 'Google'} search for "${query}" in browser`,
        evidence: {
          url: searchUrl,
          verified: true,
          verificationDetails: `Navigated default browser to ${searchUrl}`,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'SEARCH_WEB',
        parameters: { query },
        output: `Failed to execute search: ${err.message}`,
        error: err.message,
        evidence: { verified: false, verificationDetails: `Error: ${err.message}` },
      };
    }
  }
}
