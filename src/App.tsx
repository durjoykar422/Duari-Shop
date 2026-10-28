import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  LayoutGrid,
  Grid3X3,
  List,
  Sparkles,
  PhoneCall,
  MessageCircle,
  Truck,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ShoppingBag,
  Sliders,
  Flame,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Phone,
} from 'lucide-react';
import {
  Product,
  CartItem,
  PaymentMethod,
  ShippingInfo,
  OrderRecord,
  BannerSlide,
  TrackingSettings,
  StoreSettings,
  OrderStatus,
  HomeSection,
  MediaItem,
  LandingPageConfig,
  VerifiedCustomer,
  PromoCode,
} from './types';
import { PRODUCTS, CATEGORIES } from './data/products';
import {
  INITIAL_ORDERS,
  INITIAL_BANNERS,
  INITIAL_TRACKING,
  INITIAL_SETTINGS,
  INITIAL_MEDIA,
  INITIAL_SECTIONS,
  INITIAL_LANDING_PAGES,
  INITIAL_PROMO_CODES,
  ADMIN_SECURITY_CREDENTIALS,
} from './data/initialAdminData';
import {
  saveOrderToDb,
  saveProductToDb,
  deleteProductFromDb,
  saveSettingsToDb,
  updateOrderStatusInDb,
  saveLandingPageToDb,
  deleteLandingPageFromDb,
  saveSectionToDb,
  deleteSectionFromDb,
  saveBannerToDb,
  deleteBannerFromDb,
  saveMediaToDb,
  deleteMediaFromDb,
  savePromoCodeToFirestore,
  deletePromoCodeFromFirestore,
  subscribeToProducts,
  subscribeToSettings,
  subscribeToOrders,
  subscribeToLandingPages,
  subscribeToSections,
  subscribeToBanners,
  subscribeToMedia,
  subscribeToPromoCodes,
  seedInitialDataIfEmpty,
  saveTrackingToDb,
  subscribeToTracking,
} from './services/firebaseService';
import {
  initAllTracking,
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
} from './services/trackingService';
import { broadcastSync, listenToSync } from './services/crossTabSync';
import { subscribeToAuthState, logoutCustomer } from './services/firebaseAuthService';
import { AnimatedButton } from './components/AnimatedButton';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { Checkout } from './components/Checkout';
import { CartDrawer } from './components/CartDrawer';
import { AiSearchModal } from './components/AiSearchModal';
import { VerifyModal } from './components/VerifyModal';
import { QuickViewModal } from './components/QuickViewModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { LandingPage } from './components/LandingPage';
import { LandingShowcasePage } from './components/LandingShowcasePage';
import { CustomerCareModal, CustomerCareTab } from './components/CustomerCareModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { FirebaseConsoleModal } from './components/FirebaseConsoleModal';
import { AdminSecurityLoginModal } from './components/admin/AdminSecurityLoginModal';

const checkIsAdminUrl = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  return (
    path === '/adminshop' ||
    path.endsWith('/adminshop') ||
    hash === '#/adminshop' ||
    hash === '#adminshop' ||
    hash === '#admin' ||
    params.has('adminshop') ||
    params.get('view') === 'admin' ||
    params.get('admin') === 'true'
  );
};

export default function App() {
  // Navigation View State - Auto detects /adminshop in URL
  const [currentView, setCurrentView] = useState<'home' | 'detail' | 'checkout' | 'admin' | 'landing' | 'landing-showcase'>(() => {
    if (checkIsAdminUrl()) {
      return 'admin';
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'landing-showcase' || params.get('showcase') === 'landing') {
        return 'landing-showcase';
      }
      if (params.get('landing')) {
        return 'landing';
      }
    }
    return 'home';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [landingProductId, setLandingProductId] = useState<string>('');
  const [landingCampaignId, setLandingCampaignId] = useState<string>('');

  // Admin Security Authentication State (Always starts locked - requires gmail and password to enter panel)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('duari_admin_session') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isFirebaseConsoleOpen, setIsFirebaseConsoleOpen] = useState(false);

  // Customer Verification State (Google, Facebook, Email, Phone via Firebase)
  const [verifiedCustomer, setVerifiedCustomer] = useState<VerifiedCustomer | null>(() => {
    try {
      const saved = localStorage.getItem('duari_verified_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Website Admin Recognition State (Only shows admin options when admin logged in with gmail & pass)
  const [isWebsiteAdmin, setIsWebsiteAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('duari_verified_customer');
      if (saved) {
        const parsed = JSON.parse(saved);
        return (
          parsed.email?.trim().toLowerCase() === ADMIN_SECURITY_CREDENTIALS.username.toLowerCase() ||
          parsed.isAdmin === true
        );
      }
    } catch {}
    return false;
  });

  useEffect(() => {
    if (verifiedCustomer) {
      try {
        localStorage.setItem('duari_verified_customer', JSON.stringify(verifiedCustomer));
      } catch {}
    }
  }, [verifiedCustomer]);

  // Customer Care Policy Modal State
  const [isCustomerCareOpen, setIsCustomerCareOpen] = useState(false);
  const [customerCareTab, setCustomerCareTab] = useState<CustomerCareTab>('delivery');

  // LocalStorage Keys for persistent admin modifications & deletions
  const STORAGE_KEYS = {
    PRODUCTS: 'duari_products',
    DELETED_PRODUCTS: 'duari_deleted_products',
    CATEGORIES: 'duari_categories',
    DELETED_CATEGORIES: 'duari_deleted_categories',
    SECTIONS: 'duari_sections',
    DELETED_SECTIONS: 'duari_deleted_sections',
    LANDING_PAGES: 'duari_landing_pages',
    DELETED_LANDING_PAGES: 'duari_deleted_landing_pages',
    PROMO_CODES: 'duari_promo_codes',
    DELETED_PROMO_CODES: 'duari_deleted_promo_codes',
    STORE_SETTINGS: 'duari_settings',
    TRACKING: 'duari_tracking',
  };

  const getDeletedSet = (key: string): Set<string> => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr.map((x: string) => String(x).trim().toLowerCase()));
        }
      }
    } catch {}
    return new Set<string>();
  };

  const addToDeletedSet = (key: string, item: string) => {
    try {
      const set = getDeletedSet(key);
      set.add(String(item).trim().toLowerCase());
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch {}
  };

  const removeFromDeletedSet = (key: string, item: string) => {
    try {
      const set = getDeletedSet(key);
      set.delete(String(item).trim().toLowerCase());
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch {}
  };

  // Demo Identifiers to wipe completely so store only contains admin added products & media
  const DEMO_PRODUCT_IDS = useMemo(
    () =>
      new Set([
        'j36-ultra-handheld-console',
        'prod-tshirt-polo-01',
        'prod-digital-budget-tracker',
        'prod-smart-watch-amoled-01',
        'prod-tshirt-anime-oversized',
        'prod-digital-marketing-mastery',
        'prod-minimalist-quartz-watch',
        'prod-fitness-band-pro',
        'prod-graphic-tee-streetwear',
        'prod-digital-freelance-bundle',
        'prod-analog-classic-watch',
        'prod-hoodie-cotton-fleece',
      ]),
    []
  );
  const DEMO_BANNER_IDS = useMemo(
    () => new Set(['slide-1', 'slide-2', 'slide-3', 'slide-4']),
    []
  );
  const DEMO_MEDIA_IDS = useMemo(
    () =>
      new Set([
        'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-7', 'm-8', 'm-9', 'm-10', 'm-11', 'm-12',
      ]),
    []
  );
  const DUMMY_SECTION_IDS = useMemo(
    () => new Set(['sec-deals', 'sec-gaming', 'sec-wearables', 'sec-audio']),
    []
  );
  const DUMMY_CAMPAIGN_IDS = useMemo(
    () => new Set(['camp-1', 'camp-2', 'camp-3']),
    []
  );

  // Dynamic Store Data State (Managed via Admin Panel with full localStorage & cloud persistence)
  const [productsList, setProductsList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(
            (p: Product) => p && p.id && !DEMO_PRODUCT_IDS.has(p.id)
          );
        }
      }
    } catch {}
    return [];
  });

  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return CATEGORIES;
  });

  const [ordersList, setOrdersList] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('duari_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return [];
  });
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem('duari_banner_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((b: BannerSlide) => b && !DEMO_BANNER_IDS.has(b.id));
        }
      }
    } catch {}
    return [];
  });
  const [bannerData, setBannerData] = useState<BannerSlide | undefined>(() => bannerSlides[0]);

  const [trackingSettings, setTrackingSettings] = useState<TrackingSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRACKING);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_TRACKING;
  });
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_SETTINGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_SETTINGS;
  });

  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('duari_media_library');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((m: MediaItem) => m && !DEMO_MEDIA_IDS.has(m.id));
        }
      }
    } catch {}
    return [];
  });

  const [sectionsList, setSectionsList] = useState<HomeSection[]>(() => {
    try {
      const deleted = getDeletedSet(STORAGE_KEYS.DELETED_SECTIONS);
      const saved = localStorage.getItem(STORAGE_KEYS.SECTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (s: HomeSection) =>
              !deleted.has(s.id.toLowerCase()) &&
              !DUMMY_SECTION_IDS.has(s.id.toLowerCase())
          );
        }
      }
    } catch {}
    // If admin has not created any home section, default to empty []
    return [];
  });

  const [landingPagesList, setLandingPagesList] = useState<LandingPageConfig[]>(() => {
    try {
      const deleted = getDeletedSet(STORAGE_KEYS.DELETED_LANDING_PAGES);
      const saved = localStorage.getItem(STORAGE_KEYS.LANDING_PAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (lp: LandingPageConfig) =>
              !deleted.has(lp.id.toLowerCase()) &&
              !DUMMY_CAMPAIGN_IDS.has(lp.id.toLowerCase())
          );
        }
      }
    } catch {}
    // If admin has not created any landing page, default to empty []
    return [];
  });

  const [promoCodesList, setPromoCodesList] = useState<PromoCode[]>(() => {
    try {
      const deleted = getDeletedSet(STORAGE_KEYS.DELETED_PROMO_CODES);
      const saved = localStorage.getItem(STORAGE_KEYS.PROMO_CODES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (pc: PromoCode) =>
              !deleted.has(pc.id.toLowerCase()) &&
              (!pc.code || !deleted.has(pc.code.toLowerCase()))
          );
        }
      }
      return INITIAL_PROMO_CODES.filter(
        (pc) =>
          !deleted.has(pc.id.toLowerCase()) &&
          (!pc.code || !deleted.has(pc.code.toLowerCase()))
      );
    } catch {
      return INITIAL_PROMO_CODES;
    }
  });

  // Persistent LocalStorage Synchronization on State Changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsList));
    } catch (e) {
      console.warn('localStorage products save warning:', e);
    }
  }, [productsList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesList));
    } catch (e) {
      console.warn('localStorage categories save warning:', e);
    }
  }, [categoriesList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANDING_PAGES, JSON.stringify(landingPagesList));
    } catch (e) {
      console.warn('localStorage landing pages save warning:', e);
    }
  }, [landingPagesList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sectionsList));
    } catch (e) {
      console.warn('localStorage sections save warning:', e);
    }
  }, [sectionsList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(promoCodesList));
    } catch (e) {
      console.warn('localStorage promo codes save warning:', e);
    }
  }, [promoCodesList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(storeSettings));
    } catch (e) {
      console.warn('localStorage settings save warning:', e);
    }
  }, [storeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('duari_orders', JSON.stringify(ordersList));
    } catch (e) {
      console.warn('localStorage orders save warning:', e);
    }
  }, [ordersList]);

  // Initialize and apply Tracking (Meta Pixel, Google Search Console, GA4) on tracking settings update
  useEffect(() => {
    initAllTracking(trackingSettings);
  }, [trackingSettings]);

  // Cross-Tab and Cross-Window Real-Time Broadcast Listener
  useEffect(() => {
    const unsubCross = listenToSync((event) => {
      if (event.type === 'PRODUCT_UPDATED') {
        const prod = event.payload;
        setProductsList((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
        setSelectedProduct((curr) => (curr && curr.id === prod.id ? prod : curr));
      } else if (event.type === 'PRODUCT_ADDED') {
        const prod = event.payload;
        setProductsList((prev) => [prod, ...prev.filter((p) => p.id !== prod.id)]);
      } else if (event.type === 'PRODUCT_DELETED') {
        const prodId = event.payload;
        setProductsList((prev) => prev.filter((p) => p.id !== prodId));
        setSelectedProduct((curr) => (curr && curr.id === prodId ? null : curr));
      } else if (event.type === 'TRACKING_UPDATED') {
        setTrackingSettings(event.payload);
        initAllTracking(event.payload);
      } else if (event.type === 'CATEGORIES_UPDATED') {
        setCategoriesList(event.payload);
      } else if (event.type === 'CUSTOMER_AUTH') {
        const cust = event.payload;
        setVerifiedCustomer(cust);
        if (cust) {
          const isAdminUser =
            cust.email?.trim().toLowerCase() === ADMIN_SECURITY_CREDENTIALS.username.toLowerCase() ||
            cust.isAdmin === true;
          setIsWebsiteAdmin(isAdminUser);
        } else {
          setIsWebsiteAdmin(false);
        }
      } else if (event.type === 'ORDER_PLACED') {
        const order = event.payload;
        setOrdersList((prev) => [
          order,
          ...prev.filter((o) => o.id !== order.id && o.orderId !== order.orderId),
        ]);
      } else if (event.type === 'ORDER_UPDATED') {
        const order = event.payload;
        setOrdersList((prev) =>
          prev.map((o) => (o.id === order.id || o.orderId === order.orderId ? order : o))
        );
      }
    });
    return () => unsubCross();
  }, []);

  // Listen to Firebase Auth state to connect customer accounts with active browser session
  useEffect(() => {
    const unsubAuth = subscribeToAuthState((cust) => {
      if (cust) {
        setVerifiedCustomer(cust);
        const isAdminUser =
          cust.email?.trim().toLowerCase() === ADMIN_SECURITY_CREDENTIALS.username.toLowerCase() ||
          cust.isAdmin === true;
        setIsWebsiteAdmin(isAdminUser);
      }
    });
    return () => unsubAuth();
  }, []);

  // Track Page Views across view changes
  useEffect(() => {
    trackPageView(currentView);
  }, [currentView]);

  // Track ViewContent whenever a product is viewed in Detail View
  useEffect(() => {
    if (currentView === 'detail' && selectedProduct) {
      trackViewContent(selectedProduct);
    }
  }, [currentView, selectedProduct?.id]);

  // Track ViewContent on Landing Page
  useEffect(() => {
    if (currentView === 'landing' && landingProductId) {
      const prod = productsList.find((p) => p.id === landingProductId);
      if (prod) {
        trackViewContent(prod);
      }
    }
  }, [currentView, landingProductId, productsList]);

  // Track InitiateCheckout on Checkout View
  useEffect(() => {
    if (currentView === 'checkout' && cart.length > 0) {
      const totalVal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      trackInitiateCheckout(cart, totalVal);
    }
  }, [currentView]);

  // Admin je logo ta add korbe oi logo jeno favicon a show hoy
  useEffect(() => {
    const activeLogo =
      storeSettings.logo ||
      storeSettings.bannerLogo?.url ||
      '/src/assets/images/duari_logo_1791125380292.jpg';

    if (activeLogo) {
      const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
      if (links.length > 0) {
        links.forEach((l) => {
          l.href = activeLogo;
        });
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = activeLogo;
        document.head.appendChild(link);
      }
    }
  }, [storeSettings.logo, storeSettings.bannerLogo?.url]);

  // Real-Time Firebase Cloud Database Synchronization (All browsers & visitors stay synced)
  useEffect(() => {
    // 1. Seed initial data to Firestore if database is empty on first boot (do not seed demo products/banners)
    seedInitialDataIfEmpty({
      products: [],
      settings: INITIAL_SETTINGS,
      sections: [],
      banners: [],
      landingPages: [],
      orders: [],
      media: [],
      promoCodes: INITIAL_PROMO_CODES,
      tracking: INITIAL_TRACKING,
    } as any);

    // 2. Cleanup all legacy demo products, demo banners, demo media, demo sections, and demo campaigns from Firestore
    Array.from(DEMO_PRODUCT_IDS).forEach((id) => {
      deleteProductFromDb(id).catch(() => {});
    });
    Array.from(DEMO_BANNER_IDS).forEach((id) => {
      deleteBannerFromDb(id).catch(() => {});
    });
    Array.from(DEMO_MEDIA_IDS).forEach((id) => {
      deleteMediaFromDb(id).catch(() => {});
    });
    Array.from(DUMMY_SECTION_IDS).forEach((id) => {
      deleteSectionFromDb(id).catch(() => {});
    });
    Array.from(DUMMY_CAMPAIGN_IDS).forEach((id) => {
      deleteLandingPageFromDb(id).catch(() => {});
    });

    // 3. Real-time live listeners for all collections (Filtered against demo IDs)
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts && Array.isArray(cloudProducts)) {
        const cloudFiltered = cloudProducts.filter(
          (p) => p && p.id && !DEMO_PRODUCT_IDS.has(p.id)
        );
        setProductsList((prev) => {
          const map = new Map<string, Product>();
          prev.forEach((p) => {
            if (p && p.id && !DEMO_PRODUCT_IDS.has(p.id)) {
              map.set(p.id, p);
            }
          });
          cloudFiltered.forEach((p) => {
            map.set(p.id, p);
          });
          const merged = Array.from(map.values());
          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setSelectedProduct((curr) => {
          if (!curr) return null;
          return cloudFiltered.find((p) => p.id === curr.id) || curr;
        });
        setCart((prev) =>
          prev
            .map((item) => {
              const fresh = cloudFiltered.find((p) => p.id === item.product.id);
              return fresh ? { ...item, product: fresh } : item;
            })
            .filter((item) => !DEMO_PRODUCT_IDS.has(item.product.id))
        );
      }
    });

    const unsubTracking = subscribeToTracking((cloudTracking) => {
      if (cloudTracking) {
        setTrackingSettings(cloudTracking);
        try {
          localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(cloudTracking));
        } catch {}
        initAllTracking(cloudTracking);
      }
    });

    const unsubSettings = subscribeToSettings((cloudSettings) => {
      if (cloudSettings) {
        setStoreSettings((prev) => ({ ...prev, ...cloudSettings }));
        try {
          localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(cloudSettings));
        } catch {}
        if (cloudSettings.categories && Array.isArray(cloudSettings.categories) && cloudSettings.categories.length > 0) {
          setCategoriesList(cloudSettings.categories);
          try {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cloudSettings.categories));
          } catch {}
        }
      }
    });

    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders && Array.isArray(cloudOrders)) {
        setOrdersList((prev) => {
          const map = new Map<string, OrderRecord>();
          prev.forEach((o) => map.set(o.id || o.orderId, o));
          cloudOrders.forEach((o) => map.set(o.id || o.orderId, o));
          const merged = Array.from(map.values()).sort((a, b) => {
            const timeA = new Date(a.date || 0).getTime() || 0;
            const timeB = new Date(b.date || 0).getTime() || 0;
            return timeB - timeA;
          });
          try {
            localStorage.setItem('duari_orders', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    const unsubLanding = subscribeToLandingPages((cloudPages) => {
      if (cloudPages && Array.isArray(cloudPages)) {
        const deleted = getDeletedSet(STORAGE_KEYS.DELETED_LANDING_PAGES);
        const filtered = cloudPages.filter(
          (lp) =>
            !deleted.has(lp.id.toLowerCase()) &&
            !DUMMY_CAMPAIGN_IDS.has(lp.id.toLowerCase())
        );
        setLandingPagesList(filtered);
        try {
          localStorage.setItem(STORAGE_KEYS.LANDING_PAGES, JSON.stringify(filtered));
        } catch {}
      }
    });

    const unsubSections = subscribeToSections((cloudSections) => {
      if (cloudSections && Array.isArray(cloudSections)) {
        const deleted = getDeletedSet(STORAGE_KEYS.DELETED_SECTIONS);
        const filtered = cloudSections.filter(
          (s) =>
            !deleted.has(s.id.toLowerCase()) &&
            !DUMMY_SECTION_IDS.has(s.id.toLowerCase())
        );
        setSectionsList(filtered);
        try {
          localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(filtered));
        } catch {}
      }
    });

    const unsubBanners = subscribeToBanners((cloudBanners) => {
      if (cloudBanners && Array.isArray(cloudBanners)) {
        const filtered = cloudBanners.filter((b) => b && !DEMO_BANNER_IDS.has(b.id));
        setBannerSlides(filtered);
        setBannerData(filtered[0]);
        try {
          localStorage.setItem('duari_banner_slides', JSON.stringify(filtered));
        } catch {}
      }
    });

    const unsubMedia = subscribeToMedia((cloudMedia) => {
      if (cloudMedia && Array.isArray(cloudMedia)) {
        const filtered = cloudMedia.filter((m) => m && !DEMO_MEDIA_IDS.has(m.id));
        setMediaList(filtered);
        try {
          localStorage.setItem('duari_media_library', JSON.stringify(filtered));
        } catch {}
      }
    });

    const unsubPromoCodes = subscribeToPromoCodes((cloudCodes) => {
      if (cloudCodes && Array.isArray(cloudCodes)) {
        const deleted = getDeletedSet(STORAGE_KEYS.DELETED_PROMO_CODES);
        const filtered = cloudCodes.filter(
          (pc) =>
            !deleted.has(pc.id.toLowerCase()) &&
            (!pc.code || !deleted.has(pc.code.toLowerCase()))
        );
        setPromoCodesList(filtered);
      }
    });

    return () => {
      unsubProducts();
      unsubSettings();
      unsubOrders();
      unsubLanding();
      unsubSections();
      unsubBanners();
      unsubMedia();
      unsubPromoCodes();
      unsubTracking();
    };
  }, []);

  // Check for /adminshop route, ?landing=, ?camp= and ?view= URL query parameters on mount & popstate
  useEffect(() => {
    const handleUrlRoute = () => {
      const params = new URLSearchParams(window.location.search);
      const landingParam = params.get('landing');
      const campParam = params.get('camp');
      const viewParam = params.get('view');

      if (checkIsAdminUrl()) {
        setCurrentView('admin');
        if (window.location.pathname.toLowerCase().replace(/\/+$/, '') !== '/adminshop') {
          window.history.replaceState(null, '', '/adminshop');
        }
        return;
      }

      if (viewParam === 'landing-showcase' || params.get('showcase') === 'landing') {
        setCurrentView('landing-showcase');
        return;
      }
      if (campParam) {
        setLandingCampaignId(campParam);
      }
      if (landingParam) {
        setLandingProductId(landingParam);
        setCurrentView('landing');
        return;
      }

      // If at root and currently in admin, revert to home
      if (window.location.pathname === '/' || window.location.pathname === '') {
        setCurrentView((prev) => (prev === 'admin' ? 'home' : prev));
      }
    };

    handleUrlRoute();

    // Keyboard shortcut (Ctrl+Shift+A or Alt+A) to access Admin Panel via /adminshop
    const handleAdminKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        handleOpenAdmin();
      }
    };

    const handlePopState = () => {
      handleUrlRoute();
    };

    window.addEventListener('keydown', handleAdminKey);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleAdminKey);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleOpenAdmin = () => {
    if (window.location.pathname.toLowerCase().replace(/\/+$/, '') !== '/adminshop') {
      window.history.pushState(null, '', '/adminshop');
    }
    setCurrentView('admin');
    if (!isAdminLoggedIn) {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsWebsiteAdmin(true);
    setIsAdminLoginModalOpen(false);
    try {
      localStorage.setItem('duari_admin_session', 'true');
    } catch {}
    if (window.location.pathname.toLowerCase().replace(/\/+$/, '') !== '/adminshop') {
      window.history.pushState(null, '', '/adminshop');
    }
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitAdmin = () => {
    // When entering/returning to website from admin panel: auto admin lock!
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('duari_admin_session');
    } catch {}
    if (window.location.pathname.toLowerCase().replace(/\/+$/, '') === '/adminshop') {
      window.history.pushState(null, '', '/');
    }
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    // When logging out: auto admin lock, clear storage, and reset URL to /
    logoutCustomer();
    setIsAdminLoggedIn(false);
    setIsWebsiteAdmin(false);
    try {
      localStorage.removeItem('duari_admin_session');
      localStorage.removeItem('duari_verified_customer');
    } catch {}
    setVerifiedCustomer(null);
    if (window.location.pathname.toLowerCase().replace(/\/+$/, '') === '/adminshop') {
      window.history.pushState(null, '', '/');
    }
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCustomerVerified = (cust: VerifiedCustomer | null) => {
    if (!cust) {
      logoutCustomer();
      setVerifiedCustomer(null);
      setIsWebsiteAdmin(false);
      localStorage.removeItem('duari_verified_customer');
      return;
    }

    setVerifiedCustomer(cust);
    try {
      localStorage.setItem('duari_verified_customer', JSON.stringify(cust));
    } catch {}

    const isAdminUser =
      cust.email?.trim().toLowerCase() === ADMIN_SECURITY_CREDENTIALS.username.toLowerCase() ||
      cust.isAdmin === true;

    setIsWebsiteAdmin(isAdminUser);
    setIsVerifyOpen(false);
  };

  // Cart State (Starts clean and empty)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: string;
    shipping: ShippingInfo;
    cart: CartItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    paymentMethod: string;
  } | null>(null);

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Search Query State (Instant Auto-Search as you type)
  const [searchQuery, setSearchQuery] = useState('');

  // Filter State (Matching Screenshot 1)
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [viewMode, setViewMode] = useState<'grid-4' | 'grid-3' | 'list'>('grid-4');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  // Keyboard shortcut for AI Search Grounding (Ctrl+K or Cmd+K) and Admin Login (Alt+A or Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminLoginModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Search Input Change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (currentView !== 'home' && query.trim()) {
      setCurrentView('home');
    }
  };

  // Dynamic categories that merge categories list with categories from current products
  const displayCategories = useMemo(() => {
    const set = new Set<string>(['All Categories']);
    categoriesList.forEach((c) => {
      if (c && c.trim() && c.trim().toLowerCase() !== 'all categories') {
        set.add(c.trim());
      }
    });
    productsList.forEach((p) => {
      if (p.category && p.category.trim() && p.category.trim().toLowerCase() !== 'all categories') {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [categoriesList, productsList]);

  // Filter & Sort Logic with Instant Auto-Search
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const selCatLower = selectedCategory.trim().toLowerCase();

    return productsList
      .filter((item) => {
        const itemCatLower = (item.category || '').trim().toLowerCase();
        const matchCat =
          selCatLower === 'all categories' || itemCatLower === selCatLower;
        const matchPrice = (item.price || 0) <= priceRange;
        const matchSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          (item.banglaTitle && item.banglaTitle.toLowerCase().includes(q)) ||
          itemCatLower.includes(q) ||
          (item.description && item.description.toLowerCase().includes(q));
        return matchCat && matchPrice && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [selectedCategory, priceRange, sortBy, searchQuery, productsList]);

  // Pagination (20 items per page as seen in Screenshot 1 "Showing 1-20 of 54 products")
  const itemsPerPage = 20;
  const totalProductsCount = searchQuery.trim() ? filteredProducts.length : productsList.length;
  const totalPages = Math.max(1, Math.ceil(totalProductsCount / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    trackAddToCart(product, quantity);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Admin Data Handlers (Persisted permanently with immediate LocalStorage + Broadcast + Firebase Cloud Database)
  const handleAddProduct = async (newProduct: Product) => {
    setProductsList((prev) => {
      const updated = [newProduct, ...prev.filter((p) => p.id !== newProduct.id)];
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    broadcastSync({ type: 'PRODUCT_ADDED', payload: newProduct });
    try {
      await saveProductToDb(newProduct);
    } catch (e) {
      console.error('Error saving new product to database:', e);
    }
  };

  const handleUpdateProduct = async (updated: Product) => {
    setProductsList((prev) => {
      const updatedList = prev.map((p) => (p.id === updated.id ? updated : p));
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
    broadcastSync({ type: 'PRODUCT_UPDATED', payload: updated });
    try {
      await saveProductToDb(updated);
    } catch (e) {
      console.error('Error updating product in database:', e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProductsList((prev) => {
      const updatedList = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }
    broadcastSync({ type: 'PRODUCT_DELETED', payload: productId });
    try {
      await deleteProductFromDb(productId);
    } catch (e) {
      console.error('Error deleting product from database:', e);
    }
  };

  const handleAddCategory = (newCat: string) => {
    removeFromDeletedSet(STORAGE_KEYS.DELETED_CATEGORIES, newCat);
    const updated = [...categoriesList, newCat];
    setCategoriesList(updated);
    broadcastSync({ type: 'CATEGORIES_UPDATED', payload: updated });
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    } catch {}
    const newSettings = { ...storeSettings, categories: updated };
    setStoreSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(newSettings));
    } catch {}
    saveSettingsToDb(newSettings);
  };

  const handleDeleteCategory = (cat: string) => {
    addToDeletedSet(STORAGE_KEYS.DELETED_CATEGORIES, cat);
    const updated = categoriesList.filter((c) => c !== cat);
    setCategoriesList(updated);
    broadcastSync({ type: 'CATEGORIES_UPDATED', payload: updated });
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    } catch {}
    if (selectedCategory === cat) {
      setSelectedCategory('All Categories');
    }
    const newSettings = { ...storeSettings, categories: updated };
    setStoreSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(newSettings));
    } catch {}
    saveSettingsToDb(newSettings);
  };

  const handleAddSection = (newSec: HomeSection) => {
    removeFromDeletedSet(STORAGE_KEYS.DELETED_SECTIONS, newSec.id);
    setSectionsList((prev) => {
      const updated = [...prev, newSec];
      try {
        localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    saveSectionToDb(newSec);
  };

  const handleUpdateSection = (updated: HomeSection) => {
    setSectionsList((prev) => {
      const list = prev.map((s) => (s.id === updated.id ? updated : s));
      try {
        localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(list));
      } catch {}
      return list;
    });
    saveSectionToDb(updated);
  };

  const handleDeleteSection = (sectionId: string) => {
    addToDeletedSet(STORAGE_KEYS.DELETED_SECTIONS, sectionId);
    setSectionsList((prev) => {
      const updated = prev.filter((s) => s.id !== sectionId);
      try {
        localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    deleteSectionFromDb(sectionId);
  };

  const handleAddMedia = (media: MediaItem) => {
    setMediaList((prev) => [media, ...prev]);
    saveMediaToDb(media);
  };

  const handleDeleteMedia = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    deleteMediaFromDb(id);
  };

  const handleAddLandingPage = (camp: LandingPageConfig) => {
    removeFromDeletedSet(STORAGE_KEYS.DELETED_LANDING_PAGES, camp.id);
    setLandingPagesList((prev) => {
      const updated = [camp, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.LANDING_PAGES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    saveLandingPageToDb(camp);
  };

  const handleUpdateLandingPage = (camp: LandingPageConfig) => {
    setLandingPagesList((prev) => {
      const updated = prev.map((c) => (c.id === camp.id ? camp : c));
      try {
        localStorage.setItem(STORAGE_KEYS.LANDING_PAGES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    saveLandingPageToDb(camp);
  };

  const handleDeleteLandingPage = (id: string) => {
    addToDeletedSet(STORAGE_KEYS.DELETED_LANDING_PAGES, id);
    setLandingPagesList((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.LANDING_PAGES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    deleteLandingPageFromDb(id);
  };

  const handleAddPromoCode = (promo: PromoCode) => {
    removeFromDeletedSet(STORAGE_KEYS.DELETED_PROMO_CODES, promo.id);
    if (promo.code) {
      removeFromDeletedSet(STORAGE_KEYS.DELETED_PROMO_CODES, promo.code);
    }
    setPromoCodesList((prev) => {
      const updated = [promo, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    savePromoCodeToFirestore(promo);
  };

  const handleUpdatePromoCode = (promo: PromoCode) => {
    setPromoCodesList((prev) => {
      const updated = prev.map((p) => (p.id === promo.id ? promo : p));
      try {
        localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    savePromoCodeToFirestore(promo);
  };

  const handleDeletePromoCode = (id: string) => {
    const target = promoCodesList.find((p) => p.id === id);
    addToDeletedSet(STORAGE_KEYS.DELETED_PROMO_CODES, id);
    if (target?.code) {
      addToDeletedSet(STORAGE_KEYS.DELETED_PROMO_CODES, target.code);
    }
    setPromoCodesList((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    deletePromoCodeFromFirestore(id, target?.code);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrdersList((prev) => {
      const updated = prev.map((o) => (o.id === orderId || o.orderId === orderId ? { ...o, status } : o));
      try {
        localStorage.setItem('duari_orders', JSON.stringify(updated));
      } catch {}
      const target = updated.find((o) => o.id === orderId || o.orderId === orderId);
      if (target) {
        broadcastSync({ type: 'ORDER_UPDATED', payload: target });
      }
      return updated;
    });
    updateOrderStatusInDb(orderId, status);
  };

  const handleUpdateSettings = (s: StoreSettings) => {
    setStoreSettings(s);
    saveSettingsToDb(s);
  };

  const handleUpdateBanner = (b: BannerSlide) => {
    setBannerData(b);
    setBannerSlides((prev) => prev.map((s) => (s.id === b.id ? b : s)));
    saveBannerToDb(b);
  };

  const handleUpdateSlides = (slides: BannerSlide[]) => {
    // If any previous slides were removed, delete them from DB
    const newIds = new Set(slides.map((s) => s.id));
    bannerSlides.forEach((oldSlide) => {
      if (!newIds.has(oldSlide.id)) {
        deleteBannerFromDb(oldSlide.id).catch(() => {});
      }
    });
    setBannerSlides(slides);
    setBannerData(slides[0]);
    try {
      localStorage.setItem('duari_banner_slides', JSON.stringify(slides));
    } catch {}
    for (const s of slides) {
      saveBannerToDb(s);
    }
  };

  // Slider & Banner click navigation handler
  const handleNavigateSlide = (link: string, slide: BannerSlide) => {
    if (!link) {
      const el = document.getElementById('catalog-section');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const trimmed = link.trim();

    // 1. External URL (http:// or https://)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const shouldOpenInNewTab = slide.openInNewTab !== false;
      window.open(trimmed, shouldOpenInNewTab ? '_blank' : '_self', 'noopener,noreferrer');
      return;
    }

    // 2. Specific Product ('product:id' or /product/id)
    if (trimmed.startsWith('product:')) {
      const prodId = trimmed.replace('product:', '').trim();
      const targetProd = productsList.find(
        (p) => p.id === prodId || p.title.toLowerCase() === prodId.toLowerCase()
      );
      if (targetProd) {
        setSelectedProduct(targetProd);
        setCurrentView('detail');
        trackViewContent(targetProd);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // 3. Category ('category:name' or /category/name)
    if (trimmed.startsWith('category:')) {
      const catName = trimmed.replace('category:', '').trim();
      setSelectedCategory(catName);
      setCurrentView('home');
      const el = document.getElementById('catalog-section');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // 4. Landing Page ('landing:id' or /landing)
    if (trimmed.startsWith('landing:')) {
      const landingId = trimmed.replace('landing:', '').trim();
      const foundCamp = landingPagesList.find(
        (lp) => lp.id === landingId || lp.productId === landingId
      );
      if (foundCamp) {
        setLandingProductId(foundCamp.productId);
        setLandingCampaignId(foundCamp.id);
      } else {
        setLandingProductId(landingId);
      }
      setCurrentView('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (
      trimmed === 'landing-showcase' ||
      trimmed === '/landing-showcase' ||
      trimmed === '#landing-showcase'
    ) {
      setCurrentView('landing-showcase');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 5. Admin Panel route
    if (trimmed === '/adminshop' || trimmed === 'admin' || trimmed === '#admin') {
      window.history.pushState({}, '', '/adminshop');
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 6. Section or Catalog Anchor (#catalog-section or #products)
    if (trimmed.startsWith('#')) {
      setCurrentView('home');
      const targetId = trimmed.replace('#', '');
      const el = document.getElementById(targetId) || document.getElementById('catalog-section');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // 7. Check if trimmed matches any product id directly
    const directProduct = productsList.find((p) => p.id === trimmed);
    if (directProduct) {
      setSelectedProduct(directProduct);
      setCurrentView('detail');
      trackViewContent(directProduct);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 8. Check if trimmed matches any category directly
    const directCategory = categoriesList.find(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (directCategory) {
      setSelectedCategory(directCategory);
      setCurrentView('home');
      const el = document.getElementById('catalog-section');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Default fallback: scroll to catalog
    setCurrentView('home');
    const el = document.getElementById('catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Navigation handlers
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
    trackViewContent(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    // Replace or add to cart and go to checkout
    setCart([{ product, quantity }]);
    setCurrentView('checkout');
    trackInitiateCheckout([{ product, quantity }], product.price * quantity);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderComplete = (orderData: {
    shipping: ShippingInfo;
    paymentMethod: PaymentMethod;
    cart: CartItem[];
    subtotal: number;
    shippingFee: number;
    promoCode?: string;
    discountAmount?: number;
    total: number;
  }) => {
    const orderId = `DUARI-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderSuccessData({
      orderId,
      ...orderData,
    });

    if (orderData.promoCode) {
      setPromoCodesList((prev) =>
        prev.map((p) => {
          if (p.code.toUpperCase() === orderData.promoCode?.toUpperCase()) {
            const updated = { ...p, usageCount: (p.usageCount || 0) + 1 };
            savePromoCodeToFirestore(updated);
            return updated;
          }
          return p;
        })
      );
    }

    // Add order to admin orders state!
    const newRecord: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderId,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customer: orderData.shipping.fullName,
      phoneNumber: orderData.shipping.phoneNumber,
      address: orderData.shipping.fullAddress,
      city: orderData.shipping.city,
      items: orderData.cart,
      subtotal: orderData.subtotal,
      shippingFee: orderData.shippingFee,
      promoCode: orderData.promoCode,
      discountAmount: orderData.discountAmount,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
    };
    setOrdersList((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('duari_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    broadcastSync({ type: 'ORDER_PLACED', payload: newRecord });

    // Persist to Firebase Firestore & Track Meta/Google Conversion
    saveOrderToDb(newRecord);
    trackPurchase(newRecord);

    setCart([]);
    setCurrentView('home');
  };

  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // If in Admin Mode, render the full admin dashboard (guarded by admin security authentication)
  if (currentView === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <AdminSecurityLoginModal
            isOpen={true}
            onClose={() => {
              if (window.location.pathname.toLowerCase().replace(/\/+$/, '') === '/adminshop') {
                window.history.pushState(null, '', '/');
              }
              setIsAdminLoginModalOpen(false);
              setCurrentView('home');
            }}
            onLoginSuccess={handleAdminLoginSuccess}
            lang={lang}
          />
        </div>
      );
    }

    return (
      <AdminLayout
        orders={ordersList}
        products={productsList}
        categories={categoriesList}
        banner={bannerData}
        slides={bannerSlides}
        sections={sectionsList}
        landingPages={landingPagesList}
        promoCodes={promoCodesList}
        tracking={trackingSettings}
        settings={storeSettings}
        mediaList={mediaList}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddSection={handleAddSection}
        onUpdateSection={handleUpdateSection}
        onDeleteSection={handleDeleteSection}
        onAddLandingPage={handleAddLandingPage}
        onUpdateLandingPage={handleUpdateLandingPage}
        onDeleteLandingPage={handleDeleteLandingPage}
        onAddPromoCode={handleAddPromoCode}
        onUpdatePromoCode={handleUpdatePromoCode}
        onDeletePromoCode={handleDeletePromoCode}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateBanner={handleUpdateBanner}
        onUpdateSlides={handleUpdateSlides}
        onUpdateTracking={async (t) => {
          setTrackingSettings(t);
          try {
            localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(t));
          } catch {}
          initAllTracking(t);
          broadcastSync({ type: 'TRACKING_UPDATED', payload: t });
          await saveTrackingToDb(t);
        }}
        onUpdateSettings={handleUpdateSettings}
        onAddMedia={handleAddMedia}
        onDeleteMedia={handleDeleteMedia}
        onViewLandingPage={(prodId, campId) => {
          setIsAdminLoggedIn(false); // auto admin lock when entering landing from admin!
          setLandingProductId(prodId);
          if (campId) setLandingCampaignId(campId);
          setCurrentView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onExitAdmin={handleExitAdmin}
        onLogout={handleAdminLogout}
      />
    );
  }

  // If in Dedicated Landing Page Mode, render standalone high-converting view
  if (currentView === 'landing') {
    const activeCamp =
      landingPagesList.find(
        (c) => c.id === landingCampaignId || (landingProductId && c.productId === landingProductId)
      ) || landingPagesList[0];

    let prod =
      productsList.find((p) => p.id === (activeCamp?.productId || landingProductId)) ||
      (landingProductId ? productsList.find((p) => p.id === landingProductId) : null) ||
      productsList[0];

    // If product is not directly in productsList, synthesize from activeCamp so campaign page never breaks
    if (!prod && activeCamp) {
      prod = {
        id: activeCamp.productId || activeCamp.id,
        title: activeCamp.title || activeCamp.headline || 'Exclusive Campaign Product',
        banglaTitle: activeCamp.banglaHeadline || activeCamp.headline || 'স্পেশাল প্রমোশনাল প্রোডাক্ট',
        category: 'Special Campaign',
        sku: activeCamp.id,
        price: activeCamp.offerPrice || 990,
        originalPrice: activeCamp.regularPrice || 1490,
        discountPercent:
          activeCamp.regularPrice > activeCamp.offerPrice
            ? Math.round(((activeCamp.regularPrice - activeCamp.offerPrice) / activeCamp.regularPrice) * 100)
            : 25,
        rating: activeCamp.rating || 5.0,
        reviewsCount: activeCamp.reviewsCount || 120,
        inStock: true,
        image:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        ],
        videoUrl: activeCamp.videoUrl || '',
        description: activeCamp.subheadline || activeCamp.headline || '',
        features:
          activeCamp.features && activeCamp.features.length > 0
            ? activeCamp.features
            : ['১০০% অরিজিনাল অথেনটিক প্রোডাক্ট', 'সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি'],
        specifications: { Category: 'Special Campaign', SKU: activeCamp.id },
        weight: 0.5,
        dimensions: { l: '10', w: '10', h: '5' },
        stockAlert: 10,
      };
    }

    if (!prod) {
      return (
        <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              📦
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {lang === 'bn' ? 'ক্যাম্পেইন পণ্য পাওয়া যায়নি' : 'Campaign Product Not Found'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'bn'
                ? 'এই ক্যাম্পেইনের সাথে সংশ্লিষ্ট পণ্যটি এখনো অ্যাডমিন থেকে যুক্ত করা হয়নি।'
                : 'The product linked with this promotional campaign has not been added yet.'}
            </p>
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#102a6b] text-white font-bold hover:bg-blue-800 transition-colors text-xs cursor-pointer"
            >
              {lang === 'bn' ? 'মূল স্টোরে ফিরে যান' : 'Back to Store'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <LandingPage
          product={prod}
          config={activeCamp}
          settings={storeSettings}
          promoCodes={promoCodesList}
          onBackToStore={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onCompleteOrder={handleOrderComplete}
          onOpenCustomerCare={(tab) => {
            setCustomerCareTab(tab);
            setIsCustomerCareOpen(true);
          }}
          lang={lang}
        />

        {/* Customer Care Policy Modal */}
        <CustomerCareModal
          isOpen={isCustomerCareOpen}
          onClose={() => setIsCustomerCareOpen(false)}
          activeTab={customerCareTab}
          onSelectTab={setCustomerCareTab}
          settings={storeSettings}
          onOpenVerify={() => setIsVerifyOpen(true)}
          lang={lang}
        />

        {/* Customer Verification Modal */}
        <VerifyModal
          isOpen={isVerifyOpen}
          onClose={() => setIsVerifyOpen(false)}
          lang={lang}
          verifiedCustomer={verifiedCustomer}
          onCustomerVerified={handleCustomerVerified}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        />

        {/* Order Placed Success Modal with Confetti */}
        <OrderSuccessModal
          isOpen={!!orderSuccessData}
          onClose={() => setOrderSuccessData(null)}
          orderData={orderSuccessData}
          lang={lang}
        />
      </div>
    );
  }

  // If in All Landing Products Showcase Mode, render dedicated showcase page
  if (currentView === 'landing-showcase') {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <LandingShowcasePage
          products={productsList}
          landingPages={landingPagesList}
          settings={storeSettings}
          onSelectCampaign={(prodId, campId) => {
            setLandingProductId(prodId);
            setLandingCampaignId(campId);
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDirectOrder={(prod) => {
            handleAddToCart(prod, 1);
            setCurrentView('checkout');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackToStore={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCustomerCare={(tab) => {
            setCustomerCareTab(tab);
            setIsCustomerCareOpen(true);
          }}
          lang={lang}
        />

        {/* Customer Care Policy Modal */}
        <CustomerCareModal
          isOpen={isCustomerCareOpen}
          onClose={() => setIsCustomerCareOpen(false)}
          activeTab={customerCareTab}
          onSelectTab={setCustomerCareTab}
          settings={storeSettings}
          onOpenVerify={() => setIsVerifyOpen(true)}
          lang={lang}
        />

        {/* Customer Verification Modal */}
        <VerifyModal
          isOpen={isVerifyOpen}
          onClose={() => setIsVerifyOpen(false)}
          lang={lang}
          verifiedCustomer={verifiedCustomer}
          onCustomerVerified={handleCustomerVerified}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Notification Announcement Bar */}
      <div
        className="bg-[#0b245a] text-white text-[11px] sm:text-xs py-1.5 px-4 font-semibold text-center flex items-center justify-center gap-2 transition-colors flex-wrap"
        style={
          storeSettings.colors?.topBarBg
            ? {
                backgroundColor: storeSettings.colors.topBarBg,
                color: storeSettings.colors.topBarFont || '#ffffff',
              }
            : undefined
        }
      >
        <button
          onClick={() => {
            setCustomerCareTab('delivery');
            setIsCustomerCareOpen(true);
          }}
          className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
          title="Click to view Delivery Policy"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            {lang === 'bn'
              ? '🚚 সারা বাংলাদেশে ২৪ থেকে ৪৮ ঘণ্টায় নির্ভরযোগ্য হোম ডেলিভারি!'
              : '🚚 Fast Doorstep Delivery across Bangladesh • Cash On Delivery Available!'}
          </span>
        </button>
        <span className="hidden md:inline text-blue-200">|</span>
        <button
          onClick={() => {
            setCustomerCareTab('contact');
            setIsCustomerCareOpen(true);
          }}
          className="hidden md:inline text-blue-200 hover:text-white underline cursor-pointer font-bold"
          title="Click to view Customer Support & Hotline"
        >
          Customer Support: {storeSettings.hotline || '01621871225'} (10 AM - 10 PM)
        </button>
      </div>

      {/* Main Sticky Header */}
      <Header
        cartCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenVerify={() => setIsVerifyOpen(true)}
        onOpenCustomerCare={(tab) => {
          setCustomerCareTab(tab || 'delivery');
          setIsCustomerCareOpen(true);
        }}
        onOpenLandingShowcase={() => {
          setCurrentView('landing-showcase');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenFirebase={() => setIsFirebaseConsoleOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onGoHome={() => {
          setSearchQuery('');
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'en' ? 'bn' : 'en'))}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onAddToCart={(prod) => handleAddToCart(prod, 1)}
        colors={storeSettings.colors}
        verifiedCustomer={verifiedCustomer}
        logoUrl={storeSettings.logo || storeSettings.bannerLogo?.url}
        landingPagesCount={landingPagesList.filter((lp) => lp.active).length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: PRODUCT DETAIL PAGE (Matching Screenshot 2) */}
        {currentView === 'detail' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setCurrentView('home')}
            onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
            onBuyNow={(prod, qty) => handleBuyNow(prod, qty)}
            onSelectRelated={(prod) => handleSelectProduct(prod)}
            relatedProducts={productsList.filter((p) => p.id !== selectedProduct.id)}
            lang={lang}
          />
        )}

        {/* VIEW 2: CHECKOUT PAGE (Matching Screenshot 3) */}
        {currentView === 'checkout' && (
          <Checkout
            cart={cart}
            promoCodes={promoCodesList}
            onBack={() => setCurrentView('home')}
            onCompleteOrder={handleOrderComplete}
            lang={lang}
            verifiedCustomer={verifiedCustomer}
            onOpenVerify={() => setIsVerifyOpen(true)}
          />
        )}

        {/* VIEW 3: HOME & PRODUCT CATALOG (Matching Screenshot 1) */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Hero Doorstep Delivery Banner (Screenshot 1) */}
            <HeroBanner
              onOrderNow={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onNavigateSlide={(link, slide) => handleNavigateSlide(link, slide)}
              lang={lang}
              banner={bannerData}
              slides={bannerSlides}
              bannerLogo={storeSettings.bannerLogo}
            />

            {/* Active Promotional Campaigns Showcase Banner on Home */}
            {landingPagesList.filter((lp) => lp.active !== false).length > 0 && (
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg overflow-hidden relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-[11px] font-black uppercase">
                      <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                      <span>স্পেশাল ল্যান্ডিং ক্যাম্পেইন অফার</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      ডুয়ারি শপ মেগা সেলস ও ডেডিকেটেড ল্যান্ডিং অফার
                    </h2>
                    <p className="text-xs text-red-100 max-w-2xl font-medium">
                      স্পেশাল ডিসকাউন্ট, ভিডিও আনবক্সিং ও দ্রুত ১-ক্লিক ক্যাশ অন ডেলিভারি সুবিধা সংবলিত আকর্ষণীয় ক্যাম্পেইনসমূহ।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('landing-showcase');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>সকল অফার দেখুন ({landingPagesList.filter((lp) => lp.active !== false).length}টি)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Storefront Sections (Managed via Admin Panel -> Sections) */}
            {sectionsList
              .filter((sec) => sec.active)
              .map((sec) => {
                let secProducts: Product[] = [];
                if (sec.type === 'category') {
                  secProducts = productsList.filter((p) => p.category === sec.category);
                } else if (sec.type === 'deals') {
                  secProducts = productsList.filter((p) => (p.discountPercent || 0) > 0);
                } else if (sec.type === 'featured') {
                  secProducts = productsList.filter((p) => p.isFeatured);
                } else {
                  secProducts = productsList;
                }

                if (secProducts.length === 0) return null;

                return (
                  <section
                    key={sec.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4"
                  >
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {lang === 'bn' && sec.banglaTitle ? sec.banglaTitle : sec.title}
                          </h2>
                          {sec.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[10px] uppercase shadow-2xs">
                              {sec.badge}
                            </span>
                          )}
                        </div>
                        {sec.subtitle && (
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {sec.subtitle}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (sec.type === 'category' && sec.category) {
                            setSelectedCategory(sec.category);
                          } else {
                            setSelectedCategory('All Categories');
                          }
                          const el = document.getElementById('catalog-section');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <span>{lang === 'bn' ? 'সব দেখুন' : 'View All'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Section Products: Carousel or Grid */}
                    {sec.layout === 'carousel' ? (
                      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 snap-x">
                        {secProducts.slice(0, 10).map((prod) => (
                          <div
                            key={prod.id}
                            className="min-w-[170px] sm:min-w-[220px] max-w-[240px] shrink-0 snap-start"
                          >
                            <ProductCard
                              product={prod}
                              onSelect={handleSelectProduct}
                              onAddToCart={(p) => handleAddToCart(p, 1)}
                              onQuickView={(p) => setQuickViewProduct(p)}
                              isWishlisted={wishlist.includes(prod.id)}
                              onToggleWishlist={handleToggleWishlist}
                              lang={lang}
                              priceColor={storeSettings.colors?.priceColor}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                        {secProducts.slice(0, 8).map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onSelect={handleSelectProduct}
                            onAddToCart={(p) => handleAddToCart(p, 1)}
                            onQuickView={(p) => setQuickViewProduct(p)}
                            isWishlisted={wishlist.includes(prod.id)}
                            onToggleWishlist={handleToggleWishlist}
                            lang={lang}
                            priceColor={storeSettings.colors?.priceColor}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}

            {/* Catalog Grid Section with Left Sidebar Filters */}
            <div id="catalog-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Sidebar: Filters & Categories (Screenshot 1) */}
              <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm sticky top-24 space-y-6">
                {/* Price Range Filter */}
                <div className="space-y-3 pb-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Filters
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedCategory('All Categories');
                        setPriceRange(100000);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>Price Range</span>
                    </div>
                    {/* Slider Range input matching screenshot 1 */}
                    <input
                      type="range"
                      min={0}
                      max={100000}
                      step={500}
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                    />
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mt-2">
                      <span>৳ 0</span>
                      <span className="text-blue-700 font-extrabold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        ৳ {priceRange.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categories List matching screenshot 1 */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                    Categories
                  </h4>
                  <div className="space-y-1 max-h-[550px] overflow-y-auto pr-1">
                    {displayCategories.map((category) => {
                      const isActive = selectedCategory === category;
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setCurrentPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                            isActive
                              ? 'bg-[#102a6b] text-white shadow-sm font-bold'
                              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{category}</span>
                          <span
                            className={`text-[10px] ml-1 shrink-0 ${
                              isActive ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            ›
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Right: Products List & Toolbar */}
              <div className="lg:col-span-9 space-y-4">
                {/* Active Search Filter Banner */}
                {searchQuery.trim() && (
                  <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-center justify-between text-xs sm:text-sm shadow-xs animate-fadeIn">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-700">
                        Auto-search results for "<span className="font-black text-blue-950">{searchQuery}</span>":
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-700 text-white text-xs font-black shadow-xs">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer ml-2"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                {/* Catalog Toolbar */}
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Mobile filter button */}
                    <button
                      onClick={() => setIsMobileFilterOpen(true)}
                      className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                      <span>Filters</span>
                    </button>

                    <span className="text-xs text-slate-500 font-semibold">
                      Showing <span className="font-bold text-slate-800">{paginatedProducts.length}</span> of{' '}
                      <span className="font-bold text-slate-800">{totalProductsCount}</span> products
                    </span>
                  </div>

                  {/* Right: View mode and Sort options */}
                  <div className="flex items-center gap-3 ml-auto">
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                      </select>
                    </div>

                    {/* View Switchers (Matching icons in Screenshot 1) */}
                    <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setViewMode('grid-4')}
                        className={`p-1.5 rounded ${
                          viewMode === 'grid-4'
                            ? 'bg-[#102a6b] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="4 Columns Grid"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid-3')}
                        className={`p-1.5 rounded ${
                          viewMode === 'grid-3'
                            ? 'bg-[#102a6b] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="3 Columns Grid"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded ${
                          viewMode === 'list'
                            ? 'bg-[#102a6b] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                {paginatedProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 sm:p-14 text-center space-y-4 border border-slate-200/90 shadow-xs">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                      🛍️
                    </div>
                    {productsList.length === 0 ? (
                      <div className="space-y-2 max-w-md mx-auto">
                        <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                          {lang === 'bn' ? 'বর্তমানে কোনো পণ্য নেই' : 'No Products Added Yet'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                          {lang === 'bn'
                            ? 'স্টোরে সকল ডেমো পণ্য মুছে ফেলা হয়েছে। অ্যাডমিন প্যানেল (/adminshop) থেকে নতুন পণ্য যুক্ত করা হলে তা এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।'
                            : 'All demo products have been cleared. Once the store owner adds new products from the Admin Panel (/adminshop), they will automatically appear here.'}
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={handleOpenAdmin}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#102a6b] hover:bg-blue-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                          >
                            <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেলে পণ্য যোগ করুন' : 'Add Products in Admin'}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="font-bold text-slate-700">
                          {lang === 'bn' ? 'ফিল্টারের সাথে কোনো পণ্য মেলেনি' : 'No products match your filters'}
                        </p>
                        <AnimatedButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory('All Categories');
                            setPriceRange(100000);
                          }}
                        >
                          Clear Filters
                        </AnimatedButton>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'list'
                        ? 'grid grid-cols-1 gap-3'
                        : viewMode === 'grid-3'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                        : `${
                            storeSettings.sizes?.mobileCols === 3
                              ? 'grid-cols-2 xs:grid-cols-3'
                              : storeSettings.sizes?.mobileCols === 4
                              ? 'grid-cols-2 xs:grid-cols-4'
                              : 'grid-cols-2'
                          } grid sm:grid-cols-3 ${
                            storeSettings.sizes?.desktopCols === 6
                              ? 'xl:grid-cols-6'
                              : storeSettings.sizes?.desktopCols === 9
                              ? 'xl:grid-cols-9'
                              : storeSettings.sizes?.desktopCols === 3
                              ? 'xl:grid-cols-3'
                              : 'xl:grid-cols-4'
                          } gap-2.5 sm:gap-4`
                    }
                  >
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={handleSelectProduct}
                        onAddToCart={(prod) => handleAddToCart(prod, 1)}
                        onQuickView={(prod) => setQuickViewProduct(prod)}
                        isWishlisted={wishlist.includes(product.id)}
                        onToggleWishlist={handleToggleWishlist}
                        lang={lang}
                        priceColor={storeSettings.colors?.priceColor}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                  <div className="pt-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
                    <span className="text-xs text-slate-500 font-medium">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </span>

                    {totalPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <AnimatedButton
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="!px-2.5 !py-1 text-xs"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </AnimatedButton>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <AnimatedButton
                            key={page}
                            variant={currentPage === page ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`!px-3 !py-1 text-xs font-bold ${
                              currentPage === page
                                ? '!bg-[#102a6b] text-white'
                                : 'text-slate-700'
                            }`}
                          >
                            {page}
                          </AnimatedButton>
                        ))}

                        <AnimatedButton
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="!px-2.5 !py-1 text-xs"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </AnimatedButton>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Drawer Filter */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="relative max-w-xs w-full bg-white h-full shadow-2xl p-5 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Filter Products</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  Close
                </button>
              </div>

              {/* Price slider */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Price Limit: ৳ {priceRange.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={500}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-blue-700"
                />
              </div>

              {/* Category picker */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Categories
                </label>
                {displayCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                      selectedCategory === cat
                        ? 'bg-[#102a6b] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (Cart / Support) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
        <AnimatedButton
          variant="primary"
          size="md"
          pulse
          onClick={() => setIsCartOpen(true)}
          className="!rounded-full shadow-xl shadow-blue-600/30 !p-3.5 !bg-gradient-to-r !from-blue-700 !to-indigo-700 text-white"
          title="Open Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6 text-white" />
            {totalCartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black shadow-xs">
                {totalCartItemsCount}
              </span>
            )}
          </div>
        </AnimatedButton>
      </div>

      {/* Professional E-Commerce Footer */}
      <footer className="bg-[#04081c] text-slate-400 text-xs mt-14 border-t border-slate-800">
        {/* Top Trust Features Ribbon */}
        <div className="border-b border-slate-800/80 bg-slate-900/60 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-white text-xs truncate">ক্যাশ অন হোম ডেলিভারি</h5>
                <p className="text-[11px] text-slate-400 truncate">সারা দেশে ২৪-৪৮ ঘণ্টায়</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-white text-xs truncate">১০০% অথেনটিক পণ্য</h5>
                <p className="text-[11px] text-slate-400 truncate">চেক করে মূল্য পরিশোধের সুবিধা</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-white text-xs truncate">৭ দিনের রিপ্লেসমেন্ট</h5>
                <p className="text-[11px] text-slate-400 truncate">সহজ ও দ্রুত রিটার্ন পলিসি</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-white text-xs truncate">ডেডিকেটেড হেল্পলাইন</h5>
                <p className="text-[11px] text-slate-400 truncate">সকাল ১০টা - রাত ১০টা পর্যন্ত</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Brand Info */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-1 border border-blue-500/20 shrink-0">
                  <img
                    src="/src/assets/images/duari_logo_1791125380292.jpg"
                    alt="Duari Shop Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  Duari <span className="text-blue-500">Shop</span>
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                বাংলাদেশে প্রিমিয়াম গ্যাজেট, আধুনিক গেমিং কনসোল, ওয়্যারলেস অডিও ও লাইফস্টাইল অ্যাক্সেসরিজের নির্ভরযোগ্য অনলাইন শপিং প্ল্যাটফর্ম।
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Doorstep Delivery Active</span>
                </span>
              </div>
            </div>

            {/* Col 2: Quick Links & Campaigns */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-xs border-l-2 border-blue-500 pl-2">
                কুইক লিংক ও অফার
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => {
                      const el = document.getElementById('catalog-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                    <span>সকল প্রডাক্ট ক্যাটালগ</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCurrentView('landing-showcase');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-300 transition-colors text-left cursor-pointer flex items-center gap-1.5 text-amber-400 font-bold"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>স্পেশাল ল্যান্ডিং অফারসমূহ</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsVerifyOpen(true)}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>কাস্টমার অ্যাকাউন্ট যাচাইকরণ</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCustomerCareTab('delivery');
                      setIsCustomerCareOpen(true);
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5 text-blue-400" />
                    <span>অর্ডার ও ডেলিভারি ট্র্যাকিং</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Care & Policies */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-xs border-l-2 border-emerald-500 pl-2">
                কাস্টমার পলিসি
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => {
                      setCustomerCareTab('delivery');
                      setIsCustomerCareOpen(true);
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    ডেলিভারি পলিসি ও চার্জ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCustomerCareTab('cod');
                      setIsCustomerCareOpen(true);
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    ক্যাশ অন ডেলিভারি নিয়মাবলী
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCustomerCareTab('returns');
                      setIsCustomerCareOpen(true);
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    ৭ দিনের সহজ রিপ্লেসমেন্ট পলিসি
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCustomerCareTab('about');
                      setIsCustomerCareOpen(true);
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    আমাদের সম্পর্কে (About Us)
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact & Helpline */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-xs border-l-2 border-amber-500 pl-2">
                যোগাযোগ ও হেল্পলাইন
              </h4>
              <div className="space-y-2 text-xs">
                <p className="text-white font-extrabold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <a
                    href={`tel:${storeSettings.hotline || '01621871225'}`}
                    className="hover:text-blue-400 text-sm tracking-wide text-emerald-300 underline"
                  >
                    {storeSettings.hotline || '01621871225'}
                  </a>
                </p>
                <p className="text-slate-400">
                  <span className="font-bold text-slate-300">ইমেইল:</span> {storeSettings.email || 'support@duarishop.com'}
                </p>
                <p className="text-slate-400">
                  <span className="font-bold text-slate-300">ঠিকানা:</span> {storeSettings.address || 'Mymensingh Sadar, College Road, Bangladesh'}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  সাপোর্ট টাইম: প্রতিদিন সকাল ১০:০০ - রাত ১০:০০
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods & Bottom Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© {new Date().getFullYear()} Duari Shop Bangladesh. সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex items-center gap-3 flex-wrap justify-center text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800/80 text-emerald-400 font-bold border border-slate-700">
                ক্যাশ অন ডেলিভারি
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 text-pink-400 font-bold border border-slate-700">
                বিকাশ (bKash)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 text-amber-400 font-bold border border-slate-700">
                নগদ (Nagad)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 text-blue-400 font-bold border border-slate-700">
                নিরাপদ পেমেন্ট গ্যারান্টি
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lang={lang}
      />

      {/* AI Search Modal with Google Search Grounding */}
      <AiSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={PRODUCTS}
        onSelectProduct={handleSelectProduct}
        lang={lang}
      />

      {/* Verify Yourself Modal */}
      <VerifyModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        lang={lang}
        verifiedCustomer={verifiedCustomer}
        onCustomerVerified={handleCustomerVerified}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Firebase Cloud Console Modal for Website */}
      <FirebaseConsoleModal
        isOpen={isFirebaseConsoleOpen}
        onClose={() => setIsFirebaseConsoleOpen(false)}
        products={productsList}
        orders={ordersList}
        landingPages={landingPagesList}
        sections={sectionsList}
        settings={storeSettings}
        mediaList={mediaList}
        categories={categoriesList}
        lang={lang}
      />

      {/* Admin Security Login Modal (Requires durjoy422@gmail.com and DuariShop422) */}
      <AdminSecurityLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        lang={lang}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onViewDetails={handleSelectProduct}
        onBuyNow={handleBuyNow}
        lang={lang}
      />

      {/* Order Placed Success Modal with Confetti */}
      <OrderSuccessModal
        isOpen={!!orderSuccessData}
        onClose={() => setOrderSuccessData(null)}
        orderData={orderSuccessData}
        lang={lang}
      />

      {/* Customer Care Policy Modal (Shows admin configured delivery, terms, return policy & about us) */}
      <CustomerCareModal
        isOpen={isCustomerCareOpen}
        onClose={() => setIsCustomerCareOpen(false)}
        activeTab={customerCareTab}
        onSelectTab={setCustomerCareTab}
        settings={storeSettings}
        onOpenVerify={() => setIsVerifyOpen(true)}
        lang={lang}
      />
    </div>
  );
}
