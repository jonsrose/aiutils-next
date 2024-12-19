'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

async function deleteRecipe(id: number): Promise<void> {
  const response = await fetch(`/api/recipes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete recipe');
  }
}

export function RecipeList() {
  const queryClient = useQueryClient();
  const { data: recipes, isLoading, error } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const handleDelete = async () => {
    if (!recipeToDelete) return;

    try {
      await deleteRecipe(recipeToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setRecipeToDelete(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  };

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
            <li key={recipe.id} className="flex items-center justify-between group bg-card hover:bg-accent/50 rounded-lg p-2">
              <Link 
                href={`/recipe-helper/recipe/${recipe.id}`} 
                className="flex-1 text-foreground hover:text-primary transition-colors"
              >
                {recipe.name}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  setRecipeToDelete(recipe);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!recipeToDelete} onOpenChange={() => setRecipeToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete &quot;{recipeToDelete?.name}&quot;? This action cannot be undone.
          </p>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setRecipeToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 