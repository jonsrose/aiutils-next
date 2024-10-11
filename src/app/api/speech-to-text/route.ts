import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OpenAI from 'openai';
import { getUserOpenAIApiKey } from '@/utils/userUtils';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  console.log("Attempting to get server session...");
  const session = await getServerSession(authOptions);
  console.log("Session result:", JSON.stringify(session, null, 2));

  if (!session || !session.user || !session.user.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const email = session.user.email;

  console.log("Email:", email);

  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as File;

    if (!audio) {
      return new NextResponse('No audio file provided', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { openaiApiKey: true }
    });

    console.log("User:", user);
  
    const userApiKey = user?.openaiApiKey || null;

    if (!userApiKey) {
      return new NextResponse('OpenAI API key not found', { status: 400 });
    }

    const openai = new OpenAI({ apiKey: userApiKey });

    const file = new File([await audio.arrayBuffer()], 'audio.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1'
    });

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error in speech-to-text API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}