/**
 * KOGNITI MINDS - Platform Reactive Data Synchronization Bus
 * 
 * Purpose:
 * Connects data mutations across services (storageService, certificationService,
 * galleryService) with mounted React components (App.tsx, Admin views, Public pages).
 * 
 * Guarantees:
 * - Sub-millisecond reactive state updates across all views without requiring window.location.reload().
 * - Cross-tab synchronization via standard StorageEvent listeners.
 * - Clean unsubscribe lifecycle to prevent memory leaks in React effects.
 */

type SyncCallback = (detail?: any) => void;

class DataSyncBus {
  private listeners: Map<string, Set<SyncCallback>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key) {
          this.emit(e.key, { fromStorageEvent: true });
        }
      });
    }
  }

  /**
   * Subscribe to changes for a specific collection or event
   */
  subscribe(event: string, callback: SyncCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(callback);

    return () => {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Broadcast a mutation or hydration update to all subscribed components
   */
  emit(event: string, detail?: any): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(detail);
        } catch (err) {
          console.error(`[DataSyncBus] Error in callback for ${event}:`, err);
        }
      });
    }

    // Also notify wildcard listeners if any
    const allSet = this.listeners.get('*');
    if (allSet) {
      allSet.forEach((cb) => {
        try {
          cb({ event, detail });
        } catch (err) {
          console.error(`[DataSyncBus] Error in wildcard callback:`, err);
        }
      });
    }
  }
}

export const dataSyncBus = new DataSyncBus();
