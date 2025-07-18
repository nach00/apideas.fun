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

    // Fetch all transactions with user info
    const transactions = await prisma.coinTransaction.findMany({
      select: {
        id: true,
        userId: true,
        transactionType: true,
        amount: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to latest 100 transactions
    })

    // Transform the data to match the expected format
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.user.username || transaction.userId,
      type: transaction.transactionType,
      amount: transaction.amount,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString()
    }))

    return res.status(200).json(formattedTransactions)
  } catch (error) {
    console.error('Admin transactions fetch error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}