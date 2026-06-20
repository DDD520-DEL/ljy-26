import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Droplets, Heart, Star } from 'lucide-react';
import type { TodayStar } from '@/utils';
import { DEPARTMENTS } from '@/constants';

interface TodayStarProps {
  stars: TodayStar[];
}

function getDeptName(deptId: string): string {
  return DEPARTMENTS.find(d => d.id === deptId)?.name || '';
}

function getDeptIcon(deptId: string): string {
  return DEPARTMENTS.find(d => d.id === deptId)?.icon || '';
}

const ENCOURAGE_TEMPLATES = [
  (names: string) => `今天的供水英雄是${names}！感谢你们为大家带来清甜甘泉 💧`,
  (names: string) => `${names}，你们就是办公室的清泉守护者！继续加油 🌟`,
  (names: string) => `为${names}点赞！默默付出的身影最帅气/美丽 ✨`,
  (names: string) => `${names}用行动守护了大家的饮水健康，辛苦了！🙌`,
  (names: string) => `${names}今日份的换水任务已超额完成，给你们比心 💙`,
];

export default function TodayStar({ stars }: TodayStarProps) {
  const hasStars = stars.length > 0;

  const totalRecords = useMemo(
    () => stars.reduce((sum, s) => sum + s.records, 0),
    [stars]
  );
  const totalLiters = useMemo(
    () => Math.round(stars.reduce((sum, s) => sum + s.totalLiters, 0) * 10) / 10,
    [stars]
  );
  const totalLikes = useMemo(
    () => stars.reduce((sum, s) => sum + s.likes, 0),
    [stars]
  );

  const encourageMessage = useMemo(() => {
    if (!hasStars) return '';
    const names = stars.map(s => s.employee.name).join('、');
    const template = ENCOURAGE_TEMPLATES[Math.floor(Math.random() * ENCOURAGE_TEMPLATES.length)];
    return template(names);
  }, [hasStars, stars]);

  const todayLabel = useMemo(() => {
    const now = new Date();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${now.getMonth() + 1}月${now.getDate()}日 · ${weekDays[now.getDay()]}`;
  }, []);

  if (!hasStars) {
    return (
      <section className="animate-fade-in-up">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/40 dark:from-slate-800/60 dark:via-blue-900/20 dark:to-cyan-900/20 p-5 md:p-7 shadow-card border border-slate-200/60 dark:border-slate-700/40 transition-colors duration-300">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-200/30 dark:bg-slate-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-4 right-12 text-5xl opacity-10">💧</div>
          <div className="absolute bottom-4 right-28 text-3xl opacity-8">🌙</div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-slate-200 to-blue-100 dark:from-slate-700 dark:to-blue-900/40 flex items-center justify-center text-4xl md:text-5xl shadow-inner animate-pulse-slow">
              😴
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <h2 className="font-display text-lg md:text-xl text-slate-600 dark:text-slate-300">
                  今日之星
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-medium">
                  {todayLabel}
                </span>
              </div>
              <p className="font-display text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-1">
                今天还没有人换水
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                快来成为今天的第一位换水英雄吧！机会留给有准备的人 💪
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 dark:from-pink-900/30 dark:via-rose-900/20 dark:to-orange-900/20 p-5 md:p-7 shadow-card border border-pink-200/60 dark:border-pink-700/40 transition-colors duration-300">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-3 right-12 text-5xl opacity-15 animate-float">⭐</div>
        <div className="absolute bottom-4 right-28 text-3xl opacity-10 animate-float delay-200">✨</div>
        <div className="absolute top-8 left-8 text-2xl opacity-15 animate-float delay-300">🌟</div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400 flex items-center justify-center shadow-md">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg md:text-xl text-rose-800 dark:text-rose-200">
                  🌟 今日之星
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 text-[10px] md:text-xs font-semibold border border-rose-200 dark:border-rose-700/50 animate-pulse">
                  {todayLabel}
                </span>
              </div>
              <p className="text-xs md:text-sm text-rose-600/70 dark:text-rose-400/70">
                今天的换水英雄就是你们！
              </p>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 md:p-4 mb-4 border border-rose-100/60 dark:border-rose-800/30">
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
              <Sparkles className="w-4 h-4 inline-block mr-1 text-amber-500 align-[-2px]" />
              {encourageMessage}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            {stars.map((star, idx) => (
              <Link
                key={star.employee.id}
                to={`/hero/${star.employee.id}`}
                className="flex-1 min-w-[150px] bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-3 md:p-4 border-2 border-rose-200/70 dark:border-rose-700/40 shadow-sm hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-600/50 transition-all group block relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-rose-100/60 to-transparent dark:from-rose-500/10 rounded-bl-[40px]" />
                {idx === 0 && (
                  <div className="absolute top-2 right-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md animate-bounce-slow">
                    <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-white fill-white" />
                  </div>
                )}

                <div className="relative z-10 flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 dark:from-pink-900/50 dark:via-rose-900/40 dark:to-orange-900/40 flex items-center justify-center text-2xl md:text-3xl border-2 border-rose-200/60 dark:border-rose-700/40 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      {star.employee.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md text-white text-[10px] font-bold">
                      {star.records}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-base md:text-lg text-rose-900 dark:text-rose-100 truncate group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">
                      {star.employee.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-rose-600/70 dark:text-rose-400/70">
                      <span>{getDeptIcon(star.employee.department)}</span>
                      <span>{getDeptName(star.employee.department)}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-1.5 md:gap-2">
                  <div className="text-center bg-water-50/70 dark:bg-slate-700/50 rounded-xl py-1.5 px-1">
                    <div className="flex items-center justify-center mb-0.5">
                      <Droplets className="w-3 h-3 text-water-500 dark:text-water-400" />
                    </div>
                    <div className="font-display text-sm md:text-base gradient-text">{star.records}</div>
                    <div className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500">换水</div>
                  </div>
                  <div className="text-center bg-cyan-50/70 dark:bg-slate-700/50 rounded-xl py-1.5 px-1">
                    <div className="flex items-center justify-center mb-0.5">
                      <span className="text-xs">💧</span>
                    </div>
                    <div className="font-display text-sm md:text-base text-cyan-600 dark:text-cyan-400">{star.totalLiters}L</div>
                    <div className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500">水量</div>
                  </div>
                  <div className="text-center bg-rose-50/70 dark:bg-slate-700/50 rounded-xl py-1.5 px-1">
                    <div className="flex items-center justify-center mb-0.5">
                      <Heart className="w-3 h-3 text-rose-400 dark:text-rose-300 fill-rose-400 dark:fill-rose-300" />
                    </div>
                    <div className="font-display text-sm md:text-base text-rose-500 dark:text-rose-400">{star.likes}</div>
                    <div className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500">点赞</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-rose-100/50 dark:border-rose-800/30">
            <div className="flex items-center gap-1.5 text-sm text-rose-700 dark:text-rose-300">
              <Droplets className="w-4 h-4 text-water-500 dark:text-water-400" />
              <span className="font-semibold">{totalRecords}</span>
              <span className="text-rose-600/60 dark:text-rose-400/60">次换水</span>
            </div>
            <div className="w-px h-4 bg-rose-200 dark:bg-rose-700/50 hidden md:block" />
            <div className="flex items-center gap-1.5 text-sm text-rose-700 dark:text-rose-300">
              <span>💧</span>
              <span className="font-semibold">{totalLiters}L</span>
              <span className="text-rose-600/60 dark:text-rose-400/60">总换水量</span>
            </div>
            <div className="w-px h-4 bg-rose-200 dark:bg-rose-700/50 hidden md:block" />
            <div className="flex items-center gap-1.5 text-sm text-rose-700 dark:text-rose-300">
              <Heart className="w-4 h-4 text-rose-400 dark:text-rose-300 fill-rose-400 dark:fill-rose-300" />
              <span className="font-semibold">{totalLikes}</span>
              <span className="text-rose-600/60 dark:text-rose-400/60">总点赞</span>
            </div>
            <div className="w-px h-4 bg-rose-200 dark:bg-rose-700/50 hidden md:block" />
            <div className="flex items-center gap-1.5 text-sm text-rose-700 dark:text-rose-300">
              <span>👥</span>
              <span className="font-semibold">{stars.length}</span>
              <span className="text-rose-600/60 dark:text-rose-400/60">位英雄</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
