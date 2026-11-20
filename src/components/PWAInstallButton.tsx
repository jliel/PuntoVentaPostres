import React, { useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { IOSInstallModal } from './IOSInstallModal';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 transition active:scale-95 cursor-pointer whitespace-nowrap min-h-[40px] ${className}`}
        title="Install app to your device home screen"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{variant === 'full' ? 'Install Native App' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow or generic guide button
  return (
    <>
      <button
        onClick={() => setShowIOSModal(true)}
        className={`flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white/90 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:border-orange-300 hover:text-orange-600 transition active:scale-95 cursor-pointer whitespace-nowrap min-h-[40px] ${className}`}
        title="Install on Apple iOS or Android device"
      >
        {isIOS ? <Share2 className="w-4 h-4 shrink-0 text-orange-600" /> : <Download className="w-4 h-4 shrink-0 text-stone-600" />}
        <span>{isIOS ? 'Install on iOS' : 'Get Mobile App'}</span>
      </button>

      <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
};
