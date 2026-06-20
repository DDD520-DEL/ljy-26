import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Heart, Award, Clock, TrendingUp, Zap } from 'lucide-react';
import { useAppStore } from '@/store';
import { getEmployeeTotalRecords, getEmployeeTotalLikes, getNextBadgeProgress, getEmployeeRecords, getEmployeeTotalLiters } from '@/utils';
import { DEPARTMENTS, BUCKET_TYPES, BADGE_LEVELS } from '@/constants';
import FloatingButton from '@/components/FloatingButton';

function groupRecordsByDate(records: ReturnType<typeof getEmployeeRecords>) {
  const groups: { date: string; label: string; items: typeof records }[] = [];
  const groupMap = new Map<string, typeof records>();

  records.forEach(record => {
    const d = new Date(record.timestamp);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[d.getDay()];

    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, []);
      groups.push({ date: dateKey, label: `${dayLabel} ${weekday}`, items: groupMap.get(dateKey)! });
    }
    groupMap.get(dateKey)!.push(record);
  });

  return groups;
}

export default function HeroProfile() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { employees, records } = useAppStore();

  const employee = useMemo(
    () => employees.find(e => e.id === employeeId),
    [employees, employeeId]
  );

  const employeeRecords = useMemo(
    () => getEmployeeRecords(employeeId || '', records),
    [employeeId, records]
  );

  const totalRecords = useMemo(
    () => getEmployeeTotalRecords(employeeId || '', records),
    [employeeId, records]
  );

  const totalLikes = useMemo(
    () => getEmployeeTotalLikes(employeeId || '', records),
    [employeeId, records]
  );

  const totalLiters = useMemo(
    () => getEmployeeTotalLiters(employeeId || '', records),
    [employeeId, records]
  );

  const badgeProgress = useMemo(
    () => getNextBadgeProgress(totalRecords),
    [totalRecords]
  );

  const department = useMemo(() => {
    return DEPARTMENTS.find(d => d.id === employee?.department);
  }, [employee]);

  const timelineGroups = useMemo(
    () => groupRecordsByDate(employeeRecords),
    [employeeRecords]
  );

  const currentBadgeIndex = BADGE_LEVELS.findIndex(b => b.level === badgeProgress.current.level);

  if (!employee) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-display text-slate-700 dark:text-slate-200 mb-2">未找到该员工</h2>
          <p className="text-slate-400 dark:text-slate-500 mb-4">这位英雄似乎不存在呢～</p>
          <button
            onClick={() => navigate('/ranking')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-water-500 text-white rounded-xl hover:bg-water-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回排行榜
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-water-600 dark:text-slate-300 dark:hover:text-water-400 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">返回</span>
      </button>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-water-500 via-water-600 to-cyan-600 p-6 md:p-10 text-white shadow-water">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-4 right-8 text-6xl opacity-20 animate-float">💧</div>
        <div className="absolute bottom-6 right-32 text-4xl opacity-15 animate-float delay-200">💧</div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl md:text-7xl border-4 border-white/30 dark:border-slate-700/30 shadow-xl">
              {employee.avatar}
            </div>
            <div className={`absolute -bottom-2 -right-2 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${badgeProgress.current.bgColor} flex items-center justify-center text-2xl md:text-3xl border-4 border-white dark:border-slate-800 shadow-lg`}>
              {badgeProgress.current.icon}
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="font-display text-3xl md:text-4xl mb-2">{employee.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              {department && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm">
                  <span>{department.icon}</span>
                  <span>{department.name}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                <Award className="w-4 h-4" />
                {badgeProgress.current.name}
              </span>
            </div>
            <p className="text-white/70 text-sm">
              累计换水 <span className="font-semibold text-white">{totalRecords}</span> 次 · 获赞 <span className="font-semibold text-white">{totalLikes}</span> 个
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-card border border-water-50/50 dark:border-slate-700 animate-fade-in-up card-hover">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-water-50 dark:bg-slate-700/50 flex items-center justify-center mb-3">
            <Droplets className="w-5 h-5 md:w-6 md:h-6 text-water-500 dark:text-water-400" />
          </div>
          <div className="font-display text-2xl md:text-3xl gradient-text mb-1">{totalRecords}</div>
          <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">累计换水次数</div>
          <div className="mt-2 text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
            共 {totalLiters}L
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-card border border-rose-50/50 dark:border-slate-700 animate-fade-in-up card-hover" style={{ animationDelay: '0.1s' }}>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 md:w-6 md:h-6 text-rose-500 dark:text-rose-400 fill-rose-500" />
          </div>
          <div className="font-display text-2xl md:text-3xl text-rose-500 dark:text-rose-400 mb-1">{totalLikes}</div>
          <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">总获赞数</div>
          <div className="mt-2 text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
            {totalRecords > 0 ? `平均 ${(totalLikes / totalRecords).toFixed(1)} 赞/次` : '暂无数据'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-card border border-amber-50/50 dark:border-slate-700 animate-fade-in-up card-hover" style={{ animationDelay: '0.2s' }}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${badgeProgress.current.bgColor} flex items-center justify-center mb-3 text-xl md:text-2xl`}>
            {badgeProgress.current.icon}
          </div>
          <div className={`font-display text-lg md:text-xl ${badgeProgress.current.color} mb-1 truncate`}>
            {badgeProgress.current.name}
          </div>
          <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">当前徽章等级</div>
          <div className="mt-2 text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
            {badgeProgress.next ? `距下一级 ${badgeProgress.next.minRecords - totalRecords} 次` : '已达最高'}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-7 shadow-card border border-purple-50/50 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100">徽章进阶之路</h2>
            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500">从新手到传奇的成长轨迹</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2">
          {BADGE_LEVELS.map((badge, idx) => {
            const isCurrent = badge.level === badgeProgress.current.level;
            const isUnlocked = idx <= currentBadgeIndex;
            return (
              <div
                key={badge.level}
                className={`flex-shrink-0 flex flex-col items-center gap-2 px-3 md:px-5 py-3 md:py-4 rounded-2xl transition-all ${
                  isCurrent
                    ? `${badge.bgColor} ring-2 ${badge.color} ring-offset-2 shadow-md scale-105`
                    : isUnlocked
                      ? `${badge.bgColor} opacity-70`
                      : 'bg-slate-50 dark:bg-slate-800 opacity-40'
                }`}
              >
                <div className="text-2xl md:text-3xl">{badge.icon}</div>
                <div className={`text-[10px] md:text-xs font-semibold whitespace-nowrap ${isCurrent ? badge.color : 'text-slate-500 dark:text-slate-400'}`}>
                  {badge.name}
                </div>
                <div className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {idx === 0 ? '1次起' : `${badge.minRecords}次`}
                </div>
                {isCurrent && (
                  <div className="flex items-center gap-0.5 text-[9px] md:text-[10px] text-purple-500 dark:text-purple-400 font-semibold">
                    <Zap className="w-3 h-3" />
                    当前
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {badgeProgress.next && (
          <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{badgeProgress.next.icon}</span>
                <div>
                  <div className={`font-display text-sm md:text-base ${badgeProgress.next.color}`}>
                    下一等级：{badgeProgress.next.name}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    还需换水 {badgeProgress.next.minRecords - totalRecords} 次
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl text-purple-600 dark:text-purple-400">{badgeProgress.progress}%</div>
                <div className="h-2 w-20 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${badgeProgress.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-7 shadow-card border border-water-50/50 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-water-100 dark:bg-water-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-water-500 dark:text-water-400" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100">换水历史时间线</h2>
              <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500">共 {employeeRecords.length} 条换水记录</p>
            </div>
          </div>
        </div>

        {employeeRecords.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📝</div>
            <h3 className="font-display text-lg text-slate-600 dark:text-slate-300 mb-1">暂无换水记录</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">快去记录第一次换水吧！</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 md:left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-water-300 via-water-200 to-slate-200 dark:from-water-700 dark:via-water-800 dark:to-slate-700" />
            <div className="space-y-6 md:space-y-8">
              {timelineGroups.map((group) => (
                <div key={group.date}>
                  <div className="relative pl-12 md:pl-16 mb-3">
                    <div className="absolute left-0 md:left-2 top-0.5 w-8 h-8 md:w-10 md:h-10 rounded-full bg-water-500 flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-md z-10">
                      {new Date(group.date).getDate()}
                    </div>
                    <div className="font-display text-sm md:text-base text-slate-700 dark:text-slate-200">{group.label}</div>
                    <div className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">{group.items.length} 次换水</div>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((record) => {
                      const bucket = BUCKET_TYPES.find(b => b.type === record.bucketType);
                      const d = new Date(record.timestamp);
                      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                      return (
                        <div
                            key={record.id}
                            className="relative pl-12 md:pl-16 animate-fade-in-up"
                          >
                            <div className="absolute left-3 md:left-5 top-3 w-2.5 h-2.5 rounded-full bg-water-300 dark:bg-water-700 ring-4 ring-water-50 dark:ring-slate-700 z-10" />

                            <div className="bg-gradient-to-r from-water-50/50 to-cyan-50/50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-3 md:p-4 border border-water-100/50 dark:border-slate-700 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xl md:text-2xl">{bucket?.icon}</span>
                                  <div>
                                    <div className="font-medium text-sm text-slate-700 dark:text-slate-200">{bucket?.label}</div>
                                    <div className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">{bucket?.liters}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
                                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                                    <span className="text-xs md:text-sm font-semibold">{record.likes}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[10px] md:text-xs">{timeStr}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FloatingButton />
    </div>
  );
}
