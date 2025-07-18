import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface ActivityItem {
  id: string
  type: 'user_registered' | 'card_generated' | 'purchase' | 'login'
  userId: string
  username: string
  description: string
  timestamp: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' })
    }

    const activities: ActivityItem[] = []

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        type: 'user_registered',
        userId: user.id,
        username: user.username,
        description: `${user.username} created an account`,
        timestamp: user.createdAt.toISOString()
      })
    })

    // Get recent card generations
    const recentCards = await prisma.card.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        createdAt: true,
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    recentCards.forEach(card => {
      activities.push({
        id: `card_${card.id}`,
        type: 'card_generated',
        userId: card.userId,
        username: card.user.username,
        description: `${card.user.username} generated "${card.title}"`,
        timestamp: card.createdAt.toISOString()
      })
    })

    // Get recent purchases (coin transactions with positive amounts)
    const recentPurchases = await prisma.coinTransaction.findMany({
      where: {
        amount: {
          gt: 0
        },
        transactionType: 'stripe_purchase'
      },
      select: {
        id: true,
        userId: true,
        amount: true,
        createdAt: true,
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    recentPurchases.forEach(purchase => {
      activities.push({
        id: `purchase_${purchase.id}`,
        type: 'purchase',
        userId: purchase.userId,
        username: purchase.user.username,
        description: `${purchase.user.username} purchased ${purchase.amount} coins`,
        timestamp: purchase.createdAt.toISOString()
      })
    })

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Return top 20 activities
    return res.status(200).json(activities.slice(0, 20))
  } catch (error) {
    console.error('Admin activity fetch error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}