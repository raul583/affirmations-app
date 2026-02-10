export interface Affirmation {
  id: string;
  title: string;
  text: string;
  categoryId: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface RoutineItem {
  affirmationId: string;
  silenceMsAfter: number; // 0–30000
  repeat?: number; // default 1
}

export interface Routine {
  id: string;
  name: string;
  items: RoutineItem[];
  createdAt: number;
  updatedAt: number;
}

export type VoiceId =
  | "system"
  | "epica"
  | "calma"
  | "energica"
  | "kore"
  | "charon"
  | "atlas"
  | "orion"
  | "zephyr"
  | "puck"
  | "shonen"
  | "sensei"
  | "villain"
  | "monk";

export interface VoiceProfile {
  id: VoiceId;
  label: string;
  rate: number;
  pitch: number;
  volume: number;
  voiceName?: string; // System voice name match
  geminiVoiceName?: string;
}

export type AmbientId = "lofi" | "epic" | "white-noise" | "none";

export interface AmbientTrack {
  id: AmbientId;
  label: string;
  src: string;
  defaultVolume: number;
}

export type PlayStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export interface PlayerState {
  mode: "normal" | "cascos";
  status: PlayStatus;
  currentRoutineId?: string;
  currentIndex: number;
  currentRepeatCount: number; // Internal tracking for repeat logic
  isWaitingSilence: boolean;
  ttsProfileId: VoiceId;
  ambientTrackId: AmbientId;
  ambientVolume: number;
  ttsVolume: number;
  ttsRate: number; // Playback speed multiplier (0.6x - 1.6x)
  progressMs: number;
  geminiVoiceName?: string;
}

export interface AppData {
  affirmations: Affirmation[];
  categories: Category[];
  routines: Routine[];
  schemaVersion: number;
}