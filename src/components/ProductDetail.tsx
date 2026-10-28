import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Zap,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Share2,
  Heart,
  FileText,
  Package,
  Layers,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ArrowDown,
} from 'lucide-react';
import { Product } from '../types';
import { AnimatedButton } from './AnimatedButton';
import { ProductDescriptionView } from './ProductDescriptionView';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onSelectRelated: (product: Product) => void;
  relatedProducts: Product[];
  lang: 'en' | 'bn';
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  onSelectRelated,
  relatedProducts,
  lang,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [infoTab, setInfoTab] = useState<'desc' | 'specs' | 'box' | 'delivery' | 'reviews'>('desc');
  const detailsHubRef = React.useRef<HTMLDivElement>(null);

  const scrollToDetails = () => {
    detailsHubRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Breadcrumb Navigation (Exact match with Screenshot 2) */}
      <nav className="flex items-center text-xs sm:text-sm text-slate-500 gap-1.5 flex-wrap">
        <button
          onClick={onBack}
          className="hover:text-blue-600 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <span className="text-slate-400">›</span>
        <span className="text-slate-800 font-medium truncate max-w-md sm:max-w-xl">
          {product.title}
        </span>
      </nav>

      {/* Main 2-Column Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-sm">
        {/* Left Column: Gallery (Matching Screenshot 2) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Main Big Image Container (Clean neutral background - never flashes black) */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-inner group">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                initial={{ opacity: 0.2, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.2 }}
                transition={{ duration: 0.25 }}
                src={images[selectedImageIndex]}
                alt={product.title}
                className="w-full h-full object-contain p-4 cursor-zoom-in"
                onClick={() => setIsZoomed(true)}
              />
            </AnimatePresence>

            {/* Zoom / Lightbox Trigger */}
            <button
              onClick={() => setIsZoomed(true)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              title="Expand image"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* Slider Arrow Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all group-hover:opacity-100 sm:opacity-75"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all group-hover:opacity-100 sm:opacity-75"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Row (Matching Screenshot 2) */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all p-1 bg-slate-50 ${
                    selectedImageIndex === idx
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} thumb ${idx}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Purchasing Controls (Matching Screenshot 2) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {product.title}
            </h1>

            {/* Ratings and Reviews */}
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800">{product.rating}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">
                {product.reviewsCount} customer reviews
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                In Stock & Ready to Ship
              </span>
            </div>

            {/* Price Section (Exact Screenshot 2 styling: strikethrough, bold price, discount tag) */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-sm text-slate-400 line-through font-medium">
                  ৳ {product.originalPrice.toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline">
                    <span className="text-xl font-bold text-blue-700 mr-1">৳</span>
                    {product.price.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    -{product.discountPercent}%
                  </span>
                </div>
              </div>

              {/* Quantity Selector (Exact [- 1 +] from Screenshot 2) */}
              <div className="ml-auto flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors font-bold text-base cursor-pointer"
                  disabled={quantity <= 1}
                >
                  -
                </motion.button>
                <span className="px-4 py-1.5 text-sm font-bold text-slate-800 min-w-8 text-center select-none">
                  {quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors font-bold text-base cursor-pointer"
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Animated Action Buttons (Screenshot 2: [Add to Cart] & [Buy Now]) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {/* Add to Cart button (White with blue border, cart icon) */}
              <AnimatedButton
                variant="outline"
                size="lg"
                onClick={handleAddToCart}
                leftIcon={
                  addedAnimation ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform" />
                  )
                }
                className="!border-blue-600 !text-blue-700 hover:!bg-blue-50 font-bold"
              >
                {addedAnimation ? (lang === 'bn' ? 'কার্টে যোগ হয়েছে!' : 'Added to Cart!') : (lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart')}
              </AnimatedButton>

              {/* Buy Now button (Deep navy/blue with lightning icon, pulse) */}
              <AnimatedButton
                variant="buyNow"
                size="lg"
                onClick={handleBuyNow}
                pulse
                leftIcon={<Zap className="w-5 h-5 text-amber-400 group-hover:scale-125 transition-transform" />}
                className="font-black text-white tracking-wide"
              >
                {lang === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}
              </AnimatedButton>
            </div>

            {/* Product Highlights Card */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'bn' ? 'মূল আকর্ষণ ও বৈশিষ্ট্যসমূহ' : 'Key Highlights'}</span>
                </h4>
                <button
                  type="button"
                  onClick={scrollToDetails}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <span>{lang === 'bn' ? 'বিস্তারিত দেখুন' : 'Full Details'}</span>
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              {product.banglaDescription && product.banglaDescription.length > 0 ? (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  {product.banglaDescription.slice(0, 4).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                  <ProductDescriptionView
                    content={product.description}
                    lang={lang}
                    mode="compact"
                    maxCompactLines={3}
                  />
                </div>
              )}
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
              <div
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col items-center gap-1 select-none"
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-800">Doorstep Delivery</span>
                <span className="text-[10px] text-slate-500">24-48 Hours</span>
              </div>
              <div
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col items-center gap-1 select-none"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-800">100% Genuine</span>
                <span className="text-[10px] text-slate-500">Verified Quality</span>
              </div>
              <div
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col items-center gap-1 select-none"
              >
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px] font-bold text-slate-800">Easy Returns</span>
                <span className="text-[10px] text-slate-500">7 Days Warranty</span>
              </div>
            </div>

            {/* Share and Wishlist options */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'Link copied!' : 'Share with friends'}</span>
              </button>
              <div className="flex items-center gap-1 text-slate-400">
                <span>SKU: {product.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Professional Product Information Hub */}
      <div
        ref={detailsHubRef}
        id="product-details-hub"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden scroll-mt-24"
      >
        {/* Navigation Tabs Bar */}
        <div className="flex items-center overflow-x-auto border-b border-slate-200 bg-slate-50/70 p-1.5 sm:p-2 gap-1.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setInfoTab('desc')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
              infoTab === 'desc'
                ? 'bg-white text-[#5b32a3] shadow-xs border border-purple-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-4 h-4 text-[#5b32a3]" />
            <span>{lang === 'bn' ? 'পণ্য বিবরণ ও ফিচার' : 'Overview & Features'}</span>
          </button>

          <button
            type="button"
            onClick={() => setInfoTab('specs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
              infoTab === 'specs'
                ? 'bg-white text-[#5b32a3] shadow-xs border border-purple-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>{lang === 'bn' ? 'স্পেসিফিকেশন' : 'Specifications'}</span>
          </button>

          <button
            type="button"
            onClick={() => setInfoTab('box')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
              infoTab === 'box'
                ? 'bg-white text-[#5b32a3] shadow-xs border border-purple-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            <span>{lang === 'bn' ? 'বক্সে যা থাকবে' : 'In The Box'}</span>
          </button>

          <button
            type="button"
            onClick={() => setInfoTab('delivery')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
              infoTab === 'delivery'
                ? 'bg-white text-[#5b32a3] shadow-xs border border-purple-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'bn' ? 'ডেলিভারি ও রিটার্ন' : 'Delivery & Returns'}</span>
          </button>

          <button
            type="button"
            onClick={() => setInfoTab('reviews')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
              infoTab === 'reviews'
                ? 'bg-white text-[#5b32a3] shadow-xs border border-purple-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{lang === 'bn' ? 'রিভিউ ও রেটিং' : 'Reviews'}</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
              {product.reviewsCount || 1}
            </span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: Rich Description & Features */}
          {infoTab === 'desc' && (
            <div className="space-y-6">
              <ProductDescriptionView
                content={product.description}
                lang={lang}
                mode="full"
              />

              {/* Highlight Guarantee Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/80">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#5b32a3] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">১০০% আসল পণ্য</h5>
                    <p className="text-[11px] text-slate-500">অফিশিয়াল কোয়ালিটি নিশ্চিত</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100/80">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">দ্রুততম ডেলিভারি</h5>
                    <p className="text-[11px] text-slate-500">২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">৭ দিন রিপ্লেসমেন্ট</h5>
                    <p className="text-[11px] text-slate-500">সহজ ও দ্রুত রিটার্ন পলিসি</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Specifications */}
          {infoTab === 'specs' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {lang === 'bn' ? 'বিস্তারিত টেকনিক্যাল স্পেসিফিকেশন' : 'Technical Specifications'}
                </h4>
                <span className="text-xs text-slate-400">SKU: {product.sku || product.id.slice(0, 8).toUpperCase()}</span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/70">
                    <span className="font-semibold text-slate-500">ক্যাটাগরি (Category)</span>
                    <span className="font-bold text-slate-800">{product.category}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white">
                    <span className="font-semibold text-slate-500">স্টক অবস্থা (Availability)</span>
                    <span className={`font-bold ${product.inStock ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {product.inStock ? 'ইন স্টক (In Stock)' : 'স্টক শেষ'}
                    </span>
                  </div>

                  {product.weight && (
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/70">
                      <span className="font-semibold text-slate-500">ওজন (Weight)</span>
                      <span className="font-bold text-slate-800">{product.weight} kg</span>
                    </div>
                  )}

                  {product.specifications &&
                    Object.entries(product.specifications).map(([key, val], idx) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-3.5 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                        }`}
                      >
                        <span className="font-semibold text-slate-500">{key}</span>
                        <span className="font-bold text-slate-800 text-right">{val}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: What's In The Box */}
          {infoTab === 'box' && (
            <div className="space-y-4">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                {lang === 'bn' ? 'প্যাকেজের ভেতর যা যা থাকবে:' : "What's Included in the Box:"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <Package className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{product.title}</h5>
                    <p className="text-[11px] text-slate-500">১টি মূল পণ্য (ইনট্যাক্ট)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">অফিশিয়াল ইনভয়েস ও মেমো</h5>
                    <p className="text-[11px] text-slate-500">ওয়ারেন্টি প্রুফ ও ক্রয় রশিদ</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">ডুয়ারি শপ প্রিমিয়াম বাবল র্যাপ</h5>
                    <p className="text-[11px] text-slate-500">নিরাপদ ট্রানজিট প্যাকেজিং</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Delivery & Returns */}
          {infoTab === 'delivery' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>ডেলিভারি সময়সীমা ও চার্জ</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    <li>• <strong>ঢাকা সিটির ভেতর:</strong> মাত্র ২৪ থেকে ৩৬ ঘণ্টার মধ্যে দ্রুত ডেলিভারি।</li>
                    <li>• <strong>ঢাকার বাইরে ও সারা বাংলাদেশ:</strong> ৪৮ থেকে ৭২ ঘণ্টার মধ্যে হোম ডেলিভারি।</li>
                    <li>• <strong>ক্যাশ অন ডেলিভারি (COD):</strong> পণ্য হাতে পেয়ে চেক করে টাকা দেওয়ার সুযোগ।</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    <span>রিটার্ন ও রিপ্লেসমেন্ট পলিসি</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    <li>• <strong>৭ দিনের গ্যারান্টি:</strong> পণ্যে কোনো ক্রটি বা ভিন্ন পণ্য আসলে ৭ দিনের মধ্যে ফ্রি রিপ্লেসমেন্ট।</li>
                    <li>• পণ্য আনবক্সিং এর সময় একটি ছোট ভিডিও বা ছবি রাখুন যা সহায়তায় দ্রুত সমাধান দেবে।</li>
                    <li>• ২৪/৭ কাস্টমার হেল্পলাইন: <strong>0162187...</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Customer Reviews */}
          {infoTab === 'reviews' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-amber-600">5.0</div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {product.reviewsCount || 1} জন সন্তুষ্ট ক্রেতার রেটিং
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  ✓ সকল রিভিউ আমাদের ভেরিফাইড ক্রেতাদের থেকে সংগ্রহ করা
                </div>
              </div>

              {/* Sample Verified Review */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                      ভ
                    </span>
                    <div>
                      <h6 className="text-xs font-bold text-slate-900">ভেরিফাইড কাস্টমার</h6>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> ভেরিফাইড ক্রয়
                      </span>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  যেমনটা ছবিতে দেখেছিলাম ঠিক তেমনই পেয়েছি। কোয়ালিটি অনেক ভালো এবং ডেলিভারিও খুব দ্রুত হয়েছে। ধন্যবাদ ডুয়ারি শপ!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Related Products You May Like
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((relProduct) => (
              <div
                key={relProduct.id}
                onClick={() => onSelectRelated(relProduct)}
                className="bg-white rounded-xl p-3 border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="aspect-square rounded-lg bg-slate-50 overflow-hidden mb-2">
                  <img
                    src={relProduct.image}
                    alt={relProduct.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {relProduct.title}
                </h4>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-sm font-black text-slate-900">
                    ৳ {relProduct.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
                    -{relProduct.discountPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={images[selectedImageIndex]}
              alt={product.title}
              className="max-w-4xl max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
