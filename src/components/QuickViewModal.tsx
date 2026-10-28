import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingCart,
  Zap,
  Star,
  Check,
  Truck,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Product } from '../types';
import { AnimatedButton } from './AnimatedButton';
import { ProductDescriptionView } from './ProductDescriptionView';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onViewDetails: (product: Product) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  lang: 'en' | 'bn';
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onViewDetails,
  onBuyNow,
  lang,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Image */}
          <div className="relative aspect-square md:aspect-auto h-full bg-slate-900 flex items-center justify-center p-6">
            <img
              src={product.image}
              alt={product.title}
              className="max-h-72 object-contain"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-black shadow-xs">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Right: Product Details & Animated Actions */}
          <div className="p-6 sm:p-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {product.category}
              </span>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {product.title}
              </h3>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800 ml-1">{product.rating}</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{product.reviewsCount} reviews</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine
                </span>
              </div>

              {/* Price section */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  ৳ {product.price.toLocaleString()}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  ৳ {product.originalPrice.toLocaleString()}
                </span>
              </div>

              <div className="py-1">
                <ProductDescriptionView
                  content={product.description}
                  lang={lang}
                  mode="compact"
                  maxCompactLines={3}
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Animated Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <AnimatedButton
                  variant="outline"
                  size="md"
                  onClick={handleAdd}
                  leftIcon={
                    justAdded ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                    )
                  }
                  className="font-bold text-xs"
                >
                  {justAdded ? 'Added' : 'Add to Cart'}
                </AnimatedButton>

                <AnimatedButton
                  variant="buyNow"
                  size="md"
                  onClick={() => {
                    onClose();
                    onBuyNow(product, quantity);
                  }}
                  pulse
                  leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
                  className="font-bold text-xs"
                >
                  Buy Now
                </AnimatedButton>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onViewDetails(product);
                }}
                className="w-full text-center text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center justify-center gap-1 py-1 transition-colors cursor-pointer"
              >
                <span>View Full Product Specifications</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
