import crypto from 'crypto';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { type DrizzleDB } from '@/db/index';
import { connection } from '@/db/index';
const { users } = schema;

const db = drizzle<typeof schema>(connection) as DrizzleDB;

// In a real application, this should be a secure, randomly generated key stored in environment variables
const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'defaultEncryptionKey', 'salt', 32);
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function getDecryptedApiKey(email: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { openaiApiKey: true }
  });

  if (!user?.openaiApiKey) return null;

  return decrypt(user.openaiApiKey);
}
