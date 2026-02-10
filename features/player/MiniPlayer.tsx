import React from 'react';
import { useStore } from '../../store/useStore';
import { Play, Pause, SkipForward, SkipBack, Maximize2, Square } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const { player, routines, affirmations, setPlayerStatus, nextTrack, prevTrack, setPlayerMode, resetPlayer, setCurrentIndex, updatePlayerConfig } = useStore();

  if (player.status === 'idle' && !player.currentRoutineId) return null;

  const routine = routines.find(r => r.id === player.currentRoutineId);
  const item = routine?.items[player.currentIndex];
  const aff = affirmations.find(a => a.id === item?.affirmationId);

  if (!routine) return null;

  const handlePlayToggle = () => {
    if (player.status === 'ended') {
      // Restart from beginning
      setCurrentIndex(0);
      setPlayerStatus('playing');
    } else {
      setPlayerStatus(player.status === 'playing' ? 'paused' : 'playing');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-core-panel border-t border-core-border flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-4 w-1/3">
        {player.status === 'loading' ? (
           <div className="w-4 h-4 rounded-full border-2 border-core-accent border-t-transparent animate-spin"></div>
        ) : (
           <div className={`w-2 h-2 rounded-full ${player.status === 'playing' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        )}
        <div className="overflow-hidden">
            <div className="text-sm font-bold text-white truncate">{routine.name}</div>
            <div className="text-xs text-core-muted truncate">{aff?.title || 'Loading...'}</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
         <button onClick={prevTrack} className="text-core-muted hover:text-white">
            <SkipBack size={20} />
         </button>
         <button 
          onClick={handlePlayToggle}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
         >
           {player.status === 'playing' ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5"/>}
         </button>
         <button onClick={nextTrack} className="text-core-muted hover:text-white">
            <SkipForward size={20} />
         </button>
      </div>

      <div className="flex items-center justify-end gap-4 w-1/3">
        {/* Speed Control Compact */}
        <div className="hidden md:flex flex-col items-center w-16 group">
          <input 
              type="range" 
              min="0.6" max="1.6" step="0.1" 
              value={player.ttsRate || 1.0} 
              onChange={e => updatePlayerConfig({ ttsRate: parseFloat(e.target.value) })}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
          />
          <span className="text-[10px] text-core-muted">{player.ttsRate || 1.0}x</span>
        </div>

        <button onClick={() => { resetPlayer(); setPlayerStatus('idle'); }} className="text-core-muted hover:text-red-500 hidden md:block">
            <Square size={18} />
        </button>
        <button onClick={() => setPlayerMode('cascos')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-core-accent hover:text-white transition-colors border border-core-accent/50 hover:border-white px-3 py-1.5 rounded">
            <Maximize2 size={14} />
            Immersive
        </button>
      </div>
    </div>
  );
};