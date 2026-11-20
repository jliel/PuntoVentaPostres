import React, { useState } from 'react';
import { 
  X, Check, Lock, ArrowRight, Truck, Store, CreditCard, 
  Banknote, AlertCircle, Sparkles, User as UserIcon, ShieldCheck,
  MessageSquare, Phone, MapPin
} from 'lucide-react';
import { CartItem, Order, PaymentMethodType, User, Language } from '../types';
import { translations } from '../utils/i18n';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  total: number;
  fulfillmentType: 'delivery' | 'pickup';
  currentUser: User | null;
  onOpenAuth: () => void;
  onPlaceOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => Promise<Order>;
  language: Language;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  deliveryFee,
  tax,
  tip,
  total,
  fulfillmentType,
  currentUser,
  onOpenAuth,
  onPlaceOrder,
  language,
}) => {
  const t = translations[language];

  // Customer inputs
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [instructions, setInstructions] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('apple_pay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStep, setAuthStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Interactive Authorization Simulation
    if (paymentMethod === 'apple_pay') {
      setAuthStep(t.authorizingApplePay);
      await new Promise((r) => setTimeout(r, 650));
    } else if (paymentMethod === 'google_pay') {
      setAuthStep(t.authorizingGooglePay);
      await new Promise((r) => setTimeout(r, 650));
    } else if (paymentMethod === 'card') {
      setAuthStep(t.processingCard);
      await new Promise((r) => setTimeout(r, 650));
    } else {
      setAuthStep(t.confirmingCash);
      await new Promise((r) => setTimeout(r, 500));
    }

    setAuthStep(t.generatingTicket);
    await new Promise((r) => setTimeout(r, 350));

    await onPlaceOrder({
      items,
      subtotal,
      deliveryFee,
      tip,
      total,
      paymentMethod,
      fulfillmentType,
      customer: {
        name: name.trim() || (language === 'es' ? 'Invitado Postresito' : 'Postresito Guest'),
        phone: phone.trim() || '+52 55 0000 0000',
        address: fulfillmentType === 'delivery' ? address.trim() : (language === 'es' ? 'Recoger en mostrador' : 'Pickup at store'),
        instructions: instructions.trim() || (fulfillmentType === 'delivery' ? 'Entrega en puerta principal' : undefined),
        ...(currentUser?.id ? { userId: currentUser.id } : {}),
      },
    });

    setIsSubmitting(false);
    setAuthStep(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#02043f] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d30045] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold">
                {t.checkoutTitle}
              </h2>
              <p className="text-[11px] text-stone-300">{t.securePayment}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account / Guest Status Banner */}
        <div className="px-5 py-2.5 bg-[#f4f0ef] border-b border-stone-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-700">
            <UserIcon className="w-3.5 h-3.5 text-[#d30045]" />
            <span>
              {currentUser ? (
                <span>
                  {t.buyingAs}: <strong className="text-[#02043f]">{currentUser.name}</strong> ({currentUser.email})
                </span>
              ) : (
                <span className="text-stone-700 font-medium">
                  {t.buyingAsGuest}
                </span>
              )}
            </span>
          </div>

          {!currentUser && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="text-[#d30045] font-bold hover:underline cursor-pointer"
            >
              {t.haveAccountLogin}
            </button>
          )}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Guest automatic SMS / WhatsApp notification notice */}
          {!currentUser && (
            <div className="p-3.5 rounded-2xl bg-[#fff8e5] border-2 border-[#ff9400] space-y-1.5">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ff9400] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#02043f] flex items-center gap-1.5">
                    <span>{language === 'es' ? 'Envío Automático de Instrucciones de Entrega' : 'Automatic Delivery Instructions Dispatch'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#ffc540] text-[#02043f] font-extrabold uppercase">
                      SMS / WhatsApp
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-700 leading-snug mt-1">
                    {language === 'es'
                      ? 'Como no has iniciado sesión con una cuenta, te enviaremos un mensaje automático a tu número con el código del repartidor, tiempo exacto de llegada e instrucciones para recibir tu pedido.'
                      : 'Since you are checking out as a guest, an automatic text will be dispatched to your phone with courier code, live ETA, and delivery pickup instructions.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-[#02043f] flex items-center gap-1.5">
              {fulfillmentType === 'delivery' ? (
                <>
                  <Truck className="w-4 h-4 text-[#d30045]" />
                  <span>{t.deliveryData}</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-[#d30045]" />
                  <span>{t.pickupData}</span>
                </>
              )}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">{t.fullName} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sofía Morales"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#ff9400] focus:border-[#d30045] bg-[#f4f0ef]/50"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center justify-between">
                  <span>{language === 'es' ? 'Número Celular (Instrucciones SMS)' : 'Mobile Phone (Text updates)'} *</span>
                  <Phone className="w-3.5 h-3.5 text-[#ff9400]" />
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 55 1234 5678"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#ff9400] focus:border-[#d30045] bg-[#f4f0ef]/50 font-mono"
                />
              </div>
            </div>

            {fulfillmentType === 'delivery' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 flex items-center justify-between">
                    <span>{t.deliveryAddress} *</span>
                    <MapPin className="w-3.5 h-3.5 text-[#d30045]" />
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, número exterior/interior, colonia y código postal"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#ff9400] focus:border-[#d30045] bg-[#f4f0ef]/50"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    {language === 'es' ? 'Instrucciones para el Repartidor (Opcional)' : 'Delivery Instructions for Courier (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={language === 'es' ? 'Ej: Timbre 4B, caseta de vigilancia, dejar en recepción' : 'E.g., Ring bell 4B, security gate, leave at reception'}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#ff9400] focus:border-[#d30045] bg-[#f4f0ef]/50"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Section 2: Payment Methods */}
          <div className="pt-2 border-t border-stone-200 space-y-2.5">
            <h3 className="font-heading font-bold text-[#02043f]">
              {t.paymentMethod}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === 'apple_pay'
                    ? 'border-[#02043f] bg-[#02043f] text-white shadow-xs'
                    : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="w-4 h-4 font-bold flex items-center justify-center"></div>
                <div className="leading-tight">
                  <span className="font-bold block">Apple Pay</span>
                  <span className={`text-[10px] ${paymentMethod === 'apple_pay' ? 'text-stone-300' : 'text-stone-400'}`}>
                    1-Tap Touch ID
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('google_pay')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === 'google_pay'
                    ? 'border-[#02043f] bg-[#02043f] text-white shadow-xs'
                    : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="w-4 h-4 font-bold text-[#ffc540]">G</div>
                <div className="leading-tight">
                  <span className="font-bold block">Google Pay</span>
                  <span className={`text-[10px] ${paymentMethod === 'google_pay' ? 'text-stone-300' : 'text-stone-400'}`}>
                    Google Wallet
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-[#02043f] bg-[#02043f] text-white shadow-xs'
                    : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#ff9400]" />
                <div className="leading-tight">
                  <span className="font-bold block">{t.card}</span>
                  <span className={`text-[10px] ${paymentMethod === 'card' ? 'text-stone-300' : 'text-stone-400'}`}>
                    Visa / Mastercard
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-[#02043f] bg-[#02043f] text-white shadow-xs'
                    : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                }`}
              >
                <Banknote className="w-4 h-4 text-[#ffc540]" />
                <div className="leading-tight">
                  <span className="font-bold block">{t.cash}</span>
                  <span className={`text-[10px] ${paymentMethod === 'cash' ? 'text-stone-300' : 'text-stone-400'}`}>
                    Contra entrega
                  </span>
                </div>
              </button>
            </div>

            {paymentMethod === 'cash' && (
              <p className="text-[11px] text-stone-600 bg-stone-100 p-2.5 rounded-xl border border-stone-200">
                {t.cashNotice}
              </p>
            )}
          </div>

          {/* Order items with selected options */}
          <div className="pt-2 border-t border-stone-200">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
              {language === 'es' ? 'Resumen de Platillos' : 'Dishes Breakdown'}
            </h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const optExtra = (item.selectedOptions || []).reduce((s, o) => s + (o.price || 0), 0);
                const unitPrice =
                  item.itemPrice !== undefined ? item.itemPrice : item.product.price + optExtra;
                return (
                  <div
                    key={idx}
                    className="flex items-start justify-between text-xs p-2 rounded-xl bg-stone-50 border border-stone-200/80"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-bold text-stone-900 truncate">
                        {item.quantity}x{' '}
                        {language === 'en' && item.product.nameEn
                          ? item.product.nameEn
                          : item.product.name}
                      </div>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.selectedOptions.map((opt) => (
                            <span
                              key={opt.id}
                              className="text-[10px] text-[#02043f] bg-[#fff4e5] border border-[#ff9400]/60 px-1 py-0.5 rounded font-semibold"
                            >
                              +{opt.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="text-[10px] text-stone-500 italic mt-0.5">
                          "{item.specialInstructions}"
                        </div>
                      )}
                    </div>
                    <span className="font-mono font-bold text-[#02043f] shrink-0">
                      ${(unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Summary breakdown */}
          <div className="pt-3 border-t border-stone-200 space-y-1.5 text-stone-600">
            <div className="flex justify-between">
              <span>{t.subtotal} ({items.length} items)</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{fulfillmentType === 'delivery' ? t.deliveryCost : t.pickupAtStore}</span>
              <span className="font-mono">{deliveryFee === 0 ? t.free : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between text-[#d30045] font-semibold">
                <span>Propina</span>
                <span className="font-mono">+${tip.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
              <span>{t.totalToPay}</span>
              <span className="font-mono text-base text-[#d30045] font-extrabold">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Authorization progress */}
          {authStep && (
            <div className="p-3 rounded-xl bg-[#fff4e5] border border-[#ff9400] flex items-center gap-2 text-xs text-[#02043f] font-semibold animate-pulse">
              <Sparkles className="w-4 h-4 text-[#ff9400]" />
              <span>{authStep}</span>
            </div>
          )}

          {/* Place Order CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#d30045] hover:bg-[#b5003b] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
          >
            {isSubmitting ? (
              <span>{authStep || 'Procesando...'}</span>
            ) : (
              <>
                <span>{t.confirmOrder}</span>
                <span className="font-mono">· ${total.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4 ml-1 text-[#ffc540]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
