import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'
import { createCardFromCombination } from '@/lib/card-utils'
import duosData from '@/data/duos.json'

interface DuoData {
  apis: string[]
  title: string
  subtitle: string
  industry: string
  problem?: string
  solution?: string
  implementation?: string
  market_opportunity?: string
  summary?: string
  rating: number
  feasibility: string
  complexity: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    console.log('🔄 Starting to generate all cards for admin user:', session.user.id)

    // Get the admin user
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, username: true, coinBalance: true }
    })

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' })
    }

    // Get existing cards for the admin user to avoid duplicates
    const existingCards = await prisma.card.findMany({
      where: { userId: session.user.id },
      select: { combinationKey: true }
    })

    const existingKeys = new Set(existingCards.map(card => card.combinationKey))

    // Filter out combinations that already exist
    const newCombinations = duosData.filter((combo: DuoData) => {
      const key = combo.apis.sort().join('-')
      return !existingKeys.has(key)
    })

    if (newCombinations.length === 0) {
      return res.status(200).json({
        message: 'All cards already exist for admin user',
        totalCards: existingCards.length,
        newCardsAdded: 0
      })
    }

    console.log(`✅ Found ${newCombinations.length} new combinations to add`)

    // Create card data for all new combinations
    const cardDataArray = newCombinations.map((combo: DuoData) => 
      createCardFromCombination(session.user.id, combo)
    )

    // Batch insert all cards
    const createdCards = await prisma.card.createMany({
      data: cardDataArray
    })

    console.log(`✅ Created ${createdCards.count} new cards for admin user`)

    // Get the total count of cards for the admin user
    const totalCards = await prisma.card.count({
      where: { userId: session.user.id }
    })

    // Create coin transactions for the generated cards (for record keeping)
    const coinTransactions = cardDataArray.map(cardData => ({
      userId: session.user.id,
      transactionType: 'admin_generation',
      amount: 0, // No cost for admin
      description: `Admin generated card: ${cardData.title}`,
      referenceType: 'admin_action',
      referenceId: 'bulk_generation'
    }))

    await prisma.coinTransaction.createMany({
      data: coinTransactions
    })

    // Log activity
    console.log(`✅ Admin ${adminUser.username} now has ${totalCards} total cards`)

    res.status(200).json({
      message: 'Successfully generated all cards for admin user',
      totalCards,
      newCardsAdded: createdCards.count,
      adminUser: {
        id: adminUser.id,
        username: adminUser.username,
        coinBalance: adminUser.coinBalance
      }
    })

  } catch (error) {
    console.error('❌ Error generating all cards for admin:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    })
  }
}