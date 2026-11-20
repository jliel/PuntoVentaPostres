import React from 'react';
import { Plus, Minus, AlertCircle, Sparkles } from 'lucide-react';
import { Product, Language } from '../types';
import { ProductVisual } from './ProductVisual';
import { translations } from '../utils/i18n';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onUpdateQuantity?: (productId: string, delta: number) => void;
  quantityInCart: number;
  language: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onUpdateQuantity,
  quantityInCart,
  language,
}) => {
  const t = translations[language];
  const { price, stock, tags, isAvailable } = product;
  const isOutOfStock = stock <= 0 || !isAvailable;
  const isLowStock = stock > 0 && stock <= 3;

  const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDescription = language === 'en' && product.descriptionEn ? product.descriptionEn : product.description;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col justify-between bg-white rounded-3xl border border-stone-200/90 p-3.5 sm:p-4 hover:border-[#ff9400] hover:shadow-md transition duration-200 cursor-pointer text-left relative"
    >
      <div>
        {/* Visual Graphic or Real Photo */}
        <div className="relative mb-3.5">
          <ProductVisual product={product} size="md" />

          {/* Clean stock status badge */}
          {isOutOfStock ? (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#02043f] text-white text-[10px] font-bold tracking-wide uppercase shadow-sm">
              {t.soldOut}
            </span>
          ) : isLowStock ? (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#ff9400] text-[#02043f] text-[10px] font-extrabold tracking-wide flex items-center gap-1 shadow-xs">
              <AlertCircle className="w-3 h-3" /> {t.onlyLeft} {stock}
            </span>
          ) : null}

          {quantityInCart > 0 && (
            <span className="absolute top-2.5 right-2.5 min-w-[24px] h-[24px] px-1.5 rounded-full bg-[#d30045] text-white text-[11px] font-extrabold flex items-center justify-center shadow-md tabular-nums border border-[#ffc540]">
              {quantityInCart}
            </span>
          )}
        </div>

        {/* Clean Metadata: Category & Tags */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium mb-1">
          <span className="capitalize">{product.category}</span>
          {tags.length > 0 && (
            <>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-[#d30045] font-bold">{tags[0]}</span>
            </>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-heading font-bold text-[#02043f] text-base sm:text-lg group-hover:text-[#d30045] transition leading-snug">
          {displayName}
        </h3>

        {/* Description line */}
        <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
          {displayDescription}
        </p>

        {/* Uber Eats Style Options Preview Badge Strip */}
        {product.options && product.options.length > 0 && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="mt-2.5 p-2 rounded-xl bg-[#fff8e5] hover:bg-[#ffebd1] border border-[#ff9400]/40 transition cursor-pointer flex flex-col gap-1 text-[11px]"
            title={language === 'es' ? 'Clic para personalizar opciones' : 'Click to customize options'}
          >
            <div className="flex items-center justify-between text-[#02043f] font-bold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#ff9400]" />
                <span>{language === 'es' ? 'Opciones al gusto:' : 'Custom options:'}</span>
              </span>
              <span className="text-[10px] text-[#d30045] font-extrabold underline decoration-[#ff9400] underline-offset-2">
                {language === 'es' ? 'Personalizar' : 'Customize'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.options.slice(0, 4).map((opt) => (
                <span
                  key={opt.id}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white border border-[#ff9400]/40 text-stone-800 text-[10px] font-medium shadow-2xs"
                >
                  +{language === 'en' && opt.nameEn ? opt.nameEn : opt.name}
                  {opt.price > 0 && (
                    <span className="font-mono text-[#d30045] font-bold ml-0.5">(+${opt.price})</span>
                  )}
                </span>
              ))}
              {product.options.length > 4 && (
                <span className="text-[10px] text-stone-400 self-center">
                  +{product.options.length - 4} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Ingredients preview */}
        {product.ingredients && product.ingredients.length > 0 && !product.options && (
          <div className="mt-2 text-[11px] text-stone-400 truncate">
            {product.ingredients.slice(0, 3).join(', ')}
          </div>
        )}
      </div>

      {/* Bottom price and action button */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
            {t.price}
          </span>
          <span className="font-mono font-extrabold text-[#02043f] text-base tabular-nums">
            ${price.toFixed(2)}
          </span>
        </div>

        {/* 1-tap Add or In-Card Quantity Stepper Controls */}
        {isOutOfStock ? (
          <button
            disabled
            className="flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-400 cursor-not-allowed min-h-[42px]"
          >
            {t.soldOut}
          </button>
        ) : quantityInCart > 0 ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 bg-[#fde8ef] border border-[#d30045]/40 rounded-xl p-1 shadow-2xs"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onUpdateQuantity) {
                  onUpdateQuantity(product.id, -1);
                }
              }}
              className="w-8 h-8 rounded-lg bg-white hover:bg-[#d30045]/10 text-[#d30045] flex items-center justify-center font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-[#d30045]/30"
              title={language === 'es' ? 'Disminuir' : 'Decrease'}
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono font-extrabold text-[#02043f] text-xs px-2 min-w-[24px] text-center tabular-nums">
              {quantityInCart}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (quantityInCart < stock) {
                  if (onUpdateQuantity) {
                    onUpdateQuantity(product.id, 1);
                  } else {
                    onAddToCart(product, e);
                  }
                }
              }}
              disabled={quantityInCart >= stock}
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border ${
                quantityInCart >= stock
                  ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                  : 'bg-white hover:bg-[#d30045]/10 text-[#d30045] border-[#d30045]/30'
              }`}
              title={quantityInCart >= stock ? (language === 'es' ? 'Límite alcanzado' : 'Limit reached') : (language === 'es' ? 'Aumentar' : 'Increase')}
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => onAddToCart(product, e)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer bg-[#d30045] hover:bg-[#b5003b] text-white min-h-[42px]"
          >
            <Plus className="w-4 h-4 text-[#ffc540]" />
            <span>{t.add}</span>
          </button>
        )}
      </div>
    </div>
  );
};
