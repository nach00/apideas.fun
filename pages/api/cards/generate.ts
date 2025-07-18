import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'
import { getRandomCombination, getCombinationByApis, createCardFromCombination } from '@/lib/card-utils'
import { 
  ApplicationError, 
  ErrorCodes, 
  createAuthError, 
  createInsufficientCoinsError,
  createErrorResponse,
  handleAsyncError 
} from '@/lib/errors'
import { setSecurityHeaders, checkRateLimit, getClientIP } from '@/lib/security'
import { ApiResponse, CardData } from '@/types'

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<CardData>>
): Promise<void> {
  // Apply security headers
  setSecurityHeaders(res)
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    })
  }

  // Rate limiting for card generation (10 requests per minute)
  const clientIP = getClientIP(req)
  const rateLimitResult = checkRateLimit(clientIP, 60000, 10)
  
  if (!rateLimitResult.allowed) {
    res.setHeader('X-RateLimit-Limit', '10')
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining)
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Card generation rate limit exceeded. Please try again later.'
    })
  }

  res.setHeader('X-RateLimit-Limit', '10')
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining)

  const [result, error] = await handleAsyncError(async () => {
    // Starting card generation process
    
    // Authenticate user
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      // No session found
      throw createAuthError('Authentication required')
    }

    // Session found for user
    
    // Validate and sanitize request data
    const selectedApis = req.body?.selectedApis ? 
      (Array.isArray(req.body.selectedApis) ? req.body.selectedApis : []) : [];
    // Request body validated

    // Check user's coin balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coinBalance: true }
    })

    if (!user) {
      throw new ApplicationError(ErrorCodes.USER_NOT_FOUND, 'User not found');
    }

    const CARD_COST = 15;
    if (user.coinBalance < CARD_COST) {
      // Insufficient coins
      throw createInsufficientCoinsError(CARD_COST, user.coinBalance);
    }

    // User has sufficient coins

    // Get user's API preferences
    const preferences = await prisma.userPreference.findMany({
      where: { userId: session.user.id },
      include: { api: true }
    })

    const lockedApis = preferences
      .filter(p => p.preferenceType === 'lock')
      .map(p => p.api.name)

    const ignoredApis = preferences
      .filter(p => p.preferenceType === 'ignore')
      .map(p => p.api.name)

    // API preferences loaded

    // Get existing cards to prevent duplicates
    const existingCards = await prisma.card.findMany({
      where: { userId: session.user.id },
      select: { combinationKey: true }
    })
    
    const existingCombinationKeys = existingCards.map(card => card.combinationKey)
    // Existing cards loaded

    let combination = null

    // If specific APIs were selected by frontend, try to use them
    if (selectedApis && Array.isArray(selectedApis) && selectedApis.length === 2) {
      // Frontend selected specific APIs
      combination = getCombinationByApis(selectedApis, existingCombinationKeys)
      
      if (combination) {
        // Found exact combination for selected APIs
      } else {
        // No combination found for selected APIs, falling back to random
      }
    }

    // Fall back to random combination if no specific selection or no match found
    if (!combination) {
      // Using random combination selection
      combination = getRandomCombination(lockedApis, ignoredApis, existingCombinationKeys)
    }
    
    if (!combination) {
      // No combinations available
      
      // Check if user has all possible combinations
      if (existingCombinationKeys.length >= 190) {
        throw new ApplicationError(
          ErrorCodes.CARD_GENERATION_FAILED,
          'You have collected all possible card combinations! Your collection is complete.',
          { totalCards: existingCombinationKeys.length }
        );
      }
      
      throw new ApplicationError(
        ErrorCodes.CARD_GENERATION_FAILED,
        'No new combinations available. Please adjust your API preferences or you may have most cards already.',
        { totalCards: existingCombinationKeys.length, availableCombinations: 190 }
      );
    }

    // Selected combination

    // Create card data
    const cardData = createCardFromCombination(session.user.id, combination)
    // Card data created

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Double-check for duplicates within the transaction (race condition protection)
      const existingCard = await tx.card.findFirst({
        where: {
          userId: session.user.id,
          combinationKey: cardData.combinationKey
        }
      })

      if (existingCard) {
        throw new ApplicationError(
          ErrorCodes.CARD_GENERATION_FAILED,
          'Card combination already exists in your collection',
          { combinationKey: cardData.combinationKey }
        );
      }

      // Deduct coins
      await tx.user.update({
        where: { id: session.user.id },
        data: { coinBalance: { decrement: 15 } }
      })

      // Create card
      const card = await tx.card.create({
        data: cardData
      })

      // Record transaction
      await tx.coinTransaction.create({
        data: {
          userId: session.user.id,
          transactionType: 'card_generation',
          amount: -15,
          description: 'Generated new card',
          referenceType: 'card',
          referenceId: card.id
        }
      })

      return card
    })

    // Card generated successfully

    return result;
  }, 'CARD_GENERATION');

  // Handle the result
  if (error) {
    const statusCode = error.code === ErrorCodes.UNAUTHORIZED ? 401 :
                      error.code === ErrorCodes.INSUFFICIENT_COINS ? 400 :
                      error.code === ErrorCodes.USER_NOT_FOUND ? 404 :
                      error.code === ErrorCodes.CARD_GENERATION_FAILED ? 400 :
                      500;

    return res.status(statusCode).json(createErrorResponse(error));
  }

  if (!result) {
    return res.status(500).json({ 
      success: false, 
      error: 'Card generation failed',
      message: 'An unexpected error occurred during card generation'
    });
  }

  // Transform Prisma result to CardData format
  const cardData: CardData = {
    id: result.id,
    title: result.title,
    subtitle: result.subtitle,
    industry: result.industry,
    apis: result.apis,
    rating: result.rating,
    rarity: result.rarity,
    problem: result.problem || undefined,
    solution: result.solution || undefined,
    implementation: result.implementation || undefined,
    marketOpportunity: result.marketOpportunity || undefined,
    summary: result.summary || undefined,
    complexity: result.complexity || undefined,
    feasibility: result.feasibility || undefined,
    createdAt: result.createdAt.toISOString(),
  };

  return res.status(201).json({ 
    success: true,
    data: cardData,
    message: 'Card generated successfully'
  });
}