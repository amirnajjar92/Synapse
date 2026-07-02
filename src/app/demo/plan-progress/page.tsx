'use client';

import { useState, useEffect } from 'react';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import { ProgressComparisonChart } from '@/components/ProgressComparisonChart';
import { WeightChart } from '@/components/WeightChart';

const CURRENT_DAY = 21;
const TOTAL_DAYS = 45;

// Generate mock weight data (78kg -> 72kg goal)
const generateMockWeights = () => {
  const weights = [];
  for (let i = 0; i < CURRENT_DAY; i++) {
    const progress = i / TOTAL_DAYS;
    const weight = 78 - (progress * 6) + (Math.sin(i * 0.4) * 0.6);
    weights.push(Math.max(71, Math.min(79, weight)));
  }
  return weights;
};

// Generate mock progress data (actual completion %)
const generateMockProgress = () => {
  const progress = [];
  for (let i = 0; i < CURRENT_DAY; i++) {
    const baseProgress = 75 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
    progress.push(Math.max(60, Math.min(95, baseProgress)));
  }
  return progress;
};

const mockWeights = generateMockWeights();
const mockProgress = generateMockProgress();

const baseWidth = 402;
const baseHeight = 874;

const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

export default function DemoPlanProgressPage() {
  const [activeTab, setActiveTab] = useState(1); // Default to "Today's Focus"
  const [mounted, setMounted] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { label: 'Calendar' },
    { label: "Today's Focus" },
    { label: 'Analyser', icon: '/vectors/ai-icon.svg' },
    { label: 'History' },
  ];

  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  // Generate calendar days with plan highlights (day 1-21 active, 22-45 upcoming)
  const PLAN_START_DATE = new Date(2026, 5, 1); // June 1, 2026
  
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const calendarDays = [];
    
    // Add empty days
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push({ date: null, isToday: false, dayNum: null, planDay: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(calendarYear, calendarMonth, i);
      const isToday = date.toDateString() === new Date().toDateString();
      
      // Calculate which plan day this is (1-45)
      const dayDiff = Math.floor((date.getTime() - PLAN_START_DATE.getTime()) / (1000 * 60 * 60 * 24));
      const planDay = dayDiff >= 0 && dayDiff < TOTAL_DAYS ? dayDiff + 1 : null;
      
      calendarDays.push({ date, isToday, dayNum: i, planDay });
    }
    
    return calendarDays;
  };

  const calendarDays = generateCalendarDays();

  if (!mounted) return null;

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4">
      <div
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh',
        }}
      >
        <div className="w-full h-full flex flex-col overflow-y-auto hide-scrollbar" style={{ backgroundColor: '#0b0b0bff' }}>
          <style dangerouslySetInnerHTML={{ __html: hideScrollbarStyle }} />

          {/* Header */}
          <div className="p-4 border-b border-[#3B3B3B]">
            <div className="flex items-center gap-4">
              <BurgerMenuButton />
              <h1 className="text-white font-bold flex-1 min-w-0" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: '1.5rem' }}>
                Plan Progress
              </h1>
            </div>
          </div>

          {/* Current Date & Day */}
          <div className="flex w-full border-b border-[#3B3B3B]">
            <div className="w-1/2 h-full border-r border-[#3B3B3B] flex flex-col items-center justify-center p-4">
              <span className="text-white font-bold" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: '2rem' }}>
                {todayDayName}
              </span>
              <span className="text-white font-medium" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: '1rem' }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="w-1/2 h-full flex items-center justify-center p-4">
              <div className="flex items-baseline gap-1">
                <span className="text-white font-bold" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: '2rem' }}>
                  DAY{CURRENT_DAY}
                </span>
                <span className="text-[#FFFFFF50]" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: '1.25rem' }}>
                  /{TOTAL_DAYS}DAYS
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-1 p-2">
            <button
              onClick={() => setActiveTab((prev) => (prev - 1 + tabs.length) % tabs.length)}
              className="p-1.5 text-white hover:bg-[#3B3B3B] rounded-full transition-colors flex-shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="flex gap-1 overflow-hidden">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-2 py-1 rounded-full text-[10px] transition-all whitespace-nowrap flex items-center justify-center gap-0.5 ${
                    index === activeTab ? 'bg-white text-black font-semibold' : 'bg-[#3B3B3B] text-white hover:bg-[#3B63CF]'
                  }`}
                >
                  {tab.icon && (
                    <img src={tab.icon} alt="" className={`w-2.5 h-2.5 object-contain flex-shrink-0 ${index === activeTab ? 'brightness-0' : ''}`} />
                  )}
                  <span className="text-[9px]">{tab.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveTab((prev) => (prev + 1) % tabs.length)}
              className="p-1.5 text-white hover:bg-[#3B3B3B] rounded-full transition-colors flex-shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 p-4 overflow-y-auto hide-scrollbar">
            {activeTab === 0 && (
              /* Calendar */
              <div className="bg-black rounded-2xl p-3 border border-[#3B3B3B]">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => {
                      let newMonth = calendarMonth - 1;
                      let newYear = calendarYear;
                      if (newMonth < 0) {
                        newMonth = 11;
                        newYear--;
                      }
                      setCalendarMonth(newMonth);
                      setCalendarYear(newYear);
                    }}
                    className="p-1 rounded-lg hover:bg-[#3B3B3B]"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="text-white font-bold text-sm">
                    {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => {
                      let newMonth = calendarMonth + 1;
                      let newYear = calendarYear;
                      if (newMonth > 11) {
                        newMonth = 0;
                        newYear++;
                      }
                      setCalendarMonth(newMonth);
                      setCalendarYear(newYear);
                    }}
                    className="p-1 rounded-lg hover:bg-[#3B3B3B]"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                    <div key={idx} className="text-center text-xs font-semibold text-white">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square flex items-center justify-center text-xs rounded-lg ${
                        !day.date
                          ? ''
                          : day.isToday
                          ? 'bg-blue-600 text-white font-bold'
                          : day.planDay && day.planDay <= CURRENT_DAY
                          ? 'bg-green-600/30 text-white font-semibold'
                          : day.planDay && day.planDay > CURRENT_DAY
                          ? 'bg-yellow-600/20 text-white/70'
                          : 'text-white/50'
                      }`}
                    >
                      {day.dayNum}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 1 && (
              /* Today's Focus */
              <div className="space-y-4">
                <div className="bg-black rounded-2xl p-4 border border-[#3B3B3B]">
                  <h3 className="text-white font-bold mb-3 text-sm">Weight Progress</h3>
                  <WeightChart
                    weightsKg={mockWeights}
                    totalDays={TOTAL_DAYS}
                    currentDay={CURRENT_DAY}
                    goalWeight={72}
                    mode="lose"
                  />
                  <div className="flex justify-between mt-2 text-xs text-white/50">
                    <span>Start: 78kg</span>
                    <span>Current: 74.8kg</span>
                    <span>Goal: 72kg</span>
                  </div>
                </div>

                <div className="bg-black rounded-2xl p-4 border border-[#3B3B3B]">
                  <h3 className="text-white font-bold mb-3 text-sm">Daily Completion</h3>
                  <ProgressComparisonChart
                    totalDays={TOTAL_DAYS}
                    currentDay={CURRENT_DAY}
                    actualProgressData={mockProgress}
                    predictedProgressData={Array(TOTAL_DAYS).fill(100)}
                  />
                  <div className="flex justify-between mt-2 text-xs text-white/50">
                    <span>Avg: 82%</span>
                    <span>Today: 87%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black rounded-xl p-3 border border-[#3B3B3B]">
                    <div className="text-white/50 text-[10px] mb-1">Workouts</div>
                    <div className="text-white font-bold text-lg">18/21</div>
                  </div>
                  <div className="bg-black rounded-xl p-3 border border-[#3B3B3B]">
                    <div className="text-white/50 text-[10px] mb-1">Cardio</div>
                    <div className="text-white font-bold text-lg">156km</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              /* Analyser */
              <div className="space-y-3">
                <div className="bg-black rounded-xl p-4 border border-[#3B3B3B]">
                  <h3 className="text-white font-bold mb-2 text-sm">AI Analysis</h3>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Your progress is excellent! You've completed 87% of planned workouts and are ahead of your weight loss target. 
                    Your cardio distance has been consistent, averaging 7.4km per session.
                  </p>
                </div>
                <div className="bg-black rounded-xl p-4 border border-[#3B3B3B]">
                  <h3 className="text-white font-bold mb-2 text-sm">Recommendations</h3>
                  <ul className="text-white/70 text-xs space-y-1">
                    <li>• Maintain current calorie deficit</li>
                    <li>• Add 1 extra rest day per week</li>
                    <li>• Increase protein intake to 2g/kg</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              /* History */
              <div className="space-y-3">
                <div className="bg-black rounded-xl p-3 border border-[#3B3B3B]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/50 text-[10px]">Day 21</span>
                    <span className="text-green-500 text-xs font-semibold">87%</span>
                  </div>
                  <p className="text-white text-xs">Completed all cardio sessions</p>
                  <p className="text-white/50 text-[10px] mt-1">8.5km run, weight: 74.8kg</p>
                </div>
                <div className="bg-black rounded-xl p-3 border border-[#3B3B3B]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/50 text-[10px]">Day 20</span>
                    <span className="text-green-500 text-xs font-semibold">92%</span>
                  </div>
                  <p className="text-white text-xs">Full workout + meal plan</p>
                  <p className="text-white/50 text-[10px] mt-1">Upper body strength, weight: 75.1kg</p>
                </div>
                <div className="bg-black rounded-xl p-3 border border-[#3B3B3B]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/50 text-[10px]">Day 19</span>
                    <span className="text-yellow-500 text-xs font-semibold">78%</span>
                  </div>
                  <p className="text-white text-xs">Skipped evening cardio</p>
                  <p className="text-white/50 text-[10px] mt-1">Morning workout only, weight: 75.3kg</p>
                </div>
                <div className="bg-black rounded-xl p-3 border border-[#3B3B3B]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/50 text-[10px]">Day 18</span>
                    <span className="text-green-500 text-xs font-semibold">95%</span>
                  </div>
                  <p className="text-white text-xs">Perfect day - all targets met</p>
                  <p className="text-white/50 text-[10px] mt-1">10km run, all meals tracked, weight: 75.5kg</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <FloatingNavBar />
    </div>
  );
}
