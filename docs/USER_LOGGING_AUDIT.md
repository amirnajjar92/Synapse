# User Input Logging Audit

## Overview
This document tracks ALL locations where users can input text and confirms that every input is being logged to the database for admin review.

## ✅ Complete Logging Coverage

### 1. **Planner Page** (`/planner`)
**Component:** PromptBox  
**Purpose:** Create new fitness plans  
**Trigger:** User clicks "GO" button  
**Logging:** ✅ YES  
**API Endpoint:** `/api/plans` (POST)  
**Database Table:** `UserPrompt`  
**Code Location:** `src/lib/hooks/useMakePlan.tsx` → `savePlan()` function  
**What's Saved:** Full prompt text + linked to created plan

---

### 2. **Plan Detail Page** (`/plan-detail/[id]`)
**Component:** PromptBox  
**Purpose:** Update/refine existing plans  
**Trigger:** User clicks "GO" button  
**Logging:** ✅ YES (NEWLY ADDED)  
**API Endpoint:** `/api/prompts` (POST)  
**Database Table:** `UserPrompt`  
**Code Location:** `src/app/plan-detail/[id]/page.tsx` → `handleGoClick()` function  
**What's Saved:** Updated prompt text + linked to plan

---

### 3. **Monitor Page** (`/monitor`)
**Component:** textarea (Notes Input)  
**Purpose:** Log daily activity notes  
**Trigger:** User clicks "SEND" button or presses Enter  
**Logging:** ✅ YES  
**API Endpoint:** `/api/users/me/daily-entries/[date]/analyze` (POST)  
**Database Table:** `UserPrompt`  
**Code Location:** `src/app/monitor/page.tsx` → `handleSendToAI()` function  
**What's Saved:** Activity notes + linked to plan + date

---

### 4. **Plan Progress Tracker** (`/plan-progress-tracker`)
**Component:** textarea (AI Analysis Modal)  
**Purpose:** Analyze daily progress and extract metrics  
**Trigger:** User clicks "Analyze" button  
**Logging:** ✅ YES  
**API Endpoint:** `/api/users/me/daily-entries/[date]/analyze` (POST)  
**Database Table:** `UserPrompt`  
**Code Location:** `src/app/plan-progress-tracker/page.tsx` → `handleAnalyzeEntry()` function  
**What's Saved:** Analysis prompt + linked to plan + date + extracted metrics

---

## 📊 Data Flow Summary

```
User Input → Component → API Endpoint → UserPrompt Table → Admin Panel
```

### UserPrompt Table Structure
```prisma
model UserPrompt {
  id        String   @id @default(cuid())
  userId    String   // Who submitted it
  planId    String?  // Which plan (if applicable)
  prompt    String   // The actual text
  createdAt DateTime @default(now())
  
  user User  @relation(...)
  plan Plan? @relation(...)
}
```

---

## 🔍 Admin Access

All logged prompts can be viewed in the **Admin Panel**:

1. Navigate to `/admin` (admin role required)
2. Select a user from the list
3. View all their prompts with timestamps
4. Prompts show associated plan (if linked)

---

## 🎯 Coverage Statistics

| Location | Input Type | Logging Status | API Endpoint |
|----------|------------|----------------|--------------|
| Planner | PromptBox | ✅ Logged | `/api/plans` |
| Plan Detail | PromptBox | ✅ Logged | `/api/prompts` |
| Monitor | textarea | ✅ Logged | `/api/users/me/daily-entries/[date]/analyze` |
| Progress Tracker | textarea | ✅ Logged | `/api/users/me/daily-entries/[date]/analyze` |

**Total Coverage:** 4/4 (100%) ✅

---

## 🔐 Privacy & Security

- All prompts are linked to user accounts
- Only admins can view other users' prompts
- Prompts are stored with timestamps for audit trail
- No automatic deletion (manual cleanup required if needed)

---

## 🚀 Future Enhancements

Potential improvements for logging system:

1. **Prompt Analytics**
   - Most common requests
   - Average prompt length
   - Peak usage times

2. **Search & Filter**
   - Search prompts by keyword
   - Filter by date range
   - Filter by plan

3. **Export Functionality**
   - Export user prompts to CSV
   - Generate usage reports
   - Backup prompts

4. **Prompt Templates**
   - Identify popular prompt patterns
   - Create templates for common requests
   - Auto-suggest based on history

---

## 📝 Testing Checklist

To verify logging is working:

- [ ] Create a plan in Planner → Check Admin Panel → Prompt appears
- [ ] Update prompt in Plan Detail → Click GO → Check Admin Panel → New entry appears
- [ ] Submit notes in Monitor → Check Admin Panel → Notes appear
- [ ] Analyze progress in Progress Tracker → Check Admin Panel → Analysis appears
- [ ] Verify all prompts show correct timestamp
- [ ] Verify prompts link to correct plan (where applicable)
- [ ] Verify different users have separate prompt lists

---

## 🐛 Troubleshooting

**Prompt not appearing in Admin Panel:**
1. Check browser console for API errors
2. Verify user is signed in
3. Refresh admin panel
4. Check database directly with Prisma Studio

**Duplicate prompts:**
- This is expected - every submission creates a new entry
- Consider deduplication if storage is a concern

**Missing plan link:**
- Some prompts may not be linked to plans (e.g., general queries)
- This is normal behavior

---

## 📚 Related Files

- **Frontend:**
  - `/src/app/planner/page.tsx`
  - `/src/app/plan-detail/[id]/page.tsx`
  - `/src/app/monitor/page.tsx`
  - `/src/app/plan-progress-tracker/page.tsx`
  - `/src/components/PromptBox.tsx`

- **Backend:**
  - `/src/app/api/plans/route.ts`
  - `/src/app/api/prompts/route.ts`
  - `/src/app/api/users/me/daily-entries/[date]/analyze/route.ts`

- **Admin:**
  - `/src/app/admin/page.tsx`
  - `/src/app/api/admin/users/[userId]/prompts/route.ts`

- **Database:**
  - `prisma/schema.prisma` (UserPrompt model)
