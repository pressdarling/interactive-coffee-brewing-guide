
import React, { useState, useEffect, useCallback } from 'react';

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

export function NumberInputControl({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  helpText,
  useSlider = false,
}: NumberInputControlProps): React.ReactNode {
  const [internalDisplayValue, setInternalDisplayValue] = useState<string>(value.toString());

  // Update internal string state when the numeric prop 'value' changes (e.g., from slider or parent)
  useEffect(() => {
    // Only update if the string value significantly differs from the number prop,
    // or if the input is not currently focused (to avoid disrupting typing).
    // For simplicity here, we'll update if it's different or doesn't parse to the same number.
    const parsedInternal = parseFloat(internalDisplayValue);
    if (parsedInternal !== value || (isNaN(parsedInternal) && !isNaN(value))) {
         if (document.activeElement !== document.getElementById(id)) {
            setInternalDisplayValue(value.toString());
         }
    }
  }, [value, id, internalDisplayValue]);

  const validateAndPropagate = useCallback((currentStrValue: string) => {
    let numValue = parseFloat(currentStrValue);

    if (isNaN(numValue)) {
      numValue = min !== undefined ? min : 0;
    }

    // Apply step alignment
    // Ensure value aligns with step if provided.
    if (step && step !== 0) {
      if (min !== undefined) {
        numValue = min + Math.round((numValue - min) / step) * step;
      } else {
        numValue = Math.round(numValue / step) * step;
      }
      numValue = parseFloat(numValue.toFixed(5)); // Avoid floating point issues from step arithmetic
    }
    
    // Clamp value within min/max bounds
    if (min !== undefined) numValue = Math.max(min, numValue);
    if (max !== undefined) numValue = Math.min(max, numValue);
    
    // Round to a reasonable precision if step is decimal, e.g. 2 decimal places
    // This can be adjusted based on typical step values
    const precision = step && step < 1 ? (step.toString().split('.')[1] || '').length : 0;
    if (precision > 0) {
        numValue = parseFloat(numValue.toFixed(precision));
    }


    onChange(numValue); // Propagate the validated and clamped numeric value
    // The parent's re-render with the new 'value' prop will update internalDisplayValue via useEffect
    // but we can also set it directly to ensure the input field reflects the clamped value immediately after blur.
    setInternalDisplayValue(numValue.toString());

  }, [min, max, step, onChange]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalDisplayValue(e.target.value); // Allow free typing
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateAndPropagate(e.target.value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = parseFloat(e.target.value);
    // Slider value is already constrained by its min/max/step attributes.
    // We directly call onChange, which will update the 'value' prop.
    // The useEffect will then sync internalDisplayValue.
    onChange(sliderValue);
  };

  const labelId = `${id}-label`;

  return (
    <div className="mb-4">
      <label htmlFor={id} id={labelId} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {unit && `(${unit})`}
      </label>
      <input
        type="number" // Keep as number for native controls like spinner, but manage value carefully
        id={id}
        name={id}
        value={internalDisplayValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        min={min} // Informative for browser, but our logic primarily handles clamping
        max={max}
        step={step} // Allows browser step controls (up/down arrows)
        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        aria-labelledby={labelId}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value} // Reflects the actual validated numeric value
      />
      {useSlider && min !== undefined && max !== undefined && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value} // Slider directly uses the numeric 'value' prop
          onChange={handleSliderChange}
          className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
          aria-labelledby={labelId} // Can also use aria-controls to link to the number input
        />
      )}
       {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}
