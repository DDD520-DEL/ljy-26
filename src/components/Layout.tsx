import { NavLink, Outlet } from 'react-router-dom';
import { Droplets, Trophy, Award, Home, Bell, BellOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import SyncStatusBar from '@/components/SyncStatusBar';
import ReminderSettings from '@/components/ReminderSettings';
import { useAppStore } from '@/store';

export default function Layout() {
  const { reminderConfig } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);

  const waterDrops = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        size: 12 + Math.random() * 16,
      })),
    []
  );

  const navItems = [
    { to: '/', label: '首页', icon: Home },
    { to: '/ranking', label: '排行榜', icon: Trophy },
    { to: '/hall-of-fame', label: '荣誉墙', icon: Award },
  ];

  return (
    <div className="min-h-screen water-texture relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {waterDrops.map(drop => (
          <div
            key={drop.id}
            className="water-drop absolute text-water-400/30 select-none"
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              fontSize: `${drop.size}px`,
            }}
          >
            💧
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-water-100 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 px-4 md:px-0">
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-water-gradient flex items-center justify-center shadow-water group-hover:scale-110 transition-transform">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-xl gradient-text">换水英雄榜</h1>
                <p className="text-xs text-slate-500 -mt-1">办公室的幕后供水英雄</p>
              </div>
            </NavLink>

            <div className="flex items-center gap-2 md:gap-3">
              <nav className="flex items-center gap-1 md:gap-2 bg-water-50/80 rounded-2xl p-1">
                {navItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-white text-water-600 shadow-md scale-105'
                          : 'text-slate-500 hover:text-water-600 hover:bg-white/50'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <button
                onClick={() => setShowSettings(true)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  reminderConfig.enabled
                    ? 'bg-water-100 text-water-600 hover:bg-water-200'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
                title="提醒设置"
              >
                {reminderConfig.enabled ? (
                  <Bell className="w-5 h-5" />
                ) : (
                  <BellOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 md:px-0 py-6 md:py-10 pb-32">
        <Outlet />
      </main>

      <SyncStatusBar />

      <footer className="relative z-10 text-center py-6 text-sm text-slate-400">
        💧 每一滴水都是爱的传递 · 换水英雄榜
      </footer>

      <ReminderSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
