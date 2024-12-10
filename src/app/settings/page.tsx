import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
          <div className="bg-card rounded-lg border p-4">
            <SettingsForm />
            <p className="text-sm text-muted-foreground mt-4">
              Your API key will be encrypted before storage for security.
            </p>
          </div>
        </div>
        {/* Add more settings sections here in the future */}
      </div>
    </div>
  );
} 