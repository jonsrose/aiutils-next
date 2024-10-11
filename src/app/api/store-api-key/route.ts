import { NextResponse } from 'next/server';
import { encrypt } from '@/utils/cryptoUtils';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  console.log("Attempting to get server session...");
  const session = await getServerSession(authOptions);
  console.log("Session result:", JSON.stringify(session, null, 2));

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { apiKey } = await request.json();

  // Encrypt the API key
  const encryptedApiKey = encrypt(apiKey);

  // Store the encrypted OpenAI API key in the database
  if (session?.user?.email) {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { openaiApiKey: encryptedApiKey },
    });
  } else {
    throw new Error("User email is missing");
  }

  return NextResponse.json({ message: 'OpenAI API key stored successfully' }, { status: 200 });
}