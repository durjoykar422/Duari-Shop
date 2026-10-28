/**
 * Cross-Tab and Cross-Window Real-Time Synchronization via BroadcastChannel
 * Ensures instant updates across open browser tabs without waiting for network reloads.
 */

type SyncEvent =
  | { type: 'PRODUCT_UPDATED'; payload: any }
  | { type: 'PRODUCT_ADDED'; payload: any }
  | { type: 'PRODUCT_DELETED'; payload: string }
  | { type: 'SETTINGS_UPDATED'; payload: any }
  | { type: 'TRACKING_UPDATED'; payload: any }
  | { type: 'CATEGORIES_UPDATED'; payload: string[] }
  | { type: 'CUSTOMER_AUTH'; payload: any }
  | { type: 'ORDER_PLACED'; payload: any }
  | { type: 'ORDER_UPDATED'; payload: any };

let channel: BroadcastChannel | null = null;

export function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!channel) {
    try {
      channel = new BroadcastChannel('duari_store_sync_channel');
    } catch {
      channel = null;
    }
  }
  return channel;
}

export function broadcastSync(event: SyncEvent): void {
  try {
    const ch = getSyncChannel();
    if (ch) {
      ch.postMessage(event);
    }
  } catch {}
}

export function listenToSync(onEvent: (event: SyncEvent) => void): () => void {
  const ch = getSyncChannel();
  if (!ch) return () => {};

  const handler = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      onEvent(e.data);
    }
  };

  ch.addEventListener('message', handler);
  return () => {
    ch.removeEventListener('message', handler);
  };
}
