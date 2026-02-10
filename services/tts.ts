import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceProfile, VoiceId } from '../types';

interface ITTSProvider {
  speak(text: string, profile: VoiceProfile): Promise<void>;
  cancel(): void;
  getVoices(): SpeechSynthesisVoice[];
}

// Map Core VoiceId to Gemini Prebuilt Voice Names
const GEMINI_VOICE_MAP: Record<VoiceId, string> = {
  system: 'Zephyr',
  epica: 'Kore',
  calma: 'Fenrir',
  energica: 'Puck',
  kore: 'Kore',
  charon: 'Charon',
  atlas: 'Atlas',
  orion: 'Orion',
  zephyr: 'Zephyr',
  puck: 'Puck',
  shonen: 'Puck',
  sensei: 'Fenrir',
  villain: 'Charon',
  monk: 'Zephyr',
};

class HybridTTS implements ITTSProvider {
  private synthesis: SpeechSynthesis;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private genAI: GoogleGenAI | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Initialize Gemini Client if Key exists
    if (process.env.API_KEY) {
      this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  // --- Web Speech Implementation ---
  private speakWebSpeech(text: string, profile: VoiceProfile): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = profile.rate; 
      utterance.pitch = profile.pitch;
      utterance.volume = profile.volume;

      const voices = this.getVoices();
      
      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') resolve();
        else reject(e);
      };

      this.synthesis.speak(utterance);
    });
  }

  // --- Gemini TTS Implementation ---
  private async speakGemini(text: string, profile: VoiceProfile): Promise<void> {
    if (!this.genAI) throw new Error("No Gemini API Key");

    const voiceName = profile.geminiVoiceName || GEMINI_VOICE_MAP[profile.id] || 'Zephyr';
    
    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: { parts: [{ text }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio data returned");

      const ctx = this.initAudioContext();
      const audioBuffer = await this.decodeAudioData(this.decodeBase64(base64Audio), ctx);
      
      return new Promise((resolve) => {
        // Stop previous if any (though cancel() is called before)
        if (this.currentSource) {
           try { this.currentSource.stop(); } catch(e){}
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        // Apply playback rate for speed control
        source.playbackRate.value = Math.max(0.6, Math.min(1.6, profile.rate));
        
        // Simple volume control
        const gainNode = ctx.createGain();
        gainNode.gain.value = profile.volume;
        
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        source.onended = () => {
          this.currentSource = null;
          resolve();
        };

        this.currentSource = source;
        source.start();
      });

    } catch (e) {
      console.error("Gemini TTS Failed", e);
      throw e;
    }
  }

  // --- Main Speak Method ---
  async speak(text: string, profile: VoiceProfile): Promise<void> {
    this.cancel(); // Stop anything playing

    // Strategy: 
    // 1. If WebSpeech has voices, try it first (lower latency/cost).
    // 2. If WebSpeech fails or has no voices, try Gemini.
    
    const voices = this.getVoices();
    const hasVoices = voices.length > 0;

    // We can force Gemini for specific profiles if we want, but keeping hybrid logic:
    // If the profile maps to a specific Gemini voice name explicitly, prefer Gemini? 
    // For now, let's stick to the simple fallback unless it's a "system" voice.
    // Actually, to get the high quality voices "Kore", "Charon" etc we MUST use Gemini if selected.
    // The previous implementation fell back only on error. 
    // Let's bias towards Gemini if API Key is present and profile is not 'system'.
    
    const shouldUseGemini = process.env.API_KEY && profile.id !== 'system';

    if (shouldUseGemini) {
        try {
            await this.speakGemini(text, profile);
        } catch(e) {
            console.warn("Gemini failed, fallback to WebSpeech", e);
            if (hasVoices) await this.speakWebSpeech(text, profile);
        }
    } else {
        if (hasVoices) {
            await this.speakWebSpeech(text, profile);
        } else {
            await this.speakGemini(text, profile);
        }
    }
  }

  cancel(): void {
    // Cancel Web Speech
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel();
    }
    // Cancel AudioContext Source
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource = null;
      } catch (e) { /* ignore */ }
    }
  }

  // --- Helpers ---
  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const sampleRate = 24000;
    const numChannels = 1;
    
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}

export const ttsProvider = new HybridTTS();