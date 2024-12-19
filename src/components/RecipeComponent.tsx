import React from "react";
import { Recipe } from "../types";
import { cn } from "@/lib/utils";

interface RecipeComponentProps {
  recipe: Recipe;
  effectiveStartTime?: Date | null;
  isChecklist?: boolean;
  checkedItems?: { [key: string]: boolean };
  setCheckedItems?: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
}

const RecipeComponent: React.FC<RecipeComponentProps> = ({
  recipe,
  effectiveStartTime,
  isChecklist,
  checkedItems,
  setCheckedItems,
}) => {
  // Helper to get parent ID from a child ID
  const getParentId = (id: string): string | null => {
    // For ingredients of substeps: step-0-substep-1-ingredient-2 -> step-0-substep-1
    if (id.includes("-ingredient-")) {
      return id.split("-ingredient-")[0];
    }
    // For substeps: step-0-substep-1 -> step-0
    if (id.includes("-substep-")) {
      return id.split("-substep-")[0];
    }
    return null;
  };

  // Helper to get sibling IDs (including the current ID)
  const getSiblingIds = (id: string): string[] => {
    const parentId = getParentId(id);
    if (!parentId) return [];

    if (id.includes("-ingredient-")) {
      // Get step and substep index from the ID
      const [stepStr, substepStr] = id.split("-substep-");
      const stepIndex = parseInt(stepStr.split("-")[1]);
      const substepIndex = parseInt(substepStr.split("-ingredient-")[0]);
      const substep = recipe.steps[stepIndex]?.substeps?.[substepIndex];

      return (
        substep?.ingredients?.map((_, i) => `${parentId}-ingredient-${i}`) || []
      );
    }

    if (id.includes("-substep-")) {
      // Get step index from the ID
      const stepIndex = parseInt(parentId.split("-")[1]);
      const step = recipe.steps[stepIndex];

      return step?.substeps?.map((_, i) => `${parentId}-substep-${i}`) || [];
    }

    return [];
  };

  const toggleCheck = (id: string, childIds: string[] = []) => {
    if (!setCheckedItems || !checkedItems) return;

    const newState = !checkedItems[id];
    const updates: { [key: string]: boolean } = { [id]: newState };

    // Update child items
    childIds.forEach((childId) => {
      updates[childId] = newState;
    });

    // Update parent items
    let currentId = id;
    while (true) {
      const parentId = getParentId(currentId);
      if (!parentId) break;

      const siblingIds = getSiblingIds(currentId);
      const allSiblingsChecked = siblingIds.every(
        (siblingId) =>
          updates[siblingId] !== undefined
            ? updates[siblingId]
            : checkedItems[siblingId]
      );

      updates[parentId] = allSiblingsChecked;
      currentId = parentId;
    }

    setCheckedItems((prev) => ({ ...prev, ...updates }));
  };

  const ChecklistItem: React.FC<{
    id: string;
    children: React.ReactNode;
    childIds?: string[];
  }> = ({ id, children, childIds = [] }) => (
    <div
      className={cn(
        "flex items-start cursor-pointer rounded p-1",
        isChecklist && checkedItems?.[id] && "bg-accent"
      )}
      onClick={(e) => {
        e.preventDefault();
        toggleCheck(id, childIds);
      }}
    >
      {isChecklist && (
        <div className="flex-shrink-0 w-8">
          <input
            type="checkbox"
            className="mt-1"
            checked={checkedItems?.[id] ?? false}
            onChange={() => toggleCheck(id, childIds)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div
        className={cn(
          "flex-1",
          isChecklist && checkedItems?.[id] && "line-through italic text-muted-foreground"
        )}
      >
        {children}
      </div>
    </div>
  );

  if (!recipe) return null;

  const calculateStepStartTime = (stepIndex: number): Date | null => {
    console.log(
      "calculateStepStartTime effectiveStartTime",
      effectiveStartTime
    );
    if (!effectiveStartTime) return null;

    const minutesToAdd = recipe.steps
      .slice(0, stepIndex)
      .reduce((total, step) => total + (step.duration_minutes || 0), 0);

    const startTime = new Date(effectiveStartTime);
    startTime.setMinutes(startTime.getMinutes() + minutesToAdd);
    return startTime;
  };

  // Add these helper functions alongside the other helpers
  const getStepChildIds = (stepIndex: number): string[] => {
    const childIds: string[] = [];
    const step = recipe.steps[stepIndex];

    if (step.substeps) {
      step.substeps.forEach((_, subIndex) => {
        const substepId = `step-${stepIndex}-substep-${subIndex}`;
        childIds.push(substepId);

        const substep = step.substeps![subIndex];
        if (substep.ingredients) {
          substep.ingredients.forEach((_, ingIndex) => {
            childIds.push(`${substepId}-ingredient-${ingIndex}`);
          });
        }
      });
    }
    return childIds;
  };

  const getSubstepChildIds = (
    stepIndex: number,
    subIndex: number
  ): string[] => {
    const substep = recipe.steps[stepIndex].substeps?.[subIndex];
    return (
      substep?.ingredients?.map(
        (_, ingIndex) =>
          `step-${stepIndex}-substep-${subIndex}-ingredient-${ingIndex}`
      ) || []
    );
  };

  return (
    <div className="max-w-3xl mx-auto bg-card rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">{recipe.name}</h1>

      <div className="flex items-center gap-4 mb-6 p-4 bg-muted rounded-md">
        <div>
          <span className="block text-sm text-muted-foreground">
            Total Time
          </span>
          <span className="text-xl font-semibold">
            {recipe.total_time_minutes} minutes
          </span>
        </div>
        {effectiveStartTime && (
          <div>
            <span className="block text-sm text-muted-foreground">
              Start Time
            </span>
            <span className="text-xl font-semibold">
              {effectiveStartTime.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary">
            1
          </span>
          Ingredients
        </h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li
              key={index}
              className={cn(
                "text-lg",
                isChecklist && checkedItems?.[`ingredient-${index}`]
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              )}
            >
              <ChecklistItem id={`ingredient-${index}`}>
                <span className="font-medium">{ingredient.quantity}</span>{" "}
                {ingredient.name}
              </ChecklistItem>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary">
            2
          </span>
          Equipment
        </h2>
        <ul className={`${isChecklist ? "space-y-2" : "list-disc"}`}>
          {recipe.equipment.map((item, index) => (
            <li
              key={index}
              className={cn(
                "text-lg",
                isChecklist && checkedItems?.[`equipment-${index}`]
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              )}
            >
              <ChecklistItem id={`equipment-${index}`}>{item}</ChecklistItem>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary">
            3
          </span>
          Steps
        </h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, index) => (
            <li key={index} className="mb-6">
              <div
                className={cn(
                  "rounded-lg",
                  isChecklist && checkedItems?.[`step-${index}`]
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                )}
              >
                <ChecklistItem
                  id={`step-${index}`}
                  childIds={getStepChildIds(index)}
                >
                  {effectiveStartTime && (
                    <div className="text-sm font-medium text-primary mb-2">
                      Start at:{" "}
                      {calculateStepStartTime(index)?.toLocaleTimeString()}
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
                  <ul className="space-y-2 mt-2">
                    {step.substeps.map((substep, subIndex) => (
                      <li
                        key={subIndex}
                        className={cn(
                          "bg-background rounded-md mb-2 pl-6",
                          isChecklist &&
                            checkedItems?.[`step-${index}-substep-${subIndex}`]
                              ? "bg-accent"
                              : "hover:bg-accent/50"
                        )}
                      >
                        <ChecklistItem
                          id={`step-${index}-substep-${subIndex}`}
                          childIds={getSubstepChildIds(index, subIndex)}
                        >
                          <div className="text-base">{substep.description}</div>
                          {substep.duration_minutes && (
                            <div className="text-sm text-muted-foreground">
                              Duration: {substep.duration_minutes} minutes
                            </div>
                          )}
                        </ChecklistItem>

                        {substep.ingredients &&
                          substep.ingredients.length > 0 && (
                            <ul className="space-y-2 mt-2">
                              {substep.ingredients.map(
                                (ingredient, ingIndex) => (
                                  <li
                                    key={ingIndex}
                                    className={cn(
                                      "pl-6",
                                      isChecklist &&
                                        checkedItems?.[
                                          `step-${index}-substep-${subIndex}-ingredient-${ingIndex}`
                                        ]
                                          ? "bg-accent"
                                          : "hover:bg-accent/50"
                                    )}
                                  >
                                    <ChecklistItem
                                      id={`step-${index}-substep-${subIndex}-ingredient-${ingIndex}`}
                                    >
                                      {ingredient.quantity} {ingredient.name}
                                    </ChecklistItem>
                                  </li>
                                )
                              )}
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
