"use client";

import { useState } from 'react';
import FloatingNavBar from '@/components/FloatingNavBar';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider } from '@/components/SidebarContext';
import MuscleMapDisplay from '@/components/MuscleMapDisplay';

export default function WorkoutTrackerPage() {
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data - will be replaced with real data from API
  const mockExercises = [
    {
      id: '1',
      name: 'Bench Press',
      targetMuscles: ['chest', 'triceps', 'front-delts'],
      sets: 4,
      reps: '8-10',
      completed: false
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      targetMuscles: ['chest', 'front-delts'],
      sets: 3,
      reps: '10-12',
      completed: false
    },
    {
      id: '3',
      name: 'Cable Flyes',
      targetMuscles: ['chest'],
      sets: 3,
      reps: '12-15',
      completed: true
    },
  ];

  const activeMuscles = mockExercises
    .filter(ex => !ex.completed)
    .flatMap(ex => ex.targetMuscles);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-black text-white">
        <Sidebar />
        <BurgerMenuButton />
        <FloatingNavBar />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Workout Tracker</h1>
          <p className="text-zinc-400">Log your exercises and track your progress</p>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <input
            type="date"
            value={activeDate}
            onChange={(e) => setActiveDate(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Exercise List */}
          <div className="space-y-4">
            
            {/* Today's Workout */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Today's Workout</h2>
                <span className="text-sm text-zinc-400">Chest & Triceps</span>
              </div>

              <div className="space-y-3">
                {mockExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      exercise.completed
                        ? 'bg-green-900/20 border-green-800'
                        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{exercise.name}</h3>
                        <p className="text-sm text-zinc-400">
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                      </div>
                      {exercise.completed && (
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Target Muscles */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {exercise.targetMuscles.map(muscle => (
                        <span
                          key={muscle}
                          className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs border border-red-800"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>

                    {!exercise.completed && (
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="Sets"
                          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-zinc-600"
                        />
                        <input
                          type="text"
                          placeholder="Reps"
                          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-zinc-600"
                        />
                        <input
                          type="number"
                          placeholder="Weight"
                          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-zinc-600"
                        />
                      </div>
                    )}

                    {!exercise.completed && (
                      <button className="w-full mt-3 px-4 py-2 bg-white text-black font-medium rounded hover:bg-zinc-200 transition-colors text-sm">
                        Log Exercise
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Exercise Button */}
              <button className="w-full mt-4 px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg hover:bg-zinc-750 transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Exercise
              </button>
            </div>

            {/* Workout History */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
              <p className="text-zinc-500 text-sm">No workout logs yet for this date.</p>
            </div>

          </div>

          {/* Right Column - Muscle Map */}
          <div className="lg:sticky lg:top-24 h-[600px] lg:h-[800px]">
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 h-full">
              <h2 className="text-xl font-semibold mb-4">Active Muscles</h2>
              <div className="h-[calc(100%-3rem)]">
                <MuscleMapDisplay
                  highlights={{
                    muscles: activeMuscles,
                    fillColor: '#ff0a0a',
                    fillOpacity: 1,
                    strokeColor: '#e51d1d',
                    strokeWidth: 2,
                    blurInactive: 2
                  }}
                  showToggle={true}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
      </div>
    </SidebarProvider>
  );
}
