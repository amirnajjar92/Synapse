interface BarChartProps {
  data: number[]; // Array of heights (0-100)
  color?: string;
  backgroundColor?: string;
  reversed?: boolean;
  showConnectingLine?: boolean;
  connectingLineColor?: string;
  connectingLineWidth?: number;
  connectingLineShadow?: string;
  activeBarCount?: number;
  inactiveColor?: string;
  showCurrentDayArrow?: boolean;
  currentDayArrowColor?: string;
}

export const BarChart = ({ 
  data, 
  color = '#fff', 
  backgroundColor = 'transparent', 
  reversed = false,
  showConnectingLine = false,
  connectingLineColor = '#fff',
  connectingLineWidth = 1,
  connectingLineShadow,
  activeBarCount,
  inactiveColor = '#888888',
  showCurrentDayArrow = false,
  currentDayArrowColor = '#ffffff'
}: BarChartProps) => {
  const getBarCenterX = (index: number) => ((index + 0.5) / data.length) * 100;

  // Calculate the SVG path for the connecting line - only up to active bars
  const calculatePath = () => {
    const activeCount = activeBarCount || data.length;
    if (activeCount < 2) return '';
    
    let path = `M ${getBarCenterX(0)} ${reversed ? data[0] : 100 - data[0]}`;
    
    for (let i = 1; i < activeCount; i++) {
      const x = getBarCenterX(i);
      const y = reversed ? data[i] : 100 - data[i];
      path += ` L ${x} ${y}`;
    }
    
    return path;
  };

  return (
    <div className="w-full h-full relative">
      <div className={`w-full h-full flex ${reversed ? 'items-start' : 'items-end'} relative overflow-hidden`}
      >
        {showConnectingLine && data.length >= 2 && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            style={{ zIndex: 1 }}
          >
            <defs>
              {connectingLineShadow && (
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="3"
                    stdDeviation="4"
                    floodColor={connectingLineShadow}
                    floodOpacity="0.49"
                  />
                </filter>
              )}
            </defs>
            <path
              d={calculatePath()}
              fill="none"
              stroke={connectingLineColor}
              strokeWidth={connectingLineWidth}
              vectorEffect="non-scaling-stroke"
              filter={connectingLineShadow ? 'url(#shadow)' : undefined}
            />
          </svg>
        )}
        {/* Current day arrow (HTML element for perfect circle) */}
        {showCurrentDayArrow && activeBarCount && activeBarCount > 0 && activeBarCount <= data.length && (
          <>
            {(() => {
              const currentDayIndex = activeBarCount - 1;
              const xPercent = getBarCenterX(currentDayIndex);
              const yPercent = reversed ? data[currentDayIndex] : 100 - data[currentDayIndex];
              return (
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: 'rgba(59, 99, 207, 0.15)',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <div
                    className="relative rounded-full bg-white"
                    style={{
                      width: '8px',
                      height: '8px',
                      border: `1.5px solid ${currentDayArrowColor}`,
                      boxShadow: '0 0 6px rgba(255, 255, 255, 0.35)',
                    }}
                  />
                </div>
              );
            })()}
          </>
        )}
        {data.map((height, index) => {
          const activeCount = activeBarCount || data.length;
          const isActive = index < activeCount;
          return (
            <div
              key={index}
              className={`flex-1 min-w-0 h-full flex ${reversed ? 'items-start' : 'items-end'} justify-center relative z-10`}
            >
              <div
                className="w-[1.2px] max-w-full"
                style={{
                  height: `${height}%`,
                  backgroundColor: isActive ? color : inactiveColor,
                  opacity: isActive ? 1 : 0.45,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
