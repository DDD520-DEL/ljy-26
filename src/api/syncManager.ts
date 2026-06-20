import type { Employee, WaterRecord, Comment, BucketType, Department, ReminderConfig } from '@/types';
import { api, isServerReachable, type ServerData } from '@/api';

export type PendingActionType =
  | 'addRecord'
  | 'addEmployee'
  | 'likeRecord'
  | 'addComment'
  | 'updateEmployee'
  | 'updateReminderConfig';

export interface PendingAction {
  id: string;
  type: PendingActionType;
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'water-hero-pending-queue';
const LAST_SYNC_KEY = 'water-hero-last-sync';
const SERVER_DATA_KEY = 'water-hero-server-data';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  lastError: string | null;
}

type SyncListener = (state: SyncState) => void;

class SyncManager {
  private listeners: Set<SyncListener> = new Set();
  private state: SyncState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    lastError: null,
  };

  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private onlineCheckTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));

      const lastSync = localStorage.getItem(LAST_SYNC_KEY);
      if (lastSync) {
        this.state.lastSyncTime = Number(lastSync) || null;
      }

      this.state.pendingCount = this.getQueue().length;

      this.startPeriodicCheck();
    }
  }

  private startPeriodicCheck() {
    this.onlineCheckTimer = setInterval(async () => {
      const reachable = await isServerReachable();
      const wasOffline = !this.state.isOnline;

      if (reachable !== this.state.isOnline) {
        this.updateState({ isOnline: reachable });
      }

      if (reachable && (wasOffline || this.getQueue().length > 0)) {
        this.processQueue();
      }
    }, 15000);
  }

  private handleOnline() {
    this.updateState({ isOnline: true });
    setTimeout(() => this.processQueue(), 500);
  }

  private handleOffline() {
    this.updateState({ isOnline: false });
  }

  private updateState(partial: Partial<SyncState>) {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(l => {
      try {
        l({ ...this.state });
      } catch {
      }
    });
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  getState(): SyncState {
    return { ...this.state };
  }

  getQueue(): PendingAction[] {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
    }
    return [];
  }

  private saveQueue(queue: PendingAction[]): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
      this.updateState({ pendingCount: queue.length });
    } catch {
    }
  }

  enqueue(type: PendingActionType, payload: unknown): string {
    const action: PendingAction = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const queue = this.getQueue();
    queue.push(action);
    this.saveQueue(queue);

    if (this.state.isOnline && !this.state.isSyncing) {
      setTimeout(() => this.processQueue(), 200);
    }

    return action.id;
  }

  removeFromQueue(actionId: string): void {
    const queue = this.getQueue().filter(a => a.id !== actionId);
    this.saveQueue(queue);
  }

  getCachedServerData(): ServerData | null {
    try {
      const raw = localStorage.getItem(SERVER_DATA_KEY);
      if (raw) {
        return JSON.parse(raw) as ServerData;
      }
    } catch {
    }
    return null;
  }

  setCachedServerData(data: ServerData): void {
    try {
      localStorage.setItem(SERVER_DATA_KEY, JSON.stringify(data));
      localStorage.setItem(LAST_SYNC_KEY, String(data.lastModified));
      this.updateState({ lastSyncTime: data.lastModified, lastError: null });
    } catch {
    }
  }

  async fetchFromServer(): Promise<ServerData | null> {
    try {
      const data = await api.getData();
      this.setCachedServerData(data);
      return data;
    } catch (err) {
      this.updateState({ lastError: '拉取服务器数据失败' });
      return null;
    }
  }

  private async executeAction(action: PendingAction): Promise<boolean> {
    try {
      switch (action.type) {
        case 'addRecord': {
          const payload = action.payload as { id?: string; employeeId: string; bucketType: BucketType; timestamp: string; likes?: number };
          await api.addRecord(payload);
          return true;
        }
        case 'addEmployee': {
          const payload = action.payload as { id?: string; name: string; avatar: string; department: Department };
          await api.addEmployee(payload);
          return true;
        }
        case 'updateEmployee': {
          const payload = action.payload as { id: string; data: Partial<Employee> };
          await api.updateEmployee(payload.id, payload.data);
          return true;
        }
        case 'likeRecord': {
          const payload = action.payload as { id: string };
          await api.likeRecord(payload.id);
          return true;
        }
        case 'addComment': {
          const payload = action.payload as { id?: string; recordId: string; employeeId: string; content: string; timestamp?: string };
          await api.addComment(payload);
          return true;
        }
        case 'updateReminderConfig': {
          const payload = action.payload as ReminderConfig;
          await api.updateReminderConfig(payload);
          return true;
        }
        default:
          return true;
      }
    } catch (err) {
      return false;
    }
  }

  async processQueue(): Promise<{ success: number; failed: number }> {
    if (this.state.isSyncing) {
      return { success: 0, failed: 0 };
    }

    const reachable = await isServerReachable();
    if (!reachable) {
      this.updateState({ isOnline: false, lastError: '服务器不可达' });
      return { success: 0, failed: this.getQueue().length };
    }

    this.updateState({ isOnline: true, isSyncing: true });

    let successCount = 0;
    let failedCount = 0;
    let queue = this.getQueue();
    const toRetry: PendingAction[] = [];

    for (const action of queue) {
      const ok = await this.executeAction(action);
      if (ok) {
        successCount++;
      } else {
        action.retryCount++;
        if (action.retryCount < 5) {
          toRetry.push(action);
        }
        failedCount++;
      }
    }

    this.saveQueue(toRetry);

    if (successCount > 0 && failedCount === 0) {
      await this.fetchFromServer();
    }

    this.updateState({
      isSyncing: false,
      lastError: failedCount > 0 ? `${failedCount} 条操作同步失败，将自动重试` : null,
    });

    return { success: successCount, failed: failedCount };
  }

  async fullSync(localData: {
    employees: Employee[];
    records: WaterRecord[];
    comments: Comment[];
    likedRecordIds: string[];
    currentCommenterId: string | null;
    reminderConfig?: ReminderConfig;
  }): Promise<ServerData | null> {
    this.updateState({ isSyncing: true });

    try {
      const reachable = await isServerReachable();
      if (!reachable) {
        this.updateState({ isOnline: false, isSyncing: false, lastError: '服务器不可达' });
        return this.getCachedServerData();
      }

      const cached = this.getCachedServerData();
      const result = await api.sync({
        ...localData,
        clientLastModified: cached?.lastModified || 0,
      });

      const serverData: ServerData = {
        employees: result.mergedEmployees,
        records: result.mergedRecords,
        likedRecordIds: result.mergedLikedRecordIds,
        comments: result.mergedComments,
        currentCommenterId: result.currentCommenterId,
        reminderConfig: result.mergedReminderConfig,
        lastModified: result.lastModified,
      };

      this.setCachedServerData(serverData);
      this.saveQueue([]);
      this.updateState({ isSyncing: false, lastError: null });

      return serverData;
    } catch (err) {
      this.updateState({ isSyncing: false, lastError: '同步失败' });
      return null;
    }
  }

  scheduleSync(delayMs = 3000): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }
    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      this.processQueue();
    }, delayMs);
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
    if (this.onlineCheckTimer) {
      clearInterval(this.onlineCheckTimer);
      this.onlineCheckTimer = null;
    }
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    this.listeners.clear();
  }
}

export const syncManager = new SyncManager();
