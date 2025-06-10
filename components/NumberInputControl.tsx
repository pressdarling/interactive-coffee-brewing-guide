import React from 'react';

interface NumberInputControlProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  helpText?: string;
  useSlider?: boolean;
}

export function NumberInputControl({ id, label, value, onChange, min, max, step = 1, unit, helpText, useSlider = false }: NumberInputControlProps): React.ReactNode {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let numValue = parseFloat(e.target.value); // Use parseFloat for potentially decimal steps

    if (isNaN(numValue)) {
      numValue = min !== undefined ? min : 0;
    }
    
    // Clamp value within min/max bounds
    if (min !== undefined) numValue = Math.max(min, numValue);
    if (max !== undefined) numValue = Math.min(max, numValue);
    
    // Ensure value aligns with step if provided, especially for direct input
    // For sliders, this is often handled by the browser, but number input needs it.
    if (step && step !== 0) { // Check step is not zero to avoid division by zero
        if (min !== undefined) {
             numValue = min + Math.round((numValue - min) / step) * step;
        } else {
            numValue = Math.round(numValue / step) * step;
        }
    }
     // Re-clamp after step adjustment
    if (min !== undefined) numValue = Math.max(min, numValue);
    if (max !== undefined) numValue = Math.min(max, numValue);


    onChange(parseFloat(numValue.toFixed(2))); // Keep some precision if step is decimal
  };

  const labelId = `${id}-label`;

  return (
    <div className="mb-4">
      <label htmlFor={id} id={labelId} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {unit && `(${unit})`}
      </label>
      <input
        type="number"
        id={id}
        name={id}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        aria-labelledby={labelId}
      />
      {useSlider && min !== undefined && max !== undefined && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
          aria-labelledby={labelId}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      )}
       {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}