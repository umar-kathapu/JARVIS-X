import {
  ParsedGoalIntent,
  AgentExecutionPlan,
  PlanStep,
} from './agent.types.js';
import { toolRegistry } from './tool.registry.js';
import { securityPolicyService } from './security.policy.js';

export class DynamicTaskPlanner {
  /**
   * Dynamically creates a customized execution plan based on the parsed intent and available tools
   */
  createPlan(parsed: ParsedGoalIntent): AgentExecutionPlan {
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const steps: PlanStep[] = [];
    const intent = parsed.primaryIntent;
    const entities = parsed.entities;

    switch (intent) {
      case 'OPEN_APPLICATION': {
        const appName = entities.appName || 'Application';
        steps.push({
          stepNumber: 1,
          description: `Resolve and launch application "${appName}"`,
          toolName: 'application.launch',
          toolArgs: { appName },
          securityLevel: securityPolicyService.evaluateSecurityLevel('application.launch', { appName }),
          status: 'PENDING',
        });
        break;
      }

      case 'OPEN_URL': {
        const url = entities.url || 'https://www.google.com';
        steps.push({
          stepNumber: 1,
          description: `Open browser and navigate to ${url}`,
          toolName: 'browser.open_url',
          toolArgs: { url },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'SEARCH_WEB': {
        const query = entities.searchQuery || parsed.rawGoal;
        steps.push({
          stepNumber: 1,
          description: `Search web for "${query}" in browser`,
          toolName: 'browser.search_web',
          toolArgs: { query },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'CREATE_DIRECTORY': {
        const targetPath = entities.path || entities.folderName || 'NewFolder';
        steps.push({
          stepNumber: 1,
          description: `Create directory "${targetPath}" on filesystem`,
          toolName: 'filesystem.create_directory',
          toolArgs: { targetPath },
          securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.create_directory', { targetPath }),
          status: 'PENDING',
        });
        break;
      }

      case 'SEARCH_FILES': {
        const searchDir = entities.path || '';
        const pattern = entities.filePattern || '*';
        const isLargest = parsed.rawGoal.toLowerCase().includes('largest');
        steps.push({
          stepNumber: 1,
          description: `Search for ${pattern} files in "${searchDir || 'directory'}"`,
          toolName: 'filesystem.find_files',
          toolArgs: { searchDir, pattern, sortByLargest: isLargest },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'READ_FILE': {
        const filePath = entities.path || parsed.rawGoal;
        steps.push({
          stepNumber: 1,
          description: `Read text file "${filePath}"`,
          toolName: 'filesystem.read_file',
          toolArgs: { filePath },
          securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.read_file', { filePath }),
          status: 'PENDING',
        });
        break;
      }

      case 'SYSTEM_METRICS': {
        steps.push({
          stepNumber: 1,
          description: 'Collect live CPU, RAM, and platform telemetry',
          toolName: 'system.get_metrics',
          toolArgs: {},
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'SYSTEM_DIAGNOSTICS': {
        steps.push(
          {
            stepNumber: 1,
            description: 'Query live CPU and memory metrics',
            toolName: 'system.get_metrics',
            toolArgs: {},
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
          {
            stepNumber: 2,
            description: 'Generate comprehensive system diagnostic health report',
            toolName: 'system.run_diagnostics',
            toolArgs: {},
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
        break;
      }

      case 'CHECK_SOFTWARE': {
        const softwareName = entities.softwareName || 'node';
        steps.push({
          stepNumber: 1,
          description: `Check if "${softwareName}" is installed on system PATH`,
          toolName: 'system.check_software',
          toolArgs: { softwareName },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'TERMINAL_COMMAND': {
        const command = entities.command || 'git';
        const args = entities.commandArgs || ['status'];
        steps.push({
          stepNumber: 1,
          description: `Execute sandboxed terminal command: "${command} ${args.join(' ')}"`,
          toolName: 'terminal.execute',
          toolArgs: { command, args },
          securityLevel: securityPolicyService.evaluateSecurityLevel('terminal.execute', { command, args }),
          status: 'PENDING',
        });
        break;
      }

      case 'SCREEN_CAPTURE': {
        steps.push({
          stepNumber: 1,
          description: 'Capture screenshot of primary display',
          toolName: 'screen.capture',
          toolArgs: {},
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'CLIPBOARD_WRITE': {
        const text = entities.text || parsed.rawGoal;
        steps.push({
          stepNumber: 1,
          description: `Write text to system clipboard`,
          toolName: 'clipboard.write',
          toolArgs: { text },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'CLIPBOARD_READ': {
        steps.push({
          stepNumber: 1,
          description: 'Read current content from system clipboard',
          toolName: 'clipboard.read',
          toolArgs: {},
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'NOTIFICATION': {
        const title = entities.notificationTitle || 'JARVIS-X Agent';
        const body = entities.notificationBody || parsed.rawGoal;
        steps.push({
          stepNumber: 1,
          description: `Dispatch native desktop notification: "${title}"`,
          toolName: 'notification.send',
          toolArgs: { title, body },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'MUSIC_LIBRARY_SCAN': {
        const dirPath = entities.path;
        steps.push({
          stepNumber: 1,
          description: 'Scan music library and index audio files',
          toolName: 'music.scan',
          toolArgs: { dirPath },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      default: {
        // Dynamic generic fallback: attempt application launch or web search
        steps.push({
          stepNumber: 1,
          description: `Attempt to resolve application or command for "${parsed.rawGoal}"`,
          toolName: 'application.launch',
          toolArgs: { appName: parsed.rawGoal },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }
    }

    return {
      goalId,
      rawGoal: parsed.rawGoal,
      intent,
      steps,
      status: 'PENDING',
      createdAt: Date.now(),
    };
  }
}

export const dynamicTaskPlanner = new DynamicTaskPlanner();
