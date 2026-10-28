import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Sliders,
  Eye,
  Download,
} from 'lucide-react';
import { OrderRecord, Product } from '../../types';
import { AnimatedButton } from '../AnimatedButton';
import { downloadInvoicePdf } from '../../utils/generateInvoicePdf';

interface DashboardTabProps {
  orders: OrderRecord[];
  products: Product[];
  onNavigateTab: (tab: any) => void;
  onOpenAddProduct: () => void;
  onUpdateOrderStatus: (orderId: string, status: any) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  orders,
  products,
  onNavigateTab,
  onOpenAddProduct,
  onUpdateOrderStatus,
}) => {
  const totalRevenue = orders.reduce(
    (acc, o) => (o.status !== 'cancelled' ? acc + o.total : acc),
    0
  );
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const inStockProducts = products.filter((p) => p.inStock);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            স্বাগতম, Duari Shop অ্যাডমিন প্যানেলে!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store performance overview, live orders, and quick product management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('orders')}
            leftIcon={<ShoppingBag className="w-4 h-4 text-blue-600" />}
            className="text-xs font-bold"
          >
            অর্ডার দেখুন
          </AnimatedButton>

          <AnimatedButton
            variant="primary"
            size="sm"
            onClick={onOpenAddProduct}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs font-bold"
          >
            নতুন প্রোডাক্ট যোগ করুন
          </AnimatedButton>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              মোট বিক্রি (Revenue)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="font-bold text-sm">৳</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ৳ {totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% this week</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              মোট অর্ডার (Orders)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {orders.length}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-blue-600 font-bold">
            <span>{deliveredOrders.length} delivered</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              পেন্ডিং অর্ডার (Pending)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {pendingOrders.length}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
            <span>Needs confirmation</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              মোট প্রোডাক্টস (Catalog)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {products.length}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 font-bold">
            <span>{inStockProducts.length} in-stock items</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              সাম্প্রতিক অর্ডারসমূহ (Recent Orders)
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            সব দেখুন ›
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">অর্ডার আইডি</th>
                <th className="py-3 px-4">গ্রাহক & ফোন</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">মোট টাকা</th>
                <th className="py-3 px-4">পেমেন্ট</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">ইনভয়েস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => (
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
                  <td className="py-3 px-4 font-black text-slate-900">
                    ৳ {order.total.toLocaleString()}
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
                      onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
