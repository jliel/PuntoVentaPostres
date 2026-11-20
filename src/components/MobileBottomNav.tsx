import React from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/i18n';

interface MobileBottomNavProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  activeView?: 'store' | 'admin' | 'orders';
  onSelectView?: (view: 'store' | 'admin' | 'orders') => void;
  onFocusSearch?: () => void;
  ordersCount?: number;
  isAdmin?: boolean;
  onOpenAuth?: () => void;
  language: Language;
  isDevicePreview?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  language,
  isDevicePreview = false,
}) => {
  const t = translations[language];

  // In mobile, only the cart action is exposed at the bottom when items exist;
  // all other navigation is consolidated inside the burger menu.
  if (cartCount === 0) return null;

  return (
    <aside
      aria-label="Quick cart checkout"
      className={`${
        isDevicePreview
          ? 'sticky bottom-4 mx-3 z-40'
          : 'fixed bottom-4 left-3 right-3 sm:hidden z-40'
      } animate-in slide-in-from-bottom-3 duration-200`}
    >
      <button
        onClick={onOpenCart}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-[#02043f] text-white rounded-2xl shadow-2xl active:scale-98 transition cursor-pointer min-h-[50px] border border-[#ff9400]/40"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#d30045] text-[#ffc540] text-xs font-black flex items-center justify-center tabular-nums shadow-sm border border-[#ffc540]/60">
            {cartCount}
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-[#ffc540]" />
            <span className="text-xs font-bold text-white">{t.yourOrder}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-extrabold tabular-nums text-white">
            ${cartTotal.toFixed(2)}
          </span>
          <div className="w-7 h-7 rounded-full bg-[#d30045] text-white flex items-center justify-center font-bold shadow-xs">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </button>
    </aside>
  );
};
