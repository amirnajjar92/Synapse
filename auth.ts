import NextAuth, { type AuthOptions } from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/db'

// Accept both naming styles: local .env uses AUTH_*, Vercel production uses GOOGLE_* / NEXTAUTH_SECRET.
const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET

if (!googleClientId || !googleClientSecret) {
  console.error('Google sign-in is not configured: set AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET).')
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: googleClientId as string,
      clientSecret: googleClientSecret as string,
      // Users who previously signed in through the old token flow already have a
      // User row without a linked Google account; let Google link to it by email.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/planner',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
