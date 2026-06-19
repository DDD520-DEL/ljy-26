import { useMemo, useState } from 'react';
import { Trophy, Heart, Users, ChevronDown, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/store';
import { getMonthlyRanking, getAvailableMonths, formatMonthLabel } from '@/utils';
import type { Department } from '@/types';
import { DEPARTMENTS } from '@/constants';
import Top3Hero from '@/components/Top3Hero';
import FloatingButton from '@/components/FloatingButton';

export default function Ranking() {
  const { employees, records } = useAppStore();
  const availableMonths = useMemo(() => getAvailableMonths(), []);

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | 'all'>('all');

  const filteredEmployees = useMemo(() => {
    if (selectedDept === 'all') return employees;
    return employees.filter(e => e.department === selectedDept);
  }, [employees, selectedDept]);

  const filteredRecords = useMemo(() => {
    if (selectedDept === 'all') return records;
    const deptIds = new Set(filteredEmployees.map(e => e.id));
    return records.filter(r => deptIds.has(r.employeeId));
  }, [records, filteredEmployees, selectedDept]);

  const ranking = useMemo(
    () => getMonthlyRanking(filteredRecords, filteredEmployees, selectedMonth.year, selectedMonth.month),
    [filteredRecords, filteredEmployees, selectedMonth]
  );

  const maxRecords = ranking[0]?.records || 1;

  const monthStats = useMemo(() => {
    const monthRecords = filteredRecords.filter(r => {
      const d = new Date(r.timestamp);
      return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month;
    });
    const totalLikes = monthRecords.reduce((sum, r) => sum + r.likes, 0);
    return {
      records: monthRecords.length,
      likes: totalLikes,
      people: ranking.length,
    };
  }, [filteredRecords, ranking, selectedMonth]);

  const rankBadges = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-slate-800">月度排行榜</h1>
              <p className="text-sm text-slate-400">按月统计换水英雄的排名情况</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2.5 bg-white rounded-xl shadow-card hover:shadow-md transition-all border border-water-50"
            >
              <span className="font-semibold text-slate-700">{formatMonthLabel(selectedMonth.year, selectedMonth.month)}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 md:w-48 bg-white rounded-xl shadow-xl border border-water-50 overflow-hidden z-20 animate-bounce-in">
                {availableMonths.map(month => (
                  <button
                    key={`${month.year}-${month.month}`}
                    onClick={() => {
                      setSelectedMonth(month);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      month.year === selectedMonth.year && month.month === selectedMonth.month
                        ? 'bg-water-50 text-water-600 font-semibold'
                        : 'text-slate-600 hover:bg-water-50/50'
                    }`}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedDept === 'all'
                ? 'bg-water-500 text-white shadow-md scale-105'
                : 'bg-white text-slate-600 hover:bg-water-50 border border-slate-100'
            }`}
          >
            全部部门
          </button>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                selectedDept === dept.id
                  ? 'bg-water-500 text-white shadow-md scale-105'
                  : `${dept.bgColor} ${dept.color} hover:opacity-80 border border-slate-100`
              }`}
            >
              <span>{dept.icon}</span>
              <span>{dept.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card border border-water-50/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-water-500" />
              <span className="text-xs text-slate-400">换水总数</span>
            </div>
            <div className="font-display text-2xl md:text-3xl gradient-text">{monthStats.records}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card border border-water-50/50 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-slate-400">参与人数</span>
            </div>
            <div className="font-display text-2xl md:text-3xl text-purple-500">{monthStats.people}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card border border-water-50/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="text-xs text-slate-400">总点赞数</span>
            </div>
            <div className="font-display text-2xl md:text-3xl text-rose-500">{monthStats.likes}</div>
          </div>
        </div>
      </div>

      {ranking.length > 0 && (
        <section className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="font-display text-xl md:text-2xl text-slate-800 mb-6 flex items-center gap-2">
            <span>🏆</span>
            <span>三甲英雄</span>
          </h2>
          <Top3Hero ranking={ranking} />
        </section>
      )}

      <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="font-display text-xl md:text-2xl text-slate-800 mb-6 flex items-center gap-2">
          <span>📊</span>
          <span>完整排名</span>
        </h2>

        {ranking.length <= 3 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-10 text-center">
            <div className="text-5xl mb-3">🏅</div>
            <h3 className="font-display text-lg text-slate-600 mb-1">暂无更多排名数据</h3>
            <p className="text-sm text-slate-400">更多换水记录可以解锁更丰富的排名哦！</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-card border border-water-50/50 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-water-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1">排名</div>
              <div className="col-span-4">换水英雄</div>
              <div className="col-span-4 text-center">换水次数</div>
              <div className="col-span-3 text-right">获得点赞</div>
            </div>

            <div className="divide-y divide-slate-100">
              {ranking.map((entry, idx) => {
                const progress = (entry.records / maxRecords) * 100;
                return (
                  <div
                    key={entry.employee.id}
                    className="group grid grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 hover:bg-water-50/30 transition-colors items-center"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="col-span-2 md:col-span-1">
                      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center font-display text-lg ${
                        idx < 3
                          ? 'bg-gradient-to-br from-yellow-100 to-amber-100'
                          : 'bg-slate-100'
                      }`}>
                        {idx < 3 ? rankBadges[idx] : <span className="text-slate-500">{idx + 1}</span>}
                      </div>
                    </div>

                    <div className="col-span-10 md:col-span-4 flex items-center gap-3">
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-water-50 flex items-center justify-center text-2xl md:text-3xl shrink-0">
                        {entry.employee.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{entry.employee.name}</div>
                        <div className="hidden md:flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${entry.badge.bgColor} ${entry.badge.color}`}>
                            <span>{entry.badge.icon}</span>
                            <span>{entry.badge.name}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-7 md:col-span-4">
                      <div className="md:hidden flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-400">🪣 换水</span>
                        <span className="font-display text-lg gradient-text">{entry.records}</span>
                      </div>
                      <div className="hidden md:flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-water-gradient rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="font-display text-xl gradient-text min-w-[2.5rem] text-right">{entry.records}</span>
                      </div>
                      <div className="md:hidden h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-water-gradient rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="col-span-5 md:col-span-3 flex items-center justify-end gap-1.5 md:gap-2">
                      <Heart className={`w-4 h-4 md:w-5 md:h-5 ${idx < 3 ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}`} />
                      <span className={`font-display ${idx < 3 ? 'text-xl text-rose-500' : 'text-lg text-rose-400'}`}>
                        {entry.likes}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <FloatingButton />
    </div>
  );
}
