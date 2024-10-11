import prisma from "@/lib/prisma";

export async function getUserOpenAIApiKey(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email },
    select: { openaiApiKey: true }
  });

  return user?.openaiApiKey || null;
}