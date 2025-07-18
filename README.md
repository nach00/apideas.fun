# APIdeas v4

A unified Next.js application for generating creative app ideas by combining APIs. Users collect Pokemon-style cards, spend coins, and discover new project concepts.

## 🎮 Features

- **Card Generation**: Generate unique app ideas from 190 pre-curated API combinations
- **Rarity System**: Cards range from Common to Legendary based on their potential rating
- **Coin Economy**: Start with 200 coins, earn 100 daily, purchase more as needed
- **API Management**: Lock favorite APIs or ignore unwanted ones
- **Custom CSS Design**: Pokemon-style cards with rarity-based glow effects
- **Authentication**: NextAuth.js with email/password, GitHub, and Google OAuth
- **Admin Dashboard**: User management and system statistics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Custom CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe (configurable)
- **Deployment**: Heroku-ready configuration

## 🚀 Quick Deploy to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Manual Deployment

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd apideas-v4
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required values:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_URL`: Your app's URL (e.g., https://your-app.herokuapp.com)
   - `NEXTAUTH_SECRET`: Random secret string
   - OAuth credentials (optional): GitHub and Google client IDs/secrets

4. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. **Build and start**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up local database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:3000
   - Login with test@example.com / test123 or create a new account

## 📊 Database Schema

- **Users**: Authentication, coin balance, preferences
- **Cards**: Generated app ideas with ratings and rarity
- **APIs**: 20 available APIs from top20apis.json
- **UserPreferences**: API lock/ignore settings
- **CoinTransactions**: Track coin spending and earning

## 🎯 Core Constraints

- **Exactly 8 pages**: Landing, Dashboard, APIs, Profile, Settings, Shop, Admin, Card Details
- **190 pre-curated combinations**: No AI generation, only duos.json data
- **20 APIs maximum**: Defined in top20apis.json
- **Custom CSS only**: No frameworks like Tailwind or Bootstrap
- **TypeScript strict mode**: No `any` types allowed
- **Single directory deployment**: Unified structure for Heroku

## 💳 Card Generation System

1. User spends 15 coins
2. System selects random combination from duos.json
3. Respects user's API preferences (locked/ignored)
4. Auto-calculates rarity based on rating score
5. Adds card to user's collection

## 🎨 Rarity System

- **Common** (0.0-0.7): Gray border
- **Uncommon** (0.7-0.85): Green border  
- **Rare** (0.85-0.95): Blue border
- **Epic** (0.95-0.98): Purple border
- **Legendary** (0.98-1.0): Gold border + glow animation

## 💰 Coin Economy

- **Starting balance**: 200 coins
- **Daily reward**: 100 coins (once per 24 hours)
- **Card generation**: 15 coins per card
- **Purchase packages**: $0.99, $4.99, $19.99 (via Stripe)

## 🔐 Authentication

- Email/password registration and login
- GitHub OAuth integration
- Google OAuth integration
- Admin role for system management
- Session-based JWT tokens

## 📱 Pages Overview

1. **Landing** (`/`): Public homepage with auth forms and demo cards
2. **Dashboard** (`/dashboard`): Main app interface with card generation
3. **APIs** (`/apis`): Manage API preferences and documentation
4. **Collection** (`/collection`): View and organize card collection
5. **Settings** (`/settings`): Account management and deck reset
6. **Shop** (`/shop`): Coin purchases and daily rewards
7. **Admin** (`/admin`): System statistics and management (admin only)
8. **Card Details** (`/card/[id]`): Detailed view of individual cards

## 🔧 Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Random secret for JWT signing

Optional:
- `GITHUB_ID` / `GITHUB_SECRET`: GitHub OAuth
- `GOOGLE_ID` / `GOOGLE_SECRET`: Google OAuth  
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`: Payment processing

## 📦 Deployment Notes

- Uses Heroku Postgres addon
- Automatic database migrations on deploy
- Seeded with default APIs and test users
- Environment variables configured via Heroku dashboard
- Single buildpack (Node.js) deployment

## 🧪 Test Accounts

After seeding:
- **Admin**: admin@apideas.com / admin123 (10,000 coins)
- **User**: test@example.com / test123 (500 coins)

## 🏗️ Architecture Highlights

- **Unified codebase**: Single Next.js app (no separate frontend/backend)
- **Type safety**: Strict TypeScript with Prisma type generation
- **Authentication singleton**: Centralized auth state management
- **Custom styling**: Pokemon-inspired card design with CSS variables
- **Responsive design**: Mobile-friendly interface
- **SEO optimized**: Static generation where appropriate

## 📄 License

This project follows Altcademy bootcamp specifications and is intended for educational purposes.

---

Built with ❤️ for the Altcademy Full-Stack Development Program