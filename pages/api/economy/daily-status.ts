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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyCoinsClaimedAt: true }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    let canClaim = true
    let nextClaimTime = null

    if (user.dailyCoinsClaimedAt) {
      const hoursSinceLastClaim = (new Date().getTime() - user.dailyCoinsClaimedAt.getTime()) / (1000 * 60 * 60)
      canClaim = hoursSinceLastClaim >= 24
      
      if (!canClaim) {
        nextClaimTime = new Date(user.dailyCoinsClaimedAt.getTime() + 24 * 60 * 60 * 1000)
      }
    }

    res.status(200).json({
      canClaim,
      nextClaimTime,
      lastClaimedAt: user.dailyCoinsClaimedAt
    })
  } catch (error) {
    console.error('Daily status error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}