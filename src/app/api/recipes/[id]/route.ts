import { NextResponse } from 'next/server';
import { Recipe } from '@/types';
import { userRecipes, db } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const userRecipe = await db.query.userRecipes.findFirst({
      where: eq(userRecipes.id, parseInt(id))
    });
    
    if (!userRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    const recipe: Recipe = userRecipe.content as Recipe;
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}
