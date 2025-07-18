import { NextApiRequest, NextApiResponse } from 'next'
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
  },
  popular: {
    id: 'popular', 
    name: 'Popular Pack',
    coins: 3000,
    price: 499, // cents
  },
  value: {
    id: 'value',
    name: 'Best Value',
    coins: 15000, 
    price: 1999, // cents
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { packageId } = req.body

    // Input validation
    if (!packageId || typeof packageId !== 'string') {
      return res.status(400).json({ message: 'Package ID is required' })
    }

    // Validate package exists
    const coinPackage = COIN_PACKAGES[packageId as keyof typeof COIN_PACKAGES]
    if (!coinPackage) {
      return res.status(400).json({ message: 'Invalid package ID' })
    }

    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        message: 'Payment processing is temporarily unavailable. Please try again later.'
      })
    }

    console.log('Creating Stripe checkout session for package:', packageId)
    console.log('Stripe secret key present:', !!process.env.STRIPE_SECRET_KEY)
    console.log('Stripe secret key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10))

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: coinPackage.name,
              description: `${coinPackage.coins.toLocaleString()} API Coins`,
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
        packageId: coinPackage.id,
        coins: coinPackage.coins.toString(),
      },
    })

    console.log('Stripe checkout session created:', checkoutSession.id)

    res.status(200).json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })
  } catch (error) {
    console.error('Purchase error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}