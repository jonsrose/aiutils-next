import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { RecipeDetail } from './RecipeDetail';
import { fetchRecipe } from '@/hooks/useRecipe';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function RecipePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const queryClient = new QueryClient();
  
  try {
    // Prefetch the recipe data
    await queryClient.prefetchQuery({
      queryKey: ['recipe', params.id],
      queryFn: () => fetchRecipe(params.id),
    });
  } catch (error) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RecipeDetail id={params.id} />
    </HydrationBoundary>
  );
}
