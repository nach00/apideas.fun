import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// NextAuth API route initialization

const handler = NextAuth(authOptions)

// NextAuth handler created successfully

// Wrap handler for error handling
const wrappedHandler = async (req: any, res: any) => {
  try {
    return await handler(req, res)
  } catch (error: any) {
    // If it's a JWE error, continue without throwing to avoid breaking the flow
    if (error.name === 'JWEDecryptionFailed') {
      // Return a basic response instead of throwing
      return res.status(200).json({ error: 'Session expired' })
    }
    
    console.error('NextAuth handler error:', error)
    throw error
  }
}

export default wrappedHandler