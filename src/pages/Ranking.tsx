import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Heart, Users, ChevronDown, BarChart3, Download, Flame, Droplets, MessageCircle, Share2, Settings, Trash2, X, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store';
import { getMonthlyRanking, getAvailableMonths, formatMonthLabel, exportToExcel, formatDateForFilename, type ExportDataItem, getMonthlyHeatRanking, exportHeatToExcel, type HeatExportDataItem, generateWaterRankingImage, generateHeatRankingImage, downloadImage } from '@/utils';
import type { Department, RankingEntry, HeatRankingEmployee } from '@/types';
import { DEPARTMENTS } from '@/constants';
import FloatingButton from '@/components/FloatingButton';
import MonthlyTrendChart from '@/components/MonthlyTrendChart';

type RankingTab = 'water' | 'heat';

function Top3Water({ ranking }: { ranking: RankingEntry[] }) {
  const top3 = ranking.slice(0, 3);
  const hasData = top3.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center shadow-card animate-fade-in-up">
        <div className="text-6xl mb-4">🪣</div>
        <h3 className="font-display text-xl text-slate-600 dark:text-slate-300 mb-2">本月榜单虚位以待</h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm">还没有换水记录，快去成为第一个换水英雄吧！</p>
      </div>
    );
  }

  const medalConfig = [
    { rank: 2, label: '亚军', medal: '🥈', borderColor: 'from-gray-200 via-gray-300 to-gray-400', size: 'md', translateY: 'md:translate-y-2' },
    { rank: 1, label: '冠军', medal: '🥇', borderColor: 'from-yellow-300 via-yellow-400 to-amber-500', size: 'lg', translateY: 'md:-translate-y-6', crown: true },
    { rank: 3, label: '季军', medal: '🥉', borderColor: 'from-orange-300 via-amber-500 to-orange-700', size: 'md', translateY: 'md:translate-y-4' },
  ];

  const ordered: Array<{ config: typeof medalConfig[0]; entry: RankingEntry | null }> = [
    { config: medalConfig[0], entry: top3[1] || null },
    { config: medalConfig[1], entry: top3[0] || null },
    { config: medalConfig[2], entry: top3[2] || null },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-end justify-center gap-3 md:gap-6">
        {ordered.map(({ config, entry }, idx) => (
          <div key={config.rank} className={`flex-1 max-w-xs ${config.translateY} transition-all duration-500`}>
            {entry ? (
              <Link to={`/hero/${entry.employee.id}`} className={`relative bg-white dark:bg-slate-800 rounded-3xl shadow-card card-hover overflow-hidden border-2 bg-gradient-to-br ${config.borderColor} p-[2px] block`}>
                <div className="bg-white dark:bg-slate-800 rounded-[22px] p-4 md:p-6 relative group">
                  {config.crown && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl md:text-4xl animate-float z-10">👑</div>}
                  <div className="text-center mb-3">
                    <div className="text-2xl mb-1">{config.medal}</div>
                    <div className={`text-xs font-semibold bg-gradient-to-r ${config.borderColor} bg-clip-text text-transparent`}>{config.label}</div>
                  </div>
                  <div className={`relative mx-auto ${config.rank === 1 ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20'} rounded-full overflow-hidden mb-3 bg-water-50 dark:bg-slate-700/50 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-105 transition-transform`}>
                    <div className={config.rank === 1 ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'}>{entry.employee.avatar}</div>
                  </div>
                  <h3 className={`font-display text-center ${config.rank === 1 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'} text-slate-800 dark:text-slate-100 mb-1 truncate group-hover:text-water-600 transition-colors`}>{entry.employee.name}</h3>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${entry.badge.bgColor} ${entry.badge.color} text-xs font-medium mx-auto`}>
                    <span>{entry.badge.icon}</span>
                    <span>{entry.badge.name}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <Droplets className="w-4 h-4 text-water-500 dark:text-water-400 mx-auto mb-1" />
                        <div className={`font-display ${config.rank === 1 ? 'text-2xl' : 'text-xl'} gradient-text`}>{entry.records}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">换水次数</div>
                      </div>
                      <div className="text-center">
                        <Heart className="w-4 h-4 text-rose-400 fill-rose-400 mx-auto mb-1" />
                        <div className={`font-display ${config.rank === 1 ? 'text-2xl' : 'text-xl'} text-rose-500`}>{entry.likes}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">获得点赞</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 border-dashed border-slate-200 dark:border-dashed dark:border-slate-600 min-h-[280px] md:min-h-[320px] flex flex-col items-center justify-center">
                <div className="text-4xl mb-2 opacity-30">{config.medal}</div>
                <div className="text-slate-400 dark:text-slate-500 text-sm">虚位以待</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Top3Heat({ ranking }: { ranking: HeatRankingEmployee[] }) {
  const top3 = ranking.slice(0, 3);
  const hasData = top3.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center shadow-card animate-fade-in-up">
        <div className="text-6xl mb-4">🔥</div>
        <h3 className="font-display text-xl text-slate-600 dark:text-slate-300 mb-2">热度榜虚位以待</h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm">换水、点赞、评论都能累积热度，快来上榜吧！</p>
      </div>
    );
  }

  const medalConfig = [
    { rank: 2, label: '热度亚军', medal: '🥈', borderColor: 'from-gray-200 via-gray-300 to-gray-400', size: 'md', translateY: 'md:translate-y-2', bgGradient: 'from-orange-400 to-amber-500' },
    { rank: 1, label: '热度冠军', medal: '🥇', borderColor: 'from-orange-400 via-red-500 to-pink-500', size: 'lg', translateY: 'md:-translate-y-6', crown: true, bgGradient: 'from-red-500 to-orange-500' },
    { rank: 3, label: '热度季军', medal: '🥉', borderColor: 'from-amber-400 via-orange-500 to-yellow-600', size: 'md', translateY: 'md:translate-y-4', bgGradient: 'from-amber-400 to-orange-500' },
  ];

  const ordered: Array<{ config: typeof medalConfig[0]; entry: HeatRankingEmployee | null }> = [
    { config: medalConfig[0], entry: top3[1] || null },
    { config: medalConfig[1], entry: top3[0] || null },
    { config: medalConfig[2], entry: top3[2] || null },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-end justify-center gap-3 md:gap-6">
        {ordered.map(({ config, entry }, idx) => (
          <div key={config.rank} className={`flex-1 max-w-xs ${config.translateY} transition-all duration-500`}>
            {entry ? (
              <Link to={`/hero/${entry.employeeId}`} className={`relative bg-white dark:bg-slate-800 rounded-3xl shadow-card card-hover overflow-hidden border-2 bg-gradient-to-br ${config.borderColor} p-[2px] block`}>
                <div className="bg-white dark:bg-slate-800 rounded-[22px] p-4 md:p-6 relative group">
                  {config.crown && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl md:text-4xl animate-float z-10">👑</div>}
                  <div className="text-center mb-3">
                    <div className="text-2xl mb-1">{config.medal}</div>
                    <div className={`text-xs font-semibold bg-gradient-to-r ${config.bgGradient} bg-clip-text text-transparent`}>{config.label}</div>
                  </div>
                  <div className={`relative mx-auto ${config.rank === 1 ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20'} rounded-full overflow-hidden mb-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-105 transition-transform`}>
                    <div className={config.rank === 1 ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'}>{entry.employeeAvatar}</div>
                  </div>
                  <h3 className={`font-display text-center ${config.rank === 1 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'} text-slate-800 dark:text-slate-100 mb-1 truncate group-hover:text-orange-600 transition-colors`}>{entry.employeeName}</h3>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${config.bgGradient} text-white text-xs font-medium mx-auto`}>
                    <Flame className="w-3 h-3" />
                    <span>热度 {entry.heatScore}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <Droplets className="w-3.5 h-3.5 text-water-500 dark:text-water-400 mx-auto mb-0.5" />
                        <div className="font-display text-lg gradient-text">{entry.records}</div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500">换水</div>
                      </div>
                      <div className="text-center">
                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 mx-auto mb-0.5" />
                        <div className="font-display text-lg text-rose-500">{entry.likes}</div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500">点赞</div>
                      </div>
                      <div className="text-center">
                        <MessageCircle className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                        <div className="font-display text-lg text-amber-500">{entry.comments}</div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500">评论</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 border-dashed border-slate-200 dark:border-dashed dark:border-slate-600 min-h-[280px] md:min-h-[320px] flex flex-col items-center justify-center">
                <div className="text-4xl mb-2 opacity-30">{config.medal}</div>
                <div className="text-slate-400 dark:text-slate-500 text-sm">虚位以待</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Ranking() {
  const { employees, records, comments, clearAllData } = useAppStore();
  const availableMonths = useMemo(() => getAvailableMonths(), []);

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | 'all'>('all');
  const [activeTab, setActiveTab] = useState<RankingTab>('water');
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filteredEmployees = useMemo(() => {
    if (selectedDept === 'all') return employees;
    return employees.filter(e => e.department === selectedDept);
  }, [employees, selectedDept]);

  const filteredRecords = useMemo(() => {
    if (selectedDept === 'all') return records;
    const deptIds = new Set(filteredEmployees.map(e => e.id));
    return records.filter(r => deptIds.has(r.employeeId));
  }, [records, filteredEmployees, selectedDept]);

  const filteredComments = useMemo(() => {
    if (selectedDept === 'all') return comments;
    const deptIds = new Set(filteredEmployees.map(e => e.id));
    const deptRecordIds = new Set(filteredRecords.map(r => r.id));
    return comments.filter(c => deptRecordIds.has(c.recordId) && deptIds.has(c.employeeId));
  }, [comments, filteredEmployees, filteredRecords, selectedDept]);

  const waterRanking = useMemo(
    () => getMonthlyRanking(filteredRecords, filteredEmployees, selectedMonth.year, selectedMonth.month),
    [filteredRecords, filteredEmployees, selectedMonth]
  );

  const heatRanking = useMemo(
    () => getMonthlyHeatRanking(filteredRecords, filteredEmployees, filteredComments, selectedMonth.year, selectedMonth.month),
    [filteredRecords, filteredEmployees, filteredComments, selectedMonth]
  );

  const currentRanking = activeTab === 'water' ? waterRanking : heatRanking;

  const waterStats = useMemo(() => {
    const monthRecords = filteredRecords.filter(r => {
      const d = new Date(r.timestamp);
      return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month;
    });
    const totalLikes = monthRecords.reduce((sum, r) => sum + r.likes, 0);
    return {
      records: monthRecords.length,
      likes: totalLikes,
      people: waterRanking.length,
    };
  }, [filteredRecords, waterRanking, selectedMonth]);

  const heatStats = useMemo(() => {
    const totalHeat = heatRanking.reduce((sum, e) => sum + e.heatScore, 0);
    const totalComments = heatRanking.reduce((sum, e) => sum + e.comments, 0);
    const totalRecords = heatRanking.reduce((sum, e) => sum + e.records, 0);
    return {
      totalHeat: Math.round(totalHeat * 10) / 10,
      totalComments,
      totalRecords,
      people: heatRanking.length,
    };
  }, [heatRanking]);

  const maxRecords = waterRanking[0]?.records || 1;
  const maxHeat = heatRanking[0]?.heatScore || 1;

  const rankBadges = ['🥇', '🥈', '🥉'];

  const handleWaterExport = () => {
    const exportData: ExportDataItem[] = waterRanking.map((entry, idx) => ({
      rank: idx + 1,
      name: entry.employee.name,
      records: entry.records,
      likes: entry.likes,
      badge: entry.badge.name,
    }));
    const dateStr = formatDateForFilename(new Date());
    const monthLabel = formatMonthLabel(selectedMonth.year, selectedMonth.month).replace(/年|月/g, '');
    const filename = `月度换水榜_${monthLabel}_${dateStr}`;
    const sheetName = formatMonthLabel(selectedMonth.year, selectedMonth.month);
    exportToExcel(exportData, sheetName, filename);
  };

  const handleHeatExport = () => {
    const exportData: HeatExportDataItem[] = heatRanking.map((entry, idx) => ({
      rank: idx + 1,
      name: entry.employeeName,
      heatScore: entry.heatScore,
      records: entry.records,
      likes: entry.likes,
      comments: entry.comments,
    }));
    const dateStr = formatDateForFilename(new Date());
    const monthLabel = formatMonthLabel(selectedMonth.year, selectedMonth.month).replace(/年|月/g, '');
    const filename = `月度热度榜_${monthLabel}_${dateStr}`;
    const sheetName = formatMonthLabel(selectedMonth.year, selectedMonth.month);
    exportHeatToExcel(exportData, sheetName, filename);
  };

  const handleShareWaterImage = async () => {
    if (waterRanking.length === 0) return;
    setIsExportingImage(true);
    try {
      const dataUrl = await generateWaterRankingImage({
        year: selectedMonth.year,
        month: selectedMonth.month,
        ranking: waterRanking,
        totalRecords: waterStats.records,
        totalLikes: waterStats.likes,
        totalPeople: waterStats.people,
      });
      const dateStr = formatDateForFilename(new Date());
      const monthLabel = formatMonthLabel(selectedMonth.year, selectedMonth.month).replace(/年|月/g, '');
      downloadImage(dataUrl, `月度换水榜_${monthLabel}_${dateStr}.png`);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleShareHeatImage = async () => {
    if (heatRanking.length === 0) return;
    setIsExportingImage(true);
    try {
      const dataUrl = await generateHeatRankingImage({
        year: selectedMonth.year,
        month: selectedMonth.month,
        ranking: heatRanking,
        totalHeat: heatStats.totalHeat,
        totalRecords: heatStats.totalRecords,
        totalComments: heatStats.totalComments,
        totalPeople: heatStats.people,
      });
      const dateStr = formatDateForFilename(new Date());
      const monthLabel = formatMonthLabel(selectedMonth.year, selectedMonth.month).replace(/年|月/g, '');
      downloadImage(dataUrl, `月度热度榜_${monthLabel}_${dateStr}.png`);
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 md:w-7 md:h-7 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-slate-800 dark:text-slate-100">月度排行榜</h1>
              <p className="text-sm text-slate-400 dark:text-slate-500">按月统计换水英雄的排名情况</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={activeTab === 'water' ? handleShareWaterImage : handleShareHeatImage}
              disabled={currentRanking.length === 0 || isExportingImage}
              className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl shadow-card hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'water' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'}`}
            >
              <Share2 className="w-4 h-4" />
              <span className="font-semibold text-sm">{isExportingImage ? '生成中...' : '分享图片'}</span>
            </button>

            <button
              onClick={activeTab === 'water' ? handleWaterExport : handleHeatExport}
              disabled={currentRanking.length === 0}
              className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl shadow-card hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'water' ? 'bg-water-500 hover:bg-water-600' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'}`}
            >
              <Download className="w-4 h-4" />
              <span className="font-semibold text-sm">导出 Excel</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-card hover:shadow-md transition-all border border-water-50 dark:border-slate-700"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-200">{formatMonthLabel(selectedMonth.year, selectedMonth.month)}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 md:w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-water-50 dark:border-slate-700 overflow-hidden z-20 animate-bounce-in">
                  {availableMonths.map(month => (
                    <button
                      key={`${month.year}-${month.month}`}
                      onClick={() => {
                        setSelectedMonth(month);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        month.year === selectedMonth.year && month.month === selectedMonth.month
                          ? 'bg-water-50 dark:bg-slate-700/50 text-water-600 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-water-50/50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 inline-flex p-1 bg-white dark:bg-slate-800 rounded-xl shadow-card border border-water-50 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('water')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'water'
                ? 'bg-water-500 text-white shadow-md scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:text-water-600 hover:bg-water-50 dark:hover:bg-slate-700'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>换水榜</span>
          </button>
          <button
            onClick={() => setActiveTab('heat')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'heat'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>热度榜</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
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

        {activeTab === 'water' ? (
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-card border border-water-50/50 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-water-500 dark:text-water-400" />
                <span className="text-xs text-slate-400 dark:text-slate-500">换水总数</span>
              </div>
              <div className="font-display text-2xl md:text-3xl gradient-text">{waterStats.records}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-card border border-water-50/50 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-slate-400 dark:text-slate-500">参与人数</span>
              </div>
              <div className="font-display text-2xl md:text-3xl text-purple-500">{waterStats.people}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-card border border-water-50/50 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="text-xs text-slate-400 dark:text-slate-500">总点赞数</span>
              </div>
              <div className="font-display text-2xl md:text-3xl text-rose-500">{waterStats.likes}</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-card border border-orange-50/50 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-slate-400 dark:text-slate-500">总热度分</span>
              </div>
              <div className="font-display text-2xl md:text-3xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{heatStats.totalHeat}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-card border border-water-50/50 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-water-500 dark:text-water-400" />
                <span className="text-xs text-slate-400 dark:text-slate-500">换水总数</span>
              </div>
              <div className="font-display text-2xl md:text-3xl gradient-text">{heatStats.totalRecords}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-card border border-amber-50/50 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-400 dark:text-slate-500">评论总数</span>
              </div>
              <div className="font-display text-2xl md:text-3xl text-amber-500">{heatStats.totalComments}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-card border border-purple-50/50 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-slate-400 dark:text-slate-500">参与人数</span>
              </div>
              <div className="font-display text-2xl md:text-3xl text-purple-500">{heatStats.people}</div>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'heat' && (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-4 md:p-5 border border-orange-100 dark:border-slate-700 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-base md:text-lg text-slate-800 dark:text-slate-100 mb-1">🔥 热度分规则说明</h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                换水 <span className="font-semibold text-water-600">+10分</span> · 
                点赞 <span className="font-semibold text-rose-500">+3分</span> · 
                评论 <span className="font-semibold text-amber-600">+2分</span> · 
                <span className="font-semibold text-orange-600">近7天内记录加权1.5倍</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {currentRanking.length > 0 && (
        <section className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <span>{activeTab === 'water' ? '🏆' : '🔥'}</span>
            <span>{activeTab === 'water' ? '三甲英雄' : '热度三甲'}</span>
          </h2>
          {activeTab === 'water' ? <Top3Water ranking={waterRanking} /> : <Top3Heat ranking={heatRanking} />}
        </section>
      )}

      <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span>📊</span>
          <span>完整排名</span>
        </h2>

        {currentRanking.length === 0 ? (
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-10 text-center">
            <div className="text-5xl mb-3">{activeTab === 'water' ? '🏅' : '🔥'}</div>
            <h3 className="font-display text-lg text-slate-600 dark:text-slate-300 mb-1">暂无{activeTab === 'water' ? '换水' : '热度'}排名数据</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">更多换水记录可以解锁更丰富的排名哦！</p>
          </div>
        ) : activeTab === 'water' ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-card border border-water-50/50 dark:border-slate-700 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-water-50/50 dark:bg-slate-700/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-1">排名</div>
              <div className="col-span-4">换水英雄</div>
              <div className="col-span-4 text-center">换水次数</div>
              <div className="col-span-3 text-right">获得点赞</div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {waterRanking.map((entry, idx) => {
                const progress = (entry.records / maxRecords) * 100;
                return (
                  <Link
                    key={entry.employee.id}
                    to={`/hero/${entry.employee.id}`}
                    className="group grid grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 hover:bg-water-50/30 dark:hover:bg-slate-700/50 transition-colors items-center"
                  >
                    <div className="col-span-2 md:col-span-1">
                      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center font-display text-lg ${idx < 3 ? 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        {idx < 3 ? rankBadges[idx] : <span className="text-slate-500 dark:text-slate-400">{idx + 1}</span>}
                      </div>
                    </div>
                    <div className="col-span-10 md:col-span-4 flex items-center gap-3">
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-water-50 dark:bg-slate-700/50 flex items-center justify-center text-2xl md:text-3xl shrink-0 group-hover:scale-110 transition-transform">
                        {entry.employee.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-water-600 transition-colors">{entry.employee.name}</div>
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
                        <span className="text-xs text-slate-400 dark:text-slate-500">🪣 换水</span>
                        <span className="font-display text-lg gradient-text">{entry.records}</span>
                      </div>
                      <div className="hidden md:flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-water-gradient rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="font-display text-xl gradient-text min-w-[2.5rem] text-right">{entry.records}</span>
                      </div>
                      <div className="md:hidden h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-water-gradient rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="col-span-5 md:col-span-3 flex items-center justify-end gap-1.5 md:gap-2">
                      <Heart className={`w-4 h-4 md:w-5 md:h-5 ${idx < 3 ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}`} />
                      <span className={`font-display ${idx < 3 ? 'text-xl text-rose-500' : 'text-lg text-rose-400'}`}>{entry.likes}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-card border border-orange-50/50 dark:border-slate-700 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-1">排名</div>
              <div className="col-span-3">热度英雄</div>
              <div className="col-span-2 text-center">🔥 热度分</div>
              <div className="col-span-2 text-center">🪣 换水</div>
              <div className="col-span-2 text-center">❤️ 点赞</div>
              <div className="col-span-2 text-right">💬 评论</div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {heatRanking.map((entry, idx) => {
                const progress = (entry.heatScore / maxHeat) * 100;
                return (
                  <Link
                    key={entry.employeeId}
                    to={`/hero/${entry.employeeId}`}
                    className="group grid grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 hover:bg-orange-50/30 dark:hover:bg-slate-700/50 transition-colors items-center"
                  >
                    <div className="col-span-2 md:col-span-1">
                      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center font-display text-lg ${idx < 3 ? 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        {idx < 3 ? rankBadges[idx] : <span className="text-slate-500 dark:text-slate-400">{idx + 1}</span>}
                      </div>
                    </div>
                    <div className="col-span-10 md:col-span-3 flex items-center gap-3">
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center text-2xl md:text-3xl shrink-0 group-hover:scale-110 transition-transform">
                        {entry.employeeAvatar}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-orange-600 transition-colors">{entry.employeeName}</div>
                        <div className="md:hidden flex items-center gap-2 mt-1">
                          {entry.recentRecords > 0 || entry.recentLikes > 0 || entry.recentComments > 0 ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                              <Flame className="w-3 h-3" />
                              近期活跃
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-2 order-last md:order-none">
                      <div className="hidden md:block">
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-center font-display text-xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{entry.heatScore}</div>
                      </div>
                      <div className="md:hidden flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg px-3 py-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />热度分</span>
                        <span className="font-display text-lg bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-semibold">{entry.heatScore}</span>
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-2 flex md:justify-center items-center gap-1.5 md:gap-2">
                      <Droplets className="w-4 h-4 text-water-500 dark:text-water-400" />
                      <span className="font-display text-lg text-water-600">{entry.records}</span>
                      {entry.recentRecords > 0 && <span className="text-[10px] font-semibold text-orange-500 bg-orange-100 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full">+{entry.recentRecords}</span>}
                    </div>
                    <div className="col-span-4 md:col-span-2 flex md:justify-center items-center gap-1.5 md:gap-2">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span className="font-display text-lg text-rose-500">{entry.likes}</span>
                      {entry.recentLikes > 0 && <span className="text-[10px] font-semibold text-orange-500 bg-orange-100 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full">+{entry.recentLikes}</span>}
                    </div>
                    <div className="col-span-4 md:col-span-2 flex md:justify-end items-center justify-end gap-1.5 md:gap-2">
                      <MessageCircle className="w-4 h-4 text-amber-500" />
                      <span className="font-display text-lg text-amber-500">{entry.comments}</span>
                      {entry.recentComments > 0 && <span className="text-[10px] font-semibold text-orange-500 bg-orange-100 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full">+{entry.recentComments}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {activeTab === 'water' && (
        <section className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <MonthlyTrendChart year={selectedMonth.year} month={selectedMonth.month} />
        </section>
      )}

      <FloatingButton />

      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-8 left-8 z-30 w-10 h-10 rounded-full bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all duration-200 flex items-center justify-center shadow-sm"
        title="数据管理"
      >
        <Settings className="w-4 h-4" />
      </button>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setIsSettingsOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:w-96 max-h-[80vh] overflow-auto shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-display text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                数据管理
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-900/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-700 dark:text-red-400 text-sm mb-1">危险操作区域</h4>
                    <p className="text-xs text-red-600/70 dark:text-red-400/70 leading-relaxed">
                      清空全部数据将删除所有换水记录和人员信息，此操作不可恢复，请谨慎操作。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 px-1">
                  <span>当前换水记录数</span>
                  <span className="font-display font-semibold text-slate-700 dark:text-slate-200">{records.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 px-1">
                  <span>当前人员数量</span>
                  <span className="font-display font-semibold text-slate-700 dark:text-slate-200">{employees.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 px-1">
                  <span>当前评论数量</span>
                  <span className="font-display font-semibold text-slate-700 dark:text-slate-200">{comments.length}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsConfirmOpen(true);
                }}
                disabled={records.length === 0 && employees.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                一键清空全部数据
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setIsConfirmOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white dark:bg-slate-800 rounded-3xl w-[90%] max-w-sm shadow-2xl animate-fade-in-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-display text-xl text-slate-800 dark:text-slate-100 mb-2">确认清空数据？</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                此操作将清空所有换水记录（{records.length} 条）和人员数据（{employees.length} 人），且<b className="text-red-500">无法恢复</b>。
              </p>
            </div>
            <div className="flex border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setIsConfirmOpen(false);
                  setIsSettingsOpen(false);
                }}
                className="flex-1 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-l border-slate-100 dark:border-slate-700"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
