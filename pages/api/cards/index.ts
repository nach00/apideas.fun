import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'
import { 
  createAuthError, 
  createErrorResponse, 
  handleAsyncError,
  ErrorCodes
} from '@/lib/errors'
import { ApiResponse, CardData } from '@/types'
import { safeParseInt } from '@/lib/validation'

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<CardData[]>>
): Promise<void> {
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      message: 'Only GET requests are allowed'
    })
  }

  const [result, error] = await handleAsyncError(async () => {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      throw createAuthError('Authentication required')
    }

    const { limit } = req.query
    const limitNum = limit ? safeParseInt(limit as string) : undefined

    const cards = await prisma.card.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    })

    // Transform to CardData format
    const cardsData: CardData[] = cards.map(card => ({
      id: card.id,
      title: card.title,
      subtitle: card.subtitle,
      industry: card.industry,
      apis: JSON.parse(card.apis),
      rating: card.rating,
      rarity: card.rarity,
      problem: card.problem || undefined,
      solution: card.solution || undefined,
      implementation: card.implementation || undefined,
      marketOpportunity: card.marketOpportunity || undefined,
      summary: card.summary || undefined,
      complexity: card.complexity || undefined,
      feasibility: card.feasibility || undefined,
      createdAt: card.createdAt.toISOString(),
    }))

    return cardsData
  }, 'FETCH_CARDS')

  if (error) {
    const statusCode = error.code === ErrorCodes.UNAUTHORIZED ? 401 : 500
    return res.status(statusCode).json(createErrorResponse(error))
  }

  if (!result) {
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch cards',
      message: 'An unexpected error occurred while fetching cards'
    })
  }

  return res.status(200).json({ 
    success: true,
    data: result,
    message: 'Cards fetched successfully'
  })
}