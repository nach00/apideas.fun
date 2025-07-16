import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { setSecurityHeaders, checkRateLimit, getClientIP, validateUserInput } from '@/lib/security'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// Define coin packages
const COIN_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    coins: 500,
    price: 99, // cents
    priceId: 'price_starter', // You would create these in Stripe Dashboard
  },
  popular: {
    id: 'popular', 
    name: 'Popular Pack',
    coins: 3000,
    price: 499, // cents
    priceId: 'price_popular',
  },
  value: {
    id: 'value',
    name: 'Best Value',
    coins: 15000, 
    price: 1999, // cents
    priceId: 'price_value',
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Apply security headers
  setSecurityHeaders(res)
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Rate limiting for purchases (5 requests per minute)
  const clientIP = getClientIP(req)
  const rateLimitResult = checkRateLimit(clientIP, 60000, 5)
  
  if (!rateLimitResult.allowed) {
    res.setHeader('X-RateLimit-Limit', '5')
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining)
    return res.status(429).json({
      message: 'Too many purchase requests. Please try again later.'
    })
  }

  res.setHeader('X-RateLimit-Limit', '5')
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining)

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { packageId } = req.body

    // Input validation
    if (!packageId || typeof packageId !== 'string') {
      return res.status(400).json({ message: 'Package ID is required' })
    }

    // Check for malicious input
    const packageIdValidation = validateUserInput(packageId, 'Package ID')
    if (!packageIdValidation.valid) {
      return res.status(400).json({ message: packageIdValidation.error })
    }

    // Validate package exists
    const coinPackage = COIN_PACKAGES[packageId as keyof typeof COIN_PACKAGES]
    if (!coinPackage) {
      return res.status(400).json({ message: 'Invalid package ID' })
    }

    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured - returning mock response')
      return res.status(200).json({ 
        sessionId: 'mock_session_' + packageId,
        message: 'Stripe not configured - this is a mock response for development'
      })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email || undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: coinPackage.name,
              description: `${coinPackage.coins.toLocaleString()} API Coins`,
              images: [], // You could add product images here
            },
            unit_amount: coinPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/shop?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/shop?canceled=true`,
      metadata: {
        userId: session.user.id,
        packageId: coinPackage.id,
        coins: coinPackage.coins.toString(),
      },
    })

    res.status(200).json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })
  } catch (error) {
    console.error('Purchase error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}