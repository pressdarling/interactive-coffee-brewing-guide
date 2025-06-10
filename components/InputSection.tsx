
import React from 'react';
import { BrewMethod, GrindSize, RoastType } from '../types';
import { SelectControl } from './SelectControl';
import { NumberInputControl } from './NumberInputControl';
import { ButtonGroupControl } from './ButtonGroupControl';
import { GRIND_SIZE_VISUALS, MAX_CUPS, MIN_WATER_IN_KETTLE_ML, MAX_WATER_IN_KETTLE_ML, DEFAULT_WATER_IN_KETTLE_ML } from '../constants';
import { Tooltip } from './Tooltip';

interface InputSectionProps {
  roastType: RoastType;
  setRoastType: (value: RoastType) => void;
  grindSize: GrindSize;
  setGrindSize: (value: GrindSize) => void;
  waterAmount: number;
  setWaterAmount: (value: number) => void;
  brewMethod: BrewMethod;
  setBrewMethod: (value: BrewMethod) => void;
  cups: number;
  setCups: (value: number) => void;
}

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block ml-1 text-gray-400 hover:text-gray-600 cursor-pointer">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);


export function InputSection({
  roastType, setRoastType,
  grindSize, setGrindSize,
  waterAmount, setWaterAmount,
  brewMethod, setBrewMethod,
  cups, setCups,
}: InputSectionProps): React.ReactNode {

  const handleCupsChange = (newCups: number) => {
    const max = MAX_CUPS[brewMethod] || 1;
    setCups(Math.min(newCups, max));
  };
  
  const currentGrindVisual = GRIND_SIZE_VISUALS[grindSize];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Brewing Parameters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <SelectControl<RoastType>
          id="roastType"
          label="Coffee Roast Type"
          value={roastType}
          options={Object.values(RoastType)}
          onChange={setRoastType}
        />

        <div>
          <SelectControl<GrindSize>
            id="grindSize"
            label="Grind Size"
            value={grindSize}
            options={Object.values(GrindSize)}
            onChange={setGrindSize}
            helpText={currentGrindVisual ? `${currentGrindVisual.description} (e.g., ${currentGrindVisual.example})` : undefined}
          />
        </div>
        
        <SelectControl<BrewMethod>
          id="brewMethod"
          label="Brewing Method"
          value={brewMethod}
          options={Object.values(BrewMethod)}
          onChange={(newMethod) => {
            setBrewMethod(newMethod);
            // Adjust cups if current selection exceeds max for new method
            if (cups > (MAX_CUPS[newMethod] || 1)) {
              setCups(MAX_CUPS[newMethod] || 1);
            }
          }}
        />

        <NumberInputControl
          id="waterAmount"
          label="Water in Kettle"
          value={waterAmount}
          onChange={setWaterAmount}
          min={MIN_WATER_IN_KETTLE_ML}
          max={MAX_WATER_IN_KETTLE_ML}
          unit="mL"
          helpText={`Default: ${DEFAULT_WATER_IN_KETTLE_ML}mL. Affects water cooling time.`}
        />
        
        <div className="md:col-span-2">
         <ButtonGroupControl
            label="Number of Cups"
            options={[1, 2, 3, 4]}
            selectedValue={cups}
            onSelect={handleCupsChange}
            maxSelectable={MAX_CUPS[brewMethod]}
            helpText={`Max cups for ${brewMethod}: ${MAX_CUPS[brewMethod]}.`}
          />
        </div>
      </div>
    </div>
  );
}
    