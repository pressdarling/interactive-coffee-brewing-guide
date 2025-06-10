
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
}

export function NumberInputControl({ id, label, value, onChange, min, max, step = 1, unit, helpText }: NumberInputControlProps): React.ReactNode {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numValue = parseInt(e.target.value, 10);
    if (isNaN(numValue)) numValue = min !== undefined ? min : 0;
    if (min !== undefined) numValue = Math.max(min, numValue);
    if (max !== undefined) numValue = Math.min(max, numValue);
    onChange(numValue);
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
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
      />
       {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}
    