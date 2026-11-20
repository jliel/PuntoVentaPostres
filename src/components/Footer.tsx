import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Language } from '../types';
import { translations } from '../utils/i18n';

interface FooterProps {
  onOpenAdmin: () => void;
  isAdmin: boolean;
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, isAdmin, language }) => {
  const t = translations[language];

  return (
    <footer className="bg-stone-900 text-stone-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-stone-800 text-xs pb-24 sm:pb-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 text-white font-heading font-bold text-base">
            <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#02043f] via-[#d30045] to-[#ff9400] flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
              P
            </span>
            <span>{t.brand}</span>
          </div>
          <p className="text-stone-400 text-[11px] max-w-sm mt-1">
            {language === 'es'
              ? 'Elotes, hamburguesas, crepas francesas y postres preparados al momento con ingredientes de calidad.'
              : 'Street corn, gourmet burgers, fresh crepes and artisan desserts made fresh to order.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-stone-300 text-[11px]">
          {isAdmin && (
            <>
              <button
                onClick={onOpenAdmin}
                className="hover:text-white transition underline underline-offset-4 cursor-pointer text-[#ffc540] font-semibold"
              >
                {t.admin}
              </button>
              <span>·</span>
            </>
          )}
          <span>{language === 'es' ? 'Abierto todos los días 1:00 PM – 11:00 PM' : 'Open Daily 1:00 PM – 11:00 PM'}</span>
          <span>·</span>
          <PWAInstallButton variant="compact" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-stone-500">
        <p>&copy; {new Date().getFullYear()} {t.brand}. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
        <p>Progressive Web App · iOS · Android · Web</p>
      </div>
    </footer>
  );
};
