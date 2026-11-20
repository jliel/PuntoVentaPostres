/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_PRODUCTS } from './data/initialCatalog';
import { Product, CartItem, Order, ProductCategory, OrderStatus, User, Language, ProductOption } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminInventory } from './components/AdminInventory';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OSPreviewFrame } from './components/OSPreviewFrame';
import { OfflineIndicator } from './components/OfflineIndicator';
import { StorySection } from './components/StorySection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ShoppingBag } from 'lucide-react';
import { getInitialLanguage, translations } from './utils/i18n';
import {
  auth,
  onAuthStateChanged,
  buildAppUserFromFirebase,
  isAdminBootstrapNeeded,
  claimInitialAdmin,
  seedProductsIfEmpty,
  saveProductToFirestore,
  updateProductStockInFirestore,
  deleteProductFromFirestore,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  subscribeToOrders,
  logoutFromFirebase,
} from './lib/firebase';

// Sample starting orders for realistic admin revenue dashboard
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: '4821',
    status: 'completed',
    paymentMethod: 'apple_pay',
    fulfillmentType: 'delivery',
    createdAt: '12:45 PM',
    subtotal: 255.0,
    deliveryFee: 0,
    tip: 25.5,
    total: 280.5,
    customer: {
      name: 'Sofía Ramirez',
      phone: '+52 55 9876 5432',
      address: 'Av. Insurgentes Sur 1420, Depto 402',
    },
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 2 }, // 2 elotes
      { product: INITIAL_PRODUCTS[4], quantity: 1 }, // 1 angus burger
      { product: INITIAL_PRODUCTS[8], quantity: 1 }, // 1 nutella crepe
    ],
  },
  {
    id: 'ord-1002',
    orderNumber: '5194',
    status: 'preparing',
    paymentMethod: 'card',
    fulfillmentType: 'pickup',
    createdAt: '01:15 PM',
    subtotal: 180.0,
    deliveryFee: 0,
    tip: 18.0,
    total: 198.0,
    customer: {
      name: 'Carlos Mendoza',
      phone: '+52 55 3344 5566',
    },
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 2 }, // 2 esquites tuetano
      { product: INITIAL_PRODUCTS[12], quantity: 1 }, // 1 churros
    ],
  },
  {
    id: 'ord-1003',
    orderNumber: '6239',
    status: 'received',
    paymentMethod: 'cash',
    fulfillmentType: 'delivery',
    createdAt: '01:40 PM',
    subtotal: 200.0,
    deliveryFee: 0,
    tip: 20.0,
    total: 220.0,
    customer: {
      name: 'Elena Torres',
      phone: '+52 55 7788 9900',
      address: 'Calle Durango 88, Roma Norte',
    },
    items: [
      { product: INITIAL_PRODUCTS[5], quantity: 1 }, // 1 double smash
      { product: INITIAL_PRODUCTS[13], quantity: 1 }, // 1 fresas con crema
    ],
  },
];

export default function App() {
  // 1. Language state: automatic detection based on user device + persistence
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const handleToggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'es' ? 'en' : 'es';
      try {
        localStorage.setItem('postresito_lang', next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const t = translations[language];

  // 2. Inventory & Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('mercado_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].category in { elotes: 1, hamburguesas: 1, crepas: 1, postres: 1 }) {
          // Merge missing properties (like expiryDate or costPrice) if needed
          return parsed.map((p, idx) => {
            const initialMatch = INITIAL_PRODUCTS.find((init) => init.id === p.id) || INITIAL_PRODUCTS[idx % INITIAL_PRODUCTS.length];
            return {
              ...initialMatch,
              ...p,
              options: p.options || initialMatch?.options,
              nameEn: p.nameEn || initialMatch.nameEn,
              descriptionEn: p.descriptionEn || initialMatch.descriptionEn,
              costPrice: p.costPrice || initialMatch.costPrice,
              expiryDate: p.expiryDate || initialMatch.expiryDate,
              minStock: p.minStock || initialMatch.minStock,
              maxStock: p.maxStock || initialMatch.maxStock,
              totalSold: p.totalSold || initialMatch.totalSold,
              bestSellingDays: p.bestSellingDays || initialMatch.bestSellingDays,
              dayRecommendationReason: p.dayRecommendationReason || initialMatch.dayRecommendationReason,
              dayRecommendationReasonEn: p.dayRecommendationReasonEn || initialMatch.dayRecommendationReasonEn,
            };
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    let isMounted = true;
    seedProductsIfEmpty(INITIAL_PRODUCTS)
      .then((liveProds) => {
        if (isMounted && liveProds && liveProds.length > 0) {
          setProducts(liveProds);
        }
      })
      .catch((err) => console.warn('Product firestore load notice:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mercado_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // 3. User & Auth State (Strictly verified via Firebase Auth + Firestore /admins)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [canClaimInitialAdmin, setCanClaimInitialAdmin] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) return;
    let isActive = true;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!isActive) return;
      if (fbUser) {
        const userObj = await buildAppUserFromFirebase(fbUser);
        if (!isActive) return;
        setCurrentUser(userObj);
        if (userObj.role !== 'admin') {
          const needsBootstrap = await isAdminBootstrapNeeded();
          if (isActive) setCanClaimInitialAdmin(needsBootstrap);
        } else {
          setCanClaimInitialAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setCanClaimInitialAdmin(false);
        setIsAdminOpen(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Admin access validation derived strictly from verified Firestore /admins record
  const isAdmin = Boolean(currentUser && currentUser.role === 'admin');

  const handleLoginUser = async (user: User) => {
    setCurrentUser(user);
    if (user.role !== 'admin') {
      const needsBootstrap = await isAdminBootstrapNeeded();
      setCanClaimInitialAdmin(needsBootstrap);
    } else {
      setCanClaimInitialAdmin(false);
    }
  };

  const handleClaimInitialAdmin = async () => {
    try {
      const claimed = await claimInitialAdmin();
      if (claimed && currentUser) {
        setCurrentUser({ ...currentUser, role: 'admin' });
        setCanClaimInitialAdmin(false);
      }
    } catch (e) {
      console.error('Could not claim initial admin access:', e);
    }
  };

  const handleLogoutUser = async () => {
    try {
      await logoutFromFirebase();
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setCanClaimInitialAdmin(false);
    setIsAdminOpen(false);
  };

  // 4. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mercado_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('mercado_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // 5. Orders State (Firestore persistence with local fallback)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('mercado_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDERS;
  });

  // Subscribe to live orders from Firestore
  useEffect(() => {
    try {
      const unsubscribe = subscribeToOrders(
        (liveOrders) => {
          if (liveOrders && liveOrders.length > 0) {
            setOrders(liveOrders);
          }
        },
        currentUser?.id,
        isAdmin
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Orders subscription notice:', e);
    }
  }, [currentUser?.id, isAdmin]);

  useEffect(() => {
    try {
      localStorage.setItem('mercado_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // 6. Navigation & Filtering State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [osMode, setOsMode] = useState<'responsive' | 'ios' | 'android'>('responsive');
  const [mobileActiveView, setMobileActiveView] = useState<'store' | 'admin' | 'orders'>('store');

  // 7. Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // 8. Pricing & Fulfillment calculations
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [tipPercentage, setTipPercentage] = useState<number>(10);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Cart operations with options support (Uber Eats style)
  const handleAddToCart = (
    product: Product,
    quantity = 1,
    instructions?: string,
    selectedOptions?: ProductOption[]
  ) => {
    const optionsExtra = (selectedOptions || []).reduce((sum, opt) => sum + (opt.price || 0), 0);
    const unitPrice = product.price + optionsExtra;

    setCart((prev) => {
      const optionIdsStr = (selectedOptions || []).map((o) => o.id).sort().join(',');
      const existingIndex = prev.findIndex((item) => {
        if (item.product.id !== product.id) return false;
        const itemOptIdsStr = (item.selectedOptions || []).map((o) => o.id).sort().join(',');
        return itemOptIdsStr === optionIdsStr;
      });

      if (existingIndex >= 0) {
        const nextCart = [...prev];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: Math.min(product.stock, nextCart[existingIndex].quantity + quantity),
          specialInstructions: instructions || nextCart[existingIndex].specialInstructions,
        };
        return nextCart;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          specialInstructions: instructions,
          selectedOptions,
          itemPrice: unitPrice,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number, itemIndex?: number) => {
    setCart((prev) => {
      return prev
        .map((item, idx) => {
          if (itemIndex !== undefined) {
            if (idx === itemIndex) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          }
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string, itemIndex?: number) => {
    setCart((prev) =>
      itemIndex !== undefined
        ? prev.filter((_, idx) => idx !== itemIndex)
        : prev.filter((item) => item.product.id !== productId)
    );
  };

  // Pricing calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const unitPrice =
        item.itemPrice !== undefined
          ? item.itemPrice
          : item.product.price +
            (item.selectedOptions || []).reduce((s, o) => s + (o.price || 0), 0);
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (fulfillmentType === 'pickup') return 0;
    if (subtotal >= 200) return 0;
    return 35.0;
  }, [fulfillmentType, subtotal]);

  const tax = 0; // Tax included in menu price

  const tipAmount = useMemo(() => {
    return (subtotal * tipPercentage) / 100;
  }, [subtotal, tipPercentage]);

  const total = useMemo(() => {
    return Math.max(0, subtotal + deliveryFee + tax + tipAmount);
  }, [subtotal, deliveryFee, tax, tipAmount]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Order Placement
  const handlePlaceOrder = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>
  ): Promise<Order> => {
    const newOrderNumber = `${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      status: 'received',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Deduct stock & increment totalSold in inventory
    const updatedProducts = products.map((prod) => {
      const cartMatch = orderData.items.find((i) => i.product.id === prod.id);
      if (cartMatch) {
        const newStock = Math.max(0, prod.stock - cartMatch.quantity);
        const updated = {
          ...prod,
          stock: newStock,
          totalSold: (prod.totalSold || 0) + cartMatch.quantity,
          isAvailable: newStock > 0,
        };
        // Persist stock decrement only (strictly matching Firestore rules)
        updateProductStockInFirestore(
          updated.id,
          updated.stock,
          updated.totalSold,
          updated.isAvailable
        ).catch((e) => console.error(e));
        return updated;
      }
      return prod;
    });

    setProducts(updatedProducts);

    setOrders((prev) => [newOrder, ...prev]);
    // Persist order to Firestore
    saveOrderToFirestore(newOrder).catch((err) => console.error('Error saving order to Firestore:', err));

    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCompletedOrder(newOrder);

    return newOrder;
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (trackingOrder && trackingOrder.id === orderId) {
      setTrackingOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
    // Persist status change to Firestore
    updateOrderStatusInFirestore(orderId, nextStatus).catch((err) =>
      console.error('Error updating order status in Firestore:', err)
    );
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: products.length,
      elotes: 0,
      hamburguesas: 0,
      crepas: 0,
      postres: 0,
    };
    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) {
        return false;
      }
      if (activeTag && !prod.tags.includes(activeTag)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q) || (prod.nameEn?.toLowerCase().includes(q) ?? false);
        const matchesDesc = prod.description.toLowerCase().includes(q) || (prod.descriptionEn?.toLowerCase().includes(q) ?? false);
        const matchesTag = prod.tags.some((t) => t.toLowerCase().includes(q));
        const matchesIng = prod.ingredients?.some((i) => i.toLowerCase().includes(q));
        return matchesName || matchesDesc || matchesTag || matchesIng;
      }
      return true;
    });
  }, [products, selectedCategory, activeTag, searchQuery]);

  // Mobile navigation
  const handleMobileSelectView = (view: 'store' | 'admin' | 'orders') => {
    setMobileActiveView(view);
    if (view === 'admin') {
      if (isAdmin) {
        setIsAdminOpen(true);
      } else {
        setIsAuthOpen(true);
      }
    } else if (view === 'orders') {
      if (orders.length > 0) {
        setTrackingOrder(orders[0]);
      } else {
        alert(language === 'es' ? 'No tienes pedidos activos actualmente.' : 'No active orders currently.');
      }
    } else {
      setIsAdminOpen(false);
    }
  };

  const handleFocusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleResetCatalog = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.setItem('mercado_products', JSON.stringify(INITIAL_PRODUCTS));
  };

  return (
    <OSPreviewFrame osMode={osMode} onChangeOSMode={setOsMode}>
      <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-stone-900">
        <OfflineIndicator />

        {/* Top Navbar */}
        <Navbar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          isAdminOpen={isAdminOpen}
          onToggleAdmin={() => {
            if (isAdmin) {
              setIsAdminOpen((v) => !v);
            }
          }}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setMobileActiveView('store');
          }}
          osMode={osMode}
          onChangeOSMode={setOsMode}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogoutUser}
          ordersCount={orders.length}
          onOpenOrders={() => {
            if (orders.length > 0) {
              setTrackingOrder(orders[0]);
            }
          }}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          canClaimInitialAdmin={canClaimInitialAdmin}
          onClaimInitialAdmin={handleClaimInitialAdmin}
        />

        {/* Main Content View */}
        <main className="flex-1 pb-20 sm:pb-12">
          {/* Landing Hero */}
          <Hero
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
            categoryCounts={categoryCounts}
            language={language}
          />

          {/* Product Menu Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {selectedCategory === 'all'
                    ? t.menuTitle
                    : selectedCategory === 'elotes'
                    ? t.categories.elotes
                    : selectedCategory === 'hamburguesas'
                    ? t.categories.hamburguesas
                    : selectedCategory === 'crepas'
                    ? t.categories.crepas
                    : t.categories.postres}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {filteredProducts.length} {t.dishesAvailable}
                </p>
              </div>

              {(searchQuery || activeTag || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTag(null);
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2 cursor-pointer"
                >
                  {t.viewAllDishes}
                </button>
              )}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-2xs">
                <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                <h3 className="font-heading text-base font-bold text-stone-800">
                  {t.noDishesFound}
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  {t.noDishesSub}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTag(null);
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-4 py-2 bg-[#d30045] text-white rounded-xl text-xs font-semibold hover:bg-[#b5003b] transition cursor-pointer"
                >
                  {t.seeFullMenu}
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-4 sm:gap-6 ${
                  osMode !== 'responsive'
                    ? 'grid-cols-1 max-w-md mx-auto w-full'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {filteredProducts.map((product) => {
                  const cartItem = cart.find((i) => i.product.id === product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                      onAddToCart={(p) => {
                        handleAddToCart(p, 1);
                      }}
                      onUpdateQuantity={handleUpdateQuantity}
                      quantityInCart={cartItem?.quantity || 0}
                      language={language}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* Philosophy Section */}
          <StorySection language={language} />
        </main>

        {/* Footer */}
        <Footer
          onOpenAdmin={() => setIsAdminOpen(true)}
          isAdmin={isAdmin}
          language={language}
        />

        {/* Mobile Navigation */}
        <MobileBottomNav
          cartCount={totalCartCount}
          cartTotal={total}
          onOpenCart={() => setIsCartOpen(true)}
          language={language}
          isDevicePreview={osMode !== 'responsive'}
        />

        {/* Modals */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          quantityInCart={
            selectedProduct ? cart.find((i) => i.product.id === selectedProduct.id)?.quantity || 0 : 0
          }
          language={language}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          fulfillmentType={fulfillmentType}
          onFulfillmentChange={setFulfillmentType}
          tipPercentage={tipPercentage}
          onTipChange={setTipPercentage}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          tax={tax}
          tipAmount={tipAmount}
          total={total}
          language={language}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          tax={tax}
          tip={tipAmount}
          total={total}
          fulfillmentType={fulfillmentType}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onPlaceOrder={handlePlaceOrder}
          language={language}
        />

        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onTrackOrder={(o) => {
            setCompletedOrder(null);
            setTrackingOrder(o);
          }}
          language={language}
        />

        <OrderTrackerModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          language={language}
        />

        {/* Admin Dashboard: ONLY rendered when user is verified administrator */}
        {isAdmin && (
          <AdminInventory
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            products={products}
            orders={orders}
            onUpdateProduct={(updated) => {
              setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
              saveProductToFirestore(updated).catch((err) =>
                console.error('Error persisting updated product to Firestore:', err)
              );
            }}
            onAddProduct={(newProdData) => {
              const newProduct: Product = {
                ...newProdData,
                id: `prod-${Date.now()}`,
              };
              setProducts((prev) => [newProduct, ...prev]);
              saveProductToFirestore(newProduct).catch((err) =>
                console.error('Error persisting new product to Firestore:', err)
              );
            }}
            onDeleteProduct={(id) => {
              setProducts((prev) => prev.filter((p) => p.id !== id));
              deleteProductFromFirestore(id).catch((err) =>
                console.error('Error deleting product from Firestore:', err)
              );
            }}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onResetToDefault={handleResetCatalog}
            language={language}
          />
        )}

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleLoginUser}
          language={language}
        />
      </div>
    </OSPreviewFrame>
  );
}
