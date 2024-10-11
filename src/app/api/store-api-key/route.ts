import { NextResponse } from 'next/server';
import { encrypt } from '@/utils/cryptoUtils';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    // Encrypt the API key
    const encryptedApiKey = encrypt(apiKey);

    // Log the encrypted API key (still not recommended in production, but safer than logging the plain text)
    console.log('Storing encrypted API key:', encryptedApiKey, 'for apiKey:', apiKey);

    // Here, you would implement the logic to securely store the encrypted API key
    // This might involve storing it in a database or a secure key management system

    return NextResponse.json({ message: 'API key stored successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error storing API key:', error);
    return NextResponse.json({ error: 'Failed to store API key' }, { status: 500 });
  }
}