import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
} from 'lucide-react';
import { CartItem, ShippingInfo } from '../types';
import { AnimatedButton } from './AnimatedButton';
import { downloadInvoicePdf } from '../utils/generateInvoicePdf';

export interface InvoiceModalProps {
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
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  orderData,
}) => {
  if (!isOpen || !orderData) return null;

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadInvoicePdf(orderData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Top Bar with Actions */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">
                Duari Shop Official Tax Invoice
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold">
                #{orderData.orderId}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-200 hover:text-white"
                title="Print this invoice"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-white shadow-xs"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Download</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div className="p-6 sm:p-8 space-y-6 text-slate-800 text-xs sm:text-sm print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200 p-1 shadow-sm flex items-center justify-center">
                  <img
                    src="/src/assets/images/duari_logo_1791125380292.jpg"
                    alt="Duari Shop"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    DUARI <span className="text-blue-600">SHOP</span>
                  </h1>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Doorstep Delivery Across Bangladesh
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Hotline: 01621871225 | support@duarishop.com
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs uppercase border border-blue-200">
                  Tax Invoice
                </span>
                <p className="font-mono font-bold text-slate-800 text-xs">
                  Invoice #: {orderData.orderId}
                </p>
                <p className="text-[11px] text-slate-500">Date: {today}</p>
              </div>
            </div>

            {/* Customer & Order Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Delivered To (Customer):
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {orderData.shipping.fullName}
                </p>
                <p className="text-slate-600 font-medium">
                  {orderData.shipping.phoneNumber}
                </p>
                <p className="text-slate-600 text-xs">
                  {orderData.shipping.fullAddress}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {orderData.shipping.area}, {orderData.shipping.zone},{' '}
                  {orderData.shipping.city}
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Order Details:
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-bold uppercase text-slate-800">
                    {orderData.paymentMethod === 'cod'
                      ? 'Cash On Delivery'
                      : orderData.paymentMethod === 'pathao'
                      ? 'Pathao Pay'
                      : 'Digital Online Payment'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600">
                    Confirmed & Dispatched
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-bold text-blue-700">24-48 Hours</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Delivery Partner:</span>
                  <span className="font-medium text-slate-700">
                    Duari Express Doorstep
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">SL</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orderData.cart.map((item, idx) => (
                    <tr key={item.product.id}>
                      <td className="py-2.5 px-3 text-slate-400 font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-xs truncate">
                        {item.product.title}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                        ৳ {item.product.price.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        ৳ {(item.product.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Doorstep Inspection:</strong> Check before paying cash.
                  7 days replacement warranty.
                </span>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800">
                    ৳ {orderData.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee:</span>
                  <span className="font-bold text-slate-800">
                    ৳ {orderData.shippingFee}
                  </span>
                </div>
                {orderData.discountAmount && orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Promo Discount ({orderData.promoCode || 'Coupon'}):</span>
                    <span>- ৳ {orderData.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Payable:</span>
                  <span className="text-blue-900">
                    ৳ {orderData.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-100">
              <p>
                Thank you for choosing Duari Shop! For support, call{' '}
                <strong>01621871225</strong> or email{' '}
                <strong>support@duarishop.com</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
