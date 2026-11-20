import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, X, Clock, Truck, MessageSquare, ExternalLink, Check, Copy } from 'lucide-react';
import { Order, Language } from '../types';
import { translations } from '../utils/i18n';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
  language: Language;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  language,
}) => {
  if (!order) return null;
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const securityCode = order.orderNumber.replace(/\D/g, '').slice(-4) || '8421';
  const dispatchText = language === 'es'
    ? `🍰 Postresito Express: ¡Hola ${order.customer.name.split(' ')[0]}! Tu pedido #${order.orderNumber} fue confirmado. Tiempo estimado: ${order.fulfillmentType === 'delivery' ? '25–35 min' : '15 min'}. Código de entrega para repartidor: ${securityCode}. ${order.customer.instructions ? 'Instrucciones: ' + order.customer.instructions : 'Entrega en puerta.'}`
    : `🍰 Postresito Express: Hi ${order.customer.name.split(' ')[0]}! Order #${order.orderNumber} is confirmed. ETA: ${order.fulfillmentType === 'delivery' ? '25–35 min' : '15 min'}. Courier handover code: ${securityCode}. ${order.customer.instructions ? 'Instructions: ' + order.customer.instructions : 'Door delivery.'}`;

  const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('52') ? cleanPhone : '52' + cleanPhone}?text=${encodeURIComponent(dispatchText)}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(dispatchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 text-center animate-in fade-in zoom-in-95 duration-200 border border-stone-200/80">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration icon */}
        <div className="w-16 h-16 rounded-full bg-[#fde8ef] text-[#d30045] mx-auto flex items-center justify-center shadow-md mb-4 border border-[#d30045]/30 animate-bounce">
          <CheckCircle2 className="w-9 h-9 text-[#d30045]" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-[#02043f] bg-[#fff4e5] px-2.5 py-1 rounded-full border border-[#ff9400]/60">
          Postresito Order #{order.orderNumber}
        </span>

        <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#02043f] mt-2">
          {t.orderConfirmed}
        </h2>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          {t.thankYou} {order.customer.name.split(' ')[0]}, tu pedido {t.orderReceived}
        </p>

        {/* Automatic Message & Delivery Instructions Card */}
        <div className="my-4 p-4 rounded-2xl bg-[#fff8e5] border-2 border-[#ff9400] text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#02043f] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#d30045]" />
              <span>{language === 'es' ? 'Mensaje Automático Enviado' : 'Automatic Text Dispatched'}</span>
            </span>
            <span className="text-[10px] bg-[#ffc540] text-[#02043f] font-mono font-bold px-2 py-0.5 rounded-md">
              {order.customer.phone}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-[#ff9400]/40 text-stone-700 text-[11px] leading-relaxed font-sans">
            <p className="font-mono text-[10px] text-stone-400 mb-1">
              {language === 'es' ? '📲 Instrucciones de entrega generadas al instante:' : '📲 Instant delivery instructions generated:'}
            </p>
            <p className="font-medium text-[#02043f] italic">"{dispatchText}"</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>{language === 'es' ? 'Ver en WhatsApp' : 'Open in WhatsApp'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="py-1.5 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer border border-stone-300"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? (language === 'es' ? 'Copiado' : 'Copied') : (language === 'es' ? 'Copiar' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Quick ETA Card */}
        <div className="my-4 p-4 rounded-2xl bg-[#f4f0ef] border border-stone-200 text-left">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-stone-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#d30045]" />
              <span>{t.estimatedTime}</span>
            </span>
            <span className="font-bold text-[#02043f]">
              {order.fulfillmentType === 'delivery' ? '25–35 min' : '15–20 min'}
            </span>
          </div>

          {/* Simple 3-step timeline */}
          <div className="relative flex items-center justify-between mt-3 px-2">
            <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-stone-200 -z-0" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-[#02043f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </div>
              <span className="text-[10px] font-bold text-[#02043f] mt-1">{t.received}</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-[#d30045] text-white flex items-center justify-center text-xs font-bold animate-pulse">
                •
              </div>
              <span className="text-[10px] font-bold text-[#d30045] mt-1">{t.preparing}</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-xs font-bold">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-medium text-stone-400 mt-1">
                {order.fulfillmentType === 'delivery' ? t.onTheWay : t.readyForPickup}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Mini Receipt */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1.5 mb-5 max-h-36 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-200/80 pb-1">
            {t.receiptSummary}
          </div>
          {order.items.map(({ product, quantity, selectedOptions, itemPrice }, i) => {
            const unitPrice =
              itemPrice !== undefined
                ? itemPrice
                : product.price +
                  (selectedOptions || []).reduce((s, o) => s + (o.price || 0), 0);
            return (
              <div key={`${product.id}-${i}`} className="text-stone-700 text-xs">
                <div className="flex justify-between">
                  <span className="truncate pr-2 font-medium">
                    {quantity}× {language === 'en' && product.nameEn ? product.nameEn : product.name}
                  </span>
                  <span className="font-mono tabular-nums font-semibold">${(unitPrice * quantity).toFixed(2)}</span>
                </div>
                {selectedOptions && selectedOptions.length > 0 && (
                  <div className="text-[10px] text-[#d30045] font-medium pl-4 truncate">
                    + {selectedOptions.map((o) => o.name).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
          <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
            <span>Total ({order.paymentMethod.replace('_', ' ').toUpperCase()})</span>
            <span className="font-mono text-sm tabular-nums text-[#d30045] font-extrabold">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onTrackOrder(order)}
            className="w-full py-3 px-4 rounded-xl bg-[#d30045] hover:bg-[#b5003b] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.trackOrderRealTime}</span>
            <ArrowRight className="w-4 h-4 text-[#ffc540]" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
          >
            {t.backToMenu}
          </button>
        </div>
      </div>
    </div>
  );
};
