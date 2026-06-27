'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import MuscleMapDisplay from '@/components/MuscleMapDisplay';
import { getTheme, loadTheme } from '@/lib/theme';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] ${className}`} />
);

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  targetMuscles: string[];
  completed: boolean;
}

export default function WorkoutTrackerPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  
  // Theme
  const [currentTheme, setCurrentTheme] = useState('dark');
  const theme = getTheme(currentTheme);

  // Mock exercises - will be replaced with API data
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: 'Bench Press',
      sets: 4,
      reps: '8-10',
      targetMuscles: ['chest', 'triceps', 'front-delts'],
      completed: false
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      sets: 3,
      reps: '10-12',
      targetMuscles: ['chest', 'front-delts'],
      completed: false
    },
    {
      id: '3',
      name: 'Cable Flyes',
      sets: 3,
      reps: '12-15',
      targetMuscles: ['chest'],
      completed: true
    },
  ]);

  // Get active muscles from incomplete exercises
  const activeMuscles = exercises
    .filter(ex => !ex.completed)
    .flatMap(ex => ex.targetMuscles);

  // Bootstrap
  useEffect(() => {
    setMounted(true);
    setCurrentTheme(loadTheme());
    const userStr = localStorage.getItem('synapse_user');
    if (!userStr) { 
      router.push('/'); 
      return; 
    }
    setUser(JSON.parse(userStr));
    setIsLoading(false);

    // Listen for theme changes
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, [router]);

  const toggleExerciseComplete = (id: string) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      <BurgerMenuButton />
      <FloatingNavBar />

      {/* Background Muscle Map with Active Muscles */}
      <div className="fixed inset-0 opacity-15">
        <MuscleMapDisplay
          highlights={{
            muscles: activeMuscles,
            fillColor: theme.colors.primary,
            fillOpacity: 0.8,
            strokeColor: theme.colors.primary,
            strokeWidth: 2,
            blurInactive: 3
          }}
          showToggle={false}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto pt-24">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Workout Tracker
            </h1>
            <p className="text-lg" style={{ color: theme.colors.textMuted }}>
              Log today's exercises and track your progress
            </p>
          </div>

          {/* Date Selector */}
          <div className="mb-8 flex justify-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-6 py-3 rounded-full text-lg font-medium border-2 focus:outline-none"
              style={{
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }}
            />
          </div>

          {/* Exercise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              <>
                <Skeleton className="h-48 rounded-3xl" />
                <Skeleton className="h-48 rounded-3xl" />
                <Skeleton className="h-48 rounded-3xl" />
              </>
            ) : (
              exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="rounded-3xl p-6 border-2 transition-all duration-200 hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: exercise.completed 
                      ? `${theme.colors.primary}20`
                      : theme.colors.card,
                    borderColor: exercise.completed 
                      ? theme.colors.primary
                      : theme.colors.border,
                  }}
                  onClick={() => toggleExerciseComplete(exercise.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{exercise.name}</h3>
                      <p style={{ color: theme.colors.textMuted }}>
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                    {exercise.completed && (
                      <svg 
                        className="w-8 h-8 flex-shrink-0"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: theme.colors.primary }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Target Muscles */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exercise.targetMuscles.map(muscle => (
                      <span
                        key={muscle}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${theme.colors.primary}30`,
                          color: theme.colors.primary,
                        }}
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>

                  {/* Log Inputs (if not completed) */}
                  {!exercise.completed && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="Sets"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none"
                          style={{
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input
                          type="text"
                          placeholder="Reps"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none"
                          style={{
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input
                          type="number"
                          placeholder="Weight"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none"
                          style={{
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <button
                        className="w-full py-2 rounded-lg font-medium text-sm transition-all duration-200"
                        style={{
                          backgroundColor: theme.colors.primary,
                          color: "#ffffff",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExerciseComplete(exercise.id);
                        }}
                      >
                        Log Exercise
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Exercise Button */}
          <div className="flex justify-center mb-8">
            <button
              className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
              style={{
                backgroundColor: theme.colors.primary,
                color: "#ffffff",
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Exercise
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className="rounded-3xl p-6 border-2"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.primary }}>
                {exercises.filter(e => e.completed).length}
              </div>
              <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                Completed
              </div>
            </div>
            <div 
              className="rounded-3xl p-6 border-2"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.primary }}>
                {exercises.length}
              </div>
              <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                Total Exercises
              </div>
            </div>
            <div 
              className="rounded-3xl p-6 border-2"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.primary }}>
                {exercises.reduce((sum, e) => sum + e.sets, 0)}
              </div>
              <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                Total Sets
              </div>
            </div>
            <div 
              className="rounded-3xl p-6 border-2"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.primary }}>
                {Math.round((exercises.filter(e => e.completed).length / exercises.length) * 100)}%
              </div>
              <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                Progress
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
