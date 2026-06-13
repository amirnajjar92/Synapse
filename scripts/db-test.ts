
import { PrismaClient } from '@prisma/client';

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
      tablesCount: testPlan.tables.length,
    });
    testPlan.tables.forEach((table) => {
      console.log(`   - Table: ${table.title} (${table.rows.length} rows)`);
    });

    // 4. Read the test data back
    console.log('\n4️⃣ Reading test data from DB...');
    const readPlan = await prisma.plan.findUnique({
      where: { id: testPlan.id },
      include: { tables: { include: { rows: true } } },
    });
    if (readPlan) {
      console.log('✅ Test plan retrieved successfully!');
    }

    // 5. Clean up test data
    console.log('\n5️⃣ Cleaning up test data...');
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
