import type { Employee, WaterRecord, Comment, BucketType, Department, ReminderConfig, MonthlyDailyStats, MonthlySummary, MonthlyHeatRanking, AllTimeHeatRanking } from '@/types';

const isDev = import.meta.env.DEV;
export const API_BASE_URL = isDev ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3002');

export interface ServerData {
  employees: Employee[];
  records: WaterRecord[];
  likedRecordIds: string[];
  comments: Comment[];
  currentCommenterId: string | null;
  reminderConfig: ReminderConfig;
  lastModified: number;
}

export interface SyncRequest {
  employees?: Employee[];
  records?: WaterRecord[];
  comments?: Comment[];
  likedRecordIds?: string[];
  currentCommenterId?: string | null;
  reminderConfig?: ReminderConfig;
  clientLastModified?: number;
}

export interface SyncResponse {
  success: boolean;
  conflicts: string[];
  mergedEmployees: Employee[];
  mergedRecords: WaterRecord[];
  mergedComments: Comment[];
  mergedLikedRecordIds: string[];
  currentCommenterId: string | null;
  mergedReminderConfig: ReminderConfig;
  lastModified: number;
}

let requestCount = 0;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const id = ++requestCount;
  let attempt = 0;

  while (attempt <= retries) {
    attempt++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
      }

      return await response.json() as T;
    } catch (err: unknown) {
      const error = err as Error;
      const isLastAttempt = attempt > retries;
      const isAbort = error.name === 'AbortError';

      if (isLastAttempt) {
        throw error;
      }

      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
      await delay(waitTime + Math.random() * 500);
    }
  }

  throw new Error('请求失败');
}

export const api = {
  async health(): Promise<{ status: string; timestamp: number }> {
    return request<{ status: string; timestamp: number }>('/api/health', { method: 'GET' }, 1);
  },

  async getData(): Promise<ServerData> {
    return request<ServerData>('/api/data');
  },

  async getEmployees(): Promise<Employee[]> {
    return request<Employee[]>('/api/employees');
  },

  async addEmployee(data: { id?: string; name: string; avatar: string; department: Department }): Promise<Employee> {
    return request<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    return request<Employee>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getRecords(): Promise<WaterRecord[]> {
    return request<WaterRecord[]>('/api/records');
  },

  async addRecord(data: { id?: string; employeeId: string; bucketType: BucketType; timestamp?: string; likes?: number }): Promise<WaterRecord> {
    return request<WaterRecord>('/api/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addRecordsBatch(records: Array<{ employeeId: string; bucketType: BucketType; timestamp?: string; id?: string; likes?: number }>): Promise<{ created: WaterRecord[]; errors: string[] }> {
    return request<{ created: WaterRecord[]; errors: string[] }>('/api/records/batch', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  },

  async likeRecord(id: string): Promise<{ record: WaterRecord; liked: boolean }> {
    return request<{ record: WaterRecord; liked: boolean }>(`/api/records/${id}/like`, {
      method: 'POST',
    });
  },

  async getComments(): Promise<Comment[]> {
    return request<Comment[]>('/api/comments');
  },

  async addComment(data: { id?: string; recordId: string; employeeId: string; content: string; timestamp?: string }): Promise<Comment> {
    return request<Comment>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async sync(data: SyncRequest): Promise<SyncResponse> {
    return request<SyncResponse>('/api/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 3);
  },

  async getReminderConfig(): Promise<ReminderConfig> {
    return request<ReminderConfig>('/api/reminder-config', { method: 'GET' }, 1);
  },

  async updateReminderConfig(config: ReminderConfig): Promise<ReminderConfig> {
    return request<ReminderConfig>('/api/reminder-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }, 1);
  },

  async getMonthlyDailyStats(year: number, month: number): Promise<MonthlyDailyStats> {
    return request<MonthlyDailyStats>(`/api/stats/monthly-daily?year=${year}&month=${month}`, {
      method: 'GET',
    }, 1);
  },

  async getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
    return request<MonthlySummary>(`/api/stats/monthly-summary?year=${year}&month=${month}`, {
      method: 'GET',
    }, 1);
  },

  async getMonthlyHeatRanking(year: number, month: number): Promise<MonthlyHeatRanking> {
    return request<MonthlyHeatRanking>(`/api/stats/monthly-heat-ranking?year=${year}&month=${month}`, {
      method: 'GET',
    }, 1);
  },

  async getAllTimeHeatRanking(): Promise<AllTimeHeatRanking> {
    return request<AllTimeHeatRanking>('/api/stats/all-time-heat-ranking', {
      method: 'GET',
    }, 1);
  },
};

export async function isServerReachable(): Promise<boolean> {
  try {
    await api.health();
    return true;
  } catch {
    return false;
  }
}
