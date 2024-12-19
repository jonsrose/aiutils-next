import { NextResponse } from 'next/server';
import { Recipe } from '@/types';
import { db } from '@/db';
import { userRecipes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { and } from "drizzle-orm";

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await db
      .delete(userRecipes)
      .where(
        and(
          eq(userRecipes.id, parseInt(params.id)),
          eq(userRecipes.userId, session.user.id)
        )
      );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
