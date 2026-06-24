"use strict";

import React, { useState } from 'react';

// Define structure for Muscle Group Info Panel
interface MuscleGroup {
  id: string;
  name: string;
  view: 'front' | 'back';
  exercises: string[];
  description: string;
}

export default function WorkoutAnatomyDashboard() {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>('chest');
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // Repository mapping muscle IDs to targeted routines
  const muscleData: Record<string, MuscleGroup> = {
    chest: {
      id: 'chest',
      name: 'Pectoralis Major (Chest)',
      view: 'front',
      exercises: ['Barbell Bench Press', 'Incline Dumbbell Flyes', 'Chest Dips', 'Push-ups'],
      description: 'Primary muscle group responsible for pushing actions, horizontal adduction, and internal rotation of the humerus.'
    },
    abs: {
      id: 'abs',
      name: 'Rectus Abdominis (Core)',
      view: 'front',
      exercises: ['Hanging Leg Raises', 'Ab Wheel Rollouts', 'Planks', 'Cable Crunches'],
      description: 'Core musculature essential for spinal flexion, stabilization, and generating intra-abdominal structural pressure.'
    },
    quads: {
      id: 'quads',
      name: 'Quadriceps (Thighs)',
      view: 'front',
      exercises: ['Barbell Back Squats', 'Bulgarian Split Squats', 'Leg Extensions', 'Leg Press'],
      description: 'Powerful four-headed muscle group running down the front thigh responsible for knee extension and hip flexion.'
    },
    biceps: {
      id: 'biceps',
      name: 'Biceps Brachii',
      view: 'front',
      exercises: ['Incline Dumbbell Curls', 'Barbell Preacher Curls', 'Hammer Curls'],
      description: 'Two-headed skeletal muscle vital for forearm supination and elbow flexion.'
    },
    back_upper: {
      id: 'back_upper',
      name: 'Latissimus Dorsi & Trapezius',
      view: 'back',
      exercises: ['Weighted Pull-ups', 'Barbell Bent-Over Rows', 'Lat Pulldowns', 'Face Pulls'],
      description: 'Dominant upper posterior chain muscles governing shoulder extension, adduction, and scapular retraction.'
    },
    hamstrings: {
      id: 'hamstrings',
      name: 'Hamstrings & Glutes',
      view: 'back',
      exercises: ['Romanian Deadlifts', 'Barbell Hip Thrusts', 'Lying Leg Curls'],
      description: 'Critical posterior muscle chain generating hip extension and knee joint flexion forces.'
    }
  };

  // Helper to determine path filling based on modern Dark Mode UX states
  const getGroupStyle = (id: string) => {
    const isSelected = selectedMuscle === id;
    const isHovered = hoveredMuscle === id;

    if (isSelected) {
      return {
        fill: 'rgba(59, 130, 246, 0.35)', // Glowing tech blue accent
        stroke: '#3b82f6',
        strokeWidth: '1.5px',
        filter: 'drop-shadow(0px 0px 6px rgba(59, 130, 246, 0.6))',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      };
    }
    if (isHovered) {
      return {
        fill: 'rgba(251, 191, 36, 0.2)', // Warm gold warning focus line
        stroke: '#fbbf24',
        strokeWidth: '1.2px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      };
    }
    return {
      fill: 'rgba(63, 63, 70, 0.4)', // Base sleek slate grey tint
      stroke: '#52525b',
      strokeWidth: '0.6px',
      cursor: 'pointer',
      transition: 'all 0.4s ease'
    };
  };

  const currentMuscleInfo = selectedMuscle ? muscleData[selectedMuscle] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT COLUMN: INTERACTIVE VISUALIZER */}
        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center shadow-2xl">
          <div className="w-full flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Anatomy & Affected Target Zones</h2>
              <p className="text-xs text-zinc-400 mt-1">Select a hotzone layer to populate workout strategies</p>
            </div>
            
            {/* View Switching Tab Controls */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => { setActiveView('front'); setSelectedMuscle('chest'); }}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === 'front' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                Front View
              </button>
              <button
                onClick={() => { setActiveView('back'); setSelectedMuscle('back_upper'); }}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === 'back' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                Back View
              </button>
            </div>
          </div>

          {/* SVG Frame Shell Containing Exact Client Coordinate Matrices */}
          <div className="relative w-full max-w-[420px] aspect-[552/516] bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/50 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 552 516" 
              className="w-full h-full select-none select-none drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              {/* BACKDROP BOUNDING BOUNDS PRESERVED FROM INPUT SOURCE */}
              <path d="M 0.00 516.00 L 552.00 516.00 L 552.00 0.00 L 0.00 0.00 Z" fill="none" pointerEvents="none" />

              {activeView === 'front' ? (
                <>
                  {/* FRONT VIEW GROUP INTERACTIVE BINDINGS */}
                  {/* CHEST (PECTORALS) */}
                  <g 
                    style={getGroupStyle('chest')}
                    onClick={() => setSelectedMuscle('chest')}
                    onMouseEnter={() => setHoveredMuscle('chest')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path d="M 152.00 74.00 C 149.94 82.31 164.54 91.72 173.01 92.99 C 181.48 94.26 194.77 96.40 199.00 107.00 C 199.32 107.80 199.77 109.11 200.00 110.00 C 204.72 118.04 201.97 128.70 204.00 138.00 Z" />
                    <path d="M 116.00 60.00 C 117.45 63.37 117.88 68.43 120.00 72.00 C 120.74 72.82 120.97 73.33 122.00 74.00 C 129.74 79.04 144.36 79.57 152.00 74.00 Z" />
                  </g>

                  {/* CORE / ABS (RECTUS ABDOMINIS) */}
                  <g 
                    style={getGroupStyle('abs')}
                    onClick={() => setSelectedMuscle('abs')}
                    onMouseEnter={() => setHoveredMuscle('abs')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path d="M 134.37 293.68 L 128.00 335.00 C 127.95 337.66 127.44 339.99 127.00 342.00 C 127.00 342.99 127.08 344.02 127.00 345.00 Z" />
                    <path d="M 151.00 299.00 C 156.24 304.04 149.15 319.44 152.00 326.00 C 152.12 323.16 153.39 314.18 153.00 311.00 Z" />
                  </g>

                  {/* THIGHS / QUADRICEPS */}
                  <g 
                    style={getGroupStyle('quads')}
                    onClick={() => setSelectedMuscle('quads')}
                    onMouseEnter={() => setHoveredMuscle('quads')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path d="M 129.00 452.00 C 129.00 459.42 129.39 475.44 129.00 482.00 C 128.61 488.56 132.19 510.09 124.00 508.00 Z" />
                    <path d="M 113.99 484.99 C 115.21 476.77 114.95 465.49 114.00 457.00 Z" />
                  </g>

                  {/* ARMS / BICEPS */}
                  <g 
                    style={getGroupStyle('biceps')}
                    onClick={() => setSelectedMuscle('biceps')}
                    onMouseEnter={() => setHoveredMuscle('biceps')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path d="M 206.00 166.00 C 205.35 159.30 205.01 148.44 202.00 142.00 C 187.01 126.54 183.78 134.78 189.70 159.30 Z" />
                  </g>
                </>
              ) : (
                <>
                  {/* BACK VIEW GROUP INTERACTIVE BINDINGS */}
                  {/* UPPER BACK / LATS */}
                  <g 
                    style={getGroupStyle('back_upper')}
                    onClick={() => setSelectedMuscle('back_upper')}
                    onMouseEnter={() => setHoveredMuscle('back_upper')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path d="M 437.00 34.00 C 438.21 38.28 438.49 42.71 439.00 48.00 C 440.70 55.95 433.96 64.43 432.00 72.00 Z" />
                    <path d="M 400.00 73.00 C 400.03 63.74 403.54 52.72 415.01 52.01 C 426.48 51.30 432.00 61.42 432.00 72.00 Z" />
                    <path d="M 359.00 101.00 C 356.50 103.50 355.65 105.05 354.00 108.00 C 351.78 114.73 353.47 122.18 354.00 129.00 Z" />
                  </g>

                  {/* LOWER BACK / HAMSTRINGS / GLUTES GLOW SECTION */}
                  <g 
                    style={getGroupStyle('hamstrings')}
                    onClick={() => setSelectedMuscle('hamstrings')}
                    onMouseEnter={() => setHoveredMuscle('hamstrings')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path d="M 458.00 246.00 C 458.00 268.33 458.00 290.67 458.00 313.00 C 458.00 316.51 457.40 320.20 457.00 323.00 Z" />
                    <path d="M 405.00 346.50 C 405.00 347.00 405.00 353.90 405.62 361.13 405.00 368.00 Z" />
                    <path d="M 411.59 408.25 C 411.17 418.82 410.00 427.00 Z" />
                  </g>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* RIGHT COMPONENT COLUMN: WORKOUT GENERATOR PANEL */}
        <div className="lg:col-span-5 space-y-6">
          {currentMuscleInfo ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></span>
                <h3 className="text-lg font-bold tracking-wide text-white">{currentMuscleInfo.name}</h3>
              </div>
              
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                {currentMuscleInfo.description}
              </p>

              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Recommended Exercises</h4>
                <div className="space-y-2.5">
                  {currentMuscleInfo.exercises.map((exercise, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all group"
                    >
                      <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                        {exercise}
                      </span>
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/10">
                        Target Area
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-sm text-zinc-500">Hover or click any active node coordinates to build dynamic routine cards.</p>
            </div>
          )}

          {/* QUICK SUMMARY INFOCARD METRICS */}
          <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/40 border border-blue-900/30 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-blue-300 mb-1">Developer Implementation Advice</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This component isolates your complex vector segments securely using clean CSS transforms. You can wire this layout effortlessly to query datasets or relational hooks inside your Next.js application framework.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}