# Reminders Feature

## Overview
The Synapse Fit app now includes a comprehensive reminder notification system that helps users stay on track with their fitness and health goals.

## Features

### 1. **Notification Types**
- 💧 **Water Reminders** - Stay hydrated throughout the day
- 💪 **Workout Reminders** - Never miss a training session
- 🍽️ **Meal Reminders** - Keep your nutrition on schedule
- ⏰ **Custom Reminders** - Create any reminder you need

### 2. **Flexible Scheduling**
- Set specific times for reminders (HH:mm format)
- Choose which days of the week to repeat
- Enable/disable reminders without deleting them
- Multiple reminders can be active simultaneously

### 3. **Browser Notifications**
- Native browser notification support
- Works even when the app is in the background
- Auto-closes after 10 seconds
- Click notification to focus the app

### 4. **User-Friendly Interface**
- Simple toggle switches to enable/disable reminders
- Color-coded reminder types
- Easy-to-use time picker
- Day-of-week selector with visual feedback

## How to Use

### Setup Notifications
1. Navigate to the **Reminders** page from the floating nav bar (bell icon)
2. Click **"Enable Notifications"** button
3. Allow notification permissions in your browser

### Create a Reminder
1. Click **"+ Add New Reminder"**
2. Select a reminder type (Water, Workout, Meal, or Custom)
3. Enter a title (e.g., "Drink water")
4. Optionally add a message (e.g., "Time to hydrate!")
5. Set the time (e.g., 09:00)
6. Select the days to repeat (e.g., Mon, Wed, Fri)
7. Click **"Create Reminder"**

### Manage Reminders
- **Enable/Disable**: Use the toggle switch on each reminder
- **Delete**: Click the trash icon 🗑️
- **View All**: All reminders are listed on the Reminders page

## Technical Details

### Database Schema
```prisma
model Reminder {
  id          String         @id @default(cuid())
  userId      String
  title       String
  message     String?
  time        String         // HH:mm format
  days        String[]       // Array of day names
  enabled     Boolean        @default(true)
  type        ReminderType   @default(CUSTOM)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, enabled])
}

enum ReminderType {
  WATER
  WORKOUT
  MEAL
  CUSTOM
}
```

### API Endpoints

#### GET /api/reminders
Fetch all reminders for a user
- Query params: `email` (required)
- Returns: `{ reminders: Reminder[] }`

#### POST /api/reminders
Create a new reminder
- Body: `{ email, title, message?, time, days, type? }`
- Returns: `{ reminder: Reminder }`

#### PATCH /api/reminders
Update a reminder
- Body: `{ id, title?, message?, time?, days?, enabled?, type? }`
- Returns: `{ reminder: Reminder }`

#### DELETE /api/reminders
Delete a reminder
- Query params: `id` (required)
- Returns: `{ success: true }`

### Components

#### `ReminderSettings`
Main component for managing reminders
- Location: `/src/components/ReminderSettings.tsx`
- Features: Create, read, update, delete reminders

#### `ReminderInitializer`
Background component that loads and schedules reminders
- Location: `/src/components/ReminderInitializer.tsx`
- Auto-loads on app start if notifications are enabled

#### `useNotifications` Hook
Custom React hook for notification management
- Location: `/src/lib/hooks/useNotifications.tsx`
- Handles permission requests and notification sending

#### `ReminderManager` Class
Singleton class for scheduling and managing reminders
- Location: `/src/lib/reminderManager.ts`
- Calculates next occurrence based on time and days
- Auto-reschedules after each notification

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 50+
- ✅ Firefox 46+
- ✅ Safari 16+
- ✅ Edge 79+
- ✅ Opera 37+

### Requirements
- HTTPS connection (required for notifications)
- Browser notification permission granted
- JavaScript enabled

## Best Practices

### For Users
1. **Permission**: Always grant notification permission for best experience
2. **Testing**: Create a test reminder first to verify it works
3. **Organization**: Use different types for different reminder categories
4. **Timing**: Set reminders at times you're most likely to see them

### For Developers
1. **Error Handling**: All API calls include try-catch blocks
2. **Fallbacks**: Graceful degradation if notifications aren't supported
3. **Performance**: Reminders are scheduled efficiently using setTimeout
4. **UX**: Clear visual feedback for all user actions

## Migration

To add this feature to an existing database:

```bash
# Generate Prisma migration
npx prisma migrate dev --name add_reminders

# Or push schema changes
npx prisma db push
```

## Future Enhancements

### Planned Features
- 🔄 Snooze functionality
- 📊 Reminder completion tracking
- 🎨 Custom notification sounds
- 📱 Push notifications via service worker
- 🌐 Timezone support
- 🔁 Recurring patterns (every X hours)
- 📈 Reminder analytics and insights

## Troubleshooting

### Notifications Not Working
1. Check browser compatibility
2. Verify notification permission is granted
3. Ensure app is served over HTTPS
4. Check browser notification settings
5. Try creating a test reminder

### Reminders Not Triggering
1. Verify reminder is enabled (toggle is ON)
2. Check that selected days include today
3. Ensure time hasn't already passed today
4. Refresh the page to reload reminders
5. Check browser console for errors

## Support

For issues or questions about the reminder feature:
1. Check this documentation
2. Review browser console for errors
3. Verify database schema is up to date
4. Test with a simple reminder first
