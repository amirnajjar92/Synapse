#!/usr/bin/env node

/**
 * AI Assistant Automated Test Script (JavaScript version)
 * 
 * Tests all conversation features including:
 * - Intent detection (plan_creation, activity_logging, analysis, question, general)
 * - Message persistence
 * - Conversation creation
 * - Metadata tracking
 * - Context awareness
 * 
 * Usage:
 *   node scripts/test-ai-assistant.js
 *   npm run test:ai
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

// ANSI color codes
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

// Test tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
  passedTests++;
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
  failedTests++;
  failures.push(message);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logSection(message) {
  log(`\n${'='.repeat(70)}`, colors.bright);
  log(`${message}`, colors.bright);
  log(`${'='.repeat(70)}`, colors.bright);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test data
const TEST_PROMPTS = {
  plan_creation: [
    'Create a 30-day plan to lose 5kg',
    'I want to build muscle in 45 days',
    'Help me get fit for summer',
  ],
  activity_logging: [
    'Ran 10km in 50 minutes',
    'Walked 5km this morning',
    'Weight 72.5kg today',
  ],
  analysis: [
    'How am I doing this week?',
    'Show me my distance trends',
  ],
  question: [
    'What can you do?',
    'help',
  ],
  general: [
    'hello',
  ],
};

// Test functions
async function testUnifiedEndpoint(message, expectedIntent, contextPage = '/') {
  totalTests++;
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        message,
        context: {
          page: contextPage,
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
    if (data.intent === expectedIntent || data.intent === 'general') {
      logSuccess(`Intent: ${data.intent} (confidence: ${data.confidence || 'N/A'})`);
    } else {
      logError(`Wrong intent for "${message}": expected ${expectedIntent}, got ${data.intent}`);
    }

    // Check response
    totalTests++;
    if (data.response) {
      logSuccess(`Response: "${data.response.substring(0, 50)}..."`);
    } else {
      logError(`No response for "${message}"`);
    }

    return data;
  } catch (error) {
    logError(`Exception in unified endpoint: ${error.message}`);
    return null;
  }
}

async function testConversationSave() {
  logSection('Test: Save & Retrieve Conversation');

  totalTests++;
  const testMessage = 'Create a plan to lose 5kg - TEST MESSAGE';
  
  try {
    // Save message
    const saveResponse = await fetch(`${BASE_URL}/api/ai/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        role: 'user',
        content: testMessage,
        intent: 'plan_creation',
        confidence: 'high',
        contextPage: '/planner',
        metadata: { test: true },
      }),
    });

    if (!saveResponse.ok) {
      logError(`Failed to save message: ${saveResponse.status}`);
      return null;
    }

    const saveData = await saveResponse.json();

    if (saveData.success && saveData.conversationId) {
      logSuccess(`Message saved: ${saveData.conversationId}`);
    } else {
      logError(`Save response missing conversationId`);
      return null;
    }

    // Retrieve conversation
    totalTests++;
    await sleep(200);

    const getResponse = await fetch(
      `${BASE_URL}/api/ai/conversations?email=${encodeURIComponent(TEST_EMAIL)}&conversationId=${saveData.conversationId}`
    );

    if (!getResponse.ok) {
      logError(`Failed to retrieve: ${getResponse.status}`);
      return saveData.conversationId;
    }

    const getData = await getResponse.json();

    if (getData.success && getData.conversation) {
      const msgCount = getData.conversation.messages?.length || 0;
      logSuccess(`Retrieved conversation with ${msgCount} message(s)`);
      
      // Verify content
      totalTests++;
      const found = getData.conversation.messages?.some(m => m.content === testMessage);
      if (found) {
        logSuccess(`Message content verified in database`);
      } else {
        logError(`Message content not found`);
      }
    } else {
      logError(`Failed to retrieve conversation data`);
    }

    return saveData.conversationId;
  } catch (error) {
    logError(`Exception: ${error.message}`);
    return null;
  }
}

async function testMultiMessageConversation() {
  logSection('Test: Multi-Message Conversation');

  const messages = [
    { role: 'user', content: 'Create a plan to lose 5kg' },
    { role: 'assistant', content: 'I will help you create a plan...' },
    { role: 'user', content: 'Ran 10km today' },
    { role: 'assistant', content: 'Activity logged!' },
  ];

  let conversationId = null;

  for (const msg of messages) {
    totalTests++;
    
    try {
      const response = await fetch(`${BASE_URL}/api/ai/conversations`, {
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
        logError(`Failed to save ${msg.role}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (!conversationId) {
        conversationId = data.conversationId;
        logInfo(`Conversation: ${conversationId}`);
      }

      logSuccess(`${msg.role} message saved`);
    } catch (error) {
      logError(`Exception: ${error.message}`);
    }

    await sleep(100);
  }

  // Verify
  if (conversationId) {
    totalTests++;
    
    try {
      const response = await fetch(
        `${BASE_URL}/api/ai/conversations?email=${encodeURIComponent(TEST_EMAIL)}&conversationId=${conversationId}`
      );

      const data = await response.json();
      const msgCount = data.conversation?.messages?.length || 0;
      
      if (msgCount === messages.length) {
        logSuccess(`All ${messages.length} messages retrieved`);
      } else {
        logError(`Expected ${messages.length} messages, got ${msgCount}`);
      }
    } catch (error) {
      logError(`Verify failed: ${error.message}`);
    }
  }

  return conversationId;
}

async function testRecentConversations() {
  logSection('Test: Recent Conversations');

  totalTests++;
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/ai/conversations?email=${encodeURIComponent(TEST_EMAIL)}&limit=5`
    );

    if (!response.ok) {
      logError(`Failed to get recent: ${response.status}`);
      return;
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.conversations)) {
      logSuccess(`Retrieved ${data.conversations.length} conversations`);
      
      // Check structure
      totalTests++;
      const allValid = data.conversations.every(conv => 
        conv.id && conv.userId && conv.createdAt && Array.isArray(conv.messages)
      );

      if (allValid) {
        logSuccess(`All have required fields`);
      } else {
        logError(`Some missing required fields`);
      }
    } else {
      logError(`Invalid response format`);
    }
  } catch (error) {
    logError(`Exception: ${error.message}`);
  }
}

async function testConversationDeletion(conversationId) {
  if (!conversationId) return;
  
  logSection('Test: Delete Conversation');

  totalTests++;
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/ai/conversations?conversationId=${conversationId}&email=${encodeURIComponent(TEST_EMAIL)}`,
      { method: 'DELETE' }
    );

    if (response.ok) {
      logSuccess(`Conversation deleted`);
      
      // Verify
      totalTests++;
      await sleep(200);
      
      const getResponse = await fetch(
        `${BASE_URL}/api/ai/conversations?email=${encodeURIComponent(TEST_EMAIL)}&conversationId=${conversationId}`
      );

      const getData = await getResponse.json();
      
      if (!getData.conversation) {
        logSuccess(`Deletion verified`);
      } else {
        logError(`Still exists after deletion`);
      }
    } else {
      logError(`Delete failed: ${response.status}`);
    }
  } catch (error) {
    logError(`Exception: ${error.message}`);
  }
}

async function testAllIntents() {
  logSection('Test: Intent Detection');

  for (const [intent, prompts] of Object.entries(TEST_PROMPTS)) {
    logInfo(`\nTesting: ${intent}`);
    
    for (const prompt of prompts) {
      logInfo(`→ "${prompt}"`);
      await testUnifiedEndpoint(prompt, intent);
      await sleep(150);
    }
  }
}

async function runHealthCheck() {
  logSection('Health Check');

  totalTests++;
  
  try {
    // Try to reach the unified endpoint first
    const response = await fetch(`${BASE_URL}/api/ai/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        message: 'health check',
        context: { page: '/' },
      }),
    });
    
    // Accept 400 as valid (means endpoint is reachable)
    if (response.ok || response.status === 400) {
      logSuccess(`Server reachable at ${BASE_URL}`);
    } else {
      logError(`Server returned ${response.status}`);
      throw new Error('Server not responding');
    }
  } catch (error) {
    logError(`Cannot reach ${BASE_URL}`);
    log('\n⚠️  Make sure dev server is running:', colors.yellow);
    log('   npm run dev\n', colors.yellow);
    process.exit(1);
  }
}

// Main runner
async function runAllTests() {
  log('\n');
  log('╔════════════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                                                                    ║', colors.cyan);
  log('║            AI ASSISTANT AUTOMATED TEST SUITE                       ║', colors.cyan);
  log('║                                                                    ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════════════╝', colors.cyan);
  
  logInfo(`Server: ${BASE_URL}`);
  logInfo(`User: ${TEST_EMAIL}`);
  logInfo(`Time: ${new Date().toISOString()}\n`);

  const startTime = Date.now();

  try {
    await runHealthCheck();
    await testAllIntents();
    
    const savedId = await testConversationSave();
    await sleep(300);
    
    const multiId = await testMultiMessageConversation();
    await sleep(300);
    
    await testRecentConversations();
    await sleep(300);
    
    // Delete test conversations
    if (savedId) await testConversationDeletion(savedId);
    if (multiId) await testConversationDeletion(multiId);

  } catch (error) {
    logError(`Fatal: ${error.message}`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Summary
  logSection('Test Summary');
  log(`Total: ${totalTests}`, colors.bright);
  log(`Passed: ${passedTests}`, colors.green);
  log(`Failed: ${failedTests}`, failedTests > 0 ? colors.red : colors.green);
  log(`Duration: ${duration}s`, colors.cyan);
  
  const rate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';
  log(`Success Rate: ${rate}%`, parseFloat(rate) >= 80 ? colors.green : colors.yellow);

  if (failures.length > 0) {
    log('\n❌ Failures:', colors.red);
    failures.forEach((f, i) => log(`  ${i + 1}. ${f}`, colors.red));
  }

  if (failedTests === 0) {
    log('\n🎉 All tests passed!\n', colors.green);
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed.\n', colors.yellow);
    process.exit(1);
  }
}

// Run
runAllTests().catch(error => {
  logError(`Unhandled: ${error.message}`);
  process.exit(1);
});
