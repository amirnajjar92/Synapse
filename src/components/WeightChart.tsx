'use client';

import { BarChart } from '@/components/BarChart';
import {
  WeightChartMode,
  toWeightChartHeights,
  getWeightDeltaLabel,
} from '@/lib/weightGoal';

interface WeightChartProps {
  mode: WeightChartMode;
  goalWeight?: number;
  weightsKg: number[];
  totalDays: number;
  currentDay: number;
}

const modeLabels: Record<WeightChartMode, string> = {
  gain: 'GAIN',
  lose: 'LOSE',
  regularweighttracker: 'WEIGHT',
};

const modeColors: Record<WeightChartMode, string> = {
  gain: '#3B63CF',
  lose: '#3B63CF',
  regularweighttracker: '#3B63CF',
};

export function WeightChart({
  mode,
  goalWeight,
  weightsKg,
  totalDays,
  currentDay,
}: WeightChartProps) {
  const chartHeights = toWeightChartHeights(weightsKg);
  const isLoseMode = mode === 'lose';
  const isRegularMode = mode === 'regularweighttracker';
  const deltaLabel = getWeightDeltaLabel(weightsKg, currentDay, mode);
  const activeDay = Math.max(currentDay, 1);
  const activeIndex = Math.min(activeDay - 1, weightsKg.length - 1);
  const currentWeight = weightsKg[activeIndex];

  const minWeight = weightsKg.length > 0 ? Math.min(...weightsKg) : 0;
  const maxWeight = weightsKg.length > 0 ? Math.max(...weightsKg) : 0;

  return (
    <div className="w-full bg-black rounded-2xl p-4 border border-[#3B3B3B00]">
      <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-1.5 md:mb-2">
        <span className="uppercase tracking-wide">{modeLabels[mode]}</span>
        <span className="flex items-center gap-2">
          {goalWeight !== undefined && !isRegularMode && (
            <span
              className="text-[10px] sm:text-xs"
              style={{ color: isLoseMode ? '#E63416' : modeColors[mode] }}
            >
              Goal {goalWeight}kg
            </span>
          )}
          <span>{totalDays} DAYS</span>
        </span>
      </div>

      <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-1">
        <span>Day 1</span>
        <span>Day {totalDays}</span>
      </div>

      <div className="relative w-full h-32">
        <BarChart
          data={chartHeights}
          color={modeColors[mode]}
          reversed={false}
          showConnectingLine
          connectingLineColor="#ffffff"
          connectingLineWidth={1}
          connectingLineShadow="#EFE9E9"
          activeBarCount={activeDay}
          inactiveColor="#666666"
          showCurrentDayArrow
          currentDayArrowColor="#ffffff"
        />

        <div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 left-1.5 sm:left-2 md:left-3 pointer-events-none">
          {isRegularMode && currentWeight !== undefined ? (
            <span className="text-white text-base sm:text-xl md:text-2xl font-light">
              {currentWeight.toFixed(1)}kg
            </span>
          ) : (
            <span
              className="text-white text-base sm:text-xl md:text-2xl font-light"
              style={{ color: isLoseMode ? '#E63416' : modeColors[mode] }}
            >
              {deltaLabel}
            </span>
          )}
        </div>

        <div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 right-1.5 sm:right-2 md:right-3 pointer-events-none text-[10px] sm:text-xs text-gray-400">
          {isRegularMode ? (
            <span>
              {minWeight.toFixed(1)}–{maxWeight.toFixed(1)}kg
            </span>
          ) : (
            <span>1kg</span>
          )}
        </div>
      </div>
    </div>
  );
}
