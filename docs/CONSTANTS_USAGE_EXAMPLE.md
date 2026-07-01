# Using Muscle Constants

The `src/constants/muscles.ts` file provides typed constants and helper functions for working with muscle groups.

## Import Constants

```typescript
import { 
  FRONT_MUSCLES, 
  BACK_MUSCLES, 
  WORKOUT_PRESETS,
  getMuscleDisplayName 
} from '@/constants/muscles';
```

## Usage Examples

### 1. Using Individual Muscle Constants

```tsx
import MenAnatomy, { MuscleHighlight } from '@/components/MenAnatomy';
import { FRONT_MUSCLES, BACK_MUSCLES } from '@/constants/muscles';

// Type-safe muscle selection
const highlights: MuscleHighlight = {
  muscles: [
    FRONT_MUSCLES.CHEST,
    FRONT_MUSCLES.BICEPS,
    BACK_MUSCLES.TRICEPS
  ],
  fillColor: '#00ff00'
};

<MenAnatomy view="front" highlights={highlights} />
```

### 2. Using Workout Presets

```tsx
import { WORKOUT_PRESETS } from '@/constants/muscles';

function WorkoutSelector() {
  const [workout, setWorkout] = useState<string[]>([]);

  return (
    <>
      <button onClick={() => setWorkout(WORKOUT_PRESETS.PUSH)}>
        Push Day
      </button>
      <button onClick={() => setWorkout(WORKOUT_PRESETS.PULL)}>
        Pull Day
      </button>
      <button onClick={() => setWorkout(WORKOUT_PRESETS.LEGS)}>
        Leg Day
      </button>

      <MenAnatomy 
        view="front"
        highlights={{ muscles: workout, fillColor: '#ff0000' }}
      />
    </>
  );
}
```

### 3. Using Display Names

```tsx
import { getMuscleDisplayName, FRONT_MUSCLES } from '@/constants/muscles';

function MuscleList() {
  const muscles = [
    FRONT_MUSCLES.CHEST,
    FRONT_MUSCLES.BICEPS,
    FRONT_MUSCLES.ABS
  ];

  return (
    <ul>
      {muscles.map(muscle => (
        <li key={muscle}>
          {getMuscleDisplayName(muscle)}
          {/* Displays: "Chest", "Biceps", "Abdominals" */}
        </li>
      ))}
    </ul>
  );
}
```

### 4. Using Muscle Categories

```tsx
import { MUSCLE_CATEGORIES } from '@/constants/muscles';

function CategorySelector() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <>
      <button onClick={() => setSelected(MUSCLE_CATEGORIES.CHEST)}>
        Chest
      </button>
      <button onClick={() => setSelected(MUSCLE_CATEGORIES.ARMS)}>
        Arms
      </button>
      <button onClick={() => setSelected(MUSCLE_CATEGORIES.LEGS)}>
        Legs
      </button>

      <MenAnatomy 
        view="front"
        highlights={{ muscles: selected, fillColor: '#00ff00' }}
      />
    </>
  );
}
```

### 5. Helper Functions

```tsx
import { 
  isFrontMuscle, 
  isBackMuscle, 
  getMuscleCategory 
} from '@/constants/muscles';

function MuscleInfo({ muscle }: { muscle: string }) {
  const view = isFrontMuscle(muscle) ? 'front' : 'back';
  const category = getMuscleCategory(muscle);
  
  return (
    <div>
      <p>Muscle: {getMuscleDisplayName(muscle)}</p>
      <p>View: {view}</p>
      <p>Category: {category}</p>
    </div>
  );
}
```

### 6. Type-Safe Workout Builder

```tsx
import { MuscleKey, FRONT_MUSCLES, BACK_MUSCLES } from '@/constants/muscles';

function WorkoutBuilder() {
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleKey[]>([]);

  const addMuscle = (muscle: MuscleKey) => {
    setSelectedMuscles(prev => [...prev, muscle]);
  };

  return (
    <>
      <button onClick={() => addMuscle(FRONT_MUSCLES.CHEST)}>
        Add Chest
      </button>
      <button onClick={() => addMuscle(BACK_MUSCLES.LATS)}>
        Add Lats
      </button>

      <MenAnatomy 
        view="front"
        highlights={{ muscles: selectedMuscles, fillColor: '#0000ff' }}
      />
    </>
  );
}
```

### 7. All Muscles List

```tsx
import { FRONT_MUSCLE_LIST, BACK_MUSCLE_LIST } from '@/constants/muscles';

function AllMusclesSelector() {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [highlightAll, setHighlightAll] = useState(false);

  const muscles = highlightAll 
    ? (view === 'front' ? FRONT_MUSCLE_LIST : BACK_MUSCLE_LIST)
    : [];

  return (
    <>
      <button onClick={() => setView('front')}>Front</button>
      <button onClick={() => setView('back')}>Back</button>
      <button onClick={() => setHighlightAll(!highlightAll)}>
        {highlightAll ? 'Clear' : 'Highlight All'}
      </button>

      <MenAnatomy 
        view={view}
        highlights={{ muscles, fillColor: '#ff00ff' }}
      />
    </>
  );
}
```

### 8. Dynamic Workout Plan

```tsx
import { 
  WORKOUT_PRESETS, 
  WorkoutPreset, 
  getMuscleDisplayName 
} from '@/constants/muscles';

function WorkoutPlan() {
  const [day, setDay] = useState<WorkoutPreset>('PUSH');
  const muscles = WORKOUT_PRESETS[day];

  return (
    <div>
      <select 
        value={day} 
        onChange={(e) => setDay(e.target.value as WorkoutPreset)}
      >
        <option value="PUSH">Push Day</option>
        <option value="PULL">Pull Day</option>
        <option value="LEGS">Leg Day</option>
        <option value="CHEST_DAY">Chest Day</option>
        <option value="BACK_DAY">Back Day</option>
        <option value="ARM_DAY">Arm Day</option>
        <option value="SHOULDER_DAY">Shoulder Day</option>
        <option value="CORE_DAY">Core Day</option>
        <option value="FULL_BODY">Full Body</option>
      </select>

      <div>
        <h3>Target Muscles:</h3>
        <ul>
          {muscles.map(muscle => (
            <li key={muscle}>{getMuscleDisplayName(muscle)}</li>
          ))}
        </ul>
      </div>

      <MenAnatomy 
        view="front"
        highlights={{ muscles, fillColor: '#00ff00', fillOpacity: 0.7 }}
      />
    </div>
  );
}
```

## Available Constants

### Individual Muscles

```typescript
// Front muscles
FRONT_MUSCLES.CHEST
FRONT_MUSCLES.FRONT_DELTS
FRONT_MUSCLES.SHOULDERS
FRONT_MUSCLES.BICEPS
FRONT_MUSCLES.FOREARMS
FRONT_MUSCLES.ABS
FRONT_MUSCLES.OBLIQUES
FRONT_MUSCLES.QUADS
FRONT_MUSCLES.SHINS
FRONT_MUSCLES.NECK
FRONT_MUSCLES.ADDUCTORS

// Back muscles
BACK_MUSCLES.TRAPS
BACK_MUSCLES.REAR_DELTS
BACK_MUSCLES.LATS
BACK_MUSCLES.UPPER_BACK
BACK_MUSCLES.LOWER_BACK
BACK_MUSCLES.TRICEPS
BACK_MUSCLES.GLUTES
BACK_MUSCLES.HAMSTRINGS
BACK_MUSCLES.CALVES
BACK_MUSCLES.NECK
BACK_MUSCLES.ADDUCTORS
```

### Workout Presets

```typescript
WORKOUT_PRESETS.PUSH          // Chest, Front Delts, Triceps
WORKOUT_PRESETS.PULL          // Lats, Traps, Rear Delts, Biceps
WORKOUT_PRESETS.LEGS          // Quads, Hamstrings, Glutes, Calves
WORKOUT_PRESETS.CHEST_DAY     // Chest, Front Delts, Triceps
WORKOUT_PRESETS.BACK_DAY      // All back muscles
WORKOUT_PRESETS.ARM_DAY       // Biceps, Triceps, Forearms
WORKOUT_PRESETS.SHOULDER_DAY  // All shoulder muscles
WORKOUT_PRESETS.CORE_DAY      // Abs, Obliques
WORKOUT_PRESETS.FULL_BODY     // Major muscle groups
```

### Muscle Categories

```typescript
MUSCLE_CATEGORIES.CHEST       // Chest muscles
MUSCLE_CATEGORIES.SHOULDERS   // All shoulder muscles
MUSCLE_CATEGORIES.ARMS        // All arm muscles
MUSCLE_CATEGORIES.CORE        // Core muscles
MUSCLE_CATEGORIES.BACK        // All back muscles
MUSCLE_CATEGORIES.LEGS        // All leg muscles
MUSCLE_CATEGORIES.NECK        // Neck muscles
```

## Benefits of Using Constants

1. **Type Safety**: TypeScript will catch typos and invalid muscle names
2. **Autocomplete**: Your IDE will suggest available muscles
3. **Refactoring**: Easy to rename or reorganize muscles
4. **Presets**: Ready-made workout combinations
5. **Consistency**: Same muscle names used throughout your app
6. **Documentation**: Self-documenting code with clear constant names
