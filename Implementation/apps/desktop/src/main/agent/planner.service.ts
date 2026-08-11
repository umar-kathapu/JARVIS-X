import {
  ParsedGoalIntent,
  AgentExecutionPlan,
  PlanStep,
  IntentType,
  ExtractedEntities,
} from './agent.types.js';
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
        steps.push(
          {
            stepId: 'step_1',
            stepNumber: 1,
            description: `Resolve executable path or launch target for "${appName}"`,
            toolName: 'application.resolve',
            toolArgs: { appName },
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
          {
            stepId: 'step_2',
            stepNumber: 2,
            description: `Launch application "${appName}" on operating system`,
            toolName: 'application.launch',
            toolArgs: { appName },
            dependsOn: [1],
            securityLevel: securityPolicyService.evaluateSecurityLevel('application.launch', { appName }),
            status: 'PENDING',
          },
          {
            stepId: 'step_3',
            stepNumber: 3,
            description: `Verify that "${appName}" process is active on system`,
            toolName: 'application.verify',
            toolArgs: { appName },
            dependsOn: [2],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
        break;
      }

      case 'CREATE_DIRECTORY': {
        const folderName = entities.folderName || 'NewFolder';
        const targetPath = entities.path || folderName;
        steps.push(
          {
            stepId: 'step_1',
            stepNumber: 1,
            description: `Resolve target directory path for "${folderName}" and check security policy`,
            toolName: 'filesystem.resolve_path',
            toolArgs: { targetPath, baseFolder: 'desktop' },
            securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.create_directory', { targetPath }),
            status: 'PENDING',
          },
          {
            stepId: 'step_2',
            stepNumber: 2,
            description: `Check whether directory "${folderName}" already exists on disk`,
            toolName: 'filesystem.check_exists',
            toolArgs: { targetPath },
            dependsOn: [1],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
          {
            stepId: 'step_3',
            stepNumber: 3,
            description: `Create directory "${folderName}" on filesystem`,
            toolName: 'filesystem.create_directory',
            toolArgs: { targetPath, baseFolder: 'desktop' },
            dependsOn: [2],
            securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.create_directory', { targetPath }),
            status: 'PENDING',
          },
          {
            stepId: 'step_4',
            stepNumber: 4,
            description: `Verify directory exists and is a valid folder on disk`,
            toolName: 'filesystem.verify_directory',
            toolArgs: { targetPath },
            dependsOn: [3],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
        break;
      }

      case 'SCREEN_CAPTURE': {
        steps.push(
          {
            stepId: 'step_1',
            stepNumber: 1,
            description: 'Capture primary Windows display and generate PNG screenshot',
            toolName: 'screen.capture',
            toolArgs: {},
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
          {
            stepId: 'step_2',
            stepNumber: 2,
            description: 'Verify screenshot PNG file existence, size, and header signature on disk',
            toolName: 'screen.verify',
            toolArgs: {},
            dependsOn: [1],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
        break;
      }

      case 'SYSTEM_DIAGNOSTICS': {
        steps.push(
          {
            stepId: 'step_1',
            stepNumber: 1,
            description: 'Query live CPU, RAM, and platform telemetry from OS subsystem',
            toolName: 'system.get_metrics',
            toolArgs: {},
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
          {
            stepId: 'step_2',
            stepNumber: 2,
            description: 'Generate comprehensive system diagnostic health report',
            toolName: 'system.run_diagnostics',
            toolArgs: {},
            dependsOn: [1],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
        break;
      }

      case 'SYSTEM_METRICS': {
        steps.push({
          stepId: 'step_1',
          stepNumber: 1,
          description: 'Collect live CPU, RAM, and platform telemetry',
          toolName: 'system.get_metrics',
          toolArgs: {},
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'CHECK_SOFTWARE': {
        const softwareName = entities.softwareName || 'node';
        steps.push({
          stepId: 'step_1',
          stepNumber: 1,
          description: `Check if "${softwareName}" is installed on system PATH`,
          toolName: 'system.check_software',
          toolArgs: { softwareName },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'SEARCH_FILES': {
        const searchDir = entities.path || 'Downloads';
        const pattern = entities.filePattern || '*';
        const isLargest = parsed.rawGoal.toLowerCase().includes('largest');
        steps.push(
          {
            stepId: 'step_1',
            stepNumber: 1,
            description: `Resolve search target directory "${searchDir}" and check safety policy`,
            toolName: 'filesystem.resolve_path',
            toolArgs: { targetPath: searchDir, baseFolder: 'downloads' },
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
          {
            stepId: 'step_2',
            stepNumber: 2,
            description: `Scan and filter files matching "${pattern}" in "${searchDir}"`,
            toolName: 'filesystem.find_files',
            toolArgs: { searchDir, pattern, sortByLargest: isLargest },
            dependsOn: [1],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
        break;
      }

      case 'READ_FILE': {
        const filePath = entities.path || parsed.rawGoal;
        steps.push(
          {
            stepId: 'step_1',
            stepNumber: 1,
            description: `Resolve file path "${filePath}" and check safety policy`,
            toolName: 'filesystem.resolve_path',
            toolArgs: { targetPath: filePath },
            securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.read_file', { filePath }),
            status: 'PENDING',
          },
          {
            stepId: 'step_2',
            stepNumber: 2,
            description: `Read text content from file "${filePath}"`,
            toolName: 'filesystem.read_file',
            toolArgs: { filePath },
            dependsOn: [1],
            securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.read_file', { filePath }),
            status: 'PENDING',
          },
        );
        break;
      }

      case 'SEARCH_WEB': {
        const query = entities.searchQuery || parsed.rawGoal;
        steps.push({
          stepId: 'step_1',
          stepNumber: 1,
          description: `Search web for "${query}" in default browser`,
          toolName: 'browser.search_web',
          toolArgs: { query },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'OPEN_URL': {
        const url = entities.url || 'https://www.google.com';
        steps.push({
          stepId: 'step_1',
          stepNumber: 1,
          description: `Open browser and navigate to ${url}`,
          toolName: 'browser.open_url',
          toolArgs: { url },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'COMPOSITE_COMMAND': {
        const subGoals = entities.subGoals || [];
        let currentStepNum = 1;

        for (const sub of subGoals) {
          const subPlan = this.createPlan({
            rawGoal: parsed.rawGoal,
            primaryIntent: sub.intent,
            entities: sub.entities,
            confidence: 0.9,
          });

          const stepOffset = currentStepNum - 1;
          for (const s of subPlan.steps) {
            steps.push({
              ...s,
              stepId: `step_${currentStepNum}`,
              stepNumber: currentStepNum,
              dependsOn: s.dependsOn
                ? s.dependsOn.map((d) => d + stepOffset)
                : currentStepNum > 1
                  ? [currentStepNum - 1]
                  : undefined,
            });
            currentStepNum++;
          }
        }
        break;
      }

      case 'TERMINAL_COMMAND': {
        const command = entities.command || 'git';
        const args = entities.commandArgs || ['status'];
        steps.push({
          stepId: 'step_1',
          stepNumber: 1,
          description: `Execute sandboxed terminal command: "${command} ${args.join(' ')}"`,
          toolName: 'terminal.execute',
          toolArgs: { command, args },
          securityLevel: securityPolicyService.evaluateSecurityLevel('terminal.execute', { command, args }),
          status: 'PENDING',
        });
        break;
      }

      case 'CLIPBOARD_WRITE': {
        const text = entities.text || parsed.rawGoal;
        steps.push({
          stepId: 'step_1',
          stepNumber: 1,
          description: 'Write text to system clipboard',
          toolName: 'clipboard.write',
          toolArgs: { text },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'CLIPBOARD_READ': {
        steps.push({
          stepId: 'step_1',
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
          stepId: 'step_1',
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
          stepId: 'step_1',
          stepNumber: 1,
          description: 'Scan music library and index audio files',
          toolName: 'music.scan',
          toolArgs: { dirPath },
          securityLevel: 'SAFE',
          status: 'PENDING',
        });
        break;
      }

      case 'UNSUPPORTED_CAPABILITY': {
        // Explicitly unfulfillable command
        return {
          goalId,
          rawGoal: parsed.rawGoal,
          intent: 'UNSUPPORTED_CAPABILITY',
          steps: [],
          status: 'FAILED',
          createdAt: Date.now(),
        };
      }

      default: {
        // Fallback: try application launch as single step
        steps.push(
          {
            stepId: 'step_1',
            stepNumber: 1,
            description: `Resolve executable or launch target for "${parsed.rawGoal}"`,
            toolName: 'application.resolve',
            toolArgs: { appName: parsed.rawGoal },
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
          {
            stepId: 'step_2',
            stepNumber: 2,
            description: `Launch application "${parsed.rawGoal}"`,
            toolName: 'application.launch',
            toolArgs: { appName: parsed.rawGoal },
            dependsOn: [1],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
        break;
      }
    }

    const sanitizedSteps: PlanStep[] = steps.map((s, idx) => ({
      ...s,
      stepId: s.stepId || `step_${idx + 1}`,
      stepNumber: idx + 1,
      tool: s.tool || s.toolName,
      toolName: s.toolName || s.tool,
      input: s.input || { ...s.toolArgs },
      toolArgs: s.toolArgs || s.input || {},
    }));

    return {
      goalId,
      rawGoal: parsed.rawGoal,
      intent,
      steps: sanitizedSteps,
      status: 'PENDING',
      createdAt: Date.now(),
    };
  }
}

export const dynamicTaskPlanner = new DynamicTaskPlanner();
