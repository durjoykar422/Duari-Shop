import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Search,
  ShieldCheck,
  Globe,
  Sparkles,
  ShoppingBag,
  X,
  ArrowRight,
  Star,
  Check,
  Headphones,
  Flame,
  MoreVertical,
  Phone,
  Truck,
  RotateCcw,
  Info,
  ChevronRight,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Product, ColorSettings, VerifiedCustomer } from '../types';
import { AnimatedButton } from './AnimatedButton';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenVerify: () => void;
  onOpenCustomerCare?: (tab?: 'delivery' | 'cod' | 'returns' | 'about' | 'contact') => void;
  onOpenLandingShowcase?: () => void;
  onOpenFirebase?: () => void;
  onOpenAdmin?: () => void;
  onOpenAdminLogin?: () => void;
  onGoHome: () => void;
  lang: 'en' | 'bn';
  onToggleLang: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  colors?: ColorSettings;
  verifiedCustomer?: VerifiedCustomer | null;
  logoUrl?: string;
  landingPagesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenVerify,
  onOpenCustomerCare,
  onOpenLandingShowcase,
  onOpenFirebase,
  onOpenAdmin,
  onOpenAdminLogin,
  onGoHome,
  lang,
  onToggleLang,
  searchQuery,
  onSearchChange,
  products,
  onSelectProduct,
  onAddToCart,
  colors,
  verifiedCustomer,
  logoUrl,
  landingPagesCount = 0,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const logoClicksRef = useRef<number[]>([]);

  const handleLogoClick = () => {
    const now = Date.now();
    logoClicksRef.current = [...logoClicksRef.current.filter((t) => now - t < 1500), now];
    if (logoClicksRef.current.length >= 3) {
      logoClicksRef.current = [];
      if (onOpenAdminLogin) {
        onOpenAdminLogin();
        return;
      }
    }
    onGoHome();
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile 3-dot drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Live auto-search matches
  const matchingProducts = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBangla = p.banglaTitle?.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      return matchTitle || matchBangla || matchCat || matchDesc;
    });
  }, [searchQuery, products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSearchChange(val);
    if (val.trim()) {
      setIsDropdownOpen(true);
    }
  };

  const handleSelect = (product: Product) => {
    setIsDropdownOpen(false);
    onSelectProduct(product);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1200);
  };

  const handleClear = () => {
    onSearchChange('');
    setIsDropdownOpen(false);
    inputRef.current?.focus();
    mobileInputRef.current?.focus();
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all"
      style={
        colors?.menuBarBg
          ? {
              backgroundColor: colors.menuBarBg,
              color: colors.menuBarFont || '#ffffff',
            }
          : undefined
      }
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Header Bar Row */}
        <div className="flex items-center justify-between h-15 sm:h-16 gap-2 sm:gap-4">
          {/* Logo (Optimized for all screens) */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white border border-blue-100 shadow-sm flex items-center justify-center p-0.5 shrink-0"
            >
              <img
                src={logoUrl || '/src/assets/images/duari_logo_1791125380292.jpg'}
                alt="Duari Shop Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-2xl text-slate-900 tracking-tight flex items-center gap-1 leading-tight group-hover:text-blue-700 transition-colors">
                Duari <span className="text-blue-600 font-black">Shop</span>
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold text-slate-400 -mt-0.5 hidden xs:inline-block">
                Doorstep Delivery
              </span>
            </div>
          </div>

          {/* Desktop Instant Auto-Search Bar (Hidden on mobile < md) */}
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-xl relative hidden md:block mx-2"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-blue-600 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => {
                  if (searchQuery.trim()) setIsDropdownOpen(true);
                }}
                placeholder={
                  lang === 'bn'
                    ? 'পণ্যের নাম লিখে সাথে সাথে খুঁজুন (Auto Search)...'
                    : 'Search products by name with auto-search (e.g. J36, Earbuds, Fan)...'
                }
                className="w-full pl-10 pr-24 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm transition-all shadow-inner font-medium placeholder-slate-400 focus:outline-none"
                style={
                  colors?.searchBorder
                    ? { borderColor: colors.searchBorder }
                    : undefined
                }
              />

              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenSearch}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer transition-colors"
                    title="Ask AI Assistant"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>AI</span>
                  </button>
                )}
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Desktop Auto Search Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[460px] flex flex-col"
                >
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      {matchingProducts.length > 0
                        ? `ফলাফল পাওয়া গেছে (${matchingProducts.length})`
                        : 'কোনো ফলাফল পাওয়া যায়নি'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-100">
                    {matchingProducts.slice(0, 7).map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelect(prod)}
                        className="p-3 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-3 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.image}
                            alt=""
                            className="w-11 h-11 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0 p-1"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                              {lang === 'bn' && prod.banglaTitle
                                ? prod.banglaTitle
                                : prod.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {prod.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-black text-slate-900">
                            ৳ {prod.price.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(prod, e)}
                            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                            title="Add to cart"
                          >
                            {addedIds.includes(prod.id) ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <ShoppingCart className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop: Landing Offers Showcase Button */}
            {onOpenLandingShowcase && landingPagesCount > 0 && (
              <button
                type="button"
                onClick={onOpenLandingShowcase}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 transition-colors shadow-2xs cursor-pointer"
                title="View Promotional Landing Offers"
              >
                <Flame className="w-3.5 h-3.5 text-red-600 fill-red-500 animate-pulse" />
                <span>{lang === 'bn' ? '🔥 ল্যান্ডিং অফার' : '🔥 Promo Landing'}</span>
              </button>
            )}

            {/* Desktop: Verify Yourself / Customer Profile Button */}
            <button
              type="button"
              onClick={onOpenVerify}
              className={`hidden md:inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                verifiedCustomer
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-2xs'
                  : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800'
              }`}
              title={verifiedCustomer ? 'Verified VIP Account' : 'Verify Customer'}
            >
              {verifiedCustomer?.photoURL ? (
                <img
                  src={verifiedCustomer.photoURL}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="truncate max-w-[110px]">
                {verifiedCustomer
                  ? `✓ ${verifiedCustomer.name.split(' ')[0]}`
                  : lang === 'bn'
                  ? 'যাচাই করুন'
                  : 'Verify yourself'}
              </span>
            </button>

            {/* Desktop: Language Switcher */}
            <button
              type="button"
              onClick={onToggleLang}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Universal Shopping Cart Button (Mobile & Desktop) */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl border border-blue-600/20 bg-blue-50/80 hover:bg-blue-100 text-blue-800 font-extrabold text-xs transition-colors shadow-2xs cursor-pointer min-w-[44px] h-[38px] sm:h-[40px]"
              style={
                colors?.cartIconBg
                  ? {
                      backgroundColor: colors.cartIconBg,
                      color: colors.cartIconFont || '#ffffff',
                      borderColor: colors.cartIconBg,
                    }
                  : undefined
              }
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">
                {lang === 'bn' ? 'কার্ট' : 'Cart'}
              </span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] sm:text-[11px] font-black shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile 3-Dot Menu Button (Requested by user: 3-dot kebab menu for mobile) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-[38px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shrink-0"
              aria-label="Open Navigation Menu"
              title="More Options"
            >
              <MoreVertical className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (Clean, responsive, with live auto-search) */}
        <div ref={mobileSearchRef} className="md:hidden pb-2.5 pt-1 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-blue-600 pointer-events-none" />
            <input
              ref={mobileInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => {
                if (searchQuery.trim()) setIsDropdownOpen(true);
              }}
              placeholder={
                lang === 'bn'
                  ? 'পণ্য খুঁজুন (Auto Search)...'
                  : 'Search products by name...'
              }
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Auto Search Results Overlay */}
          <AnimatePresence>
            {isDropdownOpen && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[360px] flex flex-col"
              >
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    {matchingProducts.length > 0
                      ? `ফলাফল (${matchingProducts.length})`
                      : 'পণ্য পাওয়া যায়নি'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="p-1 text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[300px] divide-y divide-slate-100">
                  {matchingProducts.slice(0, 6).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelect(prod)}
                      className="p-2.5 hover:bg-blue-50 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={prod.image}
                          alt=""
                          className="w-9 h-9 rounded-md object-contain bg-slate-50 p-0.5 border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {lang === 'bn' && prod.banglaTitle
                              ? prod.banglaTitle
                              : prod.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {prod.category}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 shrink-0">
                        ৳ {prod.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile 3-Dot Options Drawer Menu (Mounted to document.body via Portal so it renders full screen without header clipping) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-[9999] md:hidden overflow-hidden">
                {/* Full-screen Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
                />

                {/* Slide-in Sheet from Right (Full Viewport Height) */}
                <div className="fixed inset-y-0 right-0 max-w-full flex z-10 pointer-events-auto">
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="w-[85vw] max-w-[340px] h-[100dvh] h-screen bg-white shadow-2xl flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Drawer Top Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-900 text-white flex items-center justify-between shadow-xs shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 p-1 flex items-center justify-center">
                          <img
                            src={logoUrl || '/src/assets/images/duari_logo_1791125380292.jpg'}
                            alt=""
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-white tracking-tight">
                            Duari Shop
                          </h3>
                          <p className="text-[10px] text-blue-200">
                            মেনু ও গুরুত্বপূর্ণ অপশন
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Close Menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Drawer Scrollable Body Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* 1. Customer Verification / Account Profile */}
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {lang === 'bn' ? 'কাস্টমার প্রোফাইল' : 'Customer Account'}
                          </span>
                          {verifiedCustomer && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>যাচাইকৃত</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenVerify();
                          }}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            verifiedCustomer
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                              : 'bg-white border-blue-200 text-blue-900 shadow-xs hover:bg-blue-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                verifiedCustomer
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-xs leading-tight">
                                {verifiedCustomer
                                  ? verifiedCustomer.name
                                  : lang === 'bn'
                                  ? 'অ্যাকাউন্ট যাচাইকরণ / লগইন'
                                  : 'Verify Account / Login'}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {verifiedCustomer
                                  ? verifiedCustomer.phoneNumber || verifiedCustomer.email || 'VIP Member'
                                  : '১-ক্লিকে নিশ্চিত ভেরিফিকেশন'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>

                      {/* 2. Promotional Landing Offers Button */}
                      {onOpenLandingShowcase && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenLandingShowcase();
                          }}
                          className="w-full p-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white flex items-center justify-between shadow-md active:scale-98 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                              <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                            </div>
                            <div className="text-left">
                              <p className="font-extrabold text-xs text-white">
                                {lang === 'bn' ? '🔥 স্পেশাল ল্যান্ডিং অফার' : '🔥 Promo Landing Offers'}
                              </p>
                              <p className="text-[10px] text-red-100">
                                {landingPagesCount > 0
                                  ? `${landingPagesCount}টি ধামাকা অফার চলছে!`
                                  : 'সকল বিশেষ অফার দেখুন'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                            Hot
                          </span>
                        </button>
                      )}

                      {/* 3. Language Switcher (Segmented buttons) */}
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                            <span>{lang === 'bn' ? 'ভাষা নির্বাচন' : 'Language'}</span>
                          </span>
                          <span className="text-[10px] font-semibold text-blue-600">
                            {lang === 'bn' ? 'বর্তমান: বাংলা' : 'Current: English'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => {
                              if (lang !== 'bn') onToggleLang();
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              lang === 'bn'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <span>🇧🇩 বাংলা</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (lang !== 'en') onToggleLang();
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              lang === 'en'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <span>🇺🇸 English</span>
                          </button>
                        </div>
                      </div>

                      {/* 4. Customer Support, Delivery & Policies */}
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {lang === 'bn' ? 'সহায়তা ও পলিসি' : 'Support & Policies'}
                        </span>

                        {/* Hotline */}
                        <a
                          href="tel:01621871225"
                          className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 text-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                            <span>হটলাইন: 01621871225</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded">
                            সরাসরি কল
                          </span>
                        </a>

                        {/* Delivery Info */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenCustomerCare?.('delivery');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>ডেলিভারি পলিসি ও চার্জ</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {/* Returns */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenCustomerCare?.('returns');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                            <span>৭ দিনের সহজ রিটার্ন পলিসি</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {/* About */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenCustomerCare?.('about');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-indigo-600" />
                            <span>আমাদের সম্পর্কে (About Us)</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Drawer Bottom Quick Action */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenCart();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>
                          {lang === 'bn' ? 'শপিং কার্ট দেখুন' : 'View Shopping Cart'}{' '}
                          ({cartCount})
                        </span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
};
