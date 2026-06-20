import { useMemo, useState } from 'react';
import { Swords, Droplets, Heart, Trophy, TrendingUp, Users, ChevronDown, Crown, Zap } from 'lucide-react';
import { useAppStore } from '@/store';
import { getMonthlyDepartmentStats, getAvailableMonths, formatMonthLabel, type DepartmentStats } from '@/utils';
import { DEPARTMENTS } from '@/constants';

function ProgressBar({
  value,
  maxValue,
  color,
  isLeading,
  showValue,
  unit,
}: {
  value: number;
  maxValue: number;
  color: string;
  isLeading: boolean;
  showValue: number;
  unit: string;
}) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-8 md:h-10 bg-slate-100 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color} ${
            isLeading ? 'animate-pulse-slow' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
        {isLeading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 animate-bounce" />
          </div>
        )}
      </div>
      <div className="text-right min-w-[5rem]">
        <div className={`font-display text-lg md:text-xl ${isLeading ? 'text-yellow-600' : 'text-slate-700'}`}>
          {showValue.toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-400">{unit}</div>
      </div>
    </div>
  );
}

function DepartmentCard({
  dept,
  rank,
  maxRecords,
  maxLikes,
}: {
  dept: DepartmentStats;
  rank: number;
  maxRecords: number;
  maxLikes: number;
}) {
  const isLeading = rank === 1;
  const colors = {
    rd: {
      bar: 'bg-gradient-to-r from-blue-400 to-blue-600',
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      glow: 'shadow-blue-200',
    },
    marketing: {
      bar: 'bg-gradient-to-r from-orange-400 to-orange-600',
      border: 'border-orange-200',
      bg: 'bg-orange-50',
      glow: 'shadow-orange-200',
    },
    admin: {
      bar: 'bg-gradient-to-r from-green-400 to-green-600',
      border: 'border-green-200',
      bg: 'bg-green-50',
      glow: 'shadow-green-200',
    },
  };

  const colorScheme = colors[dept.department.id];

  return (
    <div
      className={`relative rounded-3xl p-5 md:p-6 border-2 transition-all duration-500 ${
        isLeading
          ? `${colorScheme.border} ${colorScheme.bg} shadow-lg ${colorScheme.glow} scale-[1.02]`
          : 'border-slate-100 bg-white shadow-card hover:shadow-md'
      }`}
    >
      {isLeading && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Crown className="w-3 h-3" />
            领先
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl ${
            isLeading ? 'bg-gradient-to-br from-yellow-100 to-amber-200' : dept.department.bgColor
          } ${isLeading ? 'animate-pulse-slow' : ''}`}
        >
          {dept.department.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-display text-lg md:text-xl ${dept.department.color}`}>
              {dept.department.name}
            </h3>
            {rank === 1 && <span className="text-xl">🥇</span>}
            {rank === 2 && <span className="text-xl">🥈</span>}
            {rank === 3 && <span className="text-xl">🥉</span>}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Users className="w-3 h-3" />
            <span>{dept.employeeCount} 人参与</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Droplets className="w-4 h-4 text-water-500" />
              <span>换水总量</span>
            </div>
            <div className="text-xs text-slate-400">
              {dept.totalLiters} L
            </div>
          </div>
          <ProgressBar
            value={dept.totalRecords}
            maxValue={maxRecords}
            color={colorScheme.bar}
            isLeading={dept.totalRecords === maxRecords}
            showValue={dept.totalRecords}
            unit="次换水"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>获赞总数</span>
            </div>
          </div>
          <ProgressBar
            value={dept.totalLikes}
            maxValue={maxLikes}
            color="bg-gradient-to-r from-rose-400 to-pink-500"
            isLeading={dept.totalLikes === maxLikes && maxLikes > 0}
            showValue={dept.totalLikes}
            unit="个赞"
          />
        </div>
      </div>
    </div>
  );
}

function GapIndicator({
  label,
  leading,
  second,
  unit,
  icon,
  color,
}: {
  label: string;
  leading: DepartmentStats;
  second: DepartmentStats;
  unit: string;
  icon: React.ReactNode;
  color: string;
}) {
  const gap = leading.totalRecords - second.totalRecords;
  const gapLikes = leading.totalLikes - second.totalLikes;

  return (
    <div className={`rounded-2xl p-4 border border-slate-100 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{leading.department.icon}</span>
          <span className={`font-bold ${leading.department.color}`}>
            {leading.department.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-display font-bold text-lg">
            +{gap}
          </div>
          <span className="text-xs text-slate-400">{unit}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${second.department.color}`}>
            {second.department.name}
          </span>
          <span className="text-xl">{second.department.icon}</span>
        </div>
      </div>
      {gapLikes > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">点赞差距</span>
          <span className="font-semibold text-rose-500">+{gapLikes} 赞</span>
        </div>
      )}
    </div>
  );
}

export default function DepartmentBattle() {
  const { employees, records } = useAppStore();
  const availableMonths = useMemo(() => getAvailableMonths(), []);
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const deptStats = useMemo(
    () => getMonthlyDepartmentStats(employees, records, selectedMonth.year, selectedMonth.month),
    [employees, records, selectedMonth]
  );

  const maxRecords = useMemo(
    () => Math.max(...deptStats.map(d => d.totalRecords), 1),
    [deptStats]
  );

  const maxLikes = useMemo(
    () => Math.max(...deptStats.map(d => d.totalLikes), 1),
    [deptStats]
  );

  const totalRecords = useMemo(
    () => deptStats.reduce((sum, d) => sum + d.totalRecords, 0),
    [deptStats]
  );

  const totalLikes = useMemo(
    () => deptStats.reduce((sum, d) => sum + d.totalLikes, 0),
    [deptStats]
  );

  const totalLiters = useMemo(
    () => deptStats.reduce((sum, d) => sum + d.totalLiters, 0),
    [deptStats]
  );

  const leadingDept = deptStats[0];
  const secondDept = deptStats[1];
  const thirdDept = deptStats[2];

  const stats = [
    { label: '部门换水总量', value: totalRecords, unit: '次', icon: '🪣', color: 'from-blue-400 to-water-600' },
    { label: '部门总换水量', value: `${totalLiters.toFixed(1)}L`, unit: '', icon: '💧', color: 'from-cyan-400 to-teal-500' },
    { label: '部门获赞总数', value: totalLikes, unit: '个', icon: '❤️', color: 'from-rose-400 to-pink-500' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <Swords className="w-6 h-6 md:w-7 md:h-7 text-purple-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-slate-800">部门对战</h1>
              <p className="text-sm text-slate-400">三大部门同台竞技，谁是供水最强部门？</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2.5 bg-white rounded-xl shadow-card hover:shadow-md transition-all border border-slate-100"
            >
              <span className="font-semibold text-slate-700">{formatMonthLabel(selectedMonth.year, selectedMonth.month)}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 md:w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-bounce-in">
                {availableMonths.map(month => (
                  <button
                    key={`${month.year}-${month.month}`}
                    onClick={() => {
                      setSelectedMonth(month);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      month.year === selectedMonth.year && month.month === selectedMonth.month
                        ? 'bg-purple-50 text-purple-600 font-semibold'
                        : 'text-slate-600 hover:bg-purple-50/50'
                    }`}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 md:p-5 shadow-card border border-slate-100 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-xs text-slate-400">{stat.label}</span>
              </div>
              <div className={`font-display text-xl md:text-2xl bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}{stat.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalRecords > 0 && leadingDept && secondDept && (
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display text-lg md:text-xl text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span>实时差距</span>
          </h2>
          <div className="space-y-3">
            <GapIndicator
              label="换水差距"
              leading={leadingDept}
              second={secondDept}
              unit="次换水"
              icon={<Droplets className="w-4 h-4" />}
              color="bg-gradient-to-r from-blue-50/50 to-cyan-50/50"
            />
            {thirdDept && secondDept.totalRecords > thirdDept.totalRecords && (
              <GapIndicator
                label="亚军之争"
                leading={secondDept}
                second={thirdDept}
                unit="次换水"
                icon={<Droplets className="w-4 h-4" />}
                color="bg-gradient-to-r from-slate-50/50 to-gray-50/50"
              />
            )}
          </div>
        </section>
      )}

      <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="font-display text-lg md:text-xl text-slate-800 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>部门战绩</span>
        </h2>

        {totalRecords === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-10 text-center shadow-card">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="font-display text-lg text-slate-600 mb-1">本月对战尚未开始</h3>
            <p className="text-sm text-slate-400">各部门还没有换水记录，快来为你的部门争光！</p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {deptStats.map((dept, idx) => (
              <DepartmentCard
                key={dept.department.id}
                dept={dept}
                rank={idx + 1}
                maxRecords={maxRecords}
                maxLikes={maxLikes}
              />
            ))}
          </div>
        )}
      </section>

      {totalRecords > 0 && (
        <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-5 md:p-6 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-base md:text-lg text-slate-800 mb-1">
                  🏆 {formatMonthLabel(selectedMonth.year, selectedMonth.month)} 冠军部门
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  恭喜 <span className={`font-bold ${leadingDept.department.color}`}>
                    {leadingDept.department.icon} {leadingDept.department.name}
                  </span> 以 <span className="font-bold text-water-600">{leadingDept.totalRecords} 次换水</span> 和{' '}
                  <span className="font-bold text-rose-500">{leadingDept.totalLikes} 个赞</span> 的成绩，
                  成为本月最强供水部门！🎉
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DEPARTMENTS.map(dept => {
                    const stat = deptStats.find(s => s.department.id === dept.id);
                    return (
                      <div
                        key={dept.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${dept.bgColor} ${dept.color}`}
                      >
                        <span>{dept.icon}</span>
                        <span>{dept.name}</span>
                        <span className="font-bold">{stat?.totalRecords || 0}次</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
