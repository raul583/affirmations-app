import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, SkipBack, SkipForward, Play, Pause, Volume2, Mic2, Layers, Gauge } from 'lucide-react';
import { VOICE_PROFILES, AMBIENT_TRACKS } from '../../constants';

export const ImmersivePlayer: React.FC = () => {
  const { 
    player, 
    routines, 
    affirmations, 
    setPlayerMode, 
    setPlayerStatus, 
    nextTrack, 
    prevTrack, 
    updatePlayerConfig,
    resetPlayer,
    setCurrentIndex
  } = useStore();

  const [showControls, setShowControls] = useState(false);

  const routine = routines.find(r => r.id === player.currentRoutineId);
  const item = routine?.items[player.currentIndex];
  const affirmation = affirmations.find(a => a.id === item?.affirmationId);

  const togglePlay = () => {
    if (player.status === 'ended') {
      setCurrentIndex(0);
      setPlayerStatus('playing');
    } else if (player.status === 'playing') {
      setPlayerStatus('paused');
    } else {
      setPlayerStatus('playing');
    }
  };

  const closeImmersive = () => {
    setPlayerMode('normal');
  };

  if (!routine || player.status === 'ended') {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
         <h1 className="text-4xl font-bold text-white mb-4">Ritual Complete</h1>
         <div className="flex gap-4">
             <button onClick={() => { setCurrentIndex(0); setPlayerStatus('playing'); }} className="text-white hover:text-core-accent transition-colors">Restart</button>
             <button onClick={() => { resetPlayer(); setPlayerMode('normal'); }} className="text-core-muted hover:text-white transition-colors">Exit</button>
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden cursor-none hover:cursor-default"
         onMouseMove={() => { setShowControls(true); setTimeout(() => setShowControls(false), 3000); }}
    >
      {/* Pulse Animation Background */}
      {player.status === 'playing' && !player.isWaitingSilence && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-64 h-64 bg-core-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      )}

      {/* Main Text Content */}
      <div className="relative z-10 max-w-4xl px-8 text-center space-y-8">
        <div className="text-xs uppercase tracking-[0.3em] text-core-muted/50 mb-4">{routine.name}</div>
        
        {affirmation ? (
          <h1 className="text-3xl md:text-5xl leading-tight font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 select-none">
            {affirmation.text}
          </h1>
        ) : (
          <h1 className="text-xl text-core-muted">Loading...</h1>
        )}

        <div className="flex justify-center gap-2 mt-8">
            {/* Progress dots */}
            {routine.items.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === player.currentIndex ? 'w-8 bg-core-accent' : 'w-2 bg-white/20'}`} />
            ))}
        </div>
      </div>

      {/* Overlay Controls */}
      <div className={`fixed inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-xl mx-auto flex flex-col gap-6">
            
            {/* Main Transport */}
            <div className="flex items-center justify-center gap-8">
                <button onClick={prevTrack} className="text-white/50 hover:text-white transition-colors"><SkipBack size={32} /></button>
                <button 
                    onClick={togglePlay} 
                    className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                >
                    {player.status === 'playing' ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
                </button>
                <button onClick={nextTrack} className="text-white/50 hover:text-white transition-colors"><SkipForward size={32} /></button>
            </div>

            {/* Quick Settings */}
            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Mic2 size={16} className="text-core-accent" />
                    <select 
                        value={player.ttsProfileId} 
                        onChange={e => updatePlayerConfig({ ttsProfileId: e.target.value as any })}
                        className="bg-transparent text-sm text-white outline-none w-full"
                    >
                        {VOICE_PROFILES.map(v => <option key={v.id} value={v.id} className="text-black">{v.label}</option>)}
                    </select>
                </div>
                
                <div className="flex items-center gap-3">
                    <Layers size={16} className="text-core-accent" />
                    <select 
                        value={player.ambientTrackId} 
                        onChange={e => updatePlayerConfig({ ambientTrackId: e.target.value as any })}
                        className="bg-transparent text-sm text-white outline-none w-full"
                    >
                        {AMBIENT_TRACKS.map(t => <option key={t.id} value={t.id} className="text-black">{t.label}</option>)}
                    </select>
                </div>

                <div className="col-span-2 flex items-center gap-3">
                    <Volume2 size={16} className="text-core-muted" />
                    <input 
                        type="range" 
                        min="0" max="1" step="0.1" 
                        value={player.ambientVolume} 
                        onChange={e => updatePlayerConfig({ ambientVolume: parseFloat(e.target.value) })}
                        className="w-full accent-core-accent h-1 bg-white/20 rounded-lg appearance-none" 
                    />
                </div>

                <div className="col-span-2 flex items-center gap-3">
                    <Gauge size={16} className="text-core-muted" />
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs text-core-muted w-8">Speed</span>
                      <input 
                          type="range" 
                          min="0.5" max="2.0" step="0.1" 
                          value={player.ttsRate || 1.0} 
                          onChange={e => updatePlayerConfig({ ttsRate: parseFloat(e.target.value) })}
                          className="w-full accent-core-accent h-1 bg-white/20 rounded-lg appearance-none" 
                      />
                      <span className="text-xs text-white w-8 text-right">{player.ttsRate || 1.0}x</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <button onClick={closeImmersive} className="text-xs text-core-muted hover:text-white flex items-center gap-2">
                    <X size={14} /> Exit Immersive Mode
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};