'use client';

import { useState, useEffect, useCallback } from 'react';

interface Trainer {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Invitation {
  id: string;
  trainerId: string;
  clientEmail: string;
  status: string;
  createdAt: string;
  trainer: Trainer;
}

interface InvitationBellProps {
  userEmail: string;
}

export default function InvitationBell({ userEmail }: InvitationBellProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(`/api/training/invitations?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchInvitations();
    const interval = setInterval(fetchInvitations, 30000);
    return () => clearInterval(interval);
  }, [fetchInvitations]);

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const response = await fetch(`/api/training/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, status: 'ACCEPTED' }),
      });
      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const response = await fetch(`/api/training/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, status: 'DECLINED' }),
      });
      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200 w-full relative"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium leading-tight">Invitations</p>
          <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">
            {invitations.length} pending
          </p>
        </div>
        <span className="absolute top-2 right-3 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {invitations.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 mx-4 bg-black border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
          <div className="p-3 border-b border-white/10">
            <p className="text-white/60 text-xs font-medium">Training Invitations</p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {invitations.map(inv => (
              <div key={inv.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FC4C02]/30 to-orange-500/30 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 border border-white/10">
                    {inv.trainer.name?.charAt(0) || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">
                      {inv.trainer.name || 'Trainer'}
                    </p>
                    <p className="text-white/40 text-[10px] truncate">
                      wants to be your coach
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleAccept(inv.id)}
                    disabled={processingId === inv.id}
                    className="flex-1 py-1.5 bg-[#FC4C02] hover:bg-[#FC4C02]/80 disabled:opacity-50 text-white text-[11px] font-medium rounded-lg transition-all"
                  >
                    {processingId === inv.id ? '...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleDecline(inv.id)}
                    disabled={processingId === inv.id}
                    className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white/60 text-[11px] font-medium rounded-lg transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
