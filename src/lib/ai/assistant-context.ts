import prisma from '@/lib/db';

/** What each page of Synapse is for, so the assistant can answer in the context the user is in. */
export const PAGE_GUIDE: Array<{ path: string; name: string; purpose: string }> = [
  { path: '/planner', name: 'Planner', purpose: 'Create an AI nutrition + fitness plan from a goal (meals, cardio, nutrients, supplements, challenges).' },
  { path: '/workout-planner', name: 'Workout Planner', purpose: 'Pick muscles on the body map and generate a strength workout plan.' },
  { path: '/workout-tracker', name: 'Workout Tracker', purpose: 'Follow the active workout plan day by day, watch exercise videos, chat with a trainer.' },
  { path: '/my-plans', name: 'My Plans', purpose: 'List of all saved plans.' },
  { path: '/monitor', name: 'Monitor', purpose: 'Log daily notes, weight, distance, photos; AI extracts metrics; charts of weight and activity.' },
  { path: '/plan-progress-tracker', name: 'Progress Tracker', purpose: 'Calendar of plan days, today\'s focus, AI analysis of progress and history.' },
  { path: '/water-tracker', name: 'Water Tracker', purpose: 'Track daily water cups with reminders.' },
  { path: '/reminders', name: 'Reminders', purpose: 'Set reminders for meals, workouts, water and the daily plan.' },
  { path: '/training-studio', name: 'Training Studio', purpose: 'For coaches: manage clients, assign plans, message clients.' },
  { path: '/training-chat', name: 'Training Chat', purpose: 'Chat between a client and their coach.' },
  { path: '/events', name: 'Events', purpose: 'Discover and join local sport events.' },
  { path: '/entertain', name: 'Entertain', purpose: 'Fitness videos and content.' },
  { path: '/musclemap', name: 'Muscle Map', purpose: 'Interactive anatomy reference.' },
];

export function describePage(pathname?: string): string {
  if (!pathname) return 'Unknown page.';
  const match = PAGE_GUIDE.find((p) => pathname === p.path || pathname.startsWith(p.path + '/'));
  if (match) return `${match.name} (${match.path}): ${match.purpose}`;
  if (pathname.startsWith('/plan-detail')) return 'Plan Detail: viewing one saved plan and its tables.';
  return `Page ${pathname}.`;
}

export function pageGuideText(): string {
  return PAGE_GUIDE.map((p) => `- [${p.name}](${p.path}): ${p.purpose}`).join('\n');
}

/** Compact, read-only summary of the user's own data for grounding answers. */
export async function buildUserSnapshot(email: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        plans: {
          select: { id: true, title: true, status: true, startDate: true, endDate: true, goalWeight: true, goalWeightUnit: true, prompt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!user) return 'No saved data for this user yet.';

    const entries = await prisma.dailyEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 14,
      select: { date: true, notes: true, metrics: { select: { type: true, value: true, unit: true } } },
    });

    const plans = user.plans.length
      ? user.plans
          .map((p) => {
            const goal = p.goalWeight ? `, goal ${p.goalWeight}${p.goalWeightUnit ?? ''}` : '';
            const dates = p.startDate ? `, ${p.startDate.toISOString().slice(0, 10)} → ${p.endDate?.toISOString().slice(0, 10) ?? '?'}` : '';
            return `- "${p.title}" [${p.status}${goal}${dates}] goal text: ${(p.prompt ?? '').slice(0, 120)}`;
          })
          .join('\n')
      : '- none';

    const log = entries.length
      ? entries
          .map((e) => {
            const m = e.metrics.map((x) => `${x.type} ${x.value}${x.unit ?? ''}`).join(', ');
            const note = e.notes ? ` note: ${e.notes.slice(0, 80)}` : '';
            return `- ${e.date.toISOString().slice(0, 10)}: ${m || 'no metrics'}${note}`;
          })
          .join('\n')
      : '- none';

    return `User: ${user.name ?? 'unknown'}\nPlans (newest first):\n${plans}\nLast 14 logged days:\n${log}`;
  } catch (error) {
    console.error('buildUserSnapshot failed:', error);
    return 'User data is temporarily unavailable.';
  }
}
