import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, Trophy, Droplets, Heart, Crown } from 'lucide-react';
import type { WeeklyChampion } from '@/utils';
import { DEPARTMENTS } from '@/constants';

interface WeeklyChampionCardProps {
  champions: WeeklyChampion[];
  weekLabel: string;
  weekKey: string;
}

function getDeptName(deptId: string): string {
  return DEPARTMENTS.find(d => d.id === deptId)?.name || '';
}

function getDeptIcon(deptId: string): string {
  return DEPARTMENTS.find(d => d.id === deptId)?.icon || '';
}

const DISMISSED_PREFIX = 'weekly-champion-dismissed-';

export default function WeeklyChampionCard({ champions, weekLabel, weekKey }: WeeklyChampionCardProps) {
  const storageKey = `${DISMISSED_PREFIX}${weekKey}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const isTie = champions.length > 1;

  const totalRecords = useMemo(
    () => champions.reduce((sum, c) => sum + c.records, 0),
    [champions]
  );
  const totalLiters = useMemo(
    () => Math.round(champions.reduce((sum, c) => sum + c.totalLiters, 0) * 10) / 10,
    [champions]
  );
  const totalLikes = useMemo(
    () => champions.reduce((sum, c) => sum + c.likes, 0),
    [champions]
  );

  const handleClose = () => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <section className="animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-5 md:p-7 shadow-card border border-amber-200/60">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-200/20 rounded-full blur-3xl" />
        <div className="absolute top-3 right-12 text-5xl opacity-15 animate-float">🏆</div>
        <div className="absolute bottom-4 right-28 text-3xl opacity-10 animate-float delay-200">⭐</div>

        <button
          onClick={handleClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-20 w-8 h-8 rounded-full bg-white/60 hover:bg-white/90 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all backdrop-blur-sm border border-slate-200/50"
          title="关闭播报"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg md:text-xl text-amber-800">
                  🏅 周冠军播报
                </h2>
                {isTie && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] md:text-xs font-semibold border border-amber-200">
                    并列第一
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-amber-600/70">
                {weekLabel} 换水之星
              </p>
            </div>
          </div>

          <div className={`${isTie ? 'flex flex-wrap gap-3' : ''} mb-5`}>
            {champions.map((champion) => (
              <Link
                key={champion.employee.id}
                to={`/hero/${champion.employee.id}`}
                className={`${isTie ? 'flex-1 min-w-[140px]' : ''} bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-amber-100/80 shadow-sm hover:shadow-md transition-all group block`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center text-3xl md:text-4xl border-2 border-amber-200/60 shadow-inner group-hover:scale-105 transition-transform">
                      {champion.employee.avatar}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-lg md:text-xl text-amber-900 truncate group-hover:text-amber-700 transition-colors">
                      {champion.employee.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-600/70">
                      <span>{getDeptIcon(champion.employee.department)}</span>
                      <span>{getDeptName(champion.employee.department)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-water-50/60 rounded-xl py-2 px-1">
                    <div className="flex items-center justify-center mb-0.5">
                      <Droplets className="w-3.5 h-3.5 text-water-500" />
                    </div>
                    <div className="font-display text-lg gradient-text">{champion.records}</div>
                    <div className="text-[10px] text-slate-400">换水次数</div>
                  </div>
                  <div className="text-center bg-cyan-50/60 rounded-xl py-2 px-1">
                    <div className="flex items-center justify-center mb-0.5">
                      <span className="text-sm">💧</span>
                    </div>
                    <div className="font-display text-lg text-cyan-600">{champion.totalLiters}L</div>
                    <div className="text-[10px] text-slate-400">换水量</div>
                  </div>
                  <div className="text-center bg-rose-50/60 rounded-xl py-2 px-1">
                    <div className="flex items-center justify-center mb-0.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    </div>
                    <div className="font-display text-lg text-rose-500">{champion.likes}</div>
                    <div className="text-[10px] text-slate-400">点赞数</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 md:gap-6 bg-white/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-amber-100/50">
            <div className="flex items-center gap-1.5 text-sm text-amber-700">
              <Droplets className="w-4 h-4 text-water-500" />
              <span className="font-semibold">{totalRecords}</span>
              <span className="text-amber-600/60">次换水</span>
            </div>
            <div className="w-px h-4 bg-amber-200" />
            <div className="flex items-center gap-1.5 text-sm text-amber-700">
              <span>💧</span>
              <span className="font-semibold">{totalLiters}L</span>
              <span className="text-amber-600/60">总换水量</span>
            </div>
            <div className="w-px h-4 bg-amber-200" />
            <div className="flex items-center gap-1.5 text-sm text-amber-700">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span className="font-semibold">{totalLikes}</span>
              <span className="text-amber-600/60">总点赞</span>
            </div>
          </div>

          {isTie && (
            <div className="mt-3 text-center text-xs text-amber-500/70">
              🎉 恭喜 {champions.map(c => c.employee.name).join('、')} 并列获得周冠军！
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
