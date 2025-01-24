import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: {
        openaiApiKey: true,
      },
    });

    return new NextResponse(
      JSON.stringify({
        hasKey: !!user?.openaiApiKey,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking API key:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to check API key status" }),
      { status: 500 }
    );
  }
}
