import fs from 'fs';
import path from 'path';
import os from 'os';
import { IAgentTool, ToolDefinition, ToolExecutionResult } from '../agent.types.js';
import { securityPolicyService } from '../security.policy.js';

export class KnownFoldersResolver {
  /**
   * Resolves actual Windows known folders taking OneDrive / redirection into account
   */
  static getKnownFolder(folderType: 'desktop' | 'downloads' | 'documents' | 'music' | 'pictures'): string {
    const userProfile = process.env.USERPROFILE || os.homedir();
    const oneDrive = process.env.OneDrive || path.join(userProfile, 'OneDrive');

    switch (folderType) {
      case 'desktop': {
        const oneDriveDesktop = path.join(oneDrive, 'Desktop');
        if (fs.existsSync(oneDriveDesktop)) return oneDriveDesktop;
        const standardDesktop = path.join(userProfile, 'Desktop');
        if (fs.existsSync(standardDesktop)) return standardDesktop;
        return standardDesktop;
      }
      case 'downloads': {
        const standardDownloads = path.join(userProfile, 'Downloads');
        return fs.existsSync(standardDownloads) ? standardDownloads : userProfile;
      }
      case 'documents': {
        const oneDriveDocs = path.join(oneDrive, 'Documents');
        if (fs.existsSync(oneDriveDocs)) return oneDriveDocs;
        const standardDocs = path.join(userProfile, 'Documents');
        if (fs.existsSync(standardDocs)) return standardDocs;
        return standardDocs;
      }
      case 'music': {
        const standardMusic = path.join(userProfile, 'Music');
        return fs.existsSync(standardMusic) ? standardMusic : userProfile;
      }
      case 'pictures': {
        const oneDrivePics = path.join(oneDrive, 'Pictures');
        if (fs.existsSync(oneDrivePics)) return oneDrivePics;
        const standardPics = path.join(userProfile, 'Pictures');
        return fs.existsSync(standardPics) ? standardPics : userProfile;
      }
      default:
        return userProfile;
    }
  }
}

export class CreateDirectoryTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'filesystem.create_directory',
    description: 'Creates a real directory/folder on the filesystem with path security validation and disk verification',
    category: 'FILESYSTEM',
    parameters: [
      { name: 'targetPath', type: 'string', description: 'Target path or folder name', required: true },
      { name: 'baseFolder', type: 'string', description: 'Base known folder (desktop, downloads, documents)', required: false },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const rawPath = String(args.targetPath || '').trim();
    if (!rawPath) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'CREATE_DIRECTORY',
        parameters: args,
        output: 'No target directory path specified.',
        error: 'MissingPath',
        evidence: { verified: false, verificationDetails: 'Target path is empty' },
      };
    }

    // Determine target path
    let candidatePath = rawPath;
    if (!path.isAbsolute(candidatePath)) {
      const baseType = String(args.baseFolder || 'desktop').toLowerCase();
      const baseDir =
        baseType === 'downloads'
          ? KnownFoldersResolver.getKnownFolder('downloads')
          : baseType === 'documents'
            ? KnownFoldersResolver.getKnownFolder('documents')
            : KnownFoldersResolver.getKnownFolder('desktop');
      candidatePath = path.join(baseDir, candidatePath);
    }

    const { safe, resolvedPath, reason } = securityPolicyService.isPathSafe(candidatePath);
    if (!safe) {
      return {
        success: false,
        status: 'BLOCKED',
        tool: this.definition.name,
        action: 'CREATE_DIRECTORY',
        parameters: args,
        output: `Security Check Blocked: ${reason}`,
        error: 'PathTraversalBlocked',
        evidence: { verified: false, verificationDetails: reason || 'Path is blocked by security policy' },
      };
    }

    try {
      const existedBefore = fs.existsSync(resolvedPath);
      fs.mkdirSync(resolvedPath, { recursive: true });

      // Real OS State Verification
      const existsAfter = fs.existsSync(resolvedPath);
      const isDir = existsAfter && fs.statSync(resolvedPath).isDirectory();

      if (!isDir) {
        return {
          success: false,
          status: 'FAILED',
          tool: this.definition.name,
          action: 'CREATE_DIRECTORY',
          parameters: args,
          output: `Failed to verify directory creation at "${resolvedPath}"`,
          error: 'DirectoryVerificationFailed',
          evidence: {
            requestedPath: rawPath,
            resolvedPath,
            verified: false,
            verificationDetails: 'Path does not exist as a directory on disk',
          },
        };
      }

      return {
        success: true,
        status: 'COMPLETED',
        tool: this.definition.name,
        action: 'CREATE_DIRECTORY',
        parameters: args,
        output: existedBefore
          ? `Directory already exists and verified at "${resolvedPath}"`
          : `Directory created successfully and verified on disk at "${resolvedPath}"`,
        evidence: {
          requestedPath: rawPath,
          resolvedPath,
          verified: true,
          verificationDetails: existedBefore
            ? 'Directory confirmed existing on disk'
            : 'Directory created and confirmed as valid folder on disk',
        },
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'CREATE_DIRECTORY',
        parameters: args,
        output: `Failed to create directory "${resolvedPath}": ${err.message}`,
        error: err.message,
        evidence: {
          requestedPath: rawPath,
          resolvedPath,
          verified: false,
          verificationDetails: `OS Error: ${err.message}`,
        },
      };
    }
  }

  async verify(result: ToolExecutionResult): Promise<boolean> {
    if (result.evidence?.resolvedPath) {
      try {
        return (
          fs.existsSync(result.evidence.resolvedPath) &&
          fs.statSync(result.evidence.resolvedPath).isDirectory()
        );
      } catch {
        return false;
      }
    }
    return result.success;
  }
}

export class FindFilesTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'filesystem.find_files',
    description: 'Finds and filters files by extension or pattern in a directory with file size calculations',
    category: 'FILESYSTEM',
    parameters: [
      { name: 'searchDir', type: 'string', description: 'Directory to search (e.g. Downloads, Desktop)', required: false },
      { name: 'pattern', type: 'string', description: 'File pattern or extension (e.g. *.pdf, pdf, *)', required: false },
      { name: 'sortByLargest', type: 'boolean', description: 'Sort results by file size descending', required: false },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    let targetDir = String(args.searchDir || '').trim();
    if (!targetDir || targetDir.toLowerCase().includes('download')) {
      targetDir = KnownFoldersResolver.getKnownFolder('downloads');
    } else if (targetDir.toLowerCase().includes('desktop')) {
      targetDir = KnownFoldersResolver.getKnownFolder('desktop');
    } else if (targetDir.toLowerCase().includes('document')) {
      targetDir = KnownFoldersResolver.getKnownFolder('documents');
    }

    const rawPattern = String(args.pattern || '*').toLowerCase().replace(/^\*\./, '');
    const sortByLargest = Boolean(args.sortByLargest);

    const { safe, resolvedPath, reason } = securityPolicyService.isPathSafe(targetDir);
    if (!safe) {
      return {
        success: false,
        status: 'BLOCKED',
        tool: this.definition.name,
        action: 'FIND_FILES',
        parameters: args,
        output: `Security Block: ${reason}`,
        error: 'PathTraversalBlocked',
        evidence: { verified: false, verificationDetails: reason || 'Path blocked' },
      };
    }

    if (!fs.existsSync(resolvedPath)) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'FIND_FILES',
        parameters: args,
        output: `Directory "${resolvedPath}" does not exist on this machine.`,
        error: 'DirectoryNotFound',
        evidence: { verified: false, verificationDetails: 'Directory does not exist' },
      };
    }

    try {
      const entries = fs.readdirSync(resolvedPath);
      const matchedFiles: { name: string; sizeBytes: number; sizeFormatted: string; fullPath: string }[] = [];

      for (const entry of entries) {
        const fullPath = path.join(resolvedPath, entry);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isFile()) {
            const ext = path.extname(entry).toLowerCase().replace(/^\./, '');
            if (rawPattern === '*' || ext === rawPattern || entry.toLowerCase().includes(rawPattern)) {
              matchedFiles.push({
                name: entry,
                sizeBytes: stat.size,
                sizeFormatted: `${(stat.size / (1024 * 1024)).toFixed(2)} MB`,
                fullPath,
              });
            }
          }
        } catch {}
      }

      if (sortByLargest) {
        matchedFiles.sort((a, b) => b.sizeBytes - a.sizeBytes);
      }

      const fileListFormatted = matchedFiles
        .slice(0, 10)
        .map((f, i) => `${i + 1}. ${f.name} (${f.sizeFormatted})`)
        .join('\n');

      return {
        success: true,
        status: 'COMPLETED',
        tool: this.definition.name,
        action: 'FIND_FILES',
        parameters: args,
        output:
          matchedFiles.length > 0
            ? `Found ${matchedFiles.length} file(s) matching "${rawPattern}" in "${resolvedPath}":\n${fileListFormatted}`
            : `No matching files (${rawPattern}) found in "${resolvedPath}".`,
        evidence: {
          fileCount: matchedFiles.length,
          files: matchedFiles.map((f) => f.name),
          resolvedPath,
          verified: true,
          verificationDetails: `Successfully scanned directory "${resolvedPath}" (${matchedFiles.length} files found)`,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'FIND_FILES',
        parameters: args,
        output: `Failed to search files in "${resolvedPath}": ${err.message}`,
        error: err.message,
        evidence: { verified: false, verificationDetails: `OS Error: ${err.message}` },
      };
    }
  }
}

export class ReadFileTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'filesystem.read_file',
    description: 'Reads text file content with path traversal verification',
    category: 'FILESYSTEM',
    parameters: [
      { name: 'filePath', type: 'string', description: 'Path to text file', required: true },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const rawPath = String(args.filePath || '').trim();
    const { safe, resolvedPath, reason } = securityPolicyService.isPathSafe(rawPath);
    if (!safe) {
      return {
        success: false,
        status: 'BLOCKED',
        tool: this.definition.name,
        action: 'READ_FILE',
        parameters: args,
        output: `Security Check Blocked: ${reason}`,
        error: 'PathTraversalBlocked',
        evidence: { verified: false, verificationDetails: reason || 'Path traversal blocked' },
      };
    }

    if (!fs.existsSync(resolvedPath)) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'READ_FILE',
        parameters: args,
        output: `File not found at "${resolvedPath}".`,
        error: 'FileNotFound',
        evidence: { verified: false, verificationDetails: 'File does not exist on disk' },
      };
    }

    try {
      const content = fs.readFileSync(resolvedPath, 'utf-8');
      const stat = fs.statSync(resolvedPath);
      return {
        success: true,
        status: 'COMPLETED',
        tool: this.definition.name,
        action: 'READ_FILE',
        parameters: args,
        output: content.substring(0, 2000),
        evidence: {
          resolvedPath,
          fileSizeBytes: stat.size,
          verified: true,
          verificationDetails: `Successfully read ${stat.size} bytes from disk`,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'READ_FILE',
        parameters: args,
        output: `Error reading file: ${err.message}`,
        error: err.message,
        evidence: { verified: false, verificationDetails: `OS Read Error: ${err.message}` },
      };
    }
  }
}
