import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  Phone,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import { OrderRecord, OrderStatus } from '../../types';
import { AnimatedButton } from '../AnimatedButton';
import { downloadInvoicePdf } from '../../utils/generateInvoicePdf';
import { InvoiceModal } from '../InvoiceModal';

interface OrderManagementTabProps {
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderManagementTab: React.FC<OrderManagementTabProps> = ({
  orders,
  onUpdateOrderStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<any | null>(null);

  const filteredOrders = (orders || []).filter((o) => {
    if (!o) return false;
    const currentStatus = o.status || 'pending';
    const matchStatus = filterStatus === 'all' || currentStatus === filterStatus;
    const orderIdStr = String(o.orderId || o.id || '').toLowerCase();
    const customerStr = String(o.customer || '').toLowerCase();
    const phoneStr = String(o.phoneNumber || '');
    const searchLower = (search || '').toLowerCase().trim();
    const matchSearch =
      !searchLower ||
      orderIdStr.includes(searchLower) ||
      customerStr.includes(searchLower) ||
      phoneStr.includes(searchLower);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            অর্ডার ম্যানেজমেন্ট (Order Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming orders, update shipping progress, and generate PDF invoices.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
          <span>মোট অর্ডার:</span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {[
            { id: 'all', label: 'সব অর্ডার (All)' },
            { id: 'pending', label: 'পেন্ডিং (Pending)' },
            { id: 'processing', label: 'প্রসেসিং (Processing)' },
            { id: 'shipped', label: 'শিপড (Shipped)' },
            { id: 'delivered', label: 'ডেলিভারড (Delivered)' },
            { id: 'cancelled', label: 'বাতিল (Cancelled)' },
          ].map((tab) => {
            const isActive = filterStatus === tab.id;
            const count =
              tab.id === 'all'
                ? (orders || []).length
                : (orders || []).filter((o) => (o?.status || 'pending') === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="অর্ডার আইডি, গ্রাহকের নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">অর্ডার আইডি</th>
                <th className="py-3 px-4">গ্রাহক & ফোন</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">আইটেম</th>
                <th className="py-3 px-4">মোট টাকা</th>
                <th className="py-3 px-4">পেমেন্ট</th>
                <th className="py-3 px-4">স্ট্যাটাস পরিবর্তন</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                    No orders match your filter
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-700">
                      #{order.orderId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{order.customer}</span>
                      <span className="text-[11px] text-slate-400">{order.phoneNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {order.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {(order.items || []).reduce((acc, i) => acc + (i?.quantity || 1), 0)} items
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-slate-900 block">
                        ৳ {(order.total || 0).toLocaleString()}
                      </span>
                      {order.promoCode && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mt-0.5">
                          🏷️ {order.promoCode} (-৳{order.discountAmount || 0})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.paymentMethod === 'cod'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.paymentMethod === 'pathao'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {order.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : order.status === 'shipped'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : order.status === 'processing'
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : order.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                        }`}
                      >
                        <option value="pending">পেন্ডিং (Pending)</option>
                        <option value="processing">প্রসেসিং (Processing)</option>
                        <option value="shipped">শিপড (Shipped)</option>
                        <option value="delivered">ডেলিভারড (Delivered)</option>
                        <option value="cancelled">বাতিল (Cancelled)</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setViewingInvoiceOrder({
                              orderId: order.orderId,
                              shipping: {
                                fullName: order.customer,
                                phoneNumber: order.phoneNumber,
                                fullAddress: order.address,
                                city: order.city,
                                zone: 'Zone',
                                area: 'Area',
                              },
                              cart: order.items,
                              subtotal: order.subtotal,
                              shippingFee: order.shippingFee,
                              total: order.total,
                              paymentMethod: order.paymentMethod,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View / Print Tax Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            downloadInvoicePdf({
                              orderId: order.orderId,
                              shipping: {
                                fullName: order.customer,
                                phoneNumber: order.phoneNumber,
                                fullAddress: order.address,
                                city: order.city,
                                zone: 'Zone',
                                area: 'Area',
                              },
                              cart: order.items,
                              subtotal: order.subtotal,
                              shippingFee: order.shippingFee,
                              total: order.total,
                              paymentMethod: order.paymentMethod,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Download PDF Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Order #{selectedOrder.orderId}
                  </h3>
                  <span className="text-[11px] text-slate-400">{selectedOrder.date}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Info Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 text-sm">
                  {selectedOrder.customer}
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.phoneNumber}</span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedOrder.address}, {selectedOrder.city}
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="pt-1 text-amber-700 font-medium">
                    Note: {selectedOrder.notes}
                  </div>
                )}
              </div>

              {/* Ordered Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                        <img
                          src={it.product.image}
                          alt={it.product.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 line-clamp-1">
                          {it.product.title}
                        </span>
                        <span className="text-slate-400">Qty: {it.quantity}</span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">
                      ৳ {(it.product.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation */}
              <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>৳ {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charge:</span>
                  <span>৳ {selectedOrder.shippingFee}</span>
                </div>
                {selectedOrder.promoCode && (
                  <div className="flex justify-between text-purple-700 font-bold bg-purple-50 p-1.5 rounded-lg border border-purple-200">
                    <span>Promo Discount ({selectedOrder.promoCode}):</span>
                    <span>- ৳ {(selectedOrder.discountAmount || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Amount:</span>
                  <span className="text-blue-900">৳ {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadInvoicePdf({
                        orderId: selectedOrder.orderId,
                        shipping: {
                          fullName: selectedOrder.customer,
                          phoneNumber: selectedOrder.phoneNumber,
                          fullAddress: selectedOrder.address,
                          city: selectedOrder.city,
                          zone: 'Zone',
                          area: 'Area',
                        },
                        cart: selectedOrder.items,
                        subtotal: selectedOrder.subtotal,
                        shippingFee: selectedOrder.shippingFee,
                        promoCode: selectedOrder.promoCode,
                        discountAmount: selectedOrder.discountAmount,
                        total: selectedOrder.total,
                        paymentMethod: selectedOrder.paymentMethod,
                      })
                    }
                    leftIcon={<Download className="w-4 h-4" />}
                    className="font-bold text-xs"
                  >
                    Download Invoice PDF
                  </AnimatedButton>

                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setViewingInvoiceOrder({
                        orderId: selectedOrder.orderId,
                        shipping: {
                          fullName: selectedOrder.customer,
                          phoneNumber: selectedOrder.phoneNumber,
                          fullAddress: selectedOrder.address,
                          city: selectedOrder.city,
                          zone: 'Zone',
                          area: 'Area',
                        },
                        cart: selectedOrder.items,
                        subtotal: selectedOrder.subtotal,
                        shippingFee: selectedOrder.shippingFee,
                        promoCode: selectedOrder.promoCode,
                        discountAmount: selectedOrder.discountAmount,
                        total: selectedOrder.total,
                        paymentMethod: selectedOrder.paymentMethod,
                      });
                    }}
                    leftIcon={<FileText className="w-4 h-4" />}
                    className="font-bold text-xs"
                  >
                    View / Print Invoice
                  </AnimatedButton>
                </div>

                <AnimatedButton
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="font-bold text-xs"
                >
                  Close
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Tax Invoice Print & View Modal */}
      <InvoiceModal
        isOpen={!!viewingInvoiceOrder}
        onClose={() => setViewingInvoiceOrder(null)}
        orderData={viewingInvoiceOrder}
      />
    </div>
  );
};
