import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SignInClient } from "./SignInClient";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/");
  }

  // Get providers from authOptions directly
  const providers = authOptions.providers.reduce((acc, provider) => {
    acc[provider.id] = {
      id: provider.id,
      name: provider.name ?? provider.id,
      type: provider.type,
      signinUrl: `/api/auth/signin/${provider.id}`,
      callbackUrl: `/api/auth/callback/${provider.id}`
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-card rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome to AI Utils</h2>
          <p className="mt-2 text-muted-foreground">Sign in to continue</p>
        </div>
        <SignInClient providers={providers} />
      </div>
    </div>
  );
}
