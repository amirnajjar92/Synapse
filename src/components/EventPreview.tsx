'use client';

import { useEffect, useRef } from 'react';
import MapDisplay from './MapDisplay';

interface EventPreviewProps {
  event: {
    title: string;
    description: string | null;
    date: string;
    location: string | null;
    locationLat: number | null;
    locationLng: number | null;
    maxParticipants: string | number | null;
    hostedBy: string | null;
    coverImage: string | null;
    sponsors: { name: string; logo: string }[];
    instagramLink: string | null;
    facebookLink: string | null;
    twitterLink: string | null;
    websiteLink: string | null;
  };
  onClose: () => void;
  onConfirm?: () => void;
  isCreating?: boolean;
}

export default function EventPreview({ event, onClose, onConfirm, isCreating = false }: EventPreviewProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const socialLinks = [
    { icon: 'instagram', url: event.instagramLink, color: '#E4405F' },
    { icon: 'facebook', url: event.facebookLink, color: '#1877F2' },
    { icon: 'twitter', url: event.twitterLink, color: '#1DA1F2' },
    { icon: 'website', url: event.websiteLink, color: '#6B7280' },
  ].filter(link => link.url);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Event Preview</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {event.coverImage && (
          <div className="relative w-full h-64 overflow-hidden">
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="px-5 py-6 space-y-5">
          {/* Title & Description */}
          <div>
            <h1 className="text-white font-bold text-2xl mb-2">{event.title}</h1>
            {event.description && (
              <p className="text-white/60 text-sm leading-relaxed">{event.description}</p>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-white/40 text-xs mb-0.5">Date & Time</p>
                <p className="text-white text-sm font-medium">{formatDate(event.date)}</p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-white/40 text-xs mb-0.5">Location</p>
                  <p className="text-white text-sm">{event.location}</p>
                  {event.locationLat && event.locationLng && (
                    <div className="mt-2">
                      <MapDisplay
                        lat={event.locationLat}
                        lng={event.locationLng}
                        address={event.location}
                        height={160}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Max Participants */}
            {event.maxParticipants && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-white/40 text-xs mb-0.5">Max Participants</p>
                  <p className="text-white text-sm">{event.maxParticipants} people</p>
                </div>
              </div>
            )}

            {/* Hosted By */}
            {event.hostedBy && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-white/40 text-xs mb-0.5">Hosted By</p>
                  <p className="text-white text-sm font-medium">{event.hostedBy}</p>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">Connect</p>
              <div className="flex items-center gap-2 flex-wrap">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2 group"
                    style={{ '--hover-color': link.color } as any}
                  >
                    {link.icon === 'instagram' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 group-hover:text-[#E4405F] transition-colors">
                        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                      </svg>
                    )}
                    {link.icon === 'facebook' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 group-hover:text-[#1877F2] transition-colors">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    {link.icon === 'twitter' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 group-hover:text-[#1DA1F2] transition-colors">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    )}
                    {link.icon === 'website' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white transition-colors">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    )}
                    <span className="text-white/60 group-hover:text-white text-xs font-medium transition-colors capitalize">{link.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sponsors */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">Sponsored By</p>
              <div className="flex flex-wrap gap-3">
                {event.sponsors.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                    {s.logo && (
                      <img
                        src={s.logo}
                        alt={s.name}
                        className="w-6 h-6 object-contain rounded"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <span className="text-white/70 text-sm font-medium">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/10 px-5 py-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all"
            >
              {onConfirm ? 'Cancel' : 'Close'}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={isCreating}
                className="flex-1 py-3 bg-[#FC4C02] hover:bg-[#FC4C02]/80 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
              >
                {isCreating ? 'Creating...' : 'Create Event'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
