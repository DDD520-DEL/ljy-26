import { useState } from 'react';
import { X, Droplets, Check, Sparkles, Clock } from 'lucide-react';
import type { BucketType } from '@/types';
import { BUCKET_TYPES, ENCOURAGE_MESSAGES } from '@/constants';
import { useAppStore } from '@/store';

interface WaterReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function WaterReminderModal({
  isOpen,
  onClose,
  title = '换水提醒',
  message = '饮水机水位如何？需要换水的话，快来打卡吧！',
}: WaterReminderModalProps) {
  const { employees, addRecord, currentCommenterId } = useAppStore();
  const [selectedEmployee, setSelectedEmployee] = useState<string>(currentCommenterId || '');
  const [selectedBucket, setSelectedBucket] = useState<BucketType>('5G');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCheckIn = () => {
    if (!selectedEmployee) return;

    addRecord(selectedEmployee, selectedBucket);

    const emp = employees.find(e => e.id === selectedEmployee);
    const msg = ENCOURAGE_MESSAGES[Math.floor(Math.random() * ENCOURAGE_MESSAGES.length)];
    setSuccessMessage(`${emp?.name || '你'}，${msg}`);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setSelectedEmployee(currentCommenterId || '');
    setSelectedBucket('5G');
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in-up"
        onClick={!showSuccess ? handleClose : undefined}
      />

      {showSuccess ? (
        <div className="relative z-10 animate-bounce-in">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center max-w-md w-full">
            <div className="text-7xl mb-4 animate-float">🪣</div>
            <div className="flex justify-center gap-1 mb-4">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-water-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <h3 className="font-display text-2xl gradient-text mb-3">打卡成功！</h3>
            <p className="text-slate-600 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              {successMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-lg animate-bounce-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl">{title}</h2>
                      <p className="text-white/80 text-sm">每日定时提醒</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <Droplets className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-white/90">{message}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 block">我是换水英雄 🏆</label>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp.id)}
                      className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                        selectedEmployee === emp.id
                          ? 'border-water-500 bg-water-50 scale-105 shadow-md'
                          : 'border-slate-100 hover:border-water-200 hover:bg-water-50/50'
                      }`}
                    >
                      <div className="text-3xl mb-1">{emp.avatar}</div>
                      <div className="text-xs text-slate-600 truncate font-medium">{emp.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 block">桶的型号</label>
                <div className="grid grid-cols-3 gap-2">
                  {BUCKET_TYPES.map(bucket => (
                    <button
                      key={bucket.type}
                      onClick={() => setSelectedBucket(bucket.type)}
                      className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                        selectedBucket === bucket.type
                          ? 'border-water-500 bg-water-50 scale-105 shadow-md'
                          : 'border-slate-100 hover:border-water-200 hover:bg-water-50/50'
                      }`}
                    >
                      <div className="text-3xl mb-1">{bucket.icon}</div>
                      <div className="text-sm font-semibold text-slate-700">{bucket.label}</div>
                      <div className="text-xs text-slate-400">{bucket.liters}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  稍后再说
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={!selectedEmployee}
                  className="flex-1 py-3.5 bg-water-gradient text-white font-display rounded-2xl shadow-water hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  快速打卡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
