import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import type { User, Session, Account } from "next-auth"
import type { DefaultSession } from "next-auth"
import { Resend } from 'resend'
import type { NextAuthOptions } from "next-auth"
import { accounts, users } from "@/db/schema"
import { eq } from 'drizzle-orm'

const baseUrl = process.env.NEXTAUTH_URL;

console.log("baseUrl", baseUrl)

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string
    }
  }
}

async function linkAccount(user: User, account: Account) {
    console.log("Yo im in linkAccount", { user, account });  

  if (!user.email) {
    console.error('User email is required')
    return false
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: () => eq(users.email, user.email as string),
    })

    if (existingUser) {
      const existingAccount = await db.query.accounts.findFirst({
        where: (accounts) => 
          eq(accounts.userId, existingUser.id) && 
          eq(accounts.provider, account.provider)
      })

      if (!existingAccount) {
        await db.insert(accounts).values({
          userId: existingUser.id,
          type: "oauth",
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        })
      }
      return true
    }

    const userId = crypto.randomUUID()
    await db.insert(users).values({
      id: userId,
      name: user.name,
      email: user.email,
      image: user.image,
    })

    await db.insert(accounts).values({
      userId: userId,
      type: "oauth",
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refresh_token: account.refresh_token,
      access_token: account.access_token,
      expires_at: account.expires_at,
      token_type: account.token_type,
      scope: account.scope,
      id_token: account.id_token,
      session_state: account.session_state,
    })

    return true
  } catch (error) {
    console.error('Error in linkAccount:', error)
    return false
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not defined')
}

console.log("github id", process.env.GITHUB_ID)

const githubId = process.env.GITHUB_ID
const githubSecret = process.env.GITHUB_SECRET

if (!githubId || !githubSecret) {
  throw new Error('Missing GitHub OAuth credentials')
}

console.log("All env vars:", {
  GITHUB_ID: process.env.GITHUB_ID,
  GOOGLE_ID: process.env.GOOGLE_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  pwd: process.cwd(), // This will show us where Next.js is running from
});

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GithubProvider({
      clientId: githubId,
      clientSecret: githubSecret,
      authorization: {
        params: {
          params: { 
            scope: "read:user user:email",
            redirect_uri: `${baseUrl}/api/auth/callback/github`
          }
        }
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
          if ('error' in response) {
            console.error('OAuth error:', response);
            throw new Error(String(response.error_description) || 'OAuth token exchange failed');
          }
          console.log("Token Response:", response);
          return { tokens: response };
        }
      },
      userinfo: "https://api.github.com/user",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
    }),
    EmailProvider({
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const { host } = new URL(url)
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
            to: email,
            subject: `Sign in to ${host}`,
            html: `<p>Click <a href="${url}">here</a> to sign in.</p>`
          })
        } catch (error) {
          console.error('Error sending verification email:', error)
          throw new Error('Failed to send verification email')
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) {
          console.error('User email is required')
          return false
        }

        if (account) {
          return await linkAccount(user, account)
        }
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    async session({ session, user }: { session: Session; user: User }) {
      try {
        if (session.user) {
          session.user.id = user.id
        }
        return session
      } catch (error) {
        console.error('Error in session callback:', error)
        return session
      }
    },
    async jwt({ token, account }) {
      try {
        if (account) {
          token.accessToken = account.access_token
          token.provider = account.provider
        }
        return token
      } catch (error) {
        console.error('Error in jwt callback:', error)
        return token
      }
    }
  },
  pages: {
    signIn: '/signin',
    error: '/signin', // Redirect to signin page on error
    newUser: '/'
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error('Auth error:', { code, metadata })
    },
    warn: (code) => {
      console.warn('Auth warning:', code)
    },
    debug: (code, metadata) => {
      console.debug('Auth debug:', { code, metadata })
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
