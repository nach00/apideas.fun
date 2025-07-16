import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

console.log('=== NEXTAUTH API ROUTE INITIALIZATION ===')
console.log('🔧 NextAuth API route loaded:', {
  hasAuthOptions: !!authOptions,
  timestamp: new Date().toISOString()
})

const handler = NextAuth(authOptions)

console.log('✅ NextAuth handler created successfully')

export default handler