'use client';

import { useState } from 'react';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] ${className}`} />
);

export default function MonitorPage() {
  const [activeSection, setActiveSection] = useState<string>('');

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center ">
      {/* iPhone 17 Frame - 402x874 */}
      <div className="w-[402px] h-[874px] bg-black rounded-[40px] overflow-hidden shadow-2xl relative">
        {/* Main Container */}
        <div className="w-full h-full bg-gray-950 flex flex-col">
          
          {/* Row 1: 1 column - 400x153 */}
          <div 
            className="w-[400px] h-[153px]  cursor-pointer border border-white"
            onClick={() => setActiveSection('row1')}
          >
            <Skeleton className="w-full h-full " />
          </div>

          {/* Row 2: 2 columns - 200x84 each */}
          <div className="flex">
            <div 
              className="w-[200px] h-[84px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row2-col1')}
            >
              <Skeleton className="w-full h-full " />
            </div>
            <div 
              className="w-[200px] h-[84px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row2-col2')}
            >
              <Skeleton className="w-full h-full " />
            </div>
          </div>

          {/* Row 3: 2 columns - 200x50 each */}
          <div className="flex">
            <div 
              className="w-[200px] h-[50px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row3-col1')}
            >
              <Skeleton className="w-full h-full " />
            </div>
            <div 
              className="w-[200px] h-[50px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row3-col2')}
            >
              <Skeleton className="w-full h-full " />
            </div>
          </div>

          {/* Row 4: 2 columns - 200x50 each */}
          <div className="flex">
            <div 
              className="w-[200px] h-[50px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row4-col1')}
            >
              <Skeleton className="w-full h-full " />
            </div>
            <div 
              className="w-[200px] h-[50px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row4-col2')}
            >
              <Skeleton className="w-full h-full " />
            </div>
          </div>

          {/* Row 5: 2 columns - 200x50 each */}
          <div className="flex">
            <div 
              className="w-[200px] h-[50px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row5-col1')}
            >
              <Skeleton className="w-full h-full " />
            </div>
            <div 
              className="w-[200px] h-[50px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row5-col2')}
            >
              <Skeleton className="w-full h-full " />
            </div>
          </div>

          {/* Row 6: 2 columns - 200x113 each */}
          <div className="flex">
            <div 
              className="w-[200px] h-[113px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row6-col1')}
            >
              <Skeleton className="w-full h-full " />
            </div>
            <div 
              className="w-[200px] h-[113px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row6-col2')}
            >
              <Skeleton className="w-full h-full " />
            </div>
          </div>

          {/* Row 7: 2 columns - 114x156 and 288x156 */}
          <div className="flex">
            <div 
              className="w-[114px] h-[156px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row7-col1')}
            >
              <Skeleton className="w-full h-full " />
            </div>
            <div 
              className="w-[288px] h-[156px]  cursor-pointer border border-white"
              onClick={() => setActiveSection('row7-col2')}
            >
              <Skeleton className="w-full h-full " />
            </div>
          </div>

          {/* Row 8: 1 column - 400x46 */}
          <div 
            className="w-[400px] h-[46px]  cursor-pointer border border-white"
            onClick={() => setActiveSection('row8')}
          >
            <Skeleton className="w-full h-full " />
          </div>

          {/* Row 9: 1 column - 400x176 */}
          <div 
            className="w-[400px] h-[176px]  cursor-pointer border border-white"
            onClick={() => setActiveSection('row9')}
          >
            <Skeleton className="w-full h-full " />
          </div>
        </div>

        {/* Active Section Indicator */}
        {activeSection && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            Active: {activeSection}
          </div>
        )}
      </div>
    </div>
  );
}
