import { NextResponse } from "next/server";
import { encrypt } from "@/utils/cryptoUtils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401 }
      );
    }

    const { apiKey } = await request.json();

    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: "API key is required" }),
        { status: 400 }
      );
    }

    const encryptedKey = encrypt(apiKey);

    await db
      .update(users)
      .set({
        openaiApiKey: encryptedKey,
      })
      .where(eq(users.email, session.user.email));

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error storing API key:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to store API key" }),
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401 }
      );
    }

    await db
      .update(users)
      .set({
        openaiApiKey: null,
      })
      .where(eq(users.email, session.user.email));

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete API key" }),
      { status: 500 }
    );
  }
}
