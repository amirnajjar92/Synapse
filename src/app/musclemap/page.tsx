"use client";

import { useState } from 'react';
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';
import WomenAnatomy from '@/components/WomenAnatomy';

type Gender = 'male' | 'female';
type View = 'front' | 'back';

export default function MuscleMapPage() {
  const [gender, setGender] = useState<Gender>('male');
  const [view, setView] = useState<View>('front');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  
  // Example highlight settings (can be customized)
  const [highlightColor, setHighlightColor] = useState('#ff0000');
  const [fillOpacity, setFillOpacity] = useState(0.6);
  const [strokeWidth, setStrokeWidth] = useState(2);

  const highlights: MuscleHighlight = {
    muscles: selectedMuscles,
    fillColor: highlightColor,
    fillOpacity: fillOpacity,
    strokeColor: highlightColor,
    strokeWidth: strokeWidth,
    strokeOpacity: 0.9
  };

  const handleMuscleClick = (muscleGroups: string[]) => {
    // Toggle muscle selection
    setSelectedMuscles(prev => {
      const newSelection = [...prev];
      muscleGroups.forEach(muscle => {
        const index = newSelection.indexOf(muscle);
        if (index > -1) {
          newSelection.splice(index, 1);
        } else {
          newSelection.push(muscle);
        }
      });
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedMuscles([]);
  };

  // Available muscle groups based on view
  const availableMuscles = {
    front: ['chest', 'front-delts', 'shoulders', 'biceps', 'forearms', 'abs', 'obliques', 'quads', 'shins', 'neck', 'adductors'],
    back: ['traps', 'rear-delts', 'lats', 'upper-back', 'lower-back', 'triceps', 'glutes', 'hamstrings', 'calves', 'neck', 'adductors']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Interactive Muscle Map
          </h1>
          <p className="text-zinc-400 text-lg">
            Select and highlight muscle groups with custom colors
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center items-center">
          {/* Gender Toggle */}
          <div className="flex gap-2 bg-zinc-900 rounded-lg p-1">
            <button
              onClick={() => setGender('male')}
              className={`px-4 py-2 rounded-md transition-all ${
                gender === 'male'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender('female')}
              className={`px-4 py-2 rounded-md transition-all ${
                gender === 'female'
                  ? 'bg-pink-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Female
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-zinc-900 rounded-lg p-1">
            <button
              onClick={() => setView('front')}
              className={`px-4 py-2 rounded-md transition-all ${
                view === 'front'
                  ? 'bg-cyan-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setView('back')}
              className={`px-4 py-2 rounded-md transition-all ${
                view === 'back'
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Back
            </button>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-4 py-2">
            <label className="text-zinc-400 text-sm">Color:</label>
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => setHighlightColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>

          {/* Clear Button */}
          {selectedMuscles.length > 0 && (
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Anatomy Display */}
        <div className="flex justify-center mb-6">
          <div className="relative bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 shadow-xl max-w-2xl">
            {gender === 'male' ? (
              <MenAnatomy
                view={view}
                highlights={highlights}
                onMuscleClick={handleMuscleClick}
                width="100%"
                height="auto"
                className="cursor-pointer"
              />
            ) : (
              <WomenAnatomy
                view={view}
                highlights={highlights}
                onMuscleClick={handleMuscleClick}
                width="100%"
                height="auto"
                className="cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-3 text-center">Quick Select</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {availableMuscles[view].map(muscle => (
              <button
                key={muscle}
                onClick={() => handleMuscleClick([muscle])}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedMuscles.includes(muscle)
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {muscle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Info */}
        {selectedMuscles.length > 0 && (
          <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Selected Muscles ({selectedMuscles.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedMuscles.map(muscle => (
                <span
                  key={muscle}
                  className="px-3 py-1 bg-red-900/30 border border-red-800/50 rounded-lg text-sm text-red-400"
                >
                  {muscle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Customization Panel */}
        <div className="mt-6 rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-white">Customization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fill Opacity */}
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">
                Fill Opacity: {(fillOpacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={fillOpacity}
                onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Stroke Width */}
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">
                Stroke Width: {strokeWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-zinc-900/50 rounded-lg px-6 py-3 border border-zinc-800">
            <p className="text-sm text-zinc-400">
              <strong className="text-white">💡 Tip:</strong> Click on any muscle group to select/deselect • 
              Use quick select buttons • Customize colors and opacity • Switch between front/back views
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
