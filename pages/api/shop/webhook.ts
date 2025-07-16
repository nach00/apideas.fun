import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import Stripe from 'stripe'
import { prisma } from '@/lib/database'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// Disable body parsing, need raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get raw body
    const buf = await buffer(req)
    const signature = req.headers['stripe-signature'] as string

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook secret not configured')
      return res.status(500).json({ message: 'Webhook secret not configured' })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(buf, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return res.status(400).json({ message: 'Webhook signature verification failed' })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ message: 'Webhook handler failed' })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  try {
    const { userId, packageId, coins } = session.metadata || {}
    
    if (!userId || !packageId || !coins) {
      console.error('Missing metadata in checkout session:', session.id)
      return
    }

    const coinAmount = parseInt(coins, 10)
    if (isNaN(coinAmount)) {
      console.error('Invalid coin amount:', coins)
      return
    }

    // Update user's coin balance and record transaction
    await prisma.$transaction(async (tx) => {
      // Update user's coin balance
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          coinBalance: {
            increment: coinAmount
          }
        }
      })

      // Record the transaction
      await tx.coinTransaction.create({
        data: {
          userId: userId,
          transactionType: 'purchase',
          amount: coinAmount,
          description: `Purchased ${packageId} package`,
          referenceType: 'stripe_session',
          referenceId: session.id,
        }
      })

      console.log(`Successfully added ${coinAmount} coins to user ${userId}. New balance: ${user.coinBalance}`)
    })
  } catch (error) {
    console.error('Failed to process successful payment:', error)
    throw error
  }
}