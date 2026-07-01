# 💾 AI Conversation Persistence - Implementation Guide

## ✨ New Feature: Conversation History in Database

Your AI Assistant now **saves all conversations to the database** so users can:
- 📝 View conversation history
- 🔄 Resume previous conversations
- 🗑️ Delete old conversations
- 📊 Track AI usage patterns

---

## 🗄️ Database Schema

### **New Models Added:**

#### **1. AIConversation**
Represents a conversation session between user and AI.

```prisma
model AIConversation {
  id          String             @id @default(cuid())
  userId      String
  sessionId   String?            // Optional session grouping
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages    AIMessage[]

  @@index([userId, createdAt])
}
```

#### **2. AIMessage**
Individual messages within a conversation.

```prisma
model AIMessage {
  id              String           @id @default(cuid())
  conversationId  String
  role            String           // 'user' or 'assistant'
  content         String           @db.Text
  intent          String?          // Detected intent
  confidence      String?          // 'high', 'medium', 'low'
  contextPage     String?          // Page where message was sent
  metadata        Json?            // Additional data
  createdAt       DateTime         @default(now())

  conversation    AIConversation   @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
}
```

---

## 🚀 Database Migration Steps

### **STEP 1: Run Prisma Migration**

```bash
cd /Users/amirnajjar/Synapse

# Generate migration
npx prisma migrate dev --name add-ai-conversations

# This will:
# 1. Create the new tables
# 2. Update Prisma Client
# 3. Apply changes to your database
```

### **STEP 2: Verify Migration**

```bash
# Check Prisma Studio to see new tables
npx prisma studio

# Look for:
# - AIConversation table
# - AIMessage table
```

---

## 📁 New Files Created

### **1. API Route: `/api/ai/conversations`**
**File:** `/src/app/api/ai/conversations/route.ts`

**Endpoints:**

#### **GET** - Retrieve conversations
```typescript
GET /api/ai/conversations?email=user@example.com&limit=50

// Get specific conversation
GET /api/ai/conversations?email=user@example.com&conversationId=abc123
```

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_123",
      "userId": "user_456",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:05:00Z",
      "messages": [
        {
          "id": "msg_789",
          "role": "user",
          "content": "Create a plan to lose 5kg",
          "intent": "plan_creation",
          "confidence": "high",
          "contextPage": "/planner",
          "createdAt": "2024-01-01T10:00:00Z"
        }
      ]
    }
  ]
}
```

#### **POST** - Save a message
```typescript
POST /api/ai/conversations

Body:
{
  "email": "user@example.com",
  "conversationId": "conv_123", // Optional, creates new if not provided
  "role": "user",
  "content": "Ran 10km today",
  "intent": "activity_logging",
  "confidence": "high",
  "contextPage": "/monitor",
  "metadata": { "metrics": [...] }
}
```

**Response:**
```json
{
  "success": true,
  "message": { /* saved message */ },
  "conversationId": "conv_123"
}
```

#### **DELETE** - Delete a conversation
```typescript
DELETE /api/ai/conversations?conversationId=conv_123&email=user@example.com
```

---

## 🔧 Component Changes

### **AIAssistantModal Updates:**

#### **1. New State:**
```typescript
const [conversationId, setConversationId] = useState<string | null>(null);
```

#### **2. New Functions:**

**saveMessageToDb()** - Saves each message
```typescript
await saveMessageToDb(
  'user',              // role
  'Ran 10km today',    // content
  'activity_logging',  // intent (optional)
  'high',              // confidence (optional)
  { metrics: [...] }   // metadata (optional)
);
```

**loadConversationHistory()** - Loads last conversation
```typescript
// Called when modal opens
// Loads last 5 messages from most recent conversation
```

**startNewConversation()** - Starts fresh conversation
```typescript
// Clears conversationId and messages
// Next message creates new conversation
```

#### **3. Auto-save on Send:**
```typescript
handleSendMessage() {
  // Saves user message
  await saveMessageToDb('user', userMessage.content);
  
  // ... AI processing ...
  
  // Saves assistant response
  await saveMessageToDb('assistant', aiResponse.content, intent, confidence, metadata);
}
```

---

## 🎯 How It Works

### **User Flow:**

```
1. User opens AI modal
   ↓
2. Modal loads last conversation (if exists)
   ↓
3. User sees previous messages
   ↓
4. User types new message
   ↓
5. Message saved to DB (user role)
   ↓
6. AI processes and responds
   ↓
7. Response saved to DB (assistant role)
   ↓
8. Both messages linked to same conversation
```

### **Conversation Lifecycle:**

```
New User:
└─ Opens modal → No history → Clean start → First message creates conversation

Returning User:
└─ Opens modal → Loads last conversation → Shows history → Continues in same conversation

Start New:
└─ Clicks "+" button → Clears conversation → Next message creates new conversation
```

---

## 💾 What Gets Saved

### **For Each Message:**

| Field | Description | Example |
|-------|-------------|---------|
| role | Who sent it | 'user' or 'assistant' |
| content | Message text | "Ran 10km in 50 minutes" |
| intent | Detected intent | "activity_logging" |
| confidence | Detection confidence | "high" |
| contextPage | Current page | "/monitor" |
| metadata | Additional data | `{ metrics: [...], navigationLinks: [...] }` |
| createdAt | Timestamp | "2024-01-01T10:00:00Z" |

### **metadata JSON includes:**
```json
{
  "metrics": [
    { "type": "distance", "value": 10, "unit": "km" }
  ],
  "navigationLinks": [
    { "text": "View Monitor", "path": "/monitor" }
  ],
  "action": "log",
  "redirectTo": "/monitor"
}
```

---

## 🎨 UI Changes

### **New "New Conversation" Button:**

Located in modal header (next to X button):

```
┌─────────────────────────────────────┐
│ [AI] AI Assistant     [+]  [X]      │
│     Your fitness companion          │
└─────────────────────────────────────┘
        ↑ New button appears when there are messages
```

**Behavior:**
- Only shows when `messages.length > 0`
- Click → Clears current conversation
- Next message starts new conversation
- Old conversation preserved in DB

---

## 📊 Use Cases

### **1. Resume Previous Conversation**
```
Day 1:
User: "Create a plan to lose 5kg"
AI: "Plan created! [Open Planner]"

Day 2:
User opens modal → Sees Day 1 conversation
User: "Modify the plan to lose 7kg"
AI: Knows context from previous conversation
```

### **2. Review Past Interactions**
```
Admin dashboard (future):
- View all user conversations
- Analyze common questions
- Improve AI responses
- Track user engagement
```

### **3. Conversation Analytics**
```
Query database:
- Most common intents
- Average conversation length
- Success rate by confidence level
- Page-specific usage patterns
```

---

## 🔍 Database Queries

### **Get user's conversations:**
```typescript
const conversations = await prisma.aIConversation.findMany({
  where: { userId: user.id },
  include: { messages: true },
  orderBy: { updatedAt: 'desc' },
});
```

### **Get messages by intent:**
```typescript
const planMessages = await prisma.aIMessage.findMany({
  where: { intent: 'plan_creation' },
  include: { conversation: { include: { user: true } } },
});
```

### **Count conversations per user:**
```typescript
const count = await prisma.aIConversation.count({
  where: { userId: user.id },
});
```

---

## 🧪 Testing

### **Test 1: First Message**
```
1. Open AI modal (new user)
2. Send: "Create a plan"
3. Check DB: New conversation + 2 messages created
4. conversationId stored in component state
```

### **Test 2: Continue Conversation**
```
1. Send another message without closing modal
2. Check DB: Same conversation, new message added
3. Verify conversationId unchanged
```

### **Test 3: Resume on Reopen**
```
1. Close modal
2. Reopen modal
3. Check: Previous messages loaded
4. Send new message: Uses same conversation
```

### **Test 4: New Conversation**
```
1. Click "+" button in header
2. Send message
3. Check DB: New conversation created
4. Old conversation still in DB
```

---

## 🐛 Error Handling

### **Failed to save:**
```typescript
try {
  await saveMessageToDb(...)
} catch (error) {
  console.error('Failed to save:', error);
  // Message still shows in UI
  // User can continue chatting
  // Next successful save creates/uses conversation
}
```

### **Failed to load:**
```typescript
try {
  await loadConversationHistory()
} catch (error) {
  console.error('Failed to load:', error);
  // Starts with empty conversation
  // First message creates new conversation
}
```

---

## 📈 Performance

### **Optimizations:**

1. **Lazy Loading**
   - Only loads last conversation on open
   - Limits to 5 messages per conversation preview

2. **Indexed Queries**
   ```prisma
   @@index([userId, createdAt])
   @@index([conversationId, createdAt])
   ```

3. **Cascade Deletes**
   - Delete conversation → Messages auto-deleted
   - Delete user → Conversations auto-deleted

4. **Async Saves**
   - Doesn't block UI
   - Fire-and-forget pattern
   - Fails silently without disrupting UX

---

## 🔐 Security

### **Access Control:**
- Users can only access their own conversations
- Email verification before save/load
- Conversation ownership checked on delete

### **Data Privacy:**
- Messages stored as text (not encrypted)
- Consider adding encryption for sensitive data
- Metadata stored as JSON (flexible structure)

---

## 🚀 Future Enhancements

### **Planned Features:**

1. **Conversation List View**
   ```
   [Conversation 1] "Create a plan to lose 5kg..."
   [Conversation 2] "Ran 10km today..."
   [Conversation 3] "What can you do?..."
   ```

2. **Search Conversations**
   ```
   Search: "plan"
   Results: All conversations about plans
   ```

3. **Export Conversation**
   ```
   Download as:
   - JSON
   - Plain text
   - PDF
   ```

4. **Conversation Tagging**
   ```
   Tags: #plan, #activity, #question
   Filter by tag
   ```

5. **Shared Conversations**
   ```
   Share conversation with trainer/coach
   ```

---

## ✅ Migration Checklist

Before deploying:

- [ ] Run `npx prisma migrate dev --name add-ai-conversations`
- [ ] Verify tables created in database
- [ ] Test saving first message
- [ ] Test loading conversation
- [ ] Test new conversation button
- [ ] Test with multiple users
- [ ] Check error handling
- [ ] Verify cascade deletes work
- [ ] Test on production database (backup first!)

---

## 🎉 Summary

### **What You Get:**

✅ **Persistent Conversations** - Never lose chat history
✅ **Context Continuity** - AI remembers previous interactions
✅ **User Analytics** - Track engagement and patterns
✅ **Better UX** - Resume where you left off
✅ **Data Insights** - Analyze user needs
✅ **Scalable** - Indexed and optimized queries

### **User Benefits:**

- 📝 History preserved across sessions
- 🔄 Resume conversations anytime
- 🗑️ Clean slate with new conversation button
- 📊 Track their own AI interactions
- ✨ Better, context-aware responses

---

**Your AI Assistant is now smarter with memory! 🧠💾**
