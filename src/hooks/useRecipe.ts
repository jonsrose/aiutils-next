import { useQuery } from '@tanstack/react-query';
import { Recipe } from '@/types';

export async function fetchRecipe(id: string): Promise<Recipe> {
  const response = await fetch(`/api/recipes/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch recipe');
  }
  return response.json();
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => fetchRecipe(id),
  });
} 