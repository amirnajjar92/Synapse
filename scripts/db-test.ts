
import { PrismaClient, PlanStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function testDB() {
  console.log('🚀 Starting database connection test...\n');

  try {
    // 1. Test Connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // 2. Create a test user
    console.log('2️⃣ Creating test user...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        updatedAt: new Date(),
      },
    });
    console.log('✅ Test user created:', { id: testUser.id, email: testUser.email, name: testUser.name });

    // 3. Create a test plan
    console.log('\n3️⃣ Creating test plan...');
    const testPlan = await prisma.plan.create({
      data: {
        userId: testUser.id,
        title: 'Test Plan',
        prompt: 'Test prompt for DB verification',
        icon: '/vectors/plan-icon.svg',
        updatedAt: new Date(),
        tables: {
          create: [
            {
              title: 'MEALS',
              rows: {
                create: [
                  { columns: ['Breakfast', '08:00', 'Oatmeal'] },
                  { columns: ['Lunch', '12:30', 'Chicken Salad'] },
                ],
              },
            },
            {
              title: 'CARDIO',
              rows: {
                create: [
                  { columns: ['Monday', 'Run', '5km'] },
                  { columns: ['Wednesday', 'Cycling', '30min'] },
                ],
              },
            },
          ],
        },
      },
      include: { tables: { include: { rows: true } } },
    });
    console.log('✅ Test plan created:', {
      id: testPlan.id,
      title: testPlan.title,
      status: testPlan.status,
      tablesCount: testPlan.tables.length,
    });
    testPlan.tables.forEach((table) => {
      console.log(`   - Table: ${table.title} (${table.rows.length} rows)`);
    });

    // 4. Create a DailyEntry with metrics and media
    console.log('\n4️⃣ Creating daily entry...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const testDailyEntry = await prisma.dailyEntry.create({
      data: {
        userId: testUser.id,
        planId: testPlan.id,
        date: today,
        notes: 'Great first day of training!',
        updatedAt: new Date(),
        metrics: {
          create: [
            { type: 'weight', value: 80.5, unit: 'kg', updatedAt: new Date() },
            { type: 'distance', value: 5.0, unit: 'km', updatedAt: new Date() },
            { type: 'calories', value: 450, unit: 'kcal', updatedAt: new Date() },
          ],
        },
        media: {
          create: [
            { type: 'screenshot', url: 'https://example.com/screenshot1.png', fileName: 'screenshot1.png' },
          ],
        },
      },
      include: { metrics: true, media: true },
    });
    console.log('✅ Daily entry created:', {
      id: testDailyEntry.id,
      date: testDailyEntry.date,
      metricsCount: testDailyEntry.metrics.length,
      mediaCount: testDailyEntry.media.length,
    });

    // 5. Read the test data back
    console.log('\n5️⃣ Reading test data from DB...');
    const readPlan = await prisma.plan.findUnique({
      where: { id: testPlan.id },
      include: {
        tables: { include: { rows: true } },
        dailyEntries: { include: { metrics: true, media: true } },
      },
    });
    if (readPlan) {
      console.log('✅ Test plan retrieved successfully!');
      if (readPlan.dailyEntries.length > 0) {
        console.log(`✅ Found ${readPlan.dailyEntries.length} daily entries!`);
      }
    }

    // 6. Update the plan status
    console.log('\n6️⃣ Updating plan status to IN_PROGRESS...');
    const updatedPlan = await prisma.plan.update({
      where: { id: testPlan.id },
      data: {
        status: PlanStatus.IN_PROGRESS,
        startDate: new Date(),
      },
    });
    console.log('✅ Plan updated:', { id: updatedPlan.id, status: updatedPlan.status, startDate: updatedPlan.startDate });

    // 7. Clean up test data
    console.log('\n7️⃣ Cleaning up test data...');
    await prisma.dailyEntry.deleteMany({ where: { userId: testUser.id } });
    await prisma.plan.delete({ where: { id: testPlan.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Test data cleaned up!\n');

    console.log('🎉 All database tests PASSED!');
  } catch (error) {
    console.error('❌ Database test FAILED:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database.');
  }
}

testDB();
