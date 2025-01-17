import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { StoreApiKeyForm } from "./StoreApiKeyForm";

export default async function StoreApiKeyPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="bg-card rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">OpenAI API Key</h2>
        <div className="space-y-6">
          <div className="prose dark:prose-invert">
            <p>
              To use AI features, you need to provide your OpenAI API key. This
              key will be encrypted before storage and can be updated or removed
              at any time.
            </p>
            <p className="text-sm text-muted-foreground">
              You can get an API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                OpenAI&apos;s website
              </a>
              .
            </p>
          </div>
          <StoreApiKeyForm />
        </div>
      </div>
    </div>
  );
}
