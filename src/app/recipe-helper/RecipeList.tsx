'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

interface Recipe {
  id: number;
  name: string;
}

async function fetchRecipes(): Promise<Recipe[]> {
  const response = await fetch('/api/recipes');
  if (!response.ok) {
    throw new Error('Failed to fetch recipes');
  }
  return response.json();
}

export function RecipeList() {
  const { data: recipes, isLoading, error } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  if (isLoading) {
    return <div>Loading recipes...</div>;
  }

  if (error) {
    return <div>Error loading recipes: {error.message}</div>;
  }

  return (
    <div>
      {!recipes || recipes.length === 0 ? (
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