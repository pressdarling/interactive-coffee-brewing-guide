
import React from 'react';

interface ButtonGroupControlProps {
  label: string;
  options: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
  maxSelectable?: number;
  helpText?: string;
}

export function ButtonGroupControl({ label, options, selectedValue, onSelect, maxSelectable, helpText }: ButtonGroupControlProps): React.ReactNode {
  const availableOptions = maxSelectable ? options.filter(opt => opt <= maxSelectable) : options;
  
  return (
    <div className="mb-4">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <div className="flex space-x-2">
        {availableOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none transition-colors
              ${selectedValue === option
                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            {option}
          </button>
        ))}
      </div>
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      {maxSelectable && availableOptions.length === 0 && <p className="mt-1 text-xs text-red-500">No valid cup options for this method.</p>}
    </div>
  );
}
    