import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Intent Detection Keywords
// ─────────────────────────────────────────────────────────────────────────────

const PLAN_KEYWORDS = [
  'plan', 'create plan', 'make plan', 'new plan', 'generate plan',
  'modify plan', 'update plan', 'change plan', 'edit plan',
  'goal', 'goals', 'target', 'want to', 'need to',
  'lose weight', 'gain muscle', 'build muscle', 'get fit',
  'training', 'workout plan', 'fitness plan', 'exercise plan',
];

const ACTIVITY_KEYWORDS = [
  'ran', 'run', 'running', 'jog', 'jogging',
  'walk', 'walked', 'walking',
  'cycle', 'cycled', 'cycling', 'bike', 'biked',
  'swim', 'swam', 'swimming',
  'workout', 'worked out', 'exercise', 'exercised',
  'distance', 'km', 'mile', 'meters',
  'pace', 'speed', 'min/km', 'mph',
  'time', 'minutes', 'hours', 'duration',
  'weight', 'kg', 'lbs', 'pounds',
  'log', 'track', 'record', 'save',
  'today', 'yesterday', 'this morning',
];

const ANALYSIS_KEYWORDS = [
  'analyze', 'analysis', 'how am i doing', 'progress',
  'show', 'display', 'view', 'check',
  'trend', 'trends', 'pattern', 'patterns',
  'compare', 'comparison', 'stats', 'statistics',
  'summary', 'report', 'overview',
];

const QUESTION_KEYWORDS = [
  'what', 'when', 'where', 'why', 'how',
  'can i', 'should i', 'is it', 'are there',
  'help', 'advice', 'suggest', 'recommend',
  'tell me', 'explain', 'describe',
];

// ─────────────────────────────────────────────────────────────────────────────
// Intent Detection Logic
// ─────────────────────────────────────────────────────────────────────────────

type Intent = 'plan_creation' | 'plan_modification' | 'activity_logging' | 'analysis' | 'question' | 'general';

interface IntentScore {
  intent: Intent;
  score: number;
  confidence: 'high' | 'medium' | 'low';
}

function detectIntent(message: string, context?: { page?: string }): IntentScore {
  const lowerMessage = message.toLowerCase();
  const words = lowerMessage.split(/\s+/);

  // Score for each intent
  let planScore = 0;
  let activityScore = 0;
  let analysisScore = 0;
  let questionScore = 0;

  // Check keywords
  PLAN_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword)) planScore += 1;
  });

  ACTIVITY_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword)) activityScore += 1;
  });

  ANALYSIS_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword)) analysisScore += 1;
  });

  QUESTION_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword)) questionScore += 0.5;
  });

  // Context boost (page-based)
  if (context?.page?.includes('/planner')) {
    planScore += 1;
  } else if (context?.page?.includes('/monitor')) {
    activityScore += 1;
    analysisScore += 0.5;
  } else if (context?.page?.includes('/plan-progress-tracker')) {
    analysisScore += 1;
  }

  // Pattern matching for specific cases
  
  // Activity logging patterns (past tense verbs + metrics)
  const activityPatterns = [
    /ran\s+\d+/i,
    /walked\s+\d+/i,
    /cycled\s+\d+/i,
    /workout.*\d+/i,
    /\d+\s*km/i,
    /\d+\s*miles?/i,
    /\d+\s*min/i,
    /weight.*\d+/i,
    /pace.*\d+/i,
  ];

  activityPatterns.forEach(pattern => {
    if (pattern.test(lowerMessage)) activityScore += 2;
  });

  // Plan creation patterns (future goals)
  const planPatterns = [
    /\b(want|need|goal|plan)\s+to\s+\w+/i,
    /\b(lose|gain|build|improve)\s+\w+/i,
    /\d+\s*(day|week|month)/i,
    /create.*plan/i,
    /make.*plan/i,
  ];

  planPatterns.forEach(pattern => {
    if (pattern.test(lowerMessage)) planScore += 2;
  });

  // Determine primary intent
  const scores = [
    { intent: 'plan_creation' as Intent, score: planScore },
    { intent: 'activity_logging' as Intent, score: activityScore },
    { intent: 'analysis' as Intent, score: analysisScore },
    { intent: 'question' as Intent, score: questionScore },
  ];

  scores.sort((a, b) => b.score - a.score);

  const topIntent = scores[0];
  const secondIntent = scores[1];

  // Confidence calculation
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (topIntent.score >= 3) confidence = 'high';
  else if (topIntent.score >= 2) confidence = 'medium';

  // If scores are very close, reduce confidence
  if (topIntent.score > 0 && secondIntent.score > 0) {
    const ratio = topIntent.score / secondIntent.score;
    if (ratio < 1.5) confidence = 'medium';
    if (ratio < 1.2) confidence = 'low';
  }

  // Default to general if no clear intent
  if (topIntent.score < 1) {
    return { intent: 'general', score: 0, confidence: 'low' };
  }

  return {
    intent: topIntent.intent,
    score: topIntent.score,
    confidence,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route Handlers
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, message, context } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Detect intent
    const intentResult = detectIntent(message, context);

    console.log('🎯 Intent Detection:', {
      message: message.substring(0, 50) + '...',
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      score: intentResult.score,
      page: context?.page,
    });

    // Route based on intent
    switch (intentResult.intent) {
      case 'plan_creation':
      case 'plan_modification':
        return await handlePlanIntent(email, message, intentResult, request);

      case 'activity_logging':
        return await handleActivityLogging(email, message, intentResult, request);

      case 'analysis':
        return await handleAnalysis(email, message, intentResult, context);

      case 'question':
      case 'general':
        return await handleGeneralQuery(message, intentResult);

      default:
        return NextResponse.json({
          intent: 'general',
          response: 'I understand you want help with something. Could you be more specific? I can help you create plans, log activities, or answer questions.',
          confidence: 'low',
        });
    }
  } catch (error) {
    console.error('Unified AI error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent Handlers
// ─────────────────────────────────────────────────────────────────────────────

async function handlePlanIntent(
  email: string,
  message: string,
  intentResult: IntentScore,
  request: NextRequest
) {
  // Check if user has an existing plan
  const plansResponse = await fetch(new URL('/api/users/me/plans', request.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const plansData = await plansResponse.json();
  const hasActivePlan = plansData.plans?.some((p: any) => p.status === 'IN_PROGRESS');

  // For modification, ensure there's an active plan
  if (intentResult.intent === 'plan_modification' && !hasActivePlan) {
    return NextResponse.json({
      intent: 'plan_modification',
      response: 'You don\'t have an active plan yet. Would you like me to [create one](/planner)?',
      confidence: intentResult.confidence,
      suggestion: 'Create a new plan instead',
      navigationLinks: [{ text: 'Go to Planner', path: '/planner' }],
    });
  }

  // Use AI to enhance the response
  let aiEnhancedResponse = '';
  try {
    const aiResponse = await fetch(new URL('/api/ai/analyse', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Extract fitness goals from: "${message}". Return JSON with: duration (days), goal (lose/gain/build), amount (kg), focus (cardio/strength/endurance).`,
      }),
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      aiEnhancedResponse = `\n\nI understand you want to: ${message}.\n\nLet me help you create a personalized plan. [Visit the Planner page](/planner) to see your customized workout schedule.`;
    }
  } catch (error) {
    console.error('AI enhancement failed:', error);
  }

  return NextResponse.json({
    intent: intentResult.intent,
    processing: intentResult.intent === 'plan_creation' 
      ? 'Creating your fitness plan...' 
      : 'Modifying your plan...',
    response: `I'll help you ${intentResult.intent === 'plan_creation' ? 'create a new plan' : 'modify your plan'}.${aiEnhancedResponse || ' Go to the [Planner page](/planner) to see the details.'}`,
    confidence: intentResult.confidence,
    action: 'redirect',
    redirectTo: '/planner',
    planPrompt: message,
    navigationLinks: [{ text: 'Open Planner', path: '/planner' }],
  });
}

async function handleActivityLogging(
  email: string,
  message: string,
  intentResult: IntentScore,
  request: NextRequest
) {
  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Call the analyze endpoint
  const formData = new FormData();
  formData.append('email', email);
  formData.append('prompt', message);

  const analyzeUrl = new URL(`/api/users/me/daily-entries/${encodeURIComponent(today)}/analyze`, request.url);
  
  const analyzeResponse = await fetch(analyzeUrl.toString(), {
    method: 'POST',
    body: formData,
  });

  if (!analyzeResponse.ok) {
    return NextResponse.json({
      intent: 'activity_logging',
      response: 'I had trouble extracting metrics from your message. Could you provide more details like distance, time, or weight?',
      confidence: intentResult.confidence,
      suggestion: 'Try: "Ran 10km in 50 minutes" or "Weight 72.5kg"',
    });
  }

  const analyzeData = await analyzeResponse.json();

  if (analyzeData.success && analyzeData.metricChanges?.length > 0) {
    const metricsSummary = analyzeData.metricChanges
      .map((m: any) => `${m.type}: ${m.newValue}${m.newUnit ? ' ' + m.newUnit : ''}`)
      .join(', ');

    return NextResponse.json({
      intent: 'activity_logging',
      processing: 'Extracting metrics...',
      response: `✅ Activity logged successfully!\n\nRecorded: ${metricsSummary}\n\nYou can view your progress on the [Monitor page](/monitor) or [Progress Tracker](/plan-progress-tracker).`,
      confidence: intentResult.confidence,
      metrics: analyzeData.metricChanges,
      navigationLinks: [
        { text: 'View Monitor', path: '/monitor' },
        { text: 'Check Progress', path: '/plan-progress-tracker' },
      ],
    });
  } else {
    return NextResponse.json({
      intent: 'activity_logging',
      response: 'I couldn\'t find any metrics to log. Please include details like distance (km), time (minutes), pace, or weight.\n\nTry the [Monitor page](/monitor) for detailed activity logging.',
      confidence: intentResult.confidence,
      suggestion: 'Try: "Ran 10km in 50 minutes" or "Weight 72.5kg"',
      navigationLinks: [{ text: 'Open Monitor', path: '/monitor' }],
    });
  }
}

async function handleAnalysis(
  email: string,
  message: string,
  intentResult: IntentScore,
  context: any
) {
  return NextResponse.json({
    intent: 'analysis',
    processing: 'Analyzing your data...',
    response: 'Analysis features are being enhanced! \n\nFor now, you can:\n• View your progress on the [Monitor page](/monitor)\n• Check detailed metrics on [Plan Progress Tracker](/plan-progress-tracker)\n• Review your workout history',
    confidence: intentResult.confidence,
    suggestion: 'Visit the Monitor page to see your activity charts and metrics.',
    navigationLinks: [
      { text: 'Open Monitor', path: '/monitor' },
      { text: 'View Progress', path: '/plan-progress-tracker' },
    ],
  });
}

async function handleGeneralQuery(
  message: string,
  intentResult: IntentScore
) {
  // Simple rule-based responses for common questions
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('help')) {
    return NextResponse.json({
      intent: 'question',
      response: `I can assist you with:
      
• **Creating fitness plans** - Just tell me your goals (e.g., "Lose 5kg in 30 days")
  [Go to Planner](/planner)
  
• **Logging activities** - Share what you did (e.g., "Ran 10km today")
  [Open Monitor](/monitor)
  
• **Tracking progress** - Ask about your metrics and trends
  [View Progress](/plan-progress-tracker)
  
• **Answering questions** - Ask me anything about fitness!

What would you like to do?`,
      confidence: 'high',
      navigationLinks: [
        { text: 'Create Plan', path: '/planner' },
        { text: 'Log Activity', path: '/monitor' },
        { text: 'View Progress', path: '/plan-progress-tracker' },
      ],
    });
  }

  if (lowerMessage.includes('what can you do')) {
    return NextResponse.json({
      intent: 'question',
      response: `I'm your AI fitness assistant! I can:

✅ **Create personalized fitness plans** → [Planner](/planner)
✅ **Log and track your activities** → [Monitor](/monitor)
✅ **Extract metrics from your notes**
✅ **Analyze your progress** → [Progress Tracker](/plan-progress-tracker)
✅ **Answer fitness-related questions**

Try telling me what you want to achieve!`,
      confidence: 'high',
      navigationLinks: [
        { text: 'Start Planning', path: '/planner' },
        { text: 'Log Activity', path: '/monitor' },
      ],
    });
  }

  return NextResponse.json({
    intent: 'general',
    response: 'I\'m here to help! You can ask me to:\n• [Create a plan](/planner) - "Create a plan to lose 5kg"\n• [Log activity](/monitor) - "Ran 10km today"\n• Answer questions - Ask me anything!\n\nWhat would you like to do?',
    confidence: intentResult.confidence,
    suggestion: 'Try: "Create a plan to lose 5kg" or "Ran 10km today"',
    navigationLinks: [
      { text: 'Planner', path: '/planner' },
      { text: 'Monitor', path: '/monitor' },
    ],
  });
}
