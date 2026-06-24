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
    blurInactive: 0.5,
    
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden">
      
      {/* Toggle Switch - Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-10">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${gender === 'male' ? 'text-white' : 'text-zinc-600'}`}>
            Men
          </span>
          <button
            onClick={() => setGender(gender === 'male' ? 'female' : 'male')}
            className="relative w-14 h-7 bg-zinc-800 rounded-full transition-colors hover:bg-zinc-700"
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                gender === 'female' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${gender === 'female' ? 'text-white' : 'text-zinc-600'}`}>
            Women
          </span>
        </div>
      </div>

      {/* Anatomy Component */}
      <div className="flex items-center justify-center w-full h-full">
        <div style={{ 
          maxWidth: '90%', 
          maxHeight: '85%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          transform: gender === 'female' ? 'scale(0.75)' : 'scale(0.85)'
        }}>
          {gender === 'male' ? (
            <MenAnatomy
              view="front"
              highlights={highlights}
              width="auto"
              height="100%"
              defaultStrokeColor="#000000ff"
              defaultStrokeWidth={0.25}
            />
          ) : (
            <WomenAnatomy
              view="front"
              highlights={highlights}
              width="auto"
              height="100%"
              defaultStrokeColor="#000000ff"
              defaultStrokeWidth={0.25}
            />
          )}
        </div>
      </div>

    </div>
  );
}
