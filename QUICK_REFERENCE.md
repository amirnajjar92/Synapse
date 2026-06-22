# 🚀 AI Assistant - Quick Reference Card

## ⚡ Quick Start

```bash
# 1. Start server
npm run dev

# 2. Open app
http://localhost:3000

# 3. Click AI icon in navbar
# 4. Start chatting!
```

---

## 🎯 Test Commands

```bash
# Run automated tests
npm run test:ai

# View database
npx prisma studio

# Validate schema
npx prisma validate

# Regenerate client
npx prisma generate
```

---

## 💬 Example Prompts

### Create Plan
```
Create a 30-day plan to lose 5kg
I want to build muscle in 45 days
Help me get fit for summer
```

### Log Activity
```
Ran 10km in 50 minutes
Weight 72.5kg today
Walked 5km this morning
```

### Get Help
```
What can you do?
help
How am I doing?
```

---

## 🗂️ File Locations

| File | Purpose |
|------|---------|
| `src/components/AIAssistantModal.tsx` | Main UI component |
| `src/app/api/ai/unified/route.ts` | Intent detection |
| `src/app/api/ai/conversations/route.ts` | Persistence API |
| `prisma/schema.prisma` | Database schema |
| `scripts/test-ai-assistant.js` | Automated tests |

---

## 🔍 Debugging

### Check Logs
```bash
# Browser console (F12)
# Look for: 🎯 Intent Detection

# Server terminal
# Look for: POST /api/ai/unified
```

### Database Issues
```bash
# Reset and regenerate
rm -rf .next
npx prisma generate
npm run dev
```

### 500 Errors
```bash
# Check schema
npx prisma validate

# Push schema
npx prisma db push --accept-data-loss
```

---

## 📊 Intent Types

| Intent | Keywords | Example |
|--------|----------|---------|
| `plan_creation` | plan, goal, create, lose, gain | "Create a plan" |
| `activity_logging` | ran, walked, weight, km, distance | "Ran 10km" |
| `analysis` | how, progress, trends, show | "How am I doing?" |
| `question` | what, help, can you | "What can you do?" |
| `general` | Anything else | "hello" |

---

## 🎨 UI Features

- ✅ Full-screen modal
- ✅ Context-aware suggestions
- ✅ Live processing feedback
- ✅ Navigation buttons
- ✅ Conversation history
- ✅ New conversation (+)
- ✅ Dark/light theme
- ✅ Mobile responsive

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `START_TESTING_NOW.md` | 5-min quick test |
| `AI_TEST_PROMPTS.md` | 60+ test prompts |
| `AI_ASSISTANT_TEST_GUIDE.md` | Automated testing |
| `COMPLETE_IMPLEMENTATION_SUMMARY.md` | Full overview |
| `SCHEMA_FIX_SUMMARY.md` | What was fixed |

---

## ✅ Quick Verification

```bash
# 1. Server running?
curl http://localhost:3000/api/ai/unified

# 2. Database accessible?
npx prisma studio

# 3. Tests passing?
npm run test:ai

# 4. Schema valid?
npx prisma validate
```

---

## 🆘 Quick Fixes

### Modal Won't Open
→ Check floating navbar is visible
→ Check browser console for errors

### Messages Not Saving
→ Run: `npx prisma generate && npm run dev`

### Tests Failing
→ Ensure dev server is running
→ Check database connection

### Schema Errors
→ Run: `npx prisma db push --accept-data-loss`

---

## 🎯 Success Criteria

- [x] Modal opens
- [x] AI responds
- [x] Messages save
- [x] Navigation works
- [x] Tests pass
- [x] No 500 errors

---

**Need more help?** See full documentation in:
- `COMPLETE_IMPLEMENTATION_SUMMARY.md`
- `START_TESTING_NOW.md`

**Ready to test?**
```bash
npm run test:ai
```
