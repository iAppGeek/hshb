import NextAuth from 'next-auth'
import type { Provider } from '@auth/core/providers'
import Credentials from 'next-auth/providers/credentials'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'

import { getStaffByEmail } from '@/db'
import { StaffRole } from '@/types/next-auth'

const providers: Provider[] = [
  MicrosoftEntraID({
    clientId: process.env.AZURE_AD_CLIENT_ID!,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
  }),
]

if (process.env.E2E_TEST === 'true' && process.env.NODE_ENV !== 'production') {
  providers.push(
    Credentials({
      id: 'test-credentials',
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (credentials?.password !== process.env.E2E_TEST_SECRET) return null
        const staff = await getStaffByEmail(credentials.email as string)
        if (!staff) return null
        return {
          id: staff.id,
          email: staff.email,
          name: `${staff.first_name} ${staff.last_name}`,
        }
      },
    }),
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const staff = await getStaffByEmail(user.email) // TODO fix types here
      return !!staff
    },
    async jwt({ token, user }) {
      // user is only present on first sign-in
      if (user?.email) {
        const staff = await getStaffByEmail(user.email)
        if (staff) {
          token.role = staff.role
          token.staffId = staff.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as StaffRole // TODO fix the types here
        session.user.staffId = token.staffId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/portal/login',
    error: '/portal/login',
  },
})
