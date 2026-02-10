import { AmbientTrack } from '../types';

class AmbientPlayer {
  private audio: HTMLAudioElement;
  private currentTrackId: string | null = null;
  private fadeInterval: number | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.loop = true;
  }

  play(track: AmbientTrack, volume: number) {
    if (track.id === 'none') {
      this.stop();
      return;
    }

    if (this.currentTrackId !== track.id) {
      this.audio.src = track.src;
      this.currentTrackId = track.id;
      this.audio.play().catch(e => console.warn("Audio play failed (interaction needed?)", e));
    } else {
        // If same track, ensure playing
        if (this.audio.paused) {
            this.audio.play().catch(e => console.warn("Audio play failed", e));
        }
    }
    this.setVolume(volume);
  }

  setVolume(volume: number) {
    // Clamp
    const v = Math.max(0, Math.min(1, volume));
    this.audio.volume = v;
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentTrackId = null;
  }
}

export const ambientPlayer = new AmbientPlayer();