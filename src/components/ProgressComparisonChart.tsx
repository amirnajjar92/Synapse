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
  const safeTotalDays = Math.max(totalDays, 1);

  // Generate default predicted data if not provided (smooth curve)
  const defaultPredicted = Array.from({ length: safeTotalDays }, (_, i) => {
    const progress = safeTotalDays > 1 ? i / (safeTotalDays - 1) : 0;
    return 20 + progress * 70 + Math.sin(progress * Math.PI) * 10;
  });

  // Deterministic actual data around predicted curve
  const defaultActual = Array.from({ length: safeTotalDays }, (_, i) => {
    const predicted = defaultPredicted[i];
    const variation = Math.sin(i * 1.3) * 8;
    return Math.max(10, Math.min(100, predicted + variation));
  });

  const predicted = predictedProgressData.length > 0 ? predictedProgressData : defaultPredicted;
  const actual = actualProgressData.length > 0 ? actualProgressData : defaultActual;

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

  const markerIndex = Math.min(Math.max(currentDay - 1, 0), actual.length - 1);
  const markerX = safeTotalDays > 1 ? (markerIndex / (safeTotalDays - 1)) * 100 : 50;
  const markerY = 100 - (actual[markerIndex] ?? 50);

  return (
    <div className="bg-black rounded-2xl p-4 border border-[#3B3B3B00]">
      <h3 className="text-white font-bold text-sm mb-3">
        Progress Comparison
      </h3>

      <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-2">
        <span>Day 1</span>
        <span>Day {safeTotalDays}</span>
      </div>

      <div className="relative w-full h-32">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="50" x2="100" y2="50" stroke="#3B3B3B" strokeWidth="1" strokeDasharray="5,5" />

          <path
            d={calculatePath(predicted)}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {actual.map((height, index) => {
            const isActive = index < currentDay;
            const xPercent = safeTotalDays > 1 ? (index / (safeTotalDays - 1)) * 100 : 50;

            return (
              <rect
                key={index}
                x={xPercent - 0.3}
                y={100 - height}
                width="0.6"
                height={height}
                fill={isActive ? '#3B63CF' : '#666666'}
                opacity={isActive ? 1 : 0.45}
              />
            );
          })}

          {currentDay > 0 && (
            <g>
              <line
                x1={markerX}
                y1="0"
                x2={markerX}
                y2="100"
                stroke="white"
                strokeWidth="0.35"
                strokeDasharray="1.5,2.5"
                opacity="0.3"
              />
              <circle cx={markerX} cy={markerY} r="5" fill="#3B63CF" opacity="0.12" />
              <circle cx={markerX} cy={markerY} r="2.4" fill="white" stroke="#3B63CF" strokeWidth="1.1" />
            </g>
          )}
        </svg>

        {currentDay > 0 && (
          <div
            className="absolute pointer-events-none -translate-x-1/2"
            style={{ left: `${markerX}%`, top: `${markerY}%`, transform: 'translate(-50%, calc(-100% - 8px))' }}
          >
            <span className="px-1.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[9px] text-white/80 backdrop-blur-sm">
              Day {currentDay}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-3 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-white rounded-full" />
          <span className="text-gray-400 text-xs">Predicted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[#3B63CF] rounded-sm" />
          <span className="text-gray-400 text-xs">Actual</span>
        </div>
      </div>
    </div>
  );
};
