'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import WorkoutPlanDetail from '@/components/WorkoutPlanDetail';
import { exportPlanToPDF } from '@/lib/pdfExport';

interface Plan {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  tables: any[];
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

export default function WorkoutDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);

  // Fetch plan from API
  useEffect(() => {
    const fetchPlan = async () => {
      if (!id || typeof id !== 'string') return;

      const userStr = localStorage.getItem('synapse_user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      try {
        const url = new URL(`/api/plans/${id}`, window.location.origin);
        if (user?.email) {
          url.searchParams.set('email', user.email);
        }
        const finalResponse = await fetch(url.toString());
        
        if (!finalResponse.ok) {
          throw new Error('Failed to fetch plan');
        }
        const data = await finalResponse.json();
        const planData: Plan = data.plan;
        
        setPlan(planData);
        setError(null);
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError('Failed to load plan');
      } finally {
        setHasLoaded(true);
      }
    };

    fetchPlan();
  }, [id]);

  if (!hasLoaded) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <Skeleton className="w-40 h-10 rounded" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-400">Failed to load workout plan</p>
          <button
            onClick={() => router.push('/workout-planner')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Back to Workout Planner
          </button>
        </div>
      </div>
    );
  }

  // Use the shared WorkoutPlanDetail component
  return <WorkoutPlanDetail plan={plan} />;
}