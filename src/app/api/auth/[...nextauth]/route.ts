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
import { accounts, sessions, verificationTokens, users } from "@/db/schema"
import { eq } from 'drizzle-orm'
import { DefaultPostgresUsersTable, DefaultPostgresAccountsTable, DefaultPostgresSessionsTable, DefaultPostgresVerificationTokenTable } from '@auth/drizzle-adapter'

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string
    }
  }
}

interface DbUser {
  id: string;
  accounts: Array<{ provider: string }>;
}

// async function linkAccount(user: User, account: Account) {
//     console.log("Yo im in linkAccount", { user, account });  

//   if (!user.email) {
//     console.error('User email is required')
//     return false
//   }

//   try {
//     const existingUser = await db.query.users.findFirst({
//       where: () => eq(users.email, user.email as string)
//       // with: {
//       //   accounts: {
//       //     columns: {
//       //       provider: true
//       //     }
//       //   }
//       // }
//     }) as DbUser | null

//     if (existingUser) {
//       const hasProvider = existingUser.accounts.some(acc => acc.provider === account.provider)
//       if (!hasProvider) {
//         await db.insert(accounts).values({
//           id: crypto.randomUUID(),
//           userId: existingUser.id,
//           type: account.type,
//           provider: account.provider,
//           providerAccountId: account.providerAccountId,
//           refreshToken: account.refresh_token,
//           accessToken: account.access_token,
//           expiresAt: account.expires_at,
//           tokenType: account.token_type,
//           scope: account.scope,
//           idToken: account.id_token,
//           sessionState: account.session_state,
//         })
//       }
//       return true
//     }

//     const userId = crypto.randomUUID()
//     await db.insert(users).values({
//       id: userId,
//       name: user.name,
//       email: user.email,
//       image: user.image,
//     })

//     await db.insert(accounts).values({
//       id: crypto.randomUUID(),
//       userId: userId,
//       type: account.type,
//       provider: account.provider,
//       providerAccountId: account.providerAccountId,
//       refreshToken: account.refresh_token,
//       accessToken: account.access_token,
//       expiresAt: account.expires_at,
//       tokenType: account.token_type,
//       scope: account.scope,
//       idToken: account.id_token,
//       sessionState: account.session_state,
//     })

//     return true
//   } catch (error) {
//     console.error('Error in linkAccount:', error)
//     return false
//   }
// }

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not defined')
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users as DefaultPostgresUsersTable,
    accountsTable: accounts as DefaultPostgresAccountsTable,
    sessionsTable: sessions as DefaultPostgresSessionsTable,
    verificationTokensTable: verificationTokens as DefaultPostgresVerificationTokenTable,
  }),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
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
    async signIn({ user }) {
      try {
        if (!user.email) {
          console.error('User email is required')
          return false
        }

        // if (account) {
        //   return await linkAccount(user, account)
        // }
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
