import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Play, Plus, Trash2, Settings2, Clock, RotateCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Routine, RoutineItem } from '../../types';

export const RoutineList: React.FC = () => {
  const { routines, addRoutine, playRoutine } = useStore();
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');

  const handleCreate = () => {
    if (newRoutineName.trim()) {
      addRoutine(newRoutineName.trim());
      setNewRoutineName('');
      setIsCreateModalOpen(false);
    }
  };

  const startRoutine = (id: string) => {
    playRoutine(id, 0); // Start from beginning immediately
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Rituals</h2>
        <button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-all"
        >
          <Plus size={16} /> New Ritual
        </button>
      </div>

      <div className="space-y-4">
        {routines.map(routine => (
          <div key={routine.id} className="bg-core-panel border border-core-border rounded-xl overflow-hidden transition-all hover:border-core-border/80">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => startRoutine(routine.id)}
                  className="w-10 h-10 rounded-full bg-core-accent flex items-center justify-center text-white hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                >
                  <Play size={18} fill="currentColor" />
                </button>
                <div>
                  <h3 className="font-bold text-white text-lg">{routine.name}</h3>
                  <p className="text-xs text-core-muted uppercase tracking-wide">{routine.items.length} steps</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setEditingRoutineId(editingRoutineId === routine.id ? null : routine.id)}
                  className={`p-2 rounded-lg transition-colors ${editingRoutineId === routine.id ? 'bg-core-accent text-white' : 'text-core-muted hover:bg-white/5'}`}
                 >
                   <Settings2 size={18} />
                 </button>
              </div>
            </div>

            {/* Builder Area */}
            {editingRoutineId === routine.id && (
              <RoutineBuilder routine={routine} onClose={() => setEditingRoutineId(null)} />
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-core-panel border border-core-border w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">New Ritual</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-core-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <input 
              autoFocus
              type="text" 
              value={newRoutineName}
              onChange={(e) => setNewRoutineName(e.target.value)}
              placeholder="e.g. Morning Focus"
              className="w-full bg-black border border-core-border rounded-lg p-3 text-white focus:border-core-accent outline-none mb-6"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm text-core-muted hover:text-white transition-colors">Cancel</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-core-accent text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RoutineBuilder: React.FC<{ routine: Routine, onClose: () => void }> = ({ routine, onClose }) => {
  const { updateRoutine, deleteRoutine, affirmations, playRoutine, playAtIndex, player } = useStore();
  const [isAddMode, setIsAddMode] = useState(false);

  const addItem = (affId: string) => {
    const newItem: RoutineItem = { affirmationId: affId, silenceMsAfter: 2000, repeat: 1 };
    updateRoutine(routine.id, { items: [...routine.items, newItem] });
    setIsAddMode(false);
  };

  const removeItem = (idx: number) => {
    const newItems = [...routine.items];
    newItems.splice(idx, 1);
    updateRoutine(routine.id, { items: newItems });
  };

  const updateItem = (idx: number, updates: Partial<RoutineItem>) => {
    const newItems = [...routine.items];
    newItems[idx] = { ...newItems[idx], ...updates };
    updateRoutine(routine.id, { items: newItems });
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    if (idx + dir < 0 || idx + dir >= routine.items.length) return;
    const newItems = [...routine.items];
    const temp = newItems[idx];
    newItems[idx] = newItems[idx + dir];
    newItems[idx + dir] = temp;
    updateRoutine(routine.id, { items: newItems });
  };

  const handlePlayFromHere = (idx: number) => {
     if (player.currentRoutineId === routine.id) {
        playAtIndex(idx);
     } else {
        playRoutine(routine.id, idx);
     }
  };

  return (
    <div className="bg-black/40 p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Items List */}
      <div className="space-y-2">
        {routine.items.map((item, idx) => {
          const aff = affirmations.find(a => a.id === item.affirmationId);
          const isPlayingThis = player.currentRoutineId === routine.id && player.currentIndex === idx && player.status === 'playing';

          return (
            <div key={idx} className={`flex items-center gap-3 bg-core-panel border p-3 rounded-lg group transition-colors ${isPlayingThis ? 'border-core-accent bg-core-accent/5' : 'border-core-border'}`}>
              <div className="flex flex-col gap-1 text-core-muted">
                <button onClick={() => moveItem(idx, -1)} disabled={idx===0} className="hover:text-white disabled:opacity-20"><ChevronUp size={14}/></button>
                <button onClick={() => moveItem(idx, 1)} disabled={idx===routine.items.length-1} className="hover:text-white disabled:opacity-20"><ChevronDown size={14}/></button>
              </div>
              
              <div className="flex-1 cursor-pointer" onClick={() => handlePlayFromHere(idx)}>
                <div className={`text-sm font-medium transition-colors ${isPlayingThis ? 'text-core-accent' : 'text-white'}`}>
                    {aff?.title || 'Unknown Affirmation'}
                </div>
                <div className="text-xs text-core-muted truncate w-64">{aff?.text}</div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 bg-black/50 px-3 py-1.5 rounded-md border border-white/5">
                <div className="flex items-center gap-2" title="Silence after">
                  <Clock size={12} className="text-core-accent" />
                  <select 
                    value={item.silenceMsAfter} 
                    onChange={e => updateItem(idx, { silenceMsAfter: Number(e.target.value) })}
                    className="bg-transparent text-xs text-white outline-none w-16"
                  >
                    <option value={0}>0s</option>
                    <option value={2000}>2s</option>
                    <option value={5000}>5s</option>
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                  </select>
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="flex items-center gap-2" title="Repeats">
                  <RotateCw size={12} className="text-core-accent" />
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={item.repeat || 1} 
                    onChange={e => updateItem(idx, { repeat: Number(e.target.value) })}
                    className="w-8 bg-transparent text-xs text-white outline-none text-right"
                  />
                </div>
              </div>

              <button onClick={() => removeItem(idx)} className="text-core-muted hover:text-red-500 transition-colors p-2">
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Item */}
      {isAddMode ? (
        <div className="bg-core-panel border border-core-border p-4 rounded-lg">
          <input 
            autoFocus
            placeholder="Search to add..." 
            className="w-full bg-black border border-core-border p-2 rounded text-sm text-white mb-2"
            onChange={(e) => {
              // Simple filter logic could go here
            }}
          />
          <div className="max-h-40 overflow-y-auto space-y-1">
            {affirmations.map(a => (
              <button 
                key={a.id} 
                onClick={() => addItem(a.id)}
                className="w-full text-left p-2 hover:bg-white/10 rounded text-sm text-core-muted hover:text-white truncate"
              >
                {a.title}
              </button>
            ))}
          </div>
          <button onClick={() => setIsAddMode(false)} className="mt-2 text-xs text-red-400 hover:underline">Cancel</button>
        </div>
      ) : (
        <div className="flex justify-between pt-2 border-t border-white/5">
           <button onClick={() => deleteRoutine(routine.id)} className="text-xs text-red-500 hover:text-red-400">Delete Routine</button>
           <button 
            onClick={() => setIsAddMode(true)}
            className="flex items-center gap-2 text-sm text-core-accent hover:text-blue-400 font-medium"
          >
            <Plus size={16} /> Add Step
          </button>
        </div>
      )}
    </div>
  );
};