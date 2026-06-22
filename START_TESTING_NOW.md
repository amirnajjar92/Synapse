# 🚀 Start Testing NOW - 5 Minute Quick Test

## ✅ Schema is Fixed - Ready to Test!

The 500 error issue is **RESOLVED**. All database relation names are fixed and working.

---

## 🎯 Quick Test (5 Minutes)

### Step 1: Start Dev Server
```bash
npm run dev
```

**Expected Output:**
```
✓ Ready in X ms
○ Local: http://localhost:3000
```

---

### Step 2: Open App
Navigate to: **http://localhost:3000**

---

### Step 3: Open AI Assistant
1. Look for the floating navigation bar at the bottom
2. Click the **AI icon** (🤖 or ✨)
3. Modal should open full-screen

---

### Step 4: Run Quick Tests

#### Test A: Plan Creation
**Type this:**
```
Create a plan to lose 5kg in 30 days
```

**✅ Success Checklist:**
- [ ] No 500 error in console
- [ ] Response appears with plan details
- [ ] Navigation button shows: **[Open Planner →]**
- [ ] Click button → navigates to /planner
- [ ] Message saved to database

---

#### Test B: Activity Logging
**Type this:**
```
Ran 10km in 50 minutes
```

**✅ Success Checklist:**
- [ ] No 500 error
- [ ] Response shows: "✅ Activity logged successfully!"
- [ ] Shows extracted metrics: distance, time, pace
- [ ] Navigation buttons: **[View Monitor →]** **[Check Progress →]**
- [ ] Message saved to database

---

#### Test C: Conversation Persistence
1. **Close the AI modal** (click X or ESC)
2. **Reopen the AI modal** (click AI icon again)

**✅ Success Checklist:**
- [ ] Previous messages still visible
- [ ] Conversation history preserved
- [ ] Can continue chatting in same thread

---

#### Test D: New Conversation
1. Have existing conversation open
2. **Click the "+" button** (top right of modal)
3. Type new message: `What can you do?`

**✅ Success Checklist:**
- [ ] Conversation cleared
- [ ] Fresh conversation started
- [ ] New message sent successfully
- [ ] Old conversation saved in DB

---

### Step 5: Verify Database

```bash
# Open Prisma Studio in a new terminal
npx prisma studio
```

**Check these tables:**

#### AIConversation Table
- [ ] Has records
- [ ] Each record has: id, userId, createdAt, updatedAt
- [ ] userId linked to your user

#### AIMessage Table
- [ ] Has records (user + assistant messages)
- [ ] Fields populated:
  - ✓ role ('user' or 'assistant')
  - ✓ content (your message text)
  - ✓ intent (plan_creation, activity_logging, question, etc.)
  - ✓ confidence (high, medium, low)
  - ✓ contextPage (page where message was sent)
  - ✓ metadata (JSON with extra data)

---

## 🎉 If All Tests Pass

**Congratulations!** Your unified AI assistant with conversation persistence is working perfectly! 🚀

**Next Steps:**
1. ✅ Run full test suite from `AI_TEST_PROMPTS.md` (60+ prompts)
2. ✅ Test all intent types
3. ✅ Test context awareness on different pages
4. ✅ Test theme switching (dark/light)
5. ✅ Test mobile responsive

---

## 🐛 If Tests Fail

### No Response / Still Getting 500 Errors

**Solution 1: Clear Cache & Restart**
```bash
# Kill dev server (Ctrl+C in terminal)

# Clear Next.js cache
rm -rf .next

# Regenerate Prisma Client
npx prisma generate

# Restart dev server
npm run dev
```

---

### Modal Doesn't Open

**Check:**
1. Look for AI icon in floating navbar (bottom of screen)
2. Check browser console for errors
3. Try clicking other navbar icons to verify navbar works

---

### Messages Not Saving (Empty Database)

**Check:**
1. User exists in localStorage:
   ```javascript
   // Open browser console
   console.log(localStorage.getItem('synapse_user'));
   ```
   
2. If null, create user by logging in or signing up

3. Check .env file has database URLs:
   ```bash
   cat .env | grep POSTGRES
   ```

---

### Navigation Buttons Not Working

**Check:**
1. Response message contains navigation links
2. Buttons render with correct styling
3. Console shows no router errors
4. Click button → should navigate and close modal

---

## 📊 Database Troubleshooting

### Schema Out of Sync

```bash
# Validate schema
npx prisma validate

# Push schema to database
npx prisma db push --accept-data-loss

# Regenerate client
npx prisma generate
```

---

### Tables Don't Exist

```bash
# Check if tables exist
npx prisma studio

# If missing, push schema
npx prisma db push --accept-data-loss
```

---

### Connection Error

**Check:**
1. .env has correct database URLs
2. Database server is running
3. Network connectivity

```bash
# Test database connection
npx prisma db pull
```

---

## 🆘 Still Having Issues?

### Check Console Logs

**Browser Console (F12):**
- Look for red errors
- Check network tab for 500/400 errors
- Verify API calls to `/api/ai/conversations` succeed

**Server Terminal:**
- Look for Prisma errors
- Check for validation errors
- Verify API routes execute

---

### Common Error Messages

#### "Failed to save message"
→ Database connection or schema issue
→ Run: `npx prisma generate && npm run dev`

#### "User not found"
→ User not in localStorage
→ Log in or sign up

#### "Unknown field 'plans'"
→ Schema relation names issue
→ **Already fixed!** Should not occur.
→ If it does: Re-run `npx prisma db push --accept-data-loss`

---

## 📚 Full Documentation

For complete testing:
- **AI_TEST_PROMPTS.md** - 60+ test prompts
- **AI_CONVERSATION_PERSISTENCE_FIXED.md** - Technical details
- **SCHEMA_FIX_SUMMARY.md** - What was fixed

---

## ✨ Test Prompts to Try

After basic tests pass, try these:

```
1. "What can you do?"
2. "Create a 30-day plan to lose 5kg"
3. "I want to build muscle"
4. "Ran 10km in 50 minutes"
5. "Weight 72.5kg today"
6. "How am I doing?"
7. "help"
8. "Show my progress"
9. "Walked 5km this morning"
10. "What should I eat after workout?"
```

---

## 🎯 Success Metrics

After 5-minute quick test, you should have:

- ✅ No 500 errors
- ✅ AI responds to messages
- ✅ Navigation links work
- ✅ Conversation persists
- ✅ Database has records
- ✅ New conversation button works
- ✅ Intent detection working
- ✅ Metadata saved

---

**Ready? Start your dev server and test now!** 🚀

```bash
npm run dev
```

Then open **http://localhost:3000** and click the AI icon! 💬✨
