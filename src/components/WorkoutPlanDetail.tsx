'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import { exportPlanToPDF } from '@/lib/pdfExport';

interface Plan {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  tables: any[];
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface Exercise {
  name: string;
  sets: string;
  rest: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkoutPlanDetail = ({ plan }: { plan: Plan }) => {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(0);
  const [promptText, setPromptText] = useState('');

  // Parse workout plan data
  const workoutData = useMemo(() => {
    const table = plan.tables?.[0];
    if (!table?.rows) return [];

    return table.rows.map((row: any) => {
      const columns = row.columns || [];
      const day = columns[0] || '';
      const focus = columns[1] || '';
      const exercisesRaw = columns[2] || '';
      const duration = columns[3] || '';

      // Parse exercises from "Name: SetsxReps" format
      const exercises: Exercise[] = exercisesRaw.split('\n').filter(Boolean).map((line: string) => {
        const parts = line.split(':');
        const name = parts[0]?.trim() || line.trim();
        const setsReps = parts[1]?.trim() || '';

        // Try to extract rest time from sets/reps
        let rest = '60s';
        if (setsReps.toLowerCase().includes('min')) {
          rest = setsReps;
        } else if (setsReps.includes('x')) {
          // Default rest based on rep range
          const repMatch = setsReps.match(/x\s*(\d+)/);
          if (repMatch) {
            const reps = parseInt(repMatch[1]);
            if (reps <= 6) rest = '90-120s';
            else if (reps <= 10) rest = '90s';
            else rest = '60s';
          }
        }

        return { name, sets: setsReps, rest };
      });

      return { day, focus, exercises, duration };
    });
  }, [plan]);

  const currentDay = workoutData[selectedDay];

  const handleExportPDF = () => {
    const tablesWithIcons = plan.tables.map((table: any) => ({
      ...table,
      icon: '/vectors/workout-icon.svg'
    }));

    exportPlanToPDF({
      title: plan.title,
      prompt: plan.prompt,
      tables: tablesWithIcons,
      startDate: plan.startDate,
      endDate: plan.endDate,
    });
  };

  const baseWidth = 402;
  const baseHeight = 874;

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4">
      {/* iPhone Frame */}
      <div
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0 flex flex-col"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          height: `min(95vh, ${baseHeight}px)`,
        }}
      >
        {/* Burger Menu */}
        <div className="absolute top-4 left-4 z-20">
          <BurgerMenuButton />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-20 pb-2 pl-16">
          <h1
            className="text-white font-bold truncate"
            style={{
              fontFamily: 'var(--font-hanalei-fill)',
              fontSize: '1.5rem',
            }}
          >
            {plan.title}
          </h1>
          <button
            onClick={handleExportPDF}
            className="p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors"
            title="Export to PDF"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>

        {/* Day Tabs */}
        <div className="px-4 pb-2">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {workoutData.map((day: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  index === selectedDay
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {day.day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Day Title */}
        {currentDay && (
          <div className="px-4 pb-3">
            <h2 className="text-white font-semibold text-sm">
              {currentDay.day}: {currentDay.focus}
            </h2>
            <p className="text-gray-500 text-xs">{currentDay.duration}</p>
          </div>
        )}

        {/* Exercise Table */}
        <div className="flex-1 overflow-auto px-4 pb-2">
          {currentDay && currentDay.exercises.length > 0 ? (
            <div className="rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="text-left text-gray-400 font-medium py-3 px-4">Exercise</th>
                    <th className="text-left text-gray-400 font-medium py-3 px-4">Sets × Reps</th>
                    <th className="text-right text-gray-400 font-medium py-3 px-4">Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDay.exercises.map((exercise: Exercise, index: number) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                        index === currentDay.exercises.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="text-white py-3 px-4 font-medium">{exercise.name}</td>
                      <td className="text-gray-300 py-3 px-4">{exercise.sets}</td>
                      <td className="text-gray-400 py-3 px-4 text-right">{exercise.rest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No exercises for this day
            </div>
          )}
        </div>

        {/* Prompt Box - Sticky Bottom */}
        <div className="px-4 pb-2 pt-1">
          <PromptBoxOpenAI
            value={promptText}
            onChange={setPromptText}
            placeholder="Ask about this workout..."
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={() => router.push('/my-plans')}
            className="text-gray-400 text-xs hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              plan.status === 'IN_PROGRESS' ? 'bg-green-500' :
              plan.status === 'COMPLETED' ? 'bg-blue-500' :
              'bg-gray-500'
            }`} />
            <span className="text-gray-400 text-xs">{plan.status.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanDetail;