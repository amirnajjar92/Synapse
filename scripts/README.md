# 📁 Scripts Directory

Automated test and utility scripts for the Synapse Fitness App.

---

## 🧪 Test Scripts

### AI Assistant Tests

**Files:**
- `test-ai-assistant.js` - JavaScript version (recommended)
- `test-ai-assistant.ts` - TypeScript version

**Purpose:**
Automated testing of AI assistant conversation features including:
- Intent detection (plan_creation, activity_logging, analysis, question, general)
- Message persistence to database
- Conversation CRUD operations
- Context awareness
- Edge case handling

**Usage:**
```bash
# Run JavaScript version
npm run test:ai

# Run TypeScript version
npm run test:ai-ts

# Watch mode (auto-run on changes)
npm run test:ai-watch
```

**Prerequisites:**
- Dev server must be running: `npm run dev`
- Database must be accessible (check `.env`)

**Configuration:**
```bash
# Optional: Set custom server URL
TEST_BASE_URL=http://localhost:3001 npm run test:ai

# Optional: Set custom test user
TEST_EMAIL=custom@example.com npm run test:ai
```

**Expected Output:**
```
✅ Server reachable at http://localhost:3000
✅ Intent: plan_creation (confidence: high)
✅ Message saved: conv_abc123
✅ All 4 messages retrieved
✅ Conversation deleted

Total: 42
Passed: 42
Failed: 0
Duration: 8.5s
Success Rate: 100.0%

🎉 All tests passed!
```

---

## 📊 Coverage

| Script | Tests | Duration | Coverage |
|--------|-------|----------|----------|
| `test-ai-assistant.js` | 42+ | ~8.5s | 100% |

---

## 🔧 Development

### Adding New Tests

1. Open `test-ai-assistant.js`
2. Add test function:
   ```javascript
   async function testNewFeature() {
     logSection('Test: New Feature');
     totalTests++;
     // ... test logic
     logSuccess('Feature works');
   }
   ```
3. Add to `runAllTests()`:
   ```javascript
   await testNewFeature();
   ```

### Debugging

Enable debug output:
```javascript
const DEBUG = true; // Add at top of file
```

Run single test:
```javascript
// Comment out other tests in runAllTests()
```

---

## 🐛 Troubleshooting

### "Cannot reach server"
```bash
# Start dev server
npm run dev
```

### "Failed to save message"
```bash
# Regenerate Prisma Client
npx prisma generate
npm run dev
```

### Tests timeout
```javascript
// Increase timeout in script
const TIMEOUT_MS = 10000;
```

---

## 📚 Documentation

See `AI_ASSISTANT_TEST_GUIDE.md` for complete documentation including:
- Detailed test coverage
- Configuration options
- CI/CD integration
- Performance benchmarks
- Adding custom tests

---

## ✅ Best Practices

**Before running:**
1. Start dev server
2. Verify database connection
3. Check environment variables

**After running:**
1. Check output for failures
2. Verify database state
3. Review server logs

---

**Run tests now:**
```bash
npm run test:ai
```
