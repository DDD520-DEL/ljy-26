import { useAppStore } from '@/store';
import { Wifi, WifiOff, RefreshCw, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SyncStatusBar() {
  const { syncState, isInitializing, initError, refreshFromServer, manualSync, resetSyncError } = useAppStore();
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  const { isOnline, isSyncing, pendingCount, lastSyncTime, lastError } = syncState;

  useEffect(() => {
    if (initError) {
      const t = setTimeout(resetSyncError, 6000);
      return () => clearTimeout(t);
    }
  }, [initError, resetSyncError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromServer();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleSync = async () => {
    setIsSyncingNow(true);
    try {
      await manualSync();
    } finally {
      setTimeout(() => setIsSyncingNow(false), 500);
    }
  };

  const formatTime = (t: number | null) => {
    if (!t) return '从未';
    const d = new Date(t);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  if (isInitializing) {
    return (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 mt-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full shadow-lg animate-pulse">
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-sm text-blue-600 font-medium">正在同步数据...</span>
        </div>
      </div>
    );
  }

  const StatusIcon = isOnline ? Cloud : CloudOff;
  const statusColor = isOnline
    ? pendingCount > 0
      ? 'text-amber-500'
      : 'text-emerald-500'
    : 'text-slate-400';
  const statusBg = isOnline
    ? pendingCount > 0
      ? 'bg-amber-50 border-amber-200'
      : 'bg-emerald-50 border-emerald-200'
    : 'bg-slate-50 border-slate-200';

  return (
    <>
      {initError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 mt-2 max-w-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-lg">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-sm text-amber-700">{initError}</span>
            <button
              onClick={resetSyncError}
              className="ml-1 text-amber-400 hover:text-amber-600 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 right-4 z-50">
        <div className={`relative flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg backdrop-blur-sm cursor-pointer transition-all hover:scale-105 ${statusBg}`}
          onClick={() => setShowDetails(v => !v)}
        >
          <StatusIcon className={`w-4 h-4 ${statusColor} ${isSyncing || isSyncingNow ? 'animate-bounce' : ''}`} />

          {pendingCount > 0 && !isSyncing && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}

          {isSyncing || isSyncingNow ? (
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          ) : isOnline ? (
            <Wifi className={`w-3.5 h-3.5 ${statusColor}`} />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>

        {showDetails && (
          <div className="absolute bottom-14 right-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 text-sm">同步状态</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">连接状态</span>
                <span className={isOnline ? 'text-emerald-600 font-medium' : 'text-slate-500 font-medium'}>
                  {isOnline ? '● 已连接服务器' : '○ 离线模式'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">待同步操作</span>
                <span className={pendingCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-600'}>
                  {pendingCount} 条
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">最近同步</span>
                <span className="text-slate-600">{formatTime(lastSyncTime)}</span>
              </div>

              {lastError && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-red-600 text-[11px]">{lastError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
                disabled={!isOnline || isRefreshing}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                刷新
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSync(); }}
                disabled={isSyncingNow || (!isOnline && pendingCount === 0)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-water-500 text-white hover:bg-water-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Cloud className={`w-3 h-3 ${isSyncingNow ? 'animate-bounce' : ''}`} />
                同步全部
              </button>
            </div>

            {!isOnline && (
              <p className="mt-3 text-[11px] text-slate-400 text-center">
                网络恢复后将自动同步本地修改
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
