import { useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, UserPlus, UserMinus, Minus } from 'lucide-react';
import type { MonthlySummary, TopRankingEmployee } from '@/types';
import { DEPARTMENTS } from '@/constants';

interface MonthOverMonthPanelProps {
  currentMonth: MonthlySummary | null;
  lastMonth: MonthlySummary | null;
  loading: boolean;
}

interface StatComparisonProps {
  label: string;
  current: number;
  previous: number;
  icon: string;
  color: string;
}

function StatComparison({ label, current, previous, icon, color }: StatComparisonProps) {
  const { change, percentage, isPositive, isNeutral } = useMemo(() => {
    const diff = current - previous;
    if (previous === 0 && current === 0) {
      return { change: 0, percentage: 0, isPositive: false, isNeutral: true };
    }
    if (previous === 0) {
      return { change: current, percentage: 100, isPositive: true, isNeutral: false };
    }
    const percentage = Math.round((diff / previous) * 100);
    return {
      change: diff,
      percentage: Math.abs(percentage),
      isPositive: diff >= 0,
      isNeutral: diff === 0,
    };
  }, [current, previous]);

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card border border-slate-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl md:text-3xl">{icon}</div>
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isNeutral
              ? 'bg-slate-100 text-slate-500'
              : isPositive
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          }`}
        >
          {isNeutral ? (
            <Minus className="w-3 h-3" />
          ) : isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          <span>{isNeutral ? '持平' : `${percentage}%`}</span>
        </div>
      </div>
      <div className="font-display text-2xl md:text-3xl text-slate-800 mb-1">
        {current.toLocaleString()}
      </div>
      <div className="text-xs md:text-sm text-slate-400 mb-2">{label}</div>
      <div
        className={`text-xs font-medium ${
          isNeutral
            ? 'text-slate-400'
            : isPositive
            ? 'text-emerald-500'
            : 'text-rose-500'
        }`}
      >
        {isNeutral
          ? '与上月相同'
          : `${isPositive ? '增加' : '减少'} ${Math.abs(change).toLocaleString()}`}
      </div>
    </div>
  );
}

interface EmployeeChangeListProps {
  title: string;
  employees: TopRankingEmployee[];
  type: 'new' | 'dropped';
}

function EmployeeChangeList({ title, employees, type }: EmployeeChangeListProps) {
  if (employees.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            type === 'new' ? 'bg-emerald-50' : 'bg-amber-50'
          }`}
        >
          {type === 'new' ? (
            <UserPlus className="w-4 h-4 text-emerald-500" />
          ) : (
            <UserMinus className="w-4 h-4 text-amber-500" />
          )}
        </div>
        <h3 className="font-display text-base md:text-lg text-slate-800">{title}</h3>
        <span
          className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
            type === 'new' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          {employees.length}人
        </span>
      </div>
      <div className="space-y-2">
        {employees.map((emp) => {
          const deptConfig = DEPARTMENTS.find((d) => d.id === emp.department);
          return (
            <div
              key={emp.employeeId}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="text-2xl">{emp.employeeAvatar}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-700 truncate">{emp.employeeName}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    {deptConfig?.icon} {deptConfig?.name}
                  </span>
                  <span>·</span>
                  <span>{emp.records}次换水</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MonthOverMonthPanel({
  currentMonth,
  lastMonth,
  loading,
}: MonthOverMonthPanelProps) {
  const comparison = useMemo(() => {
    if (!currentMonth || !lastMonth) {
      return null;
    }

    const currentTop10Ids = new Set(currentMonth.top10.map((e) => e.employeeId));
    const lastTop10Ids = new Set(lastMonth.top10.map((e) => e.employeeId));

    const newEntrants = currentMonth.top10.filter(
      (e) => !lastTop10Ids.has(e.employeeId)
    );
    const droppedOff = lastMonth.top10.filter(
      (e) => !currentTop10Ids.has(e.employeeId)
    );

    return { newEntrants, droppedOff };
  }, [currentMonth, lastMonth]);

  if (loading) {
    return (
      <section className="animate-fade-in-up">
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 md:p-8 border border-indigo-100">
          <div className="animate-pulse">
            <div className="h-7 w-48 bg-slate-200 rounded-lg mb-2" />
            <div className="h-4 w-64 bg-slate-200 rounded-lg mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/60 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-white/60 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!currentMonth) {
    return null;
  }

  const hasLastMonth = !!lastMonth;

  return (
    <section className="animate-fade-in-up">
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 md:p-8 border border-indigo-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            {hasLastMonth ? (
              currentMonth.totalRecords >= (lastMonth?.totalRecords || 0) ? (
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
              ) : (
                <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-white" />
              )
            ) : (
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="font-display text-xl md:text-2xl text-slate-800">环比变化</h2>
            <p className="text-xs md:text-sm text-slate-400">
              {currentMonth.monthLabel}
              {hasLastMonth ? ` 对比 ${lastMonth!.monthLabel}` : ' 本月数据'}
            </p>
          </div>
        </div>

        {hasLastMonth ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatComparison
                label="换水总次数"
                current={currentMonth.totalRecords}
                previous={lastMonth!.totalRecords}
                icon="🪣"
                color="from-blue-400 to-water-600"
              />
              <StatComparison
                label="参与人数"
                current={currentMonth.totalParticipants}
                previous={lastMonth!.totalParticipants}
                icon="👥"
                color="from-violet-400 to-purple-500"
              />
              <StatComparison
                label="总获赞数"
                current={currentMonth.totalLikes}
                previous={lastMonth!.totalLikes}
                icon="❤️"
                color="from-rose-400 to-pink-500"
              />
            </div>

            {comparison && (comparison.newEntrants.length > 0 || comparison.droppedOff.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EmployeeChangeList
                  title="本月新上榜"
                  employees={comparison.newEntrants}
                  type="new"
                />
                <EmployeeChangeList
                  title="本月掉榜"
                  employees={comparison.droppedOff}
                  type="dropped"
                />
              </div>
            )}

            {comparison && comparison.newEntrants.length === 0 && comparison.droppedOff.length === 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="font-display text-lg text-slate-600 mb-1">榜单稳定</h3>
                <p className="text-sm text-slate-400">本月前10名与上月完全相同</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-display text-lg text-slate-600 mb-1">暂无上月数据</h3>
            <p className="text-sm text-slate-400">下个月即可查看环比对比分析</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
                <div className="text-2xl mb-1">🪣</div>
                <div className="font-display text-2xl text-slate-800">
                  {currentMonth.totalRecords.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">换水总次数</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
                <div className="text-2xl mb-1">👥</div>
                <div className="font-display text-2xl text-slate-800">
                  {currentMonth.totalParticipants.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">参与人数</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
                <div className="text-2xl mb-1">❤️</div>
                <div className="font-display text-2xl text-slate-800">
                  {currentMonth.totalLikes.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">总获赞数</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
