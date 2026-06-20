import type { Employee, BucketConfig, BadgeConfig, DepartmentConfig, ReminderConfig } from '@/types';

export const DEPARTMENTS: DepartmentConfig[] = [
  { id: 'rd', name: '研发部', icon: '💻', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'marketing', name: '市场部', icon: '📢', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'admin', name: '行政部', icon: '📋', color: 'text-green-600', bgColor: 'bg-green-100' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: '张伟', avatar: '👨‍💼', totalLikes: 0, department: 'rd' },
  { id: '2', name: '李娜', avatar: '👩‍💼', totalLikes: 0, department: 'rd' },
  { id: '3', name: '王强', avatar: '👨‍🔧', totalLikes: 0, department: 'rd' },
  { id: '4', name: '刘芳', avatar: '👩‍🎨', totalLikes: 0, department: 'marketing' },
  { id: '5', name: '陈明', avatar: '👨‍💻', totalLikes: 0, department: 'marketing' },
  { id: '6', name: '赵丽', avatar: '👩‍🔬', totalLikes: 0, department: 'marketing' },
  { id: '7', name: '孙磊', avatar: '👨‍🎨', totalLikes: 0, department: 'admin' },
  { id: '8', name: '周雪', avatar: '👩‍🏫', totalLikes: 0, department: 'admin' },
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

export const STORAGE_KEY = 'water-hero-data-v2';
export const THEME_STORAGE_KEY = 'water-hero-theme';

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

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: true,
  time: '15:00',
  title: '换水提醒',
  message: '饮水机水位如何？需要换水的话，快来打卡吧！',
};

export const MESSAGE_CATEGORIES = [
  { id: 'encourage' as const, label: '加油鼓励', icon: '💪', color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'complaint' as const, label: '吐槽抱怨', icon: '😤', color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { id: 'other' as const, label: '其他', icon: '💬', color: 'text-slate-600', bgColor: 'bg-slate-100' },
];

export const ANONYMOUS_ENCOURAGE_TEMPLATES = [
  '感谢今天换水的同事，辛苦了！',
  '今天又喝到了凉凉的水，太感谢了！',
  '给换水的英雄点赞👍',
  '默默换水的同事最帅/最美！',
  '下次让我来！感谢你的付出',
  '水甜甜的，心暖暖的❤️',
];

export const ANONYMOUS_COMPLAINT_TEMPLATES = [
  '桶装水空了三天了，没人看到吗？',
  '每次都是我换水，其他人看不到吗？',
  '饮水机没水了，有人管管吗？',
  '能不能喝完水就换一桶啊！',
  '真的很无奈，永远都是那几个人在换',
];

export const ANONYMOUS_OTHER_TEMPLATES = [
  '饮水机该清洁一下了',
  '建议买个饮水机支架，换水更方便',
  '有没有人想一起团购桶装水？',
  '建议在饮水机旁贴个换水记录表',
];
