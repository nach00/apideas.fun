import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid card ID' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      const card = await prisma.card.findFirst({
        where: {
          id,
          userId: session.user.id
        }
      })

      if (!card) {
        return res.status(404).json({ message: 'Card not found' })
      }

      res.status(200).json(card)
    } else if (req.method === 'PATCH') {
      const { pinned, saved, favorited } = req.body

      // Check if card exists and belongs to user
      const existingCard = await prisma.card.findFirst({
        where: {
          id,
          userId: session.user.id
        }
      })

      if (!existingCard) {
        return res.status(404).json({ message: 'Card not found' })
      }

      // Update the card
      const updatedCard = await prisma.card.update({
        where: { id },
        data: {
          ...(pinned !== undefined && { pinned }),
          ...(saved !== undefined && { saved }),
          ...(favorited !== undefined && { favorited }),
          updatedAt: new Date()
        }
      })

      res.status(200).json(updatedCard)
    } else if (req.method === 'DELETE') {
      // Check if card exists and belongs to user
      const existingCard = await prisma.card.findFirst({
        where: {
          id,
          userId: session.user.id
        }
      })

      if (!existingCard) {
        return res.status(404).json({ message: 'Card not found' })
      }

      // Prevent deletion of pinned cards
      if (existingCard.pinned) {
        return res.status(400).json({ message: 'Cannot delete pinned cards. Unpin the card first.' })
      }

      // Delete the card
      await prisma.card.delete({
        where: { id }
      })

      res.status(200).json({ message: 'Card deleted successfully' })
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Card operation error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}