import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Flame } from 'lucide-react';
import { Language } from '../types';

interface StorySectionProps {
  language: Language;
}

export const StorySection: React.FC<StorySectionProps> = ({ language }) => {
  return (
    <section className="py-10 sm:py-14 bg-white border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Mission */}
          <div className="lg:col-span-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              {language === 'es' ? 'Nuestra Filosofía' : 'Our Craft & Philosophy'}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 mt-2 leading-tight">
              {language === 'es'
                ? 'Calidad y antojo preparados con pasión.'
                : 'Flavor and cravings crafted with passion.'}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
              {language === 'es'
                ? 'Desde el elote asado a las brasas con queso cotija auténtico, hasta hamburguesas con carne Angus 100%, crepas francesas y churros crujientes.'
                : 'From charcoal-roasted corn with authentic cotija cheese, to 100% Angus smash burgers, golden crepes, and warm cinnamon churros.'}
            </p>
          </div>

          {/* 4 Pillars */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2.5">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-stone-900">
                {language === 'es' ? 'Al Carbón y a la Plancha al Momento' : 'Fire-Grilled & Fresh to Order'}
              </h3>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                {language === 'es'
                  ? 'Sin comida recalentada. Cada pedido se prepara cuando lo ordenas para conservar el punto crujiente y caliente.'
                  : 'Zero pre-cooked compromises. Every dish is fired up when you order to guarantee crisp warmth.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-stone-900">
                {language === 'es' ? 'Ingredientes Frescos Seleccionados' : 'Handpicked Fresh Ingredients'}
              </h3>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                {language === 'es'
                  ? 'Elotes tiernos, carne molida en casa, quesos frescos regionales, Nutella auténtica y fresas de temporada.'
                  : 'Tender sweet corn, house-ground Angus beef, fresh cotija cheese, genuine Nutella, and ripe strawberries.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-stone-900">
                {language === 'es' ? 'Compra con Cuenta o como Invitado' : 'Order with Account or as Guest'}
              </h3>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                {language === 'es'
                  ? 'Tú decides si quieres registrarte o comprar en un solo toque sin registro ni contraseñas.'
                  : 'You choose: 1-tap checkout as guest or register to keep your addresses and order history.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-stone-900">
                {language === 'es' ? 'Entrega Rápida y Transparente' : 'Fast & Transparent Delivery'}
              </h3>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                {language === 'es'
                  ? 'Precios honestos sin comisiones escondidas y seguimiento del estado de tu orden en tiempo real.'
                  : 'Honest direct pricing with zero hidden fees and real-time live GPS order status tracking.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
