import React, { useState } from 'react';
import { X, User as UserIcon, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { User, Language } from '../types';
import { translations } from '../utils/i18n';
import { loginWithGoogle, isFirebaseConfigured } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  initialMode?: 'login' | 'register';
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  language,
}) => {
  const t = translations[language];
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoadingGoogle(true);
    try {
      const user = await loginWithGoogle();
      setSuccess(true);
      setTimeout(() => {
        onLogin(user);
        onClose();
        setSuccess(false);
        setLoadingGoogle(false);
      }, 350);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setError(
        language === 'es'
          ? message || 'No se pudo iniciar sesión con Google. Inténtalo nuevamente.'
          : message || 'Could not sign in with Google. Please try again.'
      );
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02043f]/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[#f4f0ef]">
        {/* Header */}
        <div className="p-5 border-b border-[#f4f0ef] flex items-center justify-between bg-[#f4f0ef]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#02043f] flex items-center justify-center text-[#ffc540] shadow-sm">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-black text-[#02043f]">
                {t.logIn}
              </h2>
              <p className="text-[11px] font-medium text-[#02043f]/60">
                Postresito • {language === 'es' ? 'Cuentas & Pedidos' : 'Accounts & Orders'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#02043f]/60 hover:text-[#02043f] hover:bg-[#02043f]/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            {language === 'es'
              ? 'Inicia sesión de forma segura con tu cuenta de Google para guardar tu historial de pedidos en la nube y acceder al panel administrativo si tu cuenta está autorizada.'
              : 'Sign in securely with your Google account to sync your order history in the cloud and access the admin panel if your account is authorized.'}
          </p>

          {error && (
            <div className="text-xs text-[#d30045] bg-[#d30045]/10 border border-[#d30045]/20 px-3 py-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'es' ? '¡Sesión iniciada con éxito!' : 'Signed in successfully!'}</span>
            </div>
          )}

          {!isFirebaseConfigured && (
            <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-xl">
              {language === 'es'
                ? 'Firebase no está configurado en este entorno. Agrega tus variables VITE_FIREBASE_* en .env para habilitar el inicio de sesión.'
                : 'Firebase is not configured in this environment. Set VITE_FIREBASE_* variables in .env to enable sign-in.'}
            </div>
          )}

          {/* Firebase Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || !isFirebaseConfigured}
            className="w-full py-3.5 px-4 rounded-2xl border-2 border-[#02043f]/20 hover:border-[#02043f] bg-white hover:bg-[#f4f0ef]/60 text-[#02043f] font-bold text-xs shadow-xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {loadingGoogle ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#d30045]" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {language === 'es' ? 'Continuar con Google' : 'Continue with Google'}
            </span>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-[#f4f0ef]/70 px-3 py-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-[#02043f] shrink-0" />
            <span>
              {language === 'es'
                ? 'Autenticación verificada por Firebase. También puedes comprar como invitado usando tu celular para avisos de entrega.'
                : 'Verified by Firebase Authentication. You can also check out as a guest using your phone number for delivery updates.'}
            </span>
          </div>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-[#02043f] font-medium underline underline-offset-2 cursor-pointer"
            >
              {t.continueAsGuest}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
