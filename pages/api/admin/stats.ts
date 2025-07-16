import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const [totalUsers, totalCards, totalTransactions, revenueData] = await Promise.all([
      prisma.user.count(),
      prisma.card.count(),
      prisma.coinTransaction.count(),
      prisma.coinTransaction.aggregate({
        where: {
          transactionType: 'purchase'
        },
        _sum: {
          amount: true
        }
      })
    ])

    // Simple revenue calculation (coins purchased / 1000 * base price)
    const totalRevenue = (revenueData._sum.amount || 0) * 0.001 // Rough estimate

    res.status(200).json({
      totalUsers,
      totalCards,
      totalTransactions,
      totalRevenue
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}