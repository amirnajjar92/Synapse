'use client';

import React from 'react';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

// Interface for table row
interface TableRow {
  id: string | number;
  columns: string[];
}

// Interface for component props
interface PlanTableProps {
  data: TableRow[];
  columnWidths?: string[]; // Array of tailwind width classes or style values
  isLoading?: boolean;
  rowHeight?: string;
  onNext?: () => void;
  horizontalScroll?: boolean;
}

const PlanTable: React.FC<PlanTableProps> = ({ 
  data, 
  columnWidths, 
  isLoading,
  rowHeight = "h-16",
  onNext,
  horizontalScroll = false
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Table scroll container */}
      <div className={`flex-1 ${horizontalScroll ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto"}`}>
        {isLoading ? (
          <div className="w-full h-full flex flex-col gap-2 p-3">
            {Array.from({ length: data.length > 0 ? data.length : 6 }).map((_, index) => (
              <Skeleton key={index} className={`w-full ${rowHeight}`} />
            ))}
          </div>
        ) : (
          <div className={`flex flex-col text-gray-300 text-xs sm:text-sm md:text-base font-light ${horizontalScroll ? "min-w-max" : ""}`}>
            {data.map((row, rowIndex) => {
              const isLastRow = rowIndex === data.length - 1;
              return (
                <div 
                  key={row.id} 
                  className={`flex ${!isLastRow ? "border-b border-gray-600" : ""}`}
                >
                  {row.columns.map((cell, colIndex) => {
                    const isLastCol = colIndex === row.columns.length - 1;
                    const widthVal = columnWidths && columnWidths[colIndex];
                    const hasTailwindWidth = widthVal && (widthVal.startsWith("w-") || widthVal.includes("/"));
                    const isPixelWidth = widthVal && widthVal.endsWith("px");
                    
                    return (
                      <div
                        key={`${row.id}-${colIndex}`}
                        className={`p-2 sm:p-3 md:p-4 ${!isLastCol ? "border-r border-gray-600" : ""} ${hasTailwindWidth ? widthVal : ""} flex items-center`}
                        style={{
                          width: isPixelWidth ? widthVal : (!hasTailwindWidth && widthVal ? widthVal : undefined),
                          minWidth: isPixelWidth ? widthVal : (horizontalScroll ? "150px" : undefined),
                          flex: !hasTailwindWidth && !isPixelWidth ? 1 : undefined,
                        }}
                      >
                        {cell.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Next button (if provided) */}
      {onNext && (
        <div className="flex justify-end p-2">
          <button
            onClick={onNext}
            className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Next table"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanTable;
