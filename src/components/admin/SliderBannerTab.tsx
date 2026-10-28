import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  Plus,
  Save,
  Check,
  Trash2,
  Edit2,
  Eye,
  ArrowRight,
  Layers,
  ChevronLeft,
  ChevronRight,
  Upload,
  Sparkles,
  X,
  Sliders,
  CheckCircle2,
  Link as LinkIcon,
  ExternalLink,
  Package,
  Tag,
  Rocket,
  ShoppingBag,
  Globe,
} from 'lucide-react';
import {
  BannerSlide,
  StoreSettings,
  BannerLogoConfig,
  Product,
  LandingPageConfig,
} from '../../types';
import { AnimatedButton } from '../AnimatedButton';

interface SliderBannerTabProps {
  banner?: BannerSlide;
  onUpdateBanner: (banner: BannerSlide) => void;
  slides?: BannerSlide[];
  onUpdateSlides?: (slides: BannerSlide[]) => void;
  settings?: StoreSettings;
  onUpdateSettings?: (settings: StoreSettings) => void;
  products?: Product[];
  categories?: string[];
  landingPages?: LandingPageConfig[];
}

const DEFAULT_SLIDES: BannerSlide[] = [];

// Presets matching the user's uploaded banner screenshot
const LOGO_PRESETS = [
  {
    name: 'Smart Gadget 3D Tech (Screenshot 2)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    title: 'Smart Gadget',
    subtitle: 'Better Life',
  },
  {
    name: 'Duari Shop Official Badge',
    url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=200&auto=format&fit=crop&q=80',
    title: 'Duari Shop',
    subtitle: 'Doorstep Delivery',
  },
  {
    name: 'Verified Genuine Tech Logo',
    url: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=200&auto=format&fit=crop&q=80',
    title: 'Genuine Gear',
    subtitle: '100% Authentic',
  },
];

export const SliderBannerTab: React.FC<SliderBannerTabProps> = ({
  banner,
  onUpdateBanner,
  slides = DEFAULT_SLIDES,
  onUpdateSlides,
  settings,
  onUpdateSettings,
  products = [],
  categories = [],
  landingPages = [],
}) => {
  const [slideList, setSlideList] = useState<BannerSlide[]>(slides);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);

  // Logo Modal State
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [bannerLogoState, setBannerLogoState] = useState<BannerLogoConfig>(() => {
    return (
      settings?.bannerLogo || {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        active: true,
        animation: 'float',
        position: 'top-left',
        size: 'md',
        title: 'Smart Gadget',
        subtitle: 'Better Life',
      }
    );
  });

  // Form states for slide add/edit
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [banglaTitle, setBanglaTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('ORDER NOW');
  const [active, setActive] = useState(true);
  const [link, setLink] = useState('');
  const [linkType, setLinkType] = useState<
    'custom' | 'product' | 'category' | 'landing' | 'catalog'
  >('catalog');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedLandingId, setSelectedLandingId] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const activeSlides = slideList.filter((s) => s.active);
  const currentPreviewSlide =
    activeSlides[previewIndex] || activeSlides[0] || (banner?.image ? banner : null) || slideList[0] || null;

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setImage(
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80'
    );
    setTitle('Special Festival Offer');
    setBanglaTitle('সীমিত সময়ের জন্য বিশেষ ছাড় ও উপহার!');
    setSubtitle('Order authentic tech gadgets with cash on delivery');
    setCtaText('ORDER NOW');
    setActive(true);
    setLink('#catalog-section');
    setLinkType('catalog');
    setOpenInNewTab(false);
    setSelectedProductId(products[0]?.id || '');
    setSelectedCategoryName(categories[0] || '');
    setSelectedLandingId(landingPages[0]?.id || '');
    setIsAdding(true);
  };

  const handleOpenEdit = (slide: BannerSlide) => {
    setEditingSlide(slide);
    setImage(slide.image);
    setTitle(slide.title);
    setBanglaTitle(slide.banglaTitle || '');
    setSubtitle(slide.subtitle || '');
    setCtaText(slide.ctaText || 'ORDER NOW');
    setActive(slide.active);

    const sLink = slide.link || '';
    setLink(sLink);
    setOpenInNewTab(Boolean(slide.openInNewTab));

    if (slide.linkType) {
      setLinkType(slide.linkType);
    } else if (sLink.startsWith('product:')) {
      setLinkType('product');
    } else if (sLink.startsWith('category:')) {
      setLinkType('category');
    } else if (sLink.startsWith('landing:')) {
      setLinkType('landing');
    } else if (sLink === '#catalog-section' || !sLink) {
      setLinkType('catalog');
    } else {
      setLinkType('custom');
    }

    if (sLink.startsWith('product:')) {
      setSelectedProductId(sLink.replace('product:', '').trim());
    } else {
      setSelectedProductId(products[0]?.id || '');
    }

    if (sLink.startsWith('category:')) {
      setSelectedCategoryName(sLink.replace('category:', '').trim());
    } else {
      setSelectedCategoryName(categories[0] || '');
    }

    if (sLink.startsWith('landing:')) {
      setSelectedLandingId(sLink.replace('landing:', '').trim());
    } else {
      setSelectedLandingId(landingPages[0]?.id || '');
    }

    setIsAdding(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !title) return;

    let finalLink = link.trim();
    if (linkType === 'product') {
      finalLink = selectedProductId ? `product:${selectedProductId}` : '';
    } else if (linkType === 'category') {
      finalLink = selectedCategoryName ? `category:${selectedCategoryName}` : '';
    } else if (linkType === 'landing') {
      finalLink = selectedLandingId ? `landing:${selectedLandingId}` : '';
    } else if (linkType === 'catalog') {
      finalLink = '#catalog-section';
    }

    if (editingSlide) {
      const updatedSlide: BannerSlide = {
        ...editingSlide,
        image,
        title,
        banglaTitle,
        subtitle,
        ctaText,
        active,
        link: finalLink,
        linkType,
        openInNewTab,
      };
      const updated = slideList.map((s) =>
        s.id === editingSlide.id ? updatedSlide : s
      );
      setSlideList(updated);
      if (onUpdateSlides) onUpdateSlides(updated);
      if (banner && editingSlide.id === banner.id) {
        onUpdateBanner(updatedSlide);
      }
    } else {
      const newSlide: BannerSlide = {
        id: `slide-${Date.now()}`,
        image,
        title,
        banglaTitle,
        subtitle,
        ctaText,
        active,
        link: finalLink,
        linkType,
        openInNewTab,
      };
      const updated = [...slideList, newSlide];
      setSlideList(updated);
      if (onUpdateSlides) onUpdateSlides(updated);
    }

    setIsAdding(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  // Helper to format link description and target for admin view
  const getLinkDisplayInfo = (sLink?: string) => {
    if (!sLink || sLink === '#catalog-section') {
      return {
        label: 'সকল প্রোডাক্ট ক্যাটালগ (All Products)',
        shortLabel: 'ক্যাটালগ স্ক্রল',
        icon: <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        url: '#catalog-section',
      };
    }
    if (sLink.startsWith('product:')) {
      const pId = sLink.replace('product:', '').trim();
      const p = products.find((item) => item.id === pId);
      return {
        label: p ? `পণ্য: ${p.title}` : `পণ্য ID: ${pId}`,
        shortLabel: p ? p.title : pId,
        icon: <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />,
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
        url: `#product-${pId}`,
      };
    }
    if (sLink.startsWith('category:')) {
      const cat = sLink.replace('category:', '').trim();
      return {
        label: `ক্যাটাগরি: ${cat}`,
        shortLabel: cat,
        icon: <Tag className="w-3.5 h-3.5 text-purple-600 shrink-0" />,
        badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
        url: `#category-${cat}`,
      };
    }
    if (sLink.startsWith('landing:')) {
      const lId = sLink.replace('landing:', '').trim();
      const lp = landingPages.find(
        (item) => item.id === lId || item.productId === lId
      );
      return {
        label: lp ? `ল্যান্ডিং: ${lp.title}` : `ল্যান্ডিং ID: ${lId}`,
        shortLabel: lp ? lp.title : lId,
        icon: <Rocket className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        url: `/?landing=${lId}`,
      };
    }
    if (sLink === '/adminshop') {
      return {
        label: 'অ্যাডমিন প্যানেল (/adminshop)',
        shortLabel: '/adminshop',
        icon: <Sliders className="w-3.5 h-3.5 text-indigo-600 shrink-0" />,
        badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        url: '/adminshop',
      };
    }
    return {
      label: sLink,
      shortLabel: sLink,
      icon: <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" />,
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      url: sLink,
    };
  };

  const handleDeleteSlide = (id: string) => {
    const updated = slideList.filter((s) => s.id !== id);
    setSlideList(updated);
    if (onUpdateSlides) onUpdateSlides(updated);
    if (previewIndex >= updated.length) {
      setPreviewIndex(0);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = slideList.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    setSlideList(updated);
    if (onUpdateSlides) onUpdateSlides(updated);
  };

  const handleSaveLogoConfig = () => {
    if (settings && onUpdateSettings) {
      const updatedSettings = {
        ...settings,
        bannerLogo: bannerLogoState,
        logo: bannerLogoState.url,
      };
      onUpdateSettings(updatedSettings);
    }
    setIsLogoModalOpen(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBannerLogoState((prev) => ({
            ...prev,
            url: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Animation variants for live preview
  const getLogoAnimation = (type: string) => {
    switch (type) {
      case 'float':
        return {
          animate: { y: [0, -6, 0] },
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'glow':
        return {
          animate: {
            filter: [
              'drop-shadow(0 0 3px rgba(59,130,246,0.4))',
              'drop-shadow(0 0 14px rgba(59,130,246,0.9))',
              'drop-shadow(0 0 3px rgba(59,130,246,0.4))',
            ],
          },
          transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'bounce':
        return {
          animate: { y: [0, -8, 0] },
          transition: { duration: 1.5, repeat: Infinity, ease: 'easeOut' as const },
        };
      case 'wave':
        return {
          animate: { rotate: [-2, 2, -2] },
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
        };
      default:
        return {};
    }
  };

  const getPositionClass = (pos: string) => {
    switch (pos) {
      case 'top-right':
        return 'top-3 right-3 sm:top-5 sm:right-6';
      case 'bottom-left':
        return 'bottom-16 left-4 sm:bottom-20 sm:left-8';
      case 'bottom-right':
        return 'bottom-14 right-4 sm:bottom-16 sm:right-8';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'top-left':
      default:
        return 'top-3 left-3 sm:top-5 sm:left-6';
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm':
        return 'max-h-8 sm:max-h-10';
      case 'lg':
        return 'max-h-16 sm:max-h-20';
      case 'xl':
        return 'max-h-20 sm:max-h-24';
      case 'md':
      default:
        return 'max-h-12 sm:max-h-14';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Add Slider and Add Logo Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>স্লাইডার ও ব্যানার ম্যানেজার (Slider & Banner Management)</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase">
              Live Sync
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add multiple hero slides, customize animated logo badges, and preview storefront carousel.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Prominent Animated Button for Adding Logo to Slider & Banner */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          >
            <AnimatedButton
              variant="accent"
              size="md"
              onClick={() => setIsLogoModalOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />}
              className="!bg-gradient-to-r !from-amber-500 !via-orange-500 !to-rose-500 hover:!from-amber-600 hover:!to-rose-600 !text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 border border-amber-300/40 cursor-pointer"
            >
              ✨ লোগো যোগ করুন (Add Logo with Animation)
            </AnimatedButton>
          </motion.div>

          <AnimatedButton
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold text-xs"
          >
            নতুন স্লাইড যোগ করুন (Add Slider)
          </AnimatedButton>
        </div>
      </div>

      {/* Success Toast */}
      {savedToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          <span>সফলভাবে ক্লাউড ডেটাবেসে সংরক্ষিত হয়েছে! (Saved Successfully)</span>
        </motion.div>
      )}

      {/* Live Carousel Preview Card (Bright white background, zero black flash) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>লাইভ স্লাইডার প্রিভিউ (Live Carousel Preview)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLogoModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>লোগো সেটিংস</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setPreviewIndex((prev) =>
                    prev === 0 ? activeSlides.length - 1 : prev - 1
                  )
                }
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold text-slate-500 px-1">
                {activeSlides.length > 0 ? previewIndex + 1 : 0} /{' '}
                {activeSlides.length}
              </span>
              <button
                onClick={() =>
                  setPreviewIndex((prev) =>
                    prev === activeSlides.length - 1 ? 0 : prev + 1
                  )
                }
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 
          Container has clean white backdrop and base image underlay
          so no dark frame or black flash appears!
        */}
        {!currentPreviewSlide ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/70">
            <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-800">
                কোনো ব্যানার স্লাইড তৈরি করা নেই
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                হোমপেজে স্লাইডার দেখাতে উপরের &apos;নতুন স্লাইড যোগ করুন&apos; বাটনে ক্লিক করুন।
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>প্রথম স্লাইড যোগ করুন</span>
            </button>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden aspect-[21/9] sm:aspect-[24/9] md:aspect-[3/1] max-h-[380px] bg-white border border-slate-200 group">
            <img
              src={currentPreviewSlide.image}
              alt={currentPreviewSlide.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Animated Logo Overlay in Live Preview */}
            {bannerLogoState.active && bannerLogoState.url && (
              <div
                className={`absolute z-20 pointer-events-none ${getPositionClass(
                  bannerLogoState.position
                )}`}
              >
                <motion.div
                  {...getLogoAnimation(bannerLogoState.animation)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-lg border border-white/70"
                >
                  <img
                    src={bannerLogoState.url}
                    alt="Logo preview"
                    className={`w-auto object-contain shrink-0 ${getSizeClass(
                      bannerLogoState.size
                    )}`}
                  />
                  {bannerLogoState.title && (
                    <div className="hidden sm:block pr-1.5">
                      <span className="font-black text-xs text-slate-900 leading-tight block">
                        {bannerLogoState.title}
                      </span>
                      {bannerLogoState.subtitle && (
                        <span className="text-[9px] font-semibold text-blue-600 block">
                          {bannerLogoState.subtitle}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* Clean soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent flex items-end p-5 sm:p-7">
              <div className="space-y-1 max-w-lg text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                  Featured Slide
                </span>
                <h3 className="font-black text-base sm:text-xl leading-tight">
                  {currentPreviewSlide.title}
                </h3>
                {currentPreviewSlide.banglaTitle && (
                  <p className="text-xs text-blue-200 font-medium">
                    {currentPreviewSlide.banglaTitle}
                  </p>
                )}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white font-black text-xs shadow-lg uppercase inline-block">
                    {currentPreviewSlide.ctaText || 'ORDER NOW'}
                  </span>
                  {(() => {
                    const info = getLinkDisplayInfo(currentPreviewSlide.link);
                    return (
                      <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs text-white/95 text-[10px] font-bold border border-white/20 flex items-center gap-1.5">
                        <LinkIcon className="w-3 h-3 text-blue-300" />
                        <span>{info.shortLabel}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animated Banner Logo Configuration Modal */}
      <AnimatePresence>
        {isLogoModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      ব্যানার লোগো সেটিংস (Banner Logo with Animation)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure floating animated badge or brand logo for the hero banner.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogoModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toggle Active */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    ব্যানারে লোগো সক্রিয় করুন (Enable Logo Badge)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Show animated logo overlay on hero slider
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bannerLogoState.active}
                    onChange={(e) =>
                      setBannerLogoState((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Preset One-Click Badges */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  রেডিমেড প্রিসেট লোগো (Quick Presets):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LOGO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setBannerLogoState((prev) => ({
                          ...prev,
                          url: preset.url,
                          title: preset.title,
                          subtitle: preset.subtitle,
                          active: true,
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 hover:border-blue-400 transition-all cursor-pointer ${
                        bannerLogoState.url === preset.url
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt=""
                        className="w-8 h-8 rounded-lg object-contain bg-slate-50 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-black text-slate-800 truncate block">
                          {preset.title}
                        </span>
                        <span className="text-[9px] text-slate-500 truncate block">
                          {preset.subtitle}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Logo URL & File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  লোগো ইমেজ লিঙ্ক অথবা ফাইল আপলোড (Logo URL or Upload) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerLogoState.url}
                    onChange={(e) =>
                      setBannerLogoState((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    placeholder="https://... or choose file"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Animation Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    লোগো অ্যানিমেশন (Animation Effect):
                  </label>
                  <select
                    value={bannerLogoState.animation}
                    onChange={(e) =>
                      setBannerLogoState((prev) => ({
                        ...prev,
                        animation: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="float">🎈 Floating (স্মুথ ভাসমান)</option>
                    <option value="pulse">✨ Glowing Pulse (উজ্জ্বল পালস)</option>
                    <option value="glow">💡 Neon Glow (নিয়ন গ্লো)</option>
                    <option value="bounce">⚡ 3D Bounce (বাউন্স ইফেক্ট)</option>
                    <option value="wave">🌊 Gentle Wave (তরঙ্গ দোলা)</option>
                    <option value="none">🚫 No Animation (স্থির)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    অবস্থান (Badge Position):
                  </label>
                  <select
                    value={bannerLogoState.position}
                    onChange={(e) =>
                      setBannerLogoState((prev) => ({
                        ...prev,
                        position: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="top-left">উপরে বামে (Top Left)</option>
                    <option value="top-right">উপরে ডানে (Top Right)</option>
                    <option value="bottom-left">নিচে বামে (Bottom Left)</option>
                    <option value="bottom-right">নিচে ডানে (Bottom Right)</option>
                    <option value="center">মাঝখানে (Center)</option>
                  </select>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    ব্র্যান্ড টাইটেল (Title Text):
                  </label>
                  <input
                    type="text"
                    value={bannerLogoState.title || ''}
                    onChange={(e) =>
                      setBannerLogoState((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g. Smart Gadget"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    সাবটাইটেল (Subtitle):
                  </label>
                  <input
                    type="text"
                    value={bannerLogoState.subtitle || ''}
                    onChange={(e) =>
                      setBannerLogoState((prev) => ({
                        ...prev,
                        subtitle: e.target.value,
                      }))
                    }
                    placeholder="e.g. Better Life"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Size selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  লোগো সাইজ (Logo Size):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() =>
                        setBannerLogoState((prev) => ({ ...prev, size: sz }))
                      }
                      className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        bannerLogoState.size === sz
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sz === 'sm'
                        ? 'Small'
                        : sz === 'md'
                        ? 'Medium'
                        : sz === 'lg'
                        ? 'Large'
                        : 'XL'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <AnimatedButton
                  variant="primary"
                  size="md"
                  onClick={handleSaveLogoConfig}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="font-bold text-xs"
                >
                  লোগো সংরক্ষণ করুন (Save Logo)
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Slide Modal / Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">
                {editingSlide
                  ? 'স্লাইড এডিট করুন (Edit Slide)'
                  : 'নতুন স্লাইড যোগ করুন (Add New Slide)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                বাতিল (Cancel)
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
              {/* Image Input & File Upload */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  স্লাইডার ইমেজ (Image URL or File Upload) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or uploaded photo"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setImage(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    হেডলাইন টাইটেল (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Special Festival Offer"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    বাংলা সাব-টাইটেল (Bangla Title)
                  </label>
                  <input
                    type="text"
                    value={banglaTitle}
                    onChange={(e) => setBanglaTitle(e.target.value)}
                    placeholder="যেমন: সীমিত সময়ের জন্য বিশেষ ছাড় ও উপহার!"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Subtitle & CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    ডেসক্রিপশন (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Fast, Reliable Doorstep Delivery"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    অ্যাকশন বাটন টেক্সট (Button CTA)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="ORDER NOW"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Slider Click Action & Link Selection */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/90 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
                        <span>স্লাইডার ক্লিক অ্যাকশন ও লিঙ্ক (Slider Link & Target)</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          Working Link
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        কাস্টমার স্লাইডারে ক্লিক করলে নির্দিষ্ট পণ্য, ক্যাটাগরি বা লিঙ্কে নিয়ে যাবে।
                      </p>
                    </div>
                  </div>

                  {/* Active Link Type indicator */}
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-blue-200 text-blue-700 w-fit self-start sm:self-auto shadow-2xs">
                    {linkType === 'catalog' && '🛒 সব প্রোডাক্ট ক্যাটালগ'}
                    {linkType === 'product' && '📦 নির্দিষ্ট পণ্য (Product)'}
                    {linkType === 'category' && '🏷️ পণ্যের ক্যাটাগরি (Category)'}
                    {linkType === 'landing' && '🚀 ল্যান্ডিং পেজ (Landing)'}
                    {linkType === 'custom' && '🌐 কাস্টম লিঙ্ক / ওয়েব URL'}
                  </span>
                </div>

                {/* 5-Option Link Type Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLinkType('catalog');
                      setLink('#catalog-section');
                    }}
                    className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                      linkType === 'catalog'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-[10px]">সব পণ্য (Catalog)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLinkType('product');
                      if (!selectedProductId && products[0]) {
                        setSelectedProductId(products[0].id);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                      linkType === 'product'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span className="text-[10px]">নির্দিষ্ট পণ্য (Product)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLinkType('category');
                      if (!selectedCategoryName && categories[0]) {
                        setSelectedCategoryName(categories[0]);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                      linkType === 'category'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    <span className="text-[10px]">ক্যাটাগরি (Category)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLinkType('landing');
                      if (!selectedLandingId && landingPages[0]) {
                        setSelectedLandingId(landingPages[0].id);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                      linkType === 'landing'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <Rocket className="w-4 h-4" />
                    <span className="text-[10px]">ল্যান্ডিং ক্যাম্পেইন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLinkType('custom');
                    }}
                    className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center col-span-2 sm:col-span-1 ${
                      linkType === 'custom'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-[10px]">কাস্টম URL</span>
                  </button>
                </div>

                {/* Dynamic Configuration Controls based on Link Type */}
                {linkType === 'product' && (
                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-blue-200/80">
                    <label className="block font-bold text-slate-700 text-[11px]">
                      পণ্য সিলেক্ট করুন (Select Target Product):
                    </label>
                    {products.length === 0 ? (
                      <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        কোনো প্রোডাক্ট পাওয়া যায়নি। প্রথমে প্রোডাক্ট ম্যানেজারে পণ্য যোগ করুন।
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <select
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-blue-600 bg-white text-xs"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} (৳{p.price}) - {p.category}
                            </option>
                          ))}
                        </select>

                        {/* Selected Product Quick Card Preview */}
                        {(() => {
                          const chosen =
                            products.find((p) => p.id === selectedProductId) ||
                            products[0];
                          if (!chosen) return null;
                          return (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50/70 border border-blue-200/70 text-[11px]">
                              <img
                                src={chosen.image}
                                alt={chosen.title}
                                className="w-10 h-10 rounded-md object-cover bg-white shrink-0 border border-slate-200"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="font-extrabold text-slate-900 block truncate">
                                  {chosen.title}
                                </span>
                                <span className="text-blue-700 font-bold">
                                  ৳{chosen.price}{' '}
                                  <span className="line-through text-slate-400 font-normal">
                                    ৳{chosen.originalPrice}
                                  </span>
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                {chosen.inStock ? 'ইন স্টক' : 'স্টক আউট'}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {linkType === 'category' && (
                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-blue-200/80">
                    <label className="block font-bold text-slate-700 text-[11px]">
                      ক্যাটাগরি সিলেক্ট করুন (Select Target Category):
                    </label>
                    {categories.length === 0 ? (
                      <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        কোনো ক্যাটাগরি তৈরি করা নেই।
                      </p>
                    ) : (
                      <select
                        value={selectedCategoryName}
                        onChange={(e) => setSelectedCategoryName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-blue-600 bg-white text-xs"
                      >
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>
                            🏷️ {cat}
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="text-[10px] text-slate-500">
                      স্লাইডারে ক্লিক করলে কাস্টমার সরাসরি এই ক্যাটাগরির ফিল্টার করা পণ্য দেখতে পাবে।
                    </p>
                  </div>
                )}

                {linkType === 'landing' && (
                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-blue-200/80">
                    <label className="block font-bold text-slate-700 text-[11px]">
                      ল্যান্ডিং পেজ সিলেক্ট করুন (Select Landing Campaign):
                    </label>
                    {landingPages.length === 0 ? (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <p className="font-bold text-slate-800">
                          এখনও কোনো ল্যান্ডিং পেজ তৈরি করা হয়নি।
                        </p>
                        <p className="text-[10px] text-slate-500">
                          আপনি &apos;ল্যান্ডিং পেজ বিল্ডার&apos; ট্যাব থেকে নতুন অফার ল্যান্ডিং ক্যাম্পেইন তৈরি করতে পারেন অথবা সরাসরি ল্যান্ডিং শোকেস পেজে লিঙ্ক করতে পারেন:
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setLinkType('custom');
                            setLink('/landing-showcase');
                          }}
                          className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold text-[10px] mt-1 cursor-pointer"
                        >
                          ল্যান্ডিং শোকেস পেজ সেট করুন (/landing-showcase)
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedLandingId}
                        onChange={(e) => setSelectedLandingId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-blue-600 bg-white text-xs"
                      >
                        {landingPages.map((lp) => (
                          <option key={lp.id} value={lp.id}>
                            🚀 {lp.title} (৳{lp.offerPrice})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {linkType === 'custom' && (
                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-blue-200/80">
                    <label className="block font-bold text-slate-700 text-[11px]">
                      কাস্টম লিঙ্ক অথবা ওয়েব URL (Custom Web Link):
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder="https://facebook.com/... বা /adminshop বা যেকোনো ওয়েবসাইট লিঙ্ক"
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-blue-600 text-xs"
                        />
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                      </div>
                      {link && (
                        <a
                          href={link.startsWith('http') ? link : (link.startsWith('/') ? link : `/${link}`)}
                          target={link.startsWith('http') ? '_blank' : '_self'}
                          rel="noreferrer"
                          className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 shrink-0 border border-slate-200 transition-colors"
                          title="Test Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>টেস্ট</span>
                        </a>
                      )}
                    </div>

                    {/* Quick Helper Links */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">
                        দ্রুত লিঙ্ক:
                      </span>
                      <button
                        type="button"
                        onClick={() => setLink('/adminshop')}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-200 cursor-pointer"
                      >
                        /adminshop
                      </button>
                      <button
                        type="button"
                        onClick={() => setLink('#catalog-section')}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-200 cursor-pointer"
                      >
                        #catalog-section
                      </button>
                      <button
                        type="button"
                        onClick={() => setLink('/landing-showcase')}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-200 cursor-pointer"
                      >
                        /landing-showcase
                      </button>
                      <button
                        type="button"
                        onClick={() => setLink('https://wa.me/8801621871225')}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold border border-emerald-200 cursor-pointer"
                      >
                        WhatsApp চ্যাট
                      </button>
                    </div>
                  </div>
                )}

                {linkType === 'catalog' && (
                  <div className="bg-white p-3 rounded-xl border border-blue-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      স্লাইডারে ক্লিক করলে কাস্টমার হোমপেজের সব প্রোডাক্ট ক্যাটালগে চলে যাবে এবং সরাসরি পণ্য ব্রাউজ করতে পারবে।
                    </span>
                  </div>
                )}

                {/* Open in New Tab Option (Especially for external links) */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="slide-new-tab"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor="slide-new-tab"
                    className="font-bold text-slate-700 text-[11px] cursor-pointer"
                  >
                    নতুন ব্রাউজার ট্যাবে লিঙ্কটি খুলুন (Open link in new tab)
                  </label>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slide-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label
                  htmlFor="slide-active"
                  className="font-bold text-slate-700 cursor-pointer"
                >
                  স্লাইড সক্রিয় রাখুন (Active on Storefront)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <AnimatedButton
                  variant="primary"
                  size="md"
                  type="submit"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="font-bold text-xs"
                >
                  {editingSlide ? 'আপডেট করুন (Save Changes)' : 'যোগ করুন (Add Slide)'}
                </AnimatedButton>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Cards List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>সকল ব্যানার স্লাইড ({slideList.length})</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Active slides rotate automatically on the homepage
          </span>
        </div>

        <div className="space-y-2.5">
          {slideList.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">কোনো ব্যানার স্লাইড তৈরি করা নেই</p>
              <p className="text-[11px] text-slate-400">
                নতুন ব্যানার স্লাইড তৈরি করতে উপরের &apos;নতুন স্লাইড যোগ করুন&apos; বাটনে ক্লিক করুন।
              </p>
            </div>
          ) : (
            slideList.map((slide, index) => (
            <div
              key={slide.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                slide.active
                  ? 'bg-white border-slate-200 hover:border-blue-300'
                  : 'bg-slate-50/60 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-5">
                  #{index + 1}
                </span>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-16 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {slide.title}
                  </h4>
                  {slide.banglaTitle && (
                    <p className="text-[11px] text-blue-600 font-medium">
                      {slide.banglaTitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">
                      বাটন: {slide.ctaText || 'ORDER NOW'}
                    </span>

                    {/* Working Link Target Badge */}
                    {(() => {
                      const info = getLinkDisplayInfo(slide.link);
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${info.badgeBg}`}
                          title={`Click Target: ${info.label}`}
                        >
                          {info.icon}
                          <span className="max-w-[200px] truncate">
                            {info.shortLabel}
                          </span>
                          {slide.openInNewTab && (
                            <span className="text-[9px] text-slate-500 font-normal">
                              (New Tab)
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Configure animated logo for banner/slide"
                >
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 animate-pulse" />
                  <span>লোগো সেটিংস</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleActive(slide.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                    slide.active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {slide.active ? 'ACTIVE' : 'INACTIVE'}
                </button>

                <button
                  onClick={() => handleOpenEdit(slide)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit slide"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteSlide(slide.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
};
