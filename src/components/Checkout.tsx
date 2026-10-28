import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronDown,
  ShieldCheck,
  Package,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  QrCode,
  Info,
  MapPin,
  Search,
  Tag,
  Percent,
  X,
  AlertCircle,
} from 'lucide-react';
import { CartItem, PaymentMethod, ShippingInfo, VerifiedCustomer, PromoCode } from '../types';
import { AnimatedButton } from './AnimatedButton';
import {
  detectDeliveryArea,
  isDhakaLocation,
  BANGLADESH_DISTRICTS,
  DHAKA_AREAS,
} from '../utils/areaDetector';
import { getPromoCodeScheduleStatus } from '../utils/scheduleUtils';

interface CheckoutProps {
  cart: CartItem[];
  promoCodes?: PromoCode[];
  onBack: () => void;
  onCompleteOrder: (orderData: {
    shipping: ShippingInfo;
    paymentMethod: PaymentMethod;
    cart: CartItem[];
    subtotal: number;
    shippingFee: number;
    promoCode?: string;
    discountAmount?: number;
    total: number;
  }) => void;
  lang: 'en' | 'bn';
  verifiedCustomer?: VerifiedCustomer | null;
  onOpenVerify?: () => void;
}

const CITY_OPTIONS = [
  'Dhaka > Dhanmondi > Road 27',
  'Dhaka > Mirpur > Mirpur-10',
  'Dhaka > Uttara > Sector 7',
  'Dhaka > Gulshan > Gulshan-2',
  'Dhaka > Banani > Kemal Ataturk Ave',
  'Dhaka > Mohammadpur > Ring Road',
  'Mymensingh > Mymensingh Sadar > College Road',
  'Chittagong > Panchlaish > GEC Circle',
  'Chittagong > Agrabad > Commercial Area',
  'Sylhet > Zindabazar > City Center',
  'Rajshahi > Boalia > Shaheb Bazar',
  'Khulna > Sonadanga > Bus Stand Area',
  'Gazipur > Joydebpur > Station Road',
  'Bogura > Sadar > Shatmatha',
  'Cumilla > Kandirpar > Main Road',
  'Barishal > Sadar > Sadar Road',
  'Rangpur > Jahaj Company More',
];

export type DetailedPaymentMethod =
  | 'cod'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'card'
  | 'pathao';

export const Checkout: React.FC<CheckoutProps> = ({
  cart,
  promoCodes = [],
  onBack,
  onCompleteOrder,
  lang,
  verifiedCustomer,
  onOpenVerify,
}) => {
  const [fullName, setFullName] = useState(
    verifiedCustomer?.name || 'Durjoy Kar'
  );
  const [phoneNumber, setPhoneNumber] = useState(
    verifiedCustomer?.phoneNumber || '01621871225'
  );

  React.useEffect(() => {
    if (verifiedCustomer?.name) setFullName(verifiedCustomer.name);
    if (verifiedCustomer?.phoneNumber) setPhoneNumber(verifiedCustomer.phoneNumber);
  }, [verifiedCustomer]);
  const [fullAddress, setFullAddress] = useState('Road 27, Dhanmondi, Dhaka');
  const [selectedArea, setSelectedArea] = useState('Dhaka > Dhanmondi > Road 27');
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('inside');
  const [autoDetectedBadge, setAutoDetectedBadge] = useState<string | null>(
    '✓ Dhanmondi চিহ্নিত হয়েছে (অটো সিলেক্ট: ঢাকার ভিতরে - ৳৬০)'
  );
  const [selectedPayment, setSelectedPayment] = useState<DetailedPaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Handle setting area directly (e.g., from quick chips or dropdown)
  const handleSelectArea = (areaText: string) => {
    setSelectedArea(areaText);
    setShowAreaDropdown(false);

    // Auto-detect whether this selected area is Inside Dhaka or Outside Dhaka
    const isInside = isDhakaLocation(areaText);
    const newArea = isInside ? 'inside' : 'outside';
    setDeliveryArea(newArea);

    const displayName = areaText.split('>')[1]?.trim() || areaText.split('>')[0]?.trim() || areaText;
    setAutoDetectedBadge(
      isInside
        ? `✓ ${displayName} চিহ্নিত হয়েছে (অটো সিলেক্ট: ঢাকার ভিতরে - ৳৬০)`
        : `✓ ${displayName} চিহ্নিত হয়েছে (অটো সিলেক্ট: ঢাকার বাইরে - ৳১২০)`
    );
  };

  // Auto detect inside vs outside Dhaka when typing address
  const handleAddressOrAreaChange = (addr: string, areaOpt?: string) => {
    setFullAddress(addr);
    const activeOpt = areaOpt || selectedArea;
    const result = detectDeliveryArea(`${addr} ${activeOpt}`);
    if (result.area) {
      setDeliveryArea(result.area);
      setAutoDetectedBadge(result.badgeText || null);
    }
  };

  // Cash on Delivery Options
  const [codChangePref, setCodChangePref] = useState('exact');
  const [codDeliveryNote, setCodDeliveryNote] = useState('');

  // Mobile Banking Inputs (bKash / Nagad / Rocket)
  const [mfsNumber, setMfsNumber] = useState('01621871225');
  const [mfsTrxId, setMfsTrxId] = useState('');
  const [copiedMerchant, setCopiedMerchant] = useState(false);

  // Pathao Pay Inputs
  const [pathaoMobile, setPathaoMobile] = useState('01621871225');
  const [pathaoPin, setPathaoPin] = useState('');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('DURJOY KAR');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Calculate pricing & discount
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const shippingFee = deliveryArea === 'inside' ? 60 : 120;

  // Calculate promo discount amount based on current subtotal
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
  const total = Math.max(0, subtotal - discountAmount + (cart.length > 0 ? shippingFee : 0));

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
        ? `🎉 "${found.code}" কোড প্রয়োগ করা হয়েছে! ৳${calculated} ডিসকাউন্ট পেয়েছেন!`
        : `🎉 Code "${found.code}" applied! You saved ৳${calculated}!`
    );
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoSuccess(null);
    setPromoError(null);
  };

  const handleCopyMerchant = () => {
    navigator.clipboard?.writeText('01621871225');
    setCopiedMerchant(true);
    setTimeout(() => setCopiedMerchant(false), 2000);
  };

  const handleAutoFillDemoTrx = () => {
    const randomTrx = 'TRX' + Math.floor(10000000 + Math.random() * 90000000);
    setMfsTrxId(randomTrx);
  };

  const handleAutoFillDemoCard = () => {
    setCardNumber('4532 8920 1827 9921');
    setCardHolder('DURJOY KAR');
    setCardExpiry('08/29');
    setCardCvv('721');
  };

  const handleAutoFillDemoPathao = () => {
    setPathaoMobile('01621871225');
    setPathaoPin('2489');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !fullAddress) {
      alert('Please fill in all required shipping fields');
      return;
    }

    // Map detailed payment method to general PaymentMethod type
    let mappedMethod: PaymentMethod = 'cod';
    if (selectedPayment === 'pathao') {
      mappedMethod = 'pathao';
    } else if (selectedPayment !== 'cod') {
      mappedMethod = 'digital';
    }

    // If digital and no TrxId, auto-generate for convenience
    if (
      (selectedPayment === 'bkash' ||
        selectedPayment === 'nagad' ||
        selectedPayment === 'rocket') &&
      !mfsTrxId
    ) {
      setMfsTrxId('TRX' + Math.floor(10000000 + Math.random() * 90000000));
    }

    const finalName = fullName?.trim() || verifiedCustomer?.name || 'Durjoy Kar';
    const finalPhone = phoneNumber?.trim() || verifiedCustomer?.phoneNumber || '01621871225';
    const finalAddress = fullAddress?.trim() || 'Road 27, Dhanmondi, Dhaka';

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onCompleteOrder({
        shipping: {
          fullName: finalName,
          phoneNumber: finalPhone,
          fullAddress: finalAddress,
          city: selectedArea.split('>')[0]?.trim() || 'Dhaka',
          zone: selectedArea.split('>')[1]?.trim() || 'Dhanmondi',
          area: selectedArea.split('>')[2]?.trim() || 'Road 27',
        },
        paymentMethod: mappedMethod,
        cart,
        subtotal,
        shippingFee,
        promoCode: appliedPromo?.code,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        total,
      });
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb (Matching Screenshot 3) */}
      <nav className="flex items-center text-xs sm:text-sm text-slate-500 gap-1.5">
        <button
          onClick={onBack}
          className="hover:text-blue-600 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
        </button>
        <span className="text-slate-400">›</span>
        <span className="text-slate-800 font-bold">
          {lang === 'bn' ? 'চেকআউট' : 'Checkout'}
        </span>
      </nav>

      {/* Main 2-Column Checkout Layout (Screenshot 3) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Shipping & Payment) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Shipping Information */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Truck className="w-5 h-5 text-blue-700" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {lang === 'bn' ? 'ডেলিভারি তথ্য (Shipping Info)' : 'Shipping Information'}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Customer Verification Badge / Action */}
              {verifiedCustomer ? (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {verifiedCustomer.photoURL ? (
                      <img
                        src={verifiedCustomer.photoURL}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-emerald-300 shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {verifiedCustomer.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-emerald-950 text-xs">
                          {verifiedCustomer.name}
                        </span>
                        <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded text-[9px] font-black uppercase">
                          VIP Verified
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 block">
                        ✓ ১-ক্লিক ক্যাশ অন ডেলিভারি ইনস্ট্যান্ট অ্যাপ্রুভাল সক্রিয়
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 capitalize">
                    {verifiedCustomer.provider}
                  </span>
                </div>
              ) : (
                onOpenVerify && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="font-extrabold text-slate-800 text-xs block">
                          কাস্টমার ভেরিফিকেশন (Google / Facebook / Email)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ভেরিফাই করলে ১-ক্লিকে তাৎক্ষণিক COD অর্ডার নিশ্চিত হবে
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenVerify}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                    >
                      ভেরিফাই করুন
                    </button>
                  </div>
                )
              )}

              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'আপনার নাম (Full Name)' : 'Full Name'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900 transition-all font-medium"
                />
              </div>

              {/* Phone Number with BD +88 Prefix (Screenshot 3) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'মোবাইল নম্বর (Phone Number)' : 'Phone Number'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 overflow-hidden bg-white">
                  <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-700 font-medium select-none shrink-0">
                    <span className="text-base">🇧🇩</span>
                    <span className="text-xs font-bold text-slate-700">BD +88</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="flex-1 px-3 py-2.5 text-slate-900 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Full Address (Textarea) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-700">
                    {lang === 'bn' ? 'সম্পূর্ণ ঠিকানা (Full Address)' : 'Full Address'}{' '}
                    <span className="text-red-500">*</span>
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
                  onChange={(e) => handleAddressOrAreaChange(e.target.value)}
                  placeholder="Street address, house no, road no..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900 transition-all font-medium resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                   ঠিকানা অথবা জেলা লিখলে স্বয়ংক্রিয়ভাবে ডেলিভারি এরিয়া সিলেক্ট হবে।
                </p>
              </div>

              {/* Delivery Area Setup with Auto Inside / Outside Dhaka Detection */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                    {lang === 'bn' ? '📍 এরিয়া সেটআপ ও জেলা (Area & District Setup)' : 'Delivery Area Setup'}
                  </label>
                  <span className="text-[11px] font-semibold text-blue-600">
                     স্বয়ংক্রিয়ভাবে নির্ধারণ হবে
                  </span>
                </div>

                {/* Quick 1-Click Popular Area Selection Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {lang === 'bn' ? 'জনপ্রিয় এরিয়া নির্বাচন করুন:' : 'Quick Select Popular Areas:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: ' ঢাকা সিটি (ইন ঢাকা)', area: 'Dhaka > Dhanmondi > Road 27', isDhaka: true },
                      { label: ' মিরপুর (ঢাকা)', area: 'Dhaka > Mirpur > Mirpur-10', isDhaka: true },
                      { label: ' উত্তরা (ঢাকা)', area: 'Dhaka > Uttara > Sector 7', isDhaka: true },
                      { label: ' চট্টগ্রাম (আউট অফ ঢাকা)', area: 'Chittagong > Panchlaish > GEC Circle', isDhaka: false },
                      { label: ' সিলেট (আউট অফ ঢাকা)', area: 'Sylhet > Zindabazar > City Center', isDhaka: false },
                      { label: ' রাজশাহী (আউট অফ ঢাকা)', area: 'Rajshahi > Boalia > Shaheb Bazar', isDhaka: false },
                      { label: ' খুলনা (আউট অফ ঢাকা)', area: 'Khulna > Sonadanga > Bus Stand Area', isDhaka: false },
                      { label: ' ময়মনসিংহ (আউট অফ ঢাকা)', area: 'Mymensingh > Mymensingh Sadar > College Road', isDhaka: false },
                      { label: ' গাজীপুর (আউট অফ ঢাকা)', area: 'Gazipur > Joydebpur > Station Road', isDhaka: false },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectArea(chip.area)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                          selectedArea === chip.area
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : chip.isDhaka
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City, Zone & Area Dropdown with Search */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-slate-400 text-slate-800 text-left font-medium transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">{selectedArea}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  </button>

                  {showAreaDropdown && (
                    <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl py-1 divide-y divide-slate-100">
                      {/* Search box inside dropdown */}
                      <div className="p-2 sticky top-0 bg-white border-b border-slate-100 z-10">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                          <Search className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={areaSearch}
                            onChange={(e) => setAreaSearch(e.target.value)}
                            placeholder="জেলা বা এরিয়া খুঁজুন (যেমন: ঢাকা, ধানমন্ডি, চট্টগ্রাম)..."
                            className="w-full text-xs bg-transparent focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      {/* Filtered Area Options */}
                      <div className="py-1">
                        {/* City options */}
                        {CITY_OPTIONS.filter((opt) =>
                          opt.toLowerCase().includes(areaSearch.toLowerCase())
                        ).map((opt) => {
                          const isOptDhaka = isDhakaLocation(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectArea(opt)}
                              className={`w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 transition-colors flex items-center justify-between cursor-pointer ${
                                selectedArea === opt
                                  ? 'bg-blue-50 text-blue-700 font-bold'
                                  : 'text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                    isOptDhaka
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {isOptDhaka ? 'ঢাকা (৳৬০)' : 'বাইরে (৳১২০)'}
                                </span>
                                <span className="truncate">{opt}</span>
                              </div>
                              {selectedArea === opt && (
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}

                        {/* Also list all 64 districts if searching */}
                        {areaSearch.trim().length > 0 &&
                          BANGLADESH_DISTRICTS.filter(
                            (d) =>
                              d.nameEn.toLowerCase().includes(areaSearch.toLowerCase()) ||
                              d.nameBn.includes(areaSearch)
                          ).map((dist) => (
                            <button
                              key={dist.id}
                              type="button"
                              onClick={() =>
                                handleSelectArea(
                                  `${dist.nameEn} > ${dist.nameBn} Sadar > Main Town`
                                )
                              }
                              className="w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 transition-colors flex items-center justify-between text-slate-700 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                    dist.isDhaka
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {dist.isDhaka ? 'ঢাকা (৳৬০)' : 'বাইরে (৳১২০)'}
                                </span>
                                <span>
                                  {dist.nameEn} ({dist.nameBn}) - {dist.divisionBn} বিভাগ
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Area Selection (Inside Dhaka vs Outside Dhaka) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    {lang === 'bn' ? 'ডেলিভারি এরিয়া' : 'Delivery Area'} *
                  </label>
                  {autoDetectedBadge && (
                    <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                       স্বয়ংক্রিয়ভাবে সিলেক্টেড
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => {
                      setDeliveryArea('inside');
                      setAutoDetectedBadge('✓ ম্যানুয়াল সিলেক্ট: ঢাকার ভিতরে (৳৬০)');
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      deliveryArea === 'inside'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="checkout-area"
                        checked={deliveryArea === 'inside'}
                        onChange={() => {
                          setDeliveryArea('inside');
                          setAutoDetectedBadge('✓ ম্যানুয়াল সিলেক্ট: ঢাকার ভিতরে (৳৬০)');
                        }}
                        className="text-emerald-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {lang === 'bn' ? 'ঢাকার ভিতরে' : 'Inside Dhaka'}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          {deliveryArea === 'inside' ? '✓ এক্টিভ চার্জ' : 'হোম ডেলিভারি'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-700">৳ 60</span>
                  </label>

                  <label
                    onClick={() => {
                      setDeliveryArea('outside');
                      setAutoDetectedBadge('✓ ম্যানুয়াল সিলেক্ট: ঢাকার বাইরে (৳১২০)');
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      deliveryArea === 'outside'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="checkout-area"
                        checked={deliveryArea === 'outside'}
                        onChange={() => {
                          setDeliveryArea('outside');
                          setAutoDetectedBadge('✓ ম্যানুয়াল সিলেক্ট: ঢাকার বাইরে (৳১২০)');
                        }}
                        className="text-blue-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {lang === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka'}
                        </span>
                        <span className="text-[10px] text-blue-700 font-semibold block">
                          {deliveryArea === 'outside' ? '✓ এক্টিভ চার্জ' : 'সারাদেশে ডেলিভারি'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-700">৳ 120</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Payment Method Selection (Fixes user issue) */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-blue-700" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'পেমেন্ট মেথড নির্বাচন করুন' : 'Payment Method'}
                </h2>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {lang === 'bn' ? 'নিরাপদ পেমেন্ট' : '100% Secure'}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'পছন্দের পেমেন্ট মাধ্যমটিতে ক্লিক করুন। সাথে সাথে পেমেন্টের বিস্তারিত অপশন ও নির্দেশিকা নিচে প্রদর্শিত হবে:'
                : 'Click any payment method below to instantly display its payment instructions, account details, and options:'}
            </p>

            {/* Top-Level Payment Method Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Cash On Delivery */}
              <button
                type="button"
                onClick={() => setSelectedPayment('cod')}
                className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  selectedPayment === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-200 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Banknote className="w-5 h-5" />
                  </span>
                  {selectedPayment === 'cod' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block">
                    Cash On Delivery
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block">
                    {lang === 'bn' ? 'পণ্য দেখে টাকা দিন' : 'Pay cash at doorstep'}
                  </span>
                </div>
              </button>

              {/* Option 2: bKash */}
              <button
                type="button"
                onClick={() => setSelectedPayment('bkash')}
                className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  selectedPayment === 'bkash'
                    ? 'border-pink-600 bg-pink-50/40 ring-2 ring-pink-200 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-pink-600 text-white font-black text-xs">
                    bKash
                  </span>
                  {selectedPayment === 'bkash' && (
                    <CheckCircle2 className="w-4 h-4 text-pink-600" />
                  )}
                </div>
                <div>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block">
                    bKash Payment
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block">
                    {lang === 'bn' ? 'মার্চেন্ট / সেন্ড মানি' : 'Instant MFS payment'}
                  </span>
                </div>
              </button>

              {/* Option 3: Nagad */}
              <button
                type="button"
                onClick={() => setSelectedPayment('nagad')}
                className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  selectedPayment === 'nagad'
                    ? 'border-orange-600 bg-orange-50/40 ring-2 ring-orange-200 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white font-black text-xs">
                    Nagad
                  </span>
                  {selectedPayment === 'nagad' && (
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block">
                    Nagad Payment
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block">
                    {lang === 'bn' ? 'নগদ ডিজিটাল পেমেন্ট' : 'Fast MFS transfer'}
                  </span>
                </div>
              </button>

              {/* Option 4: Rocket */}
              <button
                type="button"
                onClick={() => setSelectedPayment('rocket')}
                className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  selectedPayment === 'rocket'
                    ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-200 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-purple-700 text-white font-black text-xs">
                    Rocket
                  </span>
                  {selectedPayment === 'rocket' && (
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <div>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block">
                    Rocket Payment
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block">
                    DBBL Mobile Banking
                  </span>
                </div>
              </button>

              {/* Option 5: Cards (Visa/Mastercard) */}
              <button
                type="button"
                onClick={() => setSelectedPayment('card')}
                className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  selectedPayment === 'card'
                    ? 'border-blue-700 bg-blue-50/40 ring-2 ring-blue-200 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded-md bg-blue-900 text-white font-black text-[10px]">
                    VISA / MC
                  </span>
                  {selectedPayment === 'card' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  )}
                </div>
                <div>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block">
                    Credit / Debit Card
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block">
                    Visa, Master, AMEX
                  </span>
                </div>
              </button>

              {/* Option 6: Pathao Pay */}
              <button
                type="button"
                onClick={() => setSelectedPayment('pathao')}
                className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  selectedPayment === 'pathao'
                    ? 'border-red-600 bg-red-50/40 ring-2 ring-red-200 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px]">
                    Pathao Pay
                  </span>
                  {selectedPayment === 'pathao' && (
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block">
                    Pathao Pay
                  </span>
                  <span className="text-[10px] text-red-600 font-bold leading-tight block">
                    ৳ 50 Cashback
                  </span>
                </div>
              </button>
            </div>

            {/* DYNAMIC EXPANDED PAYMENT INSTRUCTIONS & OPTIONS PANEL (Instant Display upon select) */}
            <div className="mt-4 pt-2">
              {/* 1. Cash on Delivery Panel */}
              {selectedPayment === 'cod' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 text-sm">
                        {lang === 'bn'
                          ? 'ক্যাশ অন ডেলিভারি (Cash On Delivery) নির্বাচিত হয়েছে'
                          : 'Cash On Delivery Selected'}
                      </h4>
                      <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                        {lang === 'bn'
                          ? 'ডেলিভারি ম্যান আপনার দরজায় পার্সেল পৌঁছানোর পর পণ্যটি চেক করে ক্যাশ টাকা পরিশোধ করুন।'
                          : 'Pay cash directly to the delivery person once the package arrives at your doorstep.'}
                      </p>
                    </div>
                  </div>

                  {/* Change preference */}
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1.5">
                      {lang === 'bn' ? 'খুচরা টাকার প্রয়োজন:' : 'Change Preference:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'exact', label: 'সঠিক টাকা (Exact)' },
                        { id: '1000', label: '১০০০ টাকার ভাংতি' },
                        { id: '500', label: '৫০০ টাকার ভাংতি' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCodChangePref(opt.id)}
                          className={`py-2 px-2 rounded-xl border text-center font-bold text-[11px] transition-colors cursor-pointer ${
                            codChangePref === opt.id
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-emerald-900 mb-1">
                      {lang === 'bn'
                        ? 'ডেলিভারি নির্দেশিকা (ঐচ্ছিক):'
                        : 'Special Delivery Note (Optional):'}
                    </label>
                    <input
                      type="text"
                      value={codDeliveryNote}
                      onChange={(e) => setCodDeliveryNote(e.target.value)}
                      placeholder="e.g. Call before coming, leave at reception..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-slate-800 text-xs font-medium"
                    />
                  </div>
                </motion.div>
              )}

              {/* 2. bKash / Nagad / Rocket Panel */}
              {(selectedPayment === 'bkash' ||
                selectedPayment === 'nagad' ||
                selectedPayment === 'rocket') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 sm:p-5 rounded-2xl border space-y-4 text-xs ${
                    selectedPayment === 'bkash'
                      ? 'bg-pink-50/60 border-pink-200'
                      : selectedPayment === 'nagad'
                      ? 'bg-orange-50/60 border-orange-200'
                      : 'bg-purple-50/60 border-purple-200'
                  }`}
                >
                  {/* Brand Header & Merchant Number */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                          selectedPayment === 'bkash'
                            ? 'bg-pink-600'
                            : selectedPayment === 'nagad'
                            ? 'bg-orange-600'
                            : 'bg-purple-700'
                        }`}
                      >
                        {selectedPayment.toUpperCase().substring(0, 1)}
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Official {selectedPayment.toUpperCase()} Merchant Number:
                        </span>
                        <span className="font-mono font-black text-base text-slate-900 tracking-wider">
                          01621871225
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyMerchant}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        copiedMerchant
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {copiedMerchant ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>কপি হয়েছে (Copied)</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>নম্বর কপি করুন (Copy)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step by Step Instructions */}
                  <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900">
                      {lang === 'bn'
                        ? 'পেমেন্ট সম্পন্ন করার সহজ ধাপ:'
                        : 'How to pay in 3 easy steps:'}
                    </p>
                    <p>
                      ১. আপনার <strong>{selectedPayment.toUpperCase()}</strong> অ্যাপে যান বা ডায়াল করুন এবং{' '}
                      <strong>Make Payment / পেমেন্ট</strong> নির্বাচন করুন।
                    </p>
                    <p>
                      ২. মার্চেন্ট নম্বর দিন: <strong>01621871225</strong> এবং টাকার পরিমাণ দিন: <strong>৳ {total}</strong>।
                    </p>
                    <p>
                      ৩. পেমেন্ট শেষে আপনার মোবাইল নম্বর ও ট্রানজেকশন আইডি (TrxID) নিচে লিখে নিশ্চিত করুন।
                    </p>
                  </div>

                  {/* Inputs for MFS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        আপনার {selectedPayment.toUpperCase()} নম্বর (Your Account Number): *
                      </label>
                      <input
                        type="tel"
                        required
                        value={mfsNumber}
                        onChange={(e) => setMfsNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">
                          ট্রানজেকশন আইডি (TrxID): *
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoFillDemoTrx}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>অটো-ফিল ডেমো TrxID</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={mfsTrxId}
                        onChange={(e) => setMfsTrxId(e.target.value)}
                        placeholder="e.g. BKT9812A45"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold uppercase tracking-wider"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. Card Payment Panel */}
              {selectedPayment === 'card' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                    <span className="font-bold text-blue-950 text-sm">
                      Credit / Debit Card Checkout (Visa, Mastercard, AMEX)
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoFillDemoCard}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Fill Demo Card</span>
                    </button>
                  </div>

                  {/* Virtual Card Graphic */}
                  <div className="max-w-xs mx-auto p-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 text-white shadow-xl space-y-4 border border-blue-400/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-widest uppercase font-bold text-blue-200">
                        DUARI SECURE CARD
                      </span>
                      <span className="font-black text-xs text-amber-400">VISA / MC</span>
                    </div>

                    <div className="font-mono text-base tracking-widest py-1 font-bold text-slate-100">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end text-[10px]">
                      <div>
                        <span className="block text-slate-400 text-[8px] uppercase">
                          Cardholder
                        </span>
                        <span className="font-bold text-slate-200 tracking-wider">
                          {cardHolder || 'CUSTOMER NAME'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-slate-400 text-[8px] uppercase">
                          Expires
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {cardExpiry || 'MM/YY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Card Number:
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, '')
                            .replace(/(\d{4})/g, '$1 ')
                            .trim();
                          setCardNumber(val);
                        }}
                        placeholder="4123 4567 8901 2345"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block font-bold text-slate-700 mb-1">
                          Name on Card:
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          placeholder="NAME ON CARD"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white uppercase font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Expiry:
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          CVV:
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-center tracking-widest"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 4. Pathao Pay Panel */}
              {selectedPayment === 'pathao' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-red-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                        P
                      </div>
                      <span className="font-bold text-red-950 text-sm">
                        Pathao Pay Express Wallet
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillDemoPathao}
                      className="text-xs font-bold text-red-700 hover:text-red-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Fill Demo PIN</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-red-800">
                    Pay with Pathao balance or linked card and enjoy an instant <strong>৳ 50 Cashback</strong> credited back to your wallet!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Pathao Registered Mobile:
                      </label>
                      <input
                        type="tel"
                        value={pathaoMobile}
                        onChange={(e) => setPathaoMobile(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Pathao Security PIN:
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={pathaoPin}
                        onChange={(e) => setPathaoPin(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-center tracking-widest text-base"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (Screenshot 3) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Package className="w-5 h-5 text-blue-700" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {lang === 'bn' ? 'অর্ডার সামারি (Order Summary)' : 'Order Summary'}
              </h2>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                >
                  <div className="relative w-14 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                      {item.product.title}
                    </h4>
                    <span className="text-xs font-black text-slate-900 mt-1 block">
                      ৳ {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input & Voucher Application Box */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  <span>{lang === 'bn' ? 'প্রোমো কোড / ডিসকাউন্ট কুপন' : 'Promo Code / Coupon'}</span>
                </label>
              </div>

              {appliedPromo ? (
                /* Applied Promo Badge with Green Ticket style */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50 border border-emerald-300 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-black text-xs text-emerald-900 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300">
                          {appliedPromo.code}
                        </span>
                        <span className="text-xs font-black text-emerald-700">
                          ৳ {discountAmount.toLocaleString()} ছাড়
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 block truncate mt-0.5 font-medium">
                        {appliedPromo.discountType === 'percentage'
                          ? `${appliedPromo.discountValue}% ডিসকাউন্ট সফলভাবে যুক্ত হয়েছে`
                          : `৳${appliedPromo.discountValue} ফ্ল্যাট ছাড় সক্রিয়`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    title="Remove coupon"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                /* Promo Code Input Form (Manual Entry Only) */
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
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
                        placeholder={lang === 'bn' ? 'প্রোমো কোড লিখুন' : 'Enter promo code'}
                        className="w-full pl-3 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 uppercase tracking-wider focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
                    >
                      {lang === 'bn' ? 'প্রয়োগ করুন' : 'Apply'}
                    </button>
                  </div>

                  {/* Feedback Messages */}
                  {promoError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{promoError}</span>
                    </motion.div>
                  )}
                  {promoSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{promoSuccess}</span>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Calculations Breakdown (Screenshot 3) */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  {lang === 'bn' ? 'সাবটোটাল' : 'Subtotal'} ({totalItemCount}{' '}
                  {totalItemCount === 1 ? 'item' : 'items'})
                </span>
                <span className="font-bold text-slate-800">
                  ৳ {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  {lang === 'bn' ? 'ডেলিভারি ফি' : 'Shipping'}
                </span>
                <span className="font-bold text-slate-800">
                  ৳ {shippingFee}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/90 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {lang === 'bn' ? 'প্রোমো ডিসকাউন্ট' : 'Promo Discount'} ({appliedPromo?.code})
                    </span>
                  </span>
                  <span className="font-black text-emerald-800">
                    - ৳ {discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>{lang === 'bn' ? 'মোট দেয়' : 'Total'}</span>
                <span className="text-lg sm:text-xl text-blue-900 flex items-baseline">
                  <span className="text-sm mr-1 font-bold">৳</span>
                  {total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Animated Complete Order Button (Screenshot 3: [✓ Complete Order ৳ 4,660]) */}
            <div className="pt-2">
              <AnimatedButton
                type="submit"
                variant="buyNow"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                pulse
                leftIcon={<CheckCircle2 className="w-5 h-5 text-white" />}
                className="!bg-[#0f2e6e] hover:!bg-[#153a8a] text-white py-3.5 text-base font-extrabold shadow-lg shadow-blue-950/20"
              >
                <span>{lang === 'bn' ? 'অর্ডার সম্পূর্ণ করুন' : 'Complete Order'}</span>
                <span className="ml-2 font-mono font-black">
                  ৳ {total.toLocaleString()}
                </span>
              </AnimatedButton>
            </div>

            {/* Security Guarantee Note (Screenshot 3) */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {lang === 'bn'
                  ? 'ডিজিটাল পেমেন্ট শতভাগ নিরাপদ ও এনক্রিপ্টেড'
                  : 'Digital payments are secured with encryption'}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
