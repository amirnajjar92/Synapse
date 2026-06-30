export const MOCK_USER = {
  email: 'demo@synapse.app',
  name: 'Alex Chen',
  picture: null,
};

export const MOCK_PLAN = {
  id: 'mock-plan-1',
  title: 'Push / Pull / Legs Split',
  prompt: 'A 4-day upper/lower split focused on strength and hypertrophy',
  icon: 'dumbbell',
  status: 'IN_PROGRESS',
  startDate: new Date(Date.now() - 14 * 86400000).toISOString(),
  endDate: new Date(Date.now() + 56 * 86400000).toISOString(),
  createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
  tables: [
    {
      id: 'table-1',
      title: 'WEEK 1 — PUSH A',
      rows: [
        { id: 'r1', columns: ['Day 1', 'Chest / Shoulders', 'Bench Press: 4x8\nIncline Dumbbell Press: 3x10\nLateral Raise: 4x12\nOverhead Press: 3x8\nTricep Pushdown: 3x12', '60 min'] },
        { id: 'r2', columns: ['Day 2', 'Back / Rear Delts', 'Pull Ups: 4x8\nBarbell Row: 4x10\nFace Pull: 3x15\nDeadlift: 3x5\nHammer Curl: 3x10', '60 min'] },
        { id: 'r3', columns: ['Day 3', 'Legs', 'Squat: 4x6\nRomanian Deadlift: 3x10\nLeg Press: 3x12\nCalf Raise: 4x15\nPlank: 3x45s', '65 min'] },
        { id: 'r4', columns: ['Day 4', 'Push B', 'Incline Bench: 4x8\nDips: 3x10\nArnold Press: 3x10\nSkull Crusher: 3x12\nFace Pull: 3x15', '55 min'] },
        { id: 'r5', columns: ['Day 5', 'Pull B', 'Lat Pulldown: 4x10\nSeated Row: 3x12\nRack Pull: 3x8\nEZ Bar Curl: 3x12\nRear Delt Fly: 3x15', '55 min'] },
        { id: 'r6', columns: ['Day 6', 'Legs / Abs', 'Front Squat: 4x6\nLunges: 3x10\nLeg Curl: 3x12\nHanging Leg Raise: 3x12\nCable Crunch: 3x15', '60 min'] },
        { id: 'r7', columns: ['Day 7', 'Rest / Recovery', 'Light Cardio: 30 min\nStretching: 20 min\nFoam Rolling: 15 min', '65 min'] },
      ],
    },
  ],
};

export const MOCK_WATER_ENTRIES = [
  { id: 'w1', date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], amount: 8 },
  { id: 'w2', date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], amount: 6 },
  { id: 'w3', date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], amount: 7 },
  { id: 'w4', date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], amount: 9 },
  { id: 'w5', date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], amount: 5 },
  { id: 'w6', date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], amount: 8 },
  { id: 'w7', date: new Date().toISOString().split('T')[0], amount: 4 },
];

export const MOCK_WATER_GOAL = 8;

export const MOCK_CLIENTS = [
  {
    id: 'client-1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    planStatus: 'active' as const,
    lastMessage: 'Thanks coach! That felt great today 💪',
    lastMessageTime: new Date().toISOString(),
  },
  {
    id: 'client-2',
    name: 'Mike Torres',
    email: 'mike@example.com',
    planStatus: 'active' as const,
    lastMessage: 'Should I add more cardio on rest days?',
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'client-3',
    name: 'Emily Park',
    email: 'emily@example.com',
    planStatus: 'none' as const,
  },
];

export const MOCK_MESSAGES_BY_CLIENT: Record<string, any[]> = {
  'client-1': [
    { id: 'm1', senderId: 'trainer', text: 'Great session today! How are your shoulders feeling?', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm2', senderId: 'client-1', text: 'A bit sore but in a good way! The incline press really hit the upper chest.', timestamp: new Date(Date.now() - 3000000).toISOString() },
    { id: 'm3', senderId: 'trainer', text: 'Thats exactly what we want. Keep the volume moderate this week and we can bump it up next cycle.', timestamp: new Date(Date.now() - 2400000).toISOString() },
    { id: 'm4', senderId: 'client-1', text: 'Thanks coach! That felt great today 💪', timestamp: new Date(Date.now() - 1800000).toISOString() },
  ],
  'client-2': [
    { id: 'm5', senderId: 'trainer', text: 'Hows the new program treating you?', timestamp: new Date(Date.now() - 90000000).toISOString() },
    { id: 'm6', senderId: 'client-2', text: 'Loving it so far! Squats are progressing nicely.', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'm7', senderId: 'client-2', text: 'Should I add more cardio on rest days?', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ],
};

export const MOCK_DAILY_ENTRIES = [
  {
    id: 'de1',
    date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    mood: 4,
    energy: 4,
    sleep: 7,
    soreness: 2,
    weight: 82.5,
    notes: 'Good session, felt strong on bench press.',
    todos: ['Complete Day 1 workout', 'Drink 8 glasses water'],
    metrics: [
      { type: 'strength', value: 85, unit: '%' },
      { type: 'cardio', value: 20, unit: 'min' },
    ],
  },
  {
    id: 'de2',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    mood: 5,
    energy: 5,
    sleep: 8,
    soreness: 1,
    weight: 82.2,
    notes: 'PR on deadlifts! 140kg x 5.',
    todos: ['Complete Day 2 workout'],
    metrics: [
      { type: 'strength', value: 95, unit: '%' },
    ],
  },
  {
    id: 'de3',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    mood: 3,
    energy: 3,
    sleep: 6,
    soreness: 3,
    weight: 82.8,
    notes: 'Felt a bit tired today, lowered intensity.',
    todos: ['Complete Day 3 workout', 'Stretch for 15 min'],
    metrics: [
      { type: 'strength', value: 70, unit: '%' },
    ],
  },
  {
    id: 'de4',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    mood: 4,
    energy: 4,
    sleep: 7.5,
    soreness: 2,
    weight: 82.1,
    notes: 'Good recovery day. Light cardio and stretching.',
    todos: ['Light cardio 30 min', 'Meal prep'],
    metrics: [
      { type: 'cardio', value: 30, unit: 'min' },
    ],
  },
];

export const SCREENSHOT_PAGES = [
  { path: '/workout-tracker?show=true', name: 'workout-tracker', label: 'Workout Tracker', desc: 'Daily workout view with day navigation, exercises, anatomy map, and coach chat' },
  { path: '/planner?show=true', name: 'planner', label: 'Plan Builder', desc: 'AI-powered workout plan creation from natural language prompts' },
  { path: '/water-tracker?show=true', name: 'water-tracker', label: 'Water Tracker', desc: 'Daily hydration logging with streak tracking' },
  { path: '/my-plans?show=true', name: 'my-plans', label: 'My Plans', desc: 'Library of all workout plans with status indicators' },
  { path: '/training-studio?tab=dashboard&show=true', name: 'training-studio-dashboard', label: 'Training Studio', desc: 'Trainer dashboard with client management' },
  { path: '/training-studio?tab=messages&show=true', name: 'training-studio-messages', label: 'Studio Messages', desc: 'Client chat with real-time messaging' },
  { path: '/plan-progress-tracker?show=true', name: 'plan-progress-tracker', label: 'Progress Tracker', desc: 'Daily check-in analytics with AI analysis' },
  { path: '/monitor?show=true', name: 'monitor', label: 'Health Monitor', desc: 'Weight trends, mood tracking, and health metrics' },
  { path: '/reminders?show=true', name: 'reminders', label: 'Reminders', desc: 'Configurable notification settings' },
  { path: '/entertain?show=true', name: 'entertain', label: 'Discover', desc: 'Fitness news, events, videos, and playlists' },
  { path: '/training-chat?show=true', name: 'training-chat', label: 'Client Chat', desc: 'Direct messaging with your trainer' },
  { path: '/musclemap?show=true', name: 'musclemap', label: 'Muscle Map', desc: 'Interactive anatomy reference' },
];
