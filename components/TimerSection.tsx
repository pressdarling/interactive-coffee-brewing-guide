
import React from 'react';
import { RecipeStep } from '../types';

interface TimerSectionProps {
  totalElapsedSeconds: number;
  isRunning: boolean;
  currentStep: RecipeStep | null;
  nextStep: RecipeStep | null;
  totalBrewTimeForRecipe: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  isRecipeGenerated: boolean;
}

function formatTimerDisplay(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}


export function TimerSection({
  totalElapsedSeconds,
  isRunning,
  currentStep,
  nextStep,
  totalBrewTimeForRecipe,
  onStart,
  onPause,
  onReset,
  isRecipeGenerated,
}: TimerSectionProps): React.ReactNode {

  const overallProgress = totalBrewTimeForRecipe > 0 ? (totalElapsedSeconds / totalBrewTimeForRecipe) * 100 : 0;

  let timeRemainingInStep = 0;
  if (currentStep && currentStep.isTimed && currentStep.durationSeconds > 0) {
      const elapsedInThisStep = totalElapsedSeconds - currentStep.startTimeSeconds;
      timeRemainingInStep = Math.max(0, currentStep.durationSeconds - elapsedInThisStep);
  }


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 sticky top-4 z-10">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Brew Timer</h3>
      
      <div className="text-center mb-4">
        <p className="text-6xl font-mono-timer font-bold text-indigo-600 tabular-nums">
          {formatTimerDisplay(totalElapsedSeconds)}
        </p>
        {totalBrewTimeForRecipe > 0 && (
          <p className="text-sm text-gray-500 font-mono-timer">
            Total Recipe Time: {formatTimerDisplay(totalBrewTimeForRecipe)}
          </p>
        )}
      </div>

      {isRecipeGenerated && totalBrewTimeForRecipe > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${Math.min(100, overallProgress)}%` }}
          ></div>
        </div>
      )}

      {currentStep && (
        <div className="text-center mb-4 p-3 bg-indigo-50 rounded-md">
          <p className="text-sm text-gray-500">Current Step:</p>
          <p className="text-md font-semibold text-indigo-700">{currentStep.title}</p>
           {currentStep.isTimed && timeRemainingInStep > 0 && (
             <p className="text-xs text-indigo-500 font-mono-timer">({formatTimerDisplay(timeRemainingInStep)} remaining in step)</p>
           )}
        </div>
      )}

      {nextStep && isRunning && (
         <div className="text-center mb-6 p-2 bg-gray-100 rounded-md">
          <p className="text-xs text-gray-500">Next:</p>
          <p className="text-sm font-medium text-gray-700">{nextStep.title}</p>
        </div>
      )}


      <div className="flex justify-center space-x-3">
        {!isRunning ? (
          <button
            onClick={onStart}
            disabled={!isRecipeGenerated || (totalElapsedSeconds > 0 && totalElapsedSeconds >= totalBrewTimeForRecipe)}
            className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
            </svg>
            {totalElapsedSeconds > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-8 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition-colors text-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
            Pause
          </button>
        )}
        <button
          onClick={onReset}
          disabled={!isRecipeGenerated && totalElapsedSeconds === 0}
          className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
            <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-4.5V4.5l1.903 1.903A9 9 0 003.059 10.059v2.474c.596-.078 1.21-.13 1.83-.131v-2.343zM19.245 13.941A7.5 7.5 0 016.755 17.305l-1.903-1.903h4.5v4.5l-1.903-1.903a9 9 0 0014.439-6.313v-2.474c-.596.078-1.21.13-1.83.131v2.343z" clipRule="evenodd" />
          </svg>
          Reset
        </button>
      </div>
      {!isRecipeGenerated && <p className="text-xs text-center text-gray-500 mt-4">Generate a recipe first to enable timer controls.</p>}
       {(totalElapsedSeconds > 0 && totalElapsedSeconds >= totalBrewTimeForRecipe && isRecipeGenerated) && (
         <p className="text-sm text-center text-green-600 mt-4 font-semibold">Brewing complete!</p>
       )}
    </div>
  );
}

    