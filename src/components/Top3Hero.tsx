import { Link } from 'react-router-dom';
import type { RankingEntry } from '@/types';
import { Heart } from 'lucide-react';

interface Top3HeroProps {
  ranking: RankingEntry[];
}

const medalConfig = [
  {
    rank: 1,
    label: '冠军',
    medal: '🥇',
    gradient: 'gold-gradient',
    borderColor: 'from-yellow-300 via-yellow-400 to-amber-500',
    size: 'lg',
    translateY: 'md:-translate-y-6',
    crown: true,
  },
  {
    rank: 2,
    label: '亚军',
    medal: '🥈',
    gradient: 'silver-gradient',
    borderColor: 'from-gray-200 via-gray-300 to-gray-400',
    size: 'md',
    translateY: 'md:translate-y-2',
    crown: false,
  },
  {
    rank: 3,
    label: '季军',
    medal: '🥉',
    gradient: 'bronze-gradient',
    borderColor: 'from-orange-300 via-amber-500 to-orange-700',
    size: 'md',
    translateY: 'md:translate-y-4',
    crown: false,
  },
];

export default function Top3Hero({ ranking }: Top3HeroProps) {
  const top3 = ranking.slice(0, 3);
  const hasData = top3.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center shadow-card animate-fade-in-up">
        <div className="text-6xl mb-4">🪣</div>
        <h3 className="font-display text-xl text-slate-600 mb-2">本月榜单虚位以待</h3>
        <p className="text-slate-400 text-sm">还没有换水记录，快去成为第一个换水英雄吧！</p>
      </div>
    );
  }

  const orderedForDisplay: Array<{ config: typeof medalConfig[0]; entry: RankingEntry | null }> = [
    { config: medalConfig[1], entry: top3[1] || null },
    { config: medalConfig[0], entry: top3[0] || null },
    { config: medalConfig[2], entry: top3[2] || null },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-end justify-center gap-3 md:gap-6">
        {orderedForDisplay.map(({ config, entry }, idx) => (
          <div
            key={config.rank}
            className={`flex-1 max-w-xs ${config.translateY} transition-all duration-500 delay-${idx}00`}
            style={{ animationDelay: `${idx * 0.15}s` }}
          >
            {entry ? (
              <Link
                to={`/hero/${entry.employee.id}`}
                className={`relative bg-white rounded-3xl shadow-card card-hover overflow-hidden border-2 bg-gradient-to-br ${config.borderColor} p-[2px] block`}
              >
                <div className="bg-white rounded-[22px] p-4 md:p-6 relative group">
                  {config.crown && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl md:text-4xl animate-float z-10">
                      👑
                    </div>
                  )}

                  <div className="text-center mb-3">
                    <div className="text-2xl mb-1">{config.medal}</div>
                    <div className={`text-xs font-semibold bg-gradient-to-r ${config.borderColor} bg-clip-text text-transparent`}>
                      {config.label}
                    </div>
                  </div>

                  <div className={`relative mx-auto ${
                    config.rank === 1 ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20'
                  } rounded-full overflow-hidden mb-3 bg-water-50 flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-105 transition-transform`}>
                    <div className={`${
                      config.rank === 1 ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'
                    }`}>
                      {entry.employee.avatar}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-8 h-8 md:w-10 md:h-10 rounded-full ${config.gradient} flex items-center justify-center text-white font-bold text-xs md:text-sm border-2 border-white shadow-md`}>
                      {config.rank}
                    </div>
                  </div>

                  <h3 className={`font-display text-center ${
                    config.rank === 1 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
                  } text-slate-800 mb-1 truncate group-hover:text-water-600 transition-colors`}>
                    {entry.employee.name}
                  </h3>

                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${entry.badge.bgColor} ${entry.badge.color} text-xs font-medium mx-auto`}>
                    <span>{entry.badge.icon}</span>
                    <span>{entry.badge.name}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-lg">🪣</span>
                        </div>
                        <div className={`font-display ${
                          config.rank === 1 ? 'text-2xl' : 'text-xl'
                        } gradient-text`}>
                          {entry.records}
                        </div>
                        <div className="text-[10px] text-slate-400">换水次数</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                        </div>
                        <div className={`font-display ${
                          config.rank === 1 ? 'text-2xl' : 'text-xl'
                        } text-rose-500`}>
                          {entry.likes}
                        </div>
                        <div className="text-[10px] text-slate-400">获得点赞</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 border-dashed border-slate-200 min-h-[280px] md:min-h-[320px] flex flex-col items-center justify-center">
                <div className="text-4xl mb-2 opacity-30">{config.medal}</div>
                <div className="text-slate-400 text-sm">虚位以待</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
