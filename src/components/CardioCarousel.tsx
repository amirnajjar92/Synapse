'use client';

import { useEffect, useState } from 'react';

const SIG = '#3B82F6';
const SIG_GLOW = 'rgba(59,130,246,0.07)';

const CDN = 'https://res.cloudinary.com/vj5y67l9/image/upload';

const CARDIO_IMAGES = [
  { src: `${CDN}/v1782909930/cardio-monitor-1_yvnbtd.png` },
  { src: `${CDN}/v1782909944/cardio-monitor-2_v7rjaj.jpg` },
  { src: `${CDN}/v1782909985/cardio-monitor-3_vdatjn.jpg` },
  { src: `${CDN}/v1782909986/cardio-monitor-4_lbtur9.jpg` },
  { src: `${CDN}/v1782910014/cardio-monitor-5_myyw3j.jpg` },
  { src: `${CDN}/v1782909957/cardio-monitor-6_qbw1hz.jpg` },
];

export default function CardioCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % CARDIO_IMAGES.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const shot = CARDIO_IMAGES[current];

  return (
    <div style={{ width:'min(42vw, 220px)', aspectRatio:'402/874', borderRadius:'9%',
      background:'#0a0a0a', border:'1.5px solid rgba(255,255,255,0.1)', overflow:'hidden',
      position:'relative', flexShrink:0,
      boxShadow:`0 0 0 1px rgba(255,255,255,0.04), 0 28px 80px rgba(0,0,0,0.8), 0 0 64px ${SIG_GLOW}`,
    }}>
      <img
        src={shot.src}
        alt={`Cardio Monitor ${current + 1}`}
        style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}
      />
      {/* Gradient overlay */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.5) 100%)' }}
      />
      {/* Page indicators */}
      <div style={{ position:'absolute', bottom:'6%', left:0, right:0, display:'flex', justifyContent:'center', gap:5 }}>
        {CARDIO_IMAGES.map((_, i) => (
          <div key={i} style={{
            width: i === current ? 18 : 6, height: 5, borderRadius: 999,
            background: i === current ? SIG : 'rgba(255,255,255,0.25)',
            transition: 'all .3s ease',
          }}/>
        ))}
      </div>
      {/* home bar */}
      <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
        width:'28%', height:4, borderRadius:999, background:'rgba(255,255,255,0.22)' }}/>
    </div>
  );
}
