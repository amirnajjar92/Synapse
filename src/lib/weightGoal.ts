export type WeightChartMode = 'gain' | 'lose' | 'regularweighttracker';

export interface WeightGoalInfo {
  mode: WeightChartMode;
  goalWeight?: number;
  currentWeight?: number;
  weightChange?: number;
}

export function parseWeightGoalFromPrompt(prompt: string): WeightGoalInfo {
  const text = prompt.toLowerCase();

  const loseChangeMatch = text.match(/lose\s*(\d+(?:\.\d+)?)\s*kg/);
  const gainChangeMatch = text.match(/gain\s*(\d+(?:\.\d+)?)\s*kg/);
  const targetMatch = text.match(
    /(?:to|reach|target(?:\s*weight)?|goal(?:\s*weight)?(?:\s*of)?)\s*(\d+(?:\.\d+)?)\s*kg/
  );

  let currentWeight: number | undefined;
  const currentPatterns = [
    /(?:i am|i'm|currently|weigh|weight is|at)\s*(\d+(?:\.\d+)?)\s*kg/,
    /(\d+(?:\.\d+)?)\s*kg\s*now/,
    /now\s*(\d+(?:\.\d+)?)\s*kg/,
  ];

  for (const pattern of currentPatterns) {
    const match = text.match(pattern);
    if (match) {
      currentWeight = parseFloat(match[1]);
      break;
    }
  }

  if (!currentWeight) {
    const allKg = [...text.matchAll(/(\d+(?:\.\d+)?)\s*kg/g)].map((m) => parseFloat(m[1]));
    if (allKg.length > 0) currentWeight = allKg[0];
  }

  let mode: WeightChartMode = 'regularweighttracker';
  let weightChange: number | undefined;
  let goalWeight: number | undefined = targetMatch ? parseFloat(targetMatch[1]) : undefined;

  const isLoseIntent =
    !!loseChangeMatch ||
    /\b(lose|loss|cut|slim|lean|deficit|fat loss)\b/.test(text);
  const isGainIntent =
    !!gainChangeMatch ||
    /\b(gain|bulk|muscle|mass|surplus)\b/.test(text);

  if (isLoseIntent && !isGainIntent) {
    mode = 'lose';
    weightChange = loseChangeMatch ? parseFloat(loseChangeMatch[1]) : undefined;
  } else if (isGainIntent && !isLoseIntent) {
    mode = 'gain';
    weightChange = gainChangeMatch ? parseFloat(gainChangeMatch[1]) : undefined;
  }

  if (goalWeight && currentWeight) {
    if (goalWeight < currentWeight) mode = 'lose';
    else if (goalWeight > currentWeight) mode = 'gain';
  }

  if (!goalWeight && weightChange && currentWeight) {
    goalWeight =
      mode === 'lose'
        ? currentWeight - weightChange
        : mode === 'gain'
          ? currentWeight + weightChange
          : undefined;
  }

  if (!isLoseIntent && !isGainIntent) {
    mode = 'regularweighttracker';
    goalWeight = undefined;
  }

  return { mode, goalWeight, currentWeight, weightChange };
}

export function toWeightChartHeights(weights: number[]): number[] {
  if (weights.length === 0) return [];
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const padding = Math.max((max - min) * 0.15, 2);
  const lo = min - padding;
  const hi = max + padding;
  const range = hi - lo || 1;
  return weights.map((w) => 18 + ((w - lo) / range) * 72);
}

export function generateMockWeightKg(
  totalDays: number,
  goal: WeightGoalInfo,
  seed = 'default'
): number[] {
  if (totalDays <= 0) return [];

  const seedOffset = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const baseWeight = goal.currentWeight ?? 75;

  if (goal.mode === 'regularweighttracker') {
    return Array.from({ length: totalDays }, (_, i) => {
      const variation = Math.sin((i + seedOffset) * 0.55) * 0.8;
      return Math.round((baseWeight + variation) * 10) / 10;
    });
  }

  const startWeight =
    goal.currentWeight ??
    (goal.mode === 'lose'
      ? (goal.goalWeight ?? baseWeight) + 12
      : (goal.goalWeight ?? baseWeight) - 8);
  const endWeight = goal.goalWeight ?? startWeight;

  return Array.from({ length: totalDays }, (_, i) => {
    const progress = totalDays > 1 ? i / (totalDays - 1) : 0;
    const trend =
      goal.mode === 'gain'
        ? startWeight + (endWeight - startWeight) * progress
        : startWeight - (startWeight - endWeight) * progress;
    const variation = Math.sin((i + seedOffset) * 0.7) * 0.5;
    return Math.round((trend + variation) * 10) / 10;
  });
}

export function buildWeightKgFromEntries(
  entries: Array<{ date: string; metrics: Array<{ type: string; value: number }> }>,
  startDate: string,
  totalDays: number
): number[] | null {
  const weightsByDay = new Map<number, number>();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  for (const entry of entries) {
    const weightMetric = entry.metrics?.find((m) => m.type === 'weight');
    if (!weightMetric) continue;

    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    const dayIndex = Math.round(
      (entryDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayIndex >= 0 && dayIndex < totalDays) {
      weightsByDay.set(dayIndex, weightMetric.value);
    }
  }

  if (weightsByDay.size === 0) return null;

  const sortedDays = Array.from(weightsByDay.keys()).sort((a, b) => a - b);
  const firstKnown = weightsByDay.get(sortedDays[0])!;
  let lastKnown = firstKnown;

  return Array.from({ length: totalDays }, (_, i) => {
    if (weightsByDay.has(i)) {
      lastKnown = weightsByDay.get(i)!;
      return lastKnown;
    }
    if (i < sortedDays[0]) return firstKnown;
    return lastKnown;
  });
}

export function getWeightDeltaLabel(
  weightsKg: number[],
  currentDay: number,
  mode: WeightChartMode
): string {
  if (weightsKg.length === 0 || currentDay < 1) return '0kg';

  const startIdx = 0;
  const endIdx = Math.min(currentDay - 1, weightsKg.length - 1);
  const delta = weightsKg[endIdx] - weightsKg[startIdx];
  const rounded = Math.round(delta * 10) / 10;

  if (mode === 'regularweighttracker') {
    const sign = rounded > 0 ? '+' : '';
    return `${sign}${rounded}kg`;
  }

  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded}kg`;
}
