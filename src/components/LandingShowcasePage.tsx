import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Clock,
  Eye,
  Play,
  CheckCircle2,
  Copy,
  Check,
  Star,
  ShieldCheck,
  Truck,
  Filter,
  Search,
} from 'lucide-react';
import { Product, LandingPageConfig, StoreSettings } from '../types';
import { AnimatedButton } from './AnimatedButton';
import { getLandingPageScheduleStatus } from '../utils/scheduleUtils';

interface LandingShowcasePageProps {
  products: Product[];
  landingPages: LandingPageConfig[];
  settings: StoreSettings;
  onSelectCampaign: (productId: string, campaignId: string) => void;
  onDirectOrder: (product: Product) => void;
  onBackToStore: () => void;
  onOpenCustomerCare: (tab: 'delivery' | 'cod' | 'returns' | 'about' | 'contact') => void;
  lang?: 'en' | 'bn';
}

// Robust helper to guarantee a valid display product for every campaign
const resolveProductForCampaign = (camp: LandingPageConfig, allProducts: Product[]): Product => {
  const directMatch = allProducts.find((p) => p.id === camp.productId);
  if (directMatch) return directMatch;

  const titleMatch = allProducts.find(
    (p) =>
      p.title.toLowerCase().includes(camp.title.toLowerCase()) ||
      (camp.headline && p.title.toLowerCase().includes(camp.headline.toLowerCase()))
  );
  if (titleMatch) return titleMatch;

  if (allProducts.length > 0) {
    return {
      ...allProducts[0],
      id: camp.productId || allProducts[0].id,
      title: camp.title || camp.headline || allProducts[0].title,
      banglaTitle: camp.banglaHeadline || camp.headline || allProducts[0].banglaTitle,
      price: camp.offerPrice || allProducts[0].price,
      originalPrice: camp.regularPrice || allProducts[0].originalPrice,
    };
  }

  return {
    id: camp.productId || camp.id,
    title: camp.title || camp.headline || 'Promotional Campaign Product',
    banglaTitle: camp.banglaHeadline || camp.headline || 'স্পেশাল প্রমোশনাল প্রোডাক্ট',
    category: 'Special Campaign',
    sku: camp.id,
    price: camp.offerPrice || 990,
    originalPrice: camp.regularPrice || 1490,
    discountPercent:
      camp.regularPrice > camp.offerPrice
        ? Math.round(((camp.regularPrice - camp.offerPrice) / camp.regularPrice) * 100)
        : 25,
    rating: camp.rating || 5.0,
    reviewsCount: camp.reviewsCount || 120,
    inStock: true,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    ],
    videoUrl: camp.videoUrl || '',
    description: camp.subheadline || camp.headline || '',
    features:
      camp.features && camp.features.length > 0
        ? camp.features
        : ['১০০% অরিজিনাল অথেনটিক প্রোডাক্ট', 'সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি'],
    specifications: { Category: 'Special Campaign', SKU: camp.id },
    weight: 0.5,
    dimensions: { l: '10', w: '10', h: '5' },
    stockAlert: 10,
  };
};

export const LandingShowcasePage: React.FC<LandingShowcasePageProps> = ({
  products,
  landingPages,
  settings,
  onSelectCampaign,
  onDirectOrder,
  onBackToStore,
  onOpenCustomerCare,
  lang = 'bn',
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active landing pages (treat undefined active as active)
  const activeCampaigns = landingPages.filter((c) => c.active !== false);

  // Filtered campaigns
  const filtered = activeCampaigns.filter((camp) => {
    const prod = resolveProductForCampaign(camp, products);
    const matchesCat =
      selectedCategory === 'All' || (prod && prod.category === selectedCategory);
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      camp.title.toLowerCase().includes(q) ||
      camp.headline.toLowerCase().includes(q) ||
      (camp.banglaHeadline && camp.banglaHeadline.toLowerCase().includes(q)) ||
      (prod && prod.title.toLowerCase().includes(q)) ||
      (prod && prod.banglaTitle && prod.banglaTitle.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleCopy = (camp: LandingPageConfig) => {
    const targetProd = resolveProductForCampaign(camp, products);
    const prodId = camp.productId || targetProd.id;
    const url = `${window.location.origin}/?landing=${prodId}&camp=${camp.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(camp.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans pb-20">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'মূল দোকানে ফিরুন' : 'Back to Store'}</span>
            </button>

            <span className="hidden sm:inline-block h-5 w-px bg-slate-200" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm tracking-tight">
                {settings.storeName || 'Duari Shop'} <span className="text-red-600">Promotions</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCustomerCare('delivery')}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>ডেলিভারি পলিসি</span>
            </button>

            <a
              href={`tel:${settings.hotline || '01621871225'}`}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>হটলাইন: {settings.hotline || '01621871225'}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Showcase Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            <span>স্পেশাল প্রমোশনাল ল্যান্ডিং অফারসমূহ</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            ডুয়ারি শপ মেগা সেলস ও ডেডিকেটেড ল্যান্ডিং প্রোডাক্টস
          </h1>

          <p className="text-xs sm:text-sm text-red-100 max-w-3xl leading-relaxed font-medium">
            প্রতিটি প্রোডাক্টের জন্য স্পেশাল ডিসকাউন্ট, ভিডিও ডেমো, আনবক্সিং এবং দ্রুত ১-ক্লিক ক্যাশ অন ডেলিভারি সুবিধা সংবলিত ডেডিকেটেড সেলস পেইজসমূহ এক জায়গায়।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-amber-200">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              সরাসরি পার্সেল খুলে চেক করে পেমেন্ট
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              ২৪ থেকে ৪৮ ঘণ্টায় সারা বাংলাদেশে হোম ডেলিভারি
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search & Stats Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
            <span className="px-3 py-1 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {activeCampaigns.length} টি সক্রিয় ল্যান্ডিং ক্যাম্পেইন
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ল্যান্ডিং ক্যাম্পেইন বা প্রোডাক্ট খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Campaign Products Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Flame className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-base">
              কোনো ল্যান্ডিং অফার খুঁজে পাওয়া যায়নি
            </h3>
            <p className="text-xs text-slate-500">
              অনুগ্রহ করে অন্য কিওয়ার্ড দিয়ে অনুসন্ধান করুন অথবা ফিল্টার পরিবর্তন করুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((camp) => {
              const product = products.find((p) => p.id === camp.productId);
              if (!product) return null;
              const discount =
                camp.regularPrice > camp.offerPrice
                  ? Math.round(
                      ((camp.regularPrice - camp.offerPrice) / camp.regularPrice) * 100
                    )
                  : 0;

              const schedStatus = getLandingPageScheduleStatus(camp, lang);

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all overflow-hidden flex flex-col group"
                >
                  {/* Image / Media Preview with Badges */}
                  <div className="aspect-16/10 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={camp.heroImage || product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-[11px] uppercase shadow-md flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                        <span>{camp.badge || '🔥 স্পেশাল অফার'}</span>
                      </span>

                      {discount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs">
                          {discount}% ছাড়
                        </span>
                      )}
                    </div>

                    {/* Schedule Timing Status Top-Right */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md ${
                        schedStatus.status === 'live'
                          ? 'bg-emerald-600/90 text-white'
                          : schedStatus.status === 'scheduled'
                          ? 'bg-blue-600/90 text-white'
                          : 'bg-slate-700/90 text-slate-200'
                      }`}>
                        {schedStatus.status === 'live' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                        )}
                        <Clock className="w-2.5 h-2.5" />
                        <span>{schedStatus.label}</span>
                      </span>

                      {schedStatus.timeRemainingText && (
                        <span className="px-2 py-0.5 rounded-md bg-black/60 text-amber-300 text-[9px] font-bold">
                          ⏳ {schedStatus.timeRemainingText}
                        </span>
                      )}
                    </div>

                    {camp.videoUrl && (
                      <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-bold text-[10px] flex items-center gap-1 border border-white/20">
                        <Play className="w-3 h-3 fill-white" />
                        <span>ভিডিও অন্তর্ভুক্ত</span>
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-blue-600 font-bold">
                        <span>{product.category}</span>
                        <span>•</span>
                        <div className="flex items-center text-amber-500 gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating || 5.0} ({product.reviewsCount || 120})</span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {camp.banglaHeadline || camp.headline}
                      </h3>

                      {camp.subheadline && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {camp.subheadline}
                        </p>
                      )}

                      {/* Feature Bullet Points */}
                      {camp.features && camp.features.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {camp.features.slice(0, 3).map((feat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-[11px] font-semibold text-slate-700"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing Box */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">
                            ৳ {camp.offerPrice.toLocaleString()}
                          </span>
                          {camp.regularPrice > camp.offerPrice && (
                            <span className="text-xs text-slate-400 line-through font-bold">
                              ৳ {camp.regularPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ক্যাশ অন ডেলিভারি
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* VIEW DEDICATED LANDING PAGE */}
                        <button
                          type="button"
                          onClick={() => onSelectCampaign(product.id, camp.id)}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ল্যান্ডিং পেইজ দেখুন</span>
                        </button>

                        {/* DIRECT 1-CLICK ORDER */}
                        <button
                          type="button"
                          onClick={() => onDirectOrder(product)}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>অর্ডার করুন</span>
                        </button>
                      </div>

                      {/* Copy Link helper */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          সীমিত স্টক অফার
                        </span>
                        <button
                          onClick={() => handleCopy(camp)}
                          className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === camp.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>লিঙ্ক কপি</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
