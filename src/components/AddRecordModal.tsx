import { useState } from 'react';
import { X, Plus, Check, Sparkles } from 'lucide-react';
import type { BucketType } from '@/types';
import { BUCKET_TYPES, AVATAR_OPTIONS, ENCOURAGE_MESSAGES } from '@/constants';
import { useAppStore } from '@/store';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddRecordModal({ isOpen, onClose }: AddRecordModalProps) {
  const { employees, addRecord, addEmployee } = useAppStore();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedBucket, setSelectedBucket] = useState<BucketType>('5G');
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATAR_OPTIONS[0]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = () => {
    if (!selectedEmployee && !showNewEmployee) return;
    if (showNewEmployee && !newName.trim()) return;

    let empId = selectedEmployee;
    if (showNewEmployee && newName.trim()) {
      const newEmp = addEmployee(newName.trim(), newAvatar);
      empId = newEmp.id;
    }

    if (!empId) return;

    addRecord(empId, selectedBucket);

    const emp = employees.find(e => e.id === empId);
    const msg = ENCOURAGE_MESSAGES[Math.floor(Math.random() * ENCOURAGE_MESSAGES.length)];
    setSuccessMessage(`${emp?.name || newName}，${msg}`);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      handleClose();
    }, 1800);
  };

  const handleClose = () => {
    setSelectedEmployee('');
    setSelectedBucket('5G');
    setShowNewEmployee(false);
    setNewName('');
    setNewAvatar(AVATAR_OPTIONS[0]);
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up"
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
            <h3 className="font-display text-2xl gradient-text mb-3">换水成功！</h3>
            <p className="text-slate-600 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              {successMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-lg animate-bounce-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white">
            <div className="bg-water-gradient p-6 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl">记录换水 🪣</h2>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white/80 text-sm mt-1">为自己的好人好事记一笔！</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {!showNewEmployee ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-700">是谁换的水？</label>
                    <button
                      onClick={() => setShowNewEmployee(true)}
                      className="text-xs text-water-600 hover:text-water-700 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      新员工
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
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
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-700">添加新员工</label>
                    <button
                      onClick={() => setShowNewEmployee(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                    >
                      返回选择
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1.5 block">姓名</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="请输入姓名"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-water-400 focus:outline-none transition-colors text-sm"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1.5 block">选择头像</label>
                      <div className="grid grid-cols-8 gap-1.5">
                        {AVATAR_OPTIONS.map(avatar => (
                          <button
                            key={avatar}
                            onClick={() => setNewAvatar(avatar)}
                            className={`w-10 h-10 rounded-xl text-xl transition-all ${
                              newAvatar === avatar
                                ? 'bg-water-100 ring-2 ring-water-500 scale-110'
                                : 'bg-slate-50 hover:bg-water-50'
                            }`}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 block">桶的型号</label>
                <div className="grid grid-cols-3 gap-2">
                  {BUCKET_TYPES.map(bucket => (
                    <button
                      key={bucket.type}
                      onClick={() => setSelectedBucket(bucket.type)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                        selectedBucket === bucket.type
                          ? 'border-water-500 bg-water-50 scale-105 shadow-md'
                          : 'border-slate-100 hover:border-water-200 hover:bg-water-50/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{bucket.icon}</div>
                      <div className="text-sm font-semibold text-slate-700">{bucket.label}</div>
                      <div className="text-xs text-slate-400">{bucket.liters}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedEmployee && (!showNewEmployee || !newName.trim())}
                className="w-full py-4 bg-water-gradient text-white font-display text-lg rounded-2xl shadow-water hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 btn-ripple"
              >
                <Check className="w-5 h-5" />
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
