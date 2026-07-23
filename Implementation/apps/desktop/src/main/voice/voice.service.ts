export class VoiceService {
  private isListening = false;

  startWakeWordListener(onWake: () => void): void {
    this.isListening = true;
    // Simulated wake-word listener contract ("Hey JARVIS")
    console.log('[VoiceService] Listening for wake-word "Hey JARVIS"...');
  }

  stopListening(): void {
    this.isListening = false;
  }

  isVoiceActive(): boolean {
    return this.isListening;
  }
}

export const voiceService = new VoiceService();
