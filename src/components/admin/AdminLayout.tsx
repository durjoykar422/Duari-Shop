import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Search,
  Store,
  ExternalLink,
  ShieldCheck,
  User,
  LogOut,
  Sliders,
  Flame,
} from 'lucide-react';
import { AdminTab, AdminSidebar } from './AdminSidebar';
import { DashboardTab } from './DashboardTab';
import { ProductManagementTab } from './ProductManagementTab';
import { OrderManagementTab } from './OrderManagementTab';
import { CategoryManagementTab } from './CategoryManagementTab';
import { SectionManagementTab } from './SectionManagementTab';
import { SliderBannerTab } from './SliderBannerTab';
import { AdsManagerTab } from './AdsManagerTab';
import { SettingsTab } from './SettingsTab';
import { MediaTab } from './MediaTab';
import { LandingPageBuilderTab } from './LandingPageBuilderTab';
import { ConnectCourierTab } from './ConnectCourierTab';
import { GatewayControlTab } from './GatewayControlTab';
import { PersonalAccountTab } from './PersonalAccountTab';
import { BkashPraTab } from './BkashPraTab';
import { MerchantAccountTab } from './MerchantAccountTab';
import { PromoCodeTab } from './PromoCodeTab';
import {
  OrderRecord,
  Product,
  BannerSlide,
  TrackingSettings,
  StoreSettings,
  OrderStatus,
  HomeSection,
  LandingPageConfig,
  PromoCode,
} from '../../types';
import { AnimatedButton } from '../AnimatedButton';

interface AdminLayoutProps {
  orders: OrderRecord[];
  products: Product[];
  categories: string[];
  banner?: BannerSlide;
  tracking: TrackingSettings;
  settings: StoreSettings;
  mediaList: any[];
  slides?: BannerSlide[];
  sections?: HomeSection[];
  landingPages?: LandingPageConfig[];
  promoCodes?: PromoCode[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddCategory: (cat: string) => void;
  onDeleteCategory: (cat: string) => void;
  onAddSection?: (section: HomeSection) => void;
  onUpdateSection?: (section: HomeSection) => void;
  onDeleteSection?: (sectionId: string) => void;
  onAddLandingPage?: (camp: LandingPageConfig) => void;
  onUpdateLandingPage?: (camp: LandingPageConfig) => void;
  onDeleteLandingPage?: (id: string) => void;
  onAddPromoCode?: (promo: PromoCode) => void;
  onUpdatePromoCode?: (promo: PromoCode) => void;
  onDeletePromoCode?: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateBanner: (banner: BannerSlide) => void;
  onUpdateSlides?: (slides: BannerSlide[]) => void;
  onUpdateTracking: (tracking: TrackingSettings) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onAddMedia: (media: any) => void;
  onDeleteMedia: (id: string) => void;
  onViewLandingPage?: (productId: string, campaignId?: string) => void;
  onExitAdmin: () => void;
  onLogout?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  orders,
  products,
  categories,
  banner,
  tracking,
  settings,
  mediaList,
  slides,
  sections = [],
  landingPages = [],
  promoCodes = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onAddLandingPage,
  onUpdateLandingPage,
  onDeleteLandingPage,
  onAddPromoCode,
  onUpdatePromoCode,
  onDeletePromoCode,
  onUpdateOrderStatus,
  onUpdateBanner,
  onUpdateSlides,
  onUpdateTracking,
  onUpdateSettings,
  onAddMedia,
  onDeleteMedia,
  onViewLandingPage,
  onExitAdmin,
  onLogout,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-hidden">
      {/* Sidebar with Bengali navigation matching screenshot */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'products') setIsAddProductOpen(false);
        }}
        pendingOrdersCount={pendingCount}
        onExitAdmin={onExitAdmin}
        onLogout={onLogout}
        logoUrl={settings?.logo || settings?.bannerLogo?.url}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Admin Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm text-slate-800">
              Duari Shop Admin Dashboard
            </span>
            <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              Live Storefront Connected
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Storefront Button */}
            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={onExitAdmin}
              leftIcon={<Store className="w-4 h-4 text-blue-600" />}
              rightIcon={<ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
              className="text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              দোকান দেখুন (Storefront)
            </AnimatedButton>

            {/* Notification Bell */}
            <button
              onClick={() => setCurrentTab('orders')}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                D
              </div>
              <div className="hidden md:block text-left text-xs">
                <span className="font-bold text-slate-800 block leading-tight">
                  Durjoy Kar
                </span>
                <span className="text-[10px] text-slate-400">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardTab
                orders={orders}
                products={products}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenAddProduct={() => {
                  setCurrentTab('products');
                  setIsAddProductOpen(true);
                }}
                onUpdateOrderStatus={onUpdateOrderStatus}
              />
            )}

            {currentTab === 'products' && (
              <ProductManagementTab
                products={products}
                categories={categories}
                mediaList={mediaList}
                onAddProduct={onAddProduct}
                onUpdateProduct={onUpdateProduct}
                onDeleteProduct={onDeleteProduct}
                onAddMedia={onAddMedia}
                isAddModalOpenInitially={isAddProductOpen}
              />
            )}

            {currentTab === 'orders' && (
              <OrderManagementTab
                orders={orders}
                onUpdateOrderStatus={onUpdateOrderStatus}
              />
            )}

            {currentTab === 'categories' && (
              <CategoryManagementTab
                categories={categories}
                products={products}
                onAddCategory={onAddCategory}
                onDeleteCategory={onDeleteCategory}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'sections' && (
              <SectionManagementTab
                sections={sections}
                categories={categories}
                products={products}
                onAddSection={onAddSection || (() => {})}
                onUpdateSection={onUpdateSection || (() => {})}
                onDeleteSection={onDeleteSection || (() => {})}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'promo-codes' && (
              <PromoCodeTab
                promoCodes={promoCodes}
                onAddPromoCode={onAddPromoCode || (() => {})}
                onUpdatePromoCode={onUpdatePromoCode || (() => {})}
                onDeletePromoCode={onDeletePromoCode || (() => {})}
              />
            )}

            {currentTab === 'media' && (
              <MediaTab
                mediaList={mediaList}
                onAddMedia={onAddMedia}
                onDeleteMedia={onDeleteMedia}
              />
            )}

            {currentTab === 'landing' && (
              <LandingPageBuilderTab
                products={products}
                landingPages={landingPages}
                onAddLandingPage={onAddLandingPage || (() => {})}
                onUpdateLandingPage={onUpdateLandingPage || (() => {})}
                onDeleteLandingPage={onDeleteLandingPage || (() => {})}
                onViewLandingPage={onViewLandingPage || (() => {})}
              />
            )}

            {currentTab === 'ads-manager' && (
              <AdsManagerTab
                tracking={tracking}
                onUpdateTracking={onUpdateTracking}
              />
            )}

            {currentTab === 'logo-banner' && (
              <SliderBannerTab
                banner={banner}
                onUpdateBanner={onUpdateBanner}
                slides={slides}
                onUpdateSlides={onUpdateSlides}
                settings={settings}
                onUpdateSettings={onUpdateSettings}
                products={products}
                categories={categories}
                landingPages={landingPages}
              />
            )}

            {[
              'business-info',
              'about-us',
              'terms',
              'delivery-charges',
              'return-policy',
              'color-settings',
              'size-settings',
            ].includes(currentTab) && (
              <SettingsTab
                section={currentTab as any}
                settings={settings}
                onUpdateSettings={onUpdateSettings}
              />
            )}

            {currentTab === 'connect-courier' && (
              <ConnectCourierTab
                settings={settings}
                onUpdateSettings={onUpdateSettings}
              />
            )}

            {currentTab === 'gateway-control' && (
              <GatewayControlTab
                settings={settings}
                onUpdateSettings={onUpdateSettings}
              />
            )}

            {currentTab === 'personal-account' && (
              <PersonalAccountTab
                settings={settings}
                onUpdateSettings={onUpdateSettings}
              />
            )}

            {currentTab === 'bkash-pra' && (
              <BkashPraTab
                settings={settings}
                onUpdateSettings={onUpdateSettings}
              />
            )}

            {currentTab === 'merchant-account' && (
              <MerchantAccountTab
                settings={settings}
                onUpdateSettings={onUpdateSettings}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
