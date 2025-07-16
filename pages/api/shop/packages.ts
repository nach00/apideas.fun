import { NextApiRequest, NextApiResponse } from 'next'

// Define coin packages (matches purchase.ts)
const COIN_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    coins: 500,
    price: 0.99,
    priceInCents: 99,
    popular: false,
    description: 'Perfect for trying out the platform',
    features: [
      '500 API Coins',
      '~33 card generations',
      'Save & favorite cards',
      'Basic API preferences'
    ]
  },
  {
    id: 'popular', 
    name: 'Popular Pack',
    coins: 3000,
    price: 4.99,
    priceInCents: 499,
    popular: true,
    description: 'Most popular choice for regular users',
    features: [
      '3,000 API Coins',
      '~200 card generations',
      'Advanced filtering',
      'Priority support',
      'Best value per coin'
    ]
  },
  {
    id: 'value',
    name: 'Best Value',
    coins: 15000, 
    price: 19.99,
    priceInCents: 1999,
    popular: false,
    description: 'Maximum coins for serious developers',
    features: [
      '15,000 API Coins',
      '~1000 card generations',
      'Bulk operations',
      'Priority support',
      'Exclusive features'
    ]
  }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    res.status(200).json({ packages: COIN_PACKAGES })
  } catch (error) {
    console.error('Failed to fetch packages:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}