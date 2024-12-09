'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Recipe {
  id: number;
  name: string;
}

export function RecipeList({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes] = useState<Recipe[]>(initialRecipes);

  return (
    <div>
      {recipes.length === 0 ? (
        <p>No recipes found. Start by refining a recipe!</p>
      ) : (
        <ul className="space-y-2 min-h-fit">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="block">
              <Link 
                href={`/recipe-helper/recipe/${recipe.id}`} 
                className="text-blue-500 hover:underline block py-2"
              >
                {recipe.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 