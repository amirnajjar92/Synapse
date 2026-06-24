"use client";

import { useState } from 'react';
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';
import WomenAnatomy from '@/components/WomenAnatomy';

type Gender = 'male' | 'female';

export default function MuscleMapPage() {
  const [gender, setGender] = useState<Gender>('male');

  const highlights: MuscleHighlight = {
    muscles: ['chest', 'biceps', 'triceps'],
    fillColor: '#0f0303f5',
    fillOpacity: 1,
    strokeColor: '#540404ff',
    strokeWidth: 1,
    blurInactive: 1,
    
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden">
      
      {/* Toggle Switch - Responsive positioning */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`text-xs sm:text-sm font-medium ${gender === 'male' ? 'text-white' : 'text-zinc-600'}`}>
            Men
          </span>
          <button
            onClick={() => setGender(gender === 'male' ? 'female' : 'male')}
            className="relative w-12 h-6 sm:w-14 sm:h-7 bg-zinc-800 rounded-full transition-colors hover:bg-zinc-700 active:bg-zinc-600"
            aria-label={`Switch to ${gender === 'male' ? 'female' : 'male'} anatomy`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full transition-transform ${
                gender === 'female' ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs sm:text-sm font-medium ${gender === 'female' ? 'text-white' : 'text-zinc-600'}`}>
            Women
          </span>
        </div>
      </div>

      {/* Anatomy Component - Fully responsive */}
      <div className="flex items-center justify-center w-full h-full p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12">
        <div className="relative w-full h-full max-w-[95vw] max-h-[90vh] sm:max-w-[90vw] sm:max-h-[85vh] flex items-center justify-center">
          <div 
            className="w-full h-full flex items-center justify-center transition-transform duration-300"
            style={{ 
              transform: gender === 'female' 
                ? 'scale(0.65)' // Smaller for women's anatomy on all devices
                : 'scale(0.75)' // Adjusted for men's anatomy on all devices
            }}
          >
            {gender === 'male' ? (
              <MenAnatomy
                view="front"
                highlights={highlights}
                width="auto"
                height="100%"
                defaultStrokeColor="#000000ff"
                defaultStrokeWidth={0.25}
                inactiveFillColor="#1a1a1a"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <WomenAnatomy
                view="front"
                highlights={highlights}
                width="auto"
                height="100%"
                defaultStrokeColor="#000000ff"
                defaultStrokeWidth={0.25}
                inactiveFillColor="#1a1a1a"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
