import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { decrypt } from '@/utils/cryptoUtils'; // Import your decryption function
import { File } from 'buffer';

export async function POST(request: Request) {
  console.log("Attempting to get server session...");
  const session = await getServerSession(authOptions);
  console.log("Session result:", JSON.stringify(session, null, 2));

  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const email = session.user.email;

  console.log("Email:", email);

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!(audioFile instanceof File)) {
      // Handle the case where audioFile is not a File
      throw new Error('No audio file provided');
    }

    const audio = audioFile;

    if (!audio) {
      return new NextResponse('No audio file provided', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { openaiApiKey: true }
    });
  
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

    // Convert the audio to a Buffer
    const buffer = Buffer.from(await audio.arrayBuffer());

    // Use the actual type of the uploaded file
    const file = new File([buffer], audio.name, { type: audio.type });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'json'
    });

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error in speech-to-text API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}