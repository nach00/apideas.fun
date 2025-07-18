import prisma from '../lib/prisma'

async function checkDatabase() {
  try {
    // Count users
    const userCount = await prisma.user.count()
    console.log(`Total users: ${userCount}`)
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        coinBalance: true
      }
    })
    
    console.log('\nUsers in database:')
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}, Coins: ${user.coinBalance}`)
    })
    
    // Check for admin users
    const adminCount = await prisma.user.count({
      where: { role: 'admin' }
    })
    console.log(`\nAdmin users: ${adminCount}`)
    
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()