import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  X, Plus, Edit2, Trash2, Check, AlertCircle, Package, 
  DollarSign, ShoppingBag, TrendingUp, Sparkles, Upload, 
  Camera, Image as ImageIcon, Wand2, Calendar, Clock, 
  AlertTriangle, ShieldCheck, ArrowUpRight, RotateCcw, ChevronRight, CheckCircle2,
  Wheat, Search, Filter, Layers, Database
} from 'lucide-react';
import { Product, Order, ProductCategory, OrderStatus, Language, RawMaterial, RawMaterialCategory, RawMaterialUnit, ProductOption } from '../types';
import { ProductVisual } from './ProductVisual';
import { enhanceFoodImage } from '../utils/imageEnhancer';
import { translations } from '../utils/i18n';
import { 
  fetchRawMaterialsFromFirestore, 
  saveRawMaterialToFirestore, 
  deleteRawMaterialFromFirestore 
} from '../lib/firebase';

interface AdminInventoryProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onResetToDefault: () => void;
  language: Language;
}

const DAYS_OF_WEEK: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'rm-1',
    name: 'Elotes tiernos amarillos (desgranados)',
    nameEn: 'Fresh yellow sweet corn (shelled)',
    category: 'granos',
    quantity: 35,
    unit: 'kg',
    minStock: 12,
    expiryDate: '2026-09-26',
    costPerUnit: 28.0,
    supplier: 'Mercado de Abastos Central',
    lotNumber: 'LT-ELOTE-09',
    notes: 'Maíz tierno para esquites con mayonesa y chile',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-2',
    name: 'Harina de trigo extra fina para crepas',
    nameEn: 'Extra-fine wheat flour for crepes',
    category: 'harinas',
    quantity: 25,
    unit: 'kg',
    minStock: 8,
    expiryDate: '2026-11-20',
    costPerUnit: 22.5,
    supplier: 'Molino San José',
    lotNumber: 'LT-HAR-401',
    notes: 'Cernida para masa suave y uniforme',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-3',
    name: 'Nutella original botes profesionales (3kg)',
    nameEn: 'Nutella hazelnut spread (3kg tub)',
    category: 'untables',
    quantity: 6,
    unit: 'botes',
    minStock: 3,
    expiryDate: '2027-01-15',
    costPerUnit: 340.0,
    supplier: 'Ferrero Foodservice',
    lotNumber: 'LT-NUT-88',
    notes: 'Untable estelar para crepas y postres',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-4',
    name: 'Mantequilla artesanal pura',
    nameEn: 'Pure artisanal butter',
    category: 'lacteos',
    quantity: 14,
    unit: 'kg',
    minStock: 5,
    expiryDate: '2026-10-05',
    costPerUnit: 140.0,
    supplier: 'Lácteos del Valle',
    lotNumber: 'LT-MANT-12',
    notes: 'Para dorar elotes y en la plancha de crepas',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-5',
    name: 'Queso Crema tipo Philadelphia',
    nameEn: 'Cream cheese blocks',
    category: 'lacteos',
    quantity: 9,
    unit: 'kg',
    minStock: 4,
    expiryDate: '2026-09-28',
    costPerUnit: 110.0,
    supplier: 'Distribuidora Cremera',
    lotNumber: 'LT-QCR-03',
    notes: 'Relleno de crepas dulces y pays',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-6',
    name: 'Fresas frescas de temporada',
    nameEn: 'Fresh seasonal strawberries',
    category: 'frutas',
    quantity: 5,
    unit: 'kg',
    minStock: 4,
    expiryDate: '2026-09-25',
    costPerUnit: 65.0,
    supplier: 'Rancho Agrícola Zamora',
    lotNumber: 'LT-FRS-99',
    notes: 'Desinfectar y mantener a 4°C',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-7',
    name: 'Leche condensada La Lechera',
    nameEn: 'Sweetened condensed milk',
    category: 'lacteos',
    quantity: 20,
    unit: 'latas',
    minStock: 6,
    expiryDate: '2027-02-28',
    costPerUnit: 34.0,
    supplier: 'Abarrotes El Sol',
    lotNumber: 'LT-LECH-55',
    notes: 'Topping de elotes y postres',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-8',
    name: 'Carne para hamburguesas artesanal 150g',
    nameEn: 'Handmade burger patties 150g',
    category: 'otros',
    quantity: 32,
    unit: 'piezas',
    minStock: 15,
    expiryDate: '2026-09-27',
    costPerUnit: 26.0,
    supplier: 'Carnicería Selecta',
    lotNumber: 'LT-BURG-77',
    notes: 'Carne molida magra de res fresca',
    updatedAt: new Date().toISOString(),
  },
];

const RAW_MATERIAL_PRESETS = [
  { name: 'Elotes tiernos amarillos', category: 'granos' as const, unit: 'kg' as const, defaultQty: 30, minStock: 10, cost: 28, days: 3 },
  { name: 'Harina de trigo extra fina', category: 'harinas' as const, unit: 'kg' as const, defaultQty: 25, minStock: 8, cost: 22.5, days: 60 },
  { name: 'Nutella original profesional (3kg)', category: 'untables' as const, unit: 'botes' as const, defaultQty: 5, minStock: 2, cost: 340, days: 120 },
  { name: 'Mantequilla artesanal pura', category: 'lacteos' as const, unit: 'kg' as const, defaultQty: 12, minStock: 4, cost: 140, days: 14 },
  { name: 'Queso Crema suave', category: 'lacteos' as const, unit: 'kg' as const, defaultQty: 8, minStock: 3, cost: 110, days: 6 },
  { name: 'Fresas frescas de temporada', category: 'frutas' as const, unit: 'kg' as const, defaultQty: 6, minStock: 3, cost: 65, days: 2 },
  { name: 'Leche condensada', category: 'lacteos' as const, unit: 'latas' as const, defaultQty: 18, minStock: 5, cost: 34, days: 150 },
  { name: 'Carne para hamburguesas 150g', category: 'otros' as const, unit: 'piezas' as const, defaultQty: 30, minStock: 12, cost: 26, days: 4 },
  { name: 'Azúcar refinada estándar', category: 'endulzantes' as const, unit: 'kg' as const, defaultQty: 20, minStock: 5, cost: 24, days: 300 },
];

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onResetToDefault,
  language,
}) => {
  const t = translations[language];

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'products' | 'raw_materials' | 'orders' | 'earnings' | 'recommendations'>('products');

  // Day filter for recommendations
  const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const dayKeyMap: ('sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday')[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  const todayKey = dayKeyMap[currentDayIndex];
  const [selectedDayView, setSelectedDayView] = useState<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>(todayKey);

  // Editing / adding product modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    nameEn: '',
    category: 'elotes',
    price: 55.0,
    costPrice: 18.0,
    stock: 20,
    minStock: 12,
    maxStock: 40,
    expiryDate: '2026-09-30',
    totalSold: 0,
    description: '',
    descriptionEn: '',
    ingredients: [],
    tags: ['Recién Hecho', 'Favorito'],
    isAvailable: true,
    accentColor: '#F59E0B',
    iconType: 'corn',
    imageUrl: '',
    enhancedImageUrl: '',
    isEnhanced: false,
    bestSellingDays: ['friday', 'saturday', 'sunday'],
    dayRecommendationReason: 'Excelente para consentir a los clientes en fin de semana.',
    dayRecommendationReasonEn: 'Great weekend crowd-pleaser item.',
  });

  const [ingredientsInput, setIngredientsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Customizable Uber-style dish options state (e.g. Chile, Queso, Limón)
  const [newOptName, setNewOptName] = useState('');
  const [newOptPrice, setNewOptPrice] = useState<string>('0');
  const [newOptDefault, setNewOptDefault] = useState<boolean>(true);

  const handleAddCustomOption = () => {
    if (!newOptName.trim()) return;
    const newOption: ProductOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newOptName.trim(),
      price: Math.max(0, parseFloat(newOptPrice) || 0),
      isDefault: newOptDefault,
    };
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
    setNewOptName('');
    setNewOptPrice('0');
    setNewOptDefault(true);
  };

  const handleRemoveOption = (optId: string) => {
    setFormData((prev) => ({
      ...prev,
      options: (prev.options || []).filter((o) => o.id !== optId),
    }));
  };

  const handleLoadOptionPreset = (preset: 'elote' | 'crepa' | 'burger') => {
    let presetOptions: ProductOption[] = [];
    if (preset === 'elote') {
      presetOptions = [
        { id: `opt-chile-p-${Date.now()}`, name: 'Chile del que pica (Piquín)', price: 0, isDefault: true },
        { id: `opt-chile-np-${Date.now()}`, name: 'Tajín del que no pica', price: 0, isDefault: false },
        { id: `opt-queso-${Date.now()}`, name: 'Queso cotija rallado', price: 0, isDefault: true },
        { id: `opt-limon-${Date.now()}`, name: 'Limón colima', price: 0, isDefault: true },
        { id: `opt-mayo-${Date.now()}`, name: 'Mayonesa artesanal', price: 0, isDefault: true },
        { id: `opt-queso-extra-${Date.now()}`, name: 'Queso amarillo fundido extra', price: 12, isDefault: false },
        { id: `opt-tuetano-${Date.now()}`, name: 'Tuétano asado extra', price: 25, isDefault: false },
      ];
    } else if (preset === 'crepa') {
      presetOptions = [
        { id: `opt-nutella-${Date.now()}`, name: 'Nutella original abundante', price: 0, isDefault: true },
        { id: `opt-fresas-${Date.now()}`, name: 'Fresas frescas rebanadas', price: 0, isDefault: true },
        { id: `opt-platano-${Date.now()}`, name: 'Plátano maduro rebanado', price: 0, isDefault: false },
        { id: `opt-nuez-${Date.now()}`, name: 'Nuez tostada', price: 10, isDefault: false },
        { id: `opt-phila-${Date.now()}`, name: 'Queso Philadelphia', price: 12, isDefault: false },
        { id: `opt-lechera-${Date.now()}`, name: 'Lechera condensada', price: 8, isDefault: false },
      ];
    } else if (preset === 'burger') {
      presetOptions = [
        { id: `opt-todo-${Date.now()}`, name: 'Con todo (lechuga, jitomate y salsas)', price: 0, isDefault: true },
        { id: `opt-sin-ceb-${Date.now()}`, name: 'Sin cebolla', price: 0, isDefault: false },
        { id: `opt-tocino-${Date.now()}`, name: 'Tocino crujiente ahumado', price: 18, isDefault: false },
        { id: `opt-queso-extra-${Date.now()}`, name: 'Queso cheddar extra fundido', price: 12, isDefault: false },
        { id: `opt-doble-carne-${Date.now()}`, name: 'Doble carne Angus jugosa', price: 35, isDefault: false },
      ];
    }
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), ...presetOptions],
    }));
  };

  // AI photo upload
  const [isEnhancingImage, setIsEnhancingImage] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');
  const [previewMode, setPreviewMode] = useState<'enhanced' | 'original'>('enhanced');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Financial Calculations ---
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  
  // Calculate cost and gross profit from orders
  const totalCost = orders.reduce((sum, order) => {
    const orderCost = order.items.reduce((itemSum, item) => {
      const itemCost = item.product.costPrice || (item.product.price * 0.35);
      return itemSum + itemCost * item.quantity;
    }, 0);
    return sum + orderCost;
  }, 0);

  const grossProfit = Math.max(0, totalRevenue - totalCost);
  const profitMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '62.5';
  const averageTicket = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00';

  // Payment Breakdown
  const paymentBreakdown = orders.reduce(
    (acc, o) => {
      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.total;
      return acc;
    },
    { apple_pay: 0, google_pay: 0, card: 0, cash: 0 } as Record<string, number>
  );

  // --- Inventory & Expiration Health Checks ---
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const getDaysUntilExpiry = (expiryDateStr?: string) => {
    if (!expiryDateStr) return 999;
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - todayDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const soldOutProductsCount = useMemo(() => {
    return products.filter((p) => !p.isAvailable || p.stock <= 0).length;
  }, [products]);

  // Toggle dish store availability (back in store vs paused/agotado)
  const handleToggleProductAvailability = (prod: Product) => {
    const isCurrentlyOut = !prod.isAvailable || prod.stock <= 0;
    onUpdateProduct({
      ...prod,
      isAvailable: isCurrentlyOut,
      stock: isCurrentlyOut && prod.stock <= 0 ? 25 : prod.stock,
    });
  };

  // Restock quick action (+15 units)
  const handleQuickRestock = (productId: string, amount = 15) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    onUpdateProduct({
      ...prod,
      stock: prod.stock + amount,
      isAvailable: true,
    });
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      nameEn: prod.nameEn || prod.name,
      category: prod.category,
      price: prod.price,
      costPrice: prod.costPrice || Math.round(prod.price * 0.35),
      stock: prod.stock,
      minStock: prod.minStock || 10,
      maxStock: prod.maxStock || 40,
      expiryDate: prod.expiryDate || '2026-09-30',
      totalSold: prod.totalSold || 0,
      description: prod.description,
      descriptionEn: prod.descriptionEn || prod.description,
      ingredients: prod.ingredients || [],
      tags: prod.tags || [],
      options: prod.options || [],
      isAvailable: prod.isAvailable,
      accentColor: prod.accentColor,
      iconType: prod.iconType,
      imageUrl: prod.imageUrl || '',
      enhancedImageUrl: prod.enhancedImageUrl || '',
      isEnhanced: prod.isEnhanced || false,
      bestSellingDays: prod.bestSellingDays || ['friday', 'saturday', 'sunday'],
      dayRecommendationReason: prod.dayRecommendationReason || 'Gran rotación en fin de semana.',
      dayRecommendationReasonEn: prod.dayRecommendationReasonEn || 'Strong weekend volume driver.',
    });
    setIngredientsInput((prod.ingredients || []).join(', '));
    setTagsInput((prod.tags || []).join(', '));
    setNewOptName('');
    setNewOptPrice('0');
    setNewOptDefault(true);
  };

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      nameEn: '',
      category: 'elotes',
      price: 50.0,
      costPrice: 16.0,
      stock: 25,
      minStock: 12,
      maxStock: 50,
      expiryDate: '2026-09-30',
      totalSold: 0,
      description: 'Delicioso platillo tradicional recién preparado con ingredientes de primera.',
      descriptionEn: 'Freshly prepared traditional specialty made with prime ingredients.',
      ingredients: ['Ingredientes frescos del día'],
      tags: ['Recién Hecho', 'Favorito'],
      options: [
        { id: `opt-chile-${Date.now()}`, name: 'Chile del que pica (Piquín)', price: 0, isDefault: true },
        { id: `opt-queso-${Date.now()}`, name: 'Queso cotija rallado', price: 0, isDefault: true },
        { id: `opt-limon-${Date.now()}`, name: 'Limón fresco', price: 0, isDefault: true },
      ],
      isAvailable: true,
      accentColor: '#F59E0B',
      iconType: 'corn',
      imageUrl: '',
      enhancedImageUrl: '',
      isEnhanced: false,
      bestSellingDays: ['friday', 'saturday', 'sunday'],
      dayRecommendationReason: 'Antojo estelar para ventas de fin de semana.',
      dayRecommendationReasonEn: 'Star crowd favorite for weekend rushes.',
    });
    setIngredientsInput('Ingredientes frescos del día');
    setTagsInput('Recién Hecho, Favorito');
    setNewOptName('');
    setNewOptPrice('0');
    setNewOptDefault(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      setFormData((prev) => ({
        ...prev,
        imageUrl: dataUrl,
        enhancedImageUrl: '',
        isEnhanced: false,
      }));

      await processAiEnhancement(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processAiEnhancement = async (imgDataUrl: string) => {
    setIsEnhancingImage(true);
    setAiStatusMessage(language === 'es' ? 'Realzando foto con IA...' : 'Enhancing photo with AI...');

    try {
      const canvasResult = await enhanceFoodImage(imgDataUrl);
      const enhancedImg = canvasResult.enhancedDataUrl;

      // Gemini AI server analysis
      let serverData = null;
      try {
        const response = await fetch('/api/enhance-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: enhancedImg,
            name: formData.name,
            category: formData.category,
            hint: formData.description,
          }),
        });
        if (response.ok) {
          serverData = await response.json();
        }
      } catch (err) {
        console.warn('AI call fallback:', err);
      }

      if (serverData && serverData.success) {
        setFormData((prev) => ({
          ...prev,
          name: serverData.enhancedName || prev.name || 'Postre Especial Postresito',
          description: serverData.enhancedDescription || prev.description,
          category: (serverData.category as ProductCategory) || prev.category,
          price: serverData.suggestedPrice || prev.price,
          imageUrl: imgDataUrl,
          enhancedImageUrl: enhancedImg,
          isEnhanced: true,
        }));
        if (serverData.ingredients) setIngredientsInput(serverData.ingredients.join(', '));
        if (serverData.tags) setTagsInput(serverData.tags.join(', '));
      } else {
        setFormData((prev) => ({
          ...prev,
          imageUrl: imgDataUrl,
          enhancedImageUrl: enhancedImg,
          isEnhanced: true,
        }));
      }

      setPreviewMode('enhanced');
      setAiStatusMessage(language === 'es' ? '¡Foto lista para vender!' : 'Photo ready to sell!');
      setTimeout(() => setAiStatusMessage(''), 2500);
    } catch (err) {
      console.error(err);
      setAiStatusMessage(language === 'es' ? 'Error al mejorar' : 'Enhance error');
    } finally {
      setIsEnhancingImage(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      ingredients: ingredientsInput.split(',').map((s) => s.trim()).filter(Boolean),
      tags: tagsInput.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (editingProduct) {
      onUpdateProduct({ ...finalData, id: editingProduct.id });
      setEditingProduct(null);
    } else if (isAddingNew) {
      onAddProduct(finalData);
      setIsAddingNew(false);
    }
  };

  // --- Raw Materials State & Logic ---
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('postresito_raw_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_RAW_MATERIALS;
  });

  useEffect(() => {
    fetchRawMaterialsFromFirestore()
      .then((items) => {
        if (items && items.length > 0) {
          setRawMaterials(items);
        }
      })
      .catch((e) => console.warn('Raw materials firestore sync notice:', e));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('postresito_raw_materials', JSON.stringify(rawMaterials));
    } catch (e) {
      console.error(e);
    }
  }, [rawMaterials]);

  const [editingRawMaterial, setEditingRawMaterial] = useState<RawMaterial | null>(null);
  const [isAddingRawMaterial, setIsAddingRawMaterial] = useState(false);
  const [rawMaterialSearch, setRawMaterialSearch] = useState('');
  const [rawMaterialCategoryFilter, setRawMaterialCategoryFilter] = useState<string>('all');

  const [rawFormData, setRawFormData] = useState<Omit<RawMaterial, 'id' | 'updatedAt'>>({
    name: '',
    nameEn: '',
    category: 'granos',
    quantity: 15,
    unit: 'kg',
    minStock: 5,
    expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    costPerUnit: 25,
    supplier: '',
    lotNumber: '',
    notes: '',
  });

  const rawMaterialsSummary = useMemo(() => {
    let urgentRestock = 0;
    let expiringSoon = 0;
    let expired = 0;
    let totalValue = 0;

    rawMaterials.forEach((rm) => {
      if (rm.quantity <= rm.minStock) urgentRestock++;
      const days = getDaysUntilExpiry(rm.expiryDate);
      if (days < 0) expired++;
      else if (days <= 3) expiringSoon++;
      totalValue += rm.quantity * (rm.costPerUnit || 0);
    });

    return { urgentRestock, expiringSoon, expired, totalValue };
  }, [rawMaterials]);

  const filteredRawMaterials = useMemo(() => {
    return rawMaterials.filter((rm) => {
      const matchesSearch = 
        rm.name.toLowerCase().includes(rawMaterialSearch.toLowerCase()) ||
        (rm.nameEn && rm.nameEn.toLowerCase().includes(rawMaterialSearch.toLowerCase())) ||
        (rm.supplier && rm.supplier.toLowerCase().includes(rawMaterialSearch.toLowerCase())) ||
        (rm.lotNumber && rm.lotNumber.toLowerCase().includes(rawMaterialSearch.toLowerCase()));
      
      const matchesCat = rawMaterialCategoryFilter === 'all' || rm.category === rawMaterialCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [rawMaterials, rawMaterialSearch, rawMaterialCategoryFilter]);

  const handleStartAddRaw = () => {
    setRawFormData({
      name: '',
      nameEn: '',
      category: 'granos',
      quantity: 15,
      unit: 'kg',
      minStock: 5,
      expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      costPerUnit: 25,
      supplier: '',
      lotNumber: `LT-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    });
    setEditingRawMaterial(null);
    setIsAddingRawMaterial(true);
  };

  const handleStartEditRaw = (rm: RawMaterial) => {
    setRawFormData({
      name: rm.name,
      nameEn: rm.nameEn || rm.name,
      category: rm.category,
      quantity: rm.quantity,
      unit: rm.unit,
      minStock: rm.minStock,
      expiryDate: rm.expiryDate,
      costPerUnit: rm.costPerUnit || 0,
      supplier: rm.supplier || '',
      lotNumber: rm.lotNumber || '',
      notes: rm.notes || '',
    });
    setEditingRawMaterial(rm);
    setIsAddingRawMaterial(true);
  };

  const handleApplyPresetRaw = (preset: typeof RAW_MATERIAL_PRESETS[0]) => {
    const expDate = new Date(Date.now() + preset.days * 86400000).toISOString().split('T')[0];
    setRawFormData((prev) => ({
      ...prev,
      name: preset.name,
      nameEn: preset.name,
      category: preset.category,
      quantity: preset.defaultQty,
      unit: preset.unit,
      minStock: preset.minStock,
      costPerUnit: preset.cost,
      expiryDate: expDate,
      supplier: 'Proveedor Directo',
      lotNumber: `LT-${preset.category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    }));
  };

  const handleSaveRawMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawFormData.name.trim()) return;

    if (editingRawMaterial) {
      const updated: RawMaterial = {
        ...editingRawMaterial,
        ...rawFormData,
        updatedAt: new Date().toISOString(),
      };
      setRawMaterials((prev) =>
        prev.map((item) => (item.id === editingRawMaterial.id ? updated : item))
      );
      saveRawMaterialToFirestore(updated).catch((err) => console.error(err));
    } else {
      const newItem: RawMaterial = {
        ...rawFormData,
        id: `rm-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      setRawMaterials((prev) => [newItem, ...prev]);
      saveRawMaterialToFirestore(newItem).catch((err) => console.error(err));
    }
    setIsAddingRawMaterial(false);
    setEditingRawMaterial(null);
  };

  const handleDeleteRawMaterial = (id: string) => {
    setRawMaterials((prev) => prev.filter((item) => item.id !== id));
    deleteRawMaterialFromFirestore(id).catch((err) => console.error(err));
  };

  const handleQuickRestockRaw = (id: string, amount: number) => {
    setRawMaterials((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, quantity: item.quantity + amount };
          saveRawMaterialToFirestore(updated).catch((err) => console.error(err));
          return updated;
        }
        return item;
      })
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#02043f] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d30045] border border-[#ffc540] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base sm:text-lg font-bold">{t.adminTitle}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffc540]/20 text-[#ffc540] font-semibold border border-[#ffc540]/40">
                  <ShieldCheck className="w-3 h-3 inline mr-1" />
                  {language === 'es' ? 'Cuenta Administrador Activa' : 'Admin Account Active'}
                </span>
              </div>
              <p className="text-[11px] text-stone-300">{t.adminSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs - permanently stuck at top, never covered */}
        <div className="shrink-0 sticky top-0 z-20 flex border-b border-stone-200 bg-[#f4f0ef] px-3 sm:px-4 gap-1.5 overflow-x-auto scrollbar-none shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#d30045] text-[#d30045] bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-stone-600 hover:text-[#d30045] hover:bg-stone-200/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.tabProducts} ({products.length})</span>
            {soldOutProductsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {soldOutProductsCount} {language === 'es' ? 'agotados' : 'sold out'}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw_materials')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'raw_materials'
                ? 'border-[#d30045] text-[#d30045] bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-stone-600 hover:text-[#d30045] hover:bg-stone-200/60'
            }`}
          >
            <Wheat className="w-4 h-4 text-[#ff9400]" />
            <span>{language === 'es' ? 'Materias Primas & Caducidad' : 'Raw Materials & Expiry'}</span>
            {(rawMaterialsSummary.urgentRestock > 0 || rawMaterialsSummary.expiringSoon > 0) && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#d30045] text-white text-[10px] font-bold">
                {rawMaterialsSummary.urgentRestock + rawMaterialsSummary.expiringSoon}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#d30045] text-[#d30045] bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-stone-600 hover:text-[#d30045] hover:bg-stone-200/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.tabOrders} ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('earnings')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'earnings'
                ? 'border-[#d30045] text-[#d30045] bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-stone-600 hover:text-[#d30045] hover:bg-stone-200/60'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{t.tabEarnings}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'recommendations'
                ? 'border-[#d30045] text-[#d30045] bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-stone-600 hover:text-[#d30045] hover:bg-stone-200/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.dailyRecommendationsTitle}</span>
          </button>
        </div>

        {/* Tab Content Body - strictly scrolls internally */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-stone-50 space-y-6">
          {/* TAB 1: EARNINGS DASHBOARD */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              {/* Top Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-xs font-semibold">{t.totalRevenue}</span>
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="font-mono text-2xl sm:text-3xl font-extrabold text-stone-900">
                    ${totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {orders.length} {t.totalOrdersCount.toLowerCase()}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-xs font-semibold">{t.grossProfit}</span>
                    <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="font-mono text-2xl sm:text-3xl font-extrabold text-stone-900">
                    ${grossProfit.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-2 font-semibold">
                    {profitMarginPercent}% {language === 'es' ? 'margen promedio' : 'avg margin'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-xs font-semibold">{t.averageTicket}</span>
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                      <ShoppingBag className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="font-mono text-2xl sm:text-3xl font-extrabold text-stone-900">
                    ${averageTicket}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-2">
                    {language === 'es' ? 'Por cliente ordenado' : 'Per customer order'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-xs font-semibold">{t.totalOrdersCount}</span>
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="font-mono text-2xl sm:text-3xl font-extrabold text-stone-900">
                    {orders.length}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-2 font-semibold">
                    {orders.filter((o) => o.status === 'completed').length} {language === 'es' ? 'entregados con éxito' : 'completed successfully'}
                  </p>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
                <h3 className="font-heading text-sm font-bold text-stone-900 mb-4">
                  {t.paymentBreakdown}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-xs text-stone-500 block font-medium">Apple Pay</span>
                    <span className="font-mono text-lg font-bold text-stone-900 block mt-1">
                      ${paymentBreakdown.apple_pay.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {totalRevenue > 0 ? ((paymentBreakdown.apple_pay / totalRevenue) * 100).toFixed(0) : 0}% del total
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-xs text-stone-500 block font-medium">Google Pay</span>
                    <span className="font-mono text-lg font-bold text-stone-900 block mt-1">
                      ${paymentBreakdown.google_pay.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {totalRevenue > 0 ? ((paymentBreakdown.google_pay / totalRevenue) * 100).toFixed(0) : 0}% del total
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-xs text-stone-500 block font-medium">{t.card}</span>
                    <span className="font-mono text-lg font-bold text-stone-900 block mt-1">
                      ${paymentBreakdown.card.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {totalRevenue > 0 ? ((paymentBreakdown.card / totalRevenue) * 100).toFixed(0) : 0}% del total
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-xs text-stone-500 block font-medium">{t.cash}</span>
                    <span className="font-mono text-lg font-bold text-stone-900 block mt-1">
                      ${paymentBreakdown.cash.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {totalRevenue > 0 ? ((paymentBreakdown.cash / totalRevenue) * 100).toFixed(0) : 0}% del total
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Performance Overview */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-sm font-bold text-stone-900">
                    {t.earningsTimeline}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    Margen de Ganancia Saludable (+{profitMarginPercent}%)
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'es'
                    ? 'Los productos de mayor rentabilidad son los Churros Artesanales y las Crepas Nutella (costo de insumos menor al 30%). La venta de Elotes y Hamburguesas impulsa el ticket promedio más alto.'
                    : 'Highest margin items are Artisan Churros and Nutella Crepes (food cost under 30%). Street Corn and Gourmet Burgers drive the highest average order volume.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB: RAW MATERIALS & INGREDIENTS EXPIRATION TRACKER */}
          {activeTab === 'raw_materials' && (
            <div className="space-y-6">
              {/* Header & Quick Action */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Wheat className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-stone-900">
                      {language === 'es' ? 'Control de Materias Primas e Insumos' : 'Raw Materials & Ingredients Tracker'}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    {language === 'es'
                      ? 'Registra y monitorea elotes, harina, nutella, mantequilla, empaques y sus fechas de caducidad.'
                      : 'Register and monitor corn, flour, nutella, butter, packaging, and shelf-life expiration.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartAddRaw}
                  className="px-4 py-2.5 bg-[#2C592E] hover:bg-[#224424] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#BED966]" />
                  <span>{language === 'es' ? 'Registrar Materia Prima' : 'Register Raw Material'}</span>
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-stone-200">
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1">
                    {language === 'es' ? 'Total Insumos' : 'Total Items'}
                  </span>
                  <span className="font-mono font-bold text-xl text-stone-900">
                    {rawMaterials.length}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    {language === 'es' ? 'Registrados en almacén' : 'Active inventory lines'}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${rawMaterialsSummary.expiringSoon > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-stone-200'}`}>
                  <span className="text-[11px] font-semibold text-amber-900 block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {language === 'es' ? 'Por Caducar (≤ 3d)' : 'Expiring Soon (≤ 3d)'}
                  </span>
                  <span className="font-mono font-bold text-xl text-amber-800">
                    {rawMaterialsSummary.expiringSoon}
                  </span>
                  <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
                    {language === 'es' ? 'Priorizar en producción' : 'Prioritize prep use'}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${rawMaterialsSummary.urgentRestock > 0 ? 'bg-rose-50/70 border-rose-300' : 'bg-white border-stone-200'}`}>
                  <span className="text-[11px] font-semibold text-rose-900 block mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    {language === 'es' ? 'Stock Bajo Mínimo' : 'Low / Under Min'}
                  </span>
                  <span className="font-mono font-bold text-xl text-rose-700">
                    {rawMaterialsSummary.urgentRestock}
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">
                    {language === 'es' ? 'Hacer pedido a proveedor' : 'Order from supplier'}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200">
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1">
                    {language === 'es' ? 'Valor del Inventario' : 'Inventory Value'}
                  </span>
                  <span className="font-mono font-bold text-xl text-emerald-700">
                    ${rawMaterialsSummary.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    {language === 'es' ? 'Costo total invertido' : 'Total capital in raw items'}
                  </span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rawMaterialSearch}
                    onChange={(e) => setRawMaterialSearch(e.target.value)}
                    placeholder={language === 'es' ? 'Buscar elotes, harina, nutella, proveedor o lote...' : 'Search corn, flour, nutella, supplier, lot...'}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-stone-400 shrink-0" />
                  <select
                    value={rawMaterialCategoryFilter}
                    onChange={(e) => setRawMaterialCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    <option value="all">{language === 'es' ? 'Todas las Categorías' : 'All Categories'}</option>
                    <option value="granos">🌽 Granos y Maíz</option>
                    <option value="harinas">🌾 Harinas y Masas</option>
                    <option value="untables">🍫 Untables y Cremas</option>
                    <option value="lacteos">🥛 Lácteos y Mantequillas</option>
                    <option value="frutas">🍓 Frutas Frescas</option>
                    <option value="endulzantes">🍬 Azúcar y Endulzantes</option>
                    <option value="empaques">📦 Empaques y Desechables</option>
                    <option value="otros">🍔 Otros Insumos</option>
                  </select>
                </div>
              </div>

              {/* Raw Materials Table */}
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-600">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">{language === 'es' ? 'Materia Prima / Insumo' : 'Raw Material'}</th>
                        <th className="py-3 px-4">{language === 'es' ? 'Categoría' : 'Category'}</th>
                        <th className="py-3 px-4">{language === 'es' ? 'Stock Actual' : 'Current Stock'}</th>
                        <th className="py-3 px-4">{language === 'es' ? 'Mínimo Alerta' : 'Min Alert'}</th>
                        <th className="py-3 px-4">{language === 'es' ? 'Caducidad' : 'Expiry Date'}</th>
                        <th className="py-3 px-4">{language === 'es' ? 'Estado' : 'Freshness'}</th>
                        <th className="py-3 px-4">{language === 'es' ? 'Costo Unit.' : 'Unit Cost'}</th>
                        <th className="py-3 px-4 text-right">{language === 'es' ? 'Acciones' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {filteredRawMaterials.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-stone-400">
                            {language === 'es' ? 'No se encontraron materias primas con ese filtro.' : 'No raw materials found.'}
                          </td>
                        </tr>
                      ) : (
                        filteredRawMaterials.map((rm) => {
                          const daysLeft = getDaysUntilExpiry(rm.expiryDate);
                          const isLow = rm.quantity <= rm.minStock;
                          const isExpired = daysLeft < 0;
                          const isExpiringSoon = daysLeft >= 0 && daysLeft <= 3;

                          const categoryBadgeColors: Record<string, string> = {
                            granos: 'bg-amber-100 text-amber-800 border-amber-200',
                            harinas: 'bg-stone-100 text-stone-800 border-stone-200',
                            untables: 'bg-orange-100 text-orange-800 border-orange-200',
                            lacteos: 'bg-blue-50 text-blue-800 border-blue-200',
                            frutas: 'bg-rose-50 text-rose-800 border-rose-200',
                            endulzantes: 'bg-purple-50 text-purple-800 border-purple-200',
                            empaques: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                            otros: 'bg-stone-100 text-stone-700 border-stone-200',
                          };

                          return (
                            <tr key={rm.id} className="hover:bg-stone-50/80 transition">
                              <td className="py-3 px-4 font-semibold text-stone-900">
                                <div className="flex flex-col">
                                  <span>{language === 'en' && rm.nameEn ? rm.nameEn : rm.name}</span>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                                    {rm.lotNumber && <span>Lote: {rm.lotNumber}</span>}
                                    {rm.supplier && <span>· Prov: {rm.supplier}</span>}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${categoryBadgeColors[rm.category] || 'bg-stone-100 text-stone-800'}`}>
                                  {rm.category}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-bold text-xs ${isLow ? 'text-rose-600' : 'text-stone-900'}`}>
                                    {rm.quantity} {rm.unit}
                                  </span>
                                  {isLow && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[9px] font-bold uppercase">
                                      Bajo
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4 font-mono text-stone-500">
                                {rm.minStock} {rm.unit}
                              </td>

                              <td className="py-3 px-4 font-mono text-stone-700">
                                {rm.expiryDate}
                              </td>

                              <td className="py-3 px-4">
                                {isExpired ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    {language === 'es' ? `Caducó hace ${Math.abs(daysLeft)}d` : `Expired ${Math.abs(daysLeft)}d ago`}
                                  </span>
                                ) : isExpiringSoon ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    {language === 'es' ? `Vence en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}` : `Exp. in ${daysLeft}d`}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    {language === 'es' ? `Fresco (${daysLeft}d)` : `Fresh (${daysLeft}d)`}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 font-mono text-stone-800">
                                ${(rm.costPerUnit || 0).toFixed(2)}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickRestockRaw(rm.id, rm.unit === 'kg' ? 5 : 2)}
                                    className="px-2 py-1 bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-orange-700 rounded-lg text-[10px] font-bold transition border border-stone-200 cursor-pointer"
                                    title={language === 'es' ? 'Reabastecer rápido' : 'Quick restock'}
                                  >
                                    +{rm.unit === 'kg' ? 5 : 2}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditRaw(rm)}
                                    className="p-1.5 text-stone-400 hover:text-orange-600 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                                    title={language === 'es' ? 'Editar' : 'Edit'}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRawMaterial(rm.id)}
                                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                    title={language === 'es' ? 'Eliminar' : 'Delete'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* TAB 3: DAY-OF-WEEK SALES RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {/* Day Selector Pills */}
              <div className="bg-white p-4 rounded-3xl border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-stone-900">
                      {t.dailyRecommendationsTitle}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t.todayIs}: <strong className="text-orange-600 uppercase">{t.days[todayKey]}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {DAYS_OF_WEEK.map((dayKey) => {
                    const isSelected = selectedDayView === dayKey;
                    const isToday = todayKey === dayKey;

                    return (
                      <button
                        key={dayKey}
                        onClick={() => setSelectedDayView(dayKey)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        <span>{t.days[dayKey]}</span>
                        {isToday && (
                          <span className="text-[9px] bg-orange-600 text-white px-1.5 py-0.2 rounded-md font-bold uppercase">
                            Hoy
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Intelligence Strategy Banner */}
              <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wide">
                    {language === 'es' ? `Estrategia de Ventas: ${t.days[selectedDayView]}` : `Sales Strategy: ${t.days[selectedDayView]}`}
                  </h4>
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                    {t.daysSuggestions[selectedDayView]}
                  </p>
                </div>
              </div>

              {/* Filtered Recommended Products for this specific day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter((p) => p.bestSellingDays?.includes(selectedDayView))
                  .map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                            ⭐ Recomendado para {t.days[selectedDayView]}
                          </span>
                          <span className="font-mono text-xs font-bold text-stone-900">
                            ${prod.price.toFixed(2)}
                          </span>
                        </div>

                        <h4 className="font-heading font-bold text-sm text-stone-900">
                          {language === 'en' && prod.nameEn ? prod.nameEn : prod.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {language === 'en' && prod.descriptionEn ? prod.descriptionEn : prod.description}
                        </p>

                        <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-[11px] text-stone-600">
                          <span className="font-semibold text-stone-800 block mb-0.5">
                            {t.whySellToday}
                          </span>
                          <span>
                            {language === 'en' && prod.dayRecommendationReasonEn
                              ? prod.dayRecommendationReasonEn
                              : prod.dayRecommendationReason || 'Alta demanda de fin de semana.'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                        <span>Stock disponible: <strong className="text-stone-900">{prod.stock} pzs</strong></span>
                        <span className="text-emerald-600 font-semibold font-mono">
                          +{prod.totalSold || 0} vendidos
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCT CATALOG (Add / Edit / Photo IA) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
                <div>
                  <h3 className="font-heading text-sm font-bold text-stone-900">Catálogo de Postresito</h3>
                  <p className="text-xs text-stone-500">Elotes, hamburguesas, crepas y postres con fotos listas para venta</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onResetToDefault}
                    className="px-3 py-2 border border-stone-300 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer</span>
                  </button>
                  <button
                    onClick={handleStartAdd}
                    className="px-4 py-2 bg-[#d30045] hover:bg-[#b5003b] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#ffc540]" />
                    <span>Nuevo Platillo</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-600">
                    <thead className="bg-stone-100/70 text-stone-700 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Platillo</th>
                        <th className="py-3 px-4">Categoría</th>
                        <th className="py-3 px-4">Precio / Costo</th>
                        <th className="py-3 px-4">Estado en Tienda (1-Clic)</th>
                        <th className="py-3 px-4">Stock & Reabastecer</th>
                        <th className="py-3 px-4">Foto IA</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {products.map((prod) => {
                        const isOutOfStock = !prod.isAvailable || prod.stock <= 0;
                        return (
                          <tr key={prod.id} className="hover:bg-stone-50 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                                  <ProductVisual product={prod} size="sm" className="h-full" />
                                </div>
                                <div>
                                  <span className="font-bold text-stone-900 block">
                                    {language === 'en' && prod.nameEn ? prod.nameEn : prod.name}
                                  </span>
                                  <span className="text-[11px] text-stone-500 line-clamp-1">
                                    {language === 'en' && prod.descriptionEn ? prod.descriptionEn : prod.description}
                                  </span>
                                  {prod.options && prod.options.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                      <span className="text-[10px] bg-[#fff8e5] text-[#02043f] border border-[#ff9400]/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5 text-[#ff9400]" />
                                        <span>Uber ({prod.options.length})</span>
                                      </span>
                                      <span className="text-[10px] text-stone-500 truncate max-w-[200px]">
                                        {prod.options.map((o) => o.name).join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 capitalize">{prod.category}</td>
                            <td className="py-3 px-4 font-mono font-bold text-stone-900">
                              ${prod.price.toFixed(2)} <span className="text-stone-400 font-normal">/ ${(prod.costPrice || prod.price * 0.35).toFixed(2)}</span>
                            </td>

                            {/* 1-CLIC STORE AVAILABILITY TOGGLE */}
                            <td className="py-3 px-4">
                              {isOutOfStock ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductAvailability(prod)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-emerald-600 hover:text-white text-rose-800 border border-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs group"
                                  title="Clic para poner en tienda con 25 unidades"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 group-hover:bg-white inline-block animate-pulse" />
                                  <span>{language === 'es' ? 'Agotado · Poner en Tienda' : 'Sold Out · Put Back in Store'}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductAvailability(prod)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-rose-600 hover:text-white text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs group"
                                  title="Clic para pausar o agotar platillo"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 group-hover:bg-white inline-block" />
                                  <span>{language === 'es' ? '✓ En Tienda · Pausar' : '✓ In Store · Pause'}</span>
                                </button>
                              )}
                            </td>

                            {/* STOCK & REABASTECER RÁPIDO */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                                  prod.stock === 0 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-800'
                                }`}>
                                  {prod.stock} pzs
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickRestock(prod.id, 15)}
                                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-[#d30045] hover:text-white text-stone-700 font-bold text-[10px] transition cursor-pointer border border-stone-200"
                                  title="Reabastecer +15 piezas y reactivar en tienda"
                                >
                                  +15
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickRestock(prod.id, 30)}
                                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-[#02043f] hover:text-white text-stone-700 font-bold text-[10px] transition cursor-pointer border border-stone-200"
                                  title="Reabastecer +30 piezas y reactivar en tienda"
                                >
                                  +30
                                </button>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {prod.enhancedImageUrl ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                  <Sparkles className="w-3 h-3 text-amber-500" /> IA Lista
                                </span>
                              ) : (
                                <span className="text-[11px] text-stone-400">Ilustración</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStartEdit(prod)}
                                  className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                                  title="Editar platillo"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => confirm(`¿Eliminar "${prod.name}"?`) && onDeleteProduct(prod.id)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Eliminar platillo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200">
                <h3 className="font-heading text-sm font-bold text-stone-900">Control de Pedidos en Vivo</h3>
                <p className="text-xs text-stone-500">Historial completo con montos y estados de cocina</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
                  <ShoppingBag className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                  <p className="text-xs font-semibold text-stone-700">Aún no hay pedidos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-stone-900">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 uppercase font-semibold">
                            {ord.fulfillmentType === 'delivery' ? '🛵 Entrega' : '🏪 Recoger'}
                          </span>
                          <span className="text-xs text-stone-400">{ord.createdAt}</span>
                        </div>
                        <p className="text-xs font-semibold text-stone-800">
                          Cliente: {ord.customer.name} ({ord.customer.phone})
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {ord.items.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="font-mono font-bold text-base text-stone-900">
                          ${ord.total.toFixed(2)}
                        </span>
                        <select
                          value={ord.status}
                          onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        >
                          <option value="received">Recibido</option>
                          <option value="preparing">En Preparación</option>
                          <option value="ready">Listo para Entrega</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal: Add or Edit Product */}
        {(editingProduct || isAddingNew) && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto">
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
                <h3 className="font-heading text-sm font-bold">
                  {editingProduct ? 'Editar Platillo' : 'Nuevo Platillo con Foto IA'}
                </h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsAddingNew(false);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Photo Upload with AI enhancement */}
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-orange-600" />
                        <span>Fotografía y Optimización IA</span>
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        Sube una foto y la IA ajustará color, contraste y apetito visual.
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Foto</span>
                    </button>
                  </div>

                  {(formData.imageUrl || formData.enhancedImageUrl) && (
                    <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 max-h-52 flex items-center justify-center">
                      <img
                        src={previewMode === 'enhanced' && formData.enhancedImageUrl ? formData.enhancedImageUrl : formData.imageUrl}
                        alt="Vista previa"
                        className="w-full max-h-52 object-cover"
                      />
                      {formData.enhancedImageUrl && (
                        <div className="absolute bottom-2 left-2 flex items-center bg-stone-900/80 backdrop-blur-md p-1 rounded-xl border border-white/20 text-[10px] font-bold text-white">
                          <button
                            type="button"
                            onClick={() => setPreviewMode('enhanced')}
                            className={`px-2 py-0.5 rounded-lg ${previewMode === 'enhanced' ? 'bg-amber-500 text-stone-900' : 'text-stone-300'}`}
                          >
                            ✨ IA Lista
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewMode('original')}
                            className={`px-2 py-0.5 rounded-lg ${previewMode === 'original' ? 'bg-white/20 text-white' : 'text-stone-300'}`}
                          >
                            Original
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {aiStatusMessage && (
                    <p className="text-xs font-semibold text-orange-800 bg-orange-100 px-3 py-1.5 rounded-xl">
                      {aiStatusMessage}
                    </p>
                  )}
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nombre (Español) *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nombre (Inglés / English)</label>
                    <input
                      type="text"
                      value={formData.nameEn || ''}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Traditional Street Corn"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Categoría *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="elotes">🌽 Elotes & Esquites</option>
                      <option value="hamburguesas">🍔 Hamburguesas</option>
                      <option value="crepas">🥞 Crepas</option>
                      <option value="postres">🍰 Postres & Bebidas</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Precio Venta ($) *</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Costo ($)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={formData.costPrice || 0}
                        onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Stock Actual</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Mínimo</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minStock || 10}
                        onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 10 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Máximo</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxStock || 40}
                        onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value, 10) || 40 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>
                  </div>

                  {/* Disponibilidad en Tienda & Estado */}
                  <div className="p-3.5 rounded-2xl border bg-stone-50 border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-stone-900">
                          Disponibilidad en Tienda
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {formData.isAvailable && formData.stock > 0
                            ? '✓ En Tienda: visible y comprable en el menú'
                            : '🔴 Agotado: pausado en el menú'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            isAvailable: !prev.isAvailable,
                            stock: !prev.isAvailable && prev.stock <= 0 ? 25 : prev.stock,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          formData.isAvailable && formData.stock > 0
                            ? 'bg-emerald-600 hover:bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-600 hover:bg-emerald-600 text-white shadow-xs'
                        }`}
                      >
                        {formData.isAvailable && formData.stock > 0 ? '✓ En Tienda' : 'Poner en Tienda'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
                      <span className="text-[10px] text-stone-500 font-semibold">Reabastecer rápido:</span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, stock: prev.stock + 15, isAvailable: true }))}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-300 hover:bg-[#d30045] hover:text-white transition cursor-pointer"
                      >
                        +15 pzs
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, stock: prev.stock + 30, isAvailable: true }))}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-300 hover:bg-[#d30045] hover:text-white transition cursor-pointer"
                      >
                        +30 pzs
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                {/* Uber Eats Style Dish Options Config (Add chile, cheese, lemon, etc.) */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <span>Opciones y Complementos al Gusto (Estilo Uber)</span>
                      </h4>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Permite a tus clientes personalizar su orden como en Uber Eats (ej. Elote: agregar chile, queso, limón, mayonesa).
                      </p>
                    </div>
                    <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full shrink-0 self-start sm:self-auto">
                      {(formData.options || []).length} opciones
                    </span>
                  </div>

                  {/* Fast template buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-stone-500 font-semibold">Plantillas rápidas:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadOptionPreset('elote')}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      🌽 Elote / Esquites
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadOptionPreset('crepa')}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      🥞 Crepas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadOptionPreset('burger')}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      🍔 Hamburguesas
                    </button>
                  </div>

                  {/* Options List */}
                  <div className="space-y-1.5 pt-1">
                    {formData.options && formData.options.length > 0 ? (
                      formData.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                            <span className="font-semibold text-stone-800">{opt.name}</span>
                            {opt.isDefault && (
                              <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                Por defecto
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {opt.price > 0 ? (
                              <span className="font-mono text-xs font-bold text-orange-700">
                                +${opt.price.toFixed(2)} MXN
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                                Gratis / Incluido
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(opt.id)}
                              className="text-stone-400 hover:text-rose-600 p-1 transition cursor-pointer"
                              title="Eliminar opción"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-stone-500 italic p-2 rounded-xl bg-white/70 border border-dashed border-amber-300 text-center">
                        No hay opciones configuradas todavía. Usa una plantilla de arriba o agrega una abajo.
                      </p>
                    )}
                  </div>

                  {/* Form to add a new option */}
                  <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nombre (ej. Chile piquín, Queso extra, Limón)"
                      value={newOptName}
                      onChange={(e) => setNewOptName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomOption();
                        }
                      }}
                      className="w-full sm:flex-1 text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] text-stone-500 font-medium">Extra $:</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={newOptPrice}
                          onChange={(e) => setNewOptPrice(e.target.value)}
                          className="w-16 text-xs px-2 py-2 rounded-xl border border-stone-300 font-mono bg-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                          title="Precio extra en MXN (0 = gratis)"
                        />
                      </div>

                      <label className="flex items-center gap-1 text-[11px] text-stone-700 font-medium cursor-pointer shrink-0 select-none">
                        <input
                          type="checkbox"
                          checked={newOptDefault}
                          onChange={(e) => setNewOptDefault(e.target.checked)}
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span>Por defecto</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleAddCustomOption}
                        className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsAddingNew(false);
                    }}
                    className="px-4 py-2 border border-stone-300 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-100 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Platillo</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add or Edit Raw Material */}
        {(editingRawMaterial || isAddingRawMaterial) && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto">
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                    <Wheat className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading text-sm font-bold">
                    {editingRawMaterial
                      ? (language === 'es' ? 'Editar Materia Prima' : 'Edit Raw Material')
                      : (language === 'es' ? 'Registrar Nueva Materia Prima' : 'Register New Raw Material')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRawMaterial(null);
                    setIsAddingRawMaterial(false);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRawMaterial} className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* 1-Click Fast Presets */}
                {!editingRawMaterial && (
                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                    <span className="text-[11px] font-bold text-amber-900 block">
                      {language === 'es' ? '⚡ Relleno Rápido de Insumos Frecuentes:' : '⚡ 1-Click Common Presets:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {RAW_MATERIAL_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleApplyPresetRaw(preset)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 text-[11px] font-semibold transition shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <span>{preset.name.split(' ')[0]} {preset.name.split(' ')[1] || ''}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'es' ? 'Nombre del Insumo / Materia Prima *' : 'Ingredient / Material Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'es' ? 'Ej. Elotes tiernos desgranados, Harina para crepas, Nutella 3kg...' : 'e.g. Shelled corn, Crepe flour, Nutella 3kg...'}
                      value={rawFormData.name}
                      onChange={(e) => setRawFormData({ ...rawFormData, name: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {language === 'es' ? 'Categoría' : 'Category'}
                      </label>
                      <select
                        value={rawFormData.category}
                        onChange={(e) => setRawFormData({ ...rawFormData, category: e.target.value as RawMaterialCategory })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="granos">🌽 Granos y Maíz (Elotes/Esquites)</option>
                        <option value="harinas">🌾 Harinas y Masas</option>
                        <option value="untables">🍫 Untables y Chocolates (Nutella)</option>
                        <option value="lacteos">🥛 Lácteos, Quesos y Mantequillas</option>
                        <option value="frutas">🍓 Frutas y Fresas</option>
                        <option value="endulzantes">🍬 Azúcares y Jarabes</option>
                        <option value="empaques">📦 Empaques, Vasos y Cucharas</option>
                        <option value="otros">🍔 Otros Insumos (Carnes, etc.)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {language === 'es' ? 'Unidad de Medida' : 'Measurement Unit'}
                      </label>
                      <select
                        value={rawFormData.unit}
                        onChange={(e) => setRawFormData({ ...rawFormData, unit: e.target.value as RawMaterialUnit })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="g">Gramos (g)</option>
                        <option value="botes">Botes / Frascos (botes)</option>
                        <option value="latas">Latas (latas)</option>
                        <option value="litros">Litros (L)</option>
                        <option value="piezas">Piezas (pzas)</option>
                        <option value="costales">Costales (costales)</option>
                        <option value="cajas">Cajas (cajas)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {language === 'es' ? 'Cantidad Actual *' : 'Current Quantity *'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={rawFormData.quantity}
                        onChange={(e) => setRawFormData({ ...rawFormData, quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {language === 'es' ? 'Stock Mínimo (Alerta)' : 'Min Alert Level'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={rawFormData.minStock}
                        onChange={(e) => setRawFormData({ ...rawFormData, minStock: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {language === 'es' ? 'Costo por Unidad ($)' : 'Unit Cost ($)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={rawFormData.costPerUnit || 0}
                        onChange={(e) => setRawFormData({ ...rawFormData, costPerUnit: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {language === 'es' ? 'Fecha de Caducidad *' : 'Expiration Date *'}
                      </label>
                      <input
                        type="date"
                        required
                        value={rawFormData.expiryDate}
                        onChange={(e) => setRawFormData({ ...rawFormData, expiryDate: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {language === 'es' ? 'Lote (Opcional)' : 'Lot / Batch Number'}
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. LT-202609-01"
                        value={rawFormData.lotNumber || ''}
                        onChange={(e) => setRawFormData({ ...rawFormData, lotNumber: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'es' ? 'Proveedor (Opcional)' : 'Supplier (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Mercado Central, Ferrero Foodservice, Rancho Agrícola..."
                      value={rawFormData.supplier || ''}
                      onChange={(e) => setRawFormData({ ...rawFormData, supplier: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'es' ? 'Notas o Instrucciones de Conservación' : 'Storage / Conservation Notes'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={language === 'es' ? 'Ej. Mantener refrigerado a 4°C, cernir antes de usar...' : 'e.g. Keep refrigerated at 4°C, sift before using...'}
                      value={rawFormData.notes || ''}
                      onChange={(e) => setRawFormData({ ...rawFormData, notes: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRawMaterial(null);
                      setIsAddingRawMaterial(false);
                    }}
                    className="px-4 py-2 border border-stone-300 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-100 transition cursor-pointer"
                  >
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingRawMaterial ? (language === 'es' ? 'Guardar Cambios' : 'Save Changes') : (language === 'es' ? 'Registrar Materia Prima' : 'Register Material')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
