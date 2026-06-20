import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Heart, Droplets, Target, ChevronRight, Building2, MessageCircle, Download, User, Flame, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store';
import { getEmployeeTotalRecords, getEmployeeTotalLikes, getNextBadgeProgress, getDepartmentStats, getEmployeeTotalComments, exportToExcel, formatDateForFilename, type ExportDataItem, calculateEmployeeHeatScore, getAllTimeHeatRanking, exportHeatToExcel, type HeatExportDataItem } from '@/utils';
import { BADGE_LEVELS, DEPARTMENTS } from '@/constants';
import FloatingButton from '@/components/FloatingButton';

type HallTab = 'records' | 'heat';

export default function HallOfFame() {
  const { employees, records, comments } = useAppStore();
  const [activeTab, setActiveTab] = useState<HallTab>('records');

  const departmentStats = useMemo(
    () => getDepartmentStats(employees, records),
    [employees, records]
  );

  const maxDeptRecords = departmentStats[0]?.totalRecords || 1;

  const employeesWithStats = useMemo(() => {
    return employees
      .map(emp => {
        const totalRecords = getEmployeeTotalRecords(emp.id, records);
        const totalLikes = getEmployeeTotalLikes(emp.id, records);
        const totalComments = getEmployeeTotalComments(emp.id, records, comments);
        const heatData = calculateEmployeeHeatScore(emp.id, records, comments, 'all');
        const progress = getNextBadgeProgress(totalRecords);
        return { employee: emp, totalRecords, totalLikes, totalComments, heatScore: heatData.heatScore, recentRecords: heatData.recentRecords, recentLikes: heatData.recentLikes, recentComments: heatData.recentComments, ...progress };
      })
      .sort((a, b) => {
        if (b.totalRecords !== a.totalRecords) return b.totalRecords - a.totalRecords;
        if (b.totalComments !== a.totalComments) return b.totalComments - a.totalComments;
        return b.totalLikes - a.totalLikes;
      });
  }, [employees, records, comments]);

  const heatRanking = useMemo(() => getAllTimeHeatRanking(records, employees, comments), [records, employees, comments]);
  const maxHeatScore = heatRanking[0]?.heatScore || 1;

  const heatEmployeeMap = useMemo(() => {
    const map = new Map<string, typeof heatRanking[number]>();
    heatRanking.forEach(h => map.set(h.employeeId, h));
    return map;
  }, [heatRanking]);

  const employeesWithHeat = useMemo(() => {
    return employees
      .map(emp => {
        const heatData = heatEmployeeMap.get(emp.id);
        const totalRecords = getEmployeeTotalRecords(emp.id, records);
        const progress = getNextBadgeProgress(totalRecords);
        if (!heatData) {
          return { employee: emp, heatScore: 0, records: 0, likes: 0, comments: 0, recentRecords: 0, recentLikes: 0, recentComments: 0, ...progress };
        }
        return { employee: emp, heatScore: heatData.heatScore, records: heatData.records, likes: heatData.likes, comments: heatData.comments, recentRecords: heatData.recentRecords, recentLikes: heatData.recentLikes, recentComments: heatData.recentComments, ...progress };
      })
      .sort((a, b) => b.heatScore - a.heatScore);
  }, [employees, heatEmployeeMap, records]);

  const handleRecordsExport = () => {
    const exportData: ExportDataItem[] = employeesWithStats.map((stat, idx) => ({
      rank: idx + 1,
      name: stat.employee.name,
      records: stat.totalRecords,
      likes: stat.totalLikes,
      badge: stat.current.name,
    }));
    const dateStr = formatDateForFilename(new Date());
    const filename = `荣誉墙_累计数据_${dateStr}`;
    exportToExcel(exportData, '荣誉墙', filename);
  };

  const handleHeatExport = () => {
    const exportData: HeatExportDataItem[] = employeesWithHeat
      .filter(e => e.heatScore > 0)
      .map((stat, idx) => ({
        rank: idx + 1,
        name: stat.employee.name,
        heatScore: stat.heatScore,
        records: stat.records,
        likes: stat.likes,
        comments: stat.comments,
      }));
    const dateStr = formatDateForFilename(new Date());
    const filename = `荣誉墙_热度榜_${dateStr}`;
    exportHeatToExcel(exportData, '热度荣誉墙', filename);
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Award className="w-6 h-6 md:w-7 md:h-7 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-slate-800 dark:text-slate-100">英雄荣誉墙</h1>
              <p className="text-sm text-slate-400 dark:text-slate-500">累计数据统计，见证每一位英雄的成长！</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={activeTab === 'records' ? handleRecordsExport : handleHeatExport}
              disabled={activeTab === 'records' ? employeesWithStats.length === 0 : employeesWithHeat.filter(e => e.heatScore > 0).length === 0}
              className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl shadow-card hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'records' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'}`}
            >
              <Download className="w-4 h-4" />
              <span className="font-semibold text-sm">导出</span>
            </button>
          </div>
        </div>

        <div className="mb-6 inline-flex p-1 bg-white dark:bg-slate-800 rounded-xl shadow-card border border-purple-50 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'records'
                ? 'bg-purple-500 text-white shadow-md scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>功勋榜</span>
          </button>
          <button
            onClick={() => setActiveTab('heat')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'heat'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>热度榜</span>
          </button>
        </div>

        {activeTab === 'heat' && (
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-4 md:p-5 border border-orange-100 dark:border-slate-700 animate-fade-in-up mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-base md:text-lg text-slate-800 dark:text-slate-100 mb-1">🔥 累计热度分规则</h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  换水 <span className="font-semibold text-water-600 dark:text-water-400">+10分</span> · 
                  点赞 <span className="font-semibold text-rose-500 dark:text-rose-400">+3分</span> · 
                  评论 <span className="font-semibold text-amber-600 dark:text-amber-400">+2分</span> · 
                  <span className="font-semibold text-orange-600 dark:text-orange-400">近7天内记录加权1.5倍</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {BADGE_LEVELS.map((badge, idx) => (
            <div
              key={badge.level}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card border border-water-50/50 dark:border-slate-700 animate-fade-in-up card-hover"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${badge.bgColor} flex items-center justify-center text-3xl mb-3`}>
                {badge.icon}
              </div>
              <div className={`font-display text-base md:text-lg ${badge.color} mb-1`}>{badge.name}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                累计换水 ≥ {badge.minRecords} 次
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 md:w-6 md:h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100">部门换水统计</h2>
            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500">各部门累计换水量对比</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {departmentStats.map((dept, idx) => {
            const deptConfig = DEPARTMENTS.find(d => d.id === dept.department.id);
            const progress = (dept.totalRecords / maxDeptRecords) * 100;
            return (
              <div
                key={dept.department.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-water-50/50 dark:border-slate-700 animate-fade-in-up card-hover"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${deptConfig?.bgColor || 'bg-slate-100 dark:bg-slate-700'} flex items-center justify-center text-2xl`}>
                    {dept.department.icon}
                  </div>
                  <div>
                    <h3 className={`font-display text-lg ${deptConfig?.color || 'text-slate-700 dark:text-slate-200'}`}>{dept.department.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{dept.employeeCount} 人</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-water-500 dark:text-water-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">累计换水</span>
                      </div>
                      <span className="font-display text-lg gradient-text">{dept.totalRecords} 次</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:h-2.5 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-water-gradient rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-water-50/80 dark:bg-slate-700/40 rounded-xl p-2.5 text-center">
                      <div className="font-display text-lg gradient-text">{dept.totalLiters}L</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">累计换水量</div>
                    </div>
                    <div className="bg-rose-50/80 dark:bg-rose-900/15 rounded-xl p-2.5 text-center">
                      <div className="font-display text-lg text-rose-500 dark:text-rose-400">{dept.totalLikes}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">累计点赞</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>{activeTab === 'records' ? '🌟' : '🔥'}</span>
            <span>{activeTab === 'records' ? '全体英雄' : '热度英雄榜'}</span>
          </h2>
          <div className="text-sm text-slate-400 dark:text-slate-500">
            共 <span className={`font-semibold ${activeTab === 'records' ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {activeTab === 'records' ? employeesWithStats.length : employeesWithHeat.filter(e => e.heatScore > 0).length}
            </span> 位英雄
          </div>
        </div>

        {activeTab === 'records' ? (
          employeesWithStats.length === 0 ? (
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-10 text-center">
              <div className="text-5xl mb-3">👥</div>
              <h3 className="font-display text-lg text-slate-600 dark:text-slate-300 mb-1">暂无英雄数据</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">快去换水，成为第一位上榜的英雄吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {employeesWithStats.map((stat, idx) => (
                <Link
                  key={stat.employee.id}
                  to={`/hero/${stat.employee.id}`}
                  className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-card card-hover overflow-hidden border border-water-50/50 dark:border-slate-700 animate-fade-in-up group block"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {idx === 0 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold shadow-md flex items-center gap-1 z-10">
                      <span>👑</span>
                      <span>No.1</span>
                    </div>
                  )}

                  <div className={`h-2 ${stat.current.bgColor}`} />

                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gradient-to-br from-water-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700/50 flex items-center justify-center text-4xl md:text-5xl border-4 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform">
                          {stat.employee.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${stat.current.bgColor} flex items-center justify-center text-lg border-2 border-white dark:border-slate-800 shadow-sm`}>
                          {stat.current.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-display text-xl text-slate-800 dark:text-slate-100 truncate mb-1 group-hover:text-water-600 dark:group-hover:text-water-400 transition-colors">
                          {stat.employee.name}
                        </h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stat.current.bgColor} ${stat.current.color}`}>
                          <span>{stat.current.name}</span>
                        </div>
                        <div className="mt-1">
                          {(() => {
                            const dept = DEPARTMENTS.find(d => d.id === stat.employee.department);
                            return dept ? (
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${dept.bgColor} ${dept.color}`}>
                                <span>{dept.icon}</span>
                                <span>{dept.name}</span>
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="bg-water-50/80 dark:bg-slate-700/40 rounded-xl p-2 text-center">
                        <Droplets className="w-3 h-3 text-water-500 dark:text-water-400 mx-auto mb-0.5" />
                        <div className="font-display text-lg gradient-text">{stat.totalRecords}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400">换水</div>
                      </div>
                      <div className="bg-amber-50/80 dark:bg-amber-900/15 rounded-xl p-2 text-center">
                        <MessageCircle className="w-3 h-3 text-amber-500 dark:text-amber-400 mx-auto mb-0.5" />
                        <div className="font-display text-lg text-amber-500 dark:text-amber-400">{stat.totalComments}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400">评论</div>
                      </div>
                      <div className="bg-rose-50/80 dark:bg-rose-900/15 rounded-xl p-2 text-center">
                        <Heart className="w-3 h-3 text-rose-500 dark:text-rose-400 fill-rose-500 dark:fill-rose-400 mx-auto mb-0.5" />
                        <div className="font-display text-lg text-rose-500 dark:text-rose-400">{stat.totalLikes}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400">点赞</div>
                      </div>
                      <div className="bg-orange-50/80 dark:bg-orange-900/15 rounded-xl p-2 text-center">
                        <Flame className="w-3 h-3 text-orange-500 dark:text-orange-400 mx-auto mb-0.5" />
                        <div className="font-display text-lg text-orange-500 dark:text-orange-400">{stat.heatScore}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400">热度</div>
                      </div>
                    </div>

                    {stat.next ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">下一等级</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span className={stat.current.color}>{stat.current.icon}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <span className={stat.next.color}>{stat.next.icon}</span>
                            <span className={`font-semibold ${stat.next.color}`}>{stat.next.name}</span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-slate-100 dark:h-2.5 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-700"
                            style={{ width: `${stat.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            还需 {stat.next.minRecords - stat.totalRecords} 次
                          </span>
                          <span className="text-[11px] font-semibold text-purple-500 dark:text-purple-400">{stat.progress}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                        <div className="text-2xl mb-1">🎉</div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">已达最高等级！</div>
                        <div className="text-[11px] text-purple-400 dark:text-purple-300">传说级换水英雄</div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-center gap-1 text-xs text-water-500 dark:text-water-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-medium">查看详情</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          employeesWithHeat.filter(e => e.heatScore > 0).length === 0 ? (
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-10 text-center">
              <div className="text-5xl mb-3">🔥</div>
              <h3 className="font-display text-lg text-slate-600 dark:text-slate-300 mb-1">暂无热度数据</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">换水、点赞、评论都能累积热度，快来上榜吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {employeesWithHeat
                .filter(e => e.heatScore > 0)
                .map((stat, idx) => {
                  const progress = (stat.heatScore / maxHeatScore) * 100;
                  const isRecentActive = stat.recentRecords > 0 || stat.recentLikes > 0 || stat.recentComments > 0;
                  return (
                    <Link
                      key={stat.employee.id}
                      to={`/hero/${stat.employee.id}`}
                      className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-card card-hover overflow-hidden border border-orange-50/50 dark:border-slate-700 animate-fade-in-up group block"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      {idx < 3 && (
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs font-bold shadow-md flex items-center gap-1 z-10 ${
                          idx === 0
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                            : idx === 1
                            ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600'
                        }`}>
                          <span>{idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}</span>
                          <span>No.{idx + 1}</span>
                        </div>
                      )}

                      {isRecentActive && (
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1 z-10 animate-pulse">
                          <TrendingUp className="w-3 h-3" />
                          <span>飙升中</span>
                        </div>
                      )}

                      <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500" />

                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-700/50 flex items-center justify-center text-4xl md:text-5xl border-4 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform">
                              {stat.employee.avatar}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-lg border-2 border-white dark:border-slate-800 shadow-sm">
                              <Flame className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-display text-xl text-slate-800 dark:text-slate-100 truncate mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {stat.employee.name}
                            </h3>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white">
                              <Flame className="w-3 h-3" />
                              <span>热度 {stat.heatScore}</span>
                            </div>
                            <div className="mt-1">
                              {(() => {
                                const dept = DEPARTMENTS.find(d => d.id === stat.employee.department);
                                return dept ? (
                                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${dept.bgColor} ${dept.color}`}>
                                    <span>{dept.icon}</span>
                                    <span>{dept.name}</span>
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                              热度占比
                            </span>
                            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2.5 bg-slate-100 dark:h-2.5 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-700"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-water-50/80 dark:bg-slate-700/40 rounded-xl p-2 text-center">
                            <Droplets className="w-3 h-3 text-water-500 dark:text-water-400 mx-auto mb-0.5" />
                            <div className="flex items-center justify-center gap-0.5">
                              <span className="font-display text-base gradient-text">{stat.records}</span>
                              {stat.recentRecords > 0 && <span className="text-[9px] font-semibold text-orange-500 dark:text-orange-400">+{stat.recentRecords}</span>}
                            </div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">换水</div>
                          </div>
                          <div className="bg-rose-50/80 dark:bg-rose-900/15 rounded-xl p-2 text-center">
                            <Heart className="w-3 h-3 text-rose-500 dark:text-rose-400 fill-rose-500 dark:fill-rose-400 mx-auto mb-0.5" />
                            <div className="flex items-center justify-center gap-0.5">
                              <span className="font-display text-base text-rose-500 dark:text-rose-400">{stat.likes}</span>
                              {stat.recentLikes > 0 && <span className="text-[9px] font-semibold text-orange-500 dark:text-orange-400">+{stat.recentLikes}</span>}
                            </div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">点赞</div>
                          </div>
                          <div className="bg-amber-50/80 dark:bg-amber-900/15 rounded-xl p-2 text-center">
                            <MessageCircle className="w-3 h-3 text-amber-500 dark:text-amber-400 mx-auto mb-0.5" />
                            <div className="flex items-center justify-center gap-0.5">
                              <span className="font-display text-base text-amber-500 dark:text-amber-400">{stat.comments}</span>
                              {stat.recentComments > 0 && <span className="text-[9px] font-semibold text-orange-500 dark:text-orange-400">+{stat.recentComments}</span>}
                            </div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">评论</div>
                          </div>
                        </div>

                        {stat.next ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">称号进度</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <span className={stat.current.color}>{stat.current.icon}</span>
                                <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                <span className={stat.next.color}>{stat.next.icon}</span>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-700"
                                style={{ width: `${stat.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {stat.current.name} → {stat.next.name}
                              </span>
                              <span className="text-[10px] font-semibold text-purple-500 dark:text-purple-400">{stat.progress}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-3 text-center">
                            <div className="text-2xl mb-1">🔥</div>
                            <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">最高热度英雄！</div>
                            <div className="text-[11px] text-orange-400 dark:text-orange-300">传说级热度贡献者</div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-center gap-1 text-xs text-orange-500 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <User className="w-3.5 h-3.5" />
                          <span className="font-medium">查看详情</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )
        )}
      </section>

      <FloatingButton />
    </div>
  );
}
