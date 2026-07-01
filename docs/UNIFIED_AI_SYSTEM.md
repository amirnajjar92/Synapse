# 🤖 Unified AI Assistant System

## Overview

The Unified AI Assistant is a context-aware, intelligent interface that provides a single entry point for all AI interactions in your fitness app. It automatically detects user intent and routes requests to the appropriate functionality.

## ✨ Features

### 1. **Single Entry Point**
- Click the AI icon in the FloatingNavBar from any page
- Consistent interface across the entire app
- No confusion about which input box to use

### 2. **Smart Intent Detection**
The system automatically detects what users want to do based on:
- **Keywords** in their message
- **Current page context** (planner, monitor, progress tracker, etc.)
- **Conversation history**
- **Patterns** in the message (e.g., past tense verbs + metrics = activity logging)

### 3. **Supported Intents**

#### 🎯 Plan Creation
**Keywords:** plan, create, make, goal, target, want to, need to, lose weight, build muscle
**Examples:**
- "Create a 30-day plan to lose 5kg"
- "I want to build muscle"
- "Help me train for a marathon"

#### ✏️ Plan Modification
**Keywords:** modify, update, change, edit + plan
**Examples:**
- "Add more cardio to my plan"
- "Change my goal to lose 7kg"
- "Make my workouts easier"

#### 📊 Activity Logging
**Keywords:** ran, walked, cycled, workout, distance, km, pace, time, weight, log, track
**Patterns:** Past tense verbs + numbers + units
**Examples:**
- "Ran 10km in 50 minutes"
- "Walked 5km today"
- "Weight 72.5kg, ran 8km, pace 5:15/km"

#### 📈 Analysis
**Keywords:** analyze, progress, show, trend, compare, stats, how am i doing
**Examples:**
- "How am I doing this week?"
- "Show my distance trends"
- "Analyze my progress"

#### ❓ Questions
**Keywords:** what, when, where, why, how, can i, should i, help, advice
**Examples:**
- "What should I eat after workout?"
- "How can I improve my pace?"
- "Help me understand my metrics"

### 4. **Context-Aware Suggestions**
The modal shows different quick suggestions based on the current page:

**On Planner Page:**
- 🎯 Create a fitness plan
- ✏️ Modify my plan
- 💪 Set new goals

**On Monitor Page:**
- 📊 Log today's activity
- 📈 Analyze my progress
- 🔍 Track metrics

**On Progress Tracker:**
- ✅ Update progress
- 📊 Analyze plan progress
- 🎯 Adjust goals

**On Other Pages:**
- 🎯 Create a fitness plan
- 📊 Log an activity
- 💡 Ask me anything

### 5. **Conversation History**
- Maintains full chat history within the session
- Messages are timestamped
- Clear visual distinction between user and AI messages

### 6. **Live Processing Feedback**
- Shows real-time processing status using ChatRow component
- Displays intent detection results
- Provides feedback on actions taken

## 🏗️ Architecture

### Components

#### 1. `AIAssistantModal.tsx`
**Location:** `/src/components/AIAssistantModal.tsx`

**Features:**
- Full-screen modal matching activity logger style
- Adaptive border radius based on screen size
- Theme-aware (light/dark mode)
- Context-aware suggestions
- Conversation history
- Live processing feedback
- Keyboard shortcuts (ESC to close, Enter to send)

**Props:**
```typescript
interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### 2. `FloatingNavBar.tsx` (Updated)
**Location:** `/src/components/FloatingNavBar.tsx`

**Changes:**
- Added state for AI Assistant modal: `showAIAssistant`
- Updated AI icon click handler to open the unified modal
- Maintains backward compatibility with `onAIClick` prop

### API Endpoints

#### `/api/ai/unified` (New)
**Location:** `/src/app/api/ai/unified/route.ts`

**Purpose:** Smart routing layer that detects intent and routes to appropriate handlers

**Request:**
```typescript
{
  email: string;
  message: string;
  context?: {
    page?: string;
    conversationHistory?: Message[];
  };
}
```

**Response:**
```typescript
{
  intent: 'plan_creation' | 'plan_modification' | 'activity_logging' | 'analysis' | 'question' | 'general';
  processing?: string;
  response: string;
  confidence: 'high' | 'medium' | 'low';
  action?: 'redirect' | 'log' | 'analyze';
  redirectTo?: string;
  metrics?: Array<{type: string; value: number; unit?: string}>;
  suggestion?: string;
}
```

**Intent Detection Algorithm:**
1. Tokenizes the message
2. Scores against keyword lists for each intent
3. Applies pattern matching for specific cases
4. Adds context boost based on current page
5. Calculates confidence based on score and ambiguity
6. Routes to appropriate handler

**Intent Handlers:**
- `handlePlanIntent()` - Creates or modifies plans
- `handleActivityLogging()` - Extracts and logs metrics
- `handleAnalysis()` - Analyzes user data
- `handleGeneralQuery()` - Answers questions

## 🎨 User Experience Flow

### Example 1: Create a Plan
```
User: (clicks AI icon from any page)
Modal: Opens with suggestions including "Create a fitness plan"
User: (types) "I want to lose 5kg in 30 days"
AI: 🎯 Detected intent: plan_creation
AI: ⚙️ Creating your fitness plan...
AI: ✅ I'll help you create a new plan. Please go to the Planner page to see the details.
```

### Example 2: Log Activity
```
User: (clicks AI icon from Monitor page)
Modal: Opens with "Log today's activity" suggestion
User: (types) "Ran 10km in 50 minutes"
AI: 🎯 Detected intent: activity_logging
AI: ⚙️ Extracting metrics...
AI: ✅ Activity logged successfully! Recorded: distance: 10km, totalTime: 3000 seconds, pace: 5:00/km
```

### Example 3: Ask a Question
```
User: (types) "What can you do?"
AI: 🎯 Detected intent: question
AI: ✅ I'm your AI fitness assistant! I can:
     • Create personalized fitness plans
     • Log and track your activities
     • Extract metrics from your notes
     • Analyze your progress
     • Answer fitness-related questions
```

## 🔄 Integration with Existing Features

### Preserves Existing Functionality
- **Planner page PromptBox** - Still works for direct plan creation
- **Monitor page Activity Logger** - Still works for activity logging
- **Plan detail modifications** - Still works as before

### New Unified Layer
- Provides **alternative** way to access all features
- More conversational and natural
- Better for users who don't know which feature to use
- Ideal for complex or multi-step requests

## 🚀 Usage Examples

### For Users

**Quick Plan Creation:**
```
User: "30 day weight loss plan"
AI: Creates plan automatically
```

**Activity Logging:**
```
User: "10km run, 50min, pace 5:00"
AI: Logs all metrics automatically
```

**Complex Request:**
```
User: "Create a plan to lose 5kg, then log today's run of 8km"
AI: Handles both intents sequentially
```

**Question:**
```
User: "How do I improve my running pace?"
AI: Provides advice directly
```

## 🛠️ Development

### Adding New Intents

1. Add keywords to intent detection lists in `/api/ai/unified/route.ts`:
```typescript
const NEW_INTENT_KEYWORDS = [
  'keyword1', 'keyword2', 'keyword3'
];
```

2. Add intent type to `Intent` type:
```typescript
type Intent = 'existing_intents' | 'new_intent';
```

3. Add scoring logic in `detectIntent()`:
```typescript
NEW_INTENT_KEYWORDS.forEach(keyword => {
  if (lowerMessage.includes(keyword)) newIntentScore += 1;
});
```

4. Create handler function:
```typescript
async function handleNewIntent(email, message, intentResult, request) {
  // Implementation
  return NextResponse.json({
    intent: 'new_intent',
    response: 'Response message',
    confidence: intentResult.confidence,
  });
}
```

5. Add case to switch statement:
```typescript
case 'new_intent':
  return await handleNewIntent(email, message, intentResult, request);
```

### Testing Intent Detection

Add console logging in the API route to see detection results:
```typescript
console.log('🎯 Intent Detection:', {
  message: message.substring(0, 50) + '...',
  intent: intentResult.intent,
  confidence: intentResult.confidence,
  score: intentResult.score,
});
```

## 📊 Confidence Scoring

**High Confidence (score ≥ 3):**
- Clear keywords present
- Strong patterns matched
- Context supports the intent

**Medium Confidence (score ≥ 2):**
- Some keywords present
- Patterns partially matched
- Some ambiguity exists

**Low Confidence (score < 2):**
- Few or no keywords
- No clear patterns
- High ambiguity

**Confidence Reduction:**
- If top 2 intents have similar scores (ratio < 1.5), confidence is reduced
- Very close scores (ratio < 1.2) result in low confidence

## 🎯 Future Enhancements

### Planned Features
1. **Multi-turn conversations** - Remember context across multiple messages
2. **Natural language plan modifications** - "Make day 3 harder"
3. **Proactive suggestions** - AI suggests based on patterns
4. **Voice input** - Speak instead of type
5. **Image recognition** - Upload meal photos, workout screenshots
6. **Advanced analytics** - Deep insights from conversation patterns
7. **Integration with external APIs** - Weather, nutrition databases, etc.

### Potential Improvements
1. **Machine learning** - Train model on user interactions
2. **Personalization** - Learn user's language patterns
3. **Multi-language support** - Detect and respond in user's language
4. **Sentiment analysis** - Detect frustration, encourage user
5. **Goal tracking** - Proactively remind about goals

## 🐛 Troubleshooting

### Intent Not Detected Correctly
- Check keyword lists in `/api/ai/unified/route.ts`
- Add more specific keywords
- Improve pattern matching

### Modal Not Opening
- Check console for errors
- Verify `showAIAssistant` state in FloatingNavBar
- Ensure modal is imported correctly

### API Errors
- Check network tab for request/response
- Verify email is present in localStorage
- Check backend logs for detailed errors

## 📝 Notes

- The unified system is **additive** - it doesn't replace existing features
- Users can still use PromptBoxes on individual pages
- The AI Assistant provides a more conversational alternative
- Intent detection will improve as more patterns are added
- The system is designed to be extended with new intents easily

## 🤝 Contributing

When adding new features:
1. Update intent detection keywords
2. Create appropriate handler function
3. Update this documentation
4. Add examples to the modal suggestions
5. Test with various phrasings

---

**Built with ❤️ for Synapse Fitness App**
