import { useMemo, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Droplets, Trophy, TrendingUp, Calendar, ArrowRight, Search, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { getMonthlyRanking, formatMonthLabel, getLastWeekChampions, getTodayStars } from '@/utils';
import type { Department, MonthlySummary } from '@/types';
import { DEPARTMENTS } from '@/constants';
import { api } from '@/api';
import Top3Hero from '@/components/Top3Hero';
import ActivityItem from '@/components/ActivityItem';
import FloatingButton from '@/components/FloatingButton';
import WeeklyChampionCard from '@/components/WeeklyChampionCard';
import MonthOverMonthPanel from '@/components/MonthOverMonthPanel';
import MonthlyBarChart from '@/components/MonthlyBarChart';
import TodayStar from '@/components/TodayStar';

export default function Home() {
  const { employees, records } = useAppStore();
  const [selectedDept, setSelectedDept] = useState<Department | 'all'>('all');
  const [currentMonthSummary, setCurrentMonthSummary] = useState<MonthlySummary | null>(null);
  const [lastMonthSummary, setLastMonthSummary] = useState<MonthlySummary | null>(null);
  const [monthlySummaryLoading, setMonthlySummaryLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthLabel = formatMonthLabel(currentYear, currentMonth);

  const lastMonthDate = useMemo(() => {
    const d = new Date(currentYear, currentMonth - 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [currentYear, currentMonth]);

  useEffect(() => {
    async function fetchMonthlySummaries() {
      setMonthlySummaryLoading(true);
      try {
        const [current, last] = await Promise.all([
          api.getMonthlySummary(currentYear, currentMonth),
          api.getMonthlySummary(lastMonthDate.year, lastMonthDate.month).catch(() => null),
        ]);
        setCurrentMonthSummary(current);
        setLastMonthSummary(last);
      } catch (err) {
        console.error('获取月度统计失败:', err);
      } finally {
        setMonthlySummaryLoading(false);
      }
    }

    fetchMonthlySummaries();
  }, [currentYear, currentMonth, lastMonthDate.year, lastMonthDate.month, records.length]);

  const filteredEmployees = useMemo(() => {
    if (selectedDept === 'all') return employees;
    return employees.filter(e => e.department === selectedDept);
  }, [employees, selectedDept]);

  const filteredRecords = useMemo(() => {
    if (selectedDept === 'all') return records;
    const deptIds = new Set(filteredEmployees.map(e => e.id));
    return records.filter(r => deptIds.has(r.employeeId));
  }, [records, filteredEmployees, selectedDept]);

  const searchedAndDateFilteredRecords = useMemo(() => {
    let result = filteredRecords;

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      const matchedEmployeeIds = new Set(
        employees
          .filter(e => e.name.toLowerCase().includes(keyword))
          .map(e => e.id)
      );
      result = result.filter(r => matchedEmployeeIds.has(r.employeeId));
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(r => new Date(r.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(r => new Date(r.timestamp) <= end);
    }

    return result;
  }, [filteredRecords, searchKeyword, employees, startDate, endDate]);

  const monthlyRanking = useMemo(
    () => getMonthlyRanking(filteredRecords, filteredEmployees, currentYear, currentMonth),
    [filteredRecords, filteredEmployees, currentYear, currentMonth]
  );

  const recentRecords = useMemo(() => searchedAndDateFilteredRecords.slice(0, 15), [searchedAndDateFilteredRecords]);

  const weeklyChampionData = useMemo(
    () => getLastWeekChampions(records, employees),
    [records, employees]
  );

  const todayStars = useMemo(
    () => getTodayStars(records, employees),
    [records, employees]
  );

  const monthlyStats = useMemo(() => {
    if (currentMonthSummary && selectedDept === 'all') {
      const monthRecords = filteredRecords.filter(r => {
        const d = new Date(r.timestamp);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
      const totalLiters = monthRecords.reduce((sum, r) => {
        const liters = r.bucketType === '5G' ? 18.9 : r.bucketType === '3G' ? 11.3 : 5;
        return sum + liters;
      }, 0);
      return {
        records: currentMonthSummary.totalRecords,
        likes: currentMonthSummary.totalLikes,
        liters: totalLiters.toFixed(1),
        people: currentMonthSummary.totalParticipants,
      };
    }

    const monthRecords = filteredRecords.filter(r => {
      const d = new Date(r.timestamp);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const totalLikes = monthRecords.reduce((sum, r) => sum + r.likes, 0);
    const totalLiters = monthRecords.reduce((sum, r) => {
      const liters = r.bucketType === '5G' ? 18.9 : r.bucketType === '3G' ? 11.3 : 5;
      return sum + liters;
    }, 0);
    return {
      records: monthRecords.length,
      likes: totalLikes,
      liters: totalLiters.toFixed(1),
      people: new Set(monthRecords.map(r => r.employeeId)).size,
    };
  }, [currentMonthSummary, selectedDept, filteredRecords, currentYear, currentMonth]);

  const stats = [
    { label: '本月换水', value: monthlyStats.records, icon: '🪣', color: 'from-blue-400 to-water-600' },
    { label: '总换水量', value: `${monthlyStats.liters}L`, icon: '💧', color: 'from-cyan-400 to-teal-500' },
    { label: '参与人数', value: monthlyStats.people, icon: '👥', color: 'from-violet-400 to-purple-500' },
    { label: '获得点赞', value: monthlyStats.likes, icon: '❤️', color: 'from-rose-400 to-pink-500' },
  ];

  return (
    <div className="space-y-8 md:space-y-12">
      <TodayStar stars={todayStars} />

      {weeklyChampionData && (
        <WeeklyChampionCard
          champions={weeklyChampionData.champions}
          weekLabel={weeklyChampionData.weekLabel}
          weekKey={weeklyChampionData.weekKey}
        />
      )}

      <section className="animate-fade-in-up">
        <div className="relative overflow-hidden rounded-3xl bg-water-gradient p-6 md:p-10 text-white shadow-water">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-4 right-8 text-6xl opacity-20 animate-float">💧</div>
          <div className="absolute bottom-6 right-32 text-4xl opacity-15 animate-float delay-200">💧</div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 opacity-80" />
              <span className="text-sm md:text-base opacity-90">{monthLabel}</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl mb-3">
              办公室换水英雄榜 🏆
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-6 md:mb-8 max-w-lg">
              记录每一次默默付出，让幕后供水英雄被看见！每一滴水都是爱的传递～
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="text-2xl md:text-3xl mb-1">{stat.icon}</div>
                  <div className="font-display text-xl md:text-3xl">{stat.value}</div>
                  <div className="text-xs md:text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-display text-lg md:text-xl text-slate-800 dark:text-slate-100">按部门筛选</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedDept === 'all'
                ? 'bg-water-500 text-white shadow-md scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-water-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
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
                  : `${dept.bgColor} ${dept.color} hover:opacity-80 border border-slate-100 dark:border-slate-700`
              }`}
            >
              <span>{dept.icon}</span>
              <span>{dept.name}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedDept === 'all' && (
        <MonthOverMonthPanel
          currentMonth={currentMonthSummary}
          lastMonth={lastMonthSummary}
          loading={monthlySummaryLoading}
        />
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100">本月 TOP3 英雄</h2>
              <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500">谁是本月的换水达人？</p>
            </div>
          </div>
          <NavLink
            to="/ranking"
            className="hidden md:flex items-center gap-1.5 text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 text-sm font-medium transition-colors group"
          >
            完整榜单
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </div>

        <Top3Hero ranking={monthlyRanking} />

        <NavLink
          to="/ranking"
          className="md:hidden mt-4 w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-white dark:bg-slate-800 text-water-600 dark:text-water-400 text-sm font-medium shadow-card hover:shadow-md transition-all"
        >
          查看完整榜单
          <ArrowRight className="w-4 h-4" />
        </NavLink>
      </section>

      <section>
        <MonthlyBarChart records={filteredRecords} year={currentYear} month={currentMonth} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-water-100 dark:bg-water-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-water-500 dark:text-water-400" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100">最近换水动态</h2>
              <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500">看看大家最近的贡献～</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-water-50 dark:bg-slate-700/50 text-water-600 dark:text-water-400 text-xs md:text-sm font-medium">
            <Droplets className="w-3.5 h-3.5" />
            共 {searchedAndDateFilteredRecords.length} 条记录
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-6 shadow-card border border-slate-100 dark:border-slate-700 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="搜索换水英雄姓名..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-water-300 dark:focus:ring-water-600 focus:border-water-400 dark:focus:border-water-500 transition-all"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative flex items-center">
                <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  placeholder="开始日期"
                  className="pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-water-300 dark:focus:ring-water-600 focus:border-water-400 dark:focus:border-water-500 transition-all"
                />
              </div>

              <span className="text-slate-400 text-sm font-medium">至</span>

              <div className="relative flex items-center">
                <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  placeholder="结束日期"
                  className="pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-water-300 dark:focus:ring-water-600 focus:border-water-400 dark:focus:border-water-500 transition-all"
                />
              </div>

              {(searchKeyword || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSearchKeyword('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
                >
                  重置
                </button>
              )}
            </div>
          </div>
        </div>

        {recentRecords.length === 0 ? (
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-10 text-center">
            <div className="text-5xl mb-3">📝</div>
            <h3 className="font-display text-lg text-slate-600 dark:text-slate-300 mb-1">暂无换水记录</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">点击右下角按钮记录第一条换水记录吧！</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {recentRecords.map((record, idx) => (
              <ActivityItem
                key={record.id}
                record={record}
                employee={employees.find(e => e.id === record.employeeId)}
                index={idx}
              />
            ))}
          </div>
        )}
      </section>

      <FloatingButton />
    </div>
  );
}
