import { DefaultSession } from 'next-auth'

export type StaffRole = 'teacher' | 'admin' | 'headteacher'

declare module 'next-auth' {
  interface Session {
    user: {
      role: StaffRole
      staffId: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: StaffRole
    staffId?: string
  }
}
