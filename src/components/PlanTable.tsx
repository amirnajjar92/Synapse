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
  onPrev?: () => void;
  horizontalScroll?: boolean;
  height?: string | number; // Height prop (can be CSS class like "h-full" or pixel value)
  tableTitles?: string[]; // All table titles for tabs
  currentTableIndex?: number; // Current active table index
  onTabClick?: (index: number) => void; // Handler for tab click
}

const PlanTable: React.FC<PlanTableProps> = ({ 
  data, 
  columnWidths, 
  isLoading,
  rowHeight = "h-16",
  onNext,
  onPrev,
  horizontalScroll = false,
  height,
  tableTitles,
  currentTableIndex,
  onTabClick
}) => {
  // Hide scrollbar styles
  const hideScrollbarStyle = `
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;
  // Determine the height style/class
  const isHeightClass = typeof height === "string" && (height.startsWith("h-"));
  const containerStyle = typeof height === "string" && !isHeightClass ? { height } : (typeof height === "number" ? { height: `${height}px` } : {});
  
  // Refs for scroll management
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const activeTabRef = React.useRef<HTMLButtonElement>(null);
  
  // Scroll active tab into view when currentTableIndex changes
  React.useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentTableIndex]);
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarStyle }} />
      <div className={`w-full flex flex-col ${isHeightClass ? height : "h-full"}`} style={containerStyle}>
      {/* Table scroll container */}
      <div className={`flex-1 min-h-0 overflow-hidden ${horizontalScroll ? "overflow-x-auto overflow-y-auto" : "overflow-y-auto"}`}>
        {/* No skeleton while generating, show the table directly */}
        <table className={`text-gray-300 text-xs sm:text-sm md:text-base font-light min-h-full ${horizontalScroll ? "min-w-max" : "w-full"} table-fixed`}>
          <tbody>
            {data.map((row, rowIndex) => {
              const isLastRow = rowIndex === data.length - 1;
              return (
                <tr 
                  key={row.id} 
                  className={`${!isLastRow ? "border-b border-gray-600" : ""}`}
                >
                  {row.columns.map((cell, colIndex) => {
                    const isLastCol = colIndex === row.columns.length - 1;
                    const widthVal = columnWidths && columnWidths[colIndex];
                    const hasTailwindWidth = widthVal && (widthVal.startsWith("w-") || widthVal.includes("/"));
                    const isPixelWidth = widthVal && widthVal.endsWith("px");
                    
                    return (
                      <td
                        key={`${row.id}-${colIndex}`}
                        className={`p-2 sm:p-3 md:p-4 ${!isLastCol ? "border-r border-gray-600" : ""} ${hasTailwindWidth ? widthVal : ""} align-middle`}
                        style={{
                          width: isPixelWidth ? widthVal : (!hasTailwindWidth && widthVal ? widthVal : undefined),
                          minWidth: isPixelWidth ? widthVal : (horizontalScroll ? "150px" : undefined),
                        }}
                      >
                        {cell.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Navigation area with prev/next and tabs */}
      {(onPrev || onNext || tableTitles) && (
        <div className="flex items-center justify-between p-2 gap-2 mt-4">
          {/* Previous button */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
              aria-label="Previous table"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          
          {/* Tabs (if available) */}
          {tableTitles && tableTitles.length > 0 && (
            <div 
              ref={tabsContainerRef}
              className="flex gap-1 flex-1 overflow-x-auto hide-scrollbar"
              style={{ 
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none' /* IE and Edge */
              }}
            >
              {tableTitles.map((title, index) => (
                <button
                  key={index}
                  ref={index === currentTableIndex ? activeTabRef : null}
                  onClick={() => onTabClick && onTabClick(index)}
                  className={`px-2 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
                    index === currentTableIndex
                      ? 'bg-white text-black font-semibold'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          )}
          
          {/* Next button */}
          {onNext && (
            <button
              onClick={onNext}
              className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
              aria-label="Next table"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default PlanTable;
