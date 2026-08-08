import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Loader2 } from 'lucide-react';

import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import MapView from './components/MapView';
import CaptureView from './components/CaptureView';
import SignsListView from './components/SignsListView';
import StatsView from './components/StatsView';
import SignDetailModal from './components/SignDetailModal';
import SettingsModal from './components/SettingsModal';
import LoginScreen from './components/LoginScreen';

import useUserLocation from './hooks/useUserLocation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { fetchAllSigns, updateSignStatus } from './services/signsService';

const TAB_TITLES = {
  home: 'Sign Tracker',
  map: 'Sign Pickup',
  capture: 'Capture Sign',
  list: 'All Signs',
  stats: 'Reports'
};

function Tracker() {
  const { isDemo, mode } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [signs, setSigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedSign, setSelectedSign] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const { location, isLocating, refresh } = useUserLocation();

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      setSigns(await fetchAllSigns());
    } catch (err) {
      console.error('Failed to load signs:', err);
      setLoadError(err.message || 'Could not load signs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-fetch when the storage backend changes, so switching demo <-> cloud
  // swaps the dataset instead of showing the previous mode's signs.
  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [loadData, mode]);

  const handleStatusChange = useCallback(async (signId, nextStatus) => {
    setUpdatingId(signId);
    try {
      const updated = await updateSignStatus(signId, nextStatus);
      setSigns(updated);
      if (nextStatus === 'collected') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#22e07a', '#38dcf5', '#4ef08a']
        });
      }
    } catch (err) {
      console.error('Failed to update sign:', err);
      setLoadError(err.message || 'Could not update that sign.');
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const handleSignCaptured = useCallback(() => {
    loadData();
    setActiveTab('home');
  }, [loadData]);

  const placedCount = signs.filter((s) => s.status === 'placed').length;
  const isMap = activeTab === 'map';

  const sharedProps = {
    signs,
    userLocation: location,
    isLocating,
    onRefreshLocation: refresh,
    onSelectSign: setSelectedSign,
    onStatusChange: handleStatusChange,
    updatingId
  };

  return (
    <div className="min-h-dvh">
      <div className={isMap ? 'fixed inset-x-0 top-0 z-1000' : ''}>
        <AppHeader
          title={TAB_TITLES[activeTab]}
          isDemo={isDemo}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      <main>
        {loadError && (
          <div className="mx-auto mb-3 max-w-md px-4">
            <p className="rounded-2xl border border-flare-500/30 bg-flare-500/10 px-3.5 py-3 text-[13px] font-medium text-flare-400">
              {loadError}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="mx-auto max-w-md space-y-3.5 px-4">
            <div className="shimmer h-56 rounded-5xl bg-white/4" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="shimmer h-40 rounded-4xl bg-white/4" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'home' && <HomeView {...sharedProps} />}
            {activeTab === 'map' && <MapView {...sharedProps} />}
            {activeTab === 'capture' && (
              <CaptureView onSignCaptured={handleSignCaptured} />
            )}
            {activeTab === 'list' && <SignsListView {...sharedProps} />}
            {activeTab === 'stats' && <StatsView signs={signs} />}
          </>
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        placedCount={placedCount}
      />

      <SignDetailModal
        sign={selectedSign}
        onClose={() => setSelectedSign(null)}
        onStatusChange={handleStatusChange}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onModeChanged={loadData}
      />
    </div>
  );
}

/** Gate the tracker behind sign-in — except in demo mode, which needs no account. */
function Gate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-neon-400" />
      </div>
    );
  }

  return isAuthenticated ? <Tracker /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
