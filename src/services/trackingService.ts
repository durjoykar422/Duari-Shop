import { TrackingSettings } from '../types';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    ttq?: any;
  }
}

let activeFbPixelId: string | null = null;
let activeGa4Id: string | null = null;
let activeGtmId: string | null = null;

/**
 * Extracts clean Google Search Console verification token from various user inputs:
 * 1. Full meta tag: <meta name="google-site-verification" content="TOKEN" />
 * 2. Key-value: google-site-verification=TOKEN
 * 3. Raw token: TOKEN
 */
export function extractGoogleVerificationToken(rawInput: string): string {
  if (!rawInput) return '';
  const trimmed = rawInput.trim();

  // If user pasted full <meta ... content="TOKEN" ...>
  const metaMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) {
    return metaMatch[1].trim();
  }

  // If user pasted google-site-verification=TOKEN
  const equalMatch = trimmed.match(/google-site-verification=([^&\s"']+)/i);
  if (equalMatch && equalMatch[1]) {
    return equalMatch[1].trim();
  }

  // Strip any accidental surrounding tags or quotes
  return trimmed.replace(/^<[^>]+>/, '').replace(/["']/g, '').trim();
}

/**
 * Extracts clean numeric or alphanumeric Facebook Pixel ID
 */
export function extractPixelId(rawInput: string): string {
  if (!rawInput) return '';
  const trimmed = rawInput.trim();
  // Extract numeric id if user pasted script or init snippet: fbq('init', '12345')
  const match = trimmed.match(/\b\d{10,20}\b/);
  if (match) return match[0];
  return trimmed.replace(/[^\w-]/g, '');
}

/**
 * Injects or updates Google Search Console meta tag in <head>
 */
export function applyGoogleSearchConsoleTag(rawTag: string): void {
  if (typeof document === 'undefined') return;

  const token = extractGoogleVerificationToken(rawTag);
  let meta = document.querySelector('meta[name="google-site-verification"]');

  if (token) {
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'google-site-verification');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', token);
  } else if (meta) {
    // If user cleared the tag, remove it
    meta.remove();
  }
}

/**
 * Injects and initializes Facebook / Meta Pixel
 */
export function applyFacebookPixel(rawPixelId: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const pixelId = extractPixelId(rawPixelId);
  if (!pixelId) return;

  activeFbPixelId = pixelId;

  // Initialize fbq stub if not already present
  if (!window.fbq) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        document.head.appendChild(t);
      }
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  }

  // Initialize pixel & track standard PageView
  try {
    if (typeof window.fbq === 'function') {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    }
  } catch (err) {
    console.warn('Facebook Pixel init warning:', err);
  }

  // Update noscript fallback image in DOM
  let noscript = document.getElementById('meta-pixel-noscript') || document.getElementById('facebook-pixel-noscript');
  if (!noscript) {
    noscript = document.createElement('noscript');
    noscript.id = 'meta-pixel-noscript';
    document.body.appendChild(noscript);
  }
  noscript.innerHTML = `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
}

/**
 * Injects and initializes Google Analytics 4 (GA4)
 */
export function applyGoogleAnalytics(rawGa4Id: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const ga4Id = rawGa4Id.trim();
  if (!ga4Id || !/^G-[A-Z0-9]+$/i.test(ga4Id)) return;

  if (activeGa4Id === ga4Id && window.gtag) return;
  activeGa4Id = ga4Id;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function (...args: any[]) {
      window.dataLayer?.push(args);
    };

  window.gtag('js', new Date());
  window.gtag('config', ga4Id);

  let script = document.getElementById('ga4-script') as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(script);
  } else {
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
  }
}

/**
 * Injects Google Tag Manager (GTM)
 */
export function applyGoogleTagManager(rawGtmId: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const gtmId = rawGtmId.trim();
  if (!gtmId || !/^GTM-[A-Z0-9]+$/i.test(gtmId)) return;

  if (activeGtmId === gtmId) return;
  activeGtmId = gtmId;

  const scriptId = 'gtm-script';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
    document.head.appendChild(script);
  }
}

/**
 * Master initializer for all tracking services
 */
export function initAllTracking(settings: TrackingSettings): void {
  if (!settings) return;

  if (settings.googleSearchConsoleTag) {
    applyGoogleSearchConsoleTag(settings.googleSearchConsoleTag);
  }

  if (settings.fbPixelId) {
    applyFacebookPixel(settings.fbPixelId);
  }

  if (settings.ga4Id) {
    applyGoogleAnalytics(settings.ga4Id);
  }

  if (settings.googleTagManagerId) {
    applyGoogleTagManager(settings.googleTagManagerId);
  }
}

/**
 * Standard eCommerce Event Trackers
 */
export function trackPageView(pageName?: string): void {
  try {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
    if (window.gtag && activeGa4Id) {
      window.gtag('event', 'page_view', { page_title: pageName || document.title });
    }
  } catch {}
}

export function trackViewContent(product: {
  id: string;
  title: string;
  price: number;
  category?: string;
}): void {
  try {
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.title,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'BDT',
        content_category: product.category || 'General',
      });
    }
    if (window.gtag && activeGa4Id) {
      window.gtag('event', 'view_item', {
        currency: 'BDT',
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            item_category: product.category,
            price: product.price,
          },
        ],
      });
    }
  } catch {}
}

export function trackAddToCart(
  product: { id: string; title: string; price: number; category?: string },
  quantity = 1
): void {
  try {
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.title,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price * quantity,
        currency: 'BDT',
      });
    }
    if (window.gtag && activeGa4Id) {
      window.gtag('event', 'add_to_cart', {
        currency: 'BDT',
        value: product.price * quantity,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            item_category: product.category,
            price: product.price,
            quantity,
          },
        ],
      });
    }
  } catch {}
}

export function trackInitiateCheckout(
  cartItems: Array<{ product: { id: string; title: string; price: number }; quantity: number }>,
  total: number
): void {
  try {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: cartItems.map((item) => item.product.id),
        contents: cartItems.map((item) => ({
          id: item.product.id,
          quantity: item.quantity,
          item_price: item.product.price,
        })),
        num_items: cartItems.reduce((acc, item) => acc + item.quantity, 0),
        value: total,
        currency: 'BDT',
      });
    }
    if (window.gtag && activeGa4Id) {
      window.gtag('event', 'begin_checkout', {
        currency: 'BDT',
        value: total,
        items: cartItems.map((item) => ({
          item_id: item.product.id,
          item_name: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
        })),
      });
    }
  } catch {}
}

export function trackPurchase(order: {
  id: string;
  total: number;
  items: Array<{ product?: { id: string; title: string; price: number }; id?: string; title?: string; price?: number; quantity?: number }>;
}): void {
  try {
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        content_type: 'product',
        content_ids: order.items.map((i) => i.product?.id || i.id || ''),
        value: order.total,
        currency: 'BDT',
        num_items: order.items.reduce((acc, i) => acc + (i.quantity || 1), 0),
      });
    }
    if (window.gtag && activeGa4Id) {
      window.gtag('event', 'purchase', {
        transaction_id: order.id,
        value: order.total,
        currency: 'BDT',
        items: order.items.map((i) => ({
          item_id: i.product?.id || i.id,
          item_name: i.product?.title || i.title,
          price: i.product?.price || i.price,
          quantity: i.quantity || 1,
        })),
      });
    }
  } catch {}
}

/**
 * Diagnostic test trigger for Facebook Pixel verification in Ads Manager Tab
 */
export function sendTestPixelEvent(pixelId: string): { success: boolean; message: string } {
  try {
    const cleanId = extractPixelId(pixelId);
    if (!cleanId) {
      return { success: false, message: 'Invalid Pixel ID' };
    }
    applyFacebookPixel(cleanId);
    if (window.fbq) {
      window.fbq('track', 'PageView');
      window.fbq('trackCustom', 'DuariPixelTest', {
        eventTime: new Date().toISOString(),
        testStatus: 'ACTIVE_AND_VERIFIED',
        pixelId: cleanId,
      });

      // Also trigger beacon image to guarantee network transmission
      try {
        const beacon = new Image();
        beacon.src = `https://www.facebook.com/tr?id=${cleanId}&ev=DuariPixelTest&noscript=1&ts=${Date.now()}`;
      } catch {}

      return {
        success: true,
        message: `Test event "DuariPixelTest" & "PageView" dispatched for Pixel ${cleanId}! Verify in Meta Events Manager or Meta Pixel Helper extension.`,
      };
    }
    return {
      success: false,
      message: 'fbq function not available in window. Ensure Pixel ID is valid.',
    };
  } catch (e: any) {
    return {
      success: false,
      message: e?.message || 'Failed to dispatch test event.',
    };
  }
}
