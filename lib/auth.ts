import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import prisma from './database'
import { validateEnvVar } from './validation'

// Validate required environment variables on import

try {
  validateEnvVar('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET)
} catch (error) {
  console.error('❌ NEXTAUTH_SECRET validation failed:', error)
}

// Optional OAuth environment variables
const oauthEnvVars = {
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  GOOGLE_ID: process.env.GOOGLE_ID,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
}

// Cookie security settings
const isSecure = process.env.NEXTAUTH_URL?.startsWith('https://') || false

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Force false for now to fix cookie rejection
        domain: undefined // Remove domain for now
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Force false for now to fix cookie rejection
        domain: undefined // Remove domain for now
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Force false for now to fix cookie rejection
        domain: undefined // Remove domain for now
      }
    }
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Credentials provider authorize function
        
        // Credentials authentication attempt
        
        if (!credentials?.email || !credentials?.password) {
          // Missing credentials
          return null
        }

        // Looking up user in database
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          // User lookup completed

          if (!user || !user.hashedPassword) {
            // User not found or no password
            return null
          }

          // Verifying password
          const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
          
          // Password verification completed
          
          if (!isValid) {
            // Invalid password
            return null
          }

          const userResult = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            coinBalance: user.coinBalance,
          }

          console.log('✅ Credentials authorize success, returning user:', userResult)
          console.log('🔍 About to return user object to NextAuth...')
          
          // Add a small delay to ensure the log is captured
          await new Promise(resolve => setTimeout(resolve, 10))
          
          return userResult
        } catch (error) {
          console.error('❌ Error in authorize function:', error)
          return null
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
      // JWT callback processing
      
      if (user) {
        // User object received, setting in token
        
        // Ensure the user ID is properly set as the subject
        if (user.id) {
          token.sub = user.id
        }
        
        // Set additional user properties
        token.role = user.role
        token.coinBalance = user.coinBalance
        token.username = user.username
        token.email = user.email
        
        console.log('✅ JWT callback - Token after setting user data:', { 
          tokenSub: token.sub, 
          role: token.role,
          coinBalance: token.coinBalance,
          username: token.username,
          email: token.email
        })
      } else {
        console.log('⚠️ JWT callback - No user object, checking existing token...')
        console.log('🎯 Token contents:', {
          sub: token.sub,
          role: token.role,
          coinBalance: token.coinBalance,
          username: token.username,
          email: token.email
        })
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

      // Refresh user data from database on token refresh (but not on initial login)
      if (token.sub && !user) {
        // Refreshing user data
        const userId = token.sub as string
        try {
          const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { coinBalance: true, role: true, username: true }
          })
          
          if (currentUser) {
            token.coinBalance = currentUser.coinBalance
            token.role = currentUser.role
            token.username = currentUser.username
            // User data refreshed
          } else {
            // User not found in database
          }
        } catch (error) {
          console.error('Error refreshing user data:', error)
        }
      }

      // JWT callback completed
      return token
    },
    async session({ session, token }) {
      // Session callback processing
      
      if (token && token.sub) {
        // Setting session user from token
        
        // Ensure session.user exists
        if (!session.user) {
          console.log('⚠️ Session callback - No session.user, creating...')
          session.user = {} as any
        }
        
        session.user.id = token.sub as string
        session.user.role = token.role as string || 'user'
        session.user.coinBalance = token.coinBalance as number || 0
        session.user.username = token.username as string || 'Unknown'
        session.user.email = token.email as string || session.user.email
        
        console.log('✅ Session callback - Session user set:', { 
          sessionUserId: session.user.id, 
          tokenSub: token.sub, 
          role: session.user.role,
          coinBalance: session.user.coinBalance,
          username: session.user.username,
          email: session.user.email
        })
      } else {
        // No token or sub available
      }
      
      // Session callback completed
      return session
    }
  }
}

// Auth options created

const configCheck = {
  hasSecret: !!authOptions.secret,
  providersCount: authOptions.providers?.length || 0,
  hasJWTCallback: !!authOptions.callbacks?.jwt,
  hasSessionCallback: !!authOptions.callbacks?.session,
  sessionStrategy: authOptions.session?.strategy,
  jwtMaxAge: authOptions.jwt?.maxAge,
  sessionMaxAge: authOptions.session?.maxAge
}

// AuthOptions configuration complete

// Callbacks validation complete

// Session callback validation complete

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