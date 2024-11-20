import { users, db } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserOpenAIApiKey(email: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { openaiApiKey: true }
  });

  return user?.openaiApiKey || null;
}