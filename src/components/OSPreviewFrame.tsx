import React from 'react';
import { Wifi, Battery, Signal, Globe } from 'lucide-react';

interface OSPreviewFrameProps {
  osMode: 'responsive' | 'ios' | 'android';
  onChangeOSMode: (mode: 'responsive' | 'ios' | 'android') => void;
  children: React.ReactNode;
}

export const OSPreviewFrame: React.FC<OSPreviewFrameProps> = ({
  osMode,
  onChangeOSMode,
  children,
}) => {
  if (osMode === 'responsive') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-stone-900 py-6 px-3 flex flex-col items-center justify-center">
      {/* Control bar above frame */}
      <div className="mb-4 flex items-center gap-2 sm:gap-3 bg-stone-800/95 text-white px-3 sm:px-4 py-2 rounded-2xl border border-stone-700 text-xs shadow-xl">
        <span className="text-stone-400 font-medium hidden sm:inline">Modo Simulado:</span>
        <button
          onClick={() => onChangeOSMode('responsive')}
          className="px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-700 transition cursor-pointer flex items-center gap-1 font-medium"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Web Normal</span>
        </button>
        <button
          onClick={() => onChangeOSMode('ios')}
          className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-bold flex items-center gap-1 ${
            osMode === 'ios'
              ? 'bg-[#d30045] text-white shadow-sm ring-1 ring-[#ffc540]'
              : 'text-stone-300 hover:bg-stone-700'
          }`}
        >
          <span> Apple iOS</span>
        </button>
        <button
          onClick={() => onChangeOSMode('android')}
          className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-bold flex items-center gap-1 ${
            osMode === 'android'
              ? 'bg-[#d30045] text-white shadow-sm ring-1 ring-[#ffc540]'
              : 'text-stone-300 hover:bg-stone-700'
          }`}
        >
          <span>🤖 Android</span>
        </button>
      </div>

      {/* Simulated Device Frame */}
      <div
        className={`relative w-full max-w-[420px] h-[860px] bg-white rounded-[50px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-[10px] overflow-hidden flex flex-col ${
          osMode === 'ios' ? 'border-[#242424]' : 'border-[#1b1c1e]'
        }`}
      >
        {/* iOS Dynamic Island & Status Bar */}
        {osMode === 'ios' && (
          <div className="h-11 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0 select-none text-[13px] font-semibold text-stone-900 border-b border-stone-100">
            <span>9:41</span>
            {/* Dynamic Island pill */}
            <div className="w-24 h-6 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 text-stone-900">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Android Punch Hole & Status Bar */}
        {osMode === 'android' && (
          <div className="h-9 bg-white/95 backdrop-blur-md px-5 flex items-center justify-between z-30 shrink-0 select-none text-[12px] font-medium text-stone-900 border-b border-stone-100">
            <span>10:30</span>
            {/* Center camera punch hole */}
            <div className="w-3.5 h-3.5 bg-black rounded-full" />
            <div className="flex items-center gap-2 text-stone-900">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="text-[10px] font-mono">92%</div>
            </div>
          </div>
        )}

        {/* Device Viewport Inner Scrollable Container */}
        <div className="flex-1 overflow-y-auto relative flex flex-col bg-[#FAFAF9]">{children}</div>

        {/* iOS Home Indicator Bar */}
        {osMode === 'ios' && (
          <div className="h-5 bg-white/95 backdrop-blur-md flex items-center justify-center shrink-0 z-30 border-t border-stone-100">
            <div className="w-32 h-1 bg-stone-900 rounded-full" />
          </div>
        )}

        {/* Android Gesture Bar */}
        {osMode === 'android' && (
          <div className="h-4 bg-white/95 backdrop-blur-md flex items-center justify-center shrink-0 z-30 border-t border-stone-100">
            <div className="w-20 h-1 bg-stone-500 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
