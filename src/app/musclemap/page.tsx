"use client";

import { useState } from 'react';
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';
import WomenAnatomy from '@/components/WomenAnatomy';

type Gender = 'male' | 'female';

export default function MuscleMapPage() {
  const [gender, setGender] = useState<Gender>('male');
  const [blurIntensity, setBlurIntensity] = useState(3); // Blur for non-activated muscles

  const highlights: MuscleHighlight = {
    muscles: ['chest', 'biceps', 'triceps'],
    fillColor: '#ff0a0a',
    fillOpacity: 1,
    strokeColor: '#e51d1d',
    strokeWidth: 2,
    blurInactive: blurIntensity
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden">
      
      {/* Controls Panel - Top Left */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-10 bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4 space-y-2 min-w-[200px]">
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 block">Blur Inactive Muscles</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={blurIntensity}
            onChange={(e) => setBlurIntensity(Number(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-xs text-white">{blurIntensity}px</span>
        </div>
      </div>
      
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
            />
          ) : (
            <WomenAnatomy
              view="front"
              highlights={highlights}
              width="auto"
              height="100%"
            />
          )}
        </div>
      </div>

    </div>
  );
}
