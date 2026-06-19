import { useState, useMemo } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';
import type { WaterRecord, Employee, Comment } from '@/types';
import { BUCKET_TYPES, INITIAL_EMPLOYEES } from '@/constants';
import { useAppStore } from '@/store';
import { formatTimeAgo } from '@/utils';

interface ActivityItemProps {
  record: WaterRecord;
  employee: Employee | undefined;
  index: number;
}

export default function ActivityItem({ record, employee, index }: ActivityItemProps) {
  const { likeRecord, addComment, comments, employees } = useAppStore();
  const likedRecords = useAppStore(state => state.likedRecords);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const liked = likedRecords.has(record.id);
  const bucket = BUCKET_TYPES.find(b => b.type === record.bucketType);

  const recordComments = useMemo(() => {
    return comments
      .filter(c => c.recordId === record.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [comments, record.id]);

  const handleLike = () => {
    if (liked) return;
    setIsAnimating(true);
    likeRecord(record.id);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleAddComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)] || INITIAL_EMPLOYEES[0];
    addComment(record.id, randomEmployee.id, trimmed);
    setCommentText('');
    setShowComments(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const getCommentEmployee = (employeeId: string): Employee | undefined => {
    return employees.find(e => e.id === employeeId) || INITIAL_EMPLOYEES.find(e => e.id === employeeId);
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
        <div className="bg-white rounded-2xl shadow-card card-hover p-4 md:p-5 border border-water-50/50 relative">
          {recordComments.length > 0 && (
            <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-md animate-bounce-in">
              <MessageCircle className="w-3 h-3" />
              <span>{recordComments.length}</span>
            </div>
          )}

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

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-water-50 rounded-xl">
              <span className="text-2xl">{bucket?.icon}</span>
              <div>
                <div className="text-sm font-medium text-slate-700">{bucket?.label}</div>
                <div className="text-xs text-slate-400">{bucket?.liters}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                  recordComments.length > 0
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <MessageCircle className={`w-4 h-4 md:w-5 md:h-5 ${recordComments.length > 0 ? 'fill-amber-200' : ''}`} />
                <span className="text-sm font-semibold min-w-[1.5rem] text-center">
                  {recordComments.length}
                </span>
              </button>

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

          {showComments && (
            <div className="border-t border-slate-100 pt-3 mt-1 space-y-3 animate-bounce-in">
              {recordComments.length > 0 && (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {recordComments.map((comment: Comment) => {
                    const commentEmp = getCommentEmployee(comment.employeeId);
                    return (
                      <div key={comment.id} className="flex gap-2.5">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-base md:text-lg shrink-0 border border-purple-100">
                          {commentEmp?.avatar || '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-slate-700">
                              {commentEmp?.name || '匿名用户'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatTimeAgo(comment.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl px-3 py-2 leading-relaxed">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-water-50 flex items-center justify-center text-base md:text-lg shrink-0">
                  💬
                </div>
                <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-water-300 transition-all">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="为换水英雄加油打气..."
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none min-w-0"
                    maxLength={100}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className={`p-1.5 rounded-lg transition-all ${
                      commentText.trim()
                        ? 'bg-water-500 text-white hover:bg-water-600 active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
