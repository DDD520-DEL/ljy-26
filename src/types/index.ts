export type Department = 'rd' | 'marketing' | 'admin';

export interface DepartmentConfig {
  id: Department;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  totalLikes: number;
  department: Department;
}

export type BucketType = '5G' | '3G' | 'MINI';

export interface WaterRecord {
  id: string;
  employeeId: string;
  bucketType: BucketType;
  timestamp: string;
  likes: number;
}

export interface BucketConfig {
  type: BucketType;
  label: string;
  liters: string;
  icon: string;
}

export type BadgeLevel = 'rookie' | 'bronze' | 'silver' | 'gold' | 'king';

export interface BadgeConfig {
  level: BadgeLevel;
  name: string;
  icon: string;
  minRecords: number;
  color: string;
  bgColor: string;
}

export interface Comment {
  id: string;
  recordId: string;
  employeeId: string;
  content: string;
  timestamp: string;
}

export interface RankingEntry {
  employee: Employee;
  records: number;
  likes: number;
  badge: BadgeConfig;
}
