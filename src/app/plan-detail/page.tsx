'use client';

import { useEffect, useState } from 'react';
import PromptBox from '@/components/PromptBox';
import CustomButton from '@/components/CustomButton';
import PlanTable from '@/components/PlanTable';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

export default function PlanDetailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [promptText, setPromptText] = useState('i want a plan for 30 days weight loos -10kg....');
  const [currentTableIndex, setCurrentTableIndex] = useState(0);

  // All plan types
  const planTypes = [
    {
      title: "MEALS",
      icon: "/vectors/meals-icon.svg",
      tableData: [
        { id: 1, columns: ["Breakfast", "08:00", "Oatmeal + Whey Protein + Banana + Almonds"] },
        { id: 2, columns: ["Snack 1", "11:00", "Greek Yogurt + Berries + Chia Seeds"] },
        { id: 3, columns: ["Lunch", "13:30", "Grilled Chicken + Quinoa + Vegetables + Olive Oil"] },
        { id: 4, columns: ["Snack 2", "16:30", "Apple + Handful of Mixed Nuts"] },
        { id: 5, columns: ["Dinner", "19:30", "Baked Salmon + Sweet Potato + Salad"] },
        { id: 6, columns: ["Total", "-", "Daily Total"] },
      ],
      columnWidths: ["w-1/3", "w-1/5"],
      horizontalScroll: false
    },
    {
      title: "CARDIO",
      icon: "/vectors/cardio-icon.svg",
      tableData: [
        { id: 1, columns: ["Monday", "Easy Run", "5 km", "30 min"] },
        { id: 2, columns: ["Tuesday", "Rest or Light Walk", "-", "-"] },
        { id: 3, columns: ["Wednesday", "Interval Training", "6 km", "35 min"] },
        { id: 4, columns: ["Thursday", "Easy Run", "5 km", "32 min"] },
        { id: 5, columns: ["Friday", "Rest", "-", "-"] },
        { id: 6, columns: ["Saturday", "Long Run", "8-10 km", "55-65 min"] },
        { id: 7, columns: ["Sunday", "Rest or Yoga", "-", "-"] },
      ],
      columnWidths: ["w-1/4", "w-1/3", "w-1/5"],
      horizontalScroll: false
    },
    {
      title: "NUTRIENTS",
      icon: "/vectors/nutrients-icon.svg",
      tableData: [
        { id: 0, columns: ["", "Calories", "Protein", "Carbs", "Fats"] },
        { id: 1, columns: ["Breakfast", "480", "35g", "55g", "15g"] },
        { id: 2, columns: ["Snack 1", "220", "20g", "18g", "8g"] },
        { id: 3, columns: ["Lunch", "520", "45g", "45g", "18g"] },
        { id: 4, columns: ["Snack 2", "250", "6g", "25g", "15g"] },
        { id: 5, columns: ["Dinner", "380", "35g", "40g", "12g"] },
        { id: 6, columns: ["Total", "1,850", "141g", "183g", "68g"] },
      ],
      columnWidths: ["w-1/4", "w-1/6", "w-1/6", "w-1/6"],
      horizontalScroll: false
    },
    {
      title: "RECOMMENDED",
      icon: "/vectors/recomended-icon.svg",
      tableData: [
        { id: 1, columns: ["Sleep Goal", "7.5 - 8.5 hours / night"] },
        { id: 2, columns: ["Step Target", "10,000 - 12,000 steps daily"] },
        { id: 3, columns: ["Strength Training", "3-4 sessions/week (Full body + Core focus)"] },
        { id: 4, columns: ["Habit Checklist", "• Drink 3.5L water\n• No added sugar\n• 10k steps\n• Sleep before 11 PM"] },
        { id: 5, columns: ["Motivation / Mindset", "Daily tip or quote (changes every day)"] },
      ],
      columnWidths: ["w-2/5"],
      horizontalScroll: false
    },
    {
      title: "CHALLENGES",
      icon: "/vectors/challenges-icon.svg",
      tableData: [
        { id: 1, columns: ["Push-up Challenge", "Build upper body strength", "Daily", "Count total push-ups", "Week 1: 50/day → Week 4: 150/day"] },
        { id: 2, columns: ["No Sugar Challenge", "Reduce cravings & improve energy", "Daily", "Mark days without added sugar", "7-day streak = new badge"] },
        { id: 3, columns: ["10K Steps Challenge", "Increase daily movement", "Daily", "Phone / Watch steps", "Hit 25 days = Bonus points"] },
        { id: 4, columns: ["Hydration Challenge", "Improve water intake habit", "Daily", "Log 3.5L water", "Full month = Water trophy"] },
        { id: 5, columns: ["Mindfulness Challenge", "Reduce stress eating", "Daily", "Meditation or breathing", "Complete 20 days"] },
      ],
      columnWidths: ["160px", "160px", "100px", "180px", "200px"],
      horizontalScroll: true
    },
    {
      title: "SUPPLEMENTS",
      icon: "/vectors/suppliments-icon.svg",
      tableData: [
        { id: 1, columns: ["Whey Protein", "Muscle recovery", "Daily", "25g", "Post-workout"] },
        { id: 2, columns: ["Creatine", "Strength & performance", "Daily", "5g", "Any time"] },
        { id: 3, columns: ["Omega-3", "Joint & heart health", "Daily", "1-2g", "With meals"] },
        { id: 4, columns: ["Vitamin D3", "Bone health & immunity", "Daily", "1000-2000 IU", "With food"] },
        { id: 5, columns: ["Multivitamin", "Overall health", "Daily", "1 tablet", "Breakfast"] },
      ],
      columnWidths: ["160px", "160px", "100px", "180px", "200px"],
      horizontalScroll: true
    }
  ];

  // Get current plan
  const currentPlan = planTypes[currentTableIndex];

  // Handle next button click
  const handleNextTable = () => {
    setCurrentTableIndex((prev) => (prev + 1) % planTypes.length);
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Base dimensions (original design)
  const baseWidth = 402;
  const baseHeight = 874;

  // Row heights based on size guide
  const headerHeight = 100;
  const tableHeight = 360;
  const emptyRowHeight = 100;

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4">
      {/* Responsive iPhone Frame */}
      <div 
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh'
        }}
      >
        {/* Main Container */}
        <div 
          className="w-full h-full flex flex-col pb-2 sm:pb-3 md:pb-4"
          style={{ backgroundColor: '#0b0b0bff' }}
        >
          {/* Row 1: Header - 400 X 100 */}
          <div 
            className="w-full border border-[#3B3B3B00] flex items-center justify-between px-3 sm:px-4 md:px-6 transition-all duration-300"
            style={{ height: `${(headerHeight / baseHeight) * 100}%` }}
          >
            {isLoading ? (
              <div className="flex items-center justify-between w-full px-2">
                <Skeleton className="w-1/2 h-10" />
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>
            ) : (
              <>
                <h2 
                  className="text-white font-bold"
                  style={{ 
                    fontFamily: 'var(--font-hanalei-fill)', 
                    fontSize: 'calc((100vh * 0.95) * (36 / 874))',
                    lineHeight: '1'
                  }}
                >
                  {currentPlan.title}
                </h2>
                <img 
                  src={currentPlan.icon} 
                  alt={`${currentPlan.title} Icon`} 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                />
              </>
            )}
          </div>

          {/* Row 2: Table Section - 400 X 360 */}
          <div 
            className="w-full border border-[#3B3B3B00] transition-all duration-300"
            style={{ height: `${(tableHeight / baseHeight) * 100}%` }}
          >
            <PlanTable 
              data={currentPlan.tableData}
              columnWidths={currentPlan.columnWidths}
              isLoading={isLoading}
              onNext={handleNextTable}
              horizontalScroll={currentPlan.horizontalScroll}
            />
          </div>

          {/* Row 3: Empty Row - 400 X 100 */}
          <div 
            className="w-full border border-[#3B3B3B00]"
            style={{ height: `${(emptyRowHeight / baseHeight) * 100}%` }}
          />

          {/* Row 4: Prompt Section */}
          <div 
            className="w-full border border-[#3B3B3B00] flex flex-col items-center justify-center p-3 sm:p-4 pb-6 sm:pb-7 md:pb-8"
            style={{ height: `${((baseHeight - headerHeight - tableHeight - emptyRowHeight) / baseHeight) * 100}%` }}
          >
            {/* Prompt Box */}
            <div className="w-full flex items-center justify-center flex-1 overflow-hidden mb-2">
              <PromptBox
                value={promptText}
                onChange={setPromptText}
                isLoading={isLoading}
              />
            </div>
            {/* Buttons Row - 176 + 226 like planner */}
            <div 
              className="flex w-full"
              style={{ height: `${(52 / baseHeight) * 100}%` }}
            >
              {/* Back Button */}
              <div 
                className="h-full flex items-center justify-center px-2"
                style={{ width: `${(176 / 400) * 100}%` }}
              >
                {!isLoading && (
                  <span 
                    className="text-white font-bold"
                    style={{ 
                      fontFamily: 'var(--font-hanalei-fill)', 
                      fontSize: 'calc((100vh * 0.95) * (17.31 / 874))',
                      lineHeight: '1'
                    }}
                  >
                    BACK TO PLANBOOK
                  </span>
                )}
              </div>
              {/* GO Button */}
              <div 
                className="h-full flex items-center justify-center p-1 sm:p-2 relative"
                style={{ width: `${(226 / 400) * 100}%` }}
              >
                <CustomButton
                  text="GO"
                  isLoading={isLoading}
                  // mirror={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
