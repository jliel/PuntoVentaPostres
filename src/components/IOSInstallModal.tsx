import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle, ExternalLink } from 'lucide-react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Install Mercado Viva</h3>
            <p className="text-xs text-stone-500">Fast, offline-ready mobile app for iOS & Android</p>
          </div>
        </div>

        <div className="space-y-3.5 my-4 text-xs text-stone-600">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2 font-semibold text-stone-900 mb-2">
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <span>On iPhone & iPad (Apple Safari)</span>
            </div>
            <ol className="space-y-2 pl-7 list-decimal text-stone-600">
              <li>
                Tap the <strong className="text-stone-900 inline-flex items-center gap-1 font-medium"><Share className="w-3.5 h-3.5 text-blue-600 inline" /> Share</strong> icon in your Safari bottom bar.
              </li>
              <li>
                Scroll down the share sheet and tap <strong className="text-stone-900 inline-flex items-center gap-1 font-medium"><PlusSquare className="w-3.5 h-3.5 text-stone-800 inline" /> Add to Home Screen</strong>.
              </li>
              <li>Tap <strong className="text-stone-900">Add</strong> at top right to launch Mercado Viva like a native iOS app.</li>
            </ol>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2 font-semibold text-stone-900 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
              <span>On Android (Google Chrome)</span>
            </div>
            <p className="pl-7 text-stone-600">
              Tap the <strong>Install</strong> prompt banner, or tap the 3 dots menu <span className="font-mono">⋮</span> in Chrome and select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Got It, Ready to Order!
          </button>
        </div>
      </div>
    </div>
  );
};
