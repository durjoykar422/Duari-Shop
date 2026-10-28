export interface VerifiedCustomer {
  uid: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  provider: 'google' | 'facebook' | 'email' | 'phone';
  verifiedAt: string;
  isAdmin?: boolean;
}

export interface Product {
  id: string;
  title: string;
  banglaTitle?: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  category: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  image: string;
  gallery: string[];
  description: string;
  banglaDescription?: string[];
  features: string[];
  specifications: Record<string, string>;
  isFeatured?: boolean;
  sku?: string;
  weight?: string | number;
  dimensions?: { l?: string; w?: string; h?: string };
  stockAlert?: number;
  videoUrl?: string;
  variants?: { attribute: string; values: string[] }[];
  createdAt?: any;
  updatedAt?: any;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'logo' | 'banner' | 'product';
  mimeType?: string;
  size?: number;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  fullAddress: string;
  city: string;
  zone: string;
  area: string;
}

export type PaymentMethod = 'cod' | 'pathao' | 'digital';

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingSource[];
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderRecord {
  id: string;
  orderId: string;
  date: string;
  customer: string;
  phoneNumber: string;
  address: string;
  city: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  promoCode?: string;
  discountAmount?: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes?: string;
}

export interface BannerSlide {
  id: string;
  image: string;
  title: string;
  banglaTitle?: string;
  subtitle: string;
  ctaText: string;
  active: boolean;
  logo?: string;
  badge?: string;
  link?: string;
  linkType?: 'custom' | 'product' | 'category' | 'landing' | 'catalog';
  openInNewTab?: boolean;
}

export interface TrackingSettings {
  fbPixelId: string;
  googleSearchConsoleTag: string;
  ga4Id: string;
  tiktokPixelId: string;
  googleTagManagerId: string;
}

export interface ColorSettings {
  topBarBg: string;
  topBarFont: string;
  menuBarBg: string;
  menuBarFont: string;
  cartIconBg: string;
  cartIconFont: string;
  buttonBg: string;
  buttonFont: string;
  searchBorder: string;
  priceColor: string;
}

export interface SizeSettings {
  mobileCols: number; // 2, 3, 4
  desktopCols: number; // 3, 4, 6, 9
}

export interface BannerLogoConfig {
  url: string;
  active: boolean;
  animation: 'float' | 'pulse' | 'glow' | 'bounce' | 'wave' | 'none';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  subtitle?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  hotline: string;
  email: string;
  address: string;
  insideDeliveryCharge: number;
  outsideDeliveryCharge: number;
  freeShippingAbove: number;
  aboutUsText: string;
  termsConditions: string;
  returnPolicy: string;
  primaryColor: string;
  colors?: ColorSettings;
  sizes?: SizeSettings;
  couriers?: CourierConfig[];
  gatewayControl?: GatewayControlConfig;
  personalAccounts?: PersonalAccountConfig[];
  bkashPraAccounts?: BkashPraAccountConfig[];
  merchantAccounts?: MerchantAccountConfig[];
  categories?: string[];
  bannerLogo?: BannerLogoConfig;
  logo?: string;
}

export interface CourierConfig {
  id: string;
  name: string; // 'Steadfast' | 'Pathao' | 'RedX' | 'Paperfly' | 'eCourier'
  apiKey: string;
  secretKey: string;
  balance: number;
  isDefault: boolean;
  active: boolean;
}

export interface GatewayControlConfig {
  availableGateways: string[]; // ['bKash', 'Nagad', 'Rocket']
  paymentType: 'delivery_charge' | 'full_payment';
  checkoutTiming: 'no_need' | 'mandatory' | 'optional';
  showAfterOrder: boolean;
  mapping: {
    bkash: 'PERSONAL ACCOUNT' | 'PRA ACCOUNT' | 'MERCHANT ACCOUNT';
    nagad: 'PERSONAL ACCOUNT' | 'PRA ACCOUNT' | 'MERCHANT ACCOUNT';
    rocket: 'PERSONAL ACCOUNT' | 'PRA ACCOUNT' | 'MERCHANT ACCOUNT';
  };
}

export interface PersonalAccountConfig {
  id: string;
  gateway: 'bKash' | 'Nagad' | 'Rocket';
  accountNo: string;
  active: boolean;
}

export interface BkashPraAccountConfig {
  id: string;
  gateway: string; // 'bKash'
  praNumber: string;
  counterNo?: string;
  active: boolean;
}

export interface MerchantAccountConfig {
  id: string;
  gateway: 'bKash' | 'Nagad' | 'Rocket';
  username: string;
  password?: string;
  appKey: string;
  appSecret: string;
  active: boolean;
}

export interface HomeSection {
  id: string;
  title: string;
  banglaTitle?: string;
  subtitle?: string;
  badge?: string;
  type: 'category' | 'deals' | 'featured' | 'all';
  category?: string;
  layout: 'grid' | 'carousel';
  active: boolean;
  order: number;
}

export interface LandingPageConfig {
  id: string;
  productId: string;
  title: string;
  headline: string;
  banglaHeadline?: string;
  subheadline?: string;
  badge?: string;
  offerPrice: number;
  regularPrice: number;
  videoUrl?: string;
  features?: string[];
  reviewsCount?: number;
  rating?: number;
  active: boolean;
  heroImage?: string;
  timerHours?: number;
  // Schedule timing settings
  isScheduled?: boolean;
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  scheduleStart?: string; // YYYY-MM-DDTHH:mm
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  scheduleEnd?: string; // YYYY-MM-DDTHH:mm
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'amount' | 'percentage';
  discountValue: number;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  expireDate: string; // YYYY-MM-DD
  // Schedule timing settings
  isScheduled?: boolean;
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  scheduleStart?: string; // YYYY-MM-DDTHH:mm
  expireTime?: string; // HH:mm
  scheduleEnd?: string; // YYYY-MM-DDTHH:mm
  active?: boolean;
  usageCount?: number;
  createdAt?: string;
}

