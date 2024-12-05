import React from 'react';
import { Recipe } from '../types';

interface RecipeComponentProps {
  recipe: Recipe;
  effectiveStartTime?: Date | null;
  isChecklist?: boolean;
  checkedItems?: { [key: string]: boolean };
  setCheckedItems?: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const RecipeComponent: React.FC<RecipeComponentProps> = ({
  recipe,
  effectiveStartTime,
  isChecklist,
  checkedItems,
  setCheckedItems
}) => {
  const toggleCheck = (id: string) => {
    if (setCheckedItems) {
      setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    }
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
          checked={checkedItems?.[id] ?? false}
          onChange={() => toggleCheck(id)}
        />
      )}
      <span className={isChecklist && checkedItems?.[id] ? 'line-through' : ''}>{children}</span>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto bg-card rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">{recipe.name}</h1>
      
      <div className="flex items-center gap-4 mb-6 p-4 bg-muted rounded-md">
        <div>
          <span className="block text-sm text-muted-foreground">Total Time</span>
          <span className="text-xl font-semibold">{recipe.total_time_minutes} minutes</span>
        </div>
        {effectiveStartTime && (
          <div>
            <span className="block text-sm text-muted-foreground">Start Time</span>
            <span className="text-xl font-semibold">{effectiveStartTime.toLocaleTimeString()}</span>
          </div>
        )}
      </div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">1</span>
          Ingredients
        </h2>
        <ul className={`${isChecklist ? 'space-y-2' : 'list-disc'} pl-5`}>
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="text-lg">
              <ChecklistItem id={`ingredient-${index}`}>
                <span className="font-medium">{ingredient.quantity}</span> {ingredient.name}
              </ChecklistItem>
            </li>
          ))}
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">2</span>
          Equipment
        </h2>
        <ul className={`${isChecklist ? 'space-y-2' : 'list-disc'} pl-5`}>
          {recipe.equipment.map((item, index) => (
            <li key={index} className="text-lg">
              <ChecklistItem id={`equipment-${index}`}>{item}</ChecklistItem>
            </li>
          ))}
        </ul>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">3</span>
          Steps
        </h2>
        <ol className={`${isChecklist ? 'space-y-4' : 'list-decimal'} pl-5`}>
          {recipe.steps.map((step, index) => (
            <li key={index} className="mb-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <ChecklistItem id={`step-${index}`}>
                  {effectiveStartTime && (
                    <div className="text-sm font-medium text-primary mb-2">
                      Start at: {calculateStepStartTime(index)?.toLocaleTimeString()}
                    </div>
                  )}
                  <div className="text-lg">{step.description}</div>
                  {step.duration_minutes && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Duration: {step.duration_minutes} minutes
                    </div>
                  )}
                </ChecklistItem>
                
                {step.substeps && step.substeps.length > 0 && (
                  <ul className={`${isChecklist ? 'space-y-2' : 'list-disc'} pl-5 mt-4`}>
                    {step.substeps.map((substep, subIndex) => (
                      <li key={subIndex} className="bg-background rounded-md p-3 mb-2">
                        <ChecklistItem id={`substep-${index}-${subIndex}`}>
                          <div className="text-base">{substep.description}</div>
                          {substep.duration_minutes && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Duration: {substep.duration_minutes} minutes
                            </div>
                          )}
                        </ChecklistItem>
                        {substep.ingredients && substep.ingredients.length > 0 && (
                          <ul className={`${isChecklist ? 'space-y-2' : 'list-disc'} pl-5 mt-1`}>
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
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default RecipeComponent;
