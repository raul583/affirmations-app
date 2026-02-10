import { Affirmation, AmbientTrack, Category, Routine, VoiceProfile } from './types';

export const SCHEMA_VERSION = 2;

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_will', name: 'Voluntad', order: 1 },
  { id: 'cat_origin', name: 'Origen', order: 2 },
  { id: 'cat_custom', name: 'Custom', order: 3 },
];

export const INITIAL_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'aff_1',
    title: 'Valor Propio',
    text: 'Mi valor no depende de lo que tengo, sino de lo que hago cuando otros se detienen. Aunque el mundo no vea mi poder hoy, mi corazón ya se mueve hacia la meta.',
    categoryId: 'cat_will',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'aff_2',
    title: 'Fuerza de Origen',
    text: 'Cuando mis fuerzas flaqueen, miraré hacia adentro. Recordaré por qué empecé, de dónde vengo y cada obstáculo que ya he vencido. Mi origen es mi poder.',
    categoryId: 'cat_origin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'rt_morning',
    name: 'Morning Ritual',
    items: [
      { affirmationId: 'aff_1', silenceMsAfter: 2000, repeat: 1 },
      { affirmationId: 'aff_2', silenceMsAfter: 3000, repeat: 2 },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const VOICE_PROFILES: VoiceProfile[] = [
  { id: 'system', label: 'System Default', rate: 1, pitch: 1, volume: 1 },

  // Abstract Archetypes
  { id: 'epica', label: 'Épica (Cinematic)', rate: 0.92, pitch: 0.85, volume: 1, geminiVoiceName: 'Kore' },
  { id: 'calma', label: 'Calma (Soft)', rate: 0.95, pitch: 1.05, volume: 0.95, geminiVoiceName: 'Fenrir' },
  { id: 'energica', label: 'Enérgica (Fast)', rate: 1.15, pitch: 1.05, volume: 1, geminiVoiceName: 'Puck' },

  // Specific Gemini Voices
  { id: 'kore', label: 'Kore — Deep Authority', rate: 1.0, pitch: 0.85, volume: 1, geminiVoiceName: 'Kore' },
  { id: 'charon', label: 'Charon — Dark Gravel', rate: 0.97, pitch: 0.75, volume: 1, geminiVoiceName: 'Charon' },
  { id: 'fenrir', label: 'Fenrir — Deep & Rough', rate: 0.95, pitch: 0.8, volume: 1, geminiVoiceName: 'Fenrir' },
  { id: 'atlas', label: 'Atlas — Grounded Bass', rate: 0.98, pitch: 0.8, volume: 1, geminiVoiceName: 'Atlas' },
  { id: 'orion', label: 'Orion — Narrator', rate: 0.96, pitch: 0.9, volume: 1, geminiVoiceName: 'Orion' },
  { id: 'zephyr', label: 'Zephyr — Clean Default', rate: 1.0, pitch: 1.0, volume: 1, geminiVoiceName: 'Zephyr' },
  { id: 'puck', label: 'Puck — Upbeat', rate: 1.08, pitch: 1.08, volume: 1, geminiVoiceName: 'Puck' },

  // Thematic
  { id: 'shonen', label: 'Shōnen Hero (Anime Vibe)', rate: 1.18, pitch: 1.12, volume: 1, geminiVoiceName: 'Puck' },
  { id: 'sensei', label: 'Sensei Mentor (Calm)', rate: 0.92, pitch: 0.95, volume: 0.95, geminiVoiceName: 'Fenrir' },
  { id: 'villain', label: 'Villain (Low & Slow)', rate: 0.88, pitch: 0.7, volume: 1, geminiVoiceName: 'Charon' },
  { id: 'monk', label: 'Monk (Ultra Calm)', rate: 0.85, pitch: 0.9, volume: 0.9, geminiVoiceName: 'Zephyr' },
];

export const AMBIENT_TRACKS: AmbientTrack[] = [
  { id: 'none', label: 'Silence', src: '', defaultVolume: 0 },
  { id: 'lofi', label: 'Deep Lofi', src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112778.mp3', defaultVolume: 0.4 },
  { id: 'epic', label: 'Cinematic Drone', src: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_34b6b66380.mp3?filename=ambient-piano-drone-10515.mp3', defaultVolume: 0.3 },
  { id: 'white-noise', label: 'Focus Noise', src: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3?filename=brown-noise-26563.mp3', defaultVolume: 0.2 },
];