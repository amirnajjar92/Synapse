'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import SynapseFitLogo from '@/components/SynapseFitLogo';

const FEATURES = [
  {
    id: 'ai-coach',
    title: 'AI-Powered Coach',
    desc: 'Describe your goal in plain English — "Build muscle in 8 weeks" or "Lose 10kg" — and Synapse generates a structured workout plan instantly.',
    screenshot: '/screenshots/pages/planner.png',
    bullets: ['Natural language plan generation', 'Multi-provider AI (OpenAI + Claude)', 'Modify plans by chatting with your coach'],
  },
  {
    id: 'workout-tracker',
    title: 'Smart Workout Tracker',
    desc: 'Follow your plan day by day with interactive exercise lists, muscle anatomy maps, and AI-powered coaching tips.',
    screenshot: '/screenshots/pages/workout-tracker.png',
    bullets: ['Day-by-day navigation with exercise checkboxes', '3D muscle map highlights (front/back, men/women)', 'AI coach tips based on your progress', 'Exercise video search from YouTube'],
  },
  {
    id: 'progress',
    title: 'Progress & Analytics',
    desc: 'Track every metric that matters. Daily check-ins, weight trends, and AI-powered analysis keep you accountable.',
    screenshot: '/screenshots/pages/plan-progress-tracker.png',
    bullets: ['Daily mood, sleep, energy, and soreness tracking', 'Weight trend visualization', 'AI analysis of your check-in entries', 'PDF export of full progress reports'],
  },
  {
    id: 'training-studio',
    title: 'Trainer Platform',
    desc: 'Personal trainers manage clients, assign plans, and communicate in real-time — all from one dashboard.',
    screenshot: '/screenshots/pages/training-studio-dashboard.png',
    bullets: ['Client management with invitation system', 'Real-time 1-on-1 chat with Pusher', 'Push notifications for new messages', 'Plan assignment and progress oversight'],
  },
  {
    id: 'health',
    title: 'All-in-One Health',
    desc: 'Hydration tracking, nutrition logging, Strava activity import, and smart reminders — everything in one place.',
    screenshot: '/screenshots/pages/water-tracker.png',
    bullets: ['Water tracker with streak history', 'Meal logging and calorie tracking', 'Strava activity import (runs, rides, swims)', 'Customizable reminder schedules'],
  },
  {
    id: 'pwa',
    title: 'Install Anywhere',
    desc: 'Synapse is a Progressive Web App — install it on your homescreen, get push notifications, and use it offline.',
    screenshot: '/screenshots/pages/reminders.png',
    bullets: ['Install on iOS, Android, or Desktop', 'Push notifications for workouts and messages', 'Offline-capable with service worker', 'Dark mode, gesture-driven UI'],
  },
];

function ScreenshotFrame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className={`relative ${className}`} style={{ width: 280, height: 580 }}>
      <div className="absolute inset-0 rounded-[28px] border-[3px] border-zinc-700 shadow-2xl shadow-orange-500/5 overflow-hidden bg-black">
        <div className="h-7 bg-black flex items-center justify-between px-4 text-[10px] text-white/30">
          <span className="font-semibold">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="9" viewBox="0 0 18 12" className="text-white/30"><rect x="0.5" y="0.5" width="17" height="11" rx="1.5" stroke="currentColor" fill="none"/><line x1="3.5" y1="6" x2="7.5" y2="6" stroke="currentColor" strokeWidth="0.8"/><line x1="9" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="0.8"/></svg>
            <svg width="10" height="9" viewBox="0 0 14 12" className="text-white/30"><path d="M1 8l4-6 4 6H1z" fill="none" stroke="currentColor"/><path d="M7 6l3-4 3 4H7z" fill="none" stroke="currentColor"/></svg>
          </div>
        </div>
        {!error ? (
          <img
            src={src}
            alt={alt}
            className={`w-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ height: 'calc(100% - 28px)', objectFit: 'cover', objectPosition: 'top' }}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full" style={{ height: 'calc(100% - 28px)' }}>
            <div className="text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 mx-auto mb-3 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FC4C02" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <p className="text-white/40 text-[10px]">Run screenshots:capture</p>
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-zinc-700/50" />
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSignIn = useCallback(async () => {
    setIsSigningIn(true);
    try {
      await signIn('google', { callbackUrl: '/planner' });
    } catch {
      setIsSigningIn(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(252,76,2,0.06)_0%,transparent_70%)]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.04)_0%,transparent_70%)]" />
        </div>
        <div className={`relative z-10 flex flex-col items-center text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-8">
            <SynapseFitLogo size={180} loading={false} accentInk="#FFFFFF" />
          </div>
          <p className="text-[#FC4C02] text-sm font-semibold tracking-[0.3em] uppercase mb-4">Plan. Track. Analyze. Adapt.</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Your AI Fitness Brain</h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
            Generate personalized workout plans, track every rep, get AI-powered coaching,
            and connect with your trainer — all in one beautifully dark app.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleSignIn} disabled={isSigningIn}
              className="px-8 py-3.5 rounded-2xl bg-[#FC4C02] hover:bg-[#e04302] text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/20">
              {isSigningIn ? 'Signing in...' : 'Get Started Free'}
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-2xl border border-white/10 hover:bg-white/5 text-white/80 font-medium text-sm transition-all">
              See Features
            </button>
          </div>
        </div>
        <div className={`absolute bottom-8 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="animate-bounce opacity-30"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Describe Your Goal', desc: 'Type a goal like "Build muscle in 8 weeks" or "Run a 5K". Our AI generates a complete workout plan tailored to you.', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
              { step: '02', title: 'Track Your Progress', desc: 'Follow your plan day by day. Check off exercises, log water, track weight, and record how you feel after every session.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { step: '03', title: 'Evolve With AI', desc: 'Get daily coach tips, weekly AI analysis, and modify your plan anytime. The more you use it, the smarter it gets.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FC4C02" strokeWidth="1.5" strokeLinecap="round"><path d={item.icon}/></svg>
                </div>
                <div className="text-[#FC4C02] text-xs font-bold tracking-widest mb-2">{item.step}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/5">
        {FEATURES.map((feature, i) => (
          <div key={feature.id} className={`py-20 sm:py-24 ${i % 2 === 0 ? 'bg-white/[0.015]' : ''}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-8">
              <div className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
                <div className="flex-shrink-0">
                  <ScreenshotFrame src={feature.screenshot} alt={feature.title} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-2xl sm:text-3xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-6">{feature.desc}</p>
                  <ul className="space-y-2.5">
                    {feature.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-zinc-300 text-sm">
                        <svg className="mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FC4C02" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {i < FEATURES.length - 1 && <div className="max-w-6xl mx-auto mt-20 px-4 sm:px-8"><div className="h-px bg-white/5" /></div>}
          </div>
        ))}
      </section>

      {/* Tech */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Built With Modern Tech</h2>
          <p className="text-zinc-400 text-sm mb-12">Full-stack React, PostgreSQL, AI, and real-time messaging</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Next.js 16', sub: 'React / SSR / PWA' },
              { label: 'PostgreSQL', sub: 'Prisma / Vercel' },
              { label: 'OpenAI + Claude', sub: 'Multi-provider AI' },
              { label: 'Pusher', sub: 'Real-time chat' },
              { label: 'Google OAuth', sub: 'Secure sign-in' },
              { label: 'Strava API', sub: 'Activity import' },
              { label: 'Web Push API', sub: 'Notifications' },
              { label: 'Tailwind CSS', sub: 'Dark mode UI' },
            ].map((tech) => (
              <div key={tech.label} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                <p className="text-white font-semibold text-sm">{tech.label}</p>
                <p className="text-zinc-500 text-[11px] mt-1">{tech.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Training?</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">Join Synapse and experience the future of AI-powered fitness tracking.</p>
          <button onClick={handleSignIn} disabled={isSigningIn}
            className="px-10 py-4 rounded-2xl bg-[#FC4C02] hover:bg-[#e04302] text-white font-semibold text-base transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/20">
            {isSigningIn ? 'Signing in...' : 'Get Started Free'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-center gap-3">
          <SynapseFitLogo size={20} loading={false} accentInk="#FFFFFF" />
          <span className="text-white/30 text-xs">Synapse — AI-Powered Fitness Tracking</span>
        </div>
      </footer>
    </div>
  );
}
