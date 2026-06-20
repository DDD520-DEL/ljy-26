import { useState } from 'react';
import { Bell, BellOff, Clock, Save, X, Check, Settings } from 'lucide-react';
import { useAppStore } from '@/store';
import type { ReminderConfig } from '@/types';

interface ReminderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderSettings({ isOpen, onClose }: ReminderSettingsProps) {
  const { reminderConfig, updateReminderConfig } = useAppStore();
  const [formData, setFormData] = useState<ReminderConfig>(reminderConfig);
  const [saved, setSaved] = useState(false);

  const handleToggle = () => {
    setFormData(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, time: e.target.value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, message: e.target.value }));
  };

  const handleSave = () => {
    updateReminderConfig(formData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setFormData(reminderConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-md animate-bounce-in">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white">
          <div className="bg-water-gradient p-6 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl">提醒设置</h2>
                    <p className="text-white/80 text-sm">配置每日换水提醒</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.enabled ? 'bg-green-100' : 'bg-slate-200'}`}>
                  {formData.enabled ? (
                    <Bell className="w-5 h-5 text-green-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">启用提醒</div>
                  <div className="text-xs text-slate-500">每天定时弹出换水提醒</div>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${formData.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.enabled ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>

            <div className={`space-y-3 transition-opacity duration-300 ${formData.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  提醒时间
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={handleTimeChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-water-400 focus:outline-none transition-colors text-lg font-medium"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  提醒标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="换水提醒"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-water-400 focus:outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  提醒内容
                </label>
                <textarea
                  value={formData.message}
                  onChange={handleMessageChange}
                  placeholder="饮水机水位如何？需要换水的话，快来打卡吧！"
                  maxLength={100}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-water-400 focus:outline-none transition-colors text-sm resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saved}
              className="w-full py-3.5 bg-water-gradient text-white font-display rounded-2xl shadow-water hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  保存设置
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
