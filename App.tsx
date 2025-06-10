
import React, { useState, useEffect, useCallback } from 'react';
import { BrewMethod, GrindSize, RoastType, CalculatedRecipe, TimerInstance, RecipeStep } from './types';
import { generateFullRecipe } from './services/brewingLogic';
import { DEFAULT_WATER_IN_KETTLE_ML, MAX_CUPS } from './constants';
import { InputSection } from './components/InputSection';
import { RecipeDisplay } from './components/RecipeDisplay';
import { WarningsDisplay } from './components/WarningsDisplay';
import { TimerSection } from './components/TimerSection';
import { RecipeStepsList } from './components/RecipeStepsList';
import { SourceReferences } from './components/SourceReferences';

const initialTimerState: TimerInstance = {
  intervalId: null,
  secondsElapsed: 0,
  isRunning: false,
  currentStepIndex: -1,
};

function App(): React.ReactNode {
  const [roastType, setRoastType] = useState<RoastType>(RoastType.MEDIUM);
  const [grindSize, setGrindSize] = useState<GrindSize>(GrindSize.MEDIUM);
  const [waterAmount, setWaterAmount] = useState<number>(DEFAULT_WATER_IN_KETTLE_ML);
  const [brewMethod, setBrewMethod] = useState<BrewMethod>(BrewMethod.POUROVER);
  const [cups, setCups] = useState<number>(1);

  const [calculatedRecipe, setCalculatedRecipe] = useState<CalculatedRecipe | null>(null);
  
  const [timers, setTimers] = useState<Record<BrewMethod, TimerInstance>>({
    [BrewMethod.POUROVER]: { ...initialTimerState },
    [BrewMethod.AEROPRESS]: { ...initialTimerState },
    [BrewMethod.FRENCH_PRESS]: { ...initialTimerState },
  });

  const activeTimer = timers[brewMethod];

  // Recalculate recipe when inputs change
  useEffect(() => {
    const recipe = generateFullRecipe(roastType, grindSize, waterAmount, brewMethod, cups);
    setCalculatedRecipe(recipe);
    // Reset timer for the current method if inputs change significantly
    // or if method changes and a timer was running for the old method.
    // For simplicity, we reset the timer of the current method if its recipe changes.
    // A more nuanced approach might only reset if key parameters changed.
    if (activeTimer.isRunning || activeTimer.secondsElapsed > 0) {
       if (activeTimer.intervalId) clearInterval(activeTimer.intervalId);
        setTimers(prevTimers => ({
            ...prevTimers,
            [brewMethod]: { ...initialTimerState }
        }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roastType, grindSize, waterAmount, brewMethod, cups]);


  // Cup adjustment effect when brew method changes
  useEffect(() => {
    const max = MAX_CUPS[brewMethod] || 1;
    if (cups > max) {
      setCups(max);
    }
  }, [brewMethod, cups]);


  // Timer effect
  useEffect(() => {
    if (activeTimer.isRunning && calculatedRecipe) {
      const newIntervalId = setInterval(() => {
        setTimers(prevTimers => {
          const currentMethodTimer = prevTimers[brewMethod];
          const newSecondsElapsed = currentMethodTimer.secondsElapsed + 1;
          
          let newCurrentStepIndex = currentMethodTimer.currentStepIndex;
          // Find current step based on newSecondsElapsed
          if (calculatedRecipe && calculatedRecipe.steps.length > 0) {
            const stepIdx = calculatedRecipe.steps.findIndex((step, idx) => {
                const stepEndTime = step.startTimeSeconds + step.durationSeconds;
                // If it's the last step, it's active until newSecondsElapsed exceeds its start + duration OR total brew time
                if (idx === calculatedRecipe.steps.length - 1 && step.isTimed) {
                    return newSecondsElapsed <= Math.min(stepEndTime, calculatedRecipe.totalBrewTimeSeconds);
                }
                 // If not timed, it's active if newSecondsElapsed is at its start time (e.g. "Prepare")
                if (!step.isTimed) {
                    return newSecondsElapsed >= step.startTimeSeconds && (calculatedRecipe.steps[idx+1] ? newSecondsElapsed < calculatedRecipe.steps[idx+1].startTimeSeconds : true);
                }
                // For timed steps
                return newSecondsElapsed >= step.startTimeSeconds && newSecondsElapsed < stepEndTime;
            });
            newCurrentStepIndex = stepIdx !== -1 ? stepIdx : calculatedRecipe.steps.length; // If no step found, means brewing is done or past last step
          }


          if (newSecondsElapsed > calculatedRecipe.totalBrewTimeSeconds && calculatedRecipe.totalBrewTimeSeconds > 0) {
            clearInterval(newIntervalId); // Stop timer
            return {
              ...prevTimers,
              [brewMethod]: {
                ...currentMethodTimer,
                secondsElapsed: calculatedRecipe.totalBrewTimeSeconds, // Cap at total time
                isRunning: false,
                intervalId: null,
                currentStepIndex: newCurrentStepIndex >= calculatedRecipe.steps.length -1 ? calculatedRecipe.steps.length -1 : newCurrentStepIndex, // Stay on last timed step or a "serve" step
              }
            };
          }
          
          return {
            ...prevTimers,
            [brewMethod]: {
              ...currentMethodTimer,
              secondsElapsed: newSecondsElapsed,
              currentStepIndex: newCurrentStepIndex,
            }
          };
        });
      }, 1000);
      
      // Store interval ID for cleanup
      setTimers(prevTimers => ({
          ...prevTimers,
          [brewMethod]: { ...prevTimers[brewMethod], intervalId: newIntervalId }
      }));

      return () => clearInterval(newIntervalId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimer.isRunning, brewMethod, calculatedRecipe]); // Re-run if isRunning, method, or recipe changes


  const handleStartTimer = useCallback(() => {
    if (!calculatedRecipe || activeTimer.secondsElapsed >= calculatedRecipe.totalBrewTimeSeconds) return;

    // Determine initial step if starting from 0
    let initialStepIndex = activeTimer.currentStepIndex;
    if (activeTimer.secondsElapsed === 0 && calculatedRecipe && calculatedRecipe.steps.length > 0) {
        initialStepIndex = calculatedRecipe.steps.findIndex(step => step.startTimeSeconds === 0 && step.isTimed);
        if (initialStepIndex === -1) initialStepIndex = 0; // fallback to first step
    }

    setTimers(prev => ({
      ...prev,
      [brewMethod]: { ...prev[brewMethod], isRunning: true, currentStepIndex: initialStepIndex }
    }));
  }, [calculatedRecipe, activeTimer.secondsElapsed, activeTimer.currentStepIndex, brewMethod]);

  const handlePauseTimer = useCallback(() => {
    if (activeTimer.intervalId) {
      clearInterval(activeTimer.intervalId);
    }
    setTimers(prev => ({
      ...prev,
      [brewMethod]: { ...prev[brewMethod], isRunning: false, intervalId: null }
    }));
  }, [activeTimer.intervalId, brewMethod]);

  const handleResetTimer = useCallback(() => {
    if (activeTimer.intervalId) {
      clearInterval(activeTimer.intervalId);
    }
    setTimers(prev => ({
      ...prev,
      [brewMethod]: { ...initialTimerState }
    }));
  }, [activeTimer.intervalId, brewMethod]);

  const currentRecipeStep: RecipeStep | null = 
    (calculatedRecipe && activeTimer.currentStepIndex >= 0 && activeTimer.currentStepIndex < calculatedRecipe.steps.length)
    ? calculatedRecipe.steps[activeTimer.currentStepIndex]
    : null;

  const nextRecipeStep: RecipeStep | null =
    (calculatedRecipe && activeTimer.currentStepIndex >= -1 && activeTimer.currentStepIndex + 1 < calculatedRecipe.steps.length)
    ? calculatedRecipe.steps[activeTimer.currentStepIndex + 1]
    : null;

  let elapsedSecondsInCurrentStep = 0;
  if (currentRecipeStep && currentRecipeStep.isTimed) {
      elapsedSecondsInCurrentStep = Math.max(0, activeTimer.secondsElapsed - currentRecipeStep.startTimeSeconds);
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-stone-100 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800">
          Interactive Coffee Brewing Guide
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Craft your perfect cup. Adjust parameters, get a custom recipe, and use the built-in timer.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <InputSection
          roastType={roastType} setRoastType={setRoastType}
          grindSize={grindSize} setGrindSize={setGrindSize}
          waterAmount={waterAmount} setWaterAmount={setWaterAmount}
          brewMethod={brewMethod} setBrewMethod={setBrewMethod}
          cups={cups} setCups={setCups}
        />

        {calculatedRecipe && (
          <>
            <RecipeDisplay recipe={calculatedRecipe} />
            <WarningsDisplay warnings={calculatedRecipe.warnings} />
            
            <div className="md:flex md:space-x-6">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <TimerSection
                  totalElapsedSeconds={activeTimer.secondsElapsed}
                  isRunning={activeTimer.isRunning}
                  currentStep={currentRecipeStep}
                  nextStep={nextRecipeStep}
                  totalBrewTimeForRecipe={calculatedRecipe.totalBrewTimeSeconds}
                  onStart={handleStartTimer}
                  onPause={handlePauseTimer}
                  onReset={handleResetTimer}
                  isRecipeGenerated={!!calculatedRecipe}
                />
              </div>
              <div className="md:w-2/3">
                 <RecipeStepsList 
                    steps={calculatedRecipe.steps} 
                    currentStepIndex={activeTimer.currentStepIndex}
                    elapsedSecondsInCurrentStep={elapsedSecondsInCurrentStep}
                  />
              </div>
            </div>
          </>
        )}
        <SourceReferences />
      </main>
      <footer className="text-center mt-12 py-6 border-t border-gray-300">
        <p className="text-sm text-gray-500">
          Happy Brewing! &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default App;

    