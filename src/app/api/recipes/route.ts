import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { userRecipes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const recipes = await db
    .select({
      id: userRecipes.id,
      name: userRecipes.name,
    })
    .from(userRecipes)
    .where(eq(userRecipes.userId, session.user.id));

  return NextResponse.json(recipes);
}
