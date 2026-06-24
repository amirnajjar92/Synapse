"use client";

import { useState } from 'react';
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';
import WomenAnatomy from '@/components/WomenAnatomy';

export default function TestAnatomyPage() {
  // Example 1: Chest and arms workout
  const chestArmsHighlight: MuscleHighlight = {
    muscles: ['chest', 'biceps', 'triceps', 'front-delts'],
    fillColor: '#00ff00',
    fillOpacity: 0.7,
    strokeColor: '#00ff00',
    strokeWidth: 3
  };

  // Example 2: Leg day
  const legDayHighlight: MuscleHighlight = {
    muscles: ['quads', 'hamstrings', 'glutes', 'calves'],
    fillColor: '#ff00ff',
    fillOpacity: 0.5,
    strokeColor: '#ff00ff',
    strokeWidth: 2
  };

  // Example 3: Back workout
  const backWorkoutHighlight: MuscleHighlight = {
    muscles: ['lats', 'traps', 'lower-back', 'rear-delts'],
    fillColor: '#ffff00',
    fillOpacity: 0.6,
    strokeColor: '#ffff00',
    strokeWidth: 2.5
  };

  const [activeExample, setActiveExample] = useState<1 | 2 | 3>(1);

  const getHighlight = () => {
    switch (activeExample) {
      case 1: return chestArmsHighlight;
      case 2: return legDayHighlight;
      case 3: return backWorkoutHighlight;
    }
  };

  const getView = (): 'front' | 'back' => {
    return activeExample === 3 ? 'back' : 'front';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Anatomy Components Test
          </h1>
          <p className="text-zinc-400 text-lg">
            Example usage with different highlight presets
          </p>
        </div>

        {/* Example Selector */}
        <div className="mb-6 flex gap-4 justify-center">
          <button
            onClick={() => setActiveExample(1)}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeExample === 1
                ? 'bg-green-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Chest & Arms
          </button>
          <button
            onClick={() => setActiveExample(2)}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeExample === 2
                ? 'bg-pink-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Leg Day
          </button>
          <button
            onClick={() => setActiveExample(3)}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeExample === 3
                ? 'bg-yellow-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Back Workout
          </button>
        </div>

        {/* Anatomy Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Men */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">Men</h3>
            <MenAnatomy
              view={getView()}
              highlights={getHighlight()}
              onMuscleClick={(muscles) => console.log('Clicked muscles:', muscles)}
              width="100%"
              height="auto"
              className="cursor-pointer"
            />
          </div>

          {/* Women */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">Women</h3>
            <WomenAnatomy
              view={getView()}
              highlights={getHighlight()}
              onMuscleClick={(muscles) => console.log('Clicked muscles:', muscles)}
              width="100%"
              height="auto"
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800 shadow-xl">
          <h3 className="text-white text-lg font-semibold mb-4">Code Example</h3>
          <pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto text-sm text-zinc-300">
{`// Import the components
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';
import WomenAnatomy from '@/components/WomenAnatomy';

// Define your highlight settings
const myHighlight: MuscleHighlight = {
  muscles: ['chest', 'biceps', 'triceps'],
  fillColor: '#00ff00',
  fillOpacity: 0.7,
  strokeColor: '#00ff00',
  strokeWidth: 3
};

// Use the component
<MenAnatomy
  view="front"
  highlights={myHighlight}
  onMuscleClick={(muscles) => console.log(muscles)}
  width="100%"
  height="auto"
/>`}
          </pre>
        </div>

        {/* Available Muscles Reference */}
        <div className="mt-6 bg-zinc-950 rounded-2xl p-6 border border-zinc-800 shadow-xl">
          <h3 className="text-white text-lg font-semibold mb-4">Available Muscle Groups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-cyan-400 font-semibold mb-2">Front View:</h4>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• chest</li>
                <li>• front-delts</li>
                <li>• shoulders</li>
                <li>• biceps</li>
                <li>• forearms</li>
                <li>• abs</li>
                <li>• obliques</li>
                <li>• quads</li>
                <li>• shins</li>
                <li>• neck</li>
                <li>• adductors</li>
              </ul>
            </div>
            <div>
              <h4 className="text-purple-400 font-semibold mb-2">Back View:</h4>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• traps</li>
                <li>• rear-delts</li>
                <li>• lats</li>
                <li>• upper-back</li>
                <li>• lower-back</li>
                <li>• triceps</li>
                <li>• glutes</li>
                <li>• hamstrings</li>
                <li>• calves</li>
                <li>• neck</li>
                <li>• adductors</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
