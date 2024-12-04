"use client";

import { withAuth } from "@/components/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";

const features = [
  {
    href: "/store-api-key",
    label: "Store API Key",
    description: "Securely store your API keys for various services",
  },
  {
    href: "/recipe-helper",
    label: "Recipe Helper",
    description: "Import and clean up recipes from the web",
  },
  {
    href: "/speech-to-text",
    label: "Speech to Text",
    description: "Convert spoken words into written text",
  },
];

function Home() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Welcome, {session?.user?.name ?? "User"}!</h1>
        <p className="text-muted-foreground mb-8">Select a feature to get started with AI Utils</p>
        
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="block p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{feature.label}</h2>
              <p className="text-muted-foreground">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Home);
