'use client';

import { useEffect, useState } from 'react';
import MuscleMapDisplay from '@/components/MuscleMapDisplay';

interface PlanRow {
  id: string;
  columns: string[];
}

interface PlanTable {
  id: string;
  title: string;
  rows: PlanRow[];
}

interface PlanData {
  id: string;
  title: string;
  status: string;
  tables: PlanTable[];
}

interface PreviewData {
  user: { name: string; email: string };
  activeWorkoutPlan: PlanData | null;
  mealPlan: PlanData | null;
  totalPlans: number;
}

const EXERCISE_MUSCLE_MAP: Record<string, string[]> = {
  'bench press': ['chest', 'triceps', 'front-delts'],
  'incline': ['chest', 'front-delts'],
  'fly': ['chest'],
  'push up': ['chest', 'triceps', 'front-delts'],
  'chest': ['chest'],
  'pull up': ['lats', 'biceps', 'upper-back'],
  'row': ['lats', 'upper-back', 'biceps'],
  'lat pulldown': ['lats', 'biceps'],
  'deadlift': ['lower-back', 'glutes', 'hamstrings', 'traps'],
  'back': ['lats', 'upper-back'],
  'overhead press': ['shoulders', 'triceps'],
  'lateral raise': ['shoulders'],
  'front raise': ['front-delts'],
  'shoulder press': ['shoulders', 'triceps'],
  'shoulder': ['shoulders'],
  'curl': ['biceps'],
  'bicep': ['biceps'],
  'tricep': ['triceps'],
  'skull crusher': ['triceps'],
  'pushdown': ['triceps'],
  'squat': ['quads', 'glutes', 'adductors'],
  'leg press': ['quads', 'glutes', 'hamstrings'],
  'lunge': ['quads', 'glutes', 'hamstrings'],
  'leg extension': ['quads'],
  'leg curl': ['hamstrings'],
  'crunch': ['abs'],
  'plank': ['abs'],
  'leg raise': ['abs'],
  'ab': ['abs'],
  'calf raise': ['calves'],
  'calf': ['calves'],
  'goblet squat': ['quads', 'glutes'],
  'glute bridge': ['glutes', 'hamstrings'],
  'pike press': ['shoulders', 'triceps'],
  'dips': ['chest', 'triceps'],
  'burpees': ['chest', 'quads', 'shoulders'],
  'mountain climbers': ['abs', 'quads'],
  'jump squat': ['quads', 'glutes'],
  'superman': ['lower-back', 'glutes'],
  'inverted row': ['lats', 'biceps'],
  'bird-dog': ['abs', 'lower-back'],
  'side plank': ['abs'],
  'high knees': ['quads', 'abs'],
  'walking lunge': ['quads', 'glutes'],
  'reverse lunge': ['quads', 'glutes'],
  'triceps dips': ['triceps'],
  'incline push': ['chest', 'front-delts'],
};

function getMusclesFromPlan(plan: PlanData): string[] {
  const muscles = new Set<string>();
  const workoutTable = plan.tables.find(t => t.title === 'WORKOUT PLAN');
  if (!workoutTable) return [];

  workoutTable.rows.forEach(row => {
    const exerciseStr = row.columns[2] || '';
    exerciseStr.split('\n').filter(Boolean).forEach(line => {
      const name = line.split(':')[0]?.trim().toLowerCase() || '';
      for (const [keyword, muscleGroups] of Object.entries(EXERCISE_MUSCLE_MAP)) {
        if (name.includes(keyword)) {
          muscleGroups.forEach(m => muscles.add(m));
        }
      }
    });
  });

  return Array.from(muscles);
}

function parseExercises(columns: string[]): { name: string; sets: string }[] {
  return (columns[2] || '').split('\n').filter(Boolean).map(line => {
    const parts = line.split(':');
    return {
      name: parts[0]?.trim() || line.trim(),
      sets: parts.slice(1).join(':').trim() || '',
    };
  });
}

// ─── View 1: Workout Plan ───
function WorkoutPlanView({ plan }: { plan: PlanData }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const workoutTable = plan.tables.find(t => t.title === 'WORKOUT PLAN');
  if (!workoutTable) return <EmptyState />;

  const currentRow = workoutTable.rows[selectedDay];
  const exercises = currentRow ? parseExercises(currentRow.columns) : [];
  const dayName = currentRow?.columns[0] || '';
  const focus = currentRow?.columns[1] || '';

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-3 pt-8 pb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FC4C02]" />
          <span className="text-white text-[10px] font-semibold tracking-wide">TODAY&apos;S PLAN</span>
        </div>
        <p className="text-white/40 text-[8px] mt-0.5 truncate">{plan.title}</p>
      </div>

      {/* Day tabs */}
      <div className="px-3 pb-2 flex-shrink-0">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {workoutTable.rows.map((row, i) => (
            <button
              key={row.id}
              onClick={() => setSelectedDay(i)}
              className={`px-2 py-1 rounded-full text-[8px] whitespace-nowrap transition-all ${
                i === selectedDay
                  ? 'bg-[#FC4C02] text-white'
                  : 'bg-white/5 text-white/40'
              }`}
            >
              {row.columns[0]?.split(' ')[0] || `D${i + 1}`}
            </button>
          ))}
        </div>
      </div>

      {/* Day label */}
      <div className="px-3 pb-1 flex-shrink-0">
        <p className="text-white text-[10px] font-semibold">{dayName}</p>
        <p className="text-white/40 text-[8px]">{focus}</p>
      </div>

      {/* Exercise table */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="bg-white/5 flex px-2 py-1 text-white/40 font-medium text-[8px]">
            <span className="flex-1">Exercise</span>
            <span className="w-16 text-right">Sets</span>
          </div>
          {exercises.map((ex, i) => (
            <div key={i} className="flex px-2 py-1.5 border-t border-white/5 text-[8px]">
              <span className="flex-1 text-white truncate">{ex.name}</span>
              <span className="w-16 text-right text-white/50 truncate">{ex.sets}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── View 2: Meal Plan ───
function MealPlanView({ plan }: { plan: PlanData }) {
  const mealsTable = plan.tables.find(t => t.title === 'MEALS');
  if (!mealsTable) return <EmptyState />;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-3 pt-8 pb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span className="text-white text-[10px] font-semibold tracking-wide">MEAL PLAN</span>
        </div>
        <p className="text-white/40 text-[8px] mt-0.5 truncate">{plan.title}</p>
      </div>

      {/* Meals */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-2">
        {mealsTable.rows.map((row) => {
          const [meal, time, desc] = row.columns;
          return (
            <div key={row.id} className="rounded-xl border border-white/10 p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-[9px] font-semibold">{meal}</span>
                <span className="text-white/30 text-[7px]">{time}</span>
              </div>
              <p className="text-white/50 text-[8px] leading-relaxed line-clamp-2">{desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── View 3: Muscle Map ───
function MuscleMapView({ plan }: { plan: PlanData }) {
  const muscles = getMusclesFromPlan(plan);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-3 pt-8 pb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FC4C02]" />
          <span className="text-white text-[10px] font-semibold tracking-wide">MUSCLE MAP</span>
        </div>
        <p className="text-white/40 text-[8px] mt-0.5">
          {muscles.length > 0
            ? `${muscles.length} muscle groups targeted`
            : 'No muscle data available'}
        </p>
      </div>

      {/* Muscle map */}
      <div className="flex-1 min-h-0 px-3 pb-3">
        <div className="w-full h-full rounded-xl overflow-hidden">
          <MuscleMapDisplay
            highlights={{
              muscles: muscles,
              fillColor: '#FC4C02',
              fillOpacity: 0.89,
              blurInactive: 3,
            }}
            showToggle={false}
            view="front"
          />
        </div>
      </div>

      {/* Legend */}
      {muscles.length > 0 && (
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="flex flex-wrap gap-1">
            {muscles.slice(0, 6).map(m => (
              <span key={m} className="px-1.5 py-0.5 rounded-full bg-[#FC4C02]/20 text-[7px] text-[#FC4C02]">
                {m.replace(/-/g, ' ')}
              </span>
            ))}
            {muscles.length > 6 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[7px] text-white/40">
                +{muscles.length - 6}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-white/20 text-[10px]">No data available</p>
    </div>
  );
}

// ─── Main PhonePreview Component ───
type PreviewView = 'workout' | 'meals' | 'muscles';

export default function PhonePreview() {
  const [data, setData] = useState<PreviewData | null>(null);
  const [view, setView] = useState<PreviewView>('workout');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/landing/preview')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const views: { key: PreviewView; label: string }[] = [
    { key: 'workout', label: 'Workout' },
    { key: 'meals', label: 'Meals' },
    { key: 'muscles', label: 'Muscles' },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* View switcher */}
      <div className="flex-shrink-0 px-2 pt-2 pb-1 flex justify-center gap-1">
        {views.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-2 py-0.5 rounded-full text-[7px] transition-all ${
              view === v.key
                ? 'bg-[#FC4C02] text-white'
                : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border border-white/20 animate-spin" style={{ borderTopColor: 'white', borderWidth: '2px' }} />
          </div>
        ) : !data ? (
          <EmptyState />
        ) : view === 'workout' && data.activeWorkoutPlan ? (
          <WorkoutPlanView plan={data.activeWorkoutPlan} />
        ) : view === 'meals' && data.mealPlan ? (
          <MealPlanView plan={data.mealPlan} />
        ) : view === 'muscles' && data.activeWorkoutPlan ? (
          <MuscleMapView plan={data.activeWorkoutPlan} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
