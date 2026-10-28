import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Star,
  Play,
  Film,
  Phone,
  Gift,
  Flame,
  Sparkles,
  Lock,
  ChevronDown,
  Layers,
  ShoppingBag,
  Tag,
  Percent,
  X,
  AlertCircle,
} from 'lucide-react';
import { Product, StoreSettings, PaymentMethod, ShippingInfo, LandingPageConfig, PromoCode, VerifiedCustomer } from '../types';
import { CustomerCareTab } from './CustomerCareModal';
import { AnimatedButton } from './AnimatedButton';
import { ProductDescriptionView } from './ProductDescriptionView';
import { detectDeliveryArea } from '../utils/areaDetector';
import {
  getLandingPageScheduleStatus,
  getPromoCodeScheduleStatus,
  formatDisplayDateTime,
} from '../utils/scheduleUtils';

interface LandingPageProps {
  product: Product;
  config?: LandingPageConfig;
  settings: StoreSettings;
  promoCodes?: PromoCode[];
  onBackToStore: () => void;
  onCompleteOrder: (orderData: {
    shipping: ShippingInfo;
    paymentMethod: PaymentMethod;
    cart: { product: Product; quantity: number }[];
    subtotal: number;
    shippingFee: number;
    promoCode?: string;
    discountAmount?: number;
    total: number;
  }) => void;
  onOpenCustomerCare?: (tab: CustomerCareTab) => void;
  lang?: 'en' | 'bn';
  verifiedCustomer?: VerifiedCustomer | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  product,
  config,
  settings,
  promoCodes = [],
  onBackToStore,
  onCompleteOrder,
  onOpenCustomerCare,
  lang = 'bn',
  verifiedCustomer,
}) => {
  const schedStatus = config ? getLandingPageScheduleStatus(config, lang) : null;

  // Real countdown timer based on actual schedule timing
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>(() => {
    const targetMs = schedStatus?.status === 'scheduled' ? schedStatus.startMs : schedStatus?.endMs;
    if (targetMs) {
      const diff = Math.max(0, targetMs - Date.now());
      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      return { days, hours, minutes, seconds };
    }
    return { days: 0, hours: 2, minutes: 45, seconds: 18 };
  });

  useEffect(() => {
    const updateTimer = () => {
      const targetMs = schedStatus?.status === 'scheduled' ? schedStatus.startMs : schedStatus?.endMs;
      if (targetMs) {
        const diff = Math.max(0, targetMs - Date.now());
        const totalSec = Math.floor(diff / 1000);
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
          if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
          return { days: 0, hours: 2, minutes: 45, seconds: 18 };
        });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [config?.scheduleEnd, config?.endDate, config?.scheduleStart, config?.startDate, schedStatus?.status]);

  // Selected media preview
  const [selectedMedia, setSelectedMedia] = useState<string>(product.image);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Direct checkout order form states
  const [fullName, setFullName] = useState(
    verifiedCustomer?.name || 'Durjoy Kar'
  );
  const [phoneNumber, setPhoneNumber] = useState(
    verifiedCustomer?.phoneNumber || '01621871225'
  );
  const [fullAddress, setFullAddress] = useState('Road 27, Dhanmondi, Dhaka');
  const [quantity, setQuantity] = useState(1);
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('inside');
  const [autoDetectedBadge, setAutoDetectedBadge] = useState<string | null>(
    '✓ Dhanmondi চিহ্নিত (অটো সিলেক্ট: ঢাকার ভিতরে - ৳৬০)'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (verifiedCustomer?.name) setFullName(verifiedCustomer.name);
    if (verifiedCustomer?.phoneNumber) setPhoneNumber(verifiedCustomer.phoneNumber);
  }, [verifiedCustomer]);

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Auto-detect inside vs outside Dhaka when address changes
  const handleAddressChange = (addressText: string) => {
    setFullAddress(addressText);
    const result = detectDeliveryArea(addressText);
    if (result.area) {
      setDeliveryArea(result.area);
      setAutoDetectedBadge(result.badgeText || null);
    } else {
      setAutoDetectedBadge(null);
    }
  };

  // Price calculations
  const unitPrice = config?.offerPrice || product.price;
  const regularPrice = config?.regularPrice || product.originalPrice || unitPrice + 400;
  const subtotal = unitPrice * quantity;
  const deliveryCharge =
    deliveryArea === 'inside'
      ? settings.insideDeliveryCharge || 60
      : settings.outsideDeliveryCharge || 120;

  // Calculate promo discount
  const calculatePromoDiscount = (code: PromoCode, orderSubtotal: number): number => {
    if (code.minPurchase && orderSubtotal < code.minPurchase) {
      return 0;
    }
    let disc = 0;
    if (code.discountType === 'percentage') {
      disc = Math.round((orderSubtotal * code.discountValue) / 100);
      if (code.maxDiscount && code.maxDiscount > 0) {
        disc = Math.min(disc, code.maxDiscount);
      }
    } else {
      disc = Math.min(code.discountValue, orderSubtotal);
    }
    return disc;
  };

  const discountAmount = appliedPromo ? calculatePromoDiscount(appliedPromo, subtotal) : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryCharge);
  const savings = (regularPrice - unitPrice) * quantity + discountAmount;

  const handleApplyPromo = (overrideCode?: string) => {
    const codeToTry = (overrideCode || promoInput).trim().toUpperCase();
    setPromoError(null);
    setPromoSuccess(null);

    if (!codeToTry) {
      setPromoError(lang === 'bn' ? 'অনুগ্রহ করে প্রোমো কোড দিন' : 'Please enter a promo code');
      return;
    }

    const found = (promoCodes || []).find(
      (p) => p.code.trim().toUpperCase() === codeToTry
    );

    if (!found) {
      setPromoError(
        lang === 'bn'
          ? `"${codeToTry}" প্রোমো কোডটি সঠিক নয়`
          : `Invalid promo code "${codeToTry}"`
      );
      return;
    }

    if (found.active === false) {
      setPromoError(
        lang === 'bn'
          ? 'এই প্রোমো কোডটি বর্তমানে নিষ্ক্রিয়'
          : 'This promo code is currently inactive'
      );
      return;
    }

    const promoSched = getPromoCodeScheduleStatus(found, lang);
    if (promoSched.status === 'scheduled') {
      setPromoError(
        lang === 'bn'
          ? `এই প্রোমো কোডটি এখনো শুরু হয়নি! (${promoSched.displayText})`
          : `This promo code has not started yet! (${promoSched.displayText})`
      );
      return;
    }

    if (promoSched.status === 'expired') {
      setPromoError(
        lang === 'bn'
          ? 'এই প্রোমো কোডটির মেয়াদ উত্তীর্ণ হয়েছে'
          : 'This promo code has expired'
      );
      return;
    }

    if (found.minPurchase && subtotal < found.minPurchase) {
      setPromoError(
        lang === 'bn'
          ? `এই কোডটি পেতে সর্বনিম্ন ৳${found.minPurchase.toLocaleString()} টাকার অর্ডার লাগবে`
          : `Min purchase of ৳${found.minPurchase.toLocaleString()} required for this code`
      );
      return;
    }

    const calculated = calculatePromoDiscount(found, subtotal);
    if (calculated <= 0) {
      setPromoError(lang === 'bn' ? 'ডিসকাউন্ট প্রযোজ্য নয়' : 'Discount could not be applied');
      return;
    }

    setAppliedPromo(found);
    setPromoInput(found.code);
    setPromoSuccess(
      lang === 'bn'
        ? `🎉 "${found.code}" কোড প্রয়োগ করা হয়েছে! ৳${calculated} ছাড়!`
        : `🎉 Code "${found.code}" applied! You saved ৳${calculated}!`
    );
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoSuccess(null);
    setPromoError(null);
  };

  const scrollToOrderForm = () => {
    const formElement = document.getElementById('landing-order-form');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = fullName.trim() || verifiedCustomer?.name || 'Durjoy Kar';
    const finalPhone = phoneNumber.trim() || verifiedCustomer?.phoneNumber || '01621871225';
    const finalAddress = fullAddress.trim() || 'Road 27, Dhanmondi, Dhaka';

    setIsSubmitting(true);

    const shipping: ShippingInfo = {
      fullName: finalName,
      phoneNumber: finalPhone,
      fullAddress: finalAddress,
      city: deliveryArea === 'inside' ? 'Dhaka' : 'Outside Dhaka',
      zone: 'Standard Zone',
      area: deliveryArea === 'inside' ? 'Dhaka City' : 'Nationwide',
    };

    onCompleteOrder({
      shipping,
      paymentMethod,
      cart: [{ product, quantity }],
      subtotal,
      shippingFee: deliveryCharge,
      promoCode: appliedPromo?.code,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      total,
    });

    setIsSubmitting(false);
  };

  const allImages = [
    product.image,
    ...(product.gallery || []).filter((g) => g !== product.image),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Top Floating Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মূল ওয়েবসাইটে ফিরুন</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              {settings.storeName || 'Duari Shop'} <span className="text-blue-600">Exclusive</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCustomerCare?.('contact')}
              className="flex items-center gap-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">হেল্পলাইন:</span>
              <span>{settings.hotline || '01621871225'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Schedule Banner with Live Countdown */}
      {schedStatus?.status === 'scheduled' ? (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-2.5 px-4 text-center shadow-inner">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-extrabold">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>⏳ এই বিশেষ অফার ক্যাম্পেইনটি শুরু হতে বাকি:</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-sm bg-black/40 px-3 py-0.5 rounded-lg border border-white/20">
              {timeLeft.days > 0 && (
                <>
                  <span>{timeLeft.days} দিন</span>
                  <span>•</span>
                </>
              )}
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>

            <span className="text-amber-100 font-bold">
              • শুরুর সময়: {formatDisplayDateTime(config?.startDate, config?.startTime, lang)}
            </span>
          </div>
        </div>
      ) : schedStatus?.status === 'expired' ? (
        <div className="bg-gradient-to-r from-slate-800 via-rose-900 to-slate-900 text-white py-2.5 px-4 text-center shadow-inner">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs font-extrabold">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>এই বিশেষ অফার ক্যাম্পেইনের মেয়াদ সমাপ্ত হয়েছে। স্টক থাকা সাপেক্ষে নিয়মিত মূল্যে অর্ডার নেওয়া হচ্ছে।</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white py-2.5 px-4 text-center shadow-inner">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-extrabold">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>সীমিত সময়ের স্পেশাল অফার! স্টক খুব সীমিত:</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-sm bg-black/30 px-3 py-0.5 rounded-lg border border-white/20">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              {timeLeft.days > 0 && (
                <>
                  <span>{timeLeft.days}d</span>
                  <span>•</span>
                </>
              )}
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>

            <span className="hidden md:inline text-amber-200">
              • সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* HERO TITLE & BADGE */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>{config?.badge || '🔥 মেগা ক্যাম্পেইন ডিসকাউন্ট'}</span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            {config?.banglaHeadline || product.banglaTitle || product.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {config?.subheadline ||
              '১০০% আসল প্রোডাক্ট, দ্রুততম হোম ডেলিভারি এবং পার্সেল খুলে চেক করে পেমেন্ট করার শতভাগ নিশ্চয়তা।'}
          </p>
        </div>

        {/* MEDIA SHOWCASE & QUICK OFFER CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md">
          {/* Left Media (Image / Video Player) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="aspect-4/3 rounded-2xl bg-slate-950 overflow-hidden relative border border-slate-200 shadow-inner flex items-center justify-center">
              {product.videoUrl && isVideoPlaying ? (
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <img
                    src={selectedMedia}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                  {product.videoUrl && (
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 group hover:bg-black/20 transition-all cursor-pointer"
                      title="Play Product Video"
                    >
                      <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-1" />
                      </div>
                    </button>
                  )}
                </>
              )}

              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                ইন স্টক - ডেলিভারি প্রস্তুত
              </span>
            </div>

            {/* Thumbnail selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMedia(imgUrl);
                    setIsVideoPlaying(false);
                  }}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedMedia === imgUrl && !isVideoPlaying
                      ? 'border-blue-600 scale-105 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}

              {product.videoUrl && (
                <button
                  onClick={() => setIsVideoPlaying(true)}
                  className={`w-14 h-14 rounded-xl bg-purple-900 border-2 text-white flex flex-col items-center justify-center shrink-0 cursor-pointer ${
                    isVideoPlaying ? 'border-purple-500 scale-105' : 'border-slate-200 opacity-80'
                  }`}
                  title="Watch Video"
                >
                  <Film className="w-4 h-4" />
                  <span className="text-[9px] font-bold">ভিডিও</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Price & Quick Call to Action */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-amber-500">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {product.rating || 5.0} ({product.reviewsCount || 142} টি কাস্টমার রিভিউ)
                </span>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-blue-900">
                    ৳ {unitPrice.toLocaleString()}
                  </span>
                  {regularPrice > unitPrice && (
                    <span className="text-base text-slate-400 line-through font-bold">
                      ৳ {regularPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {savings > 0 && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-extrabold">
                    ৳ {savings.toLocaleString()} স্পেশাল সেভিংস!
                  </span>
                )}
              </div>
            </div>

            {/* Guaranteed Trust Badges */}
            <div className="grid grid-cols-2 gap-2.5 text-[11px] font-bold text-slate-700">
              <button
                type="button"
                onClick={() => onOpenCustomerCare?.('cod')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 flex items-center gap-2 cursor-pointer transition-colors text-left"
              >
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCustomerCare?.('returns')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 flex items-center gap-2 cursor-pointer transition-colors text-left"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>৭ দিনের রিপ্লেসমেন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCustomerCare?.('about')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 flex items-center gap-2 cursor-pointer transition-colors text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>১০০% আসল প্রোডাক্ট</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCustomerCare?.('delivery')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 flex items-center gap-2 cursor-pointer transition-colors text-left"
              >
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>২৪-৪৮ ঘণ্টায় ডেলিভারি</span>
              </button>
            </div>

            {/* Big Action Button to scroll down to order form */}
            <button
              type="button"
              onClick={scrollToOrderForm}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 animate-pulse"
            >
              <span>👉 এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
            </button>
          </div>
        </div>

        {/* PRODUCT HIGHLIGHTS & DESCRIPTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              কেন এই প্রোডাক্টটি আপনার জন্য সেরা পছন্দ?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              প্রোডাক্টটির বিস্তারিত বিবরণ ও বিশেষ ফিচারসমূহ
            </p>
          </div>

          {/* Features / Highlights */}
          {config?.features && config.features.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {config.features.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs sm:text-sm font-semibold text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          ) : product.banglaDescription && product.banglaDescription.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {product.banglaDescription.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          ) : null}

          {/* Full Rich Description */}
          <div className="pt-2">
            <ProductDescriptionView
              content={product.description}
              lang="bn"
              mode="landing"
            />
          </div>
        </div>

        {/* DIRECT INLINE ONE-CLICK CHECKOUT ORDER FORM */}
        <div
          id="landing-order-form"
          className="bg-white rounded-3xl border-2 border-blue-600 shadow-2xl p-6 sm:p-10 space-y-6 relative overflow-hidden"
        >
          {/* Header Banner */}
          <div className="text-center space-y-1.5 pb-4 border-b border-slate-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>এক ক্লিকে অর্ডার ফর্ম</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              অর্ডারটি কনফার্ম করতে নিচের তথ্যগুলো দিন
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করার সম্পূর্ণ সুবিধা। কোনো অগ্রিম টাকা লাগবে না।
            </p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-5 max-w-2xl mx-auto">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার নাম (Full Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="যেমন: মোঃ তানভির আহমেদ"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                মোবাইল নাম্বার (Mobile Number) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Address with Auto Area Detection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  সম্পূর্ণ ঠিকানা (Full Delivery Address) <span className="text-red-500">*</span>
                </label>
                {autoDetectedBadge && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{autoDetectedBadge}</span>
                  </span>
                )}
              </div>
              <textarea
                required
                rows={2}
                value={fullAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="বাসা নং, রোড নং, এলাকা, থানা এবং জেলার নাম লিখুন..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-[10px] text-slate-400">
                💡 ঠিকানা লিখলেই স্বয়ংক্রিয়ভাবে ঢাকার ভেতরে বা বাইরে চিহ্নিত হবে।
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">অর্ডারের পরিমাণ (Quantity):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-black text-sm hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-extrabold text-sm px-2">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-black text-sm hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Delivery Area Selection with Auto-detect feedback */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  📍 ডেলিভারি এরিয়া সেটআপ <span className="text-red-500">*</span>
                </label>
                {autoDetectedBadge && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    ⚡ {autoDetectedBadge}
                  </span>
                )}
              </div>

              {/* Quick Area Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: '⚡ ঢাকা সিটি', kw: 'ঢাকা', inside: true },
                  { name: '⚡ মিরপুর / উত্তরা', kw: 'মিরপুর', inside: true },
                  { name: '⚡ চট্টগ্রাম', kw: 'চট্টগ্রাম', inside: false },
                  { name: '⚡ সিলেট', kw: 'সিলেট', inside: false },
                  { name: '⚡ রাজশাহী', kw: 'রাজশাহী', inside: false },
                  { name: '⚡ খুলনা', kw: 'খুলনা', inside: false },
                  { name: '⚡ ময়মনসিংহ', kw: 'ময়মনসিংহ', inside: false },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDeliveryArea(chip.inside ? 'inside' : 'outside');
                      setAutoDetectedBadge(
                        chip.inside
                          ? `✓ ${chip.name} চিহ্নিত (অটো সিলেক্ট: ঢাকার ভিতরে)`
                          : `✓ ${chip.name} চিহ্নিত (অটো সিলেক্ট: ঢাকার বাইরে)`
                      );
                      if (!fullAddress.includes(chip.kw)) {
                        setFullAddress((prev) =>
                          prev ? `${prev}, ${chip.name.replace('⚡ ', '')}` : chip.name.replace('⚡ ', '')
                        );
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      (chip.inside && deliveryArea === 'inside') || (!chip.inside && deliveryArea === 'outside')
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : chip.inside
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {chip.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label
                  onClick={() => setDeliveryArea('inside')}
                  className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    deliveryArea === 'inside'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="area"
                      checked={deliveryArea === 'inside'}
                      onChange={() => setDeliveryArea('inside')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">ঢাকার ভিতরে</span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">হোম ডেলিভারি</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700">
                    ৳ {settings.insideDeliveryCharge || 60}
                  </span>
                </label>

                <label
                  onClick={() => setDeliveryArea('outside')}
                  className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    deliveryArea === 'outside'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="area"
                      checked={deliveryArea === 'outside'}
                      onChange={() => setDeliveryArea('outside')}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">ঢাকার বাইরে</span>
                      <span className="text-[10px] text-blue-700 font-semibold block">সারাদেশে ডেলিভারি</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-700">
                    ৳ {settings.outsideDeliveryCharge || 120}
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                পেমেন্ট পদ্ধতি
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <span className="text-xs">ক্যাশ অন ডেলিভারি</span>
                </label>

                <label
                  onClick={() => setPaymentMethod('digital')}
                  className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer ${
                    paymentMethod === 'digital'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'digital'}
                    onChange={() => setPaymentMethod('digital')}
                  />
                  <span className="text-xs">বিকাশ / ডিজিটাল</span>
                </label>
              </div>
            </div>

            {/* Promo Code Input & Voucher Application Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  <span>প্রোমো কোড / কুপন (Promo Code)</span>
                </label>
              </div>

              {appliedPromo ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-xs">
                      {appliedPromo.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      - ৳ {discountAmount.toLocaleString()} ডিসকাউন্ট সক্রিয়
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        if (promoError) setPromoError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                      placeholder="প্রোমো কোড লিখুন"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 uppercase tracking-wide focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      প্রয়োগ
                    </button>
                  </div>

                  {promoError && (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{promoError}</span>
                    </div>
                  )}
                  {promoSuccess && (
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{promoSuccess}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Total Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>প্রোডাক্ট মূল্য ({quantity} টি):</span>
                <span>৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>ডেলিভারি চার্জ ({deliveryArea === 'inside' ? 'ঢাকা' : 'ঢাকার বাইরে'}):</span>
                <span>৳ {deliveryCharge}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-bold bg-slate-800/80 px-2 py-1 rounded">
                  <span>প্রোমো ডিসকাউন্ট ({appliedPromo?.code}):</span>
                  <span>- ৳ {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-700 flex justify-between text-base font-black text-amber-400">
                <span>সর্বমোট প্রদেয় মূল্য:</span>
                <span>৳ {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Confirm Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'অর্ডার প্রসেস হচ্ছে...'
                  : `অর্ডার কনফার্ম করুন (৳ ${total.toLocaleString()})`}
              </span>
            </button>
          </form>
        </div>
      </main>

      {/* Floating Bottom Bar on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3 sm:hidden shadow-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-bold">অফার মূল্য:</span>
          <span className="text-lg font-black text-blue-900">
            ৳ {unitPrice.toLocaleString()}
          </span>
        </div>
        <button
          onClick={scrollToOrderForm}
          className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md"
        >
          অর্ডার করুন
        </button>
      </div>
    </div>
  );
};
