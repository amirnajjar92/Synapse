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
  // Calculate the SVG path for the connecting line - only up to active bars
  const calculatePath = () => {
    const activeCount = activeBarCount || data.length;
    if (activeCount < 2) return '';
    
    const widthStep = 100 / (data.length - 1);
    let path = `M 0 ${reversed ? data[0] : 100 - data[0]}`;
    
    for (let i = 1; i < activeCount; i++) {
      const x = i * widthStep;
      const y = reversed ? data[i] : 100 - data[i];
      path += ` L ${x} ${y}`;
    }
    
    return path;
  };

  return (
    <div className={`w-full h-full flex ${reversed ? 'items-start' : 'items-end'} gap-[3px] relative`}>
      {showConnectingLine && data.length >= 2 && (
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          style={{ zIndex: 1, pointerEvents: 'none' }}
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
            const xPercent = data.length > 1 ? (currentDayIndex / (data.length - 1)) * 100 : 50;
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
                {/* Glow effect */}
                <div
                  className="absolute"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `1px solid ${currentDayArrowColor}`,
                    opacity: '0.6',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 10px ${currentDayArrowColor}`,
                  }}
                />
                {/* Main circle with arrow */}
                <div
                  className="relative"
                  style={{
                    animation: 'blink 1.5s ease-in-out infinite',
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: `1.5px solid ${currentDayArrowColor}`,
                    }}
                  >
                    {/* Arrow icon */}
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="none"
                      style={{ transform: 'translateX(0.5px)' }}
                    >
                      <path
                        d="M2 4 H6 M4 2 L6 4 L4 6"
                        stroke={currentDayArrowColor}
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                {/* Blinking animation style */}
                <style>{`
                  @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                  }
                `}</style>
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
            className={`flex-1 h-full flex ${reversed ? 'items-start' : 'items-end'} justify-center relative z-10`}
          >
            <div
              className="w-[1.2px]"
              style={{
                height: `${height}%`,
                backgroundColor: isActive ? color : inactiveColor,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
