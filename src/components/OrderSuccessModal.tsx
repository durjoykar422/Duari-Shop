import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  ArrowRight,
  Download,
  Check,
  FileText,
  Printer,
  Sparkles,
} from 'lucide-react';
import { CartItem, ShippingInfo } from '../types';
import { AnimatedButton } from './AnimatedButton';
import { downloadInvoicePdf } from '../utils/generateInvoicePdf';
import { InvoiceModal } from './InvoiceModal';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    shipping: ShippingInfo;
    cart: CartItem[];
    subtotal: number;
    shippingFee: number;
    promoCode?: string;
    discountAmount?: number;
    total: number;
    paymentMethod: string;
  } | null;
  lang: 'en' | 'bn';
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderData,
  lang,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire confetti bursts!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
      } catch (e) {
        // Fallback gracefully if canvas is unavailable
      }
    }
  }, [isOpen]);

  if (!orderData) return null;

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      const success = downloadInvoicePdf(orderData);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      } else {
        setIsInvoiceModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setIsInvoiceModalOpen(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 z-10 space-y-6 text-center"
            >
              {/* Celebration Icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  Order #{orderData.orderId}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-2">
                  {lang === 'bn'
                    ? 'আপনার অর্ডার সফল হয়েছে!'
                    : 'Order Placed Successfully!'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  {lang === 'bn' ? (
                    <>
                      ধন্যবাদ,{' '}
                      <span className="font-bold text-slate-700">
                        {orderData.shipping.fullName}
                      </span>
                      । আপনার হোম ডেলিভারির জন্য পার্সেল রেডি করা হচ্ছে!
                    </>
                  ) : (
                    <>
                      Thank you,{' '}
                      <span className="font-bold text-slate-700">
                        {orderData.shipping.fullName}
                      </span>
                      . Your doorstep delivery is being prepared!
                    </>
                  )}
                </p>
              </div>

              {/* Tracking Status Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>
                      {lang === 'bn' ? 'আনুমানিক ডেলিভারি' : 'Estimated Delivery'}
                    </span>
                  </div>
                  <span className="text-blue-700 font-extrabold">
                    {lang === 'bn' ? '২৪ থেকে ৪৮ ঘণ্টায়' : 'Within 24-48 Hours'}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">
                      {lang === 'bn' ? 'ডেলিভারি ঠিকানা: ' : 'Delivery Address: '}
                    </span>
                    <span>
                      {orderData.shipping.fullAddress}, {orderData.shipping.area},{' '}
                      {orderData.shipping.city}
                    </span>
                  </div>
                </div>

                {orderData.discountAmount && orderData.discountAmount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-emerald-700 font-bold">
                    <span>
                      {lang === 'bn' ? 'প্রোমো ডিসকাউন্ট ছাড়:' : 'Promo Discount:'} ({orderData.promoCode || 'Code'})
                    </span>
                    <span>- ৳ {orderData.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold text-slate-800">
                  <span>
                    {lang === 'bn' ? 'পরিশোধের পরিমাণ:' : 'Total Amount to Pay:'}
                  </span>
                  <span className="text-base text-blue-900 font-black">
                    ৳ {orderData.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <AnimatedButton
                    variant="outline"
                    size="md"
                    onClick={handleDownloadPdf}
                    isLoading={isDownloading}
                    leftIcon={
                      downloadSuccess ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Download className="w-4 h-4 text-blue-700 group-hover:-translate-y-0.5 transition-transform" />
                      )
                    }
                    className="font-bold border-blue-600 text-blue-700 hover:bg-blue-50 text-xs"
                  >
                    {downloadSuccess
                      ? lang === 'bn'
                        ? 'ডাউনলোড সম্পন্ন!'
                        : 'Downloaded!'
                      : lang === 'bn'
                      ? 'পিডিএফ ইনভয়েস ডাউনলোড'
                      : 'Download Invoice PDF'}
                  </AnimatedButton>

                  <AnimatedButton
                    variant="secondary"
                    size="md"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    leftIcon={<Printer className="w-4 h-4 text-slate-700" />}
                    className="font-bold text-xs"
                  >
                    {lang === 'bn' ? 'ইনভয়েস দেখুন / প্রিন্ট' : 'View / Print Invoice'}
                  </AnimatedButton>
                </div>

                <AnimatedButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={onClose}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="font-bold text-xs !bg-[#0f2e6e] hover:!bg-[#153a8a]"
                >
                  {lang === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Tax Invoice Print & View Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        orderData={orderData}
      />
    </>
  );
};
