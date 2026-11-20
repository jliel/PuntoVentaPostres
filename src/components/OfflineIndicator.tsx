import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Offline status notice"
      className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-stone-900/90 text-white px-3.5 py-2 text-xs font-medium shadow-xl backdrop-blur-md border border-stone-800 animate-in fade-in"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Offline mode active. Catalog & cart are cached locally.</span>
    </aside>
  );
};
