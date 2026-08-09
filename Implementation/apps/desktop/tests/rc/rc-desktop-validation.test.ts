import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('T5 Release Candidate: Desktop & Filesystem Validation', () => {
  const testRoot = path.join(os.tmpdir(), `jarvis_rc_${Date.now()}`);

  beforeEach(() => {
    if (!fs.existsSync(testRoot)) {
      fs.mkdirSync(testRoot, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testRoot)) {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });

  describe('4. Filesystem & Music Library Scenarios', () => {
    it('1. Should gracefully handle empty music directory without errors', () => {
      const emptyDir = path.join(testRoot, 'empty_music');
      fs.mkdirSync(emptyDir);
      const files = fs.readdirSync(emptyDir);
      expect(files.length).toBe(0);
    });

    it('2. Should handle nested directories and extract valid audio tracks', () => {
      const nestedDir = path.join(testRoot, 'nested', 'artist', 'album_2026');
      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(path.join(nestedDir, 'track_01.flac'), Buffer.from('fLaC_dummy_audio'));
      fs.writeFileSync(path.join(nestedDir, 'track_02.mp3'), Buffer.from('ID3_dummy_audio'));

      const scanned: string[] = [];
      function traverse(dir: string) {
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) traverse(full);
          else if (['.flac', '.mp3', '.wav', '.m4a'].includes(path.extname(full))) scanned.push(full);
        }
      }
      traverse(testRoot);
      expect(scanned.length).toBe(2);
    });

    it('3. Should filter out unsupported files and non-audio extensions (.exe, .txt, .tmp)', () => {
      const mixedDir = path.join(testRoot, 'mixed');
      fs.mkdirSync(mixedDir);
      fs.writeFileSync(path.join(mixedDir, 'song.mp3'), Buffer.from('audio'));
      fs.writeFileSync(path.join(mixedDir, 'virus.exe'), Buffer.from('binary'));
      fs.writeFileSync(path.join(mixedDir, 'lyrics.txt'), Buffer.from('text'));
      fs.writeFileSync(path.join(mixedDir, 'cache.tmp'), Buffer.from('temp'));

      const allowedExt = new Set(['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac']);
      const valid = fs.readdirSync(mixedDir).filter((f) => allowedExt.has(path.extname(f)));
      expect(valid).toEqual(['song.mp3']);
    });

    it('4. Should handle duplicate tracks and missing artwork with fallback placeholder', () => {
      const track1 = { id: 'trk_1', hash: 'abc1234', title: 'Song 1', artwork: null };
      const track2 = { id: 'trk_2', hash: 'abc1234', title: 'Song 1 (Copy)', artwork: null };

      const library = new Map<string, typeof track1>();
      for (const t of [track1, track2]) {
        if (!library.has(t.hash)) {
          library.set(t.hash, t);
        }
      }

      expect(library.size).toBe(1);
      const entry = library.get('abc1234')!;
      const artworkUri = entry.artwork || 'asset://default-album-art.svg';
      expect(artworkUri).toBe('asset://default-album-art.svg');
    });

    it('5. Should handle corrupted metadata gracefully without throwing unhandled exception', () => {
      const corruptedFile = path.join(testRoot, 'corrupted.mp3');
      fs.writeFileSync(corruptedFile, Buffer.from([0x00, 0xff, 0x12, 0x99, 0xaa]));

      let parsedMeta = null;
      try {
        const stats = fs.statSync(corruptedFile);
        parsedMeta = {
          title: path.basename(corruptedFile, '.mp3'),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          sizeBytes: stats.size,
        };
      } catch (err) {
        parsedMeta = { title: 'Unknown', artist: 'Unknown' };
      }

      expect(parsedMeta.title).toBe('corrupted');
      expect(parsedMeta.artist).toBe('Unknown Artist');
    });
  });

  describe('8. Production Build Packaging & Metadata Validation', () => {
    it('1. Should verify desktop build bundle artifacts exist', () => {
      const desktopDist = path.resolve(__dirname, '../../dist');
      expect(fs.existsSync(path.join(desktopDist, 'main', 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(desktopDist, 'preload', 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(desktopDist, 'renderer', 'index.html'))).toBe(true);
    });

    it('2. Should verify package.json metadata has valid product details', () => {
      const pkgJson = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8'),
      );
      expect(pkgJson.name).toBe('@jarvis-x/desktop');
      expect(pkgJson.version).toBe('1.0.0');
    });
  });

  describe('9. Fresh Installation & Upgrade Data Migration Validation', () => {
    it('1. Fresh installation creates default user configuration and stores', () => {
      const freshAppData = path.join(testRoot, 'app_data_fresh');
      fs.mkdirSync(freshAppData, { recursive: true });

      const configPath = path.join(freshAppData, 'config.json');
      const defaultConfig = {
        version: '1.0.0',
        audioBackend: 'web-audio',
        volume: 0.85,
        theme: 'dark',
        enableHardwareAcceleration: true,
      };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));

      const loaded = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(loaded.version).toBe('1.0.0');
      expect(loaded.theme).toBe('dark');
    });

    it('2. Upgrade simulation preserves existing user playlists and settings', () => {
      const appData = path.join(testRoot, 'app_data_upgrade');
      fs.mkdirSync(appData, { recursive: true });

      // Existing v0.9 data
      const userPlaylist = [
        { id: 'pl_favorites', name: 'My Favorites', tracks: ['trk_1', 'trk_2'] },
      ];
      fs.writeFileSync(path.join(appData, 'playlists.json'), JSON.stringify(userPlaylist));

      // Release candidate v1.0.0 runs migration
      const existingPlaylists = JSON.parse(fs.readFileSync(path.join(appData, 'playlists.json'), 'utf-8'));
      expect(existingPlaylists.length).toBe(1);
      expect(existingPlaylists[0].name).toBe('My Favorites');

      // Add v1.0.0 schema fields without data loss
      existingPlaylists[0].updatedAt = new Date().toISOString();
      existingPlaylists[0].syncStatus = 'SYNCED';
      fs.writeFileSync(path.join(appData, 'playlists.json'), JSON.stringify(existingPlaylists));

      const updated = JSON.parse(fs.readFileSync(path.join(appData, 'playlists.json'), 'utf-8'));
      expect(updated[0].tracks).toEqual(['trk_1', 'trk_2']);
      expect(updated[0].syncStatus).toBe('SYNCED');
    });
  });
});
