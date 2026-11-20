import React, { useState } from 'react';
import { 
  ShoppingBag, SlidersHorizontal, User as UserIcon, LogOut, Package, 
  Globe, ShieldCheck, Menu, X, Sparkles, Smartphone, Search
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ProductCategory, User, Language } from '../types';
import { translations } from '../utils/i18n';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  isAdminOpen: boolean;
  onToggleAdmin: () => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  osMode: 'responsive' | 'ios' | 'android';
  onChangeOSMode: (mode: 'responsive' | 'ios' | 'android') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  ordersCount: number;
  onOpenOrders: () => void;
  language: Language;
  onToggleLanguage: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  canClaimInitialAdmin?: boolean;
  onClaimInitialAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  isAdminOpen,
  onToggleAdmin,
  selectedCategory,
  onSelectCategory,
  osMode,
  onChangeOSMode,
  currentUser,
  onOpenAuth,
  onLogout,
  ordersCount,
  onOpenOrders,
  language,
  onToggleLanguage,
  searchQuery,
  onSearchChange,
  canClaimInitialAdmin = false,
  onClaimInitialAdmin,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];

  // Admin access control: verified strictly from Firestore role
  const isAdmin = Boolean(currentUser && currentUser.role === 'admin');

  const categoriesList: { id: ProductCategory; label: string; icon: string }[] = [
    { id: 'all', label: t.categories.all, icon: '✨' },
    { id: 'elotes', label: t.categories.elotes, icon: '🌽' },
    { id: 'hamburguesas', label: t.categories.hamburguesas, icon: '🍔' },
    { id: 'crepas', label: t.categories.crepas, icon: '🥞' },
    { id: 'postres', label: t.categories.postres, icon: '🍰' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand: Postresito */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('all');
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#02043f] via-[#d30045] to-[#ff9400] flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:scale-105 transition">
              P
            </span>
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-[#02043f] group-hover:text-[#d30045] transition leading-tight">
                {t.brand}
              </span>
              <span className="text-[10px] text-stone-400 font-medium leading-none hidden sm:inline">
                {t.tagline}
              </span>
            </div>
          </a>

          {/* OS Switcher - Desktop Only */}
          <div className="hidden lg:flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200/60 ml-2">
            <button
              onClick={() => onChangeOSMode('responsive')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                osMode === 'responsive'
                  ? 'bg-white text-[#02043f] shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {t.webBrowser}
            </button>
            <button
              onClick={() => onChangeOSMode('ios')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                osMode === 'ios'
                  ? 'bg-[#d30045] text-white shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {t.appleIos}
            </button>
            <button
              onClick={() => onChangeOSMode('android')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                osMode === 'android'
                  ? 'bg-[#d30045] text-white shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {t.androidApp}
            </button>
          </div>
        </div>

        {/* Category Links - Desktop Only */}
        <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-stone-600">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`transition pb-1 border-b-2 cursor-pointer font-medium ${
                  isSelected
                    ? 'border-[#d30045] text-[#d30045] font-bold'
                    : 'border-transparent hover:text-[#d30045]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Button - Desktop Only */}
          <button
            onClick={onToggleLanguage}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-[#ffebd1] hover:border-[#ff9400] transition cursor-pointer text-xs font-bold"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-[#d30045]" />
            <span>{language === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}</span>
          </button>

          {/* User Account Button - Desktop Only */}
          <div className="relative hidden sm:block">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffebd1] border border-[#ff9400]/40 text-[#02043f] text-xs font-semibold hover:bg-[#ffdfb8] transition cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-[#02043f] text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline truncate max-w-[85px]">{currentUser.name.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="text-[9px] bg-[#d30045] text-white px-1.5 py-0.2 rounded font-bold uppercase">
                      Admin
                    </span>
                  )}
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-stone-500 truncate">{currentUser.email}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#d30045] bg-[#fde8ef] px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3 text-[#d30045]" /> {language === 'es' ? 'Administrador Oficial' : 'Official Admin'}
                        </span>
                      )}
                    </div>
                    {ordersCount > 0 && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenOrders();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5 text-stone-400" />
                        <span>{t.myOrders} ({ordersCount})</span>
                      </button>
                    )}
                    {canClaimInitialAdmin && onClaimInitialAdmin && !isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onClaimInitialAdmin();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#02043f] font-semibold hover:bg-[#ffebd1] flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#d30045]" />
                        <span>{language === 'es' ? 'Configurar como Admin' : 'Claim Initial Admin'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.logOut}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-[#ff9400] text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">{t.account}</span>
              </button>
            )}
          </div>

          {/* Admin Button - Desktop Only */}
          {isAdmin && (
            <button
              onClick={onToggleAdmin}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isAdminOpen
                  ? 'bg-[#02043f] text-white shadow-xs'
                  : 'bg-[#02043f] hover:bg-[#d30045] text-white shadow-xs'
              }`}
              title="Panel de Administración (Solo Administrador)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#ffc540]" />
              <span>{t.admin}</span>
            </button>
          )}

          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* CART BAG - ALWAYS VISIBLE ON MOBILE AND DESKTOP */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#d30045] hover:bg-[#b5003b] text-white shadow-xs transition active:scale-95 cursor-pointer"
            aria-label="Ver Carrito de Compras"
            title="Abrir bolsa de compra"
          >
            <ShoppingBag className="w-5 h-5 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#02043f] text-[#ffc540] font-mono text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in-50">
                {cartCount}
              </span>
            )}
          </button>

          {/* BURGER MENU BUTTON - MOBILE ONLY (Everything else is placed inside here on mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-stone-200 hover:bg-stone-100 text-[#02043f] transition cursor-pointer"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE BURGER MENU SLIDE-DOWN DRAWER - ALL NAVIGATION CONSOLIDATED */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-stone-200 shadow-2xl animate-in slide-in-from-top-3 duration-200 px-4 py-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Mobile Search Bar inside burger menu */}
          {onSearchChange && (
            <div className="relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder || 'Buscar elotes, crepas, bebidas...'}
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#d30045] focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          )}

          {/* User Account / Profile Box */}
          <div className="p-3.5 rounded-2xl bg-[#f4f0ef] border border-stone-200">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#02043f] text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-stone-900 leading-tight">{currentUser.name}</p>
                      <p className="text-[10px] text-stone-500 leading-tight">{currentUser.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <span className="text-[9px] bg-[#d30045] text-white px-2 py-0.5 rounded font-bold uppercase">
                      Admin
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60">
                  {ordersCount > 0 && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenOrders();
                      }}
                      className="flex-1 py-1.5 px-2 bg-white rounded-xl text-stone-700 text-xs font-semibold border border-stone-200 flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Package className="w-3.5 h-3.5 text-[#d30045]" />
                      <span>{t.myOrders} ({ordersCount})</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="py-1.5 px-3 bg-white hover:bg-rose-50 rounded-xl text-rose-600 text-xs font-semibold border border-stone-200 flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logOut}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#02043f]">
                    {language === 'es' ? '¡Hola, Invitado!' : 'Welcome, Guest!'}
                  </p>
                  <p className="text-[11px] text-stone-600">
                    {language === 'es' ? 'Inicia sesión para rastrear pedidos' : 'Sign in to track orders'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="px-3.5 py-2 bg-[#d30045] hover:bg-[#b5003b] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {t.account}
                </button>
              </div>
            )}
          </div>

          {/* Direct "My Orders" Tracker Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenOrders();
            }}
            className="w-full py-2.5 px-4 bg-white border border-stone-200 hover:border-[#ff9400] text-stone-800 rounded-2xl text-xs font-bold shadow-2xs transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#ff9400]" />
              <span>{t.myOrders}</span>
            </div>
            <span className="text-[10px] bg-[#ffebd1] text-[#02043f] px-2 py-0.5 rounded font-extrabold">
              {ordersCount > 0 ? `${ordersCount} activo(s)` : 'Ver'}
            </span>
          </button>

          {/* Admin Panel Button if admin */}
          {isAdmin && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onToggleAdmin();
              }}
              className="w-full py-2.5 px-4 bg-[#02043f] hover:bg-[#03065a] text-white rounded-2xl text-xs font-bold shadow-xs transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#ffc540]" />
                <span>{language === 'es' ? 'Panel de Administración & Inventario' : 'Admin & Inventory Panel'}</span>
              </div>
              <span className="text-[10px] bg-[#d30045] text-white px-2 py-0.5 rounded font-extrabold">
                {language === 'es' ? 'Gestionar' : 'Manage'}
              </span>
            </button>
          )}

          {/* One-time Initial Admin Bootstrap Button (only shown before any admin exists) */}
          {!isAdmin && canClaimInitialAdmin && onClaimInitialAdmin && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onClaimInitialAdmin();
              }}
              className="w-full py-2.5 px-4 bg-[#ffebd1] border border-[#ff9400] text-[#02043f] rounded-2xl text-xs font-bold shadow-2xs transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d30045]" />
                <span>{language === 'es' ? 'Configurar como Admin Inicial' : 'Claim Initial Admin'}</span>
              </div>
            </button>
          )}

          {/* Category Navigation in Mobile Menu */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              {language === 'es' ? 'Categorías del Menú' : 'Menu Categories'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#d30045] text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-[#ffebd1] text-stone-700 border border-stone-200/80'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferences: Language & Device Mode */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              {language === 'es' ? 'Configuración & Idioma' : 'Settings & Language'}
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#d30045]" />
                <span className="text-xs font-semibold text-stone-700">
                  {language === 'es' ? 'Idioma del Sistema' : 'System Language'}
                </span>
              </div>
              <button
                onClick={onToggleLanguage}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-xs font-bold text-[#02043f] hover:bg-[#ffebd1] transition shadow-2xs cursor-pointer"
              >
                {language === 'es' ? '🇪🇸 Español (Cambiar a EN)' : '🇺🇸 English (Switch to ES)'}
              </button>
            </div>

            {/* Device Switcher in Burger Menu */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#d30045]" />
                <span className="text-xs font-semibold text-stone-700">
                  {language === 'es' ? 'Vista de Aplicación' : 'App Simulation View'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    onChangeOSMode('responsive');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition text-center cursor-pointer ${
                    osMode === 'responsive'
                      ? 'bg-[#02043f] text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-stone-200'
                  }`}
                >
                  🌐 Web
                </button>
                <button
                  onClick={() => {
                    onChangeOSMode('ios');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition text-center cursor-pointer ${
                    osMode === 'ios'
                      ? 'bg-[#d30045] text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-stone-200'
                  }`}
                >
                   iOS
                </button>
                <button
                  onClick={() => {
                    onChangeOSMode('android');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition text-center cursor-pointer ${
                    osMode === 'android'
                      ? 'bg-[#d30045] text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-stone-200'
                  }`}
                >
                  🤖 Android
                </button>
              </div>
            </div>

            {/* PWA Install Button */}
            <div className="pt-1">
              <PWAInstallButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
