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
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const limit = parseInt(req.query.limit as string) || 10
    const offset = parseInt(req.query.offset as string) || 0

    const transactions = await prisma.coinTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        transactionType: true,
        amount: true,
        description: true,
        createdAt: true,
      }
    })

    const total = await prisma.coinTransaction.count({
      where: { userId: session.user.id }
    })

    res.status(200).json({
      transactions,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Fetch transactions error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}