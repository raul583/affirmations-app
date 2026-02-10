import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Affirmation, 
  Category, 
  Routine, 
  RoutineItem, 
  PlayerState, 
  VoiceId, 
  AmbientId 
} from '../types';
import { 
  INITIAL_AFFIRMATIONS, 
  INITIAL_CATEGORIES, 
  INITIAL_ROUTINES, 
  SCHEMA_VERSION 
} from '../constants';

// Simple UUID generator fallback
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

interface StoreState {
  // Data
  affirmations: Affirmation[];
  categories: Category[];
  routines: Routine[];
  
  // Actions - Affirmations
  addAffirmation: (aff: Omit<Affirmation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAffirmation: (id: string, updates: Partial<Affirmation>) => void;
  deleteAffirmation: (id: string) => void;
  
  // Actions - Routines
  addRoutine: (name: string) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  
  // Player Actions
  playRoutine: (routineId: string, startIndex?: number) => void;
  playAtIndex: (index: number) => void;
  
  // Player State
  player: PlayerState;
  setPlayerStatus: (status: PlayerState['status']) => void;
  setPlayerMode: (mode: PlayerState['mode']) => void;
  setPlayerRoutine: (routineId: string) => void; // Deprecated in favor of playRoutine but kept for compatibility
  nextTrack: () => void;
  prevTrack: () => void;
  resetPlayer: () => void;
  updatePlayerConfig: (config: Partial<PlayerState>) => void;
  setCurrentIndex: (index: number) => void;
  incrementRepeat: () => void;
  resetRepeat: () => void;
  setWaitingSilence: (waiting: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      affirmations: INITIAL_AFFIRMATIONS,
      categories: INITIAL_CATEGORIES,
      routines: INITIAL_ROUTINES,

      // --- Affirmations ---
      addAffirmation: (aff) => set((state) => ({
        affirmations: [
          ...state.affirmations,
          { 
            ...aff, 
            id: generateId(), 
            createdAt: Date.now(), 
            updatedAt: Date.now() 
          }
        ]
      })),
      updateAffirmation: (id, updates) => set((state) => ({
        affirmations: state.affirmations.map(a => 
          a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a
        )
      })),
      deleteAffirmation: (id) => set((state) => ({
        affirmations: state.affirmations.filter(a => a.id !== id)
      })),

      // --- Routines ---
      addRoutine: (name) => set((state) => ({
        routines: [
          ...state.routines,
          {
            id: generateId(),
            name,
            items: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ]
      })),
      updateRoutine: (id, updates) => set((state) => ({
        routines: state.routines.map(r => 
          r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
        )
      })),
      deleteRoutine: (id) => set((state) => ({
        routines: state.routines.filter(r => r.id !== id)
      })),

      // --- Player ---
      player: {
        mode: 'normal',
        status: 'idle',
        currentIndex: 0,
        currentRepeatCount: 0,
        isWaitingSilence: false,
        ttsProfileId: 'kore',
        ttsRate: 1.0,
        ambientTrackId: 'none',
        ambientVolume: 0.5,
        ttsVolume: 1.0,
        progressMs: 0
      },

      playRoutine: (routineId, startIndex = 0) => set(state => ({
        player: {
          ...state.player,
          currentRoutineId: routineId,
          currentIndex: startIndex,
          currentRepeatCount: 0,
          isWaitingSilence: false,
          status: 'playing' // Ensure it starts playing
        }
      })),

      playAtIndex: (index) => set(state => ({
        player: {
          ...state.player,
          currentIndex: Math.max(0, index),
          currentRepeatCount: 0,
          isWaitingSilence: false,
          status: 'playing' // Ensure it starts playing
        }
      })),

      setPlayerStatus: (status) => set(state => ({ player: { ...state.player, status } })),
      setPlayerMode: (mode) => set(state => ({ player: { ...state.player, mode } })),
      setPlayerRoutine: (routineId) => set(state => ({ 
        player: { 
          ...state.player, 
          currentRoutineId: routineId, 
          currentIndex: 0, 
          currentRepeatCount: 0, 
          status: 'idle',
          isWaitingSilence: false
        } 
      })),
      
      setCurrentIndex: (index) => set(state => ({
        player: { ...state.player, currentIndex: index }
      })),

      incrementRepeat: () => set(state => ({
        player: { ...state.player, currentRepeatCount: state.player.currentRepeatCount + 1 }
      })),

      resetRepeat: () => set(state => ({
        player: { ...state.player, currentRepeatCount: 0 }
      })),

      setWaitingSilence: (waiting) => set(state => ({
        player: { ...state.player, isWaitingSilence: waiting }
      })),

      nextTrack: () => {
        const state = get();
        const routine = state.routines.find(r => r.id === state.player.currentRoutineId);
        if (!routine) return;
        
        if (state.player.currentIndex < routine.items.length - 1) {
          // Move next, preserve paused state if paused, else keep playing
          const nextStatus = state.player.status === 'paused' ? 'paused' : 'playing';
          set(s => ({ 
            player: { 
              ...s.player, 
              currentIndex: s.player.currentIndex + 1, 
              currentRepeatCount: 0, 
              isWaitingSilence: false,
              status: nextStatus
            } 
          }));
        } else {
          set(s => ({ player: { ...s.player, status: 'ended' } }));
        }
      },

      prevTrack: () => {
        const state = get();
        if (state.player.currentIndex > 0) {
          const nextStatus = state.player.status === 'paused' ? 'paused' : 'playing';
          set(s => ({ 
            player: { 
              ...s.player, 
              currentIndex: s.player.currentIndex - 1, 
              currentRepeatCount: 0, 
              isWaitingSilence: false,
              status: nextStatus
            } 
          }));
        } else {
          // If at start, just restart current
          set(s => ({ 
             player: { ...s.player, currentRepeatCount: 0, isWaitingSilence: false, status: 'playing' }
          }));
        }
      },

      resetPlayer: () => set(state => ({
        player: { ...state.player, currentIndex: 0, currentRepeatCount: 0, status: 'idle', isWaitingSilence: false }
      })),
      updatePlayerConfig: (config) => set(state => ({
        player: { ...state.player, ...config }
      }))
    }),
    {
      name: 'core-affirmation-storage',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version) => {
        if (version < 2) {
           return {
             ...persistedState,
             player: {
                ...persistedState.player,
                ttsRate: 1.0
             }
           }
        }
        return persistedState as StoreState;
      },
    }
  )
);