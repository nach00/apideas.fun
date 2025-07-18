import { useState, useEffect, useCallback } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/auth/AuthGuard'
import Card from '@/components/Card'
import styles from './[id].module.css'

interface CardData {
  id: string
  title: string
  subtitle: string
  industry: string
  apis: string | string[]
  rating: number
  rarity: string
  saved: boolean
  favorited: boolean
  problem?: string
  solution?: string
  implementation?: string
  marketOpportunity?: string
  summary?: string
  feasibility?: string
  complexity?: string
  createdAt: string
}

export default function CardDetailPage(): JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const [card, setCard] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCard = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`/api/cards/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCard(data)
      } else {
        setError('Card not found')
      }
    } catch (err) {
      setError('Failed to load card')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchCard()
    }
  }, [id, fetchCard])


  const getRarityColor = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return '#f59e0b'
      case 'epic': return '#8b5cf6'
      case 'rare': return '#3b82f6'
      case 'uncommon': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getApiArray = (apis: string | string[]): string[] => {
    return typeof apis === 'string' ? JSON.parse(apis) : apis
  }

  if (loading) {
    return (
      <AuthGuard requireAuth>
        <Navbar />
        <div className={`${styles.detailPage} ${styles.loading}`}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p>Loading card details...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !card) {
    return (
      <AuthGuard requireAuth>
        <Navbar />
        <div className={`${styles.detailPage} ${styles.error}`}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>😕</div>
            <h1>Card Not Found</h1>
            <p>{error || 'The card you\'re looking for doesn\'t exist.'}</p>
            <div className={styles.errorActions}>
              <button onClick={() => router.back()} className={styles.btnSecondary}>
                Go Back
              </button>
              <Link href="/dashboard" className={styles.btnPrimary}>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth>
      <Navbar />
      <div className={styles.detailPage}>
        <div className={styles.detailContainer}>
          {/* Header */}
          <header className={styles.detailHeader}>
            <div className={styles.headerNav}>
              <button onClick={() => router.back()} className={styles.backButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m0 0l7 7m-7-7l7-7" />
                </svg>
                Back
              </button>
              <div className={styles.breadcrumb}>
                <Link href="/dashboard">Dashboard</Link>
                <span>/</span>
                <span>{card.title}</span>
              </div>
            </div>
            
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <h1 className={styles.cardTitle}>{card.title}</h1>
                <p className={styles.cardSubtitle}>{card.subtitle}</p>
                <div className={styles.cardMeta}>
                  <div className={styles.industryBadge}>{card.industry}</div>
                  <div 
                    className={styles.rarityBadge} 
                    style={{ backgroundColor: getRarityColor(card.rarity) }}
                  >
                    {card.rarity}
                  </div>
                  <div className={styles.ratingBadge}>
                    ⭐ {(card.rating * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content - Responsive Layout */}
          <div className={styles.contentLayout}>
            {/* Left Column - Card Preview */}
            <div className={styles.leftColumn}>
              <div className={styles.cardPreviewSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🎴</span>
                    Card Preview
                  </h2>
                </div>
                <div className={styles.previewContainer}>
                  <Card card={card} />
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className={styles.rightColumn}>
              {/* Overview Section */}
              <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>💡</span>
                    The Idea
                  </h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.ideaDescription}>{card.summary || card.subtitle}</p>
                  
                  {card.problem && (
                    <div className={styles.problemSolution}>
                      <div className={styles.problemStatement}>
                        <h3 className={styles.subsectionTitle}>
                          <span className={styles.subsectionIcon}>🎯</span>
                          Problem Statement
                        </h3>
                        <p>{card.problem}</p>
                      </div>
                    </div>
                  )}

                  {card.solution && (
                    <div className={styles.problemSolution}>
                      <div className={styles.solutionStatement}>
                        <h3 className={styles.subsectionTitle}>
                          <span className={styles.subsectionIcon}>✅</span>
                          Solution Overview
                        </h3>
                        <p>{card.solution}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* API Integration Section */}
              <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🔗</span>
                    API Integration
                  </h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.apiIntegration}>
                    {getApiArray(card.apis).map((api, index) => (
                      <div key={index} className={styles.apiCard}>
                        <div className={styles.apiNumber}>{index + 1}</div>
                        <div className={styles.apiDetails}>
                          <div className={styles.apiName}>{api}</div>
                          <div className={styles.apiRole}>
                            {index === 0 ? 'Primary Service' : 'Secondary Service'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Implementation Section */}
              <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🚀</span>
                    Implementation Guide
                  </h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.implementationSteps}>
                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>1</div>
                      <div className={styles.stepContent}>
                        <h4>Set up API accounts</h4>
                        <p>Register for {getApiArray(card.apis).join(' and ')} developer accounts</p>
                      </div>
                    </div>
                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>2</div>
                      <div className={styles.stepContent}>
                        <h4>Configure authentication</h4>
                        <p>Set up API keys and authentication methods</p>
                      </div>
                    </div>
                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>3</div>
                      <div className={styles.stepContent}>
                        <h4>Build core integration</h4>
                        <p>Implement the main functionality connecting both APIs</p>
                      </div>
                    </div>
                  </div>

                  {card.implementation && (
                    <div className={styles.implementationDetails}>
                      <h3 className={styles.subsectionTitle}>
                        <span className={styles.subsectionIcon}>💻</span>
                        Implementation Details
                      </h3>
                      <div className={styles.codeBlock}>
                        <pre>{card.implementation}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Requirements Section */}
              <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>⚙️</span>
                    Technical Details
                  </h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.technicalGrid}>
                    <div className={styles.techCard}>
                      <h3 className={styles.techCardTitle}>
                        <span className={styles.techCardIcon}>🔧</span>
                        Requirements
                      </h3>
                      <div className={styles.requirementsList}>
                        <div className={styles.requirementItem}>
                          <span className={styles.reqLabel}>Complexity</span>
                          <span className={styles.reqValue}>{card.complexity || 'Medium'}</span>
                        </div>
                        <div className={styles.requirementItem}>
                          <span className={styles.reqLabel}>Feasibility</span>
                          <span className={styles.reqValue}>{card.feasibility || 'High'}</span>
                        </div>
                        <div className={styles.requirementItem}>
                          <span className={styles.reqLabel}>Time to MVP</span>
                          <span className={styles.reqValue}>2-4 weeks</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.techCard}>
                      <h3 className={styles.techCardTitle}>
                        <span className={styles.techCardIcon}>⚡</span>
                        Performance
                      </h3>
                      <div className={styles.metricsList}>
                        <div className={styles.metricItem}>
                          <span className={styles.metricName}>Expected Latency</span>
                          <span className={styles.metricValue}>{'<'}100ms</span>
                        </div>
                        <div className={styles.metricItem}>
                          <span className={styles.metricName}>Throughput</span>
                          <span className={styles.metricValue}>10K+ RPS</span>
                        </div>
                        <div className={styles.metricItem}>
                          <span className={styles.metricName}>Uptime SLA</span>
                          <span className={styles.metricValue}>99.9%</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.techCard}>
                      <h3 className={styles.techCardTitle}>
                        <span className={styles.techCardIcon}>🔒</span>
                        Security
                      </h3>
                      <div className={styles.securityList}>
                        <div className={styles.securityItem}>✅ API key encryption</div>
                        <div className={styles.securityItem}>✅ Rate limiting</div>
                        <div className={styles.securityItem}>✅ Data validation</div>
                        <div className={styles.securityItem}>✅ Error handling</div>
                      </div>
                    </div>

                    <div className={styles.techCard}>
                      <h3 className={styles.techCardTitle}>
                        <span className={styles.techCardIcon}>📦</span>
                        Tech Stack
                      </h3>
                      <div className={styles.techStack}>
                        <div className={styles.techItem}>Node.js / Python</div>
                        <div className={styles.techItem}>Express / FastAPI</div>
                        <div className={styles.techItem}>PostgreSQL / MongoDB</div>
                        <div className={styles.techItem}>Redis Cache</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Analysis Section */}
              <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>📈</span>
                    Market Analysis
                  </h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.marketGrid}>
                    <div className={styles.marketStats}>
                      <div className={styles.marketStat}>
                        <div className={styles.statIcon}>💰</div>
                        <div className={styles.statContent}>
                          <div className={styles.statValue}>{card.marketOpportunity || '$2.1B+'}</div>
                          <div className={styles.statLabel}>Market Size</div>
                        </div>
                      </div>
                      <div className={styles.marketStat}>
                        <div className={styles.statIcon}>🎯</div>
                        <div className={styles.statContent}>
                          <div className={styles.statValue}>{(card.rating * 100).toFixed(0)}%</div>
                          <div className={styles.statLabel}>Success Score</div>
                        </div>
                      </div>
                      <div className={styles.marketStat}>
                        <div className={styles.statIcon}>💎</div>
                        <div className={styles.statContent}>
                          <div className={styles.statValue}>{card.rarity}</div>
                          <div className={styles.statLabel}>Rarity Level</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.industryAnalysis}>
                      <h3 className={styles.subsectionTitle}>
                        <span className={styles.subsectionIcon}>📊</span>
                        Industry Focus
                      </h3>
                      <div className={styles.industryInfo}>
                        <div className={styles.industryTag}>{card.industry}</div>
                        <p>This API combination targets the {card.industry.toLowerCase()} industry, which shows strong growth potential and increasing demand for integrated solutions.</p>
                      </div>
                    </div>

                    <div className={styles.revenueSection}>
                      <h3 className={styles.subsectionTitle}>
                        <span className={styles.subsectionIcon}>💼</span>
                        Revenue Potential
                      </h3>
                      <div className={styles.revenueModels}>
                        <div className={styles.revenueModel}>
                          <h4>Subscription Model</h4>
                          <p>Monthly recurring revenue from API usage tiers</p>
                        </div>
                        <div className={styles.revenueModel}>
                          <h4>Transaction Fees</h4>
                          <p>Small percentage on each API call or transaction</p>
                        </div>
                        <div className={styles.revenueModel}>
                          <h4>Premium Features</h4>
                          <p>Advanced functionality and analytics packages</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className={styles.detailFooter}>
            <div className={styles.footerContent}>
              <div className={styles.generationInfo}>
                <span className={styles.infoLabel}>Generated:</span>
                <span className={styles.infoValue}>
                  {new Date(card.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className={styles.footerActions}>
                <Link href="/shop" className={styles.btnOutline}>
                  Generate More Cards
                </Link>
                <Link href="/dashboard" className={styles.btnPrimary}>
                  Back to Dashboard
                </Link>
              </div>
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