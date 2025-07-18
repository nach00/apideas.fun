import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid user ID' })
  }

  try {
    if (req.method === 'PATCH') {
      // Update user with multiple field support
      const { role, username, coinBalance, resetPassword } = req.body

      // Validation
      if (role && !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' })
      }

      if (username && (typeof username !== 'string' || username.length < 3 || username.length > 20)) {
        return res.status(400).json({ message: 'Username must be between 3 and 20 characters' })
      }

      if (coinBalance !== undefined && (typeof coinBalance !== 'number' || coinBalance < 0 || coinBalance > 999999)) {
        return res.status(400).json({ message: 'Coin balance must be between 0 and 999,999' })
      }

      // Prevent user from demoting themselves
      if (id === user.id && role && role !== 'admin') {
        return res.status(400).json({ message: 'Cannot demote yourself from admin role' })
      }

      // Check if username is already taken (if changing username)
      if (username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username: username,
            NOT: { id: id }
          }
        })
        if (existingUser) {
          return res.status(400).json({ message: 'Username is already taken' })
        }
      }

      // Build update data object
      const updateData: any = {}
      if (role !== undefined) updateData.role = role
      if (username !== undefined) updateData.username = username
      if (coinBalance !== undefined) updateData.coinBalance = coinBalance
      
      // Handle password reset
      if (resetPassword) {
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash('password123', 12)
        updateData.hashedPassword = hashedPassword
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          coinBalance: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              cards: true
            }
          }
        }
      })

      const formattedUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        coinBalance: updatedUser.coinBalance,
        totalCards: updatedUser._count.cards,
        createdAt: updatedUser.createdAt.toISOString(),
        lastActive: updatedUser.updatedAt.toISOString()
      }

      return res.status(200).json({ 
        user: formattedUser,
        message: resetPassword ? 'User updated successfully. Password reset to "password123".' : 'User updated successfully'
      })

    } else if (req.method === 'DELETE') {
      // Delete user and all associated data
      
      // Prevent user from deleting themselves
      if (id === user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' })
      }

      // Check if user exists
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { id: true, username: true }
      })

      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Delete user (Prisma will cascade delete cards, preferences, and transactions)
      await prisma.user.delete({
        where: { id }
      })

      return res.status(200).json({ 
        message: `User ${targetUser.username} deleted successfully`,
        deletedUserId: id 
      })

    } else {
      res.setHeader('Allow', ['PATCH', 'DELETE'])
      return res.status(405).json({ message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Error in user management API:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}