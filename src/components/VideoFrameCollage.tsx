'use client';

import { useRef, useEffect, useState } from 'react';

const TIMESTAMPS = [0, 5, 10, 15, 20];

interface FrameData {
  src: string;
  time: string;
}

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

export default function VideoFrameCollage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    video.addEventListener('loadedmetadata', () => {
      const dur = video.duration;
      const times = TIMESTAMPS.filter(t => t < dur);
      if (times.length === 0) {
        const step = dur / 5;
        for (let i = 0; i < 5; i++) times.push(i * step);
      }
      captureFrames(times);
    });
  }, []);

  const captureFrames = async (times: number[]) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 180;
    canvas.height = 320;

    const results: FrameData[] = [];

    for (const time of times) {
      video.currentTime = time;
      await new Promise<void>((resolve) => {
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, 180, 320);
          results.push({
            src: canvas.toDataURL('image/jpeg', 0.8),
            time: formatTime(time),
          });
          resolve();
        };
      });
    }

    setFrames(results);
    setLoading(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        src="/videos/compressed-Sequence%2002%20(1).mp4"
        preload="auto"
        className="hidden"
        crossOrigin="anonymous"
      />

      <canvas ref={canvasRef} className="hidden" />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 rounded-full border border-white/20 animate-spin" style={{ borderTopColor: 'white', borderWidth: '2px' }} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          {frames.map((frame, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0"
              style={{ width: 140, aspectRatio: '9/16' }}
            >
              <img
                src={frame.src}
                alt={`Video frame at ${frame.time}`}
                className="w-full h-full object-cover"
              />
              <GradientOverlay />
              <div className="absolute bottom-0 inset-x-0 z-20 p-1.5 text-center">
                <span className="text-[9px] text-white/60 font-mono">{frame.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
