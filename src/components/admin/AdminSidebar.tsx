import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  FileText,
  BarChart3,
  Globe,
  Settings,
  Palette,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Store,
  ShieldCheck,
  ExternalLink,
  LayoutTemplate,
  Flame,
  Truck,
  CreditCard,
  LogOut,
  Lock,
  Tag,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'promo-codes'
  | 'sections'
  | 'landing'
  | 'ads-manager'
  | 'firebase'
  | 'business-info'
  | 'logo-banner'
  | 'about-us'
  | 'terms'
  | 'delivery-charges'
  | 'return-policy'
  | 'color-settings'
  | 'size-settings'
  | 'media'
  | 'connect-courier'
  | 'gateway-control'
  | 'personal-account'
  | 'bkash-pra'
  | 'merchant-account';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingOrdersCount: number;
  onExitAdmin: () => void;
  onLogout?: () => void;
  logoUrl?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingOrdersCount,
  onExitAdmin,
  onLogout,
  logoUrl,
}) => {
  const [isWebsiteSettingsOpen, setIsWebsiteSettingsOpen] = useState(true);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(true);
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(true);

  const isSettingsActive = [
    'business-info',
    'logo-banner',
    'about-us',
    'terms',
    'delivery-charges',
    'return-policy',
  ].includes(currentTab);

  const isThemeActive = ['color-settings', 'size-settings'].includes(currentTab);

  const isPaymentActive = [
    'gateway-control',
    'personal-account',
    'bkash-pra',
    'merchant-account',
  ].includes(currentTab);

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen sticky top-0 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-0.5 border border-blue-200 shadow-xs shrink-0">
            <img
              src={logoUrl || '/src/assets/images/duari_logo_1791125380292.jpg'}
              alt="Duari Shop"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight block">
              Duari <span className="text-blue-600">Admin</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Store Manager
            </span>
          </div>
        </div>

        <button
          onClick={onExitAdmin}
          title="Back to Storefront"
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Store className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links (Matching Screenshot Hierarchy) */}
      <nav className="p-3 space-y-1 flex-1 text-xs">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-blue-600" />
          <span>ড্যাশবোর্ড (Dashboard)</span>
        </button>

        {/* Order Management */}
        <button
          onClick={() => onSelectTab('orders')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'orders'
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>অর্ডার ম্যানেজমেন্ট (Orders)</span>
          </div>
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] shadow-xs">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Product Management */}
        <button
          onClick={() => onSelectTab('products')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'products'
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-blue-600" />
          <span>প্রোডাক্টস (Products)</span>
        </button>

        {/* Categories */}
        <button
          onClick={() => onSelectTab('categories')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'categories'
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>ক্যাটাগরি (Categories)</span>
        </button>

        {/* Promo Codes Tab (Matching Screenshot) */}
        <button
          onClick={() => onSelectTab('promo-codes')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'promo-codes'
              ? 'bg-purple-50 text-purple-700 font-bold shadow-xs border border-purple-200'
              : 'text-slate-600 hover:bg-purple-50/50 hover:text-purple-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-purple-600" />
            <span>প্রোমো কোড (Promo Codes)</span>
          </div>
          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700">
            Offers
          </span>
        </button>

        {/* Homepage Sections */}
        <button
          onClick={() => onSelectTab('sections')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'sections'
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutTemplate className="w-4 h-4 text-blue-600" />
            <span>হোমপেইজ সেকশন (Sections)</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
            নতুন
          </span>
        </button>

        {/* Media Library */}
        <button
          onClick={() => onSelectTab('media')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'media'
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>মিডিয়া লাইব্রেরি (Media Library)</span>
        </button>

        {/* Landing Page (From Screenshot) */}
        <button
          onClick={() => onSelectTab('landing')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'landing'
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>ল্যান্ডিং পেইজ</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Ads Manager: Pixel & Google Console (From Screenshot) */}
        <button
          onClick={() => onSelectTab('ads-manager')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'ads-manager'
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>অ্যাডস ম্যানেজার (Pixel & SEO)</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Firebase Console Tab */}
        <button
          onClick={() => onSelectTab('firebase')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'firebase'
              ? 'bg-orange-50 text-orange-700 font-bold shadow-xs border border-orange-200'
              : 'text-slate-600 hover:bg-orange-50/60 hover:text-orange-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
            <span>ফায়ারবেস কনসোল (Firebase)</span>
          </div>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
            Live
          </span>
        </button>

        {/* Section Divider (From Screenshot: ওয়েবসাইট সেটিংস) */}
        <div className="pt-3 pb-1 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            ওয়েবসাইট সেটিংস
          </span>
        </div>

        {/* Business Info Collapsible (From Screenshot) */}
        <div>
          <button
            onClick={() => setIsWebsiteSettingsOpen(!isWebsiteSettingsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              isSettingsActive
                ? 'text-blue-700 font-bold bg-blue-50/50'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 text-blue-600">
              <Globe className="w-4 h-4" />
              <span>বিজনেস ইনফরমেশন</span>
            </div>
            {isWebsiteSettingsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Submenu items matching screenshot */}
          <AnimatePresence>
            {isWebsiteSettingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pl-6 pr-1 py-1 space-y-0.5 overflow-hidden"
              >
                {[
                  { id: 'business-info', label: 'যোগাযোগের তথ্য' },
                  { id: 'logo-banner', label: 'লোগো এন্ড ব্যানার' },
                  { id: 'about-us', label: 'আমাদের সম্পর্কে' },
                  { id: 'terms', label: 'টার্মস এন্ড কন্ডিশন' },
                  { id: 'delivery-charges', label: 'ডেলিভারি চার্জ সেটিংস' },
                  { id: 'return-policy', label: 'অর্ডার এন্ড রিটার্ন পলিসি' },
                ].map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id as AdminTab)}
                      className={`w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-[11px] ${
                        isActive
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-slate-400">›</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Design & Theme Settings (From Screenshot) */}
        <div>
          <button
            onClick={() => setIsThemeSettingsOpen(!isThemeSettingsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              isThemeActive
                ? 'text-blue-700 font-bold bg-blue-50/50'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 text-indigo-600">
              <Palette className="w-4 h-4" />
              <span>ডিজাইন & থিম সেটিংস</span>
            </div>
            {isThemeSettingsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {isThemeSettingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pl-6 pr-1 py-1 space-y-0.5 overflow-hidden"
              >
                {[
                  { id: 'color-settings', label: 'কালার সেটিংস' },
                  { id: 'size-settings', label: 'সাইজ সেটিংস' },
                ].map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id as AdminTab)}
                      className={`w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-[11px] ${
                        isActive
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-slate-400">›</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* একাউন্ট সেটিং (Account Setting from Screenshot 1) */}
        <div className="pt-3 pb-1 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            একাউন্ট সেটিং
          </span>
        </div>

        {/* কানেক্ট কুরিয়ার (Connect Courier from Screenshot 1 & 2) */}
        <button
          onClick={() => onSelectTab('connect-courier')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            currentTab === 'connect-courier'
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-blue-600 hover:bg-blue-50/50'
          }`}
        >
          <Truck className="w-4 h-4 text-blue-600" />
          <span>কানেক্ট কুরিয়ার</span>
        </button>

        {/* পেমেন্ট গেটওয়ে (Payment Gateway from Screenshot 1, 3, 4, 5) */}
        <div>
          <button
            onClick={() => setIsPaymentGatewayOpen(!isPaymentGatewayOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              isPaymentActive
                ? 'text-blue-700 font-bold bg-blue-50/50'
                : 'text-blue-600 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>পেমেন্ট গেটওয়ে</span>
            </div>
            {isPaymentGatewayOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {isPaymentGatewayOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pl-6 pr-1 py-1 space-y-0.5 overflow-hidden"
              >
                {[
                  { id: 'gateway-control', label: 'গেটওয়ে কন্ট্রোল' },
                  { id: 'personal-account', label: 'পার্সোনাল একাউন্ট' },
                  { id: 'bkash-pra', label: 'বিকাশ PRA একাউন্ট' },
                  { id: 'merchant-account', label: 'মার্চেন্ট একাউন্ট' },
                ].map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id as AdminTab)}
                      className={`w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-[11px] ${
                        isActive
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-slate-400">›</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Footer Return to Storefront CTA & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span className="font-semibold text-slate-700 truncate max-w-[140px]">
              durjoy422@gmail.com
            </span>
          </span>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
              title="Logout from Admin"
            >
              <LogOut className="w-3 h-3" />
              <span>লগআউট</span>
            </button>
          )}
        </div>

        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-bold text-xs transition-all shadow-xs cursor-pointer"
        >
          <Store className="w-4 h-4 text-blue-600" />
          <span>দোকান দেখুন (Storefront)</span>
          <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
        </button>
      </div>
    </aside>
  );
};
