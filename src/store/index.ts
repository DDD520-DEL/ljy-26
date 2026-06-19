import { create } from 'zustand';
import type { Employee, WaterRecord, BucketType } from '@/types';
import { INITIAL_EMPLOYEES, STORAGE_KEY } from '@/constants';
import { generateId, generateMockRecords } from '@/utils';

interface PersistedState {
  employees: Employee[];
  records: WaterRecord[];
}

interface AppState extends PersistedState {
  likedRecords: Set<string>;
  addRecord: (employeeId: string, bucketType: BucketType) => WaterRecord;
  addEmployee: (name: string, avatar: string) => Employee;
  likeRecord: (recordId: string) => void;
  isRecordLiked: (recordId: string) => boolean;
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed.employees && parsed.records) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function getInitialState(): PersistedState {
  const saved = loadFromStorage();
  if (saved) return saved;

  const employees = [...INITIAL_EMPLOYEES];
  const records = generateMockRecords(employees);
  const initial: PersistedState = { employees, records };
  saveToStorage(initial);
  return initial;
}

const initialPersisted = getInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  ...initialPersisted,
  likedRecords: new Set<string>(),

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
      saveToStorage({ employees: state.employees, records });
      return { records };
    });

    return newRecord;
  },

  addEmployee: (name: string, avatar: string): Employee => {
    const newEmployee: Employee = {
      id: generateId(),
      name: name.trim(),
      avatar,
      totalLikes: 0,
    };

    set(state => {
      const employees = [...state.employees, newEmployee];
      saveToStorage({ employees, records: state.records });
      return { employees };
    });

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

    saveToStorage({ employees, records });
    set({ employees, records, likedRecords });
  },

  isRecordLiked: (recordId: string): boolean => {
    return get().likedRecords.has(recordId);
  },
}));
