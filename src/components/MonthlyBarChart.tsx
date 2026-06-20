import { useState, useMemo, useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import type { WaterRecord } from '@/types';
import { formatMonthLabel } from '@/utils';

interface MonthlyBarChartProps {
  records: WaterRecord[];
  year: number;
  month: number;
}

const CHART_WIDTH = 800;
const CHART_HEIGHT = 240;
const PADDING = { top: 20, right: 20, bottom: 40, left: 40 };
const INNER_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

export default function MonthlyBarChart({ records, year, month }: MonthlyBarChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data: Array<{ day: number; count: number }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayRecords = records.filter(r => {
        const d = new Date(r.timestamp);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
      });
      data.push({ day, count: dayRecords.length });
    }

    return data;
  }, [records, year, month]);

  const maxCount = useMemo(() => {
    const max = Math.max(...dailyData.map(d => d.count), 1);
    return Math.ceil(max * 1.2);
  }, [dailyData]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const tickCount = 4;
    for (let i = 0; i <= tickCount; i++) {
      const value = Math.round((maxCount / tickCount) * i);
      const y = PADDING.top + INNER_HEIGHT - (value / maxCount) * INNER_HEIGHT;
      ticks.push({ value, y });
    }
    return ticks;
  }, [maxCount]);

  const barWidth = useMemo(() => {
    const count = dailyData.length;
    if (count === 0) return 0;
    const availableWidth = INNER_WIDTH;
    const barWidth = (availableWidth / count) * 0.6;
    return Math.max(2, barWidth);
  }, [dailyData.length]);

  const getBarX = (index: number): number => {
    const count = dailyData.length;
    if (count === 0) return 0;
    const step = INNER_WIDTH / count;
    return PADDING.left + step * index + (step - barWidth) / 2;
  };

  const getBarHeight = (count: number): number => {
    if (maxCount === 0) return 0;
    return (count / maxCount) * INNER_HEIGHT;
  };

  const getBarY = (count: number): number => {
    return PADDING.top + INNER_HEIGHT - getBarHeight(count);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current || dailyData.length === 0) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    const svgX = ratio * CHART_WIDTH;

    let closestIdx = -1;
    let closestDist = Infinity;

    for (let i = 0; i < dailyData.length; i++) {
      const barCenter = getBarX(i) + barWidth / 2;
      const dist = Math.abs(barCenter - svgX);
      if (dist < barWidth && dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    setHoveredDay(closestIdx >= 0 ? closestIdx : null);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const totalRecords = useMemo(
    () => dailyData.reduce((sum, d) => sum + d.count, 0),
    [dailyData]
  );

  const xTickLabels = useMemo(() => {
    const labels: Array<{ day: number; x: number }> = [];
    const count = dailyData.length;
    if (count === 0) return labels;

    const step = Math.max(1, Math.floor(count / 7));
    for (let i = 0; i < count; i += step) {
      const x = getBarX(i) + barWidth / 2;
      labels.push({ day: dailyData[i].day, x });
    }
    if (count > 0 && labels[labels.length - 1].day !== dailyData[count - 1].day) {
      const x = getBarX(count - 1) + barWidth / 2;
      labels.push({ day: dailyData[count - 1].day, x });
    }
    return labels;
  }, [dailyData, barWidth]);

  return (
    <div className="bg-white rounded-3xl shadow-card border border-water-50/50 p-5 md:p-6 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-water-50 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-water-500" />
          </div>
          <div>
            <h2 className="font-display text-lg md:text-xl text-slate-800">本月每日换水趋势</h2>
            <p className="text-xs text-slate-400">
              {formatMonthLabel(year, month)} · 共 {totalRecords} 次换水
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          ref={chartRef}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full min-w-[320px] h-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="bar-gradient-hover" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="1" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.9" />
            </linearGradient>
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

          {dailyData.map((d, idx) => {
            const isHovered = hoveredDay === idx;
            const barHeight = getBarHeight(d.count);
            const barY = getBarY(d.count);
            const barX = getBarX(idx);

            return (
              <g key={d.day}>
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx={Math.min(barWidth / 2, 6)}
                  fill={isHovered ? 'url(#bar-gradient-hover)' : 'url(#bar-gradient)'}
                  className="transition-all duration-200 cursor-pointer"
                  opacity={hoveredDay !== null && !isHovered ? 0.5 : 1}
                />
              </g>
            );
          })}

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
        </svg>

        {hoveredDay !== null && dailyData[hoveredDay] && (
          <div
            className="absolute top-0 pointer-events-none bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-water-50 p-3 text-xs z-10"
            style={{
              left: `calc(${(getBarX(hoveredDay) + barWidth / 2) / CHART_WIDTH * 100}% + 8px)`,
              transform: 'translateY(-8px)',
            }}
          >
            <div className="font-semibold text-slate-700 mb-1">
              {year}年{month + 1}月{dailyData[hoveredDay].day}日
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-water-500" />
              <span className="text-slate-500">换水次数</span>
              <span className="font-bold text-water-600 ml-auto">
                {dailyData[hoveredDay].count} 次
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
