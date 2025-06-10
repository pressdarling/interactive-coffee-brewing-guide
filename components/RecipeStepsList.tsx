
import React from 'react';
import { RecipeStep } from '../types';

interface RecipeStepsListProps {
  steps: RecipeStep[];
  currentStepIndex: number;
  elapsedSecondsInCurrentStep: number;
}

function formatStepTime(seconds: number): string {
  if (seconds === 0 && !Number.isInteger(seconds)) return '...'; // Handle initial undefined case if any
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

export function RecipeStepsList({ steps, currentStepIndex, elapsedSecondsInCurrentStep }: RecipeStepsListProps): React.ReactNode {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Brewing Steps</h3>
      <ol className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const stepProgress = isActive && step.durationSeconds > 0 ? (elapsedSecondsInCurrentStep / step.durationSeconds) * 100 : 0;

          return (
            <li key={step.id} className={`p-4 rounded-md transition-all duration-300 ease-in-out relative overflow-hidden
              ${isActive ? 'bg-indigo-50 ring-2 ring-indigo-500 shadow-md' : isCompleted ? 'bg-green-50 opacity-70' : 'bg-gray-50 hover:bg-gray-100'}
            `}>
              <div className="flex justify-between items-start">
                <h4 className={`text-md font-semibold ${isActive ? 'text-indigo-700' : isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                  {step.title}
                </h4>
                {step.isTimed && step.durationSeconds > 0 && (
                  <span className={`text-sm font-mono-timer px-2 py-0.5 rounded
                    ${isActive ? 'text-indigo-600 bg-indigo-100' : isCompleted ? 'text-green-600 bg-green-100' : 'text-gray-500 bg-gray-200'}
                  `}>
                    {formatStepTime(step.durationSeconds)}
                  </span>
                )}
              </div>
              <p className={`mt-1 text-sm ${isActive ? 'text-gray-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                {step.details}
              </p>
              {isActive && step.isTimed && step.durationSeconds > 0 && (
                 <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${Math.min(100, stepProgress)}%` }}
                    ></div>
                  </div>
              )}
               {isCompleted && (
                  <div className="absolute top-2 right-2 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
    