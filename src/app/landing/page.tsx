'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';
import MenAnatomy from '@/components/MenAnatomy';
import WomenAnatomy from '@/components/WomenAnatomy';

// Lazy load heavy components
const ScreenshotCollage = dynamic(() => import('@/components/ScreenshotCollage'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-800/20 rounded-xl" />,
});

/* ─────────────────────────────────────────────────────
   SYNAPSE LANDING — Premium Ultra Edition
   Polished UX, High-Conversion Copywriting, Clean Architecture
───────────────────────────────────────────────────── */

const SIG       = '#3B82F6';
const SIG_DIM   = 'rgba(59,130,246,0.13)';
const SIG_GLOW  = 'rgba(59,130,246,0.07)';

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

/* ── Scroll-reveal wrapper ── */
function Reveal({
  children, delay = 0, className = '', style: extraStyle = {},
}: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref  = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.01, rootMargin: '200px 0px 200px 0px' } // Increased margins for earlier loading
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      ...extraStyle,
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.99)', // Reduced movement
      filter: vis ? 'blur(0px)' : 'blur(2px)', // Less blur
      transition: `opacity .5s cubic-bezier(.16,1,.3,1) ${delay}s,
                   transform .5s cubic-bezier(.16,1,.3,1) ${delay}s,
                   filter .4s ease ${delay}s`, // Faster transitions
      willChange: 'opacity, transform',
      contentVisibility: 'auto', // CSS containment for better performance
    }}>
      {children}
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
    img: optimizeImage(`${CDN}/v1782909959/planner-page_o8qws3.jpg`, 800)
  },
  { 
    eyebrow: 'Precision Tracking', 
    title: 'Zero friction.\nMaximum data velocity.', 
    body: 'Engage with real-time muscle workload visualization, instant HD form references, and contextual coaching notes precisely when you unrack. The gym floor, fully digitized.', 
    img: optimizeImage(`${CDN}/v1782909972/workout-tracker-1_pqlbtp.png`, 800)
  },
  { 
    eyebrow: 'Predictive Analytics', 
    title: 'Isolate what delivers results.\nEliminate guessing.', 
    body: 'Bridge the gap between target metrics and actual execution. Discover training biases, capture volume imbalances, and contextualize your systemic data loops—hydration, mass, and cardio trends—in a unified pane of glass.', 
    img: optimizeImage(`${CDN}/v1782909997/sidebar-activeplans_mdzu8i.jpg`, 800)
  },
  { 
    eyebrow: 'Human Co-Pilot', 
    title: 'Your elite human coach,\nembedded natively.', 
    body: 'Empower your coach to modify parameters mid-session, push real-time programmatic revisions, and audit telemetry as you perform reps. High-touch elite coaching meets high-scale intelligence.', 
    img: optimizeImage(`${CDN}/v1782909941/ai-planner-generating_rj2naj.jpg`, 800)
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

export default function LandingPage() {
  const stickyRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!stickyRef.current) return;
      const { top, height } = stickyRef.current.getBoundingClientRect();
      const scrolled = -top;
      const total    = height - window.innerHeight;
      const p        = Math.max(0, Math.min(0.9999, scrolled / total));
      setActiveIdx(Math.min(FEATURES.length - 1, Math.floor(p * FEATURES.length)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <section style={{
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

      {/* ════ STICKY FEATURE SCROLL ════ */}
      <section id="features" ref={stickyRef} style={{ position:'relative', zIndex:10, height:`${FEATURES.length * 100}vh` }}>
        <div style={{
          position:'sticky', top:0, height:'100vh',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'0 40px',
        }}>
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:1,
            background:`linear-gradient(90deg, transparent 0%, ${SIG} 40%, ${SIG} 60%, transparent 100%)`,
            opacity:.2,
          }}/>

          <div style={{
            width:'100%', maxWidth:1100,
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
            gap:64, alignItems:'center',
          }}>
            {/* LEFT — Phone frame container */}
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
              <div style={{ position:'relative', width:'min(45vw, 260px)' }}>
                <div style={{ width:'100%', aspectRatio:'402/874', visibility:'hidden' }}/>
                {FEATURES.map((f,i) => (
                  <div key={i} style={{
                    position:'absolute', inset:0,
                    opacity: activeIdx===i ? 1 : 0,
                    transform: `scale(${activeIdx===i ? 1 : activeIdx>i ? .95 : .98}) translateY(${activeIdx===i ? 0 : activeIdx>i ? -24 : 24}px)`,
                    transition:'opacity .4s cubic-bezier(.16,1,.3,1), transform .4s cubic-bezier(.16,1,.3,1)',
                    pointerEvents: activeIdx===i ? 'auto' : 'none',
                    willChange: activeIdx===i || Math.abs(activeIdx-i)<=1 ? 'opacity, transform' : 'auto',
                  }}>
                    <div style={{ width:'100%', height:'100%', aspectRatio:'402/874',
                      borderRadius:'40px', background:'#0c0c0c',
                      border:'1px solid rgba(255,255,255,0.12)', overflow:'hidden',
                      boxShadow:`0 32px 96px rgba(0,0,0,0.85), 0 0 64px ${SIG_GLOW}`,
                    }}>
                      <img src={f.img} alt={f.eyebrow} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
                      <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
                        width:'28%', height:4, borderRadius:999, background:'rgba(255,255,255,0.25)' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Text panels */}
            <div>
              <div style={{ display:'flex', gap:8, marginBottom:44 }}>
                {FEATURES.map((_,i) => (
                  <div key={i} style={{
                    flex:1, height:3, borderRadius:999,
                    background: i<=activeIdx ? SIG : 'rgba(255,255,255,0.1)',
                    opacity: i===activeIdx ? 1 : i<activeIdx ? 0.6 : 0.2,
                    transition:'all .4s ease',
                  }}/>
                ))}
              </div>
              <div style={{ position:'relative', height:280 }}>
                {FEATURES.map((f,i) => (
                  <div key={i} style={{
                    position:'absolute', top:0, left:0, right:0,
                    opacity: activeIdx===i ? 1 : 0,
                    transform: `translateY(${activeIdx===i ? 0 : activeIdx>i ? -20 : 20}px)`,
                    transition:'opacity .45s ease, transform .5s cubic-bezier(.16,1,.3,1)',
                    pointerEvents: activeIdx===i ? 'auto' : 'none',
                  }}>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ MARQUEE ════ */}
      <Reveal>
        <section style={{ position:'relative', zIndex:10, padding:'80px 0', overflow:'hidden' }}>
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.06) 30%,rgba(255,255,255,0.06) 70%,transparent)', marginBottom:24 }}/>
          <div className="mq" style={{ display:'flex', gap:16, width:'max-content', marginBottom:16 }}>
            {[...MQ,...MQ].map((src,i) => (
              <div key={i} style={{ width:130, aspectRatio:'402/874', borderRadius:16, overflow:'hidden',
                border:'1px solid rgba(255,255,255,0.08)', flexShrink:0, background:'#111' }}>
                <img src={src} alt="" loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.65 }}/>
              </div>
            ))}
          </div>
          <div className="mq2" style={{ display:'flex', gap:16, width:'max-content' }}>
            {[...[...MQ].reverse(),...[...MQ].reverse()].map((src,i) => (
              <div key={i} style={{ width:130, aspectRatio:'402/874', borderRadius:16, overflow:'hidden',
                border:'1px solid rgba(255,255,255,0.08)', flexShrink:0, background:'#111' }}>
                <img src={src} alt="" loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.5 }}/>
              </div>
            ))}
          </div>
          <div style={{ height:1, background:'linear-gradient(90px,transparent,rgba(255,255,255,0.06) 30%,rgba(255,255,255,0.06) 70%,transparent)', marginTop:24 }}/>
        </section>
      </Reveal>

      {/* ════ STATS ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'120px 24px', maxWidth:1000, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:48, textAlign:'center' }}>
            {[
              { n:'< 2', u:'min', l:'From first prompt to personalized training plan.' },
              { n:'6',   u:'+',   l:'Deep telemetry & performance tracking metrics.' },
              { n:'100', u:'%',   l:'Offline-first architecture. Train anywhere.' },
              { n:'∞',   u:'',    l:'Real-time adaptive program adjustments.' },
            ].map((s,i) => (
              <div key={i}>
                <div style={{ fontSize:'clamp(40px,5vw,60px)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1 }}>
                  {s.n}<span style={{ color:SIG, fontSize:'.65em' }}>{s.u}</span>
                </div>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:12, lineHeight:1.6, maxWidth:200, margin:'12px auto 0' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ════ LIVE INTERFACE PREVIEW ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'120px 24px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
              Live Interface
            </p>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, lineHeight:1.15, marginBottom:20, letterSpacing: '-0.02em' }}>
              Watch your training flow<br/>from plan to execution.
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.7, maxWidth:520, margin:'0 auto' }}>
              Seamless transitions across every workout phase. Your fitness intelligence operating in real-time, continuously adapting to your performance data.
            </p>
          </div>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ width:'min(45vw, 260px)', aspectRatio:'402/874', borderRadius:'40px',
              background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.12)', overflow:'hidden',
              position:'relative', flexShrink:0,
              boxShadow:`0 40px 120px rgba(0,0,0,0.9), 0 0 80px ${SIG_GLOW}`,
            }}>
              <video
                src="https://res.cloudinary.com/vj5y67l9/video/upload/q_auto,f_auto/v1782910263/compressed-Sequence_02_1_kge9tm.mp4"
                autoPlay muted loop playsInline
                preload="metadata"
                style={{ width:'100%', height:'100%', display:'block', objectFit:'cover' }}
              />
              <div style={{ position:'absolute', inset:0, pointerEvents:'none',
                background:'linear-gradient(to bottom, rgba(10,10,10,.4) 0%, transparent 15%, transparent 85%, rgba(10,10,10,.4) 100%)' }}/>
              <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
                width:'28%', height:4, borderRadius:999, background:'rgba(255,255,255,0.25)' }}/>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════ SCREENSHOT COLLAGE ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'100px 24px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
              The Full Experience
            </p>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, lineHeight:1.15, letterSpacing: '-0.02em' }}>
              Every interface layer, unified.
            </h2>
          </div>
          <ScreenshotCollage/>
        </section>
      </Reveal>

      {/* ════ LIVE DEMO SHOWCASE ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'120px 24px', maxWidth:1400, margin:'0 auto' }}>
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
          
          <div style={{ 
            display:'grid', 
            gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', 
            gap:48,
            justifyItems:'center',
            maxWidth:1200,
            margin:'0 auto',
          }}>
            {/* Plan Detail Demo */}
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
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#000' }}>
                  Plan Details
                </p>
              </div>
              <div style={{ 
                width:'100%',
                aspectRatio:'402/874',
                borderRadius:'40px',
                overflow:'hidden',
                border:`1px solid rgba(255,255,255,0.12)`,
                background:'#0c0c0c',
                boxShadow:`0 32px 96px rgba(0,0,0,0.85), 0 0 64px ${SIG_GLOW}`,
                position:'relative',
              }}>
                <iframe
                  src="/demo/plan-detail"
                  style={{ 
                    width:'100%', 
                    height:'100%', 
                    border:'none',
                  }}
                  title="Plan Detail Demo"
                  loading="lazy"
                />
                <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
                  width:'28%', height:4, borderRadius:999, background:'rgba(255,255,255,0.25)' }}/>
              </div>
            </div>

            {/* Progress Tracker Demo */}
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
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#000' }}>
                  Progress Tracking
                </p>
              </div>
              <div style={{ 
                width:'100%',
                aspectRatio:'402/874',
                borderRadius:'40px',
                overflow:'hidden',
                border:`1px solid rgba(255,255,255,0.12)`,
                background:'#0c0c0c',
                boxShadow:`0 32px 96px rgba(0,0,0,0.85), 0 0 64px ${SIG_GLOW}`,
                position:'relative',
              }}>
                <iframe
                  src="/demo/plan-progress"
                  style={{ 
                    width:'100%', 
                    height:'100%', 
                    border:'none',
                  }}
                  title="Progress Tracker Demo"
                  loading="lazy"
                />
                <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
                  width:'28%', height:4, borderRadius:999, background:'rgba(255,255,255,0.25)' }}/>
              </div>
            </div>

            {/* Monitor Demo */}
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
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#000' }}>
                  Cardio Monitor
                </p>
              </div>
              <div style={{ 
                width:'100%',
                aspectRatio:'402/874',
                borderRadius:'40px',
                overflow:'hidden',
                border:`1px solid rgba(255,255,255,0.12)`,
                background:'#0c0c0c',
                boxShadow:`0 32px 96px rgba(0,0,0,0.85), 0 0 64px ${SIG_GLOW}`,
                position:'relative',
              }}>
                <iframe
                  src="/demo/monitor"
                  style={{ 
                    width:'100%', 
                    height:'100%', 
                    border:'none',
                  }}
                  title="Monitor Demo"
                  loading="lazy"
                />
                <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
                  width:'28%', height:4, borderRadius:999, background:'rgba(255,255,255,0.25)' }}/>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════ NETWORK ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'120px 24px 140px', maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
            Connected Intelligence
          </p>
          <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, lineHeight:1.15, marginBottom:72, letterSpacing: '-0.02em' }}>
            One intelligent system.<br/>Three synchronized nodes.
          </h2>
          <div style={{ position:'relative', maxWidth:440, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 380 80" preserveAspectRatio="none">
              <line x1="50" y1="40" x2="190" y2="40" stroke={SIG} strokeOpacity=".25" strokeWidth="1" strokeDasharray="5 6"/>
              <line x1="190" y1="40" x2="330" y2="40" stroke={SIG} strokeOpacity=".25" strokeWidth="1" strokeDasharray="5 6"/>
              <circle cx="120" cy="40" r="4" fill={SIG} opacity=".8" className="snp"/>
              <circle cx="260" cy="40" r="4" fill={SIG} opacity=".8" className="snp" style={{ animationDelay:'.8s' }}/>
            </svg>
            {[
              { l:'Elite Coach', s:'Modifies & updates', a:false },
              { l:'Synapse AI',  s:'Calibrates data loops', a:true  },
              { l:'Athlete',    s:'Executes & tracks',   a:false },
            ].map(n => (
              <div key={n.l} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, position:'relative', zIndex:1 }}>
                <div style={{
                  width:68, height:68, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:`1px solid ${n.a ? SIG+'aa' : 'rgba(255,255,255,0.12)'}`,
                  background: n.a ? SIG_DIM : 'rgba(255,255,255,0.04)',
                  boxShadow: n.a ? `0 0 32px ${SIG_GLOW}` : 'none',
                }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background: n.a ? SIG : 'rgba(255,255,255,0.3)' }}
                    className={n.a ? 'snp' : ''}/>
                </div>
                <p style={{ fontSize:13, fontWeight:600 }}>{n.l}</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{n.s}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ════ FEATURE GRID ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'120px 24px 160px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'.25em', textTransform:'uppercase', color:SIG, marginBottom:16 }}>
              Complete Ecosystem
            </p>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, lineHeight:1.15, letterSpacing: '-0.02em' }}>
              Every tool you need.<br/>Built into one platform.
            </h2>
          </div>
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
      </Reveal>

      {/* ════ FINAL CTA ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'80px 24px 120px', maxWidth:720, margin:'0 auto', textAlign:'center' }}>
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
      </Reveal>

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
        <p style={{ color:'rgba(255,255,255,0.25)', fontSize:12 }}>
          © {new Date().getFullYear()} Synapse Fit. Elevating athletic intelligence.
        </p>
      </footer>

    </div>
  );
}