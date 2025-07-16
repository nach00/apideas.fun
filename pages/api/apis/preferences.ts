import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { apiId, preferenceType, value } = req.body

    if (!apiId || !preferenceType || typeof value !== 'boolean') {
      return res.status(400).json({ message: 'Invalid request data' })
    }

    if (!['lock', 'ignore', 'reset'].includes(preferenceType)) {
      return res.status(400).json({ message: 'Invalid preference type' })
    }

    // Check constraints
    if (value && preferenceType === 'lock') {
      const lockCount = await prisma.userPreference.count({
        where: {
          userId: session.user.id,
          preferenceType: 'lock'
        }
      })

      if (lockCount >= 5) {
        return res.status(400).json({ message: 'Maximum 5 APIs can be locked' })
      }
    }

    if (value && preferenceType === 'ignore') {
      const ignoreCount = await prisma.userPreference.count({
        where: {
          userId: session.user.id,
          preferenceType: 'ignore'
        }
      })

      const totalApis = await prisma.api.count({ where: { active: true } })
      
      if (ignoreCount >= totalApis - 10) {
        return res.status(400).json({ message: 'At least 10 APIs must remain available' })
      }
    }

    if (preferenceType === 'reset') {
      // Remove all preferences for this API
      await prisma.userPreference.deleteMany({
        where: {
          userId: session.user.id,
          apiId
        }
      })
    } else if (value) {
      // Create or update preference
      await prisma.userPreference.upsert({
        where: {
          userId_apiId: {
            userId: session.user.id,
            apiId
          }
        },
        create: {
          userId: session.user.id,
          apiId,
          preferenceType
        },
        update: {
          preferenceType
        }
      })
    } else {
      // Remove preference
      await prisma.userPreference.deleteMany({
        where: {
          userId: session.user.id,
          apiId,
          preferenceType
        }
      })
    }

    res.status(200).json({ message: 'Preference updated successfully' })
  } catch (error) {
    console.error('Update preference error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}