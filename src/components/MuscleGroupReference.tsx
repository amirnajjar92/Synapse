"use client";

interface MuscleGroupReferenceProps {
  className?: string;
}

export default function MuscleGroupReference({ className = '' }: MuscleGroupReferenceProps) {
  const frontMuscles = [
    { name: 'chest', label: 'Chest', color: 'bg-red-500' },
    { name: 'front-delts', label: 'Front Deltoids', color: 'bg-orange-500' },
    { name: 'shoulders', label: 'Shoulders', color: 'bg-yellow-500' },
    { name: 'biceps', label: 'Biceps', color: 'bg-green-500' },
    { name: 'forearms', label: 'Forearms', color: 'bg-teal-500' },
    { name: 'abs', label: 'Abdominals', color: 'bg-blue-500' },
    { name: 'obliques', label: 'Obliques', color: 'bg-indigo-500' },
    { name: 'quads', label: 'Quadriceps', color: 'bg-purple-500' },
    { name: 'shins', label: 'Shins', color: 'bg-pink-500' },
    { name: 'neck', label: 'Neck', color: 'bg-rose-500' },
    { name: 'adductors', label: 'Adductors', color: 'bg-cyan-500' }
  ];

  const backMuscles = [
    { name: 'traps', label: 'Trapezius', color: 'bg-red-500' },
    { name: 'rear-delts', label: 'Rear Deltoids', color: 'bg-orange-500' },
    { name: 'lats', label: 'Latissimus Dorsi', color: 'bg-yellow-500' },
    { name: 'upper-back', label: 'Upper Back', color: 'bg-green-500' },
    { name: 'lower-back', label: 'Lower Back', color: 'bg-teal-500' },
    { name: 'triceps', label: 'Triceps', color: 'bg-blue-500' },
    { name: 'glutes', label: 'Glutes', color: 'bg-indigo-500' },
    { name: 'hamstrings', label: 'Hamstrings', color: 'bg-purple-500' },
    { name: 'calves', label: 'Calves', color: 'bg-pink-500' },
    { name: 'neck', label: 'Neck', color: 'bg-rose-500' },
    { name: 'adductors', label: 'Adductors', color: 'bg-cyan-500' }
  ];

  return (
    <div className={`bg-zinc-950 rounded-2xl p-6 border border-zinc-800 shadow-xl ${className}`}>
      <h3 className="text-white text-xl font-bold mb-6 text-center">Muscle Group Reference</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Front Muscles */}
        <div>
          <h4 className="text-cyan-400 font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-cyan-400 rounded-full"></span>
            Front View
          </h4>
          <div className="space-y-2">
            {frontMuscles.map(muscle => (
              <div 
                key={muscle.name}
                className="flex items-center gap-3 p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div className={`w-4 h-4 ${muscle.color} rounded-sm`}></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{muscle.label}</p>
                  <p className="text-zinc-500 text-xs font-mono">{muscle.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Muscles */}
        <div>
          <h4 className="text-purple-400 font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
            Back View
          </h4>
          <div className="space-y-2">
            {backMuscles.map(muscle => (
              <div 
                key={muscle.name}
                className="flex items-center gap-3 p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div className={`w-4 h-4 ${muscle.color} rounded-sm`}></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{muscle.label}</p>
                  <p className="text-zinc-500 text-xs font-mono">{muscle.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Note */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-zinc-400 text-sm text-center">
          Use these muscle names in the <code className="text-cyan-400 bg-zinc-900 px-2 py-0.5 rounded">muscles</code> array 
          to highlight specific muscle groups
        </p>
      </div>
    </div>
  );
}
