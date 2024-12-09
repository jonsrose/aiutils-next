import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from '@/db';
import { userRecipes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { RecipeDetail } from './RecipeDetail';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function RecipePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const recipe = await db.query.userRecipes.findFirst({
    where: eq(userRecipes.id, parseInt(params.id)),
  });

  if (!recipe) {
    notFound();
  }

  // Spread the content with the base recipe
  const fullRecipe = {
    ...recipe,
    ...recipe.content as any,
  };

  return <RecipeDetail recipe={fullRecipe} />;
}
