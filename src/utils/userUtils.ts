import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { type DrizzleDB } from '@/db/index';
import { connection } from '@/db/index';

const db = drizzle<typeof schema>(connection) as DrizzleDB;
const { users } = schema;

export async function getUserOpenAIApiKey(email: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { openaiApiKey: true }
  });

  return user?.openaiApiKey || null;
}