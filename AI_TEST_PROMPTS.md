# 🧪 AI Assistant - Complete Test Prompts

## 📝 Copy & Paste These Prompts to Test All Features

---

## 🎯 Test 1: Plan Creation

### **Prompt 1.1** - Simple Weight Loss
```
Create a 30-day plan to lose 5kg
```
**Expected:**
- ✅ Intent: `plan_creation`
- ✅ Response includes plan details
- ✅ Navigation button: [Open Planner →]
- ✅ Saved to database

---

### **Prompt 1.2** - Muscle Building
```
I want to build muscle in 45 days
```
**Expected:**
- ✅ Intent: `plan_creation`
- ✅ AI enhancement with duration extraction
- ✅ Link to planner page

---

### **Prompt 1.3** - Natural Language Goal
```
Help me get fit for summer, need to lose weight fast
```
**Expected:**
- ✅ Intent: `plan_creation`
- ✅ Understands goal despite informal language

---

### **Prompt 1.4** - Specific Training
```
Create a marathon training plan for 60 days
```
**Expected:**
- ✅ Intent: `plan_creation`
- ✅ Recognizes cardio focus

---

## 🏃 Test 2: Activity Logging

### **Prompt 2.1** - Simple Run
```
Ran 10km in 50 minutes
```
**Expected:**
- ✅ Intent: `activity_logging`
- ✅ Extracts: distance (10km), time (3000 seconds), pace (5:00/km)
- ✅ Navigation buttons: [View Monitor →] [Check Progress →]
- ✅ Saved to database

---

### **Prompt 2.2** - Detailed Workout
```
Ran 8km in 42 minutes, pace 5:15/km, weight 72.5kg, feeling great!
```
**Expected:**
- ✅ Intent: `activity_logging`
- ✅ Extracts multiple metrics
- ✅ Success message with all metrics listed

---

### **Prompt 2.3** - Weight Only
```
Weight 73kg today
```
**Expected:**
- ✅ Intent: `activity_logging`
- ✅ Extracts: weight (73kg)
- ✅ Success confirmation

---

### **Prompt 2.4** - Different Activity
```
Walked 5km this morning in 60 minutes
```
**Expected:**
- ✅ Intent: `activity_logging`
- ✅ Extracts: distance, time
- ✅ Calculates pace automatically

---

### **Prompt 2.5** - Cycling
```
Cycled 25km in 1 hour, average speed 25km/h
```
**Expected:**
- ✅ Intent: `activity_logging`
- ✅ Extracts: distance, time, speed

---

## ❓ Test 3: Questions & Help

### **Prompt 3.1** - Capabilities
```
What can you do?
```
**Expected:**
- ✅ Intent: `question`
- ✅ Lists all capabilities
- ✅ Navigation buttons: [Start Planning →] [Log Activity →]

---

### **Prompt 3.2** - General Help
```
help
```
**Expected:**
- ✅ Intent: `question`
- ✅ Shows detailed help menu
- ✅ Multiple navigation links
- ✅ Categorized by feature

---

### **Prompt 3.3** - Fitness Question
```
What should I eat after a workout?
```
**Expected:**
- ✅ Intent: `question`
- ✅ Provides helpful advice
- ✅ May include suggestions

---

### **Prompt 3.4** - How-To Question
```
How do I improve my running pace?
```
**Expected:**
- ✅ Intent: `question`
- ✅ Training tips provided

---

## 📊 Test 4: Analysis Requests

### **Prompt 4.1** - Progress Check
```
How am I doing this week?
```
**Expected:**
- ✅ Intent: `analysis`
- ✅ Response with navigation to Monitor
- ✅ Buttons: [Open Monitor →] [View Progress →]

---

### **Prompt 4.2** - Trend Analysis
```
Show me my distance trends
```
**Expected:**
- ✅ Intent: `analysis`
- ✅ Directs to appropriate page

---

### **Prompt 4.3** - Performance Query
```
Am I improving?
```
**Expected:**
- ✅ Intent: `analysis`
- ✅ Helpful response with links

---

## 🔄 Test 5: Plan Modification

### **Prompt 5.1** - Update Existing Plan
```
Modify my current plan to include more cardio
```
**Expected:**
- ✅ Intent: `plan_modification`
- ✅ Checks for active plan
- ✅ Appropriate response based on plan status

---

### **Prompt 5.2** - Change Goal
```
Update my plan to lose 7kg instead of 5kg
```
**Expected:**
- ✅ Intent: `plan_modification`
- ✅ Understands goal change

---

## 🧠 Test 6: Context Awareness

### **Test 6.1** - On Planner Page
Navigate to `/planner`, then open AI and check suggestions:

**Expected Suggestions:**
```
💡 I can help you:
• 🎯 Create a fitness plan
• ✏️ Modify my plan
• 💪 Set new goals
```

---

### **Test 6.2** - On Monitor Page
Navigate to `/monitor`, then open AI and check suggestions:

**Expected Suggestions:**
```
💡 I can help you:
• 📊 Log today's activity
• 📈 Analyze my progress
• 🔍 Track metrics
```

---

### **Test 6.3** - On Progress Tracker
Navigate to `/plan-progress-tracker`, then open AI:

**Expected Suggestions:**
```
💡 I can help you:
• ✅ Update progress
• 📊 Analyze plan progress
• 🎯 Adjust goals
```

---

## 💾 Test 7: Conversation Persistence

### **Test 7.1** - Save and Resume
```
1. Send: "Create a plan to lose 5kg"
2. Close modal
3. Reopen modal
4. Expected: Previous message visible
```

---

### **Test 7.2** - Multi-Message Conversation
```
1. Send: "What can you do?"
2. Send: "Create a plan"
3. Send: "Ran 10km today"
4. Close and reopen
5. Expected: All 6 messages visible (3 user + 3 assistant)
```

---

### **Test 7.3** - New Conversation
```
1. Have existing conversation
2. Click "+" button
3. Send new message
4. Expected: Fresh conversation, old one saved in DB
```

---

## 🔗 Test 8: Navigation Links

### **Test 8.1** - Plan Creation Link
```
Send: "Create a plan to lose weight"
Expected: [Open Planner →] button appears
Click: Navigates to /planner, modal closes
```

---

### **Test 8.2** - Activity Logging Links
```
Send: "Ran 10km today"
Expected: [View Monitor →] [Check Progress →] buttons
Click either: Navigates to page, modal closes
```

---

### **Test 8.3** - Help Menu Links
```
Send: "help"
Expected: Multiple navigation buttons
Click any: Navigates correctly
```

---

## 🧹 Test 9: State Management

### **Test 9.1** - Clean ChatRow
```
1. Send message 1
2. Wait for response
3. Send message 2
4. Expected: ChatRow clears old processing messages
5. Only shows current request processing
```

---

### **Test 9.2** - Conversation History Preserved
```
1. Send multiple messages
2. Check: All appear in conversation bubbles
3. Check: User messages on right (purple)
4. Check: AI messages on left with navigation buttons
```

---

## 🎭 Test 10: Edge Cases

### **Test 10.1** - Ambiguous Input
```
asdfghjkl
```
**Expected:**
- ✅ Intent: `general`
- ✅ Asks for clarification
- ✅ Helpful suggestions

---

### **Test 10.2** - Very Long Message
```
I want to create a comprehensive fitness plan that includes weight loss, muscle building, cardio improvement, flexibility training, and nutrition guidance for the next 90 days with specific daily schedules and meal plans
```
**Expected:**
- ✅ Handles long input
- ✅ Detects intent correctly
- ✅ Appropriate response

---

### **Test 10.3** - Empty/Whitespace
```
    
(just spaces)
```
**Expected:**
- ✅ No message sent
- ✅ SEND button disabled or no action

---

### **Test 10.4** - Special Characters
```
I want to lose 5kg!!!!! 🏃‍♂️💪
```
**Expected:**
- ✅ Handles emojis and special chars
- ✅ Extracts meaningful content
- ✅ Intent detected

---

### **Test 10.5** - Mixed Language
```
Create plan lose 5kg in 30 days need help
```
**Expected:**
- ✅ Understands despite grammar
- ✅ Intent: `plan_creation`

---

## 🎨 Test 11: Theme & UI

### **Test 11.1** - Dark Mode
```
1. Ensure dark mode active
2. Open AI modal
3. Check: All text readable
4. Check: Navigation buttons visible
5. Check: Proper contrast
```

---

### **Test 11.2** - Light Mode
```
1. Switch to light mode
2. Open AI modal
3. Check: Colors adapt
4. Check: Text readable
5. Check: Navigation buttons visible
```

---

### **Test 11.3** - Mobile Responsive
```
1. Resize browser to mobile (375px)
2. Open AI modal
3. Check: Modal fits screen
4. Check: Navigation buttons wrap
5. Check: Text readable
6. Check: Touch targets adequate (44x44px)
```

---

## 📊 Test 12: Database Verification

### **After Each Test, Check:**

```bash
# Open Prisma Studio
npx prisma studio

# Check AIConversation table:
# - New conversation created
# - userId linked correctly
# - Timestamps accurate

# Check AIMessage table:
# - Messages saved
# - role correct ('user' or 'assistant')
# - content matches
# - intent saved
# - confidence recorded
# - contextPage recorded
# - metadata present (for activity logging)
```

---

## 🚀 Complete Test Sequence (10 Minutes)

Run these in order for full test:

```
1. What can you do?
2. Create a 30-day plan to lose 5kg
3. I want to build muscle
4. Ran 10km in 50 minutes
5. Weight 72.5kg today
6. How am I doing?
7. help
8. Update my plan
9. Walked 5km this morning
10. What should I eat after workout?
```

**After each:**
- ✅ Check intent detection
- ✅ Check navigation links
- ✅ Check database (Prisma Studio)
- ✅ Test link navigation

---

## ✅ Success Criteria

After testing, you should have:

- [ ] All 12 test categories passed
- [ ] Conversation persists across sessions
- [ ] Navigation links work
- [ ] Database populated with messages
- [ ] No console errors
- [ ] Theme switching works
- [ ] Mobile responsive
- [ ] ChatRow clears between messages
- [ ] Intent detection accurate
- [ ] Metadata saved correctly

---

## 🐛 If Tests Fail

### **500 Error on Save:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Restart dev server
npm run dev
```

### **Messages Not Loading:**
```javascript
// Check localStorage
console.log(localStorage.getItem('synapse_user'));
// Should have email
```

### **Intent Not Detected:**
```javascript
// Check console for intent logs
// Look for: 🎯 Intent Detection: {...}
```

---

**Happy Testing! 🎉**

Use these prompts to verify every feature works perfectly!
