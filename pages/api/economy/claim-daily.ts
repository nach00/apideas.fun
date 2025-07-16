import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'
import { 
  ApplicationError,
  ErrorCodes,
  createAuthError, 
  createNotFoundError,
  createErrorResponse, 
  handleAsyncError
} from '@/lib/errors'
import { ApiResponse } from '@/types'

interface DailyRewardResponse {
  message: string;
  coinsAwarded: number;
  newBalance?: number;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<DailyRewardResponse>>
): Promise<void> {
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    })
  }

  const [result, error] = await handleAsyncError(async () => {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      throw createAuthError('Authentication required')
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyCoinsClaimedAt: true, coinBalance: true }
    })

    if (!user) {
      throw createNotFoundError('User', session.user.id)
    }

    // Check if user can claim daily reward (24 hours since last claim)
    const now = new Date()
    const lastClaim = user.dailyCoinsClaimedAt
    
    if (lastClaim) {
      const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastClaim < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastClaim)
        throw new ApplicationError(
          ErrorCodes.VALIDATION_ERROR,
          `Daily reward already claimed. Come back in ${hoursRemaining} hours!`,
          { hoursRemaining, lastClaim: lastClaim.toISOString() }
        )
      }
    }

    const DAILY_REWARD_AMOUNT = 100

    // Award daily coins
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: {
          coinBalance: { increment: DAILY_REWARD_AMOUNT },
          dailyCoinsClaimedAt: now
        },
        select: { coinBalance: true }
      })

      await tx.coinTransaction.create({
        data: {
          userId: session.user.id,
          transactionType: 'daily_reward',
          amount: DAILY_REWARD_AMOUNT,
          description: 'Daily coin reward claimed'
        }
      })

      return user
    })

    return {
      message: 'Daily reward claimed successfully!',
      coinsAwarded: DAILY_REWARD_AMOUNT,
      newBalance: updatedUser.coinBalance
    }
  }, 'CLAIM_DAILY_REWARD')

  if (error) {
    const statusCode = error.code === ErrorCodes.UNAUTHORIZED ? 401 :
                      error.code === ErrorCodes.USER_NOT_FOUND ? 404 :
                      error.code === ErrorCodes.VALIDATION_ERROR ? 400 :
                      500

    return res.status(statusCode).json(createErrorResponse(error))
  }

  if (!result) {
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to claim daily reward',
      message: 'An unexpected error occurred while claiming daily reward'
    })
  }

  return res.status(200).json({ 
    success: true,
    data: result,
    message: 'Daily reward claimed successfully'
  })
}