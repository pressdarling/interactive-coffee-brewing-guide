
import { BrewMethod, GrindSize, RecipeStep, RoastType, WarningMessage, CalculatedRecipe } from '../types';
import {
  TARGET_TEMPERATURES,
  BASE_COOLING_RATE_PER_MINUTE,
  REFERENCE_WATER_VOLUME_ML,
  WATER_PER_CUP_ML,
  COFFEE_WATER_RATIOS,
  BASE_BREW_TIMES_SECONDS,
  GRIND_ADJUSTMENTS_SECONDS,
  MIN_BREW_TIMES_SECONDS,
  MAX_BREW_TIMES_SECONDS,
  MAX_CUPS,
  POUROVER_BLOOM_COFFEE_RATIO,
  POUROVER_BLOOM_WAIT_SECONDS,
  POUROVER_DEFAULT_MAIN_POURS,
  AEROPRESS_BLOOM_COFFEE_RATIO,
  AEROPRESS_BLOOM_WAIT_SECONDS,
  AEROPRESS_PLUNGE_SECONDS,
  FRENCH_PRESS_CRUST_BREAK_WAIT_SECONDS,
  FRENCH_PRESS_PLUNGE_SECONDS
} from '../constants';

function getTargetTemperatureInternal(roastType: RoastType): number {
  return TARGET_TEMPERATURES[roastType] || TARGET_TEMPERATURES[RoastType.MEDIUM];
}

function getWaitTimeAfterBoilInternal(targetTemperatureCelsius: number, waterAmountInKettleMl: number): number {
  if (targetTemperatureCelsius >= 100) return 0;
  const temperatureDropNeeded = 100 - targetTemperatureCelsius;
  const volumeFactor = Math.sqrt(REFERENCE_WATER_VOLUME_ML / Math.max(1, waterAmountInKettleMl)); // prevent division by zero
  const adjustedCoolingRate = BASE_COOLING_RATE_PER_MINUTE * volumeFactor;
  if (adjustedCoolingRate <= 0) return Infinity; // Should not happen with positive rates/volumes
  const waitTimeMinutes = temperatureDropNeeded / adjustedCoolingRate;
  return Math.round(waitTimeMinutes * 60);
}

function getCoffeeAndWaterInternal(brewMethod: BrewMethod, roastType: RoastType, requestedCups: number) {
  const actualCups = Math.min(requestedCups, MAX_CUPS[brewMethod] || 1);
  const waterPerCup = WATER_PER_CUP_ML[brewMethod];
  const totalWaterMl = waterPerCup * actualCups;

  const ratioSet = COFFEE_WATER_RATIOS[brewMethod];
  let ratioValue = ratioSet?.[roastType] || ratioSet?.[RoastType.MEDIUM] || 16; // Default if specific not found

  const coffeeGrams = totalWaterMl / ratioValue;
  
  return {
    coffeeGrams: parseFloat(coffeeGrams.toFixed(1)),
    waterMl: Math.round(totalWaterMl),
    ratioString: `1:${ratioValue.toFixed(1)}`,
    actualCups,
  };
}

function getAdjustedBrewTimeInternal(brewMethod: BrewMethod, roastType: RoastType, grindSize: GrindSize): number {
  let baseTime = BASE_BREW_TIMES_SECONDS[brewMethod]?.[roastType] || BASE_BREW_TIMES_SECONDS[brewMethod]?.[RoastType.MEDIUM] || 180;
  const adjustment = GRIND_ADJUSTMENTS_SECONDS[brewMethod]?.[grindSize] ?? 0;
  let adjustedTime = baseTime + adjustment;

  adjustedTime = Math.max(MIN_BREW_TIMES_SECONDS[brewMethod] || 60, adjustedTime);
  adjustedTime = Math.min(MAX_BREW_TIMES_SECONDS[brewMethod] || 360, adjustedTime);
  return adjustedTime;
}

function generatePourOverSteps(
  coffeeGrams: number,
  totalWaterMl: number,
  totalBrewTimeSeconds: number,
  roastType: RoastType
): RecipeStep[] {
  const steps: RecipeStep[] = [];
  let currentTime = 0;

  steps.push({
    id: 'pourover-prepare', title: '1. Prepare',
    details: 'Rinse filter with hot water, discard rinse water. Add coffee grounds to dripper, level the bed, and tare your scale.',
    startTimeSeconds: currentTime, durationSeconds: 0, isTimed: false,
  });

  const bloomWater = Math.round(coffeeGrams * POUROVER_BLOOM_COFFEE_RATIO);
  const bloomPourDuration = 15; // Estimated time to pour bloom water
  steps.push({
    id: 'pourover-bloom', title: '2. Bloom Pour',
    details: `Pour ${bloomWater}mL of water evenly to saturate all grounds. Start your main timer.`,
    startTimeSeconds: currentTime, durationSeconds: bloomPourDuration, isTimed: true,
  });
  currentTime += bloomPourDuration;

  // Adjust bloom wait time based on roast
  let bloomWaitActualSeconds = POUROVER_BLOOM_WAIT_SECONDS;
  if (roastType === RoastType.DARK || roastType === RoastType.ESPRESSO || roastType === RoastType.ESPRESSO_AXIL) {
    bloomWaitActualSeconds = 30; // Shorter bloom for darker roasts
  }
  steps.push({
    id: 'pourover-bloom-wait', title: '3. Wait for Bloom',
    details: `Allow coffee to bloom for ${bloomWaitActualSeconds} seconds. Look for CO2 bubbles escaping.`,
    startTimeSeconds: currentTime, durationSeconds: bloomWaitActualSeconds, isTimed: true,
  });
  currentTime += bloomWaitActualSeconds;

  const remainingWater = totalWaterMl - bloomWater;
  const numMainPours = POUROVER_DEFAULT_MAIN_POURS;
  const waterPerMainPour = Math.round(remainingWater / numMainPours);
  
  // Calculate duration for main pours and drawdown to fit totalBrewTimeSeconds
  const timeForPoursAndDrawdown = totalBrewTimeSeconds - currentTime;
  const durationPerMainPourPhase = Math.max(30, Math.floor(timeForPoursAndDrawdown / (numMainPours + 0.5))); // +0.5 for drawdown share
  const pourActionDuration = Math.round(durationPerMainPourPhase * 0.6); // 60% of phase is pouring
  const pourWaitDuration = Math.round(durationPerMainPourPhase * 0.4); // 40% is waiting/partial drawdown

  for (let i = 0; i < numMainPours; i++) {
    if (currentTime + pourActionDuration > totalBrewTimeSeconds && i < numMainPours -1) break; // Avoid overflow if time is too short
    const pourAmount = (i === numMainPours - 1) ? (totalWaterMl - (bloomWater + (waterPerMainPour * (numMainPours -1)))) : waterPerMainPour;

    steps.push({
      id: `pourover-mainpour-${i + 1}`, title: `4. Main Pour ${i + 1}/${numMainPours}`,
      details: `Slowly pour ${pourAmount}mL of water in a circular motion, avoiding the edges. Aim to reach ${bloomWater + (waterPerMainPour * (i+1))}mL total water.`,
      startTimeSeconds: currentTime, durationSeconds: pourActionDuration, isTimed: true,
    });
    currentTime += pourActionDuration;
    
    if (i < numMainPours - 1 && currentTime + pourWaitDuration < totalBrewTimeSeconds) {
       steps.push({
        id: `pourover-waitpour-${i + 1}`, title: `Wait Briefly`,
        details: `Allow water to partially draw down before next pour.`,
        startTimeSeconds: currentTime, durationSeconds: pourWaitDuration, isTimed: true,
      });
      currentTime += pourWaitDuration;
    }
  }
  
  const drawdownDuration = Math.max(15, totalBrewTimeSeconds - currentTime); // Ensure at least 15s for drawdown
   if (drawdownDuration > 0) {
    steps.push({
      id: 'pourover-drawdown', title: `${3 + numMainPours + (numMainPours-1)}. Final Drawdown`, // Adjust step number
      details: 'Allow all water to drip through the coffee bed. This should complete around your target brew time.',
      startTimeSeconds: currentTime, durationSeconds: drawdownDuration, isTimed: true,
    });
    currentTime += drawdownDuration;
   }


  steps.push({
    id: 'pourover-serve', title: 'Serve & Enjoy',
    details: 'Once dripping slows to every few seconds, remove dripper. Swirl, serve, and enjoy your coffee!',
    startTimeSeconds: totalBrewTimeSeconds, durationSeconds: 0, isTimed: false,
  });

  return steps;
}

function generateAeroPressSteps(coffeeGrams: number, totalWaterMl: number, totalBrewTimeSeconds: number): RecipeStep[] {
  const steps: RecipeStep[] = [];
  let currentTime = 0;

  steps.push({
    id: 'aeropress-prepare', title: '1. Prepare (Inverted)',
    details: 'Assemble AeroPress in inverted position (numbers upside down). Place on a sturdy mug or server. Rinse paper filter in cap with hot water and set aside.',
    startTimeSeconds: currentTime, durationSeconds: 0, isTimed: false,
  });

  const bloomWater = Math.round(coffeeGrams * AEROPRESS_BLOOM_COFFEE_RATIO);
  steps.push({
    id: 'aeropress-addcoffee', title: '2. Add Coffee & Bloom Water',
    details: `Add ${coffeeGrams.toFixed(1)}g of coffee. Pour ${bloomWater}mL of water. Start timer. Stir gently for 10s to ensure all grounds are wet.`,
    startTimeSeconds: currentTime, durationSeconds: 15, isTimed: true, // 15s for adding and stirring
  });
  currentTime += 15;

  const bloomWait = Math.min(AEROPRESS_BLOOM_WAIT_SECONDS, totalBrewTimeSeconds - currentTime - (AEROPRESS_PLUNGE_SECONDS + 5)); // ensure time for other steps
  if (bloomWait > 0) {
    steps.push({
      id: 'aeropress-bloomwait', title: '3. Wait for Bloom',
      details: `Allow coffee to bloom and saturate for ${bloomWait} seconds.`,
      startTimeSeconds: currentTime, durationSeconds: bloomWait, isTimed: true,
    });
    currentTime += bloomWait;
  }
  
  const remainingWater = totalWaterMl - bloomWater;
  const addWaterDuration = 10;
  steps.push({
    id: 'aeropress-addwater', title: '4. Add Remaining Water',
    details: `Add remaining ${remainingWater}mL of water, filling to desired level.`,
    startTimeSeconds: currentTime, durationSeconds: addWaterDuration, isTimed: true,
  });
  currentTime += addWaterDuration;

  const steepTime = Math.max(15, totalBrewTimeSeconds - currentTime - (AEROPRESS_PLUNGE_SECONDS + 5)); // Time before preparing to plunge
  if (steepTime > 0) {
     steps.push({
      id: 'aeropress-steep', title: '5. Steep',
      details: `Wait for ${steepTime} seconds for coffee to steep.`,
      startTimeSeconds: currentTime, durationSeconds: steepTime, isTimed: true,
    });
    currentTime += steepTime;
  }

  steps.push({
    id: 'aeropress-prepareplunge', title: '6. Prepare to Plunge',
    details: 'Secure filter cap. Carefully flip AeroPress onto your mug. Position for plunging.',
    startTimeSeconds: currentTime, durationSeconds: 10, isTimed: true, // 10s for capping and flipping
  });
  currentTime += 10;
  
  const plungeDuration = Math.min(AEROPRESS_PLUNGE_SECONDS, Math.max(10, totalBrewTimeSeconds - currentTime));
  steps.push({
    id: 'aeropress-plunge', title: '7. Plunge',
    details: `Slowly press plunger downwards for about ${plungeDuration} seconds. Stop if you hear a hiss.`,
    startTimeSeconds: currentTime, durationSeconds: plungeDuration, isTimed: true,
  });
  currentTime += plungeDuration;

  steps.push({
    id: 'aeropress-serve', title: '8. Serve',
    details: 'Your coffee concentrate is ready. Dilute with hot water to taste if desired. Enjoy!',
    startTimeSeconds: currentTime, durationSeconds: 0, isTimed: false,
  });
  
  // Ensure total time matches totalBrewTimeSeconds for timed steps
  const lastTimedStep = steps.filter(s => s.isTimed).pop();
  if(lastTimedStep && (lastTimedStep.startTimeSeconds + lastTimedStep.durationSeconds) !== totalBrewTimeSeconds) {
      // This logic is a bit tricky. For now, we assume the steps sum up correctly or close.
      // A more robust solution would adjust durations to fit.
      // The current logic tries to make `totalBrewTimeSeconds` the sum of timed steps.
      // Let's ensure the 'plunge' step ends at totalBrewTimeSeconds
      const currentTotalTimed = steps.filter(s => s.isTimed).reduce((acc, s, idx, arr) => {
        if (idx === arr.length -1 && s.id === 'aeropress-plunge') return acc; // don't add plunge yet
        return acc + s.durationSeconds;
      }, 0);
      const plungeStep = steps.find(s => s.id === 'aeropress-plunge');
      if (plungeStep) {
        plungeStep.durationSeconds = Math.max(10, totalBrewTimeSeconds - currentTotalTimed);
        plungeStep.startTimeSeconds = currentTotalTimed;
        const serveStep = steps.find(s => s.id === 'aeropress-serve');
        if(serveStep) serveStep.startTimeSeconds = totalBrewTimeSeconds;
      }
  }


  return steps;
}

function generateFrenchPressSteps(totalWaterMl: number, totalBrewTimeSeconds: number): RecipeStep[] {
  const steps: RecipeStep[] = [];
  let currentTime = 0;

  steps.push({
    id: 'frenchpress-prepare', title: '1. Preheat & Add Coffee',
    details: 'Preheat French Press vessel with hot water, then discard. Add coffee grounds.',
    startTimeSeconds: currentTime, durationSeconds: 0, isTimed: false,
  });

  const pourWaterDuration = 20; // Estimated time to pour all water
  steps.push({
    id: 'frenchpress-addwater', title: '2. Add Water',
    details: `Pour ${totalWaterMl}mL of hot water over grounds, ensuring all are saturated. Start timer. Place lid on top, plunger up.`,
    startTimeSeconds: currentTime, durationSeconds: pourWaterDuration, isTimed: true,
  });
  currentTime += pourWaterDuration;

  // Ensure crust break happens within brew time and leaves time for further steeping & plunging
  const crustBreakPossibleTime = FRENCH_PRESS_CRUST_BREAK_WAIT_SECONDS;
  const remainingTimeForSteepAndPlunge = totalBrewTimeSeconds - currentTime - FRENCH_PRESS_PLUNGE_SECONDS;
  
  const initialSteepTime = Math.min(crustBreakPossibleTime, Math.max(30, remainingTimeForSteepAndPlunge - 30)); // Ensure at least 30s initial steep
  if (initialSteepTime > 0) {
    steps.push({
      id: 'frenchpress-initialsteep', title: '3. Initial Steep',
      details: `Let coffee steep for ${initialSteepTime} seconds.`,
      startTimeSeconds: currentTime, durationSeconds: initialSteepTime, isTimed: true,
    });
    currentTime += initialSteepTime;
  }
  
  const breakCrustDuration = 10; // Action of breaking crust
  steps.push({
    id: 'frenchpress-breakcrust', title: '4. Break Crust',
    details: 'Gently stir the top layer (the crust) to allow grounds to sink.',
    startTimeSeconds: currentTime, durationSeconds: breakCrustDuration, isTimed: true,
  });
  currentTime += breakCrustDuration;

  const continueSteepingTime = Math.max(30, totalBrewTimeSeconds - currentTime - FRENCH_PRESS_PLUNGE_SECONDS);
  if (continueSteepingTime > 0) {
    steps.push({
      id: 'frenchpress-continuesteep', title: '5. Continue Steeping',
      details: `Allow coffee to continue steeping for ${continueSteepingTime} seconds.`,
      startTimeSeconds: currentTime, durationSeconds: continueSteepingTime, isTimed: true,
    });
    currentTime += continueSteepingTime;
  }
  
  const plungeDuration = Math.min(FRENCH_PRESS_PLUNGE_SECONDS, Math.max(10, totalBrewTimeSeconds - currentTime));
  steps.push({
    id: 'frenchpress-press', title: '6. Press',
    details: `Slowly and steadily press the plunger all the way down over about ${plungeDuration} seconds.`,
    startTimeSeconds: currentTime, durationSeconds: plungeDuration, isTimed: true,
  });
  currentTime += plungeDuration;

  steps.push({
    id: 'frenchpress-serve', title: '7. Serve Immediately',
    details: 'Pour coffee into mugs immediately to prevent over-extraction. Enjoy!',
    startTimeSeconds: totalBrewTimeSeconds, durationSeconds: 0, isTimed: false,
  });
  
  // Similar to AeroPress, ensure the final timed step (Press) concludes at totalBrewTimeSeconds
    const currentTotalTimedBeforePlunge = steps
    .filter(s => s.isTimed && s.id !== 'frenchpress-press')
    .reduce((acc, s) => acc + s.durationSeconds, 0);

  const pressStep = steps.find(s => s.id === 'frenchpress-press');
  if (pressStep) {
    pressStep.durationSeconds = Math.max(10, totalBrewTimeSeconds - currentTotalTimedBeforePlunge);
    pressStep.startTimeSeconds = currentTotalTimedBeforePlunge;
    const serveStep = steps.find(s => s.id === 'frenchpress-serve');
    if(serveStep) serveStep.startTimeSeconds = totalBrewTimeSeconds;
  }


  return steps;
}


function generateRecipeStepsInternal(
  brewMethod: BrewMethod,
  roastType: RoastType,
  coffeeGrams: number,
  totalWaterMl: number,
  totalBrewTimeSeconds: number,
  _grindSize: GrindSize, // May be used in future for more nuanced step generation
  _cups: number // May be used in future
): RecipeStep[] {
  switch (brewMethod) {
    case BrewMethod.POUROVER:
      return generatePourOverSteps(coffeeGrams, totalWaterMl, totalBrewTimeSeconds, roastType);
    case BrewMethod.AEROPRESS:
      return generateAeroPressSteps(coffeeGrams, totalWaterMl, totalBrewTimeSeconds);
    case BrewMethod.FRENCH_PRESS:
      return generateFrenchPressSteps(totalWaterMl, totalBrewTimeSeconds);
    default:
      return [{ id: 'error', title: 'Error', details: 'Brew method not supported for step generation.', startTimeSeconds: 0, durationSeconds: 0, isTimed: false }];
  }
}

function getGeneratedWarnings(
  roastType: RoastType,
  grindSize: GrindSize,
  brewMethod: BrewMethod,
  _coffeeGrams: number, // available for more complex warnings
  _waterMl: number      // available for more complex warnings
): WarningMessage[] {
  const warnings: WarningMessage[] = [];

  // Critical Warning 1: Pre-ground Fine + Pour-Over + Dark/Espresso Roasts
  if (
    (grindSize === GrindSize.PRE_GROUND_FINE || grindSize === GrindSize.FINE) &&
    brewMethod === BrewMethod.POUROVER &&
    (roastType === RoastType.DARK || roastType === RoastType.ESPRESSO || roastType === RoastType.ESPRESSO_AXIL)
  ) {
    warnings.push({
      id: 'preground-fine-pourover-dark',
      severity: 'critical',
      message: 'Pre-ground fine or espresso grind with darker roasts in a pour-over can lead to issues.',
      recommendation: 'This combination may cause over-extraction or clogging. Consider using an AeroPress, or if proceeding with pour-over, the calculator has adjusted for cooler water. Pour gently and ensure even distribution.',
    });
  }

  // Critical Warning 2: Fine Grind + French Press
  if ((grindSize === GrindSize.FINE || grindSize === GrindSize.PRE_GROUND_FINE) && brewMethod === BrewMethod.FRENCH_PRESS) {
    warnings.push({
      id: 'fine-grind-frenchpress',
      severity: 'critical',
      message: 'Fine grind is likely to pass through a French Press filter.',
      recommendation: 'This can result in a muddy, over-extracted cup. A coarser grind is highly recommended for French Press.',
    });
  }

  // Critical Warning 3: Light Roast + Coarse Grind + AeroPress
  if (roastType === RoastType.LIGHT && (grindSize === GrindSize.COARSE || grindSize === GrindSize.MEDIUM_COARSE) && brewMethod === BrewMethod.AEROPRESS) {
    warnings.push({
      id: 'light-coarse-aeropress',
      severity: 'critical',
      message: 'Light roast with a coarse grind in an AeroPress might under-extract.',
      recommendation: 'Light roasts are harder to extract. Consider a finer grind (medium-fine) or a longer brew time for better flavor development with AeroPress.',
    });
  }
  
  // Special Case: Any Espresso Roast + Pour-Over
  if ((roastType === RoastType.ESPRESSO || roastType === RoastType.ESPRESSO_AXIL) && brewMethod === BrewMethod.POUROVER && !warnings.some(w => w.id === 'preground-fine-pourover-dark')) {
     warnings.push({
        id: 'espresso-pourover',
        severity: 'info',
        message: 'Using Espresso Roast for Pour-Over.',
        recommendation: 'Espresso roasts extract faster. The recipe has been adjusted for cooler water and a potentially shorter brew time. Monitor drawdown closely.'
     });
  }

  return warnings;
}


export function generateFullRecipe(
  roastType: RoastType,
  grindSize: GrindSize,
  waterAmountInKettleMl: number,
  brewMethod: BrewMethod,
  cups: number
): CalculatedRecipe {
  
  let baseTargetTemp = getTargetTemperatureInternal(roastType);
  const { coffeeGrams, waterMl, ratioString, actualCups } = getCoffeeAndWaterInternal(brewMethod, roastType, cups);
  let adjustedBrewTime = getAdjustedBrewTimeInternal(brewMethod, roastType, grindSize);

  const warnings = getGeneratedWarnings(roastType, grindSize, brewMethod, coffeeGrams, waterMl);
  
  let finalTargetTemp = baseTargetTemp;
  const pregroundFinePouroverDarkWarning = warnings.find(w => w.id === 'preground-fine-pourover-dark');
  if (pregroundFinePouroverDarkWarning) {
    finalTargetTemp = Math.max(70, baseTargetTemp - 5); // Apply -5°C adjustment
  }

  const waitTimeSeconds = getWaitTimeAfterBoilInternal(finalTargetTemp, waterAmountInKettleMl);

  const steps = generateRecipeStepsInternal(
    brewMethod,
    roastType,
    coffeeGrams,
    waterMl,
    adjustedBrewTime,
    grindSize,
    actualCups
  );

  return {
    targetTemperatureCelsius: Math.round(finalTargetTemp),
    waitTimeAfterBoilSeconds: Math.round(waitTimeSeconds),
    coffeeAmountGrams: coffeeGrams, // Already toFixed(1) in getCoffeeAndWaterInternal
    waterForBrewingMl: waterMl, // Already rounded
    coffeeToWaterRatio: ratioString,
    totalBrewTimeSeconds: adjustedBrewTime,
    steps,
    warnings,
    inputs: { roastType, grindSize, waterAmountInKettleMl, brewMethod, cups: actualCups },
  };
}
    