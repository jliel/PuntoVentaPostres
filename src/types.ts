export type ProductCategory = 
  | 'all'
  | 'elotes'
  | 'hamburguesas'
  | 'crepas'
  | 'postres';

export type Language = 'es' | 'en';

export interface ProductOption {
  id: string;
  name: string;
  nameEn?: string;
  price: number; // 0 if included for free, or >0 for extra (e.g. +$15)
  isDefault?: boolean; // Pre-checked by default for customer
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  category: ProductCategory;
  price: number;
  costPrice?: number; // Cost of goods for profit calculation
  stock: number;
  minStock?: number; // Min threshold based on sales
  maxStock?: number; // Max batch capacity
  expiryDate?: string; // YYYY-MM-DD for expiration tracking
  totalSold?: number; // Track sales for dynamic restock recommendations
  description: string;
  descriptionEn?: string;
  ingredients?: string[];
  tags: string[]; // e.g. 'Favorito', 'Recién Hecho', 'Bestseller'
  options?: ProductOption[]; // Uber Eats-style customizable options (e.g. +Chile, +Queso, +Limón)
  isAvailable: boolean;
  accentColor: string;
  iconType: 'corn' | 'burger' | 'crepe' | 'dessert' | 'drink' | 'snack';
  imageUrl?: string;
  enhancedImageUrl?: string;
  isEnhanced?: boolean;
  bestSellingDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  dayRecommendationReason?: string;
  dayRecommendationReasonEn?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  specialInstructions?: string;
  selectedOptions?: ProductOption[];
  itemPrice?: number; // Unit price with selected options
}

export type PaymentMethodType = 'apple_pay' | 'google_pay' | 'card' | 'cash';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role?: 'admin' | 'customer';
  createdAt: string;
}

export type RawMaterialCategory = 
  | 'granos'
  | 'harinas'
  | 'untables'
  | 'lacteos'
  | 'frutas'
  | 'endulzantes'
  | 'empaques'
  | 'otros';

export type RawMaterialUnit = 
  | 'kg'
  | 'g'
  | 'piezas'
  | 'latas'
  | 'botes'
  | 'litros'
  | 'costales'
  | 'cajas';

export interface RawMaterial {
  id: string;
  name: string;
  nameEn?: string;
  category: RawMaterialCategory;
  quantity: number;
  unit: RawMaterialUnit;
  minStock: number; // Alert threshold
  expiryDate: string; // YYYY-MM-DD
  costPerUnit?: number;
  supplier?: string;
  lotNumber?: string;
  notes?: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tip: number;
  total: number;
  paymentMethod: PaymentMethodType;
  fulfillmentType: 'delivery' | 'pickup';
  customer: {
    name: string;
    phone: string;
    address?: string;
    instructions?: string;
    userId?: string;
  };
  status: OrderStatus;
  createdAt: string;
  dateStr?: string;
}
