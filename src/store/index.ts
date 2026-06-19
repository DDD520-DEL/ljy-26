import { create } from 'zustand';
import type { Employee, WaterRecord, BucketType, Department, Comment } from '@/types';
import { INITIAL_EMPLOYEES, STORAGE_KEY } from '@/constants';
import { generateId, generateMockRecords, generateMockComments } from '@/utils';

interface PersistedStateRaw {
  employees: Employee[];
  records: WaterRecord[];
  likedRecordIds: string[];
  comments: Comment[];
}

interface PersistedState {
  employees: Employee[];
  records: WaterRecord[];
  likedRecords: Set<string>;
  comments: Comment[];
}

interface AppState extends PersistedState {
  addRecord: (employeeId: string, bucketType: BucketType) => WaterRecord;
  addEmployee: (name: string, avatar: string, department: Department) => Employee;
  likeRecord: (recordId: string) => void;
  isRecordLiked: (recordId: string) => boolean;
  addComment: (recordId: string, employeeId: string, content: string) => Comment;
  getCommentsByRecord: (recordId: string) => Comment[];
}

function serializeState(state: PersistedState): PersistedStateRaw {
  return {
    employees: state.employees,
    records: state.records,
    likedRecordIds: Array.from(state.likedRecords),
    comments: state.comments,
  };
}

function deserializeState(raw: PersistedStateRaw): PersistedState {
  return {
    employees: raw.employees,
    records: raw.records,
    likedRecords: new Set(raw.likedRecordIds || []),
    comments: raw.comments || [],
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
    // ignore
  }
  return null;
}

function saveToStorage(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(state)));
  } catch {
    // ignore
  }
}

function getInitialState(): PersistedState {
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
  };
  saveToStorage(initial);
  return initial;
}

const initialPersisted = getInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  ...initialPersisted,

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
      const newState = { ...state, records };
      saveToStorage(newState);
      return { records };
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
      const newState = { ...state, employees };
      saveToStorage(newState);
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

    const newState = { employees, records, likedRecords, comments: state.comments };
    saveToStorage(newState);
    set(newState);
  },

  isRecordLiked: (recordId: string): boolean => {
    return get().likedRecords.has(recordId);
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
      const newState = { ...state, comments };
      saveToStorage(newState);
      return { comments };
    });

    return newComment;
  },

  getCommentsByRecord: (recordId: string): Comment[] => {
    return get().comments
      .filter(c => c.recordId === recordId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
}));
