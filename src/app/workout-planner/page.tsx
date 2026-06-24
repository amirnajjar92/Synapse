"use client";

import { useState } from 'react';
import FloatingNavBar from '@/components/FloatingNavBar';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider } from '@/components/SidebarContext';
import MuscleMapDisplay from '@/components/MuscleMapDisplay';

export default function WorkoutPlannerPage() {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  const handleMuscleClick = (muscleGroups: string[]) => {
    setSelectedMuscles(prev => {
      const newMuscles = [...prev];
      muscleGroups.forEach(muscle => {
        const index = newMuscles.indexOf(muscle);
        if (index > -1) {
          newMuscles.splice(index, 1);
        } else {
          newMuscles.push(muscle);
        }
      });
      return newMuscles;
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-black text-white">
        <Sidebar />
        <BurgerMenuButton />
        <FloatingNavBar />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Workout Planner</h1>
          <p className="text-zinc-400">Create and manage your workout plans</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Form & Options */}
          <div className="space-y-6">
            
            {/* Create Workout Plan Card */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Create Workout Plan</h2>
              
              <div className="space-y-4">
                {/* Plan Title */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Plan Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Shred 2024"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Goal
                  </label>
                  <select className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600">
                    <option>Build Muscle</option>
                    <option>Lose Weight</option>
                    <option>Increase Strength</option>
                    <option>General Fitness</option>
                    <option>Athletic Performance</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Difficulty Level
                  </label>
                  <select className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                {/* Days Per Week */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Days Per Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    defaultValue="3"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Duration (weeks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    defaultValue="4"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>

                {/* Selected Muscles */}
                {selectedMuscles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Target Muscles
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMuscles.map(muscle => (
                        <span
                          key={muscle}
                          className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-sm border border-red-800"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Generate Workout Plan
                </button>
              </div>
            </div>

            {/* Existing Plans */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Your Workout Plans</h2>
              <p className="text-zinc-500 text-sm">No workout plans yet. Create your first plan!</p>
            </div>

          </div>

          {/* Right Column - Muscle Map */}
          <div className="lg:sticky lg:top-24 h-[600px] lg:h-[800px]">
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 h-full">
              <h2 className="text-xl font-semibold mb-4">Select Target Muscles</h2>
              <div className="h-[calc(100%-3rem)]">
                <MuscleMapDisplay
                  highlights={{
                    muscles: selectedMuscles,
                    fillColor: '#ff0a0a',
                    fillOpacity: 1,
                    strokeColor: '#e51d1d',
                    strokeWidth: 2,
                    blurInactive: 2
                  }}
                  onMuscleClick={handleMuscleClick}
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
