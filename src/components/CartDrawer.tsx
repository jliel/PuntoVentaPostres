import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Truck, Store } from 'lucide-react';
import { CartItem, Language } from '../types';
import { ProductVisual } from './ProductVisual';
import { translations } from '../utils/i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number, itemIndex?: number) => void;
  onRemoveItem: (productId: string, itemIndex?: number) => void;
  onProceedToCheckout: () => void;
  fulfillmentType: 'delivery' | 'pickup';
  onFulfillmentChange: (type: 'delivery' | 'pickup') => void;
  tipPercentage: number;
  onTipChange: (percentage: number) => void;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tipAmount: number;
  total: number;
  language: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  fulfillmentType,
  onFulfillmentChange,
  tipPercentage,
  onTipChange,
  subtotal,
  deliveryFee,
  tipAmount,
  total,
  language,
}) => {
  const t = translations[language];
  if (!isOpen) return null;

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#02043f] text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#d30045] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {totalCount}
              </div>
              <div>
                <h2 className="font-heading text-base font-bold text-white">
                  {t.yourOrder}
                </h2>
                <p className="text-[11px] text-stone-300">
                  {totalCount} {totalCount === 1 ? t.product : t.products}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Cerrar bolsa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fulfillment Toggle */}
          <div className="p-3 bg-stone-100 border-b border-stone-200">
            <div className="grid grid-cols-2 gap-1.5 bg-stone-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => onFulfillmentChange('delivery')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer font-bold ${
                  fulfillmentType === 'delivery'
                    ? 'bg-[#02043f] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Truck className={`w-3.5 h-3.5 ${fulfillmentType === 'delivery' ? 'text-[#ffc540]' : 'text-[#d30045]'}`} />
                <span>{t.delivery}</span>
              </button>
              <button
                onClick={() => onFulfillmentChange('pickup')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer font-bold ${
                  fulfillmentType === 'pickup'
                    ? 'bg-[#02043f] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Store className={`w-3.5 h-3.5 ${fulfillmentType === 'pickup' ? 'text-[#ffc540]' : 'text-[#d30045]'}`} />
                <span>{t.pickup}</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <ShoppingBag className="w-12 h-12 stroke-[1.5] text-stone-300 mb-3" />
                <h3 className="font-heading text-base font-bold text-stone-800">
                  {t.emptyBag}
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  {t.emptyBagSub}
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 bg-[#d30045] hover:bg-[#b5003b] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {t.viewMenu}
                </button>
              </div>
            ) : (
              items.map(({ product, quantity, specialInstructions, selectedOptions, itemPrice }, itemIndex) => {
                const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
                const unitPrice =
                  itemPrice !== undefined
                    ? itemPrice
                    : product.price +
                      (selectedOptions || []).reduce((sum, opt) => sum + (opt.price || 0), 0);

                return (
                  <div key={`${product.id}-${itemIndex}`} className="pt-3.5 first:pt-0 flex gap-3 items-start">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-stone-200 mt-0.5">
                      <ProductVisual product={product} size="sm" className="h-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-heading text-xs sm:text-sm font-bold text-stone-900 truncate">
                          {displayName}
                        </h4>
                        <span className="font-mono text-xs font-bold text-[#02043f] shrink-0">
                          ${(unitPrice * quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Selected Uber-style options */}
                      {selectedOptions && selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedOptions.map((opt) => (
                            <span
                              key={opt.id}
                              className="text-[10px] bg-[#fff8e5] text-[#02043f] border border-[#ff9400]/50 px-1.5 py-0.5 rounded-md font-semibold"
                            >
                              +{opt.name}
                              {opt.price > 0 ? ` (+$${opt.price})` : ''}
                            </span>
                          ))}
                        </div>
                      )}

                      {specialInstructions && (
                        <p className="text-[10px] text-[#d30045] italic truncate mt-1">
                          "{specialInstructions}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(product.id, -1, itemIndex)}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-[#d30045] cursor-pointer"
                            aria-label="Disminuir"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs text-[#02043f]">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, 1, itemIndex)}
                            disabled={quantity >= product.stock}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-[#d30045] disabled:opacity-30 cursor-pointer"
                            aria-label="Aumentar"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(product.id, itemIndex)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          aria-label="Eliminar platillo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              {/* Optional tip buttons */}
              <div>
                <span className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                  {t.staffTip}
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono font-semibold">
                  {[0, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => onTipChange(pct)}
                      className={`py-1.5 rounded-lg border transition cursor-pointer font-bold ${
                        tipPercentage === pct
                          ? 'bg-[#02043f] text-white border-[#02043f]'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-[#fff4e5]'
                      }`}
                    >
                      {pct === 0 ? t.noTip : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtotal breakdown */}
              <div className="space-y-1 text-xs text-stone-600 pt-1">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{fulfillmentType === 'delivery' ? t.deliveryCost : t.pickupAtStore}</span>
                  <span className="font-mono">
                    {deliveryFee === 0 ? t.free : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-[#d30045] font-semibold">
                    <span>Propina ({tipPercentage}%)</span>
                    <span className="font-mono">+${tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm text-stone-900 pt-2 border-t border-stone-200">
                  <span>{t.totalToPay}</span>
                  <span className="font-mono text-base text-[#d30045] font-extrabold">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#d30045] hover:bg-[#b5003b] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 min-h-[48px]"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4 text-[#ffc540]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
