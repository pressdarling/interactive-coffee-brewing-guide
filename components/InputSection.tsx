
import React from 'react';
import { BrewMethod, GrindSize, RoastType } from '../types';
import { SelectControl } from './SelectControl';
import { NumberInputControl } from './NumberInputControl';
import { ButtonGroupControl } from './ButtonGroupControl';
import { TabButtonGroupControl, TabOption } from './TabButtonGroupControl'; // Import new component
import { GRIND_SIZE_VISUALS, MAX_CUPS, MIN_WATER_IN_KETTLE_ML, MAX_WATER_IN_KETTLE_ML } from '../constants';


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

  const brewMethodOptions: TabOption<BrewMethod>[] = Object.values(BrewMethod).map(method => ({
    value: method,
    label: method, // You might want to format this (e.g., "Pour-Over" from BrewMethod.POUROVER)
                     // For now, using the enum value directly if it's already descriptive.
  }));

  const handleBrewMethodChange = (newMethod: BrewMethod) => {
    setBrewMethod(newMethod);
    // Adjust cups if current selection exceeds max for new method
    if (cups > (MAX_CUPS[newMethod] || 1)) {
      setCups(MAX_CUPS[newMethod] || 1);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Brewing Parameters</h2>
      
      <TabButtonGroupControl<BrewMethod>
        id="brewMethod"
        label="Brewing Method"
        options={brewMethodOptions}
        selectedValue={brewMethod}
        onChange={handleBrewMethodChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mt-4">
        <SelectControl<RoastType>
          id="roastType"
          label="Coffee Roast Type"
          value={roastType}
          options={Object.values(RoastType)}
          onChange={setRoastType}
        />

        <SelectControl<GrindSize>
          id="grindSize"
          label="Grind Size"
          value={grindSize}
          options={Object.values(GrindSize)}
          onChange={setGrindSize}
          helpText={currentGrindVisual ? `${currentGrindVisual.description} (e.g., ${currentGrindVisual.example})` : undefined}
        />
        
        <NumberInputControl
          id="waterAmount"
          label="Water in Kettle"
          value={waterAmount}
          onChange={setWaterAmount}
          min={MIN_WATER_IN_KETTLE_ML}
          max={MAX_WATER_IN_KETTLE_ML}
          step={50} 
          unit="mL"
          helpText={`Affects water cooling time. Current: ${waterAmount}mL. Min: ${MIN_WATER_IN_KETTLE_ML}, Max: ${MAX_WATER_IN_KETTLE_ML}.`}
          useSlider={true}
        />
        
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
  );
}
