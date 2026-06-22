# Quick Test: Daily Plan Notifications 🚀

## ⚡ 5-Minute Test

### 1. Deploy & Update (2 min)
```bash
# Deploy changes
vercel --prod  # or git push origin main

# Wait for deployment, then update PWA:
# - Mobile: Close app, reopen
# - Desktop: Ctrl+R or Cmd+R
```

### 2. Enable Notifications (1 min)
1. Open PWA
2. Click 🔔 bell icon in nav bar
3. Click "Enable Notifications"
4. Click "Allow" in browser prompt

### 3. Test Immediate Notification (2 min)
**Option A - Quick Test (Easiest):**
1. Make sure you have an active plan (IN_PROGRESS)
2. Open browser DevTools (F12)
3. Go to: Application → Local Storage
4. Delete key: `lastPlanNotification`
5. Refresh page (Ctrl+R)
6. ✅ Notification should appear in 2-3 seconds!

**Option B - Scheduled Test:**
1. In Reminders page, find "Daily Plan Reminder" section
2. Toggle ON
3. Set time to 2 minutes from now
4. Click "Save Settings"
5. ✅ Wait and notification will fire!

### 4. Click Notification
- Click the notification
- ✅ Should open **/monitor** page
- ✅ You can now log your progress!

## ✅ What You Should See

**Notification Title:**
```
📋 Today's Plan: [Your Plan Name]
```

**Notification Body:**
```
MEALS: Breakfast - Oatmeal
CARDIO: Morning Run - 5km
WEIGHTS: Upper Body - 45min
+2 more...

Tap to log your progress!
```

**On Click:**
- Opens `/monitor` page automatically
- Ready to log your daily progress

## 🐛 Quick Debug

**No notification?**
```javascript
// Open Console (F12) and check:
console.log(Notification.permission);  // Should be "granted"
localStorage.removeItem('lastPlanNotification');  // Clear and retry
```

**Check active plan:**
```javascript
// Verify you have an IN_PROGRESS plan:
fetch('/api/users/me/plans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your@email.com' })
})
.then(r => r.json())
.then(d => console.log(d.plans.filter(p => p.status === 'IN_PROGRESS')));
```

## 📱 Mobile-Specific

**iOS:**
1. App must be installed to home screen
2. Notifications work even when app is closed
3. May need to enable in iOS Settings → Notifications

**Android:**
1. Install PWA from Chrome menu
2. Notifications work immediately
3. Can customize in Android settings

## 🎯 Expected Behavior

| Feature | Expected |
|---------|----------|
| **First open today** | ✅ Notification after 2s |
| **Second open today** | ❌ No notification (already sent) |
| **Tomorrow** | ✅ New notification |
| **No active plan** | ❌ No notification |
| **Click notification** | ✅ Opens /monitor |
| **Scheduled time** | ✅ Fires at exact time |

## 🎉 You're Done!

That's it! Your PWA now sends smart daily notifications about your fitness plan with a direct link to track your progress.

---

**Full testing guide:** See `DAILY_PLAN_NOTIFICATIONS_TESTING_GUIDE.md`
