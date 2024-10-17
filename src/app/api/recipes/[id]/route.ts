import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { Recipe } from '@/types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const userRecipe = await prisma.userRecipe.findUnique({
      where: {
        id: id
      }
    });
    
    if (!userRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    const recipe: Recipe = JSON.parse(userRecipe.recipeJson as string);
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}
