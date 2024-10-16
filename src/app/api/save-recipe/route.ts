import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma"; // Ensure this path is correct

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { recipe } = await req.json();

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe data is required', success: false }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found', success: false }, { status: 404 });
    }

    const savedRecipe = await prisma.userRecipe.create({
      data: {
        userId: user.id,
        name: recipe.name || 'Untitled Recipe',
        recipeJson: JSON.stringify(recipe),
      },
    });

    return NextResponse.json({ recipe: savedRecipe, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in save-recipe API:', error);
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
  }
}
