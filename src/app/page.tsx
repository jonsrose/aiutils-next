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

function HomePage() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Welcome, {session.user?.name ?? "User"}!</h1>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Welcome to AI Utils
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Your AI-powered recipe assistant and more.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signin"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Sign in
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold leading-6 text-primary"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
