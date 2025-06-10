
export enum RoastType {
  LIGHT = 'Light Roast',
  MEDIUM = 'Medium Roast',
  DARK = 'Dark Roast',
  ESPRESSO = 'Espresso Roast',
  ESPRESSO_AXIL = 'Espresso Roast (Axil Seasonal)',
}

export enum GrindSize {
  FINE = 'Fine',
  MEDIUM_FINE = 'Medium-Fine',
  MEDIUM = 'Medium',
  MEDIUM_COARSE = 'Medium-Coarse',
  COARSE = 'Coarse',
  PRE_GROUND_FINE = 'Pre-Ground (Fine/Espresso)',
  PRE_GROUND_MEDIUM = 'Pre-Ground (Medium)',
}

export enum BrewMethod {
  POUROVER = 'Pour-Over',
  AEROPRESS = 'AeroPress',
  FRENCH_PRESS = 'French Press',
}

export interface RecipeStep {
  id: string;
  title: string;
  details: string;
  startTimeSeconds: number;
  durationSeconds: number;
  isTimed: boolean; // Indicates if this step is part of the formal timed brew process
}

export interface WarningMessage {
  id: string;
  message: string;
  severity: 'critical' | 'info';
  recommendation?: string;
}

export interface CalculatedRecipe {
  targetTemperatureCelsius: number;
  waitTimeAfterBoilSeconds: number;
  coffeeAmountGrams: number;
  waterForBrewingMl: number;
  coffeeToWaterRatio: string;
  totalBrewTimeSeconds: number;
  steps: RecipeStep[];
  warnings: WarningMessage[];
  inputs: {
    roastType: RoastType;
    grindSize: GrindSize;
    waterAmountInKettleMl: number;
    brewMethod: BrewMethod;
    cups: number;
  };
}

export interface TimerInstance {
  intervalId: number | null;
  secondsElapsed: number;
  isRunning: boolean;
  currentStepIndex: number;
}

export interface GrindSizeVisual {
  name: GrindSize;
  description: string;
  visual?: string; // e.g. "Salt-like grains", "Coarse sand"
}
