import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { DefaultSession } from "next-auth";
import { Resend } from "resend";
import type { NextAuthOptions } from "next-auth";
import { db } from "@/db";

const baseUrl = process.env.NEXTAUTH_URL;

console.log("baseUrl", baseUrl);

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
    };
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not defined");
}

console.log("github id", process.env.GITHUB_ID);

const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;

if (!githubId || !githubSecret) {
  throw new Error("Missing GitHub OAuth credentials");
}

console.log("All env vars:", {
  GITHUB_ID: process.env.GITHUB_ID,
  GOOGLE_ID: process.env.GOOGLE_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  POSTGRES_URL: process.env.POSTGRES_URL,
  pwd: process.cwd(), // This will show us where Next.js is running from
});

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GithubProvider({
      clientId: githubId,
      clientSecret: githubSecret,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          params: {
            scope: "read:user user:email",
            redirect_uri: `${baseUrl}/api/auth/callback/github`,
          },
        },
      },
      token: {
        url: "https://github.com/login/oauth/access_token",
        async request({ client, params, checks }) {
          console.log("Token Request Params:", params);
          const response = await client.oauthCallback(
            `${baseUrl}/api/auth/callback/github`,
            params,
            checks
          );
          if ("error" in response) {
            console.error("OAuth error:", response);
            throw new Error(
              String(response.error_description) ||
                "OAuth token exchange failed"
            );
          }
          console.log("Token Response:", response);
          return { tokens: response };
        },
      },
      userinfo: "https://api.github.com/user",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const { host } = new URL(url);
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
            to: email,
            subject: `Sign in to ${host}`,
            html: `<p>Click <a href="${url}">here</a> to sign in.</p>`,
          });
        } catch (error) {
          console.error("Error sending verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin", // Redirect to signin page on error
    newUser: "/",
    verifyRequest: "/verify-request",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, metadata) => {
      console.error("Auth error:", { code, metadata });
    },
    warn: (code) => {
      console.warn("Auth warning:", code);
    },
    debug: (code, metadata) => {
      console.debug("Auth debug:", { code, metadata });
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
