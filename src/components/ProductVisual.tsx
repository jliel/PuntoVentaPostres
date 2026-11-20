import React from 'react';
import { Product } from '../types';

interface ProductVisualProps {
  product: Product;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  product,
  className = '',
  size = 'md',
}) => {
  const { iconType, accentColor, name, imageUrl, enhancedImageUrl } = product;
  const displayImage = enhancedImageUrl || imageUrl;

  const heightClasses = {
    sm: 'h-24',
    md: 'h-48 sm:h-52',
    lg: 'h-64 sm:h-72',
  }[size];

  // If there's an uploaded or AI enhanced photo, display the photo cleanly without overlay badges
  if (displayImage) {
    return (
      <div className={`relative w-full ${heightClasses} overflow-hidden rounded-2xl bg-stone-100 group ${className}`}>
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Subtle vignette/gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // Fallback high-fidelity SVG graphics for the items
  const renderIconGraphic = () => {
    switch (iconType) {
      case 'corn':
        return (
          <g>
            {/* Wooden board shadow */}
            <ellipse cx="100" cy="120" rx="58" ry="12" fill="rgba(0,0,0,0.12)" />
            {/* Husk / green leaves */}
            <path d="M46 102C40 90 42 70 54 58C62 50 66 54 62 68C58 82 56 94 62 104" fill="#65A30D" />
            <path d="M154 102C160 90 158 70 146 58C138 50 134 54 138 68C142 82 144 94 138 104" fill="#84CC16" />
            {/* Corn stick */}
            <rect x="94" y="98" width="12" height="34" rx="4" fill="#B45309" />
            <rect x="96" y="98" width="8" height="34" rx="3" fill="#D97706" />
            {/* Golden Cob Body */}
            <path d="M72 40C72 26 84 18 100 18C116 18 128 26 128 40L126 94C126 104 116 110 100 110C84 110 74 104 74 94L72 40Z" fill="#F59E0B" />
            {/* Kernels grid representation */}
            <path d="M82 28C88 28 92 34 88 40" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            <path d="M100 25C106 25 110 31 106 37" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            <path d="M114 30C120 30 124 36 120 42" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            {/* Creamy Mayo & Cotija Cheese layer */}
            <path d="M70 48Q100 42 130 52Q126 82 72 80Z" fill="#FFFBEB" fillOpacity="0.88" />
            <circle cx="86" cy="56" r="3" fill="#FEF3C7" />
            <circle cx="106" cy="52" r="3.5" fill="#FEF3C7" />
            <circle cx="118" cy="62" r="2.5" fill="#FEF3C7" />
            <circle cx="94" cy="68" r="3" fill="#FEF3C7" />
            {/* Cotija cheese crumbles & Tajín/Chile sparks */}
            <circle cx="80" cy="52" r="1.5" fill="#DC2626" />
            <circle cx="92" cy="46" r="1.8" fill="#EF4444" />
            <circle cx="108" cy="48" r="1.5" fill="#DC2626" />
            <circle cx="115" cy="58" r="1.8" fill="#B91C1C" />
            <circle cx="88" cy="62" r="1.5" fill="#EF4444" />
            <circle cx="102" cy="64" r="2" fill="#DC2626" />
            <circle cx="120" cy="72" r="1.5" fill="#EF4444" />
            <circle cx="78" cy="70" r="1.8" fill="#DC2626" />
            {/* Lime wedge on side */}
            <path d="M138 98A16 16 0 0 1 154 114H138Z" fill="#84CC16" />
            <path d="M140 101A13 13 0 0 1 151 112H140Z" fill="#BEF264" />
          </g>
        );

      case 'burger':
        return (
          <g>
            <ellipse cx="100" cy="120" rx="55" ry="12" fill="rgba(0,0,0,0.12)" />
            {/* Bottom Brioche Bun */}
            <path d="M52 100C52 96 58 92 68 92H132C142 92 148 96 148 100C148 108 140 114 130 114H70C60 114 52 108 52 100Z" fill="#D97706" />
            {/* Special Sauce */}
            <path d="M58 94Q100 88 142 94" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
            {/* Juicy Angus Beef Patty */}
            <rect x="46" y="80" width="108" height="15" rx="7" fill="#451A03" />
            <path d="M50 87Q100 85 150 87" stroke="#78350F" strokeWidth="2" strokeDasharray="3,3" />
            {/* Melted Cheddar Drip */}
            <path d="M48 80H152L146 88L136 84L128 92L116 84L104 94L90 84L76 90L64 84L48 88Z" fill="#F59E0B" />
            {/* Crispy Bacon Strip */}
            <path d="M52 74Q75 80 100 74Q125 68 148 76" stroke="#991B1B" strokeWidth="5" strokeLinecap="round" />
            {/* Fresh Tomato Slices */}
            <rect x="54" y="66" width="44" height="9" rx="4" fill="#EF4444" />
            <rect x="102" y="66" width="44" height="9" rx="4" fill="#DC2626" />
            {/* Crispy Green Lettuce Ruffles */}
            <path d="M42 66C50 58 60 68 70 60C80 52 92 64 102 58C112 52 124 64 136 58C148 52 158 64 160 66" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" fill="none" />
            {/* Top Brioche Bun Crown */}
            <path d="M48 58C48 34 72 26 100 26C128 26 152 34 152 58C152 64 148 66 142 66H58C52 66 48 64 48 58Z" fill="#F59E0B" />
            {/* Toasted Sesame Seeds */}
            <ellipse cx="76" cy="42" rx="2" ry="3.5" fill="#FEF3C7" transform="rotate(-20 76 42)" />
            <ellipse cx="94" cy="36" rx="2" ry="3.5" fill="#FEF3C7" transform="rotate(10 94 36)" />
            <ellipse cx="112" cy="38" rx="2" ry="3.5" fill="#FEF3C7" transform="rotate(-15 112 38)" />
            <ellipse cx="128" cy="46" rx="2" ry="3.5" fill="#FEF3C7" transform="rotate(25 128 46)" />
            <ellipse cx="86" cy="48" rx="2" ry="3.5" fill="#FEF3C7" transform="rotate(5 86 48)" />
            <ellipse cx="106" cy="48" rx="2" ry="3.5" fill="#FEF3C7" transform="rotate(-10 106 48)" />
          </g>
        );

      case 'crepe':
        return (
          <g>
            <ellipse cx="100" cy="118" rx="55" ry="12" fill="rgba(0,0,0,0.12)" />
            {/* Ceramic Plate */}
            <ellipse cx="100" cy="105" rx="64" ry="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
            {/* Folded Golden Crepe Triangle */}
            <path d="M50 105C65 72 85 50 100 50C115 50 135 72 150 105C135 112 65 112 50 105Z" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
            {/* Crepe browned golden spots */}
            <ellipse cx="90" cy="74" rx="8" ry="4" fill="#D97706" fillOpacity="0.4" />
            <ellipse cx="115" cy="86" rx="10" ry="5" fill="#D97706" fillOpacity="0.3" />
            <ellipse cx="75" cy="94" rx="9" ry="4" fill="#D97706" fillOpacity="0.35" />
            {/* Nutella Chocolate Drizzle */}
            <path d="M60 98Q75 88 90 95Q105 84 120 92Q135 80 145 90" stroke="#451A03" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M70 82Q85 75 100 80Q115 72 130 78" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Strawberry slices */}
            <path d="M85 70C85 64 92 60 97 66C102 72 94 76 89 74C86 73 85 71 85 70Z" fill="#E11D48" />
            <circle cx="91" cy="68" r="0.8" fill="#FFF" />
            <circle cx="94" cy="71" r="0.8" fill="#FFF" />
            <path d="M105 76C105 70 112 66 117 72C122 78 114 82 109 80C106 79 105 77 105 76Z" fill="#F43F5E" />
            {/* Banana slice */}
            <circle cx="76" cy="85" r="7" fill="#FEF08A" stroke="#FDE047" strokeWidth="1" />
            <circle cx="76" cy="85" r="2" fill="#CA8A04" />
            {/* Powdered sugar sparkles */}
            <circle cx="80" cy="65" r="1.5" fill="#FFF" />
            <circle cx="110" cy="60" r="1.5" fill="#FFF" />
            <circle cx="125" cy="70" r="1.5" fill="#FFF" />
          </g>
        );

      case 'dessert':
        return (
          <g>
            <ellipse cx="100" cy="118" rx="50" ry="10" fill="rgba(0,0,0,0.12)" />
            {/* Churros bundle */}
            <rect x="52" y="70" width="96" height="12" rx="6" fill="#D97706" transform="rotate(-15 100 76)" />
            <rect x="52" y="80" width="96" height="12" rx="6" fill="#B45309" transform="rotate(8 100 86)" />
            <rect x="52" y="90" width="96" height="12" rx="6" fill="#F59E0B" transform="rotate(-4 100 96)" />
            {/* Sugar & cinnamon dust */}
            <circle cx="70" cy="75" r="1.5" fill="#FEF3C7" />
            <circle cx="90" cy="70" r="1.5" fill="#FEF3C7" />
            <circle cx="110" cy="74" r="1.5" fill="#FEF3C7" />
            <circle cx="130" cy="82" r="1.5" fill="#FEF3C7" />
            <circle cx="85" cy="88" r="1.5" fill="#FEF3C7" />
            <circle cx="105" cy="94" r="1.5" fill="#FEF3C7" />
            {/* Chocolate dip cup */}
            <ellipse cx="140" cy="105" rx="18" ry="7" fill="#451A03" stroke="#F8FAFC" strokeWidth="2" />
            <ellipse cx="140" cy="103" rx="15" ry="5" fill="#2E1065" />
          </g>
        );

      case 'drink':
        return (
          <g>
            <ellipse cx="100" cy="120" rx="40" ry="8" fill="rgba(0,0,0,0.12)" />
            {/* Glass body */}
            <path d="M72 44L78 116C78 120 88 122 100 122C112 122 122 120 122 116L128 44H72Z" fill="#FFFFFF" fillOpacity="0.85" stroke="#CBD5E1" strokeWidth="2" />
            {/* Creamy drink / Horchata liquid */}
            <path d="M74 60L78 116C78 119 88 121 100 121C112 121 122 119 122 116L126 60Z" fill="#FEF3C7" />
            {/* Cinnamon dust on top */}
            <path d="M74 60Q100 64 126 60" stroke="#92400E" strokeWidth="2" strokeDasharray="2,3" />
            {/* Ice cubes */}
            <rect x="86" y="70" width="14" height="14" rx="3" fill="#FFFFFF" fillOpacity="0.7" stroke="#CBD5E1" strokeWidth="1" transform="rotate(10 86 70)" />
            <rect x="100" y="82" width="13" height="13" rx="3" fill="#FFFFFF" fillOpacity="0.7" stroke="#CBD5E1" strokeWidth="1" transform="rotate(-8 100 82)" />
            {/* Colorful Straw */}
            <line x1="114" y1="24" x2="94" y2="114" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" />
            <line x1="113" y1="24" x2="95" y2="114" stroke="#FFF" strokeWidth="1.5" strokeDasharray="6,6" strokeLinecap="round" />
          </g>
        );

      default:
        return (
          <g>
            <circle cx="100" cy="80" r="36" fill="#FDBA74" />
            <circle cx="100" cy="80" r="28" fill="#FFFFFF" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative w-full ${heightClasses} flex items-center justify-center overflow-hidden rounded-2xl transition-transform duration-300 group-hover:scale-[1.02] ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 40%, #FFFFFF 20%, ${accentColor}15 70%, ${accentColor}28 100%)`,
      }}
    >
      {/* Background ambiance dots */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${accentColor}25 1.5px, transparent 1.5px)`,
          backgroundSize: '16px 16px',
        }}
      />

      <svg
        viewBox="0 0 200 150"
        className="w-full h-full max-h-[92%] p-2 drop-shadow-md z-10 transition-transform duration-300 group-hover:-translate-y-1"
        aria-label={name}
      >
        {renderIconGraphic()}
      </svg>
    </div>
  );
};
