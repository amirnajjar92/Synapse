import { PrismaClient, ClientPlanStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding training studio data...\n');

  // 1. Create trainer user
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@example.com' },
    update: {},
    create: {
      email: 'trainer@example.com',
      name: 'Coach Alex',
      role: 'USER',
      updatedAt: new Date(),
    },
  });
  console.log('✅ Trainer:', { id: trainer.id, email: trainer.email });

  // 2. Create client users
  const clientData = [
    { email: 'sarah@example.com', name: 'Sarah Chen' },
    { email: 'mike@example.com', name: 'Mike Torres' },
    { email: 'emma@example.com', name: 'Emma Wilson' },
    { email: 'james@example.com', name: 'James Park' },
    { email: 'lisa@example.com', name: 'Lisa Rodriguez' },
  ];

  const clients = [];
  for (const c of clientData) {
    const client = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        name: c.name,
        role: 'USER',
        updatedAt: new Date(),
      },
    });
    clients.push(client);
    console.log('✅ Client:', { id: client.id, email: client.email });
  }

  // 3. Create trainer-client relationships
  const statuses = [
    ClientPlanStatus.ACTIVE,
    ClientPlanStatus.ACTIVE,
    ClientPlanStatus.PAUSED,
    ClientPlanStatus.NONE,
    ClientPlanStatus.ACTIVE,
  ];

  for (let i = 0; i < clients.length; i++) {
    await prisma.trainerClient.upsert({
      where: {
        trainerId_clientId: {
          trainerId: trainer.id,
          clientId: clients[i].id,
        },
      },
      update: { planStatus: statuses[i] },
      create: {
        trainerId: trainer.id,
        clientId: clients[i].id,
        planStatus: statuses[i],
      },
    });
    console.log(`✅ Linked trainer → ${clients[i].name} (${statuses[i]})`);
  }

  // 4. Create conversations and messages
  const messagesData: Record<number, { sender: 'trainer' | 'client'; text: string }[]> = {
    0: [
      { sender: 'client', text: "Hey coach! Ready for today's workout?" },
      { sender: 'trainer', text: 'Absolutely! Focus on form for the squats today - 3x8 at 80%' },
      { sender: 'client', text: 'Got it! Should I record my sets?' },
      { sender: 'trainer', text: 'Yes please, and let me know how your lower back feels afterward' },
      { sender: 'client', text: "Feeling great after today's session!" },
    ],
    1: [
      { sender: 'client', text: 'Can I adjust the leg day exercises?' },
      { sender: 'trainer', text: 'Sure, what did you have in mind?' },
      { sender: 'client', text: 'My knee has been acting up, thinking of swapping lunges for step-ups' },
      { sender: 'trainer', text: 'Good call. Do step-ups 3x10 each leg, and add banded walks for warmup' },
    ],
  };

  for (const [idx, msgs] of Object.entries(messagesData)) {
    const clientIdx = parseInt(idx);
    const conversation = await prisma.conversation.upsert({
      where: {
        trainerId_clientId: {
          trainerId: trainer.id,
          clientId: clients[clientIdx].id,
        },
      },
      update: {},
      create: {
        trainerId: trainer.id,
        clientId: clients[clientIdx].id,
      },
    });

    // Clear existing messages for this conversation
    await prisma.message.deleteMany({ where: { conversationId: conversation.id } });

    // Create messages
    for (const msg of msgs) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: msg.sender === 'trainer' ? trainer.id : clients[clientIdx].id,
          text: msg.text,
        },
      });
    }
    console.log(`✅ Created conversation with ${msgs.length} messages for ${clients[clientIdx].name}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('   Trainer: trainer@example.com');
  console.log('   Clients: sarah@example.com, mike@example.com, emma@example.com, james@example.com, lisa@example.com');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
