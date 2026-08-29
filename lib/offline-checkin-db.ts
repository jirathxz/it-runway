/**
 * Offline Check-in Database Engine (IndexedDB Native Implementation)
 * Zero external dependencies, ultra-fast client-side persistence for race day venues.
 */

const DB_NAME = "it_runway_offline_db";
const DB_VERSION = 1;

export interface OfflineParticipant {
  id: string;
  userId: string;
  eventId: string;
  bibNumber: string;
  corral: string;
  distance: string;
  tshirtSize: string;
  status: string;
  registrationStatus: string;
  chipCode: string;
  shippingStatus: string;
  trackingNumber?: string | null;
  checkedIn: "yes" | "no";
  checkedInAt?: string | null;
  registeredAt: string;
  userName: string;
  userPhone?: string | null;
  gender?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  bloodType?: string | null;
  hasMedicalAlert?: boolean;
}

export interface OfflineSyncItem {
  id?: number;
  registrationId: string;
  bibNumber: string;
  eventId: string;
  checkedInAt: string;
  synced: boolean;
}

class OfflineCheckinDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("IndexedDB is only available in browser"));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = request.result;

          // 1. Roster store
          if (!db.objectStoreNames.contains("roster")) {
            const rosterStore = db.createObjectStore("roster", { keyPath: "bibNumber" });
            rosterStore.createIndex("chipCode", "chipCode", { unique: false });
            rosterStore.createIndex("id", "id", { unique: false });
            rosterStore.createIndex("eventId", "eventId", { unique: false });
          }

          // 2. Offline Sync Mutation Queue
          if (!db.objectStoreNames.contains("sync_queue")) {
            const syncStore = db.createObjectStore("sync_queue", {
              keyPath: "id",
              autoIncrement: true,
            });
            syncStore.createIndex("synced", "synced", { unique: false });
          }

          // 3. Meta store
          if (!db.objectStoreNames.contains("meta")) {
            db.createObjectStore("meta", { keyPath: "key" });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  /**
   * Save complete event roster into local IndexedDB
   */
  async saveRoster(eventId: string, eventTitle: string, participants: OfflineParticipant[]): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["roster", "meta"], "readwrite");
      const rosterStore = tx.objectStore("roster");
      const metaStore = tx.objectStore("meta");

      // Clear existing roster
      rosterStore.clear();

      participants.forEach((p) => {
        rosterStore.put(p);
      });

      metaStore.put({
        key: "last_sync",
        eventId,
        eventTitle,
        count: participants.length,
        timestamp: new Date().toISOString(),
      });

      tx.oncomplete = () => resolve(participants.length);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Search offline roster by BIB number, Chip code, or QR scan string
   */
  async findParticipant(query: string): Promise<OfflineParticipant | null> {
    const db = await this.getDB();
    const cleanQuery = query.trim().toUpperCase();

    return new Promise((resolve, reject) => {
      const tx = db.transaction("roster", "readonly");
      const store = tx.objectStore("roster");

      // 1. Direct BIB lookup
      const bibReq = store.get(cleanQuery);
      bibReq.onsuccess = () => {
        if (bibReq.result) {
          resolve(bibReq.result);
          return;
        }

        // 2. Scan all or index by chip
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor) {
            const p: OfflineParticipant = cursor.value;
            if (
              p.bibNumber.toUpperCase() === cleanQuery ||
              p.chipCode.toUpperCase() === cleanQuery ||
              p.id.toUpperCase() === cleanQuery ||
              (p.userPhone && p.userPhone.replace(/[^0-9]/g, "") === cleanQuery.replace(/[^0-9]/g, ""))
            ) {
              resolve(p);
              return;
            }
            cursor.continue();
          } else {
            resolve(null);
          }
        };
        cursorReq.onerror = () => reject(cursorReq.error);
      };
      bibReq.onerror = () => reject(bibReq.error);
    });
  }

  /**
   * Perform instant offline check-in and queue mutation
   */
  async checkinOffline(bibNumber: string): Promise<{ success: boolean; participant?: OfflineParticipant; error?: string }> {
    const db = await this.getDB();
    const participant = await this.findParticipant(bibNumber);

    if (!participant) {
      return { success: false, error: `ไม่พบหมายเลข BIB ${bibNumber} ในฐานข้อมูลออฟไลน์` };
    }

    if (participant.checkedIn === "yes") {
      return {
        success: true,
        participant,
        error: `BIB ${bibNumber} ได้ทำการเช็คอินแล้วเมื่อ ${participant.checkedInAt || "ก่อนหน้า"}`,
      };
    }

    const checkinTime = new Date().toISOString();
    participant.checkedIn = "yes";
    participant.checkedInAt = checkinTime;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(["roster", "sync_queue"], "readwrite");
      const rosterStore = tx.objectStore("roster");
      const syncStore = tx.objectStore("sync_queue");

      rosterStore.put(participant);
      syncStore.put({
        registrationId: participant.id,
        bibNumber: participant.bibNumber,
        eventId: participant.eventId,
        checkedInAt: checkinTime,
        synced: false,
      });

      tx.oncomplete = () => resolve({ success: true, participant });
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get all pending check-in mutations awaiting sync
   */
  async getPendingSyncItems(): Promise<OfflineSyncItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("sync_queue", "readonly");
      const store = tx.objectStore("sync_queue");
      const req = store.getAll();

      req.onsuccess = () => {
        const items = (req.result as OfflineSyncItem[]).filter((i) => !i.synced);
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Mark sync items as completed
   */
  async markSynced(itemIds: number[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("sync_queue", "readwrite");
      const store = tx.objectStore("sync_queue");

      itemIds.forEach((id) => {
        store.delete(id);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get offline cache stats
   */
  async getStats(): Promise<{ totalCached: number; checkedInOffline: number; pendingSyncCount: number; lastSyncInfo: any }> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["roster", "sync_queue", "meta"], "readonly");
      const rosterStore = tx.objectStore("roster");
      const syncStore = tx.objectStore("sync_queue");
      const metaStore = tx.objectStore("meta");

      const rosterReq = rosterStore.getAll();
      const syncReq = syncStore.getAll();
      const metaReq = metaStore.get("last_sync");

      tx.oncomplete = () => {
        const rosterList = (rosterReq.result || []) as OfflineParticipant[];
        const syncList = (syncReq.result || []) as OfflineSyncItem[];
        const checkedInCount = rosterList.filter((p) => p.checkedIn === "yes").length;
        const pendingSync = syncList.filter((s) => !s.synced).length;

        resolve({
          totalCached: rosterList.length,
          checkedInOffline: checkedInCount,
          pendingSyncCount: pendingSync,
          lastSyncInfo: metaReq.result || null,
        });
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const offlineDb = new OfflineCheckinDatabase();
