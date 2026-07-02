'use client';

import { useState, useEffect } from 'react';
import PlanTable from '@/components/PlanTable';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import CustomButton from '@/components/CustomButton';

// MOCK DATA
const MOCK_TABLES = [
  {
    id: 0,
    title: 'MEALS',
    icon: '/vectors/meals-icon.svg',
    tableData: [
      { id: 0, columns: ['Monday', 'Greek Yogurt + Berries', 'Grilled Chicken Salad', 'Salmon + Veggies', '1800 kcal'] },
      { id: 1, columns: ['Tuesday', 'Oatmeal + Banana', 'Turkey Wrap', 'Beef Stir-fry', '1850 kcal'] },
      { id: 2, columns: ['Wednesday', 'Protein Smoothie', 'Tuna Salad', 'Chicken + Rice', '1820 kcal'] },
      { id: 3, columns: ['Thursday', 'Eggs + Avocado', 'Quinoa Bowl', 'Fish + Broccoli', '1780 kcal'] },
      { id: 4, columns: ['Friday', 'Greek Yogurt + Nuts', 'Chicken Breast', 'Lean Beef + Salad', '1900 kcal'] },
      { id: 5, columns: ['Saturday', 'Pancakes (protein)', 'Salmon Wrap', 'Turkey Meatballs', '1950 kcal'] },
      { id: 6, columns: ['Sunday', 'Omelette', 'Chicken Caesar', 'Grilled Fish', '1800 kcal'] },
    ],
    horizontalScroll: false,
  },
  {
    id: 1,
    title: 'CARDIO',
    icon: '/vectors/cardio-icon.svg',
    tableData: [
      { id: 0, columns: ['Monday', 'Rest', '-', '-'] },
      { id: 1, columns: ['Tuesday', 'Running', '5km', '30min'] },
      { id: 2, columns: ['Wednesday', 'Rest', '-', '-'] },
      { id: 3, columns: ['Thursday', 'Cycling', '15km', '45min'] },
      { id: 4, columns: ['Friday', 'Rest', '-', '-'] },
      { id: 5, columns: ['Saturday', 'Running', '8km', '45min'] },
      { id: 6, columns: ['Sunday', 'Walking', '5km', '60min'] },
    ],
    horizontalScroll: false,
  },
  {
    id: 2,
    title: 'SUPPLEMENTS',
    icon: '/vectors/suppliments-icon.svg',
    tableData: [
      { id: 0, columns: ['Protein Powder', '30g', 'Post-workout'] },
      { id: 1, columns: ['Creatine', '5g', 'Daily'] },
      { id: 2, columns: ['Multivitamin', '1 tablet', 'Morning'] },
      { id: 3, columns: ['Omega-3', '2 capsules', 'With meals'] },
      { id: 4, columns: ['Vitamin D', '2000 IU', 'Morning'] },
    ],
    horizontalScroll: false,
  },
];

const baseWidth = 402;
const baseHeight = 874;

export default function DemoPlanDetailPage() {
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentPlan = MOCK_TABLES[currentTableIndex];

  const handleNextTable = () => {
    setCurrentTableIndex((currentTableIndex + 1) % MOCK_TABLES.length);
  };

  const handlePrevTable = () => {
    setCurrentTableIndex((currentTableIndex - 1 + MOCK_TABLES.length) % MOCK_TABLES.length);
  };

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
        <div
          className="w-full h-full flex flex-col gap-2 relative pt-10"
          style={{ backgroundColor: '#0b0b0bff' }}
        >
          {/* Burger Menu - top left */}
          <div className="absolute top-4 left-4 z-10">
            <BurgerMenuButton />
          </div>

          {/* Export PDF - top right */}
          <div className="absolute top-4 right-4 z-10">
            <button
              className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-gray-700 transition-colors"
              title="Export to PDF"
            >
              <span className="text-[10px] text-gray-400 hover:text-white">PDF</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 hover:text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>

          {/* Header - flex-[1] */}
          <div className="flex-[0.5] flex items-center justify-between px-3 sm:px-4 md:px-6 pt-4 pb-1 min-h-0 overflow-hidden">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h2
                className="text-white font-bold truncate"
                style={{
                  fontFamily: 'var(--font-hanalei-fill)',
                  fontSize: 'calc((100vh * 0.95) * (36 / 874))',
                  lineHeight: '1',
                }}
              >
                {currentPlan.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                src={currentPlan.icon}
                alt={`${currentPlan.title} Icon`}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
            </div>
          </div>

          {/* Table - flex-[3] */}
          <div className="flex-[3] min-h-0 overflow-hidden" style={{ maxHeight: '25vh' }}>
            <PlanTable
              data={currentPlan.tableData}
              isLoading={false}
              horizontalScroll={currentPlan.horizontalScroll}
              showTabs={false}
            />
          </div>

          {/* Tabs - flex-[1] */}
          <div className="flex-[1] min-h-0 flex items-center overflow-hidden px-2" style={{ maxHeight: '6.25vh' }}>
            <div className="w-full flex items-center justify-between gap-1">
              <button
                onClick={handlePrevTable}
                className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Previous table"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="flex gap-1 flex-1 overflow-x-auto hide-scrollbar justify-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {MOCK_TABLES.map((p, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTableIndex(index)}
                    className={`px-2 py-1 rounded-full text-[10px] sm:text-xs transition-all whitespace-nowrap ${
                      index === currentTableIndex
                        ? 'bg-white text-black font-semibold'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNextTable}
                className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Next table"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status Controls - flex-[1] */}
          <div className="flex-[1] min-h-0 flex items-center justify-center gap-3 overflow-hidden">
            <div className="relative">
              <CustomButton
                mirror={true}
                text="START PLAN"
                onClick={() => {}}
                width="150px"
                fontSize="16px"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30 blur-lg animate-pulse" />
            </div>
            <button
              className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full px-4 py-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              Modify with AI
            </button>
          </div>
        </div>
      </div>

      <FloatingNavBar />
    </div>
  );
}
