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

export function calculateRarity(rating: number): string {
  if (rating >= 0.98) return 'Legendary'
  if (rating >= 0.95) return 'Epic'
  if (rating >= 0.85) return 'Rare'
  if (rating >= 0.7) return 'Uncommon'
  return 'Common'
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

export function getCombinationByApis(
  selectedApis: string[],
  existingCombinationKeys: string[] = []
): DuoData | null {
  // Create combination key from selected APIs
  const combinationKey = selectedApis.sort().join('-')
  
  // Check if user already has this combination
  if (existingCombinationKeys.includes(combinationKey)) {
    return null
  }

  // Find exact match in duos data
  const combination = duosData.find((combo: DuoData) => {
    const comboKey = combo.apis.sort().join('-')
    return comboKey === combinationKey
  })

  return combination || null
}

export function getRandomCombination(
  lockedApis: string[] = [],
  ignoredApis: string[] = [],
  existingCombinationKeys: string[] = []
): DuoData | null {
  // Filter available combinations based on user preferences AND existing cards
  const availableCombinations = duosData.filter((combo: DuoData) => {
    // Check if user already has this combination
    const combinationKey = combo.apis.sort().join('-')
    if (existingCombinationKeys.includes(combinationKey)) {
      return false
    }

    // If we have locked APIs, at least one must be in the combination
    if (lockedApis.length > 0) {
      const hasLockedApi = combo.apis.some(api => lockedApis.includes(api))
      if (!hasLockedApi) return false
    }

    // None of the ignored APIs should be in the combination
    const hasIgnoredApi = combo.apis.some(api => ignoredApis.includes(api))
    if (hasIgnoredApi) return false

    return true
  })

  if (availableCombinations.length === 0) {
    return null
  }

  // Select random combination
  const randomIndex = Math.floor(Math.random() * availableCombinations.length)
  return availableCombinations[randomIndex]
}

export function createCardFromCombination(
  userId: string,
  combination: DuoData
): {
  userId: string
  combinationKey: string
  apis: string
  title: string
  subtitle: string
  industry: string
  problem?: string
  solution?: string
  implementation?: string
  marketOpportunity?: string
  summary?: string
  rating: number
  feasibility: string
  complexity: string
  rarity: string
  saved: boolean
  favorited: boolean
  generationSource: string
} {
  return {
    userId,
    combinationKey: combination.apis.sort().join('-'),
    apis: JSON.stringify(combination.apis),
    title: combination.title,
    subtitle: combination.subtitle,
    industry: combination.industry,
    problem: combination.problem,
    solution: combination.solution,
    implementation: combination.implementation,
    marketOpportunity: combination.market_opportunity,
    summary: combination.summary,
    rating: combination.rating,
    feasibility: combination.feasibility,
    complexity: combination.complexity,
    rarity: calculateRarity(combination.rating),
    saved: false,
    favorited: false,
    generationSource: 'precurated'
  }
}