# 🏗️ Unified AI System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────┐
         │      FloatingNavBar (All Pages)          │
         │  ┌────────────────────────────────────┐  │
         │  │  [Events] [Media] [Progress] ...   │  │
         │  │  [Water] [Plans] [Planner] [AI 🤖] │  │
         │  └────────────────────────────────────┘  │
         └──────────────────┬───────────────────────┘
                            │ onClick AI Icon
                            ▼
         ┌──────────────────────────────────────────┐
         │        AIAssistantModal                   │
         │  ┌────────────────────────────────────┐  │
         │  │  💡 Context-Aware Suggestions       │  │
         │  │  • Create a fitness plan            │  │
         │  │  • Log today's activity             │  │
         │  │  • Ask me anything                  │  │
         │  ├────────────────────────────────────┤  │
         │  │  [Conversation History]             │  │
         │  │  User: "Ran 10km today"             │  │
         │  │  AI: "Logged successfully!"         │  │
         │  ├────────────────────────────────────┤  │
         │  │  [Input: Tell me anything...]       │  │
         │  │  [SEND BUTTON]                      │  │
         │  └────────────────────────────────────┘  │
         └──────────────────┬───────────────────────┘
                            │ User sends message
                            ▼
         ┌──────────────────────────────────────────┐
         │      /api/ai/unified (POST)              │
         │                                          │
         │  Request Body:                           │
         │  {                                       │
         │    email: string,                        │
         │    message: string,                      │
         │    context: {                            │
         │      page: string,                       │
         │      conversationHistory: []             │
         │    }                                     │
         │  }                                       │
         └──────────────────┬───────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────────┐
         │       Intent Detection Engine            │
         │                                          │
         │  1. Tokenize message                     │
         │  2. Score against keyword lists:         │
         │     - PLAN_KEYWORDS                      │
         │     - ACTIVITY_KEYWORDS                  │
         │     - ANALYSIS_KEYWORDS                  │
         │     - QUESTION_KEYWORDS                  │
         │  3. Pattern matching:                    │
         │     - Activity patterns (ran \d+km)      │
         │     - Plan patterns (want to lose)       │
         │  4. Context boost (page location)        │
         │  5. Calculate confidence score           │
         │                                          │
         │  Output: {                               │
         │    intent: Intent,                       │
         │    score: number,                        │
         │    confidence: 'high'|'medium'|'low'     │
         │  }                                       │
         └──────────────────┬───────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Intent Routing        │
              └─────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Plan Intent   │   │  Activity     │   │   Question/   │
│   Handler     │   │   Logging     │   │   Analysis    │
│               │   │   Handler     │   │   Handler     │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Check active  │   │ Extract       │   │ Provide       │
│ plan status   │   │ metrics from  │   │ informative   │
│               │   │ message       │   │ response      │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        │                   ▼                   │
        │           ┌───────────────┐           │
        │           │ Call existing │           │
        │           │ analyze API   │           │
        │           │ /daily-       │           │
        │           │ entries/      │           │
        │           │ [date]/       │           │
        │           │ analyze       │           │
        │           └───────┬───────┘           │
        │                   │                   │
        │                   ▼                   │
        │           ┌───────────────┐           │
        │           │ Save to DB    │           │
        │           │ (Prisma)      │           │
        │           └───────┬───────┘           │
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────────┐
         │         Response to Client               │
         │                                          │
         │  {                                       │
         │    intent: 'activity_logging',           │
         │    processing: 'Extracting metrics...',  │
         │    response: 'Activity logged!',         │
         │    confidence: 'high',                   │
         │    metrics: [                            │
         │      {type: 'distance', value: 10, ...}  │
         │    ]                                     │
         │  }                                       │
         └──────────────────┬───────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────────┐
         │      AIAssistantModal Updates            │
         │                                          │
         │  1. Add user message to history          │
         │  2. Show live processing feedback        │
         │  3. Add AI response to history           │
         │  4. Display success/error state          │
         └──────────────────────────────────────────┘
```

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Page Components                          │
│  /planner  /monitor  /progress-tracker  /water  /events         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ All pages include
                                 ▼
                    ┌────────────────────────┐
                    │   FloatingNavBar       │
                    │   (Global Component)   │
                    └────────────┬───────────┘
                                 │
                                 │ State: showAIAssistant
                                 ▼
                    ┌────────────────────────┐
                    │  AIAssistantModal      │
                    │  isOpen={true/false}   │
                    └────────────┬───────────┘
                                 │
                    ┌────────────┴───────────┐
                    │                        │
                    ▼                        ▼
          ┌──────────────────┐    ┌──────────────────┐
          │   ChatRow        │    │  CustomButton    │
          │   (Processing    │    │  (Send button)   │
          │   feedback)      │    │                  │
          └──────────────────┘    └──────────────────┘
```

## Intent Detection Algorithm Flow

```
                    User Message Input
                           │
                           ▼
              ┌────────────────────────┐
              │  Tokenize & Lowercase  │
              │  "Ran 10km in 50min"   │
              │  → ["ran","10km",...]  │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Keyword Scoring      │
              │                        │
              │  PLAN_KEYWORDS: 0      │
              │  ACTIVITY_KEYWORDS: 3  │◄── "ran", "10km", "50min"
              │  ANALYSIS_KEYWORDS: 0  │
              │  QUESTION_KEYWORDS: 0  │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Pattern Matching     │
              │                        │
              │  /ran\s+\d+/ ✓ +2     │◄── Regex patterns
              │  /\d+\s*km/ ✓ +2      │
              │  /\d+\s*min/ ✓ +2     │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Context Boost        │
              │                        │
              │  Page: /monitor  +1    │◄── Current page
              │  Activity score: 8     │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Confidence Calc       │
              │                        │
              │  Score ≥ 3: HIGH ✓     │
              │  Top vs 2nd: 8 vs 0    │
              │  Confidence: HIGH      │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Final Result         │
              │                        │
              │  intent: 'activity_    │
              │           logging'     │
              │  score: 8              │
              │  confidence: 'high'    │
              └────────────────────────┘
```

## Data Flow - Activity Logging Example

```
1. User Input
   ─────────────────────────────────────────────────────
   User types: "Ran 10km in 50 minutes"
   
2. Modal Processing
   ─────────────────────────────────────────────────────
   AIAssistantModal:
   - Adds to conversation history
   - Shows ChatRow with "🤖 Analyzing..."
   - Calls /api/ai/unified
   
3. Intent Detection
   ─────────────────────────────────────────────────────
   /api/ai/unified:
   - Detects: activity_logging (high confidence)
   - Routes to: handleActivityLogging()
   
4. Metric Extraction
   ─────────────────────────────────────────────────────
   handleActivityLogging():
   - Calls: /api/users/me/daily-entries/[date]/analyze
   - Passes: email, prompt="Ran 10km in 50 minutes"
   
5. AI Analysis
   ─────────────────────────────────────────────────────
   analyze/route.ts:
   - Calls: /api/ai/analyse
   - Extracts metrics:
     * distance: 10 (km)
     * totalTime: 3000 (seconds)
     * pace: 300 (seconds/km = 5:00/km)
   
6. Database Save
   ─────────────────────────────────────────────────────
   Prisma:
   - Finds or creates DailyEntry for today
   - Updates metrics array
   - Saves to database
   
7. Response to Client
   ─────────────────────────────────────────────────────
   Returns to modal:
   {
     intent: 'activity_logging',
     response: 'Activity logged! Recorded: distance: 10km...',
     metrics: [{type: 'distance', value: 10, ...}]
   }
   
8. UI Update
   ─────────────────────────────────────────────────────
   AIAssistantModal:
   - Updates ChatRow: "✅ Activity logged successfully!"
   - Adds AI response to conversation history
   - Shows metrics recorded
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    FloatingNavBar State                     │
├─────────────────────────────────────────────────────────────┤
│  showAIAssistant: boolean                                   │
│  isExpanded: boolean                                        │
│  activePlan: Plan | null                                    │
│  currentTheme: string                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Pass down as props
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  AIAssistantModal State                     │
├─────────────────────────────────────────────────────────────┤
│  userInput: string                                          │
│  messages: Message[]                                        │
│  isProcessing: boolean                                      │
│  chatMessages: string[]                                     │
│  currentTheme: string                                       │
│  borderRadius: string                                       │
└─────────────────────────────────────────────────────────────┘
```

## API Route Structure

```
/api/
├── ai/
│   ├── unified/           ← NEW: Smart routing endpoint
│   │   └── route.ts
│   └── analyse/           ← Existing: Metric extraction
│       └── route.ts
├── users/
│   └── me/
│       ├── plans/         ← Existing: Get user plans
│       │   └── route.ts
│       └── daily-entries/
│           └── [date]/
│               └── analyze/ ← Existing: Save metrics
│                   └── route.ts
```

## Technology Stack

```
Frontend:
┌──────────────────────────────────────┐
│ • Next.js 14 (App Router)            │
│ • React 18 (Client Components)       │
│ • TypeScript                         │
│ • Tailwind CSS                       │
│ • Custom Theme System                │
└──────────────────────────────────────┘

Backend:
┌──────────────────────────────────────┐
│ • Next.js API Routes                 │
│ • Prisma ORM                         │
│ • PostgreSQL/MySQL                   │
│ • AI/LLM Integration                 │
└──────────────────────────────────────┘

State Management:
┌──────────────────────────────────────┐
│ • React useState/useEffect           │
│ • localStorage (user data)           │
│ • Custom hooks                       │
└──────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  • User authentication stored in localStorage          │
│  • Theme preferences                                   │
│  • Conversation history (session only)                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     API Layer                           │
│  • Validates user email from request                   │
│  • Server-side intent detection                        │
│  • Input sanitization                                  │
│  • Rate limiting (future)                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ ORM
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                        │
│  • Prisma ORM (SQL injection protection)               │
│  • User data isolation                                 │
│  • Encrypted connections                               │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations

```
┌─────────────────────────────────────────────────────────┐
│                   Optimization Strategy                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Modal Rendering:                                       │
│  • Conditional render (only when open)                  │
│  • Memoized message components                          │
│  • Virtualized scroll (future)                          │
│                                                         │
│  API Calls:                                             │
│  • Intent detection is fast (keyword matching)          │
│  • Async handlers don't block                           │
│  • Cached theme data                                    │
│                                                         │
│  State Updates:                                         │
│  • Batched React updates                                │
│  • Debounced typing indicators (future)                 │
│  • Optimistic UI updates                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides a scalable, maintainable foundation for your unified AI assistant system!
