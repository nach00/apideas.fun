# CLAUDE.md - APIdeas v4

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

APIdeas v4 is a **unified, single-directory** implementation of the API combination card game. Users spend coins to generate "cards" that represent creative app ideas combining exactly 2 APIs, presented in a Pokemon-style trading card format. 

**This version prioritizes deployment simplicity with a single application directory containing both frontend and backend components.**

## 🚨 CRITICAL CHANGE FOR V4 - UNIFIED ARCHITECTURE

### New Unified Directory Structure (MANDATORY)
- **REQUIRED**: Single main directory containing both frontend and backend
- **FORBIDDEN**: Separate frontend/ and backend/ directories
- **REASON**: Heroku deployment issues with subdirectory buildpacks
- **GOAL**: Deploy as a single Heroku app without subdirectory complications

### Technology Stack for Unified Architecture
- **Primary Framework**: Next.js 14+ (Full-Stack)
- **Backend**: Next.js API routes (NOT separate Rails app)
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: NextAuth.js with JWT strategy
- **Styling**: Custom CSS only (no frameworks)
- **TypeScript**: Strict mode, no `any` types
- **Payment**: Stripe integration
- **Deployment**: Single Heroku app

## Critical Development Constraints (MANDATORY)

### Authentication Requirements (MANDATORY)
- **MUST follow REQUIREMENTS.md patterns** - These are non-negotiable requirements based on hard-learned lessons
- **Single AuthService singleton** - ONE centralized service manages all authentication
- **No component-level auth logic** - Components ONLY read authentication state
- **Graceful error handling** - Network errors don't immediately clear authentication
- **Request deduplication** - Prevent concurrent authentication operations
- **Explicit state machine** - UNKNOWN → CHECKING → AUTHENTICATED/UNAUTHENTICATED/ERROR

### Styling Constraints (MANDATORY)
- **FORBIDDEN**: All CSS frameworks (Bootstrap, Tailwind, Material-UI, etc.)
- **FORBIDDEN**: All UI component libraries (shadcn/ui, Chakra, Ant Design, etc.)
- **REQUIRED**: 100% custom CSS written from scratch
- **APPROACH**: CSS modules, styled-components, or vanilla CSS only
- **DESIGN**: Pokemon-style cards with rarity-based borders and glow effects

### TypeScript Constraints (MANDATORY)
- **FORBIDDEN**: Use of `any` type anywhere in the codebase
- **REQUIRED**: TypeScript strict mode enabled
- **REQUIRED**: Explicit types for all functions and variables
- **ALTERNATIVES**: Use `unknown`, generics, or specific types instead of `any`

### Data Constraints (MANDATORY)
- **APIs**: Exactly 20 from top20apis.json - no more, no less
- **Card Combinations**: Only 190 from duos.json - no AI generation
- **Card APIs**: Exactly 2 APIs per card - no 3+ API combinations
- **No user-generated content**
- **No social features**

## Unified Application Structure

### Recommended Directory Structure
```
v4/
├── components/
│   ├── Card.tsx
│   ├── Navbar.tsx
│   └── auth/
│       └── AuthGuard.tsx
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   ├── cards/
│   │   ├── economy/
│   │   ├── shop/
│   │   └── admin/
│   ├── _app.tsx
│   ├── index.tsx (Landing)
│   ├── dashboard.tsx
│   ├── apis.tsx
│   ├── settings.tsx
│   ├── collection.tsx
│   ├── card/[id].tsx
│   ├── shop.tsx
│   └── admin.tsx
├── lib/
│   ├── auth.ts (AuthService)
│   ├── database.ts
│   └── stripe.ts
├── styles/
│   ├── globals.css
│   └── components/
├── data/
│   ├── duos.json
│   └── top20apis.json
├── prisma/
│   └── schema.prisma
├── package.json
├── next.config.js
└── tsconfig.json
```

### 8 Required Pages (EXACT - No More, No Less)
1. **Landing Page** (`/`) - Public homepage with login/register forms, demo cards
2. **Dashboard Page** (`/dashboard`) - Main authenticated interface with "Draw New Card" button
3. **API List Page** (`/apis`) - Browse and manage exactly 20 APIs with lock/ignore preferences
4. **Settings Page** (`/settings`) - Account settings, reset deck, delete account
5. **Collection Page** (`/collection`) - User's card collection with filtering and sorting
6. **Card Details Page** (`/card/[id]`) - Individual card view with all sections
7. **Shop Page** (`/shop`) - Coin management, daily rewards, purchase packages
8. **Admin Page** (`/admin`) - Administrative functions (admin role only)

### Core Components (ONLY 2 Required)
1. **Card Component**: Pokemon card inspired styling with:
   - Card title, industry badge, API badges (2 APIs)
   - Rating display, rarity indicator (border color/glow)
   - Action buttons: Save, Favorite, View Details
   - Rarity-based styling: Common (Gray) → Legendary (Gold + glow)

2. **Navbar Component**: Fixed top navigation with:
   - Logo, Dashboard, API List links
   - Coin Balance display, Shop Button CTA
   - Username dropdown (Settings, Logout)
   - Admin link (conditional for admin users)

## Database Schema (Prisma)

### Core Models
```prisma
model User {
  id                    String   @id @default(cuid())
  email                 String   @unique
  username              String   @unique
  hashedPassword        String?
  coinBalance           Int      @default(200)
  dailyCoinsClaimedAt   DateTime?
  role                  String   @default("user")
  oauthProvider         String?
  oauthUid              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  cards                 Card[]
  userPreferences       UserPreference[]
  coinTransactions      CoinTransaction[]
}

model Card {
  id                    String   @id @default(cuid())
  userId                String
  combinationKey        String
  apis                  String[]
  title                 String
  subtitle              String
  industry              String
  problem               String?
  solution              String?
  implementation        String?
  marketOpportunity     String?
  summary               String?
  rating                Float
  feasibility           String
  complexity            String
  rarity                String
  saved                 Boolean  @default(false)
  favorited             Boolean  @default(false)
  generationSource      String   @default("precurated")
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Api {
  id                    String   @id @default(cuid())
  name                  String   @unique
  category              String
  description           String
  documentationUrl      String
  freeTierInfo          String?
  popularityScore       Int      @default(0)
  active                Boolean  @default(true)
  
  userPreferences       UserPreference[]
}

model UserPreference {
  id                    String   @id @default(cuid())
  userId                String
  apiId                 String
  preferenceType        String
  createdAt             DateTime @default(now())
  
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  api                   Api      @relation(fields: [apiId], references: [id], onDelete: Cascade)
  
  @@unique([userId, apiId])
}

model CoinTransaction {
  id                    String   @id @default(cuid())
  userId                String
  transactionType       String
  amount                Int
  description           String
  referenceType         String?
  referenceId           String?
  createdAt             DateTime @default(now())
  
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoints (Next.js API Routes)

### Authentication (NextAuth.js)
```
POST /api/auth/register - User registration
POST /api/auth/login - User login  
DELETE /api/auth/logout - User logout
GET /api/auth/me - Current user info
POST /api/auth/refresh - Token refresh
```

### Cards
```
GET /api/cards - Get user's card collection
POST /api/cards/generate - Generate new card (costs 15 coins)
GET /api/cards/[id] - Get specific card
PATCH /api/cards/[id] - Update card (save/favorite)
DELETE /api/cards/[id] - Delete card
```

### Economy
```
GET /api/economy/balance - Current coin balance
POST /api/economy/claim_daily - Claim daily coins (100 coins)
GET /api/economy/transactions - Transaction history
```

### Shop (Stripe Integration)
```
GET /api/shop/packages - Available coin packages
POST /api/shop/purchase - Purchase coins (Stripe webhook)
```

### Admin
```
GET /api/admin/apis - CRUD for 20 APIs
GET /api/admin/stats - Global statistics
GET /api/admin/cards - All cards management
GET /api/admin/users - User role management
```

## Core Business Logic

### Card Generation System (CRITICAL FLOW)
**Data Source**: ONLY duos.json (190 pre-curated combinations) - NO AI
1. User clicks "Draw New Card" 
2. Validate user has ≥15 coins
3. Check user API preferences (locked/ignored)
4. Select random combination from duos.json respecting preferences
5. Deduct 15 coins from user balance
6. Create card record with auto-calculated rarity
7. Display card with animation
8. Add to user's deck

### Rarity System (AUTOMATIC CALCULATION)
**Based on rating score (0.0-1.0) from duos.json:**
- **Common**: 0.0-0.7 rating → Gray border (#6B7280) 
- **Uncommon**: 0.7-0.85 rating → Green border (#10B981)
- **Rare**: 0.85-0.95 rating → Blue border (#3B82F6)
- **Epic**: 0.95-0.98 rating → Purple border (#8B5CF6)
- **Legendary**: 0.98-1.0 rating → Gold border (#F59E0B) + glow effect
- **Implementation**: Rarity calculated automatically - developers never manually set

### Coin Economy (EXACT VALUES)
- **Starting Balance**: 200 coins
- **Daily Rewards**: 100 coins (claimable once per 24 hours)
- **Generation Cost**: 15 coins per card
- **Purchase Packages** (Stripe configured):
  - $0.99 = 500 coins (Starter Pack)
  - $4.99 = 3,000 coins (Popular Pack) 
  - $19.99 = 15,000 coins (Best Value)

### API Management (STRICT CONSTRAINTS)
- **Source**: top20apis.json (exactly 20 APIs - no more, no less)
- **Lock**: Always include this API in generations (max 5 locked per user)
- **Ignore**: Never include this API in generations (min 10 available)

## Authentication Implementation (NextAuth.js)

### Required AuthService Pattern
```typescript
// REQUIRED: Singleton AuthService pattern adapted for NextAuth.js
class AuthService {
  private static instance: AuthService;
  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  // State machine: UNKNOWN → CHECKING → AUTHENTICATED/UNAUTHENTICATED
  private state: AuthState = 'UNKNOWN';
  
  // Deduplication: prevent concurrent validations
  private validationPromise: Promise<boolean> | null = null;
  
  // NextAuth.js integration
  async initialize() {
    const session = await getSession();
    this.state = session ? 'AUTHENTICATED' : 'UNAUTHENTICATED';
  }
}
```

### NextAuth Configuration
```typescript
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Custom authentication logic
        const user = await authenticateUser(credentials);
        return user ? { id: user.id, email: user.email, username: user.username } : null;
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.coinBalance = user.coinBalance;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.coinBalance = token.coinBalance;
      return session;
    }
  }
});
```

## Custom CSS Architecture

### CSS Variables for Rarity System
```css
/* globals.css */
:root {
  --rarity-common: #6B7280;
  --rarity-uncommon: #10B981;
  --rarity-rare: #3B82F6;
  --rarity-epic: #8B5CF6;
  --rarity-legendary: #F59E0B;
  
  --color-primary: #3B82F6;
  --color-secondary: #6B7280;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-background: #FFFFFF;
  --color-text: #1F2937;
  
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-heading: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-card: 'Orbitron', 'Exo', sans-serif;
  
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
}

/* Pokemon-style card with glow effect for legendary */
.card--legendary {
  border-color: var(--rarity-legendary);
  box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3),
              0 0 20px rgba(245, 158, 11, 0.4);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3); }
  to { box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3), 0 0 30px rgba(245, 158, 11, 0.6); }
}
```

## Development Setup

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-secret"
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Development Commands
```bash
# Install dependencies
npm install

# Database setup
npx prisma migrate dev
npx prisma db seed

# Development server
npm run dev

# Build and type checking
npm run build
npm run typecheck

# Linting
npm run lint
```

## Payment Integration (Stripe)

### Configuration
- **Test Keys Provided**: Already configured in environment
- **Publishable**: `pk_test_51RZQ54P3qZlNzvVSVQfyhLihsvi2jarIH3xnaFB2bNjXvexUhs0Ji6Kvw08UADwlazoRaBDPZJNSMW2wFSnf43F200YJ6wHsmO`
- **Webhook**: `whsec_ccounoYUtm4fBor6ImHR14ObbcF53LoK`

### Implementation
```typescript
// pages/api/shop/purchase.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { priceId } = req.body;
    const session = await getSession({ req });
    
    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${req.headers.origin}/shop?success=true`,
      cancel_url: `${req.headers.origin}/shop?canceled=true`,
      metadata: { userId: session.user.id },
    });
    
    res.json({ id: stripeSession.id });
  }
}
```

## Critical Data Sources (STATIC - NO AI GENERATION)

### duos.json (190 Combinations)
**ONLY DATA SOURCE for card generation:**
- Pre-curated 2-API combinations with complete app ideas
- Each entry contains: title, subtitle, industry, problem, solution, implementation, market_opportunity
- Rating scores (0.0-1.0) for automatic rarity calculation
- Example: Stripe + Twilio = "PayAlert Pro" (rating: 0.97 = Legendary)

### top20apis.json (Exactly 20 APIs)
**COMPLETE API LIST - no additions/removals allowed:**
- OpenWeatherMap, NASA, Unsplash, GitHub, Stripe, Twilio, GIPHY, Spotify
- Fake Store, REST Countries, Open Food Facts, The Dog API, Chuck Norris Jokes
- TV Maze, CoinGecko, JSONPlaceholder, Pexels, Mapbox, WordsAPI, OMDb
- Each with: name, category, description, free_tier info, features, documentation URL

## Deployment Configuration

### Single Heroku App Deployment
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start -p $PORT",
    "heroku-postbuild": "npm run build"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### Heroku Configuration
- **Buildpack**: Node.js (auto-detected)
- **Database**: Heroku Postgres addon
- **Environment**: Production environment variables
- **Domain**: Custom domain when ready

## Critical Constraints (MANDATORY - NO EXCEPTIONS)

### What NOT to Include
- ❌ **No AI integration** (only duos.json data)
- ❌ **No social features** (sharing, following, comments)
- ❌ **No 3+ API combinations** (exactly 2 APIs per card)
- ❌ **No CSS frameworks** (Bootstrap, Tailwind, Material-UI, etc.)
- ❌ **No UI component libraries** (shadcn/ui, Chakra, Ant Design, etc.)
- ❌ **No `any` types** in TypeScript code
- ❌ **No email verification** (basic implementation only)
- ❌ **No card trading** or marketplace features
- ❌ **No achievements** or leaderboards
- ❌ **No separate frontend/backend directories**

### Development Boundaries
- **Architecture**: Single Next.js application (no Rails)
- **Pages**: Exactly 8 pages (see specification)
- **APIs**: Exactly 20 from top20apis.json
- **Combinations**: Only 190 from duos.json
- **Components**: Only Card and Navbar components required
- **Styling**: 100% custom CSS written from scratch
- **Types**: Strict TypeScript with no `any` usage
- **Deployment**: Single Heroku app

## Success Criteria

**Application is feature-complete when:**
- All 8 pages implemented with correct functionality
- Card generation from duos.json working with coin deduction
- Rarity system automatically calculating from ratings
- Stripe integration working for coin purchases
- Custom CSS implementing Pokemon-style design
- No TypeScript `any` types in codebase
- All constraints properly enforced
- **Single directory deployment to Heroku works without subdirectory buildpacks**

## Migration from V3 to V4

### Key Changes
1. **Consolidate Rails backend** → Next.js API routes
2. **Remove separate directories** → Single unified structure
3. **Replace Devise/JWT** → NextAuth.js
4. **Convert Ruby models** → Prisma schema
5. **Merge frontend/backend** → Single Next.js app
6. **Simplify deployment** → Single Heroku buildpack

### Files to Copy
- `duos.json` - Critical card combination data
- `top20apis.json` - API definitions
- Frontend components (adapt for unified structure)
- CSS styles (keep custom styling)
- Database schema (convert to Prisma)

This unified architecture prioritizes **deployment simplicity and maintainability** while preserving all core functionality and constraints from v3.