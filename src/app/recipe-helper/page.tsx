"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface RecipeListItem {
  id: string;
  name: string;
}

const RecipeListPage = () => {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('/api/recipes');
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Recipes</h1>
      <div className="mb-4">
        <Link href="/recipe-helper/import" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Import New Recipe
        </Link>
      </div>
      {recipes.length === 0 ? (
        <p>No recipes found. Start by refining a recipe!</p>
      ) : (
        <ul className="space-y-2 min-h-fit">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="block">
              <Link href={`/recipe-helper/recipe/${recipe.id}`} className="text-blue-500 hover:underline block py-2">
                {recipe.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeListPage;
