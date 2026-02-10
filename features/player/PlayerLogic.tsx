import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { ttsProvider } from '../../services/tts';
import { ambientPlayer } from '../../services/audio';
import { VOICE_PROFILES, AMBIENT_TRACKS } from '../../constants';

/**
 * This component handles the side effects of audio playback.
 * It watches the store state and triggers TTS/Audio services accordingly.
 */
export const PlayerLogic: React.FC = () => {
  const { 
    player, 
    routines, 
    affirmations, 
    setPlayerStatus, 
    nextTrack, 
    incrementRepeat, 
    setWaitingSilence,
    resetRepeat
  } = useStore();

  const currentRoutine = routines.find(r => r.id === player.currentRoutineId);
  const currentItem = currentRoutine?.items[player.currentIndex];
  const currentAffirmation = affirmations.find(a => a.id === currentItem?.affirmationId);
  
  // Audio Refs to manage timeouts properly
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Sync Ambient Audio
  useEffect(() => {
    const track = AMBIENT_TRACKS.find(t => t.id === player.ambientTrackId);
    if (track) {
      if (player.status === 'playing' || player.status === 'loading') {
        ambientPlayer.play(track, player.ambientVolume);
      } else if (player.status === 'paused' || player.status === 'idle') {
        ambientPlayer.stop(); // Or just pause, but for now full stop to simplify
        if(player.status === 'paused') {
            ambientPlayer.setVolume(0); 
        }
      } else {
        ambientPlayer.stop();
      }
    }
    // Update volume real-time
    ambientPlayer.setVolume(player.ambientVolume);
  }, [player.ambientTrackId, player.ambientVolume, player.status]);

  // Main Playback Loop
  useEffect(() => {
    if (!currentRoutine || !currentItem || !currentAffirmation) return;
    
    // Clear any pending silence timeout if status changes to paused/idle abruptly
    if (player.status !== 'playing' && player.status !== 'loading') {
       if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
       ttsProvider.cancel();
       return;
    }

    // Only proceed if status is playing and we are not waiting for silence
    if (player.status === 'playing' && !player.isWaitingSilence) {
        
        // Find Voice Profile
        const baseProfile = VOICE_PROFILES.find(p => p.id === player.ttsProfileId) || VOICE_PROFILES[0];
        
        // Apply Speed Adjustment
        const speed = Math.max(0.5, Math.min(2.0, player.ttsRate || 1.0));
        
        const activeProfile = { 
          ...baseProfile, 
          volume: player.ttsVolume,
          // We adjust the rate passed to TTS provider.
          // For WebSpeech, rate is 0.1-10. For AudioContext (Gemini), we handle it in provider via playbackRate.
          rate: baseProfile.rate * speed
        };

        setPlayerStatus('playing'); // Ensure status

        // 1. Speak
        ttsProvider.speak(currentAffirmation.text, activeProfile)
          .then(() => {
            // TTS Finished
            // Check if we need silence
            if (currentItem.silenceMsAfter > 0) {
              setWaitingSilence(true);
              silenceTimeoutRef.current = setTimeout(() => {
                handleStepCompletion();
              }, currentItem.silenceMsAfter);
            } else {
              handleStepCompletion();
            }
          })
          .catch(err => {
            console.error("TTS Failure", err);
            // Move next anyway to not block
            handleStepCompletion();
          });
    }
    
    return () => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      // Only re-run when these change significantly. 
      player.status, 
      player.currentIndex, 
      player.currentRepeatCount,
      player.currentRoutineId,
      player.isWaitingSilence,
      // We purposefully do not include rate/volume in deps to avoid restarting speech mid-sentence.
      // Changes to rate/volume will apply on next sentence.
  ]);

  const handleStepCompletion = () => {
    // Check Repeats
    const maxRepeats = currentItem?.repeat || 1;
    const playedCount = player.currentRepeatCount + 1;
    
    if (playedCount < maxRepeats) {
       incrementRepeat();
       setWaitingSilence(false);
    } else {
       nextTrack(); 
    }
  };

  return null; // Invisible
};