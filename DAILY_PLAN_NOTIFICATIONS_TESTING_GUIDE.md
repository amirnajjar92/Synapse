# Daily Plan Notifications - Testing Guide

## 🎯 What Was Added

A smart notification system that:
- **Analyzes your active plan** and extracts today's tasks
- **Sends notifications** with today's schedule
- **Links directly to /monitor** page for easy logging
- **Prevents duplicates** - only notifies once per day
- **Configurable timing** - set when you want to be notified

## 📱 How to Test on Your Installed PWA

### Step 1: Deploy the Changes

First, make sure your changes are deployed:

```bash
# If using Vercel (assuming you have it set up)
vercel --prod

# Or push to your deployment branch
git push origin main
```

**Wait 2-3 minutes** for the deployment to complete.

### Step 2: Update Your PWA

Your installed PWA needs to update to the new version:

#### On Mobile (iOS/Android):
1. **Open the PWA** from your home screen
2. **Pull down to refresh** the page
3. Look for an **update notification** (if you have PWAUpdater component)
4. Or **close and reopen** the app completely

#### On Desktop (Chrome/Edge):
1. **Open the PWA** from your taskbar/dock
2. Press **Ctrl+R** (Windows) or **Cmd+R** (Mac) to refresh
3. Or **close and reopen** the app
4. Check for service worker update in DevTools (F12 → Application → Service Workers)

### Step 3: Enable Notifications

1. **Open your PWA**
2. Navigate to **Reminders page** (click the 🔔 bell icon in the floating nav)
3. Click **"Enable Notifications"** button
4. **Allow** when your browser/OS prompts for permission

✅ You should see "Notifications are enabled" in green

### Step 4: Test Immediate Daily Plan Notification

#### Option A: Test on App Open (Fastest)
1. Make sure you have an **active plan** (status = IN_PROGRESS)
2. **Close the PWA completely**
3. **Clear localStorage** for today's notification:
   - Open browser DevTools (F12)
   - Go to **Application** → **Local Storage**
   - Find and **delete** the key: `lastPlanNotification`
4. **Reopen the PWA**
5. Within **2-3 seconds**, you should see a notification with:
   - Title: "📋 Today's Plan: [Your Plan Name]"
   - Body: Today's tasks from your plan
   - Clicking it opens **/monitor** page

#### Option B: Test Scheduled Daily Reminder
1. Go to **Reminders page** (🔔 bell icon)
2. In the **"Daily Plan Reminder"** section at the top:
   - Toggle it **ON** (switch should be green)
   - Set the time to **1-2 minutes from now**
   - Click **"Save Settings"**
3. **Wait for the scheduled time**
4. You should receive a notification automatically

### Step 5: Test Notification Clicking

When you receive the notification:
1. **Click on the notification**
2. It should **open the /monitor page** in your PWA
3. You can now **log your progress** for the day

### Step 6: Verify Plan-Specific Notifications

The notification content depends on your plan structure:

#### If your plan has schedule-based tasks:
Example plan structure:
```
MEALS table:
- Monday | Breakfast | Oatmeal
- Monday | Lunch | Chicken Salad
```

✅ Notification should show: "MEALS: Breakfast - Oatmeal, MEALS: Lunch - Chicken Salad"

#### If your plan has time-based tasks:
Example plan structure:
```
CARDIO table:
- 08:00 | Morning Run | 5km
- 18:00 | Evening Bike | 30min
```

✅ Notification should show: "CARDIO: 08:00 - Morning Run - 5km"

### Step 7: Test Duplicate Prevention

1. After receiving a notification
2. Try to trigger it again (refresh, reopen app)
3. ✅ You should **NOT** receive another notification today
4. The notification counter resets at midnight

## 🧪 Advanced Testing

### Test Different Plan Structures

Create test plans with:
- **Day-based tasks** (Monday, Tuesday, etc.)
- **Time-based tasks** (08:00, 12:00, etc.)
- **Mixed formats**
- **No tasks for today** (should get generic reminder)

### Test Edge Cases

1. **No active plan**: Should not send notification
2. **Multiple active plans**: Uses first IN_PROGRESS plan
3. **Empty plan**: Sends generic "Check your plan" message
4. **Notifications disabled**: No notifications sent (correct behavior)

### Clear Test Data

To reset for fresh testing:

```javascript
// Open browser console (F12) and run:
localStorage.removeItem('lastPlanNotification');
localStorage.removeItem('dailyPlanReminderSettings');
```

## 🔍 Debugging

### Check if Notification Was Sent

Open browser console (F12) and look for:
```
✅ Reminders initialized: X
```

### Check Notification Permission

```javascript
// In console:
console.log(Notification.permission);
// Should output: "granted"
```

### Check Active Plan

```javascript
// In console:
fetch('/api/users/me/plans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your@email.com' })
})
.then(r => r.json())
.then(d => console.log('Active plan:', d.plans.find(p => p.status === 'IN_PROGRESS')));
```

### Check localStorage

```javascript
// In console:
console.log('Last notification:', localStorage.getItem('lastPlanNotification'));
console.log('Settings:', localStorage.getItem('dailyPlanReminderSettings'));
```

## 📊 Expected Results

### ✅ Success Indicators
- Notification appears within 2-3 seconds of opening app
- Notification includes today's specific tasks
- Clicking notification opens /monitor page
- Only one notification per day
- Scheduled notifications fire at exact time

### ❌ Common Issues

**Issue**: No notification appears
- **Check**: Notification permission granted?
- **Check**: Active plan exists (status = IN_PROGRESS)?
- **Check**: Already notified today? (check localStorage)
- **Check**: PWA updated to latest version?

**Issue**: Notification has no tasks
- **Check**: Plan has tasks for today's day of week?
- **Check**: Plan structure matches expected format?
- **Check**: Browser console for errors

**Issue**: Clicking notification doesn't open /monitor
- **Check**: Using HTTPS (required for notifications)?
- **Check**: Browser supports notification clicks?
- **Check**: PWA is properly installed?

## 🎬 Video Walkthrough (Steps)

1. **[0:00-0:30]** Open PWA → Navigate to Reminders
2. **[0:30-1:00]** Enable notifications → Allow permission
3. **[1:00-1:30]** Configure daily reminder time
4. **[1:30-2:00]** Save settings
5. **[2:00-2:30]** Close and reopen PWA
6. **[2:30-3:00]** Receive notification with today's tasks
7. **[3:00-3:30]** Click notification → Opens /monitor
8. **[3:30-4:00]** Log progress for the day

## 📝 Test Checklist

- [ ] PWA deployed and updated
- [ ] Notifications enabled in PWA
- [ ] Browser notification permission granted
- [ ] Active plan exists (IN_PROGRESS status)
- [ ] Immediate notification received on app open
- [ ] Notification includes today's tasks
- [ ] Notification click opens /monitor page
- [ ] Scheduled daily reminder configured
- [ ] Scheduled notification fires at set time
- [ ] No duplicate notifications on same day
- [ ] Notification resets at midnight
- [ ] Works on mobile PWA
- [ ] Works on desktop PWA

## 🚀 Production Testing

Once deployed to production:

1. **Install PWA** on your main device
2. **Create a real fitness plan** with today's tasks
3. **Enable daily reminders** at your preferred time
4. **Use it daily** for a week to verify:
   - Notifications fire reliably
   - Content is accurate
   - Links work correctly
   - No performance issues

## 💡 Pro Tips

1. **Set morning reminders**: 7:00-9:00 AM works well for daily planning
2. **Check monitor page**: After notification, log your progress immediately
3. **Adjust timing**: If you miss notifications, try different times
4. **Multiple plans**: Only one active plan should be IN_PROGRESS at a time
5. **Plan structure**: Use consistent day/time formats for best results

## 🎉 Success!

If you see notifications with your daily tasks and can click through to the monitor page, everything is working correctly! 

The notification system will now help you stay on track with your fitness goals by reminding you daily about your plan and making it easy to log your progress.

---

**Need help?** Check the browser console for detailed logs and error messages.
