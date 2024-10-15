// src/app/api/refine-recipe/route.ts

import { NextResponse } from 'next/server';
import { RefineRecipeResponse } from '../../../types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt } from '@/utils/cryptoUtils'; // Impor
import OpenAI from 'openai';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const email = session.user.email;

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { openaiApiKey: true }
    });

    console.log("User:", user);
  
    const encryptedApiKey = user?.openaiApiKey || null;

    if (!encryptedApiKey) {
      return new NextResponse('OpenAI API key not found', { status: 400 });
    }

    // Decrypt the API key
    const decryptedApiKey = decrypt(encryptedApiKey);

    if (!decryptedApiKey) {
      return new NextResponse('Failed to decrypt API key', { status: 500 });
    }

    const openai = new OpenAI({ apiKey: decryptedApiKey });

    // Parse the request body to extract recipe, model, and readyTime
    const { recipe, model, readyTime } = await req.json();

    // Construct the prompt
    let prompt = `Refine the following recipe into a structured JSON format with the following fields: name, ingredients, equipment, steps, and total_time_minutes.\n\nRecipe:\n${recipe}\n\n`;

    if (readyTime) {
      prompt += `Ensure that the total_time_minutes does not exceed ${parseInt(readyTime, 10)} minutes.\n`;
    }

    prompt += `Provide the response in JSON format only.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0].message?.content;

    if (!assistantMessage) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    // Validate JSON
    let jsonOutput: string;
    try {
      const parsed = JSON.parse(assistantMessage);
      jsonOutput = JSON.stringify(parsed, null, 2);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON response from OpenAI',err }, { status: 500 });
    }

    // Generate text output (simple representation)
    const textOutput = assistantMessage;

    const refineResponse: RefineRecipeResponse = {
      jsonOutput,
      textOutput,
    };

    return NextResponse.json(refineResponse, { status: 200 });
  } catch (error) {
    console.error('Error in refine-recipe API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
