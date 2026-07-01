'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import ScreenshotCollage from '@/components/ScreenshotCollage';
import CardioCarousel from '@/components/CardioCarousel';

/* ─────────────────────────────────────────────────────
   SYNAPSE LANDING — v3
   Fixes:
   · overflow-x:clip (not hidden) → sticky scroll works
   · Phone uses aspect-ratio + width only → no compression
   · Reveal with blur+scale+opacity → Apple scroll intro
   · Direct <video autoPlay> for autoplay
   · Mobile-first responsive throughout
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

/* ── Synapse field (blue signals only) ── */
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

/* ── Scroll-reveal wrapper (blur + scale + fade — Apple-style) ── */
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
      { threshold: 0.06, rootMargin: '0px 0px -48px 0px' }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      ...extraStyle,
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0) scale(1)' : 'translateY(44px) scale(0.97)',
      filter: vis ? 'blur(0px)' : 'blur(6px)',
      transition: `opacity .9s cubic-bezier(.22,1,.36,1) ${delay}s,
                   transform .9s cubic-bezier(.22,1,.36,1) ${delay}s,
                   filter .75s ease ${delay}s`,
      willChange: 'opacity, transform, filter',
    }}>
      {children}
    </div>
  );
}

/* ── Phone frame — width drives everything, height from aspect-ratio ── */
function Phone({ src, alt = '', className = '' }: { src: string; alt?: string; className?: string }) {
  return (
    <div className={className} style={{
      /* height is derived from width via aspect-ratio — never compressed */
      aspectRatio: '402 / 874',
      borderRadius: '9%',
      background: '#0a0a0a',
      border: '1.5px solid rgba(255,255,255,0.1)',
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0,
      boxShadow: `0 0 0 1px rgba(255,255,255,0.04),
                  0 28px 80px rgba(0,0,0,0.8),
                  0 0 64px ${SIG_GLOW}`,
    }}>
      <img src={src} alt={alt} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
      {/* home bar */}
      <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
        width:'28%', height:'0.7%', minHeight:3, borderRadius:999, background:'rgba(255,255,255,0.22)' }}/>
    </div>
  );
}

/* ── Features ── */
const FEATURES = [
  { eyebrow:'AI Coach',           title:'A plan built\naround you.',       body:'Tell Synapse your goal — it generates a structured week-by-week program calibrated to your equipment, schedule, and history, then rewrites it as you grow stronger.', img:'/screeenshots/planner-page.jpg' },
  { eyebrow:'Workout Tracker',    title:'Every rep,\nevery set.',           body:'Live muscle-map highlights, YouTube form videos one tap away, and a fresh AI coach tip generated for each session. The gym, finally with an intelligent interface.', img:'/screeenshots/workout-tracker-1.png' },
  { eyebrow:'Progress Analytics', title:'Know what\'s\nactually working.',  body:'Plan vs. actual. AI-flagged deviations. Weight, hydration, and cardio trends in a single view. Not just a log — a real feedback loop.', img:'/screeenshots/sidebar-activeplans.jpg' },
  { eyebrow:'Trainer Studio',     title:'Your trainer,\nlive in the app.',  body:'Trainers manage every client, push plan updates in real time, and message athletes mid-session. The coaching relationship, finally fully digital.', img:'/screeenshots/ai-planner-generating.jpg' },
];

/* ── Marquee images ── */
const MQ = [
  '/screeenshots/workout-tracker-1.png',
  '/screeenshots/planner-page.jpg',
  '/screeenshots/ai-planner-generating.jpg',
  '/screeenshots/sidebar-activeplans.jpg',
  '/screeenshots/water-tracker%20.jpg',
  '/screeenshots/events.jpg',
];

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function LandingPage() {

  /* ── Sticky scroll: track active feature ── */
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
    /* overflow-x:clip does NOT break position:sticky (unlike overflow-x:hidden) */
    <div style={{ minHeight:'100vh', background:'#0a0a0a', color:'#fff', overflowX:'clip' }}>

      {/* ── Global keyframes ── */}
      <style jsx global>{`
        @keyframes snp {
          0%,100% { opacity:.18; transform:scale(.75); }
          50%      { opacity:.85; transform:scale(1.4); }
        }
        .snp { animation:snp 3.2s ease-in-out infinite; transform-origin:center; }

        /* Marquee rows */
        @keyframes mq  { from{transform:translateX(0)}   to{transform:translateX(-50%)} }
        @keyframes mq2 { from{transform:translateX(-50%)} to{transform:translateX(0)}   }
        .mq  { animation:mq  36s linear infinite; }
        .mq2 { animation:mq2 44s linear infinite; }

        /* Hero stagger */
        @keyframes heroUp {
          from { opacity:0; transform:translateY(32px); filter:blur(6px); }
          to   { opacity:1; transform:translateY(0);    filter:blur(0);   }
        }
        .hu { opacity:0; animation:heroUp .9s cubic-bezier(.22,1,.36,1) forwards; }

        /* Scroll cue */
        @keyframes scrollCue {
          0%,100% { transform:translateY(0); opacity:.3; }
          50%      { transform:translateY(9px); opacity:.6; }
        }
        .sc { animation:scrollCue 2.4s ease-in-out infinite; }

        html { scroll-behavior:smooth; }

        /* hide scrollbar */
        ::-webkit-scrollbar { width:0; height:0; }
      `}</style>

      {/* ── Fixed ambient layer ── */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <SynapseField/>
        <div style={{ position:'absolute', inset:0,
          background:`radial-gradient(ellipse 90% 50% at 50% 0%, ${SIG_GLOW} 0%, transparent 65%)` }}/>
      </div>

      {/* ════ NAV ════ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:50,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 32px',
        background:'rgba(10,10,10,0.85)',
        backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Logo size={28}/>
          <span style={{ fontFamily:'var(--font-hanalei-fill),system-ui', fontSize:13, fontWeight:500, letterSpacing:'.04em' }}>
            Synapse
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <a href="#features" style={{ color:'rgba(255,255,255,0.35)', fontSize:12, textDecoration:'none' }}
            onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
            onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.35)')}>
            Features
          </a>
          <button onClick={()=>signIn()} style={{
            padding:'8px 20px', borderRadius:999,
            background:'#fff', color:'#000', fontSize:12, fontWeight:700,
            border:'none', cursor:'pointer',
          }}
            onMouseEnter={e=>(e.currentTarget.style.opacity='.88')}
            onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
            Sign in
          </button>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section style={{
        position:'relative', zIndex:10,
        minHeight:'100vh',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        textAlign:'center', padding:'120px 24px 80px',
      }}>
        <div className="hu" style={{ animationDelay:'0s' }}><Logo size={148}/></div>
        <p className="hu" style={{ animationDelay:'.28s', fontSize:10, fontWeight:700,
          letterSpacing:'.32em', textTransform:'uppercase', color:SIG, marginTop:10 }}>
          Plan · Track · Analyze · Adapt
        </p>
        <h1 className="hu" style={{ animationDelay:'.46s',
          fontFamily:'var(--font-hanalei-fill),system-ui',
          fontSize:'clamp(40px,8vw,72px)', fontWeight:700,
          lineHeight:1.03, letterSpacing:'-.01em', maxWidth:680, marginTop:16 }}>
          Your AI fitness brain.
        </h1>
        <p className="hu" style={{ animationDelay:'.64s',
          color:'rgba(255,255,255,0.38)', fontSize:15, lineHeight:1.75,
          maxWidth:440, marginTop:18 }}>
          Synapse plans your training, reads your progress, and adapts in real time — with an optional trainer always in the loop.
        </p>
        <div className="hu" style={{ animationDelay:'.82s', display:'flex', gap:12, marginTop:32, flexWrap:'wrap', justifyContent:'center' }}>
          <button onClick={()=>signIn()} style={{
            padding:'14px 36px', borderRadius:16,
            background:'#fff', color:'#000', fontSize:13, fontWeight:700,
            border:'none', cursor:'pointer',
            boxShadow:`0 0 48px ${SIG_DIM}, 0 8px 24px rgba(0,0,0,0.4)`,
            transition:'all .2s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.opacity='.91';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.opacity='1';}}>
            Start training free
          </button>
          <a href="#features" style={{
            padding:'14px 36px', borderRadius:16,
            border:'1px solid rgba(255,255,255,0.1)',
            color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:500,
            textDecoration:'none', transition:'all .2s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.55)';}}>
            See features ↓
          </a>
        </div>
        <p className="hu" style={{ animationDelay:'1s',
          color:'rgba(255,255,255,0.13)', fontSize:10, letterSpacing:'.22em',
          textTransform:'uppercase', marginTop:26 }}>
          No credit card · PWA · Works offline
        </p>
        {/* Scroll cue */}
        <div className="sc" style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <div style={{ width:1, height:36, background:'linear-gradient(to bottom, transparent, rgba(255,255,255,0.22))' }}/>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
            <path d="M1 1l5 5 5-5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ════ STICKY FEATURE SCROLL ════
          Parent height = n × 100vh → inner is sticky → Apple iPhone page effect
          CRITICAL: no overflow on this section or any ancestor (using clip above)
      */}
      <section id="features" ref={stickyRef} style={{ position:'relative', zIndex:10, height:`${FEATURES.length * 100}vh` }}>
        <div style={{
          position:'sticky', top:0, height:'100vh',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'0 24px',
        }}>
          {/* Scan line accent at top of sticky area */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:1,
            background:`linear-gradient(90deg, transparent 0%, ${SIG} 40%, ${SIG} 60%, transparent 100%)`,
            opacity:.15,
          }}/>

          <div style={{
            width:'100%', maxWidth:960,
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',
            gap:48, alignItems:'center',
          }}>
            {/* LEFT — phone frame, cross-fades between screenshots */}
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
              {/* The container holds all phones stacked; only active one is visible */}
              <div style={{ position:'relative', width:'min(42vw, 220px)' }}>
                {/* Spacer so container has the right height (aspect ratio of phone) */}
                <div style={{ width:'100%', aspectRatio:'402/874', visibility:'hidden' }}/>
                {FEATURES.map((f,i) => (
                  <div key={i} style={{
                    position:'absolute', inset:0,
                    opacity: activeIdx===i ? 1 : 0,
                    transform: `scale(${activeIdx===i ? 1 : activeIdx>i ? .94 : .97}) translateY(${activeIdx===i ? 0 : activeIdx>i ? -20 : 20}px)`,
                    transition:'opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)',
                    pointerEvents: activeIdx===i ? 'auto' : 'none',
                  }}>
                    {/* Phone fills its absolute container — aspect-ratio is inherited from spacer */}
                    <div style={{ width:'100%', height:'100%', aspectRatio:'402/874',
                      borderRadius:'9%', background:'#0a0a0a',
                      border:'1.5px solid rgba(255,255,255,0.1)', overflow:'hidden',
                      boxShadow:`0 0 0 1px rgba(255,255,255,0.04), 0 28px 80px rgba(0,0,0,0.8), 0 0 64px ${SIG_GLOW}`,
                    }}>
                      <img src={f.img} alt={f.eyebrow} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
                      <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
                        width:'28%', height:4, borderRadius:999, background:'rgba(255,255,255,0.22)' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — feature text, cross-fades */}
            <div>
              {/* Step progress bars */}
              <div style={{ display:'flex', gap:6, marginBottom:36 }}>
                {FEATURES.map((_,i) => (
                  <div key={i} style={{
                    flex:1, height:2, borderRadius:999,
                    background: i<=activeIdx ? SIG : 'rgba(255,255,255,0.1)',
                    opacity: i===activeIdx ? 1 : i<activeIdx ? 0.55 : 0.25,
                    transition:'all .5s ease',
                  }}/>
                ))}
              </div>
              {/* Text panels stacked, cross-fade */}
              <div style={{ position:'relative', height:240 }}>
                {FEATURES.map((f,i) => (
                  <div key={i} style={{
                    position:'absolute', top:0, left:0, right:0,
                    opacity: activeIdx===i ? 1 : 0,
                    transform: `translateY(${activeIdx===i ? 0 : activeIdx>i ? -16 : 16}px)`,
                    transition:'opacity .55s ease, transform .6s cubic-bezier(.22,1,.36,1)',
                    pointerEvents: activeIdx===i ? 'auto' : 'none',
                  }}>
                    <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:SIG, marginBottom:14 }}>
                      {f.eyebrow}
                    </p>
                    <h2 style={{ fontSize:'clamp(26px,3.5vw,40px)', fontWeight:700, lineHeight:1.08, whiteSpace:'pre-line', marginBottom:18 }}>
                      {f.title}
                    </h2>
                    <p style={{ color:'rgba(255,255,255,0.38)', fontSize:14, lineHeight:1.78, maxWidth:360 }}>
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
        <section style={{ position:'relative', zIndex:10, padding:'60px 0', overflow:'hidden' }}>
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.05) 30%,rgba(255,255,255,0.05) 70%,transparent)', marginBottom:20 }}/>
          <div className="mq" style={{ display:'flex', gap:12, width:'max-content', marginBottom:12 }}>
            {[...MQ,...MQ].map((src,i) => (
              <div key={i} style={{ width:110, aspectRatio:'402/874', borderRadius:14, overflow:'hidden',
                border:'1px solid rgba(255,255,255,0.06)', flexShrink:0, background:'#111' }}>
                <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.65 }}/>
              </div>
            ))}
          </div>
          <div className="mq2" style={{ display:'flex', gap:12, width:'max-content' }}>
            {[...[...MQ].reverse(),...[...MQ].reverse()].map((src,i) => (
              <div key={i} style={{ width:110, aspectRatio:'402/874', borderRadius:14, overflow:'hidden',
                border:'1px solid rgba(255,255,255,0.06)', flexShrink:0, background:'#111' }}>
                <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.5 }}/>
              </div>
            ))}
          </div>
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.05) 30%,rgba(255,255,255,0.05) 70%,transparent)', marginTop:20 }}/>
        </section>
      </Reveal>

      {/* ════ STATS ════ */}
      <Reveal delay={0} style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'80px 24px', maxWidth:900, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:40, textAlign:'center' }}>
            {[
              { n:'< 2', u:'min', l:'to generate your first plan' },
              { n:'6',   u:'+',   l:'health tracking modules' },
              { n:'100', u:'%',   l:'offline-capable PWA' },
              { n:'∞',   u:'',    l:'AI plan adaptations' },
            ].map((s,i) => (
              <div key={i}>
                <div style={{ fontSize:'clamp(34px,5vw,52px)', fontWeight:700, letterSpacing:'-.02em', lineHeight:1 }}>
                  {s.n}<span style={{ color:SIG, fontSize:'.65em' }}>{s.u}</span>
                </div>
                <p style={{ color:'rgba(255,255,255,0.26)', fontSize:12, marginTop:10, lineHeight:1.55 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ════ AUTOPLAY VIDEO ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'80px 24px', maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:SIG, marginBottom:14 }}>In Motion</p>
            <h2 style={{ fontSize:'clamp(24px,4vw,38px)', fontWeight:700, lineHeight:1.1 }}>Watch it come together.</h2>
          </div>
          {/* phone frame — same style as features section */}
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ width:'min(42vw, 220px)', aspectRatio:'402/874', borderRadius:'9%',
              background:'#0a0a0a', border:'1.5px solid rgba(255,255,255,0.1)', overflow:'hidden',
              position:'relative', flexShrink:0,
              boxShadow:`0 0 0 1px rgba(255,255,255,0.04), 0 28px 80px rgba(0,0,0,0.8), 0 0 64px ${SIG_GLOW}`,
            }}>
              <video
                src="/videos/compressed-Sequence%2002%20(1).mp4"
                autoPlay muted loop playsInline
                style={{ width:'100%', height:'100%', display:'block', objectFit:'cover' }}
              />
              {/* gradient overlay top+bottom */}
              <div style={{ position:'absolute', inset:0, pointerEvents:'none',
                background:'linear-gradient(to bottom, rgba(10,10,10,.5) 0%, transparent 20%, transparent 80%, rgba(10,10,10,.5) 100%)' }}/>
              {/* home bar */}
              <div style={{ position:'absolute', bottom:'2%', left:'50%', transform:'translateX(-50%)',
                width:'28%', height:4, borderRadius:999, background:'rgba(255,255,255,0.22)' }}/>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════ CARDIO CAROUSEL ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'80px 24px', maxWidth:900, margin:'0 auto' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:48 }}>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:SIG, marginBottom:14 }}>
                Cardio Monitor
              </p>
              <h2 style={{ fontSize:'clamp(24px,4vw,38px)', fontWeight:700, lineHeight:1.1, marginBottom:16 }}>
                6 colorways. One monitor.
              </h2>
              <p style={{ color:'rgba(255,255,255,0.38)', fontSize:14, lineHeight:1.7, maxWidth:380, margin:'0 auto' }}>
                Every chart, metric, and label updates seamlessly as themes cycle.
              </p>
            </div>
            <CardioCarousel/>
          </div>
        </section>
      </Reveal>

      {/* ════ SCREENSHOT COLLAGE ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'80px 24px', maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:SIG, marginBottom:14 }}>
              The full experience
            </p>
            <h2 style={{ fontSize:'clamp(24px,4vw,38px)', fontWeight:700, lineHeight:1.1 }}>
              Every screen. Every feature.
            </h2>
          </div>
          <ScreenshotCollage/>
        </section>
      </Reveal>

      {/* ════ NETWORK ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'80px 24px 100px', maxWidth:640, margin:'0 auto', textAlign:'center' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:SIG, marginBottom:14 }}>
            The signal network
          </p>
          <h2 style={{ fontSize:'clamp(24px,4vw,38px)', fontWeight:700, lineHeight:1.12, marginBottom:64 }}>
            One plan.<br/>Three nodes. Always in sync.
          </h2>
          <div style={{ position:'relative', maxWidth:380, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 380 80" preserveAspectRatio="none">
              <line x1="50" y1="40" x2="190" y2="40" stroke={SIG} strokeOpacity=".18" strokeWidth="1" strokeDasharray="5 6"/>
              <line x1="190" y1="40" x2="330" y2="40" stroke={SIG} strokeOpacity=".18" strokeWidth="1" strokeDasharray="5 6"/>
              <circle cx="120" cy="40" r="4" fill={SIG} opacity=".7" className="snp"/>
              <circle cx="260" cy="40" r="4" fill={SIG} opacity=".7" className="snp" style={{ animationDelay:'.8s' }}/>
            </svg>
            {[
              { l:'Trainer', s:'builds & adjusts', a:false },
              { l:'Synapse', s:'AI engine',         a:true  },
              { l:'Athlete', s:'trains & tracks',   a:false },
            ].map(n => (
              <div key={n.l} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
                <div style={{
                  width:64, height:64, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:`1px solid ${n.a ? SIG+'70' : 'rgba(255,255,255,0.1)'}`,
                  background: n.a ? SIG_DIM : 'rgba(255,255,255,0.03)',
                  boxShadow: n.a ? `0 0 28px ${SIG_GLOW}` : 'none',
                }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background: n.a ? SIG : 'rgba(255,255,255,0.2)' }}
                    className={n.a ? 'snp' : ''}/>
                </div>
                <p style={{ fontSize:12, fontWeight:600 }}>{n.l}</p>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.26)' }}>{n.s}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ════ FEATURE GRID ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{ padding:'80px 24px', maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:SIG, marginBottom:14 }}>
              Everything included
            </p>
            <h2 style={{ fontSize:'clamp(24px,4vw,38px)', fontWeight:700, lineHeight:1.1 }}>Built like a fitness OS.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
            {[
              ['Progress','Plan vs. actual','Daily check-ins vs your plan, AI-flagged deviations, and what to do about them.'],
              ['Activity','Strava synced','Runs, rides, and swims import automatically — no manual cardio logging.'],
              ['Hydration','Water tracker','Configurable reminders and streaks keep hydration from being what you forget.'],
              ['Live','Real-time chat','Trainer-client messaging with push notifications, even when the app is closed.'],
              ['Nutrition','Meal & weight log','Set a plain-language goal — "lose 5kg in 2 months" — and track toward it.'],
              ['Anywhere','Installs like an app','Real PWA: offline-capable, push notifications, no app store required.'],
            ].map(([label,title,desc],i) => (
              <Reveal key={label} delay={i * 0.06} style={{ borderRadius:20, background:'rgba(255,255,255,0.025)',
                border:'1px solid rgba(255,255,255,0.06)', padding:'20px 22px', transition:'background .2s' }}
                className="">
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.22em', textTransform:'uppercase', color:SIG, marginBottom:10 }}>
                  {label}
                </p>
                <p style={{ color:'#fff', fontWeight:600, fontSize:14, marginBottom:8 }}>{title}</p>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, lineHeight:1.65 }}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ════ FINAL CTA ════ */}
      <Reveal style={{ position:'relative', zIndex:10 }}>
        <section style={{
          padding:'100px 24px 120px',
          textAlign:'center',
          display:'flex', flexDirection:'column', alignItems:'center',
          position:'relative',
        }}>
          {/* Signal rings */}
          {[480,300,160].map((size,i) => (
            <div key={size} style={{
              position:'absolute', top:'50%', left:'50%',
              transform:'translate(-50%,-50%)',
              width:size, height:size, borderRadius:'50%',
              border:`1px solid ${SIG}`,
              opacity: 0.04 + i * 0.03,
              pointerEvents:'none',
            }}/>
          ))}
          <Logo size={100}/>
          <h2 style={{ fontSize:'clamp(26px,5vw,44px)', fontWeight:700, lineHeight:1.1, marginTop:24 }}>
            Your first plan is<br/>two minutes away.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.28)', fontSize:14, marginTop:14, maxWidth:320 }}>
            Sign in, describe your goal, and Synapse builds the rest.
          </p>
          <button onClick={()=>signIn()} style={{
            marginTop:36, padding:'16px 48px', borderRadius:18,
            background:'#fff', color:'#000', fontSize:14, fontWeight:700,
            border:'none', cursor:'pointer', transition:'all .2s',
            boxShadow:`0 0 64px ${SIG_DIM}, 0 12px 40px rgba(0,0,0,0.5)`,
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.opacity='.91';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';  e.currentTarget.style.opacity='1';}}>
            Get started — it's free
          </button>
        </section>
      </Reveal>

      {/* ════ FOOTER ════ */}
      <footer style={{
        position:'relative', zIndex:10,
        borderTop:'1px solid rgba(255,255,255,0.04)',
        padding:'28px 24px', textAlign:'center',
      }}>
        <p style={{ color:'rgba(255,255,255,0.12)', fontSize:10, letterSpacing:'.25em', textTransform:'uppercase' }}>
          Synapse · Plan · Track · Analyze · Adapt
        </p>
      </footer>

    </div>
  );
}