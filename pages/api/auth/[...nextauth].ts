import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

console.log('=== NEXTAUTH API ROUTE INITIALIZATION ===')
console.log('🔧 NextAuth API route loaded:', {
  hasAuthOptions: !!authOptions,
  timestamp: new Date().toISOString()
})

// Force stderr logging
process.stderr.write('=== NEXTAUTH API ROUTE INITIALIZATION ===\n')
process.stderr.write('🔧 NextAuth API route loaded\n')

const handler = NextAuth(authOptions)

console.log('✅ NextAuth handler created successfully')
process.stderr.write('✅ NextAuth handler created successfully\n')

// Wrap handler to add request debugging
const wrappedHandler = async (req: any, res: any) => {
  process.stderr.write(`🌐 NextAuth API call: ${req.method} ${req.url}\n`)
  console.log(`🌐 NextAuth API call: ${req.method} ${req.url}`)
  
  if (req.method === 'POST' && req.url?.includes('/callback/credentials')) {
    process.stderr.write('🔐 CREDENTIALS CALLBACK ENDPOINT HIT\n')
    console.log('🔐 CREDENTIALS CALLBACK ENDPOINT HIT')
    process.stderr.write(`📋 Request body: ${JSON.stringify(req.body)}\n`)
    console.log('📋 Request body:', req.body)
  }
  
  try {
    return await handler(req, res)
  } catch (error) {
    process.stderr.write(`❌ NextAuth handler error: ${JSON.stringify({
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      timestamp: new Date().toISOString()
    })}\n`)
    console.error('❌ NextAuth handler error:', error)
    
    // If it's a JWE error, continue without throwing to avoid breaking the flow
    if (error.name === 'JWEDecryptionFailed') {
      process.stderr.write('⚠️ JWE Decryption failed, continuing...\n')
      console.warn('⚠️ JWE Decryption failed, continuing...')
      // Return a basic response instead of throwing
      return res.status(200).json({ error: 'Session expired' })
    }
    
    throw error
  }
}

export default wrappedHandler