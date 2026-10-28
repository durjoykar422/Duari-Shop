import { OrderRecord, BannerSlide, TrackingSettings, StoreSettings, HomeSection, LandingPageConfig, PromoCode } from '../types';
import { PRODUCTS } from './products';

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'DUARI50',
    discountType: 'amount',
    discountValue: 50,
    minPurchase: null,
    maxDiscount: null,
    isScheduled: true,
    startDate: '2026-10-01',
    startTime: '00:00',
    scheduleStart: '2026-10-01T00:00',
    expireDate: '2026-10-31',
    expireTime: '23:59',
    scheduleEnd: '2026-10-31T23:59',
    active: true,
    usageCount: 8,
    createdAt: '2026-10-04',
  },
  {
    id: 'promo-2',
    code: 'SAVE100',
    discountType: 'amount',
    discountValue: 100,
    minPurchase: 1000,
    maxDiscount: null,
    isScheduled: true,
    startDate: '2026-10-05',
    startTime: '00:00',
    scheduleStart: '2026-10-05T00:00',
    expireDate: '2026-12-31',
    expireTime: '23:59',
    scheduleEnd: '2026-12-31T23:59',
    active: true,
    usageCount: 4,
    createdAt: '2026-10-05',
  },
  {
    id: 'promo-3',
    code: 'DUARI10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 500,
    maxDiscount: 300,
    isScheduled: true,
    startDate: '2026-10-06',
    startTime: '09:00',
    scheduleStart: '2026-10-06T09:00',
    expireDate: '2026-11-30',
    expireTime: '23:59',
    scheduleEnd: '2026-11-30T23:59',
    active: true,
    usageCount: 12,
    createdAt: '2026-10-06',
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [];

export const INITIAL_BANNERS: BannerSlide[] = [];

export const INITIAL_TRACKING: TrackingSettings = {
  fbPixelId: '1355487643396063',
  googleSearchConsoleTag: 'dUAri_shOP_bd_verify_token_9921',
  ga4Id: 'G-DUARI88921',
  tiktokPixelId: 'TT-DUARISHOP-BD',
  googleTagManagerId: 'GTM-DUARI77',
};

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Duari Shop',
  tagline: 'Doorstep Delivery',
  hotline: '01621871225',
  email: 'support@duarishop.com',
  address: 'Mymensingh Sadar, College Road, Bangladesh',
  logo: '/src/assets/images/duari_logo_1791125380292.jpg',
  insideDeliveryCharge: 60,
  outsideDeliveryCharge: 120,
  freeShippingAbove: 3000,
  aboutUsText:
    'Duari Shop is Bangladesh leading doorstep delivery e-commerce platform offering 100% genuine electronics, retro & modern gaming consoles, audio gear, and household lifestyle gadgets with fast 24-48 hours delivery and inspection before payment.',
  termsConditions:
    'Products are inspected prior to dispatch. Customers are advised to open packages before courier. 7 days replacement warranty for manufacturing issues.',
  returnPolicy:
    'Customers can claim return or replacement within 7 days of package receipt if the item has manufacturing fault or defect. Return shipping is handled by Duari Express.',
  primaryColor: '#0a2f7c',
  colors: {
    topBarBg: '#734fba',
    topBarFont: '#ffffff',
    menuBarBg: '#14559c',
    menuBarFont: '#ffffff',
    cartIconBg: '#3f299c',
    cartIconFont: '#ffffff',
    buttonBg: '#030f78',
    buttonFont: '#ffffff',
    searchBorder: '#0e0d5c',
    priceColor: '#0022ff',
  },
  sizes: {
    mobileCols: 3,
    desktopCols: 6,
  },
  couriers: [
    {
      id: 'cour-1',
      name: 'Steadfast',
      apiKey: 'SF-KEY-789214',
      secretKey: 'SF-SEC-99120',
      balance: 4500,
      isDefault: true,
      active: true,
    },
  ],
  gatewayControl: {
    availableGateways: ['Nagad'],
    paymentType: 'delivery_charge',
    checkoutTiming: 'mandatory',
    showAfterOrder: true,
    mapping: {
      bkash: 'PERSONAL ACCOUNT',
      nagad: 'PERSONAL ACCOUNT',
      rocket: 'PERSONAL ACCOUNT',
    },
  },
  personalAccounts: [
    {
      id: 'pa-1',
      gateway: 'Nagad',
      accountNo: '01621871225',
      active: true,
    },
    {
      id: 'pa-2',
      gateway: 'bKash',
      accountNo: '01621871225',
      active: true,
    },
    {
      id: 'pa-3',
      gateway: 'Rocket',
      accountNo: '01621871225',
      active: true,
    },
  ],
  bkashPraAccounts: [
    {
      id: 'pra-1',
      gateway: 'bKash',
      praNumber: '01621871225',
      counterNo: '01',
      active: true,
    },
  ],
  merchantAccounts: [
    {
      id: 'ma-1',
      gateway: 'bKash',
      username: 'duarishop_merchant',
      password: '••••••••',
      appKey: 'BK-KEY-449102',
      appSecret: 'BK-SEC-992104',
      active: true,
    },
    {
      id: 'ma-2',
      gateway: 'Nagad',
      username: 'duarishop_nagad',
      password: '••••••••',
      appKey: 'NG-KEY-110293',
      appSecret: 'NG-SEC-88201',
      active: true,
    },
    {
      id: 'ma-3',
      gateway: 'Rocket',
      username: 'duarishop_rocket',
      password: '••••••••',
      appKey: 'RC-KEY-993821',
      appSecret: 'RC-SEC-77192',
      active: true,
    },
  ],
};

export const ADMIN_SECURITY_CREDENTIALS = {
  username: 'durjoy422@gmail.com',
  password: 'DuariShop422',
};

export const INITIAL_MEDIA: any[] = [];

export const INITIAL_SECTIONS: HomeSection[] = [];

export const INITIAL_LANDING_PAGES: LandingPageConfig[] = [];
