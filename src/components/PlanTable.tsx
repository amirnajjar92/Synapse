'use client';

import React, { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import Skeleton from '@/components/ui/Skeleton';

interface TableRow {
  id: string | number;
  columns: string[];
}

interface PlanTableProps {
  data: TableRow[];
  columnWidths?: string[];
  isLoading?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  horizontalScroll?: boolean;
  tableTitles?: string[];
  currentTableIndex?: number;
  onTabClick?: (index: number) => void;
  showTabs?: boolean;
}

const PlanTable: React.FC<PlanTableProps> = ({
  data,
  columnWidths,
  isLoading,
  onNext,
  onPrev,
  horizontalScroll = false,
  tableTitles,
  currentTableIndex,
  onTabClick,
  showTabs = true,
}) => {
  const hideScrollbarStyle = `
    .hide-scrollbar::-webkit-scrollbar { display: none; }
  `;

  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const activeTabRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentTableIndex]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarStyle }} />
      <div className="w-full h-full flex flex-col">
        {/* Table area */}
        <div className={`flex-1 min-h-0 ${horizontalScroll ? 'overflow-x-auto overflow-y-auto' : 'overflow-y-auto'}`}>
          {isLoading ? (
            <div className="p-3 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 flex-1 rounded" />
                  <Skeleton className="h-4 flex-1 rounded" />
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-xs">
              No data available
            </div>
          ) : (
            <Table className={`${horizontalScroll ? 'min-w-max' : 'w-full h-full'}`}>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-gray-600 hover:bg-gray-800/30 transition-colors"
                  >
                    {row.columns.map((cell, colIndex) => {
                      const widthVal = columnWidths?.[colIndex];
                      const hasTailwindWidth =
                        widthVal &&
                        (widthVal.startsWith('w-') || widthVal.includes('/'));
                      const isPixelWidth =
                        widthVal && widthVal.endsWith('px');
                      const isLastCol = colIndex === row.columns.length - 1;

                      return (
                        <TableCell
                          key={`${row.id}-${colIndex}`}
                          className={`
                            p-2 sm:p-3 md:p-4 align-middle
                            ${!isLastCol ? 'border-r border-gray-600' : ''}
                            ${hasTailwindWidth ? widthVal : ''}
                          `}
                          style={{
                            width: isPixelWidth
                              ? widthVal
                              : !hasTailwindWidth && widthVal
                                ? widthVal
                                : undefined,
                            minWidth: isPixelWidth
                              ? widthVal
                              : horizontalScroll
                                ? '150px'
                                : undefined,
                          }}
                        >
                          {cell.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Navigation tabs */}
        {showTabs && (onPrev || onNext || tableTitles) && (
          <div className="flex items-center justify-between p-1.5 gap-1 flex-shrink-0">
            {onPrev && (
              <button
                onClick={onPrev}
                className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Previous table"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            {tableTitles && tableTitles.length > 0 && (
              <div
                ref={tabsContainerRef}
                className="flex gap-1 flex-1 overflow-x-auto hide-scrollbar justify-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {tableTitles.map((title, index) => (
                  <button
                    key={index}
                    ref={index === currentTableIndex ? activeTabRef : null}
                    onClick={() => onTabClick?.(index)}
                    className={`px-2 py-1 rounded-full text-[10px] sm:text-xs transition-all whitespace-nowrap ${
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

            {onNext && (
              <button
                onClick={onNext}
                className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Next table"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
