import { useMemo } from 'react';
import { Award, Heart, Droplets, Target, ChevronRight, Building2, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { getEmployeeTotalRecords, getEmployeeTotalLikes, getNextBadgeProgress, getDepartmentStats, getEmployeeTotalComments } from '@/utils';
import { BADGE_LEVELS, DEPARTMENTS } from '@/constants';
import FloatingButton from '@/components/FloatingButton';

export default function HallOfFame() {
  const { employees, records, comments } = useAppStore();

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
        const progress = getNextBadgeProgress(totalRecords);
        return { employee: emp, totalRecords, totalLikes, totalComments, ...progress };
      })
      .sort((a, b) => {
        if (b.totalRecords !== a.totalRecords) return b.totalRecords - a.totalRecords;
        if (b.totalComments !== a.totalComments) return b.totalComments - a.totalComments;
        return b.totalLikes - a.totalLikes;
      });
  }, [employees, records, comments]);

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
            <Award className="w-6 h-6 md:w-7 md:h-7 text-purple-500" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-slate-800">英雄荣誉墙</h1>
            <p className="text-sm text-slate-400">累计数据统计，见证每一位英雄的成长！</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {BADGE_LEVELS.map((badge, idx) => (
            <div
              key={badge.level}
              className="bg-white rounded-2xl p-4 shadow-card border border-water-50/50 animate-fade-in-up card-hover"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${badge.bgColor} flex items-center justify-center text-3xl mb-3`}>
                {badge.icon}
              </div>
              <div className={`font-display text-base md:text-lg ${badge.color} mb-1`}>{badge.name}</div>
              <div className="text-xs text-slate-400">
                累计换水 ≥ {badge.minRecords} 次
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-cyan-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="font-display text-xl md:text-2xl text-slate-800">部门换水统计</h2>
            <p className="text-xs md:text-sm text-slate-400">各部门累计换水量对比</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {departmentStats.map((dept, idx) => {
            const deptConfig = DEPARTMENTS.find(d => d.id === dept.department.id);
            const progress = (dept.totalRecords / maxDeptRecords) * 100;
            return (
              <div
                key={dept.department.id}
                className="bg-white rounded-2xl p-5 shadow-card border border-water-50/50 animate-fade-in-up card-hover"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${deptConfig?.bgColor || 'bg-slate-100'} flex items-center justify-center text-2xl`}>
                    {dept.department.icon}
                  </div>
                  <div>
                    <h3 className={`font-display text-lg ${deptConfig?.color || 'text-slate-700'}`}>{dept.department.name}</h3>
                    <p className="text-xs text-slate-400">{dept.employeeCount} 人</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-water-500" />
                        <span className="text-xs text-slate-500">累计换水</span>
                      </div>
                      <span className="font-display text-lg gradient-text">{dept.totalRecords} 次</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-water-gradient rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-water-50/80 rounded-xl p-2.5 text-center">
                      <div className="font-display text-lg gradient-text">{dept.totalLiters}L</div>
                      <div className="text-[10px] text-slate-400">累计换水量</div>
                    </div>
                    <div className="bg-rose-50/80 rounded-xl p-2.5 text-center">
                      <div className="font-display text-lg text-rose-500">{dept.totalLikes}</div>
                      <div className="text-[10px] text-slate-400">累计点赞</div>
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
          <h2 className="font-display text-xl md:text-2xl text-slate-800 flex items-center gap-2">
            <span>🌟</span>
            <span>全体英雄</span>
          </h2>
          <div className="text-sm text-slate-400">
            共 <span className="font-semibold text-water-600">{employeesWithStats.length}</span> 位英雄
          </div>
        </div>

        {employeesWithStats.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-10 text-center">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="font-display text-lg text-slate-600 mb-1">暂无英雄数据</h3>
            <p className="text-sm text-slate-400">快去换水，成为第一位上榜的英雄吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {employeesWithStats.map((stat, idx) => (
              <div
                key={stat.employee.id}
                className="relative bg-white rounded-3xl shadow-card card-hover overflow-hidden border border-water-50/50 animate-fade-in-up group"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {idx === 0 && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold shadow-md flex items-center gap-1">
                    <span>👑</span>
                    <span>No.1</span>
                  </div>
                )}

                <div className={`h-2 ${stat.current.bgColor}`} />

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gradient-to-br from-water-50 to-cyan-50 flex items-center justify-center text-4xl md:text-5xl border-4 border-white shadow-md">
                        {stat.employee.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${stat.current.bgColor} flex items-center justify-center text-lg border-2 border-white shadow-sm`}>
                        {stat.current.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-display text-xl text-slate-800 truncate mb-1">
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

                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    <div className="bg-water-50/80 rounded-xl p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Droplets className="w-3 h-3 text-water-500" />
                        <span className="text-[10px] text-slate-500">换水</span>
                      </div>
                      <div className="font-display text-xl gradient-text">{stat.totalRecords}</div>
                    </div>
                    <div className="bg-amber-50/80 rounded-xl p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MessageCircle className="w-3 h-3 text-amber-500 fill-amber-200" />
                        <span className="text-[10px] text-slate-500">评论</span>
                      </div>
                      <div className="font-display text-xl text-amber-500">{stat.totalComments}</div>
                    </div>
                    <div className="bg-rose-50/80 rounded-xl p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        <span className="text-[10px] text-slate-500">点赞</span>
                      </div>
                      <div className="font-display text-xl text-rose-500">{stat.totalLikes}</div>
                    </div>
                  </div>

                  {stat.next ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-purple-500" />
                          <span className="text-xs font-medium text-slate-600">下一等级</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className={stat.current.color}>{stat.current.icon}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span className={stat.next.color}>{stat.next.icon}</span>
                          <span className={`font-semibold ${stat.next.color}`}>{stat.next.name}</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-700"
                          style={{ width: `${stat.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[11px] text-slate-400">
                          还需 {stat.next.minRecords - stat.totalRecords} 次
                        </span>
                        <span className="text-[11px] font-semibold text-purple-500">{stat.progress}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">🎉</div>
                      <div className="text-xs text-purple-600 font-semibold">已达最高等级！</div>
                      <div className="text-[11px] text-purple-400">传说级换水英雄</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <FloatingButton />
    </div>
  );
}
