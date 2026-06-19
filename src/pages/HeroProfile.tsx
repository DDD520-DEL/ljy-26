import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Heart, Target, Award, Clock, Droplet, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { getEmployeeTotalRecords, getEmployeeTotalLikes, getNextBadgeProgress, getEmployeeRecords, getEmployeeTotalLiters, generatePersonalComment, formatFullTime, getEmployeeTotalComments } from '@/utils';
import { DEPARTMENTS, BUCKET_TYPES } from '@/constants';
import FloatingButton from '@/components/FloatingButton';

export default function HeroProfile() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { employees, records, comments } = useAppStore();

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

  const totalComments = useMemo(
    () => getEmployeeTotalComments(employeeId || '', records, comments),
    [employeeId, records, comments]
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

  const personalComment = useMemo(() => {
    if (!employee) return '';
    return generatePersonalComment(
      employee.name,
      totalRecords,
      totalLikes,
      badgeProgress.current.name,
      department?.name || '公司'
    );
  }, [employee, totalRecords, totalLikes, badgeProgress, department]);

  const stats = [
    { label: '总换水次数', value: totalRecords, icon: Droplets, gradId: 'grad-blue', bgColor: 'bg-water-50' },
    { label: '总获赞数', value: totalLikes, icon: Heart, gradId: 'grad-rose', bgColor: 'bg-rose-50' },
    { label: '总换水量', value: `${totalLiters}L`, icon: Droplet, gradId: 'grad-cyan', bgColor: 'bg-cyan-50' },
    { label: '总评论数', value: totalComments, icon: MessageCircle, gradId: 'grad-amber', bgColor: 'bg-amber-50' },
  ];

  if (!employee) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-display text-slate-700 mb-2">未找到该员工</h2>
          <p className="text-slate-400 mb-4">这位英雄似乎不存在呢～</p>
          <button
            onClick={() => navigate('/hall-of-fame')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-water-500 text-white rounded-xl hover:bg-water-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回荣誉墙
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-water-600 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-sm"
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
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl md:text-7xl border-4 border-white/30 shadow-xl">
              {employee.avatar}
            </div>
            <div className={`absolute -bottom-2 -right-2 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${badgeProgress.current.bgColor} flex items-center justify-center text-2xl md:text-3xl border-4 border-white shadow-lg`}>
              {badgeProgress.current.icon}
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="font-display text-3xl md:text-4xl mb-2">{employee.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
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
            <p className="text-white/80 text-sm md:text-base max-w-xl">
              {personalComment}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          const isHeart = stat.icon === Heart;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 md:p-5 shadow-card border border-water-50/50 animate-fade-in-up card-hover"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                <IconComponent
                  className="w-5 h-5 md:w-6 md:h-6"
                  stroke={`url(#${stat.gradId})`}
                  fill={isHeart ? `url(#${stat.gradId})` : 'none'}
                />
              </div>
              <div className="font-display text-2xl md:text-3xl gradient-text mb-1">{stat.value}</div>
              <div className="text-xs md:text-sm text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl p-5 md:p-7 shadow-card border border-water-50/50">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="font-display text-xl md:text-2xl text-slate-800">称号进度</h2>
            <p className="text-xs md:text-sm text-slate-400">当前称号与下一等级</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${badgeProgress.current.bgColor} flex items-center justify-center text-4xl md:text-5xl shadow-inner`}>
            {badgeProgress.current.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className={`font-display text-lg md:text-xl ${badgeProgress.current.color}`}>
                  {badgeProgress.current.name}
                </div>
                <div className="text-xs text-slate-400">当前称号</div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl md:text-3xl gradient-text">{badgeProgress.progress}%</div>
                <div className="text-xs text-slate-400">完成度</div>
              </div>
            </div>
            <div className="h-3 md:h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000"
                style={{ width: `${badgeProgress.progress}%` }}
              />
            </div>
          </div>
          {badgeProgress.next && (
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${badgeProgress.next.bgColor} flex items-center justify-center text-4xl md:text-5xl opacity-60`}>
              {badgeProgress.next.icon}
            </div>
          )}
        </div>

        {badgeProgress.next ? (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{badgeProgress.next.icon}</span>
                <div>
                  <div className={`font-display text-base ${badgeProgress.next.color}`}>
                    下一等级：{badgeProgress.next.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    需要累计换水 {badgeProgress.next.minRecords} 次
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl text-purple-600">
                  {badgeProgress.next.minRecords - totalRecords}
                </div>
                <div className="text-xs text-slate-400">还需</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-2">🎉🏆🎉</div>
            <div className="font-display text-lg text-amber-600">恭喜！已达最高等级</div>
            <div className="text-xs text-amber-400">传说级换水英雄，实至名归！</div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-5 md:p-7 shadow-card border border-water-50/50">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-water-100 flex items-center justify-center">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-water-500" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl text-slate-800">历史换水记录</h2>
              <p className="text-xs md:text-sm text-slate-400">共 {employeeRecords.length} 条记录</p>
            </div>
          </div>
        </div>

        {employeeRecords.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📝</div>
            <h3 className="font-display text-lg text-slate-600 mb-1">暂无换水记录</h3>
            <p className="text-sm text-slate-400">快去记录第一次换水吧！</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 md:left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-water-200 via-water-100 to-slate-100" />
            <div className="space-y-4 md:space-y-5">
              {employeeRecords.map((record, idx) => {
                const bucket = BUCKET_TYPES.find(b => b.type === record.bucketType);
                return (
                  <div
                    key={record.id}
                    className="relative pl-12 md:pl-16 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="absolute left-0 md:left-2 top-1 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-4 border-water-200 flex items-center justify-center text-lg md:text-xl shadow-md z-10">
                      💧
                    </div>

                    <div className="bg-gradient-to-r from-water-50/60 to-cyan-50/60 rounded-2xl p-4 border border-water-100/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl md:text-3xl">{bucket?.icon}</span>
                          <div>
                            <div className="font-semibold text-slate-700">{bucket?.label}</div>
                            <div className="text-xs text-slate-400">{bucket?.liters}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-rose-500">
                            <Heart className="w-4 h-4 fill-rose-500" />
                            <span className="text-sm font-semibold">{record.likes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatFullTime(record.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <FloatingButton />
    </div>
  );
}
