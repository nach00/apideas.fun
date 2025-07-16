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

    // Get all APIs with user preferences
    const apis = await prisma.api.findMany({
      where: { active: true },
      include: {
        userPreferences: {
          where: { userId: session.user.id }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform data to include preference flags
    const apisWithPreferences = apis.map(api => ({
      id: api.id,
      name: api.name,
      category: api.category,
      description: api.description,
      documentationUrl: api.documentationUrl,
      freeTierInfo: api.freeTierInfo,
      isLocked: api.userPreferences.some(p => p.preferenceType === 'lock'),
      isIgnored: api.userPreferences.some(p => p.preferenceType === 'ignore')
    }))

    res.status(200).json(apisWithPreferences)
  } catch (error) {
    console.error('Fetch APIs error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}