import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OpenAI from 'openai';
import { getUserOpenAIApiKey } from '@/utils/userUtils';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as File;

    if (!audio) {
      return new NextResponse('No audio file provided', { status: 400 });
    }

    const session = await getServerSession();
  
    if (!session || !session.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userApiKey = await getUserOpenAIApiKey(session.user.email);

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