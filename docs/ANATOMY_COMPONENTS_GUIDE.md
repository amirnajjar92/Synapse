# Anatomy Components Guide

This guide explains how to use the `MenAnatomy` and `WomenAnatomy` components in your application.

## Overview

The anatomy components provide interactive SVG-based body anatomy visualizations with muscle group highlighting capabilities. They support both front and back views for male and female body types.

## Components

### MenAnatomy
- **File**: `src/components/MenAnatomy.tsx`
- **SVG Files**: 
  - Front: `/public/vectors/anatomy-men-front-tagged.svg`
  - Back: `/public/vectors/anatomy-men-back-tagged.svg`

### WomenAnatomy
- **File**: `src/components/WomenAnatomy.tsx`
- **SVG Files**:
  - Front: `/public/vectors/anatomy-women-front-tagged.svg`
  - Back: `/public/vectors/anatomy-women-back-tagged.svg`

## Props

Both components accept the same props:

```typescript
interface AnatomyProps {
  view: 'front' | 'back';           // Which side of the body to show
  highlights?: MuscleHighlight;      // Muscle highlighting configuration
  onMuscleClick?: (muscleGroups: string[]) => void; // Click handler
  className?: string;                // CSS class for the container
  width?: number | string;           // Container width
  height?: number | string;          // Container height
}
```

### MuscleHighlight Interface

```typescript
interface MuscleHighlight {
  muscles: string[];        // Array of muscle class names to highlight
  fillColor?: string;       // Fill color (default: '#ff0000')
  fillOpacity?: number;     // Fill opacity 0-1 (default: 0.6)
  strokeColor?: string;     // Stroke color (default: '#ff0000')
  strokeWidth?: number;     // Stroke width in pixels (default: 2)
  strokeOpacity?: number;   // Stroke opacity 0-1 (default: 0.9)
}
```

## Available Muscle Groups

### Front View
- `chest` - Chest muscles
- `front-delts` - Front deltoids
- `shoulders` - Shoulder muscles
- `biceps` - Bicep muscles
- `forearms` - Forearm muscles
- `abs` - Abdominal muscles
- `obliques` - Oblique muscles
- `quads` - Quadriceps
- `shins` - Shin muscles
- `neck` - Neck muscles
- `adductors` - Adductor muscles

### Back View
- `traps` - Trapezius muscles
- `rear-delts` - Rear deltoids
- `lats` - Latissimus dorsi
- `upper-back` - Upper back muscles
- `lower-back` - Lower back muscles
- `triceps` - Tricep muscles
- `glutes` - Gluteal muscles
- `hamstrings` - Hamstring muscles
- `calves` - Calf muscles
- `neck` - Neck muscles
- `adductors` - Adductor muscles

## Usage Examples

### Basic Usage

```tsx
import MenAnatomy from '@/components/MenAnatomy';

export default function MyPage() {
  return (
    <MenAnatomy
      view="front"
      width="400px"
      height="auto"
    />
  );
}
```

### With Highlighting

```tsx
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';

export default function WorkoutPlan() {
  const chestDayHighlight: MuscleHighlight = {
    muscles: ['chest', 'triceps', 'front-delts'],
    fillColor: '#00ff00',
    fillOpacity: 0.7,
    strokeColor: '#00ff00',
    strokeWidth: 3,
    strokeOpacity: 0.9
  };

  return (
    <MenAnatomy
      view="front"
      highlights={chestDayHighlight}
      width="100%"
      height="auto"
    />
  );
}
```

### With Click Interaction

```tsx
import { useState } from 'react';
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';

export default function InteractivePage() {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  const handleMuscleClick = (muscleGroups: string[]) => {
    console.log('Clicked muscles:', muscleGroups);
    setSelectedMuscles(prev => {
      const newSelection = [...prev];
      muscleGroups.forEach(muscle => {
        const index = newSelection.indexOf(muscle);
        if (index > -1) {
          newSelection.splice(index, 1);
        } else {
          newSelection.push(muscle);
        }
      });
      return newSelection;
    });
  };

  const highlights: MuscleHighlight = {
    muscles: selectedMuscles,
    fillColor: '#ff0000',
    fillOpacity: 0.6
  };

  return (
    <MenAnatomy
      view="front"
      highlights={highlights}
      onMuscleClick={handleMuscleClick}
      className="cursor-pointer"
      width="100%"
    />
  );
}
```

### Women Anatomy

```tsx
import WomenAnatomy, { MuscleHighlight } from '@/components/WomenAnatomy';

export default function FemaleWorkout() {
  const legDayHighlight: MuscleHighlight = {
    muscles: ['quads', 'hamstrings', 'glutes', 'calves'],
    fillColor: '#ff00ff',
    fillOpacity: 0.5,
    strokeColor: '#ff00ff',
    strokeWidth: 2
  };

  return (
    <WomenAnatomy
      view="front"
      highlights={legDayHighlight}
      width="100%"
    />
  );
}
```

### Dynamic Color and Opacity

```tsx
import { useState } from 'react';
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';

export default function CustomizablePage() {
  const [color, setColor] = useState('#ff0000');
  const [opacity, setOpacity] = useState(0.6);
  
  const highlights: MuscleHighlight = {
    muscles: ['chest', 'biceps'],
    fillColor: color,
    fillOpacity: opacity,
    strokeColor: color,
    strokeWidth: 2
  };

  return (
    <div>
      <input 
        type="color" 
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <input 
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={opacity}
        onChange={(e) => setOpacity(parseFloat(e.target.value))}
      />
      <MenAnatomy
        view="front"
        highlights={highlights}
        width="100%"
      />
    </div>
  );
}
```

## Demo Pages

### Interactive Muscle Map
Visit `/musclemap` to see a full interactive example with:
- Gender switching (male/female)
- View switching (front/back)
- Color picker
- Click to select/deselect muscles
- Quick select buttons
- Customizable opacity and stroke width

### Test Page
Visit `/test-anatomy` to see preset examples:
- Chest & Arms workout
- Leg Day workout
- Back workout

Both components side by side for comparison.

## Tips

1. **Multiple Muscle Selection**: You can highlight multiple muscles at once by providing an array of muscle names.

2. **Color Customization**: Use any valid CSS color format (hex, rgb, rgba, hsl, etc.).

3. **Click Handling**: The `onMuscleClick` callback receives all class names associated with the clicked element. Some elements may have multiple classes (e.g., "front-delts shoulders").

4. **Responsive Design**: Set `width="100%"` and `height="auto"` for responsive sizing.

5. **Styling**: Use the `className` prop to apply custom styles to the container div.

6. **Performance**: The components use `useEffect` hooks to update highlights. For better performance with frequent updates, consider debouncing your state changes.

## Muscle Group Combinations

Some SVG elements have multiple classes, allowing you to target muscle groups more precisely:

- `"front-delts shoulders"` - Front deltoids that are part of the shoulder group
- `"rear-delts shoulders"` - Rear deltoids that are part of the shoulder group
- `"traps neck upper-back"` - Trapezius muscles spanning neck and upper back
- `"obliques lats"` - Obliques overlapping with lats
- `"quads adductors"` - Quadriceps near adductors

You can target either the specific muscle or the general group.

## Browser Support

These components use modern browser APIs:
- SVG manipulation
- CSS custom properties
- Fetch API

Supported in all modern browsers (Chrome, Firefox, Safari, Edge).
