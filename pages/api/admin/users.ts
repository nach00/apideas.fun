import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

    // Fetch all users with their card count
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        coinBalance: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            cards: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      coinBalance: user.coinBalance,
      totalCards: user._count.cards,
      createdAt: user.createdAt.toISOString(),
      lastActive: user.updatedAt.toISOString()
    }))

    return res.status(200).json(formattedUsers)
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}