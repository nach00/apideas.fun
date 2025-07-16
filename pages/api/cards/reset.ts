import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await prisma.card.deleteMany({
      where: { userId: session.user.id }
    })

    res.status(200).json({ message: 'All cards deleted successfully' })
  } catch (error) {
    console.error('Reset cards error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}