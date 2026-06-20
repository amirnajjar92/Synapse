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
  showYAxis?: boolean;
  yAxisValues?: number[]; // Actual values for Y-axis (e.g., weight in kg)
  yAxisColor?: string;
  yAxisLabelCount?: number; // Number of labels to show on Y-axis
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
  currentDayArrowColor = '#ffffff',
  showYAxis = false,
  yAxisValues = [],
  yAxisColor = '#888',
  yAxisLabelCount = 5
}: BarChartProps) => {
  const getBarCenterX = (index: number) => ((index + 0.5) / data.length) * 100;
  
  // Calculate Y-axis labels from the actual weight values
  const getYAxisLabels = (): Array<{ value: number; position: number }> => {
    if (!showYAxis || yAxisValues.length === 0) return [];
    
    // Filter out zeros to get actual logged values
    const nonZeroValues = yAxisValues.filter(v => v > 0);
    if (nonZeroValues.length === 0) {
      // If no data, show a simple 0-15km scale for distance or 0-100 for weight
      const maxVal = Math.max(...yAxisValues, 15);
      const labels: Array<{ value: number; position: number }> = [];
      for (let i = 0; i < yAxisLabelCount; i++) {
        const value = maxVal - (i / (yAxisLabelCount - 1)) * maxVal;
        const position = (i / (yAxisLabelCount - 1)) * 100;
        labels.push({ value: Math.round(value * 10) / 10, position });
      }
      return labels;
    }
    
    const min = Math.min(...nonZeroValues);
    const max = Math.max(...nonZeroValues);
    const range = max - min;
    
    // For distance: use 0 as min and max as ceiling, for weight: use a centered range
    const useZeroBase = min < 50; // Heuristic: likely distance if values are small
    
    let lo, hi;
    if (useZeroBase) {
      lo = 0;
      hi = Math.ceil(max * 1.1); // Add 10% headroom
    } else {
      // Weight-like data: use centered range with at least 5 unit spread
      const displayRange = Math.max(range, 5);
      const mid = (min + max) / 2;
      lo = mid - displayRange / 2;
      hi = mid + displayRange / 2;
    }
    
    const labels: Array<{ value: number; position: number }> = [];
    for (let i = 0; i < yAxisLabelCount; i++) {
      const value = hi - (i / (yAxisLabelCount - 1)) * (hi - lo);
      const position = (i / (yAxisLabelCount - 1)) * 100;
      labels.push({ value: Math.round(value * 10) / 10, position });
    }
    
    return labels;
  };

  const yAxisLabels = getYAxisLabels();

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
        {/* Y-axis labels - positioned to align with chart */}
        {showYAxis && yAxisLabels.length > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-7 flex flex-col justify-between pointer-events-none pr-1" style={{ zIndex: 25 }}>
            {yAxisLabels.map((label, idx) => (
              <div
                key={idx}
                className="text-[7px] font-medium text-right leading-none"
                style={{ 
                  color: yAxisColor,
                  textShadow: '0 0 3px rgba(0,0,0,0.5)'
                }}
              >
                {label.value}
              </div>
            ))}
          </div>
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
          // For inactive bars, always use reduced opacity regardless of data presence
          const displayHeight = height > 0 ? height : (isActive ? 0 : 100);
          
          return (
            <div
              key={index}
              className={`flex-1 min-w-0 h-full flex ${reversed ? 'items-start' : 'items-end'} justify-center relative z-10`}
            >
              <div
                className="w-[1.2px] max-w-full"
                style={{
                  height: `${displayHeight}%`,
                  backgroundColor: isActive ? color : inactiveColor,
                  opacity: isActive ? 1 : 0.15,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
