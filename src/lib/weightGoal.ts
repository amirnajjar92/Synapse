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
  // Use at least 5kg range so variance always has room to breathe visually
  const naturalRange = max - min;
  const displayRange = Math.max(naturalRange, 5);
  const mid = (min + max) / 2;
  const lo = mid - displayRange / 2;
  const hi = mid + displayRange / 2;
  const range = hi - lo;
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
      ? (goal.goalWeight ? goal.goalWeight + 10 : baseWeight)
      : goal.mode === 'gain'
        ? (goal.goalWeight ? goal.goalWeight - 8 : baseWeight)
        : baseWeight);
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

export interface PlanEntryWithMetrics {
  date: string;
  metrics: Array<{ type: string; value: number; unit?: string | null }>;
  notes?: string | null;
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

export function buildActualProgressFromEntries(
  entries: PlanEntryWithMetrics[],
  startDate: string,
  totalDays: number
): number[] | null {
  const dayScores = new Map<number, number>();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  for (const entry of entries) {
    if (!entry.metrics?.length) continue;

    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    const dayIndex = Math.round(
      (entryDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayIndex < 0 || dayIndex >= totalDays) continue;

    // Score based on richness of the log for that day
    const types = new Set(entry.metrics.map((m) => m.type));
    let score = 30; // base: anything logged
    if (types.has('distance')) score += 20;
    if (types.has('weight')) score += 20;
    if (types.has('pace')) score += 15;
    if (types.has('totalTime')) score += 15;
    dayScores.set(dayIndex, Math.min(100, score));
  }

  if (dayScores.size === 0) return null;

  // Build a running cumulative progress:
  // On logged days the score rises; on unlogged days it holds (not decays).
  // The final value is the weighted average of all logged day scores so far.
  let runningSum = 0;
  let loggedCount = 0;

  return Array.from({ length: totalDays }, (_, i) => {
    if (dayScores.has(i)) {
      runningSum += dayScores.get(i)!;
      loggedCount++;
    }
    if (loggedCount === 0) return 0;
    // Average of logged scores so far, scaled up by the share of days logged
    // so consistent logging genuinely drives the number up over time
    const avgScore = runningSum / loggedCount;
    const consistency = loggedCount / (i + 1); // 0..1
    return Math.min(100, Math.round(avgScore * (0.6 + consistency * 0.4)));
  });
}

function formatMetricValue(type: string, value: number, unit?: string | null): string {
  if (type === 'pace' && unit?.includes('second')) {
    const total = Math.round(value);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}/km`;
  }
  if (type === 'totalTime' && unit?.includes('second')) {
    const total = Math.round(value);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
  return `${value}${unit ? ` ${unit}` : ''}`;
}

export function formatMetricsSummaryForAI(
  entries: PlanEntryWithMetrics[],
  startDate: string
): string {
  const withMetrics = entries.filter((entry) => entry.metrics?.length);
  if (withMetrics.length === 0) {
    return 'No activity metrics logged yet.';
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const sorted = [...withMetrics].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const lines: string[] = ['Logged activity metrics by day:'];

  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    const dayIndex =
      Math.round((entryDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dateLabel = entryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const metricLine = entry.metrics
      .map((metric) =>
        `${metric.type}: ${formatMetricValue(metric.type, metric.value, metric.unit)}`
      )
      .join(', ');
    lines.push(`- Day ${dayIndex} (${dateLabel}): ${metricLine}`);
  }

  const latestByType = new Map<
    string,
    { value: number; unit?: string | null; date: string }
  >();

  for (const entry of sorted) {
    for (const metric of entry.metrics) {
      latestByType.set(metric.type, {
        value: metric.value,
        unit: metric.unit,
        date: entry.date,
      });
    }
  }

  lines.push('', 'Latest recorded values:');
  for (const [type, metric] of latestByType) {
    const dateLabel = new Date(metric.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    lines.push(
      `- ${type}: ${formatMetricValue(type, metric.value, metric.unit)} (as of ${dateLabel})`
    );
  }

  return lines.join('\n');
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
