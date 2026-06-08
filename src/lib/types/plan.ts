export interface MealPlanItem {
  id: string;
  columns: string[];
}

export interface CardioPlanItem {
  id: string;
  columns: string[];
}

export interface NutrientsPlanItem {
  id: string;
  columns: string[];
}

export interface RecommendedPlanItem {
  id: string;
  columns: string[];
}

export interface ChallengesPlanItem {
  id: string;
  columns: string[];
}

export interface SupplementsPlanItem {
  id: string;
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
