import { describe, it, expect } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { applicationResolver } from '../../src/main/agent/application.resolver.js';
import { CreateDirectoryTool, FindFilesTool, ReadFileTool, KnownFoldersResolver } from '../../src/main/agent/tools/filesystem.tools.js';
import { SystemMetricsTool, SystemDiagnosticsTool, CheckSoftwareTool } from '../../src/main/agent/tools/system.tools.js';
import { TerminalExecuteTool } from '../../src/main/agent/tools/terminal.tools.js';
import { securityPolicyService } from '../../src/main/agent/security.policy.js';
import { toolRegistry } from '../../src/main/agent/tool.registry.js';
import { agentExecutor } from '../../src/main/agent/agent.executor.js';

describe('Agent Tools & Security Policy Suite', () => {
  agentExecutor.initializeDefaultTools();

  it('resolves real Windows system applications dynamically', () => {
    const notepad = applicationResolver.resolve('notepad');
    expect(notepad.found).toBe(true);

    const calc = applicationResolver.resolve('calculator');
    expect(calc.found).toBe(true);

    const nonExistent = applicationResolver.resolve('non_existent_app_xyz_123');
    expect(nonExistent.found).toBe(false);
  });

  it('resolves known folders taking OneDrive into account', () => {
    const desktop = KnownFoldersResolver.getKnownFolder('desktop');
    expect(desktop).toBeDefined();
    expect(typeof desktop).toBe('string');
    expect(fs.existsSync(desktop)).toBe(true);

    const downloads = KnownFoldersResolver.getKnownFolder('downloads');
    expect(fs.existsSync(downloads)).toBe(true);
  });

  it('creates and verifies real directories on filesystem safely', async () => {
    const testDirName = `jarvis_test_dir_${Date.now()}`;
    const testDir = path.join(os.tmpdir(), testDirName);
    const tool = new CreateDirectoryTool();

    const result = await tool.execute({ targetPath: testDir });
    expect(result.success).toBe(true);
    expect(result.status).toBe('COMPLETED');
    expect(result.evidence.verified).toBe(true);
    expect(fs.existsSync(testDir)).toBe(true);
    expect(fs.statSync(testDir).isDirectory()).toBe(true);

    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir);
    }
  });

  it('blocks path traversal into Windows protected system directories', () => {
    const check = securityPolicyService.isPathSafe('C:\\Windows\\System32\\config\\SAM');
    expect(check.safe).toBe(false);
  });

  it('collects live real-world system metrics and diagnostics', async () => {
    const metricsTool = new SystemMetricsTool();
    const metricsRes = await metricsTool.execute();
    expect(metricsRes.success).toBe(true);
    expect(metricsRes.status).toBe('COMPLETED');
    expect(metricsRes.evidence?.metrics).toBeDefined();

    const diagTool = new SystemDiagnosticsTool();
    const diagRes = await diagTool.execute();
    expect(diagRes.success).toBe(true);
    expect(diagRes.status).toBe('COMPLETED');
    expect(diagRes.output).toContain('JARVIS-X SYSTEM DIAGNOSTIC REPORT');
  });

  it('checks real installed software on system PATH', async () => {
    const swTool = new CheckSoftwareTool();

    // Node.js is running this test, so it is guaranteed to be installed
    const nodeRes = await swTool.execute({ softwareName: 'node' });
    expect(nodeRes.success).toBe(true);
    expect(nodeRes.status).toBe('COMPLETED');
    expect(nodeRes.evidence?.verified).toBe(true);
    expect(nodeRes.output).toContain('IS installed');

    // Fake software
    const fakeRes = await swTool.execute({ softwareName: 'fake_runtime_xyz' });
    expect(fakeRes.success).toBe(false);
    expect(fakeRes.status).toBe('FAILED');
    expect(fakeRes.evidence?.verified).toBe(false);
  });

  it('executes allowed terminal commands and blocks metacharacter injection', async () => {
    const termTool = new TerminalExecuteTool();

    const allowRes = await termTool.execute({ command: 'node', args: ['-v'] });
    expect(allowRes.success).toBe(true);
    expect(allowRes.status).toBe('COMPLETED');
    expect(allowRes.output).toContain('v');

    // Injection attempt with metacharacters
    const injectRes = await termTool.execute({ command: 'node', args: ['-v; whoami'] });
    expect(injectRes.success).toBe(false);
    expect(injectRes.status).toBe('BLOCKED');
    expect(injectRes.output).toContain('Security Alert');
  });

  it('contains registered tools in ToolRegistry', () => {
    const defs = toolRegistry.getAllDefinitions();
    expect(defs.length).toBeGreaterThanOrEqual(10);
    expect(defs.some((d) => d.name === 'application.launch')).toBe(true);
    expect(defs.some((d) => d.name === 'browser.open_url')).toBe(true);
    expect(defs.some((d) => d.name === 'system.get_metrics')).toBe(true);
  });
});
