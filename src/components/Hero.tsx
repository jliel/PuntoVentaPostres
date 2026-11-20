import React from 'react';
import { Search, Clock, Truck, ShieldCheck } from 'lucide-react';
import { ProductCategory, Language } from '../types';
import { translations } from '../utils/i18n';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  categoryCounts: Record<string, number>;
  language: Language;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  language,
}) => {
  const t = translations[language];

  const CATEGORIES: { id: ProductCategory; label: string; icon: string }[] = [
    { id: 'all', label: t.categories.all, icon: '✨' },
    { id: 'elotes', label: t.categories.elotes, icon: '🌽' },
    { id: 'hamburguesas', label: t.categories.hamburguesas, icon: '🍔' },
    { id: 'crepas', label: t.categories.crepas, icon: '🥞' },
    { id: 'postres', label: t.categories.postres, icon: '🍰' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f4f0ef] via-[#fff5eb]/60 to-[#FAFAF9] border-b border-stone-200/60 pt-5 pb-5 sm:py-8">
      {/* Decorative ambient soft circles with Warm Orange and Crimson */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ff9400]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-[#d30045]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffebd1] text-[#02043f] border border-[#ff9400]/40 text-xs font-bold mb-2.5">
            <span>✨</span>
            <span>Postresito Artesanal</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#02043f] tracking-tight leading-[1.15]">
            {t.heroTitle}
          </h1>

          <p className="mt-2 text-xs sm:text-base text-stone-600 leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Quick value badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs text-stone-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#ff9400]" />
              <span>{t.readyIn}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#d30045]" />
              <span>{t.expressDelivery}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#02043f]" />
              <span>{t.safePayments}</span>
            </div>
          </div>

          {/* Clean Search Bar */}
          <div className="mt-4 sm:mt-5 relative max-w-lg">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-16 py-2.5 sm:py-3 rounded-2xl bg-white border border-stone-300 shadow-2xs text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d30045] focus:border-[#02043f] transition placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-xs font-semibold text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {t.clear}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="mt-5 sm:mt-6 pt-3 border-t border-stone-200/60">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 min-h-[38px] ${
                    isActive
                      ? 'bg-[#d30045] text-white shadow-xs font-bold'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-[#ffebd1]'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      isActive ? 'bg-[#02043f] text-[#ffc540] font-extrabold' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
