import { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/api';
import { BUCKET_TYPES } from '@/constants';
import type { BucketType, MonthlyDailyStats, DailyStat } from '@/types';
import { formatMonthLabel } from '@/utils';

interface MonthlyTrendChartProps {
  year: number;
  month: number;
}

const BUCKET_COLORS: Record<BucketType, string> = {
  '5G': '#0ea5e9',
  '3G': '#8b5cf6',
  'MINI': '#f97316',
};

const CHART_WIDTH = 800;
const CHART_HEIGHT = 280;
const PADDING = { top: 20, right: 20, bottom: 40, left: 40 };
const INNER_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

function calcX(index: number, dataLen: number): number {
  if (dataLen <= 1) return PADDING.left + INNER_WIDTH / 2;
  return PADDING.left + (index / (dataLen - 1)) * INNER_WIDTH;
}

function calcY(value: number, max: number): number {
  return PADDING.top + INNER_HEIGHT - (value / max) * INNER_HEIGHT;
}

function calcCumulativeValue(d: DailyStat, bucketType: BucketType, buckets: BucketType[]): number {
  let cumulative = 0;
  for (const b of buckets) {
    cumulative += d.byBucket[b] || 0;
    if (b === bucketType) break;
  }
  return cumulative;
}

function buildAreaPath(
  bucketType: BucketType,
  chartData: DailyStat[],
  selectedBuckets: Set<BucketType>,
  maxValue: number
): string {
  const bucketArray = Array.from(selectedBuckets);
  const bucketIndex = bucketArray.indexOf(bucketType);
  if (bucketIndex === -1 || chartData.length === 0) return '';

  let path = '';

  for (let i = 0; i < chartData.length; i++) {
    const x = calcX(i, chartData.length);
    const yValue = calcCumulativeValue(chartData[i], bucketType, bucketArray);
    const y = calcY(yValue, maxValue);

    let belowY: number;
    if (bucketIndex === 0) {
      belowY = calcY(0, maxValue);
    } else {
      const prevBucket = bucketArray[bucketIndex - 1];
      const belowValue = calcCumulativeValue(chartData[i], prevBucket, bucketArray);
      belowY = calcY(belowValue, maxValue);
    }

    if (i === 0) {
      path += `M ${x} ${belowY} L ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }

    if (i === chartData.length - 1) {
      path += ` L ${x} ${belowY}`;
    }
  }

  for (let i = chartData.length - 1; i >= 0; i--) {
    const x = calcX(i, chartData.length);
    let belowY: number;
    if (bucketIndex === 0) {
      belowY = calcY(0, maxValue);
    } else {
      const prevBucket = bucketArray[bucketIndex - 1];
      const belowValue = calcCumulativeValue(chartData[i], prevBucket, bucketArray);
      belowY = calcY(belowValue, maxValue);
    }
    path += ` L ${x} ${belowY}`;
  }

  path += ' Z';
  return path;
}

function buildLinePath(
  bucketType: BucketType,
  chartData: DailyStat[],
  selectedBuckets: Set<BucketType>,
  maxValue: number
): string {
  const bucketArray = Array.from(selectedBuckets);
  const bucketIndex = bucketArray.indexOf(bucketType);
  if (bucketIndex === -1 || chartData.length === 0) return '';

  let path = '';
  for (let i = 0; i < chartData.length; i++) {
    const x = calcX(i, chartData.length);
    const yValue = calcCumulativeValue(chartData[i], bucketType, bucketArray);
    const y = calcY(yValue, maxValue);
    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  return path;
}

export default function MonthlyTrendChart({ year, month }: MonthlyTrendChartProps) {
  const [stats, setStats] = useState<MonthlyDailyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuckets, setSelectedBuckets] = useState<Set<BucketType>>(new Set(['5G', '3G', 'MINI']));
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getMonthlyDailyStats(year, month);
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const toggleBucket = (bucketType: BucketType) => {
    setSelectedBuckets(prev => {
      const next = new Set(prev);
      if (next.has(bucketType)) {
        if (next.size > 1) {
          next.delete(bucketType);
        }
      } else {
        next.add(bucketType);
      }
      return next;
    });
  };

  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.dailyStats;
  }, [stats]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 1;
    let max = 0;
    chartData.forEach(d => {
      let dailyMax = 0;
      if (selectedBuckets.size === BUCKET_TYPES.length) {
        dailyMax = d.total;
      } else {
        selectedBuckets.forEach(b => {
          dailyMax += d.byBucket[b] || 0;
        });
      }
      if (dailyMax > max) max = dailyMax;
    });
    return Math.max(1, Math.ceil(max * 1.2));
  }, [chartData, selectedBuckets]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const value = Math.round((maxValue / tickCount) * i);
      ticks.push({ value, y: calcY(value, maxValue) });
    }
    return ticks;
  }, [maxValue]);

  const xTickLabels = useMemo(() => {
    if (chartData.length === 0) return [];
    const labels: Array<{ day: number; x: number }> = [];
    const step = Math.max(1, Math.floor(chartData.length / 7));
    for (let i = 0; i < chartData.length; i += step) {
      labels.push({ day: chartData[i].day, x: calcX(i, chartData.length) });
    }
    if (chartData.length > 0 && labels[labels.length - 1].day !== chartData[chartData.length - 1].day) {
      labels.push({ day: chartData[chartData.length - 1].day, x: calcX(chartData.length - 1, chartData.length) });
    }
    return labels;
  }, [chartData]);

  const areaPaths = useMemo(() => {
    const result: Record<string, string> = {};
    BUCKET_TYPES.forEach(bucket => {
      result[bucket.type] = buildAreaPath(bucket.type, chartData, selectedBuckets, maxValue);
    });
    return result;
  }, [chartData, selectedBuckets, maxValue]);

  const linePaths = useMemo(() => {
    const result: Record<string, string> = {};
    BUCKET_TYPES.forEach(bucket => {
      result[bucket.type] = buildLinePath(bucket.type, chartData, selectedBuckets, maxValue);
    });
    return result;
  }, [chartData, selectedBuckets, maxValue]);

  const getHoverYforBucket = (d: DailyStat, bucketType: BucketType): number => {
    const bucketArray = Array.from(selectedBuckets);
    const cumulative = calcCumulativeValue(d, bucketType, bucketArray);
    return calcY(cumulative, maxValue);
  };

  const getHoverX = (index: number): number => {
    return calcX(index, chartData.length);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current || chartData.length === 0) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    const svgX = ratio * CHART_WIDTH;

    let closestIdx = 0;
    let closestDist = Infinity;
    for (let i = 0; i < chartData.length; i++) {
      const dist = Math.abs(calcX(i, chartData.length) - svgX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }
    setHoveredDay(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const totalMonthRecords = useMemo(() => {
    if (!stats) return 0;
    return stats.dailyStats.reduce((sum, d) => sum + d.total, 0);
  }, [stats]);

  return (
    <div className="bg-white rounded-3xl shadow-card border border-water-50/50 p-5 md:p-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-water-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-water-500" />
          </div>
          <div>
            <h2 className="font-display text-lg md:text-xl text-slate-800">本月换水趋势</h2>
            <p className="text-xs text-slate-400">{formatMonthLabel(year, month)} · 共 {totalMonthRecords} 次换水</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {BUCKET_TYPES.map(bucket => {
            const isSelected = selectedBuckets.has(bucket.type);
            return (
              <button
                key={bucket.type}
                onClick={() => toggleBucket(bucket.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-white shadow-sm border-2'
                    : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:bg-slate-100'
                }`}
                style={{
                  borderColor: isSelected ? BUCKET_COLORS[bucket.type] : undefined,
                  color: isSelected ? BUCKET_COLORS[bucket.type] : undefined,
                }}
              >
                <span>{bucket.icon}</span>
                <span>{bucket.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-water-500 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      )}

      {!loading && !error && stats && (
        <div className="relative w-full overflow-x-auto">
          <svg
            ref={chartRef}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full min-w-[320px] h-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {BUCKET_TYPES.map(bucket => (
                <linearGradient
                  key={bucket.type}
                  id={`gradient-${bucket.type}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={BUCKET_COLORS[bucket.type]} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={BUCKET_COLORS[bucket.type]} stopOpacity="0.02" />
                </linearGradient>
              ))}
            </defs>

            {yTicks.map((tick, idx) => (
              <g key={idx}>
                <line
                  x1={PADDING.left}
                  y1={tick.y}
                  x2={CHART_WIDTH - PADDING.right}
                  y2={tick.y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? '0' : '4 4'}
                />
                <text
                  x={PADDING.left - 8}
                  y={tick.y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-[10px] fill-slate-400"
                >
                  {tick.value}
                </text>
              </g>
            ))}

            {Array.from(selectedBuckets).reverse().map(bucketType => (
              <path
                key={`area-${bucketType}`}
                d={areaPaths[bucketType]}
                fill={`url(#gradient-${bucketType})`}
                className="transition-all duration-300"
              />
            ))}

            {Array.from(selectedBuckets).map(bucketType => (
              <path
                key={`line-${bucketType}`}
                d={linePaths[bucketType]}
                fill="none"
                stroke={BUCKET_COLORS[bucketType]}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            ))}

            {xTickLabels.map((tick, idx) => (
              <text
                key={idx}
                x={tick.x}
                y={CHART_HEIGHT - PADDING.bottom + 20}
                textAnchor="middle"
                className="text-[10px] fill-slate-400"
              >
                {tick.day}日
              </text>
            ))}

            {hoveredDay !== null && chartData[hoveredDay] && (
              <g>
                <line
                  x1={getHoverX(hoveredDay)}
                  y1={PADDING.top}
                  x2={getHoverX(hoveredDay)}
                  y2={CHART_HEIGHT - PADDING.bottom}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {Array.from(selectedBuckets).map(bucketType => (
                  <circle
                    key={bucketType}
                    cx={getHoverX(hoveredDay)}
                    cy={getHoverYforBucket(chartData[hoveredDay], bucketType)}
                    r="5"
                    fill="white"
                    stroke={BUCKET_COLORS[bucketType]}
                    strokeWidth="2.5"
                  />
                ))}
              </g>
            )}
          </svg>

          {hoveredDay !== null && chartData[hoveredDay] && (
            <div
              className="absolute top-0 pointer-events-none bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-water-50 p-3 text-xs z-10"
              style={{
                left: `calc(${(getHoverX(hoveredDay) / CHART_WIDTH) * 100}% + 8px)`,
                transform: 'translateY(-8px)',
              }}
            >
              <div className="font-semibold text-slate-700 mb-2">
                {chartData[hoveredDay].date}
              </div>
              <div className="space-y-1.5">
                {Array.from(selectedBuckets).map(bucketType => {
                  const bucketConfig = BUCKET_TYPES.find(b => b.type === bucketType);
                  return (
                    <div key={bucketType} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: BUCKET_COLORS[bucketType] }}
                      />
                      <span className="text-slate-500">{bucketConfig?.label}</span>
                      <span className="font-semibold text-slate-700 ml-auto">
                        {chartData[hoveredDay].byBucket[bucketType] || 0}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-1.5 mt-1.5 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-slate-500">总计</span>
                  <span className="font-bold text-water-600 ml-auto">
                    {chartData[hoveredDay].total} 次
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
