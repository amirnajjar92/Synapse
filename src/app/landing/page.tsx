'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';
import MenAnatomy from '@/components/MenAnatomy';
import WomenAnatomy from '@/components/WomenAnatomy';

// Lazy load heavy components with optimized settings
const ScreenshotCollage = dynamic(() => import('@/components/ScreenshotCollage'), {
  loading: () => (
    <div style={{ 
      height: '600px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '24px',
    }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        border: '3px solid rgba(59,130,246,0.2)',
        borderTopColor: '#3B82F6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  ),
  ssr: false, // Don't render on server for better performance
});

/* ─────────────────────────────────────────────────────
   SYNAPSE LANDING — Premium Ultra Edition
   Polished UX, High-Conversion Copywriting, Clean Architecture
───────────────────────────────────────────────────── */

const SIG       = '#3B82F6';
const SIG_DIM   = 'rgba(59,130,246,0.13)';
const SIG_GLOW  = 'rgba(59,130,246,0.07)';

// Add global styles for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  if (!document.querySelector('style[data-landing-animations]')) {
    style.setAttribute('data-landing-animations', 'true');
    document.head.appendChild(style);
  }
}

const LINE_PATH = 'M79.1641 129.338C118.023 132.495 183.508 129.72 251.087 110.632M425.483 6.53156L444.036 -9.14585M425.483 6.53156L430.43 -18.291M425.483 6.53156C378.731 60.9529 314.001 92.8613 251.087 110.632M210.27 344.903C210.27 245.612 231.297 123.886 251.087 110.632';
const HORN_PATH = 'M0 284.8C48.6496 288.719 148.422 294.729 158.317 287.412C170.686 278.267 171.923 250.832 176.87 258.67C181.817 266.509 179.344 322.689 176.87 321.382C174.396 320.076 165.738 296.56 154.607 295.253C145.701 294.208 49.0618 288.72 0 284.8Z';

/* ── Logo ── */
function Logo({ size = 48 }: { size?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 80); return () => clearTimeout(t); }, []);
  return (
    <div style={{ width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      <svg width="100%" height="100%" viewBox="0 0 450 405" className="text-white overflow-visible" fill="none">
        <defs>
          <filter id="logo-g"><feGaussianBlur stdDeviation="5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
        </defs>
        <g style={{ opacity: on ? 1 : 0, transition: 'opacity 1s ease-out .2s' }}>
          <path d="M79 129L158 287 M251 110L176 258" stroke={SIG} strokeWidth="1" strokeOpacity=".1" strokeDasharray="3 3"/>
          <path d="M0 284L210 344L251 110" stroke={SIG} strokeWidth="1.2" strokeOpacity=".15"/>
          <circle cx="251" cy="110" r="4.5" fill={SIG} filter="url(#logo-g)"/>
          <circle cx="79" cy="129" r="3.5" fill={SIG}/>
        </g>
        <path d={LINE_PATH} stroke="currentColor" strokeOpacity=".18" strokeWidth="11" fill="none"
          style={{ strokeDasharray:'1000', strokeDashoffset: on ? 0 : 1000, transition:'stroke-dashoffset .95s cubic-bezier(.65,0,.35,1)' }}/>
        <path d={LINE_PATH} stroke="currentColor" strokeWidth="7.84" fill="none"
          style={{ strokeDasharray:'1000', strokeDashoffset: on ? 0 : 1000, transition:'stroke-dashoffset .95s cubic-bezier(.65,0,.35,1)' }}/>
        <path d={HORN_PATH} stroke="currentColor" strokeWidth="10.45" fill="none"
          style={{ strokeDasharray:'1000', strokeDashoffset: on ? 0 : 1000, transition:'stroke-dashoffset .85s cubic-bezier(.65,0,.35,1) .25s' }}/>
        <g style={{ opacity: on ? 1 : 0, transform: on ? 'translateY(0)' : 'translateY(10px)', transition:'all .7s cubic-bezier(.22,1,.36,1) .4s' }}>
          <text x="202.5" y="225" fill="currentColor" fontSize="92" fontWeight="400" letterSpacing="3"
            fontFamily="var(--font-hanalei-fill),system-ui,sans-serif" textAnchor="middle">Synapse</text>
          <text x="385" y="255" fill={SIG} fontSize="36" fontWeight="800" letterSpacing="12"
            fontFamily="system-ui,sans-serif" textAnchor="end">FIT</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Synapse field ── */
function SynapseField() {
  const nodes = [
    {x:8,y:6},{x:22,y:18},{x:4,y:34},{x:35,y:9},{x:18,y:48},{x:48,y:28},
    {x:62,y:12},{x:78,y:22},{x:92,y:8},{x:70,y:40},{x:88,y:46},{x:12,y:62},
    {x:30,y:72},{x:55,y:60},{x:75,y:68},{x:95,y:60},{x:6,y:88},{x:25,y:94},
    {x:45,y:86},{x:65,y:92},{x:85,y:88},{x:98,y:78},
  ];
  const links: [number,number][] = [
    [0,1],[1,3],[2,4],[3,6],[5,6],[6,7],[7,8],[5,9],[9,10],[4,11],
    [11,12],[12,13],[13,14],[14,15],[10,15],[11,16],[16,17],[17,18],[18,19],[19,20],[20,21],[15,21],
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <defs>
        <filter id="nf"><feGaussianBlur stdDeviation=".7"/></filter>
      </defs>
      {links.map(([a,b],i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={SIG} strokeOpacity=".05" strokeWidth=".07"/>
      ))}
      {nodes.map((n,i) => (
        <circle key={i} cx={n.x} cy={n.y}
          r={i%5===0 ? .45 : .2}
          fill={i%5===0 ? SIG : '#fff'}
          opacity={i%5===0 ? .4 : .13}
          filter={i%5===0 ? 'url(#nf)' : undefined}
          className={i%5===0 ? 'snp' : ''}
          style={i%5===0 ? {animationDelay:`${(i*.4)%3}s`} : undefined}
        />
      ))}
    </svg>
  );
}

/* ── Scroll-reveal wrapper with directional animations ── */
function Reveal({
  children, delay = 0, className = '', style: extraStyle = {}, direction = 'up'
}: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties; direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}) {
  const ref  = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.05, rootMargin: '50px 0px 50px 0px' }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const getTransform = () => {
    if (vis) return 'translate(0, 0) scale(1)';
    switch(direction) {
      case 'up': return 'translate(0, 40px) scale(0.97)';
      case 'down': return 'translate(0, -40px) scale(0.97)';
      case 'left': return 'translate(60px, 0) scale(0.95)';
      case 'right': return 'translate(-60px, 0) scale(0.95)';
      case 'fade': return 'translate(0, 0) scale(0.96)';
      default: return 'translate(0, 40px) scale(0.97)';
    }
  };
  
  return (
    <div ref={ref} className={className} style={{
      ...extraStyle,
      opacity: vis ? 1 : 0,
      transform: getTransform(),
      filter: vis ? 'blur(0px)' : 'blur(3px)',
      transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}s,
                   transform .8s cubic-bezier(.16,1,.3,1) ${delay}s,
                   filter .5s ease ${delay}s`,
      willChange: 'opacity, transform',
    }}>
      {children}
    </div>
  );
}

/* ── Loading Spinner Component ── */
function LoadingSpinner({ size = 48 }: { size?: number }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      minHeight: '400px',
    }}>
      <div style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        border: `3px solid rgba(59,130,246,0.15)`,
        borderTopColor: '#3B82F6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  );
}

/* ── Iframe with Loading State ── */
function IframeWithLoader({ src, title, aspectRatio = '402/874' }: { src: string; title: string; aspectRatio?: string }) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div style={{ 
      width:'100%', 
      aspectRatio,
      borderRadius:'40px', 
      background:'#0c0c0c',
      border:'1px solid rgba(255,255,255,0.12)', 
      overflow:'hidden',
      boxShadow:`0 32px 96px rgba(0,0,0,0.85), 0 0 64px ${SIG_GLOW}`,
      position:'relative',
    }}>
      {!loaded && <LoadingSpinner />}
      <iframe 
        src={src} 
        title={title} 
        style={{ 
          width:'100%', 
          height:'100%', 
          border:'none',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
      <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
        width:'28%', height:4, borderRadius:999, background:'rgba(255,255,255,0.25)', pointerEvents:'none', zIndex:10 }}/>
    </div>
  );
}

/* ── Anatomy Background with Scroll Effect ── */
function AnatomyBackground() {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = scrolled / maxScroll;
          
          // Fade out from 1 to 0.1 as we scroll down, fade back in when scrolling up
          const newOpacity = Math.max(0.1, 1 - (scrollPercent * 0.9));
          setScrollOpacity(newOpacity);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Men Front - Left Side */}
      <div style={{
        position: 'fixed',
        left: '-5%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '25vw',
        maxWidth: '300px',
        height: 'auto',
        opacity: scrollOpacity * 0.15,
        transition: 'opacity 0.2s ease-out',
        pointerEvents: 'none',
        zIndex: 1,
        willChange: 'opacity',
      }}>
        <MenAnatomy
          view="front"
          highlights={{
            muscles: ['chest', 'abs', 'shoulders', 'biceps', 'quads'],
            fillColor: '#3B82F6',
            fillOpacity: 0.4,
            strokeColor: '#3B82F6',
            strokeWidth: 1,
            blurInactive: 0,
          }}
          defaultStrokeColor="#ffffff"
          defaultStrokeWidth={0.3}
          inactiveFillColor="transparent"
        />
      </div>

      {/* Women Back - Right Side */}
      <div style={{
        position: 'fixed',
        right: '-5%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '25vw',
        maxWidth: '300px',
        height: 'auto',
        opacity: scrollOpacity * 0.15,
        transition: 'opacity 0.2s ease-out',
        pointerEvents: 'none',
        zIndex: 1,
        willChange: 'opacity',
      }}>
        <WomenAnatomy
          view="back"
          highlights={{
            muscles: ['lats', 'upper-back', 'lower-back', 'glutes', 'hamstrings'],
            fillColor: '#3B82F6',
            fillOpacity: 0.4,
            strokeColor: '#3B82F6',
            strokeWidth: 1,
            blurInactive: 0,
          }}
          defaultStrokeColor="#ffffff"
          defaultStrokeWidth={0.3}
          inactiveFillColor="transparent"
        />
      </div>
    </>
  );
}

/* ── Cloudinary CDN Base ── */
const CDN = 'https://res.cloudinary.com/vj5y67l9/image/upload';

// Cloudinary optimization helper
const optimizeImage = (url: string, width?: number) => {
  const opts = ['f_auto', 'q_auto'];
  if (width) opts.push(`w_${width}`);
  return url.replace('/upload/', `/upload/${opts.join(',')}/`);
};

/* ── Features Data with High-Impact Copywriting ── */
const FEATURES = [
  { 
    eyebrow: 'Hyper-Personalization', 
    title: 'An adaptive engine\nbuilt around your biomechanics.', 
    body: 'Tell Synapse your targets. It constructs a highly precise, week-by-week protocol optimized for your available equipment, recovery rate, and performance data. Then, it dynamically evolves as you unlock raw strength.', 
    demo: '/demo/planner'
  },
  { 
    eyebrow: 'Precision Tracking', 
    title: 'Zero friction.\nMaximum data velocity.', 
    body: 'Engage with real-time muscle workload visualization, instant HD form references, and contextual coaching notes precisely when you unrack. The gym floor, fully digitized.', 
    demo: '/demo/workout-tracker'
  },
  { 
    eyebrow: 'Predictive Analytics', 
    title: 'Isolate what delivers results.\nEliminate guessing.', 
    body: 'Bridge the gap between target metrics and actual execution. Discover training biases, capture volume imbalances, and contextualize your systemic data loops—hydration, mass, and cardio trends—in a unified pane of glass.', 
    demo: '/demo/monitor'
  },
  { 
    eyebrow: 'Human Co-Pilot', 
    title: 'Your elite human coach,\nembedded natively.', 
    body: 'Empower your coach to modify parameters mid-session, push real-time programmatic revisions, and audit telemetry as you perform reps. High-touch elite coaching meets high-scale intelligence.', 
    demo: '/demo/training-studio'
  },
];

const MQ = [
  optimizeImage(`${CDN}/v1782909972/workout-tracker-1_pqlbtp.png`, 400),
  optimizeImage(`${CDN}/v1782909959/planner-page_o8qws3.jpg`, 400),
  optimizeImage(`${CDN}/v1782909941/ai-planner-generating_rj2naj.jpg`, 400),
  optimizeImage(`${CDN}/v1782909997/sidebar-activeplans_mdzu8i.jpg`, 400),
  optimizeImage(`${CDN}/v1782909961/water-tracker_fqqw12.jpg`, 400),
  `${CDN}/v1782910005/events_yqad2i.jpg`,
];

/* ── Training Studio Demo ── */
function TrainingStudioDemo() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (isMobile) {
    return (
      <Reveal direction="up" delay={0.1}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:32, marginTop:64, padding:'0 12px' }}>
          {/* Coach */}
          <Reveal direction="fade" delay={0.15}>
            <div style={{ width:'100%', maxWidth:320 }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
                <p style={{ fontFamily:'var(--font-hanalei-fill)', fontSize:28, color:SIG, margin:0,
                  textShadow:`0 0 20px ${SIG_GLOW}` }}>
                  Coach
                </p>
              </div>
              <div style={{ position:'relative', width:'100%', paddingTop:28 }}>
                <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', zIndex:20,
                  background:SIG, padding:'4px 16px', borderRadius:'10px 10px 0 0', boxShadow:`0 0 20px ${SIG_GLOW}` }}>
                  <p style={{ fontSize:9, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#000' }}>
                    Training Studio
                  </p>
                </div>
                <IframeWithLoader src="/demo/training-studio" title="Training Studio Demo" />
              </div>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textAlign:'center', marginTop:8 }}>
                Build plans, manage clients, track progress
              </p>
            </div>
          </Reveal>

          {/* Arrow */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={SIG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
              <line x1="8" y1="0" x2="8" y2="18" stroke={SIG} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"/>
              <polygon points="8,24 4,18 12,18" fill={SIG} opacity="0.8"/>
            </svg>
            <p style={{ fontSize:9, fontWeight:700, color:SIG, letterSpacing:'.15em', margin:0 }}>SHARE PLAN</p>
            <p style={{ fontSize:9, color:'rgba(255,255,255,0.3)', textAlign:'center', margin:0 }}>
              Coach creates plan → Shares with client
            </p>
          </div>

          {/* Client */}
          <Reveal direction="fade" delay={0.25}>
            <div style={{ width:'100%', maxWidth:320 }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
                <p style={{ fontFamily:'var(--font-hanalei-fill)', fontSize:28, color:SIG, margin:0,
                  textShadow:`0 0 20px ${SIG_GLOW}` }}>
                  Clients
                </p>
              </div>
              <div style={{ position:'relative', width:'100%', paddingTop:28 }}>
                <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', zIndex:20,
                  background:SIG, padding:'4px 16px', borderRadius:'10px 10px 0 0', boxShadow:`0 0 20px ${SIG_GLOW}` }}>
                  <p style={{ fontSize:9, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#000' }}>
                    Workout Tracker
                  </p>
                </div>
                <IframeWithLoader src="/demo/workout-tracker" title="Workout Tracker Demo" />
              </div>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textAlign:'center', marginTop:8 }}>
                Follow workouts, chat with coach, log results
              </p>
            </div>
          </Reveal>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal direction="up" delay={0.1}>
      <div style={{ display:'flex', justifyContent:'center', marginTop:64 }}>
        <div style={{ position:'relative', width:'100%', maxWidth:1100,
          display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:0, alignItems:'center', padding:'0 20px' }}>
          <Reveal direction="left" delay={0.2}>
            <div style={{ position:'relative', width:'100%', maxWidth:360, paddingTop:32, justifySelf:'end' }}>
              <div style={{ position:'absolute', top:'50%', right:'calc(100% + 20px)', transform:'translateY(-50%)',
                zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <p style={{ fontFamily:'var(--font-hanalei-fill)', fontSize:'clamp(32px, 4vw, 48px)', color:SIG,
                  lineHeight:1, textShadow:`0 0 20px ${SIG_GLOW}, 0 8px 32px rgba(255,255,255,0.4), 0 12px 48px rgba(255,255,255,0.2)`,
                  margin:0 }}>Coach</p>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.45)', lineHeight:1.5, maxWidth:120, textAlign:'center', margin:0 }}>
                  Build plans, manage clients, track progress</p>
              </div>
              <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', zIndex:20,
                background:SIG, padding:'6px 20px', borderRadius:'12px 12px 0 0', boxShadow:`0 0 20px ${SIG_GLOW}` }}>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#000' }}>
                  Training Studio</p>
              </div>
              <IframeWithLoader src="/demo/training-studio" title="Training Studio Demo" />
            </div>
          </Reveal>
          <div style={{ position:'relative', width:120, height:120, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:8 }}>
            <svg width="120" height="60" viewBox="0 0 120 60" style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)' }}>
              <line x1="10" y1="30" x2="110" y2="30" stroke={SIG} strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
              <polygon points="110,30 100,25 100,35" fill={SIG} opacity="0.8"/>
            </svg>
            <div style={{ position:'relative', zIndex:10, width:56, height:56, borderRadius:'50%',
              background:SIG_DIM, border:`2px solid ${SIG}`, display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:`0 0 32px ${SIG_GLOW}` }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={SIG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <div style={{ position:'absolute', top:-40, left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', textAlign:'center' }}>
              <p style={{ fontSize:11, fontWeight:700, color:SIG, letterSpacing:'.05em' }}>SHARE PLAN</p>
            </div>
            <div style={{ position:'absolute', bottom:-50, left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', textAlign:'center', maxWidth:140 }}>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>Coach creates plan<br/>→ Shares with client</p>
            </div>
          </div>
          <Reveal direction="right" delay={0.3}>
            <div style={{ position:'relative', width:'100%', maxWidth:360, paddingTop:32, justifySelf:'start' }}>
              <div style={{ position:'absolute', top:'50%', left:'calc(100% + 20px)', transform:'translateY(-50%)',
                zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <p style={{ fontFamily:'var(--font-hanalei-fill)', fontSize:'clamp(32px, 4vw, 48px)', color:SIG,
                  lineHeight:1, textShadow:`0 0 20px ${SIG_GLOW}, 0 8px 32px rgba(255,255,255,0.4), 0 12px 48px rgba(255,255,255,0.2)`,
                  margin:0 }}>Clients</p>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.45)', lineHeight:1.5, maxWidth:120, textAlign:'center', margin:0 }}>
                  Follow workouts, chat with coach, log results</p>
              </div>
              <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', zIndex:20,
                background:SIG, padding:'6px 20px', borderRadius:'12px 12px 0 0', boxShadow:`0 0 20px ${SIG_GLOW}` }}>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#000' }}>
                  Workout Tracker</p>
              </div>
              <IframeWithLoader src="/demo/workout-tracker" title="Workout Tracker Demo" />
            </div>
          </Reveal>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Connected Intelligence Nodes ── */
function NetworkNodes() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const nodes = [
    { l:'Elite Coach', s:'Modifies & updates', a:false, i:'M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { l:'Synapse AI',  s:'Calibrates data loops', a:true },
    { l:'Athlete',    s:'Executes & tracks',   a:false, i:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
  ];

  if (isMobile) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:32, maxWidth:280, margin:'0 auto' }}>
        {nodes.map((n, idx) => (
          <div key={n.l} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            {idx === 1 ? (
              <div style={{
                width:80, height:80, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                border:`1.5px solid ${SIG}`,
                background:'radial-gradient(circle at 40% 35%, rgba(59,130,246,0.25), transparent 70%)',
                boxShadow:`0 0 40px ${SIG_GLOW}, inset 0 0 24px ${SIG_GLOW}`,
              }}>
                <svg width={36} height={36} viewBox="0 0 450 405" fill="none">
                  <path d="M79 129L158 287 M251 110L176 258" stroke={SIG} strokeWidth="4" strokeOpacity="0.5" strokeDasharray="5 5"/>
                  <path d="M0 284L210 344L251 110" stroke={SIG} strokeWidth="3" strokeOpacity="0.35"/>
                  <path d="M79 129C118 132 184 130 251 111M251 111C314 93 379 61 425 7M251 111C231 124 210 246 210 345" stroke={SIG} strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <circle cx="251" cy="111" r="7" fill={SIG}/>
                  <circle cx="79" cy="129" r="6" fill={SIG}/>
                </svg>
              </div>
            ) : (
              <>
                <div style={{
                  width:48, height:48, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:'1.5px solid rgba(255,255,255,0.08)',
                  background:'rgba(255,255,255,0.02)',
                }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={n.i!}/>
                  </svg>
                </div>
                <div style={{ width:1, height:16, background:'rgba(255,255,255,0.06)' }}/>
              </>
            )}
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:2 }}>{n.l}</p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{n.s}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ position:'relative', maxWidth:520, margin:'0 auto', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:0, overflow:'visible' }} viewBox="0 0 520 120" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={SIG} stopOpacity="0.1"/>
            <stop offset="50%" stopColor={SIG} stopOpacity="0.5"/>
            <stop offset="100%" stopColor={SIG} stopOpacity="0.1"/>
          </linearGradient>
          <filter id="pulseGlow"><feGaussianBlur stdDeviation="6" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
          <marker id="arrowR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0 0L8 3L0 6Z" fill={SIG} opacity="0.35"/>
          </marker>
          <marker id="arrowL" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M8 0L0 3L8 6Z" fill={SIG} opacity="0.35"/>
          </marker>
        </defs>
        <line x1="105" y1="40" x2="225" y2="40" stroke={SIG} strokeOpacity="0.2" strokeWidth="1.5" markerEnd="url(#arrowR)"/>
        <line x1="225" y1="52" x2="105" y2="52" stroke={SIG} strokeOpacity="0.15" strokeWidth="1.5" markerEnd="url(#arrowL)"/>
        <line x1="295" y1="40" x2="415" y2="40" stroke={SIG} strokeOpacity="0.2" strokeWidth="1.5" markerEnd="url(#arrowR)"/>
        <line x1="415" y1="52" x2="295" y2="52" stroke={SIG} strokeOpacity="0.15" strokeWidth="1.5" markerEnd="url(#arrowL)"/>
        <circle cx="260" cy="46" r="3" fill={SIG} filter="url(#pulseGlow)">
          <animate attributeName="r" values="3;7;3" dur="2.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
      {nodes.map((n, idx) => (
        <div key={n.l} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, position:'relative', zIndex:1, paddingTop: idx === 1 ? 0 : 18 }}>
          <div style={{
            width: idx === 1 ? 100 : 60, height: idx === 1 ? 100 : 60, borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            border:`1.5px solid ${n.a ? SIG : 'rgba(255,255,255,0.08)'}`,
            background: n.a ? 'radial-gradient(circle at 40% 35%, rgba(59,130,246,0.25), transparent 70%)' : 'rgba(255,255,255,0.02)',
            boxShadow: n.a ? `0 0 48px ${SIG_GLOW}, inset 0 0 32px ${SIG_GLOW}` : 'none',
            transition:'all .3s ease',
          }}>
            {idx === 1 ? (
              <svg width={48} height={48} viewBox="0 0 450 405" fill="none">
                <path d="M79 129L158 287 M251 110L176 258" stroke={SIG} strokeWidth="4" strokeOpacity="0.5" strokeDasharray="5 5"/>
                <path d="M0 284L210 344L251 110" stroke={SIG} strokeWidth="3" strokeOpacity="0.35"/>
                <path d="M79 129C118 132 184 130 251 111M251 111C314 93 379 61 425 7M251 111C231 124 210 246 210 345" stroke={SIG} strokeWidth="4" fill="none" strokeLinecap="round"/>
                <circle cx="251" cy="111" r="7" fill={SIG}/>
                <circle cx="79" cy="129" r="6" fill={SIG}/>
              </svg>
            ) : (
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.i!}/>
              </svg>
            )}
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:4 }}>{n.l}</p>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', lineHeight:1.4, maxWidth:100 }}>{n.s}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', color:'#fff', overflowX:'clip', letterSpacing: '-0.01em' }}>
      
      <style jsx global>{`
        @keyframes snp {
          0%,100% { opacity:.18; transform:scale(.75); }
          50%      { opacity:.85; transform:scale(1.3); }
        }
        .snp { animation:snp 3.2s ease-in-out infinite; transform-origin:center; }

        @keyframes mq  { from{transform:translateX(0)}   to{transform:translateX(-50%)} }
        @keyframes mq2 { from{transform:translateX(-50%)} to{transform:translateX(0)}   }
        .mq  { animation:mq  40s linear infinite; }
        .mq2 { animation:mq2 48s linear infinite; }

        @keyframes heroUp {
          from { opacity:0; transform:translateY(24px); filter:blur(4px); }
          to   { opacity:1; transform:translateY(0);    filter:blur(0);   }
        }
        .hu { opacity:0; animation:heroUp .9s cubic-bezier(.16,1,.3,1) forwards; }

        @keyframes scrollCue {
          0%,100% { transform:translateY(0); opacity:.2; }
          50%      { transform:translateY(6px); opacity:.5; }
        }
        .sc { animation:scrollCue 2s ease-in-out infinite; }

        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:0; height:0; }
      `}</style>

      {/* Preconnect to improve iframe loading performance */}
      <link rel="preconnect" href="/demo" />
      <link rel="dns-prefetch" href="/demo" />

      {/* Anatomy Background Layer */}
      <AnatomyBackground />

      {/* Ambient Layer */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <SynapseField/>
        <div style={{ position:'absolute', inset:0,
          background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${SIG_GLOW} 0%, transparent 70%)` }}/>
      </div>

      {/* ════ NAV ════ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:50,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'16px 40px',
        background:'rgba(10,10,10,0.75)',
        backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Logo size={32}/>
          <span style={{ fontFamily:'var(--font-hanalei-fill),system-ui', fontSize:14, fontWeight:600, letterSpacing:'.05em' }}>
            Synapse
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:28 }}>
          <a href="#features" style={{ color:'rgba(255,255,255,0.5)', fontSize:13, textDecoration:'none', transition: 'color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
            onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.5)')}>
            Features
          </a>
          <button onClick={()=>signIn()} style={{
            padding:'10px 24px', borderRadius:999,
            background:'#fff', color:'#000', fontSize:13, fontWeight:600,
            border:'none', cursor:'pointer', transition:'opacity 0.2s'
          }}
            onMouseEnter={e=>(e.currentTarget.style.opacity='.9')}
            onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
            Sign In
          </button>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section data-section="hero" style={{
        position:'relative', zIndex:10,
        minHeight:'100vh',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        textAlign:'center', padding:'140px 24px 80px',
      }}>
        <div className="hu" style={{ animationDelay:'0s' }}><Logo size={140}/></div>
        <p className="hu" style={{ animationDelay:'.2s', fontSize:11, fontWeight:700,
          letterSpacing:'.4em', textTransform:'uppercase', color:SIG, marginTop:16 }}>
          Plan · Track · Analyze · Adapt
        </p>
        <h1 className="hu" style={{ animationDelay:'.35s',
          fontFamily:'var(--font-hanalei-fill),system-ui',
          fontSize:'clamp(44px,7.5vw,80px)', fontWeight:700,
          lineHeight:1.05, letterSpacing:'0.03em', maxWidth:840, marginTop:16,
          background: 'linear-gradient(to bottom, #ffffff 60%, rgba(255,255,255,0.7))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Your AI Fitness<br/>Brain.
        </h1>
        <p className="hu" style={{ animationDelay:'.5s',
          color:'rgba(255,255,255,0.5)', fontSize:16, lineHeight:1.7,
          maxWidth:540, marginTop:24 }}>
          AI-powered training plans that adapt in real-time. Transform your raw data into performance breakthroughs.
        </p>
        <div className="hu" style={{ animationDelay:'.65s', display:'flex', gap:16, marginTop:40, flexWrap:'wrap', justifyContent:'center' }}>
          <button onClick={()=>signIn()} style={{
            padding:'16px 40px', borderRadius:14,
            background:'#fff', color:'#000', fontSize:14, fontWeight:700,
            border:'none', cursor:'pointer',
            boxShadow:`0 0 40px ${SIG_DIM}, 0 12px 32px rgba(0,0,0,0.5)`,
            transition:'all .2s ease-in-out',
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.opacity='.95';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.opacity='1';}}>
            Begin Training Free
          </button>
          <a href="#features" style={{
            padding:'16px 40px', borderRadius:14,
            border:'1px solid rgba(255,255,255,0.15)',
            color:'#fff', fontSize:14, fontWeight:500,
            textDecoration:'none', transition:'all .2s',
            background: 'rgba(255,255,255,0.02)'
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.02)';}}>
            Explore Interface ↓
          </a>
        </div>
        <p className="hu" style={{ animationDelay:'.8s',
          color:'rgba(255,255,255,0.25)', fontSize:11, letterSpacing:'.25em',
          textTransform:'uppercase', marginTop:32 }}>
          Free Forever · Instant Access · Works Offline
        </p>
        
        <div className="sc" style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={{ width:1, height:48, background:'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }}/>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
            <path d="M1 1l5 5 5-5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ════ STATS ════ */}
      <section data-section="stats" style={{ position:'relative', zIndex:10, padding:'80px 24px 60px', maxWidth:1000, margin:'0 auto' }}>
        <Reveal direction="fade">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:48, textAlign:'center' }}>
            {[
              { n:'< 2', u:'min', l:'From first prompt to personalized training plan.' },
              { n:'6',   u:'+',   l:'Deep telemetry & performance tracking metrics.' },
              { n:'100', u:'%',   l:'Offline-first architecture. Train anywhere.' },
              { n:'∞',   u:'',    l:'Real-time adaptive program adjustments.' },
            ].map((s,i) => (
              <Reveal key={i} delay={i * 0.1} direction="up">
                <div>
                  <div style={{ fontSize:'clamp(40px,5vw,60px)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1 }}>
                    {s.n}<span style={{ color:SIG, fontSize:'.65em' }}>{s.u}</span>
                  </div>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:12, lineHeight:1.6, maxWidth:200, margin:'12px auto 0' }}>{s.l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ════ FEATURES SECTION ════ */}
      <section id="features" style={{ position:'relative', zIndex:10, padding:'80px 24px', maxWidth:1200, margin:'0 auto' }}>
        <Reveal direction="up">
          <div style={{ textAlign:'center', marginBottom:80 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
              Core Features
            </p>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, lineHeight:1.15, letterSpacing: '-0.02em' }}>
              Everything you need to excel.
            </h2>
          </div>
        </Reveal>

        {/* Feature cards - vertical layout */}
        <div style={{ display:'flex', flexDirection:'column', gap:80 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
              gap:64,
              alignItems:'center',
            }}>
              {/* Phone frame */}
              <Reveal direction={i % 2 === 0 ? 'left' : 'right'} delay={0.1}>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', order: i % 2 === 0 ? 1 : 2 }}>
                  <div style={{ width:'min(100%, 360px)' }}>
                    <IframeWithLoader src={f.demo} title={f.eyebrow} />
                  </div>
                </div>
              </Reveal>

              {/* Text content */}
              <Reveal direction={i % 2 === 0 ? 'right' : 'left'} delay={0.2}>
                <div style={{ order: i % 2 === 0 ? 2 : 1 }}>
                  <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
                    {f.eyebrow}
                  </p>
                  <h2 style={{ fontSize:'clamp(28px,3.5vw,44px)', fontWeight:800, lineHeight:1.1, whiteSpace:'pre-line', marginBottom:20, letterSpacing: '-0.02em' }}>
                    {f.title}
                  </h2>
                  <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.7, maxWidth:420 }}>
                    {f.body}
                  </p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ════ LIVE DEMO SHOWCASE ════ */}
      <section data-section="live-demo" style={{ position:'relative', zIndex:10, padding:'120px 24px', maxWidth:1200, margin:'0 auto' }}>
        <Reveal direction="up">
          <div style={{ textAlign:'center', marginBottom:80 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
              Interactive Preview
            </p>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, lineHeight:1.15, marginBottom:20, letterSpacing: '-0.02em' }}>
              Experience it live.
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.7, maxWidth:520, margin:'0 auto' }}>
              Real interfaces. Real interactions. See how Synapse adapts to every training phase.
            </p>
          </div>
        </Reveal>
          
          <div style={{ display:'flex', flexDirection:'column', gap:80 }}>
            {/* Plan Detail Demo - Left */}
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
              gap:64,
              alignItems:'center',
            }}>
              <Reveal direction="left" delay={0.1}>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', order: 1 }}>
                  <div style={{ 
                    position:'relative',
                    width:'100%',
                    maxWidth:360,
                    paddingTop:32,
                  }}>
                    <div style={{ 
                      position:'absolute', 
                      top:0, 
                      left:'50%',
                      transform:'translateX(-50%)',
                      zIndex:20,
                      background:SIG,
                      padding:'6px 20px',
                      borderRadius:'12px 12px 0 0',
                      boxShadow:`0 0 20px ${SIG_GLOW}`,
                    }}>
                      <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#000' }}>
                        Plan Details
                      </p>
                    </div>
                    <IframeWithLoader src="/demo/plan-detail" title="Plan Detail Demo" />
                  </div>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.2}>
                <div style={{ order: 2 }}>
                  <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
                    Plan Details
                  </p>
                  <h3 style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:800, lineHeight:1.1, marginBottom:16, letterSpacing: '-0.02em' }}>
                    Build your perfect plan
                  </h3>
                  <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.7, maxWidth:420 }}>
                    View detailed workout plans with exercise breakdown, sets, reps, and rest periods. Everything you need at a glance.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Progress Tracker Demo - Right */}
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
              gap:64,
              alignItems:'center',
            }}>
              <Reveal direction="left" delay={0.1}>
                <div style={{ order: 2 }}>
                  <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
                    Progress Tracking
                  </p>
                  <h3 style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:800, lineHeight:1.1, marginBottom:16, letterSpacing: '-0.02em' }}>
                    Track your journey
                  </h3>
                  <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.7, maxWidth:420 }}>
                    Monitor your progress over time with detailed analytics and visualizations. See your improvement clearly.
                  </p>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.2}>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', order: 1 }}>
                  <div style={{ 
                    position:'relative',
                    width:'100%',
                    maxWidth:360,
                    paddingTop:32,
                  }}>
                    <div style={{ 
                      position:'absolute', 
                      top:0, 
                      left:'50%',
                      transform:'translateX(-50%)',
                      zIndex:20,
                      background:SIG,
                      padding:'6px 20px',
                      borderRadius:'12px 12px 0 0',
                      boxShadow:`0 0 20px ${SIG_GLOW}`,
                    }}>
                      <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#000' }}>
                        Progress Tracking
                      </p>
                    </div>
                    <IframeWithLoader src="/demo/plan-progress" title="Progress Tracker Demo" />
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Monitor Demo - Left */}
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
              gap:64,
              alignItems:'center',
            }}>
              <Reveal direction="left" delay={0.1}>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', order: 1 }}>
                  <div style={{ 
                    position:'relative',
                    width:'100%',
                    maxWidth:360,
                    paddingTop:32,
                  }}>
                    <div style={{ 
                      position:'absolute', 
                      top:0, 
                      left:'50%',
                      transform:'translateX(-50%)',
                      zIndex:20,
                      background:SIG,
                      padding:'6px 20px',
                      borderRadius:'12px 12px 0 0',
                      boxShadow:`0 0 20px ${SIG_GLOW}`,
                    }}>
                      <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#000' }}>
                        Cardio Monitor
                      </p>
                    </div>
                    <IframeWithLoader src="/demo/monitor" title="Monitor Demo" />
                  </div>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.2}>
                <div style={{ order: 2 }}>
                  <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
                    Cardio Monitor
                  </p>
                  <h3 style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:800, lineHeight:1.1, marginBottom:16, letterSpacing: '-0.02em' }}>
                    Cardio insights
                  </h3>
                  <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.7, maxWidth:420 }}>
                    Track cardio sessions, heart rate zones, and performance metrics. Optimize your cardiovascular training.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Water Tracker Demo - Right */}
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
              gap:64,
              alignItems:'center',
            }}>
              <Reveal direction="left" delay={0.1}>
                <div style={{ order: 2 }}>
                  <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
                    Water Tracker
                  </p>
                  <h3 style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:800, lineHeight:1.1, marginBottom:16, letterSpacing: '-0.02em' }}>
                    Stay hydrated
                  </h3>
                  <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.7, maxWidth:420 }}>
                    Monitor daily water intake with smart reminders. Maintain optimal hydration for peak performance.
                  </p>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.2}>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', order: 1 }}>
                  <div style={{ 
                    position:'relative',
                    width:'100%',
                    maxWidth:360,
                    paddingTop:32,
                  }}>
                    <div style={{ 
                      position:'absolute', 
                      top:0, 
                      left:'50%',
                      transform:'translateX(-50%)',
                      zIndex:20,
                      background:SIG,
                      padding:'6px 20px',
                      borderRadius:'12px 12px 0 0',
                      boxShadow:`0 0 20px ${SIG_GLOW}`,
                    }}>
                      <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#000' }}>
                        Water Tracker
                      </p>
                    </div>
                    <IframeWithLoader src="/demo/water-tracker" title="Water Tracker Demo" />
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Entertain Demo - Left */}
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
              gap:64,
              alignItems:'center',
            }}>
              <Reveal direction="left" delay={0.1}>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', order: 1 }}>
                  <div style={{ 
                    position:'relative',
                    width:'100%',
                    maxWidth:360,
                    paddingTop:32,
                  }}>
                    <div style={{ 
                      position:'absolute', 
                      top:0, 
                      left:'50%',
                      transform:'translateX(-50%)',
                      zIndex:20,
                      background:SIG,
                      padding:'6px 20px',
                      borderRadius:'12px 12px 0 0',
                      boxShadow:`0 0 20px ${SIG_GLOW}`,
                    }}>
                      <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'#000' }}>
                        Entertain
                      </p>
                    </div>
                    <IframeWithLoader src="/demo/entertain" title="Entertain Demo" />
                  </div>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.2}>
                <div style={{ order: 2 }}>
                  <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
                    Entertain
                  </p>
                  <h3 style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:800, lineHeight:1.1, marginBottom:16, letterSpacing: '-0.02em' }}>
                    Discover & engage
                  </h3>
                  <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.7, maxWidth:420 }}>
                    Explore fitness news, events, workout videos, and curated playlists. Stay motivated with fresh content tailored to your goals.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Training Studio Demo - Full Width */}
          <TrainingStudioDemo/>
      </section>

      {/* ════ SCREENSHOT COLLAGE ════ */}
      <section data-section="screenshots" style={{ position:'relative', zIndex:10, padding:'60px 24px', maxWidth:1100, margin:'0 auto' }}>
        <Reveal direction="up">
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
              The Full Experience
            </p>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, lineHeight:1.15, letterSpacing: '-0.02em' }}>
              Every interface layer, unified.
            </h2>
          </div>
        </Reveal>
        <Reveal direction="fade" delay={0.2}>
          <ScreenshotCollage/>
        </Reveal>
      </section>

      {/* ════ NETWORK ════ */}
      <section data-section="network" style={{ position:'relative', zIndex:10, padding:'80px 24px 100px', maxWidth:800, margin:'0 auto', textAlign:'center', overflow:'visible' }}>
        <Reveal direction="up">
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
            Connected Intelligence
          </p>
          <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, lineHeight:1.15, marginBottom:80, letterSpacing: '-0.02em' }}>
            One intelligent system.<br/>Three synchronized nodes.
          </h2>
        </Reveal>
        <Reveal direction="fade" delay={0.2}>
          <NetworkNodes/>
        </Reveal>
      </section>

      {/* ════ FEATURE GRID ════ */}
      <section data-section="feature-grid" style={{ position:'relative', zIndex:10, padding:'80px 24px 120px', maxWidth:1100, margin:'0 auto' }}>
        <Reveal direction="up">
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
              Complete Ecosystem
            </p>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, lineHeight:1.15, letterSpacing: '-0.02em' }}>
              Every tool you need.<br/>Built into one platform.
            </h2>
          </div>
        </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {[
              ['Performance Analytics', 'Plan vs. Actual Tracking', 'Deep auditing of variance between scheduled workouts and executed sessions, instantly flagging optimization opportunities.'],
              ['Biometric Integration', 'Strava & Wearable Sync', 'Automated data streams for cardio metrics, running dynamics, and vital statistics—zero manual input required.'],
              ['Smart Hydration', 'Adaptive Volume Tracking', 'Intelligent reminders structured around your workout intensity to maintain optimal hydration levels.'],
              ['Real-Time Sync', 'Instant Communication', 'Encrypted messaging and data synchronization with coaches, backed by reliable delivery protocols.'],
              ['Nutrition Intelligence', 'Natural Language Logging', 'Describe your goals naturally ("lose 5kg by September") while the AI maps nutritional requirements automatically.'],
              ['Progressive Web App', 'True Offline Capability', 'Authentic PWA architecture that runs locally, functions completely offline, and syncs when you\'re back online.']
            ].map(([label,title,desc],i) => (
              <Reveal key={label} delay={i * 0.05} style={{ 
                borderRadius:24, background:'rgba(255,255,255,0.015)',
                border:'1px solid rgba(255,255,255,0.05)', padding:'24px 28px', transition:'all .2s ease-in-out'
              }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:SIG, marginBottom:12 }}>
                  {label}
                </p>
                <p style={{ color:'#fff', fontWeight:600, fontSize:15, marginBottom:10 }}>{title}</p>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:1.65 }}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

      {/* ════ STRAVA SYNC ════ */}
      <section data-section="strava" style={{ position:'relative', zIndex:10, padding:'60px 24px', maxWidth:900, margin:'0 auto' }}>
        <Reveal direction="up">
          <div style={{
            borderRadius:20,
            background:'linear-gradient(135deg, rgba(252,76,2,0.06) 0%, rgba(252,76,2,0.01) 100%)',
            border:'1px solid rgba(252,76,2,0.1)',
            padding:'clamp(20px,3vw,40px)',
            display:'flex',
            alignItems:'center',
            gap:'clamp(16px,3vw,32px)',
            flexWrap:'wrap',
            justifyContent:'center',
          }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
              <svg width="20" height="28" viewBox="0 0 42 59" fill="#fc5200">
                <path d="M29.2706 43.5683L24.1528 33.4854H16.5283L29.2706 58.4349L41.9999 33.4854H34.3754L29.2706 43.5683Z"/>
                <path d="M17.1812 19.9467L24.1529 33.4852H34.3755L17.1812 0L0 33.4852H10.2356L17.1812 19.9467Z"/>
              </svg>
              <svg width="60" height="12" viewBox="0 0 485 95" fill="#fc5200">
                <path fillRule="evenodd" clipRule="evenodd" d="M258.505 90.4524L258.502 90.4484H284.108L299.838 58.8214L315.567 90.4484H346.682L299.835 -0.000610352L255.366 85.8686L238.292 60.9384C248.834 55.8544 255.405 47.0494 255.405 34.4014V34.1524C255.405 25.2254 252.678 18.7764 247.469 13.5674C241.392 7.49139 231.596 3.64739 216.22 3.64739H173.809V90.4524H202.827V65.6504H209.027L225.396 90.4524H258.505ZM437.447 -0.000610352L390.606 90.4484H421.721L437.45 58.8214L453.18 90.4484H484.294L437.447 -0.000610352ZM368.669 94.0074L415.51 3.55839H384.396L368.666 35.1854L352.936 3.55839H321.822L368.669 94.0074ZM215.352 44.9414C222.295 44.9414 226.512 41.8414 226.512 36.5094V36.2604C226.512 30.6804 222.171 27.9524 215.476 27.9524H202.827V44.9414H215.352ZM111.753 28.2004H86.2089V3.64739H166.316V28.2004H140.772V90.4524H111.753V28.2004ZM15.5019 58.9544L-9.15527e-05 77.4314C11.0369 87.1054 26.9099 92.0644 44.5179 92.0644C67.8319 92.0644 82.8369 80.9034 82.8369 62.6734V62.4264C82.8369 44.9414 67.9559 38.4924 45.7589 34.4014C36.5819 32.6634 34.2259 31.1774 34.2259 28.8204V28.5724C34.2259 26.4644 36.2109 24.9764 40.5499 24.9764C48.6099 24.9764 58.4079 27.5804 66.5909 33.5324L80.7289 13.9404C70.6839 6.00339 58.2839 2.03439 41.5429 2.03439C17.6079 2.03439 4.71191 14.8084 4.71191 31.3004V31.5494C4.71191 49.9014 21.8259 55.4834 41.2939 59.4494C50.5949 61.3104 53.3219 62.6734 53.3219 65.1544V65.4034C53.3219 67.7584 51.0909 69.1214 45.8819 69.1214C35.7139 69.1214 24.9259 66.1474 15.5019 58.9544Z"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:4 }}>
                Sync your smart watch data via Strava
              </p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>
                Link Strava to auto-import runs, rides, swims, and gym sessions from your Apple Watch, Garmin, Fitbit — heart rate, pace, distance, and calories mapped to your training timeline.
              </p>
            </div>
            <div style={{
              display:'flex', alignItems:'center', gap:8, flexShrink:0,
              padding:'8px 16px', borderRadius:10,
              background:'rgba(252,76,2,0.08)',
              border:'1px solid rgba(252,76,2,0.12)',
            }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px rgba(34,197,94,0.5)' }}/>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>
                Connected
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════ PWA INSTALL ════ */}
      <section data-section="pwa-install" style={{ position:'relative', zIndex:10, padding:'60px 24px', maxWidth:900, margin:'0 auto' }}>
        <Reveal direction="up">
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <span style={{
              display:'inline-block',
              padding:'6px 20px',
              borderRadius:999,
              background:SIG_DIM,
              border:`1px solid ${SIG}44`,
              fontFamily:'var(--font-hanalei-fill),system-ui',
              fontSize:'clamp(18px,2.5vw,26px)',
              color:'#fff',
              letterSpacing:'.08em',
            }}>
              PWA Easy Install
            </span>
          </div>
          <div style={{
            borderRadius:20,
            background:'rgba(255,255,255,0.015)',
            border:'1px solid rgba(255,255,255,0.06)',
            padding:'clamp(24px,3vw,40px)',
            display:'flex',
            alignItems:'center',
            gap:'clamp(16px,3vw,32px)',
            flexWrap:'wrap',
            justifyContent:'center',
            textAlign:'center',
          }}>
            <div style={{
              width:56,
              height:56,
              borderRadius:16,
              background:SIG_DIM,
              border:`1px solid ${SIG}33`,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              flexShrink:0,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={SIG} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v8l4-4m-4 4l-4-4"/>
                <rect x="4" y="14" width="16" height="8" rx="2"/>
                <line x1="12" y1="14" x2="12" y2="18"/>
              </svg>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <p style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:4 }}>
                Install on any device — works offline
              </p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.6, maxWidth:500, margin:'0 auto' }}>
                Add Synapse to your home screen for a native-like experience. Fully functional offline — train anywhere, sync when connected.
              </p>
            </div>
            <div style={{ display:'flex', gap:12, flexShrink:0, flexWrap:'wrap', justifyContent:'center', alignItems:'center' }}>
              {['iOS Safari', 'Android', 'Desktop'].map(label => (
                <div key={label} style={{
                  padding:'4px 12px', borderRadius:6,
                  background: SIG_DIM,
                  border:`1px solid ${SIG}44`,
                  fontFamily:'var(--font-hanalei-fill),system-ui',
                  fontSize:12, color:SIG,
                  letterSpacing:'.05em',
                }}>
                  {label}
                </div>
              ))}
              <button style={{
                padding:'8px 20px', borderRadius:8,
                background:SIG, color:'#000', fontSize:12, fontWeight:700,
                border:'none', cursor:'pointer',
                fontFamily:'system-ui,sans-serif',
                transition:'all .2s ease-in-out',
                boxShadow:`0 0 24px ${SIG_DIM}`,
              }}
                onMouseEnter={e=>{e.currentTarget.style.opacity='.85'; e.currentTarget.style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'}}>
                Install Now
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════ FINAL CTA ════ */}
      <section data-section="cta" style={{ position:'relative', zIndex:10, padding:'80px 24px 120px', maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:800, lineHeight:1.12, letterSpacing: '-0.025em', marginBottom:24 }}>
            Ready to transform<br/>your training?
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:16, lineHeight:1.7, maxWidth:480, margin:'0 auto 40px' }}>
            Join athletes already using Synapse to maximize their performance. Start building your personalized training plan in under 2 minutes.
          </p>
          <button onClick={()=>signIn()} style={{
            padding:'18px 48px', borderRadius:14,
            background:'#fff', color:'#000', fontSize:16, fontWeight:700,
            border:'none', cursor:'pointer',
            boxShadow:`0 0 40px ${SIG_DIM}, 0 12px 32px rgba(0,0,0,0.5)`,
            transition:'all .2s ease-in-out',
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.opacity='.95';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.opacity='1';}}>
            Get Started Free
          </button>
          <p style={{ color:'rgba(255,255,255,0.25)', fontSize:12, marginTop:20 }}>
            No payment required • Full access included
          </p>
        </section>

      {/* ════ FOOTER ════ */}
      <footer style={{ 
        position:'relative', zIndex:10, 
        borderTop:'1px solid rgba(255,255,255,0.05)', 
        padding:'48px 24px', 
        textAlign:'center' 
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:24 }}>
          <Logo size={28}/>
          <span style={{ fontFamily:'var(--font-hanalei-fill),system-ui', fontSize:13, fontWeight:600, letterSpacing:'.05em', color:'rgba(255,255,255,0.6)' }}>
            Synapse
          </span>
        </div>
        <nav style={{ display:'flex', justifyContent:'center', gap:20, marginBottom:20, flexWrap:'wrap' }}>
          <a href="/planner" style={{ color:'rgba(255,255,255,0.4)', fontSize:13, textDecoration:'none' }}>Workout Planner</a>
          <a href="/workout-tracker" style={{ color:'rgba(255,255,255,0.4)', fontSize:13, textDecoration:'none' }}>Workout Tracker</a>
          <a href="/training-chat" style={{ color:'rgba(255,255,255,0.4)', fontSize:13, textDecoration:'none' }}>Training Chat</a>
          <a href="/blog" style={{ color:'rgba(255,255,255,0.4)', fontSize:13, textDecoration:'none' }}>Blog</a>
        </nav>
        <p style={{ color:'rgba(255,255,255,0.25)', fontSize:12 }}>
          © {new Date().getFullYear()} Synapse Fit. Elevating athletic intelligence.
        </p>
      </footer>

    </div>
  );
}