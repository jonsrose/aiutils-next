import React, { useState } from 'react';
import { Recipe } from '../types';

interface RecipeProps {
  recipe: Recipe;
  effectiveStartTime: Date | null;
  isChecklist: boolean;
}

const RecipeComponent: React.FC<RecipeProps> = ({ recipe, effectiveStartTime, isChecklist }) => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!recipe) return null;

  const calculateStepStartTime = (stepIndex: number): Date | null => {
    console.log("calculateStepStartTime effectiveStartTime", effectiveStartTime);
    if (!effectiveStartTime) return null;
    
    const minutesToAdd = recipe.steps
      .slice(0, stepIndex)
      .reduce((total, step) => total + (step.duration_minutes || 0), 0);
    
    const startTime = new Date(effectiveStartTime);
    startTime.setMinutes(startTime.getMinutes() + minutesToAdd);
    return startTime;
  };

  const ChecklistItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
    <div className="flex items-start">
      {isChecklist && (
        <input
          type="checkbox"
          className="mt-1 mr-2"
          checked={checkedItems[id] || false}
          onChange={() => toggleCheck(id)}
        />
      )}
      <span className={checkedItems[id] ? 'line-through' : ''}>{children}</span>
    </div>
  );

  return (
    <div>
      
      <h1 className="text-2xl font-bold mb-4">Recipe: {recipe.name}</h1>
      <p className="mb-4"><strong>Total Time:</strong> {recipe.total_time_minutes} minutes</p>
      
      <h2 className="text-xl font-semibold mb-2">Ingredients:</h2>
      <ul className={`${isChecklist ? '' : 'list-disc'} pl-5 mb-4`}>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>
            <ChecklistItem id={`ingredient-${index}`}>
              {ingredient.quantity} {ingredient.name}
            </ChecklistItem>
          </li>
        ))}
      </ul>
      
      <h2 className="text-xl font-semibold mb-2">Equipment:</h2>
      <ul className={`${isChecklist ? '' : 'list-disc'} pl-5 mb-4`}>
        {recipe.equipment.map((item, index) => (
          <li key={index}>
            <ChecklistItem id={`equipment-${index}`}>{item}</ChecklistItem>
          </li>
        ))}
      </ul>
      
      <h2 className="text-xl font-semibold mb-2">Steps:</h2>
      <ol className={`${isChecklist ? '' : 'list-decimal'} pl-5`}>
        {recipe.steps.map((step, index) => (
          <li key={index} className="mb-2">
            <ChecklistItem id={`step-${index}`}>
              {effectiveStartTime && (
                <span className="font-semibold">
                  Start at: {calculateStepStartTime(index)?.toLocaleTimeString()}
                </span>
              )}
              {' '}{step.description}
              {step.duration_minutes && (` (${step.duration_minutes} minutes)`)}
            </ChecklistItem>
            
            {step.substeps && step.substeps.length > 0 && (
              <ul className={`${isChecklist ? '' : 'list-disc'} pl-5 mt-1`}>
                {step.substeps.map((substep, subIndex) => (
                  <li key={subIndex}>
                    <ChecklistItem id={`substep-${index}-${subIndex}`}>
                      {substep.description}
                      {substep.duration_minutes && (` (${substep.duration_minutes} minutes)`)}
                    </ChecklistItem>
                    {substep.ingredients && substep.ingredients.length > 0 && (
                      <ul className={`${isChecklist ? '' : 'list-disc'} pl-5 mt-1`}>
                        {substep.ingredients.map((ingredient, ingIndex) => (
                          <li key={ingIndex}>
                            <ChecklistItem id={`substep-ingredient-${index}-${subIndex}-${ingIndex}`}>
                              {ingredient.quantity} {ingredient.name}
                            </ChecklistItem>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RecipeComponent;
