# Goal Weight Feature Documentation

## Overview

The goal weight feature automatically extracts and stores weight goals from user prompts when creating fitness plans. This enables better tracking and personalized recommendations.

## How It Works

### 1. Extraction Process

When a user creates a plan, the system extracts goal weight using a two-tier approach:

#### Tier 1: Regex Pattern Matching (Fast)
Looks for common patterns in the prompt:
- `"5kg"`, `"10 kg"`, `"75.5kg"` → Extracts as kilograms
- `"150lbs"`, `"10 lbs"`, `"10 pounds"` → Extracts as pounds

#### Tier 2: AI Extraction (Fallback)
If regex fails, uses the Moole AI API to understand natural language:
- `"I want to reach seventy kilograms"` → 70kg
- `"My target is one hundred and fifty pounds"` → 150lbs
- `"Goal: be 80kg by summer"` → 80kg

### 2. Storage

Extracted goal weight is stored in the `Plan` table:
```prisma
model Plan {
  // ... other fields
  goalWeight     Float?   // The numeric value
  goalWeightUnit String?  // "kg" or "lbs"
}
```

## Example Prompts

### ✅ Prompts That Work Well

```
"Lose 5kg in 30 days"
→ goalWeight: 5, goalWeightUnit: "kg"

"Gain 10 pounds of muscle"
→ goalWeight: 10, goalWeightUnit: "lbs"

"I want to reach 75kg"
→ goalWeight: 75, goalWeightUnit: "kg"

"Get to 150 lbs by summer"
→ goalWeight: 150, goalWeightUnit: "lbs"

"Drop 3.5 kilograms"
→ goalWeight: 3.5, goalWeightUnit: "kg"
```

### ⚠️ Prompts Without Goal Weight

```
"Build muscle and get stronger"
→ goalWeight: null, goalWeightUnit: null

"Improve endurance for marathon"
→ goalWeight: null, goalWeightUnit: null

"General fitness improvement"
→ goalWeight: null, goalWeightUnit: null
```

These are perfectly valid! Not all plans need a weight goal.

## Accessing Goal Weight Data

### In Plan Creation Response
```typescript
const plan = await fetch('/api/plans', {
  method: 'POST',
  body: JSON.stringify({
    title: "Weight Loss Plan",
    prompt: "Lose 5kg in 30 days",
    // ... other fields
  })
});

// Response includes:
{
  plan: {
    id: "...",
    goalWeight: 5,
    goalWeightUnit: "kg",
    // ... other fields
  }
}
```

### In Plan Detail View
```typescript
const plan = await fetch(`/api/plans/${planId}`);

if (plan.goalWeight) {
  console.log(`Goal: ${plan.goalWeight}${plan.goalWeightUnit}`);
  // Output: "Goal: 5kg"
}
```

## Use Cases

### 1. Progress Tracking
Compare daily weight metrics against goal weight:
```typescript
const currentWeight = 75; // from DailyMetric
const goalWeight = plan.goalWeight; // 70

const progress = ((currentWeight - goalWeight) / currentWeight) * 100;
console.log(`${progress}% to goal!`);
```

### 2. Personalized Recommendations
Adjust calorie/macro recommendations based on goal:
```typescript
if (plan.goalWeight && plan.goalWeight < currentWeight) {
  // Weight loss goal - suggest calorie deficit
  recommendedCalories = maintenanceCalories - 500;
} else if (plan.goalWeight && plan.goalWeight > currentWeight) {
  // Weight gain goal - suggest calorie surplus
  recommendedCalories = maintenanceCalories + 500;
}
```

### 3. Motivation Messages
```typescript
const daysToGoal = calculateDaysToGoal(currentWeight, plan.goalWeight, plan.endDate);

if (daysToGoal > 0) {
  showMessage(`${daysToGoal} days until you reach ${plan.goalWeight}${plan.goalWeightUnit}!`);
}
```

## API Reference

### Extract Goal Weight Function
Location: `/src/app/api/plans/route.ts`

```typescript
const extractGoalWeight = async (prompt: string): Promise<{
  weight: number | null,
  unit: string | null
}> => {
  // Implementation handles both regex and AI extraction
}
```

**Parameters:**
- `prompt` (string): The user's fitness plan prompt

**Returns:**
```typescript
{
  weight: number | null,  // Numeric value or null if not found
  unit: "kg" | "lbs" | null  // Unit of measurement
}
```

## Testing

### Test Cases

```typescript
// Test 1: Regex extraction (kg)
await extractGoalWeight("Lose 5kg in 30 days")
// Expected: { weight: 5, unit: "kg" }

// Test 2: Regex extraction (lbs)
await extractGoalWeight("Gain 10 lbs of muscle")
// Expected: { weight: 10, unit: "lbs" }

// Test 3: No goal weight
await extractGoalWeight("Build endurance for marathon")
// Expected: { weight: null, unit: null }

// Test 4: AI extraction needed
await extractGoalWeight("I want to be seventy kilograms")
// Expected: { weight: 70, unit: "kg" }
```

## Future Enhancements

### Potential Improvements

1. **Goal Weight Timeline**
   - Track goal weight changes over time
   - Allow users to update goal mid-plan

2. **Progress Visualization**
   - Graph showing current weight vs goal weight
   - Projected timeline to reach goal

3. **Smart Goal Validation**
   - Warn if goal weight change is too aggressive
   - Suggest realistic timelines based on goal

4. **Multiple Goals**
   - Support both weight loss and muscle gain goals
   - Track multiple metrics (weight, body fat %, etc.)

5. **Unit Conversion**
   - Auto-convert between kg and lbs based on user preference
   - Display in user's preferred unit

## Troubleshooting

### Goal Weight Not Extracted

**Problem:** Goal weight shows as `null` even though it was in the prompt

**Solutions:**
1. Check the prompt format - use common patterns like "5kg" or "10 lbs"
2. Verify AI API (Moole) is accessible
3. Check API logs for extraction errors
4. Try rewording prompt to be more explicit

### Wrong Unit Extracted

**Problem:** System extracted wrong unit (kg instead of lbs)

**Solution:**
- Be explicit: "10 pounds" instead of just "10"
- Avoid mixing units in same prompt
- Check regex patterns in code if needed

### AI Extraction Timeout

**Problem:** Extraction takes too long or times out

**Solution:**
- System falls back to `null` if extraction fails
- Users can manually update goal weight later
- Check Moole API status

## Privacy & Data

- Goal weight is stored with the Plan, not separately
- Only visible to the user and admins
- Included in plan export/PDF features
- Not shared with third parties

## Summary

The goal weight feature provides:
- ✅ Automatic extraction from natural language
- ✅ Support for kg and lbs units
- ✅ Fallback to AI if regex fails
- ✅ Graceful handling of missing goals
- ✅ Foundation for future tracking features

Goal weight data enables better personalization and progress tracking throughout the user's fitness journey.
