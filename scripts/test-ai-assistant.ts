#!/usr/bin/env ts-node

/**
 * AI Assistant Automated Test Script
 * 
 * Tests all conversation features including:
 * - Intent detection (plan_creation, activity_logging, analysis, question, general)
 * - Message persistence
 * - Conversation creation
 * - Metadata tracking
 * - Context awareness
 * 
 * Usage:
 *   npm run test:ai-assistant
 * 
 * Or directly:
 *   ts-node scripts/test-ai-assistant.ts
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test result tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

// Helper functions
function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
  passedTests++;
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
  failedTests++;
  failures.push(message);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logSection(message: string) {
  log(`\n${'='.repeat(60)}`, colors.bright);
  log(`${message}`, colors.bright);
  log(`${'='.repeat(60)}`, colors.bright);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test data
const TEST_PROMPTS = {
  plan_creation: [
    'Create a 30-day plan to lose 5kg',
    'I want to build muscle in 45 days',
    'Help me get fit for summer',
    'Create a marathon training plan',
  ],
  activity_logging: [
    'Ran 10km in 50 minutes',
    'Walked 5km this morning in 60 minutes',
    'Weight 72.5kg today',
    'Cycled 25km in 1 hour',
  ],
  analysis: [
    'How am I doing this week?',
    'Show me my distance trends',
    'Am I improving?',
  ],
  question: [
    'What can you do?',
    'help',
    'What should I eat after workout?',
    'How do I improve my running pace?',
  ],
  general: [
    'asdfghjkl',
    'hello',
  ],
};

// Test functions
async function testUnifiedEndpoint(message: string, expectedIntent: string, contextPage?: string) {
  totalTests++;
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        message,
        context: {
          page: contextPage || '/',
          conversationHistory: [],
        },
      }),
    });

    if (!response.ok) {
      logError(`Unified API failed for "${message.substring(0, 30)}...": ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Check intent
    if (data.intent === expectedIntent) {
      logSuccess(`Intent detected correctly: ${data.intent} (confidence: ${data.confidence})`);
    } else {
      logError(`Wrong intent for "${message}": expected ${expectedIntent}, got ${data.intent}`);
    }

    // Check response exists
    totalTests++;
    if (data.response) {
      logSuccess(`Response generated: "${data.response.substring(0, 50)}..."`);
    } else {
      logError(`No response generated for "${message}"`);
    }

    return data;
  } catch (error) {
    logError(`Exception in unified endpoint: ${error}`);
    return null;
  }
}

async function testConversationPersistence(message: string) {
  totalTests++;
  
  try {
    // Step 1: Save message
    const saveResponse = await fetch(`${BASE_URL}/api/ai/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        role: 'user',
        content: message,
        intent: 'test',
        confidence: 'high',
        contextPage: '/test',
        metadata: { test: true },
      }),
    });

    if (!saveResponse.ok) {
      logError(`Failed to save message: ${saveResponse.status}`);
      return null;
    }

    const saveData = await saveResponse.json();

    if (saveData.success && saveData.conversationId) {
      logSuccess(`Message saved with conversation ID: ${saveData.conversationId}`);
    } else {
      logError(`Save response missing conversationId`);
      return null;
    }

    // Step 2: Retrieve conversation
    totalTests++;
    await sleep(100); // Small delay to ensure DB write completes

    const getResponse = await fetch(
      `${BASE_URL}/api/ai/conversations?email=${encodeURIComponent(TEST_EMAIL)}&conversationId=${saveData.conversationId}`,
      { method: 'GET' }
    );

    if (!getResponse.ok) {
      logError(`Failed to retrieve conversation: ${getResponse.status}`);
      return saveData.conversationId;
    }

    const getData = await getResponse.json();

    if (getData.success && getData.conversation) {
      logSuccess(`Conversation retrieved with ${getData.conversation.messages?.length || 0} messages`);
      
      // Verify message content
      totalTests++;
      const savedMessage = getData.conversation.messages?.find((m: any) => m.content === message);
      if (savedMessage) {
        logSuccess(`Message content verified in database`);
      } else {
        logError(`Message content not found in database`);
      }
    } else {
      logError(`Failed to retrieve conversation data`);
    }

    return saveData.conversationId;
  } catch (error) {
    logError(`Exception in conversation persistence: ${error}`);
    return null;
  }
}

async function testMultiMessageConversation() {
  logSection('Test: Multi-Message Conversation');

  const messages = [
    { role: 'user', content: 'Create a plan to lose 5kg' },
    { role: 'assistant', content: 'I will help you create a plan...' },
    { role: 'user', content: 'Ran 10km today' },
    { role: 'assistant', content: 'Activity logged successfully!' },
  ];

  let conversationId: string | null = null;

  for (const msg of messages) {
    totalTests++;
    
    try {
      const response: Response = await fetch(`${BASE_URL}/api/ai/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          conversationId,
          role: msg.role,
          content: msg.content,
          intent: 'test',
          confidence: 'high',
          contextPage: '/test',
        }),
      });

      if (!response.ok) {
        logError(`Failed to save ${msg.role} message: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (!conversationId) {
        conversationId = data.conversationId;
        logInfo(`Conversation created: ${conversationId}`);
      }

      logSuccess(`${msg.role} message saved`);
    } catch (error) {
      logError(`Exception saving message: ${error}`);
    }

    await sleep(50);
  }

  // Verify all messages saved
  if (conversationId) {
    totalTests++;
    
    try {
      const response = await fetch(
        `${BASE_URL}/api/ai/conversations?email=${encodeURIComponent(TEST_EMAIL)}&conversationId=${conversationId}`,
        { method: 'GET' }
      );

      const data = await response.json();
      
      if (data.conversation?.messages?.length === messages.length) {
        logSuccess(`All ${messages.length} messages retrieved from database`);
      } else {
        logError(`Expected ${messages.length} messages, got ${data.conversation?.messages?.length || 0}`);
      }
    } catch (error) {
      logError(`Failed to verify conversation: ${error}`);
    }
  }
}

async function testConversationDeletion(conversationId: string) {
  totalTests++;
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/ai/conversations?conversationId=${conversationId}&email=${encodeURIComponent(TEST_EMAIL)}`,
      { method: 'DELETE' }
    );

    if (response.ok) {
      logSuccess(`Conversation deleted successfully`);
      
      // Verify deletion
      totalTests++;
      await sleep(100);
      
      const getResponse = await fetch(
        `${BASE_URL}/api/ai/conversations?email=${encodeURIComponent(TEST_EMAIL)}&conversationId=${conversationId}`,
        { method: 'GET' }
      );

      const getData = await getResponse.json();
      
      if (!getData.conversation) {
        logSuccess(`Deletion verified - conversation not found`);
      } else {
        logError(`Conversation still exists after deletion`);
      }
    } else {
      logError(`Failed to delete conversation: ${response.status}`);
    }
  } catch (error) {
    logError(`Exception in deletion test: ${error}`);
  }
}

async function testContextAwareness() {
  logSection('Test: Context Awareness');

  const contexts = [
    { page: '/planner', message: 'Create a plan', expectedBoost: 'plan intent boosted' },
    { page: '/monitor', message: 'Ran 10km', expectedBoost: 'activity intent boosted' },
    { page: '/plan-progress-tracker', message: 'How am I doing?', expectedBoost: 'analysis intent boosted' },
  ];

  for (const ctx of contexts) {
    logInfo(`Testing context: ${ctx.page}`);
    await testUnifiedEndpoint(ctx.message, ctx.message.includes('plan') ? 'plan_creation' : 
                                          ctx.message.includes('Ran') ? 'activity_logging' : 
                                          'analysis', ctx.page);
    await sleep(100);
  }
}

async function testAllIntents() {
  logSection('Test: Intent Detection');

  for (const [intent, prompts] of Object.entries(TEST_PROMPTS)) {
    logInfo(`\nTesting intent: ${intent}`);
    
    for (const prompt of prompts) {
      logInfo(`Prompt: "${prompt}"`);
      await testUnifiedEndpoint(prompt, intent);
      await sleep(100);
    }
  }
}

async function testEdgeCases() {
  logSection('Test: Edge Cases');

  const edgeCases = [
    { message: '', description: 'Empty message', shouldFail: true },
    { message: '   ', description: 'Whitespace only', shouldFail: true },
    { message: 'a'.repeat(1000), description: 'Very long message', shouldFail: false },
    { message: '🏃‍♂️💪🎯', description: 'Emojis only', shouldFail: false },
    { message: 'Create plan lose 5kg 30 days', description: 'Poor grammar', shouldFail: false },
  ];

  for (const testCase of edgeCases) {
    totalTests++;
    logInfo(`Testing: ${testCase.description}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/ai/unified`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          message: testCase.message,
          context: { page: '/' },
        }),
      });

      if (testCase.shouldFail) {
        if (!response.ok) {
          logSuccess(`Correctly rejected: ${testCase.description}`);
        } else {
          logError(`Should have failed: ${testCase.description}`);
        }
      } else {
        if (response.ok) {
          logSuccess(`Handled gracefully: ${testCase.description}`);
        } else {
          logError(`Failed to handle: ${testCase.description}`);
        }
      }
    } catch (error) {
      if (testCase.shouldFail) {
        logSuccess(`Correctly threw error: ${testCase.description}`);
      } else {
        logError(`Unexpected error for ${testCase.description}: ${error}`);
      }
    }

    await sleep(100);
  }
}

async function testRecentConversations() {
  logSection('Test: Recent Conversations Retrieval');

  totalTests++;
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/ai/conversations?email=${encodeURIComponent(TEST_EMAIL)}&limit=5`,
      { method: 'GET' }
    );

    if (!response.ok) {
      logError(`Failed to get recent conversations: ${response.status}`);
      return;
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.conversations)) {
      logSuccess(`Retrieved ${data.conversations.length} recent conversations`);
      
      // Check each conversation has expected fields
      totalTests++;
      const allValid = data.conversations.every((conv: any) => 
        conv.id && conv.userId && conv.createdAt && Array.isArray(conv.messages)
      );

      if (allValid) {
        logSuccess(`All conversations have required fields`);
      } else {
        logError(`Some conversations missing required fields`);
      }
    } else {
      logError(`Invalid response format for recent conversations`);
    }
  } catch (error) {
    logError(`Exception in recent conversations test: ${error}`);
  }
}

async function runHealthCheck() {
  logSection('Health Check');

  totalTests++;
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      logSuccess(`Server is reachable at ${BASE_URL}`);
    } else {
      logError(`Server returned ${response.status}`);
      log('\nMake sure your dev server is running:', colors.yellow);
      log('  npm run dev', colors.yellow);
      process.exit(1);
    }
  } catch (error) {
    logError(`Cannot reach server at ${BASE_URL}`);
    log('\nMake sure your dev server is running:', colors.yellow);
    log('  npm run dev', colors.yellow);
    process.exit(1);
  }
}

// Main test runner
async function runAllTests() {
  log('\n', colors.bright);
  log('╔════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                                                            ║', colors.cyan);
  log('║        AI ASSISTANT AUTOMATED TEST SUITE                   ║', colors.cyan);
  log('║                                                            ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════╝', colors.cyan);
  
  logInfo(`Testing against: ${BASE_URL}`);
  logInfo(`Test user email: ${TEST_EMAIL}`);
  logInfo(`Started at: ${new Date().toISOString()}\n`);

  const startTime = Date.now();

  try {
    // Run tests
    await runHealthCheck();
    await testAllIntents();
    await testContextAwareness();
    await testEdgeCases();
    
    // Test persistence
    logSection('Test: Conversation Persistence');
    const conversationId = await testConversationPersistence('Test persistence message');
    await sleep(200);
    
    // Test multi-message
    await testMultiMessageConversation();
    await sleep(200);
    
    // Test retrieval
    await testRecentConversations();
    await sleep(200);
    
    // Test deletion (if we got a conversation ID)
    if (conversationId) {
      logSection('Test: Conversation Deletion');
      await testConversationDeletion(conversationId);
    }

  } catch (error) {
    logError(`Fatal error during test execution: ${error}`);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  logSection('Test Summary');
  log(`Total Tests: ${totalTests}`, colors.bright);
  log(`Passed: ${passedTests}`, colors.green);
  log(`Failed: ${failedTests}`, failedTests > 0 ? colors.red : colors.green);
  log(`Duration: ${duration}s`, colors.cyan);
  
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';
  log(`Success Rate: ${successRate}%`, parseFloat(successRate) >= 80 ? colors.green : colors.yellow);

  if (failures.length > 0) {
    log('\n❌ Failed Tests:', colors.red);
    failures.forEach((failure, index) => {
      log(`  ${index + 1}. ${failure}`, colors.red);
    });
  }

  // Exit code
  if (failedTests === 0) {
    log('\n🎉 All tests passed!', colors.green);
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Check the output above.', colors.yellow);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Unhandled error: ${error}`);
  process.exit(1);
});
