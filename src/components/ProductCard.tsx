import React from 'react';
import { motion } from 'motion/react';
import {
  ShoppingCart,
  Maximize2,
  Heart,
  Star,
  Check,
} from 'lucide-react';
import { Product } from '../types';
import { AnimatedButton } from './AnimatedButton';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onQuickView: (product: Product, e: React.MouseEvent) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string, e: React.MouseEvent) => void;
  lang: 'en' | 'bn';
  priceColor?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onQuickView,
  isWishlisted = false,
  onToggleWishlist,
  lang,
  priceColor,
}) => {
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, e);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Floating Quick Action Buttons on Top Right (Matching screenshot 1 blue icons) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {/* Quick Add / Wishlist Button (Dark blue square icon like screenshot) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              if (onToggleWishlist) {
                e.stopPropagation();
                onToggleWishlist(product.id, e);
              } else {
                handleAdd(e);
              }
            }}
            aria-label="Wishlist"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#102a6b] hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-colors"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </motion.button>

          {/* Quick View Expand Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product, e);
            }}
            aria-label="Quick View"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 flex items-center justify-center shadow-md border border-slate-200 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.button>
        </div>

        {/* Discount Badge on Top Left */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-blue-700 text-white shadow-xs tracking-tight">
              -{product.discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors"
            title={product.title}
          >
            {lang === 'bn' && product.banglaTitle ? product.banglaTitle : product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700">{product.rating}</span>
            <span className="text-slate-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Pricing Section (Matching screenshot 1: Strikethrough + Discount tag + Bold Current Price) */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400 line-through">
              ৳ {product.originalPrice.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-100">
              -{product.discountPercent}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div
              className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-baseline gap-0.5"
              style={priceColor ? { color: priceColor } : undefined}
            >
              <span
                className="text-sm font-bold text-blue-800"
                style={priceColor ? { color: priceColor } : undefined}
              >
                ৳
              </span>
              <span>{product.price.toLocaleString()}</span>
            </div>

            {/* Animated Add to Cart Button */}
            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={handleAdd}
              className="!px-2.5 !py-1.5 text-xs !font-bold border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
              leftIcon={
                justAdded ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ShoppingCart className="w-3.5 h-3.5" />
                )
              }
            >
              <span className="hidden sm:inline">
                {justAdded ? (lang === 'bn' ? 'যুক্ত' : 'Added') : (lang === 'bn' ? 'কিনুন' : 'Add')}
              </span>
            </AnimatedButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
