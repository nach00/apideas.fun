import { useState, useEffect, useCallback } from 'react'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { formatNumber } from '@/lib/card-utils'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/auth/AuthGuard'
import styles from './shop.module.css'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Package {
  id: string
  name: string
  coins: number
  price: number
  priceInCents: number
  popular: boolean
  description: string
  features: string[]
}

interface Transaction {
  id: string
  amount: number
  description: string
  createdAt: string
  transactionType: string
}

export default function ShopPage(): JSX.Element {
  const { data: session, update: updateSession } = useSession()
  const [canClaimDaily, setCanClaimDaily] = useState(false)
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [packages, setPackages] = useState<Package[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [selectedTab, setSelectedTab] = useState<'shop' | 'history'>('shop')

  const updateTimeUntilNextClaim = useCallback((nextClaimTime: string): void => {
    const next = new Date(nextClaimTime).getTime()
    const now = new Date().getTime()
    const diff = next - now
    
    if (diff <= 0) {
      setTimeUntilNextClaim('')
      return
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    setTimeUntilNextClaim(`${hours}h ${minutes}m`)
  }, [])

  const checkDailyReward = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/economy/daily-status')
      if (response.ok) {
        const data = await response.json()
        setCanClaimDaily(data.canClaim)
        if (!data.canClaim && data.nextClaimTime) {
          updateTimeUntilNextClaim(data.nextClaimTime)
        }
      }
    } catch (err) {
      console.error('Failed to check daily reward:', err)
    }
  }, [updateTimeUntilNextClaim])

  const fetchPackages = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/shop/packages')
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (err) {
      console.error('Failed to fetch packages:', err)
    }
  }, [])

  const fetchRecentTransactions = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/economy/transactions?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentTransactions(data.transactions || [])
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    }
  }, [])

  useEffect(() => {
    checkDailyReward()
    fetchPackages()
    fetchRecentTransactions()
    
    // Update timer every minute
    const timer = setInterval(() => {
      checkDailyReward()
    }, 60000)
    
    return () => clearInterval(timer)
  }, [checkDailyReward, fetchPackages, fetchRecentTransactions])

  const claimDailyReward = async (): Promise<void> => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/economy/claim-daily', {
        method: 'POST',
      })
      
      if (response.ok) {
        setMessage('🎉 Successfully claimed 100 daily coins!')
        setCanClaimDaily(false)
        // Update session to reflect new balance
        await updateSession()
        // Refresh transactions
        fetchRecentTransactions()
      } else {
        const data = await response.json()
        setMessage(data.message || 'Failed to claim daily reward')
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const purchaseCoins = async (packageId: string): Promise<void> => {
    setPurchaseLoading(packageId)
    setMessage('')
    try {
      console.log('Attempting to purchase package:', packageId)
      
      const response = await fetch('/api/shop/purchase-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })

      console.log('Purchase response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Purchase response data:', data)
        
        if (data.url) {
          // Redirect to Stripe Checkout
          console.log('Redirecting to Stripe checkout URL:', data.url)
          window.location.href = data.url
        } else if (data.sessionId) {
          // Alternative: Use Stripe.js redirect
          console.log('Using Stripe.js redirect with session ID:', data.sessionId)
          const stripe = await stripePromise
          if (stripe) {
            const { error } = await stripe.redirectToCheckout({
              sessionId: data.sessionId,
            })
            if (error) {
              console.error('Stripe redirect error:', error)
              setMessage(error.message || 'Failed to redirect to checkout')
            }
          } else {
            setMessage('Stripe failed to initialize')
          }
        } else {
          console.error('Invalid response from server:', data)
          setMessage('Invalid response from server')
        }
      } else {
        const data = await response.json()
        console.error('Purchase API error:', data)
        setMessage(data.message || 'Failed to create purchase session')
      }
    } catch (err) {
      console.error('Purchase error:', err)
      setMessage('Something went wrong. Please try again.')
    } finally {
      setPurchaseLoading(null)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'daily_reward': return '🎁'
      case 'purchase': return '💳'
      case 'generation': return '🎯'
      default: return '💰'
    }
  }

  return (
    <AuthGuard requireAuth>
      <Navbar />
      <div className={styles.shopPage}>
        <div className={styles.shopContainer}>
          {/* Hero Section */}
          <section className={styles.shopHero}>
            <div className={styles.shopHeroContent}>
              <h1 className={styles.shopTitle}>
                <span className={styles.shopTitleIcon}>💰</span>
                Coin Shop
              </h1>
              <p className={styles.shopSubtitle}>
                Fuel your innovation journey with API Coins
              </p>
              
              {/* Balance Display */}
              <div className={styles.shopBalanceCard}>
                <div className={styles.balanceGlow}></div>
                <div className={styles.balanceContent}>
                  <span className={styles.balanceLabel}>Current Balance</span>
                  <div className={styles.balanceValue}>
                    <span className={styles.balanceIcon}>🪙</span>
                    <span className={styles.balanceAmount}>{formatNumber(session?.user.coinBalance || 0)}</span>
                    <span className={styles.balanceSuffix}>coins</span>
                  </div>
                  <div className={styles.balanceHint}>
                    {session?.user.coinBalance && session.user.coinBalance >= 15 
                      ? `Can generate ${formatNumber(Math.floor(session.user.coinBalance / 15))} more cards`
                      : 'Need more coins to generate cards'
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Alert Message */}
          {message && (
            <div className={`${styles.shopAlert} ${message.includes('Successfully') || message.includes('🎉') ? styles['shopAlert--success'] : styles['shopAlert--error']}`}>
              <div className={styles.shopAlertContent}>
                {message}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className={styles.shopTabs}>
            <button
              className={`${styles.shopTab} ${selectedTab === 'shop' ? styles['shopTab--active'] : ''}`}
              onClick={() => setSelectedTab('shop')}
            >
              <span className={styles.shopTabIcon}>🛍️</span>
              Shop
            </button>
            <button
              className={`${styles.shopTab} ${selectedTab === 'history' ? styles['shopTab--active'] : ''}`}
              onClick={() => setSelectedTab('history')}
            >
              <span className={styles.shopTabIcon}>📜</span>
              History
            </button>
          </div>

          {selectedTab === 'shop' ? (
            <>
              {/* Daily Reward Section */}
              <section className={styles.dailyRewardSection}>
                <div className={styles.dailyRewardCard}>
                  <div className={styles.dailyRewardGlow}></div>
                  <div className={styles.dailyRewardHeader}>
                    <div className={styles.dailyRewardIconWrapper}>
                      <span className={styles.dailyRewardIcon}>🎁</span>
                      <div className={`${styles.dailyRewardSparkle} ${styles['dailyRewardSparkle--1']}`}>✨</div>
                      <div className={`${styles.dailyRewardSparkle} ${styles['dailyRewardSparkle--2']}`}>✨</div>
                      <div className={`${styles.dailyRewardSparkle} ${styles['dailyRewardSparkle--3']}`}>✨</div>
                    </div>
                    <div className={styles.dailyRewardInfo}>
                      <h2 className={styles.dailyRewardTitle}>Daily Reward</h2>
                      <p className={styles.dailyRewardDescription}>
                        Claim your free 100 coins every 24 hours!
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={claimDailyReward}
                    className={`${styles.dailyRewardBtn} ${canClaimDaily ? styles['dailyRewardBtn--available'] : styles['dailyRewardBtn--claimed']}`}
                    disabled={!canClaimDaily || loading}
                  >
                    {loading ? (
                      <div className={styles.dailyRewardLoading}>
                        <div className={styles.loadingSpinner}></div>
                        <span>Claiming...</span>
                      </div>
                    ) : canClaimDaily ? (
                      <>
                        <span className={styles.dailyRewardBtnIcon}>🎉</span>
                        <span>Claim 100 Coins</span>
                      </>
                    ) : (
                      <>
                        <span className={styles.dailyRewardBtnIcon}>⏰</span>
                        <span>Next claim in {timeUntilNextClaim || 'calculating...'}</span>
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* Coin Packages */}
              <section className={styles.packagesSection}>
                <div className={styles.packagesHeader}>
                  <h2 className={styles.packagesTitle}>Coin Packages</h2>
                  <p className={styles.packagesSubtitle}>Choose the perfect package for your needs</p>
                </div>
                
                <div className={styles.packagesGrid}>
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`${styles.packageCard} ${pkg.popular ? styles['packageCard--popular'] : ''}`}
                    >
                      {pkg.popular && (
                        <div className={styles.packageRibbon}>
                          <span className={styles.packageRibbonText}>MOST POPULAR</span>
                        </div>
                      )}
                      
                      <div className={styles.packageHeader}>
                        <h3 className={styles.packageName}>{pkg.name}</h3>
                        <p className={styles.packageDescription}>{pkg.description}</p>
                      </div>
                      
                      <div className={styles.packageCoins}>
                        <div className={styles.packageCoinsAmount}>
                          <span className={styles.packageCoinsIcon}>🪙</span>
                          <span className={styles.packageCoinsValue}>{formatNumber(pkg.coins)}</span>
                        </div>
                        <div className={styles.packageCoinsLabel}>API Coins</div>
                      </div>
                      
                      <div className={styles.packagePrice}>
                        <span className={styles.packagePriceCurrency}>$</span>
                        <span className={styles.packagePriceValue}>{pkg.price.toFixed(2)}</span>
                      </div>
                      
                      <ul className={styles.packageFeatures}>
                        {pkg.features.map((feature, index) => (
                          <li key={index} className={styles.packageFeature}>
                            <span className={styles.packageFeatureIcon}>✓</span>
                            <span className={styles.packageFeatureText}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => purchaseCoins(pkg.id)}
                        className={`${styles.packageBtn} ${pkg.popular ? styles['packageBtn--popular'] : ''}`}
                        disabled={purchaseLoading === pkg.id}
                      >
                        {purchaseLoading === pkg.id ? (
                          <div className={styles.packageBtnLoading}>
                            <div className={styles.loadingSpinner}></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            <span className={styles.packageBtnIcon}>🛒</span>
                            <span>Purchase Now</span>
                          </>
                        )}
                      </button>
                      
                      <div className={styles.packageValue}>
                        ${(pkg.price / pkg.coins * 1000).toFixed(2)} per 1,000 coins
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Info Section */}
              <section className={styles.shopInfo}>
                <div className={styles.shopInfoGrid}>
                  <div className={styles.shopInfoCard}>
                    <div className={styles.shopInfoIcon}>🎯</div>
                    <h3 className={styles.shopInfoTitle}>Card Generation</h3>
                    <p className={styles.shopInfoText}>
                      Each card costs 15 coins. Generate unique API combination ideas instantly.
                    </p>
                  </div>
                  <div className={styles.shopInfoCard}>
                    <div className={styles.shopInfoIcon}>🔒</div>
                    <h3 className={styles.shopInfoTitle}>Secure Payments</h3>
                    <p className={styles.shopInfoText}>
                      All transactions are processed securely through Stripe.
                    </p>
                  </div>
                  <div className={styles.shopInfoCard}>
                    <div className={styles.shopInfoIcon}>⚡</div>
                    <h3 className={styles.shopInfoTitle}>Instant Delivery</h3>
                    <p className={styles.shopInfoText}>
                      Coins are added to your account immediately after purchase.
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            /* Transaction History */
            <section className={styles.transactionsSection}>
              <div className={styles.transactionsHeader}>
                <h2 className={styles.transactionsTitle}>Recent Transactions</h2>
                <p className={styles.transactionsSubtitle}>Your last 5 coin transactions</p>
              </div>
              
              {recentTransactions.length > 0 ? (
                <div className={styles.transactionsList}>
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className={styles.transactionItem}>
                      <div className={styles.transactionIcon}>
                        {getTransactionIcon(transaction.transactionType)}
                      </div>
                      <div className={styles.transactionDetails}>
                        <div className={styles.transactionDescription}>
                          {transaction.description}
                        </div>
                        <div className={styles.transactionDate}>
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                      <div className={`${styles.transactionAmount} ${transaction.amount > 0 ? styles['transactionAmount--positive'] : styles['transactionAmount--negative']}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} coins
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.transactionsEmpty}>
                  <div className={styles.transactionsEmptyIcon}>📭</div>
                  <p className={styles.transactionsEmptyText}>No transactions yet</p>
                </div>
              )}
            </section>
          )}

          {/* Payment Security Footer */}
          <footer className={styles.shopFooter}>
            <div className={styles.shopSecurity}>
              <div className={styles.shopSecurityBadges}>
                <div className={styles.securityBadge}>
                  <svg className={styles.securityBadgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className={styles.securityBadge}>
                  <svg className={styles.securityBadgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Powered by Stripe</span>
                </div>
              </div>
              <p className={styles.shopSecurityText}>
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </AuthGuard>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};