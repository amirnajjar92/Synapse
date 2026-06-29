import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get own plans
    const ownPlans = await prisma.plan.findMany({
      where: { userId: user.id },
      include: { tables: { include: { rows: true } } },
      orderBy: { createdAt: 'desc' }
    });

    // Get plans assigned via TrainerClient (client receiving plans from trainers)
    const clientAssignments = await prisma.trainerClient.findMany({
      where: {
        clientId: user.id,
        assignedPlanId: { not: null },
      },
      include: {
        assignedPlan: {
          include: { tables: { include: { rows: true } } },
        },
      },
    });

    const assignedPlans = clientAssignments
      .map((tc) => tc.assignedPlan)
      .filter((p): p is NonNullable<typeof p> => p !== null);

    // Merge: own plans first, then assigned plans (deduplicate by id)
    const allPlanIds = new Set<string>();
    const plans = [...ownPlans];
    ownPlans.forEach((p) => allPlanIds.add(p.id));

    for (const plan of assignedPlans) {
      if (!allPlanIds.has(plan.id)) {
        plans.push(plan);
        allPlanIds.add(plan.id);
      }
    }

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching user plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans', details: (error as Error).message },
      { status: 500 }
    );
  }
}