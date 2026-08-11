import { IntentType, ParsedGoalIntent, SecurityLevel } from './agent.types.js';
import { securityPolicyService } from './security.policy.js';
import { nluService } from './nlu.service.js';
import { WorkflowInstance, WorkflowStep } from './workflow.types.js';

export class WorkflowPlanner {
  /**
   * Generates a fully typed DAG workflow instance with explicit dependencies
   */
  planWorkflow(goalOrParsed: string | ParsedGoalIntent): WorkflowInstance {
    const parsed: ParsedGoalIntent =
      typeof goalOrParsed === 'string' ? nluService.parseGoal(goalOrParsed) : goalOrParsed;

    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const rawGoal = parsed.rawGoal;
    const lower = rawGoal.toLowerCase();
    const steps: WorkflowStep[] = [];
    let intent: IntentType = parsed.primaryIntent;

    // 1. Specialized Multi-Step Macro Workflows
    if (lower.includes('prepare') && (lower.includes('desktop') || lower.includes('workspace') || lower.includes('coding'))) {
      intent = 'COMPOSITE_COMMAND';
      this.buildCodingWorkspaceWorkflow(steps);
    } else if (lower.includes('screenshot') && lower.includes('folder')) {
      intent = 'COMPOSITE_COMMAND';
      this.buildScreenshotAndFolderWorkflow(steps, rawGoal);
    } else if (
      (lower.includes('git') || lower.includes('python')) &&
      (lower.includes('vs code') || lower.includes('vscode')) &&
      (lower.includes('health') || lower.includes('diagnostic'))
    ) {
      intent = 'COMPOSITE_COMMAND';
      this.buildDevEnvironmentAndDiagnosticsWorkflow(steps);
    } else if (
      lower.includes('git') &&
      lower.includes('python') &&
      (lower.includes('check') || lower.includes('installed'))
    ) {
      intent = 'CHECK_SOFTWARE';
      this.buildMultiSoftwareCheckWorkflow(steps, ['git', 'python']);
    } else if (
      lower.includes('and then') ||
      lower.includes(' and take a screenshot') ||
      (lower.includes('read ') && lower.includes(' and '))
    ) {
      intent = 'COMPOSITE_COMMAND';
      this.buildSequentialCompoundWorkflow(steps, rawGoal);
    } else {
      // 2. Standard Intent-to-DAG Mappings
      this.buildStandardIntentWorkflow(steps, parsed);
    }

    // Ensure all steps have default statuses and valid security policies
    const finalSteps: WorkflowStep[] = steps.map((s, idx) => {
      const stepId = s.stepId || `step_${idx + 1}`;
      const secLevel =
        s.securityLevel || securityPolicyService.evaluateSecurityLevel(s.tool, s.input);
      return {
        ...s,
        stepId,
        securityLevel: secLevel,
        status: s.dependencies && s.dependencies.length > 0 ? 'PENDING' : 'READY',
        retryCount: 0,
        maxRetries: s.maxRetries ?? (s.retryable ? 1 : 0),
      };
    });

    return {
      workflowId,
      originalGoal: rawGoal,
      intent,
      status: 'PENDING',
      createdAt: Date.now(),
      steps: finalSteps,
    };
  }

  private buildCodingWorkspaceWorkflow(steps: WorkflowStep[]): void {
    steps.push(
      {
        stepId: 'step_1',
        description: 'Check whether Git version control is installed',
        intent: 'CHECK_SOFTWARE',
        tool: 'system.check_software',
        input: { softwareName: 'git' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
        retryable: false,
      },
      {
        stepId: 'step_2',
        description: 'Check whether Python runtime is installed',
        intent: 'CHECK_SOFTWARE',
        tool: 'system.check_software',
        input: { softwareName: 'python' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
        retryable: false,
      },
      {
        stepId: 'step_3',
        description: 'Resolve executable path for VS Code',
        intent: 'OPEN_APPLICATION',
        tool: 'application.resolve',
        input: { appName: 'VS Code' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
        retryable: false,
      },
      {
        stepId: 'step_4',
        description: 'Launch VS Code development editor',
        intent: 'OPEN_APPLICATION',
        tool: 'application.launch',
        input: { appName: 'VS Code' },
        dependencies: ['step_3'],
        securityLevel: 'SAFE',
        status: 'PENDING',
        retryable: true,
        maxRetries: 1,
      },
      {
        stepId: 'step_5',
        description: 'Verify VS Code editor process is active',
        intent: 'OPEN_APPLICATION',
        tool: 'application.verify',
        input: { appName: 'VS Code' },
        dependencies: ['step_4'],
        securityLevel: 'SAFE',
        status: 'PENDING',
        retryable: false,
      },
      {
        stepId: 'step_6',
        description: 'Resolve path for workspace directory "JARVIS-Coding-Workspace" on Desktop',
        intent: 'CREATE_DIRECTORY',
        tool: 'filesystem.resolve_path',
        input: { targetPath: 'JARVIS-Coding-Workspace', baseFolder: 'desktop' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
        retryable: false,
      },
      {
        stepId: 'step_7',
        description: 'Create directory "JARVIS-Coding-Workspace" on filesystem',
        intent: 'CREATE_DIRECTORY',
        tool: 'filesystem.create_directory',
        input: { targetPath: 'JARVIS-Coding-Workspace', baseFolder: 'desktop' },
        dependencies: ['step_6'],
        securityLevel: 'SAFE',
        status: 'PENDING',
        retryable: false,
      },
      {
        stepId: 'step_8',
        description: 'Verify workspace folder exists on disk',
        intent: 'CREATE_DIRECTORY',
        tool: 'filesystem.verify_directory',
        input: { targetPath: 'JARVIS-Coding-Workspace' },
        dependencies: ['step_7'],
        securityLevel: 'SAFE',
        status: 'PENDING',
        retryable: false,
      },
    );
  }

  private buildScreenshotAndFolderWorkflow(steps: WorkflowStep[], rawGoal: string): void {
    const folderMatch = rawGoal.match(/folder\s+(?:called\s+|named\s+)?([a-zA-Z0-9_-]+)/i);
    const folderName = folderMatch ? folderMatch[1] : 'JARVIS-Screenshots';

    steps.push(
      {
        stepId: 'step_1',
        description: 'Capture primary Windows display and generate PNG screenshot',
        intent: 'SCREEN_CAPTURE',
        tool: 'screen.capture',
        input: {},
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
        retryable: true,
        maxRetries: 1,
      },
      {
        stepId: 'step_2',
        description: 'Verify screenshot PNG file on disk',
        intent: 'SCREEN_CAPTURE',
        tool: 'screen.verify',
        input: {},
        dependencies: ['step_1'],
        securityLevel: 'SAFE',
        status: 'PENDING',
        retryable: false,
      },
      {
        stepId: 'step_3',
        description: `Resolve target directory path for "${folderName}" on Desktop`,
        intent: 'CREATE_DIRECTORY',
        tool: 'filesystem.resolve_path',
        input: { targetPath: folderName, baseFolder: 'desktop' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
        retryable: false,
      },
      {
        stepId: 'step_4',
        description: `Create directory "${folderName}" on filesystem`,
        intent: 'CREATE_DIRECTORY',
        tool: 'filesystem.create_directory',
        input: { targetPath: folderName, baseFolder: 'desktop' },
        dependencies: ['step_3'],
        securityLevel: 'SAFE',
        status: 'PENDING',
        retryable: false,
      },
      {
        stepId: 'step_5',
        description: `Verify directory "${folderName}" exists on disk`,
        intent: 'CREATE_DIRECTORY',
        tool: 'filesystem.verify_directory',
        input: { targetPath: folderName },
        dependencies: ['step_4'],
        securityLevel: 'SAFE',
        status: 'PENDING',
        retryable: false,
      },
    );
  }

  private buildDevEnvironmentAndDiagnosticsWorkflow(steps: WorkflowStep[]): void {
    steps.push(
      {
        stepId: 'step_1',
        description: 'Check whether Git is installed on system',
        intent: 'CHECK_SOFTWARE',
        tool: 'system.check_software',
        input: { softwareName: 'git' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
      },
      {
        stepId: 'step_2',
        description: 'Check whether Python is installed on system',
        intent: 'CHECK_SOFTWARE',
        tool: 'system.check_software',
        input: { softwareName: 'python' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
      },
      {
        stepId: 'step_3',
        description: 'Resolve executable path for VS Code',
        intent: 'OPEN_APPLICATION',
        tool: 'application.resolve',
        input: { appName: 'VS Code' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
      },
      {
        stepId: 'step_4',
        description: 'Launch application VS Code',
        intent: 'OPEN_APPLICATION',
        tool: 'application.launch',
        input: { appName: 'VS Code' },
        dependencies: ['step_3'],
        securityLevel: 'SAFE',
        status: 'PENDING',
        retryable: true,
      },
      {
        stepId: 'step_5',
        description: 'Verify VS Code process is active',
        intent: 'OPEN_APPLICATION',
        tool: 'application.verify',
        input: { appName: 'VS Code' },
        dependencies: ['step_4'],
        securityLevel: 'SAFE',
        status: 'PENDING',
      },
      {
        stepId: 'step_6',
        description: 'Query live system CPU and memory metrics',
        intent: 'SYSTEM_METRICS',
        tool: 'system.get_metrics',
        input: {},
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
      },
      {
        stepId: 'step_7',
        description: 'Compile comprehensive system diagnostic health report',
        intent: 'SYSTEM_DIAGNOSTICS',
        tool: 'system.run_diagnostics',
        input: {},
        dependencies: ['step_6'],
        securityLevel: 'SAFE',
        status: 'PENDING',
      },
    );
  }

  private buildMultiSoftwareCheckWorkflow(steps: WorkflowStep[], softwareList: string[]): void {
    softwareList.forEach((sw, idx) => {
      steps.push({
        stepId: `step_${idx + 1}`,
        description: `Check whether ${sw} is installed on system PATH`,
        intent: 'CHECK_SOFTWARE',
        tool: 'system.check_software',
        input: { softwareName: sw },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'READY',
      });
    });
  }

  private buildSequentialCompoundWorkflow(steps: WorkflowStep[], rawGoal: string): void {
    const parts = rawGoal.split(/\s+and\s+then\s+|\s+and\s+(?:then\s+)?/i);

    let stepIndex = 1;
    for (const part of parts) {
      const partParsed = nluService.parseGoal(part.trim());

      if (partParsed.primaryIntent === 'OPEN_APPLICATION') {
        const appName = partParsed.entities.appName || 'Application';
        const s1 = `step_${stepIndex++}`;
        const s2 = `step_${stepIndex++}`;
        const s3 = `step_${stepIndex++}`;
        steps.push(
          {
            stepId: s1,
            description: `Resolve executable path for "${appName}"`,
            intent: 'OPEN_APPLICATION',
            tool: 'application.resolve',
            input: { appName },
            dependencies: [],
            securityLevel: 'SAFE',
            status: 'READY',
          },
          {
            stepId: s2,
            description: `Launch application "${appName}"`,
            intent: 'OPEN_APPLICATION',
            tool: 'application.launch',
            input: { appName },
            dependencies: [s1],
            securityLevel: securityPolicyService.evaluateSecurityLevel('application.launch', { appName }),
            status: 'PENDING',
            retryable: true,
          },
          {
            stepId: s3,
            description: `Verify "${appName}" process is active`,
            intent: 'OPEN_APPLICATION',
            tool: 'application.verify',
            input: { appName },
            dependencies: [s2],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
      } else if (partParsed.primaryIntent === 'SCREEN_CAPTURE') {
        const s1 = `step_${stepIndex++}`;
        const s2 = `step_${stepIndex++}`;
        steps.push(
          {
            stepId: s1,
            description: 'Capture primary Windows display and generate PNG screenshot',
            intent: 'SCREEN_CAPTURE',
            tool: 'screen.capture',
            input: {},
            dependencies: [],
            securityLevel: 'SAFE',
            status: 'READY',
            retryable: true,
          },
          {
            stepId: s2,
            description: 'Verify screenshot PNG file on disk',
            intent: 'SCREEN_CAPTURE',
            tool: 'screen.verify',
            input: {},
            dependencies: [s1],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
      } else if (partParsed.primaryIntent === 'READ_FILE') {
        const filePath = partParsed.entities.path || partParsed.entities.fileName || '';
        const s1 = `step_${stepIndex++}`;
        steps.push({
          stepId: s1,
          description: `Read text file content from "${filePath}"`,
          intent: 'READ_FILE',
          tool: 'filesystem.read_file',
          input: { filePath },
          dependencies: [],
          securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.read_file', { filePath }),
          status: 'READY',
        });
      } else if (partParsed.primaryIntent === 'CREATE_DIRECTORY') {
        const folderName = partParsed.entities.folderName || 'NewFolder';
        const targetPath = partParsed.entities.path || folderName;
        const s1 = `step_${stepIndex++}`;
        const s2 = `step_${stepIndex++}`;
        const s3 = `step_${stepIndex++}`;
        steps.push(
          {
            stepId: s1,
            description: `Resolve target directory path for "${folderName}" and check security policy`,
            intent: 'CREATE_DIRECTORY',
            tool: 'filesystem.resolve_path',
            input: { targetPath, baseFolder: 'desktop' },
            dependencies: [],
            securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.create_directory', { targetPath }),
            status: 'READY',
          },
          {
            stepId: s2,
            description: `Create directory "${folderName}" on filesystem`,
            intent: 'CREATE_DIRECTORY',
            tool: 'filesystem.create_directory',
            input: { targetPath, baseFolder: 'desktop' },
            dependencies: [s1],
            securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.create_directory', { targetPath }),
            status: 'PENDING',
          },
          {
            stepId: s3,
            description: `Verify directory "${folderName}" exists on disk`,
            intent: 'CREATE_DIRECTORY',
            tool: 'filesystem.verify_directory',
            input: { targetPath },
            dependencies: [s2],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
      } else {
        const s1 = `step_${stepIndex++}`;
        steps.push({
          stepId: s1,
          description: `Execute action for "${part.trim()}"`,
          intent: partParsed.primaryIntent,
          tool: 'system.get_metrics',
          input: {},
          dependencies: [],
          securityLevel: 'SAFE',
          status: 'READY',
        });
      }
    }
  }

  private buildStandardIntentWorkflow(steps: WorkflowStep[], parsed: ParsedGoalIntent): void {
    const intent = parsed.primaryIntent;
    const entities = parsed.entities;

    switch (intent) {
      case 'OPEN_APPLICATION': {
        const appName = entities.appName || 'Application';
        steps.push(
          {
            stepId: 'step_1',
            description: `Resolve executable path or launch target for "${appName}"`,
            intent: 'OPEN_APPLICATION',
            tool: 'application.resolve',
            input: { appName },
            dependencies: [],
            securityLevel: 'SAFE',
            status: 'READY',
          },
          {
            stepId: 'step_2',
            description: `Launch application "${appName}" on operating system`,
            intent: 'OPEN_APPLICATION',
            tool: 'application.launch',
            input: { appName },
            dependencies: ['step_1'],
            securityLevel: securityPolicyService.evaluateSecurityLevel('application.launch', { appName }),
            status: 'PENDING',
            retryable: true,
          },
          {
            stepId: 'step_3',
            description: `Verify that "${appName}" process is active on system`,
            intent: 'OPEN_APPLICATION',
            tool: 'application.verify',
            input: { appName },
            dependencies: ['step_2'],
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
            description: `Resolve target directory path for "${folderName}" and check security policy`,
            intent: 'CREATE_DIRECTORY',
            tool: 'filesystem.resolve_path',
            input: { targetPath, baseFolder: 'desktop' },
            dependencies: [],
            securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.create_directory', { targetPath }),
            status: 'READY',
          },
          {
            stepId: 'step_2',
            description: `Check whether directory "${folderName}" already exists on disk`,
            intent: 'CREATE_DIRECTORY',
            tool: 'filesystem.check_exists',
            input: { targetPath },
            dependencies: ['step_1'],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
          {
            stepId: 'step_3',
            description: `Create directory "${folderName}" on filesystem`,
            intent: 'CREATE_DIRECTORY',
            tool: 'filesystem.create_directory',
            input: { targetPath, baseFolder: 'desktop' },
            dependencies: ['step_2'],
            securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.create_directory', { targetPath }),
            status: 'PENDING',
          },
          {
            stepId: 'step_4',
            description: `Verify directory exists and is a valid folder on disk`,
            intent: 'CREATE_DIRECTORY',
            tool: 'filesystem.verify_directory',
            input: { targetPath },
            dependencies: ['step_3'],
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
            description: 'Capture primary Windows display and generate PNG screenshot',
            intent: 'SCREEN_CAPTURE',
            tool: 'screen.capture',
            input: {},
            dependencies: [],
            securityLevel: 'SAFE',
            status: 'READY',
            retryable: true,
          },
          {
            stepId: 'step_2',
            description: 'Verify screenshot PNG file existence, size, and header signature on disk',
            intent: 'SCREEN_CAPTURE',
            tool: 'screen.verify',
            input: {},
            dependencies: ['step_1'],
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
            description: 'Query live CPU, RAM, and platform telemetry from OS subsystem',
            intent: 'SYSTEM_METRICS',
            tool: 'system.get_metrics',
            input: {},
            dependencies: [],
            securityLevel: 'SAFE',
            status: 'READY',
          },
          {
            stepId: 'step_2',
            description: 'Generate comprehensive system diagnostic health report',
            intent: 'SYSTEM_DIAGNOSTICS',
            tool: 'system.run_diagnostics',
            input: {},
            dependencies: ['step_1'],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
        break;
      }

      case 'SEARCH_FILES': {
        const searchDir = entities.path || 'Downloads';
        const pattern = entities.filePattern || '*.pdf';
        steps.push(
          {
            stepId: 'step_1',
            description: `Resolve search target directory "${searchDir}" and check safety policy`,
            intent: 'SEARCH_FILES',
            tool: 'filesystem.resolve_path',
            input: { targetPath: searchDir, baseFolder: 'downloads' },
            dependencies: [],
            securityLevel: 'SAFE',
            status: 'READY',
          },
          {
            stepId: 'step_2',
            description: `Scan and filter files matching "${pattern}" in "${searchDir}"`,
            intent: 'SEARCH_FILES',
            tool: 'filesystem.find_files',
            input: { searchDir, pattern, sortByLargest: false },
            dependencies: ['step_1'],
            securityLevel: 'SAFE',
            status: 'PENDING',
          },
        );
        break;
      }

      case 'CHECK_SOFTWARE': {
        const softwareName = entities.softwareName || 'node';
        steps.push({
          stepId: 'step_1',
          description: `Check if "${softwareName}" is installed on system PATH`,
          intent: 'CHECK_SOFTWARE',
          tool: 'system.check_software',
          input: { softwareName },
          dependencies: [],
          securityLevel: 'SAFE',
          status: 'READY',
        });
        break;
      }

      case 'READ_FILE': {
        const filePath = entities.path || entities.fileName || '';
        steps.push({
          stepId: 'step_1',
          description: `Read text file content from "${filePath}"`,
          intent: 'READ_FILE',
          tool: 'filesystem.read_file',
          input: { filePath },
          dependencies: [],
          securityLevel: securityPolicyService.evaluateSecurityLevel('filesystem.read_file', { filePath }),
          status: 'READY',
        });
        break;
      }

      case 'COMPOSITE_COMMAND': {
        if (entities.appName && entities.searchQuery) {
          const appName = entities.appName;
          const searchQuery = entities.searchQuery;
          steps.push(
            {
              stepId: 'step_1',
              description: `Resolve executable path or launch target for "${appName}"`,
              intent: 'OPEN_APPLICATION',
              tool: 'application.resolve',
              input: { appName },
              dependencies: [],
              securityLevel: 'SAFE',
              status: 'READY',
            },
            {
              stepId: 'step_2',
              description: `Launch application "${appName}" on operating system`,
              intent: 'OPEN_APPLICATION',
              tool: 'application.launch',
              input: { appName },
              dependencies: ['step_1'],
              securityLevel: securityPolicyService.evaluateSecurityLevel('application.launch', { appName }),
              status: 'PENDING',
              retryable: true,
            },
            {
              stepId: 'step_3',
              description: `Verify that "${appName}" process is active on system`,
              intent: 'OPEN_APPLICATION',
              tool: 'application.verify',
              input: { appName },
              dependencies: ['step_2'],
              securityLevel: 'SAFE',
              status: 'PENDING',
            },
            {
              stepId: 'step_4',
              description: `Search web for "${searchQuery}" in default browser`,
              intent: 'SEARCH_WEB',
              tool: 'browser.search_web',
              input: { query: searchQuery },
              dependencies: ['step_3'],
              securityLevel: 'SAFE',
              status: 'PENDING',
            },
          );
        }
        break;
      }

      default: {
        steps.push({
          stepId: 'step_1',
          description: `Execute action for goal "${parsed.rawGoal}"`,
          intent: parsed.primaryIntent,
          tool: 'system.get_metrics',
          input: {},
          dependencies: [],
          securityLevel: 'SAFE',
          status: 'READY',
        });
        break;
      }
    }
  }
}

export const workflowPlanner = new WorkflowPlanner();
