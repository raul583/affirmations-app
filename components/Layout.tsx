import React from 'react';
import { useStore } from '../store/useStore';
import { Menu, Book, PlayCircle, Settings, X, Mic2 } from 'lucide-react';

interface LayoutProps {
  currentTab: 'library' | 'routines';
  onTabChange: (tab: 'library' | 'routines') => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, onTabChange, children }) => {
  const { player, setPlayerMode } = useStore();
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);

  // If in immersive mode, we render nothing of the standard layout, just children (which will be the player)
  if (player.mode === 'cascos') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-core-black text-core-text overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-core-panel border-r border-core-border transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-core-border flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-core-accent rounded-full animate-pulse"></div>
              CORE
            </h1>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-core-muted hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => { onTabChange('library'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'library' 
                  ? 'bg-core-accent/10 text-core-accent' 
                  : 'text-core-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <Book size={18} />
              Library
            </button>
            <button 
              onClick={() => { onTabChange('routines'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'routines' 
                  ? 'bg-core-accent/10 text-core-accent' 
                  : 'text-core-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <PlayCircle size={18} />
              Routines
            </button>
          </nav>

          <div className="p-4 border-t border-core-border">
            <div className="text-xs text-core-muted text-center uppercase tracking-widest opacity-50">
              System v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-16 border-b border-core-border flex items-center justify-between px-6 bg-core-black/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(true)} className="md:hidden text-core-text">
               <Menu size={20} />
             </button>
             <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
               {currentTab === 'library' ? 'Affirmation Database' : 'Ritual Sequences'}
             </h2>
          </div>
          <div>
            {/* Header actions if needed */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};