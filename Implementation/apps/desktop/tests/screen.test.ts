import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { screenService } from '../src/main/screen/screen.service.js';
import { ScreenCaptureTool } from '../src/main/agent/tools/native.tools.js';
import { agentExecutor } from '../src/main/agent/agent.executor.js';
import { nluService } from '../src/main/agent/nlu.service.js';
import { dynamicTaskPlanner } from '../src/main/agent/planner.service.js';

describe('Screen Capture Service & End-to-End PNG Tool Suite', () => {
  it('1. Should capture primary screen and produce a verified PNG file on disk', async () => {
    const result = await screenService.capturePrimaryScreen();

    expect(result).toBeDefined();
    expect(result?.filePath).toBeDefined();
    expect(typeof result?.filePath).toBe('string');
    expect(result?.filename).toBeDefined();
    expect(result?.width).toBeGreaterThan(0);
    expect(result?.height).toBeGreaterThan(0);
    expect(result?.sizeBytes).toBeGreaterThan(0);
    expect(result?.timestamp).toBeGreaterThan(0);

    // Verify file exists on disk
    expect(fs.existsSync(result!.filePath)).toBe(true);
    const fileStat = fs.statSync(result!.filePath);
    expect(fileStat.size).toBe(result!.sizeBytes);

    // Verify PNG magic bytes
    expect(screenService.isValidPngFile(result!.filePath)).toBe(true);
  });

  it('2. Should verify strict 8-byte PNG header and IHDR structure', async () => {
    const result = await screenService.capturePrimaryScreen();
    expect(result).toBeDefined();

    const fd = fs.openSync(result!.filePath, 'r');
    const header = Buffer.alloc(24);
    fs.readSync(fd, header, 0, 24, 0);
    fs.closeSync(fd);

    // Standard PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const expectedSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(header.subarray(0, 8).equals(expectedSig)).toBe(true);

    // IHDR chunk identifier at byte 12
    const chunkType = header.toString('ascii', 12, 16);
    expect(chunkType).toBe('IHDR');

    // Width and Height from IHDR
    const width = header.readUInt32BE(16);
    const height = header.readUInt32BE(20);
    expect(width).toBe(result!.width);
    expect(height).toBe(result!.height);
  });

  it('3. Should reject non-existent, empty, or corrupted files with isValidPngFile', () => {
    // Non-existent path
    expect(screenService.isValidPngFile('C:\\non_existent_folder_999\\fake.png')).toBe(false);

    // Empty file
    const tempEmpty = path.join(os.tmpdir(), `empty_test_${Date.now()}.png`);
    fs.writeFileSync(tempEmpty, Buffer.alloc(0));
    expect(screenService.isValidPngFile(tempEmpty)).toBe(false);
    fs.unlinkSync(tempEmpty);

    // Text file disguised as PNG
    const tempCorrupted = path.join(os.tmpdir(), `corrupt_test_${Date.now()}.png`);
    fs.writeFileSync(tempCorrupted, 'This is not a PNG file content at all!');
    expect(screenService.isValidPngFile(tempCorrupted)).toBe(false);
    fs.unlinkSync(tempCorrupted);
  });

  it('4. Should execute ScreenCaptureTool with structured evidence and truthful formatting', async () => {
    const tool = new ScreenCaptureTool();
    const result = await tool.execute({});

    expect(result.success).toBe(true);
    expect(result.status).toBe('COMPLETED');
    expect(result.tool).toBe('screen.capture');
    expect(result.output).toContain('SCREENSHOT CAPTURED');
    expect(result.output).toContain('Path:');
    expect(result.output).toContain('Size:');
    expect(result.output).toContain('Resolution:');

    expect(result.evidence?.verified).toBe(true);
    expect(result.evidence?.resolvedPath).toBeDefined();
    expect(result.evidence?.fileSizeBytes).toBeGreaterThan(0);
    expect(result.evidence?.dimensions?.width).toBeGreaterThan(0);
    expect(result.evidence?.dimensions?.height).toBeGreaterThan(0);

    // Tool verify() method confirms file on disk
    const isVerified = await tool.verify(result);
    expect(isVerified).toBe(true);
  });

  it('5. Should parse NLU and plan "Take a screenshot" natural language command', () => {
    const parsed = nluService.parseGoal('Take a screenshot of my screen');
    expect(parsed.primaryIntent).toBe('SCREEN_CAPTURE');

    const plan = dynamicTaskPlanner.createPlan(parsed);
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0]?.toolName).toBe('screen.capture');
    expect(plan.steps[1]?.toolName).toBe('screen.verify');
  });

  it('6. Should execute natural language goal "Take a screenshot" end-to-end via AgentExecutor', async () => {
    agentExecutor.initializeDefaultTools();
    const { plan, finalResponse } = await agentExecutor.executeGoal('Take a screenshot');

    expect(plan.status).toBe('COMPLETED');
    expect(plan.steps[0]?.status).toBe('COMPLETED');
    expect(plan.steps[0]?.result?.evidence?.verified).toBe(true);
    expect(finalResponse).toContain('SCREENSHOT CAPTURED');
    expect(finalResponse).toContain('Path:');
  });
});
