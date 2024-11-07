import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userRecipes } from '@/db/schema';
import { eq } from 'drizzle-orm';
export async function GET() {
  try {
    const recipes = await db.query.userRecipes.findMany();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
