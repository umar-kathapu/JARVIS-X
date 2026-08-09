import { describe, it, expect, beforeEach } from 'vitest';

interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

class PlaylistManager {
  private playlists = new Map<string, Playlist>();

  createPlaylist(name: string): Playlist {
    const playlist: Playlist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      trackIds: [],
    };
    this.playlists.set(playlist.id, playlist);
    return playlist;
  }

  renamePlaylist(id: string, newName: string): Playlist {
    const pl = this.playlists.get(id);
    if (!pl) throw new Error('Playlist not found');
    pl.name = newName;
    return pl;
  }

  addTrack(playlistId: string, trackId: string) {
    const pl = this.playlists.get(playlistId);
    if (!pl) throw new Error('Playlist not found');
    if (!pl.trackIds.includes(trackId)) {
      pl.trackIds.push(trackId);
    }
  }

  removeTrack(playlistId: string, trackId: string) {
    const pl = this.playlists.get(playlistId);
    if (!pl) throw new Error('Playlist not found');
    pl.trackIds = pl.trackIds.filter((id) => id !== trackId);
  }

  deletePlaylist(id: string) {
    this.playlists.delete(id);
  }

  getPlaylist(id: string): Playlist | undefined {
    return this.playlists.get(id);
  }
}

describe('E2E Playlist Management & Persistence', () => {
  let manager: PlaylistManager;

  beforeEach(() => {
    manager = new PlaylistManager();
  });

  it('1. Should create, rename, and manage tracks in playlists', () => {
    const pl = manager.createPlaylist('Synthwave Hits');
    expect(pl.name).toBe('Synthwave Hits');

    manager.renamePlaylist(pl.id, 'Synthwave Favorites 2026');
    expect(manager.getPlaylist(pl.id)?.name).toBe('Synthwave Favorites 2026');

    manager.addTrack(pl.id, 'track_cyberpunk_1');
    manager.addTrack(pl.id, 'track_cyberpunk_2');
    expect(manager.getPlaylist(pl.id)?.trackIds).toEqual(['track_cyberpunk_1', 'track_cyberpunk_2']);

    manager.removeTrack(pl.id, 'track_cyberpunk_1');
    expect(manager.getPlaylist(pl.id)?.trackIds).toEqual(['track_cyberpunk_2']);
  });

  it('2. Should delete playlist cleanly', () => {
    const pl = manager.createPlaylist('Temporary Playlist');
    expect(manager.getPlaylist(pl.id)).toBeDefined();

    manager.deletePlaylist(pl.id);
    expect(manager.getPlaylist(pl.id)).toBeUndefined();
  });
});
