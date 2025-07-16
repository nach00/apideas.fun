import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      role: string
      coinBalance: number
    }
  }

  interface User {
    id: string
    email: string
    username: string
    role: string
    coinBalance: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    coinBalance?: number
    username?: string
  }
}