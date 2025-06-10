
import { BrewMethod, GrindSize, RoastType } from './types';

export const TARGET_TEMPERATURES: Record<RoastType, number> = {
  [RoastType.LIGHT]: 96,
  [RoastType.MEDIUM]: 93,
  [RoastType.DARK]: 91,
  [RoastType.ESPRESSO]: 88,
  [RoastType.ESPRESSO_AXIL]: 85,
};

export const BASE_COOLING_RATE_PER_MINUTE = 4.4; // °C for 1000mL
export const REFERENCE_WATER_VOLUME_ML = 1000;

export const WATER_PER_CUP_ML: Record<BrewMethod, number> = {
  [BrewMethod.POUROVER]: 240,
  [BrewMethod.AEROPRESS]: 200,
  [BrewMethod.FRENCH_PRESS]: 275,
};

// Ratios are water:coffee. So coffee_amount = total_water / ratio_value
export const COFFEE_WATER_RATIOS: Record<BrewMethod, Partial<Record<RoastType, number>>> = {
  [BrewMethod.POUROVER]: {
    [RoastType.LIGHT]: 16.5,
    [RoastType.MEDIUM]: 16,
    [RoastType.DARK]: 15,
    [RoastType.ESPRESSO]: 15,
    [RoastType.ESPRESSO_AXIL]: 15,
  },
  [BrewMethod.AEROPRESS]: {
    [RoastType.LIGHT]: 15,
    [RoastType.MEDIUM]: 14,
    [RoastType.DARK]: 13,
    [RoastType.ESPRESSO]: 13,
    [RoastType.ESPRESSO_AXIL]: 13,
  },
  [BrewMethod.FRENCH_PRESS]: {
    [RoastType.LIGHT]: 15,
    [RoastType.MEDIUM]: 14,
    [RoastType.DARK]: 13,
    [RoastType.ESPRESSO]: 13,
    [RoastType.ESPRESSO_AXIL]: 13,
  },
};

export const BASE_BREW_TIMES_SECONDS: Record<BrewMethod, Record<RoastType, number>> = {
  [BrewMethod.POUROVER]: {
    [RoastType.LIGHT]: 210,    // 3:30
    [RoastType.MEDIUM]: 195,   // 3:15
    [RoastType.DARK]: 180,     // 3:00
    [RoastType.ESPRESSO]: 165, // 2:45
    [RoastType.ESPRESSO_AXIL]: 180, // 3:00
  },
  [BrewMethod.AEROPRESS]: {
    [RoastType.LIGHT]: 90,     // 1:30
    [RoastType.MEDIUM]: 75,    // 1:15
    [RoastType.DARK]: 60,      // 1:00
    [RoastType.ESPRESSO]: 50,  // 0:50
    [RoastType.ESPRESSO_AXIL]: 60, // 1:00
  },
  [BrewMethod.FRENCH_PRESS]: {
    [RoastType.LIGHT]: 300,    // 5:00
    [RoastType.MEDIUM]: 270,   // 4:30
    [RoastType.DARK]: 240,     // 4:00
    [RoastType.ESPRESSO]: 210, // 3:30
    [RoastType.ESPRESSO_AXIL]: 240, // 4:00
  },
};

export const GRIND_ADJUSTMENTS_SECONDS: Record<BrewMethod, Partial<Record<GrindSize, number>>> = {
  [BrewMethod.POUROVER]: {
    [GrindSize.FINE]: -45,
    [GrindSize.PRE_GROUND_FINE]: -45,
    [GrindSize.MEDIUM_FINE]: -15,
    // Medium is baseline (0)
    [GrindSize.MEDIUM_COARSE]: 15,
    [GrindSize.COARSE]: 45,
  },
  [BrewMethod.AEROPRESS]: {
    [GrindSize.FINE]: -15,
    [GrindSize.PRE_GROUND_FINE]: -15,
    [GrindSize.MEDIUM_FINE]: -5,
    // Medium is baseline (0)
    [GrindSize.MEDIUM_COARSE]: 10,
    [GrindSize.COARSE]: 20,
  },
  [BrewMethod.FRENCH_PRESS]: {
    [GrindSize.FINE]: -90,
    [GrindSize.PRE_GROUND_FINE]: -90,
    [GrindSize.MEDIUM_FINE]: -45,
    // Medium is baseline (0) for this method's adjustments, though Coarse is ideal
    [GrindSize.MEDIUM_COARSE]: 30,
    // Coarse is baseline (ideal for French Press)
  },
};

export const MIN_BREW_TIMES_SECONDS: Record<BrewMethod, number> = {
  [BrewMethod.POUROVER]: 120,
  [BrewMethod.AEROPRESS]: 30,
  [BrewMethod.FRENCH_PRESS]: 150,
};

export const MAX_BREW_TIMES_SECONDS: Record<BrewMethod, number> = {
  [BrewMethod.POUROVER]: 300,
  [BrewMethod.AEROPRESS]: 180, // Extended max for flexibility
  [BrewMethod.FRENCH_PRESS]: 360, // Extended max
};

export const MAX_CUPS: Record<BrewMethod, number> = {
  [BrewMethod.POUROVER]: 2,
  [BrewMethod.AEROPRESS]: 1,
  [BrewMethod.FRENCH_PRESS]: 2, // Common small French Press sizes
};

export const DEFAULT_WATER_IN_KETTLE_ML = 1000;
export const MIN_WATER_IN_KETTLE_ML = 500;
export const MAX_WATER_IN_KETTLE_ML = 1700;

// Method specific constants
export const POUROVER_BLOOM_COFFEE_RATIO = 2; // bloom water = coffee weight * THIS_RATIO
export const POUROVER_BLOOM_WAIT_SECONDS = 45; // For roasts other than dark/espresso. Darker roasts might need less (e.g. 30s). This will be handled in step generation.
export const POUROVER_DEFAULT_MAIN_POURS = 2; // Number of main pours after bloom

export const AEROPRESS_BLOOM_COFFEE_RATIO = 2;
export const AEROPRESS_BLOOM_WAIT_SECONDS = 30; // Default bloom/saturation time
export const AEROPRESS_PLUNGE_SECONDS = 20;

export const FRENCH_PRESS_CRUST_BREAK_WAIT_SECONDS = 60; // Initial steep time before breaking crust
export const FRENCH_PRESS_PLUNGE_SECONDS = 30;

export const GRIND_SIZE_VISUALS: Record<GrindSize, { description: string; example: string }> = {
  [GrindSize.FINE]: { description: "Very fine, like powdered sugar or flour.", example: "Espresso, Turkish coffee." },
  [GrindSize.PRE_GROUND_FINE]: { description: "Fine, similar to table salt. Often labeled for espresso.", example: "Some AeroPress, moka pot." },
  [GrindSize.MEDIUM_FINE]: { description: "Slightly finer than table salt, like granulated sugar.", example: "Cone pour-overs (Hario V60), AeroPress." },
  [GrindSize.MEDIUM]: { description: "Consistency of regular sand or kosher salt.", example: "Drip machines, flat-bottom pour-overs (Kalita Wave)." },
  [GrindSize.PRE_GROUND_MEDIUM]: { description: "General purpose pre-ground, like kosher salt.", example: "Drip machines, some percolators." },
  [GrindSize.MEDIUM_COARSE]: { description: "Coarser than sand, like rough sand or coarse salt.", example: "Chemex, Clever Dripper, some French Press." },
  [GrindSize.COARSE]: { description: "Very coarse, like breadcrumbs or sea salt.", example: "French Press, cold brew, percolators." },
};

export const SOURCE_REFERENCES = [
  { name: "Market Lane Coffee Pour-Over Guide", url: "https://marketlane.com.au/pages/how-to-brew-pour-over-coffee" },
  { name: "Market Lane Coffee Equipment & Guides", url: "https://marketlane.com.au/pages/brew-guide" },
  { name: "Axil Seasonal Espresso Blend", url: "https://axilcoffee.com.au/products/seasonal-blend-oto" },
  { name: "Axil French Press Guide", url: "https://axilcoffee.com.au/blogs/axil-coffee-roasters/how-to-the-ultimate-guide-to-making-the-perfect-french-press-coffee" },
  { name: "Perfect Daily Grind - Roast Level Adjustments", url: "https://perfectdailygrind.com/2019/10/how-to-adjust-your-brewing-recipe-for-coffee-roast-level/" },
  { name: "Counter Culture Coffee - Brewing Ratios", url: "https://counterculturecoffee.com/blogs/counter-culture-coffee/coffee-basics-brewing-ratios" },
  { name: "Serious Eats - Pour-Over Science", url: "https://www.seriouseats.com/make-better-pourover-coffee-how-pourover-works-temperature-timing" },
  { name: "AeroPress Official Recipes", url: "https://aeropress.com/pages/how-to-use" },
  { name: "Coffee Grind Size Research (North Star)", url: "https://www.northstarroast.com/blogs/brewing/the-importance-of-grind-size" },
  { name: "Coffee Bros - Pour-Over Recipes", url: "https://coffeebros.com/blogs/coffee/the-perfect-pour-over-guide" },
];

    