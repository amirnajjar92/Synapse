/**
 * Muscle Group Constants
 * Use these constants to reference muscle groups in your application
 */

// Front view muscle groups
export const FRONT_MUSCLES = {
  CHEST: 'chest',
  FRONT_DELTS: 'front-delts',
  SHOULDERS: 'shoulders',
  BICEPS: 'biceps',
  FOREARMS: 'forearms',
  ABS: 'abs',
  OBLIQUES: 'obliques',
  QUADS: 'quads',
  SHINS: 'shins',
  NECK: 'neck',
  ADDUCTORS: 'adductors'
} as const;

// Back view muscle groups
export const BACK_MUSCLES = {
  TRAPS: 'traps',
  REAR_DELTS: 'rear-delts',
  LATS: 'lats',
  UPPER_BACK: 'upper-back',
  LOWER_BACK: 'lower-back',
  TRICEPS: 'triceps',
  GLUTES: 'glutes',
  HAMSTRINGS: 'hamstrings',
  CALVES: 'calves',
  NECK: 'neck',
  ADDUCTORS: 'adductors'
} as const;

// All muscle groups
export const ALL_MUSCLES = {
  ...FRONT_MUSCLES,
  ...BACK_MUSCLES
} as const;

// Muscle group arrays
export const FRONT_MUSCLE_LIST = Object.values(FRONT_MUSCLES);
export const BACK_MUSCLE_LIST = Object.values(BACK_MUSCLES);
export const ALL_MUSCLE_LIST = Array.from(new Set([...FRONT_MUSCLE_LIST, ...BACK_MUSCLE_LIST]));

// Muscle group categories
export const MUSCLE_CATEGORIES = {
  CHEST: [FRONT_MUSCLES.CHEST],
  SHOULDERS: [FRONT_MUSCLES.SHOULDERS, FRONT_MUSCLES.FRONT_DELTS, BACK_MUSCLES.REAR_DELTS],
  ARMS: [FRONT_MUSCLES.BICEPS, FRONT_MUSCLES.FOREARMS, BACK_MUSCLES.TRICEPS],
  CORE: [FRONT_MUSCLES.ABS, FRONT_MUSCLES.OBLIQUES],
  BACK: [BACK_MUSCLES.TRAPS, BACK_MUSCLES.LATS, BACK_MUSCLES.UPPER_BACK, BACK_MUSCLES.LOWER_BACK],
  LEGS: [FRONT_MUSCLES.QUADS, BACK_MUSCLES.HAMSTRINGS, BACK_MUSCLES.GLUTES, BACK_MUSCLES.CALVES, FRONT_MUSCLES.SHINS, FRONT_MUSCLES.ADDUCTORS],
  NECK: [FRONT_MUSCLES.NECK]
} as const;

// Common workout presets
export const WORKOUT_PRESETS = {
  PUSH: [
    FRONT_MUSCLES.CHEST,
    FRONT_MUSCLES.FRONT_DELTS,
    BACK_MUSCLES.TRICEPS
  ],
  PULL: [
    BACK_MUSCLES.LATS,
    BACK_MUSCLES.TRAPS,
    BACK_MUSCLES.REAR_DELTS,
    FRONT_MUSCLES.BICEPS
  ],
  LEGS: [
    FRONT_MUSCLES.QUADS,
    BACK_MUSCLES.HAMSTRINGS,
    BACK_MUSCLES.GLUTES,
    BACK_MUSCLES.CALVES
  ],
  CHEST_DAY: [
    FRONT_MUSCLES.CHEST,
    FRONT_MUSCLES.FRONT_DELTS,
    BACK_MUSCLES.TRICEPS
  ],
  BACK_DAY: [
    BACK_MUSCLES.LATS,
    BACK_MUSCLES.TRAPS,
    BACK_MUSCLES.UPPER_BACK,
    BACK_MUSCLES.LOWER_BACK,
    BACK_MUSCLES.REAR_DELTS
  ],
  ARM_DAY: [
    FRONT_MUSCLES.BICEPS,
    BACK_MUSCLES.TRICEPS,
    FRONT_MUSCLES.FOREARMS
  ],
  SHOULDER_DAY: [
    FRONT_MUSCLES.SHOULDERS,
    FRONT_MUSCLES.FRONT_DELTS,
    BACK_MUSCLES.REAR_DELTS,
    BACK_MUSCLES.TRAPS
  ],
  CORE_DAY: [
    FRONT_MUSCLES.ABS,
    FRONT_MUSCLES.OBLIQUES
  ],
  FULL_BODY: [
    FRONT_MUSCLES.CHEST,
    BACK_MUSCLES.LATS,
    FRONT_MUSCLES.SHOULDERS,
    FRONT_MUSCLES.BICEPS,
    BACK_MUSCLES.TRICEPS,
    FRONT_MUSCLES.ABS,
    FRONT_MUSCLES.QUADS,
    BACK_MUSCLES.HAMSTRINGS
  ]
} as const;

// Muscle display names
export const MUSCLE_DISPLAY_NAMES: Record<string, string> = {
  [FRONT_MUSCLES.CHEST]: 'Chest',
  [FRONT_MUSCLES.FRONT_DELTS]: 'Front Deltoids',
  [FRONT_MUSCLES.SHOULDERS]: 'Shoulders',
  [FRONT_MUSCLES.BICEPS]: 'Biceps',
  [FRONT_MUSCLES.FOREARMS]: 'Forearms',
  [FRONT_MUSCLES.ABS]: 'Abdominals',
  [FRONT_MUSCLES.OBLIQUES]: 'Obliques',
  [FRONT_MUSCLES.QUADS]: 'Quadriceps',
  [FRONT_MUSCLES.SHINS]: 'Shins',
  [FRONT_MUSCLES.NECK]: 'Neck',
  [FRONT_MUSCLES.ADDUCTORS]: 'Adductors',
  [BACK_MUSCLES.TRAPS]: 'Trapezius',
  [BACK_MUSCLES.REAR_DELTS]: 'Rear Deltoids',
  [BACK_MUSCLES.LATS]: 'Latissimus Dorsi',
  [BACK_MUSCLES.UPPER_BACK]: 'Upper Back',
  [BACK_MUSCLES.LOWER_BACK]: 'Lower Back',
  [BACK_MUSCLES.TRICEPS]: 'Triceps',
  [BACK_MUSCLES.GLUTES]: 'Glutes',
  [BACK_MUSCLES.HAMSTRINGS]: 'Hamstrings',
  [BACK_MUSCLES.CALVES]: 'Calves'
};

// Helper function to get display name
export function getMuscleDisplayName(muscleKey: string): string {
  return MUSCLE_DISPLAY_NAMES[muscleKey] || 
    muscleKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Helper function to check if muscle is in front view
export function isFrontMuscle(muscle: string): boolean {
  return (FRONT_MUSCLE_LIST as readonly string[]).includes(muscle);
}

// Helper function to check if muscle is in back view
export function isBackMuscle(muscle: string): boolean {
  return (BACK_MUSCLE_LIST as readonly string[]).includes(muscle);
}

// Helper function to get muscle category
export function getMuscleCategory(muscle: string): string | null {
  for (const [category, muscles] of Object.entries(MUSCLE_CATEGORIES)) {
    if ((muscles as readonly string[]).includes(muscle)) {
      return category;
    }
  }
  return null;
}

// Type exports
export type FrontMuscle = typeof FRONT_MUSCLES[keyof typeof FRONT_MUSCLES];
export type BackMuscle = typeof BACK_MUSCLES[keyof typeof BACK_MUSCLES];
export type MuscleKey = FrontMuscle | BackMuscle;
export type WorkoutPreset = keyof typeof WORKOUT_PRESETS;
export type MuscleCategory = keyof typeof MUSCLE_CATEGORIES;
