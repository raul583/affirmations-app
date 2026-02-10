import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { AffirmationLibrary } from './features/affirmations/AffirmationLibrary';
import { RoutineList } from './features/routines/RoutineList';
import { PlayerLogic } from './features/player/PlayerLogic';
import { ImmersivePlayer } from './features/player/ImmersivePlayer';
import { MiniPlayer } from './features/player/MiniPlayer';
import { useStore } from './store/useStore';

function App() {
  const [currentTab, setCurrentTab] = useState<'library' | 'routines'>('routines');
  const { player } = useStore();

  return (
    <>
      <PlayerLogic />
      
      {player.mode === 'cascos' ? (
        <ImmersivePlayer />
      ) : (
        <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
          <div className="pb-24">
             {currentTab === 'library' ? <AffirmationLibrary /> : <RoutineList />}
          </div>
          <MiniPlayer />
        </Layout>
      )}
    </>
  );
}

export default App;