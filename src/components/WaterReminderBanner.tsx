import { X, Droplets, ArrowRight } from 'lucide-react';

interface WaterReminderBannerProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  onAction?: () => void;
  actionText?: string;
}

export default function WaterReminderBanner({
  isOpen,
  onClose,
  message = '该换水了',
  onAction,
  actionText = '去打卡',
}: WaterReminderBannerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="relative bg-water-gradient overflow-hidden shadow-lg">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-2 left-1/4 text-2xl opacity-30 animate-float">💧</div>
          <div className="absolute top-4 right-1/3 text-xl opacity-20 animate-float delay-200">💧</div>
          <div className="absolute bottom-1 left-1/3 text-lg opacity-25 animate-float delay-300">💧</div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between py-3 md:py-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Droplets className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-display text-lg md:text-2xl flex items-center gap-2">
                  <span className="animate-bounce">💧</span>
                  {message}
                  <span className="animate-bounce delay-100">💧</span>
                </div>
                <p className="text-white/80 text-xs md:text-sm">
                  饮水机水位如何？需要换水的话，快来打卡吧！
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {onAction && (
                <button
                  onClick={onAction}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-white text-water-600 font-semibold rounded-xl hover:bg-water-50 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {actionText}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors flex-shrink-0"
                aria-label="关闭提醒"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
