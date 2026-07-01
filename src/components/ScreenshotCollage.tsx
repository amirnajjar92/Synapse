'use client';

import Image from 'next/image';

function GradientOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)',
        zIndex: 1,
      }}
    />
  );
}

const CDN = 'https://res.cloudinary.com/vj5y67l9/image/upload';

const SCREENSHOTS = [
  { src: `${CDN}/v1782909972/workout-tracker-1_pqlbtp.png`, label: 'Workout Tracker', width: 402, height: 874 },
  { src: `${CDN}/v1782909959/planner-page_o8qws3.jpg`, label: 'Planner', width: 402, height: 874 },
  { src: `${CDN}/v1782909941/ai-planner-generating_rj2naj.jpg`, label: 'AI Plan Generation', width: 402, height: 874 },
  { src: `${CDN}/v1782909997/sidebar-activeplans_mdzu8i.jpg`, label: 'Sidebar & Active Plans', width: 402, height: 874 },
  { src: `${CDN}/v1782909961/water-tracker_fqqw12.jpg`, label: 'Water Tracker', width: 402, height: 874 },
  { src: `${CDN}/v1782910005/events_yqad2i.jpg`, label: 'Events & Discovery', width: 402, height: 874 },
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
          <Image
            src={shot.src}
            alt={shot.label}
            width={shot.width}
            height={shot.height}
            className="w-full h-auto object-cover"
            loading="lazy"
            quality={75}
            sizes="(max-width: 640px) 50vw, 33vw"
          />
          <GradientOverlay />
          <div className="absolute inset-x-0 bottom-0 p-2 pt-6" style={{ zIndex: 2 }}>
            <span className="text-[10px] font-medium text-white/80">{shot.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
