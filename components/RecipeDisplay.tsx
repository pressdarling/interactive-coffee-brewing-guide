
import React from 'react';
import { CalculatedRecipe } from '../types';

interface RecipeDisplayProps {
  recipe: CalculatedRecipe | null;
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const DetailItem: React.FC<{label: string, value: string | number, unit?: string, help?: string}> = ({ label, value, unit, help }) => (
  <div className="py-2 px-3 bg-gray-50 rounded-md">
    <span className="text-sm font-medium text-gray-600 block">{label}</span>
    <span className="text-lg font-semibold text-indigo-700">
      {value}
      {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
    </span>
    {help && <p className="text-xs text-gray-500 mt-0.5">{help}</p>}
  </div>
);


export function RecipeDisplay({ recipe }: RecipeDisplayProps): React.ReactNode {
  if (!recipe) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 text-center">
        <p className="text-gray-600">Enter your preferences above to generate a brewing recipe.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Your Custom Recipe</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <DetailItem label="Target Water Temp" value={recipe.targetTemperatureCelsius} unit="°C" />
        <DetailItem label="Wait After Boil" value={formatSeconds(recipe.waitTimeAfterBoilSeconds)} unit="min:sec" help={recipe.waitTimeAfterBoilSeconds > 0 ? `For ${recipe.inputs.waterAmountInKettleMl}mL in kettle` : "No wait needed"} />
        <DetailItem label="Coffee Amount" value={recipe.coffeeAmountGrams} unit="g" />
        <DetailItem label="Water for Brewing" value={recipe.waterForBrewingMl} unit="mL" />
        <DetailItem label="Coffee : Water Ratio" value={recipe.coffeeToWaterRatio} />
        <DetailItem label="Total Brew Time" value={formatSeconds(recipe.totalBrewTimeSeconds)} unit="min:sec" />
      </div>
    </div>
  );
}
    