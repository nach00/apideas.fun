import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import prisma from './database'
import { validateEnvVar } from './validation'

// Validate required environment variables on import
validateEnvVar('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET)
console.log('NextAuth config loaded:', {
  secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
  url: process.env.NEXTAUTH_URL
})

// Optional OAuth environment variables
const oauthEnvVars = {
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  GOOGLE_ID: process.env.GOOGLE_ID,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Authorize called with:', { email: credentials?.email, hasPassword: !!credentials?.password })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        console.log('User found:', { found: !!user, hasPassword: !!user?.hashedPassword })

        if (!user || !user.hashedPassword) {
          console.log('User not found or no password')
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
        
        console.log('Password check:', { isValid })
        
        if (!isValid) {
          console.log('Invalid password')
          return null
        }

        console.log('Credentials authorize success:', { userId: user.id, email: user.email })
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          coinBalance: user.coinBalance,
        }
      }
    }),
    // Only include OAuth providers if credentials are available
    ...(oauthEnvVars.GITHUB_ID && oauthEnvVars.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: oauthEnvVars.GITHUB_ID,
        clientSecret: oauthEnvVars.GITHUB_SECRET,
      })
    ] : []),
    ...(oauthEnvVars.GOOGLE_ID && oauthEnvVars.GOOGLE_SECRET ? [
      GoogleProvider({
        clientId: oauthEnvVars.GOOGLE_ID,
        clientSecret: oauthEnvVars.GOOGLE_SECRET,
      })
    ] : [])
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('JWT callback called:', { hasUser: !!user, hasToken: !!token, hasAccount: !!account })
      
      if (user) {
        console.log('JWT callback - setting user in token:', { userId: user.id, email: user.email })
        token.sub = user.id  // Set the user ID as the subject
        token.role = user.role
        token.coinBalance = user.coinBalance
        token.username = user.username
        console.log('JWT callback - token after setting:', { tokenSub: token.sub, role: token.role })
      }

      // Handle OAuth users
      if (account?.provider && account.provider !== 'credentials') {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: token.email || '' },
              { 
                oauthProvider: account.provider,
                oauthUid: account.providerAccountId 
              }
            ]
          }
        })

        if (existingUser) {
          token.id = existingUser.id
          token.role = existingUser.role
          token.coinBalance = existingUser.coinBalance
          token.username = existingUser.username
        } else {
          // Create new OAuth user
          const newUser = await prisma.user.create({
            data: {
              email: token.email || '',
              username: token.name?.replace(/\s+/g, '').toLowerCase() || `user_${Date.now()}`,
              oauthProvider: account.provider,
              oauthUid: account.providerAccountId,
              coinBalance: 200,
              role: 'user',
            }
          })
          token.id = newUser.id
          token.role = newUser.role
          token.coinBalance = newUser.coinBalance
          token.username = newUser.username
        }
      }

      // Temporarily disable database refresh to test basic auth
      // if (token.sub && !user) {
      //   console.log('JWT callback - refreshing user data for:', token.sub)
      //   const userId = token.sub as string
      //   try {
      //     const currentUser = await prisma.user.findUnique({
      //       where: { id: userId },
      //       select: { coinBalance: true, role: true, username: true }
      //     })
          
      //     if (currentUser) {
      //       token.coinBalance = currentUser.coinBalance
      //       token.role = currentUser.role
      //       token.username = currentUser.username
      //       console.log('JWT callback - refreshed user data:', { coinBalance: token.coinBalance, role: token.role })
      //     } else {
      //       console.log('JWT callback - user not found in database:', userId)
      //     }
      //   } catch (error) {
      //     console.error('Error refreshing user data:', error)
      //   }
      // }

      console.log('JWT callback returning token:', { sub: token.sub, role: token.role })
      return token
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.coinBalance = token.coinBalance as number
        session.user.username = token.username as string
        console.log('Session callback:', { sessionUserId: session.user.id, tokenSub: token.sub, hasRole: !!token.role })
      } else {
        console.log('Session callback - no token or sub:', { hasToken: !!token, sub: token?.sub })
      }
      return session
    }
  }
}

// AuthService singleton pattern
type AuthState = 'UNKNOWN' | 'CHECKING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'ERROR'

interface User {
  id: string
  email: string
  username: string
  role: string
  coinBalance: number
}

class AuthService {
  private static instance: AuthService
  private state: AuthState = 'UNKNOWN'
  private currentUser: User | null = null
  private validationPromise: Promise<boolean> | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  getState(): AuthState {
    return this.state
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  setState(state: AuthState, user: User | null = null): void {
    this.state = state
    this.currentUser = user
  }

  async validateSession(): Promise<boolean> {
    if (this.validationPromise) {
      return this.validationPromise
    }

    this.validationPromise = this._performValidation()
    return this.validationPromise
  }

  private async _performValidation(): Promise<boolean> {
    try {
      this.setState('CHECKING')
      
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        const user = await response.json()
        this.setState('AUTHENTICATED', user)
        return true
      } else {
        this.setState('UNAUTHENTICATED')
        return false
      }
    } catch (error) {
      console.error('Auth validation error:', error)
      this.setState('ERROR')
      return false
    } finally {
      this.validationPromise = null
    }
  }

  clearAuth(): void {
    this.setState('UNAUTHENTICATED')
  }
}

export default AuthService