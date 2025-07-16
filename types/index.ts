// Shared types for the application

// Enums for better type safety
export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum CardComplexity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum CardFeasibility {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high'
}

export interface CardData {
  id: string;
  title: string;
  subtitle: string;
  industry: string;
  apis: string | string[]; // Handle both formats for backward compatibility
  rating: number; // 0-1 range
  rarity: string; // Keep as string for backward compatibility
  problem?: string;
  solution?: string;
  implementation?: string;
  marketOpportunity?: string;
  summary?: string;
  complexity?: string;
  feasibility?: string;
  createdAt?: string;
  pinned?: boolean;
}

export interface UserStats {
  totalCards: number;
  lastGenerated: string | null;
  favoriteCards?: number;
  totalCoinsSpent?: number;
  lastActivity?: string;
}

export interface DashboardState {
  recentCards: CardData[];
  loading: boolean;
  error: string;
  stats: UserStats;
  newCard: CardData | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | AppError;
  message?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  coinBalance: number;
  createdAt: string;
  updatedAt: string;
}

// API Preference types
export enum PreferenceType {
  LOCK = 'lock',
  IGNORE = 'ignore'
}

export interface ApiPreference {
  id: string;
  userId: string;
  apiId: string;
  preferenceType: PreferenceType;
  createdAt: string;
}

// API types
export interface ApiInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  documentationUrl: string;
  freeTierInfo?: string;
  popularityScore: number;
  active: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Hook return types
export interface UseDashboardReturn {
  recentCards: CardData[];
  loading: boolean;
  error: string;
  stats: UserStats;
  newCard: CardData | null;
  session: any; // NextAuth session type
  hasLowBalance: boolean;
  completionRate: number;
  hasNoCards: boolean;
  generateCard: () => Promise<void>;
  clearNewCard: () => void;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}