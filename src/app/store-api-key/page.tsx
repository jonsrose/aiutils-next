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
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Store API Key</h2>
      <StoreApiKeyForm />
      <p className="text-sm text-muted-foreground mb-4">
        Note: Your API key will be encrypted before storage for security.
      </p>
    </div>
  );
}
