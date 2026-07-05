'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import MapDisplay from '@/components/MapDisplay';

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface EventEngagement {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  user: UserInfo | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guestLinks: string | null;
}

interface SportEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  locationLat: number | null;
  locationLng: number | null;
  maxParticipants: number | null;
  hostedBy: string | null;
  coverImage: string | null;
  sponsors: string | null;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  creator: UserInfo;
  engagements: EventEngagement[];
}

const Spinner = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/20 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
);

export default function SportEventPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<SportEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isEngaged, setIsEngaged] = useState(false);
  const [myEngagement, setMyEngagement] = useState<EventEngagement | null>(null);
  const [copied, setCopied] = useState(false);

  // Guest form state
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestLinks, setGuestLinks] = useState('');
  const [isJoiningGuest, setIsJoiningGuest] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/sport-events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event);
        }
      } catch (e) {
        console.error('Error loading event:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  useEffect(() => {
    const userStr = localStorage.getItem('synapse_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserEmail(user.email);
      setUserName(user.name);
      setIsSignedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!event || !userEmail) return;
    const engagement = event.engagements.find(e => e.user?.email === userEmail);
    if (engagement) {
      setMyEngagement(engagement);
      setIsEngaged(engagement.status !== 'DECLINED');
    }
  }, [event, userEmail]);

  const handleEngage = async () => {
    if (!userEmail) return;
    if (isEngaged && myEngagement) {
      const res = await fetch(`/api/sport-events/${eventId}/engage?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsEngaged(false);
        setMyEngagement(null);
        setEvent(prev => prev ? {
          ...prev,
          engagements: prev.engagements.filter(e => e.user?.email !== userEmail),
        } : null);
      }
    } else {
      const res = await fetch(`/api/sport-events/${eventId}/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setMyEngagement(data.engagement);
        setIsEngaged(true);
        setEvent(prev => prev ? {
          ...prev,
          engagements: [...prev.engagements.filter(e => e.user?.email !== userEmail), data.engagement],
        } : null);
      }
    }
  };

  const handleGuestJoin = async () => {
    if (!guestEmail) return;
    setIsJoiningGuest(true);
    try {
      const res = await fetch(`/api/sport-events/${eventId}/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestEmail, guestPhone, guestLinks }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvent(prev => prev ? {
          ...prev,
          engagements: [...prev.engagements, data.engagement],
        } : null);
        setShowGuestForm(false);
        setGuestEmail('');
        setGuestPhone('');
        setGuestLinks('');
      }
    } catch (e) {
      console.error('Error joining as guest:', e);
    } finally {
      setIsJoiningGuest(false);
    }
  };

  const handleApproveDecline = async (engagementId: string, newStatus: 'APPROVED' | 'DECLINED') => {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/sport-events/${eventId}/engage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, engagementId, status: newStatus, isApproval: true }),
      });
      if (res.ok) {
        setEvent(prev => prev ? {
          ...prev,
          engagements: prev.engagements.map(e =>
            e.id === engagementId ? { ...e, status: newStatus } : e
          ),
        } : null);
      }
    } catch (e) {
      console.error('Error updating engagement:', e);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-[402px] bg-black rounded-[40px] overflow-hidden shadow-2xl relative">
          <div className="relative z-10" style={{ backgroundColor: '#0b0b0b4D' }}>
            <div className="px-5 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-28 bg-white/10 rounded animate-pulse mb-1" />
                </div>
              </div>
            </div>
            <div className="w-full h-40 sm:h-48 bg-white/5 animate-pulse" />
            <div className="px-4 pb-4 space-y-4">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <div className="h-6 w-48 bg-white/10 rounded animate-pulse mb-3" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse mb-2" />
                <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                    <div className="h-3 w-40 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                    <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                    <div className="h-3 w-36 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <div className="h-10 w-full bg-white/10 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-4">
        <div className="text-white/50 text-sm">Event not found</div>
      </div>
    );
  }

  const approvedCount = event.engagements.filter(e => e.status === 'APPROVED').length;
  const totalEngaged = event.engagements.filter(e => e.status !== 'DECLINED').length;
  const isFull = event.maxParticipants ? totalEngaged >= event.maxParticipants : false;
  const isCreator = userEmail === event.creator.email;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="w-full min-h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-[402px] bg-black rounded-[40px] overflow-hidden shadow-2xl relative">
        <div className="relative z-10" style={{ backgroundColor: '#0b0b0b4D' }}>
          <div className="px-5 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FC4C02] to-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 16 16 12 12 8" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-tight">Sport Event</h1>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="p-2 text-white/40 hover:text-white transition-colors"
                aria-label="Share event"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-xs mt-2 text-center">Link copied to clipboard!</p>
            )}
          </div>

          {event.coverImage && (
            <div className="relative w-full h-40 sm:h-48 overflow-hidden">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              {event.status === 'ACTIVE' && !isPast && (
                <div className="absolute bottom-3 right-3 z-[1]">
                  {!isSignedIn ? (
                    <button
                      onClick={() => { setIsSigningIn(true); signIn('google', { callbackUrl: window.location.href }); }}
                      disabled={isSigningIn}
                      className="px-5 py-2.5 bg-[#FC4C02] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                    >
                      {isSigningIn ? '...' : 'Join'}
                    </button>
                  ) : !isEngaged ? (
                    <button
                      onClick={handleEngage}
                      disabled={isFull}
                      className="px-5 py-2.5 bg-[#FC4C02] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                    >
                      {isFull ? 'Event Full' : 'Join'}
                    </button>
                  ) : myEngagement?.status === 'PENDING' ? (
                    <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-xl shadow-lg">Pending</span>
                  ) : myEngagement?.status === 'APPROVED' ? (
                    <span className="px-4 py-2 bg-green-500/20 text-green-400 text-xs font-medium rounded-xl shadow-lg">Joined</span>
                  ) : null}
                </div>
              )}
            </div>
          )}

          <div className="px-4 pb-4 space-y-4">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <div className="flex items-start gap-2 mb-3">
                <h2 className="text-white font-bold text-xl leading-tight flex-1">{event.title}</h2>
                {event.status === 'CANCELLED' && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-medium rounded-full">Cancelled</span>
                )}
                {event.status === 'COMPLETED' && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-medium rounded-full">Completed</span>
                )}
              </div>

              {event.description && (
                <p className="text-white/60 text-sm leading-relaxed mb-4">{event.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{formatDate(event.date)}</p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <p className="text-white text-sm flex-1">{event.location}</p>
                  </div>
                )}
                {event.locationLat && event.locationLng && (
                  <MapDisplay
                    lat={event.locationLat}
                    lng={event.locationLng}
                    address={event.location || ''}
                    height={160}
                  />
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-xs">
                    Created by <span className="text-white font-medium">{event.creator.name || event.creator.email}</span>
                  </p>
                </div>

                {event.hostedBy && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <p className="text-white text-xs">
                      Hosted by <span className="text-white font-medium">{event.hostedBy}</span>
                    </p>
                  </div>
                )}
              </div>
              {event.sponsors && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-3">Sponsored By</p>
                  <div className="flex flex-wrap gap-3">
                    {(() => {
                      try {
                        const list = JSON.parse(event.sponsors);
                        return Array.isArray(list) && list.map((s: { name: string; logo?: string }, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                            {s.logo && (
                              <img
                                src={s.logo}
                                alt={s.name}
                                className="w-5 h-5 object-contain rounded"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                            <span className="text-white/70 text-xs font-medium">{s.name}</span>
                          </div>
                        ));
                      } catch {
                        return <span className="text-white/40 text-xs">{event.sponsors}</span>;
                      }
                    })()}
                  </div>
                </div>
              )}
              {/* Social Media Links */}
              {((event as any).instagramLink || (event as any).facebookLink || (event as any).twitterLink || (event as any).websiteLink) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-3">Connect</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(event as any).instagramLink && (
                      <a
                        href={(event as any).instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2 group"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 group-hover:text-[#E4405F] transition-colors">
                          <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                        </svg>
                        <span className="text-white/60 group-hover:text-white text-xs font-medium transition-colors">Instagram</span>
                      </a>
                    )}
                    {(event as any).facebookLink && (
                      <a
                        href={(event as any).facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2 group"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 group-hover:text-[#1877F2] transition-colors">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-white/60 group-hover:text-white text-xs font-medium transition-colors">Facebook</span>
                      </a>
                    )}
                    {(event as any).twitterLink && (
                      <a
                        href={(event as any).twitterLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2 group"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 group-hover:text-[#1DA1F2] transition-colors">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        <span className="text-white/60 group-hover:text-white text-xs font-medium transition-colors">Twitter</span>
                      </a>
                    )}
                    {(event as any).websiteLink && (
                      <a
                        href={(event as any).websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2 group"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white transition-colors">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span className="text-white/60 group-hover:text-white text-xs font-medium transition-colors">Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>


            {/* Join button at bottom - only when no cover image */}
            {!event.coverImage && event.status === 'ACTIVE' && !isPast && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                {!isSignedIn && !showGuestForm ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => { setIsSigningIn(true); signIn('google', { callbackUrl: window.location.href }); }}
                      disabled={isSigningIn}
                      className="w-full py-2.5 bg-white text-black font-semibold text-sm rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSigningIn ? <Spinner size={16} /> : 'Sign in to join'}
                    </button>
                    <button
                      onClick={() => setShowGuestForm(true)}
                      className="w-full py-2.5 bg-white/10 text-white font-semibold text-sm rounded-xl hover:bg-white/20 transition-all"
                    >
                      Join as Guest
                    </button>
                  </div>
                ) : showGuestForm && !isSignedIn ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-xs mb-1 block">Email *</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FC4C02]/50"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs mb-1 block">Phone (optional)</label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={e => setGuestPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FC4C02]/50"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs mb-1 block">Social link (optional)</label>
                      <input
                        type="url"
                        value={guestLinks}
                        onChange={e => setGuestLinks(e.target.value)}
                        placeholder="instagram.com/username"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FC4C02]/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowGuestForm(false)}
                        className="flex-1 py-2.5 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGuestJoin}
                        disabled={!guestEmail || isJoiningGuest}
                        className="flex-1 py-2.5 bg-[#FC4C02] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isJoiningGuest ? <Spinner size={16} /> : 'Join'}
                      </button>
                    </div>
                  </div>
                ) : !isEngaged ? (
                  <button
                    onClick={handleEngage}
                    disabled={isFull}
                    className="w-full py-2.5 bg-[#FC4C02] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isFull ? 'Event Full' : 'Join Event'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    {myEngagement?.status === 'PENDING' && (
                      <p className="text-yellow-400/60 text-xs text-center">Waiting for host approval...</p>
                    )}
                    {myEngagement?.status === 'APPROVED' && (
                      <div className="bg-green-500/20 text-green-400 text-xs text-center py-2 rounded-lg font-medium">You're in!</div>
                    )}
                    <button
                      onClick={handleEngage}
                      className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition-all"
                    >
                      Leave Event
                    </button>
                  </div>
                )}
              </div>
            )}

            {isPast && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
                <p className="text-white/40 text-sm">This event has already passed.</p>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="text-white/30 hover:text-white text-xs transition-colors flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
