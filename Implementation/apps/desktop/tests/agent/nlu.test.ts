import { describe, it, expect } from 'vitest';
import { nluService } from '../../src/main/agent/nlu.service.js';

describe('General-Purpose Agent NLU Service', () => {
  it('dynamically parses application launch intent for arbitrary apps', () => {
    const apps = ['Chrome', 'WhatsApp', 'Instagram', 'VS Code', 'Spotify', 'Notepad', 'Antigravity'];
    for (const app of apps) {
      const parsed = nluService.parseGoal(`Open ${app}`);
      expect(parsed.primaryIntent).toBe('OPEN_APPLICATION');
      expect(parsed.entities.appName?.toLowerCase()).toBe(app.toLowerCase());
    }
  });

  it('dynamically parses browser navigation and web search intents', () => {
    const navGoal = nluService.parseGoal('Open Chrome and navigate to github.com');
    expect(navGoal.primaryIntent).toBe('OPEN_URL');
    expect(navGoal.entities.url).toContain('github.com');

    const searchGoal = nluService.parseGoal('Search Google for latest AI news');
    expect(searchGoal.primaryIntent).toBe('SEARCH_WEB');
    expect(searchGoal.entities.searchQuery).toBe('latest AI news');

    const ytGoal = nluService.parseGoal('Open YouTube and search for Python tutorials');
    expect(ytGoal.primaryIntent).toBe('SEARCH_WEB');
    expect(ytGoal.entities.searchQuery).toBe('Python tutorials');
  });

  it('dynamically parses filesystem directory creation and file searches', () => {
    const mkdirGoal = nluService.parseGoal('Create a folder called JARVIS-Test on my Desktop');
    expect(mkdirGoal.primaryIntent).toBe('CREATE_DIRECTORY');
    expect(mkdirGoal.entities.folderName).toBe('JARVIS-Test');
    expect(mkdirGoal.entities.path).toContain('JARVIS-Test');

    const findPdfGoal = nluService.parseGoal('Find all PDF files in my Downloads folder');
    expect(findPdfGoal.primaryIntent).toBe('SEARCH_FILES');
    expect(findPdfGoal.entities.filePattern).toBe('*.pdf');

    const findLargestGoal = nluService.parseGoal('Show me the largest files in Downloads');
    expect(findLargestGoal.primaryIntent).toBe('SEARCH_FILES');
  });

  it('dynamically parses system diagnostics, metrics, and software checks', () => {
    const diagGoal = nluService.parseGoal('Run system diagnostics');
    expect(diagGoal.primaryIntent).toBe('SYSTEM_DIAGNOSTICS');

    const memGoal = nluService.parseGoal('Show my system memory');
    expect(memGoal.primaryIntent).toBe('SYSTEM_METRICS');

    const nodeGoal = nluService.parseGoal('Check whether Node.js is installed');
    expect(nodeGoal.primaryIntent).toBe('CHECK_SOFTWARE');
    expect(nodeGoal.entities.softwareName).toBe('node');

    const gitGoal = nluService.parseGoal('Check whether Git is installed');
    expect(gitGoal.primaryIntent).toBe('CHECK_SOFTWARE');
    expect(gitGoal.entities.softwareName).toBe('git');
  });

  it('dynamically parses terminal developer commands', () => {
    const termGoal = nluService.parseGoal('Run git status in the JARVIS-X project');
    expect(termGoal.primaryIntent).toBe('TERMINAL_COMMAND');
    expect(termGoal.entities.command).toBe('git');
    expect(termGoal.entities.commandArgs).toContain('status');
  });

  it('dynamically parses native OS screen capture, clipboard, and notifications', () => {
    const shotGoal = nluService.parseGoal('Take a screenshot');
    expect(shotGoal.primaryIntent).toBe('SCREEN_CAPTURE');

    const clipGoal = nluService.parseGoal('Copy "Hello World" to clipboard');
    expect(clipGoal.primaryIntent).toBe('CLIPBOARD_WRITE');
    expect(clipGoal.entities.text).toBe('Hello World');

    const musicGoal = nluService.parseGoal('Scan my music library');
    expect(musicGoal.primaryIntent).toBe('MUSIC_LIBRARY_SCAN');
  });
});
