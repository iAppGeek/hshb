import NextAuth from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'

import { getStaffByEmail } from '@/db'
import { StaffRole } from '@/types/next-auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    }),
  ],
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
