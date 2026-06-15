interface ProgressComparisonChartProps {
  totalDays: number;
  currentDay: number;
  actualProgressData?: number[]; // Array of actual progress (0-100)
  predictedProgressData?: number[]; // Array of predicted progress (0-100)
}

export const ProgressComparisonChart = ({
  totalDays,
  currentDay,
  actualProgressData = [],
  predictedProgressData = []
}: ProgressComparisonChartProps) => {
  // Generate default predicted data if not provided (smooth curve)
  const defaultPredicted = Array.from({ length: totalDays }, (_, i) => {
    const progress = i / (totalDays - 1); // 0 to 1
    // Quadratic curve: starts slow, then speeds up
    return 20 + (progress * 70) + Math.sin(progress * Math.PI) * 10;
  });

  // Generate default actual data if not provided (random around predicted)
  const defaultActual = Array.from({ length: totalDays }, (_, i) => {
    const predicted = defaultPredicted[i];
    const variation = (Math.random() - 0.5) * 20;
    return Math.max(10, Math.min(100, predicted + variation));
  });

  const predicted = predictedProgressData.length > 0 ? predictedProgressData : defaultPredicted;
  const actual = actualProgressData.length > 0 ? actualProgressData : defaultActual;

  // Calculate paths for lines
  const calculatePath = (data: number[]) => {
    if (data.length < 2) return '';
    
    const widthStep = 100 / (data.length - 1);
    let path = `M 0 ${100 - data[0]}`;
    
    for (let i = 1; i < data.length; i++) {
      const x = i * widthStep;
      const y = 100 - data[i];
      path += ` L ${x} ${y}`;
    }
    
    return path;
  };

  return (
    <div className="bg-black rounded-2xl p-4 border border-[#3B3B3B00]">
      <h3 className="text-white font-bold text-sm mb-3">
        Progress Comparison
      </h3>
      
      <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-2">
        <span>Day 1</span>
        <span>Day {totalDays}</span>
      </div>

      <div className="relative w-full h-32">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Background grid line */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#3B3B3B" strokeWidth="1" strokeDasharray="5,5" />
          
          {/* Predicted progress curve (white) */}
          <path
            d={calculatePath(predicted)}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Actual progress bars (blue) */}
          {actual.map((height, index) => {
            const isActive = index < currentDay;
            const xPercent = totalDays > 1 ? (index / (totalDays - 1)) * 100 : 50;
            
            return (
              <rect
                key={index}
                x={xPercent - 0.3}
                y={100 - height}
                width="0.6"
                height={height}
                fill={isActive ? "#3B63CF" : "#666666"}
              />
            );
          })}
          
          {/* Current day marker */}
          {(() => {
            const progress = totalDays > 0 ? Math.min(currentDay / totalDays, 1) : 0;
            const x = totalDays > 1 ? (currentDay - 1) / (totalDays - 1) * 100 : 50;
            const actualHeight = actual[Math.min(currentDay - 1, actual.length - 1)] || 50;
            const y = 100 - actualHeight;
            
            return (
              <g>
                {/* Glow effect */}
                <circle cx={x} cy={y} r="4" fill="none" stroke="#3B63CF" strokeWidth="1" opacity="0.6" />
                {/* Main circle */}
                <circle cx={x} cy={y} r="3" fill="#3B63CF" stroke="white" strokeWidth="1" />
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-white rounded-full"></div>
          <span className="text-gray-400 text-xs">Predicted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[#3B63CF] rounded-sm"></div>
          <span className="text-gray-400 text-xs">Actual</span>
        </div>
      </div>
    </div>
  );
};