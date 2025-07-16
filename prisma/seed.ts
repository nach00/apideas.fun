import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import top20apis from '../data/top20apis.json'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  // Create APIs from top20apis.json
  console.log('Seeding APIs...')
  
  for (const apiData of top20apis.apis) {
    await prisma.api.upsert({
      where: { name: apiData.name },
      update: {},
      create: {
        name: apiData.name,
        category: apiData.category,
        description: apiData.description,
        documentationUrl: apiData.url,
        freeTierInfo: apiData.free_tier,
        popularityScore: Math.floor(Math.random() * 100),
        active: true,
      },
    })
  }

  // Create admin user
  console.log('Creating admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  await prisma.user.upsert({
    where: { email: 'admin@apideas.com' },
    update: {
      coinBalance: 1000000000,
    },
    create: {
      email: 'admin@apideas.com',
      username: 'admin',
      hashedPassword,
      coinBalance: 1000000000,
      role: 'admin',
    },
  })

  // Create test user
  console.log('Creating test user...')
  const testHashedPassword = await bcrypt.hash('test123', 12)
  
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      hashedPassword: testHashedPassword,
      coinBalance: 500,
      role: 'user',
    },
  })

  // Create rich user
  console.log('Creating rich user...')
  const richHashedPassword = await bcrypt.hash('rich123', 12)
  
  await prisma.user.upsert({
    where: { email: 'rich@apideas.com' },
    update: {
      coinBalance: 1000000,
    },
    create: {
      email: 'rich@apideas.com',
      username: 'rich',
      hashedPassword: richHashedPassword,
      coinBalance: 1000000,
      role: 'user',
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })