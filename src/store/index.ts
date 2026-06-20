import { create } from 'zustand';
import type { Employee, WaterRecord, BucketType, Department, Comment } from '@/types';
import { INITIAL_EMPLOYEES, STORAGE_KEY } from '@/constants';
import { generateId, generateMockRecords, generateMockComments } from '@/utils';
import { syncManager, type SyncState } from '@/api/syncManager';
import { api, isServerReachable } from '@/api';

interface PersistedStateRaw {
  employees: Employee[];
  records: WaterRecord[];
  likedRecordIds: string[];
  comments: Comment[];
  currentCommenterId: string | null;
}

interface PersistedState {
  employees: Employee[];
  records: WaterRecord[];
  likedRecords: Set<string>;
  comments: Comment[];
  currentCommenterId: string | null;
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
  };
}

function deserializeState(raw: PersistedStateRaw): PersistedState {
  return {
    employees: raw.employees,
    records: raw.records,
    likedRecords: new Set(raw.likedRecordIds || []),
    comments: raw.comments || [],
    currentCommenterId: raw.currentCommenterId || null,
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

function getInitialLocalState(): PersistedState {
  const saved = loadFromStorage();
  if (saved) return saved;

  const employees = [...INITIAL_EMPLOYEES];
  const records = generateMockRecords(employees);
  const comments = generateMockComments(employees, records);
  const initial: PersistedState = {
    employees,
    records,
    likedRecords: new Set<string>(),
    comments,
    currentCommenterId: employees[0]?.id || null,
  };
  saveToStorage(initial);
  return initial;
}

function mergeServerIntoLocal(
  local: PersistedState,
  serverEmployees: Employee[],
  serverRecords: WaterRecord[],
  serverLikedIds: string[],
  serverComments: Comment[]
): PersistedState {
  const localEmpIds = new Set(local.employees.map(e => e.id));
  const mergedEmployees = [...local.employees];
  serverEmployees.forEach(emp => {
    if (!localEmpIds.has(emp.id)) {
      mergedEmployees.push(emp);
    } else {
      const idx = mergedEmployees.findIndex(e => e.id === emp.id);
      if (idx !== -1) {
        mergedEmployees[idx] = { ...mergedEmployees[idx], ...emp, totalLikes: Math.max(mergedEmployees[idx].totalLikes || 0, emp.totalLikes || 0) };
      }
    }
  });

  const localRecIds = new Set(local.records.map(r => r.id));
  const mergedRecords = [...local.records];
  serverRecords.forEach(rec => {
    if (!localRecIds.has(rec.id)) {
      mergedRecords.push(rec);
    }
  });
  mergedRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const mergedLiked = new Set(local.likedRecords);
  serverLikedIds.forEach(id => mergedLiked.add(id));

  const localCommentIds = new Set(local.comments.map(c => c.id));
  const mergedComments = [...local.comments];
  serverComments.forEach(c => {
    if (!localCommentIds.has(c.id)) {
      mergedComments.push(c);
    }
  });

  return {
    employees: mergedEmployees,
    records: mergedRecords,
    likedRecords: mergedLiked,
    comments: mergedComments,
    currentCommenterId: local.currentCommenterId,
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

    syncManager.enqueue('addEmployee', { name, avatar, department });

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
      recordId,
      employeeId,
      content: content.trim(),
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
          cached.comments
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
        serverData.comments
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
          cached.comments
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
        serverData.comments
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
    });

    if (result) {
      const localState = get();
      const merged = mergeServerIntoLocal(
        localState,
        result.employees,
        result.records,
        result.likedRecordIds,
        result.comments
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
