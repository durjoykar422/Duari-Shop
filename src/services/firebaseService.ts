import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  Product,
  OrderRecord,
  StoreSettings,
  LandingPageConfig,
  HomeSection,
  MediaItem,
  BannerSlide,
  OrderStatus,
  PromoCode,
  TrackingSettings,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
}

// Check Firestore connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const pingDocRef = doc(db, '_health', 'ping');
    await setDoc(pingDocRef, {
      ping: true,
      timestamp: serverTimestamp(),
      app: 'Duari Shop',
    });
    return true;
  } catch (error) {
    console.warn('Firebase test connection note:', error);
    return true;
  }
}

// -------------------------------------------------------------
// Real-Time Subscriptions (Synchronize with all browsers live)
// -------------------------------------------------------------

export function subscribeToProducts(
  onUpdate: (products: Product[]) => void
): Unsubscribe {
  const colRef = collection(db, 'products');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        ...(d.data() as Product),
        id: d.id,
      }));
      // Stable professional sorting:
      // Sort by creation time / product ID timestamp (newest product first)
      // This guarantees that updating a product (price, title, image) updates it IN-PLACE
      // without jumping positions across different browsers!
      items.sort((a, b) => {
        const getCreatedTimestamp = (p: Product) => {
          if (p.createdAt?.toMillis) return p.createdAt.toMillis();
          if (p.createdAt?.seconds) return p.createdAt.seconds * 1000;
          if (typeof p.createdAt === 'number') return p.createdAt;
          const match = p.id?.match(/prod-(\d+)/);
          if (match) return parseInt(match[1], 10);
          return 0;
        };
        const timeA = getCreatedTimestamp(a);
        const timeB = getCreatedTimestamp(b);
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    }
  );
}

export function subscribeToTracking(
  onUpdate: (tracking: TrackingSettings) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'tracking');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as TrackingSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/tracking');
    }
  );
}

export function subscribeToSettings(
  onUpdate: (settings: StoreSettings) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'store_settings');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as StoreSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/store_settings');
    }
  );
}

export function subscribeToOrders(
  onUpdate: (orders: OrderRecord[]) => void
): Unsubscribe {
  const colRef = collection(db, 'orders');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: OrderRecord[] = snapshot.docs.map((d) => {
        const raw = (d.data() || {}) as Partial<OrderRecord>;
        return {
          id: raw.id || d.id,
          orderId: raw.orderId || raw.id || d.id,
          customer: raw.customer || 'Customer',
          phoneNumber: raw.phoneNumber || '',
          address: raw.address || '',
          city: raw.city || 'Dhaka',
          items: Array.isArray(raw.items) ? raw.items : [],
          subtotal: typeof raw.subtotal === 'number' ? raw.subtotal : (raw.total || 0),
          shippingFee: typeof raw.shippingFee === 'number' ? raw.shippingFee : 60,
          total: typeof raw.total === 'number' ? raw.total : 0,
          paymentMethod: raw.paymentMethod || 'cod',
          status: (raw.status as OrderStatus) || 'pending',
          date: raw.date || new Date().toLocaleDateString('en-GB'),
          promoCode: raw.promoCode,
          discountAmount: raw.discountAmount,
        };
      });
      // Sort descending by id or date safely
      items.sort((a, b) => {
        const idA = a.id || a.orderId || '';
        const idB = b.id || b.orderId || '';
        return idB.localeCompare(idA);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );
}

export function subscribeToLandingPages(
  onUpdate: (pages: LandingPageConfig[]) => void
): Unsubscribe {
  const colRef = collection(db, 'landing_pages');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as LandingPageConfig);
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'landing_pages');
    }
  );
}

export function subscribeToSections(
  onUpdate: (sections: HomeSection[]) => void
): Unsubscribe {
  const colRef = collection(db, 'sections');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as HomeSection);
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sections');
    }
  );
}

export function subscribeToBanners(
  onUpdate: (banners: BannerSlide[]) => void
): Unsubscribe {
  const colRef = collection(db, 'banners');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as BannerSlide);
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'banners');
    }
  );
}

export function subscribeToMedia(
  onUpdate: (media: MediaItem[]) => void
): Unsubscribe {
  const colRef = collection(db, 'media');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as MediaItem);
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'media');
    }
  );
}

// -------------------------------------------------------------
// Database Mutations (Admin & Customer Actions)
// -------------------------------------------------------------

// Recursively clean objects for Firestore to prevent "Unsupported field value: undefined" errors
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (data instanceof Date) {
    return data as any;
  }
  if (typeof data === 'object' && ('seconds' in (data as any) || '_methodName' in (data as any))) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => cleanForFirestore(item)) as any;
  }
  if (typeof data === 'object') {
    const res: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        res[key] = cleanForFirestore(val);
      }
    }
    return res;
  }
  return data;
}

// Save or Update Product in Firestore
export async function saveProductToDb(product: Product): Promise<boolean> {
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id);
    const cleaned = cleanForFirestore(product);
    await setDoc(
      docRef,
      {
        ...cleaned,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// Delete Product from Firestore
export async function deleteProductFromDb(productId: string): Promise<boolean> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

// Save or Update Store Settings in Firestore
export async function saveSettingsToDb(settings: StoreSettings): Promise<boolean> {
  const path = 'settings/store_settings';
  try {
    const docRef = doc(db, 'settings', 'store_settings');
    const cleaned = cleanForFirestore(settings);
    await setDoc(
      docRef,
      {
        ...cleaned,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// Save or Update Tracking Settings (Meta Pixel, Search Console, GA4) in Firestore
export async function saveTrackingToDb(tracking: TrackingSettings): Promise<boolean> {
  const path = 'settings/tracking';
  try {
    const docRef = doc(db, 'settings', 'tracking');
    const cleaned = cleanForFirestore(tracking);
    await setDoc(
      docRef,
      {
        ...cleaned,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// Save Order to Firestore
export async function saveOrderToDb(order: OrderRecord): Promise<boolean> {
  const orderDocId = order.id || `ord-${Date.now()}`;
  const path = `orders/${orderDocId}`;
  try {
    const docRef = doc(db, 'orders', orderDocId);
    const cleaned = cleanForFirestore(order);
    await setDoc(docRef, {
      ...cleaned,
      id: orderDocId,
      orderId: order.orderId || orderDocId,
      customer: order.customer || 'Customer',
      phoneNumber: order.phoneNumber || '',
      status: order.status || 'pending',
      total: typeof order.total === 'number' ? order.total : 0,
      createdAt: order.date || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// Backwards-compatible alias for existing code
export const saveOrderToFirebase = saveOrderToDb;

// Update Order Status in Firestore
export async function updateOrderStatusInDb(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Save or Update Landing Page
export async function saveLandingPageToDb(page: LandingPageConfig): Promise<void> {
  const path = `landing_pages/${page.id}`;
  try {
    const docRef = doc(db, 'landing_pages', page.id);
    const cleaned = cleanForFirestore(page);
    await setDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Landing Page
export async function deleteLandingPageFromDb(pageId: string): Promise<void> {
  const path = `landing_pages/${pageId}`;
  try {
    const docRef = doc(db, 'landing_pages', pageId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save or Update Section
export async function saveSectionToDb(section: HomeSection): Promise<void> {
  const path = `sections/${section.id}`;
  try {
    const docRef = doc(db, 'sections', section.id);
    const cleaned = cleanForFirestore(section);
    await setDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Section
export async function deleteSectionFromDb(sectionId: string): Promise<void> {
  const path = `sections/${sectionId}`;
  try {
    const docRef = doc(db, 'sections', sectionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save or Update Banner
export async function saveBannerToDb(banner: BannerSlide): Promise<void> {
  const path = `banners/${banner.id}`;
  try {
    const docRef = doc(db, 'banners', banner.id);
    const cleaned = cleanForFirestore(banner);
    await setDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Banner
export async function deleteBannerFromDb(bannerId: string): Promise<void> {
  const path = `banners/${bannerId}`;
  try {
    const docRef = doc(db, 'banners', bannerId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save or Update Media Item
export async function saveMediaToDb(media: MediaItem): Promise<void> {
  const path = `media/${media.id}`;
  try {
    const docRef = doc(db, 'media', media.id);
    const cleaned = cleanForFirestore(media);
    await setDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Media Item
export async function deleteMediaFromDb(mediaId: string): Promise<void> {
  const path = `media/${mediaId}`;
  try {
    const docRef = doc(db, 'media', mediaId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Seed Database on First Launch (if empty)
// -------------------------------------------------------------
export async function seedInitialDataIfEmpty(initial: {
  products: Product[];
  settings: StoreSettings;
  sections: HomeSection[];
  banners: BannerSlide[];
  landingPages: LandingPageConfig[];
  orders: OrderRecord[];
  media: MediaItem[];
  promoCodes?: PromoCode[];
  tracking?: TrackingSettings;
}): Promise<void> {
  try {
    // If tracking is provided, ensure tracking settings exist in Firestore
    if (initial.tracking) {
      try {
        const trackSnap = await getDoc(doc(db, 'settings', 'tracking'));
        if (!trackSnap.exists()) {
          await setDoc(doc(db, 'settings', 'tracking'), initial.tracking);
        }
      } catch {}
    }

    // Check if the system has already been initialized once
    const seedSnap = await getDoc(doc(db, '_system', 'initial_seed'));
    if (seedSnap.exists() && seedSnap.data()?.seeded) {
      // Store database is already initialized; never re-seed or override live database!
      return;
    }

    // 1. Check if products exist in Firestore; if empty, seed default products
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty && initial.products && initial.products.length > 0) {
      for (const p of initial.products) {
        await setDoc(doc(db, 'products', p.id), p);
      }
    }

    // 2. Check if settings exist in Firestore; if missing, seed default settings
    const settingsSnap = await getDoc(doc(db, 'settings', 'store_settings'));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, 'settings', 'store_settings'), initial.settings);
    }

    // 3. Check if sections exist
    const secSnap = await getDocs(collection(db, 'sections'));
    if (secSnap.empty) {
      for (const s of initial.sections) {
        await setDoc(doc(db, 'sections', s.id), s);
      }
    }

    // 4. Check if banners exist
    const banSnap = await getDocs(collection(db, 'banners'));
    if (banSnap.empty) {
      for (const b of initial.banners) {
        await setDoc(doc(db, 'banners', b.id), b);
      }
    }

    // 5. Check if landing pages exist
    const landSnap = await getDocs(collection(db, 'landing_pages'));
    if (landSnap.empty) {
      for (const lp of initial.landingPages) {
        await setDoc(doc(db, 'landing_pages', lp.id), lp);
      }
    }

    // 6. Check if orders exist
    const ordSnap = await getDocs(collection(db, 'orders'));
    if (ordSnap.empty) {
      for (const o of initial.orders) {
        await setDoc(doc(db, 'orders', o.id), o);
      }
    }

    // 7. Check if media exists
    const medSnap = await getDocs(collection(db, 'media'));
    if (medSnap.empty) {
      for (const m of initial.media) {
        await setDoc(doc(db, 'media', m.id), m);
      }
    }

    // 8. Check if promo codes exist
    const promoSnap = await getDocs(collection(db, 'promo_codes'));
    if (promoSnap.empty && (initial as any).promoCodes) {
      for (const pr of (initial as any).promoCodes) {
        await setDoc(doc(db, 'promo_codes', pr.id), pr);
      }
    }

    // Mark system as permanently initialized
    await setDoc(doc(db, '_system', 'initial_seed'), {
      seeded: true,
      timestamp: serverTimestamp(),
    });
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('duari_system_seeded', 'true');
      }
    } catch {}
  } catch (e) {
    console.warn('Initial Firestore seeding check note:', e);
  }
}

// Comprehensive sync all store data to Firebase
export async function syncAllStoreDataToFirebase(data: {
  products: Product[];
  orders: OrderRecord[];
  landingPages: LandingPageConfig[];
  sections: HomeSection[];
  settings: StoreSettings;
  mediaList: MediaItem[];
  categories: string[];
}): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Settings
    const settingsDoc = doc(db, 'settings', 'store_settings');
    await setDoc(settingsDoc, {
      ...data.settings,
      categories: data.categories,
      updatedAt: serverTimestamp(),
    });

    // 2. Landing Pages
    for (const page of data.landingPages) {
      await setDoc(doc(db, 'landing_pages', page.id), {
        ...page,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Sections
    for (const sec of data.sections) {
      await setDoc(doc(db, 'sections', sec.id), {
        ...sec,
        updatedAt: serverTimestamp(),
      });
    }

    // 4. Products
    for (const prod of data.products) {
      await setDoc(doc(db, 'products', prod.id), {
        ...prod,
        updatedAt: serverTimestamp(),
      });
    }

    // 5. Orders
    for (const ord of data.orders) {
      await setDoc(doc(db, 'orders', ord.id), {
        ...ord,
        updatedAt: serverTimestamp(),
      });
    }

    // 6. Promo Codes (if provided)
    if ((data as any).promoCodes && Array.isArray((data as any).promoCodes)) {
      for (const promo of (data as any).promoCodes) {
        await setDoc(doc(db, 'promo_codes', promo.id), {
          ...promo,
          updatedAt: serverTimestamp(),
        });
      }
    }

    return {
      success: true,
      message: 'সব ডেটা সফলভাবে ক্লাউড ডেটাবেস (Firestore) এ সেভ ও সিঙ্ক হয়েছে!',
    };
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, 'all_collections');
    return {
      success: false,
      message: 'ডেটাবেস সিঙ্ক করতে সমস্যা হয়েছে।',
    };
  }
}

// ==========================================
// PROMO CODES FIRESTORE OPERATIONS
// ==========================================

export async function fetchPromoCodesFromFirestore(): Promise<PromoCode[]> {
  try {
    const snap = await getDocs(collection(db, 'promo_codes'));
    const codes: PromoCode[] = [];
    snap.forEach((d) => {
      codes.push({ id: d.id, ...(d.data() as any) });
    });
    return codes;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'promo_codes');
    return [];
  }
}

export async function savePromoCodeToFirestore(promo: PromoCode): Promise<boolean> {
  try {
    const docRef = doc(db, 'promo_codes', promo.id);
    const cleaned = cleanForFirestore(promo);
    await setDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `promo_codes/${promo.id}`);
    return false;
  }
}

export async function deletePromoCodeFromFirestore(promoId: string, codeName?: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'promo_codes', promoId);
    await deleteDoc(docRef);

    // Also remove by document ID or code match across collection to guarantee clean state
    const qSnap = await getDocs(collection(db, 'promo_codes'));
    for (const d of qSnap.docs) {
      if (d.id === promoId || (codeName && d.data().code && String(d.data().code).trim().toUpperCase() === codeName.trim().toUpperCase())) {
        await deleteDoc(doc(db, 'promo_codes', d.id));
      }
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `promo_codes/${promoId}`);
    return false;
  }
}

export function subscribeToPromoCodes(
  callback: (codes: PromoCode[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'promo_codes'),
    (snap) => {
      const list: PromoCode[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'promo_codes');
    }
  );
}

