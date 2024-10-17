// src/types.ts

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Substep {
  description: string;
  duration_minutes?: number;
  ingredients?: Ingredient[];
}

export interface Step {
  description: string;
  duration_minutes: number;
  substeps: Substep[];
  start_time?: string;
}

export interface Recipe {
  name: string;
  ingredients: Ingredient[];
  equipment: string[];
  steps: Step[];
  total_time_minutes: number;
}
