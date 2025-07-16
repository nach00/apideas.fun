import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import styles from './layout-test.module.css'

// All 20 APIs with emojis - matching CardGenerator exactly
const ALL_APIS = [
  { id: "openweather", name: "OpenWeatherMap", emoji: "🌤" },
  { id: "nasa", name: "NASA", emoji: "🚀" },
  { id: "unsplash", name: "Unsplash", emoji: "📸" },
  { id: "github", name: "GitHub", emoji: "⚡" },
  { id: "stripe", name: "Stripe", emoji: "💳" },
  { id: "twilio", name: "Twilio", emoji: "📱" },
  { id: "giphy", name: "GIPHY", emoji: "🎭" },
  { id: "spotify", name: "Spotify", emoji: "🎵" },
  { id: "fakestore", name: "Fake Store", emoji: "🛍" },
  { id: "countries", name: "REST Countries", emoji: "🌍" },
  { id: "food", name: "Open Food Facts", emoji: "🍔" },
  { id: "dogs", name: "The Dog API", emoji: "🐕" },
  { id: "chuck", name: "Chuck Norris Jokes", emoji: "💪" },
  { id: "tvmaze", name: "TV Maze", emoji: "📺" },
  { id: "coingecko", name: "CoinGecko", emoji: "🪙" },
  { id: "json", name: "JSONPlaceholder", emoji: "🔧" },
  { id: "pexels", name: "Pexels", emoji: "🎥" },
  { id: "mapbox", name: "Mapbox", emoji: "🗺" },
  { id: "words", name: "WordsAPI", emoji: "📚" },
  { id: "omdb", name: "OMDb", emoji: "🎬" },
]

// Sample card data
const sampleCard = {
  id: 'sample-1',
  title: 'PayAlert Pro',
  subtitle: 'Real-time payment notifications',
  industry: 'FinTech',
  apis: ['Stripe', 'Twilio'],
  rating: 0.97,
  rarity: 'Legendary',
  saved: false,
  favorited: false,
  summary: 'Real-time SMS notifications for payment events. Track transactions, failed payments, and subscription updates instantly.',
  problem: 'Businesses lose revenue when payment failures go unnoticed, leading to delayed responses and customer churn.',
  solution: 'Instant SMS alerts for all payment events, enabling immediate action on failed transactions and proactive customer communication.',
  implementation: 'Stripe webhooks trigger Twilio SMS notifications for payment events, with customizable alert rules and escalation paths.',
  marketOpportunity: 'Payment processing market worth $87B with 15% annual growth. SMS notification services growing at 20% annually.',
  feasibility: 'High',
  complexity: 'Medium'
}

const layouts = [
  {
    id: 'horizontal',
    name: 'Horizontal Split',
    description: 'Side-by-side layout with content on left, demo on right'
  },
  {
    id: 'vertical',
    name: 'Vertical Stack',
    description: 'Stacked layout with content above demo'
  },
  {
    id: 'centered',
    name: 'Centered Focus',
    description: 'Centered content with demo below'
  },
  {
    id: 'asymmetric',
    name: 'Asymmetric Grid',
    description: 'Uneven columns with emphasis on content'
  },
  {
    id: 'card-focus',
    name: 'Card-Focused',
    description: 'Large card display with compact API grid'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Maximum whitespace with minimal elements'
  },
  {
    id: 'floating-card',
    name: 'Floating Card',
    description: 'Card floats over API grid with depth and shadow'
  },
  {
    id: 'perspective-overlap',
    name: 'Perspective Overlap',
    description: 'Card appears to emerge from API grid in 3D space'
  },
  {
    id: 'corner-overlay',
    name: 'Corner Overlay',
    description: 'Card positioned at corner overlapping grid partially'
  },
  {
    id: 'center-breakthrough',
    name: 'Center Breakthrough',
    description: 'Card breaks through center of API grid dramatically'
  },
  {
    id: 'diagonal-split',
    name: 'Diagonal Split',
    description: 'Diagonal layout with card overlapping at intersection'
  },
  {
    id: 'layered-stack',
    name: 'Layered Stack',
    description: 'Multiple depth layers with card floating above'
  },
  {
    id: 'masonry-overlap',
    name: 'Masonry Overlap',
    description: 'Masonry grid with card overlaying key position'
  },
  {
    id: 'spiral-emergence',
    name: 'Spiral Emergence',
    description: 'APIs spiral around emerging card in center'
  },
  {
    id: 'side-breakthrough',
    name: 'Side Breakthrough',
    description: 'Card slides in from side overlapping grid edge'
  },
  {
    id: 'hero-composite',
    name: 'Hero Composite',
    description: 'Full-width hero with card and grid as background elements'
  },
  {
    id: 'magazine-layout',
    name: 'Magazine Layout',
    description: 'Editorial style with card as featured element over grid'
  },
  {
    id: 'portal-effect',
    name: 'Portal Effect',
    description: 'Card appears to portal through API grid opening'
  },
  {
    id: 'cascading-depth',
    name: 'Cascading Depth',
    description: 'Multiple cards cascade over grid with depth layers'
  },
  {
    id: 'split-screen-overlap',
    name: 'Split Screen Overlap',
    description: 'Split screen with card bridging both sections'
  },
  {
    id: 'geometric-intersection',
    name: 'Geometric Intersection',
    description: 'Card intersects with geometric grid patterns'
  },
  {
    id: 'floating-islands',
    name: 'Floating Islands',
    description: 'Card and API clusters float as separate islands'
  },
  {
    id: 'hexagon-grid',
    name: 'Hexagon Grid',
    description: 'Honeycomb hexagonal API grid with card emerging from center'
  },
  {
    id: 'parallax-depth',
    name: 'Parallax Depth',
    description: 'Multi-layer parallax scrolling with card floating above'
  },
  {
    id: 'card-flip-reveal',
    name: 'Card Flip Reveal',
    description: 'APIs flip to reveal card like a magic trick'
  },
  {
    id: 'orbit-system',
    name: 'Orbit System',
    description: 'APIs orbit around central card like planetary system'
  },
  {
    id: 'glass-morphism',
    name: 'Glass Morphism',
    description: 'Frosted glass card over blurred API background'
  },
  {
    id: 'mosaic-breakout',
    name: 'Mosaic Breakout',
    description: 'Card breaks out of mosaic pattern like shattered glass'
  },
  {
    id: 'accordion-expand',
    name: 'Accordion Expand',
    description: 'Content accordion expands to reveal card and APIs'
  },
  {
    id: 'wave-interference',
    name: 'Wave Interference',
    description: 'Ripple waves emanate from card intersecting with APIs'
  },
  {
    id: 'hologram-projection',
    name: 'Hologram Projection',
    description: 'Holographic card projects above futuristic API grid'
  },
  {
    id: 'magnetic-field',
    name: 'Magnetic Field',
    description: 'APIs bend and distort around magnetic card field'
  },
  {
    id: 'pure-left-right',
    name: 'Pure Left-Right',
    description: 'Card left, API grid right - clean split'
  },
  {
    id: 'pure-top-bottom',
    name: 'Pure Top-Bottom',
    description: 'Card above, API grid below - vertical stack'
  },
  {
    id: 'pure-card-dominant',
    name: 'Pure Card Dominant',
    description: 'Large card with small API grid corner'
  },
  {
    id: 'pure-grid-dominant',
    name: 'Pure Grid Dominant',
    description: 'Large API grid with floating card overlay'
  },
  {
    id: 'pure-diagonal',
    name: 'Pure Diagonal',
    description: 'Card and grid split diagonally'
  },
  {
    id: 'pure-circular',
    name: 'Pure Circular',
    description: 'Card centered, APIs arranged in circle around it'
  },
  {
    id: 'pure-spiral',
    name: 'Pure Spiral',
    description: 'APIs spiral outward from central card'
  },
  {
    id: 'pure-alternating',
    name: 'Pure Alternating',
    description: 'Card and APIs in alternating bands'
  },
  {
    id: 'pure-corner-focus',
    name: 'Pure Corner Focus',
    description: 'Card in corner, APIs fill remaining space'
  },
  {
    id: 'pure-scale-comparison',
    name: 'Pure Scale Comparison',
    description: 'Multiple sized cards vs API grid proportions'
  }
]

const headlines = [
  "Stop Building Apps That Nobody Downloads",
  "The App Idea That Changes Everything", 
  "Turn Ideas Into Income",
  "Your Next Million-Dollar App Starts Here",
  "Skip The Guesswork. Build What Sells."
]

const subheadlines = [
  "Every idea here already has desperate customers. Every blueprint guarantees demand. Every launch prints money.",
  "While others struggle with 'what to build,' you'll have a portfolio of battle-tested ideas ready to launch.",
  "Skip the guesswork. Build apps that users actually want and businesses actually buy.",
  "Proven combinations that solve real problems people pay to fix.",
  "Stop wasting months on apps that fail. Build what customers are desperately waiting for."
]

const ctas = [
  "Claim Your Ideas",
  "Beat Them To Market", 
  "Unlock The Vault",
  "Show Me The Ideas",
  "Get Instant Access"
]

export default function LayoutTest(): JSX.Element {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedLayout, setSelectedLayout] = useState('horizontal')
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [subheadlineIndex, setSubheadlineIndex] = useState(0)
  const [ctaIndex, setCTAIndex] = useState(0)

  // Redirect authenticated users
  if (session) {
    router.push('/dashboard')
    return <div>Redirecting...</div>
  }

  const renderAPIGrid = () => (
    <div className={styles.apiGrid}>
      {ALL_APIS.slice(0, 12).map((api, index) => (
        <div key={api.id} className={styles.apiTile}>
          <span className={styles.apiEmoji}>{api.emoji}</span>
          <span className={styles.apiName}>{api.name}</span>
        </div>
      ))}
    </div>
  )

  const renderCard = () => (
    <div className={styles.cardContainer}>
      <Card card={sampleCard} />
    </div>
  )

  const renderContent = () => (
    <div className={styles.content}>
      <h1 className={styles.headline}>
        {headlines[headlineIndex]}
      </h1>
      <p className={styles.subheadline}>
        {subheadlines[subheadlineIndex]}
      </p>
      <Link href="/api/auth/signin" className={styles.cta}>
        {ctas[ctaIndex]}
      </Link>
    </div>
  )

  const renderLayout = () => {
    switch (selectedLayout) {
      case 'horizontal':
        return (
          <div className={styles.horizontalLayout}>
            <div className={styles.leftColumn}>
              {renderContent()}
            </div>
            <div className={styles.rightColumn}>
              <div className={styles.demoSection}>
                <h3 className={styles.demoTitle}>Live Demo</h3>
                {renderAPIGrid()}
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'vertical':
        return (
          <div className={styles.verticalLayout}>
            {renderContent()}
            <div className={styles.demoSection}>
              <h3 className={styles.demoTitle}>See It In Action</h3>
              <div className={styles.demoGrid}>
                <div className={styles.apiGridSection}>
                  {renderAPIGrid()}
                </div>
                <div className={styles.cardSection}>
                  {renderCard()}
                </div>
              </div>
            </div>
          </div>
        )

      case 'centered':
        return (
          <div className={styles.centeredLayout}>
            <div className={styles.centeredContent}>
              {renderContent()}
            </div>
            <div className={styles.centeredDemo}>
              <div className={styles.demoRow}>
                {renderAPIGrid()}
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'asymmetric':
        return (
          <div className={styles.asymmetricLayout}>
            <div className={styles.mainContent}>
              {renderContent()}
            </div>
            <div className={styles.sideDemo}>
              <div className={styles.compactDemo}>
                <h4 className={styles.compactTitle}>Quick Preview</h4>
                {renderAPIGrid()}
                <div className={styles.miniCard}>
                  {renderCard()}
                </div>
              </div>
            </div>
          </div>
        )

      case 'card-focus':
        return (
          <div className={styles.cardFocusLayout}>
            <div className={styles.topContent}>
              {renderContent()}
            </div>
            <div className={styles.focusDemo}>
              <div className={styles.featuredCard}>
                {renderCard()}
              </div>
              <div className={styles.compactGrid}>
                {renderAPIGrid()}
              </div>
            </div>
          </div>
        )

      case 'minimal':
        return (
          <div className={styles.minimalLayout}>
            <div className={styles.minimalContent}>
              {renderContent()}
            </div>
            <div className={styles.minimalDemo}>
              <div className={styles.subtleGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.elegantCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'floating-card':
        return (
          <div className={styles.floatingCardLayout}>
            <div className={styles.floatingContent}>
              {renderContent()}
            </div>
            <div className={styles.floatingDemo}>
              <div className={styles.backgroundGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.overlayCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'perspective-overlap':
        return (
          <div className={styles.perspectiveLayout}>
            <div className={styles.perspectiveContent}>
              {renderContent()}
            </div>
            <div className={styles.perspectiveDemo}>
              <div className={styles.perspectiveGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.emergingCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'corner-overlay':
        return (
          <div className={styles.cornerLayout}>
            <div className={styles.cornerContent}>
              {renderContent()}
            </div>
            <div className={styles.cornerDemo}>
              <div className={styles.cornerGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.cornerCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'center-breakthrough':
        return (
          <div className={styles.breakthroughLayout}>
            <div className={styles.breakthroughContent}>
              {renderContent()}
            </div>
            <div className={styles.breakthroughDemo}>
              <div className={styles.breakthroughGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.breakthroughCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'diagonal-split':
        return (
          <div className={styles.diagonalLayout}>
            <div className={styles.diagonalContent}>
              {renderContent()}
            </div>
            <div className={styles.diagonalDemo}>
              <div className={styles.diagonalGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.diagonalCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'layered-stack':
        return (
          <div className={styles.layeredLayout}>
            <div className={styles.layeredContent}>
              {renderContent()}
            </div>
            <div className={styles.layeredDemo}>
              <div className={styles.layeredGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.layeredCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'masonry-overlap':
        return (
          <div className={styles.masonryLayout}>
            <div className={styles.masonryContent}>
              {renderContent()}
            </div>
            <div className={styles.masonryDemo}>
              <div className={styles.masonryGrid}>
                {ALL_APIS.slice(0, 15).map((api, index) => (
                  <div key={api.id} className={`${styles.masonryTile} ${styles[`tile${index % 3}`]}`}>
                    <span className={styles.apiEmoji}>{api.emoji}</span>
                    <span className={styles.apiName}>{api.name}</span>
                  </div>
                ))}
              </div>
              <div className={styles.masonryCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'spiral-emergence':
        return (
          <div className={styles.spiralLayout}>
            <div className={styles.spiralContent}>
              {renderContent()}
            </div>
            <div className={styles.spiralDemo}>
              <div className={styles.spiralGrid}>
                {ALL_APIS.slice(0, 12).map((api, index) => (
                  <div key={api.id} className={`${styles.spiralTile} ${styles[`spiral${index}`]}`}>
                    <span className={styles.apiEmoji}>{api.emoji}</span>
                    <span className={styles.apiName}>{api.name}</span>
                  </div>
                ))}
              </div>
              <div className={styles.spiralCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'side-breakthrough':
        return (
          <div className={styles.sideBreakthroughLayout}>
            <div className={styles.sideContent}>
              {renderContent()}
            </div>
            <div className={styles.sideDemo}>
              <div className={styles.sideGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.sideCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'hero-composite':
        return (
          <div className={styles.heroCompositeLayout}>
            <div className={styles.heroBackground}>
              <div className={styles.heroGrid}>
                {renderAPIGrid()}
              </div>
            </div>
            <div className={styles.heroForeground}>
              <div className={styles.heroContent}>
                {renderContent()}
              </div>
              <div className={styles.heroCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'magazine-layout':
        return (
          <div className={styles.magazineLayout}>
            <div className={styles.magazineContent}>
              {renderContent()}
            </div>
            <div className={styles.magazineDemo}>
              <div className={styles.magazineGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.magazineCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'portal-effect':
        return (
          <div className={styles.portalLayout}>
            <div className={styles.portalContent}>
              {renderContent()}
            </div>
            <div className={styles.portalDemo}>
              <div className={styles.portalGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.portalCard}>
                {renderCard()}
              </div>
              <div className={styles.portalRing}></div>
            </div>
          </div>
        )

      case 'cascading-depth':
        return (
          <div className={styles.cascadingLayout}>
            <div className={styles.cascadingContent}>
              {renderContent()}
            </div>
            <div className={styles.cascadingDemo}>
              <div className={styles.cascadingGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.cascadingCards}>
                <div className={styles.cardLayer1}>{renderCard()}</div>
                <div className={styles.cardLayer2}>{renderCard()}</div>
                <div className={styles.cardLayer3}>{renderCard()}</div>
              </div>
            </div>
          </div>
        )

      case 'split-screen-overlap':
        return (
          <div className={styles.splitScreenLayout}>
            <div className={styles.splitLeft}>
              {renderContent()}
            </div>
            <div className={styles.splitRight}>
              <div className={styles.splitGrid}>
                {renderAPIGrid()}
              </div>
            </div>
            <div className={styles.bridgeCard}>
              {renderCard()}
            </div>
          </div>
        )

      case 'geometric-intersection':
        return (
          <div className={styles.geometricLayout}>
            <div className={styles.geometricContent}>
              {renderContent()}
            </div>
            <div className={styles.geometricDemo}>
              <div className={styles.geometricShapes}>
                <div className={styles.shape1}></div>
                <div className={styles.shape2}></div>
                <div className={styles.shape3}></div>
              </div>
              <div className={styles.geometricGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.geometricCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'floating-islands':
        return (
          <div className={styles.islandsLayout}>
            <div className={styles.islandsContent}>
              {renderContent()}
            </div>
            <div className={styles.islandsDemo}>
              <div className={styles.island1}>
                <div className={styles.islandGrid}>
                  {ALL_APIS.slice(0, 6).map((api, index) => (
                    <div key={api.id} className={styles.islandTile}>
                      <span className={styles.apiEmoji}>{api.emoji}</span>
                      <span className={styles.apiName}>{api.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.island2}>
                <div className={styles.islandGrid}>
                  {ALL_APIS.slice(6, 12).map((api, index) => (
                    <div key={api.id} className={styles.islandTile}>
                      <span className={styles.apiEmoji}>{api.emoji}</span>
                      <span className={styles.apiName}>{api.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.islandCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'hexagon-grid':
        return (
          <div className={styles.hexagonLayout}>
            <div className={styles.hexagonContent}>
              {renderContent()}
            </div>
            <div className={styles.hexagonDemo}>
              <div className={styles.hexagonGrid}>
                {ALL_APIS.slice(0, 12).map((api, index) => (
                  <div key={api.id} className={`${styles.hexagonTile} ${styles[`hex${index}`]}`}>
                    <div className={styles.hexagonInner}>
                      <span className={styles.apiEmoji}>{api.emoji}</span>
                      <span className={styles.apiName}>{api.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.hexagonCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'parallax-depth':
        return (
          <div className={styles.parallaxLayout}>
            <div className={styles.parallaxContent}>
              {renderContent()}
            </div>
            <div className={styles.parallaxDemo}>
              <div className={styles.parallaxLayer1}>
                {renderAPIGrid()}
              </div>
              <div className={styles.parallaxLayer2}>
                <div className={styles.parallaxGrid2}>
                  {ALL_APIS.slice(12, 18).map((api, index) => (
                    <div key={api.id} className={styles.apiTile}>
                      <span className={styles.apiEmoji}>{api.emoji}</span>
                      <span className={styles.apiName}>{api.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.parallaxCard}>
                {renderCard()}
              </div>
            </div>
          </div>
        )

      case 'card-flip-reveal':
        return (
          <div className={styles.flipLayout}>
            <div className={styles.flipContent}>
              {renderContent()}
            </div>
            <div className={styles.flipDemo}>
              <div className={styles.flipGrid}>
                {ALL_APIS.slice(0, 9).map((api, index) => (
                  <div key={api.id} className={`${styles.flipTile} ${styles[`flip${index}`]}`}>
                    <div className={styles.flipTileInner}>
                      <div className={styles.flipTileFront}>
                        <span className={styles.apiEmoji}>{api.emoji}</span>
                        <span className={styles.apiName}>{api.name}</span>
                      </div>
                      <div className={styles.flipTileBack}>
                        <div className={styles.cardFragment}>
                          {index === 4 ? renderCard() : <div className={styles.fragmentPlaceholder}>?</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'orbit-system':
        return (
          <div className={styles.orbitLayout}>
            <div className={styles.orbitContent}>
              {renderContent()}
            </div>
            <div className={styles.orbitDemo}>
              <div className={styles.orbitSystem}>
                <div className={styles.centralCard}>
                  {renderCard()}
                </div>
                {ALL_APIS.slice(0, 8).map((api, index) => (
                  <div key={api.id} className={`${styles.orbitingAPI} ${styles[`orbit${index}`]}`}>
                    <span className={styles.apiEmoji}>{api.emoji}</span>
                    <span className={styles.apiName}>{api.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'glass-morphism':
        return (
          <div className={styles.glassLayout}>
            <div className={styles.glassContent}>
              {renderContent()}
            </div>
            <div className={styles.glassDemo}>
              <div className={styles.glassBackground}>
                {renderAPIGrid()}
              </div>
              <div className={styles.glassCard}>
                <div className={styles.glassEffect}>
                  {renderCard()}
                </div>
              </div>
            </div>
          </div>
        )

      case 'mosaic-breakout':
        return (
          <div className={styles.mosaicLayout}>
            <div className={styles.mosaicContent}>
              {renderContent()}
            </div>
            <div className={styles.mosaicDemo}>
              <div className={styles.mosaicGrid}>
                {ALL_APIS.slice(0, 16).map((api, index) => (
                  <div key={api.id} className={`${styles.mosaicTile} ${index === 7 || index === 8 ? styles.broken : ''}`}>
                    <span className={styles.apiEmoji}>{api.emoji}</span>
                    <span className={styles.apiName}>{api.name}</span>
                  </div>
                ))}
              </div>
              <div className={styles.mosaicCard}>
                {renderCard()}
              </div>
              <div className={styles.shatterEffect}></div>
            </div>
          </div>
        )

      case 'accordion-expand':
        return (
          <div className={styles.accordionLayout}>
            <div className={styles.accordionContent}>
              {renderContent()}
            </div>
            <div className={styles.accordionDemo}>
              <div className={styles.accordionSection}>
                <div className={styles.accordionHeader}>APIs</div>
                <div className={styles.accordionBody}>
                  {renderAPIGrid()}
                </div>
              </div>
              <div className={styles.accordionSection}>
                <div className={styles.accordionHeader}>Generated Card</div>
                <div className={styles.accordionBody}>
                  {renderCard()}
                </div>
              </div>
            </div>
          </div>
        )

      case 'wave-interference':
        return (
          <div className={styles.waveLayout}>
            <div className={styles.waveContent}>
              {renderContent()}
            </div>
            <div className={styles.waveDemo}>
              <div className={styles.waveGrid}>
                {renderAPIGrid()}
              </div>
              <div className={styles.waveCard}>
                {renderCard()}
              </div>
              <div className={styles.waveRipples}>
                <div className={styles.ripple1}></div>
                <div className={styles.ripple2}></div>
                <div className={styles.ripple3}></div>
              </div>
            </div>
          </div>
        )

      case 'hologram-projection':
        return (
          <div className={styles.hologramLayout}>
            <div className={styles.hologramContent}>
              {renderContent()}
            </div>
            <div className={styles.hologramDemo}>
              <div className={styles.hologramBase}>
                {renderAPIGrid()}
              </div>
              <div className={styles.hologramCard}>
                <div className={styles.hologramEffect}>
                  {renderCard()}
                </div>
                <div className={styles.hologramLines}></div>
              </div>
            </div>
          </div>
        )

      case 'magnetic-field':
        return (
          <div className={styles.magneticLayout}>
            <div className={styles.magneticContent}>
              {renderContent()}
            </div>
            <div className={styles.magneticDemo}>
              <div className={styles.magneticField}>
                {ALL_APIS.slice(0, 12).map((api, index) => (
                  <div key={api.id} className={`${styles.magneticAPI} ${styles[`magnetic${index}`]}`}>
                    <span className={styles.apiEmoji}>{api.emoji}</span>
                    <span className={styles.apiName}>{api.name}</span>
                  </div>
                ))}
              </div>
              <div className={styles.magneticCard}>
                {renderCard()}
              </div>
              <div className={styles.fieldLines}>
                <div className={styles.fieldLine1}></div>
                <div className={styles.fieldLine2}></div>
                <div className={styles.fieldLine3}></div>
              </div>
            </div>
          </div>
        )

      case 'pure-left-right':
        return (
          <div className={styles.pureLeftRight}>
            <div className={styles.pureCardSection}>
              {renderCard()}
            </div>
            <div className={styles.pureGridSection}>
              {renderAPIGrid()}
            </div>
          </div>
        )

      case 'pure-top-bottom':
        return (
          <div className={styles.pureTopBottom}>
            <div className={styles.pureCardSection}>
              {renderCard()}
            </div>
            <div className={styles.pureGridSection}>
              {renderAPIGrid()}
            </div>
          </div>
        )

      case 'pure-card-dominant':
        return (
          <div className={styles.pureCardDominant}>
            <div className={styles.mainCardArea}>
              {renderCard()}
            </div>
            <div className={styles.miniGridArea}>
              <div className={styles.compactApiGrid}>
                {ALL_APIS.slice(0, 8).map((api, index) => (
                  <div key={api.id} className={styles.miniApiTile}>
                    <span className={styles.apiEmoji}>{api.emoji}</span>
                    <span className={styles.apiName}>{api.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'pure-grid-dominant':
        return (
          <div className={styles.pureGridDominant}>
            <div className={styles.expandedGridArea}>
              <div className={styles.expandedApiGrid}>
                {ALL_APIS.map((api, index) => (
                  <div key={api.id} className={styles.expandedApiTile}>
                    <span className={styles.apiEmoji}>{api.emoji}</span>
                    <span className={styles.apiName}>{api.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.floatingCardArea}>
              {renderCard()}
            </div>
          </div>
        )

      case 'pure-diagonal':
        return (
          <div className={styles.pureDiagonal}>
            <div className={styles.diagonalCardArea}>
              {renderCard()}
            </div>
            <div className={styles.diagonalGridArea}>
              {renderAPIGrid()}
            </div>
          </div>
        )

      case 'pure-circular':
        return (
          <div className={styles.pureCircular}>
            <div className={styles.centralCardArea}>
              {renderCard()}
            </div>
            <div className={styles.circularApiContainer}>
              {ALL_APIS.slice(0, 12).map((api, index) => (
                <div key={api.id} className={`${styles.circularApiTile} ${styles[`circle${index}`]}`}>
                  <span className={styles.apiEmoji}>{api.emoji}</span>
                  <span className={styles.apiName}>{api.name}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'pure-spiral':
        return (
          <div className={styles.pureSpiral}>
            <div className={styles.spiralCenterCard}>
              {renderCard()}
            </div>
            <div className={styles.spiralApiContainer}>
              {ALL_APIS.slice(0, 16).map((api, index) => (
                <div key={api.id} className={`${styles.spiralApiTile} ${styles[`spiralPos${index}`]}`}>
                  <span className={styles.apiEmoji}>{api.emoji}</span>
                  <span className={styles.apiName}>{api.name}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'pure-alternating':
        return (
          <div className={styles.pureAlternating}>
            <div className={styles.alternatingContainer}>
              <div className={styles.bandCard}>
                {renderCard()}
              </div>
              <div className={styles.bandApis}>
                <div className={styles.apiStrip}>
                  {ALL_APIS.slice(0, 6).map((api, index) => (
                    <div key={api.id} className={styles.stripApiTile}>
                      <span className={styles.apiEmoji}>{api.emoji}</span>
                      <span className={styles.apiName}>{api.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.bandApis}>
                <div className={styles.apiStrip}>
                  {ALL_APIS.slice(6, 12).map((api, index) => (
                    <div key={api.id} className={styles.stripApiTile}>
                      <span className={styles.apiEmoji}>{api.emoji}</span>
                      <span className={styles.apiName}>{api.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'pure-corner-focus':
        return (
          <div className={styles.pureCornerFocus}>
            <div className={styles.cornerCard}>
              {renderCard()}
            </div>
            <div className={styles.remainingSpace}>
              <div className={styles.wrappingApiGrid}>
                {ALL_APIS.slice(0, 15).map((api, index) => (
                  <div key={api.id} className={styles.wrappingApiTile}>
                    <span className={styles.apiEmoji}>{api.emoji}</span>
                    <span className={styles.apiName}>{api.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'pure-scale-comparison':
        return (
          <div className={styles.pureScaleComparison}>
            <div className={styles.scaleContainer}>
              <div className={styles.largeCard}>
                <div className={styles.cardScale1}>
                  {renderCard()}
                </div>
              </div>
              <div className={styles.mediumCard}>
                <div className={styles.cardScale2}>
                  {renderCard()}
                </div>
              </div>
              <div className={styles.smallCard}>
                <div className={styles.cardScale3}>
                  {renderCard()}
                </div>
              </div>
              <div className={styles.comparisonGrid}>
                {renderAPIGrid()}
              </div>
            </div>
          </div>
        )

      default:
        return renderContent()
    }
  }

  return (
    <div className={styles.testPage}>
      <Navbar />
      
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlSection}>
          <h3>Layout</h3>
          <div className={styles.layoutButtons}>
            {layouts.map(layout => (
              <button
                key={layout.id}
                className={`${styles.layoutButton} ${selectedLayout === layout.id ? styles.active : ''}`}
                onClick={() => setSelectedLayout(layout.id)}
                title={layout.description}
              >
                {layout.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlSection}>
          <h3>Content Variations</h3>
          <div className={styles.contentControls}>
            <div className={styles.controlGroup}>
              <label>Headline:</label>
              <select value={headlineIndex} onChange={(e) => setHeadlineIndex(Number(e.target.value))}>
                {headlines.map((headline, index) => (
                  <option key={index} value={index}>{headline.slice(0, 30)}...</option>
                ))}
              </select>
            </div>
            
            <div className={styles.controlGroup}>
              <label>Subheadline:</label>
              <select value={subheadlineIndex} onChange={(e) => setSubheadlineIndex(Number(e.target.value))}>
                {subheadlines.map((subheadline, index) => (
                  <option key={index} value={index}>{subheadline.slice(0, 40)}...</option>
                ))}
              </select>
            </div>
            
            <div className={styles.controlGroup}>
              <label>CTA:</label>
              <select value={ctaIndex} onChange={(e) => setCTAIndex(Number(e.target.value))}>
                {ctas.map((cta, index) => (
                  <option key={index} value={index}>{cta}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Preview */}
      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <h2>Layout: {layouts.find(l => l.id === selectedLayout)?.name}</h2>
          <p>{layouts.find(l => l.id === selectedLayout)?.description}</p>
        </div>
        
        <div className={styles.layoutContainer}>
          {renderLayout()}
        </div>
      </div>
    </div>
  )
}