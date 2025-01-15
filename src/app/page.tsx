import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaUtensils } from "react-icons/fa";
import { SpeakerLoudIcon } from "@radix-ui/react-icons";
import { KeyRound, HelpCircle } from "lucide-react";

const features = [
  {
    href: "/recipe-helper",
    label: "Recipe Helper",
    description: "Import and clean up recipes from the web",
    icon: FaUtensils,
  },
  {
    href: "/speech-to-text",
    label: "Speech to Text",
    description: "Convert spoken words into written text",
    icon: SpeakerLoudIcon,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Configure your API keys and preferences",
    icon: KeyRound,
  },
  {
    href: "/help",
    label: "Help & Getting Started",
    description: "Learn how to use AI Utils and get started",
    icon: HelpCircle,
  },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <div className="container mx-auto p-4 sm:p-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">
              Welcome, {session.user?.name ?? "User"}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Select a feature to get started with AI Utils
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative overflow-hidden rounded-xl border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <feature.icon className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.label}
                  </h2>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Welcome to AI Utils
          </h1>
          <p className="text-xl text-muted-foreground">
            Your AI-powered recipe assistant and more.
          </p>
        </div>
        <div className="flex items-center justify-center gap-x-6">
          <Link
            href="/signin"
            className="rounded-lg bg-primary px-4 py-2.5 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300"
          >
            Sign in
          </Link>
          <Link
            href="/help"
            className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
