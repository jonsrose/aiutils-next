import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RecipeList } from "./RecipeList";
import { db } from "@/db";
import { userRecipes } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function RecipeHelperPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Fetch recipes server-side
  const recipes = await db
    .select({
      id: userRecipes.id,
      name: userRecipes.name,
    })
    .from(userRecipes)
    .where(eq(userRecipes.userId, session.user.id));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Recipes</h1>
      <div className="mb-4">
        <Link
          href="/recipe-helper/import"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Import New Recipe
        </Link>
      </div>
      <RecipeList initialRecipes={recipes} />
    </div>
  );
}
