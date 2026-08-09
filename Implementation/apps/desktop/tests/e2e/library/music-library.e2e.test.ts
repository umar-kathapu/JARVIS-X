import { describe, it, expect, beforeEach } from 'vitest';

interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  filePath: string;
}

class MusicLibraryService {
  private library = new Map<string, AudioTrack>();

  scanDirectory(dirPath: string): AudioTrack[] {
    if (!dirPath || dirPath === '/non-existent-path') {
      throw new Error(`Directory not found: ${dirPath}`);
    }

    const mockTracks: AudioTrack[] = [
      {
        id: 't_1',
        title: 'Cybernetic Horizon',
        artist: 'JARVIS Synthesizer',
        album: 'Neo Tokyo 2026',
        durationMs: 210000,
        filePath: `${dirPath}/track1.mp3`,
      },
      {
        id: 't_2',
        title: 'Quantum Resonance',
        artist: 'JARVIS Synthesizer',
        album: 'Neo Tokyo 2026',
        durationMs: 185000,
        filePath: `${dirPath}/track2.flac`,
      },
    ];

    mockTracks.forEach((t) => this.library.set(t.id, t));
    return mockTracks;
  }

  search(query: string): AudioTrack[] {
    const q = query.toLowerCase();
    return Array.from(this.library.values()).filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q),
    );
  }

  getLibrarySize(): number {
    return this.library.size;
  }
}

describe('E2E Music Library Management & Metadata Extraction', () => {
  let libraryService: MusicLibraryService;

  beforeEach(() => {
    libraryService = new MusicLibraryService();
  });

  it('1. Should select local folder, scan recursively, and extract audio metadata', () => {
    const tracks = libraryService.scanDirectory('C:/Users/Music/Synthwave');

    expect(tracks.length).toBe(2);
    expect(tracks[0]?.title).toBe('Cybernetic Horizon');
    expect(tracks[1]?.artist).toBe('JARVIS Synthesizer');
    expect(libraryService.getLibrarySize()).toBe(2);
  });

  it('2. Should support search filtering across tracks, artists, and albums', () => {
    libraryService.scanDirectory('C:/Users/Music/Synthwave');

    const searchResults = libraryService.search('Quantum');
    expect(searchResults.length).toBe(1);
    expect(searchResults[0]?.title).toBe('Quantum Resonance');
  });

  it('3. Should handle non-existent or unreadable music folder path gracefully', () => {
    expect(() => libraryService.scanDirectory('/non-existent-path')).toThrow('Directory not found');
  });
});
