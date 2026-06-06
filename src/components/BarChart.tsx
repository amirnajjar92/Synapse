interface BarChartProps {
  data: number[]; // Array of heights (0-100)
  color?: string;
  backgroundColor?: string;
}

export const BarChart = ({ data, color = '#fff', backgroundColor = 'transparent' }: BarChartProps) => {
  return (
    <div className="w-full h-full flex items-end gap-[3px]">
      {data.map((height, index) => (
        <div
          key={index}
          className="flex-1 h-full flex items-end justify-center"
        >
          <div
            className="w-[1.2px]"
            style={{
              height: `${height}%`,
              backgroundColor: color,
            }}
          />
        </div>
      ))}
    </div>
  );
};
