import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { formatNumber } from '@/lib/card-utils'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/auth/AuthGuard'

interface AdminStats {
  totalUsers: number
  totalCards: number
  totalTransactions: number
  totalRevenue: number
  activeUsers: number
  cardsToday: number
  revenueToday: number
  avgRating: number
}

interface User {
  id: string
  username: string
  email: string
  role: string
  coinBalance: number
  totalCards: number
  createdAt: string
  lastActive: string
}

interface Transaction {
  id: string
  userId: string
  type: string
  amount: number
  description: string
  createdAt: string
}

interface Activity {
  id: string
  type: 'user_registered' | 'card_generated' | 'purchase' | 'login'
  userId: string
  username: string
  description: string
  timestamp: string
}

export default function AdminPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'system'>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [generatingCards, setGeneratingCards] = useState(false)
  const [generationResult, setGenerationResult] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true)
      const [statsRes, usersRes, transactionsRes, activityRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/activity')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setRecentActivity(activityData)
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAllCards = async (): Promise<void> => {
    setGeneratingCards(true)
    setGenerationResult(null)
    
    try {
      const response = await fetch('/api/admin/generate-all-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setGenerationResult(`Success! ${data.newCardsAdded} new cards added. Total cards: ${data.totalCards}`)
        // Refresh the stats to show updated numbers
        fetchData()
      } else {
        setGenerationResult(`Error: ${data.message}`)
      }
    } catch (error) {
      setGenerationResult(`Error: Failed to generate cards - ${error}`)
    } finally {
      setGeneratingCards(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === 'all' || user.role === userFilter
    return matchesSearch && matchesFilter
  })

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user_registered':
        return (
          <svg className="activity__icon activity__icon--success" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        )
      case 'card_generated':
        return (
          <svg className="activity__icon activity__icon--primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z" />
          </svg>
        )
      case 'purchase':
        return (
          <svg className="activity__icon activity__icon--warning" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.447.894L10 15.118l-4.553 1.776A1 1 0 014 16V4z" />
          </svg>
        )
      case 'login':
        return (
          <svg className="activity__icon activity__icon--info" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <AuthGuard requireAuth requireAdmin>
        <Navbar />
        <div className="admin-page">
          <div className="admin-container">
            <div className="loading-state">
              <div className="loading-spinner" />
              <h2>Loading Admin Dashboard...</h2>
              <p>Gathering system data and analytics</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <Navbar />
      <div className="admin-page">
        <div className="admin-container">
          {/* Header */}
          <header className="admin-header">
            <div className="admin-header__content">
              <div className="admin-header__title">
                <h1>Admin Dashboard</h1>
                <div className="admin-badge">
                  <svg className="admin-badge__icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  Administrator
                </div>
              </div>
              <div className="admin-header__actions">
                <button className="btn btn--secondary btn--sm">
                  <svg className="btn__icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className="admin-nav">
            <button 
              className={`admin-nav__tab ${activeTab === 'overview' ? 'admin-nav__tab--active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <svg className="admin-nav__icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Overview
            </button>
            <button 
              className={`admin-nav__tab ${activeTab === 'users' ? 'admin-nav__tab--active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <svg className="admin-nav__icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Users
            </button>
            <button 
              className={`admin-nav__tab ${activeTab === 'transactions' ? 'admin-nav__tab--active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <svg className="admin-nav__icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Transactions
            </button>
            <button 
              className={`admin-nav__tab ${activeTab === 'system' ? 'admin-nav__tab--active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              <svg className="admin-nav__icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              System
            </button>
          </nav>

          {/* Tab Content */}
          <main className="admin-main">
            {activeTab === 'overview' && (
              <div className="admin-overview">
                {/* Stats Grid */}
                {stats && (
                  <section className="stats-grid">
                    <div className="stat-card stat-card--primary">
                      <div className="stat-card__icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <div className="stat-card__content">
                        <div className="stat-card__value">{formatNumber(stats.totalUsers)}</div>
                        <div className="stat-card__label">Total Users</div>
                        <div className="stat-card__change stat-card__change--up">
                          +{stats.activeUsers} active today
                        </div>
                      </div>
                    </div>

                    <div className="stat-card stat-card--success">
                      <div className="stat-card__icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z" />
                        </svg>
                      </div>
                      <div className="stat-card__content">
                        <div className="stat-card__value">{formatNumber(stats.totalCards)}</div>
                        <div className="stat-card__label">Cards Generated</div>
                        <div className="stat-card__change stat-card__change--up">
                          +{stats.cardsToday} today
                        </div>
                      </div>
                    </div>

                    <div className="stat-card stat-card--warning">
                      <div className="stat-card__icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </div>
                      <div className="stat-card__content">
                        <div className="stat-card__value">${(stats.totalRevenue || 0).toFixed(2)}</div>
                        <div className="stat-card__label">Total Revenue</div>
                        <div className="stat-card__change stat-card__change--up">
                          +${(stats.revenueToday || 0).toFixed(2)} today
                        </div>
                      </div>
                    </div>

                    <div className="stat-card stat-card--info">
                      <div className="stat-card__icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                        </svg>
                      </div>
                      <div className="stat-card__content">
                        <div className="stat-card__value">{(stats.avgRating || 0).toFixed(1)}</div>
                        <div className="stat-card__label">Avg Rating</div>
                        <div className="stat-card__change stat-card__change--neutral">
                          Quality Score
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Recent Activity */}
                <section className="recent-activity">
                  <div className="section-header">
                    <h2>Recent Activity</h2>
                    <p>Live system events and user actions</p>
                  </div>
                  <div className="activity-feed">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        {getActivityIcon(activity.type)}
                        <div className="activity-content">
                          <div className="activity-description">{activity.description}</div>
                          <div className="activity-meta">
                            <span className="activity-user">{activity.username}</span>
                            <span className="activity-time">{new Date(activity.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="admin-users">
                <div className="section-header">
                  <h2>User Management</h2>
                  <p>View and manage user accounts</p>
                </div>

                {/* Filters */}
                <div className="filters">
                  <div className="filter-group">
                    <input 
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="filter-group">
                    <select 
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value as 'all' | 'admin' | 'user')}
                      className="filter-select"
                    >
                      <option value="all">All Users</option>
                      <option value="admin">Admins</option>
                      <option value="user">Regular Users</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="data-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Cards</th>
                        <th>Balance</th>
                        <th>Joined</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="user-name">{user.username}</div>
                                <div className="user-email">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`role-badge role-badge--${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>{user.totalCards}</td>
                          <td>{user.coinBalance} coins</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn--sm btn--secondary">Edit</button>
                              <button className="btn btn--sm btn--danger">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="admin-transactions">
                <div className="section-header">
                  <h2>Transaction History</h2>
                  <p>Financial transactions and coin purchases</p>
                </div>

                <div className="data-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>User</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <code className="transaction-id">{transaction.id.slice(0, 8)}...</code>
                          </td>
                          <td>{transaction.userId}</td>
                          <td>
                            <span className={`transaction-type transaction-type--${transaction.type}`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className={transaction.amount > 0 ? 'amount--positive' : 'amount--negative'}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </td>
                          <td>{transaction.description}</td>
                          <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="admin-system">
                <div className="section-header">
                  <h2>System Management</h2>
                  <p>Server health and maintenance tools</p>
                </div>

                <div className="system-tools">
                  <div className="tool-card">
                    <h3>Admin Card Collection</h3>
                    <p>Generate all 190 cards for admin account for testing and demonstration</p>
                    <div className="tool-actions">
                      <button 
                        className="btn btn--primary"
                        onClick={handleGenerateAllCards}
                        disabled={generatingCards}
                      >
                        {generatingCards ? 'Generating...' : 'Generate All Cards'}
                      </button>
                    </div>
                    {generationResult && (
                      <div className={`generation-result ${generationResult.includes('Success') ? 'success' : 'error'}`}>
                        {generationResult}
                      </div>
                    )}
                  </div>

                  <div className="tool-card">
                    <h3>Database</h3>
                    <p>Manage database operations and backups</p>
                    <div className="tool-actions">
                      <button className="btn btn--primary">Create Backup</button>
                      <button className="btn btn--secondary">View Logs</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <h3>Cache Management</h3>
                    <p>Clear application cache and optimize performance</p>
                    <div className="tool-actions">
                      <button className="btn btn--warning">Clear Cache</button>
                      <button className="btn btn--secondary">View Stats</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <h3>API Health</h3>
                    <p>Monitor external API integrations and status</p>
                    <div className="tool-actions">
                      <button className="btn btn--success">Health Check</button>
                      <button className="btn btn--secondary">View Reports</button>
                    </div>
                  </div>

                  <div className="tool-card tool-card--danger">
                    <h3>Emergency Controls</h3>
                    <p>Critical system controls and maintenance mode</p>
                    <div className="tool-actions">
                      <button className="btn btn--danger">Maintenance Mode</button>
                      <button className="btn btn--danger">Emergency Stop</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
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