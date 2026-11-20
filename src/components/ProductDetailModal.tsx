import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { Product, Language, ProductOption } from '../types';
import { ProductVisual } from './ProductVisual';
import { translations } from '../utils/i18n';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    instructions?: string,
    selectedOptions?: ProductOption[]
  ) => void;
  quantityInCart: number;
  language: Language;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  language,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const t = translations[language];

  // Initialize selected options when product opens
  useEffect(() => {
    if (product?.options) {
      setSelectedOptionIds(
        product.options.filter((opt) => opt.isDefault).map((opt) => opt.id)
      );
    } else {
      setSelectedOptionIds([]);
    }
    setQuantity(1);
    setSpecialInstructions('');
  }, [product]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const { price, stock, tags, ingredients, isAvailable } = product;
  const isOutOfStock = stock <= 0 || !isAvailable;

  const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDescription =
    language === 'en' && product.descriptionEn ? product.descriptionEn : product.description;

  const toggleOption = (optId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  };

  const selectedOptions = (product.options || []).filter((opt) =>
    selectedOptionIds.includes(opt.id)
  );

  const optionsExtraTotal = selectedOptions.reduce((acc, opt) => acc + (opt.price || 0), 0);
  const unitCalculatedPrice = price + optionsExtraTotal;
  const calculatedTotal = unitCalculatedPrice * quantity;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(
      product,
      quantity,
      specialInstructions.trim() || undefined,
      selectedOptions.length > 0 ? selectedOptions : undefined
    );
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-stone-200/90 my-auto max-h-[92vh] flex flex-col">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-stone-700 hover:text-stone-900 transition hover:scale-105 cursor-pointer border border-stone-200"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Visual */}
          <div className="p-3 sm:p-4 bg-stone-50/50 pb-0">
            <ProductVisual product={product} size="lg" />
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Category & Tags strip */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-bold text-[#d30045] bg-[#fff4e5] border border-[#ff9400]/40 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stock status */}
              {isOutOfStock ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#02043f] text-white text-[10px] font-bold uppercase tracking-wide">
                  {t.soldOut}
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {stock} {language === 'es' ? 'disponibles hoy' : 'available today'}
                </span>
              )}
            </div>

            {/* Title & Price */}
            <div>
              <h2 id="product-modal-title" className="font-heading text-xl sm:text-2xl font-bold text-[#02043f]">
                {displayName}
              </h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono font-extrabold text-[#02043f] text-2xl">
                  ${unitCalculatedPrice.toFixed(2)}
                </span>
                {optionsExtraTotal > 0 && (
                  <span className="text-[11px] text-[#d30045] font-bold bg-[#fff8e5] border border-[#ff9400]/50 px-2 py-0.5 rounded-full">
                    Base ${price.toFixed(2)} + Extras ${optionsExtraTotal.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {displayDescription}
            </p>

            {/* Uber Eats Style Options Customization */}
            {product.options && product.options.length > 0 && (
              <div className="rounded-2xl border border-[#ff9400]/40 bg-[#fff8e5] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#ff9400]" />
                    <h4 className="text-xs font-bold text-[#02043f] uppercase tracking-wider">
                      {language === 'es' ? 'Personaliza tu Platillo' : 'Customize Your Dish'}
                    </h4>
                  </div>
                  <span className="text-[10px] bg-[#ffc540] text-[#02043f] font-extrabold px-2 py-0.5 rounded-full">
                    {language === 'es' ? 'Opciones al Gusto' : 'Options'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {language === 'es'
                    ? 'Elige tus complementos, aderezos y salsas al gusto:'
                    : 'Choose your toppings, dressings, and extras:'}
                </p>

                <div className="space-y-2 pt-1">
                  {product.options.map((opt) => {
                    const isSelected = selectedOptionIds.includes(opt.id);
                    const optName = language === 'en' && opt.nameEn ? opt.nameEn : opt.name;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleOption(opt.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-white border-[#d30045] shadow-2xs'
                            : 'bg-white/80 border-stone-200 hover:bg-white text-stone-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-[#d30045] border-[#d30045] text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className={`text-xs ${isSelected ? 'font-bold text-stone-900' : 'font-medium text-stone-700'}`}>
                            {optName}
                          </span>
                        </div>

                        <div className="text-right">
                          {opt.price > 0 ? (
                            <span className="font-mono text-xs font-bold text-[#d30045]">
                              +${opt.price.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                              {language === 'es' ? 'Gratis / Incluido' : 'Free'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fresh Ingredients */}
            {ingredients && ingredients.length > 0 && (
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                <h4 className="text-xs font-bold text-stone-800 mb-2">
                  {t.ingredientsAndPrep}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {ingredients.map((ing) => (
                    <span key={ing} className="text-[11px] bg-white border border-stone-200 text-stone-700 px-2.5 py-1 rounded-lg font-medium">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Kitchen special instructions */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.specialInstructions}
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={t.specialInstructionsPlaceholder}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#ff9400] focus:border-[#d30045] placeholder:text-stone-400 bg-stone-50/50"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions: Quantity selector, Add to Order & explicit Close button */}
        <div className="p-3 sm:p-4 bg-stone-50/95 border-t border-stone-200 shrink-0 flex items-center gap-2 sm:gap-3">
          {/* Close button for 1-tap quick dismiss */}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-3 rounded-2xl border border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-bold text-xs transition cursor-pointer shrink-0"
          >
            {language === 'es' ? 'Cerrar' : 'Close'}
          </button>

          {/* Quantity Stepper */}
          <div className="flex items-center border border-stone-300 rounded-2xl p-1 bg-white shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition cursor-pointer"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-mono font-bold text-xs text-[#02043f]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              disabled={quantity >= stock}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition cursor-pointer"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to order button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#d30045] hover:bg-[#b5003b] text-white active:scale-98'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t.addedToOrder}</span>
              </>
            ) : isOutOfStock ? (
              <span>{t.soldOut}</span>
            ) : (
              <>
                <span>{t.addToOrder}</span>
                <span className="font-mono font-bold">· ${calculatedTotal.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
