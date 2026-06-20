import { create } from 'zustand';
import type { Employee, WaterRecord, BucketType, Department, Comment, ReminderConfig } from '@/types';
import { INITIAL_EMPLOYEES, STORAGE_KEY, DEFAULT_REMINDER_CONFIG } from '@/constants';
import { generateId, generateMockRecords, generateMockComments } from '@/utils';
import { syncManager, type SyncState } from '@/api/syncManager';
import { api, isServerReachable } from '@/api';

interface PersistedStateRaw {
  employees: Employee[];
  records: WaterRecord[];
  likedRecordIds: string[];
  comments: Comment[];
  currentCommenterId: string | null;
  reminderConfig: ReminderConfig;
}

interface PersistedState {
  employees: Employee[];
  records: WaterRecord[];
  likedRecords: Set<string>;
  comments: Comment[];
  currentCommenterId: string | null;
  reminderConfig: ReminderConfig;
}

interface AppState extends PersistedState {
  syncState: SyncState;
  serverLastModified: number | null;
  isInitializing: boolean;
  initError: string | null;

  addRecord: (employeeId: string, bucketType: BucketType) => WaterRecord;
  addEmployee: (name: string, avatar: string, department: Department) => Employee;
  likeRecord: (recordId: string) => void;
  isRecordLiked: (recordId: string) => boolean;
  addComment: (recordId: string, employeeId: string, content: string) => Comment;
  getCommentsByRecord: (recordId: string) => Comment[];
  setCurrentCommenter: (employeeId: string) => void;
  updateReminderConfig: (config: ReminderConfig) => void;

  initialize: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
  manualSync: () => Promise<void>;
  resetSyncError: () => void;
}

function serializeState(state: PersistedState): PersistedStateRaw {
  return {
    employees: state.employees,
    records: state.records,
    likedRecordIds: Array.from(state.likedRecords),
    comments: state.comments,
    currentCommenterId: state.currentCommenterId,
    reminderConfig: state.reminderConfig,
  };
}

function deserializeState(raw: PersistedStateRaw): PersistedState {
  return {
    employees: raw.employees,
    records: raw.records,
    likedRecords: new Set(raw.likedRecordIds || []),
    comments: raw.comments || [],
    currentCommenterId: raw.currentCommenterId || null,
    reminderConfig: raw.reminderConfig || { ...DEFAULT_REMINDER_CONFIG },
  };
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedStateRaw;
      if (parsed.employees && parsed.records) {
        return deserializeState(parsed);
      }
    }
  } catch {
  }
  return null;
}

function saveToStorage(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(state)));
  } catch {
  }
}

function deduplicateLocalState(state: PersistedState): PersistedState {
  const uniqueEmployees = Array.from(
    new Map(state.employees.map(e => [e.id, e])).values()
  );

  const seenRecordIds = new Set<string>();
  const seenRecordFps = new Set<string>();
  const uniqueRecords: WaterRecord[] = [];
  for (const r of state.records) {
    if (seenRecordIds.has(r.id)) continue;
    const fp = `${r.employeeId}-${r.bucketType}-${r.timestamp}`;
    if (seenRecordFps.has(fp)) continue;
    seenRecordIds.add(r.id);
    seenRecordFps.add(fp);
    uniqueRecords.push(r);
  }

  const seenCommentIds = new Set<string>();
  const seenCommentFps = new Set<string>();
  const uniqueComments: Comment[] = [];
  for (const c of state.comments) {
    if (seenCommentIds.has(c.id)) continue;
    const fp = `${c.recordId}-${c.employeeId}-${c.timestamp}-${c.content}`;
    if (seenCommentFps.has(fp)) continue;
    seenCommentIds.add(c.id);
    seenCommentFps.add(fp);
    uniqueComments.push(c);
  }

  return {
    ...state,
    employees: uniqueEmployees,
    records: uniqueRecords,
    comments: uniqueComments,
  };
}

function getInitialLocalState(): PersistedState {
  const saved = loadFromStorage();
  if (saved) {
    const deduped = deduplicateLocalState(saved);
    const changed =
      deduped.records.length !== saved.records.length ||
      deduped.comments.length !== saved.comments.length ||
      deduped.employees.length !== saved.employees.length;
    if (changed) saveToStorage(deduped);
    return deduped;
  }

  const employees = [...INITIAL_EMPLOYEES];
  const records = generateMockRecords(employees);
  const comments = generateMockComments(employees, records);
  const initial: PersistedState = {
    employees,
    records,
    likedRecords: new Set<string>(),
    comments,
    currentCommenterId: employees[0]?.id || null,
    reminderConfig: { ...DEFAULT_REMINDER_CONFIG },
  };
  saveToStorage(initial);
  return initial;
}

function mergeServerIntoLocal(
  local: PersistedState,
  serverEmployees: Employee[],
  serverRecords: WaterRecord[],
  serverLikedIds: string[],
  serverComments: Comment[],
  serverReminderConfig?: ReminderConfig
): PersistedState {
  const localEmpMap = new Map(local.employees.map(e => [e.id, { ...e }]));
  serverEmployees.forEach(emp => {
    const existing = localEmpMap.get(emp.id);
    if (existing) {
      localEmpMap.set(emp.id, {
        ...existing,
        ...emp,
        totalLikes: Math.max(existing.totalLikes || 0, emp.totalLikes || 0),
      });
    } else {
      localEmpMap.set(emp.id, { ...emp });
    }
  });
  const mergedEmployees = Array.from(localEmpMap.values());

  function getRecordFingerprint(r: WaterRecord): string {
    return `${r.employeeId}-${r.bucketType}-${r.timestamp}`;
  }

  const localRecordsById = new Map(local.records.map(r => [r.id, { ...r }]));
  const localRecordsByFp = new Map<string, string>();
  local.records.forEach(r => {
    localRecordsByFp.set(getRecordFingerprint(r), r.id);
  });

  serverRecords.forEach(rec => {
    if (localRecordsById.has(rec.id)) {
      const existing = localRecordsById.get(rec.id)!;
      localRecordsById.set(rec.id, {
        ...existing,
        likes: Math.max(existing.likes || 0, rec.likes || 0),
      });
    } else {
      const fp = getRecordFingerprint(rec);
      const duplicateLocalId = localRecordsByFp.get(fp);
      if (duplicateLocalId) {
        const existing = localRecordsById.get(duplicateLocalId)!;
        localRecordsById.set(duplicateLocalId, {
          ...existing,
          likes: Math.max(existing.likes || 0, rec.likes || 0),
        });
      } else {
        localRecordsById.set(rec.id, { ...rec });
      }
    }
  });

  const mergedRecords = Array.from(localRecordsById.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const mergedLiked = new Set<string>();
  local.likedRecords.forEach(id => mergedLiked.add(id));
  serverLikedIds.forEach(id => mergedLiked.add(id));

  function getCommentFingerprint(c: Comment): string {
    return `${c.recordId}-${c.employeeId}-${c.timestamp}-${c.content}`;
  }

  const localCommentsById = new Map(local.comments.map(c => [c.id, { ...c }]));
  const localCommentsByFp = new Map<string, string>();
  local.comments.forEach(c => {
    localCommentsByFp.set(getCommentFingerprint(c), c.id);
  });

  serverComments.forEach(c => {
    if (localCommentsById.has(c.id)) return;
    const fp = getCommentFingerprint(c);
    if (localCommentsByFp.has(fp)) return;
    localCommentsById.set(c.id, { ...c });
  });
  const mergedComments = Array.from(localCommentsById.values());

  return {
    employees: mergedEmployees,
    records: mergedRecords,
    likedRecords: mergedLiked,
    comments: mergedComments,
    currentCommenterId: local.currentCommenterId,
    reminderConfig: serverReminderConfig || local.reminderConfig,
  };
}

const initialLocal = getInitialLocalState();

export const useAppStore = create<AppState>((set, get) => ({
  ...initialLocal,
  syncState: syncManager.getState(),
  serverLastModified: null,
  isInitializing: true,
  initError: null,

  addRecord: (employeeId: string, bucketType: BucketType): WaterRecord => {
    const newRecord: WaterRecord = {
      id: generateId(),
      employeeId,
      bucketType,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    set(state => {
      const records = [newRecord, ...state.records];
      const newState: PersistedState = { ...state, records };
      saveToStorage(newState);
      return newState;
    });

    syncManager.enqueue('addRecord', {
      employeeId,
      bucketType,
      timestamp: newRecord.timestamp,
      id: newRecord.id,
    });

    return newRecord;
  },

  addEmployee: (name: string, avatar: string, department: Department): Employee => {
    const newEmployee: Employee = {
      id: generateId(),
      name: name.trim(),
      avatar,
      totalLikes: 0,
      department,
    };

    set(state => {
      const employees = [...state.employees, newEmployee];
      const newState: PersistedState = { ...state, employees };
      saveToStorage(newState);
      return newState;
    });

    syncManager.enqueue('addEmployee', { id: newEmployee.id, name, avatar, department });

    return newEmployee;
  },

  likeRecord: (recordId: string): void => {
    const state = get();
    if (state.likedRecords.has(recordId)) return;

    const employees = state.employees.map(emp => ({ ...emp }));

    const records = state.records.map(r => {
      if (r.id === recordId) {
        const emp = employees.find(e => e.id === r.employeeId);
        if (emp) {
          emp.totalLikes = (emp.totalLikes || 0) + 1;
        }
        return { ...r, likes: r.likes + 1 };
      }
      return r;
    });

    const likedRecords = new Set(state.likedRecords);
    likedRecords.add(recordId);

    const newState: PersistedState = {
      employees,
      records,
      likedRecords,
      comments: state.comments,
      currentCommenterId: state.currentCommenterId,
      reminderConfig: state.reminderConfig,
    };
    saveToStorage(newState);
    set(newState);

    syncManager.enqueue('likeRecord', { id: recordId });
  },

  isRecordLiked: (recordId: string): boolean => {
    return get().likedRecords.has(recordId);
  },

  setCurrentCommenter: (employeeId: string): void => {
    const state = get();
    const newState: PersistedState = { ...state, currentCommenterId: employeeId };
    saveToStorage(newState);
    set({ currentCommenterId: employeeId });
  },

  updateReminderConfig: (config: ReminderConfig): void => {
    const state = get();
    const newState: PersistedState = { ...state, reminderConfig: config };
    saveToStorage(newState);
    set({ reminderConfig: config });
    syncManager.enqueue('updateReminderConfig', config);
  },

  addComment: (recordId: string, employeeId: string, content: string): Comment => {
    const newComment: Comment = {
      id: generateId(),
      recordId,
      employeeId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    set(state => {
      const comments = [...state.comments, newComment];
      const newState: PersistedState = { ...state, comments };
      saveToStorage(newState);
      return newState;
    });

    syncManager.enqueue('addComment', {
      id: newComment.id,
      recordId,
      employeeId,
      content: content.trim(),
      timestamp: newComment.timestamp,
    });

    return newComment;
  },

  getCommentsByRecord: (recordId: string): Comment[] => {
    return get().comments
      .filter(c => c.recordId === recordId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  initialize: async (): Promise<void> => {
    set({ isInitializing: true, initError: null });

    syncManager.subscribe((syncState) => {
      set({ syncState });
    });

    const reachable = await isServerReachable();

    if (!reachable) {
      const cached = syncManager.getCachedServerData();
      if (cached) {
        const state = get();
        const merged = mergeServerIntoLocal(
          state,
          cached.employees,
          cached.records,
          cached.likedRecordIds,
          cached.comments,
          cached.reminderConfig
        );
        saveToStorage(merged);
        set({ ...merged, serverLastModified: cached.lastModified });
      }
      set({
        isInitializing: false,
        initError: '无法连接服务器，使用本地离线数据',
      });
      return;
    }

    try {
      const serverData = await api.getData();
      const state = get();
      const merged = mergeServerIntoLocal(
        state,
        serverData.employees,
        serverData.records,
        serverData.likedRecordIds,
        serverData.comments,
        serverData.reminderConfig
      );
      saveToStorage(merged);
      syncManager.setCachedServerData(serverData);
      set({
        ...merged,
        serverLastModified: serverData.lastModified,
        isInitializing: false,
        initError: null,
      });

      const pendingQueue = syncManager.getQueue();
      if (pendingQueue.length > 0) {
        await syncManager.processQueue();
      }
    } catch (err) {
      const cached = syncManager.getCachedServerData();
      if (cached) {
        const state = get();
        const merged = mergeServerIntoLocal(
          state,
          cached.employees,
          cached.records,
          cached.likedRecordIds,
          cached.comments,
          cached.reminderConfig
        );
        saveToStorage(merged);
        set({ ...merged, serverLastModified: cached.lastModified });
      }
      set({
        isInitializing: false,
        initError: '从服务器加载数据失败，使用本地数据',
      });
    }
  },

  refreshFromServer: async (): Promise<void> => {
    const reachable = await isServerReachable();
    if (!reachable) {
      set({ initError: '服务器不可达，无法刷新' });
      return;
    }

    try {
      const serverData = await api.getData();
      const state = get();
      const merged = mergeServerIntoLocal(
        state,
        serverData.employees,
        serverData.records,
        serverData.likedRecordIds,
        serverData.comments,
        serverData.reminderConfig
      );
      saveToStorage(merged);
      syncManager.setCachedServerData(serverData);
      set({
        ...merged,
        serverLastModified: serverData.lastModified,
        initError: null,
      });
    } catch (err) {
      set({ initError: '刷新失败' });
    }
  },

  manualSync: async (): Promise<void> => {
    const state = get();
    const result = await syncManager.fullSync({
      employees: state.employees,
      records: state.records,
      comments: state.comments,
      likedRecordIds: Array.from(state.likedRecords),
      currentCommenterId: state.currentCommenterId,
      reminderConfig: state.reminderConfig,
    });

    if (result) {
      const localState = get();
      const merged = mergeServerIntoLocal(
        localState,
        result.employees,
        result.records,
        result.likedRecordIds,
        result.comments,
        result.reminderConfig
      );
      saveToStorage(merged);
      set({
        ...merged,
        serverLastModified: result.lastModified,
        initError: null,
      });
    }
  },

  resetSyncError: (): void => {
    set({ initError: null });
  },
}));
