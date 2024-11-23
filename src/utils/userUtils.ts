import { eq } from 'drizzle-orm';
import { db, users } from '@/db/schema';

export async function getUserOpenAIApiKey(email: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { openaiApiKey: true }
  });

  return user?.openaiApiKey || null;
}