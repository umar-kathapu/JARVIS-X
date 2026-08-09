import { describe, it, expect, beforeEach } from 'vitest';

class AudioPlaybackEngine {
  public isPlaying = false;
  public currentTrackId: string | null = null;
  public volume = 80;
  public positionMs = 0;
  public shuffle = false;
  public repeat = false;
  public queue: string[] = [];

  loadQueue(trackIds: string[]) {
    this.queue = [...trackIds];
    if (this.queue.length > 0) {
      this.currentTrackId = this.queue[0] || null;
    }
  }

  play() {
    if (!this.currentTrackId && this.queue.length > 0) {
      this.currentTrackId = this.queue[0] || null;
    }
    if (this.currentTrackId) {
      this.isPlaying = true;
    }
  }

  pause() {
    this.isPlaying = false;
  }

  next() {
    if (this.queue.length === 0) return;
    const currentIndex = this.queue.indexOf(this.currentTrackId || '');
    const nextIndex = (currentIndex + 1) % this.queue.length;
    this.currentTrackId = this.queue[nextIndex] || null;
    this.isPlaying = true;
  }

  seek(positionMs: number) {
    this.positionMs = Math.max(0, positionMs);
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(100, vol));
  }
}

describe('E2E Audio Playback Engine & Queue Control', () => {
  let player: AudioPlaybackEngine;

  beforeEach(() => {
    player = new AudioPlaybackEngine();
    player.loadQueue(['track_1', 'track_2', 'track_3']);
  });

  it('1. Should play, pause, and track current queue position', () => {
    expect(player.isPlaying).toBe(false);

    player.play();
    expect(player.isPlaying).toBe(true);
    expect(player.currentTrackId).toBe('track_1');

    player.pause();
    expect(player.isPlaying).toBe(false);
  });

  it('2. Should advance to next track in queue', () => {
    player.play();
    player.next();
    expect(player.currentTrackId).toBe('track_2');
    expect(player.isPlaying).toBe(true);
  });

  it('3. Should adjust volume and seek position accurately', () => {
    player.setVolume(50);
    expect(player.volume).toBe(50);

    player.seek(45000);
    expect(player.positionMs).toBe(45000);
  });
});
