import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <div className="p-4 sm:p-8 flex-1 bg-dot-pattern">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Welcome, {session.user?.name ?? "User"}!</h1>
          <p className="text-muted-foreground mb-8">Select a feature to get started with AI Utils</p>
          
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group block p-6 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg"
              >
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{feature.label}</h2>
                <p className="text-muted-foreground">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-dot-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Welcome to AI Utils
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Your AI-powered recipe assistant and more.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signin"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:shadow-lg transition-all duration-300"
            >
              Sign in
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold leading-6 text-primary hover:text-primary/80 transition-colors"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
