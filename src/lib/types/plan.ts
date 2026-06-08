export interface MealPlanItem {
  id: string | number;
  columns: string[];
}

export interface CardioPlanItem {
  id: string | number;
  columns: string[];
}

export interface NutrientsPlanItem {
  id: string | number;
  columns: string[];
}

export interface RecommendedPlanItem {
  id: string | number;
  columns: string[];
}

export interface ChallengesPlanItem {
  id: string | number;
  columns: string[];
}

export interface SupplementsPlanItem {
  id: string | number;
  columns: string[];
}

export interface GeneratedPlan {
  meals: MealPlanItem[];
  cardio: CardioPlanItem[];
  nutrients: NutrientsPlanItem[];
  recommended: RecommendedPlanItem[];
  challenges: ChallengesPlanItem[];
  supplements: SupplementsPlanItem[];
}
