import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SignInClient } from "./SignInClient";

type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
};

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  // Get providers from authOptions directly
  const providers = authOptions.providers.reduce((acc, provider) => {
    acc[provider.id as string] = {
      id: provider.id as string,
      name: (provider.name as string) ?? (provider.id as string),
      type: provider.type as string,
      signinUrl: `/api/auth/signin/${provider.id as string}`,
      callbackUrl: `/api/auth/callback/${provider.id as string}`,
    };
    return acc;
  }, {} as Record<string, Provider>);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sign In</h1>
      <div className="max-w-md space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">
              Welcome to AI Utils
            </h2>
            <p className="mt-2 text-muted-foreground dark:text-gray-300">
              Sign in to continue
            </p>
          </div>
          <SignInClient providers={providers} />
        </div>
      </div>
    </div>
  );
}
