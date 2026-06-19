import type { Employee, BucketConfig, BadgeConfig } from '@/types';

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: '张伟', avatar: '👨‍💼', totalLikes: 0 },
  { id: '2', name: '李娜', avatar: '👩‍💼', totalLikes: 0 },
  { id: '3', name: '王强', avatar: '👨‍🔧', totalLikes: 0 },
  { id: '4', name: '刘芳', avatar: '👩‍🎨', totalLikes: 0 },
  { id: '5', name: '陈明', avatar: '👨‍💻', totalLikes: 0 },
  { id: '6', name: '赵丽', avatar: '👩‍🔬', totalLikes: 0 },
  { id: '7', name: '孙磊', avatar: '👨‍🎨', totalLikes: 0 },
  { id: '8', name: '周雪', avatar: '👩‍🏫', totalLikes: 0 },
];

export const BUCKET_TYPES: BucketConfig[] = [
  { type: '5G', label: '5加仑', liters: '18.9L', icon: '🪣' },
  { type: '3G', label: '3加仑', liters: '11.3L', icon: '🫗' },
  { type: 'MINI', label: '迷你桶', liters: '5L', icon: '🥤' },
];

export const BADGE_LEVELS: BadgeConfig[] = [
  { level: 'rookie', name: '换水新手', icon: '💧', minRecords: 1, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { level: 'bronze', name: '青铜水手', icon: '🥉', minRecords: 5, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { level: 'silver', name: '白银水侠', icon: '🥈', minRecords: 15, color: 'text-slate-500', bgColor: 'bg-slate-200' },
  { level: 'gold', name: '黄金水神', icon: '🥇', minRecords: 30, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { level: 'king', name: '王者水帝', icon: '👑', minRecords: 60, color: 'text-purple-600', bgColor: 'bg-purple-100' },
];

export const AVATAR_OPTIONS = [
  '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🎨', '👨‍💻', '👩‍🔬', '👨‍🎨', '👩‍🏫',
  '👨‍🚀', '👩‍🚀', '🧑‍💻', '🧑‍🎤', '👨‍🍳', '👩‍🍳', '🧑‍🔬', '🧑‍🏭',
];

export const STORAGE_KEY = 'water-hero-data-v1';

export const ENCOURAGE_MESSAGES = [
  '每一滴水都是爱的传递！',
  '默默付出，润物无声～',
  '你是办公室的清泉！',
  '为大家的饮水保驾护航！',
  '小小一桶水，暖暖同事情❤️',
  '换水英雄，实至名归！',
  '这份心意，大家都记得！',
  '滴水之恩，当以赞相报！',
];
