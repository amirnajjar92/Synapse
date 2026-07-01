# Quick Start - Anatomy Components

## 🚀 Getting Started in 30 Seconds

### 1. Basic Display

```tsx
import MenAnatomy from '@/components/MenAnatomy';

<MenAnatomy view="front" width="400px" />
```

### 2. Highlight Muscles

```tsx
import MenAnatomy from '@/components/MenAnatomy';

<MenAnatomy 
  view="front"
  highlights={{
    muscles: ['chest', 'biceps'],
    fillColor: '#00ff00',
    fillOpacity: 0.7
  }}
  width="400px"
/>
```

### 3. Interactive Selection

```tsx
import { useState } from 'react';
import MenAnatomy from '@/components/MenAnatomy';

function MyComponent() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <MenAnatomy 
      view="front"
      highlights={{ muscles: selected }}
      onMuscleClick={(muscles) => {
        setSelected(prev => {
          const updated = [...prev];
          muscles.forEach(m => {
            const idx = updated.indexOf(m);
            idx > -1 ? updated.splice(idx, 1) : updated.push(m);
          });
          return updated;
        });
      }}
      width="400px"
    />
  );
}
```

## 📋 Muscle Names Cheat Sheet

**Front:** chest, front-delts, shoulders, biceps, forearms, abs, obliques, quads, shins, neck, adductors

**Back:** traps, rear-delts, lats, upper-back, lower-back, triceps, glutes, hamstrings, calves, neck, adductors

## 🎨 Customization Options

```tsx
{
  muscles: ['chest', 'biceps'],  // Which muscles to highlight
  fillColor: '#00ff00',           // Color (any CSS color)
  fillOpacity: 0.7,               // 0.0 to 1.0
  strokeColor: '#00ff00',         // Border color
  strokeWidth: 2,                 // Border width in pixels
  strokeOpacity: 0.9              // Border opacity 0.0 to 1.0
}
```

## 🏋️ Using Presets (Type-Safe)

```tsx
import { WORKOUT_PRESETS } from '@/constants/muscles';

<MenAnatomy 
  view="front"
  highlights={{ 
    muscles: WORKOUT_PRESETS.PUSH,  // chest, front-delts, triceps
    fillColor: '#00ff00'
  }}
/>
```

Available presets:
- `PUSH` - Push day muscles
- `PULL` - Pull day muscles
- `LEGS` - Leg day muscles
- `CHEST_DAY` - Chest workout
- `BACK_DAY` - Back workout
- `ARM_DAY` - Arm workout
- `SHOULDER_DAY` - Shoulder workout
- `CORE_DAY` - Core workout
- `FULL_BODY` - Full body workout

## 👤 Women's Anatomy

```tsx
import WomenAnatomy from '@/components/WomenAnatomy';

<WomenAnatomy 
  view="front"
  highlights={{ muscles: ['chest', 'abs'] }}
  width="400px"
/>
```

## 🔄 Switch Between Views

```tsx
const [view, setView] = useState<'front' | 'back'>('front');

<button onClick={() => setView(view === 'front' ? 'back' : 'front')}>
  Flip
</button>

<MenAnatomy view={view} />
```

## 🎯 Common Use Cases

### Workout Tracker
```tsx
const todaysWorkout = ['chest', 'triceps', 'front-delts'];
<MenAnatomy 
  view="front"
  highlights={{ muscles: todaysWorkout, fillColor: '#00ff00' }}
/>
```

### Injury Map
```tsx
const injuries = ['lower-back', 'hamstrings'];
<MenAnatomy 
  view="back"
  highlights={{ muscles: injuries, fillColor: '#ff0000' }}
/>
```

### Progress Visualization
```tsx
const [color, setColor] = useState('#00ff00');
const muscles = ['chest', 'biceps'];

<input type="color" onChange={(e) => setColor(e.target.value)} />
<MenAnatomy 
  view="front"
  highlights={{ muscles, fillColor: color }}
/>
```

## 📱 Demo Pages

- `/musclemap` - Full interactive example
- `/test-anatomy` - Preset examples with side-by-side comparison

## 📚 Full Documentation

See `ANATOMY_COMPONENTS_GUIDE.md` for complete documentation.

## ⚡ Pro Tips

1. **Multiple muscles**: Pass an array `['chest', 'biceps', 'triceps']`
2. **Toggle selection**: Check if muscle exists, remove it, else add it
3. **Use constants**: Import from `@/constants/muscles` for type safety
4. **Responsive**: Use `width="100%"` for responsive sizing
5. **Click events**: Use `onMuscleClick` to make it interactive

## 🐛 Troubleshooting

**Muscles not highlighting?**
- Check spelling: `'chest'` not `'Chest'`
- Use dash: `'front-delts'` not `'front delts'`
- Import constants for safety

**Click not working?**
- Add `onMuscleClick` prop
- Make sure you're passing a function

**SVG not loading?**
- Files must be in `/public/vectors/`
- Names: `anatomy-[gender]-[view]-tagged.svg`
