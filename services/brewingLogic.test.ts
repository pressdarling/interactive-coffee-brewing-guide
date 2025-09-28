import { describe, it, expect } from 'vitest';
import { generateFullRecipe } from './brewingLogic';
import { BrewMethod, GrindSize, RoastType } from '../types';

describe('generateFullRecipe for Pour-Over', () => {
  it('should generate correct and sequential step numbers for a standard pour-over recipe', () => {
    const recipe = generateFullRecipe(
      RoastType.MEDIUM,
      GrindSize.MEDIUM,
      1000,
      BrewMethod.POUROVER,
      2
    );

    const steps = recipe.steps;

    // Filter for steps that should have a number in their title
    const numberedSteps = steps.filter(step => /^\d+\./.test(step.title));

    // Expected titles based on the logic (2 main pours)
    const expectedTitles = [
      '1. Prepare',
      '2. Bloom Pour',
      '3. Wait for Bloom',
      '4. Main Pour 1/2',
      // 'Wait Briefly' is not a numbered step
      '5. Main Pour 2/2',
      '6. Final Drawdown',
      'Serve & Enjoy' // Not numbered
    ];

    const actualTitles = steps.map(s => s.title);

    // We can't do a direct equality check because some titles are dynamic.
    // Instead, let's check the numbered steps.
    expect(actualTitles[0]).toBe(expectedTitles[0]); // 1. Prepare
    expect(actualTitles[1]).toBe(expectedTitles[1]); // 2. Bloom Pour
    expect(actualTitles[2]).toMatch(/^3\. Wait for Bloom/); // 3. Wait for Bloom
    expect(actualTitles[3]).toBe(expectedTitles[3]); // 4. Main Pour 1/2

    // Find the next main pour and drawdown
    const mainPour2 = steps.find(s => s.id === 'pourover-mainpour-2');
    const drawdown = steps.find(s => s.id === 'pourover-drawdown');

    expect(mainPour2?.title).toBe(expectedTitles[4]);
    expect(drawdown?.title).toMatch(/^6\. Final Drawdown/);
  });
});