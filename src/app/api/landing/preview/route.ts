import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PREVIEW_USER_EMAIL = 'amirnajjar.92@gmail.com';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: PREVIEW_USER_EMAIL },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Preview user not found' }, { status: 404 });
    }

    const plans = await prisma.plan.findMany({
      where: { userId: user.id },
      include: {
        tables: {
          include: { rows: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const assignedPlan = await prisma.trainerClient.findFirst({
      where: { clientId: user.id, planStatus: 'ACTIVE' },
      include: {
        assignedPlan: {
          include: {
            tables: {
              include: { rows: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    const activeWorkoutPlan = plans.find(p => p.status === 'IN_PROGRESS' && p.tables.some(t => t.title === 'WORKOUT PLAN'))
      || plans.find(p => p.status === 'IN_PROGRESS')
      || plans[0];

    const mealPlan = plans.find(p => p.tables.some(t => t.title === 'MEALS'));

    return NextResponse.json({
      user: { name: user.name, email: user.email },
      activeWorkoutPlan: activeWorkoutPlan
        ? {
            id: activeWorkoutPlan.id,
            title: activeWorkoutPlan.title,
            status: activeWorkoutPlan.status,
            tables: activeWorkoutPlan.tables.map(t => ({
              id: t.id,
              title: t.title,
              rows: t.rows.map(r => ({
                id: r.id,
                columns: r.columns,
              })),
            })),
          }
        : null,
      mealPlan: mealPlan
        ? {
            id: mealPlan.id,
            title: mealPlan.title,
            tables: mealPlan.tables.map(t => ({
              id: t.id,
              title: t.title,
              rows: t.rows.map(r => ({
                id: r.id,
                columns: r.columns,
              })),
            })),
          }
        : null,
      totalPlans: plans.length,
    });
  } catch (error) {
    console.error('Landing preview error:', error);
    return NextResponse.json({ error: 'Failed to load preview' }, { status: 500 });
  }
}
