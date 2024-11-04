import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userRecipes } from '@/db/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    const [newRecipe] = await db.insert(userRecipes)
      .values({
        userId: session.user.id,
        title,
        content,
      })
      .returning();

    return NextResponse.json(newRecipe);
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    );
  }
}
