import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { CartItem } from '../types';
import { AnimatedButton } from './AnimatedButton';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  lang: 'en' | 'bn';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  lang,
}) => {
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {lang === 'bn' ? 'আপনার শপিং কার্ট' : 'Your Shopping Cart'}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {totalCount} {totalCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">
                      {lang === 'bn' ? 'আপনার কার্ট খালি!' : 'Your cart is empty'}
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      {lang === 'bn'
                        ? 'আমাদের জনপ্রিয় গ্যাজেট এবং পণ্যগুলো ঘুরে দেখুন।'
                        : 'Explore our latest gadgets and electronics with doorstep delivery.'}
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/90 bg-white hover:border-blue-200 transition-all shadow-xs"
                    >
                      <div className="w-16 h-16 rounded-lg bg-slate-900 shrink-0 overflow-hidden border border-slate-200">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {item.product.title}
                        </h4>
                        <div className="text-xs font-black text-blue-700 mt-0.5">
                          ৳ {item.product.price.toLocaleString()}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                            <button
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-auto"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">Subtotal</span>
                    <span className="text-lg font-black text-slate-900">
                      ৳ {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Eligible for 24-48h Doorstep Express Delivery</span>
                  </div>

                  <AnimatedButton
                    variant="buyNow"
                    size="lg"
                    fullWidth
                    onClick={() => {
                      onClose();
                      onCheckout();
                    }}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="font-bold text-sm sm:text-base"
                  >
                    {lang === 'bn' ? 'চেকআউটে যান' : 'Proceed to Checkout'}
                  </AnimatedButton>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
