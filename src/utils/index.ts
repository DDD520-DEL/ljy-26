import type { WaterRecord, Employee, RankingEntry, BadgeConfig, Department, DepartmentConfig, Comment } from '@/types';
import { BADGE_LEVELS, DEPARTMENTS, ENCOURAGE_MESSAGES } from '@/constants';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatFullTime(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month + 1}月`;
}

export function getMonthRangeList(records: WaterRecord[]): Array<{ year: number; month: number; label: string }> {
  const months = new Set<string>();
  const now = new Date();
  months.add(`${now.getFullYear()}-${now.getMonth()}`);

  records.forEach(r => {
    const d = new Date(r.timestamp);
    months.add(`${d.getFullYear()}-${d.getMonth()}`);
  });

  const result = Array.from(months)
    .map(s => {
      const [y, m] = s.split('-').map(Number);
      return { year: y, month: m, label: formatMonthLabel(y, m) };
    })
    .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));

  return result;
}

export function getMonthlyRanking(
  records: WaterRecord[],
  employees: Employee[],
  year: number,
  month: number
): RankingEntry[] {
  const filtered = records.filter(r => {
    const d = new Date(r.timestamp);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const map = new Map<string, { records: number; likes: number }>();

  filtered.forEach(r => {
    const existing = map.get(r.employeeId) || { records: 0, likes: 0 };
    map.set(r.employeeId, {
      records: existing.records + 1,
      likes: existing.likes + r.likes,
    });
  });

  const ranking: RankingEntry[] = [];
  map.forEach((data, empId) => {
    const employee = employees.find(e => e.id === empId);
    if (employee) {
      ranking.push({
        employee,
        records: data.records,
        likes: data.likes,
        badge: getEmployeeBadge(data.records),
      });
    }
  });

  ranking.sort((a, b) => {
    if (b.records !== a.records) return b.records - a.records;
    return b.likes - a.likes;
  });

  return ranking;
}

export function getEmployeeTotalRecords(employeeId: string, records: WaterRecord[]): number {
  return records.filter(r => r.employeeId === employeeId).length;
}

export function getEmployeeTotalLikes(employeeId: string, records: WaterRecord[]): number {
  return records
    .filter(r => r.employeeId === employeeId)
    .reduce((sum, r) => sum + r.likes, 0);
}

export function getEmployeeBadge(totalRecords: number): BadgeConfig {
  let badge = BADGE_LEVELS[0];
  for (const b of BADGE_LEVELS) {
    if (totalRecords >= b.minRecords) {
      badge = b;
    } else {
      break;
    }
  }
  return badge;
}

export function getNextBadgeProgress(totalRecords: number): { current: BadgeConfig; next: BadgeConfig | null; progress: number } {
  const current = getEmployeeBadge(totalRecords);
  const currentIndex = BADGE_LEVELS.findIndex(b => b.level === current.level);
  const next = currentIndex < BADGE_LEVELS.length - 1 ? BADGE_LEVELS[currentIndex + 1] : null;

  if (!next) {
    return { current, next: null, progress: 100 };
  }

  const progressRange = next.minRecords - current.minRecords;
  const currentProgress = totalRecords - current.minRecords;
  const progress = Math.min(100, Math.round((currentProgress / progressRange) * 100));

  return { current, next, progress };
}

export function getAvailableMonths(): Array<{ year: number; month: number; label: string }> {
  const result: Array<{ year: number; month: number; label: string }> = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: formatMonthLabel(d.getFullYear(), d.getMonth()),
    });
  }
  return result;
}

export function generateMockRecords(employees: Employee[]): WaterRecord[] {
  const records: WaterRecord[] = [];
  const bucketTypes: Array<'5G' | '3G' | 'MINI'> = ['5G', '5G', '5G', '3G', 'MINI'];
  const now = Date.now();

  for (let i = 0; i < 25; i++) {
    const emp = employees[Math.floor(Math.random() * employees.length)];
    const daysAgo = Math.floor(Math.random() * 60);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000).toISOString();

    records.push({
      id: generateId(),
      employeeId: emp.id,
      bucketType: bucketTypes[Math.floor(Math.random() * bucketTypes.length)],
      timestamp,
      likes: Math.floor(Math.random() * 8),
    });
  }

  records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return records;
}

export interface DepartmentStats {
  department: DepartmentConfig;
  totalRecords: number;
  totalLiters: number;
  totalLikes: number;
  employeeCount: number;
}

export function getDepartmentStats(
  employees: Employee[],
  records: WaterRecord[]
): DepartmentStats[] {
  return DEPARTMENTS.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept.id);
    const deptEmployeeIds = new Set(deptEmployees.map(e => e.id));
    const deptRecords = records.filter(r => deptEmployeeIds.has(r.employeeId));

    const totalLiters = deptRecords.reduce((sum, r) => {
      const liters = r.bucketType === '5G' ? 18.9 : r.bucketType === '3G' ? 11.3 : 5;
      return sum + liters;
    }, 0);

    const totalLikes = deptRecords.reduce((sum, r) => sum + r.likes, 0);

    return {
      department: dept,
      totalRecords: deptRecords.length,
      totalLiters: Math.round(totalLiters * 10) / 10,
      totalLikes,
      employeeCount: deptEmployees.length,
    };
  }).sort((a, b) => b.totalRecords - a.totalRecords);
}

export function getDepartmentFilteredRanking(
  records: WaterRecord[],
  employees: Employee[],
  year: number,
  month: number,
  department?: Department
): RankingEntry[] {
  const filtered = records.filter(r => {
    const d = new Date(r.timestamp);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const deptEmployees = department
    ? employees.filter(e => e.department === department)
    : employees;
  const deptEmployeeIds = new Set(deptEmployees.map(e => e.id));

  const map = new Map<string, { records: number; likes: number }>();

  filtered.forEach(r => {
    if (!deptEmployeeIds.has(r.employeeId)) return;
    const existing = map.get(r.employeeId) || { records: 0, likes: 0 };
    map.set(r.employeeId, {
      records: existing.records + 1,
      likes: existing.likes + r.likes,
    });
  });

  const ranking: RankingEntry[] = [];
  map.forEach((data, empId) => {
    const employee = employees.find(e => e.id === empId);
    if (employee) {
      ranking.push({
        employee,
        records: data.records,
        likes: data.likes,
        badge: getEmployeeBadge(data.records),
      });
    }
  });

  ranking.sort((a, b) => {
    if (b.records !== a.records) return b.records - a.records;
    return b.likes - a.likes;
  });

  return ranking;
}

export function getEmployeeTotalComments(employeeId: string, records: WaterRecord[], comments: Comment[]): number {
  const employeeRecordIds = new Set(records.filter(r => r.employeeId === employeeId).map(r => r.id));
  return comments.filter(c => employeeRecordIds.has(c.recordId)).length;
}

export function getRecordCommentsCount(recordId: string, comments: Comment[]): number {
  return comments.filter(c => c.recordId === recordId).length;
}

export function generateMockComments(employees: Employee[], records: WaterRecord[]): Comment[] {
  const comments: Comment[] = [];
  const now = Date.now();

  records.slice(0, 12).forEach(record => {
    const commentCount = Math.floor(Math.random() * 4);
    for (let i = 0; i < commentCount; i++) {
      const commenter = employees[Math.floor(Math.random() * employees.length)];
      if (commenter.id === record.employeeId && Math.random() > 0.3) continue;
      const recordTime = new Date(record.timestamp).getTime();
      const hoursAfter = Math.floor(Math.random() * 48);
      const timestamp = new Date(recordTime + hoursAfter * 3600000).toISOString();
      if (new Date(timestamp).getTime() > now) continue;

      comments.push({
        id: generateId(),
        recordId: record.id,
        employeeId: commenter.id,
        content: ENCOURAGE_MESSAGES[Math.floor(Math.random() * ENCOURAGE_MESSAGES.length)],
        timestamp,
      });
    }
  });

  return comments;
}
