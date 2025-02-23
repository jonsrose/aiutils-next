import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OpenAI from "openai";
import { getDecryptedApiKey } from "@/utils/cryptoUtils";
import { File } from "buffer";

export async function POST(request: Request) {
  console.log("Attempting to get server session...");
  const session = await getServerSession(authOptions);
  console.log("Session result:", JSON.stringify(session, null, 2));

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!(audioFile instanceof File)) {
      // Handle the case where audioFile is not a File
      throw new Error("No audio file provided");
    }

    const audio = audioFile;

    if (!audio) {
      return new NextResponse("No audio file provided", { status: 400 });
    }

    const email = session.user.email;
    const decryptedApiKey = await getDecryptedApiKey(email);

    if (!decryptedApiKey) {
      return new NextResponse("OpenAI API key not found or failed to decrypt", {
        status: 400,
      });
    }

    const openai = new OpenAI({ apiKey: decryptedApiKey });

    // Convert the audio to a Buffer
    const buffer = Buffer.from(await audio.arrayBuffer());

    // Use the actual type of the uploaded file
    const file = new File([buffer], audio.name, { type: audio.type });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "json",
    });

    // Calculate cost (Whisper API charges $0.006 per minute)
    // Get duration in minutes from the audio file
    const durationInMinutes = audio.size / (16000 * 2 * 60); // Approximate duration based on file size
    const costInCents = durationInMinutes * 0.6; // $0.006 per minute = 0.6 cents per minute

    return NextResponse.json({
      transcription: transcription.text,
      usage: {
        durationInMinutes: Number(durationInMinutes.toFixed(2)),
        costInCents: Number(costInCents.toFixed(4)),
      },
    });
  } catch (error) {
    console.error("Error in speech-to-text API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
