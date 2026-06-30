"use client";

import { useState } from 'react';
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';
import WomenAnatomy from '@/components/WomenAnatomy';

type Gender = 'male' | 'female';
type AnatomyView = 'front' | 'back';

interface MuscleMapDisplayProps {
  highlights?: MuscleHighlight;
  defaultGender?: Gender;
  showToggle?: boolean;
  onMuscleClick?: (muscleGroups: string[]) => void;
  view?: AnatomyView;
}

export default function MuscleMapDisplay({
  highlights,
  defaultGender = 'male',
  showToggle = true,
  onMuscleClick,
  view = 'front',
}: MuscleMapDisplayProps) {
  const [gender, setGender] = useState<Gender>(defaultGender);

  const defaultHighlights: MuscleHighlight = highlights || {
    muscles: [],
    fillColor: '#0f0303f5',
    fillOpacity: 1,
    strokeColor: '#540404ff',
    strokeWidth: 1,
    blurInactive: 1,
  };

  return (
    <div className="h-full w-full bg-black flex items-center justify-center relative overflow-hidden rounded-lg">
      
      {/* Global style for SVG scaling */}
      <style jsx global>{`
        [class*="anatomy"] svg {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: 100%;
          display: block;
          margin: auto;
        }
      `}</style>
      
      {/* Toggle Switch - Responsive positioning */}
      {showToggle && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
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
      )}

      {/* Anatomy Component - Fully responsive and contained */}
      <div className="flex items-center justify-center w-full h-full">
        <div 
          className="flex items-center justify-center"
          style={{ 
            width: '100%', 
            height: '100%',
            padding: '3rem 1rem 1rem 1rem',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            maxWidth: '600px',
            maxHeight: '100%',
            transform: gender === 'female' ? 'scale(0.85)' : 'scale(1)'
          }}>
            {gender === 'male' ? (
              <MenAnatomy
                view={view}
                highlights={defaultHighlights}
                width="100%"
                height="100%"
                defaultStrokeColor="#000000ff"
                defaultStrokeWidth={0.25}
                inactiveFillColor="#1a1a1a"
                onMuscleClick={onMuscleClick}
              />
            ) : (
              <WomenAnatomy
                view={view}
                highlights={defaultHighlights}
                width="100%"
                height="100%"
                defaultStrokeColor="#000000ff"
                defaultStrokeWidth={0.25}
                inactiveFillColor="#1a1a1a"
                onMuscleClick={onMuscleClick}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
