'use client';

function GradientOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)',
      }}
    />
  );
}

const SCREENSHOTS = [
  { src: '/screeenshots/workout-tracker-1.png', label: 'Workout Tracker' },
  { src: '/screeenshots/planner-page.jpg', label: 'Planner' },
  { src: '/screeenshots/ai-planner-generating.jpg', label: 'AI Plan Generation' },
  { src: '/screeenshots/sidebar-activeplans.jpg', label: 'Sidebar & Active Plans' },
  { src: '/screeenshots/water-tracker .jpg', label: 'Water Tracker' },
  { src: '/screeenshots/events.jpg', label: 'Events & Discovery' },
];

export default function ScreenshotCollage() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {SCREENSHOTS.map((shot, i) => (
        <div
          key={i}
          className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 transition-all hover:scale-[1.02] hover:border-[#FC4C02]/30 hover:shadow-lg hover:shadow-orange-500/5"
          style={{
            marginTop: i % 2 === 0 ? '1.5rem' : '0.75rem',
          }}
        >
          <img
            src={shot.src}
            alt={shot.label}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
          <GradientOverlay />
          <div className="absolute inset-x-0 bottom-0 z-20 p-2 pt-6">
            <span className="text-[10px] font-medium text-white/80">{shot.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
