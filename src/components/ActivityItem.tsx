import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { WaterRecord, Employee } from '@/types';
import { BUCKET_TYPES } from '@/constants';
import { useAppStore } from '@/store';
import { formatTimeAgo } from '@/utils';

interface ActivityItemProps {
  record: WaterRecord;
  employee: Employee | undefined;
  index: number;
}

export default function ActivityItem({ record, employee, index }: ActivityItemProps) {
  const { likeRecord, isRecordLiked } = useAppStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const liked = isRecordLiked(record.id);
  const bucket = BUCKET_TYPES.find(b => b.type === record.bucketType);

  const handleLike = () => {
    if (liked) return;
    setIsAnimating(true);
    likeRecord(record.id);
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <div
      className="relative animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-water-200 via-water-100 to-transparent md:-translate-x-px" />

      <div className="absolute left-0 md:left-1/2 top-5 -translate-x-1/2 z-10">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-md border-2 border-water-200 flex items-center justify-center text-lg md:text-xl">
          💧
        </div>
      </div>

      <div className="ml-12 md:ml-0 md:w-[calc(50%-2rem)] md:odd:ml-auto md:even:mr-auto md:odd:pl-8 md:even:pr-8">
        <div className="bg-white rounded-2xl shadow-card card-hover p-4 md:p-5 border border-water-50/50">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-water-50 flex items-center justify-center text-2xl md:text-3xl shrink-0">
                {employee?.avatar || '👤'}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 truncate">
                  {employee?.name || '未知用户'}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <span>🕐</span>
                  <span>{formatTimeAgo(record.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-2 bg-water-50 rounded-xl">
              <span className="text-2xl">{bucket?.icon}</span>
              <div>
                <div className="text-sm font-medium text-slate-700">{bucket?.label}</div>
                <div className="text-xs text-slate-400">{bucket?.liters}</div>
              </div>
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                liked
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500'
              } ${isAnimating ? 'animate-like-pop' : ''}`}
            >
              <Heart
                className={`w-4 h-4 md:w-5 md:h-5 transition-all ${
                  liked ? 'fill-rose-500 stroke-rose-500' : ''
                }`}
              />
              <span className={`text-sm font-semibold min-w-[1.5rem] text-center ${
                isAnimating ? 'animate-count-up' : ''
              }`}>
                {record.likes}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
