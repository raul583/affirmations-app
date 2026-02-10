import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Search, Trash2, Copy, Edit2, Play } from 'lucide-react';
import { Affirmation } from '../../types';
import { ttsProvider } from '../../services/tts';
import { VOICE_PROFILES } from '../../constants';

export const AffirmationLibrary: React.FC = () => {
  const { affirmations, categories, addAffirmation, updateAffirmation, deleteAffirmation, player } = useStore();
  const [filterCat, setFilterCat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{title: string, text: string, categoryId: string}>({
    title: '', text: '', categoryId: 'cat_custom'
  });

  const filtered = affirmations.filter(a => {
    const matchesCat = filterCat === 'all' || a.categoryId === filterCat;
    const matchesSearch = a.text.toLowerCase().includes(search.toLowerCase()) || 
                          a.title.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenModal = (aff?: Affirmation) => {
    if (aff) {
      setEditingId(aff.id);
      setFormData({ title: aff.title, text: aff.text, categoryId: aff.categoryId });
    } else {
      setEditingId(null);
      setFormData({ title: '', text: '', categoryId: 'cat_custom' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.text) return;
    
    if (editingId) {
      updateAffirmation(editingId, formData);
    } else {
      addAffirmation({
        title: formData.title || 'Untitled',
        text: formData.text,
        categoryId: formData.categoryId,
        tags: []
      });
    }
    setIsModalOpen(false);
  };

  const handleDuplicate = (aff: Affirmation) => {
    addAffirmation({
      title: `${aff.title} (Copy)`,
      text: aff.text,
      categoryId: aff.categoryId,
      tags: aff.tags
    });
  };

  const handlePreview = (text: string) => {
    // Determine active profile for preview
    const profile = VOICE_PROFILES.find(p => p.id === player.ttsProfileId) || VOICE_PROFILES[0];
    const speed = player.ttsRate || 1.0;
    
    // Quick speak with current settings
    ttsProvider.speak(text, {
      ...profile,
      rate: profile.rate * speed,
      volume: player.ttsVolume
    }).catch(console.error);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-core-panel p-4 rounded-xl border border-core-border">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-core-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search origin..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border border-core-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-core-accent transition-colors"
            />
          </div>
          <select 
            value={filterCat} 
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-black border border-core-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-core-accent"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-core-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <Plus size={18} />
          New Affirmation
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(aff => {
          const cat = categories.find(c => c.id === aff.categoryId);
          return (
            <div key={aff.id} className="group bg-core-panel border border-core-border hover:border-core-accent/50 p-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-core-accent/5 relative">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-core-accent bg-core-accentDim px-2 py-1 rounded">
                  {cat?.name || 'Custom'}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handlePreview(aff.text)} className="p-1.5 hover:bg-white/10 rounded text-core-muted hover:text-white" title="Preview Audio"><Play size={14} /></button>
                  <button onClick={() => handleOpenModal(aff)} className="p-1.5 hover:bg-white/10 rounded text-core-muted hover:text-white"><Edit2 size={14} /></button>
                  <button onClick={() => handleDuplicate(aff)} className="p-1.5 hover:bg-white/10 rounded text-core-muted hover:text-white"><Copy size={14} /></button>
                  <button onClick={() => deleteAffirmation(aff.id)} className="p-1.5 hover:bg-red-900/30 rounded text-core-muted hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">{aff.title}</h3>
              <p className="text-core-muted text-sm leading-relaxed line-clamp-3">{aff.text}</p>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-core-muted">
            No affirmations found. Plant one now.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-core-panel border border-core-border w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-5 bg-core-accent rounded-full"></div>
              {editingId ? 'Edit Affirmation' : 'New Affirmation'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-core-muted uppercase mb-1">Category</label>
                <select 
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-black border border-core-border rounded-lg p-2 text-white focus:border-core-accent outline-none"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-core-muted uppercase mb-1">Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black border border-core-border rounded-lg p-2 text-white focus:border-core-accent outline-none"
                  placeholder="E.g. Unstoppable Will"
                />
              </div>

              <div>
                <label className="block text-xs text-core-muted uppercase mb-1">Affirmation</label>
                <textarea 
                  rows={4}
                  value={formData.text}
                  onChange={e => setFormData({...formData, text: e.target.value})}
                  className="w-full bg-black border border-core-border rounded-lg p-2 text-white focus:border-core-accent outline-none resize-none"
                  placeholder="Write your truth..."
                  onKeyDown={e => { if(e.key === 'Enter' && e.metaKey) handleSave() }}
                />
                <p className="text-[10px] text-core-muted mt-1 text-right">CMD+ENTER to save</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-core-muted hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-core-accent text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20">
                Save Affirmation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};