import { Recipe } from '../types';

export function generateMarkdown(
  recipe: Recipe, 
  isChecklist: boolean, 
  checkedItems: { [key: string]: boolean }
): string {
  let markdown = `# ${recipe.name}\n\n`;
  markdown += `**Total Time:** ${recipe.total_time_minutes} minutes\n\n`;

  markdown += `## Ingredients\n\n`;
  recipe.ingredients.forEach((ing, index) => {
    const isChecked = checkedItems[`ingredient-${index}`];
    markdown += isChecklist
      ? `- [${isChecked ? 'x' : ' '}] ${ing.quantity} ${ing.name}\n`
      : `- ${ing.quantity} ${ing.name}\n`;
  });

  markdown += `\n## Equipment\n\n`;
  recipe.equipment.forEach((item, index) => {
    const isChecked = checkedItems[`equipment-${index}`];
    markdown += isChecklist 
      ? `- [${isChecked ? 'x' : ' '}] ${item}\n` 
      : `- ${item}\n`;
  });

  markdown += `\n## Steps\n\n`;
  recipe.steps.forEach((step, index) => {
    const isChecked = checkedItems[`step-${index}`];
    const stepPrefix = isChecklist ? `- [${isChecked ? 'x' : ' '}] ` : `${index + 1}. `;
    markdown += `${stepPrefix}${step.description}${step.duration_minutes ? ` (${step.duration_minutes} minutes)` : ''}\n`;

    if (step.substeps && step.substeps.length > 0) {
      step.substeps.forEach((substep, subIndex) => {
        const isSubstepChecked = checkedItems[`substep-${index}-${subIndex}`];
        markdown += isChecklist
          ? `  - [${isSubstepChecked ? 'x' : ' '}] ${substep.description}${substep.duration_minutes ? ` (${substep.duration_minutes} minutes)` : ''}\n`
          : `  - ${substep.description}${substep.duration_minutes ? ` (${substep.duration_minutes} minutes)` : ''}\n`;

        if (substep.ingredients && substep.ingredients.length > 0) {
          substep.ingredients.forEach((ing, ingIndex) => {
            const isIngChecked = checkedItems[`substep-ingredient-${index}-${subIndex}-${ingIndex}`];
            markdown += isChecklist
              ? `    - [${isIngChecked ? 'x' : ' '}] ${ing.quantity} ${ing.name}\n`
              : `    - ${ing.quantity} ${ing.name}\n`;
          });
        }
      });
    }
  });

  return markdown;
}
